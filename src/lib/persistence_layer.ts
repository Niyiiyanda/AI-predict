import { GameweekHistoryRecord } from '../types';
import { INITIAL_GAMEWEEK_HISTORY } from '../data/leagues_data';

// Local memory & persistent storage buffer for Gameweek History Records
let historyMemoryStore: GameweekHistoryRecord[] = [...INITIAL_GAMEWEEK_HISTORY];

/**
 * Loads the current historical dataset of gameweek C_W records.
 */
export function loadHistoricalDataset(): GameweekHistoryRecord[] {
  return historyMemoryStore;
}

/**
 * Commits new gameweek results / C_W records to the historical dataset.
 * Automatically avoids duplicating existing (gameweek, team) pairs unless forcing update.
 */
export function commitNewGameweekResults(newRecords: GameweekHistoryRecord[]): { success: boolean; message: string; totalRecords: number } {
  let addedCount = 0;
  newRecords.forEach(rec => {
    const existingIndex = historyMemoryStore.findIndex(
      r => r.gameweek === rec.gameweek && r.team.toLowerCase() === rec.team.toLowerCase()
    );

    if (existingIndex >= 0) {
      historyMemoryStore[existingIndex] = rec;
    } else {
      historyMemoryStore.push(rec);
      addedCount++;
    }
  });

  return {
    success: true,
    message: `Successfully banked ${addedCount} new C_W records into historical dataset.`,
    totalRecords: historyMemoryStore.length
  };
}

/**
 * Gets historical C_W list for a given team, preserving nulls for postponed/blank matches.
 */
export function getTeamCwHistory(teamName: string): (number | null)[] {
  return historyMemoryStore
    .filter(r => r.team.toLowerCase() === teamName.toLowerCase())
    .map(r => r.cw);
}

/**
 * Computes Dynamic Running Coefficient (DC_N) ensuring blank/postponed matches (nulls)
 * do NOT increment the divisor N.
 */
export function computeTeamDcn(teamName: string): number {
  const cwList = getTeamCwHistory(teamName);
  const validCw = cwList.filter((val): val is number => val !== null && !isNaN(val));

  if (validCw.length === 0) return 5.50;
  const sum = validCw.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / validCw.length) * 10) / 10;
}
