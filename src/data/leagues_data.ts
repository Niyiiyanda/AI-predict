import { FixtureData, GameweekHistoryRecord } from '../types';
export { get_real_fixtures, getRealFixtures } from '../lib/fixture_service';

export const TOP_LEAGUES = [
  { id: 'epl', name: 'Premier League', flag: '🇬🇧', country: 'England', flagUrl: 'https://flagcdn.com/w40/gb.png' },
  { id: 'laliga', name: 'La Liga', flag: '🇪🇸', country: 'Spain', flagUrl: 'https://flagcdn.com/w40/es.png' },
  { id: 'seriea', name: 'Serie A', flag: '🇮🇹', country: 'Italy', flagUrl: 'https://flagcdn.com/w40/it.png' },
  { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪', country: 'Germany', flagUrl: 'https://flagcdn.com/w40/de.png' },
  { id: 'ligue1', name: 'Ligue 1', flag: '🇫🇷', country: 'France', flagUrl: 'https://flagcdn.com/w40/fr.png' },
];

export const MOCK_FIXTURES: FixtureData[] = [];

export const INITIAL_GAMEWEEK_HISTORY: GameweekHistoryRecord[] = [
  // Arsenal
  { gameweek: 1, team: 'Arsenal', league: 'Premier League', cw: 7.8 },
  { gameweek: 2, team: 'Arsenal', league: 'Premier League', cw: 8.2 },
  { gameweek: 3, team: 'Arsenal', league: 'Premier League', cw: null }, // postponed
  { gameweek: 4, team: 'Arsenal', league: 'Premier League', cw: 7.9 },

  // Brighton
  { gameweek: 1, team: 'Brighton', league: 'Premier League', cw: 6.4 },
  { gameweek: 2, team: 'Brighton', league: 'Premier League', cw: 5.8 },
  { gameweek: 3, team: 'Brighton', league: 'Premier League', cw: 6.2 },
  { gameweek: 4, team: 'Brighton', league: 'Premier League', cw: 6.5 },

  // Man City
  { gameweek: 1, team: 'Man City', league: 'Premier League', cw: 8.4 },
  { gameweek: 2, team: 'Man City', league: 'Premier League', cw: 8.6 },
  { gameweek: 3, team: 'Man City', league: 'Premier League', cw: 8.1 },
  { gameweek: 4, team: 'Man City', league: 'Premier League', cw: 8.5 },

  // Liverpool
  { gameweek: 1, team: 'Liverpool', league: 'Premier League', cw: 8.0 },
  { gameweek: 2, team: 'Liverpool', league: 'Premier League', cw: 8.3 },
  { gameweek: 3, team: 'Liverpool', league: 'Premier League', cw: 7.9 },
  { gameweek: 4, team: 'Liverpool', league: 'Premier League', cw: 8.4 },

  // Real Madrid
  { gameweek: 1, team: 'Real Madrid', league: 'La Liga', cw: 8.5 },
  { gameweek: 2, team: 'Real Madrid', league: 'La Liga', cw: 8.7 },
  { gameweek: 3, team: 'Real Madrid', league: 'La Liga', cw: 8.2 },
  { gameweek: 4, team: 'Real Madrid', league: 'La Liga', cw: 8.9 },

  // Barcelona
  { gameweek: 1, team: 'Barcelona', league: 'La Liga', cw: 8.1 },
  { gameweek: 2, team: 'Barcelona', league: 'La Liga', cw: 8.4 },
  { gameweek: 3, team: 'Barcelona', league: 'La Liga', cw: 8.2 },
  { gameweek: 4, team: 'Barcelona', league: 'La Liga', cw: 8.3 }
];
