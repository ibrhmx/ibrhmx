/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CameraMode = 'CHASE' | 'COCKPIT' | 'ORBIT' | 'DRONE';

export interface RoverTelemetry {
  speedKmh: number;
  battery: number; // 0 - 100%
  solarInput: number; // 0 - 100%
  temperatureCelsius: number; // -150°C to +120°C
  inDirectSunlight: boolean;
  hullIntegrity: number; // 0 - 100%
  thrusterFuel: number; // 0 - 100%
  pitchDeg: number;
  rollDeg: number;
  altitudeMeters: number;
  headingDeg: number;
  headlightsOn: boolean;
  lidarActive: boolean;
  drilling: boolean;
  scanning: boolean;
  gprDistanceToNearestAnomaly: number | null;
  nearestAnomalyName: string | null;
  nearestAnomalyType: AnomalyType | null;
  gprSignalStrength: number; // 0 to 1
  samplesCollectedCount: number;
  sciencePoints: number;
}

export type AnomalyType = 
  | 'APOLLO_RELIC' 
  | 'WATER_ICE' 
  | 'HELIUM_3' 
  | 'PYROCLASTIC_GLASS' 
  | 'MONOLITH_STRUCTURE' 
  | 'DERELICT_PROBE' 
  | 'METEORITE_IMPACT' 
  | 'RADIO_TRANSPONDER';

export interface DiscoverySite {
  id: string;
  name: string;
  type: AnomalyType;
  x: number;
  z: number;
  radius: number;
  discovered: boolean;
  analyzed: boolean;
  title: string;
  historicalDate?: string;
  loreDescription: string;
  scientificValue: number;
  spectrometerData: {
    chemicalComposition: { element: string; percentage: number }[];
    isotopeProfile: string;
    radiationLevelUsv: number;
    densityGcm3: number;
  };
  audioLog?: {
    speaker: string;
    transcript: string;
    timestamp: string;
  };
  sampleRetrieved: boolean;
}

export interface RoverUpgrades {
  solarEfficiency: number; // Level 1-5
  batteryCapacity: number; // Level 1-5
  thrusterPower: number;   // Level 1-5
  lidarRange: number;       // Level 1-5
  drillSpeed: number;       // Level 1-5
  suspensionDamping: number;// Level 1-5
}

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  completed: boolean;
  targetAnomalyId?: string;
  progress?: number;
  maxProgress?: number;
}

export interface RadioMessage {
  id: string;
  sender: string;
  callsign: string;
  text: string;
  timestamp: string;
  type: 'info' | 'alert' | 'discovery' | 'lore';
}

export interface DroneState {
  active: boolean;
  battery: number;
  altitude: number;
  distanceFromRover: number;
  maxRange: number;
}
