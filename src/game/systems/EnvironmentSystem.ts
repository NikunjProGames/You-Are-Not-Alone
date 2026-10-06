import * as THREE from "three";

export type AtmosphereMood = "settled" | "uneasy";

export class EnvironmentSystem {
  private mood: AtmosphereMood = "settled";
  private flickerTime = 0;
  private readonly fixtures: THREE.PointLight[] = [];

  constructor(
    private readonly audio: { setAmbience: (amount: number, duration?: number) => void },
  ) {}

  addPractical(light: THREE.PointLight): void {
    this.fixtures.push(light);
  }

  setMood(mood: AtmosphereMood): void {
    if (this.mood === mood) return;
    this.mood = mood;
    this.audio.setAmbience(mood === "uneasy" ? 0.075 : 0.045);
  }

  update(delta: number, elapsed: number): void {
    this.flickerTime += delta;
    const isUneasy = this.mood === "uneasy";
    const pulse = isUneasy ? Math.sin(elapsed * 2.4) * 0.025 : 0;
    this.fixtures.forEach((light, index) => {
      const flicker = isUneasy && index === 0 && this.flickerTime > 10
        ? Math.max(0.82, 1 - Math.max(0, Math.sin(elapsed * 19)) * 0.11)
        : 1;
      light.intensity = light.userData.baseIntensity * flicker + pulse;
    });
  }
}
