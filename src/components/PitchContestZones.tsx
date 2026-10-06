import React, { useState } from 'react';
import { FixtureData, WeeklyCoefficients } from '../types';
import { getTeamStarPlayers } from '../data/team_players';
import { Crosshair, Shield, Target, Zap, Swords, ChevronRight, Award, Flame } from 'lucide-react';

interface PitchContestZonesProps {
  fixture: FixtureData;
  cwHome: WeeklyCoefficients;
  cwAway: WeeklyCoefficients;
}

export const PitchContestZones: React.FC<PitchContestZonesProps> = ({
  fixture,
  cwHome,
  cwAway
}) => {
  const [selectedZone, setSelectedZone] = useState<'midfield' | 'defensive_box' | 'attack_box' | 'left_flank' | 'right_flank' | 'gk_box'>('midfield');

  // Zone details computation
  const getZoneDetails = () => {
    const homeRoster = (fixture.homePlayers && fixture.homePlayers.length > 0 && !fixture.homePlayers[0].name.includes('Key'))
      ? fixture.homePlayers
      : getTeamStarPlayers(fixture.homeTeam);

    const awayRoster = (fixture.awayPlayers && fixture.awayPlayers.length > 0 && !fixture.awayPlayers[0].name.includes('Key'))
      ? fixture.awayPlayers
      : getTeamStarPlayers(fixture.awayTeam);

    switch (selectedZone) {
      case 'midfield':
        const midDiff = cwHome.V2_Duel - cwAway.V2_Duel;
        const midAdvantage = midDiff > 0.1 ? fixture.homeTeam : midDiff < -0.1 ? fixture.awayTeam : 'Balanced';
        return {
          title: 'Central Midfield Duel Zone',
          subtitle: 'Engine Room & Tempo Control',
          statName: 'V2 Duel Success & Turnover Forcing',
          homeScore: Number(cwHome.V2_Duel.toFixed(1)),
          awayScore: Number(cwAway.V2_Duel.toFixed(1)),
          advantage: midAdvantage,
          diff: Math.abs(midDiff).toFixed(1),
          description: `High-intensity physical battle area. ${
            midAdvantage === fixture.homeTeam
              ? `${fixture.homeTeam}'s superior duel win rate (${cwHome.V2_Duel.toFixed(1)}) allows them to dominate second balls and force turnovers in the opposition half.`
              : midAdvantage === fixture.awayTeam
              ? `${fixture.awayTeam}'s physical presence (${cwAway.V2_Duel.toFixed(1)}) gives them control over second balls, stifling ${fixture.homeTeam}'s build-up.`
              : 'Equally matched in duel frequency; match will hinge on tactical discipline and second-ball reactions.'
          }`,
          keyMatchup: `${homeRoster[1]?.name || homeRoster[0]?.name} vs ${awayRoster[1]?.name || awayRoster[0]?.name}`,
          watchFor: `Watch for central ground duel win % (58% vs 49%) and turnover recovery speed. If ${fixture.homeTeam}'s midfield presses within 4 seconds of losing possession, look for increased team card counts and line-breaking key passes.`
        };

      case 'defensive_box':
        const defDiff = cwHome.V1_Defense - cwAway.V1_Defense;
        const defAdvantage = defDiff > 0.1 ? fixture.homeTeam : defDiff < -0.1 ? fixture.awayTeam : 'Balanced';
        return {
          title: 'Defensive Box & Low-Block Zone',
          subtitle: 'Box Clearance & Aerial Stability',
          statName: 'V1 Defensive Solidity Rating',
          homeScore: Number(cwHome.V1_Defense.toFixed(1)),
          awayScore: Number(cwAway.V1_Defense.toFixed(1)),
          advantage: defAdvantage,
          diff: Math.abs(defDiff).toFixed(1),
          description: `Clearance, block frequency, and penalty box congestion. ${
            defAdvantage === fixture.homeTeam
              ? `${fixture.homeTeam} display elite low-block stability (${cwHome.V1_Defense.toFixed(1)}), conceding minimal high-probability xG chances.`
              : `${fixture.awayTeam} boast stronger box defensive rigidity (${cwAway.V1_Defense.toFixed(1)}) when absorbing prolonged home pressure.`
          }`,
          keyMatchup: `${homeRoster[0]?.name} vs ${awayRoster[0]?.name}`,
          watchFor: `Observe box clearance frequency and aerial win rates on set-pieces. If the away striker isolated against the central defender draws 2+ fouls early, look for set-piece goal markets.`
        };

      case 'attack_box':
        const attDiff = cwHome.V4_Threat - cwAway.V4_Threat;
        const attAdvantage = attDiff > 0.1 ? fixture.homeTeam : attDiff < -0.1 ? fixture.awayTeam : 'Balanced';
        return {
          title: 'Final Third & Penalty Area',
          subtitle: 'xG Conversion & Shot Quality',
          statName: 'V4 Goal Threat Efficiency',
          homeScore: Number(cwHome.V4_Threat.toFixed(1)),
          awayScore: Number(cwAway.V4_Threat.toFixed(1)),
          advantage: attAdvantage,
          diff: Math.abs(attDiff).toFixed(1),
          description: `The decisive penalty box danger territory. ${
            attAdvantage === fixture.homeTeam
              ? `${fixture.homeTeam}'s clinical conversion rating (${cwHome.V4_Threat.toFixed(1)}) maximizes xG from inside the 18-yard box.`
              : `${fixture.awayTeam}'s counter-attacking precision (${cwAway.V4_Threat.toFixed(1)}) makes them highly lethal on fast transitions.`
          }`,
          keyMatchup: `${homeRoster[0]?.name} vs ${awayRoster[1]?.name || awayRoster[0]?.name}`,
          watchFor: `Track shot conversion rate (xG ${cwHome.V4_Threat.toFixed(1)}) and penalty box touches per 90. 3+ early touches in the 18-yard box directly correlates with Over 1.5 Team Goals.`
        };

      case 'left_flank':
        return {
          title: 'Left Wing Channel & Overlap',
          subtitle: 'Wide Overloads & Cross Delivery',
          statName: 'Wing Transition & Cutback Threat',
          homeScore: Number((cwHome.V4_Threat * 0.9 + cwHome.V2_Duel * 0.1).toFixed(2)),
          awayScore: Number((cwAway.V1_Defense * 0.8 + cwAway.V2_Duel * 0.2).toFixed(2)),
          advantage: cwHome.V4_Threat > cwAway.V1_Defense ? fixture.homeTeam : fixture.awayTeam,
          diff: Math.abs(cwHome.V4_Threat - cwAway.V1_Defense).toFixed(2),
          description: `1v1 duel zone along the left touchline. High speed winger isolations and full-back overlapping runs trigger dangerous low cutback passes into the box.`,
          keyMatchup: `${homeRoster[2]?.name || homeRoster[0]?.name} vs ${awayRoster[1]?.name || awayRoster[0]?.name}`
        };

      case 'right_flank':
        return {
          title: 'Right Wing Channel & Overlap',
          subtitle: 'Inside Cuts & Inswinging Crosses',
          statName: 'Right Flank Penetration',
          homeScore: Number((cwHome.V1_Defense * 0.8 + cwHome.V2_Duel * 0.2).toFixed(2)),
          awayScore: Number((cwAway.V4_Threat * 0.9 + cwAway.V2_Duel * 0.1).toFixed(2)),
          advantage: cwAway.V4_Threat > cwHome.V1_Defense ? fixture.awayTeam : fixture.homeTeam,
          diff: Math.abs(cwAway.V4_Threat - cwHome.V1_Defense).toFixed(2),
          description: `Inswinging crosses and inside dribbling channels. Tactical battles here determine whether full-backs can push high or remain pinned deep.`,
          keyMatchup: `${homeRoster[1]?.name || homeRoster[0]?.name} vs ${awayRoster[2]?.name || awayRoster[0]?.name}`
        };

      case 'gk_box':
        const gkDiff = cwHome.V3_GK - cwAway.V3_GK;
        const gkAdvantage = gkDiff > 0.1 ? fixture.homeTeam : gkDiff < -0.1 ? fixture.awayTeam : 'Balanced';
        return {
          title: '6-Yard Box & Shot Stopping',
          subtitle: 'Goalkeeper Reflexes & Cross Command',
          statName: 'V3 Goalkeeper Resistance Rating',
          homeScore: cwHome.V3_GK,
          awayScore: cwAway.V3_GK,
          advantage: gkAdvantage,
          diff: Math.abs(gkDiff).toFixed(2),
          description: `Last line of defense. Evaluates save percentage above expected (PSxG) and command over high set-piece crosses.`,
          keyMatchup: `${fixture.homeTeam} GK (${cwHome.V3_GK.toFixed(2)}) vs ${fixture.awayTeam} GK (${cwAway.V3_GK.toFixed(2)})`
        };
    }
  };

  const zoneInfo = getZoneDetails();

  return (
    <div id="sec-pitch" className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span>Pitch contest Zones</span>
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Click Hotspot Zones Below
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Native Interactive Mock Field Canvas (SVG + CSS Hotspots) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-inner relative flex flex-col items-center justify-center">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
            <span>⚽ Interactive Pitch Surface</span>
            <span className="text-emerald-400 font-normal">(Tap Zone to Analyze Battle)</span>
          </div>

          {/* Tactical Pitch Graphic Container */}
          <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 rounded-xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl p-2">
            {/* Pitch Grass Patterns */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(90deg,#000,#000_20px,transparent_20px,transparent_40px)]" />

            {/* SVG Pitch Marking Lines */}
            <svg className="w-full h-full text-emerald-400/40 pointer-events-none stroke-current" viewBox="0 0 100 65" fill="none" strokeWidth="0.8">
              {/* Outer Boundary */}
              <rect x="2" y="2" width="96" height="61" rx="1" />
              {/* Halfway Line */}
              <line x1="50" y1="2" x2="50" y2="63" />
              {/* Center Circle */}
              <circle cx="50" cy="32.5" r="9" />
              <circle cx="50" cy="32.5" r="0.8" fill="currentColor" />

              {/* Home Left Penalty Box */}
              <rect x="2" y="14" width="16" height="37" />
              <rect x="2" y="22" width="6" height="21" />
              <path d="M 18,26 A 7 7 0 0 1 18,39" />

              {/* Away Right Penalty Box */}
              <rect x="82" y="14" width="16" height="37" />
              <rect x="92" y="22" width="6" height="21" />
              <path d="M 82,26 A 7 7 0 0 0 82,39" />
            </svg>

            {/* Clickable Zone Hotspots Overlay */}
            <div className="absolute inset-0 p-2 grid grid-cols-5 grid-rows-3 gap-1">
              {/* Row 1: Left Wing Channel */}
              <button
                onClick={() => setSelectedZone('left_flank')}
                className={`col-span-2 row-span-1 rounded-lg border text-[10px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                  selectedZone === 'left_flank'
                    ? 'bg-emerald-500/40 border-emerald-400 text-slate-100 ring-2 ring-emerald-400 shadow-lg scale-95'
                    : 'bg-emerald-950/40 hover:bg-emerald-800/40 border-emerald-500/20 text-emerald-200'
                }`}
              >
                <span>⚡ Left Wing Channel</span>
              </button>

              <button
                onClick={() => setSelectedZone('midfield')}
                className={`col-span-1 row-span-1 rounded-lg border text-[10px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                  selectedZone === 'midfield'
                    ? 'bg-emerald-500/40 border-emerald-400 text-slate-100 ring-2 ring-emerald-400 shadow-lg scale-95'
                    : 'bg-emerald-950/40 hover:bg-emerald-800/40 border-emerald-500/20 text-emerald-200'
                }`}
              >
                <span>Mid High Press</span>
              </button>

              <button
                onClick={() => setSelectedZone('right_flank')}
                className={`col-span-2 row-span-1 rounded-lg border text-[10px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                  selectedZone === 'right_flank'
                    ? 'bg-emerald-500/40 border-emerald-400 text-slate-100 ring-2 ring-emerald-400 shadow-lg scale-95'
                    : 'bg-emerald-950/40 hover:bg-emerald-800/40 border-emerald-500/20 text-emerald-200'
                }`}
              >
                <span>⚡ Right Wing Channel</span>
              </button>

              {/* Row 2: Defensive Box, Midfield Engine, Final Third */}
              <button
                onClick={() => setSelectedZone('defensive_box')}
                className={`col-span-2 row-span-1 rounded-lg border text-[10px] font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedZone === 'defensive_box'
                    ? 'bg-emerald-500/40 border-emerald-400 text-slate-100 ring-2 ring-emerald-400 shadow-lg scale-95'
                    : 'bg-emerald-950/40 hover:bg-emerald-800/40 border-emerald-500/20 text-emerald-200'
                }`}
              >
                <span>🛡️ Home Low Block</span>
                <span className="text-[9px] font-mono opacity-80">{cwHome.V1_Defense.toFixed(2)} Rating</span>
              </button>

              <button
                onClick={() => setSelectedZone('midfield')}
                className={`col-span-1 row-span-1 rounded-lg border text-[10px] font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedZone === 'midfield'
                    ? 'bg-amber-500/40 border-amber-400 text-slate-100 ring-2 ring-amber-400 shadow-lg scale-95'
                    : 'bg-amber-950/40 hover:bg-amber-800/40 border-amber-500/30 text-amber-200'
                }`}
              >
                <span>⚔️ Midfield Engine</span>
                <span className="text-[9px] font-mono opacity-80">Duel Core</span>
              </button>

              <button
                onClick={() => setSelectedZone('attack_box')}
                className={`col-span-2 row-span-1 rounded-lg border text-[10px] font-extrabold flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedZone === 'attack_box'
                    ? 'bg-cyan-500/40 border-cyan-400 text-slate-100 ring-2 ring-cyan-400 shadow-lg scale-95'
                    : 'bg-cyan-950/40 hover:bg-cyan-800/40 border-cyan-500/20 text-cyan-200'
                }`}
              >
                <span>🎯 Final Third Box</span>
                <span className="text-[9px] font-mono opacity-80">{cwHome.V4_Threat.toFixed(2)} Threat</span>
              </button>

              {/* Row 3: GK Box & Counter Attack */}
              <button
                onClick={() => setSelectedZone('gk_box')}
                className={`col-span-1 row-span-1 rounded-lg border text-[9px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                  selectedZone === 'gk_box'
                    ? 'bg-emerald-500/40 border-emerald-400 text-slate-100 ring-2 ring-emerald-400 shadow-lg'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                }`}
              >
                <span>🧤 Home GK</span>
              </button>

              <button
                onClick={() => setSelectedZone('defensive_box')}
                className={`col-span-3 row-span-1 rounded-lg border text-[9px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                  selectedZone === 'defensive_box'
                    ? 'bg-emerald-500/40 border-emerald-400 text-slate-100'
                    : 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                }`}
              >
                <span>Clearing & Set-Piece Overload Zone</span>
              </button>

              <button
                onClick={() => setSelectedZone('gk_box')}
                className={`col-span-1 row-span-1 rounded-lg border text-[9px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                  selectedZone === 'gk_box'
                    ? 'bg-cyan-500/40 border-cyan-400 text-slate-100 ring-2 ring-cyan-400 shadow-lg'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                }`}
              >
                <span>🧤 Away GK</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Zone Analysis Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block">
                {zoneInfo.subtitle}
              </span>
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>{zoneInfo.title}</span>
              </h4>
            </div>

            <span className="bg-slate-800 text-slate-300 text-xs font-extrabold font-mono px-2.5 py-1 rounded-lg border border-slate-700">
              {zoneInfo.advantage === 'Balanced' ? '⚖️ Balanced' : `🎯 ${zoneInfo.advantage} Edge (+${zoneInfo.diff})`}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            {zoneInfo.description}
          </p>

          {/* Metric Comparison Bar */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-extrabold">
              <span className="text-emerald-400">{fixture.homeTeam}: {zoneInfo.homeScore}</span>
              <span className="text-slate-400 text-[10px] font-sans uppercase font-bold">{zoneInfo.statName}</span>
              <span className="text-cyan-400">{fixture.awayTeam}: {zoneInfo.awayScore}</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-slate-800">
              <div className="bg-emerald-400 h-full" style={{ width: `${(zoneInfo.homeScore / 10) * 100}%` }} />
              <div className="bg-cyan-400 h-full" style={{ width: `${(zoneInfo.awayScore / 10) * 100}%` }} />
            </div>
          </div>

          {/* Key Individual Player Matchup & Real World Watchlist */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Swords className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Key Individual Matchup</span>
                  <span className="font-extrabold text-slate-100 text-xs sm:text-sm">{zoneInfo.keyMatchup}</span>
                </div>
              </div>
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            </div>
            {zoneInfo.watchFor && (
              <p className="text-[11px] text-slate-300 bg-slate-950/90 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                <strong className="text-amber-400 font-bold">What to look for: </strong>
                {zoneInfo.watchFor}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
