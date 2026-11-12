import * as THREE from "three";

export type AtmosphereMood = "settled" | "uneasy";

export class EnvironmentSystem {
  private mood: AtmosphereMood = "settled";
  private blackedOut = false;
  private readonly fixtures: THREE.PointLight[] = [];

  constructor(
    private readonly audio: { setAmbience: (amount: number, duration?: number) => void },
  ) {}

  addPractical(light: THREE.PointLight): void {
    if (typeof light.userData.baseIntensity !== "number") {
      throw new Error("A practical light must define its base intensity.");
    }
    this.fixtures.push(light);
    light.intensity = this.blackedOut ? 0 : light.userData.baseIntensity;
  }

  setMood(mood: AtmosphereMood): void {
    if (this.mood === mood) return;
    this.mood = mood;
    this.audio.setAmbience(mood === "uneasy" ? 0.075 : 0.045);
  }

  setBlackout(active: boolean): void {
    this.blackedOut = active;
    for (const light of this.fixtures) {
      light.intensity = active ? 0 : light.userData.baseIntensity;
    }
  }
}
