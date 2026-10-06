import React, { useState } from 'react';
import { FixtureData, WeeklyCoefficients } from '../types';
import { getFormGrade } from '../lib/core_engine';
import { PitchContestZones } from './PitchContestZones';
import { getTeamStarPlayers } from '../data/team_players';
import { Shield, Target, Award, Activity, Zap, Crosshair, Swords, Flame } from 'lucide-react';

interface TacticalProfilesProps {
  fixture: FixtureData;
  cwHome: WeeklyCoefficients;
  cwAway: WeeklyCoefficients;
  dcnHome: number;
  dcnAway: number;
  apiStatus?: 'connected' | 'fallback';
}

export const TacticalProfiles: React.FC<TacticalProfilesProps> = ({
  fixture,
  cwHome,
  cwAway,
  dcnHome,
  dcnAway,
  apiStatus = 'connected'
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'offense' | 'defense' | 'duels' | 'gk'>('all');

  const homeGrade = getFormGrade(dcnHome);
  const awayGrade = getFormGrade(dcnAway);

  const adjustedHomeDcn = Number(dcnHome.toFixed(1));
  const formDiff = Math.abs(adjustedHomeDcn - dcnAway).toFixed(1);

  // Key Player Face-Off setup with real squad players
  const homeRoster = getTeamStarPlayers(fixture.homeTeam);
  const awayRoster = getTeamStarPlayers(fixture.awayTeam);

  const homeKeyPlayer = (fixture.homePlayers && fixture.homePlayers[0]?.name && !fixture.homePlayers[0].name.toLowerCase().includes('attacker') && !fixture.homePlayers[0].name.toLowerCase().includes('key'))
    ? fixture.homePlayers[0]
    : homeRoster[0];

  const awayKeyPlayer = (fixture.awayPlayers && fixture.awayPlayers[0]?.name && !fixture.awayPlayers[0].name.toLowerCase().includes('striker') && !fixture.awayPlayers[0].name.toLowerCase().includes('key') && !fixture.awayPlayers[0].name.toLowerCase().includes('attacker'))
    ? fixture.awayPlayers[0]
    : awayRoster[0];

  const renderMetricRow = (
    icon: string,
    label: string,
    val: number,
    oppVal: number,
    categoryKey: 'offense' | 'defense' | 'duels' | 'gk'
  ) => {
    if (activeCategory !== 'all' && activeCategory !== categoryKey) return null;

    const pct = Math.min(100, Math.max(10, (val / 10.0) * 100));
    const hasEdge = val > oppVal + 0.2;
    const diff = (val - oppVal).toFixed(1);

    let barColor = 'bg-slate-600';
    if (val >= 8.5) barColor = 'bg-emerald-400';
    else if (val >= 7.0) barColor = 'bg-cyan-400';
    else if (val >= 6.0) barColor = 'bg-amber-400';
    else barColor = 'bg-rose-400';

    return (
      <div className="space-y-1 my-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <span>{icon}</span>
            <span>{label}</span>
            {hasEdge && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">
                Edge +{diff}
              </span>
            )}
          </span>
          <span className="font-mono font-bold text-slate-100">
            {val.toFixed(1)} <span className="text-[10px] text-slate-500">/ 10.0</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full ${barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  // Resolve 5 Reconfigured Core Variables (1.0 to 10.0 Scale)
  const homeV1 = cwHome.V1_DefensiveSolidity ?? cwHome.V1_Defense;
  const awayV1 = cwAway.V1_DefensiveSolidity ?? cwAway.V1_Defense;

  const homeV2 = cwHome.V2_DuelSuccess ?? cwHome.V2_Duel;
  const awayV2 = cwAway.V2_DuelSuccess ?? cwAway.V2_Duel;

  const homeV3 = cwHome.V3_GoalkeeperPerformance ?? cwHome.V3_GK;
  const awayV3 = cwAway.V3_GoalkeeperPerformance ?? cwAway.V3_GK;

  const homeV4 = cwHome.V4_ChanceCreation ?? cwHome.V4_Threat;
  const awayV4 = cwAway.V4_ChanceCreation ?? cwAway.V4_Threat;

  const homeV5 = cwHome.V5_ShootingQuality ?? cwHome.V5_TeamRating;
  const awayV5 = cwAway.V5_ShootingQuality ?? cwAway.V5_TeamRating;

  return (
    <div id="sec-tactical" className="space-y-5 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>📊</span> 7-10 Match Rolling Tactical Form (XGBoost 5-Pillar Stream)
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Calibrated Opta variables normalized to [1.0 – 10.0] scale
          </span>
        </div>

        {/* Interactive Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Pillars' },
            { id: 'offense', label: '🎯 Offense & Shooting' },
            { id: 'defense', label: '🛡️ Defense & Blocks' },
            { id: 'duels', label: '⚔️ Duels' },
            { id: 'gk', label: '🧤 Shot Stopping' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tactical Advantage Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base shrink-0">
            ⚔️
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block">
              Tactical Advantage Analysis
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-100">
              {adjustedHomeDcn > dcnAway ? (
                <>
                  <strong className="text-emerald-400 font-black">{fixture.homeTeam}</strong> holds a{' '}
                  <span className="text-emerald-300 font-mono font-black">+{formDiff}</span> point tactical form advantage over {fixture.awayTeam}
                </>
              ) : dcnAway > adjustedHomeDcn ? (
                <>
                  <strong className="text-cyan-400 font-black">{fixture.awayTeam}</strong> holds a{' '}
                  <span className="text-cyan-300 font-mono font-black">+{formDiff}</span> point tactical form advantage over {fixture.homeTeam}
                </>
              ) : (
                <span className="text-amber-400 font-bold">Even tactical balance between both sides</span>
              )}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-950 border border-slate-700/80 text-emerald-300 shadow-inner">
            {adjustedHomeDcn > dcnAway
              ? `🎯 ${fixture.homeTeam} Edge`
              : dcnAway > adjustedHomeDcn
              ? `🎯 ${fixture.awayTeam} Edge`
              : '⚖️ Neutral Balance'}
          </span>
        </div>
      </div>

      {/* Grid of Home vs Away Tactical Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Home Team Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          {/* Top Badge Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <img
                src={fixture.homeBadge}
                alt={fixture.homeTeam}
                className="w-12 h-12 object-contain drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h3 className="text-lg font-black text-slate-100 tracking-wide">
                  {fixture.homeTeam}
                </h3>
                <span className="text-xs text-emerald-400 font-semibold uppercase">
                  Home Venue
                </span>
              </div>
            </div>

            {/* Scorecard Badge */}
            <div
              className="px-3.5 py-1.5 rounded-xl border text-center shadow-lg"
              style={{
                backgroundColor: homeGrade.bg,
                borderColor: `${homeGrade.color}50`
              }}
            >
              <div
                className="text-xl font-black tracking-tight"
                style={{ color: homeGrade.color }}
              >
                Grade {homeGrade.grade}
              </div>
              <div className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                {homeGrade.label}
              </div>
            </div>
          </div>

          {/* Primary Headline Seasonal Dynamic Form Score */}
          <div className="my-4 bg-slate-950/80 rounded-xl p-3 border border-emerald-500/30 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wide block">
                10-Match Rolling Form Index
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                XGBoost Composite Moving Average
              </span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black text-emerald-400 font-mono">
                {adjustedHomeDcn.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-bold font-mono">/ 10.0</span>
            </div>
          </div>

          {/* 5 Reconfigured Core Tactical Metrics (1.0 to 10.0 scale) */}
          <div className="space-y-1">
            {renderMetricRow('🛡️', 'V1 Defensive Solidity (xGA + Blocks/Int)', homeV1, awayV1, 'defense')}
            {renderMetricRow('⚔️', 'V2 Duel Success (Contested Win %)', homeV2, awayV2, 'duels')}
            {renderMetricRow('🧤', 'V3 Goalkeeper Performance (xGOT - GA)', homeV3, awayV3, 'gk')}
            {renderMetricRow('🎯', 'V4 Chance Creation (xA + Buildup + Passes)', homeV4, awayV4, 'offense')}
            {renderMetricRow('⚡', 'V5 Shooting Quality (xGOT - npxG)', homeV5, awayV5, 'offense')}
          </div>
        </div>

        {/* Away Team Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          {/* Top Badge Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <img
                src={fixture.awayBadge}
                alt={fixture.awayTeam}
                className="w-12 h-12 object-contain drop-shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h3 className="text-lg font-black text-slate-100 tracking-wide">
                  {fixture.awayTeam}
                </h3>
                <span className="text-xs text-cyan-400 font-semibold uppercase">
                  Away Venue
                </span>
              </div>
            </div>

            {/* Scorecard Badge */}
            <div
              className="px-3.5 py-1.5 rounded-xl border text-center shadow-lg"
              style={{
                backgroundColor: awayGrade.bg,
                borderColor: `${awayGrade.color}50`
              }}
            >
              <div
                className="text-xl font-black tracking-tight"
                style={{ color: awayGrade.color }}
              >
                Grade {awayGrade.grade}
              </div>
              <div className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                {awayGrade.label}
              </div>
            </div>
          </div>

          {/* Primary Headline Seasonal Dynamic Form Score */}
          <div className="my-4 bg-slate-950/80 rounded-xl p-3 border border-cyan-500/30 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wide block">
                10-Match Rolling Form Index
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                XGBoost Composite Moving Average
              </span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black text-cyan-400 font-mono">
                {dcnAway.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-bold font-mono">/ 10.0</span>
            </div>
          </div>

          {/* 5 Reconfigured Core Tactical Metrics (1.0 to 10.0 scale) */}
          <div className="space-y-1">
            {renderMetricRow('🛡️', 'V1 Defensive Solidity (xGA + Blocks/Int)', awayV1, homeV1, 'defense')}
            {renderMetricRow('⚔️', 'V2 Duel Success (Contested Win %)', awayV2, homeV2, 'duels')}
            {renderMetricRow('🧤', 'V3 Goalkeeper Performance (xGOT - GA)', awayV3, homeV3, 'gk')}
            {renderMetricRow('🎯', 'V4 Chance Creation (xA + Buildup + Passes)', awayV4, homeV4, 'offense')}
            {renderMetricRow('⚡', 'V5 Shooting Quality (xGOT - npxG)', awayV5, homeV5, 'offense')}
          </div>
        </div>
      </div>
    </div>
  );
};
