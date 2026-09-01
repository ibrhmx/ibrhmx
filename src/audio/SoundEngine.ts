/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Sound nodes
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private motorFilter: BiquadFilterNode | null = null;

  private sandNoiseNode: AudioNode | null = null;
  private sandGain: GainNode | null = null;

  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  private drillOsc: OscillatorNode | null = null;
  private drillGain: GainNode | null = null;

  private thrusterNoiseNode: AudioNode | null = null;
  private thrusterGain: GainNode | null = null;

  private initialized: boolean = false;
  private radarTimer: number | null = null;

  public init() {
    if (this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.setupContinuousSounds();
      this.initialized = true;
    } catch {
      console.warn('Web Audio API not supported in current environment');
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      if (this.isMuted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private setupContinuousSounds() {
    if (!this.ctx) return;

    // 1. Motor sound (Electric Rover Inverter & Gearbox hum)
    this.motorOsc = this.ctx.createOscillator();
    this.motorOsc.type = 'sawtooth';
    this.motorOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

    this.motorFilter = this.ctx.createBiquadFilter();
    this.motorFilter.type = 'lowpass';
    this.motorFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

    this.motorGain = this.ctx.createGain();
    this.motorGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.motorOsc.connect(this.motorFilter);
    this.motorFilter.connect(this.motorGain);
    this.motorGain.connect(this.ctx.destination);
    this.motorOsc.start();

    // 2. Sand / Regolith friction crunch
    const noiseBuffer = this.createNoiseBuffer();
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const sandFilter = this.ctx.createBiquadFilter();
      sandFilter.type = 'bandpass';
      sandFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
      sandFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.sandGain = this.ctx.createGain();
      this.sandGain.gain.setValueAtTime(0, this.ctx.currentTime);

      noiseSource.connect(sandFilter);
      sandFilter.connect(this.sandGain);
      this.sandGain.connect(this.ctx.destination);
      noiseSource.start();
      this.sandNoiseNode = noiseSource;

      // Thruster Noise
      const thrusterSource = this.ctx.createBufferSource();
      thrusterSource.buffer = noiseBuffer;
      thrusterSource.loop = true;

      const thrusterFilter = this.ctx.createBiquadFilter();
      thrusterFilter.type = 'lowpass';
      thrusterFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.thrusterGain = this.ctx.createGain();
      this.thrusterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      thrusterSource.connect(thrusterFilter);
      thrusterFilter.connect(this.thrusterGain);
      this.thrusterGain.connect(this.ctx.destination);
      thrusterSource.start();
      this.thrusterNoiseNode = thrusterSource;
    }

    // 3. Ambient Deep Space Drone (Sub-bass and ethereal harmonic)
    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc1.type = 'sine';
    this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

    this.ambientOsc2 = this.ctx.createOscillator();
    this.ambientOsc2.type = 'sine';
    this.ambientOsc2.frequency.setValueAtTime(110.5, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    this.ambientOsc1.connect(this.ambientGain);
    this.ambientOsc2.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    this.ambientOsc1.start();
    this.ambientOsc2.start();

    // 4. Drill sound
    this.drillOsc = this.ctx.createOscillator();
    this.drillOsc.type = 'triangle';
    this.drillOsc.frequency.setValueAtTime(180, this.ctx.currentTime);

    this.drillGain = this.ctx.createGain();
    this.drillGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.drillOsc.connect(this.drillGain);
    this.drillGain.connect(this.ctx.destination);
    this.drillOsc.start();
  }

  public updateRoverSound(speedRatio: number, isAccelerating: boolean, isGrounded: boolean) {
    if (!this.ctx || this.isMuted || !this.motorGain || !this.motorOsc || !this.sandGain) return;
    const now = this.ctx.currentTime;
    const targetFreq = 40 + speedRatio * 180 + (isAccelerating ? 25 : 0);
    const targetGain = 0.02 + speedRatio * 0.12 + (isAccelerating ? 0.05 : 0);

    this.motorOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.motorGain.gain.setTargetAtTime(targetGain, now, 0.08);

    const sandTargetGain = isGrounded ? speedRatio * 0.08 : 0;
    this.sandGain.gain.setTargetAtTime(sandTargetGain, now, 0.1);
  }

  public setThruster(active: boolean) {
    if (!this.ctx || this.isMuted || !this.thrusterGain) return;
    const now = this.ctx.currentTime;
    this.thrusterGain.gain.setTargetAtTime(active ? 0.22 : 0, now, 0.05);
  }

  public setDrill(active: boolean) {
    if (!this.ctx || this.isMuted || !this.drillGain) return;
    const now = this.ctx.currentTime;
    this.drillGain.gain.setTargetAtTime(active ? 0.15 : 0, now, 0.1);
  }

  public playRadarPing(frequency: number = 880, distanceNormalized: number = 0.5) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.6, now + 0.15);

    const vol = Math.max(0.02, Math.min(0.2, (1 - distanceNormalized) * 0.2));
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playGeigerClick() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200 + Math.random() * 800, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.02);
  }

  public playDiscoveryChime() {
    if (!this.ctx || this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const now = this.ctx!.currentTime + index * 0.09;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    });
  }

  public playRadioBeep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2500, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playUiClick() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playImpactSound(velocity: number) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

    const vol = Math.min(0.3, velocity * 0.05);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }
}

export const soundEngine = new SoundEngine();
