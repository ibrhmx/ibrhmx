/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export interface Crater {
  x: number;
  z: number;
  radius: number;
  depth: number;
  rimHeight: number;
  hasCentralPeak?: boolean;
}

export class MoonTerrain {
  public mesh: THREE.Mesh;
  public geometry: THREE.PlaneGeometry;
  public material: THREE.MeshStandardMaterial;
  private noise2D: (x: number, y: number) => number;
  private size: number = 400; // 400x400 meters playable area
  private resolution: number = 220; // 220x220 vertices for high terrain fidelity
  private craters: Crater[] = [];
  public rocks: THREE.Mesh[] = [];
  public rockColliders: { x: number; z: number; radius: number; height: number }[] = [];

  // Track decal canvas for photorealistic wheel impressions
  private trackCanvas: HTMLCanvasElement;
  private trackCtx: CanvasRenderingContext2D;
  private trackTexture: THREE.CanvasTexture;

  constructor() {
    this.noise2D = createNoise2D();

    // Define craters
    this.craters = [
      { x: 0, z: 0, radius: 25, depth: 3.5, rimHeight: 1.2 }, // Central landing basin
      { x: 45, z: -60, radius: 35, depth: 5.0, rimHeight: 1.6, hasCentralPeak: true }, // Apollo 11 Tranquility site
      { x: -85, z: 110, radius: 55, depth: 14.0, rimHeight: 3.8 }, // Deep Shackleton Ice Crater
      { x: 120, z: -30, radius: 28, depth: 4.2, rimHeight: 1.3 }, // Shorty Pyroclastic Crater
      { x: -110, z: -80, radius: 40, depth: 6.5, rimHeight: 2.0 }, // Mare Basin
      { x: 0, z: 160, radius: 45, depth: 9.0, rimHeight: 2.5 }, // Monolith Valley
      { x: -30, z: -140, radius: 32, depth: 4.8, rimHeight: 1.5 }, // Surveyor Crater
      { x: 140, z: 90, radius: 36, depth: 7.0, rimHeight: 2.2, hasCentralPeak: true }, // Kinetic Crater
      // Micro-craters
      { x: 20, z: 30, radius: 8, depth: 1.5, rimHeight: 0.4 },
      { x: -40, z: 25, radius: 12, depth: 2.0, rimHeight: 0.6 },
      { x: 70, z: 60, radius: 15, depth: 2.8, rimHeight: 0.8 },
      { x: -60, z: -40, radius: 10, depth: 1.8, rimHeight: 0.5 },
      { x: 90, z: -110, radius: 18, depth: 3.0, rimHeight: 0.9 },
      { x: -130, z: 30, radius: 22, depth: 3.5, rimHeight: 1.0 },
    ];

    // Build Track Canvas
    this.trackCanvas = document.createElement('canvas');
    this.trackCanvas.width = 1024;
    this.trackCanvas.height = 1024;
    this.trackCtx = this.trackCanvas.getContext('2d')!;
    this.trackCtx.fillStyle = '#808080'; // Neutral normal base
    this.trackCtx.fillRect(0, 0, 1024, 1024);
    this.trackTexture = new THREE.CanvasTexture(this.trackCanvas);
    this.trackTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.trackTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Create high-detail procedural lunar regolith texture
    const { diffuseMap, normalMap, roughnessMap } = this.generateProceduralRegolithTextures();

    // Create Terrain Geometry
    this.geometry = new THREE.PlaneGeometry(this.size, this.size, this.resolution, this.resolution);
    this.geometry.rotateX(-Math.PI / 2);

    // Displace vertices with multi-frequency noise & craters
    const pos = this.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = this.calculateHeight(x, z);
      pos.setY(i, y);
    }
    this.geometry.computeVertexNormals();

    this.material = new THREE.MeshStandardMaterial({
      map: diffuseMap,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughnessMap: roughnessMap,
      roughness: 0.92,
      metalness: 0.08,
      flatShading: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;

    // Generate scattered lunar boulders and impact ejecta rocks
    this.generateLunarBoulders();
  }

  public calculateHeight(x: number, z: number): number {
    // 1. Continental rolling hills / low frequency undulations
    let h = this.noise2D(x * 0.003, z * 0.003) * 6.5;
    h += this.noise2D(x * 0.012, z * 0.012) * 2.2;
    h += this.noise2D(x * 0.035, z * 0.035) * 0.7;
    h += this.noise2D(x * 0.1, z * 0.1) * 0.15; // micro-roughness

    // 2. Sculpt explicit impact craters
    for (const c of this.craters) {
      const dx = x - c.x;
      const dz = z - c.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < c.radius * 2.2) {
        const normDist = dist / c.radius;

        if (normDist <= 1.0) {
          // Inside crater bowl: Parabolic bowl excavation with flattened floor
          const bowl = Math.pow(normDist, 2.0) - 1.0;
          h += bowl * c.depth;

          // Central peak uplift in large craters
          if (c.hasCentralPeak && normDist < 0.25) {
            const peak = Math.cos(normDist * Math.PI * 2) * (c.depth * 0.45);
            h += Math.max(0, peak);
          }
        } else if (normDist > 1.0 && normDist < 2.2) {
          // Raised rim rampart and ejecta blanket
          const rimFactor = Math.sin(((normDist - 1.0) / 1.2) * Math.PI);
          const ejectaDecay = Math.pow(1.0 - (normDist - 1.0) / 1.2, 2.0);
          h += rimFactor * c.rimHeight * ejectaDecay;
        }
      }
    }

    return h;
  }

  public getHeightAt(x: number, z: number): number {
    return this.calculateHeight(x, z);
  }

  public getNormalAt(x: number, z: number): THREE.Vector3 {
    const delta = 0.2;
    const hL = this.getHeightAt(x - delta, z);
    const hR = this.getHeightAt(x + delta, z);
    const hD = this.getHeightAt(x, z - delta);
    const hU = this.getHeightAt(x, z + delta);

    const normal = new THREE.Vector3(hL - hR, 2 * delta, hD - hU);
    normal.normalize();
    return normal;
  }

  // Check if position is in direct sunlight (given sun direction)
  public isPointInSunlight(x: number, y: number, z: number, sunDir: THREE.Vector3): boolean {
    const stepSize = 4.0;
    const maxDistance = 120.0;
    let currX = x;
    let currY = y + 0.3; // slightly above terrain
    let currZ = z;

    for (let d = stepSize; d < maxDistance; d += stepSize) {
      currX += sunDir.x * stepSize;
      currY += sunDir.y * stepSize;
      currZ += sunDir.z * stepSize;

      const terrainH = this.getHeightAt(currX, currZ);
      if (terrainH > currY) {
        return false; // occluded by a crater rim or hill!
      }
    }
    return true;
  }

  private generateLunarBoulders() {
    const rockCount = 140;
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x8a8a8e,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });

    for (let i = 0; i < rockCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 15 + Math.random() * 180;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = this.getHeightAt(x, z);

      // Random scale (0.5m to 2.8m boulders)
      const scaleX = 0.5 + Math.random() * 2.0;
      const scaleY = 0.4 + Math.random() * 1.5;
      const scaleZ = 0.5 + Math.random() * 2.0;

      // Distorted icosahedron geometry for realistic angular lunar fracture rock
      const geo = new THREE.DodecahedronGeometry(1.0, 1);
      const pos = geo.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const vx = pos.getX(j);
        const vy = pos.getY(j);
        const vz = pos.getZ(j);
        const deform = 1.0 + (Math.random() * 0.35 - 0.175);
        pos.setXYZ(j, vx * deform * scaleX, vy * deform * scaleY, vz * deform * scaleZ);
      }
      geo.computeVertexNormals();

      const rock = new THREE.Mesh(geo, rockMat);
      rock.position.set(x, y + scaleY * 0.4, z);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.castShadow = true;
      rock.receiveShadow = true;

      this.rocks.push(rock);
      this.rockColliders.push({
        x,
        z,
        radius: Math.max(scaleX, scaleZ) * 0.9,
        height: scaleY * 1.8,
      });
    }
  }

  private generateProceduralRegolithTextures(): {
    diffuseMap: THREE.CanvasTexture;
    normalMap: THREE.CanvasTexture;
    roughnessMap: THREE.CanvasTexture;
  } {
    const size = 1024;

    // Diffuse / Albedo
    const cDiff = document.createElement('canvas');
    cDiff.width = size;
    cDiff.height = size;
    const ctxDiff = cDiff.getContext('2d')!;

    // Normal Map Canvas
    const cNorm = document.createElement('canvas');
    cNorm.width = size;
    cNorm.height = size;
    const ctxNorm = cNorm.getContext('2d')!;

    // Roughness Map Canvas
    const cRough = document.createElement('canvas');
    cRough.width = size;
    cRough.height = size;
    const ctxRough = cRough.getContext('2d')!;

    const imgDataDiff = ctxDiff.createImageData(size, size);
    const dataDiff = imgDataDiff.data;

    const imgDataNorm = ctxNorm.createImageData(size, size);
    const dataNorm = imgDataNorm.data;

    const imgDataRough = ctxRough.createImageData(size, size);
    const dataRough = imgDataRough.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;

        // Multi-octave regolith grain noise
        const nx = x / size;
        const ny = y / size;
        const n1 = this.noise2D(nx * 12, ny * 12);
        const n2 = this.noise2D(nx * 48, ny * 48);
        const n3 = this.noise2D(nx * 128, ny * 128);

        const composite = n1 * 0.5 + n2 * 0.35 + n3 * 0.15;
        // Lunar albedo: avg 0.12 (dark grey with slight warm/cool mineral variance)
        const baseGrey = 135 + Math.floor(composite * 55);
        const r = Math.max(50, Math.min(240, baseGrey + Math.floor(n2 * 8)));
        const g = Math.max(50, Math.min(240, baseGrey + Math.floor(n3 * 6)));
        const b = Math.max(50, Math.min(240, baseGrey + 4));

        dataDiff[idx] = r;
        dataDiff[idx + 1] = g;
        dataDiff[idx + 2] = b;
        dataDiff[idx + 3] = 255;

        // Normal map approximation (tangent space)
        const dX = (this.noise2D((nx + 0.005) * 64, ny * 64) - this.noise2D((nx - 0.005) * 64, ny * 64)) * 120;
        const dY = (this.noise2D(nx * 64, (ny + 0.005) * 64) - this.noise2D(nx * 64, (ny - 0.005) * 64)) * 120;
        dataNorm[idx] = Math.max(0, Math.min(255, 128 + dX));
        dataNorm[idx + 1] = Math.max(0, Math.min(255, 128 + dY));
        dataNorm[idx + 2] = 255;
        dataNorm[idx + 3] = 255;

        // Roughness map (dry un-weathered regolith dust is extremely matte ~ 0.88-0.98)
        const roughVal = 210 + Math.floor(n2 * 35);
        dataRough[idx] = roughVal;
        dataRough[idx + 1] = roughVal;
        dataRough[idx + 2] = roughVal;
        dataRough[idx + 3] = 255;
      }
    }

    ctxDiff.putImageData(imgDataDiff, 0, 0);
    ctxNorm.putImageData(imgDataNorm, 0, 0);
    ctxRough.putImageData(imgDataRough, 0, 0);

    const diffTex = new THREE.CanvasTexture(cDiff);
    diffTex.wrapS = THREE.RepeatWrapping;
    diffTex.wrapT = THREE.RepeatWrapping;
    diffTex.repeat.set(16, 16);

    const normTex = new THREE.CanvasTexture(cNorm);
    normTex.wrapS = THREE.RepeatWrapping;
    normTex.wrapT = THREE.RepeatWrapping;
    normTex.repeat.set(16, 16);

    const roughTex = new THREE.CanvasTexture(cRough);
    roughTex.wrapS = THREE.RepeatWrapping;
    roughTex.wrapT = THREE.RepeatWrapping;
    roughTex.repeat.set(16, 16);

    return { diffuseMap: diffTex, normalMap: normTex, roughnessMap: roughTex };
  }
}
