import React, { useState } from 'react';
import { OutcomeMarket, MatchProbabilities, FixtureData, AccumulatorItem } from '../types';
import { CheckCircle2, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Filter, User, Plus, Check, Info, AlertTriangle, ArrowRight, Shield } from 'lucide-react';

interface OutcomesSectionProps {
  matchProbs: MatchProbabilities;
  fixture?: FixtureData;
  accumulatorItems?: AccumulatorItem[];
  onAddAccumulatorItem?: (item: AccumulatorItem) => void;
  onNavigateToOlympus?: () => void;
  onNavigateToPlayerOutcomes?: () => void;
}

export const OutcomesSection: React.FC<OutcomesSectionProps> = ({
  matchProbs,
  fixture,
  accumulatorItems = [],
  onAddAccumulatorItem,
  onNavigateToOlympus,
  onNavigateToPlayerOutcomes
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openRealistic, setOpenRealistic] = useState<boolean>(true);
  const [openProbable, setOpenProbable] = useState<boolean>(true);
  const [openRisky, setOpenRisky] = useState<boolean>(false);

  const categories = [
    'All',
    'Match Result & Handicaps',
    'Goal Totals & BTTS',
    'Team Props & Clean Sheets',
    'Half-Time Markets',
    'Disciplinary & Cards',
    'Corners',
    'Compound & Special Props'
  ];

  const allOutcomes = matchProbs.outcomes.filter(o => o.category !== 'Player Props');

  const filteredOutcomes = selectedCategory === 'All'
    ? allOutcomes
    : allOutcomes.filter(o => o.category === selectedCategory);

  const realistic = filteredOutcomes.filter(o => o.probability >= 70);
  const probable = filteredOutcomes.filter(o => o.probability >= 55 && o.probability < 70);
  const risky = filteredOutcomes.filter(o => o.probability < 50);

  const handleAddToAcca = (item: OutcomeMarket) => {
    if (!onAddAccumulatorItem) return;
    const matchName = fixture ? `${fixture.homeTeam} vs ${fixture.awayTeam}` : 'Selected Fixture';
    const accaItem: AccumulatorItem = {
      id: `acc_${item.id}_${Date.now()}`,
      fixtureId: fixture ? fixture.id : 'f1',
      matchName,
      marketName: item.marketName,
      selection: item.marketName,
      odds: item.fairOdds,
      probability: item.probability,
      dataContext: item.dataContext,
      riskFactor: item.riskFactor,
      riskLevel: item.riskLevel,
      status: 'pending'
    };
    onAddAccumulatorItem(accaItem);
  };

  const renderMarketItem = (item: OutcomeMarket, badgeColor: string, textColor: string) => {
    const isAdded = accumulatorItems.some(acc => acc.marketName === item.marketName);

    return (
      <div
        key={item.id}
        className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all shadow-md"
      >
        <div className="space-y-2">
          {/* Market Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div>
              <h4 className="text-xs font-black text-slate-100 tracking-wide text-left">{item.marketName}</h4>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold inline-block mt-1">
                {item.category}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-base font-black font-mono block ${textColor}`}>
                {item.probability.toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Odds @{item.fairOdds.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Justified Data Context & Risk Text */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-[11px] mb-0.5">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Data Context</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed text-justify">
                {item.dataContext || 'High statistical probability alignment based on bivariate model vectors.'}
              </p>
            </div>

            <div className="text-amber-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px] mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Risk Factor</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed text-justify">
                {item.riskFactor || 'Standard match variance and second-half tactical shifts.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions & Risk Level Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded font-mono ${
            item.riskLevel === 'low'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : item.riskLevel === 'moderate'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}>
            {item.riskLevel === 'low' ? '🟢 Low Risk' : item.riskLevel === 'moderate' ? '🟡 Moderate Risk' : '🔴 High Risk'}
          </span>

          <button
            onClick={() => handleAddToAcca(item)}
            className={`flex items-center space-x-1.5 text-xs font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isAdded
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>In Slip</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Acca</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="sec-outcomes" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
      {/* Top Header Row with Navigation Button instead of long outcome lists */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>🎯</span> Outcomes & Market Matrix
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Categorized probability tiers with justified data context and risk metrics.
          </p>
        </div>

        {/* Navigation Button replacing long outcomes list */}
        {onNavigateToOlympus && (
          <button
            onClick={onNavigateToOlympus}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Shield className="w-4 h-4 fill-current" />
            <span>Go to Olympus Acca Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-slate-800/60">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <div className="flex space-x-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tier 1: 🟢 Realistic Outcomes (>= 70%) */}
      {selectedCategory !== 'Player Props' && (
        <div className="mb-4 border border-emerald-500/30 rounded-xl overflow-hidden bg-slate-950/40">
          <button
            onClick={() => setOpenRealistic(!openRealistic)}
            className="w-full bg-emerald-950/40 hover:bg-emerald-900/40 px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                🟢 Realistic Outcomes (≥ 70% Probability) — {realistic.length} Markets
              </span>
            </div>
            {openRealistic ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
          </button>

          {openRealistic && (
            <div className="p-3">
              {realistic.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">
                  No outcome in this category meets or exceeds 70% probability.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {realistic.map(item => renderMarketItem(item, 'bg-emerald-500', 'text-emerald-400'))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tier 2: 🟡 Probable Outcomes (55% - 69%) Accordion */}
      {selectedCategory !== 'Player Props' && (
        <div className="mb-4 border border-amber-500/30 rounded-xl overflow-hidden bg-slate-950/40">
          <button
            onClick={() => setOpenProbable(!openProbable)}
            className="w-full bg-amber-950/40 hover:bg-amber-900/40 px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                🟡 Probable Outcomes (55% – 69% Probability) — {probable.length} Markets
              </span>
            </div>
            {openProbable ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
          </button>

          {openProbable && (
            <div className="p-3">
              {probable.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">
                  No outcome in this category falls between 55% and 69%.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {probable.map(item => renderMarketItem(item, 'bg-amber-500', 'text-amber-400'))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tier 3: 🔴 Risky / Value Outcomes (< 50% Probability) Accordion */}
      {selectedCategory !== 'Player Props' && (
        <div className="mb-6 border border-rose-500/30 rounded-xl overflow-hidden bg-slate-950/40">
          <button
            onClick={() => setOpenRisky(!openRisky)}
            className="w-full bg-rose-950/40 hover:bg-rose-900/40 px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-xs font-extrabold text-rose-300 uppercase tracking-wider">
                🔴 Risky / Value Outcomes (&lt; 50% Probability) — {risky.length} Markets
              </span>
            </div>
            {openRisky ? <ChevronUp className="w-4 h-4 text-rose-400" /> : <ChevronDown className="w-4 h-4 text-rose-400" />}
          </button>

          {openRisky && (
            <div className="p-3">
              {risky.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">
                  No outcome in this category is classified as risky.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {risky.map(item => renderMarketItem(item, 'bg-rose-500', 'text-rose-400'))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
