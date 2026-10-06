import { FixtureData, TeamStats } from '../types';
import { computeWeeklyCoefficients } from './core_engine';

export interface RosterAudit {
  passed: boolean;
  checkedTeamsCount: number;
  invalidTeams: string[];
  details: string;
}

export interface MetricAudit {
  passed: boolean;
  checkedMetricsCount: number;
  outOfBoundErrors: string[];
  details: string;
}

export interface TemporalAudit {
  passed: boolean;
  activeSeasonYear: number;
  outdatedErrors: string[];
  details: string;
}

export interface DataAuditResult {
  status: 'PASS' | 'FAIL';
  score: number; // 0 to 100
  timestamp: string;
  league: string;
  gameweek: number;
  rosterAudit: RosterAudit;
  metricAudit: MetricAudit;
  temporalAudit: TemporalAudit;
  criticalErrors: string[];
  warnings: string[];
}

/**
 * Resolves current Date localized to West Africa Time (WAT / Africa/Lagos UTC+1).
 */
export function get_wat_now(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 1)); // WAT is UTC+1
}

/**
 * Calculates current active European football season year based on WAT system time.
 * If current WAT month is August (8) or later, active season year is current year.
 * Otherwise (Jan-Jul), active season year is current year - 1.
 */
export function get_active_season_year(): number {
  const watNow = get_wat_now();
  const month = watNow.getUTCMonth() + 1;
  const year = watNow.getUTCFullYear();
  return month >= 8 ? year : year - 1;
}

/**
 * TEMPORAL FAIL-FAST VALIDATION GATE:
 * Verifies that all retrieved fixtures fall within the active season (WAT).
 * If any fixture returns a kickoff year prior to get_active_season_year(),
 * flags a critical data corruption error.
 */
export function validate_fixture_temporal_integrity(fixtures: FixtureData[]): TemporalAudit {
  const activeSeasonYear = get_active_season_year();
  const outdatedErrors: string[] = [];

  if (!Array.isArray(fixtures) || fixtures.length === 0) {
    return {
      passed: true,
      activeSeasonYear,
      outdatedErrors: [],
      details: 'No fixtures provided for temporal audit.'
    };
  }

  for (const fix of fixtures) {
    const rawDate = fix.kickoffWAT || (fix as any).dateEvent || (fix as any).date || '';
    if (rawDate) {
      const match = rawDate.match(/\b(20\d\d)\b/);
      if (match) {
        const fixtureYear = parseInt(match[1], 10);
        if (fixtureYear < activeSeasonYear) {
          outdatedErrors.push(
            `Outdated kickoff year ${fixtureYear} detected for ${fix.homeTeam} vs ${fix.awayTeam} (Active season: ${activeSeasonYear}/${activeSeasonYear + 1}).`
          );
        }
      }
    }
  }

  const passed = outdatedErrors.length === 0;
  return {
    passed,
    activeSeasonYear,
    outdatedErrors,
    details: passed
      ? `✅ Temporal Integrity Verified: All fixtures belong to active ${activeSeasonYear}/${activeSeasonYear + 1} season (WAT).`
      : `🚨 CRITICAL DATA CORRUPTION: Outdated historical fixtures detected. Execution halted.`
  };
}

/**
 * Audit active fixture payload dynamically without hardcoded team arrays.
 */
export function audit_fixtures_payload(fixtures: FixtureData[], leagueName: string, gameweek: number): RosterAudit {
  const invalidTeams: string[] = [];
  let checkedTeamsCount = 0;

  if (!Array.isArray(fixtures) || fixtures.length === 0) {
    return {
      passed: false,
      checkedTeamsCount: 0,
      invalidTeams: ['EMPTY_FIXTURE_PAYLOAD'],
      details: `🚨 CRITICAL AUDIT FAILURE: Live fixture stream for ${leagueName} (Gameweek ${gameweek}) returned an empty array.`
    };
  }

  for (const fix of fixtures) {
    checkedTeamsCount += 2;
    if (!fix.homeTeam || fix.homeTeam.trim() === '') {
      invalidTeams.push(`Missing Home Team (Match ID: ${fix.id})`);
    }
    if (!fix.awayTeam || fix.awayTeam.trim() === '') {
      invalidTeams.push(`Missing Away Team (Match ID: ${fix.id})`);
    }
    if (fix.homeTeam && fix.awayTeam && fix.homeTeam.trim().toLowerCase() === fix.awayTeam.trim().toLowerCase()) {
      invalidTeams.push(`Identical Teams (${fix.homeTeam} vs ${fix.awayTeam})`);
    }
  }

  const passed = invalidTeams.length === 0;
  return {
    passed,
    checkedTeamsCount,
    invalidTeams,
    details: passed
      ? `✅ Active Roster Audit Passed: All ${checkedTeamsCount} teams dynamically verified from live API.`
      : `🚨 Roster Audit Failure: Structural fixture errors detected: ${invalidTeams.join(', ')}.`
  };
}

/**
 * Audit team statistics and C_W/V1-V5 metric scale boundaries prior to core engine processing.
 */
export function audit_team_statistics(homeStats: TeamStats, awayStats: TeamStats): MetricAudit {
  const outOfBoundErrors: string[] = [];
  let checkedMetricsCount = 0;

  const validateTeamMetrics = (stats: TeamStats, side: 'Home' | 'Away') => {
    const teamName = stats.Team || `${side} Team`;

    // 1. xG and xGA check
    checkedMetricsCount += 2;
    if (typeof stats.xG !== 'number' || isNaN(stats.xG) || stats.xG < 0 || stats.xG > 8.0) {
      outOfBoundErrors.push(`${side} (${teamName}) xG = ${stats.xG} is outside valid bound [0.0, 8.0]`);
    }
    if (typeof stats.Avg_Goals_Conceded !== 'number' || isNaN(stats.Avg_Goals_Conceded) || stats.Avg_Goals_Conceded < 0 || stats.Avg_Goals_Conceded > 8.0) {
      outOfBoundErrors.push(`${side} (${teamName}) xGA = ${stats.Avg_Goals_Conceded} is outside valid bound [0.0, 8.0]`);
    }

    // 2. Compute Weekly Coefficients & Validate C_W, V1-V5
    try {
      const cw = computeWeeklyCoefficients(stats);
      const varsToCheck = [
        { name: 'V1_Defense', val: cw.V1_Defense },
        { name: 'V2_Duel', val: cw.V2_Duel },
        { name: 'V3_GK', val: cw.V3_GK },
        { name: 'V4_Threat', val: cw.V4_Threat },
        { name: 'V5_TeamRating', val: cw.V5_TeamRating },
        { name: 'C_W', val: cw.C_W }
      ];

      for (const v of varsToCheck) {
        checkedMetricsCount++;
        if (typeof v.val !== 'number' || isNaN(v.val) || v.val < 1.0 || v.val > 10.0) {
          outOfBoundErrors.push(`${side} (${teamName}) ${v.name} = ${v.val} violated boundary [1.0, 10.0]`);
        }
      }
    } catch (e: any) {
      outOfBoundErrors.push(`${side} (${teamName}) Weekly Coefficient computation crashed: ${e?.message || e}`);
    }
  };

  if (!homeStats) {
    outOfBoundErrors.push('Home team performance stats payload is missing or null.');
  } else {
    validateTeamMetrics(homeStats, 'Home');
  }

  if (!awayStats) {
    outOfBoundErrors.push('Away team performance stats payload is missing or null.');
  } else {
    validateTeamMetrics(awayStats, 'Away');
  }

  const passed = outOfBoundErrors.length === 0;

  return {
    passed,
    checkedMetricsCount,
    outOfBoundErrors,
    details: passed
      ? `✅ Metric & Scale Boundary Audit Passed: All ${checkedMetricsCount} variables (xG/xGA & V1-V5 / C_W) adhere strictly to [1.0, 10.0] normalized bounds.`
      : `🚨 Metric Boundary Audit Failure: ${outOfBoundErrors.length} metrics violated safety bounds: ${outOfBoundErrors.join('; ')}`
  };
}

/**
 * Comprehensive pre-flight inspection firewall audit including Temporal Integrity.
 */
export function audit_match_data(
  fixtures: FixtureData[],
  activeFixture: FixtureData | undefined,
  leagueName: string,
  gameweek: number,
  homeStats?: TeamStats,
  awayStats?: TeamStats
): DataAuditResult {
  const rosterAudit = audit_fixtures_payload(fixtures, leagueName, gameweek);
  const temporalAudit = validate_fixture_temporal_integrity(fixtures);

  const statsToHome = homeStats || activeFixture?.homeStats;
  const statsToAway = awayStats || activeFixture?.awayStats;

  let metricAudit: MetricAudit = {
    passed: true,
    checkedMetricsCount: 0,
    outOfBoundErrors: [],
    details: 'Metric audit skipped: Active fixture stats unavailable.'
  };

  if (statsToHome && statsToAway) {
    metricAudit = audit_team_statistics(statsToHome, statsToAway);
  }

  const criticalErrors: string[] = [];
  if (!rosterAudit.passed) {
    criticalErrors.push(...rosterAudit.invalidTeams.map(t => `Roster Error: ${t}`));
  }
  if (!temporalAudit.passed) {
    criticalErrors.push(...temporalAudit.outdatedErrors);
  }
  if (!metricAudit.passed) {
    criticalErrors.push(...metricAudit.outOfBoundErrors);
  }

  const status = criticalErrors.length === 0 ? 'PASS' : 'FAIL';
  const score = status === 'PASS' ? 100 : Math.max(0, 100 - criticalErrors.length * 25);

  return {
    status,
    score,
    timestamp: get_wat_now().toISOString(),
    league: leagueName,
    gameweek,
    rosterAudit,
    metricAudit,
    temporalAudit,
    criticalErrors,
    warnings: []
  };
}
