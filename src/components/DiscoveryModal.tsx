/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiscoverySite } from '../types';
import {
  X,
  Radio,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Award,
  Send,
  Database,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import confetti from 'canvas-confetti';

interface DiscoveryModalProps {
  discovery: DiscoverySite | null;
  onClose: () => void;
  onDrillSample: (site: DiscoverySite) => void;
  onTransmitData: (site: DiscoverySite) => void;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  discovery,
  onClose,
  onDrillSample,
  onTransmitData,
}) => {
  if (!discovery) return null;

  const handleTransmit = () => {
    soundEngine.playDiscoveryChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    onTransmitData(discovery);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4 select-none font-mono-tech">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-dot-grid" />
      
      {/* Outer Border */}
      <div className="absolute inset-2 sm:inset-4 border border-white/10 pointer-events-none z-0" />

      <div className="relative z-10 bg-[#080808]/95 border border-white/15 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-[#e0e0e0] animate-in fade-in zoom-in duration-200">
        {/* Giant Watermark Typography in Background */}
        <div className="absolute -top-8 -right-4 opacity-[0.03] select-none text-[140px] font-black leading-none pointer-events-none tracking-tighter italic font-display">
          SPECIMEN
        </div>

        {/* Header */}
        <div className="bg-white/[0.02] p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.25em] font-display">
                LUNAR DISCOVERY // {discovery.type}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight italic font-display">
                {discovery.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/[0.03] hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Subtitle & Historical Context */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white/[0.02] p-3 border border-white/10">
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">{discovery.title}</span>
            {discovery.historicalDate && (
              <span className="text-[10px] px-2.5 py-0.5 bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/40 font-bold uppercase tracking-wider">
                HISTORICAL: {discovery.historicalDate}
              </span>
            )}
          </div>

          {/* Lore Narrative */}
          <div className="text-xs text-neutral-300 leading-relaxed bg-white/[0.02] p-4 border border-white/10 font-sans">
            <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-1.5 font-display">
              <FileText className="w-3.5 h-3.5" />
              MISSION LOG & ARCHAEOLOGICAL RECORD
            </div>
            {discovery.loreDescription}
          </div>

          {/* Audio Log / Radio Transcript */}
          {discovery.audioLog && (
            <div className="bg-white/[0.02] p-4 border border-cyan-500/30 text-xs">
              <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1.5">
                <span className="flex items-center gap-1.5 uppercase tracking-wider font-display">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  AUDIO TELEMETRY // {discovery.audioLog.speaker}
                </span>
                <span className="text-neutral-400 font-mono-tech">{discovery.audioLog.timestamp}</span>
              </div>
              <div className="italic text-white font-sans mt-1 bg-black/50 p-3 border border-white/10">
                "{discovery.audioLog.transcript}"
              </div>
            </div>
          )}

          {/* Mass Spectrometry / Chemistry Breakdown */}
          <div className="bg-white/[0.02] p-4 border border-white/10">
            <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.25em] mb-3 flex items-center gap-1.5 font-display">
              <Activity className="w-3.5 h-3.5" />
              MASS SPECTROMETRY // ELEMENTAL COMPOSITION
            </div>

            <div className="space-y-2.5">
              {discovery.spectrometerData.chemicalComposition.map((comp) => (
                <div key={comp.element}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-neutral-300 uppercase font-mono-tech">{comp.element}</span>
                    <span className="font-black text-cyan-400 font-mono-tech">{comp.percentage}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400"
                      style={{ width: `${comp.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 text-[11px]">
              <div>
                <span className="text-neutral-400 text-[10px] uppercase tracking-wider">ISOTOPE PROFILE:</span>
                <div className="font-bold text-white uppercase mt-0.5">
                  {discovery.spectrometerData.isotopeProfile}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] uppercase tracking-wider">RADIATION HAZARD:</span>
                <div className="font-bold text-amber-400 uppercase mt-0.5">
                  {discovery.spectrometerData.radiationLevelUsv} µSv/h
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white/[0.02] p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">SCIENTIFIC YIELD</div>
              <div className="text-sm sm:text-base font-black text-cyan-400 font-display">
                +{discovery.scientificValue} SCIENCE POINTS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onDrillSample(discovery)}
              disabled={discovery.sampleRetrieved}
              className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-black tracking-wider uppercase font-display flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                discovery.sampleRetrieved
                  ? 'bg-white/[0.02] border-white/10 text-neutral-500 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 border-white/30 text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              {discovery.sampleRetrieved ? 'SAMPLE RETRIEVED' : 'CORE-DRILL SAMPLE'}
            </button>

            <button
              onClick={handleTransmit}
              disabled={discovery.analyzed}
              className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-black tracking-wider uppercase font-display flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                discovery.analyzed
                  ? 'bg-white/[0.02] border-white/10 text-neutral-500 cursor-not-allowed'
                  : 'bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-200 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              }`}
            >
              <Send className="w-4 h-4 fill-current" />
              {discovery.analyzed ? 'DOWNLINK COMPLETED' : 'TRANSMIT TO EARTH'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
