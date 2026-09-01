/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RoverUpgrades } from '../types';
import {
  X,
  Wrench,
  Sun,
  Battery,
  Zap,
  Radio,
  Layers,
  Shield,
  Check,
  ArrowUpCircle,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

interface RoverUpgradeModalProps {
  upgrades: RoverUpgrades;
  sciencePoints: number;
  onUpgrade: (type: keyof RoverUpgrades) => void;
  onClose: () => void;
}

export const RoverUpgradeModal: React.FC<RoverUpgradeModalProps> = ({
  upgrades,
  sciencePoints,
  onUpgrade,
  onClose,
}) => {
  const upgradeItems: {
    key: keyof RoverUpgrades;
    name: string;
    description: string;
    icon: React.ReactNode;
    bonusText: string;
  }[] = [
    {
      key: 'solarEfficiency',
      name: 'High-Efficiency Perovskite Solar Array',
      description: 'Upgrades photovoltaic conversion efficiency in harsh lunar direct sunlight.',
      icon: <Sun className="w-5 h-5 text-amber-400" />,
      bonusText: '+35% Solar Battery Recharge Rate',
    },
    {
      key: 'batteryCapacity',
      name: 'Solid-State Cryo-Battery Subsystem',
      description: 'Increases total power reservoir to survive deep shadowed crater traverses.',
      icon: <Battery className="w-5 h-5 text-cyan-400" />,
      bonusText: '+25% Maximum Power Reservoir',
    },
    {
      key: 'thrusterPower',
      name: 'RCS Cold-Gas Hydrazine Thruster Injectors',
      description: 'Enhances vertical impulse force for soaring over deep crater walls and boulders.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      bonusText: '+40% Jump Boost Force in 1/6th Moon Gravity',
    },
    {
      key: 'lidarRange',
      name: 'Ultra-Deep Quantum GPR Radar Array',
      description: 'Expands Ground-Penetrating Radar pulse radius to pinpoint buried artifacts.',
      icon: <Radio className="w-5 h-5 text-cyan-400" />,
      bonusText: '+50m Radar Anomaly Detection Radius',
    },
    {
      key: 'drillSpeed',
      name: 'Tungsten-Carbide Ultrasonic Surface Drill',
      description: 'Accelerates core regolith excavation and volatile cryogenic ice extraction.',
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      bonusText: '+50% Core Drilling Speed & Sample Purity',
    },
    {
      key: 'suspensionDamping',
      name: 'Rocker-Bogie Active Titanium Damper Joints',
      description: 'Reinforces wheel bogies against high kinetic drops and rough boulder impact stress.',
      icon: <Shield className="w-5 h-5 text-amber-400" />,
      bonusText: '-60% Impact Damage on Rough Landings',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4 select-none font-mono-tech">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-dot-grid" />
      
      {/* Outer Border */}
      <div className="absolute inset-2 sm:inset-4 border border-white/10 pointer-events-none z-0" />

      <div className="relative z-10 bg-[#080808]/95 border border-white/15 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-[#e0e0e0] animate-in fade-in zoom-in duration-200">
        {/* Giant Watermark Typography in Background */}
        <div className="absolute -top-8 -right-4 opacity-[0.03] select-none text-[140px] font-black leading-none pointer-events-none tracking-tighter italic font-display">
          UPGRADE
        </div>

        {/* Header */}
        <div className="bg-white/[0.02] p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Wrench className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.25em] font-display">
                VAGABOND-IV // ENGINEERING BAY
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight italic font-display">
                ROVER SUBSYSTEMS CALIBRATION
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/[0.03] border border-white/10 px-3.5 py-1.5 text-right">
              <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-bold">AVAILABLE SCIENCE</div>
              <div className="text-sm font-black text-cyan-400 font-display">
                {sciencePoints.toLocaleString()} SP
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/[0.03] hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upgrade Cards List */}
        <div className="p-5 sm:p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {upgradeItems.map((item) => {
            const currentLevel = upgrades[item.key];
            const isMax = currentLevel >= 5;
            const cost = currentLevel * 350;
            const canAfford = sciencePoints >= cost && !isMax;

            return (
              <div
                key={item.key}
                className="bg-white/[0.02] border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-white/[0.03] border border-white/10 mt-0.5 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider">
                        MK-{currentLevel} {isMax ? '(MAX)' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 font-sans leading-relaxed">{item.description}</p>
                    <div className="text-[11px] text-cyan-300 font-bold mt-1.5">
                      {item.bonusText}
                    </div>

                    {/* Level pips */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-5 h-1 ${
                            lvl <= currentLevel
                              ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="shrink-0 self-end sm:self-center">
                  {isMax ? (
                    <span className="px-3.5 py-2 bg-white/[0.03] border border-white/10 text-[11px] text-cyan-400 font-black tracking-wider uppercase font-display flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> MAXIMUM
                    </span>
                  ) : (
                    <button
                      onClick={() => onUpgrade(item.key)}
                      disabled={!canAfford}
                      className={`px-4 py-2 text-xs font-black tracking-wider uppercase font-display flex items-center gap-2 border transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-200 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                          : 'bg-white/[0.02] border-white/10 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      UPGRADE ({cost} SP)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white/[0.02] p-4 border-t border-white/10 text-center text-xs text-neutral-400 font-mono-tech">
          SYSTEM CALIBRATION // EXPLORE SHADED CRATERS & ANOMALIES TO HARVEST SCIENCE POINTS
        </div>
      </div>
    </div>
  );
};
