import * as THREE from "three";
import type { StoryCondition } from "../types";
import { StoryState } from "./StoryState";

export interface ProximityEvent {
  id: string;
  position: THREE.Vector3;
  radius: number;
  condition?: StoryCondition;
  once?: boolean;
  run: () => void;
}

export class EventDirector {
  private readonly events: ProximityEvent[] = [];
  private readonly firedThisSession = new Set<string>();

  constructor(private readonly story: StoryState) {}

  reset(): void {
    this.firedThisSession.clear();
  }

  register(event: ProximityEvent): void {
    if (this.events.some((registered) => registered.id === event.id)) {
      throw new Error(`A story event with id "${event.id}" is already registered.`);
    }
    this.events.push(event);
  }

  update(position: THREE.Vector3): void {
    for (const event of this.events) {
      const oneShot = event.once !== false;
      if (oneShot && this.story.value.completedEvents.includes(event.id)) continue;
      if (oneShot && this.firedThisSession.has(event.id)) continue;
      if (event.condition && !this.story.matches(event.condition)) continue;
      if (position.distanceToSquared(event.position) > event.radius * event.radius) continue;
      if (oneShot) {
        this.firedThisSession.add(event.id);
        this.story.completeEvent(event.id);
      }
      event.run();
    }
  }
}
