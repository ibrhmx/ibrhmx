/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { MoonTerrain } from './Terrain';
import { RoverModel } from './RoverModel';
import { DustParticleSystem } from './DustParticleSystem';
import {
  CameraMode,
  DiscoverySite,
  DroneState,
  MissionObjective,
  RadioMessage,
  RoverTelemetry,
  RoverUpgrades,
} from '../types';
import { INITIAL_DISCOVERIES, INITIAL_OBJECTIVES, INITIAL_RADIO_MESSAGES } from './LoreData';
import { soundEngine } from '../audio/SoundEngine';

export class GameWorld {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  public terrain: MoonTerrain;
  public rover: RoverModel;
  public dustSystem: DustParticleSystem;

  // Sky & Lighting
  public sunLight: THREE.DirectionalLight;
  public earthMesh: THREE.Mesh;
  public earthAtmosphere: THREE.Mesh;
  public starPoints: THREE.Points;

  // Game State
  public discoveries: DiscoverySite[] = JSON.parse(JSON.stringify(INITIAL_DISCOVERIES));
  public objectives: MissionObjective[] = JSON.parse(JSON.stringify(INITIAL_OBJECTIVES));
  public radioMessages: RadioMessage[] = JSON.parse(JSON.stringify(INITIAL_RADIO_MESSAGES));

  public upgrades: RoverUpgrades = {
    solarEfficiency: 1,
    batteryCapacity: 1,
    thrusterPower: 1,
    lidarRange: 1,
    drillSpeed: 1,
    suspensionDamping: 1,
  };

  public telemetry: RoverTelemetry = {
    speedKmh: 0,
    battery: 100,
    solarInput: 0,
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
  };

  public droneState: DroneState = {
    active: false,
    battery: 100,
    altitude: 15,
    distanceFromRover: 0,
    maxRange: 180,
  };

  public cameraMode: CameraMode = 'CHASE';

  // Rover Physics variables
  public roverPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public roverVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public roverRotation: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  public roverHeading: number = 0; // radians
  public isGrounded: boolean = true;
  public currentSpeed: number = 0;
  public steerAngle: number = 0;
  private totalDistanceTraveled: number = 0;

  // Drone 3D Object
  public droneGroup: THREE.Group;
  public dronePos: THREE.Vector3 = new THREE.Vector3(0, 5, 0);
  public droneVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Input states
  public keys: { [key: string]: boolean } = {};
  private clock: THREE.Clock;
  private animFrameId: number | null = null;
  private isDestroyed: boolean = false;

  // Discovery Visual Objects
  private anomalyVisualGroups: Map<string, THREE.Group> = new Map();

  // Callbacks for UI updates
  public onTelemetryUpdate?: (telemetry: RoverTelemetry) => void;
  public onDiscoveryInspected?: (discovery: DiscoverySite) => void;
  public onRadioMessageAdded?: (msg: RadioMessage) => void;
  public onObjectiveCompleted?: (obj: MissionObjective) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Setup Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020205); // Deep cosmos black

    this.camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    container.appendChild(this.renderer.domElement);

    // 2. Cosmic Skybox & Celestial Bodies
    this.setupCosmos();

    // 3. Lighting (Harsh Direct Sunlight & Earthshine)
    const sunDir = new THREE.Vector3(0.7, 0.4, -0.6).normalize();
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 3.8);
    this.sunLight.position.copy(sunDir.clone().multiplyScalar(150));
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 350;
    const d = 120;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Subtle Earthshine ambient fill light (Soft Blue reflection from Earth in sky)
    const earthshineLight = new THREE.DirectionalLight(0x2563eb, 0.35);
    earthshineLight.position.set(-50, 80, 50);
    this.scene.add(earthshineLight);

    const ambientFill = new THREE.AmbientLight(0x0a0c14, 0.25);
    this.scene.add(ambientFill);

    // 4. Terrain & Rocks
    this.terrain = new MoonTerrain();
    this.scene.add(this.terrain.mesh);
    this.terrain.rocks.forEach((rock) => this.scene.add(rock));

    // 5. Rover Model
    this.rover = new RoverModel();
    this.scene.add(this.rover.group);

    // Initial position on flat crater floor
    const initialH = this.terrain.getHeightAt(0, 0);
    this.roverPos.set(0, initialH + 0.38, 0);
    this.rover.group.position.copy(this.roverPos);

    // 6. Dust Particle System
    this.dustSystem = new DustParticleSystem();
    this.scene.add(this.dustSystem.group);

    // 7. Build 3D Visual Sites for Discoveries
    this.buildDiscoverySites();

    // 8. Build Deployable Drone
    this.droneGroup = this.buildDroneModel();
    this.droneGroup.visible = false;
    this.scene.add(this.droneGroup);

    // Setup input listeners & window resize
    this.bindEvents();

    // Start Main Simulation Loop
    this.animate();
  }

  private setupCosmos() {
    // 1. Starfield (2,500 high-clarity celestial stars)
    const starCount = 2800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 900 + Math.random() * 100;

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi);
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Star color temperatures (Blue giants, white mains, amber dwarfs)
      const cType = Math.random();
      if (cType > 0.85) {
        starColors[i * 3] = 0.75;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 1.0; // Blue-white
      } else if (cType > 0.65) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 0.65; // Amber
      } else {
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 0.98; // Pure White
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    this.starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starPoints);

    // 2. Photorealistic Earth in Lunar Sky
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-350, 420, -500);

    const earthGeo = new THREE.SphereGeometry(75, 48, 48);

    // Procedural Earth surface canvas
    const eCanvas = document.createElement('canvas');
    eCanvas.width = 1024;
    eCanvas.height = 512;
    const eCtx = eCanvas.getContext('2d')!;

    // Deep ocean blue
    eCtx.fillStyle = '#0f3854';
    eCtx.fillRect(0, 0, 1024, 512);

    // Continents
    eCtx.fillStyle = '#2d5a27';
    eCtx.beginPath();
    eCtx.arc(320, 200, 120, 0, Math.PI * 2);
    eCtx.fill();
    eCtx.beginPath();
    eCtx.arc(580, 240, 90, 0, Math.PI * 2);
    eCtx.fill();
    eCtx.beginPath();
    eCtx.arc(750, 280, 70, 0, Math.PI * 2);
    eCtx.fill();

    // Swirling white weather clouds
    eCtx.fillStyle = 'rgba(245, 250, 255, 0.65)';
    for (let c = 0; c < 35; c++) {
      const cx = (c * 60) % 1024;
      const cy = 100 + Math.sin(c * 0.8) * 160;
      eCtx.beginPath();
      eCtx.ellipse(cx, cy, 70 + (c % 4) * 20, 25 + (c % 3) * 15, c * 0.2, 0, Math.PI * 2);
      eCtx.fill();
    }

    const earthTexture = new THREE.CanvasTexture(eCanvas);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.5,
      metalness: 0.1,
    });

    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthMesh.rotation.y = 0.5;
    this.earthMesh.rotation.x = 0.3;
    earthGroup.add(this.earthMesh);

    // Rayleigh Blue Atmospheric Glow Layer
    const atmosGeo = new THREE.SphereGeometry(78, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
    this.earthAtmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(this.earthAtmosphere);

    this.scene.add(earthGroup);
  }

  private buildDiscoverySites() {
    this.discoveries.forEach((d) => {
      const group = new THREE.Group();
      const y = this.terrain.getHeightAt(d.x, d.z);
      group.position.set(d.x, y, d.z);

      if (d.type === 'APOLLO_RELIC') {
        // Apollo 11 Lunar Descent Stage
        const landerMat = new THREE.MeshStandardMaterial({
          color: 0xdfa010, // Kapton Gold
          metalness: 0.95,
          roughness: 0.2,
        });
        const strutMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

        // Octagonal Core
        const core = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.7, 1.8, 8), landerMat);
        core.position.y = 1.6;
        core.castShadow = true;
        group.add(core);

        // Rocket Engine Bell
        const engine = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 16), strutMat);
        engine.position.y = 0.7;
        engine.rotation.x = Math.PI;
        group.add(engine);

        // 4 Landing Gear Legs & Pads
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2 + Math.PI / 4;
          const leg = new THREE.Group();
          leg.rotation.y = angle;

          const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8), strutMat);
          strut.position.set(0, 1.1, 2.0);
          strut.rotation.x = 0.75;
          leg.add(strut);

          const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.1, 12), landerMat);
          pad.position.set(0, 0.05, 3.2);
          leg.add(pad);

          group.add(leg);
        }

        // American Flag on Mast
        const flagMast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), strutMat);
        flagMast.position.set(5.0, 1.25, 2.0);
        group.add(flagMast);

        const flagCloth = new THREE.Mesh(
          new THREE.PlaneGeometry(1.4, 0.9),
          new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.9, side: THREE.DoubleSide })
        );
        flagCloth.position.set(5.7, 2.0, 2.0);
        flagCloth.rotation.y = 0.3;
        group.add(flagCloth);
      } else if (d.type === 'MONOLITH_STRUCTURE') {
        // Mysterious Precursor 1:4:9 Obelisk
        const monolithMat = new THREE.MeshStandardMaterial({
          color: 0x050508,
          roughness: 0.05,
          metalness: 0.98,
        });
        const monolith = new THREE.Mesh(new THREE.BoxGeometry(2.5, 22.5, 10.0), monolithMat);
        monolith.position.y = 11.25;
        monolith.castShadow = true;
        monolith.receiveShadow = true;
        group.add(monolith);

        // Pulsing zero-entropy aura light
        const auraLight = new THREE.PointLight(0xa855f7, 4.0, 25);
        auraLight.position.set(0, 4.0, 0);
        group.add(auraLight);
      } else if (d.type === 'WATER_ICE') {
        // Translucent blue crystalline formations
        const iceMat = new THREE.MeshPhysicalMaterial({
          color: 0x93c5fd,
          transmission: 0.85,
          opacity: 0.9,
          transparent: true,
          roughness: 0.1,
          ior: 1.31,
        });

        for (let i = 0; i < 9; i++) {
          const crystal = new THREE.Mesh(
            new THREE.ConeGeometry(0.5 + Math.random() * 0.4, 2.5 + Math.random() * 2.0, 6),
            iceMat
          );
          crystal.position.set((Math.random() - 0.5) * 6.0, 1.2, (Math.random() - 0.5) * 6.0);
          crystal.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI, (Math.random() - 0.5) * 0.4);
          crystal.castShadow = true;
          group.add(crystal);
        }

        const iceGlow = new THREE.PointLight(0x38bdf8, 2.5, 18);
        iceGlow.position.set(0, 1.5, 0);
        group.add(iceGlow);
      } else if (d.type === 'HELIUM_3') {
        // Luminescent Ilmenite Mineral Cluster
        const oreMat = new THREE.MeshStandardMaterial({
          color: 0x2563eb,
          roughness: 0.3,
          metalness: 0.8,
          emissive: 0x1d4ed8,
          emissiveIntensity: 0.6,
        });
        for (let i = 0; i < 7; i++) {
          const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.6), oreMat);
          rock.position.set((Math.random() - 0.5) * 5.0, 0.6, (Math.random() - 0.5) * 5.0);
          rock.castShadow = true;
          group.add(rock);
        }
      } else if (d.type === 'PYROCLASTIC_GLASS') {
        // Orange volcanic pyroclastic mound
        const glassMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          roughness: 0.6,
          metalness: 0.4,
          emissive: 0xea580c,
          emissiveIntensity: 0.3,
        });
        const mound = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), glassMat);
        mound.position.y = 0;
        mound.scale.set(1.5, 0.4, 1.5);
        group.add(mound);
      } else {
        // Derelict probe / Meteorite
        const probeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });
        const probe = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5), probeMat);
        probe.position.y = 0.9;
        probe.castShadow = true;
        group.add(probe);
      }

      // Holographic Science Discovery Beacon Ring
      const beaconRingGeo = new THREE.RingGeometry(d.radius * 0.9, d.radius, 32);
      beaconRingGeo.rotateX(-Math.PI / 2);
      const beaconRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
      beaconRing.position.y = 0.15;
      group.add(beaconRing);

      this.scene.add(group);
      this.anomalyVisualGroups.set(d.id, group);
    });
  }

  private buildDroneModel(): THREE.Group {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });

    // Center Chassis
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.6), bodyMat);
    body.castShadow = true;
    group.add(body);

    // 4 Thruster Rotor Pods
    const armOffsets = [
      new THREE.Vector3(-0.45, 0, 0.45),
      new THREE.Vector3(0.45, 0, 0.45),
      new THREE.Vector3(-0.45, 0, -0.45),
      new THREE.Vector3(0.45, 0, -0.45),
    ];

    armOffsets.forEach((pos) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 20), rotorMat);
      ring.position.copy(pos);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    });

    // Drone Downward Sensor Spot
    const spot = new THREE.SpotLight(0x38bdf8, 3.5, 30, Math.PI / 4, 0.3);
    spot.position.set(0, -0.1, 0);
    const target = new THREE.Object3D();
    target.position.set(0, -10, 0);
    group.add(target);
    spot.target = target;
    group.add(spot);

    return group;
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    soundEngine.init();
    soundEngine.resume();

    this.keys[e.code] = true;

    if (e.code === 'KeyF') {
      // Toggle Headlights
      this.telemetry.headlightsOn = !this.telemetry.headlightsOn;
      this.rover.setHeadlights(this.telemetry.headlightsOn);
      soundEngine.playUiClick();
    } else if (e.code === 'KeyV') {
      // Cycle Camera Mode
      const modes: CameraMode[] = ['CHASE', 'COCKPIT', 'ORBIT', 'DRONE'];
      const nextIdx = (modes.indexOf(this.cameraMode) + 1) % modes.length;
      this.setCameraMode(modes[nextIdx]);
      soundEngine.playUiClick();
    } else if (e.code === 'KeyL') {
      // Toggle LiDAR Mode
      this.telemetry.lidarActive = !this.telemetry.lidarActive;
      soundEngine.playUiClick();
    } else if (e.code === 'KeyR') {
      // Toggle Surface Drill
      this.toggleDrilling();
    } else if (e.code === 'Tab') {
      e.preventDefault();
      // Toggle Survey Drone Launch
      this.toggleDrone();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private handleResize = () => {
    if (!this.container || this.isDestroyed) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    if (mode === 'DRONE' && !this.droneState.active) {
      this.droneState.active = true;
      this.droneGroup.visible = true;
      this.dronePos.copy(this.roverPos).add(new THREE.Vector3(0, 8, 0));
    }
  }

  public toggleDrilling() {
    this.telemetry.drilling = !this.telemetry.drilling;
    soundEngine.setDrill(this.telemetry.drilling);
  }

  public toggleDrone() {
    this.droneState.active = !this.droneState.active;
    this.droneGroup.visible = this.droneState.active;
    if (this.droneState.active) {
      this.dronePos.copy(this.roverPos).add(new THREE.Vector3(0, 10, 0));
      this.cameraMode = 'DRONE';
      this.addRadioMessage('DRONE-1', 'SCOUT', 'Micro-survey drone deployed. Aerial reconnaissance operational.', 'info');
    } else {
      this.cameraMode = 'CHASE';
      this.addRadioMessage('DRONE-1', 'SCOUT', 'Micro-survey drone docked in rover telemetry bay.', 'info');
    }
    soundEngine.playUiClick();
  }

  public addRadioMessage(sender: string, callsign: string, text: string, type: 'info' | 'alert' | 'discovery' | 'lore') {
    const msg: RadioMessage = {
      id: 'msg-' + Date.now() + Math.random(),
      sender,
      callsign,
      text,
      timestamp: new Date().toISOString().substring(11, 19),
      type,
    };
    this.radioMessages.unshift(msg);
    if (this.radioMessages.length > 25) this.radioMessages.pop();
    soundEngine.playRadioBeep();
    if (this.onRadioMessageAdded) this.onRadioMessageAdded(msg);
  }

  private updateRoverPhysics(delta: number) {
    const maxThrottleSpeed = 16.0; // km/h max ground speed in loose sand
    const maxSpeedMs = maxThrottleSpeed / 3.6;
    const accelRate = 3.5;
    const brakeRate = 5.0;
    const steerSpeed = 2.4;
    const maxSteerAngle = 0.55; // radians

    // Steering input (A / D or Left / Right)
    let steerInput = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) steerInput += 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) steerInput -= 1;

    this.steerAngle = THREE.MathUtils.lerp(
      this.steerAngle,
      steerInput * maxSteerAngle,
      delta * steerSpeed * 4.0
    );

    // Throttle input (W / S or Up / Down)
    let throttle = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) throttle += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) throttle -= 0.6; // Reverse

    // Check battery level
    if (this.telemetry.battery <= 0) throttle = 0;

    // Ground traction & motor acceleration
    const isAccelerating = Math.abs(throttle) > 0.05;
    if (this.isGrounded) {
      if (throttle !== 0) {
        this.currentSpeed += throttle * accelRate * delta;
        this.currentSpeed = Math.max(-maxSpeedMs * 0.5, Math.min(maxSpeedMs, this.currentSpeed));
        // Battery drain from traction motors
        this.telemetry.battery = Math.max(0, this.telemetry.battery - delta * 0.45);
      } else {
        // Regolith sand rolling resistance
        this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, 0, delta * brakeRate);
      }

      // Rotate heading based on steering & forward velocity
      if (Math.abs(this.currentSpeed) > 0.1) {
        const turnDirection = this.currentSpeed > 0 ? 1 : -1;
        this.roverHeading += this.steerAngle * turnDirection * delta * 1.8;
      }
    }

    // Cold-Gas RCS Thruster Boost (Spacebar Jump)
    let thrusterActive = false;
    if (this.keys['Space'] && this.telemetry.thrusterFuel > 0) {
      thrusterActive = true;
      const boostForce = 4.8 + this.upgrades.thrusterPower * 0.8;
      this.roverVel.y += boostForce * delta;
      this.telemetry.thrusterFuel = Math.max(0, this.telemetry.thrusterFuel - delta * 30.0);
      this.dustSystem.emitThrusterPlume(this.roverPos);
    } else {
      // Slowly recharge thruster accumulator
      this.telemetry.thrusterFuel = Math.min(100, this.telemetry.thrusterFuel + delta * 8.0);
    }
    this.rover.setThrusterActive(thrusterActive);
    soundEngine.setThruster(thrusterActive);

    // Forward direction vector
    const forward = new THREE.Vector3(
      Math.sin(this.roverHeading),
      0,
      Math.cos(this.roverHeading)
    ).normalize();

    // Apply horizontal velocity
    if (this.isGrounded) {
      this.roverVel.x = forward.x * this.currentSpeed;
      this.roverVel.z = forward.z * this.currentSpeed;
    } else {
      // Vacuum ballistic coasting with minimal air drag (0 drag)
      this.roverVel.x = THREE.MathUtils.lerp(this.roverVel.x, forward.x * this.currentSpeed, delta * 0.5);
      this.roverVel.z = THREE.MathUtils.lerp(this.roverVel.z, forward.z * this.currentSpeed, delta * 0.5);
    }

    // Lunar Gravity (1.62 m/s^2)
    const lunarG = 1.62;
    this.roverVel.y -= lunarG * delta;

    // Integrate Position
    this.roverPos.x += this.roverVel.x * delta;
    this.roverPos.y += this.roverVel.y * delta;
    this.roverPos.z += this.roverVel.z * delta;

    // Track total distance traveled
    const horizontalDist = Math.hypot(this.roverVel.x * delta, this.roverVel.z * delta);
    this.totalDistanceTraveled += horizontalDist;
    this.updateObjectiveProgress('obj-survey-drive', this.totalDistanceTraveled);

    // Ground Collision & Suspension Alignment with Lunar Heightmap
    const terrainHeight = this.terrain.getHeightAt(this.roverPos.x, this.roverPos.z);
    const rideHeight = 0.38;

    if (this.roverPos.y <= terrainHeight + rideHeight) {
      if (!this.isGrounded && Math.abs(this.roverVel.y) > 2.0) {
        soundEngine.playImpactSound(Math.abs(this.roverVel.y));
        // Hard landing hull stress
        if (Math.abs(this.roverVel.y) > 6.5) {
          const dmg = (Math.abs(this.roverVel.y) - 6.5) * 4.0;
          this.telemetry.hullIntegrity = Math.max(0, this.telemetry.hullIntegrity - dmg);
          this.addRadioMessage('ALERT', 'IMPACT', `Hard landing detected! Hull integrity reduced by ${dmg.toFixed(1)}%`, 'alert');
        }
      }

      this.roverPos.y = terrainHeight + rideHeight;
      this.roverVel.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Rock Obstacle Collisions
    for (const rock of this.terrain.rockColliders) {
      const dx = this.roverPos.x - rock.x;
      const dz = this.roverPos.z - rock.z;
      const dist = Math.hypot(dx, dz);
      const minDistance = rock.radius + 1.2;

      if (dist < minDistance && dist > 0.01) {
        // Elastic deflection
        const pushX = (dx / dist) * (minDistance - dist);
        const pushZ = (dz / dist) * (minDistance - dist);
        this.roverPos.x += pushX;
        this.roverPos.z += pushZ;
        this.currentSpeed *= -0.3; // Rebound recoil
        soundEngine.playImpactSound(3.0);
      }
    }

    // Update Rover Mesh Orientation (Align with Terrain Surface Normal)
    const normal = this.terrain.getNormalAt(this.roverPos.x, this.roverPos.z);
    const up = this.isGrounded ? normal : new THREE.Vector3(0, 1, 0);

    const lookTarget = this.roverPos.clone().add(forward);
    const m = new THREE.Matrix4();
    m.lookAt(this.roverPos, lookTarget, up);
    this.rover.group.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(m), delta * 8.0);
    this.rover.group.position.copy(this.roverPos);

    // Compute Pitch & Roll Telemetry in Degrees
    const euler = new THREE.Euler().setFromQuaternion(this.rover.group.quaternion, 'YXZ');
    this.telemetry.pitchDeg = Math.round(THREE.MathUtils.radToDeg(euler.x));
    this.telemetry.rollDeg = Math.round(THREE.MathUtils.radToDeg(euler.z));
    this.telemetry.headingDeg = Math.round(((THREE.MathUtils.radToDeg(this.roverHeading) % 360) + 360) % 360);
    this.telemetry.altitudeMeters = Math.round(this.roverPos.y);

    // Emit Regolith Dust from 6 wheels
    if (this.isGrounded && Math.abs(this.currentSpeed) > 0.4) {
      this.rover.wheels.forEach((w) => {
        const wheelWorldPos = new THREE.Vector3();
        w.mesh.getWorldPosition(wheelWorldPos);
        this.dustSystem.emitWheelDust(wheelWorldPos, this.currentSpeed, forward);
      });
    }

    // Update Wheel Animations
    this.rover.updateWheelAnimation(this.currentSpeed, this.steerAngle, delta);

    // Update Motor Sound
    const speedRatio = Math.min(1.0, Math.abs(this.currentSpeed) / maxSpeedMs);
    soundEngine.updateRoverSound(speedRatio, isAccelerating, this.isGrounded);
  }

  private updateDronePhysics(delta: number) {
    if (!this.droneState.active) return;

    const droneSpeed = 18.0;
    const moveDir = new THREE.Vector3();

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveDir.z += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveDir.z -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir.x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.x += 1;
    if (this.keys['Space']) moveDir.y += 1;
    if (this.keys['ShiftLeft'] || this.keys['KeyC']) moveDir.y -= 1;

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      this.dronePos.addScaledVector(moveDir, droneSpeed * delta);
      this.droneState.battery = Math.max(0, this.droneState.battery - delta * 1.2);
    }

    // Distance from rover limit check
    const distToRover = this.dronePos.distanceTo(this.roverPos);
    this.droneState.distanceFromRover = Math.round(distToRover);
    this.droneState.altitude = Math.round(this.dronePos.y - this.terrain.getHeightAt(this.dronePos.x, this.dronePos.z));

    if (distToRover > this.droneState.maxRange) {
      const clampDir = this.dronePos.clone().sub(this.roverPos).normalize();
      this.dronePos.copy(this.roverPos).add(clampDir.multiplyScalar(this.droneState.maxRange));
    }

    this.droneGroup.position.copy(this.dronePos);
  }

  private updateThermodynamicsAndSolar(delta: number) {
    const sunDir = this.sunLight.position.clone().normalize();
    const inSunlight = this.terrain.isPointInSunlight(this.roverPos.x, this.roverPos.y, this.roverPos.z, sunDir);

    this.telemetry.inDirectSunlight = inSunlight;

    if (inSunlight) {
      // Solar panel charging: 0 to 100% based on efficiency upgrade
      const chargeRate = 0.8 + this.upgrades.solarEfficiency * 0.45;
      this.telemetry.solarInput = 85;
      this.telemetry.battery = Math.min(100, this.telemetry.battery + delta * chargeRate);

      // Sunlit side warms up to +110°C
      this.telemetry.temperatureCelsius = THREE.MathUtils.lerp(this.telemetry.temperatureCelsius, 105, delta * 0.05);
    } else {
      // Permanent crater shadow: zero solar power, cools down to -145°C
      this.telemetry.solarInput = 0;
      this.telemetry.temperatureCelsius = THREE.MathUtils.lerp(this.telemetry.temperatureCelsius, -145, delta * 0.08);
    }
  }

  private updateGPRAndDiscoveries(delta: number) {
    let closestDist = Infinity;
    let closestSite: DiscoverySite | null = null;

    this.discoveries.forEach((d) => {
      const dist = Math.hypot(this.roverPos.x - d.x, this.roverPos.z - d.z);

      if (dist < closestDist) {
        closestDist = dist;
        closestSite = d;
      }

      // Detection & Proximity Trigger
      if (dist < d.radius + 3.0) {
        if (!d.discovered) {
          d.discovered = true;
          this.telemetry.sciencePoints += d.scientificValue;
          soundEngine.playDiscoveryChime();
          this.addRadioMessage(
            'SELENE-AI',
            'RADAR',
            `NEW SITE DISCOVERED: ${d.name} (${d.title}). Scientific yield: +${d.scientificValue} SP`,
            'discovery'
          );

          // Update associated mission objective
          const matchingObj = this.objectives.find((obj) => obj.targetAnomalyId === d.id);
          if (matchingObj && !matchingObj.completed) {
            matchingObj.completed = true;
            this.telemetry.sciencePoints += matchingObj.rewardPoints;
            if (this.onObjectiveCompleted) this.onObjectiveCompleted(matchingObj);
          }

          if (this.onDiscoveryInspected) this.onDiscoveryInspected(d);
        }
      }
    });

    if (closestSite) {
      this.telemetry.gprDistanceToNearestAnomaly = Math.round(closestDist);
      this.telemetry.nearestAnomalyName = (closestSite as DiscoverySite).name;
      this.telemetry.nearestAnomalyType = (closestSite as DiscoverySite).type;

      // Signal strength increases sharply as rover approaches within 100 meters
      const signal = Math.max(0, Math.min(1.0, 1.0 - closestDist / 100.0));
      this.telemetry.gprSignalStrength = signal;

      // Geiger counter clicks near Monolith or radioactive areas
      if ((closestSite as DiscoverySite).type === 'MONOLITH_STRUCTURE' && closestDist < 45) {
        if (Math.random() < 0.25) soundEngine.playGeigerClick();
      }
    }

    // Core Drill progress if drilling near an anomaly
    if (this.telemetry.drilling) {
      this.rover.animateDrill(true, delta);
      const drillPos = this.roverPos.clone().add(new THREE.Vector3(0, 0, 1.4));
      this.dustSystem.emitDrillDust(drillPos);

      if (closestSite && closestDist < (closestSite as DiscoverySite).radius + 2.0) {
        if (!(closestSite as DiscoverySite).sampleRetrieved) {
          (closestSite as DiscoverySite).sampleRetrieved = true;
          this.telemetry.samplesCollectedCount += 1;
          this.telemetry.sciencePoints += 250;
          soundEngine.playDiscoveryChime();
          this.addRadioMessage(
            'GEOLOGY LAB',
            'SAMPLE',
            `Core sample extracted from ${(closestSite as DiscoverySite).name}. Regolith canister sealed.`,
            'discovery'
          );
        }
      }
    } else {
      this.rover.animateDrill(false, delta);
    }
  }

  public updateObjectiveProgress(objId: string, progress: number) {
    const obj = this.objectives.find((o) => o.id === objId);
    if (obj && !obj.completed && obj.maxProgress) {
      obj.progress = Math.min(obj.maxProgress, Math.round(progress));
      if (obj.progress >= obj.maxProgress) {
        obj.completed = true;
        this.telemetry.sciencePoints += obj.rewardPoints;
        soundEngine.playDiscoveryChime();
        this.addRadioMessage('MISSION CONTROL', 'OBJECTIVE', `MISSION COMPLETED: ${obj.title} (+${obj.rewardPoints} SP)`, 'info');
        if (this.onObjectiveCompleted) this.onObjectiveCompleted(obj);
      }
    }
  }

  private updateCamera(delta: number) {
    const forward = new THREE.Vector3(Math.sin(this.roverHeading), 0, Math.cos(this.roverHeading)).normalize();

    if (this.cameraMode === 'CHASE') {
      // Third-Person Chase Cam (Behind and above rover)
      const targetCamPos = this.roverPos.clone()
        .sub(forward.clone().multiplyScalar(6.5))
        .add(new THREE.Vector3(0, 3.2, 0));

      this.camera.position.lerp(targetCamPos, delta * 6.0);
      const lookAtPos = this.roverPos.clone().add(new THREE.Vector3(0, 1.2, 0));
      this.camera.lookAt(lookAtPos);
    } else if (this.cameraMode === 'COCKPIT') {
      // First-person mast stereoscopic science camera
      const mastWorldPos = new THREE.Vector3();
      this.rover.mastGroup.getWorldPosition(mastWorldPos);
      this.camera.position.copy(mastWorldPos).add(new THREE.Vector3(0, 0.25, 0));

      const lookAhead = mastWorldPos.clone().add(forward.clone().multiplyScalar(20.0)).add(new THREE.Vector3(0, -0.5, 0));
      this.camera.lookAt(lookAhead);
    } else if (this.cameraMode === 'ORBIT') {
      // Cinematic orbit discovery camera
      const time = Date.now() * 0.0003;
      const orbitRadius = 12.0;
      this.camera.position.set(
        this.roverPos.x + Math.sin(time) * orbitRadius,
        this.roverPos.y + 5.5,
        this.roverPos.z + Math.cos(time) * orbitRadius
      );
      this.camera.lookAt(this.roverPos.clone().add(new THREE.Vector3(0, 1.0, 0)));
    } else if (this.cameraMode === 'DRONE') {
      // Aerial micro-drone FPV camera
      this.camera.position.copy(this.dronePos);
      const droneForward = new THREE.Vector3(0, -0.6, 1.0).normalize();
      this.camera.lookAt(this.dronePos.clone().add(droneForward.multiplyScalar(25.0)));
    }
  }

  private animate = () => {
    if (this.isDestroyed) return;

    this.animFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Update Rover Physics
    this.updateRoverPhysics(delta);

    // 2. Update Drone Physics
    this.updateDronePhysics(delta);

    // 3. Update Dust & Particle System
    this.dustSystem.update(delta, (x, z) => this.terrain.getHeightAt(x, z));

    // 4. Thermodynamics & Solar charging
    this.updateThermodynamicsAndSolar(delta);

    // 5. Radar, Discoveries & Drilling
    this.updateGPRAndDiscoveries(delta);

    // 6. Camera Position
    this.updateCamera(delta);

    // 7. Update Telemetry state
    this.telemetry.speedKmh = Math.round(Math.abs(this.currentSpeed * 3.6) * 10) / 10;
    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({ ...this.telemetry });
    }

    // 8. Slowly rotate Earth in sky
    if (this.earthMesh) {
      this.earthMesh.rotation.y += delta * 0.015;
    }

    // 9. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  };

  public applyUpgrade(type: keyof RoverUpgrades) {
    const cost = this.upgrades[type] * 350;
    if (this.telemetry.sciencePoints >= cost && this.upgrades[type] < 5) {
      this.telemetry.sciencePoints -= cost;
      this.upgrades[type] += 1;
      soundEngine.playDiscoveryChime();
      this.addRadioMessage('ENGINEERING', 'UPGRADE', `SYSTEM UPGRADED: ${type} now at Level ${this.upgrades[type]}!`, 'info');
      return true;
    }
    return false;
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);

    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
