/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CameraMode,
  DiscoverySite,
  MissionObjective,
  RadioMessage,
  RoverTelemetry,
  RoverUpgrades,
} from '../types';
import {
  Battery,
  Sun,
  Thermometer,
  Shield,
  Zap,
  Radio,
  Eye,
  Camera,
  Layers,
  Wrench,
  ChevronRight,
  ChevronDown,
  Navigation,
  Compass,
  AlertTriangle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

interface HUDProps {
  telemetry: RoverTelemetry;
  cameraMode: CameraMode;
  onCameraChange: (mode: CameraMode) => void;
  onToggleHeadlights: () => void;
  onToggleLidar: () => void;
  onToggleDrill: () => void;
  onToggleDrone: () => void;
  onOpenUpgrades: () => void;
  objectives: MissionObjective[];
  radioMessages: RadioMessage[];
  onOpenDiscovery: (d: DiscoverySite) => void;
  discoveries: DiscoverySite[];
  isDroneActive: boolean;
  onSimulateKey: (code: string, isDown: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({
  telemetry,
  cameraMode,
  onCameraChange,
  onToggleHeadlights,
  onToggleLidar,
  onToggleDrill,
  onToggleDrone,
  onOpenUpgrades,
  objectives,
  radioMessages,
  onOpenDiscovery,
  discoveries,
  isDroneActive,
  onSimulateKey,
}) => {
  const [objectivesOpen, setObjectivesOpen] = useState(true);
  const [radioLogOpen, setRadioLogOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const completedObjectivesCount = objectives.filter((o) => o.completed).length;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-mono-tech text-xs text-[#e0e0e0]">
      {/* TOP BAR: Telemetry & Mission Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Vessel Identity & Power Matrix */}
        <div className="bg-[#050505]/90 backdrop-blur-md border border-white/15 p-3.5 shadow-2xl flex flex-col gap-2.5 min-w-[280px] pointer-events-auto relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-white/[0.03] text-6xl font-black font-display pointer-events-none select-none">
            01
          </div>

          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              <span className="font-black text-sm tracking-wider text-white font-display uppercase">
                {isDroneActive ? 'DRONE-SCOUT // AERIAL' : 'VAGABOND-IV // ROVER'}
              </span>
            </div>
            <span className="text-[9px] px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-widest">
              ARTEMIS RECON
            </span>
          </div>

          {/* Battery & Solar Gauge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-neutral-300 text-[11px] font-bold uppercase tracking-wider">
                <Battery className="w-3.5 h-3.5 text-cyan-400" />
                POWER RESERVOIR
              </span>
              <span className="font-black text-white text-sm font-mono-tech">{telemetry.battery.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  telemetry.battery > 40
                    ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                    : telemetry.battery > 20
                    ? 'bg-amber-400'
                    : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${Math.max(2, telemetry.battery)}%` }}
              />
            </div>

            {/* Solar Radiation & Thermal */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
              <div className="bg-white/[0.03] p-2 border border-white/10 flex items-center justify-between">
                <span className="flex items-center gap-1 text-amber-400 font-bold uppercase tracking-wider">
                  <Sun className="w-3 h-3" />
                  SOLAR
                </span>
                <span className="font-bold text-white">
                  {telemetry.inDirectSunlight ? `+${telemetry.solarInput}%` : 'SHADOW'}
                </span>
              </div>
              <div className="bg-white/[0.03] p-2 border border-white/10 flex items-center justify-between">
                <span className="flex items-center gap-1 text-cyan-400 font-bold uppercase tracking-wider">
                  <Thermometer className="w-3 h-3" />
                  TEMP
                </span>
                <span className="font-bold text-white">{telemetry.temperatureCelsius.toFixed(0)}°C</span>
              </div>
            </div>

            {/* Hull & Thruster Bars */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <div className="flex justify-between text-neutral-400 mb-0.5 uppercase tracking-wider text-[9px] font-bold">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-cyan-400" /> HULL
                  </span>
                  <span className="text-white">{telemetry.hullIntegrity.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${telemetry.hullIntegrity}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-0.5 uppercase tracking-wider text-[9px] font-bold">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> RCS FUEL
                  </span>
                  <span className="text-white">{telemetry.thrusterFuel.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${telemetry.thrusterFuel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: GPR Minimap & Anomaly Radar Beacon */}
        <div className="bg-[#050505]/90 backdrop-blur-md border border-white/15 p-3.5 shadow-2xl flex flex-col items-center min-w-[260px] pointer-events-auto relative">
          <div className="flex items-center justify-between w-full border-b border-white/10 pb-1.5 mb-2">
            <span className="flex items-center gap-1.5 text-cyan-400 font-black text-[11px] tracking-[0.2em] uppercase font-display">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              GPR SUBSURFACE RADAR
            </span>
            <span className="text-[9px] text-neutral-400 tracking-wider">1.62 m/s² LUNAR-G</span>
          </div>

          {/* Dynamic Radar Ping Display */}
          <div className="relative w-36 h-36 border border-cyan-500/30 bg-black flex items-center justify-center overflow-hidden mb-2 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]">
            <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-8 rounded-full border border-cyan-500/20" />
            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-cyan-500/25" />
            <div className="absolute h-full w-[1px] bg-cyan-500/25" />

            {/* Sweep radar beam */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(6, 182, 212, 0.45) 360deg)',
                animation: 'spin 3s linear infinite',
              }}
            />

            {/* Rover center dot */}
            <div className="w-3 h-3 bg-cyan-400 z-10 shadow-[0_0_10px_#22d3ee] flex items-center justify-center">
              <div className="w-1 h-1 bg-black" />
            </div>

            {/* Anomaly blips */}
            {discoveries.map((d) => {
              const relX = (d.x - 0) * 0.25;
              const relZ = (d.z - 0) * 0.25;
              const dist = Math.hypot(relX, relZ);
              if (dist > 65) return null;

              return (
                <button
                  key={d.id}
                  onClick={() => onOpenDiscovery(d)}
                  className={`absolute w-3 h-3 z-20 cursor-pointer transition-transform hover:scale-150 ${
                    d.discovered
                      ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                      : 'bg-[#FF8A00] animate-ping shadow-[0_0_10px_#FF8A00]'
                  }`}
                  style={{
                    transform: `translate(${relX}px, ${relZ}px)`,
                  }}
                  title={d.name}
                />
              );
            })}
          </div>

          {/* Nearest Target telemetry */}
          <div className="w-full text-center">
            {telemetry.nearestAnomalyName ? (
              <div className="bg-white/[0.03] py-1.5 px-2 border border-cyan-500/30">
                <div className="text-[10px] text-cyan-300 truncate font-bold uppercase tracking-wider">
                  {telemetry.nearestAnomalyName}
                </div>
                <div className="text-[11px] font-black text-amber-400 font-mono-tech">
                  {telemetry.gprDistanceToNearestAnomaly}M DISTANCE
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-neutral-400 tracking-widest uppercase">SCANNING REGOLITH SECTOR...</div>
            )}
          </div>
        </div>

        {/* Right: Science Points, Audio & Objectives */}
        <div className="flex flex-col gap-2.5 items-end pointer-events-auto">
          {/* Science Score & Audio Control */}
          <div className="bg-[#050505]/90 backdrop-blur-md border border-white/15 p-3 shadow-2xl flex items-center gap-3">
            <div className="text-right">
              <div className="text-[9px] text-neutral-400 uppercase tracking-[0.25em] font-bold">SCIENCE YIELD</div>
              <div className="text-lg font-black text-cyan-400 tracking-wider font-display">
                {telemetry.sciencePoints.toLocaleString()} <span className="text-xs text-neutral-400 font-mono-tech">SP</span>
              </div>
            </div>
            <button
              onClick={onOpenUpgrades}
              className="bg-cyan-400 hover:bg-cyan-300 text-black font-black px-3.5 py-2 text-xs tracking-wider uppercase font-display flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              UPGRADES
            </button>
            <button
              onClick={handleToggleSound}
              className="p-2 bg-white/[0.03] hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors cursor-pointer"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>

          {/* Objectives Drawer */}
          <div className="bg-[#050505]/90 backdrop-blur-md border border-white/15 p-3 shadow-2xl w-[320px]">
            <button
              onClick={() => setObjectivesOpen(!objectivesOpen)}
              className="flex items-center justify-between w-full text-white font-black text-xs cursor-pointer hover:text-cyan-400 transition-colors font-display tracking-wider uppercase"
            >
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                MISSION OBJECTIVES ({completedObjectivesCount}/{objectives.length})
              </span>
              {objectivesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {objectivesOpen && (
              <div className="mt-2.5 space-y-2 border-t border-white/10 pt-2 max-h-48 overflow-y-auto pr-1">
                {objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={`p-2.5 border text-[11px] transition-all ${
                      obj.completed
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                        : 'bg-white/[0.02] border-white/10 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className={obj.completed ? 'line-through text-cyan-400/80' : 'text-white'}>
                        {obj.title}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono-tech font-black">+{obj.rewardPoints} SP</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{obj.description}</div>
                    {obj.maxProgress && (
                      <div className="mt-1.5">
                        <div className="flex justify-between text-[9px] text-neutral-400 mb-0.5 font-mono-tech">
                          <span>PROGRESS</span>
                          <span>
                            {obj.progress || 0} / {obj.maxProgress} m
                          </span>
                        </div>
                        <div className="w-full h-1 bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400"
                            style={{ width: `${Math.min(100, ((obj.progress || 0) / obj.maxProgress) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE: Cockpit Crosshair & Artificial Horizon */}
      {(cameraMode === 'COCKPIT' || cameraMode === 'DRONE') && (
        <div className="self-center pointer-events-none flex flex-col items-center">
          <div className="w-20 h-20 border border-cyan-400/50 flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <div className="w-3 h-3 border border-cyan-400" />
            <div className="absolute top-0 w-0.5 h-3 bg-cyan-400" />
            <div className="absolute bottom-0 w-0.5 h-3 bg-cyan-400" />
            <div className="absolute left-0 w-3 h-0.5 bg-cyan-400" />
            <div className="absolute right-0 w-3 h-0.5 bg-cyan-400" />
          </div>
          <div className="mt-2 text-[10px] text-black font-black bg-cyan-400 px-2.5 py-0.5 tracking-widest uppercase font-display">
            {cameraMode === 'COCKPIT' ? 'MAST STEREO-OPTICS' : 'AERIAL LIDAR DOWNLINK'}
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: Controls, Speedometer, Radio Log */}
      <div className="flex items-end justify-between gap-4">
        {/* Bottom-Left: Radio Comms Box */}
        <div className="bg-[#050505]/90 backdrop-blur-md border border-white/15 p-3.5 shadow-2xl max-w-sm pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-400 font-black text-[11px] uppercase tracking-[0.2em] font-display">
              <Radio className="w-3.5 h-3.5" />
              LUNAR TELEMETRY COMMS
            </span>
            <button
              onClick={() => setRadioLogOpen(!radioLogOpen)}
              className="text-[9px] text-neutral-400 hover:text-white uppercase tracking-widest cursor-pointer"
            >
              {radioLogOpen ? 'COLLAPSE' : 'EXPAND'}
            </button>
          </div>

          <div className={`space-y-1.5 overflow-y-auto pr-1 ${radioLogOpen ? 'max-h-48' : 'max-h-16'}`}>
            {radioMessages.slice(0, radioLogOpen ? 8 : 2).map((msg) => (
              <div key={msg.id} className="text-[11px] leading-snug">
                <span
                  className={`font-bold ${
                    msg.type === 'alert'
                      ? 'text-rose-400'
                      : msg.type === 'discovery'
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }`}
                >
                  [{msg.sender}]:{' '}
                </span>
                <span className="text-neutral-300">{msg.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center-Bottom: Active Action Toolbar */}
        <div className="bg-[#050505]/90 backdrop-blur-md border border-white/15 p-2 shadow-2xl flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleHeadlights}
            className={`flex flex-col items-center justify-center p-2.5 border transition-all cursor-pointer min-w-[66px] ${
              telemetry.headlightsOn
                ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Toggle Dual LED Headlights (Key F)"
          >
            <Sun className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-black tracking-wider uppercase font-mono-tech">LIGHTS [F]</span>
          </button>

          <button
            onClick={() => {
              const modes: CameraMode[] = ['CHASE', 'COCKPIT', 'ORBIT', 'DRONE'];
              const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
              onCameraChange(modes[nextIdx]);
            }}
            className="flex flex-col items-center justify-center p-2.5 border bg-white/[0.03] border-white/10 text-neutral-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer min-w-[66px]"
            title="Cycle Camera Modes (Key V)"
          >
            <Camera className="w-4 h-4 mb-1 text-cyan-400" />
            <span className="text-[9px] font-black tracking-wider uppercase font-mono-tech">CAM: {cameraMode}</span>
          </button>

          <button
            onClick={onToggleDrill}
            className={`flex flex-col items-center justify-center p-2.5 border transition-all cursor-pointer min-w-[66px] ${
              telemetry.drilling
                ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse'
                : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Deploy Surface Core Drill (Key R)"
          >
            <Layers className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-black tracking-wider uppercase font-mono-tech">{telemetry.drilling ? 'DRILLING' : 'DRILL [R]'}</span>
          </button>

          <button
            onClick={onToggleDrone}
            className={`flex flex-col items-center justify-center p-2.5 border transition-all cursor-pointer min-w-[66px] ${
              isDroneActive
                ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Launch Aerial Survey Drone (TAB)"
          >
            <Eye className="w-4 h-4 mb-1" />
            <span className="text-[9px] font-black tracking-wider uppercase font-mono-tech">DRONE [TAB]</span>
          </button>
        </div>

        {/* Bottom-Right: Speedometer & Artificial Horizon */}
        <div className="bg-[#050505]/90 backdrop-blur-md border border-white/15 p-3.5 shadow-2xl flex items-center gap-4 pointer-events-auto">
          {/* Speedometer */}
          <div className="text-center">
            <div className="text-3xl font-black text-white tracking-tighter italic font-display leading-none">
              {telemetry.speedKmh.toFixed(1)}
            </div>
            <div className="text-[9px] text-cyan-400 uppercase font-black tracking-[0.25em] mt-1">KM/H SPEED</div>
          </div>

          {/* Heading & Pitch/Roll Indicator */}
          <div className="border-l border-white/10 pl-3.5 space-y-1 text-[10px]">
            <div className="flex items-center justify-between gap-3 text-neutral-300">
              <span className="flex items-center gap-1 text-cyan-400 font-bold uppercase tracking-wider text-[9px]">
                <Compass className="w-3 h-3" /> HEADING
              </span>
              <span className="font-black text-white font-mono-tech">{telemetry.headingDeg}°</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-neutral-400 text-[9px] uppercase font-bold tracking-wider">
              <span>PITCH:</span>
              <span className="font-bold text-white font-mono-tech">{telemetry.pitchDeg}°</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-neutral-400 text-[9px] uppercase font-bold tracking-wider">
              <span>ROLL:</span>
              <span className="font-bold text-white font-mono-tech">{telemetry.rollDeg}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* On-Screen Mobile / Quick D-Pad Buttons for Touch / Tablet Play */}
      <div className="md:hidden fixed bottom-20 left-4 pointer-events-auto flex flex-col items-center gap-1 bg-[#050505]/90 p-2 border border-white/15">
        <button
          onTouchStart={() => onSimulateKey('KeyW', true)}
          onTouchEnd={() => onSimulateKey('KeyW', false)}
          className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center active:bg-cyan-400 active:text-black text-white font-bold"
        >
          ▲
        </button>
        <div className="flex gap-2">
          <button
            onTouchStart={() => onSimulateKey('KeyA', true)}
            onTouchEnd={() => onSimulateKey('KeyA', false)}
            className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center active:bg-cyan-400 active:text-black text-white font-bold"
          >
            ◀
          </button>
          <button
            onTouchStart={() => onSimulateKey('KeyS', true)}
            onTouchEnd={() => onSimulateKey('KeyS', false)}
            className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center active:bg-cyan-400 active:text-black text-white font-bold"
          >
            ▼
          </button>
          <button
            onTouchStart={() => onSimulateKey('KeyD', true)}
            onTouchEnd={() => onSimulateKey('KeyD', false)}
            className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center active:bg-cyan-400 active:text-black text-white font-bold"
          >
            ▶
          </button>
        </div>
      </div>

      {/* On-Screen Jump Thruster Button for Touch */}
      <div className="md:hidden fixed bottom-20 right-4 pointer-events-auto bg-[#050505]/90 p-2 border border-white/15">
        <button
          onTouchStart={() => onSimulateKey('Space', true)}
          onTouchEnd={() => onSimulateKey('Space', false)}
          className="w-16 h-16 bg-cyan-400 active:bg-cyan-300 flex flex-col items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          <Zap className="w-5 h-5 mb-0.5 fill-current" />
          BOOST
        </button>
      </div>
    </div>
  );
};
