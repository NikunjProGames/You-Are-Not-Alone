import * as THREE from "three";

export interface CameraShot {
  duration: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov?: number;
}

export class CinematicSystem {
  private camera: THREE.PerspectiveCamera | null = null;
  private shots: CameraShot[] = [];
  private shotIndex = 0;
  private shotTime = 0;
  private fromPosition = new THREE.Vector3();
  private fromLookAt = new THREE.Vector3();
  private fromFov = 50;
  private completion?: () => void;
  private readonly lookTarget = new THREE.Vector3();

  get active(): boolean {
    return this.camera !== null;
  }

  play(camera: THREE.PerspectiveCamera, shots: CameraShot[], completion?: () => void): void {
    if (this.active) throw new Error("A cinematic sequence is already active.");
    if (shots.length === 0 || shots.some((shot) => shot.duration <= 0)) {
      throw new Error("A cinematic requires at least one positive-duration camera shot.");
    }
    this.camera = camera;
    this.shots = shots;
    this.shotIndex = 0;
    this.shotTime = 0;
    this.fromPosition.copy(camera.position);
    camera.getWorldDirection(this.lookTarget);
    this.fromLookAt.copy(camera.position).add(this.lookTarget);
    this.fromFov = camera.fov;
    this.completion = completion;
  }

  update(delta: number): void {
    if (!this.camera) return;
    const shot = this.shots[this.shotIndex];
    this.shotTime += delta;
    const progress = Math.min(1, this.shotTime / shot.duration);
    const eased = progress * progress * (3 - 2 * progress);
    this.camera.position.lerpVectors(this.fromPosition, shot.position, eased);
    this.lookTarget.lerpVectors(this.fromLookAt, shot.lookAt, eased);
    this.camera.lookAt(this.lookTarget);
    this.camera.fov = THREE.MathUtils.lerp(this.fromFov, shot.fov ?? this.fromFov, eased);
    this.camera.updateProjectionMatrix();

    if (progress < 1) return;
    this.shotIndex += 1;
    if (this.shotIndex >= this.shots.length) {
      const completion = this.completion;
      this.camera = null;
      this.shots = [];
      this.completion = undefined;
      completion?.();
      return;
    }
    this.fromPosition.copy(shot.position);
    this.fromLookAt.copy(shot.lookAt);
    this.fromFov = shot.fov ?? this.fromFov;
    this.shotTime = 0;
  }
}
