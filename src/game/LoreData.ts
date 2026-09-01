/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiscoverySite, MissionObjective, RadioMessage } from '../types';

export const INITIAL_DISCOVERIES: DiscoverySite[] = [
  {
    id: 'apollo-11-relic',
    name: 'Apollo 11 Tranquility Descent Stage',
    title: 'The First Footprint Sector (1969)',
    type: 'APOLLO_RELIC',
    x: 45,
    z: -60,
    radius: 12,
    discovered: false,
    analyzed: false,
    sampleRetrieved: false,
    scientificValue: 500,
    historicalDate: 'July 20, 1969',
    loreDescription:
      'The gold-foil wrapped descent stage of the LM-5 "Eagle". Preserved in pristine vacuum for decades, the ladder still bears the stainless steel plaque: "Here men from the planet Earth first set foot upon the Moon. We came in peace for all mankind."',
    spectrometerData: {
      chemicalComposition: [
        { element: 'Titanium-Alloy', percentage: 48.5 },
        { element: 'Kapton/Mylar Gold Foil', percentage: 32.1 },
        { element: 'Inconel Heat Shield', percentage: 19.4 },
      ],
      isotopeProfile: 'Terrestrial Metallurgical (Apollo Era)',
      radiationLevelUsv: 0.12,
      densityGcm3: 4.51,
    },
    audioLog: {
      speaker: 'Neil A. Armstrong (Restored Telemetry)',
      transcript: 'Houston, Tranquility Base here. The Eagle has landed. Looking out, the surface is fine and powdery. I can kick it up loosely with my toe.',
      timestamp: 'MET 102:45:40',
    },
  },
  {
    id: 'shackleton-ice',
    name: 'Shackleton Shadow Cryo-Ice Depository',
    title: 'Perpetual Shadow Volatiles Site',
    type: 'WATER_ICE',
    x: -85,
    z: 110,
    radius: 14,
    discovered: false,
    analyzed: false,
    sampleRetrieved: false,
    scientificValue: 400,
    loreDescription:
      'Cryogenic water-ice crystals preserved in -240°C permanent shadows for over 2 billion years. Contains ancient cometary volatiles, trapped prebiotic amino acid precursors, and essential fuel stock (H2/O2) for human deep space colonization.',
    spectrometerData: {
      chemicalComposition: [
        { element: 'H2O Crystalline Ice', percentage: 78.4 },
        { element: 'CO2 Dry Matrix', percentage: 12.2 },
        { element: 'Ammonia/Methane Clathrate', percentage: 6.8 },
        { element: 'Silicate Regolith Dust', percentage: 2.6 },
      ],
      isotopeProfile: 'High Deuterium/Hydrogen (Oort Cloud Signature)',
      radiationLevelUsv: 0.04,
      densityGcm3: 0.94,
    },
    audioLog: {
      speaker: 'Dr. Sarah Lin (Project Selene Chief Astrochemist)',
      transcript: 'Vagabond-IV, these spectral absorption lines are unmistakable. Pure frozen ancient water. This single deposit could supply the Artemis Lunar Gateway for an entire century.',
      timestamp: 'Selene Day 4 - 03:14 UTC',
    },
  },
  {
    id: 'apollo-17-orange-soil',
    name: 'Shorty Crater Pyroclastic Orange Beads',
    title: 'Explosive Lunar Volcanism Sample',
    type: 'PYROCLASTIC_GLASS',
    x: 120,
    z: -30,
    radius: 10,
    discovered: false,
    analyzed: false,
    sampleRetrieved: false,
    scientificValue: 350,
    historicalDate: 'December 12, 1972',
    loreDescription:
      'Sub-millimeter orange and black volcanic glass beads formed 3.64 billion years ago during explosive fire-fountaining eruptions. Packed with trapped volatile sulfur, titanium, and zinc from the deepest layers of the lunar mantle.',
    spectrometerData: {
      chemicalComposition: [
        { element: 'Titanium Dioxide (TiO2)', percentage: 8.7 },
        { element: 'Iron Oxide (FeO)', percentage: 22.3 },
        { element: 'Silica Glass Matrix', percentage: 46.1 },
        { element: 'Zinc & Sulfur Volatiles', percentage: 22.9 },
      ],
      isotopeProfile: 'Deep Lunar Mantle Isotopic Mix',
      radiationLevelUsv: 0.18,
      densityGcm3: 3.15,
    },
    audioLog: {
      speaker: 'Harrison Schmitt (Apollo 17 Geologist)',
      transcript: 'Hey! There is orange soil! It is all over! I stirred it up with my boots... it looks like it was an oxidized explosive vent!',
      timestamp: 'MET 145:26:01',
    },
  },
  {
    id: 'helium3-rich-basin',
    name: 'Mare Regolith Helium-3 Sintering Zone',
    title: 'Clean Fusion Energy Deposit',
    type: 'HELIUM_3',
    x: -110,
    z: -80,
    radius: 15,
    discovered: false,
    analyzed: false,
    sampleRetrieved: false,
    scientificValue: 450,
    loreDescription:
      'A dense concentration of solar wind-implanted Helium-3 (3He) embedded in fine Ilmenite grains. A single metric ton of this isotope can generate enough clean aneutronic fusion power to sustain a major Earth metropolis for a year.',
    spectrometerData: {
      chemicalComposition: [
        { element: 'Ilmenite (FeTiO3)', percentage: 61.2 },
        { element: 'Helium-3 Concentrated gas', percentage: 0.08 },
        { element: 'Solar Wind Hydrogen', percentage: 14.5 },
        { element: 'Plagioclase Feldspar', percentage: 24.22 },
      ],
      isotopeProfile: 'Solar Corona Non-Radioactive Fusion Grade',
      radiationLevelUsv: 0.09,
      densityGcm3: 2.85,
    },
    audioLog: {
      speaker: 'Commander Elena Ramos (Flight Director)',
      transcript: 'Telemetry shows the vacuum spectrometer is pegging out on the Helium-3 channel. Core-drill sample loaded. That is pure gold for the next generation of fusion reactors.',
      timestamp: 'Selene Day 4 - 08:42 UTC',
    },
  },
  {
    id: 'quantum-monolith',
    name: 'Subsurface Zero-Entropy Monolith "Anomalous-01"',
    title: 'Extraterrestrial Precursor Artifact',
    type: 'MONOLITH_STRUCTURE',
    x: 0,
    z: 160,
    radius: 18,
    discovered: false,
    analyzed: false,
    sampleRetrieved: false,
    scientificValue: 1200,
    loreDescription:
      'A pitch-black, mathematically flawless geometric obelisk with exact dimension ratios 1:4:9. Emits a coherent quantum harmonic hum that disrupts electromagnetic sensors. Subsurface ground-penetrating radar shows it extends hundreds of meters into the bedrock.',
    spectrometerData: {
      chemicalComposition: [
        { element: 'Unidentified Degenerate Carbon/Metal', percentage: 99.9 },
        { element: 'Quantum Coherence Field', percentage: 0.1 },
      ],
      isotopeProfile: 'Non-Standard Baryonic Matter / Zero Entropy',
      radiationLevelUsv: 4.85,
      densityGcm3: 18.72,
    },
    audioLog: {
      speaker: 'AI System SELENE-Core',
      transcript: 'CRITICAL ALERT: Ground-penetrating radar detecting impossible geometric symmetry. Zero thermal expansion coefficient. Material composition defies periodic classification. Origin date: Pre-Cambrian era.',
      timestamp: 'Selene Day 4 - 14:00:00 UTC',
    },
  },
  {
    id: 'derelict-probe-surveyor',
    name: 'Surveyor Retro-Telemetry Station',
    title: 'Historic Robotic Pioneer (1967)',
    type: 'DERELICT_PROBE',
    x: -30,
    z: -140,
    radius: 12,
    discovered: false,
    analyzed: false,
    sampleRetrieved: false,
    scientificValue: 300,
    historicalDate: 'April 20, 1967',
    loreDescription:
      'Automated lunar soft-lander that proved the lunar regolith could support the weight of the Apollo Lunar Module. Its vintage vidicon TV camera and scoop arm are covered in micro-meteorite impact craters.',
    spectrometerData: {
      chemicalComposition: [
        { element: 'Aluminum-6061 Frame', percentage: 55.4 },
        { element: 'Beryllium Solar Array', percentage: 21.0 },
        { element: 'Tungsten-Coated Scooper', percentage: 23.6 },
      ],
      isotopeProfile: 'Mid-20th Century Aerospace Alloy',
      radiationLevelUsv: 0.14,
      densityGcm3: 2.70,
    },
    audioLog: {
      speaker: 'Telemetry Recovery Unit',
      transcript: 'Direct optical link established with Surveyor retro-reflector. Mirror integrity at 68% after 70 years of micrometeorite bombardment.',
      timestamp: 'Selene Day 4 - 17:20 UTC',
    },
  },
  {
    id: 'impact-glass-crater',
    name: 'Copernican Shock-Melt Impact Spherule',
    title: 'High-Velocity Asteroid Kinetic Relic',
    type: 'METEORITE_IMPACT',
    x: 140,
    z: 90,
    radius: 14,
    discovered: false,
    analyzed: false,
    sampleRetrieved: false,
    scientificValue: 380,
    loreDescription:
      'Iridescent shock-melt glass and iron-nickel meteorite fragments created by an asteroid slamming into the lunar crust at 35 kilometers per second. Temperatures reached 2,800°C in fractions of a microsecond.',
    spectrometerData: {
      chemicalComposition: [
        { element: 'Kamacite (Fe-Ni Metal)', percentage: 41.5 },
        { element: 'Maskelynite Tektite Glass', percentage: 38.2 },
        { element: 'Iridium Anomaly Spike', percentage: 1.8 },
        { element: 'Pyroxene Matrix', percentage: 18.5 },
      ],
      isotopeProfile: 'Chondritic Asteroidal / Extra-lunar',
      radiationLevelUsv: 0.22,
      densityGcm3: 5.40,
    },
    audioLog: {
      speaker: 'Mission Geophysics Team',
      transcript: 'Spectrometry shows a massive iridium spike in this impact melt. Core drill indicates high nickel-iron purity.',
      timestamp: 'Selene Day 4 - 21:05 UTC',
    },
  }
];

export const INITIAL_OBJECTIVES: MissionObjective[] = [
  {
    id: 'obj-apollo11',
    title: 'Locate Apollo 11 Tranquility Base',
    description: 'Use Ground-Penetrating Radar to triangulate and inspect the historic Apollo 11 descent stage.',
    rewardPoints: 500,
    completed: false,
    targetAnomalyId: 'apollo-11-relic',
  },
  {
    id: 'obj-ice-drill',
    title: 'Sample Cryogenic Water Ice',
    description: 'Drive into the permanent shadow zone of Shackleton Crater and perform a deep core drill.',
    rewardPoints: 400,
    completed: false,
    targetAnomalyId: 'shackleton-ice',
  },
  {
    id: 'obj-fusion-fuel',
    title: 'Extract Helium-3 Isotope Regolith',
    description: 'Locate the Ilmenite-rich basalt zone and drill a sample canister of fusion grade Helium-3.',
    rewardPoints: 450,
    completed: false,
    targetAnomalyId: 'helium3-rich-basin',
  },
  {
    id: 'obj-monolith-signal',
    title: 'Investigate Subsurface Quantum Anomaly',
    description: 'Track the anomalous 1:4:9 seismic vibration to its epicenter and scan the buried Monolith structure.',
    rewardPoints: 1200,
    completed: false,
    targetAnomalyId: 'quantum-monolith',
  },
  {
    id: 'obj-survey-drive',
    title: 'Complete 1.0 km Lunar Traverse',
    description: 'Drive the VAGABOND-IV rover across craters and dunes to map lunar surface geography.',
    rewardPoints: 300,
    completed: false,
    progress: 0,
    maxProgress: 1000, // meters
  },
];

export const INITIAL_RADIO_MESSAGES: RadioMessage[] = [
  {
    id: 'msg-01',
    sender: 'HOUSTON CAPCOM',
    callsign: 'FLIGHT',
    text: 'Vagabond-IV, telemetry confirms successful touchdown at lunar coordinate 89.9°S. Check suspension, calibrate GPR scanner, and begin surface reconnaissance.',
    timestamp: '00:00:10',
    type: 'info',
  },
  {
    id: 'msg-02',
    sender: 'SCIENCE TEAM',
    callsign: 'ASTRO-1',
    text: 'Remember: lunar gravity is 1/6th of Earth. Loose regolith sand has very low traction. Use cold-gas thrusters (SPACEBAR) to leap over steep crater cliffs!',
    timestamp: '00:00:35',
    type: 'info',
  },
];
