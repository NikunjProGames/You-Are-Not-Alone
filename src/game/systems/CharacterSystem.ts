import * as THREE from "three";

export interface CharacterCue {
  after: number;
  position?: THREE.Vector3;
  yaw?: number;
  visible?: boolean;
}

export interface CharacterDefinition {
  id: string;
  object: THREE.Group;
  cues?: CharacterCue[];
  spawn?: boolean;
}

interface CharacterRuntime extends CharacterDefinition {
  nextCue: number;
  targetPosition: THREE.Vector3;
  targetYaw: number;
  elapsed: number;
  origin: THREE.Vector3;
}

export class CharacterSystem {
  private readonly actors = new Map<string, CharacterRuntime>();

  constructor(private readonly scene: THREE.Scene) {}

  register(definition: CharacterDefinition): void {
    if (this.actors.has(definition.id)) {
      throw new Error(`A character with id "${definition.id}" is already registered.`);
    }
    const cues = [...(definition.cues ?? [])].sort((a, b) => a.after - b.after);
    if (cues.some((cue) => cue.after < 0)) {
      throw new Error(`Character "${definition.id}" has a cue before time zero.`);
    }
    const actor: CharacterRuntime = {
      ...definition,
      cues,
      nextCue: 0,
      targetPosition: definition.object.position.clone(),
      targetYaw: definition.object.rotation.y,
      elapsed: 0,
      origin: definition.object.position.clone(),
    };
    this.actors.set(definition.id, actor);
    if (definition.spawn !== false) this.scene.add(definition.object);
    else definition.object.visible = false;
  }

  spawn(id: string, position?: THREE.Vector3): void {
    const actor = this.requireActor(id);
    if (position) {
      actor.object.position.copy(position);
      actor.targetPosition.copy(position);
      actor.origin.copy(position);
    }
    actor.object.visible = true;
    if (actor.object.parent !== this.scene) this.scene.add(actor.object);
  }

  despawn(id: string): void {
    this.requireActor(id).object.visible = false;
  }

  place(id: string, position: THREE.Vector3, yaw?: number): void {
    const actor = this.requireActor(id);
    actor.object.position.copy(position);
    actor.targetPosition.copy(position);
    if (yaw !== undefined) {
      actor.object.rotation.y = yaw;
      actor.targetYaw = yaw;
    }
  }

  update(delta: number, elapsed: number): void {
    for (const actor of this.actors.values()) {
      if (!actor.object.visible) continue;
      actor.elapsed += delta;
      while (actor.nextCue < actor.cues!.length && actor.cues![actor.nextCue].after <= elapsed) {
        const cue = actor.cues![actor.nextCue];
        if (cue.position) actor.targetPosition.copy(cue.position);
        if (cue.yaw !== undefined) actor.targetYaw = cue.yaw;
        if (cue.visible !== undefined) actor.object.visible = cue.visible;
        actor.nextCue += 1;
      }
      actor.object.position.lerp(actor.targetPosition, Math.min(1, delta * 1.35));
      actor.object.rotation.y = THREE.MathUtils.damp(
        actor.object.rotation.y,
        actor.targetYaw,
        1.2,
        delta,
      );
      const idle = Math.sin(actor.elapsed * 1.7) * 0.008;
      actor.object.position.y = actor.targetPosition.y + idle;
    }
  }

  private requireActor(id: string): CharacterRuntime {
    const actor = this.actors.get(id);
    if (!actor) throw new Error(`Character "${id}" is not registered.`);
    return actor;
  }
}
