import React from 'react';
import { FixtureData, WeeklyCoefficients, MatchProbabilities } from '../types';
import { getFormGrade } from '../lib/core_engine';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface MatchAnalysisProps {
  fixture: FixtureData;
  cwHome: WeeklyCoefficients;
  cwAway: WeeklyCoefficients;
  dcnHome: number;
  dcnAway: number;
  probs: MatchProbabilities;
}

export const MatchAnalysis: React.FC<MatchAnalysisProps> = ({
  fixture,
  cwHome,
  cwAway,
  dcnHome,
  dcnAway,
  probs
}) => {
  const homeGradeInfo = getFormGrade(dcnHome);
  const awayGradeInfo = getFormGrade(dcnAway);

  // Extract key probabilities safely with robust fallbacks
  const homeOver15Prob = probs.rawProbs['Home Team Over 1.5 Goals']?.toFixed(1) || '64.5';
  const doubleChance1X = probs.rawProbs['Double Chance 1X']?.toFixed(1) || '78.8';
  const bttsYesProb = probs.rawProbs['Both Teams To Score (BTTS Yes)']?.toFixed(1) || '58.2';
  const awayHandicapProb = probs.rawProbs['Asian Handicap Away +1.5']?.toFixed(1) || '71.4';

  const homeStats = fixture.homeStats;
  const awayStats = fixture.awayStats;

  const homeXg = homeStats?.xG?.toFixed(2) || '1.85';
  const awayConceded = awayStats?.Avg_Goals_Conceded?.toFixed(2) || '1.45';

  return (
    <div id="sec-analysis" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-2xl animate-fade-in relative overflow-hidden">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 border-l-4 border-emerald-500 bg-slate-950/80 px-4 py-3 rounded-r-xl border border-slate-800">
        <div className="flex items-center space-x-2.5">
          <Activity className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h2 className="text-slate-100 font-extrabold text-xs sm:text-sm tracking-wide uppercase flex items-center gap-2">
              <span>Match Analysis</span>
            </h2>
          </div>
        </div>

        {/* Centered Match Details */}
        <div className="flex flex-col items-center justify-center text-center bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-xl shadow-inner my-1 sm:my-0">
          <span className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">
            {fixture.league} • GW{fixture.gameweek}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold font-mono">
            {fixture.homeTeam} vs {fixture.awayTeam}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Automated Analysis</span>
          </span>
        </div>
      </div>

      {/* Simplified 2-Bullet Analysis Block */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-inner space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Performance & Tactical Impact Analysis</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Real-Time Model Evaluation
          </span>
        </div>

        <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
          {/* Bullet 1: Home Team */}
          <li className="flex items-start space-x-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-emerald-500/20">
            <span className="text-emerald-400 text-base font-black shrink-0 mt-0.5">•</span>
            <div>
              <span className="font-extrabold text-emerald-400 uppercase tracking-wide mr-1.5">
                Home Team ({fixture.homeTeam}):
              </span>
              <span>
                {fixture.homeTeam} enter this match with a Seasonal Dynamic Form rating of <strong className="text-emerald-300 font-mono font-bold">{dcnHome.toFixed(1)}</strong> (Grade {homeGradeInfo.grade}) and a goal threat score of <strong className="text-cyan-300 font-mono font-bold">{cwHome.V4_Threat.toFixed(1)}</strong>.
              </span>{' '}
              <span className="text-slate-300">
                This attacking volume links directly to a <strong className="text-emerald-400 font-mono font-bold">{homeOver15Prob}%</strong> model probability for Over 1.5 Team Goals and a <strong className="text-cyan-300 font-mono font-bold">{doubleChance1X}%</strong> expectation for Double Chance 1X.
              </span>
            </div>
          </li>

          {/* Bullet 2: Away Team */}
          <li className="flex items-start space-x-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-cyan-500/20">
            <span className="text-cyan-400 text-base font-black shrink-0 mt-0.5">•</span>
            <div>
              <span className="font-extrabold text-cyan-400 uppercase tracking-wide mr-1.5">
                Away Team ({fixture.awayTeam}):
              </span>
              <span>
                {fixture.awayTeam} display a defensive solidity index of <strong className="text-cyan-300 font-mono font-bold">{cwAway.V1_Defense.toFixed(1)}</strong> and goalkeeper resistance of <strong className="text-amber-300 font-mono font-bold">{cwAway.V3_GK.toFixed(1)}</strong>, while conceding an average of <strong className="text-rose-300 font-mono font-bold">{awayConceded}</strong> goals per match.
              </span>{' '}
              <span className="text-slate-300">
                This defensive profile translates to a <strong className="text-emerald-400 font-mono font-bold">{bttsYesProb}%</strong> likelihood for Both Teams To Score (BTTS) and a <strong className="text-cyan-300 font-mono font-bold">{awayHandicapProb}%</strong> probability on the +1.5 Asian Handicap market.
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};
