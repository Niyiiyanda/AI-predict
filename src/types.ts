export interface TeamStats {
  Team: string;
  tackles_won_pct: number;
  interception_share_pct: number;
  total_team_duels?: number;
  ground_duels_won_pct?: number;
  aerial_duels_won_pct?: number;
  save_pct: number;
  keeper_match_rating: number;
  total_shots: number;
  shots_on_target: number;
  big_chances: number;
  average_team_performance_rating: number;
  xG: number;
  Avg_Goals_Scored?: number;
  Avg_Goals_Conceded: number;
  creativity_avg?: number;
  yellow_cards_avg?: number;
  red_cards_avg?: number;
  xGA?: number;
  interceptions_blocks_per_game?: number;
  duels_won?: number;
  duels_contested?: number;
  xGOT_conceded?: number;
  goals_conceded?: number;
  xA?: number;
  xG_buildup?: number;
  progressive_passes?: number;
  xGOT?: number;
  npxG?: number;
}

export interface PlayerStat {
  id: string;
  name: string;
  team: string;
  position: string;
  xG: number;
  xA: number;
  is_penalty_taker: boolean;
  shots_per_game: number;
  sot_per_game: number;
}

export interface TeamCoefficientsMaster {
  Team: string;
  Gameweek: number;
  Raw_V1: number;
  V1_Defense: number;
  Raw_V2: number;
  V2_Duels: number;
  V3_GK: number;
  Raw_V4: number;
  V4_Threat: number;
  V5_TeamRating: number;
  Weekly_CG: number;
  Dynamic_DCN: number;
}

export interface WeeklyCoefficients {
  Raw_V1?: number;
  V1_Defense: number;
  Raw_V2?: number;
  V2_Duel: number;
  V2_Duels?: number;
  V3_GK: number;
  Raw_V4?: number;
  V4_Threat: number;
  V5_TeamRating: number;
  V1_DefensiveSolidity: number;
  V2_DuelSuccess: number;
  V3_GoalkeeperPerformance: number;
  V4_ChanceCreation: number;
  V5_ShootingQuality: number;
  RollingFormRating?: number;
  Weekly_CG?: number;
  C_W?: number;
}

export interface ReconfiguredCoreVariables {
  V1_DefensiveSolidity: number; // xGA combined with Interceptions + Blocks
  V2_DuelSuccess: number; // Duels Won / Duels Contested (%)
  V3_GoalkeeperPerformance: number; // xGOT - Goals Conceded
  V4_ChanceCreation: number; // xA + xG Buildup + Progressive Passes
  V5_ShootingQuality: number; // xGOT - npxG
  RollingFormRating: number; // 1.0 to 10.0 scale
}

export interface OutcomeMarket {
  id: string;
  category: string;
  marketName: string;
  probability: number; // percentage (0-100)
  fairOdds: number;
  tier: 'realistic' | 'probable' | 'risky';
  description?: string;
  dataContext?: string;
  riskFactor?: string;
  riskLevel?: 'low' | 'moderate' | 'high';
}

export interface AccumulatorItem {
  id: string;
  fixtureId: string;
  matchName: string;
  marketName: string;
  selection: string;
  odds: number;
  probability: number;
  dataContext?: string;
  riskFactor?: string;
  riskLevel?: 'low' | 'moderate' | 'high';
  status: 'won' | 'lost' | 'pending';
}

export interface WeeklyBetSlip {
  id: string;
  title: string;
  gameweek: number;
  date: string;
  items: AccumulatorItem[];
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  status: 'won' | 'lost' | 'pending';
}

export interface PlayerPropOutcome {
  player: string;
  team: string;
  goalscorerProb: number;
  assistProb: number;
  sotOver15Prob: number;
}

export interface CorrectScoreCell {
  homeGoals: number;
  awayGoals: number;
  probability: number; // percentage
}

export interface MatchProbabilities {
  outcomes: OutcomeMarket[];
  correctScores: CorrectScoreCell[][]; // 6x6 matrix
  playerProps: PlayerPropOutcome[];
  rawProbs: Record<string, number>;
}

export interface H2HMatchRecord {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
}

export interface StatsPackData {
  totalMatches: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  avgGoalsPerMatch: number;
  bttsPercentage: number;
  over25Percentage: number;
  recentMatches: H2HMatchRecord[];
  keyInsights: string[];
}

export interface FixtureData {
  id: string;
  league: string;
  gameweek: number;
  homeTeam: string;
  awayTeam: string;
  homeBadge: string;
  awayBadge: string;
  kickoffWAT: string; // West Africa Time (Africa/Lagos) formatted
  homeStats: TeamStats;
  awayStats: TeamStats;
  homePlayers: PlayerStat[];
  awayPlayers: PlayerStat[];
  isPostponed?: boolean;
  statsPack?: StatsPackData;
}

export interface GameweekHistoryRecord {
  gameweek: number;
  team: string;
  league: string;
  cw: number | null; // null if postponed
}

export interface AIAnalystResponse {
  summary: string;
  tacticalKey: string;
  recommendedPick: string;
  valueEdgeAnalysis: string;
  keyRiskFactor: string;
}
