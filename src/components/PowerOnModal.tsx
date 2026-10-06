import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, ShieldCheck, CheckCircle2, Sparkles, X } from 'lucide-react';

interface PowerOnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PowerOnModal: React.FC<PowerOnModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const logs = [
    'INITIALIZING 401 PREDICT ML CORE v2.5...',
    'SYNCING REAL-TIME LEAGUE FIXTURES & SQUAD STATS...',
    'EXECUTING POISSON GOAL MATRIX FOR 38 MARKETS...',
    'CALIBRATING DEFENSIVE SOLDIITY & SKELLAM DIFFERENCE (V1-V5)...',
    'CALCULATING VALUE ODDS & ACCUMULATOR SELECTIONS...',
    '⚡ SYSTEM ONLINE • 100% OPERATIONAL'
  ];

  // Web Audio synth for dramatic sound effect
  const playPowerOnSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Sub-bass sweep oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch {
      // Audio fallback
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setProgress(0);
      playPowerOnSound();

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      const stepTimer1 = setTimeout(() => setStep(1), 400);
      const stepTimer2 = setTimeout(() => setStep(2), 800);
      const stepTimer3 = setTimeout(() => setStep(3), 1200);
      const stepTimer4 = setTimeout(() => setStep(4), 1600);
      const stepTimer5 = setTimeout(() => setStep(5), 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        clearTimeout(stepTimer3);
        clearTimeout(stepTimer4);
        clearTimeout(stepTimer5);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      {/* Background Matrix Glowing Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] space-y-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 bg-slate-800/80 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/50 animate-bounce">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            <div className="absolute -inset-2 bg-emerald-500/20 rounded-3xl blur-md -z-10 animate-pulse" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wider flex items-center justify-center gap-2">
              <span>⚡ SYSTEM POWERING ON</span>
            </h2>
            <p className="text-xs text-emerald-400 font-mono font-bold mt-1">
              401 PREDICT NEURAL COMPUTATION MATRIX
            </p>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-slate-400">ENGINE IGNITION STATUS</span>
            <span className="text-emerald-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-75 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Boot Logs Terminal Screen */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] space-y-2 max-h-48 overflow-y-auto">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2 transition-all duration-300 ${
                idx <= step ? 'opacity-100 text-emerald-400' : 'opacity-20 text-slate-600'
              }`}
            >
              <span className="text-slate-500 shrink-0">&gt;</span>
              <span className="font-bold">{log}</span>
              {idx <= step && idx < logs.length - 1 && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-auto" />
              )}
            </div>
          ))}
        </div>

        {/* Ready Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            disabled={step < 5}
            className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              step >= 5
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>{step >= 5 ? 'ENTER FULL PREDICTIVE SUITE' : 'BOOTING CORE ENGINE...'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
