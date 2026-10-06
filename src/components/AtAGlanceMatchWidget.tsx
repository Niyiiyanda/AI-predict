import React from 'react';
import { FixtureData, MatchProbabilities } from '../types';
import { getFormGrade } from '../lib/core_engine';
import { Shield, Zap, TrendingUp, Trophy, Activity, Target } from 'lucide-react';

interface AtAGlanceMatchWidgetProps {
  fixture: FixtureData;
  dcnHome: number;
  dcnAway: number;
  probs: MatchProbabilities;
}

export const AtAGlanceMatchWidget: React.FC<AtAGlanceMatchWidgetProps> = ({
  fixture,
  dcnHome,
  dcnAway,
  probs
}) => {
  const homeGrade = getFormGrade(dcnHome);
  const awayGrade = getFormGrade(dcnAway);

  const homeProb = (probs.rawProbs['Home Win (1)'] || 58.4).toFixed(2);
  const drawProb = (probs.rawProbs['Draw (X)'] || 23.2).toFixed(2);
  const awayProb = (probs.rawProbs['Away Win (2)'] || 18.4).toFixed(2);

  const over25 = (probs.rawProbs['Over 2.5 Goals'] || 62.5).toFixed(2);
  const btts = (probs.rawProbs['Both Teams To Score (BTTS)'] || 58.0).toFixed(2);

  const homeHasAdvantage = dcnHome >= dcnAway;
  const formDiff = Math.abs(dcnHome - dcnAway).toFixed(2);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>At a glance</span>
          </h2>
        </div>

        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {homeHasAdvantage ? `${fixture.homeTeam} Edge (+${formDiff})` : `${fixture.awayTeam} Edge (+${formDiff})`}
        </span>
      </div>

      {/* Glanceable Mobile Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {/* Card 1: Home Form */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center shadow-inner">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">
            {fixture.homeTeam} Form
          </span>
          <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
            Grade {homeGrade.grade} <span className="text-xs text-slate-400 font-normal">({dcnHome.toFixed(2)})</span>
          </div>
        </div>

        {/* Card 2: Away Form */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center shadow-inner">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">
            {fixture.awayTeam} Form
          </span>
          <div className="text-sm font-black text-cyan-400 font-mono mt-0.5">
            Grade {awayGrade.grade} <span className="text-xs text-slate-400 font-normal">({dcnAway.toFixed(2)})</span>
          </div>
        </div>

        {/* Card 3: Over 2.5 Goals */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center shadow-inner">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">
            Over 2.5 Goals
          </span>
          <div className="text-sm font-black text-amber-400 font-mono mt-0.5">
            {over25}%
          </div>
        </div>

        {/* Card 4: BTTS */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center shadow-inner">
          <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">
            BTTS Yes
          </span>
          <div className="text-sm font-black text-teal-400 font-mono mt-0.5">
            {btts}%
          </div>
        </div>
      </div>

      {/* 1X2 Outcome Visual Gauge Bar */}
      <div className="space-y-1.5 bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-emerald-400 flex items-center gap-1">
            <span>{fixture.homeTeam} Win</span>
            <span className="font-mono">({homeProb}%)</span>
          </span>
          <span className="text-amber-400 font-mono">
            Draw ({drawProb}%)
          </span>
          <span className="text-cyan-400 flex items-center gap-1">
            <span className="font-mono">({awayProb}%)</span>
            <span>{fixture.awayTeam} Win</span>
          </span>
        </div>

        {/* Multi-segment Probability Meter */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
          <div
            className="bg-emerald-500 transition-all duration-500 flex items-center justify-center text-[9px] font-black text-slate-950"
            style={{ width: `${homeProb}%` }}
          />
          <div
            className="bg-amber-500 transition-all duration-500 flex items-center justify-center text-[9px] font-black text-slate-950"
            style={{ width: `${drawProb}%` }}
          />
          <div
            className="bg-cyan-500 transition-all duration-500 flex items-center justify-center text-[9px] font-black text-slate-950"
            style={{ width: `${awayProb}%` }}
          />
        </div>
      </div>
    </div>
  );
};
