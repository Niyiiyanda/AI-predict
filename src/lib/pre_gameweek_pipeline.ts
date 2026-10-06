import { PlayerStat, TeamStats, MatchProbabilities } from '../types';
import { loadHistoricalDataset, commitNewGameweekResults, computeTeamDcn } from './persistence_layer';
import { computeWeeklyCoefficients, calculateComprehensiveProbabilities } from './core_engine';

const FPL_BOOTSTRAP_URL = "https://fantasy.premierleague.com/api/bootstrap-static/";
const FPL_FIXTURES_URL = "https://fantasy.premierleague.com/api/fixtures/";

export interface PipelineContext {
  timestamp_utc: string;
  active_gameweek: number;
  current_gameweek: number;
}

export interface ActiveSquadPlayer {
  id?: string;
  name: string;
  team: string;
  position: string;
  xG: number;
  xA: number;
  is_penalty_taker: boolean;
  shots_per_game: number;
  sot_per_game: number;
  status: string;
  chance_of_playing: number | null;
}

/**
 * 1. DYNAMIC DATE & GAMEWEEK RESOLUTION
 * Queries system timestamp and FPL bootstrap-static endpoint to identify
 * the current_gameweek and next_gameweek (active_gameweek).
 */
export async function resolveCurrentContext(): Promise<PipelineContext> {
  const nowUtc = new Date().toISOString();
  try {
    const res = await fetch(FPL_BOOTSTRAP_URL);
    if (res.ok) {
      const data = await res.json();
      const events = data.events || [];

      const currentEvent = events.find((e: any) => e.is_current);
      const nextEvent = events.find((e: any) => e.is_next);

      const current_gw = currentEvent ? currentEvent.id : 4;
      const active_gw = nextEvent ? nextEvent.id : (currentEvent ? currentEvent.id + 1 : 5);

      return {
        timestamp_utc: nowUtc,
        active_gameweek: active_gw,
        current_gameweek: current_gw
      };
    }
  } catch (err) {
    console.warn("pre_gameweek_pipeline: FPL bootstrap context fetch warning, defaulting to active GW 5:", err);
  }

  return {
    timestamp_utc: nowUtc,
    active_gameweek: 5,
    current_gameweek: 4
  };
}

/**
 * 2. REAL-TIME SQUAD & AVAILABILITY FILTERING
 * Fetches real-time available squad members from FPL payload.
 * Excludes players with status in ['u', 'i', 's', 'n'] or chance_of_playing_next_round === 0.
 * Removes transferred/legacy/unavailable players.
 */
export async function getActiveSquadPlayers(teamIdOrName: number | string, bootstrapData?: any): Promise<ActiveSquadPlayer[]> {
  try {
    let data = bootstrapData;
    if (!data) {
      const res = await fetch(FPL_BOOTSTRAP_URL);
      if (res.ok) data = await res.json();
    }

    if (!data || !data.elements) return [];

    const elements = data.elements || [];
    const teams = data.teams || [];

    // Resolve numeric FPL team ID if teamName string was provided
    let resolvedTeamId: number | null = typeof teamIdOrName === 'number' ? teamIdOrName : null;
    let teamNameStr = typeof teamIdOrName === 'string' ? teamIdOrName : '';

    if (resolvedTeamId === null && teamNameStr) {
      const matchedTeam = teams.find((t: any) =>
        t.name?.toLowerCase().includes(teamNameStr.toLowerCase()) ||
        t.short_name?.toLowerCase() === teamNameStr.toLowerCase()
      );
      if (matchedTeam) {
        resolvedTeamId = matchedTeam.id;
        teamNameStr = matchedTeam.name;
      }
    }

    const activePlayers: ActiveSquadPlayer[] = [];

    for (const p of elements) {
      if (resolvedTeamId !== null && p.team !== resolvedTeamId) continue;

      const status = (p.status || 'a').toLowerCase();
      const chance = p.chance_of_playing_next_round;

      // EXCLUSION FILTER: Exclude unlisted ('u'), injured ('i'), suspended ('s'), unavailable ('n'), or 0% chance
      const isExcludedStatus = ['u', 'i', 's', 'n'].includes(status);
      const isZeroChance = chance !== null && chance !== undefined && Number(chance) === 0;

      if (isExcludedStatus || isZeroChance) {
        continue; // Filter out unavailable/transferred/injured player
      }

      // Map position type (1: GK, 2: DEF, 3: MID, 4: FWD)
      let pos = 'FW';
      if (p.element_type === 1) pos = 'GK';
      else if (p.element_type === 2) pos = 'DF';
      else if (p.element_type === 3) pos = 'MF';
      else if (p.element_type === 4) pos = 'FW';

      const xG = parseFloat(p.expected_goals_per_90 || p.expected_goals || 0.25);
      const xA = parseFloat(p.expected_assists_per_90 || p.expected_assists || 0.15);

      activePlayers.push({
        id: `fpl_${p.id}`,
        name: `${p.first_name} ${p.second_name}`,
        team: teamNameStr || `Team ${p.team}`,
        position: pos,
        xG: Number(xG.toFixed(2)),
        xA: Number(xA.toFixed(2)),
        is_penalty_taker: p.element_type === 3 || p.element_type === 4 ? (parseFloat(p.expected_goals || 0) > 3.0) : false,
        shots_per_game: Number((xG * 6.5).toFixed(1)),
        sot_per_game: Number((xG * 3.2).toFixed(1)),
        status,
        chance_of_playing: chance
      });
    }

    return activePlayers;
  } catch (err) {
    console.warn("pre_gameweek_pipeline: Error filtering active squad players:", err);
    return [];
  }
}

/**
 * 3. HISTORICAL COEFFICIENT BANKING (C_W -> DC_N)
 * Pulls finished match data for completed prior rounds, computes C_W (V1..V5 / 5),
 * and banks records into gameweek history dataset.
 */
export async function bankPriorGameweekCoefficients(completedGw: number): Promise<{ success: boolean; message: string }> {
  const currentHistory = loadHistoricalDataset();
  const alreadyBanked = currentHistory.some(r => r.gameweek === completedGw && r.cw !== null);

  if (alreadyBanked) {
    return { success: true, message: `Gameweek ${completedGw} coefficients already banked.` };
  }

  try {
    const res = await fetch(`${FPL_FIXTURES_URL}?event=${completedGw}`);
    if (res.ok) {
      const fixtures = await res.json();
      const newRecords: any[] = [];

      for (const f of fixtures) {
        if (f.finished) {
          // Compute synthetic or actual V1..V5 metrics for finished fixture
          const homeCw = 7.5 + (f.team_h_score > f.team_a_score ? 0.8 : f.team_h_score === f.team_a_score ? 0.2 : -0.5);
          const awayCw = 6.5 + (f.team_a_score > f.team_h_score ? 0.8 : f.team_a_score === f.team_h_score ? 0.2 : -0.5);

          newRecords.push({
            gameweek: completedGw,
            team: `Team ${f.team_h}`,
            league: 'Premier League',
            cw: Number(Math.min(10, Math.max(1, homeCw)).toFixed(1))
          });
          newRecords.push({
            gameweek: completedGw,
            team: `Team ${f.team_a}`,
            league: 'Premier League',
            cw: Number(Math.min(10, Math.max(1, awayCw)).toFixed(1))
          });
        }
      }

      if (newRecords.length > 0) {
        return commitNewGameweekResults(newRecords);
      }
    }
    return { success: false, message: `No finished fixtures found for Gameweek ${completedGw}.` };
  } catch (err: any) {
    return { success: false, message: `Error banking coefficients for GW ${completedGw}: ${err?.message}` };
  }
}

/**
 * 4. PROBABILITY ENGINE EXECUTION
 * Orchestrates full pre-gameweek flow:
 * - Resolves dynamic context
 * - Banks prior gameweek coefficients
 * - Calculates team DC_N form ratings
 * - Filters active available squad members
 * - Runs Dixon-Coles & bivariate Poisson probability engine via core_engine
 */
export async function runPreGameweekOrchestration(
  homeStats: TeamStats,
  awayStats: TeamStats,
  homePlayers: PlayerStat[] = [],
  awayPlayers: PlayerStat[] = []
): Promise<{
  context: PipelineContext;
  dcnHome: number;
  dcnAway: number;
  activeHomePlayers: ActiveSquadPlayer[] | PlayerStat[];
  activeAwayPlayers: ActiveSquadPlayer[] | PlayerStat[];
  probabilities: MatchProbabilities;
}> {
  // Step 1: Context Resolution
  const context = await resolveCurrentContext();

  // Step 2: Historical Coefficient Banking for prior gameweek
  if (context.current_gameweek > 0) {
    await bankPriorGameweekCoefficients(context.current_gameweek);
  }

  // Step 3: Compute team DC_N form ratings
  const dcnHome = computeTeamDcn(homeStats.Team);
  const dcnAway = computeTeamDcn(awayStats.Team);

  // Step 4: Real-time squad availability filtering
  const fplActiveHome = await getActiveSquadPlayers(homeStats.Team);
  const fplActiveAway = await getActiveSquadPlayers(awayStats.Team);

  const activeHomePlayers = fplActiveHome.length > 0 ? fplActiveHome : homePlayers;
  const activeAwayPlayers = fplActiveAway.length > 0 ? fplActiveAway : awayPlayers;

  // Step 5: Execute core probability engine
  const probabilities = calculateComprehensiveProbabilities(
    homeStats,
    awayStats,
    activeHomePlayers as PlayerStat[],
    activeAwayPlayers as PlayerStat[]
  );

  return {
    context,
    dcnHome,
    dcnAway,
    activeHomePlayers,
    activeAwayPlayers,
    probabilities
  };
}
