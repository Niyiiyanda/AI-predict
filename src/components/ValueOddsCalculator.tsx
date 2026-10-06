import React, { useState } from 'react';
import { MatchProbabilities } from '../types';
import { ShieldCheck } from 'lucide-react';

interface ValueOddsCalculatorProps {
  probs: MatchProbabilities;
}

export const ValueOddsCalculator: React.FC<ValueOddsCalculatorProps> = ({ probs }) => {
  const [selectedMarket, setSelectedMarket] = useState<string>(probs.outcomes[0]?.marketName || 'Home Win (1)');
  const [bookieOdds, setBookieOdds] = useState<number>(2.10);

  const matchedOutcome = probs.outcomes.find(o => o.marketName === selectedMarket) || probs.outcomes[0];
  const modelProbPct = matchedOutcome ? matchedOutcome.probability : 50;
  const modelProbDecimal = modelProbPct / 100;
  const modelFairOdds = matchedOutcome ? matchedOutcome.fairOdds : 2.00;

  // Simple advantage/edge percentage = ((modelProbDecimal * bookieOdds) - 1) * 100
  const edgeVal = ((modelProbDecimal * bookieOdds) - 1) * 100;
  const edgePct = edgeVal.toFixed(2);
  const hasEdge = edgeVal > 0;

  // Risk Rating based on Probability
  const riskLevel = modelProbPct >= 55 ? 'Low Risk' : modelProbPct >= 38 ? 'Moderate Risk' : 'High Risk';
  const riskColor = modelProbPct >= 55 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : modelProbPct >= 38 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl">
      <div className="border-b border-slate-800 pb-2 mb-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Risk calculator</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Market Selection */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
          <label className="text-[11px] text-slate-400 font-bold block">Market Outcome</label>
          <select
            value={selectedMarket}
            onChange={e => {
              setSelectedMarket(e.target.value);
              const m = probs.outcomes.find(o => o.marketName === e.target.value);
              if (m) {
                setBookieOdds(Math.round((m.fairOdds * 1.05) * 100) / 100);
              }
            }}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold rounded-md px-2.5 py-1.5 focus:outline-none"
          >
            {probs.outcomes.map(o => (
              <option key={o.id} value={o.marketName}>
                {o.marketName} ({o.probability.toFixed(2)}%)
              </option>
            ))}
          </select>
        </div>

        {/* Bookie Odds Input */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
          <label className="text-[11px] text-slate-400 font-bold block">Offered Odds</label>
          <input
            type="number"
            step="0.05"
            min="1.01"
            max="100.0"
            value={bookieOdds}
            onChange={e => setBookieOdds(parseFloat(e.target.value) || 1.01)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs font-bold rounded-md px-2.5 py-1.5 focus:outline-none"
          />
        </div>

        {/* Simple Advantage / Edge Panel */}
        <div className={`border rounded-lg p-3 flex items-center justify-between ${
          hasEdge ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-slate-950 border-slate-800'
        }`}>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Advantage / Edge</div>
            <div className={`text-lg font-black font-mono ${hasEdge ? 'text-emerald-400' : 'text-slate-400'}`}>
              {hasEdge ? `+${edgePct}% Edge` : `${edgePct}% Edge`}
            </div>
            <div className="text-[10px] text-slate-400">
              Fair @{modelFairOdds.toFixed(2)} vs Offered @{bookieOdds.toFixed(2)}
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${riskColor}`}>
            {riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
};
