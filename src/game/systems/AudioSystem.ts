export class AudioSystem {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambience: GainNode | null = null;
  private started = false;
  private ambienceLevel = 0.045;
  private platformAudioEnabled = true;
  private platformPaused = false;

  async start(): Promise<void> {
    if (this.started) {
      if (this.context?.state === "suspended") await this.context.resume();
      return;
    }
    const context = new AudioContext();
    const master = context.createGain();
    const ambience = context.createGain();
    const drone = context.createOscillator();
    const overtone = context.createOscillator();
    const lowPass = context.createBiquadFilter();
    const windFilter = context.createBiquadFilter();
    const forestFilter = context.createBiquadFilter();
    const windGain = context.createGain();
    const forestGain = context.createGain();
    const noise = context.createBufferSource();
    const windPulse = context.createOscillator();
    const windDepth = context.createGain();
    const noiseBuffer = context.createBuffer(1, context.sampleRate * 5, context.sampleRate);
    const noiseSamples = noiseBuffer.getChannelData(0);
    let seed = 0x6d2b79f5;
    for (let index = 0; index < noiseSamples.length; index += 1) {
      seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
      seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
      noiseSamples[index] = (((seed ^ (seed >>> 14)) >>> 0) / 2147483648 - 1) * 0.12;
    }

    master.gain.value = this.isPlatformAudioActive() ? 0.34 : 0;
    ambience.gain.value = this.ambienceLevel;
    drone.type = "sine";
    drone.frequency.value = 43;
    overtone.type = "triangle";
    overtone.frequency.value = 64.5;
    overtone.detune.value = 5;
    lowPass.type = "lowpass";
    lowPass.frequency.value = 260;
    windFilter.type = "lowpass";
    windFilter.frequency.value = 420;
    forestFilter.type = "bandpass";
    forestFilter.frequency.value = 1050;
    forestFilter.Q.value = 0.45;
    windGain.gain.value = 0.2;
    forestGain.gain.value = 0.18;
    noise.buffer = noiseBuffer;
    noise.loop = true;
    windPulse.type = "sine";
    windPulse.frequency.value = 0.075;
    windDepth.gain.value = 0.075;

    drone.connect(ambience);
    overtone.connect(ambience);
    ambience.connect(lowPass);
    lowPass.connect(master);
    noise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(ambience);
    noise.connect(forestFilter);
    forestFilter.connect(forestGain);
    forestGain.connect(ambience);
    windPulse.connect(windDepth);
    windDepth.connect(windGain.gain);
    master.connect(context.destination);
    drone.start();
    overtone.start();
    noise.start();
    windPulse.start();
    await context.resume();

    this.context = context;
    this.master = master;
    this.ambience = ambience;
    this.started = true;
  }

  setPlatformState(audioEnabled: boolean, paused: boolean): void {
    this.platformAudioEnabled = audioEnabled;
    this.platformPaused = paused;
    if (!this.context || !this.master) return;
    const targetVolume = this.isPlatformAudioActive() ? 0.34 : 0;
    this.master.gain.setTargetAtTime(targetVolume, this.context.currentTime, 0.03);
  }

  private isPlatformAudioActive(): boolean {
    return this.platformAudioEnabled && !this.platformPaused;
  }

  setAmbience(amount: number, duration = 1.4): void {
    this.ambienceLevel = amount;
    if (!this.context || !this.ambience) return;
    const now = this.context.currentTime;
    this.ambience.gain.cancelScheduledValues(now);
    this.ambience.gain.setTargetAtTime(amount, now, Math.max(0.05, duration / 5));
  }

  playTone(frequency: number, duration = 0.38, volume = 0.08): void {
    if (!this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, frequency * 0.65), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  playUiClick(): void {
    if (!this.context || !this.master) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(980, now);
    oscillator.frequency.exponentialRampToValueAtTime(540, now + 0.045);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }

  playDoorSound(): void {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    const creak = this.context.createOscillator();
    const creakGain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    creak.type = "triangle";
    creak.frequency.setValueAtTime(138, now);
    creak.frequency.exponentialRampToValueAtTime(68, now + 0.34);
    filter.type = "lowpass";
    filter.frequency.value = 420;
    creakGain.gain.setValueAtTime(0.001, now);
    creakGain.gain.linearRampToValueAtTime(0.055, now + 0.045);
    creakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    creak.connect(filter);
    filter.connect(creakGain);
    creakGain.connect(this.master);
    creak.start(now);
    creak.stop(now + 0.43);

    const thud = this.context.createOscillator();
    const thudGain = this.context.createGain();
    thud.type = "sine";
    thud.frequency.setValueAtTime(78, now + 0.16);
    thud.frequency.exponentialRampToValueAtTime(34, now + 0.32);
    thudGain.gain.setValueAtTime(0.035, now + 0.16);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    thud.connect(thudGain);
    thudGain.connect(this.master);
    thud.start(now + 0.16);
    thud.stop(now + 0.36);
  }

  get isStarted(): boolean {
    return this.started;
  }
}
