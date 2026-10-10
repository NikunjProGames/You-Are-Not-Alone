import * as THREE from "three";
import "./thumbnail.css";
import { EnvironmentSystem } from "./game/systems/EnvironmentSystem";
import { buildHouseDemo } from "./game/world/HouseDemo";

const canvas = document.querySelector<HTMLCanvasElement>("#thumbnail-canvas");
if (!canvas) throw new Error("The thumbnail preview canvas could not be found.");

const environment = new EnvironmentSystem({ setAmbience: () => undefined });
const world = buildHouseDemo(
  environment,
  () => undefined,
  () => false,
  () => false,
  () => undefined,
  () => true,
  () => false,
  () => new THREE.Vector3(),
);

world.setFinalDoorOpen(true);
world.setEntityReveal(1);
world.entity.position.set(0.2, 3.16, -24.7);
world.entity.rotation.y = 0;

const scene = world.scene;
scene.fog = new THREE.FogExp2("#11171b", 0.025);

scene.traverse((object) => {
  if (object instanceof THREE.HemisphereLight) object.intensity = 0.46;
  if (object instanceof THREE.DirectionalLight) {
    object.color.set("#9aaab7");
    object.intensity = 0.64;
  }
  if (object instanceof THREE.PointLight) object.intensity *= 0.34;
});

const rim = new THREE.SpotLight("#b4c5cf", 62, 9, Math.PI / 3.4, 0.72, 1.3);
rim.position.set(-1.65, 6.15, -26.15);
rim.target.position.set(0.15, 4.1, -24.7);
rim.castShadow = false;
scene.add(rim, rim.target);

const camera = new THREE.PerspectiveCamera(25.5, 1280 / 720, 0.1, 100);
camera.position.set(-0.28, 5.13, -16.9);
camera.lookAt(-1.22, 4.78, -24.35);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(1);
renderer.setSize(1280, 720, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

let previousTime = 0;
function render(time: number): void {
  const delta = previousTime === 0 ? 0 : Math.min((time - previousTime) / 1000, 0.05);
  previousTime = time;
  world.update(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
