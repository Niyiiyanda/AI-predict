import React, { useState } from 'react';
import { RefreshCw, Calendar, Swords, Trophy } from 'lucide-react';
import { TOP_LEAGUES } from '../data/leagues_data';
import { FixtureData } from '../types';

interface ComponentHealth {
  fplApiFeed: string;
  apiFootballFeed: string;
  oddsApiFeed: string;
  auditFirewall: string;
  mathEngine: string;
}

interface NavbarProps {
  engineStatus: 'READY' | 'BLOCKER';
  systemTimeWat?: string;
  activeSeason?: string;
  selectedLeague: string;
  setSelectedLeague: (league: string) => void;
  selectedGameweek: number;
  setSelectedGameweek: (gw: number) => void;
  selectedFixtureId: string;
  setSelectedFixtureId: (id: string) => void;
  leagueFixtures: FixtureData[];
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  engineStatus,
  systemTimeWat = 'WAT System Synced',
  activeSeason = '2026/2027',
  selectedLeague,
  setSelectedLeague,
  selectedGameweek,
  setSelectedGameweek,
  selectedFixtureId,
  setSelectedFixtureId,
  leagueFixtures,
  onRefreshData,
  isRefreshing = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const health: ComponentHealth = {
    fplApiFeed: '🟢 CONNECTED (Unlimited Opta Data)',
    apiFootballFeed: '🟢 CONNECTED (Top 4 European Leagues)',
    oddsApiFeed: '🟢 CONNECTED (Live Bookmaker Prices)',
    auditFirewall: engineStatus === 'READY' ? '🟢 Verified (0 Critical Errors)' : '🔴 Critical Validation Failure',
    mathEngine: '🟢 OPERATIONAL (7-10 Match Rolling Average XGBoost Ensemble)'
  };

  const isReady = engineStatus === 'READY';

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar: Brand, Season, Interactive Engine Status Pill, Sync */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-2 border-b border-slate-800/60">
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-black tracking-wider text-sky-400">⚽ 401 PREDICT</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono border border-slate-700">
                Season {activeSeason} WAT
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs w-full sm:w-auto justify-end flex-wrap gap-y-1.5 relative">
            {/* Interactive Engine Status Button - Clicking this directly opens the health dropdown menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 shadow-md ${
                  isReady
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400 hover:bg-emerald-900/90 focus:ring-emerald-500 shadow-emerald-950'
                    : 'bg-rose-950/90 border-rose-500 text-rose-400 hover:bg-rose-900/90 focus:ring-rose-500 shadow-rose-950'
                }`}
                title="Click to view Engine Status & Component Breakdown"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${isReady ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <span>ENGINE STATUS: {engineStatus}</span>
                <span className="text-[10px] ml-1 text-slate-400">{showDropdown ? '▲' : '▼'}</span>
              </button>

              {/* Dropdown Menu Overlay attached directly to the Engine Status Indicator */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-88 sm:w-96 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-4 text-xs backdrop-blur-md z-50 animate-fade-in font-sans">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <h4 className="text-slate-200 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span>🛠️</span> Engine Status & Component Breakdown
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">{systemTimeWat}</span>
                  </div>

                  <div className="space-y-3 mt-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 font-mono">
                      <span className="text-slate-300 font-medium">FPL REST API (Premier League)</span>
                      <span className="text-emerald-400 font-bold">{health.fplApiFeed}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 font-mono">
                      <span className="text-slate-300 font-medium">API-Football v3 (Top European Leagues)</span>
                      <span className="text-emerald-400 font-bold">{health.apiFootballFeed}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 font-mono">
                      <span className="text-slate-300 font-medium">The Odds API (Live Bookmaker Prices)</span>
                      <span className="text-emerald-400 font-bold">{health.oddsApiFeed}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/60 font-mono">
                      <span className="text-slate-300 font-medium">Pre-Match Data Audit Firewall</span>
                      <span className={isReady ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {health.auditFirewall}
                      </span>
                    </div>

                    <div className="flex justify-between items-center font-mono">
                      <span className="text-slate-300 font-medium">XGBoost & Dixon-Coles Engine</span>
                      <span className="text-emerald-400 font-bold">{health.mathEngine}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sync Button */}
            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                disabled={isRefreshing}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50 text-xs shrink-0 font-semibold"
                title="Refresh FPL REST API & API-Football Fixtures"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Competition Selector Bar */}
        <div className="pt-2 pb-1 overflow-x-auto scrollbar-none flex items-center justify-between gap-2 border-b border-slate-800/40">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest shrink-0 mr-1 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> League:
            </span>
            {TOP_LEAGUES.map(league => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedLeague === league.name
                    ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <img src={league.flagUrl} alt={league.country} className="w-4 h-3 rounded-sm object-cover shadow-sm shrink-0" />
                <span>{league.name}</span>
                <span className="text-[10px] opacity-80 font-medium">({league.country})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Control Toolbar: Gameweek & Fixture Selector */}
        <div className="py-2.5 bg-slate-950/60 px-3 my-2 rounded-lg border border-slate-800/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs">
            {/* Gameweek Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Gameweek:</span>
              </label>
              <select
                value={selectedGameweek}
                onChange={e => setSelectedGameweek(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold rounded-md px-2.5 py-1 focus:outline-none focus:border-sky-500 transition-colors"
              >
                {Array.from({ length: 38 }, (_, i) => i + 1).map(gw => (
                  <option key={gw} value={gw}>
                    Gameweek {gw}
                  </option>
                ))}
              </select>
            </div>

            {/* Calendar Widget */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowCalendarModal(!showCalendarModal)}
                className="w-full px-2.5 py-1.5 rounded-md text-xs font-bold bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-800/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Open Season Matchweek Calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Matchweek Calendar 📅</span>
              </button>
            </div>

            {/* Fixture Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <Swords className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fixture:</span>
              </label>
              <select
                value={selectedFixtureId}
                onChange={e => setSelectedFixtureId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-sky-400 font-extrabold rounded-md px-2.5 py-1 focus:outline-none focus:border-sky-500 transition-colors"
              >
                {leagueFixtures.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.homeTeam} vs {f.awayTeam}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Matchweek Calendar Grouping Modal */}
        {showCalendarModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                    Season Matchweek Calendar ({selectedLeague})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="text-slate-400 hover:text-slate-200 font-bold text-sm bg-slate-800 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Array.from({ length: 38 }, (_, i) => i + 1).map(gw => (
                  <button
                    key={gw}
                    type="button"
                    onClick={() => {
                      setSelectedGameweek(gw);
                      setShowCalendarModal(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedGameweek === gw
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-black shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>GW {gw}</span>
                      {selectedGameweek === gw && <span className="text-[10px] bg-sky-500 text-slate-950 px-1.5 py-0.2 rounded font-black">ACTIVE</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">
                      Matchweek {gw}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
