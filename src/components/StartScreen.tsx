/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  Zap,
  Play,
  Sparkles,
  Globe,
  Radio,
  Layers,
  Camera,
  Crosshair,
  ShieldAlert,
} from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-dot-grid" />
      
      {/* Decorative Outer Screen Frame Border */}
      <div className="absolute inset-2 sm:inset-4 border border-white/10 pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl w-full bg-[#080808]/90 border border-white/15 shadow-2xl overflow-hidden flex flex-col text-[#e0e0e0] my-auto">
        {/* Giant Watermark Typography in Background */}
        <div className="absolute -top-12 -right-6 opacity-[0.04] select-none text-[180px] sm:text-[240px] font-black leading-none pointer-events-none tracking-tighter italic font-display">
          SELENE
        </div>
        <div className="absolute -bottom-16 -left-8 opacity-[0.03] select-none text-[220px] font-black leading-none pointer-events-none tracking-tighter font-display">
          01
        </div>

        {/* Top Telemetry Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.35em] uppercase text-cyan-400 font-bold mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              SYSTEM STATUS: OPERATIONAL
            </span>
            <span className="font-mono-tech text-xs tracking-widest text-neutral-400 uppercase">
              VAGABOND-IV // ARTEMIS DEEP RECON
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="block text-[9px] tracking-[0.25em] uppercase text-neutral-400">
              TARGET COORDINATES
            </span>
            <span className="font-mono-tech text-xs sm:text-sm font-bold text-white tracking-wider">
              89.9°S 0.0°E // SHACKLETON SECTOR
            </span>
          </div>
        </div>

        {/* Hero Section: Huge Bold Typography Headline */}
        <div className="p-6 sm:p-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            LUNAR SURFACE DEPLOYMENT PROTOCOL
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase text-white italic font-display leading-[0.88] mb-4">
            LUNAR<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400">
              DISCOVERY
            </span>
          </h1>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end mt-4">
            <p className="max-w-xl text-neutral-400 text-sm sm:text-base leading-relaxed font-light">
              Command the autonomous heavy science rover across the uncharted regolith of the Moon. Experience high-fidelity 1/6th lunar vacuum physics, ballistic regolith sand dynamics, Apollo relics excavation, and deep-shadow volatile sampling.
            </p>

            <div className="flex flex-col border-l border-white/20 pl-5 shrink-0">
              <span className="text-[9px] uppercase tracking-[0.4em] text-cyan-400 font-bold mb-1">
                GRAVITY CONSTANT
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono-tech">
                1.622 <span className="text-xs font-normal text-neutral-400">m/s²</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modular Tech Profile Grid (Matches Bold Theme Aesthetics) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5 sm:p-6 border-t border-b border-white/10 bg-white/[0.01]">
          <div className="border border-white/10 p-3.5 bg-white/[0.03] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono-tech">
                ENVIRONMENT
              </span>
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="block text-sm sm:text-base font-black uppercase text-white font-display">
              1/6th Lunar-G
            </span>
            <div className="w-full h-1 bg-white/10 mt-2 overflow-hidden">
              <div className="w-1/6 h-full bg-cyan-400" />
            </div>
            <span className="text-[9px] text-neutral-400 mt-1.5 block">Vacuum Ballistics</span>
          </div>

          <div className="border border-white/10 p-3.5 bg-white/[0.03] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono-tech">
                SURFACE REGOLITH
              </span>
              <Layers className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="block text-sm sm:text-base font-black uppercase text-amber-400 font-display">
              High Slippage
            </span>
            <div className="w-full h-1 bg-white/10 mt-2 overflow-hidden">
              <div className="w-3/4 h-full bg-amber-400" />
            </div>
            <span className="text-[9px] text-neutral-400 mt-1.5 block">Sand Spray Active</span>
          </div>

          <div className="border border-white/10 p-3.5 bg-white/[0.03] backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono-tech">
                PROPULSION
              </span>
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="block text-sm sm:text-base font-black uppercase text-white font-display">
              RCS Cold-Gas
            </span>
            <div className="w-full h-1 bg-white/10 mt-2 overflow-hidden">
              <div className="w-full h-full bg-cyan-400" />
            </div>
            <span className="text-[9px] text-neutral-400 mt-1.5 block">Vertical Jump Jet</span>
          </div>

          <div className="border border-[#FF8A00]/50 p-3.5 bg-[#FF8A00]/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase tracking-widest text-[#FF8A00] font-mono-tech font-bold">
                PRIMARY MISSION
              </span>
              <Radio className="w-3.5 h-3.5 text-[#FF8A00]" />
            </div>
            <span className="block text-sm sm:text-base font-black uppercase text-white font-display">
              5 Anomalies
            </span>
            <div className="w-full h-1 bg-[#FF8A00]/30 mt-2 overflow-hidden">
              <div className="w-1/2 h-full bg-[#FF8A00]" />
            </div>
            <span className="text-[9px] text-amber-200 mt-1.5 block">Apollo 11 & Relics</span>
          </div>
        </div>

        {/* Flight & Rover Telemetry Controls Sheet */}
        <div className="p-5 sm:p-6 bg-black/40">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.25em] mb-3 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            SYSTEM FLIGHT CONTROLS & COMMANDS
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono-tech">
            <div className="bg-white/[0.03] p-2.5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-neutral-400 uppercase">Drive / Steer</span>
              <span className="font-black text-cyan-400 text-sm mt-1">W A S D</span>
            </div>

            <div className="bg-white/[0.03] p-2.5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-neutral-400 uppercase">RCS Thruster</span>
              <span className="font-black text-cyan-400 text-sm mt-1">SPACE</span>
            </div>

            <div className="bg-white/[0.03] p-2.5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-neutral-400 uppercase">LED Lights</span>
              <span className="font-black text-cyan-400 text-sm mt-1">KEY [F]</span>
            </div>

            <div className="bg-white/[0.03] p-2.5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-neutral-400 uppercase">Camera View</span>
              <span className="font-black text-cyan-400 text-sm mt-1">KEY [V]</span>
            </div>

            <div className="bg-white/[0.03] p-2.5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-neutral-400 uppercase">Surface Drill</span>
              <span className="font-black text-cyan-400 text-sm mt-1">KEY [R]</span>
            </div>

            <div className="bg-white/[0.03] p-2.5 border border-white/10 flex flex-col justify-between">
              <span className="text-[10px] text-neutral-400 uppercase">Scout Drone</span>
              <span className="font-black text-cyan-400 text-sm mt-1">KEY [TAB]</span>
            </div>
          </div>
        </div>

        {/* Footer & High-Impact Launch Button */}
        <div className="p-5 sm:p-6 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono-tech">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>RAYTRACED LIGHTING & PHYSICS CHAOS READY</span>
          </div>

          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-200 text-black font-black text-sm tracking-[0.2em] uppercase font-display flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            INITIATE LUNAR DESCENT
          </button>
        </div>
      </div>
    </div>
  );
};

