import * as THREE from "three";
import type { PlayerCheckpoint } from "../types";

export interface PlayerInput {
  moveX: number;
  moveY: number;
}

export class Player {
  readonly position = new THREE.Vector3(0, 1.64, 3.1);
  readonly camera = new THREE.PerspectiveCamera(68, 1, 0.08, 90);
  yaw = 0;
  pitch = 0;
  private readonly keys = new Set<string>();
  private touchX = 0;
  private touchY = 0;
  private locked = false;
  private lookEnabled = false;
  private readonly onLookChange: () => void;
  private readonly onPointerLockLost: () => void;
  private readonly canvas: HTMLCanvasElement;
  private readonly mobileControls: HTMLElement;
  private readonly joystick: HTMLElement;
  private readonly knob: HTMLElement;
  private joystickPointer: number | null = null;
  private lookPointer: number | null = null;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private lastMouseX: number | null = null;
  private lastMouseY: number | null = null;

  constructor(canvas: HTMLCanvasElement, onLookChange: () => void, onPointerLockLost: () => void) {
    this.canvas = canvas;
    this.onLookChange = onLookChange;
    this.onPointerLockLost = onPointerLockLost;
    this.mobileControls = required("#mobile-controls");
    this.joystick = required("#move-pad");
    this.knob = required(".move-knob");
    this.canvas.tabIndex = 0;
    this.camera.position.copy(this.position);
    this.camera.rotation.order = "YXZ";

    window.addEventListener("keydown", (event) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      this.keys.add(event.code);
    });
    window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    window.addEventListener("blur", () => this.keys.clear());
    document.addEventListener("pointerlockchange", () => {
      const wasLocked = this.locked;
      this.locked = document.pointerLockElement === this.canvas;
      this.mobileControls.hidden = this.isDesktopInput();
      if (wasLocked && !this.locked && this.lookEnabled) this.onPointerLockLost();
    });
    window.addEventListener("mousemove", (event) => {
      if (!this.lookEnabled) return;
      if (this.locked) this.rotate(event.movementX, event.movementY);
      else if (this.isDesktopInput()) {
        const deltaX = this.lastMouseX === null ? 0 : event.clientX - this.lastMouseX;
        const deltaY = this.lastMouseY === null ? 0 : event.clientY - this.lastMouseY;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.rotate(deltaX, deltaY);
      }
    });

    window.addEventListener("resize", () => this.updateInputMode());
    this.canvas.addEventListener("click", () => {
      if (this.lookEnabled && this.isDesktopInput()) this.requestPointerLock();
    });
    this.setupTouchControls();
    this.updateInputMode();
  }

  get pointerLocked(): boolean {
    return this.locked;
  }

  getInput(): PlayerInput {
    let x = 0;
    let y = 0;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) x -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) x += 1;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) y += 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) y -= 1;
    x += this.touchX;
    y += this.touchY;
    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }
    return { moveX: x, moveY: y };
  }

  update(
    delta: number,
    canMove: boolean,
    canOccupy: (x: number, z: number, floorHeight: number) => boolean,
    floorAt: (x: number, z: number, currentHeight: number) => number | null,
  ): void {
    if (canMove) {
      const { moveX, moveY } = this.getInput();
      const speed = (this.keys.has("ShiftLeft") ? 2.85 : 2.2) * delta;
      const forward = this.camera.getWorldDirection(new THREE.Vector3());
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, THREE.Object3D.DEFAULT_UP).normalize();
      const dx = (forward.x * moveY + right.x * moveX) * speed;
      const dz = (forward.z * moveY + right.z * moveX) * speed;
      const nextX = this.position.x + dx;
      const nextXFloor = floorAt(nextX, this.position.z, this.position.y - 1.64);
      if (nextXFloor !== null && canOccupy(nextX, this.position.z, nextXFloor)) {
        this.position.x = nextX;
        this.position.y = nextXFloor + 1.64;
      }
      const nextZ = this.position.z + dz;
      const nextZFloor = floorAt(this.position.x, nextZ, this.position.y - 1.64);
      if (nextZFloor !== null && canOccupy(this.position.x, nextZ, nextZFloor)) {
        this.position.z = nextZ;
        this.position.y = nextZFloor + 1.64;
      }
    }
    this.camera.position.copy(this.position);
    this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
  }

  rotate(deltaX: number, deltaY: number): void {
    const sensitivity = this.locked ? 0.0021 : 0.0034;
    this.yaw -= deltaX * sensitivity;
    this.pitch -= deltaY * sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -1.27, 1.27);
    this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
    this.onLookChange();
  }

  getCheckpoint(): PlayerCheckpoint {
    return { x: this.position.x, y: this.position.y - 1.64, z: this.position.z, yaw: this.yaw };
  }

  restore(checkpoint: PlayerCheckpoint): void {
    this.position.set(checkpoint.x, checkpoint.y + 1.64, checkpoint.z);
    this.yaw = checkpoint.yaw;
    this.pitch = 0;
  }

  requestPointerLock(): void {
    if (!this.isDesktopInput() || this.locked) return;
    const request = this.canvas.requestPointerLock();
    if (request instanceof Promise) {
      void request.catch((error: unknown) => {
        console.info("Pointer lock unavailable; free-cursor mouse look remains active.", error);
      });
    }
  }

  focusCanvas(): void {
    this.canvas.focus({ preventScroll: true });
  }

  setLookEnabled(enabled: boolean): void {
    this.lookEnabled = enabled;
    this.lastMouseX = null;
    this.lastMouseY = null;
  }

  releasePointerLock(): void {
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  private setupTouchControls(): void {
    this.joystick.addEventListener("pointerdown", (event) => {
      this.joystickPointer = event.pointerId;
      this.joystick.setPointerCapture(event.pointerId);
      this.updateJoystick(event);
    });
    this.joystick.addEventListener("pointermove", (event) => {
      if (event.pointerId === this.joystickPointer) this.updateJoystick(event);
    });
    const releaseJoystick = (event: PointerEvent) => {
      if (event.pointerId !== this.joystickPointer) return;
      this.joystickPointer = null;
      this.touchX = 0;
      this.touchY = 0;
      this.knob.style.transform = "translate(0, 0)";
    };
    this.joystick.addEventListener("pointerup", releaseJoystick);
    this.joystick.addEventListener("pointercancel", releaseJoystick);

    this.canvas.addEventListener("pointerdown", (event) => {
      if (this.isDesktopInput() || event.clientX < window.innerWidth * 0.35) return;
      this.lookPointer = event.pointerId;
      this.lastTouchX = event.clientX;
      this.lastTouchY = event.clientY;
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener("pointermove", (event) => {
      if (event.pointerId !== this.lookPointer) return;
      const dx = event.clientX - this.lastTouchX;
      const dy = event.clientY - this.lastTouchY;
      this.lastTouchX = event.clientX;
      this.lastTouchY = event.clientY;
      this.rotate(dx * 1.7, dy * 1.7);
    });
    const releaseLook = (event: PointerEvent) => {
      if (event.pointerId === this.lookPointer) this.lookPointer = null;
    };
    this.canvas.addEventListener("pointerup", releaseLook);
    this.canvas.addEventListener("pointercancel", releaseLook);
  }

  private updateJoystick(event: PointerEvent): void {
    const bounds = this.joystick.getBoundingClientRect();
    const maximum = bounds.width * 0.31;
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.min(maximum, Math.hypot(x, y));
    const angle = Math.atan2(y, x);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    this.touchX = dx / maximum;
    this.touchY = -dy / maximum;
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  private updateInputMode(): void {
    this.mobileControls.hidden = this.isDesktopInput();
  }

  private isDesktopInput(): boolean {
    return window.matchMedia("(pointer: fine)").matches && window.innerWidth > 700;
  }
}

function required<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required player control is missing: ${selector}`);
  return element;
}
