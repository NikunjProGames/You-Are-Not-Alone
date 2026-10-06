import * as THREE from "three";
import type { Interactable } from "../types";
import type { AtmosphereMood, EnvironmentSystem } from "../systems/EnvironmentSystem";

export interface HouseDemo {
  scene: THREE.Scene;
  characters: THREE.Group[];
  entity: THREE.Group;
  interactables: Interactable[];
  update: (delta: number) => void;
  canOccupy: (x: number, z: number, floorHeight: number) => boolean;
  floorAt: (x: number, z: number, currentHeight: number) => number | null;
  setMood: (mood: AtmosphereMood) => void;
  setDoorOpen: (open: boolean) => void;
  setBackRoomDoorOpen: (open: boolean) => void;
  setBedroomDoorOpen: (open: boolean) => void;
  setFinalDoorOpen: (open: boolean) => void;
  setWestStoreOpen: (open: boolean) => void;
  setTenantStudyOpen: (open: boolean) => void;
  setEntryDoorOpen: (open: boolean) => void;
  setMaraRoomAvailable: (available: boolean) => void;
  setMaraRoomDoorOpen: (open: boolean) => void;
  setFinaleFlicker: (active: boolean) => void;
  setEntityReveal: (amount: number) => void;
}

export function buildHouseDemo(
  environment: EnvironmentSystem,
  onDoorChange: (open: boolean) => void,
  isDoorwayOccupied: () => boolean,
  isBackDoorwayOccupied: () => boolean,
  onStoryInteraction: (id: string) => void,
  canOpenFinalDoor: () => boolean,
  isFrontDoorwayOccupied: () => boolean,
): HouseDemo {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#111619");
  scene.fog = new THREE.FogExp2("#111619", 0.027);

  const plaster = texturedMaterial("#706c63", "plaster");
  const palePlaster = texturedMaterial("#8a8373", "plaster");
  const wood = texturedMaterial("#563f32", "wood");
  const darkWood = texturedMaterial("#322820", "wood");
  const floor = texturedMaterial("#594739", "floor");
  const rug = new THREE.MeshStandardMaterial({ color: "#4a3430", roughness: 0.95 });
  const brass = new THREE.MeshStandardMaterial({ color: "#a17a45", metalness: 0.64, roughness: 0.33 });
  const cream = new THREE.MeshStandardMaterial({ color: "#b3a68c", roughness: 0.88 });
  const cloth = new THREE.MeshStandardMaterial({ color: "#46504b", roughness: 1 });
  const glass = new THREE.MeshStandardMaterial({
    color: "#7896a4",
    emissive: "#283f4a",
    emissiveIntensity: 0.5,
    roughness: 0.18,
    metalness: 0.25,
    transparent: true,
    opacity: 0.48,
  });
  const interactables: Interactable[] = [];
  const characters: THREE.Group[] = [];
  const obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }> = [];
  const storyDoors = { westStore: false, tenantStudy: false, maraRoom: false };

  const hemi = new THREE.HemisphereLight("#a9bbca", "#342b23", 0.92);
  scene.add(hemi);
  const windowLight = new THREE.DirectionalLight("#90a6b5", 1.7);
  windowLight.position.set(-4, 4.5, 1.5);
  windowLight.castShadow = true;
  windowLight.shadow.mapSize.set(512, 512);
  windowLight.shadow.camera.left = -9;
  windowLight.shadow.camera.right = 9;
  windowLight.shadow.camera.top = 8;
  windowLight.shadow.camera.bottom = -8;
  windowLight.shadow.bias = -0.0004;
  scene.add(windowLight);
  const ceilingLight = new THREE.PointLight("#d9b78a", 9, 12, 2);
  ceilingLight.position.set(1.4, 2.75, 0.5);
  ceilingLight.userData.baseIntensity = ceilingLight.intensity;
  ceilingLight.castShadow = false;
  scene.add(ceilingLight);
  environment.addPractical(ceilingLight);

  addBox(scene, floor, 12, 0.18, 11, 0, -0.12, 0.5, true);
  for (let i = 0; i < 8; i += 1) {
    addBox(scene, darkWood, 0.025, 0.008, 11, -5.15 + i * 1.47, -0.026, 0.5, false);
  }
  addBox(scene, plaster, 0.18, 3.25, 5.08, -6, 1.55, -2.46, true);
  addBox(scene, plaster, 0.18, 3.25, 3.38, -6, 1.55, 4.31, true);
  addBox(scene, plaster, 0.18, 1.03, 2.55, -6, 0.515, 1.35, true);
  addBox(scene, plaster, 0.18, 0.38, 2.55, -6, 3.06, 1.35, true);
  addBox(scene, plaster, 0.18, 3.25, 11, 6, 1.55, 0.5, true);
  addBox(scene, plaster, 4.45, 3.25, 0.18, -3.775, 1.55, 6, true);
  addBox(scene, plaster, 4.45, 3.25, 0.18, 3.775, 1.55, 6, true);
  addBox(scene, plaster, 3.1, 0.44, 0.18, 0, 2.83, 6, true);
  addBox(scene, plaster, 4.6, 3.25, 0.18, -3.7, 1.55, -5, true);
  addBox(scene, plaster, 4.6, 3.25, 0.18, 3.7, 1.55, -5, true);
  addBox(scene, plaster, 2.8, 0.65, 0.18, 0, 2.9, -5, true);
  addBox(scene, plaster, 9.3, 0.1, 11, -1.35, 3.12, 0.5, true);
  addBox(scene, plaster, 0.4, 0.1, 11, 5.8, 3.12, 0.5, true);
  addBox(scene, plaster, 2.3, 0.1, 5, 4.45, 3.12, -2.5, true);
  addBox(scene, darkWood, 12, 0.12, 0.12, 0, 2.96, 0.39, false);
  addBox(scene, darkWood, 0.12, 0.12, 11, -5.89, 2.96, 0.5, false);
  addBox(scene, darkWood, 0.12, 0.12, 11, 5.89, 2.96, 0.5, false);
  addBox(scene, darkWood, 12, 0.12, 0.12, 0, 2.96, 5.39, false);

  addBox(scene, floor, 4.2, 0.18, 7.2, 0, -0.12, -8.6, true);
  for (const z of [-6.55, -10.65]) {
    addBox(scene, plaster, 0.16, 3.25, 3.1, -2.15, 1.55, z, true);
    addBox(scene, plaster, 0.16, 3.25, 3.1, 2.15, 1.55, z, true);
  }
  addBox(scene, plaster, 1.9, 3.25, 0.18, -3.05, 1.55, -12.2, true);
  addBox(scene, plaster, 1.9, 3.25, 0.18, 3.05, 1.55, -12.2, true);
  addBox(scene, plaster, 0.95, 3.25, 0.18, -1.62, 1.55, -12.2, true);
  addBox(scene, plaster, 0.95, 3.25, 0.18, 1.62, 1.55, -12.2, true);
  addBox(scene, plaster, 2.3, 0.74, 0.18, 0, 2.76, -12.2, true);
  addBox(scene, plaster, 4.2, 0.22, 7.2, 0, 3.18, -8.6, true);
  addBox(scene, plaster, 4.2, 0.14, 7.2, 0, 3.17, -8.6, false);
  addBox(scene, darkWood, 4.2, 0.12, 0.12, 0, 2.95, -5.5, false);
  addBox(scene, darkWood, 4.2, 0.12, 0.12, 0, 2.95, -11.7, false);

  addBox(scene, floor, 8.2, 0.18, 8.05, 0, -0.12, -16.25, true);
  addBox(scene, plaster, 0.18, 3.25, 8.05, -4.1, 1.55, -16.25, true);
  addBox(scene, plaster, 0.18, 3.25, 8.05, 4.1, 1.55, -16.25, true);
  addBox(scene, plaster, 3.15, 3.25, 0.18, -2.52, 1.55, -20.2, true);
  addBox(scene, plaster, 3.15, 3.25, 0.18, 2.52, 1.55, -20.2, true);
  addBox(scene, plaster, 1.7, 0.74, 0.18, 0, 2.76, -20.2, true);
  addBox(scene, plaster, 8.2, 0.22, 8.05, 0, 3.18, -16.25, true);
  addBox(scene, darkWood, 8.2, 0.12, 0.12, 0, 2.95, -12.35, false);
  addBox(scene, darkWood, 8.2, 0.12, 0.12, 0, 2.95, -20.15, false);

  addSideWings(scene, plaster, floor, darkWood, cream, obstacles);
  addUpperStory(scene, plaster, darkWood, wood, cream);
  addExterior(scene, darkWood, wood, cream, brass, obstacles);

  addBox(scene, floor, 4.2, 0.18, 6.0, 0, -0.12, -23.2, true);
  addBox(scene, plaster, 0.16, 3.25, 6.0, -2.15, 1.55, -23.2, true);
  addBox(scene, plaster, 0.16, 3.25, 6.0, 2.15, 1.55, -23.2, true);
  addBox(scene, plaster, 1.1, 3.25, 0.18, -1.55, 1.55, -26.2, true);
  addBox(scene, plaster, 1.1, 3.25, 0.18, 1.55, 1.55, -26.2, true);
  addBox(scene, plaster, 2.1, 0.74, 0.18, 0, 2.76, -26.2, true);
  addBox(scene, plaster, 4.2, 0.22, 6.0, 0, 3.18, -23.2, true);
  addBox(scene, floor, 7.4, 0.18, 6.0, 0, -0.12, -29.2, true);
  addBox(scene, plaster, 3.6, 3.25, 0.18, -1.9, 1.55, -32.2, true);
  addBox(scene, plaster, 3.6, 3.25, 0.18, 1.9, 1.55, -32.2, true);
  addBox(scene, plaster, 0.2, 0.74, 0.18, 0, 2.76, -32.2, true);
  addBox(scene, plaster, 7.4, 0.22, 6.0, 0, 3.18, -29.2, true);
  addBox(scene, plaster, 0.16, 3.25, 6.0, -3.7, 1.55, -29.2, true);
  addBox(scene, plaster, 0.16, 3.25, 6.0, 3.7, 1.55, -29.2, true);

  addBox(scene, floor, 4, 0.18, 5.8, 4.1, -0.12, -2, true);
  addBox(scene, palePlaster, 0.14, 3.2, 1.2, 2.1, 1.5, -4.2, true);
  addBox(scene, palePlaster, 0.14, 3.2, 2.8, 2.1, 1.5, 0.6, true);
  addBox(scene, palePlaster, 4, 3.2, 0.16, 4.1, 1.5, 0.9, true);
  addBox(scene, palePlaster, 4, 0.2, 5.8, 4.1, 3.1, -2, true);

  addWindow(scene, glass, brass);
  addLivingRoom(scene, { wood, darkWood, rug, cloth, cream, brass }, obstacles);
  addKitchenNook(scene, { wood, darkWood, cream, brass }, obstacles);
  addDiningArea(scene, wood, darkWood, cream, brass, obstacles);
  addHall(scene);
  addBackBedroom(scene, { wood, darkWood, rug, cloth, cream, brass }, obstacles);
  addServiceRoomDetails(scene, wood, darkWood, cream, brass, obstacles);
  addTenantStudyDetails(scene, wood, darkWood, cloth, cream, brass, obstacles);
  const finaleLights = addFinaleRoomDetails(scene, darkWood, cream, brass);
  addLivingRoomDetails(scene, darkWood, brass);
  addLamp(scene, environment, brass);
  const backRoomLight = new THREE.PointLight("#d4bd97", 6.2, 11, 2);
  backRoomLight.position.set(0, 2.65, -15.7);
  backRoomLight.userData.baseIntensity = backRoomLight.intensity;
  scene.add(backRoomLight);
  environment.addPractical(backRoomLight);
  const housemate = createDemoFigure();
  housemate.visible = false;
  characters.push(housemate);
  const tenant = createDemoFigure("#282d32", "#797263", "#886e5d");
  tenant.position.set(-1.5, 0, 3.1);
  tenant.rotation.y = 0;
  characters.push(tenant);
  const entity = createDemoFigure("#393d3b", "#87806e", "#a18470");
  entity.name = "revealed-entity";
  entity.position.set(0, 0, -29.3);
  entity.scale.set(1.16, 1.24, 1.08);
  entity.visible = false;
  const entityFeatures = addEntityFeatures(entity);
  const humanMaterials: THREE.MeshStandardMaterial[] = [];
  const entityDark = new THREE.Color("#211b19");
  entity.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || child.parent === entityFeatures) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.userData.originalColor = material.color.clone();
        humanMaterials.push(material);
      }
    }
  });
  scene.add(entity);
  let finaleFlicker = false;
  let finaleElapsed = 0;

  const door = makeDoor(scene, wood, brass, onDoorChange, isDoorwayOccupied);
  const backRoomDoor = makePassageDoor(
    scene,
    wood,
    brass,
    (open) => window.dispatchEvent(new CustomEvent("game:back-room-door", { detail: open })),
    isBackDoorwayOccupied,
  );
  const bedroomExitDoor = makePassageDoor(
    scene,
    wood,
    brass,
    (open) => window.dispatchEvent(new CustomEvent("game:bedroom-exit-door", { detail: open })),
    () => false,
    -20.17,
  );
  const finalDoor = makeFinalDoor(scene, wood, brass, canOpenFinalDoor, onStoryInteraction);
  const entryDoor = makePassageDoor(scene, wood, brass, (open) => {
    if (open) onStoryInteraction("entry-door-opened");
  }, isFrontDoorwayOccupied, 6);

  const westDoor = makeSideDoor(scene, wood, brass, -2.15, -8.6, -1);
  const eastDoor = makeSideDoor(scene, wood, brass, 2.15, -8.6, 1);
  const westStoreDoor = makeSideDoor(scene, wood, brass, -7.35, -8.6, -1);
  const tenantStudyDoor = makeSideDoor(scene, wood, brass, 7.35, -8.6, 1);
  interactables.push({
    id: "foundation-door",
    prompt: () =>
      !door.isOpen
        ? "Open the hallway door"
        : door.canClose()
          ? "Close the hallway door"
          : "Step clear to close the door",
    object: door.panel,
    interact: () => {
      door.toggle();
    },
  });
  interactables.push(
    makeDoorInteractable("foundation-west-door", "Open the laundry door", westDoor),
    makeDoorInteractable("foundation-east-door", "Open the tenant's door", eastDoor),
    makeDoorInteractable("foundation-bedroom-exit", "Open the bedroom door", bedroomExitDoor),
  );
  const westStoreInteractable = makeDoorInteractable(
    "episode-west-store-door",
    () => storyDoors.westStore ? "Open the storage-room door" : "The storage door is locked",
    westStoreDoor,
  );
  const tenantStudyInteractable = makeDoorInteractable(
    "episode-tenant-study-door",
    () => storyDoors.tenantStudy ? "Open the tenant's study door" : "The study door is locked",
    tenantStudyDoor,
  );
  westStoreInteractable.enabled = () => storyDoors.westStore;
  tenantStudyInteractable.enabled = () => storyDoors.tenantStudy;
  interactables.push(westStoreInteractable, tenantStudyInteractable);
  interactables.push(finalDoor.interactable);
  interactables.push(makeDoorInteractable(
    "episode-entry-door",
    () => entryDoor.isOpen ? "Close the front door" : "Open the front door",
    entryDoor,
  ));
  addEpisodeProps(scene, interactables, onStoryInteraction, [
    { id: "bills", position: [-0.42, 0.61, 0.12], color: "#b8aa8f", size: [0.42, 0.018, 0.3] },
    { id: "fire-photo", position: [-5.53, 1.1, -1.78], color: "#6b6050", size: [0.08, 0.48, 0.38] },
    { id: "laundry-blood", position: [-4.9, 0.08, -6.2], color: "#664b42", size: [0.25, 0.06, 0.28] },
    { id: "loose-valve", position: [-5.9, 0.72, -7.55], color: "#87908a", size: [0.18, 0.18, 0.18] },
    { id: "strange-person-key", position: [-9.45, 0.94, -9.45], color: "#a17a45", size: [0.24, 0.035, 0.12] },
    { id: "tenant-ledger", position: [5.1, 1.0, -10.6], color: "#62574b", size: [0.36, 0.045, 0.26] },
    { id: "lease-copy", position: [5.9, 1.04, -10.75], color: "#b9ad98", size: [0.3, 0.018, 0.22] },
    { id: "tenant-audio", position: [9.55, 1.1, -10.45], color: "#292d2d", size: [0.32, 0.18, 0.12] },
    { id: "sealed-note", position: [11.35, 0.98, -7.0], color: "#b8aa8f", size: [0.21, 0.025, 0.15] },
    { id: "mirror-mark", position: [3.82, 2.0, -17.8], color: "#6f8180", size: [0.05, 0.6, 0.36] },
    { id: "housemate-letter", position: [-10.55, 1.75, -10.55], color: "#b8aa8f", size: [0.24, 0.018, 0.18] },
    { id: "wet-footprints", position: [0.9, 0.045, -6.8], color: "#332f2c", size: [0.14, 0.012, 0.3] },
    { id: "burned-key", position: [-1.6, 0.8, -17.2], color: "#786247", size: [0.18, 0.03, 0.06] },
    { id: "friend-token", position: [-1.7, 0.76, -24.0], color: "#99845f", size: [0.13, 0.045, 0.13] },
    { id: "rest", position: [-3.45, 4.07, 2.45], color: "#b9ad98", size: [0.18, 0.025, 0.12] },
    { id: "stone", position: [1.15, 0.13, -24.8], color: "#77736c", size: [0.34, 0.22, 0.28] },
  ]);
  interactables.push({
    id: "foundation-back-room-door",
    prompt: () =>
      !backRoomDoor.isOpen
        ? "Open the bedroom door"
        : backRoomDoor.canClose()
          ? "Close the bedroom door"
          : "Step clear to close the bedroom door",
    object: backRoomDoor.panel,
    interact: backRoomDoor.toggle,
  });

  const note = makeNote(scene);
  interactables.push({
    id: "episode-move-in-note",
    prompt: "Read the note",
    object: note,
    interact: () => onStoryInteraction("move-in-note"),
  });

  const figureRoot = characters[0];
  if (figureRoot) {
    interactables.push({
      id: "episode-housemate",
      prompt: "Speak to the person in the hall",
      object: figureRoot,
      enabled: () => figureRoot.visible,
      interact: () => onStoryInteraction("housemate"),
    });
  }
  const tenantFigure = characters[1];
  if (tenantFigure) {
    interactables.push({
      id: "episode-tenant",
      prompt: "Speak with the tenant",
      object: tenantFigure,
      enabled: () => tenantFigure.visible,
      interact: () => onStoryInteraction("tenant"),
    });
  }
  const upstairsDoor = makeUpperBedroomDoor(scene, darkWood, wood, brass, onStoryInteraction);
  interactables.push(upstairsDoor.interactable);

  return {
    scene,
    characters,
    interactables,
    update: (delta) => {
      door.update(delta);
      backRoomDoor.update(delta);
      bedroomExitDoor.update(delta);
      westDoor.update(delta);
      eastDoor.update(delta);
      westStoreDoor.update(delta);
      tenantStudyDoor.update(delta);
      finalDoor.update(delta);
      entryDoor.update(delta);
      upstairsDoor.update(delta);
      if (finaleFlicker) {
        finaleElapsed += delta;
        const flicker = Math.sin(finaleElapsed * 31) > 0.74 ? 0.08 : 0.45 + Math.max(0, Math.sin(finaleElapsed * 12)) * 0.72;
        finaleLights.forEach((light) => {
          light.intensity = light.userData.baseIntensity * flicker;
        });
      }
    },
    floorAt: (x, z, currentHeight) => {
      const onStair = x > 3.55 && x < 5.55 && z > -0.35 && z < 4.95;
      if (onStair) return THREE.MathUtils.clamp((4.8 - z) / 4.6, 0, 1) * 3.16;
      if (entryDoor.isOpen && x > -1.3 && x < 1.3 && z > 5.55 && z < 6.55) return 0;
      if (currentHeight > 2.2 && x > -5.72 && x < 5.72 && z > -4.72 && z < 5.72) return 3.16;
      if (x > -5.72 && x < 5.72 && z > -4.72 && z < 5.72) return 0;
      const inGarden = x > -9 && x < 9 && z > 6.25 && z < 15.5;
      if (inGarden) return 0;
      return null;
    },
    canOccupy: (x, z, floorHeight) => {
      const upstairs = floorHeight > 2.2;
      if (upstairs) {
        const frontRoom = z > 0.24 && z < 5.72;
        const rearRoom = z > -4.72 && z < -0.24;
        const upstairsDoorway = upstairsDoor.isOpen && x > -3.62 && x < -1.18 && z >= -0.24 && z <= 0.24;
        const stairApproach = x > 3.55 && x < 5.55 && z > -0.35 && z < 0.34;
        return frontRoom || rearRoom || upstairsDoorway || stairApproach;
      }
      const inLivingRoom = x > -5.72 && x < 5.72 && z > -4.72 && z < 5.72;
      const hallwayBackLimit = backRoomDoor.isOpen ? -12.48 : -12.0;
      const inHallway = x > -1.88 && x < 1.88 && z > hallwayBackLimit && z < -5.28;
      const inNook = x > 2.28 && x < 5.75 && z > -4.7 && z < 0.65;
      const passesDoor = door.isOpen && x > -1.3 && x < 1.3 && z > -5.55 && z < -4.45;
      const inLaundry = westDoor.isOpen && x > -7.2 && x < -2.28 && z > -11.65 && z < -5.55;
      const inTenantRoom = eastDoor.isOpen && x > 2.28 && x < 7.2 && z > -11.65 && z < -5.55;
      const inUtilityStore = westStoreDoor.isOpen && westDoor.isOpen && x > -12.45 && x < -7.45 && z > -11.55 && z < -5.65;
      const inTenantStudy = tenantStudyDoor.isOpen && eastDoor.isOpen && x > 7.45 && x < 12.45 && z > -11.55 && z < -5.65;
      const inBackRoom = backRoomDoor.isOpen && x > -3.95 && x < 3.95 && z > -20 && z < -12.25;
      const passesBackRoomDoor =
        backRoomDoor.isOpen && x > -1.13 && x < 1.13 && z > -12.52 && z < -12.05;
      const inEscapeHall = bedroomExitDoor.isOpen && x > -1.9 && x < 1.9 && z > -26 && z < -20.25;
      const passesBedroomExit = bedroomExitDoor.isOpen && x > -1.1 && x < 1.1 && z > -20.35 && z < -19.95;
      const inFinalRoom = finalDoor.isOpen && x > -3.5 && x < 3.5 && z > -32 && z < -26.25;
      const passesFinalDoor = finalDoor.isOpen && x > -1.15 && x < 1.15 && z > -26.35 && z < -25.95;
      const throughLaundry = westDoor.isOpen && x > -2.48 && x < -1.75 && z > -9.45 && z < -7.75;
      const throughTenantDoor = eastDoor.isOpen && x > 1.75 && x < 2.48 && z > -9.45 && z < -7.75;
      const throughWestStore = westDoor.isOpen && westStoreDoor.isOpen && x > -7.72 && x < -7.0 && z > -9.45 && z < -7.75;
      const throughTenantStudy = eastDoor.isOpen && tenantStudyDoor.isOpen && x > 7.0 && x < 7.72 && z > -9.45 && z < -7.75;
      const outsideFrontDoor = entryDoor.isOpen && x > -1.3 && x < 1.3 && z > 5.55 && z < 6.55;
      const inGarden = x > -8.75 && x < 8.75 && z > 6.25 && z < 15.5;
      if (!(inLivingRoom || inHallway || inNook || passesDoor || outsideFrontDoor || inGarden || inBackRoom || passesBackRoomDoor || inLaundry || inTenantRoom || inUtilityStore || inTenantStudy || inEscapeHall || passesBedroomExit || inFinalRoom || passesFinalDoor || throughLaundry || throughTenantDoor || throughWestStore || throughTenantStudy)) {
        return false;
      }
      return floorHeight > 2.2 || !obstacles.some(
        (box) => x > box.minX - 0.24 && x < box.maxX + 0.24 && z > box.minZ - 0.24 && z < box.maxZ + 0.24,
      );
    },
    setMood: (mood) => environment.setMood(mood),
    setDoorOpen: (open) => door.setOpen(open),
    setEntryDoorOpen: (open) => entryDoor.setOpen(open),
    setBackRoomDoorOpen: (open) => backRoomDoor.setOpen(open),
    setBedroomDoorOpen: (open) => bedroomExitDoor.setOpen(open),
    setFinalDoorOpen: (open) => finalDoor.setOpen(open),
    setWestStoreOpen: (open) => {
      storyDoors.westStore = open;
      westStoreDoor.setOpen(open);
    },
    setTenantStudyOpen: (open) => {
      storyDoors.tenantStudy = open;
      tenantStudyDoor.setOpen(open);
    },
    setMaraRoomAvailable: (available) => {
      storyDoors.maraRoom = available;
      scene.userData.maraRoomAvailable = available;
    },
    setMaraRoomDoorOpen: (open) => upstairsDoor.setOpen(open),
    setFinaleFlicker: (active) => {
      finaleFlicker = active;
      if (!active) finaleLights.forEach((light) => {
        light.intensity = light.userData.baseIntensity;
      });
    },
    setEntityReveal: (amount) => {
      const reveal = THREE.MathUtils.clamp(amount, 0, 1);
      entity.visible = finaleFlicker || reveal > 0;
      entity.scale.set(
        THREE.MathUtils.lerp(1.05, 1.42, reveal),
        THREE.MathUtils.lerp(1.05, 1.58, reveal),
        THREE.MathUtils.lerp(1.05, 1.18, reveal),
      );
      entity.rotation.z = reveal * 0.075;
      entityFeatures.visible = reveal > 0.28;
      for (const material of humanMaterials) {
        const original = material.userData.originalColor as THREE.Color;
        material.color.copy(original).lerp(entityDark, reveal);
        material.emissive.set("#250805").multiplyScalar(reveal * 0.42);
      }
    },
    entity,
  };
}

function addUpperStory(
  scene: THREE.Scene,
  plaster: THREE.Material,
  darkWood: THREE.Material,
  wood: THREE.Material,
  cream: THREE.Material,
): void {
  for (const x of [-5.92, 5.92]) {
    addBox(scene, plaster, 0.16, 3.15, 11.7, x, 4.83, 0.45, true);
  }
  addBox(scene, plaster, 12, 3.15, 0.16, 0, 4.83, -4.98, true);
  addBox(scene, plaster, 4.45, 3.15, 0.16, -3.775, 4.83, 5.98, true);
  addBox(scene, plaster, 4.45, 3.15, 0.16, 3.775, 4.83, 5.98, true);
  addBox(scene, plaster, 3.1, 0.44, 0.16, 0, 6.11, 5.98, true);

  addBox(scene, plaster, 2.6, 3.15, 0.14, -4.9, 4.83, 0.1, true);
  addBox(scene, plaster, 4.1, 3.15, 0.14, 0.95, 4.83, 0.1, true);
  addBox(scene, darkWood, 5.2, 0.09, 0.12, 0, 3.34, -4.7, false);
  addBox(scene, darkWood, 5.2, 0.09, 0.12, 0, 3.34, 4.7, false);

  for (let index = 0; index < 14; index += 1) {
    const stepZ = 4.55 - index * 0.32;
    const stepY = 0.12 + index * 0.225;
    addBox(scene, wood, 1.72, 0.13, 0.38, 4.55, stepY, stepZ, true);
  }
  const railMaterial = new THREE.MeshStandardMaterial({ color: "#49382c", roughness: 0.86 });
  for (const x of [3.62, 5.48]) {
    const rail = addBox(scene, railMaterial, 0.075, 0.075, 5.1, x, 1.72, 2.42, true);
    rail.rotation.x = 0.60;
    for (let index = 0; index < 7; index += 1) {
      addBox(scene, railMaterial, 0.06, 0.96, 0.06, x, 0.7 + index * 0.43, 4.45 - index * 0.67, false);
    }
  }
  const upperBed = new THREE.MeshStandardMaterial({ color: "#51564f", roughness: 0.98 });
  addBox(scene, darkWood, 2.05, 0.48, 2.15, -3.6, 3.43, 3.0, true);
  addBox(scene, cream, 2.0, 0.2, 2.08, -3.6, 3.76, 3.0, true);
  addBox(scene, upperBed, 1.98, 0.16, 1.25, -3.6, 3.88, 2.55, true);
  addBox(scene, cream, 1.0, 0.18, 0.58, -3.6, 3.88, 3.77, false);
  addBox(scene, darkWood, 0.7, 0.76, 0.58, -1.95, 3.56, 4.05, true);
  addBox(scene, wood, 1.25, 0.92, 0.55, -5.0, 3.65, -3.85, true);
  addBox(scene, cream, 1.3, 0.08, 0.6, -5.0, 4.14, -3.85, false);
  addBox(scene, darkWood, 1.8, 0.16, 0.55, 3.1, 3.34, -3.9, true);
  addBox(scene, cream, 0.82, 0.68, 0.7, 3.1, 3.72, -3.9, true);
}

function addExterior(
  scene: THREE.Scene,
  darkWood: THREE.Material,
  wood: THREE.Material,
  cream: THREE.Material,
  brass: THREE.Material,
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
): void {
  const lawn = new THREE.MeshStandardMaterial({ color: "#37423a", roughness: 1 });
  const path = new THREE.MeshStandardMaterial({ color: "#71685b", roughness: 0.98 });
  const leaves = new THREE.MeshStandardMaterial({ color: "#455640", roughness: 1 });
  addBox(scene, lawn, 20, 0.16, 12, 0, -0.18, 11.7, false);
  addBox(scene, path, 2.35, 0.06, 7.8, 0, -0.06, 9.85, false);
  addBox(scene, wood, 6.2, 0.2, 1.9, 0, -0.08, 6.95, true);
  addBox(scene, darkWood, 0.18, 0.72, 0.18, -2.8, 0.28, 7.2, false);
  addBox(scene, darkWood, 0.18, 0.72, 0.18, 2.8, 0.28, 7.2, false);
  addBox(scene, wood, 5.6, 0.11, 0.12, 0, 0.62, 7.2, false);
  addBox(scene, darkWood, 2.35, 0.96, 0.78, -1.5, 0.5, 4.45, true);
  addBox(scene, wood, 2.45, 0.1, 0.88, -1.5, 1.01, 4.45, true);
  addBox(scene, brass, 0.72, 0.36, 0.045, -1.5, 2.1, 5.88, false);
  obstacles.push({ minX: -2.75, maxX: -0.25, minZ: 4.0, maxZ: 4.9 });

  for (const side of [-1, 1]) {
    for (let index = 0; index < 13; index += 1) {
      const z = 7.1 + index * 0.68;
      addBox(scene, darkWood, 0.13, 1.15, 0.13, side * 8.85, 0.5, z, false);
      if (index < 12) addBox(scene, wood, 0.1, 0.12, 0.68, side * 8.85, 0.28, z + 0.34, false);
    }

    for (const x of [side * 6.6, side * 7.6]) {
      const planter = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 8), leaves);
      planter.scale.y = 0.62;
      planter.position.set(x, 0.35, 8.1);
      scene.add(planter);
    }
  }
  for (let index = 0; index < 19; index += 1) {
    const x = -8.85 + index * 0.98;
    if (Math.abs(x) < 1.4) continue;
    addBox(scene, darkWood, 0.13, 1.15, 0.13, x, 0.5, 15.35, false);
    if (index < 18) addBox(scene, wood, 0.98, 0.12, 0.1, x + 0.49, 0.28, 15.35, false);
  }
  const mailbox = new THREE.MeshStandardMaterial({ color: "#343a3a", metalness: 0.34, roughness: 0.64 });
  addBox(scene, mailbox, 0.52, 0.36, 0.42, -3.9, 1.08, 12.5, false);
  addBox(scene, darkWood, 0.09, 1.08, 0.09, -3.9, 0.54, 12.5, false);

  for (const x of [-4.8, 4.8]) {
    addBox(scene, wood, 1.35, 1.45, 0.12, x, 1.55, 5.88, false);
    addBox(scene, cream, 1.12, 1.22, 0.045, x, 1.55, 5.78, false);
    addBox(scene, darkWood, 0.08, 1.26, 0.08, x, 1.55, 5.73, false);
  }
  const roof = new THREE.MeshStandardMaterial({ color: "#393b39", roughness: 0.91 });
  const leftRoof = addBox(scene, roof, 6.55, 0.18, 12.1, -3.1, 6.27, 0.5, true);
  leftRoof.rotation.z = 0.19;
  const rightRoof = addBox(scene, roof, 6.55, 0.18, 12.1, 3.1, 6.27, 0.5, true);
  rightRoof.rotation.z = -0.19;
}

function addDiningArea(
  scene: THREE.Scene,
  wood: THREE.Material,
  darkWood: THREE.Material,
  cream: THREE.Material,
  brass: THREE.Material,
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
): void {
  addBox(scene, darkWood, 1.55, 0.12, 1.3, 4.15, 0.77, -2.6, true);
  for (const x of [3.55, 4.75]) {
    for (const z of [-3.05, -2.15]) addBox(scene, wood, 0.08, 0.74, 0.08, x, 0.37, z, true);
  }
  for (const [x, z] of [[3.0, -2.6], [5.25, -2.6], [4.15, -3.65], [4.15, -1.55]]) {
    addBox(scene, wood, 0.56, 0.54, 0.56, x, 0.28, z, true);
    addBox(scene, cream, 0.6, 0.09, 0.6, x, 0.58, z, false);
  }
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.025, 20), cream);
  plate.position.set(3.8, 0.85, -2.6);
  scene.add(plate);
  addBox(scene, brass, 0.5, 0.06, 0.34, 4.5, 0.86, -2.55, false);
  addBox(scene, darkWood, 0.85, 0.08, 0.5, 5.1, 0.72, -4.0, true);
  obstacles.push(
    { minX: 3.12, maxX: 5.14, minZ: -3.55, maxZ: -1.65 },
    { minX: 4.7, maxX: 5.6, minZ: -4.35, maxZ: -3.65 },
  );
}

function addLivingRoom(
  scene: THREE.Scene,
  mats: { wood: THREE.Material; darkWood: THREE.Material; rug: THREE.Material; cloth: THREE.Material; cream: THREE.Material; brass: THREE.Material },
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
): void {
  addBox(scene, mats.rug, 5.4, 0.03, 4.2, 0.1, 0.005, 1.2, false);
  addTable(scene, mats.darkWood, mats.brass, -0.15, 0.46, 0.15, 1.15, 0.12);
  addBox(scene, mats.wood, 2.8, 0.95, 0.22, -3.9, 0.49, -1.3, true);
  addBox(scene, mats.wood, 0.18, 0.48, 0.85, -5.22, 0.24, -1.3, false);
  addBox(scene, mats.wood, 0.18, 0.48, 0.85, -2.58, 0.24, -1.3, false);
  addBox(scene, mats.cloth, 2.2, 0.55, 0.95, -3.9, 0.9, -1.55, true);
  addBox(scene, mats.cloth, 0.38, 1.18, 0.98, -5.02, 0.61, -1.4, true);
  addBox(scene, mats.cloth, 0.38, 1.18, 0.98, -2.78, 0.61, -1.4, true);
  addBox(scene, mats.cloth, 2.7, 0.3, 0.23, -3.9, 1.48, -2.12, false);
  obstacles.push({ minX: -5.35, maxX: -2.45, minZ: -2.18, maxZ: -0.94 });

  addBox(scene, mats.darkWood, 0.95, 1.55, 0.12, 5.45, 0.78, -1.6, true);
  for (let index = 0; index < 4; index += 1) {
    addBox(scene, mats.wood, 1.02, 0.055, 0.25, 5.42, 0.38 + index * 0.35, -1.45, false);
  }
  addLivingRoomLateDetails(scene, mats, obstacles);
}

  function addSideWings(
    scene: THREE.Scene,
    plaster: THREE.Material,
    floor: THREE.Material,
    wood: THREE.Material,
    cream: THREE.Material,
    obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
  ): void {
    for (const side of [-1, 1]) {
      const innerCenter = side * 4.75;
      const outerCenter = side * 10;
      addBox(scene, floor, 5.15, 0.18, 6.2, innerCenter, -0.12, -8.6, true);
      addBox(scene, floor, 5.15, 0.18, 6.2, outerCenter, -0.12, -8.6, true);
      addBox(scene, plaster, 0.16, 3.25, 1.98, side * 2.15, 1.55, -10.72, true);
      addBox(scene, plaster, 0.16, 3.25, 1.98, side * 2.15, 1.55, -6.48, true);
      addBox(scene, plaster, 0.16, 3.25, 6.2, side * 12.55, 1.55, -8.6, true);
      addBox(scene, plaster, 5.15, 3.25, 0.16, innerCenter, 1.55, -5.5, true);
      addBox(scene, plaster, 5.15, 3.25, 0.16, innerCenter, 1.55, -11.7, true);
      addBox(scene, plaster, 5.15, 3.25, 0.16, outerCenter, 1.55, -5.5, true);
      addBox(scene, plaster, 5.15, 3.25, 0.16, outerCenter, 1.55, -11.7, true);
      addBox(scene, plaster, 0.16, 3.25, 1.98, side * 7.35, 1.55, -10.72, true);
      addBox(scene, plaster, 0.16, 3.25, 1.98, side * 7.35, 1.55, -6.48, true);
      addBox(scene, plaster, 0.16, 0.74, 0.18, side * 2.15, 2.76, -8.6, true);
      addBox(scene, plaster, 0.16, 0.74, 0.18, side * 7.35, 2.76, -8.6, true);
    }

    addBox(scene, wood, 1.35, 0.13, 0.62, -4.7, 0.86, -5.98, true);
    addBox(scene, cream, 0.58, 0.75, 0.52, -5.2, 0.37, -5.98, true);
    addBox(scene, wood, 0.18, 1.28, 2.25, -6.55, 0.64, -9.65, true);
    addBox(scene, cream, 0.9, 0.82, 0.68, 4.85, 0.41, -6.05, true);
    addBox(scene, wood, 1.8, 0.12, 0.78, 9.7, 0.96, -9.4, true);
    addBox(scene, wood, 0.12, 0.95, 0.12, 9.0, 0.47, -9.4, true);
    addBox(scene, wood, 0.12, 0.95, 0.12, 10.4, 0.47, -9.4, true);
    addBox(scene, cream, 0.62, 0.92, 0.62, -9.3, 0.46, -6.55, true);
    addBox(scene, wood, 1.55, 0.1, 0.62, -9.3, 0.98, -6.55, true);
    const sconceMaterial = new THREE.MeshStandardMaterial({
      color: "#d0ad7a",
      emissive: "#79502c",
      emissiveIntensity: 0.55,
    });
    for (const x of [-4.75, 4.75, -10, 10]) {
      const lamp = new THREE.PointLight("#d0a775", 2.4, 5.4, 2);
      lamp.position.set(x, 2.24, -8.4);
      scene.add(lamp);
      addBox(scene, sconceMaterial, 0.08, 0.28, 0.11, x, 2.25, -8.4, false);
    }
    obstacles.push(
      { minX: -5.45, maxX: -3.95, minZ: -6.45, maxZ: -5.5 },
      { minX: -6.8, maxX: -6.3, minZ: -10.8, maxZ: -8.5 },
      { minX: 4.3, maxX: 5.4, minZ: -6.5, maxZ: -5.55 },
      { minX: 8.85, maxX: 10.55, minZ: -10.05, maxZ: -8.75 },
      { minX: -9.75, maxX: -8.85, minZ: -7.0, maxZ: -6.1 },
    );
  }

  function addServiceRoomDetails(
    scene: THREE.Scene,
    wood: THREE.Material,
    darkWood: THREE.Material,
    cream: THREE.Material,
    brass: THREE.Material,
    obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
  ): void {
    addBox(scene, darkWood, 1.8, 1.7, 0.55, -10.55, 0.85, -10.55, true);
    for (let index = 0; index < 3; index += 1) {
      addBox(scene, cream, 0.35, 0.36, 0.3, -10.88 + index * 0.36, 1.35, -10.23, false);
    }
    addBox(scene, wood, 1.6, 0.09, 0.65, -9.9, 0.95, -6.05, true);
    addBox(scene, brass, 0.16, 0.025, 0.12, -9.3, 1.01, -6.05, false);
    addBox(scene, wood, 0.035, 0.82, 0.035, -5.95, 0.42, -7.58, false);
    addBox(scene, brass, 0.34, 0.07, 0.07, -5.78, 0.69, -7.58, false);
    addBox(scene, cream, 0.78, 0.9, 0.7, -3.45, 0.45, -10.55, true);
    const washerWindow = new THREE.Mesh(
      new THREE.CircleGeometry(0.23, 20),
      new THREE.MeshStandardMaterial({ color: "#414a49", metalness: 0.3, roughness: 0.45 }),
    );
    washerWindow.position.set(-3.45, 0.45, -10.19);
    scene.add(washerWindow);
    addBox(scene, darkWood, 1.45, 0.82, 0.62, -5.65, 0.41, -10.55, true);
    addBox(scene, cream, 1.55, 0.08, 0.69, -5.65, 0.86, -10.55, true);

    addBox(scene, cream, 1.8, 0.54, 0.76, -10.65, 0.27, -6.65, true);
    addBox(scene, cream, 1.92, 0.1, 0.86, -10.65, 0.58, -6.65, true);
    addBox(scene, cream, 0.68, 0.82, 0.7, -8.2, 0.41, -6.8, true);
    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.18, 18),
      cream,
    );
    basin.position.set(-8.2, 0.92, -6.8);
    scene.add(basin);
    obstacles.push(
      { minX: -3.95, maxX: -2.95, minZ: -10.98, maxZ: -10.08 },
      { minX: -6.5, maxX: -4.8, minZ: -10.95, maxZ: -10.1 },
      { minX: -11.7, maxX: -9.6, minZ: -7.15, maxZ: -6.15 },
      { minX: -8.65, maxX: -7.75, minZ: -7.3, maxZ: -6.3 },
    );
    const broomHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 1.18, 8),
      new THREE.MeshStandardMaterial({ color: "#785b3d", roughness: 0.95 }),
    );
    broomHandle.position.set(-6.35, 0.62, -6.05);
    broomHandle.rotation.z = -0.14;
    scene.add(broomHandle);
    addBox(
      scene,
      new THREE.MeshStandardMaterial({ color: "#82654b", roughness: 1 }),
      0.35,
      0.14,
      0.1,
      -6.42,
      0.08,
      -6.05,
      false,
    );
  }

  function addTenantStudyDetails(
    scene: THREE.Scene,
    wood: THREE.Material,
    darkWood: THREE.Material,
    cloth: THREE.Material,
    cream: THREE.Material,
    brass: THREE.Material,
    obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
  ): void {
    const blanket = new THREE.MeshStandardMaterial({ color: "#4b514c", roughness: 0.98 });
    addBox(scene, darkWood, 1.7, 0.4, 2.1, 4.95, 0.3, -7.3, true);
    addBox(scene, cream, 1.65, 0.17, 2.02, 4.95, 0.57, -7.3, true);
    addBox(scene, blanket, 1.64, 0.18, 1.1, 4.95, 0.69, -7.76, true);
    addBox(scene, darkWood, 1.8, 1.0, 0.58, 6.55, 0.5, -10.65, true);
    addBox(scene, wood, 1.88, 0.1, 0.64, 6.55, 1.05, -10.65, true);
    addBox(scene, darkWood, 1.65, 0.84, 0.62, 5.55, 0.42, -10.85, true);
    addBox(scene, wood, 1.72, 0.11, 0.68, 5.55, 0.91, -10.85, true);
    addBox(scene, darkWood, 2.3, 0.13, 0.95, 9.55, 0.96, -10.55, true);
    addBox(scene, darkWood, 0.13, 0.92, 0.82, 8.65, 0.46, -10.55, true);
    addBox(scene, darkWood, 0.13, 0.92, 0.82, 10.45, 0.46, -10.55, true);
    addBox(scene, cloth, 0.22, 0.38, 0.36, 9.4, 1.22, -10.45, false);
    addBox(scene, wood, 0.58, 0.09, 0.42, 11.35, 0.9, -7.0, true);
    for (let index = 0; index < 3; index += 1) {
      addBox(scene, brass, 0.045, 0.22, 0.035, 11.1 + index * 0.2, 0.98, -6.97, false);
    }
    obstacles.push(
      { minX: 4.0, maxX: 5.9, minZ: -8.45, maxZ: -6.1 },
      { minX: 6.0, maxX: 7.1, minZ: -11.0, maxZ: -10.3 },
    );
  }

  function addFinaleRoomDetails(
    scene: THREE.Scene,
    darkWood: THREE.Material,
    cream: THREE.Material,
    brass: THREE.Material,
  ): THREE.PointLight[] {
    addBox(scene, darkWood, 3.6, 2.2, 0.32, 0, 1.1, -31.7, true);
    addBox(scene, cream, 0.12, 1.3, 0.035, 0, 1.6, -31.51, false);
    const lights: THREE.PointLight[] = [];
    for (const x of [-2.8, 2.8]) {
      const pool = new THREE.PointLight("#8b5541", 1.4, 4.5, 2);
      pool.position.set(x, 2.1, -28.6);
      pool.userData.baseIntensity = pool.intensity;
      scene.add(pool);
      lights.push(pool);
    }
    const overhead = new THREE.PointLight("#cbbca0", 4.5, 9, 2);
    overhead.position.set(0, 2.8, -29.25);
    overhead.userData.baseIntensity = overhead.intensity;
    overhead.castShadow = true;
    scene.add(overhead);
    lights.push(overhead);
    addBox(scene, brass, 0.05, 2.4, 0.05, -3.2, 1.2, -27.2, false);
    addBox(scene, brass, 0.05, 2.4, 0.05, 3.2, 1.2, -27.2, false);

    const restraint = new THREE.MeshStandardMaterial({ color: "#55483a", roughness: 0.96 });
    addBox(scene, darkWood, 0.95, 0.16, 0.86, -1.9, 0.56, -30.65, true);
    for (const x of [-2.34, -1.46]) {
      addBox(scene, darkWood, 0.11, 1.05, 0.11, x, 0.66, -30.98, true);
      addBox(scene, restraint, 0.08, 0.035, 0.55, x, 1.03, -30.73, false);
    }
    addBox(scene, darkWood, 1.0, 0.12, 0.1, -1.9, 1.02, -30.98, false);
    const loopMaterial = restraint;
    for (const x of [-2.3, -1.5]) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.014, 7, 16), loopMaterial);
      loop.position.set(x, 0.78, -30.41);
      loop.rotation.y = Math.PI / 2;
      scene.add(loop);
    }
    return lights;
  }

  function addEpisodeProps(
    scene: THREE.Scene,
    interactables: Interactable[],
    onStoryInteraction: (id: string) => void,
    props: Array<{
      id: string;
      position: [number, number, number];
      color: string;
      size: [number, number, number];
    }>,
  ): void {
    for (const prop of props) {
      const object = prop.id === "stone"
        ? new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.2, 1),
          new THREE.MeshStandardMaterial({ color: prop.color, roughness: 0.98 }),
        )
        : new THREE.Mesh(
          new THREE.BoxGeometry(...prop.size),
          new THREE.MeshStandardMaterial({ color: prop.color, roughness: 0.92 }),
        );
      if (prop.id === "stone") object.scale.set(1.4, 0.68, 1.1);
      object.position.set(...prop.position);
      object.castShadow = true;
      object.userData.storyProp = prop.id;
      scene.add(object);
      interactables.push({
        id: `episode-${prop.id}`,
        prompt: `Inspect ${prop.id.replaceAll("-", " ")}`,
        object,
        interact: () => onStoryInteraction(prop.id),
      });
    }
  }

function addLivingRoomLateDetails(
  scene: THREE.Scene,
  mats: { wood: THREE.Material; darkWood: THREE.Material; rug: THREE.Material; cloth: THREE.Material; cream: THREE.Material; brass: THREE.Material },
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
): void {
  for (let index = 0; index < 9; index += 1) {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.13 + (index % 3) * 0.04, 0.28 + (index % 4) * 0.035, 0.18),
      new THREE.MeshStandardMaterial({
        color: ["#5d4c40", "#697064", "#705149", "#9a805d"][index % 4],
        roughness: 0.92,
      }),
    );
    book.position.set(5.01 + (index % 5) * 0.19, 0.55 + Math.floor(index / 5) * 0.68, -1.43);
    book.rotation.z = (index % 2 ? 1 : -1) * 0.035;
    scene.add(book);
  }

  addBox(scene, mats.darkWood, 0.18, 0.62, 2.35, -4.6, 0.31, 2.9, true);
  addBox(scene, mats.darkWood, 1.9, 0.12, 0.18, -4.55, 0.75, 1.9, false);
  addBox(scene, mats.darkWood, 1.9, 0.12, 0.18, -4.55, 0.75, 3.95, false);
  addBox(scene, mats.cream, 0.12, 0.42, 0.32, -4.58, 0.95, 1.94, false);
  addBox(scene, mats.cream, 0.12, 0.42, 0.32, -4.58, 0.95, 3.85, false);
  addBox(scene, mats.wood, 0.85, 0.82, 0.76, 4.65, 0.41, 3.55, true);
  addBox(scene, mats.cream, 0.92, 0.06, 0.8, 4.65, 0.84, 3.55, false);
  obstacles.push({ minX: 3.95, maxX: 5.2, minZ: 3.05, maxZ: 4.05 });
}

function addLivingRoomDetails(
  scene: THREE.Scene,
  wood: THREE.Material,
  brass: THREE.Material,
): void {
  const frame = new THREE.MeshStandardMaterial({ color: "#342c25", roughness: 0.84 });
  const painting = new THREE.MeshStandardMaterial({
    color: "#74766e",
    roughness: 0.96,
    emissive: "#232621",
    emissiveIntensity: 0.12,
  });
  addBox(scene, frame, 0.12, 1.28, 0.96, 5.82, 2.12, 1.0, false);
  addBox(scene, painting, 0.035, 1.05, 0.72, 5.74, 2.12, 1.0, false);
  addBox(scene, frame, 0.12, 0.045, 1.0, 5.72, 1.43, 1.0, false);
  addBox(scene, frame, 0.12, 0.045, 1.0, 5.72, 2.81, 1.0, false);

  const pictureHouse = new THREE.MeshStandardMaterial({ color: "#444940", roughness: 0.98 });
  addBox(scene, pictureHouse, 0.018, 0.38, 0.28, 5.69, 2.1, 1.0, false);
  const pictureRoof = new THREE.MeshStandardMaterial({ color: "#353733", roughness: 1 });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.23, 4), pictureRoof);
  roof.position.set(5.67, 2.39, 1.0);
  roof.rotation.y = Math.PI / 4;
  roof.rotation.z = Math.PI / 2;
  scene.add(roof);

  const shade = new THREE.MeshStandardMaterial({ color: "#c0ae8b", roughness: 0.9 });
  addBox(scene, wood, 0.6, 0.8, 0.52, 5.28, 0.4, 4.52, true);
  addBox(scene, wood, 0.68, 0.08, 0.58, 5.28, 0.84, 4.52, false);
  addBox(scene, brass, 0.07, 0.04, 0.05, 5.28, 0.47, 4.24, false);
  const tableLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.31, 0.39, 18), shade);
  tableLamp.position.set(5.28, 1.1, 4.52);
  scene.add(tableLamp);
  const tableLampLight = new THREE.PointLight("#c79662", 2.3, 4.7, 2);
  tableLampLight.position.set(5.28, 1.28, 4.52);
  scene.add(tableLampLight);

  const chandelierStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.3, 10), brass);
  chandelierStem.position.set(-0.55, 2.91, 0.25);
  scene.add(chandelierStem);
  const chandelier = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.22, 0.2, 18, 1, true), shade);
  chandelier.position.set(-0.55, 2.72, 0.25);
  scene.add(chandelier);
}

function addKitchenNook(
  scene: THREE.Scene,
  mats: { wood: THREE.Material; darkWood: THREE.Material; cream: THREE.Material; brass: THREE.Material },
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
): void {
  addBox(scene, mats.wood, 2.9, 0.14, 0.62, 4.05, 0.94, -3.65, true);
  for (let index = 0; index < 4; index += 1) {
    const x = 2.94 + index * 0.73;
    addBox(scene, mats.cream, 0.65, 0.72, 0.52, x, 0.36, -3.63, true);
    addBox(scene, mats.darkWood, 0.04, 0.64, 0.55, x + 0.3, 0.34, -3.34, false);
    addBox(scene, mats.brass, 0.075, 0.035, 0.05, x, 0.4, -3.32, false);
  }
  addBox(scene, mats.cream, 1.8, 0.72, 0.12, 3.85, 2.08, -4.68, true);
  addBox(scene, mats.darkWood, 2, 0.12, 0.68, 3.9, 1.55, -4.14, true);
  addBox(scene, mats.wood, 0.12, 1.3, 0.55, 3.0, 0.66, -2.65, true);
  addBox(scene, mats.wood, 0.12, 1.3, 0.55, 4.8, 0.66, -2.65, true);
  addBox(scene, mats.darkWood, 2, 0.12, 0.62, 3.9, 1.3, -2.65, true);
  obstacles.push({ minX: 2.55, maxX: 5.25, minZ: -4.55, maxZ: -3.2 });
  obstacles.push({ minX: 2.8, maxX: 5.0, minZ: -2.95, maxZ: -2.25 });
}

function addHall(scene: THREE.Scene): void {
  for (const z of [-7.1, -9.8]) {
    const sconce = new THREE.PointLight("#cba677", 0.75, 4, 2);
    sconce.position.set(-1.65, 2.3, z);
    scene.add(sconce);
    const fixture = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.27, 0.12),
      new THREE.MeshStandardMaterial({ color: "#43382d", metalness: 0.55, roughness: 0.55 }),
    );
    fixture.position.set(-2.0, 2.28, z);
    scene.add(fixture);
    addBox(scene, new THREE.MeshStandardMaterial({ color: "#f1c58c", emissive: "#a96535", emissiveIntensity: 1.6 }), 0.05, 0.14, 0.05, -1.91, 2.28, z, false);
  }
}

function addBackBedroom(
  scene: THREE.Scene,
  mats: { wood: THREE.Material; darkWood: THREE.Material; rug: THREE.Material; cloth: THREE.Material; cream: THREE.Material; brass: THREE.Material },
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
): void {
  const windowGlass = new THREE.MeshStandardMaterial({
    color: "#718994",
    emissive: "#354b53",
    emissiveIntensity: 0.6,
    roughness: 0.24,
    transparent: true,
    opacity: 0.42,
  });
  const windowFrame = new THREE.MeshStandardMaterial({ color: "#473a32", roughness: 0.82 });
  addBox(scene, windowGlass, 0.04, 1.5, 2.0, 4.0, 2.0, -15.6, false);
  for (const z of [-16.64, -14.56]) {
    addBox(scene, windowFrame, 0.12, 1.72, 0.12, 3.94, 2.0, z, false);
  }
  for (const y of [1.12, 2.88]) {
    addBox(scene, windowFrame, 0.12, 0.12, 2.12, 3.94, y, -15.6, false);
  }
  addBox(scene, windowFrame, 0.1, 1.52, 0.06, 3.89, 2.0, -15.6, false);
  addBox(scene, windowFrame, 0.16, 0.08, 2.18, 3.88, 1.15, -15.6, false);

  const bedX = -1.25;
  const bedZ = -16.95;
  addBox(scene, mats.rug, 4.4, 0.025, 4.1, -0.3, 0.006, -16.5, false);
  addBox(scene, mats.darkWood, 2.05, 0.38, 2.75, bedX, 0.27, bedZ, true);
  addBox(scene, mats.cream, 2.0, 0.2, 2.64, bedX, 0.54, bedZ + 0.03, true);
  addBox(scene, mats.cloth, 2.04, 0.17, 1.13, bedX, 0.68, bedZ + 0.67, true);
  addBox(scene, mats.wood, 2.15, 1.24, 0.16, bedX, 0.62, -18.39, true);
  addBox(scene, mats.cloth, 0.63, 0.18, 0.43, bedX - 0.52, 0.75, bedZ + 0.84, false);
  addBox(scene, mats.cloth, 0.63, 0.18, 0.43, bedX + 0.52, 0.75, bedZ + 0.84, false);
  obstacles.push({ minX: -2.4, maxX: -0.1, minZ: -18.5, maxZ: -15.5 });

  addBox(scene, mats.darkWood, 1.25, 2.1, 0.7, 3.25, 1.03, -18.55, true);
  for (const x of [2.95, 3.55]) {
    addBox(scene, mats.brass, 0.04, 0.09, 0.04, x, 1.06, -18.17, false);
  }
  addBox(scene, mats.darkWood, 0.7, 0.92, 0.65, -3.1, 0.46, -13.75, true);
  addBox(scene, mats.cream, 0.77, 0.08, 0.72, -3.1, 0.94, -13.75, false);
  const lamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.2, 0.28, 14, 1, true),
    new THREE.MeshStandardMaterial({ color: "#a58b6c", roughness: 0.9, side: THREE.DoubleSide }),
  );
  lamp.position.set(-3.1, 1.1, -13.75);
  scene.add(lamp);
  const pictureFrame = new THREE.MeshStandardMaterial({ color: "#352d27", roughness: 0.82 });
  addBox(scene, pictureFrame, 0.08, 0.75, 0.58, 3.99, 2.0, -15.2, false);
  addBox(
    scene,
    new THREE.MeshStandardMaterial({ color: "#6f7169", roughness: 0.94 }),
    0.035,
    0.57,
    0.42,
    3.94,
    2.0,
    -15.2,
    false,
  );
  const bedsideLight = new THREE.PointLight("#cba877", 1.5, 4, 2);
  bedsideLight.position.set(-3.1, 1.65, -13.75);
  scene.add(bedsideLight);
}

function addWindow(scene: THREE.Scene, glass: THREE.Material, brass: THREE.Material): void {
  const frame = new THREE.MeshStandardMaterial({ color: "#473a32", roughness: 0.82 });
  addBox(scene, glass, 0.04, 1.58, 2.55, -5.88, 1.96, 1.35, false);
  for (const z of [0.08, 2.62]) addBox(scene, frame, 0.12, 1.8, 0.11, -5.82, 1.95, z, false);
  for (const y of [1.03, 2.87]) addBox(scene, frame, 0.12, 0.11, 2.64, -5.82, y, 1.35, false);
  addBox(scene, brass, 0.09, 1.68, 0.055, -5.76, 1.95, 1.35, false);
  addBox(scene, frame, 0.18, 0.08, 2.7, -5.74, 1.1, 1.35, false);
  const outside = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 4),
    new THREE.MeshBasicMaterial({ color: "#182631" }),
  );
  outside.rotation.y = Math.PI / 2;
  outside.position.set(-6.14, 2.0, 1.35);
  scene.add(outside);
  for (let i = 0; i < 18; i += 1) {
    const rain = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.22 + (i % 3) * 0.11, 0.008),
      new THREE.MeshBasicMaterial({ color: "#b4c5ce", transparent: true, opacity: 0.18 }),
    );
    rain.position.set(-5.7, 1.25 + ((i * 17) % 145) / 100, 0.14 + ((i * 11) % 230) / 100);
    scene.add(rain);
  }
}

function addLamp(scene: THREE.Scene, environment: EnvironmentSystem, brass: THREE.Material): void {
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.86, 10), brass);
  stand.position.set(1.9, 0.48, 0.16);
  scene.add(stand);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.09, 18), brass);
  base.position.set(1.9, 0.055, 0.16);
  scene.add(base);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.38, 0.47, 20, 1, true),
    new THREE.MeshStandardMaterial({ color: "#b99b74", roughness: 0.84, side: THREE.DoubleSide }),
  );
  shade.position.set(1.9, 1.02, 0.16);
  scene.add(shade);
  const glow = new THREE.PointLight("#d7a36d", 4.8, 7, 2);
  glow.position.set(1.9, 0.94, 0.16);
  glow.userData.baseIntensity = glow.intensity;
  scene.add(glow);
  environment.addPractical(glow);
}

function createDemoFigure(
  coatColor = "#393d3b",
  shirtColor = "#87806e",
  skinColor = "#a18470",
): THREE.Group {
  const group = new THREE.Group();
  group.name = "demo-figure-interaction";
  group.position.set(0.88, 0, -7.25);
  group.rotation.y = 0;
  const coat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.92 });
  const shirt = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.93 });
  const skin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.79 });
  const hair = new THREE.MeshStandardMaterial({ color: "#282421", roughness: 0.98 });
  const trousers = new THREE.MeshStandardMaterial({ color: "#282b2a", roughness: 0.97 });
  const eyes = new THREE.MeshStandardMaterial({ color: "#dfd1bb", roughness: 0.7 });
  const iris = new THREE.MeshStandardMaterial({ color: "#53605c", roughness: 0.56 });
  const dark = new THREE.MeshStandardMaterial({ color: "#29231f", roughness: 0.93 });

  const torso = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.15, 0),
      new THREE.Vector2(0.25, 0.08),
      new THREE.Vector2(0.27, 0.28),
      new THREE.Vector2(0.23, 0.53),
      new THREE.Vector2(0.29, 0.75),
      new THREE.Vector2(0.36, 0.94),
      new THREE.Vector2(0.32, 1.02),
      new THREE.Vector2(0, 1.02),
    ],
    16,
  );
  addPart(group, torso, coat, 0, 0.51, 0);
  addPart(group, new THREE.CapsuleGeometry(0.105, 0.54, 4, 9), trousers, -0.145, 0.36, 0);
  addPart(group, new THREE.CapsuleGeometry(0.105, 0.54, 4, 9), trousers, 0.145, 0.36, 0);
  addPart(group, new THREE.BoxGeometry(0.2, 0.1, 0.34), dark, -0.145, 0.045, 0.045);
  addPart(group, new THREE.BoxGeometry(0.2, 0.1, 0.34), dark, 0.145, 0.045, 0.045);

  const sleeveLeft = addPart(group, new THREE.CapsuleGeometry(0.105, 0.46, 4, 9), coat, -0.385, 1.12, 0.015);
  sleeveLeft.rotation.z = -0.105;
  const sleeveRight = addPart(group, new THREE.CapsuleGeometry(0.105, 0.46, 4, 9), coat, 0.385, 1.12, 0.015);
  sleeveRight.rotation.z = 0.105;
  addPart(group, new THREE.SphereGeometry(0.085, 12, 10), skin, -0.4, 0.78, 0.035);
  addPart(group, new THREE.SphereGeometry(0.085, 12, 10), skin, 0.4, 0.78, 0.035);
  addPart(group, new THREE.CylinderGeometry(0.09, 0.1, 0.2, 12), shirt, 0, 1.59, 0);
  addPart(group, new THREE.SphereGeometry(0.195, 22, 18), skin, 0, 1.78, 0.015);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.199, 20, 14, 0, Math.PI * 2, 0, 1.33), hair);
  hairCap.position.set(0, 1.81, -0.005);
  group.add(hairCap);
  addPart(group, new THREE.SphereGeometry(0.047, 10, 8), skin, -0.195, 1.77, 0);
  addPart(group, new THREE.SphereGeometry(0.047, 10, 8), skin, 0.195, 1.77, 0);
  addPart(group, new THREE.SphereGeometry(0.033, 10, 8), skin, 0, 1.742, 0.19);
  for (const x of [-0.072, 0.072]) {
    addPart(group, new THREE.SphereGeometry(0.031, 12, 10), eyes, x, 1.79, 0.159);
    addPart(group, new THREE.SphereGeometry(0.015, 10, 8), iris, x, 1.79, 0.184);
    addPart(group, new THREE.SphereGeometry(0.008, 8, 8), dark, x, 1.79, 0.195);
    const brow = addPart(group, new THREE.BoxGeometry(0.077, 0.017, 0.024), hair, x, 1.837, 0.158);
    brow.rotation.z = x < 0 ? -0.08 : 0.08;
  }
  addPart(group, new THREE.BoxGeometry(0.085, 0.018, 0.025), dark, 0, 1.68, 0.166);
  addPart(group, new THREE.BoxGeometry(0.18, 0.055, 0.11), coat, 0, 1.48, 0.11);
  addPart(group, new THREE.SphereGeometry(0.024, 8, 8), new THREE.MeshStandardMaterial({ color: "#aa8a62", metalness: 0.56 }), 0, 1.25, 0.265);
  addPart(group, new THREE.SphereGeometry(0.024, 8, 8), new THREE.MeshStandardMaterial({ color: "#aa8a62", metalness: 0.56 }), 0, 1.03, 0.27);
  return group;
}

function addEntityFeatures(entity: THREE.Group): THREE.Group {
  const features = new THREE.Group();
  features.visible = false;
  const dark = new THREE.MeshStandardMaterial({
    color: "#090b0b",
    roughness: 0.55,
    metalness: 0.12,
  });
  const ember = new THREE.MeshStandardMaterial({
    color: "#591d17",
    emissive: "#bd3222",
    emissiveIntensity: 1.4,
    roughness: 0.28,
  });
  for (const side of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.38, 8), dark);
    horn.position.set(side * 0.12, 2.02, -0.035);
    horn.rotation.z = side * -0.28;
    features.add(horn);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), ember);
    eye.position.set(side * 0.072, 1.79, 0.193);
    features.add(eye);
    const finger = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.3, 7), dark);
    finger.position.set(side * 0.42, 0.7, 0.04);
    finger.rotation.z = side * -Math.PI * 0.48;
    features.add(finger);
  }
  entity.add(features);
  return features;
}

function addTable(
  scene: THREE.Scene,
  wood: THREE.Material,
  brass: THREE.Material,
  x: number,
  y: number,
  z: number,
  width: number,
  depth: number,
): void {
  addBox(scene, wood, width, 0.13, depth, x, y, z, true);
  for (const dx of [-width * 0.39, width * 0.39]) {
    for (const dz of [-depth * 0.35, depth * 0.35]) {
      addBox(scene, brass, 0.065, y * 2, 0.065, x + dx, y - 0.04, z + dz, false);
    }
  }
}

function makeDoorInteractable(
  id: string,
  prompt: string | (() => string),
  door: { panel: THREE.Object3D; toggle: () => void },
): Interactable {
  return { id, prompt, object: door.panel, interact: door.toggle };
}

function makeSideDoor(
  scene: THREE.Scene,
  wood: THREE.Material,
  brass: THREE.Material,
  x: number,
  z: number,
  side: number,
): {
  panel: THREE.Object3D;
  isOpen: boolean;
  canClose: () => boolean;
  update: (delta: number) => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
} {
  const frame = new THREE.MeshStandardMaterial({ color: "#382e27", roughness: 0.88 });
  addBox(scene, frame, 0.22, 2.42, 0.13, x, 1.19, z - 1.11, false);
  addBox(scene, frame, 0.22, 2.42, 0.13, x, 1.19, z + 1.11, false);
  addBox(scene, frame, 0.22, 0.13, 2.35, x, 2.38, z, false);
  const hinge = new THREE.Group();
  hinge.position.set(x + side * 0.03, 0, z - side);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.25, 1.96), wood);
  panel.position.set(0, 1.12, side * 0.98);
  panel.castShadow = true;
  hinge.add(panel);
  const inset = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 1.15, 0.62),
    new THREE.MeshStandardMaterial({ color: "#695241", roughness: 0.84 }),
  );
  inset.position.set(side * 0.078, 1.12, side * 0.98);
  hinge.add(inset);
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), brass);
  handle.position.set(side * 0.1, 1.04, side * 1.62);
  hinge.add(handle);
  scene.add(hinge);
  let isOpen = false;
  let target = 0;
  const update = (delta: number) => {
    hinge.rotation.y = THREE.MathUtils.damp(hinge.rotation.y, target, 7.5, delta);
    if (Math.abs(target - hinge.rotation.y) < 0.008) hinge.rotation.y = target;
  };
  const setOpen = (open: boolean) => {
    if (isOpen === open) return;
    isOpen = open;
    target = open ? side * Math.PI * 0.47 : 0;
  };
  return {
    panel: hinge,
    get isOpen() { return isOpen; },
    canClose: () => true,
    update,
    toggle: () => setOpen(!isOpen),
    setOpen,
  };
}

function makeUpperBedroomDoor(
  scene: THREE.Scene,
  frameMaterial: THREE.Material,
  wood: THREE.Material,
  brass: THREE.Material,
  onStoryInteraction: (id: string) => void,
): {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  update: (delta: number) => void;
  interactable: Interactable;
} {
  const centerX = -2.4;
  addBox(scene, frameMaterial, 0.14, 2.42, 0.13, centerX - 1.16, 4.39, 0.08, false);
  addBox(scene, frameMaterial, 0.14, 2.42, 0.13, centerX + 1.16, 4.39, 0.08, false);
  addBox(scene, frameMaterial, 2.45, 0.13, 0.14, centerX, 5.55, 0.08, false);
  const hinge = new THREE.Group();
  hinge.position.set(centerX - 1.08, 3.26, 0.1);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.16, 2.25, 0.12), wood);
  panel.position.set(1.08, 1.12, 0);
  panel.castShadow = true;
  hinge.add(panel);
  const inset = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, 0.035), frameMaterial);
  inset.position.set(1.08, 1.12, 0.078);
  hinge.add(inset);
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), brass);
  handle.position.set(1.88, 1.02, 0.1);
  hinge.add(handle);
  scene.add(hinge);
  let isOpen = false;
  let target = 0;
  return {
    get isOpen() {
      return isOpen;
    },
    setOpen: (open) => {
      isOpen = open;
      target = open ? -Math.PI * 0.48 : 0;
    },
    update: (delta) => {
      hinge.rotation.y = THREE.MathUtils.damp(hinge.rotation.y, target, 7, delta);
    },
    interactable: {
      id: "episode-mara-room",
      prompt: () => isOpen ? "Check Mara's room" : "Try Mara's door",
      object: hinge,
      enabled: () => storyDoorAvailable(),
      interact: () => onStoryInteraction("mara-room-door"),
    },
  };

  function storyDoorAvailable(): boolean {
    return scene.userData.maraRoomAvailable === true;
  }
}

function makeFinalDoor(
  scene: THREE.Scene,
  wood: THREE.Material,
  brass: THREE.Material,
  canOpen: () => boolean,
  onStoryInteraction: (id: string) => void,
): {
  panel: THREE.Object3D;
  isOpen: boolean;
  canClose: () => boolean;
  update: (delta: number) => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  interactable: Interactable;
} {
  const door = makeCustomPassageDoor(scene, wood, brass, -26.2);
  const setOpen = (open: boolean) => {
    if (open && !canOpen()) return;
    door.setOpen(open);
    if (open) onStoryInteraction("final-door-opened");
  };
  return {
    ...door,
    setOpen,
    toggle: () => setOpen(!door.isOpen),
    interactable: {
      id: "episode-final-door",
      prompt: () => canOpen()
        ? door.isOpen
          ? "Step through the open door"
          : "Break the forbidden door with the stone"
        : "Try the forbidden door",
      object: door.panel,
      enabled: () => true,
      interact: () => {
        if (!canOpen()) {
          onStoryInteraction("final-door-blocked");
          return;
        }
        if (!door.isOpen) setOpen(true);
      },
    },
  };
}

function makeCustomPassageDoor(
  scene: THREE.Scene,
  wood: THREE.Material,
  brass: THREE.Material,
  z: number,
): {
  panel: THREE.Object3D;
  isOpen: boolean;
  canClose: () => boolean;
  update: (delta: number) => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
} {
  const frame = new THREE.MeshStandardMaterial({ color: "#2c2623", roughness: 0.9 });
  addBox(scene, frame, 0.13, 2.5, 0.22, -1.11, 1.23, z, false);
  addBox(scene, frame, 0.13, 2.5, 0.22, 1.11, 1.23, z, false);
  addBox(scene, frame, 2.35, 0.13, 0.22, 0, 2.48, z, false);
  const hinge = new THREE.Group();
  hinge.position.set(-1, 0, z + 0.03);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.96, 2.32, 0.12), wood);
  panel.position.set(0.98, 1.16, 0);
  hinge.add(panel);
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), brass);
  handle.position.set(1.72, 1.04, 0.09);
  hinge.add(handle);
  scene.add(hinge);
  let isOpen = false;
  let target = 0;
  const update = (delta: number) => {
    hinge.rotation.y = THREE.MathUtils.damp(hinge.rotation.y, target, 6.5, delta);
  };
  const setOpen = (open: boolean) => {
    isOpen = open;
    target = open ? -Math.PI * 0.48 : 0;
  };
  return { panel: hinge, get isOpen() { return isOpen; }, canClose: () => true, update, toggle: () => setOpen(!isOpen), setOpen };
}

function makeDoor(
  scene: THREE.Scene,
  wood: THREE.Material,
  brass: THREE.Material,
  onChange: (open: boolean) => void,
  isDoorwayOccupied: () => boolean,
): {
  panel: THREE.Object3D;
  isOpen: boolean;
  canClose: () => boolean;
  update: (delta: number) => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
} {
  const frame = new THREE.MeshStandardMaterial({ color: "#382e27", roughness: 0.88 });
  addBox(scene, frame, 0.13, 2.42, 0.22, -1.11, 1.19, -4.9, false);
  addBox(scene, frame, 0.13, 2.42, 0.22, 1.11, 1.19, -4.9, false);
  addBox(scene, frame, 2.35, 0.13, 0.22, 0, 2.38, -4.9, false);
  const hinge = new THREE.Group();
  hinge.position.set(-1, 0, -4.87);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.96, 2.25, 0.12), wood);
  panel.position.set(0.98, 1.12, 0);
  panel.castShadow = true;
  panel.receiveShadow = true;
  hinge.add(panel);
  const insetMaterial = new THREE.MeshStandardMaterial({ color: "#695241", roughness: 0.84 });
  const topPanel = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.72, 0.035), insetMaterial);
  topPanel.position.set(0.98, 1.63, 0.078);
  const bottomPanel = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.62, 0.035), insetMaterial);
  bottomPanel.position.set(0.98, 0.57, 0.078);
  hinge.add(topPanel, bottomPanel);
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), brass);
  handle.position.set(1.72, 1.04, 0.09);
  hinge.add(handle);
  scene.add(hinge);
  let isOpen = false;
  let target = 0;
  const update = (delta: number) => {
    hinge.rotation.y = THREE.MathUtils.damp(hinge.rotation.y, target, 7.5, delta);
    if (Math.abs(target - hinge.rotation.y) < 0.008) hinge.rotation.y = target;
  };
  const setOpen = (open: boolean) => {
    if (isOpen === open) return;
    if (!open && isDoorwayOccupied()) return;
    isOpen = open;
    target = isOpen ? -Math.PI * 0.47 : 0;
    onChange(open);
  };
  const toggle = () => setOpen(!isOpen);
  return {
    panel: hinge,
    get isOpen() { return isOpen; },
    canClose: () => !isDoorwayOccupied(),
    update,
    toggle,
    setOpen,
  };
}

function makePassageDoor(
  scene: THREE.Scene,
  wood: THREE.Material,
  brass: THREE.Material,
  onChange: (open: boolean) => void,
  isDoorwayOccupied: () => boolean,
  z = -12.08,
): {
  panel: THREE.Object3D;
  isOpen: boolean;
  canClose: () => boolean;
  update: (delta: number) => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
} {
  const frame = new THREE.MeshStandardMaterial({ color: "#382e27", roughness: 0.88 });
  addBox(scene, frame, 0.13, 2.42, 0.22, -1.11, 1.19, z, false);
  addBox(scene, frame, 0.13, 2.42, 0.22, 1.11, 1.19, z, false);
  addBox(scene, frame, 2.35, 0.13, 0.22, 0, 2.38, z, false);
  const hinge = new THREE.Group();
  hinge.position.set(-1, 0, z + 0.03);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.96, 2.25, 0.12), wood);
  panel.position.set(0.98, 1.12, 0.035);
  panel.castShadow = true;
  panel.receiveShadow = true;
  hinge.add(panel);
  const insetMaterial = new THREE.MeshStandardMaterial({ color: "#695241", roughness: 0.84 });
  const upperPanel = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.72, 0.035), insetMaterial);
  upperPanel.position.set(0.98, 1.63, 0.106);
  const lowerPanel = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.62, 0.035), insetMaterial);
  lowerPanel.position.set(0.98, 0.57, 0.106);
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), brass);
  handle.position.set(1.72, 1.04, 0.12);
  hinge.add(upperPanel, lowerPanel, handle);
  scene.add(hinge);
  let isOpen = false;
  let target = 0;
  const update = (delta: number) => {
    hinge.rotation.y = THREE.MathUtils.damp(hinge.rotation.y, target, 7.5, delta);
    if (Math.abs(target - hinge.rotation.y) < 0.008) hinge.rotation.y = target;
  };
  const setOpen = (open: boolean) => {
    if (isOpen === open || (!open && isDoorwayOccupied())) return;
    isOpen = open;
    target = open ? -Math.PI * 0.47 : 0;
    onChange(open);
  };
  return {
    panel: hinge,
    get isOpen() { return isOpen; },
    canClose: () => !isDoorwayOccupied(),
    update,
    toggle: () => setOpen(!isOpen),
    setOpen,
  };
}

function makeNote(scene: THREE.Scene): THREE.Object3D {
  const paper = new THREE.MeshStandardMaterial({ color: "#c4b99e", roughness: 0.97 });
  const note = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.018, 0.39), paper);
  note.position.set(-0.1, 0.56, 0.15);
  note.rotation.y = -0.18;
  scene.add(note);
  const ink = new THREE.MeshStandardMaterial({ color: "#594738", roughness: 1 });
  for (let index = 0; index < 4; index += 1) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.39 - index * 0.035, 0.003, 0.008), ink);
    line.position.set(-0.1 - index * 0.006, 0.572, 0.04 + index * 0.065);
    line.rotation.y = -0.18;
    scene.add(line);
  }
  return note;
}

function addBox(
  parent: THREE.Object3D,
  material: THREE.Material,
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number,
  shadow: boolean,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addPart(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const part = new THREE.Mesh(geometry, material);
  part.position.set(x, y, z);
  part.castShadow = true;
  parent.add(part);
  return part;
}

function texturedMaterial(color: string, pattern: "wood" | "floor" | "plaster"): THREE.MeshStandardMaterial {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas textures are unavailable in this browser.");
  context.fillStyle = color;
  context.fillRect(0, 0, 1024, 1024);
  let seed = pattern === "plaster" ? 31 : 17;
  for (let index = 0; index < 5200; index += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const x = (seed / 233280) * 1024;
    seed = (seed * 9301 + 49297) % 233280;
    const y = (seed / 233280) * 1024;
    const alpha = 0.025 + ((index * 13) % 6) * 0.008;
    context.fillStyle = index % 2 ? `rgba(240,220,190,${alpha})` : `rgba(12,9,8,${alpha})`;
    context.fillRect(x, y, pattern === "plaster" ? 2 : 72 + (index % 88), pattern === "plaster" ? 2 : 2);
  }
  if (pattern !== "plaster") {
    context.strokeStyle = "rgba(15,10,8,0.18)";
    context.lineWidth = 6;
    for (let y = 0; y < 1024; y += 192) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(256, y);
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(pattern === "plaster" ? 2 : 1, pattern === "plaster" ? 1 : 2);
  return new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: texture,
    roughness: pattern === "wood" ? 0.8 : 0.94,
  });
}
