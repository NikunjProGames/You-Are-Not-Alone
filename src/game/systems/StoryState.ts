import type { DayPhase, StoryCondition, StorySnapshot, StoryValue } from "../types";
import type { Player } from "../world/Player";

const PHASES: DayPhase[] = ["morning", "afternoon", "evening", "night"];
const INITIAL_PLAYER = { x: 0, y: 0, z: 9.25, yaw: 0 };

export class StoryState {
  private snapshot: StorySnapshot = {
    version: 1,
    day: 1,
    phase: "evening",
    flags: {},
    discoveries: [],
    choices: {},
    completedEvents: [],
    player: { ...INITIAL_PLAYER },
  };
  private readonly listeners = new Set<(state: StorySnapshot) => void>();

  get value(): Readonly<StorySnapshot> {
    return this.snapshot;
  }

  subscribe(listener: (state: StorySnapshot) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  setFlag(key: string, value: StoryValue): void {
    this.snapshot.flags[key] = value;
    this.notify();
  }

  getFlag(key: string): StoryValue | undefined {
    return this.snapshot.flags[key];
  }

  hasFlag(key: string): boolean {
    return this.snapshot.flags[key] === true;
  }

  recordChoice(key: string, value: string): void {
    this.snapshot.choices[key] = value;
    this.notify();
  }

  discover(id: string): boolean {
    if (this.snapshot.discoveries.includes(id)) return false;
    this.snapshot.discoveries.push(id);
    this.notify();
    return true;
  }

  completeEvent(id: string): boolean {
    if (this.snapshot.completedEvents.includes(id)) return false;
    this.snapshot.completedEvents.push(id);
    this.notify();
    return true;
  }

  advancePhase(): void {
    const currentIndex = PHASES.indexOf(this.snapshot.phase);
    if (currentIndex === PHASES.length - 1) {
      this.snapshot.day += 1;
      this.snapshot.phase = PHASES[0];
    } else {
      this.snapshot.phase = PHASES[currentIndex + 1];
    }
    this.notify();
  }

  matches(condition: StoryCondition): boolean {
    const { flags, discoveries, day, phase } = this.snapshot;
    return (
      (!condition.allFlags || condition.allFlags.every((key) => flags[key] === true)) &&
      (!condition.anyFlags || condition.anyFlags.some((key) => flags[key] === true)) &&
      (!condition.noFlags || condition.noFlags.every((key) => flags[key] !== true)) &&
      (!condition.choices ||
        Object.entries(condition.choices).every(([key, value]) => this.snapshot.choices[key] === value)) &&
      (!condition.completedEvents ||
        condition.completedEvents.every((id) => this.snapshot.completedEvents.includes(id))) &&
      (condition.minDay === undefined || day >= condition.minDay) &&
      (condition.maxDay === undefined || day <= condition.maxDay) &&
      (!condition.phases || condition.phases.includes(phase)) &&
      (!condition.discoveries || condition.discoveries.every((id) => discoveries.includes(id))) &&
      (condition.minDiscoveries === undefined || discoveries.length >= condition.minDiscoveries)
    );
  }

  checkpoint(player: Player): void {
    const position = player.getCheckpoint();
    this.snapshot.player = position;
    this.notify();
  }

  restore(snapshot: StorySnapshot): void {
    this.snapshot = structuredClone(snapshot);
    this.notify();
  }

  reset(): void {
    this.snapshot = {
      version: 1,
      day: 1,
      phase: "evening",
      flags: {},
      discoveries: [],
      choices: {},
      completedEvents: [],
      player: { ...INITIAL_PLAYER },
    };
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.snapshot);
  }
}

export { INITIAL_PLAYER };
