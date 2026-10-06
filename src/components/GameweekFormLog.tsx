import React, { useState } from 'react';
import { GameweekHistoryRecord, FixtureData } from '../types';
import { getFormGrade, updateDynamicRunningCoefficient } from '../lib/core_engine';
import { getTeamStarPlayers } from '../data/team_players';
import {
  BarChart3, Plus, ShieldCheck, AlertCircle, Save, User, Flame,
  Sparkles, Activity, Target, Zap, Shield, Swords, TrendingUp,
  CheckCircle2, ChevronDown, ChevronUp, Award
} from 'lucide-react';

interface GameweekFormLogProps {
  historyRecords: GameweekHistoryRecord[];
  onAddRecord: (record: GameweekHistoryRecord) => void;
  fixture?: FixtureData;
}

export const GameweekFormLog: React.FC<GameweekFormLogProps> = ({
  historyRecords,
  onAddRecord,
  fixture
}) => {
  const homeTeam = fixture?.homeTeam || 'Arsenal';
  const awayTeam = fixture?.awayTeam || 'Brighton';

  const [selectedTeam, setSelectedTeam] = useState<string>(homeTeam);
  const [newGw, setNewGw] = useState<number>(5);
  const [newCw, setNewCw] = useState<string>('8.10');
  const [isPostponed, setIsPostponed] = useState<boolean>(false);
  const [showTableLog, setShowTableLog] = useState<boolean>(false);

  // Filter team records
  const teamRecords = historyRecords.filter(r => r.team === selectedTeam);
  const cwList = teamRecords.map(r => r.cw);
  const currentDcn = updateDynamicRunningCoefficient(cwList);
  const gradeInfo = getFormGrade(currentDcn);

  // Teams list
  const teams = Array.from(new Set(historyRecords.map(r => r.team)));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord({
      gameweek: Number(newGw),
      team: selectedTeam,
      league: 'Premier League',
      cw: isPostponed ? null : parseFloat(newCw)
    });
  };

  // Mock comparison metrics for H2H visual digest (all numbers formatted to 2 decimal places)
  const homeStarP = getTeamStarPlayers(homeTeam)[0];
  const awayStarP = getTeamStarPlayers(awayTeam)[0];

  const homeGoalscorer = (fixture?.homePlayers?.[0]?.name && !fixture.homePlayers[0].name.includes('Key') && !fixture.homePlayers[0].name.includes('Attacker')) 
    ? fixture.homePlayers[0].name 
    : homeStarP?.name || 'Bukayo Saka';

  const awayGoalscorer = (fixture?.awayPlayers?.[0]?.name && !fixture.awayPlayers[0].name.includes('Key') && !fixture.awayPlayers[0].name.includes('Striker')) 
    ? fixture.awayPlayers[0].name 
    : awayStarP?.name || 'Cole Palmer';

  const possibilities = [
    { name: `${homeTeam} Win or Draw (1X)`, prob: 78.40, category: 'Match Outcome', badge: 'High Probability' },
    { name: 'Over 1.5 Total Goals', prob: 82.50, category: 'Goals Market', badge: 'Very Strong' },
    { name: 'Both Teams to Score (BTTS Yes)', prob: 62.10, category: 'Goal Exchange', badge: 'Value Edge' },
    { name: `${homeTeam} First Half Goal`, prob: 68.30, category: 'Early Action', badge: 'Trend Favors' },
    { name: 'Total Corners Over 8.5', prob: 74.20, category: 'Set Pieces', badge: 'High Volume' },
    { name: 'Total Booking Cards Over 3.5', prob: 59.80, category: 'Discipline', badge: 'Moderate' },
  ];

  const defensiveStats = [
    { metric: 'Goals Conceded per Match', homeVal: 0.80, awayVal: 1.40, better: 'home' },
    { metric: 'Clean Sheet Probability', homeVal: 42.10, awayVal: 18.50, unit: '%', better: 'home' },
    { metric: 'Tackles & Interceptions / 90', homeVal: 28.40, awayVal: 24.10, better: 'home' },
    { metric: 'Expected Goals Conceded (xGA)', homeVal: 0.95, awayVal: 1.55, better: 'home' },
    { metric: 'Goalkeeper Save Percentage', homeVal: 78.50, awayVal: 68.20, unit: '%', better: 'home' },
  ];

  const playerPropsList = [
    {
      player: homeGoalscorer,
      team: homeTeam,
      position: 'RW',
      sofaRating: 7.85,
      xG90: 0.52,
      xA90: 0.38,
      shotAcc: '68.00%',
      propName: 'Anytime Goal or Assist',
      prob: 78.40,
      justification: `Averages 3.40 shots and 2.80 key passes per 90 mins with a 7.85 average performance rating.`
    },
    {
      player: fixture?.homePlayers[1]?.name || 'Kai Havertz',
      team: homeTeam,
      position: 'ST',
      sofaRating: 7.42,
      xG90: 0.61,
      xA90: 0.18,
      shotAcc: '62.00%',
      propName: 'Over 1.5 Shots on Target',
      prob: 64.20,
      justification: `Wins 58.00% aerial duels in penalty area and averages 2.10 shots on target per match.`
    },
    {
      player: awayGoalscorer,
      team: awayTeam,
      position: 'ST',
      sofaRating: 7.15,
      xG90: 0.48,
      xA90: 0.12,
      shotAcc: '55.00%',
      propName: 'Over 0.5 Shots on Target',
      prob: 72.10,
      justification: `Generates 2.80 penalty box touches per 90 mins in high-transition counter attack scenarios.`
    },
    {
      player: fixture?.awayPlayers[1]?.name || 'Kaoru Mitoma',
      team: awayTeam,
      position: 'LW',
      sofaRating: 7.30,
      xG90: 0.35,
      xA90: 0.31,
      shotAcc: '58.00%',
      propName: 'Over 1.5 Successful Dribbles',
      prob: 81.50,
      justification: `Completes 3.20 progressive dribbles per match, exploiting 1v1 wide space.`
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Summary of Visible Possibilities Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                HEAD-TO-HEAD DIGEST
              </span>
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
                <span>Stats & Team Performance Scorecards</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct head-to-head comparison, scoring form highlights, defensive actions & visible match possibilities
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            <span className="text-xs text-slate-400 font-semibold">Focus Team:</span>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              {teams.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ⚽ Better Scoring Form & Top Goalscorers Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Scoring Form Advantage Card */}
          <div className="bg-slate-950/90 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-wider">
                  Scoring Form Advantage
                </h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                +0.80 xG / Game Advantage
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong className="text-emerald-400 font-extrabold">{homeTeam}</strong> currently hold superior scoring momentum, averaging <strong className="text-emerald-300 font-mono">2.20 xG per match</strong> over their last 5 fixtures compared to <strong className="text-cyan-300 font-bold">{awayTeam}'s 1.40 xG per match</strong>.
              </p>

              {/* Form Metric Bars */}
              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 font-bold mb-1">
                    <span>{homeTeam} Scoring Rate (2.20 goals/match)</span>
                    <span className="text-emerald-400 font-mono">78.50% Efficiency</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: '78.50%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 font-bold mb-1">
                    <span>{awayTeam} Scoring Rate (1.40 goals/match)</span>
                    <span className="text-cyan-400 font-mono">54.20% Efficiency</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5">
                    <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: '54.20%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Goalscorers Comparison Spotlight */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
              <User className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-wider">
                Top Goalscorers Head-to-Head
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Home Top Scorer */}
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3 space-y-2 text-center">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                  {homeTeam} Top Scorer
                </span>
                <div className="text-sm font-black text-slate-100">{homeGoalscorer}</div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded">
                  <div className="flex justify-between">
                    <span>xG / 90:</span>
                    <span className="font-bold text-emerald-400">0.52</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shots / 90:</span>
                    <span className="font-bold text-slate-100">3.40</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shot Acc:</span>
                    <span className="font-bold text-emerald-400">68.00%</span>
                  </div>
                </div>
              </div>

              {/* Away Top Scorer */}
              <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3 space-y-2 text-center">
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">
                  {awayTeam} Top Scorer
                </span>
                <div className="text-sm font-black text-slate-100">{awayGoalscorer}</div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded">
                  <div className="flex justify-between">
                    <span>xG / 90:</span>
                    <span className="font-bold text-cyan-400">0.48</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shots / 90:</span>
                    <span className="font-bold text-slate-100">2.80</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shot Acc:</span>
                    <span className="font-bold text-cyan-400">55.00%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 Summary of Visible Match Possibilities */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                Summary of Visible Possibilities
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Highest Likelihood Outcomes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {possibilities.map((pos, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 space-y-2 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {pos.category}
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                    {pos.badge}
                  </span>
                </div>

                <div className="text-xs font-black text-slate-100">
                  {pos.name}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-slate-400">Probability:</span>
                    <span className="text-emerald-400">{pos.prob.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full"
                      style={{ width: `${pos.prob.toFixed(2)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🛡️ Defensive Actions & Goalkeeper H2H Breakdown */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
              Defensive Actions & Structure Comparison
            </h3>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-3 text-xs font-black uppercase text-slate-400 border-b border-slate-800 pb-2">
              <span className="text-emerald-400 text-left">{homeTeam}</span>
              <span className="text-center text-slate-300">Defensive Metric</span>
              <span className="text-cyan-400 text-right">{awayTeam}</span>
            </div>

            <div className="space-y-2.5">
              {defensiveStats.map((stat, idx) => (
                <div key={idx} className="grid grid-cols-3 items-center text-xs font-mono">
                  <span className="text-emerald-400 font-extrabold text-left">
                    {stat.homeVal.toFixed(2)}{stat.unit || ''}
                  </span>
                  <span className="text-slate-300 font-sans text-[11px] text-center font-medium">
                    {stat.metric}
                  </span>
                  <span className="text-cyan-400 font-extrabold text-right">
                    {stat.awayVal.toFixed(2)}{stat.unit || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ⚡ Individual Player Props */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                Individual Player Props
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Cross-referenced with Key Match Metrics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {playerPropsList.map((p, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-slate-100">{p.player}</span>
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      {p.team} • {p.position}
                    </span>
                  </div>
                  <span className="bg-amber-950 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-extrabold px-2 py-0.5 rounded">
                    Rating {p.sofaRating.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-900/60 p-2 rounded-lg font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">xG / 90</span>
                    <span className="font-bold text-slate-200">{p.xG90.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">xA / 90</span>
                    <span className="font-bold text-slate-200">{p.xA90.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Shot Acc</span>
                    <span className="font-bold text-slate-200">{p.shotAcc}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-300 font-bold">{p.propName}</span>
                  <span className="text-emerald-400 font-mono font-black text-sm">{p.prob.toFixed(2)}%</span>
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/80 leading-snug">
                  {p.justification}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible Section for Raw Gameweek Form Logs & Manual Entry */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setShowTableLog(!showTableLog)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>View Raw Gameweek History Logs & Log New Match Entry ({selectedTeam})</span>
            </div>
            {showTableLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTableLog && (
            <div className="mt-4 space-y-4 animate-fade-in">
              {/* Gameweek History Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3">Gameweek</th>
                      <th className="p-3">Match Status</th>
                      <th className="p-3">Weekly Coefficient</th>
                      <th className="p-3">Form Scorecard</th>
                      <th className="p-3">Dynamic Coefficient</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {teamRecords.map((r, idx) => {
                      const subHistory = teamRecords.slice(0, idx + 1).map(x => x.cw);
                      const runningDcn = updateDynamicRunningCoefficient(subHistory);
                      const subGrade = getFormGrade(runningDcn);

                      return (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-bold text-slate-200">Gameweek {r.gameweek}</td>
                          <td className="p-3">
                            {r.cw === null ? (
                              <span className="bg-rose-950/80 border border-rose-500/30 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">
                                🚫 Postponed / Blank
                              </span>
                            ) : (
                              <span className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                                ✅ Match Played
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-bold text-cyan-300">
                            {r.cw !== null ? `${r.cw.toFixed(2)} / 10.00` : '—'}
                          </td>
                          <td className="p-3">
                            <span className="font-bold" style={{ color: subGrade.color }}>
                              Grade {subGrade.grade}
                            </span>
                          </td>
                          <td className="p-3 font-black text-emerald-400">
                            {runningDcn.toFixed(2)} / 10.00
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Form Entry Form */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Log Manual Gameweek Entry (Offline/Custom Override)</span>
                  </h3>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                    Live mode syncs automatically via API
                  </span>
                </div>

                <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs">
                  <div>
                    <label className="text-slate-400 block font-medium mb-1">Gameweek #</label>
                    <input
                      type="number"
                      min="1"
                      max="38"
                      value={newGw}
                      onChange={e => setNewGw(parseInt(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block font-medium mb-1">Weekly Coefficient</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      max="10.00"
                      disabled={isPostponed}
                      value={newCw}
                      onChange={e => setNewCw(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pb-2">
                    <input
                      type="checkbox"
                      id="postponed_chk"
                      checked={isPostponed}
                      onChange={e => setIsPostponed(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="postponed_chk" className="text-slate-300 font-semibold cursor-pointer">
                      Match Postponed
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Commit Entry</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
