// ==============================================================================
// 💰 401 PREDICT TOOL: THE ODDS API & EXPECTED VALUE (+EV) ENGINE
// ==============================================================================
// Integrates live bookmaker prices and computes +EV value bets.

import { cleanTeamName } from './verification';

export interface BookmakerMatchOdds {
  matchKey: string;
  homeTeam: string;
  awayTeam: string;
  bookmaker: string;
  homeWinOdds: number;
  drawOdds: number;
  awayWinOdds: number;
  lastUpdate: string;
}

export interface ExpectedValueResult {
  market: string;
  selection: string;
  modelProbability: number;
  bookmakerOdds: number;
  expectedValue: number; // e.g. +0.08 (+8%)
  isPositiveEv: boolean;
  recommendation: 'STRONG VALUE' | 'MODERATE VALUE' | 'NO VALUE' | 'NEGATIVE EV';
}

const SPORT_KEY_MAP: Record<string, string> = {
  'Premier League': 'soccer_epl',
  'La Liga': 'soccer_spain_la_liga',
  'Bundesliga': 'soccer_germany_bundesliga',
  'Serie A': 'soccer_italy_serie_a',
  'Ligue 1': 'soccer_france_ligue_one'
};

/**
 * Calculates Expected Value (+EV) for a given market outcome:
 * EV = (Model Probability [0.0 to 1.0] * Decimal Odds) - 1.0
 */
export function calculateExpectedValue(
  selection: string,
  modelProbabilityPercent: number,
  decimalOdds: number
): ExpectedValueResult {
  const p = Math.max(0, Math.min(modelProbabilityPercent / 100.0, 1.0));
  const ev = (p * decimalOdds) - 1.0;
  const evRounded = Math.round(ev * 1000) / 1000;

  let recommendation: 'STRONG VALUE' | 'MODERATE VALUE' | 'NO VALUE' | 'NEGATIVE EV' = 'NEGATIVE EV';
  if (evRounded >= 0.08) recommendation = 'STRONG VALUE';
  else if (evRounded >= 0.02) recommendation = 'MODERATE VALUE';
  else if (evRounded >= -0.02) recommendation = 'NO VALUE';

  return {
    market: '1X2 Match Winner',
    selection,
    modelProbability: Math.round(modelProbabilityPercent * 10) / 10,
    bookmakerOdds: decimalOdds,
    expectedValue: evRounded,
    isPositiveEv: evRounded > 0,
    recommendation
  };
}

/**
 * Fetches live bookmaker odds from The Odds API.
 */
export async function fetchLiveBookmakerOdds(league: string): Promise<Record<string, BookmakerMatchOdds>> {
  const apiKey = process.env.ODDS_API_KEY;
  const sportKey = SPORT_KEY_MAP[league] || 'soccer_epl';

  if (!apiKey) {
    return {};
  }

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=eu,uk&markets=h2h&oddsFormat=decimal`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`The Odds API returned HTTP ${res.status}`);
      return {};
    }

    const data = await res.json();
    if (!Array.isArray(data)) return {};

    const oddsMap: Record<string, BookmakerMatchOdds> = {};

    for (const match of data) {
      const home = cleanTeamName(match.home_team || '');
      const away = cleanTeamName(match.away_team || '');
      const bookie = match.bookmakers?.[0];

      if (!bookie) continue;

      const h2hMarket = bookie.markets?.find((m: any) => m.key === 'h2h');
      if (!h2hMarket || !Array.isArray(h2hMarket.outcomes)) continue;

      let homeOdds = 1.90;
      let drawOdds = 3.40;
      let awayOdds = 3.60;

      for (const outcome of h2hMarket.outcomes) {
        const cleanedOutcomeName = cleanTeamName(outcome.name);
        if (cleanedOutcomeName === home) homeOdds = outcome.price;
        else if (cleanedOutcomeName === away) awayOdds = outcome.price;
        else if (outcome.name.toLowerCase() === 'draw') drawOdds = outcome.price;
      }

      const matchKey = `${home} vs ${away}`;
      oddsMap[matchKey] = {
        matchKey,
        homeTeam: home,
        awayTeam: away,
        bookmaker: bookie.title || 'Bet365 / Pinnacle',
        homeWinOdds: homeOdds,
        drawOdds: drawOdds,
        awayWinOdds: awayOdds,
        lastUpdate: bookie.last_update || new Date().toISOString()
      };
    }

    return oddsMap;
  } catch (err: any) {
    console.warn('The Odds API fetch warning:', err.message);
    return {};
  }
}
