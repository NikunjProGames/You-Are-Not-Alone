export class AudioSystem {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambience: GainNode | null = null;
  private started = false;
  private ambienceLevel = 0.045;

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

    master.gain.value = 0.34;
    ambience.gain.value = this.ambienceLevel;
    drone.type = "sine";
    drone.frequency.value = 43;
    overtone.type = "triangle";
    overtone.frequency.value = 64.5;
    overtone.detune.value = 5;
    lowPass.type = "lowpass";
    lowPass.frequency.value = 260;
    drone.connect(ambience);
    overtone.connect(ambience);
    ambience.connect(lowPass);
    lowPass.connect(master);
    master.connect(context.destination);
    drone.start();
    overtone.start();
    await context.resume();

    this.context = context;
    this.master = master;
    this.ambience = ambience;
    this.started = true;
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

  get isStarted(): boolean {
    return this.started;
  }
}
