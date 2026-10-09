import * as THREE from "three";
import bridge from "@playgama/bridge";
import type { Conversation, DayPhase, StorySnapshot } from "./types";
import { EpisodeOne, type EpisodeEnding } from "./content/EpisodeOne";
import { AudioSystem } from "./systems/AudioSystem";
import { CharacterSystem } from "./systems/CharacterSystem";
import { CinematicSystem } from "./systems/CinematicSystem";
import { DialogueSystem } from "./systems/DialogueSystem";
import { EnvironmentSystem } from "./systems/EnvironmentSystem";
import { EventDirector } from "./systems/EventDirector";
import { InteractionSystem } from "./systems/InteractionSystem";
import { SaveSystem } from "./systems/SaveSystem";
import { INITIAL_PLAYER, StoryState } from "./systems/StoryState";
import { buildHouseDemo } from "./world/HouseDemo";
import { Player } from "./world/Player";

const PHASE_LABEL: Record<DayPhase, string> = {
  morning: "MORNING",
  afternoon: "AFTERNOON",
  evening: "EVENING",
  night: "NIGHT",
};

const OBJECTIVE_COPY: Record<string, { label: string; hint: string }> = {
  "Listen to the opening, then settle into the house.": {
    label: "Get settled.",
    hint: "The move-in note near the entrance has details about the house.",
  },
  "Open the front door and check in with the tenant at reception.": {
    label: "Check in at reception.",
    hint: "The tenant is waiting just inside the front door.",
  },
  "Check in with the tenant at reception.": {
    label: "Check in at reception.",
    hint: "Look for the tenant in the front hall.",
  },
  "The stranger hurried inside. Ask the tenant who they are.": {
    label: "Ask about the stranger.",
    hint: "The tenant is near reception; ask who just came in.",
  },
  "Find Zayan in the dining area. Ask why the tenant treats him this way.": {
    label: "Find Zayan in the dining room.",
    hint: "Head through the central hall toward the dining table.",
  },
  "Ask the tenant who the person was, then return upstairs.": {
    label: "Ask about Zayan, then rest.",
    hint: "The tenant is near reception. Afterward, go upstairs and interact with your bed.",
  },
  "The laundry scene left a dark mark beneath the sink. Inspect it.": {
    label: "Inspect the laundry stain.",
    hint: "Look beneath the laundry sink, close to the floor.",
  },
  "Help the housemate check the laundry pipes and find where the stain came from.": {
    label: "Trace the laundry leak.",
    hint: "Check the exposed pipe behind the sink; the loose valve is mounted on it.",
  },
  "Turn the seized valve behind the laundry sink and stop the leak.": {
    label: "Stop the laundry leak.",
    hint: "The loose wheel on the pipe behind the sink is the shutoff.",
  },
  "Turn the seized valve behind the laundry sink.": {
    label: "Stop the laundry leak.",
    hint: "Look for the small valve wheel behind the laundry sink.",
  },
  "The tenant knew where you were headed. Search their records with Zayan.": {
    label: "Search the tenant's study.",
    hint: "The study is beyond the tenant's room; Zayan can help you compare the records.",
  },
  "Return to the laundry with Zayan and trace the leak beneath the sink.": {
    label: "Return to the laundry with Zayan.",
    hint: "The laundry is through the west-hand door off the central hall.",
  },
  "You and Zayan will confront the tenant tonight. Return upstairs and sleep before Sunday.": {
    label: "Rest before Sunday.",
    hint: "Go upstairs to your bedroom and interact with the bed.",
  },
  "Go upstairs to your room and rest after the journey.": {
    label: "Rest in your room.",
    hint: "Your bedroom is at the top of the stairs; interact with the bed.",
  },
  "Find Zayan in the laundry room and see what he was cleaning.": {
    label: "Find Zayan in the laundry room.",
    hint: "Follow the hall to the west-side laundry door.",
  },
  "Find Zayan in the laundry room.": {
    label: "Find Zayan in the laundry room.",
    hint: "Follow the hall to the west-side laundry door.",
  },
  "Ask Zayan about the mark beneath the laundry sink.": {
    label: "Ask Zayan about the stain.",
    hint: "Find Zayan in the dining area and ask what he knows about the mark.",
  },
  "Inspect the dark mark beneath the laundry sink.": {
    label: "Inspect the laundry stain.",
    hint: "The mark is beneath the sink; get close and interact with it.",
  },
  "Ask Zayan why he was cleaning the laundry-room stain.": {
    label: "Ask Zayan about the stain.",
    hint: "Find Zayan in the dining area and ask him about the mark.",
  },
  "Zayan trusts you now. Find the key he left in the storage room and compare what he says with the tenant's records.": {
    label: "Find Zayan's key in storage.",
    hint: "The storage room opens from the laundry. Look on the worktable, then compare the key's clue with the tenant's records.",
  },
  "Compare what you found with what Zayan and the tenant have told you.": {
    label: "Compare the accounts.",
    hint: "Review the key's clue, then speak with both Zayan and the tenant.",
  },
  "The note warns the tenant not to let Zayan take you downstairs. Ask Zayan what is below the house.": {
    label: "Ask Zayan about downstairs.",
    hint: "Find Zayan in the dining room; the note's warning is about a place beneath the house.",
  },
  "Talk to the tenant about the ledger and the recording.": {
    label: "Confront the tenant with the evidence.",
    hint: "The tenant is usually near reception. Bring up both the ledger and the recording.",
  },
  "The hallway warning does not explain the stain. Find out what Zayan was cleaning.": {
    label: "Find out what Zayan cleaned.",
    hint: "Return to the laundry and inspect the mark beneath the sink.",
  },
  "The dates in the ledger contradict the tenant. Find the recorder in the study.": {
    label: "Find the recorder in the study.",
    hint: "Check the tenant's study desk; the recorder is beside the repair records.",
  },
  "The tenant's account doesn't fit the evidence. Bring it to Zayan and decide what to do.": {
    label: "Discuss the evidence with Zayan.",
    hint: "Find Zayan in the dining room and talk through what you discovered.",
  },
  "Check the tenant's repair records with Zayan, then decide what the evidence means.": {
    label: "Check the tenant's records.",
    hint: "The repair ledger is in the tenant's room; search it with Zayan before deciding what it proves.",
  },
  "Speak with Zayan about what you witnessed before confronting the tenant.": {
    label: "Talk to Zayan first.",
    hint: "Find Zayan in the dining area and ask about what you saw.",
  },
  "Return upstairs and rest. You and Zayan will talk after you see how the tenant treats him.": {
    label: "Rest before confronting the tenant.",
    hint: "Go upstairs to your bedroom and interact with the bed.",
  },
  "Enter the house. Someone is waiting near the front hall.": {
    label: "Go inside.",
    hint: "Open the front door and look for the person waiting in the hall.",
  },
  "Go through the hall. The tenant's voice is raised.": {
    label: "Find the tenant and Zayan.",
    hint: "Follow the raised voices through the hall to the dining area.",
  },
  "Try Zayan's upstairs door.": {
    label: "Check Zayan's door.",
    hint: "Go upstairs and knock on the closed door at the end of the corridor.",
  },
  "Enter Zayan's room and check inside.": {
    label: "Check inside Zayan's room.",
    hint: "The latch has released. Open the door and look inside.",
  },
  "Carry the stone upstairs to the door the tenant forbade you to open.": {
    label: "Take the stone to the forbidden door.",
    hint: "Carry the stone from the garden upstairs to the locked door at the end of the corridor.",
  },
  "Find something heavy in the garden, then return upstairs to the forbidden room.": {
    label: "Find a stone in the garden.",
    hint: "Look near the garden fence for a loose stone, then take it upstairs.",
  },
  "The tenant is here. The room feels familiar in a way you cannot explain.": {
    label: "Face the tenant.",
    hint: "Look toward the tenant and listen.",
  },
};

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly player: Player;
  private readonly story = new StoryState();
  private readonly saves = new SaveSystem();
  private readonly audio = new AudioSystem();
  private readonly environment = new EnvironmentSystem(this.audio);
  private readonly cinematics = new CinematicSystem();
  private readonly dialogues = new DialogueSystem();
  private readonly world;
  private readonly events = new EventDirector(this.story);
  private readonly characters: CharacterSystem;
  private episode!: EpisodeOne;
  private readonly interactions: InteractionSystem;
  private readonly title = required<HTMLElement>("#title-screen");
  private readonly hud = required<HTMLElement>("#hud");
  private readonly pauseScreen = required<HTMLElement>("#pause-screen");
  private readonly inspectionPanel = required<HTMLElement>("#inspection-panel");
  private readonly dayLabel = required<HTMLElement>("#day-label");
  private readonly objectiveText = required<HTMLElement>("#objective-text");
  private readonly hintButton = required<HTMLButtonElement>("#hint-button");
  private readonly objectiveDirection = required<HTMLElement>("#objective-direction");
  private readonly objectiveDirectionArrow = required<HTMLElement>("#objective-direction-arrow");
  private readonly toast = required<HTMLElement>("#toast");
  private readonly screenReaderStatus = required<HTMLElement>("#screen-reader-status");
  private readonly travelTransition = required<HTMLElement>("#travel-transition");
  private readonly travelTransitionTitle = required<HTMLElement>("#travel-transition-title");
  private readonly travelTransitionCopy = required<HTMLElement>("#travel-transition-copy");
  private readonly creatorDialog = required<HTMLDialogElement>("#creator-dialog");
  private readonly creatorOpenButton = required<HTMLButtonElement>("#creator-open");
  private readonly creatorCloseButton = required<HTMLButtonElement>("#creator-close");
  private readonly endingScreen = required<HTMLElement>("#ending-screen");
  private readonly endingTitle = required<HTMLElement>("#ending-title");
  private readonly endingCopy = required<HTMLElement>("#ending-copy");
  private readonly inspectTitle = required<HTMLElement>("#inspection-title");
  private readonly inspectText = required<HTMLElement>("#inspection-text");
  private readonly startButton = required<HTMLButtonElement>("#start-button");
  private readonly continueButton = required<HTMLButtonElement>("#continue-button");
  private readonly pauseButton = required<HTMLButtonElement>("#pause-button");
  private readonly resumeButton = required<HTMLButtonElement>("#resume-button");
  private readonly saveButton = required<HTMLButtonElement>("#save-button");
  private readonly inspectCloseButton = required<HTMLButtonElement>("#inspection-close");
  private readonly endingReplayButton = required<HTMLButtonElement>("#ending-replay");
  private isPlaying = false;
  private toastTimeout = 0;
  private travelTransitionTimeout = 0;
  private autosaveTime = 0;
  private elapsed = 0;
  private lastFrame = 0;
  private objectiveTarget: THREE.Vector3 | null = null;
  private currentHint = "Follow the objective marker and look for objects with an interaction prompt.";
  private readonly objectiveToTarget = new THREE.Vector3();
  private readonly objectiveForward = new THREE.Vector3();
  private pixelRatio = 0;
  private pixelRatioCeiling = 1;
  private qualityElapsed = 0;
  private qualityFrameTime = 0;
  private qualityFrames = 0;
  private qualityRecoveryElapsed = 0;
  private mobileQuality = window.matchMedia("(pointer: coarse)").matches;
  private adaptiveShadowsDisabled = false;
  private platformInitialized = false;
  private platformPaused = false;
  private advertisementPaused = false;
  private platformAudioEnabled = true;
  private readyMessageSent = false;
  private rewardedHintPending = false;
  private hintFeedbackTimeout = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = !this.mobileQuality;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.player = new Player(
      canvas,
      () => this.interactions?.clearFocus(),
      () => this.pause(),
    );
    this.world = buildHouseDemo(
      this.environment,
      (open) => {
        this.story.setFlag("foundation.hallDoorOpen", open);
        this.saveCheckpoint(false);
      },
      () => Math.abs(this.player.position.x) < 1.2 && Math.abs(this.player.position.z + 4.9) < 0.7,
      () => Math.abs(this.player.position.x) < 1.2 && Math.abs(this.player.position.z + 12.08) < 0.7,
      (id) => this.episode?.interact(id),
      () => this.story.hasFlag("episode.rescueReady") && this.story.hasFlag("episode.stoneFound"),
      () => Math.abs(this.player.position.x) < 1.3 && Math.abs(this.player.position.z - 6) < 0.6,
      () => this.player.position,
    );
    window.addEventListener("game:door-sound", () => this.audio.playDoorSound());
    window.addEventListener("game:back-room-door", (event) => {
      const open = (event as CustomEvent<boolean>).detail;
      this.story.setFlag("foundation.backRoomDoorOpen", open);
      this.saveCheckpoint(false);
    });
    this.characters = new CharacterSystem(this.world.scene);
    const housemate = this.world.characters[0];
    const tenant = this.world.characters[1];
    if (housemate) this.characters.register({ id: "housemate", object: housemate });
    if (tenant) this.characters.register({ id: "tenant", object: tenant });
    this.interactions = new InteractionSystem(this.player.camera, this.world.scene);
    this.world.interactables.forEach((target) => this.interactions.register(target));
    this.episode = new EpisodeOne({
      events: this.events,
      story: this.story,
      player: this.player,
      characters: this.characters,
      cinematics: this.cinematics,
      world: this.world,
      playTone: (frequency, duration, volume) => this.audio.playTone(frequency, duration, volume),
      setObjective: (objective, destination) => this.setObjective(objective, destination),
      showToast: (message) => this.showToast(message),
      saveCheckpoint: () => this.saveCheckpoint(false),
      transition: (message, title) => this.showTravelTransition(message, title),
      showInterstitial: (placement) => this.showInterstitial(placement),
      showEnding: (ending) => this.showEnding(ending),
    });
    this.setupUi();
    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyE" && this.canInteract()) this.interactions.interact();
      if (event.code === "Escape") this.handleEscape();
    });
    window.addEventListener("game:inspect", (event) => this.openInspection(event as CustomEvent));
    window.addEventListener("game:dialogue", (event) => this.openDialogue(event as CustomEvent));
    this.story.subscribe((snapshot) => this.renderStory(snapshot));
  }

  async initializePlatform(): Promise<void> {
    try {
      await bridge.initialize();
      document.documentElement.dataset.platformLanguage = bridge.platform.language;
      this.platformAudioEnabled = bridge.platform.isAudioEnabled;
      this.platformPaused = bridge.platform.isPaused;
      bridge.platform.on(bridge.EVENT_NAME.AUDIO_STATE_CHANGED, (enabled: boolean) => {
        this.platformAudioEnabled = enabled;
        this.audio.setPlatformState(
          this.platformAudioEnabled,
          this.platformPaused || this.advertisementPaused,
        );
      });
      bridge.platform.on(bridge.EVENT_NAME.PAUSE_STATE_CHANGED, (paused: boolean) => {
        this.platformPaused = paused;
        this.audio.setPlatformState(
          this.platformAudioEnabled,
          this.platformPaused || this.advertisementPaused,
        );
        if (paused) {
          this.player.releasePointerLock();
          void this.saveCheckpoint(false);
        }
      });
      await this.saves.initialize(bridge.platform.id === bridge.PLATFORM_ID.MOCK);
      bridge.advertisement.on(
        bridge.EVENT_NAME.REWARDED_STATE_CHANGED,
        (state: string) => this.handleRewardedState(state),
      );
      bridge.advertisement.on(
        bridge.EVENT_NAME.INTERSTITIAL_STATE_CHANGED,
        (state: string) => this.handleInterstitialState(state),
      );
      if (bridge.advertisement.isInterstitialSupported) {
        bridge.advertisement.preloadInterstitial("game_start");
      }
      if (bridge.advertisement.isRewardedSupported) {
        bridge.advertisement.preloadRewarded("objective_hint");
      }
      this.platformInitialized = true;
    } catch (error) {
      console.error("Unable to initialize Playgama Bridge; using local browser saves.", error);
      await this.saves.initialize(true);
    }
    this.audio.setPlatformState(
      this.platformAudioEnabled,
      this.platformPaused || this.advertisementPaused,
    );
    this.updateHintButtonLabel();
  }

  private showTravelTransition(message: string, title?: string): void {
    window.clearTimeout(this.travelTransitionTimeout);
    this.travelTransitionTitle.textContent = title ?? "";
    this.travelTransitionTitle.hidden = !title;
    this.travelTransitionCopy.textContent = message;
    this.travelTransition.hidden = false;
    this.travelTransition.classList.remove("travel-transition");
    this.travelTransition.classList.remove("day-title-card");
    void this.travelTransition.offsetWidth;
    this.travelTransition.classList.add("travel-transition");
    if (title) this.travelTransition.classList.add("day-title-card");
    this.travelTransitionTimeout = window.setTimeout(() => {
      this.travelTransition.hidden = true;
    }, 4200);
  }

  start(): void {
    this.continueButton.hidden = !this.saves.hasSave();
    this.startButton.addEventListener("click", () => {
      this.player.setLookEnabled(true);
      this.player.requestPointerLock();
      this.showInterstitial("game_start");
      void this.beginNewGame();
    });
    this.continueButton.addEventListener("click", () => {
      this.player.setLookEnabled(true);
      this.player.requestPointerLock();
      void this.continueGame();
    });
    this.pauseButton.addEventListener("click", () => this.pause());
    this.hintButton.addEventListener("click", () => this.requestHint());
    this.resumeButton.addEventListener("click", () => this.resume());
    this.saveButton.addEventListener("click", () => this.saveCheckpoint());
    this.inspectCloseButton.addEventListener("click", () => this.closeInspection());
    this.creatorOpenButton.addEventListener("click", () => {
      if (!this.isPlaying) this.creatorDialog.showModal();
    });
    this.creatorCloseButton.addEventListener("click", () => this.creatorDialog.close());
    this.creatorDialog.addEventListener("click", (event) => {
      if (event.target === this.creatorDialog) this.creatorDialog.close();
    });
    document.addEventListener("click", (event) => {
      if (!this.audio.isStarted || !(event.target instanceof Element)) return;
      if (event.target.closest("button")) this.audio.playUiClick();
    }, true);
    this.endingReplayButton.addEventListener("click", () => {
      this.endingScreen.hidden = true;
      void this.beginNewGame();
    });
    window.addEventListener("keydown", (event) => {
      if (event.code === "Escape" && !this.inspectionPanel.hidden) this.closeInspection();
    });
    window.addEventListener("beforeunload", () => {
      if (this.isPlaying && !this.dialogues.isActive && !this.cinematics.active) this.saveCheckpoint();
    });
    this.lastFrame = performance.now();
    requestAnimationFrame(this.frame);
  }

  private readonly frame = (now: number): void => {
    const delta = Math.min((now - this.lastFrame) / 1000, 0.05);
    this.lastFrame = now;
    this.updateRenderQuality(delta);
    if (!this.platformPaused && !this.advertisementPaused) this.world.update(delta);

    if (
      !this.platformPaused &&
      !this.advertisementPaused &&
      this.isPlaying &&
      this.pauseScreen.hidden &&
      this.inspectionPanel.hidden &&
      this.travelTransition.hidden
    ) {
      this.elapsed += delta;
      this.player.update(
        delta,
        !this.dialogues.isActive && !this.cinematics.active,
        this.world.canOccupy,
        this.world.floorAt,
      );
      this.updateObjectiveDirection();
      if (!this.cinematics.active && !this.dialogues.isActive) {
        this.interactions.update(delta);
        this.events.update(this.player.position);
      } else {
        this.interactions.clearFocus();
      }
      if (!this.dialogues.isActive && !this.cinematics.active) {
        this.autosaveTime += delta;
        if (this.autosaveTime > 55) this.saveCheckpoint(false);
      }
      this.characters.update(delta, this.elapsed);
    }

    if (!this.platformPaused && !this.advertisementPaused) {
      this.cinematics.update(delta);
      this.episode.update(delta);
      this.environment.update(delta, this.elapsed);
    }
    this.renderer.render(this.world.scene, this.player.camera);
    if (!this.readyMessageSent) {
      this.readyMessageSent = true;
      this.sendPlatformMessage(bridge.PLATFORM_MESSAGE.GAME_READY);
    }
    requestAnimationFrame(this.frame);
  };

  private async beginNewGame(): Promise<void> {
    await this.saves.clear();
    this.story.reset();
    this.events.reset();
    this.world.setDoorOpen(false);
    this.world.setBackRoomDoorOpen(false);
    this.world.setBedroomDoorOpen(false);
    this.world.setFinalDoorOpen(false);
    this.world.setEntryDoorOpen(false);
    this.world.setWestStoreOpen(false);
    this.world.setTenantStudyOpen(false);
    this.world.setArenRoomAvailable(false);
    this.world.setArenRoomDoorOpen(false);
    this.world.setHousemateCleaning(false);
    this.world.setProtagonistRoomDoorOpen(false);
    this.world.setStoneCollected(false);
    this.world.setUpperEntryDoorOpen(true);
    this.world.setUpperTenantDoorOpen(false);
    this.world.entity.visible = false;
    this.world.setFinaleFlicker(false);
    this.world.setEntityReveal(0);
    this.characters.place("housemate", new THREE.Vector3(0.88, 0, -7.25), 0);
    this.characters.despawn("housemate");
    this.characters.place("tenant", new THREE.Vector3(-1.5, 0, 3.1), 0);
    this.characters.spawn("tenant");
    this.player.restore(INITIAL_PLAYER);
    this.endingScreen.hidden = true;
    this.objectiveTarget = null;
    this.setObjective("Listen to the opening, then settle into the house.");
    await this.enterGame();
    this.episode.start();
  }

  private async continueGame(): Promise<void> {
    const snapshot = this.saves.load();
    if (!snapshot) {
      this.showToast("No usable checkpoint was found.");
      this.continueButton.hidden = true;
      return;
    }
    this.story.restore(snapshot);
    this.player.restore(snapshot.player);
    this.world.setDoorOpen(snapshot.flags["foundation.hallDoorOpen"] === true);
    this.world.setBackRoomDoorOpen(snapshot.flags["foundation.backRoomDoorOpen"] === true);
    this.episode.restore(snapshot);
    const savedObjective = snapshot.flags["episode.objective"];
    if (typeof savedObjective === "string") {
      this.setObjective(savedObjective, parseObjectiveTarget(snapshot.flags["episode.objectiveTarget"]));
    }
    await this.enterGame();
    if (!this.story.hasFlag("episode.prologueComplete")) this.episode.start();
    else this.showToast("You are back where you left off.");
  }

  private async enterGame(): Promise<void> {
    this.isPlaying = true;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    this.title.classList.add("screen-leaving");
    this.hud.hidden = false;
    window.setTimeout(() => {
      this.title.hidden = true;
      this.title.classList.remove("screen-leaving");
    }, 750);
    await this.audio.start();
    this.audio.setPlatformState(
      this.platformAudioEnabled,
      this.platformPaused || this.advertisementPaused,
    );
    this.audio.playUiClick();
    this.player.focusCanvas();
    this.sendPlatformMessage(bridge.PLATFORM_MESSAGE.LEVEL_STARTED);
    void this.saveCheckpoint(false);
  }

  private setupUi(): void {
    this.dialogues.setActiveChangeHandler((active) => {
      this.hud.classList.toggle("is-dialogue-active", active);
      if (active) {
        this.player.setLookEnabled(false);
        this.player.releasePointerLock();
        this.interactions.clearFocus();
      } else if (this.isPlaying && this.pauseScreen.hidden && this.inspectionPanel.hidden) {
        this.player.setLookEnabled(true);
        this.player.requestPointerLock();
      }
    });
    this.dialogues.setChoiceHandlers((conversationId, choiceId) => {
      this.story.recordChoice(conversationId, choiceId);
    }, (key, value) => {
      this.story.setFlag(key, value);
    });
  }

  private openInspection(event: CustomEvent<{ title: string; text: string }>): void {
    this.inspectTitle.textContent = event.detail.title;
    this.inspectText.textContent = event.detail.text;
    this.inspectionPanel.hidden = false;
    this.interactions.clearFocus();
    this.player.setLookEnabled(false);
    this.player.releasePointerLock();
    this.saveCheckpoint(false);
    this.objectiveDirection.hidden = true;
  }

  private closeInspection(): void {
    this.inspectionPanel.hidden = true;
    if (this.isPlaying && this.pauseScreen.hidden) {
      this.player.setLookEnabled(true);
      this.player.requestPointerLock();
    }
  }

  private openDialogue(event: CustomEvent<Conversation>): void {
    this.interactions.clearFocus();
    this.dialogues.start(event.detail);
  }

  private pause(): void {
    if (
      !this.isPlaying ||
      !this.travelTransition.hidden ||
      !this.pauseScreen.hidden ||
      this.dialogues.isActive ||
      this.cinematics.active
    ) {
      return;
    }
    this.pauseScreen.hidden = false;
    this.player.setLookEnabled(false);
    this.player.releasePointerLock();
    this.interactions.clearFocus();
    this.objectiveDirection.hidden = true;
    this.sendPlatformMessage(bridge.PLATFORM_MESSAGE.LEVEL_PAUSED);
    void this.saveCheckpoint(false);
  }

  private resume(): void {
    this.pauseScreen.hidden = true;
    this.player.setLookEnabled(true);
    this.player.focusCanvas();
    this.player.requestPointerLock();
    this.sendPlatformMessage(bridge.PLATFORM_MESSAGE.LEVEL_RESUMED);
  }

  private handleEscape(): void {
    if (!this.isPlaying || this.dialogues.isActive || !this.inspectionPanel.hidden) return;
    if (this.pauseScreen.hidden) this.pause();
    else this.resume();
  }

  private canInteract(): boolean {
    return (
      this.isPlaying &&
      this.pauseScreen.hidden &&
      this.inspectionPanel.hidden &&
      !this.dialogues.isActive &&
      !this.cinematics.active
    );
  }

  private async saveCheckpoint(showFeedback = true): Promise<void> {
    if (!this.isPlaying) return;
    this.story.checkpoint(this.player);
    const succeeded = await this.saves.save(this.story.value);
    this.autosaveTime = 0;
    if (showFeedback || !succeeded) {
      this.showToast(succeeded ? "Checkpoint saved." : "Checkpoint could not be saved.");
    }
  }

  private renderStory(snapshot: Readonly<StorySnapshot>): void {
    this.dayLabel.textContent = `DAY ${snapshot.day} · ${PHASE_LABEL[snapshot.phase]}`;
  }

  private setObjective(text: string, destination?: THREE.Vector3): void {
    const copy = OBJECTIVE_COPY[text];
    const label = copy?.label ?? text;
    this.currentHint = copy?.hint ?? "Look for nearby objects you can inspect or interact with.";
    this.objectiveText.textContent = label;
    this.screenReaderStatus.textContent = `New objective: ${label}`;
    this.story.setFlag("episode.objective", text);
    this.objectiveTarget = destination?.clone() ?? null;
    this.story.setFlag(
      "episode.objectiveTarget",
      destination ? `${destination.x},${destination.y},${destination.z}` : "",
    );
  }

  private updateHintButtonLabel(): void {
    const rewardedAvailable =
      this.platformInitialized && bridge.advertisement.isRewardedSupported;
    this.hintButton.textContent = rewardedAvailable ? "WATCH AD · GET HINT" : "SHOW HINT";
    this.hintButton.setAttribute(
      "aria-label",
      rewardedAvailable ? "Watch an ad to reveal a hint" : "Show a free hint",
    );
  }

  private requestHint(): void {
    if (!this.canInteract()) return;
    if (!this.platformInitialized || !bridge.advertisement.isRewardedSupported) {
      this.revealHint(true);
      return;
    }

    this.rewardedHintPending = true;
    this.hintButton.disabled = true;
    this.hintButton.textContent = "LOADING AD…";
    try {
      bridge.advertisement.showRewarded("objective_hint");
    } catch (error) {
      console.error("Unable to show the rewarded hint ad.", error);
      this.rewardedHintPending = false;
      this.updateHintButtonLabel();
      this.revealHint(true);
    }
  }

  private handleRewardedState(state: string): void {
    if (state === bridge.REWARDED_STATE.OPENED) this.setAdvertisementPaused(true);
    if (
      state === bridge.REWARDED_STATE.CLOSED ||
      state === bridge.REWARDED_STATE.FAILED
    ) {
      this.setAdvertisementPaused(false);
    }
    if (!this.rewardedHintPending) return;
    if (state === bridge.REWARDED_STATE.REWARDED) {
      this.rewardedHintPending = false;
      this.hintButton.disabled = false;
      this.updateHintButtonLabel();
      this.revealHint(false);
    } else if (state === bridge.REWARDED_STATE.FAILED) {
      this.rewardedHintPending = false;
      this.hintButton.disabled = false;
      this.updateHintButtonLabel();
      this.revealHint(true);
    } else if (state === bridge.REWARDED_STATE.CLOSED) {
      this.rewardedHintPending = false;
      this.hintButton.disabled = false;
      this.updateHintButtonLabel();
      this.showToast("Watch the full ad to reveal a hint.");
    }
  }

  private handleInterstitialState(state: string): void {
    if (state === bridge.INTERSTITIAL_STATE.OPENED) this.setAdvertisementPaused(true);
    if (
      state === bridge.INTERSTITIAL_STATE.CLOSED ||
      state === bridge.INTERSTITIAL_STATE.FAILED
    ) {
      this.setAdvertisementPaused(false);
    }
  }

  private setAdvertisementPaused(paused: boolean): void {
    if (this.advertisementPaused === paused) return;
    this.advertisementPaused = paused;
    this.audio.setPlatformState(
      this.platformAudioEnabled,
      this.platformPaused || this.advertisementPaused,
    );
    if (paused) {
      this.player.setLookEnabled(false);
      this.player.releasePointerLock();
      if (this.isPlaying) {
        this.sendPlatformMessage(bridge.PLATFORM_MESSAGE.LEVEL_PAUSED);
        void this.saveCheckpoint(false);
      }
      return;
    }
    if (this.isPlaying && !this.platformPaused && this.pauseScreen.hidden && this.inspectionPanel.hidden) {
      this.player.setLookEnabled(true);
      this.player.focusCanvas();
      this.player.requestPointerLock();
      this.sendPlatformMessage(bridge.PLATFORM_MESSAGE.LEVEL_RESUMED);
    }
  }

  private revealHint(isFreeFallback: boolean): void {
    if (!this.currentHint) {
      this.showToast("There is no new objective to hint at yet.");
      return;
    }
    this.showToast(
      isFreeFallback
        ? `No ad is available. Free hint: ${this.currentHint}`
        : `Hint: ${this.currentHint}`,
    );
    this.objectiveDirection.classList.remove("hint-highlight");
    void this.objectiveDirection.offsetWidth;
    this.objectiveDirection.classList.add("hint-highlight");
    window.clearTimeout(this.hintFeedbackTimeout);
    this.hintFeedbackTimeout = window.setTimeout(() => {
      this.objectiveDirection.classList.remove("hint-highlight");
    }, 4200);
  }

  private showInterstitial(placement: string): void {
    if (!this.platformInitialized || !bridge.advertisement.isInterstitialSupported) return;
    try {
      bridge.advertisement.showInterstitial(placement);
    } catch (error) {
      console.error(`Unable to show interstitial ad at "${placement}".`, error);
    }
  }

  private updateObjectiveDirection(): void {
    const target = this.objectiveTarget;
    if (
      !target ||
      !this.isPlaying ||
      !this.pauseScreen.hidden ||
      !this.inspectionPanel.hidden ||
      this.dialogues.isActive ||
      this.cinematics.active
    ) {
      this.objectiveDirection.hidden = true;
      return;
    }
    const toTarget = this.objectiveToTarget.subVectors(target, this.player.position);
    toTarget.y = 0;
    if (toTarget.lengthSq() < 10.24) {
      this.objectiveDirection.hidden = true;
      return;
    }
    toTarget.normalize();
    const forward = this.player.camera.getWorldDirection(this.objectiveForward);
    forward.y = 0;
    forward.normalize();
    const angle = Math.atan2(
      forward.x * toTarget.z - forward.z * toTarget.x,
      forward.dot(toTarget),
    );
    this.objectiveDirectionArrow.style.transform = `rotate(${angle}rad)`;
    this.objectiveDirection.hidden = false;
  }

  private showEnding(ending: EpisodeEnding): void {
    this.endingTitle.textContent = ending.title;
    this.endingCopy.textContent = ending.text;
    this.endingScreen.hidden = false;
    this.isPlaying = false;
    document.body.style.overflow = "";
    this.player.setLookEnabled(false);
    this.player.releasePointerLock();
    this.interactions.clearFocus();
    this.hud.hidden = true;
    this.sendPlatformMessage(bridge.PLATFORM_MESSAGE.LEVEL_COMPLETED);
  }

  private sendPlatformMessage(message: string): void {
    if (!this.platformInitialized) return;
    void bridge.platform.sendMessage(message).catch((error: unknown) => {
      console.error(`Unable to send Playgama platform message "${message}".`, error);
    });
  }

  private showToast(text: string): void {
    this.toast.textContent = text;
    this.toast.hidden = false;
    window.clearTimeout(this.toastTimeout);
    this.toastTimeout = window.setTimeout(() => {
      this.toast.hidden = true;
    }, 3600);
  }

  private resize(): void {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.mobileQuality = window.matchMedia("(pointer: coarse)").matches;
    this.renderer.shadowMap.enabled = !this.mobileQuality && !this.adaptiveShadowsDisabled;
    const pixelBudgetRatio = Math.sqrt(4_194_304 / (width * height));
    this.pixelRatioCeiling = Math.min(
      window.devicePixelRatio || 1,
      this.mobileQuality ? 1.75 : 1.6,
      pixelBudgetRatio,
    );
    this.pixelRatio = this.pixelRatio > 0
      ? Math.min(this.pixelRatio, this.pixelRatioCeiling)
      : this.pixelRatioCeiling;
    this.applyRenderScale(width, height);
    this.player.camera.aspect = width / height;
    this.player.camera.updateProjectionMatrix();
  }

  private updateRenderQuality(delta: number): void {
    this.qualityElapsed += delta;
    this.qualityFrameTime += delta;
    this.qualityFrames += 1;
    if (this.qualityElapsed < 3) return;

    const averageFrameTime = this.qualityFrameTime / this.qualityFrames;
    this.qualityElapsed = 0;
    this.qualityFrameTime = 0;
    this.qualityFrames = 0;

    const frameTimeLimit = this.mobileQuality ? 0.028 : 0.021;
    const pixelRatioFloor = this.mobileQuality ? 1 : 0.75;
    if (averageFrameTime > frameTimeLimit && this.pixelRatio > pixelRatioFloor) {
      this.qualityRecoveryElapsed = 0;
      this.pixelRatio = Math.max(pixelRatioFloor, this.pixelRatio - 0.1);
      this.applyRenderScale(window.innerWidth, window.innerHeight);
      return;
    }
    if (averageFrameTime > frameTimeLimit && !this.mobileQuality && this.renderer.shadowMap.enabled) {
      this.qualityRecoveryElapsed = 0;
      this.adaptiveShadowsDisabled = true;
      this.renderer.shadowMap.enabled = false;
      return;
    }
    if (averageFrameTime < 0.017 && this.pixelRatio < this.pixelRatioCeiling) {
      this.qualityRecoveryElapsed += 3;
      if (this.qualityRecoveryElapsed >= 9) {
        this.qualityRecoveryElapsed = 0;
        this.pixelRatio = Math.min(this.pixelRatioCeiling, this.pixelRatio + 0.05);
        this.applyRenderScale(window.innerWidth, window.innerHeight);
      }
      return;
    }
    if (averageFrameTime < 0.0155 && this.adaptiveShadowsDisabled) {
      this.qualityRecoveryElapsed += 3;
      if (this.qualityRecoveryElapsed >= 9) {
        this.qualityRecoveryElapsed = 0;
        this.adaptiveShadowsDisabled = false;
        this.renderer.shadowMap.enabled = !this.mobileQuality;
      }
      return;
    }
    this.qualityRecoveryElapsed = 0;
  }

  private applyRenderScale(width: number, height: number): void {
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(width, height, false);
  }
}

function required<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required game element is missing: ${selector}`);
  return element;
}

function parseObjectiveTarget(value: unknown): THREE.Vector3 | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  const serializedComponents = value.split(",");
  if (serializedComponents.length !== 3 || serializedComponents.some((component) => component.trim() === "")) {
    return undefined;
  }
  const components = serializedComponents.map(Number);
  if (components.some((component) => !Number.isFinite(component))) return undefined;
  return new THREE.Vector3(components[0], components[1], components[2]);
}
