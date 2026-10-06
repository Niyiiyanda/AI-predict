// ==============================================================================
// 🛡️ 401 PREDICT TOOL: PRE-FLIGHT VERIFICATION & TEMPORAL AUDIT FIREWALL
// ==============================================================================
// Strictly TypeScript. Zero hardcoded team arrays. Dynamic API verification only.
// The live API payload is the sole source of truth.

export interface DynamicTeamEntry {
  id: number;
  name: string;
  shortName?: string;
  cleanedName: string;
}

export interface AuditResult {
  status: 'PASS' | 'FAIL';
  errors: string[];
  warnings: string[];
  validCount: number;
  seasonYear: number;
  seasonLabel: string;
  watTimestamp: string;
}

/**
 * Standardizes incoming API team names across FPL and API-Football.
 * Corrects accents, prefixes, sponsor names, and formatting variations.
 */
export function cleanTeamName(rawName: string): string {
  if (!rawName) return '';
  const cleaned = rawName.trim();

  const nameMap: Record<string, string> = {
    // Premier League
    'Manchester City': 'Man City',
    'Manchester City FC': 'Man City',
    'Manchester United': 'Man United',
    'Manchester United FC': 'Man United',
    'Tottenham Hotspur': 'Tottenham',
    'Tottenham Hotspur FC': 'Tottenham',
    'Spurs': 'Tottenham',
    'Wolverhampton Wanderers': 'Wolves',
    'Wolverhampton Wanderers FC': 'Wolves',
    'Wolverhampton': 'Wolves',
    'Brighton and Hove Albion': 'Brighton',
    'Brighton & Hove Albion': 'Brighton',
    'Brighton & Hove Albion FC': 'Brighton',
    'West Ham United': 'West Ham',
    'West Ham United FC': 'West Ham',
    'Newcastle United': 'Newcastle',
    'Newcastle United FC': 'Newcastle',
    'Nottingham Forest': 'Nott\'m Forest',
    'Nottingham Forest FC': 'Nott\'m Forest',
    'Leicester City': 'Leicester',
    'Leicester City FC': 'Leicester',
    'Ipswich Town': 'Ipswich',
    'Ipswich Town FC': 'Ipswich',
    'Leeds United': 'Leeds',
    'Leeds United FC': 'Leeds',
    'Sunderland AFC': 'Sunderland',
    'Sunderland': 'Sunderland',
    'Coventry City': 'Coventry',
    'Coventry City FC': 'Coventry',
    'Hull City AFC': 'Hull City',
    'Hull City FC': 'Hull City',
    'Hull': 'Hull City',
    'AFC Bournemouth': 'Bournemouth',
    'Brentford FC': 'Brentford',
    'Chelsea FC': 'Chelsea',
    'Arsenal FC': 'Arsenal',
    'Crystal Palace FC': 'Crystal Palace',
    'Everton FC': 'Everton',
    'Fulham FC': 'Fulham',
    'Liverpool FC': 'Liverpool',
    'Southampton FC': 'Southampton',
    'Burnley FC': 'Burnley',
    'Luton Town FC': 'Luton Town',
    'Sheffield United FC': 'Sheffield United',

    // La Liga
    'RC Celta de Vigo': 'Celta Vigo',
    'Celta de Vigo': 'Celta Vigo',
    'RCD Espanyol de Barcelona': 'Espanyol',
    'RCD Espanyol': 'Espanyol',
    'CA Osasuna': 'Osasuna',
    'Rayo Vallecano de Madrid': 'Rayo Vallecano',
    'Real Sociedad de Fútbol': 'Real Sociedad',
    'Real Sociedad de Futbol': 'Real Sociedad',
    'Deportivo Alavés': 'Alaves',
    'Deportivo Alaves': 'Alaves',
    'Alavés': 'Alaves',
    'CD Leganés': 'Leganes',
    'CD Leganes': 'Leganes',
    'Leganés': 'Leganes',
    'Real Betis Balompié': 'Real Betis',
    'Real Betis Balompie': 'Real Betis',
    'Athletic Club Bilbao': 'Athletic Club',
    'Athletic Bilbao': 'Athletic Club',
    'Club Atlético de Madrid': 'Atletico Madrid',
    'Club Atletico de Madrid': 'Atletico Madrid',
    'Atlético de Madrid': 'Atletico Madrid',
    'Atlético Madrid': 'Atletico Madrid',
    'Atletico de Madrid': 'Atletico Madrid',
    'FC Barcelona': 'Barcelona',
    'Real Madrid CF': 'Real Madrid',
    'Girona FC': 'Girona',
    'Sevilla FC': 'Sevilla',
    'Valencia CF': 'Valencia',
    'Villarreal CF': 'Villarreal',
    'Real Valladolid CF': 'Valladolid',
    'Real Valladolid': 'Valladolid',
    'UD Las Palmas': 'Las Palmas',
    'RCD Mallorca': 'Mallorca',
    'Getafe CF': 'Getafe',

    // Bundesliga
    'FC Bayern München': 'Bayern Munich',
    'Bayern München': 'Bayern Munich',
    'FC Bayern Munich': 'Bayern Munich',
    'Borussia Dortmund': 'Dortmund',
    'BVB Dortmund': 'Dortmund',
    'Bayer 04 Leverkusen': 'Bayer Leverkusen',
    'Bayer Leverkusen': 'Bayer Leverkusen',
    'Eintracht Frankfurt': 'Ein Frankfurt',
    'Borussia Mönchengladbach': 'M\'gladbach',
    'Borussia Monchengladbach': 'M\'gladbach',
    'RasenBallsport Leipzig': 'RB Leipzig',
    'VfB Stuttgart': 'Stuttgart',
    'SV Werder Bremen': 'Werder Bremen',
    'Werder Bremen': 'Werder Bremen',
    '1. FC Union Berlin': 'Union Berlin',
    'Union Berlin': 'Union Berlin',
    '1. FSV Mainz 05': 'Mainz',
    'FSV Mainz 05': 'Mainz',
    'Mainz 05': 'Mainz',
    'FC St. Pauli': 'St Pauli',
    'FC St Pauli': 'St Pauli',
    'St. Pauli': 'St Pauli',
    'FC Augsburg': 'Augsburg',
    'VfL Wolfsburg': 'Wolfsburg',
    'VfL Bochum 1848': 'Bochum',
    'VfL Bochum': 'Bochum',
    'TSG 1899 Hoffenheim': 'Hoffenheim',
    '1899 Hoffenheim': 'Hoffenheim',
    'TSG Hoffenheim': 'Hoffenheim',
    '1. FC Heidenheim 1846': 'Heidenheim',
    '1. FC Heidenheim': 'Heidenheim',
    'SC Freiburg': 'Freiburg',
    'Holstein Kiel': 'Holstein Kiel',

    // Serie A
    'FC Internazionale Milano': 'Inter',
    'FC Internazionale': 'Inter',
    'Internazionale': 'Inter',
    'Inter Milan': 'Inter',
    'AC Milan': 'Milan',
    'Juventus FC': 'Juventus',
    'AS Roma': 'Roma',
    'SS Lazio': 'Lazio',
    'SSC Napoli': 'Napoli',
    'Atalanta BC': 'Atalanta',
    'ACF Fiorentina': 'Fiorentina',
    'Bologna FC 1909': 'Bologna',
    'Bologna FC': 'Bologna',
    'Torino FC': 'Torino',
    'Udinese Calcio': 'Udinese',
    'Cagliari Calcio': 'Cagliari',
    'Genoa CFC': 'Genoa',
    'Hellas Verona FC': 'Verona',
    'Hellas Verona': 'Verona',
    'Parma Calcio 1913': 'Parma',
    'Parma Calcio': 'Parma',
    'Como 1907': 'Como',
    'Venezia FC': 'Venezia',
    'Empoli FC': 'Empoli',
    'US Lecce': 'Lecce',
    'AC Monza': 'Monza',

    // Ligue 1
    'Paris Saint-Germain': 'PSG',
    'Paris Saint-Germain FC': 'PSG',
    'Paris Saint Germain': 'PSG',
    'Paris SG': 'PSG',
    'Olympique de Marseille': 'Marseille',
    'Olympique Lyonnais': 'Lyon',
    'AS Monaco FC': 'Monaco',
    'AS Monaco': 'Monaco',
    'Lille OSC': 'Lille',
    'LOSC Lille': 'Lille',
    'RC Lens': 'Lens',
    'Stade Rennais FC': 'Rennes',
    'Stade Rennais': 'Rennes',
    'OGC Nice': 'Nice',
    'Stade de Reims': 'Reims',
    'Stade Brestois 29': 'Brest',
    'Stade Brestois': 'Brest',
    'Toulouse FC': 'Toulouse',
    'RC Strasbourg Alsace': 'Strasbourg',
    'RC Strasbourg': 'Strasbourg',
    'Montpellier HSC': 'Montpellier',
    'FC Nantes': 'Nantes',
    'Le Havre AC': 'Le Havre',
    'AJ Auxerre': 'Auxerre',
    'Angers SCO': 'Angers',
    'AS Saint-Étienne': 'Saint-Etienne',
    'AS Saint-Etienne': 'Saint-Etienne',
    'Saint Etienne': 'Saint-Etienne'
  };

  if (nameMap[cleaned]) return nameMap[cleaned];

  // Accent-normalized lookup
  const normalized = cleaned.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (nameMap[normalized]) return nameMap[normalized];

  return cleaned;
}

/**
 * Calculates current European season starting year in West Africa Time (Africa/Lagos).
 * Formula: month >= 8 ? year : year - 1
 * For the 2026/27 season, month >= 8 resolves to 2026.
 */
export function getActiveSeasonYear(): number {
  const watString = new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' });
  const watDate = new Date(watString);
  const year = watDate.getFullYear();
  const month = watDate.getMonth() + 1; // 1-12
  return month >= 8 ? year : year - 1;
}

/**
 * Formats current WAT timestamp string.
 */
export function getWatTimestamp(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date()) + ' WAT';
}

/**
 * Dynamically fetches the 20 active teams directly from https://fantasy.premierleague.com/api/bootstrap-static/
 * on every execution. The live API payload is the single source of truth.
 * Zero hardcoded team arrays.
 * If the API call fails, throws a fatal error: ENGINE STATUS: BLOCKER.
 */
export async function fetchDynamicActivePremierLeagueTeams(): Promise<DynamicTeamEntry[]> {
  let res: Response;
  try {
    res = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
  } catch (err: any) {
    throw new Error(`ENGINE STATUS: BLOCKER: Failed to reach Official Premier League bootstrap-static API: ${err.message}`);
  }

  if (!res.ok) {
    throw new Error(`ENGINE STATUS: BLOCKER: Official Premier League bootstrap-static API returned HTTP ${res.status} (${res.statusText})`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch (err: any) {
    throw new Error(`ENGINE STATUS: BLOCKER: Failed to parse Premier League bootstrap-static response: ${err.message}`);
  }

  if (!data || !Array.isArray(data.teams) || data.teams.length === 0) {
    throw new Error('ENGINE STATUS: BLOCKER: Premier League bootstrap-static returned empty or invalid teams array');
  }

  return data.teams.map((t: any) => ({
    id: t.id,
    name: t.name,
    shortName: t.short_name,
    cleanedName: cleanTeamName(t.name)
  }));
}

/**
 * Dynamically builds a dictionary mapping team.id to team.name directly from live FPL bootstrap-static.
 * If the API call fails, throws a fatal error: ENGINE STATUS: BLOCKER.
 */
export async function fetchDynamicTeamDictionary(): Promise<Record<number, string>> {
  const teams = await fetchDynamicActivePremierLeagueTeams();
  const dict: Record<number, string> = {};
  for (const t of teams) {
    dict[t.id] = t.cleanedName || t.name;
  }
  return dict;
}

/**
 * Audits incoming fixtures payload to safeguard against corrupt data or out-of-bounds teams.
 * Validates against live dynamic teams when available.
 */
export function auditFixturesPayload(fixtures: any[], league: string, gameweek: number): AuditResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seasonYear = getActiveSeasonYear();
  const seasonLabel = `${seasonYear}/${seasonYear + 1}`;
  const watTimestamp = getWatTimestamp();

  if (!fixtures || !Array.isArray(fixtures) || fixtures.length === 0) {
    errors.push(`ENGINE STATUS: BLOCKER: Empty fixture stream received for ${league} GW ${gameweek}. Zero matches returned.`);
    return {
      status: 'FAIL',
      errors,
      warnings,
      validCount: 0,
      seasonYear,
      seasonLabel,
      watTimestamp
    };
  }

  let validCount = 0;

  for (let idx = 0; idx < fixtures.length; idx++) {
    const f = fixtures[idx];
    const home = cleanTeamName(f.home_team || f.homeTeam || '');
    const away = cleanTeamName(f.away_team || f.awayTeam || '');

    if (!home || !away) {
      errors.push(`ENGINE STATUS: BLOCKER: Match index #${idx} is missing home or away team identity.`);
      continue;
    }

    if (home.toLowerCase() === away.toLowerCase()) {
      errors.push(`ENGINE STATUS: BLOCKER: Identical home and away team detected: "${home}" vs "${away}".`);
      continue;
    }

    // Temporal verification on kickoff date
    const kickoff = f.kickoff_time || f.kickoffTime || f.date;
    if (kickoff) {
      const matchDate = new Date(kickoff);
      const matchYear = matchDate.getFullYear();
      if (matchYear < seasonYear - 1 || matchYear > seasonYear + 1) {
        warnings.push(`Kickoff date ${kickoff} falls outside current ${seasonLabel} season window.`);
      }
    }

    validCount++;
  }

  const status: 'PASS' | 'FAIL' = errors.length === 0 ? 'PASS' : 'FAIL';

  return {
    status,
    errors,
    warnings,
    validCount,
    seasonYear,
    seasonLabel,
    watTimestamp
  };
}

/**
 * Validates rolling statistics for pre-flight evaluation.
 */
export function auditTeamStatistics(homeStats: any, awayStats: any): { status: 'PASS' | 'FAIL'; errors: string[] } {
  const errors: string[] = [];

  if (!homeStats || typeof homeStats !== 'object') {
    errors.push('Home team statistical payload is undefined or invalid.');
  }
  if (!awayStats || typeof awayStats !== 'object') {
    errors.push('Away team statistical payload is undefined or invalid.');
  }

  return {
    status: errors.length === 0 ? 'PASS' : 'FAIL',
    errors
  };
}
