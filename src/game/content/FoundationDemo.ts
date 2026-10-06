import * as THREE from "three";
import type { CinematicSystem } from "../systems/CinematicSystem";
import type { EventDirector } from "../systems/EventDirector";
import type { StoryState } from "../systems/StoryState";
import type { Player } from "../world/Player";
import type { HouseDemo } from "../world/HouseDemo";

interface FoundationDemoOptions {
  events: EventDirector;
  story: StoryState;
  player: Player;
  cinematics: CinematicSystem;
  world: HouseDemo;
  playTone: (frequency: number, duration: number, volume: number) => void;
  setObjective: (objective: string) => void;
  showToast: (message: string) => void;
  saveCheckpoint: () => void;
}

export function registerFoundationDemo(options: FoundationDemoOptions): void {
  options.events.register({
    id: "foundation.first-hall-entry",
    position: new THREE.Vector3(0, 1.64, -5.75),
    radius: 1,
    once: true,
    run: () => {
      options.story.setFlag("foundation.hallEntered", true);
      options.world.setMood("uneasy");
      options.playTone(92, 0.8, 0.055);
      options.setObjective("Explore the hall and look for what might be making that sound.");
      options.showToast("The air in the hallway feels colder.");
      playFoundationCameraMoment(options);
      options.saveCheckpoint();
    },
  });
}

function playFoundationCameraMoment(options: FoundationDemoOptions): void {
  const point = options.player.position.clone();
  const forward = new THREE.Vector3(
    Math.sin(options.player.yaw),
    0,
    -Math.cos(options.player.yaw),
  );
  const eye = new THREE.Vector3(point.x, point.y, point.z);
  const farView = eye.clone().addScaledVector(forward, 2.1);
  options.cinematics.play(
    options.player.camera,
    [
      {
        duration: 1.25,
        position: eye.clone().add(new THREE.Vector3(0, 0.02, 0)),
        lookAt: eye.clone().addScaledVector(forward, 3.2).add(new THREE.Vector3(0, 0.05, 0)),
        fov: 65,
      },
      {
        duration: 1.55,
        position: farView.add(new THREE.Vector3(0.22, 0.04, 0)),
        lookAt: eye.clone().addScaledVector(forward, 7.4).add(new THREE.Vector3(0, -0.12, 0)),
        fov: 63,
      },
    ],
    () => {
      options.player.camera.position.copy(options.player.position);
      options.player.camera.rotation.set(options.player.pitch, options.player.yaw, 0, "YXZ");
      options.showToast("An old pipe knocks somewhere beyond the door.");
    },
  );
}
