import * as THREE from "three";
import type { Interactable } from "../types";

export class InteractionSystem {
  private readonly raycaster = new THREE.Raycaster();
  private readonly center = new THREE.Vector2(0, 0);
  private readonly prompt = required<HTMLElement>("#interaction-prompt");
  private readonly label = required<HTMLElement>("#interaction-label");
  private readonly button = required<HTMLButtonElement>("#mobile-interact");
  private current: Interactable | null = null;
  private readonly targets: Interactable[] = [];
  private refreshElapsed = 0;
  private readonly refreshInterval = 1 / 30;

  constructor(
    private readonly camera: THREE.Camera,
    private readonly occluders?: THREE.Object3D,
  ) {
    this.raycaster.far = 3.6;
    this.button.addEventListener("click", () => this.interact());
  }

  register(target: Interactable): void {
    if (this.targets.some((entry) => entry.id === target.id)) {
      throw new Error(`An interactable with id "${target.id}" is already registered.`);
    }
    this.targets.push(target);
  }

  update(delta: number): void {
    this.refreshElapsed += delta;
    if (this.refreshElapsed < this.refreshInterval) return;
    this.refreshElapsed %= this.refreshInterval;

    this.raycaster.setFromCamera(this.center, this.camera);
    const active = this.targets.filter(
      (target) => (target.enabled?.() ?? true) && isVisible(target.object),
    );
    const intersections = this.raycaster.intersectObjects(
      this.occluders ? this.occluders.children : active.map((target) => target.object),
      true,
    );
    let focused: Interactable | null = null;
    for (const intersection of intersections) {
      if (!isVisible(intersection.object)) continue;
      focused =
        active.find((target) => {
          let current: THREE.Object3D | null = intersection.object;
          while (current) {
            if (current === target.object) return true;
            current = current.parent;
          }
          return false;
        }) ?? null;
      break;
    }

    this.current = focused;
    this.prompt.hidden = !focused;
    if (focused) {
      this.label.textContent =
        typeof focused.prompt === "function" ? focused.prompt() : focused.prompt;
      const key = required<HTMLElement>("#interaction-key");
      key.textContent = matchMedia("(pointer: coarse)").matches ? "TAP" : "E";
    }
  }

  interact(): void {
    if (this.current && (this.current.enabled?.() ?? true)) this.current.interact();
  }

  clearFocus(): void {
    this.current = null;
    this.prompt.hidden = true;
    this.refreshElapsed = this.refreshInterval;
  }
}

function isVisible(object: THREE.Object3D): boolean {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

function required<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required interaction element is missing: ${selector}`);
  return element;
}
