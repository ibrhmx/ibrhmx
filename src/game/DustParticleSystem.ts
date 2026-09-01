/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

interface DustParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
}

export class DustParticleSystem {
  public group: THREE.Group;
  private maxParticles: number = 800;
  private particles: DustParticle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private posArray: Float32Array;
  private colorArray: Float32Array;

  // Lunar gravity: 1.62 m/s^2
  private lunarGravity: number = 1.62;

  constructor() {
    this.group = new THREE.Group();

    this.posArray = new Float32Array(this.maxParticles * 3);
    this.colorArray = new Float32Array(this.maxParticles * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.posArray, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorArray, 3));

    // Create custom circular dust texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(210,215,225,0.7)');
    grad.addColorStop(1, 'rgba(180,185,195,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 0.18,
      map: texture,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);
  }

  public emitWheelDust(wheelPos: THREE.Vector3, wheelSpeed: number, forwardDir: THREE.Vector3) {
    if (Math.abs(wheelSpeed) < 0.5) return;
    const count = Math.min(6, Math.floor(Math.abs(wheelSpeed) * 1.2));

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      // Ballistic spray opposite to wheel movement + upward spray
      const sprayDir = forwardDir.clone().negate().multiplyScalar(wheelSpeed * 0.4);
      sprayDir.x += (Math.random() - 0.5) * 0.8;
      sprayDir.z += (Math.random() - 0.5) * 0.8;
      sprayDir.y = 0.4 + Math.random() * 0.8 + Math.abs(wheelSpeed) * 0.15;

      const p: DustParticle = {
        pos: wheelPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.05, (Math.random() - 0.5) * 0.2)),
        vel: sprayDir,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.8,
        size: 0.12 + Math.random() * 0.12,
        color: new THREE.Color(0x9aa0a6),
      };

      this.particles.push(p);
    }
  }

  public emitThrusterPlume(roverPos: THREE.Vector3) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const p: DustParticle = {
        pos: roverPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, -0.2, (Math.random() - 0.5) * 0.8)),
        vel: new THREE.Vector3((Math.random() - 0.5) * 3.0, -1.8 - Math.random() * 1.5, (Math.random() - 0.5) * 3.0),
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
        size: 0.25 + Math.random() * 0.2,
        color: new THREE.Color(0x60a5fa), // Ice blue thruster exhaust
      };

      this.particles.push(p);
    }
  }

  public emitDrillDust(drillPos: THREE.Vector3) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.2;

      const p: DustParticle = {
        pos: drillPos.clone().add(new THREE.Vector3(0, 0.05, 0)),
        vel: new THREE.Vector3(Math.cos(angle) * speed, 0.8 + Math.random() * 1.4, Math.sin(angle) * speed),
        life: 0,
        maxLife: 1.5 + Math.random() * 0.8,
        size: 0.14 + Math.random() * 0.1,
        color: new THREE.Color(0xd1d5db),
      };

      this.particles.push(p);
    }
  }

  public update(delta: number, terrainHeightFn: (x: number, z: number) => number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Pure ballistic parabolic trajectory under Lunar 1.62 m/s^2 gravity
      p.vel.y -= this.lunarGravity * delta;
      p.pos.addScaledVector(p.vel, delta);

      // Check collision with lunar regolith floor
      const groundH = terrainHeightFn(p.pos.x, p.pos.z);
      if (p.pos.y <= groundH) {
        p.pos.y = groundH;
        p.vel.y = -p.vel.y * 0.2; // slight regolith bounce damping
        p.vel.x *= 0.5;
        p.vel.z *= 0.5;
        if (Math.abs(p.vel.y) < 0.1) {
          p.life = p.maxLife; // settle into dust bed
        }
      }
    }

    // Update GPU Buffer
    let vertexIndex = 0;
    for (let i = 0; i < this.maxParticles; i++) {
      if (i < this.particles.length) {
        const p = this.particles[i];
        const alpha = 1.0 - p.life / p.maxLife;

        this.posArray[vertexIndex] = p.pos.x;
        this.posArray[vertexIndex + 1] = p.pos.y;
        this.posArray[vertexIndex + 2] = p.pos.z;

        this.colorArray[vertexIndex] = p.color.r * alpha;
        this.colorArray[vertexIndex + 1] = p.color.g * alpha;
        this.colorArray[vertexIndex + 2] = p.color.b * alpha;
      } else {
        this.posArray[vertexIndex] = 0;
        this.posArray[vertexIndex + 1] = -9999;
        this.posArray[vertexIndex + 2] = 0;

        this.colorArray[vertexIndex] = 0;
        this.colorArray[vertexIndex + 1] = 0;
        this.colorArray[vertexIndex + 2] = 0;
      }
      vertexIndex += 3;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }
}
