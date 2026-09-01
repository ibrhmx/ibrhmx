/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameWorld } from './game/GameWorld';
import { HUD } from './components/HUD';
import { DiscoveryModal } from './components/DiscoveryModal';
import { RoverUpgradeModal } from './components/RoverUpgradeModal';
import { StartScreen } from './components/StartScreen';
import {
  CameraMode,
  DiscoverySite,
  MissionObjective,
  RadioMessage,
  RoverTelemetry,
  RoverUpgrades,
} from './types';
import { soundEngine } from './audio/SoundEngine';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameWorldRef = useRef<GameWorld | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [telemetry, setTelemetry] = useState<RoverTelemetry>({
    speedKmh: 0,
    battery: 100,
    solarInput: 85,
    temperatureCelsius: -45,
    inDirectSunlight: true,
    hullIntegrity: 100,
    thrusterFuel: 100,
    pitchDeg: 0,
    rollDeg: 0,
    altitudeMeters: 0,
    headingDeg: 0,
    headlightsOn: true,
    lidarActive: false,
    drilling: false,
    scanning: false,
    gprDistanceToNearestAnomaly: null,
    nearestAnomalyName: null,
    nearestAnomalyType: null,
    gprSignalStrength: 0,
    samplesCollectedCount: 0,
    sciencePoints: 0,
  });

  const [cameraMode, setCameraMode] = useState<CameraMode>('CHASE');
  const [activeDiscovery, setActiveDiscovery] = useState<DiscoverySite | null>(null);
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);
  const [objectives, setObjectives] = useState<MissionObjective[]>([]);
  const [radioMessages, setRadioMessages] = useState<RadioMessage[]>([]);
  const [discoveries, setDiscoveries] = useState<DiscoverySite[]>([]);
  const [upgrades, setUpgrades] = useState<RoverUpgrades>({
    solarEfficiency: 1,
    batteryCapacity: 1,
    thrusterPower: 1,
    lidarRange: 1,
    drillSpeed: 1,
    suspensionDamping: 1,
  });
  const [isDroneActive, setIsDroneActive] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new GameWorld(containerRef.current);
    gameWorldRef.current = game;

    setObjectives(game.objectives);
    setRadioMessages(game.radioMessages);
    setDiscoveries(game.discoveries);
    setUpgrades(game.upgrades);

    game.onTelemetryUpdate = (t) => {
      setTelemetry(t);
      setIsDroneActive(game.droneState.active);
      setCameraMode(game.cameraMode);
    };

    game.onDiscoveryInspected = (d) => {
      setActiveDiscovery(d);
      setDiscoveries([...game.discoveries]);
    };

    game.onRadioMessageAdded = () => {
      setRadioMessages([...game.radioMessages]);
    };

    game.onObjectiveCompleted = () => {
      setObjectives([...game.objectives]);
    };

    return () => {
      game.destroy();
      gameWorldRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    soundEngine.init();
    soundEngine.resume();
    setHasStarted(true);
    if (gameWorldRef.current) {
      gameWorldRef.current.addRadioMessage(
        'MISSION CONTROL',
        'TOUCHDOWN',
        'Vagabond-IV is live on the lunar surface. All telemetry systems nominal.',
        'info'
      );
    }
  };

  const handleCameraChange = (mode: CameraMode) => {
    setCameraMode(mode);
    if (gameWorldRef.current) {
      gameWorldRef.current.setCameraMode(mode);
    }
  };

  const handleToggleHeadlights = () => {
    if (gameWorldRef.current) {
      gameWorldRef.current.telemetry.headlightsOn = !gameWorldRef.current.telemetry.headlightsOn;
      gameWorldRef.current.rover.setHeadlights(gameWorldRef.current.telemetry.headlightsOn);
      setTelemetry({ ...gameWorldRef.current.telemetry });
      soundEngine.playUiClick();
    }
  };

  const handleToggleLidar = () => {
    if (gameWorldRef.current) {
      gameWorldRef.current.telemetry.lidarActive = !gameWorldRef.current.telemetry.lidarActive;
      setTelemetry({ ...gameWorldRef.current.telemetry });
      soundEngine.playUiClick();
    }
  };

  const handleToggleDrill = () => {
    if (gameWorldRef.current) {
      gameWorldRef.current.toggleDrilling();
      setTelemetry({ ...gameWorldRef.current.telemetry });
    }
  };

  const handleToggleDrone = () => {
    if (gameWorldRef.current) {
      gameWorldRef.current.toggleDrone();
      setIsDroneActive(gameWorldRef.current.droneState.active);
      setCameraMode(gameWorldRef.current.cameraMode);
    }
  };

  const handleDrillSample = (site: DiscoverySite) => {
    if (gameWorldRef.current) {
      site.sampleRetrieved = true;
      gameWorldRef.current.telemetry.samplesCollectedCount += 1;
      gameWorldRef.current.telemetry.sciencePoints += 250;
      setTelemetry({ ...gameWorldRef.current.telemetry });
      setDiscoveries([...gameWorldRef.current.discoveries]);
      soundEngine.playDiscoveryChime();
      gameWorldRef.current.addRadioMessage(
        'LAB UNIT',
        'SPECIMEN',
        `Sample core extracted from ${site.name}. Preserved in vacuum cylinder.`,
        'discovery'
      );
    }
  };

  const handleTransmitData = (site: DiscoverySite) => {
    if (gameWorldRef.current) {
      site.analyzed = true;
      gameWorldRef.current.telemetry.sciencePoints += 300;
      setTelemetry({ ...gameWorldRef.current.telemetry });
      setDiscoveries([...gameWorldRef.current.discoveries]);
      gameWorldRef.current.addRadioMessage(
        'EARTH DOWNLINK',
        'NASA-HQ',
        `Spectrometry analysis for ${site.name} confirmed. Downlink bandwidth +300 SP!`,
        'discovery'
      );
    }
  };

  const handleApplyUpgrade = (type: keyof RoverUpgrades) => {
    if (gameWorldRef.current) {
      const success = gameWorldRef.current.applyUpgrade(type);
      if (success) {
        setUpgrades({ ...gameWorldRef.current.upgrades });
        setTelemetry({ ...gameWorldRef.current.telemetry });
      }
    }
  };

  const handleSimulateKey = (code: string, isDown: boolean) => {
    if (gameWorldRef.current) {
      gameWorldRef.current.keys[code] = isDown;
      if (isDown) {
        soundEngine.init();
        soundEngine.resume();
      }
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050505] text-[#e0e0e0] select-none font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Start Screen Overlay */}
      {!hasStarted && <StartScreen onStart={handleStartGame} />}

      {/* NASA Artemis In-Game Telemetry HUD */}
      {hasStarted && (
        <HUD
          telemetry={telemetry}
          cameraMode={cameraMode}
          onCameraChange={handleCameraChange}
          onToggleHeadlights={handleToggleHeadlights}
          onToggleLidar={handleToggleLidar}
          onToggleDrill={handleToggleDrill}
          onToggleDrone={handleToggleDrone}
          onOpenUpgrades={() => setIsUpgradesOpen(true)}
          objectives={objectives}
          radioMessages={radioMessages}
          onOpenDiscovery={(d) => setActiveDiscovery(d)}
          discoveries={discoveries}
          isDroneActive={isDroneActive}
          onSimulateKey={handleSimulateKey}
        />
      )}

      {/* Discovery Detailed Inspection Modal */}
      {activeDiscovery && (
        <DiscoveryModal
          discovery={activeDiscovery}
          onClose={() => setActiveDiscovery(null)}
          onDrillSample={handleDrillSample}
          onTransmitData={handleTransmitData}
        />
      )}

      {/* Rover Subsystems Engineering / Upgrades Modal */}
      {isUpgradesOpen && (
        <RoverUpgradeModal
          upgrades={upgrades}
          sciencePoints={telemetry.sciencePoints}
          onUpgrade={handleApplyUpgrade}
          onClose={() => setIsUpgradesOpen(false)}
        />
      )}
    </main>
  );
}
