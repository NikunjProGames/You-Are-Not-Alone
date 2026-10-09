import * as THREE from "three";
import type { Interactable } from "../types";
import type { AtmosphereMood, EnvironmentSystem } from "../systems/EnvironmentSystem";

function emitDoorSound(): void {
  window.dispatchEvent(new Event("game:door-sound"));
}

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
  setArenRoomAvailable: (available: boolean) => void;
  setArenRoomDoorOpen: (open: boolean) => void;
  setHousemateCleaning: (cleaning: boolean) => void;
  setProtagonistRoomDoorOpen: (open: boolean) => void;
  setStoneCollected: (collected: boolean) => void;
  setUpperEntryDoorOpen: (open: boolean) => void;
  setUpperTenantDoorOpen: (open: boolean) => void;
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
  scene.background = new THREE.Color("#111a20");
  scene.fog = new THREE.FogExp2("#141d21", 0.019);

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
  const storyPropObjects = new Map<string, THREE.Object3D>();
  const characters: THREE.Group[] = [];
  const obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }> = [];
  const upperObstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }> = [];
  const windObjects: Array<{ object: THREE.Object3D; base: number; phase: number; amount: number }> = [];
  const storyDoors = { westStore: false, tenantStudy: false, arenRoom: false };

  const hemi = new THREE.HemisphereLight("#b2c5d0", "#3a3327", 1.04);
  scene.add(hemi);
  const windowLight = new THREE.DirectionalLight("#9bb2c1", 1.82);
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
  addPracticalLight(scene, environment, 0, 2.72, 3.55, 7.2, 9.5);
  addPracticalLight(scene, environment, 0, 2.68, -8.35, 5.4, 9);
  addPracticalLight(scene, environment, 4.2, 2.68, -3.1, 4.4, 7.2);
  addPracticalLight(scene, environment, -6.35, 2.55, -8.55, 3.8, 6.2);
  addPracticalLight(scene, environment, 6.4, 2.55, -8.55, 3.8, 6.2);
  addPracticalLight(scene, environment, -3.65, 5.75, 3.1, 3.8, 6.2);

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
  addBox(scene, glass, 3.0, 0.68, 0.045, 0, 2.65, 6.11, false);
  for (const x of [-1.53, 1.53]) {
    addBox(scene, brass, 0.075, 0.82, 0.09, x, 2.65, 6.13, false);
  }
  addBox(scene, brass, 3.1, 0.075, 0.09, 0, 2.27, 6.13, false);
  addBox(scene, brass, 3.1, 0.075, 0.09, 0, 3.03, 6.13, false);
  addBox(scene, brass, 0.055, 0.68, 0.075, 0, 2.65, 6.15, false);
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
  addUpperStory(scene, plaster, darkWood, wood, cream, upperObstacles);
  addUpperMysteryWing(scene, plaster, darkWood, floor, upperObstacles);
  addUpperTenantRoom(scene, plaster, darkWood, wood, cream, floor, upperObstacles);
  addExterior(scene, darkWood, wood, cream, brass, obstacles, windObjects);

  addBox(scene, floor, 4.2, 0.18, 6.0, 0, -0.12, -23.2, true);
  addBox(scene, plaster, 0.16, 3.25, 6.0, -2.15, 1.55, -23.2, true);
  addBox(scene, plaster, 0.16, 3.25, 6.0, 2.15, 1.55, -23.2, true);
  addBox(scene, plaster, 4.2, 3.25, 0.18, 0, 1.55, -26.2, true);
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
  const finaleLights = addFinaleRoomDetails(scene, darkWood, cream, brass, 3.16);
  addLivingRoomDetails(scene, darkWood, brass);
  addLamp(scene, environment, brass);
  const backRoomLight = new THREE.PointLight("#d4bd97", 6.2, 11, 2);
  backRoomLight.position.set(0, 2.65, -15.7);
  backRoomLight.userData.baseIntensity = backRoomLight.intensity;
  scene.add(backRoomLight);
  environment.addPractical(backRoomLight);
  const housemate = createDemoFigure({
    faceStyle: "zayan",
    coatColor: "#35463f",
    shirtColor: "#80634b",
    skinColor: "#b18469",
    hairColor: "#20191b",
    trousersColor: "#342d32",
    scaleX: 0.96,
    scaleY: 0.97,
  });
  const coatMark = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 10, 8),
    new THREE.MeshStandardMaterial({ color: "#58322d", roughness: 1 }),
  );
  coatMark.position.set(-0.39, 1.08, 0.12);
  coatMark.scale.set(1, 1.45, 0.28);
  housemate.add(coatMark);
  const cleaningCloth = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.045, 0.12),
    new THREE.MeshStandardMaterial({ color: "#a49e8d", roughness: 1 }),
  );
  cleaningCloth.position.set(-0.42, 0.72, 0.12);
  cleaningCloth.rotation.z = -0.22;
  cleaningCloth.visible = false;
  housemate.add(cleaningCloth);
  let housemateCleaning = false;
  housemate.visible = false;
  characters.push(housemate);
  const tenant = createDemoFigure({
    faceStyle: "tenant",
    coatColor: "#292e34",
    shirtColor: "#b0a895",
    skinColor: "#99806d",
    hairColor: "#77766f",
    trousersColor: "#25282b",
    scaleX: 1.12,
    scaleY: 1.04,
  });
  tenant.position.set(-1.5, 0, 3.1);
  tenant.rotation.y = 0;
  characters.push(tenant);
  const entity = createDemoFigure({
    faceStyle: "protagonist",
    coatColor: "#393d3b",
    shirtColor: "#87806e",
    skinColor: "#a18470",
    hairColor: "#282421",
    trousersColor: "#282b2a",
    scaleX: 1,
    scaleY: 1,
  });
  entity.name = "revealed-entity";
  entity.position.set(0, 3.16, -24.7);
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
  const protagonistRoomDoor = makeSideDoor(scene, wood, brass, -2.15, -2.55, -1, 3.16);
  const finalDoor = makeFinalDoor(scene, wood, brass, canOpenFinalDoor, onStoryInteraction, -20.2, 3.16);
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
    makeDoorInteractable("episode-protagonist-bedroom-door", "Open your bedroom door", protagonistRoomDoor),
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
  addEpisodeProps(scene, interactables, onStoryInteraction, storyPropObjects, [
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
    { id: "rest", position: [-4.15, 4.07, -2.9], color: "#b9ad98", size: [0.18, 0.025, 0.12] },
    { id: "stone", position: [1.15, 0.13, 12.5], color: "#77736c", size: [0.34, 0.22, 0.28] },
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
  const upperEntryDoor = makeCustomPassageDoor(scene, wood, brass, 0.08, 3.16);
  upperEntryDoor.setOpen(true);
  const arenRoomDoor = makeSideDoor(scene, wood, brass, 2.15, -2.55, 1, 3.16);
  const upstairsTenantDoor = makeSideDoor(scene, wood, brass, 2.15, -15.55, 1, 3.16);
  interactables.push(
    makeDoorInteractable(
      "episode-upper-corridor-door",
      () => upperEntryDoor.isOpen ? "Close the upper corridor door" : "Open the upper corridor door",
      upperEntryDoor,
    ),
    {
      id: "episode-aren-room",
      prompt: () => arenRoomDoor.isOpen ? "Check Zayan's room" : "Knock on Zayan's door",
      object: arenRoomDoor.panel,
      enabled: () => scene.userData.arenRoomAvailable === true,
      interact: () => onStoryInteraction("aren-room-door"),
    },
    makeDoorInteractable(
      "episode-upstairs-tenant-room",
      () => upstairsTenantDoor.isOpen ? "Close the tenant's upstairs door" : "Open the tenant's upstairs door",
      upstairsTenantDoor,
    ),
  );

  return {
    scene,
    characters,
    interactables,
    update: (delta) => {
      const elapsed = performance.now() / 1000;
      if (housemateCleaning) {
        cleaningCloth.position.y = 0.72 + Math.sin(elapsed * 7) * 0.035;
      }
      windObjects.forEach(({ object, base, phase, amount }) => {
        object.rotation.z = base + Math.sin(elapsed * 0.55 + phase) * amount;
      });
      door.update(delta);
      backRoomDoor.update(delta);
      bedroomExitDoor.update(delta);
      protagonistRoomDoor.update(delta);
      westDoor.update(delta);
      eastDoor.update(delta);
      westStoreDoor.update(delta);
      tenantStudyDoor.update(delta);
      finalDoor.update(delta);
      entryDoor.update(delta);
      upperEntryDoor.update(delta);
      arenRoomDoor.update(delta);
      upstairsTenantDoor.update(delta);
      if (finaleFlicker) {
        finaleElapsed += delta;
        const flicker = Math.sin(finaleElapsed * 31) > 0.74 ? 0.08 : 0.45 + Math.max(0, Math.sin(finaleElapsed * 12)) * 0.72;
        finaleLights.forEach((light) => {
          light.intensity = light.userData.baseIntensity * flicker;
        });
      }
    },
    floorAt: (x, z, currentHeight) => {
      const onStair = x > 3.55 && x < 5.55 && z > 0.12 && z < 4.95;
      if (onStair) {
        const stairFloor = THREE.MathUtils.clamp((4.55 - z) / (4.55 - 0.39), 0, 1) * 3.16;
        return Math.abs(stairFloor - currentHeight) <= 0.34 ? stairFloor : null;
      }
      if (currentHeight > 0.34 && currentHeight < 2.2) return null;
      if (entryDoor.isOpen && x > -1.3 && x < 1.3 && z > 5.55 && z < 6.55) return 0;
      if (
        currentHeight > 2.2 &&
        ((x > -5.72 && x < 5.72 && z > -4.72 && z < 5.72) ||
          (x > -2.4 && x < 2.4 && z > -20.48 && z < -0.24) ||
          (arenRoomDoor.isOpen && x > 1.9 && x < 5.72 && z > -4.72 && z < -0.24) ||
          (upstairsTenantDoor.isOpen && x > 1.9 && x < 4.12 && z > -20.18 && z < -12.25) ||
          (finalDoor.isOpen && x > -3.5 && x < 3.5 && z > -29.3 && z < -20.48))
      ) return 3.16;
      const inGroundHouse =
        (x > -5.72 && x < 5.72 && z > -4.72 && z < 5.72) ||
        (x > -1.88 && x < 1.88 && z > -12.48 && z < -5.28) ||
        (x > 2.28 && x < 5.75 && z > -4.7 && z < 0.65) ||
        (door.isOpen && x > -1.3 && x < 1.3 && z > -5.55 && z < -4.45) ||
        (westDoor.isOpen && x > -7.2 && x < -2.28 && z > -11.65 && z < -5.55) ||
        (eastDoor.isOpen && x > 2.28 && x < 7.2 && z > -11.65 && z < -5.55) ||
        (westStoreDoor.isOpen && westDoor.isOpen && x > -12.45 && x < -7.45 && z > -11.55 && z < -5.65) ||
        (tenantStudyDoor.isOpen && eastDoor.isOpen && x > 7.45 && x < 12.45 && z > -11.55 && z < -5.65) ||
        (backRoomDoor.isOpen && x > -3.95 && x < 3.95 && z > -20 && z < -12.25) ||
        (backRoomDoor.isOpen && x > -1.13 && x < 1.13 && z > -12.52 && z < -12.05) ||
        (bedroomExitDoor.isOpen && x > -1.9 && x < 1.9 && z > -26 && z < -20.25) ||
        (bedroomExitDoor.isOpen && x > -1.1 && x < 1.1 && z > -20.35 && z < -19.95) ||
        (westDoor.isOpen && x > -2.48 && x < -1.75 && z > -9.45 && z < -7.75) ||
        (eastDoor.isOpen && x > 1.75 && x < 2.48 && z > -9.45 && z < -7.75) ||
        (westDoor.isOpen && westStoreDoor.isOpen && x > -7.72 && x < -7.0 && z > -9.45 && z < -7.75) ||
        (eastDoor.isOpen && tenantStudyDoor.isOpen && x > 7.0 && x < 7.72 && z > -9.45 && z < -7.75);
      if (inGroundHouse) return 0;
      const inGarden = x > -9 && x < 9 && z > 6.25 && z < 15.5;
      if (inGarden) return 0;
      return null;
    },
    canOccupy: (x, z, floorHeight) => {
      const upstairs = floorHeight > 2.2;
      if (upstairs) {
        const landing = z > 0.24 && z < 5.72 && x > -5.72 && x < 5.72;
        const protagonistRoom = protagonistRoomDoor.isOpen && x > -5.72 && x < -1.9 && z > -4.72 && z < -0.24;
        const protagonistRoomPassage =
          protagonistRoomDoor.isOpen && x > -2.55 && x < -1.85 && z > -3.75 && z < -1.35;
        const arenRoom = arenRoomDoor.isOpen && x > 1.9 && x < 5.72 && z > -4.72 && z < -0.24;
        const arenRoomEntrance =
          arenRoomDoor.isOpen && x > 1.85 && x < 2.55 && z > -3.75 && z < -1.35;
        const upperEntryPassage = upperEntryDoor.isOpen && x > -1.18 && x < 1.18 && z >= -0.24 && z <= 0.24;
        const upperCorridor = x > -2.05 && x < 2.05 && z > -20.48 && z < -0.24;
        const tenantRoom = upstairsTenantDoor.isOpen && x > 1.9 && x < 4.12 && z > -20.18 && z < -12.25;
        const upstairsTenantPassage =
          upstairsTenantDoor.isOpen && x > 1.9 && x < 2.55 && z >= -16.75 && z <= -14.35;
        const stairLanding = x > 3.4 && x < 5.72 && z > 0.12 && z < 5.72;
        const inUpperFinalRoom = finalDoor.isOpen && x > -3.5 && x < 3.5 && z > -29.3 && z < -20.48;
        const passesUpperFinalDoor = finalDoor.isOpen && x > -1.15 && x < 1.15 && z > -20.55 && z < -20.05;
        const insideUpperFloor =
          landing ||
          protagonistRoom ||
          protagonistRoomPassage ||
          arenRoom ||
          arenRoomEntrance ||
          upperEntryPassage ||
          upperCorridor ||
          tenantRoom ||
          upstairsTenantPassage ||
          stairLanding ||
          inUpperFinalRoom ||
          passesUpperFinalDoor;
        return insideUpperFloor && !upperObstacles.some(
          (box) => x > box.minX - 0.24 && x < box.maxX + 0.24 && z > box.minZ - 0.24 && z < box.maxZ + 0.24,
        );
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
      const throughLaundry = westDoor.isOpen && x > -2.48 && x < -1.75 && z > -9.45 && z < -7.75;
      const throughTenantDoor = eastDoor.isOpen && x > 1.75 && x < 2.48 && z > -9.45 && z < -7.75;
      const throughWestStore = westDoor.isOpen && westStoreDoor.isOpen && x > -7.72 && x < -7.0 && z > -9.45 && z < -7.75;
      const throughTenantStudy = eastDoor.isOpen && tenantStudyDoor.isOpen && x > 7.0 && x < 7.72 && z > -9.45 && z < -7.75;
      const outsideFrontDoor = entryDoor.isOpen && x > -1.3 && x < 1.3 && z > 5.55 && z < 6.55;
      const inGarden = x > -8.75 && x < 8.75 && z > 6.25 && z < 15.5;
      if (!(inLivingRoom || inHallway || inNook || passesDoor || outsideFrontDoor || inGarden || inBackRoom || passesBackRoomDoor || inLaundry || inTenantRoom || inUtilityStore || inTenantStudy || inEscapeHall || passesBedroomExit || throughLaundry || throughTenantDoor || throughWestStore || throughTenantStudy)) {
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
    setArenRoomAvailable: (available) => {
      storyDoors.arenRoom = available;
      scene.userData.arenRoomAvailable = available;
    },
    setArenRoomDoorOpen: (open) => arenRoomDoor.setOpen(open),
    setHousemateCleaning: (cleaning) => {
      housemateCleaning = cleaning;
      cleaningCloth.visible = cleaning;
      if (!cleaning) cleaningCloth.position.y = 0.72;
    },
    setProtagonistRoomDoorOpen: (open) => protagonistRoomDoor.setOpen(open),
    setStoneCollected: (collected) => {
      const stone = storyPropObjects.get("stone");
      if (!stone) throw new Error("The rescue stone prop is missing from the house.");
      stone.visible = !collected;
    },
    setUpperEntryDoorOpen: (open) => upperEntryDoor.setOpen(open),
    setUpperTenantDoorOpen: (open) => upstairsTenantDoor.setOpen(open),
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
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
): void {
  for (const x of [-5.92, 5.92]) {
    addBox(scene, plaster, 0.16, 3.15, 11.7, x, 4.83, 0.45, true);
  }
  addBox(scene, plaster, 3.85, 3.15, 0.16, -4.075, 4.83, -4.98, true);
  addBox(scene, plaster, 3.85, 3.15, 0.16, 4.075, 4.83, -4.98, true);
  addBox(scene, plaster, 4.45, 3.15, 0.16, -3.775, 4.83, 5.98, true);
  addBox(scene, plaster, 4.45, 3.15, 0.16, 3.775, 4.83, 5.98, true);
  addBox(scene, plaster, 3.1, 0.44, 0.16, 0, 6.11, 5.98, true);
  addBox(scene, plaster, 4.6, 3.15, 0.16, -3.5, 4.83, 0.08, true);
  addBox(scene, plaster, 4.6, 3.15, 0.16, 3.5, 4.83, 0.08, true);
  addBox(scene, plaster, 2.3, 0.65, 0.16, 0, 6.07, 0.08, true);

  const landingGlass = new THREE.MeshStandardMaterial({
    color: "#7896a4",
    emissive: "#283f4a",
    emissiveIntensity: 0.5,
    roughness: 0.18,
    metalness: 0.25,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  });
  const landingWindowFrame = new THREE.MeshStandardMaterial({ color: "#49382c", roughness: 0.86 });
  addBox(scene, landingGlass, 2.92, 2.42, 0.045, 0, 4.56, 6.08, false);
  for (const x of [-1.54, 0, 1.54]) {
    addBox(scene, landingWindowFrame, 0.11, 2.56, 0.12, x, 4.56, 6.12, false);
  }
  for (const y of [3.27, 4.56, 5.85]) {
    addBox(scene, landingWindowFrame, 3.12, 0.11, 0.12, 0, y, 6.12, false);
  }
  for (const x of [-2.15, 2.15]) {
    for (const z of [-4.12, -0.98]) {
      addBox(scene, plaster, 0.16, 3.15, 1.12, x, 4.83, z, true);
    }
  }
  const upperTrim = new THREE.MeshStandardMaterial({ color: "#49382c", roughness: 0.86 });
  addBox(scene, upperTrim, 0.16, 0.15, 2.2, -2.15, 5.72, -2.55, false);
  addBox(scene, upperTrim, 0.16, 0.15, 2.2, 2.15, 5.72, -2.55, false);
  addBox(scene, darkWood, 5.2, 0.09, 0.12, 0, 3.34, -4.7, false);
  addBox(scene, darkWood, 5.2, 0.09, 0.12, 0, 3.34, 4.7, false);
  const landingRunner = new THREE.MeshStandardMaterial({ color: "#38413d", roughness: 0.98 });
  addBox(scene, landingRunner, 2.7, 0.025, 2.5, 2.0, 3.155, 1.05, false);

  for (let index = 0; index < 14; index += 1) {
    const stepZ = 4.55 - index * 0.32;
    const stepY = 0.12 + index * 0.225;
    addBox(scene, wood, 1.72, 0.13, 0.38, 4.55, stepY, stepZ, true);
  }
  const stairSide = new THREE.Shape();
  stairSide.moveTo(0, 0);
  stairSide.lineTo(4.16, 0);
  stairSide.lineTo(4.16, 3.16);
  stairSide.closePath();
  const stairSideWall = new THREE.Mesh(
    new THREE.ShapeGeometry(stairSide),
    new THREE.MeshStandardMaterial({
      color: "#746d60",
      roughness: 0.96,
      side: THREE.DoubleSide,
    }),
  );
  stairSideWall.position.set(3.56, 0.02, 4.55);
  stairSideWall.rotation.y = Math.PI / 2;
  stairSideWall.castShadow = true;
  stairSideWall.receiveShadow = true;
  scene.add(stairSideWall);
  const railMaterial = new THREE.MeshStandardMaterial({ color: "#49382c", roughness: 0.86 });
  for (const x of [3.62, 5.48]) {
    const rail = addBox(scene, railMaterial, 0.075, 0.075, 5.1, x, 1.72, 2.42, true);
    rail.rotation.x = 0.60;
    for (let index = 0; index < 7; index += 1) {
      addBox(scene, railMaterial, 0.06, 0.96, 0.06, x, 0.7 + index * 0.43, 4.45 - index * 0.67, false);
    }
  }
  const upperBed = new THREE.MeshStandardMaterial({ color: "#51564f", roughness: 0.98 });
  addBox(scene, darkWood, 2.05, 0.48, 2.15, -4.15, 3.43, -2.9, true);
  addBox(scene, cream, 2.0, 0.2, 2.08, -4.15, 3.76, -2.9, true);
  addBox(scene, upperBed, 1.98, 0.16, 1.25, -4.15, 3.88, -3.35, true);
  addBox(scene, cream, 1.0, 0.18, 0.58, -4.15, 3.88, -2.13, false);
  addBox(scene, darkWood, 0.7, 0.76, 0.58, -3.05, 3.56, -0.65, true);
  addBox(scene, wood, 1.25, 0.92, 0.55, -5.0, 3.65, -1.0, true);
  addBox(scene, cream, 1.3, 0.08, 0.6, -5.0, 4.14, -1.0, false);
  const bedroomRug = new THREE.MeshStandardMaterial({ color: "#3f4946", roughness: 0.98 });
  addBox(scene, bedroomRug, 2.75, 0.025, 2.85, -4.05, 3.155, -2.75, false);
  const arenRug = new THREE.MeshStandardMaterial({ color: "#46504a", roughness: 0.98 });
  const arenBlanket = new THREE.MeshStandardMaterial({ color: "#59635d", roughness: 0.98 });
  addBox(scene, arenRug, 2.45, 0.025, 2.8, 4.45, 3.155, -2.65, false);
  addBox(scene, darkWood, 1.82, 0.44, 2.1, 4.5, 3.42, -2.65, true);
  addBox(scene, cream, 1.77, 0.17, 2.0, 4.5, 3.72, -2.65, true);
  addBox(scene, arenBlanket, 1.78, 0.13, 1.05, 4.5, 3.86, -2.95, true);
  addBox(scene, darkWood, 1.82, 0.9, 0.16, 4.5, 3.73, -1.62, true);
  addBox(scene, cream, 0.72, 0.16, 0.44, 4.5, 3.84, -1.95, false);
  addBox(scene, darkWood, 0.56, 0.42, 0.5, 3.1, 3.39, -1.2, true);
  addBox(scene, cream, 0.58, 0.045, 0.52, 3.1, 3.63, -1.2, false);
  const keepsake = new THREE.MeshStandardMaterial({ color: "#8e7860", roughness: 0.86 });
  addBox(scene, keepsake, 0.28, 0.34, 0.025, 2.93, 3.83, -1.0, false);
  addUpperTableLamp(scene, 3.1, 3.66, -1.2, "#d0a779", 1.5);
  addUpperTableLamp(scene, -3.05, 3.95, -0.65, "#cba877", 1.05);
  addBox(scene, darkWood, 1.8, 0.16, 0.55, 3.3, 3.34, -3.9, true);
  addBox(scene, cream, 0.82, 0.68, 0.7, 3.3, 3.72, -3.9, true);
  const tenantBooks = ["#645443", "#6f6351", "#4a514d", "#80674e"];
  tenantBooks.forEach((color, index) => {
    const height = 0.25 + (index % 2) * 0.07;
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, height, 0.17),
      new THREE.MeshStandardMaterial({ color, roughness: 0.95 }),
    );
    book.position.set(3.0 + index * 0.16, 4.06 + height / 2, -3.9);
    scene.add(book);
  });
  const tenantChair = new THREE.MeshStandardMaterial({ color: "#454943", roughness: 0.94 });
  addBox(scene, tenantChair, 0.56, 0.13, 0.56, 3.1, 3.52, -3.2, true);
  addBox(scene, tenantChair, 0.56, 0.66, 0.12, 3.1, 3.87, -2.94, true);
  const tenantWardrobe = new THREE.MeshStandardMaterial({ color: "#453a31", roughness: 0.9 });
  addBox(scene, tenantWardrobe, 0.92, 1.75, 0.62, 5.18, 4.0, -0.92, true);
  const upperSconce = new THREE.PointLight("#c4a17b", 1.15, 4.5, 2);
  upperSconce.position.set(1.7, 5.3, -0.1);
  scene.add(upperSconce);
  addUpperWallSconce(scene, 2.07, 5.18, -0.1);
  addUpperWallSconce(scene, 2.07, 5.18, -7.4);
  addUpperWallSconce(scene, 2.07, 5.18, -11.6);
  obstacles.push(
    { minX: -5.22, maxX: -3.08, minZ: -4.03, maxZ: -1.77 },
    { minX: -3.37, maxX: -2.73, minZ: -0.94, maxZ: -0.36 },
    { minX: -5.65, maxX: -4.35, minZ: -1.33, maxZ: -0.67 },
    { minX: 2.4, maxX: 4.25, minZ: -4.25, maxZ: -3.55 },
    { minX: 3.8, maxX: 5.65, minZ: -4.05, maxZ: -1.25 },
    { minX: 2.72, maxX: 3.48, minZ: -1.55, maxZ: -0.85 },
    { minX: -2.23, maxX: -2.07, minZ: -4.72, maxZ: -3.75 },
    { minX: -2.23, maxX: -2.07, minZ: -1.35, maxZ: -0.24 },
    { minX: 2.07, maxX: 2.23, minZ: -4.72, maxZ: -3.75 },
    { minX: 2.07, maxX: 2.23, minZ: -1.35, maxZ: -0.24 },
  );
  for (const x of [-2.15, 2.15]) {
    addBox(scene, plaster, 0.16, 3.15, 0.14, x, 4.83, -4.74, true);
  }
}

function addUpperMysteryWing(
  scene: THREE.Scene,
  plaster: THREE.Material,
  darkWood: THREE.Material,
  floor: THREE.Material,
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
): void {
  const runner = new THREE.MeshStandardMaterial({ color: "#353a37", roughness: 0.98 });
  addBox(scene, floor, 4.2, 0.18, 15.4, 0, 3.04, -12.5, true);
  addBox(scene, plaster, 0.16, 3.15, 15.4, -2.15, 4.83, -12.5, true);
  addBox(scene, plaster, 0.16, 3.15, 9.5, 2.15, 4.83, -9.55, true);
  addBox(scene, plaster, 0.16, 3.15, 3.2, 2.15, 4.83, -18.6, true);
  addBox(scene, runner, 1.6, 0.025, 14.2, 0, 3.145, -12.5, false);
  addBox(scene, darkWood, 0.12, 0.12, 15.4, -2.0, 3.31, -12.5, false);
  addBox(scene, darkWood, 0.12, 0.12, 15.4, 2.0, 3.31, -12.5, false);
  addBox(scene, plaster, 0.98, 3.15, 0.16, -1.64, 4.83, -20.2, true);
  addBox(scene, plaster, 0.98, 3.15, 0.16, 1.64, 4.83, -20.2, true);
  addBox(scene, plaster, 2.3, 0.55, 0.16, 0, 6.1, -20.2, true);
  addBox(scene, floor, 7.4, 0.18, 9, 0, 3.04, -24.7, true);
  addBox(scene, plaster, 0.16, 3.15, 9, -3.7, 4.83, -24.7, true);
  addBox(scene, plaster, 0.16, 3.15, 9, 3.7, 4.83, -24.7, true);
  addBox(scene, plaster, 7.4, 3.15, 0.16, 0, 4.83, -29.2, true);
  addBox(scene, plaster, 4.2, 0.18, 15.4, 0, 6.4, -12.5, true);
  addBox(scene, plaster, 7.4, 0.18, 9, 0, 6.4, -24.7, true);
  addBox(scene, darkWood, 7.2, 0.12, 0.12, 0, 3.31, -28.95, false);

  const wallLight = new THREE.PointLight("#a18169", 0.95, 5, 2);
  wallLight.position.set(0, 5.5, -11.2);
  scene.add(wallLight);
  const farLight = new THREE.PointLight("#807a6b", 0.8, 5.5, 2);
  farLight.position.set(0, 5.45, -24.5);
  scene.add(farLight);

  obstacles.push({ minX: -2.55, maxX: -1.25, minZ: -27.0, maxZ: -25.8 });
}

function addUpperTenantRoom(
  scene: THREE.Scene,
  plaster: THREE.Material,
  darkWood: THREE.Material,
  wood: THREE.Material,
  cream: THREE.Material,
  floor: THREE.Material,
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
): void {
  const roomFloor = new THREE.MeshStandardMaterial({ color: "#484943", roughness: 0.98 });
  addBox(scene, floor, 2.05, 0.18, 8.0, 3.125, 3.07, -16.15, true);
  addBox(scene, plaster, 0.16, 3.15, 8.0, 4.1, 4.83, -16.15, true);
  addBox(scene, plaster, 1.95, 3.15, 0.16, 3.125, 4.83, -12.15, true);
  addBox(scene, plaster, 1.95, 3.15, 0.16, 3.125, 4.83, -20.15, true);
  addBox(scene, plaster, 2.05, 0.18, 8.0, 3.125, 6.4, -16.15, true);
  addBox(scene, roomFloor, 1.7, 0.025, 6.9, 3.15, 3.172, -16.15, false);

  addBox(scene, darkWood, 1.2, 0.38, 1.8, 3.45, 3.38, -18.5, true);
  addBox(scene, cream, 1.12, 0.15, 1.7, 3.45, 3.65, -18.5, true);
  addBox(scene, new THREE.MeshStandardMaterial({ color: "#55594f", roughness: 0.98 }), 1.14, 0.12, 0.82, 3.45, 3.78, -18.72, true);
  addBox(scene, darkWood, 0.8, 1.25, 0.42, 3.72, 3.86, -13.0, true);
  addBox(scene, wood, 0.95, 0.1, 0.52, 3.72, 4.52, -13.0, true);
  const privateLamp = new THREE.PointLight("#9b876a", 0.75, 4.3, 2);
  privateLamp.position.set(3.55, 5.25, -16.1);
  scene.add(privateLamp);
  obstacles.push(
    { minX: 2.78, maxX: 4.12, minZ: -19.55, maxZ: -17.45 },
    { minX: 3.25, maxX: 4.18, minZ: -13.42, maxZ: -12.58 },
  );
}

function addExterior(
  scene: THREE.Scene,
  darkWood: THREE.Material,
  wood: THREE.Material,
  cream: THREE.Material,
  brass: THREE.Material,
  obstacles: Array<{ minX: number; maxX: number; minZ: number; maxZ: number }>,
  windObjects: Array<{ object: THREE.Object3D; base: number; phase: number; amount: number }>,
): void {
  const lawn = new THREE.MeshStandardMaterial({ color: "#37423a", roughness: 1 });
  const path = new THREE.MeshStandardMaterial({ color: "#71685b", roughness: 0.98 });
  const leaves = new THREE.MeshStandardMaterial({ color: "#455640", roughness: 1 });
  addBox(scene, lawn, 20, 0.16, 12, 0, -0.18, 11.7, false);
  const terrainGeometry = new THREE.PlaneGeometry(110, 116, 34, 36);
  const terrainPositions = terrainGeometry.attributes.position;
  for (let index = 0; index < terrainPositions.count; index += 1) {
    const x = terrainPositions.getX(index);
    const z = terrainPositions.getY(index);
    terrainPositions.setZ(index, Math.sin(x * 0.21) * Math.cos(z * 0.15) * 0.08);
  }
  terrainGeometry.computeVertexNormals();
  const terrain = new THREE.Mesh(
    terrainGeometry,
    new THREE.MeshStandardMaterial({ color: "#202b25", roughness: 1 }),
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.set(0, -0.29, 16);
  terrain.receiveShadow = true;
  scene.add(terrain);
  addBox(scene, path, 2.35, 0.06, 7.8, 0, -0.06, 9.85, false);
  addBox(scene, wood, 6.2, 0.2, 1.9, 0, -0.08, 6.95, true);
  for (const side of [-1, 1]) {
    for (const x of [side * 1.4, side * 2.8]) {
      addBox(scene, darkWood, 0.18, 0.72, 0.18, x, 0.28, 7.2, false);
    }
    addBox(scene, wood, 1.4, 0.11, 0.12, side * 2.1, 0.62, 7.2, false);
  }
  addBox(scene, darkWood, 2.35, 0.96, 0.78, -1.5, 0.5, 4.45, true);
  addBox(scene, wood, 2.45, 0.1, 0.88, -1.5, 1.01, 4.45, true);
  addBox(scene, brass, 0.72, 0.36, 0.045, -1.5, 2.1, 5.88, false);
  const porchGlow = new THREE.MeshStandardMaterial({
    color: "#d8b98f",
    emissive: "#a06b3c",
    emissiveIntensity: 0.7,
    roughness: 0.75,
  });
  for (const x of [-1.38, 1.38]) {
    addBox(scene, darkWood, 0.18, 0.38, 0.12, x, 2.43, 6.12, false);
    addBox(scene, porchGlow, 0.12, 0.22, 0.08, x, 2.43, 6.19, false);
    const porchSconce = new THREE.PointLight("#e1b783", 5.4, 9.5, 2);
    porchSconce.position.set(x, 2.42, 6.28);
    scene.add(porchSconce);
  }
  for (const x of [-1.45, 1.45]) {
    const pathLight = new THREE.PointLight("#d6b58e", 1.25, 4.2, 2);
    pathLight.position.set(x, 0.62, 9.45);
    scene.add(pathLight);
    addBox(scene, darkWood, 0.09, 0.72, 0.09, x, 0.36, 9.45, false);
    addBox(scene, porchGlow, 0.16, 0.14, 0.16, x, 0.72, 9.45, false);
  }
  obstacles.push({ minX: -2.75, maxX: -0.25, minZ: 4.0, maxZ: 4.9 });
  obstacles.push(
    { minX: -2.9, maxX: -1.3, minZ: 7.06, maxZ: 7.34 },
    { minX: 1.3, maxX: 2.9, minZ: 7.06, maxZ: 7.34 },
    { minX: -1.58, maxX: -1.32, minZ: 9.29, maxZ: 9.61 },
    { minX: 1.32, maxX: 1.58, minZ: 9.29, maxZ: 9.61 },
    { minX: -4.12, maxX: -3.68, minZ: 12.0, maxZ: 13.0 },
    { minX: -7.5, maxX: -5.7, minZ: 7.0, maxZ: 9.2 },
    { minX: 5.7, maxX: 7.5, minZ: 7.0, maxZ: 9.2 },
    { minX: -8.98, maxX: -8.76, minZ: 6.8, maxZ: 15.5 },
    { minX: 8.76, maxX: 8.98, minZ: 6.8, maxZ: 15.5 },
    { minX: -8.98, maxX: 8.98, minZ: 15.25, maxZ: 15.48 },
  );

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

  const treeLocations: Array<{ x: number; z: number; height: number; scale: number }> = [];
  let seed = 731;
  const random = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (const side of [-1, 1]) {
    for (let index = 0; index < 25; index += 1) {
      treeLocations.push({
        x: side * (14 + random() * 28),
        z: -31 + index * 2.3 + (random() - 0.5) * 4,
        height: 6.2 + random() * 4.6,
        scale: 0.76 + random() * 0.62,
      });
    }
  }
  for (let index = 0; index < 31; index += 1) {
    treeLocations.push({
      x: -45 + index * 3 + (random() - 0.5) * 3,
      z: 23 + random() * 34,
      height: 6.5 + random() * 5,
      scale: 0.78 + random() * 0.68,
    });
  }
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.22, 0.42, 5.5, 7),
    new THREE.MeshStandardMaterial({ color: "#302a25", roughness: 1 }),
    treeLocations.length,
  );
  const crowns = new THREE.InstancedMesh(
    new THREE.ConeGeometry(3.2, 8.4, 7),
    new THREE.MeshStandardMaterial({ color: "#33483b", roughness: 1 }),
    treeLocations.length,
  );
  const treeTransform = new THREE.Object3D();
  treeLocations.forEach((tree, index) => {
    treeTransform.position.set(tree.x, 2.45 * tree.scale, tree.z);
    treeTransform.scale.setScalar(tree.scale);
    treeTransform.updateMatrix();
    trunks.setMatrixAt(index, treeTransform.matrix);
    treeTransform.position.y = tree.height * 0.56;
    treeTransform.scale.set(tree.scale, tree.height / 8.4, tree.scale);
    treeTransform.updateMatrix();
    crowns.setMatrixAt(index, treeTransform.matrix);
    crowns.setColorAt(index, new THREE.Color().setHSL(0.28 + random() * 0.055, 0.2, 0.13 + random() * 0.07));
  });
  trunks.instanceMatrix.needsUpdate = true;
  crowns.instanceMatrix.needsUpdate = true;
  scene.add(trunks, crowns);

  const stars = new Float32Array(168 * 3);
  for (let index = 0; index < 168; index += 1) {
    stars[index * 3] = (random() - 0.5) * 150;
    stars[index * 3 + 1] = 24 + random() * 48;
    stars[index * 3 + 2] = -70 + random() * 100;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(stars, 3));
  scene.add(new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: "#aebdc4", size: 0.17, transparent: true, opacity: 0.42, sizeAttenuation: false }),
  ));
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2.15, 24, 16),
    new THREE.MeshBasicMaterial({ color: "#d9e0dc" }),
  );
  moon.position.set(-32, 31, -48);
  scene.add(moon);
  const moonLight = new THREE.DirectionalLight("#93aabd", 0.42);
  moonLight.position.copy(moon.position);
  scene.add(moonLight);

  for (let index = 0; index < 18; index += 1) {
    const tuft = new THREE.Group();
    tuft.position.set(-8.5 + random() * 17, 0, 7.2 + random() * 8);
    for (let blade = 0; blade < 3; blade += 1) {
      const grassBlade = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.66 + random() * 0.35, 4),
        leaves,
      );
      grassBlade.position.set((blade - 1) * 0.11, 0.29, 0);
      grassBlade.rotation.z = (blade - 1) * 0.28;
      tuft.add(grassBlade);
    }
    scene.add(tuft);
    windObjects.push({ object: tuft, base: 0, phase: random() * Math.PI * 2, amount: 0.055 });
  }

  for (const x of [-4.8, 4.8]) {
    addBox(scene, wood, 1.35, 1.45, 0.12, x, 1.55, 5.88, false);
    addBox(scene, cream, 1.12, 1.22, 0.045, x, 1.55, 5.78, false);
    addBox(scene, darkWood, 0.08, 1.26, 0.08, x, 1.55, 5.73, false);
    addBox(scene, wood, 1.42, 1.62, 0.12, x, 4.82, 5.88, false);
    addBox(scene, cream, 1.18, 1.38, 0.045, x, 4.82, 5.78, false);
    addBox(scene, darkWood, 0.08, 1.42, 0.08, x, 4.82, 5.73, false);
  }
  const roof = new THREE.MeshStandardMaterial({ color: "#393b39", roughness: 0.91 });
  const leftRoof = addBox(scene, roof, 6.55, 0.18, 12.1, -3.1, 6.27, 0.5, true);
  leftRoof.rotation.z = 0.19;
  const rightRoof = addBox(scene, roof, 6.55, 0.18, 12.1, 3.1, 6.27, 0.5, true);
  rightRoof.rotation.z = -0.19;
  addBox(scene, darkWood, 7.6, 0.2, 1.85, 0, 3.27, 6.8, true);
  addBox(scene, cream, 7.85, 0.12, 0.12, 0, 3.16, 7.68, false);
  for (const x of [-3.25, 3.25]) {
    addBox(scene, darkWood, 0.2, 3.0, 0.2, x, 1.54, 6.88, true);
    addBox(scene, cream, 0.26, 0.12, 0.26, x, 3.05, 6.88, false);
    addBox(scene, cream, 0.26, 0.12, 0.26, x, 0.07, 6.88, false);
  }
  for (const x of [-5.85, 5.85]) {
    addBox(scene, darkWood, 0.22, 6.1, 0.22, x, 3.12, 6.1, true);
  }
  addBox(scene, darkWood, 12.0, 0.2, 0.24, 0, 6.17, 6.02, true);
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
    addBox(scene, darkWood, 1.2, 0.82, 0.62, -5.95, 0.41, -6.45, true);
    addBox(scene, cream, 1.27, 0.1, 0.7, -5.95, 0.87, -6.45, true);
    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.18, 18),
      cream,
    );
    basin.position.set(-5.95, 0.94, -6.45);
    scene.add(basin);
    const faucet = new THREE.MeshStandardMaterial({ color: "#848a83", metalness: 0.65, roughness: 0.38 });
    addBox(scene, faucet, 0.055, 0.33, 0.055, -5.95, 1.13, -6.15, false);
    addBox(scene, faucet, 0.24, 0.055, 0.055, -5.95, 1.27, -6.23, false);
    addBox(scene, darkWood, 1.72, 0.12, 0.26, -4.55, 1.82, -5.88, true);
    addBox(scene, darkWood, 1.72, 0.12, 0.26, -4.55, 2.15, -5.88, true);
    for (let index = 0; index < 4; index += 1) {
      const bottle = new THREE.MeshStandardMaterial({
        color: ["#8e8a70", "#62766f", "#a18767", "#6a6b62"][index],
        roughness: 0.82,
      });
      addBox(scene, bottle, 0.18, 0.28 + (index % 2) * 0.08, 0.16, -5.18 + index * 0.42, 2.02, -5.95, false);
    }
    addBox(scene, wood, 1.55, 0.08, 0.08, -6.05, 1.45, -7.9, false);
    addBox(
      scene,
      new THREE.MeshStandardMaterial({ color: "#647068", roughness: 0.98 }),
      0.42,
      0.58,
      0.04,
      -5.58,
      1.12,
      -7.91,
      false,
    );
    addBox(scene, new THREE.MeshStandardMaterial({ color: "#736250", roughness: 0.98 }), 0.52, 0.55, 0.52, -3.02, 0.28, -6.32, true);
    addBox(scene, cream, 0.56, 0.07, 0.56, -3.02, 0.59, -6.32, true);
    obstacles.push(
      { minX: -3.95, maxX: -2.95, minZ: -10.98, maxZ: -10.08 },
      { minX: -6.5, maxX: -4.8, minZ: -10.95, maxZ: -10.1 },
      { minX: -11.7, maxX: -9.6, minZ: -7.15, maxZ: -6.15 },
      { minX: -6.7, maxX: -5.2, minZ: -6.95, maxZ: -5.95 },
      { minX: -3.38, maxX: -2.65, minZ: -6.68, maxZ: -5.96 },
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
    floorHeight: number,
  ): THREE.PointLight[] {
    addBox(scene, darkWood, 3.6, 2.2, 0.32, 0, floorHeight + 1.1, -28.7, true);
    addBox(scene, cream, 0.12, 1.3, 0.035, 0, floorHeight + 1.6, -28.51, false);
    const lights: THREE.PointLight[] = [];
    for (const x of [-2.8, 2.8]) {
      const pool = new THREE.PointLight("#8b5541", 1.4, 4.5, 2);
      pool.position.set(x, floorHeight + 2.1, -24.1);
      pool.userData.baseIntensity = pool.intensity;
      scene.add(pool);
      lights.push(pool);
    }
    const overhead = new THREE.PointLight("#cbbca0", 4.5, 9, 2);
    overhead.position.set(0, floorHeight + 2.8, -24.75);
    overhead.userData.baseIntensity = overhead.intensity;
    overhead.castShadow = true;
    scene.add(overhead);
    lights.push(overhead);
    addBox(scene, brass, 0.05, 2.4, 0.05, -3.2, floorHeight + 1.2, -22.2, false);
    addBox(scene, brass, 0.05, 2.4, 0.05, 3.2, floorHeight + 1.2, -22.2, false);

    const restraint = new THREE.MeshStandardMaterial({ color: "#55483a", roughness: 0.96 });
    addBox(scene, darkWood, 0.95, 0.16, 0.86, -1.9, floorHeight + 0.56, -27.65, true);
    for (const x of [-2.34, -1.46]) {
      addBox(scene, darkWood, 0.11, 1.05, 0.11, x, floorHeight + 0.66, -27.98, true);
      addBox(scene, restraint, 0.08, 0.035, 0.55, x, floorHeight + 1.03, -27.73, false);
    }
    addBox(scene, darkWood, 1.0, 0.12, 0.1, -1.9, floorHeight + 1.02, -27.98, false);
    const loopMaterial = restraint;
    for (const x of [-2.3, -1.5]) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.014, 7, 16), loopMaterial);
      loop.position.set(x, floorHeight + 0.78, -27.41);
      loop.rotation.y = Math.PI / 2;
      scene.add(loop);
    }
    return lights;
  }

  function addEpisodeProps(
    scene: THREE.Scene,
    interactables: Interactable[],
    onStoryInteraction: (id: string) => void,
    storyPropObjects: Map<string, THREE.Object3D>,
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
      storyPropObjects.set(prop.id, object);
      interactables.push({
        id: `episode-${prop.id}`,
        prompt: prop.id === "stone" ? "Take the stone" : `Inspect ${prop.id.replaceAll("-", " ")}`,
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
  addBox(scene, mats.wood, 0.85, 0.82, 0.76, 2.35, 0.41, 3.55, true);
  addBox(scene, mats.cream, 0.92, 0.06, 0.8, 2.35, 0.84, 3.55, false);
  obstacles.push({ minX: 1.9, maxX: 2.8, minZ: 3.05, maxZ: 4.05 });
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

interface FigureAppearance {
  faceStyle: "protagonist" | "zayan" | "tenant";
  coatColor: string;
  shirtColor: string;
  skinColor: string;
  hairColor: string;
  trousersColor: string;
  scaleX: number;
  scaleY: number;
}

function createDemoFigure(appearance: FigureAppearance): THREE.Group {
  const group = new THREE.Group();
  group.name = "demo-figure-interaction";
  group.position.set(0.88, 0, -7.25);
  group.rotation.y = 0;
  group.scale.set(appearance.scaleX, appearance.scaleY, 1);
  const coat = new THREE.MeshStandardMaterial({ color: appearance.coatColor, roughness: 0.92 });
  const shirt = new THREE.MeshStandardMaterial({ color: appearance.shirtColor, roughness: 0.93 });
  const skin = new THREE.MeshStandardMaterial({
    color: appearance.skinColor,
    roughness: 0.86,
  });
  const skinShadow = new THREE.MeshStandardMaterial({
    color: new THREE.Color(appearance.skinColor).multiplyScalar(0.68),
    roughness: 0.92,
  });
  const lip = new THREE.MeshStandardMaterial({
    color: new THREE.Color(appearance.skinColor).lerp(new THREE.Color("#8b5148"), 0.42),
    roughness: 0.82,
  });
  const hair = new THREE.MeshStandardMaterial({ color: appearance.hairColor, roughness: 0.94 });
  const trousers = new THREE.MeshStandardMaterial({ color: appearance.trousersColor, roughness: 0.97 });
  const eyes = new THREE.MeshStandardMaterial({ color: "#e5ddd0", roughness: 0.38 });
  const iris = new THREE.MeshStandardMaterial({
    color: appearance.faceStyle === "tenant" ? "#667064" : "#55483d",
    roughness: 0.42,
  });
  const dark = new THREE.MeshStandardMaterial({ color: "#29231f", roughness: 0.93 });
  const pupil = new THREE.MeshStandardMaterial({ color: "#171514", roughness: 0.28 });

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
  addPart(group, new THREE.CylinderGeometry(0.075, 0.095, 0.23, 16), skin, 0, 1.66, -0.005);
  const face = FACE_SHAPES[appearance.faceStyle];
  const headProfile = [
    [0.095, 0.015],
    [0.125, 0.045],
    [face.jaw * 0.17, 0.105],
    [face.cheek * 0.19, 0.19],
    [face.temple * 0.18, 0.285],
    [face.temple * 0.17, 0.365],
    [0.132, 0.43],
    [0.082, 0.475],
    [0, 0.49],
  ].map(([radius, height]) => new THREE.Vector2(radius * face.width, height * face.height));
  const headGeometry = new THREE.LatheGeometry(headProfile, 32);
  headGeometry.computeVertexNormals();
  addPart(group, headGeometry, skin, 0, 1.61, 0);

  const eyeY = 1.89;
  const eyeSpacing = face.eyeSpacing;
  const eyeSocket = new THREE.MeshStandardMaterial({
    color: new THREE.Color(appearance.skinColor).multiplyScalar(0.78),
    roughness: 0.95,
  });
  const brows: Array<[number, number]> = [[-1, face.browTilt], [1, -face.browTilt]];
  for (const side of [-1, 1]) {
    const x = side * eyeSpacing;
    const cheek = addPart(
      group,
      new THREE.SphereGeometry(1, 18, 14),
      skin,
      side * 0.105 * face.width,
      1.765,
      0.112,
    );
    cheek.scale.set(0.078 * face.cheek, 0.068, 0.038);

    const socket = addPart(group, new THREE.SphereGeometry(1, 18, 14), eyeSocket, x, eyeY, 0.146);
    socket.scale.set(0.048, 0.034, 0.021);
    const eyeball = addPart(group, new THREE.SphereGeometry(1, 20, 16), eyes, x, eyeY, 0.16);
    eyeball.scale.set(0.033, 0.023, 0.025);
    const irisMesh = addPart(group, new THREE.SphereGeometry(1, 16, 12), iris, x, eyeY - 0.001, 0.181);
    irisMesh.scale.set(0.0145, 0.017, 0.008);
    const pupilMesh = addPart(group, new THREE.SphereGeometry(1, 14, 10), pupil, x, eyeY - 0.001, 0.187);
    pupilMesh.scale.set(0.007, 0.010, 0.004);
    const catchlight = new THREE.MeshBasicMaterial({ color: "#f2eadd" });
    const highlight = addPart(group, new THREE.SphereGeometry(0.0035, 8, 6), catchlight, x - 0.004, eyeY + 0.006, 0.191);
    highlight.castShadow = false;

    const [browSide, tilt] = brows[side === -1 ? 0 : 1];
    const browPoints = [
      new THREE.Vector3(browSide * (eyeSpacing - 0.045), eyeY + 0.047 + tilt * 0.3, 0.153),
      new THREE.Vector3(browSide * eyeSpacing, eyeY + 0.061 + tilt, 0.17),
      new THREE.Vector3(browSide * (eyeSpacing + 0.045), eyeY + 0.045 - tilt * 0.25, 0.151),
    ];
    addFaceCurve(group, hair, browPoints, face.browWeight, 10);

    const upperLidPoints = [
      new THREE.Vector3(x - 0.034, eyeY + 0.002, 0.173),
      new THREE.Vector3(x, eyeY + 0.022, 0.181),
      new THREE.Vector3(x + 0.034, eyeY + 0.002, 0.173),
    ];
    addFaceCurve(group, skinShadow, upperLidPoints, 0.0045, 8);
  }

  const noseBridge = addPart(group, new THREE.SphereGeometry(1, 16, 14), skin, 0, 1.795, 0.166);
  noseBridge.scale.set(0.026, 0.076, 0.046);
  const noseTip = addPart(group, new THREE.SphereGeometry(1, 16, 12), skin, 0, 1.727, 0.195);
  noseTip.scale.set(0.035, 0.026, 0.041);
  for (const side of [-1, 1]) {
    const nostril = addPart(group, new THREE.SphereGeometry(1, 10, 8), skinShadow, side * 0.022, 1.71, 0.205);
    nostril.scale.set(0.009, 0.006, 0.005);

    const ear = addPart(group, new THREE.SphereGeometry(1, 16, 12), skin, side * 0.174, 1.815, -0.012);
    ear.scale.set(0.036, 0.061, 0.035);
    const innerEar = addPart(group, new THREE.SphereGeometry(1, 12, 10), skinShadow, side * 0.184, 1.816, 0.008);
    innerEar.scale.set(0.016, 0.036, 0.014);
  }

  const upperLipPoints = [
    new THREE.Vector3(-0.043, 1.666, 0.117),
    new THREE.Vector3(-0.021, 1.674, 0.126),
    new THREE.Vector3(0, 1.669, 0.13),
    new THREE.Vector3(0.021, 1.674, 0.126),
    new THREE.Vector3(0.043, 1.666, 0.117),
  ];
  const lowerLipPoints = [
    new THREE.Vector3(-0.038, 1.659, 0.119),
    new THREE.Vector3(0, 1.65, 0.128),
    new THREE.Vector3(0.038, 1.659, 0.119),
  ];
  addFaceCurve(group, lip, upperLipPoints, 0.006, 14);
  addFaceCurve(group, lip, lowerLipPoints, 0.006, 12);
  addFaceCurve(
    group,
    skinShadow,
    [new THREE.Vector3(-0.034, 1.662, 0.123), new THREE.Vector3(0, 1.661, 0.13), new THREE.Vector3(0.034, 1.662, 0.123)],
    0.0025,
    10,
  );
  addPart(group, new THREE.SphereGeometry(0.18, 18, 12), skin, 0, 1.625, -0.02).scale.set(0.68, 0.16, 0.74);
  addPart(group, new THREE.BoxGeometry(0.18, 0.055, 0.11), coat, 0, 1.48, 0.11);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.205, 28, 18, 0, Math.PI * 2, 0, face.hairCapAngle),
    hair,
  );
  hairCap.position.set(0, 1.905, -0.008);
  hairCap.scale.set(face.hairWidth, 1, 0.98);
  hairCap.castShadow = true;
  group.add(hairCap);
  for (const lock of face.hairLocks) {
    const tuft = addPart(group, new THREE.SphereGeometry(1, 14, 10), hair, lock.x, lock.y, lock.z);
    tuft.scale.set(lock.sx, lock.sy, lock.sz);
    tuft.rotation.z = lock.rotation;
  }
  if (appearance.faceStyle === "tenant") {
    for (const side of [-1, 1]) {
      const sideHair = addPart(
        group,
        new THREE.SphereGeometry(0.09, 14, 10),
        hair,
        side * 0.148,
        1.84,
        -0.025,
      );
      sideHair.scale.set(0.45, 1.85, 0.8);
    }
  }

  addPart(group, new THREE.SphereGeometry(0.024, 8, 8), new THREE.MeshStandardMaterial({ color: "#aa8a62", metalness: 0.56 }), 0, 1.25, 0.265);
  addPart(group, new THREE.SphereGeometry(0.024, 8, 8), new THREE.MeshStandardMaterial({ color: "#aa8a62", metalness: 0.56 }), 0, 1.03, 0.27);
  return group;
}

interface FaceShape {
  width: number;
  height: number;
  jaw: number;
  cheek: number;
  temple: number;
  eyeSpacing: number;
  browTilt: number;
  browWeight: number;
  hairCapAngle: number;
  hairWidth: number;
  hairLocks: Array<{ x: number; y: number; z: number; sx: number; sy: number; sz: number; rotation: number }>;
}

const FACE_SHAPES: Record<FigureAppearance["faceStyle"], FaceShape> = {
  protagonist: {
    width: 1,
    height: 1.04,
    jaw: 0.78,
    cheek: 0.94,
    temple: 1,
    eyeSpacing: 0.063,
    browTilt: 0.002,
    browWeight: 0.009,
    hairCapAngle: 1.12,
    hairWidth: 0.96,
    hairLocks: [
      { x: -0.055, y: 2.035, z: 0.105, sx: 0.093, sy: 0.04, sz: 0.075, rotation: 0.14 },
      { x: 0.035, y: 2.045, z: 0.09, sx: 0.105, sy: 0.035, sz: 0.065, rotation: -0.1 },
    ],
  },
  zayan: {
    width: 1.04,
    height: 1,
    jaw: 0.91,
    cheek: 1.08,
    temple: 1.03,
    eyeSpacing: 0.067,
    browTilt: 0.008,
    browWeight: 0.012,
    hairCapAngle: 1.3,
    hairWidth: 1,
    hairLocks: [
      { x: -0.105, y: 2.025, z: 0.052, sx: 0.071, sy: 0.055, sz: 0.09, rotation: -0.32 },
      { x: -0.025, y: 2.055, z: 0.075, sx: 0.072, sy: 0.045, sz: 0.085, rotation: 0.1 },
      { x: 0.065, y: 2.04, z: 0.044, sx: 0.09, sy: 0.052, sz: 0.09, rotation: 0.42 },
    ],
  },
  tenant: {
    width: 0.94,
    height: 1.08,
    jaw: 0.72,
    cheek: 0.91,
    temple: 0.93,
    eyeSpacing: 0.06,
    browTilt: -0.004,
    browWeight: 0.01,
    hairCapAngle: 0.83,
    hairWidth: 0.96,
    hairLocks: [],
  },
};

function addFaceCurve(
  parent: THREE.Object3D,
  material: THREE.Material,
  points: THREE.Vector3[],
  radius: number,
  segments: number,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, 6, false), material);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
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
  floorHeight = 0,
): {
  panel: THREE.Object3D;
  isOpen: boolean;
  canClose: () => boolean;
  update: (delta: number) => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
} {
  const frame = new THREE.MeshStandardMaterial({ color: "#382e27", roughness: 0.88 });
  addBox(scene, frame, 0.22, 2.42, 0.13, x, floorHeight + 1.19, z - 1.11, false);
  addBox(scene, frame, 0.22, 2.42, 0.13, x, floorHeight + 1.19, z + 1.11, false);
  addBox(scene, frame, 0.22, 0.13, 2.35, x, floorHeight + 2.38, z, false);
  const hinge = new THREE.Group();
  hinge.position.set(x + side * 0.03, floorHeight, z - side);
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
    target = open ? Math.PI * 0.47 : 0;
    emitDoorSound();
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

function makeFinalDoor(
  scene: THREE.Scene,
  wood: THREE.Material,
  brass: THREE.Material,
  canOpen: () => boolean,
  onStoryInteraction: (id: string) => void,
  z: number,
  floorHeight: number,
): {
  panel: THREE.Object3D;
  isOpen: boolean;
  canClose: () => boolean;
  update: (delta: number) => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  interactable: Interactable;
} {
  const door = makeCustomPassageDoor(scene, wood, brass, z, floorHeight);
  const setOpen = (open: boolean) => {
    if (open && !canOpen()) return;
    door.setOpen(open);
    if (open) onStoryInteraction("final-door-opened");
  };
  return {
    ...door,
    get isOpen() {
      return door.isOpen;
    },
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
  floorHeight: number,
  centerX = 0,
): {
  panel: THREE.Object3D;
  isOpen: boolean;
  canClose: () => boolean;
  update: (delta: number) => void;
  toggle: () => void;
  setOpen: (open: boolean) => void;
} {
  const frame = new THREE.MeshStandardMaterial({ color: "#2c2623", roughness: 0.9 });
  addBox(scene, frame, 0.13, 2.5, 0.22, centerX - 1.11, floorHeight + 1.23, z, false);
  addBox(scene, frame, 0.13, 2.5, 0.22, centerX + 1.11, floorHeight + 1.23, z, false);
  addBox(scene, frame, 2.35, 0.13, 0.22, centerX, floorHeight + 2.48, z, false);
  const hinge = new THREE.Group();
  hinge.position.set(centerX - 1, floorHeight, z + 0.03);
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
    if (isOpen === open) return;
    isOpen = open;
    target = open ? -Math.PI * 0.48 : 0;
    emitDoorSound();
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
    emitDoorSound();
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
    emitDoorSound();
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

function addPracticalLight(
  scene: THREE.Scene,
  environment: EnvironmentSystem,
  x: number,
  y: number,
  z: number,
  intensity: number,
  distance: number,
): void {
  const light = new THREE.PointLight("#dfbd95", intensity, distance, 2);
  light.position.set(x, y, z);
  light.userData.baseIntensity = intensity;
  scene.add(light);
  environment.addPractical(light);
}

function addUpperTableLamp(
  scene: THREE.Scene,
  x: number,
  surfaceY: number,
  z: number,
  lightColor: string,
  intensity: number,
): void {
  const metal = new THREE.MeshStandardMaterial({ color: "#806746", metalness: 0.55, roughness: 0.48 });
  const shade = new THREE.MeshStandardMaterial({
    color: "#b49a74",
    emissive: lightColor,
    emissiveIntensity: 0.28,
    roughness: 0.82,
    side: THREE.DoubleSide,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.035, 12), metal);
  base.position.set(x, surfaceY + 0.018, z);
  scene.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.2, 8), metal);
  stem.position.set(x, surfaceY + 0.13, z);
  scene.add(stem);
  const lampshade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.23, 0.22, 12, 1, true), shade);
  lampshade.position.set(x, surfaceY + 0.32, z);
  scene.add(lampshade);
  const light = new THREE.PointLight(lightColor, intensity, 4.5, 2);
  light.position.set(x, surfaceY + 0.27, z);
  scene.add(light);
}

function addUpperWallSconce(scene: THREE.Scene, x: number, y: number, z: number): void {
  const mount = new THREE.MeshStandardMaterial({ color: "#46382d", roughness: 0.82 });
  const glow = new THREE.MeshBasicMaterial({ color: "#d7b78b" });
  addBox(scene, mount, 0.055, 0.3, 0.2, x, y, z, false);
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), glow);
  shade.position.set(x - 0.09, y - 0.01, z);
  scene.add(shade);
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
