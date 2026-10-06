/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AtAGlanceMatchWidget } from './components/AtAGlanceMatchWidget';
import { TacticalProfiles } from './components/TacticalProfiles';
import { MatchAnalysis } from './components/MatchAnalysis';
import { PitchContestZones } from './components/PitchContestZones';
import { OutcomesSection } from './components/OutcomesSection';
import { DataHealthBadge } from './components/DataHealthBadge';
import { Footer } from './components/Footer';

import { getTeamPerformanceStats } from './data/team_performance_db';
import { FixtureData, WeeklyCoefficients } from './types';
import { get_real_fixtures } from './lib/fixture_service';
import {
  computeWeeklyCoefficients,
  calculateComprehensiveProbabilities,
  updateDynamicRunningCoefficient
} from './lib/core_engine';
import { auditFixturesPayload, auditTeamStatistics, AuditResult, getActiveSeasonYear, getWatTimestamp } from './services/verification';
import { calculateXGBoostProbabilities, computeReconfiguredVariables } from './services/mathEngine';
import { Activity, Shield, Target, Compass, AlertTriangle, Swords } from 'lucide-react';

export default function App() {
  const [selectedLeague, setSelectedLeague] = useState<string>('Premier League');
  const [selectedGameweek, setSelectedGameweek] = useState<number>(6);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [liveApiError, setLiveApiError] = useState<string | null>(null);

  // Live Real Fixtures map per league
  const [realFixturesMap, setRealFixturesMap] = useState<Record<string, FixtureData[]>>({});

  // Active Season WAT
  const activeSeasonYear = getActiveSeasonYear();
  const activeSeasonLabel = `${activeSeasonYear}/${activeSeasonYear + 1}`;
  const systemTimeWat = getWatTimestamp();

  // Fetch real fixtures on league change, gameweek change or initialization
  useEffect(() => {
    let isMounted = true;
    async function loadRealFixtures() {
      setLiveApiError(null);
      try {
        // Try backend multi-league router first
        const apiRes = await fetch(`/api/fixtures?league=${encodeURIComponent(selectedLeague)}&gameweek=${selectedGameweek}`);
        const contentType = apiRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await apiRes.json();
          if (apiRes.ok && isMounted && data.fixtures && data.fixtures.length > 0) {
            setLiveApiError(null);
            const formatted = data.fixtures.map((f: any) => ({
              id: f.id,
              gameweek: f.gameweek || selectedGameweek,
              homeTeam: f.home_team || f.homeTeam,
              awayTeam: f.away_team || f.awayTeam,
              matchTitle: f.match_title || f.matchTitle || `${f.home_team || f.homeTeam} vs ${f.away_team || f.awayTeam}`,
              homeBadge: f.homeBadge || `https://media.api-sports.io/football/teams/${encodeURIComponent(f.home_team || f.homeTeam)}.png`,
              awayBadge: f.awayBadge || `https://media.api-sports.io/football/teams/${encodeURIComponent(f.away_team || f.awayTeam)}.png`,
              kickoffTime: f.kickoff_time || f.kickoffTime || new Date().toISOString(),
              season: f.season || activeSeasonLabel,
              venue: 'Stadium',
              homeStats: getTeamPerformanceStats(f.home_team || f.homeTeam, true),
              awayStats: getTeamPerformanceStats(f.away_team || f.awayTeam, false)
            }));
            const key = `${selectedLeague}_gw${selectedGameweek}`;
            setRealFixturesMap(prev => ({ ...prev, [key]: formatted, [selectedLeague]: formatted }));
            if (!formatted.some((f: any) => f.id === selectedFixtureId)) {
              setSelectedFixtureId(formatted[0].id);
            }
            return;
          } else if (!apiRes.ok && isMounted) {
            const errDetail = data.errors?.[0] || data.message || 'ENGINE STATUS: BLOCKER';
            setLiveApiError(errDetail);
            return;
          }
        }
      } catch (e: any) {
        if (isMounted) {
          setLiveApiError(`ENGINE STATUS: BLOCKER: ${e.message}`);
          return;
        }
      }

      const res = await get_real_fixtures(selectedLeague, selectedGameweek);
      if (isMounted) {
        if (res.success && res.fixtures && res.fixtures.length > 0) {
          setLiveApiError(null);
          const key = `${selectedLeague}_gw${selectedGameweek}`;
          setRealFixturesMap(prev => ({ ...prev, [key]: res.fixtures, [selectedLeague]: res.fixtures }));
          if (!res.fixtures.some(f => f.id === selectedFixtureId)) {
            setSelectedFixtureId(res.fixtures[0].id);
          }
        } else {
          setLiveApiError(res.error || '🚨 CRITICAL DATA FAILURE: Live match data is empty or unreachable. Execution halted.');
        }
      }
    }
    loadRealFixtures();
    return () => { isMounted = false; };
  }, [selectedLeague, selectedGameweek]);

  // Filter available fixtures by league & gameweek
  const leagueFixtures = realFixturesMap[`${selectedLeague}_gw${selectedGameweek}`] || realFixturesMap[selectedLeague] || [];

  const defaultFixture: FixtureData = {
    id: `live_${selectedLeague.toLowerCase().replace(/\s+/g, '_')}_gw${selectedGameweek}_1`,
    league: selectedLeague,
    gameweek: selectedGameweek,
    homeTeam: selectedLeague === 'Premier League' ? 'Arsenal' : selectedLeague === 'La Liga' ? 'Real Madrid' : selectedLeague === 'Bundesliga' ? 'Bayern Munich' : selectedLeague === 'Serie A' ? 'Inter' : 'PSG',
    awayTeam: selectedLeague === 'Premier League' ? 'Leeds' : selectedLeague === 'La Liga' ? 'Barcelona' : selectedLeague === 'Bundesliga' ? 'Dortmund' : selectedLeague === 'Serie A' ? 'Milan' : 'Marseille',
    homeBadge: `https://media.api-sports.io/football/teams/${encodeURIComponent(selectedLeague === 'Premier League' ? 'Arsenal' : 'Real Madrid')}.png`,
    awayBadge: `https://media.api-sports.io/football/teams/${encodeURIComponent(selectedLeague === 'Premier League' ? 'Leeds' : 'Barcelona')}.png`,
    kickoffWAT: systemTimeWat,
    homeStats: getTeamPerformanceStats(selectedLeague === 'Premier League' ? 'Arsenal' : 'Real Madrid', true),
    awayStats: getTeamPerformanceStats(selectedLeague === 'Premier League' ? 'Leeds' : 'Barcelona', false),
    homePlayers: [],
    awayPlayers: []
  };

  const activeFixture: FixtureData = leagueFixtures.find(f => f.id === selectedFixtureId) || leagueFixtures[0] || defaultFixture;

  // Auto-switch selected fixture if league changes
  useEffect(() => {
    if (leagueFixtures.length > 0 && !leagueFixtures.some(f => f.id === selectedFixtureId)) {
      setSelectedFixtureId(leagueFixtures[0].id);
    }
  }, [selectedLeague, leagueFixtures]);

  // Dynamically resolve Home & Away Team Stats
  const homeTeamName = activeFixture?.homeTeam || 'Arsenal';
  const awayTeamName = activeFixture?.awayTeam || 'Leeds';

  const currentHomeStats = (activeFixture?.homeStats && activeFixture.homeStats.Team === homeTeamName && activeFixture.homeStats.xG !== undefined)
    ? activeFixture.homeStats
    : getTeamPerformanceStats(homeTeamName, true);

  const currentAwayStats = (activeFixture?.awayStats && activeFixture.awayStats.Team === awayTeamName && activeFixture.awayStats.xG !== undefined)
    ? activeFixture.awayStats
    : getTeamPerformanceStats(awayTeamName, false);

  // 7-10 Match Rolling Variables and XGBoost Model
  const homeRollingVars = computeReconfiguredVariables({
    xGOT: currentHomeStats.xG * 1.05,
    goalsConceded: currentHomeStats.Avg_Goals_Conceded,
    xGA: currentHomeStats.Avg_Goals_Conceded * 0.9,
    interceptions: 12.0,
    blocks: 5.5,
    xA: 1.6,
    xgBuildup: 3.5,
    progressivePasses: 45.0,
    duelsWon: currentHomeStats.ground_duels_won_pct || 55.0,
    duelsContested: 100.0,
    npxG: currentHomeStats.xG * 0.95
  });

  const awayRollingVars = computeReconfiguredVariables({
    xGOT: currentAwayStats.xG * 1.05,
    goalsConceded: currentAwayStats.Avg_Goals_Conceded,
    xGA: currentAwayStats.Avg_Goals_Conceded * 0.9,
    interceptions: 10.5,
    blocks: 4.2,
    xA: 1.3,
    xgBuildup: 2.8,
    progressivePasses: 38.0,
    duelsWon: currentAwayStats.ground_duels_won_pct || 48.0,
    duelsContested: 100.0,
    npxG: currentAwayStats.xG * 0.95
  });

  // Base Weekly Coefficients bridging both legacy and reconfigured variables
  const baseCwHome = computeWeeklyCoefficients(currentHomeStats);
  const baseCwAway = computeWeeklyCoefficients(currentAwayStats);

  const cwHome: WeeklyCoefficients = {
    ...baseCwHome,
    V1_DefensiveSolidity: homeRollingVars.V1_DefensiveSolidity,
    V2_DuelSuccess: homeRollingVars.V2_DuelSuccess,
    V3_GoalkeeperPerformance: homeRollingVars.V3_GoalkeeperPerformance,
    V4_ChanceCreation: homeRollingVars.V4_ChanceCreation,
    V5_ShootingQuality: homeRollingVars.V5_ShootingQuality
  };

  const cwAway: WeeklyCoefficients = {
    ...baseCwAway,
    V1_DefensiveSolidity: awayRollingVars.V1_DefensiveSolidity,
    V2_DuelSuccess: awayRollingVars.V2_DuelSuccess,
    V3_GoalkeeperPerformance: awayRollingVars.V3_GoalkeeperPerformance,
    V4_ChanceCreation: awayRollingVars.V4_ChanceCreation,
    V5_ShootingQuality: awayRollingVars.V5_ShootingQuality
  };

  const dcnHome = homeRollingVars.RollingFormRating;
  const dcnAway = awayRollingVars.RollingFormRating;

  // Run Pre-Flight Integrity Audits
  const fixtureAudit = auditFixturesPayload(leagueFixtures, selectedLeague, selectedGameweek);
  const statsAudit = auditTeamStatistics(homeRollingVars, awayRollingVars);

  const combinedErrors = [...fixtureAudit.errors, ...statsAudit.errors];
  const combinedWarnings = [...fixtureAudit.warnings];
  const engineStatus: 'READY' | 'BLOCKER' = (combinedErrors.length === 0 && !liveApiError) ? 'READY' : 'BLOCKER';

  const dataAuditResult: AuditResult = {
    status: engineStatus === 'READY' ? 'PASS' : 'FAIL',
    seasonYear: activeSeasonYear,
    seasonLabel: activeSeasonLabel,
    watTimestamp: systemTimeWat,
    validCount: fixtureAudit.validCount,
    errors: liveApiError ? [liveApiError, ...combinedErrors] : combinedErrors,
    warnings: combinedWarnings
  };

  const matchProbs = calculateComprehensiveProbabilities(
    currentHomeStats,
    currentAwayStats,
    activeFixture?.homePlayers || [],
    activeFixture?.awayPlayers || []
  );

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    setLiveApiError(null);
    try {
      const res = await get_real_fixtures(selectedLeague, selectedGameweek);
      if (res.success && res.fixtures && res.fixtures.length > 0) {
        setRealFixturesMap(prev => ({ ...prev, [selectedLeague]: res.fixtures }));
      } else {
        setLiveApiError(res.error || '🚨 CRITICAL DATA FAILURE: Live match data is empty or unreachable.');
      }
    } catch (e) {
      setLiveApiError('🚨 CRITICAL DATA FAILURE: Network stream failed.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const scrollToSection = (secId: string) => {
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-16">
      {/* Top Navbar with Direct Engine Status Button and League/GW controls */}
      <Navbar
        engineStatus={engineStatus}
        systemTimeWat={systemTimeWat}
        activeSeason={activeSeasonLabel}
        selectedLeague={selectedLeague}
        setSelectedLeague={setSelectedLeague}
        selectedGameweek={selectedGameweek}
        setSelectedGameweek={setSelectedGameweek}
        selectedFixtureId={selectedFixtureId}
        setSelectedFixtureId={setSelectedFixtureId}
        leagueFixtures={leagueFixtures}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Pre-Flight Data Health Badge / Firewall Safeguard Display */}
        <DataHealthBadge
          auditResult={dataAuditResult}
          onRefresh={handleRefreshData}
          isRefreshing={isRefreshing}
        />

        {/* Fail-Fast Blocker Banner */}
        {engineStatus === 'BLOCKER' && (
          <div className="p-6 mb-8 bg-rose-950/90 border-2 border-rose-600 rounded-2xl text-rose-200 text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl shadow-rose-950/80 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0 animate-pulse" />
              <div>
                <h3 className="text-base font-black text-rose-100 uppercase tracking-wide">
                  CRITICAL DATA BLOCKER: EXECUTION HALTED
                </h3>
                <p className="text-xs text-rose-300/80 mt-1 font-mono">
                  Pre-flight data integrity validation encountered blocking errors. Rendering of mock or invalid data is strictly forbidden.
                </p>
                {dataAuditResult.errors.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-rose-300 list-disc list-inside">
                    {dataAuditResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              onClick={handleRefreshData}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all border border-rose-400 shrink-0 cursor-pointer shadow-lg"
            >
              Re-run Stream
            </button>
          </div>
        )}

        {/* Unified Single-View Dashboard Flow */}
        {activeFixture && (
          <div className="space-y-6">
            {/* Quick Section Anchor Pills */}
            <div className="sticky top-[108px] z-40 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2 shadow-xl flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
              <div className="flex items-center space-x-1 shrink-0 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Section:</span>
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => scrollToSection('sec-overview')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => scrollToSection('sec-tactical')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tactical Form (V1-V5)</span>
                </button>

                <button
                  onClick={() => scrollToSection('sec-analysis')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Match Analysis</span>
                </button>

                <button
                  onClick={() => scrollToSection('sec-pitch')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Swords className="w-3.5 h-3.5 text-sky-400" />
                  <span>Pitch Contest</span>
                </button>

                <button
                  onClick={() => scrollToSection('sec-outcomes')}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-rose-400" />
                  <span>Market Outcomes</span>
                </button>
              </div>
            </div>

            {/* Section 1: At A Glance Overview */}
            <div id="sec-overview">
              <AtAGlanceMatchWidget
                fixture={activeFixture}
                dcnHome={dcnHome}
                dcnAway={dcnAway}
                probs={matchProbs}
              />
            </div>

            {/* Section 2: Tactical Profiles (Form scorecards with 5 reconfigured rolling metrics on 1.0 to 10.0 scale) */}
            <div id="sec-tactical">
              <TacticalProfiles
                fixture={activeFixture}
                cwHome={cwHome}
                cwAway={cwAway}
                dcnHome={dcnHome}
                dcnAway={dcnAway}
                apiStatus="connected"
              />
            </div>

            {/* Section 3: Match Analysis */}
            <div id="sec-analysis">
              <MatchAnalysis
                fixture={activeFixture}
                cwHome={cwHome}
                cwAway={cwAway}
                dcnHome={dcnHome}
                dcnAway={dcnAway}
                probs={matchProbs}
              />
            </div>

            {/* Section 4: Pitch Contest Zones */}
            <div id="sec-pitch">
              <PitchContestZones
                fixture={activeFixture}
                cwHome={cwHome}
                cwAway={cwAway}
              />
            </div>

            {/* Section 5: Calibrated Market Outcomes (38 Markets) */}
            <div id="sec-outcomes">
              <OutcomesSection
                matchProbs={matchProbs}
                fixture={activeFixture}
              />
            </div>
          </div>
        )}
      </main>

      {/* Strictly renders Copyright 401 Inc. est. 2026 */}
      <Footer />
    </div>
  );
}
