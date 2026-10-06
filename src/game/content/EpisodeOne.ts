import * as THREE from "three";
import type { Conversation, DayPhase, StorySnapshot } from "../types";
import type { CharacterSystem } from "../systems/CharacterSystem";
import type { CinematicSystem } from "../systems/CinematicSystem";
import type { EventDirector } from "../systems/EventDirector";
import type { StoryState } from "../systems/StoryState";
import type { HouseDemo } from "../world/HouseDemo";
import type { Player } from "../world/Player";

export interface EpisodeEnding {
  title: string;
  text: string;
}

interface EpisodeOneOptions {
  story: StoryState;
  events: EventDirector;
  player: Player;
  characters: CharacterSystem;
  cinematics: CinematicSystem;
  world: HouseDemo;
  setObjective: (objective: string) => void;
  showToast: (message: string) => void;
  playTone: (frequency: number, duration: number, volume: number) => void;
  saveCheckpoint: () => void;
  transition: (message: string) => void;
  showEnding: (ending: EpisodeEnding) => void;
}

const FINAL_ROOM_CENTER = new THREE.Vector3(0, 1.64, -29.2);

export class EpisodeOne {
  private transforming = false;
  private transformationElapsed = 0;
  private retreating = false;
  private retreatElapsed = 0;

  constructor(private readonly options: EpisodeOneOptions) {
    this.registerEvents();
  }

  start(): void {
    const { story } = this.options;
    story.setFlag("episode.started", true);
    this.say({
      id: "episode-opening",
      lines: [
        {
          speaker: "The bank's letter",
          text: "The fire left the old house unsafe. While the claim stalled, missed payments piled up; the bank took possession before you could rebuild.",
        },
        {
          speaker: "A message from the insurer",
          text: "Your job still brings in a paycheck, but rent, travel and debt take most of it. You need somewhere affordable now.",
        },
        {
          speaker: "Rental listing",
          text: "A furnished house with rooms to rent. The monthly price is far below anything nearby. You check the address twice, then choose the only place you can afford.",
          choices: [
            {
              id: "call-before-arriving",
              label: "Call the number on the listing.",
              next: 3,
              setFlag: { key: "episode.calledLandlord", value: true },
            },
            {
              id: "take-the-first-affordable-place",
              label: "Save the address and take the room.",
              next: 3,
              setFlag: { key: "episode.skippedCall", value: true },
            },
          ],
        },
        {
          speaker: "You",
          text: "By evening, you are standing outside. The house is larger than the listing photographs suggested.",
        },
      ],
      onComplete: () => {
        story.setFlag("episode.prologueComplete", true);
        this.options.setObjective("Open the front door and check in with the tenant at reception.");
        this.options.world.setMood("settled");
        this.options.saveCheckpoint();
      },
    });
  }

  restore(snapshot: Readonly<StorySnapshot>): void {
    const { world, characters } = this.options;
    world.setWestStoreOpen(snapshot.flags["episode.westStoreUnlocked"] === true);
    world.setTenantStudyOpen(snapshot.flags["episode.tenantStudyUnlocked"] === true);
    world.setEntryDoorOpen(snapshot.flags["episode.entryDoorOpened"] === true);
    world.setMaraRoomAvailable(snapshot.flags["episode.maraRoomAvailable"] === true);
    world.setMaraRoomDoorOpen(snapshot.flags["episode.maraRoomChecked"] === true);
    world.setBedroomDoorOpen(snapshot.flags["episode.bedroomExitOpen"] === true);
    world.setFinalDoorOpen(snapshot.flags["episode.finalDoorOpened"] === true);
    if (snapshot.flags["episode.friendTaken"] === true) characters.despawn("housemate");
    else if (snapshot.flags["episode.firstEncounterSeen"] === true) {
      const maraPosition = snapshot.flags["episode.scoldingSeen"] === true
        ? new THREE.Vector3(2.75, 0, -2.1)
        : new THREE.Vector3(0.88, 0, -7.25);
      characters.spawn("housemate", maraPosition);
      characters.place("housemate", maraPosition, Math.PI);
    }
    if (snapshot.flags["episode.endingStarted"] === true) {
      world.setFinaleFlicker(true);
      world.setEntityReveal(1);
      characters.place("tenant", new THREE.Vector3(2, 0, -30.55), Math.PI);
      if (snapshot.flags["episode.finalDoorOpened"] === true) {
        characters.spawn("housemate", new THREE.Vector3(-1.9, 0, -30.45));
      }
    }
    world.setMood(snapshot.flags["episode.suspicionStarted"] === true ? "uneasy" : "settled");
  }

  update(delta: number): void {
    if (this.retreating) {
      this.retreatElapsed += delta;
      const amount = Math.min(1, this.retreatElapsed / 1.15);
      const housemate = this.options.world.characters[0];
      if (housemate) {
        housemate.position.set(-0.82, 0, THREE.MathUtils.lerp(5.0, -7.25, amount));
        housemate.rotation.y = Math.PI;
      }
      if (amount >= 1) this.retreating = false;
    }
    if (!this.transforming) return;
    this.transformationElapsed += delta;
    const amount = Math.min(1, this.transformationElapsed / 4.4);
    const eased = amount * amount * (3 - 2 * amount);
    this.options.world.setEntityReveal(eased);
    if (amount >= 1) this.transforming = false;
  }

  interact(id: string): void {
    if (id === "entry-door-opened") {
      this.options.story.setFlag("episode.entryDoorOpened", true);
      this.options.saveCheckpoint();
      return;
    }
    if (id === "mara-room-door") {
      this.checkMaraRoom();
      return;
    }
    if (id === "final-door-opened") {
      this.onFinalDoorOpened();
      return;
    }
    if (id === "final-door-blocked") {
      this.options.showToast(
        this.options.story.hasFlag("episode.rescueReady")
          ? "The latch is too solid. Find something heavy in the back hall."
          : "The tenant told you never to open this door.",
      );
      return;
    }
    if (id === "stone") {
      this.inspect("stone", "A heavy piece of masonry", "A chunk of broken stone has fallen from the old garden wall. It is solid enough to break a rotten latch, if there is no other way in.");
      this.options.story.setFlag("episode.stoneFound", true);
      if (this.options.story.hasFlag("episode.rescueReady")) {
        this.options.setObjective("Take the stone to the door the tenant forbade you to open.");
      } else {
        this.options.showToast("You keep the stone nearby. It feels heavier than it should.");
      }
      this.options.saveCheckpoint();
      return;
    }
    if (id === "housemate") {
      this.talkToHousemate();
      return;
    }
    if (id === "tenant") {
      this.talkToTenant();
      return;
    }
    if (id === "rest") {
      this.rest();
      return;
    }
    const inspections: Record<string, { title: string; text: string }> = {
      bills: {
        title: "The bills",
        text: "Two overdue notices are folded around a pay stub. The insurance payment would have covered the old mortgage. It has not arrived.",
      },
      "fire-photo": {
        title: "A photograph kept from the fire",
        text: "The edges have curled from heat. In the window, behind the smoke and the people outside, a dark figure faces the camera. You remember nobody standing there.",
      },
      "move-in-note": {
        title: "A note left for the new renter",
        text: "“Please leave the hall light on. The switch sticks when it rains.” The handwriting is careful; the final word has been underlined twice.",
      },
      "laundry-blood": {
        title: "A rust-colored smear",
        text: "A dark, dried streak runs beneath the laundry sink. It could be rust, or something that was wiped up in a hurry. The person in the hall has a damp cloth in one hand.",
      },
      "loose-valve": {
        title: "The corroded shutoff",
        text: "The pipe behind the valve is painted over, but the seam is split. The stain runs from the crack and turns orange where it meets the air. Under the paint, there is no blood—only rust and years of ignored repair requests.",
      },
      "strange-person-key": {
        title: "A brass key",
        text: "The key has been polished smooth by years of handling. A strip of tape on the bow reads only: “BACK”. It is not new, and it is not yours.",
      },
      "tenant-ledger": {
        title: "The tenant's ledger",
        text: "Rent dates, repair costs and names fill the book. One entry charges for a repair three days before the tenant says they first noticed the damage. The ink is the same as the unsigned rental listing.",
      },
      "lease-copy": {
        title: "A copy of the lease",
        text: "The lease says the tenant owns the house. A second page, folded beneath it, says the tenant is only renting a room. Both carry the same signature, dated years apart.",
      },
      "sealed-note": {
        title: "A sealed note",
        text: "The envelope is addressed to the tenant. Inside: “If the new renter asks about the voice, tell them the house settles after the fire. Do not let Mara take them downstairs.” It is signed with no name.",
      },
      "tenant-audio": {
        title: "A voice recorder",
        text: "A clipped recording catches the tenant saying, “Keep the rooms occupied. It wakes when the house is empty.” The rest is a burst of static, then a breath close to the microphone.",
      },
      "burned-key": {
        title: "A blackened key",
        text: "The key is scorched, but the metal is not warped. It is from the lock at your old home. Someone has scratched a second, smaller key shape into the soot.",
      },
      "friend-token": {
        title: "A familiar token",
        text: "A small brass button from your friend's coat. Its back is bent where it was torn free. The floor around it bears a fine ash that looks like the residue left after the earlier disturbances.",
      },
      "housemate-letter": {
        title: "Mara's folded letter",
        text: "A letter to the owner asks for the leak to be repaired and says she will stop cleaning it herself. The last line is unfinished: “I keep hearing the new renter in the back room before they—”",
      },
      "wet-footprints": {
        title: "Wet footprints",
        text: "A trail of rainwater crosses the hall, although the front door is dry. The prints stop beside the wall, toes pointed inward, as if someone had stood facing the plaster.",
      },
      "mirror-mark": {
        title: "The bedroom mirror",
        text: "A pale handprint is visible on the inside of the glass. Its thumb is on the wrong side. Your own palm aches where an old burn scar crosses it.",
      },
    };
    const inspection = inspections[id];
    if (!inspection) {
      this.options.showToast("There is nothing more to do here right now.");
      return;
    }
    this.inspect(id, inspection.title, inspection.text);
    this.afterDiscovery(id);
  }

  private registerEvents(): void {
    const { events, story, world, characters, playTone } = this.options;
    events.register({
      id: "episode.first-hall-entry",
      position: new THREE.Vector3(0, 1.64, 5.1),
      radius: 1.5,
      condition: {
        allFlags: ["episode.prologueComplete", "episode.entryDoorOpened"],
        noFlags: ["episode.hallEntered"],
      },
      run: () => {
        story.setFlag("episode.hallEntered", true);
        this.options.setObjective("Check in with the tenant at reception.");
      },
    });
    events.register({
      id: "episode.first-mara-encounter",
      position: new THREE.Vector3(0, 1.64, 5.05),
      radius: 1.7,
      condition: {
        allFlags: ["episode.returnedFromWorkDay2"],
        noFlags: ["episode.firstEncounterSeen"],
      },
      run: () => {
        story.setFlag("episode.firstEncounterSeen", true);
        world.setMood("uneasy");
        world.setDoorOpen(true);
        playTone(82, 0.75, 0.065);
        const mara = world.characters[0];
        if (mara) {
          mara.visible = true;
          mara.position.set(-0.82, 0, 5.0);
        }
        this.retreatElapsed = 0;
        this.retreating = true;
        this.options.setObjective("The stranger hurried inside. Ask the tenant who they are.");
        this.options.showToast("A figure catches your eye, then slips quickly into the house.");
        this.options.saveCheckpoint();
      },
    });
    events.register({
      id: "episode.tenant-scolds-mara",
      position: new THREE.Vector3(0, 1.64, -7.0),
      radius: 1.8,
      condition: {
        allFlags: ["episode.returnedFromWorkDay3"],
        noFlags: ["episode.scoldingSeen"],
        minDay: 3,
        phases: ["evening"],
      },
      run: () => {
        story.setFlag("episode.scoldingSeen", true);
        characters.place("tenant", new THREE.Vector3(-0.25, 0, -7.0), Math.PI);
        characters.place("housemate", new THREE.Vector3(0.88, 0, -7.1), 0);
        world.setMood("uneasy");
        playTone(56, 1.1, 0.07);
        this.say({
          id: "episode-tenant-scolding",
          lines: [
            { speaker: "Tenant", text: "I told you not to speak to the new renter. You have no right to bring them into this." },
            { speaker: "Mara", text: "I was trying to warn them." },
            { speaker: "Tenant", text: "You are a guest here. Remember who gives you a room." },
            { speaker: "You", text: "That's enough." },
            { speaker: "Tenant", text: "You have no idea what she has done in this house." },
          ],
          onComplete: () => {
            characters.place("tenant", new THREE.Vector3(-1.5, 0, 3.1), 0);
            characters.place("housemate", new THREE.Vector3(2.75, 0, -2.1), Math.PI);
            this.options.setObjective("Find Mara in the dining area. Ask why the tenant treats her this way.");
            this.options.saveCheckpoint();
          },
        });
      },
    });
    events.register({
      id: "episode.mara-sweeping-stain",
      position: new THREE.Vector3(-4.8, 1.64, -7.3),
      radius: 2.1,
      condition: {
        allFlags: ["episode.housemateMet", "episode.hallEntered"],
        noFlags: ["episode.sawMaraSweep", "episode.housemateTrust"],
      },
      run: () => {
        characters.place("housemate", new THREE.Vector3(-5.05, 0, -6.95), Math.PI / 2);
        story.setFlag("episode.sawMaraSweep", true);
        this.options.playTone(74, 0.75, 0.045);
        this.options.setObjective("Mara is scrubbing something from the laundry floor. Find out what it is.");
        this.say({
          id: "episode-mara-sweeping",
          lines: [
            { speaker: "You", text: "What are you cleaning?" },
            { speaker: "Mara", text: "A leak. It leaves a stain if I don't get to it first." },
            { speaker: "You", text: "That doesn't look like water." },
            { speaker: "Mara", text: "Then don't touch it." },
          ],
          onComplete: () => {
            characters.place("housemate", new THREE.Vector3(0.88, 0, -7.25), 0);
            this.options.showToast("The damp cloth leaves a dark mark on Mara's sleeve.");
            this.options.saveCheckpoint();
          },
        });
      },
    });
    events.register({
      id: "episode.voice-in-hall",
      position: new THREE.Vector3(0.2, 1.64, -9.8),
      radius: 1.7,
      condition: { allFlags: ["episode.bloodSeen"], noFlags: ["episode.voiceEcho"], minDay: 2 },
      run: () => {
        story.setFlag("episode.voiceEcho", true);
        playTone(118, 0.38, 0.07);
        window.setTimeout(() => playTone(87, 0.62, 0.04), 480);
        this.options.showToast("From the dark end of the hall, you hear your own voice say your name.");
      },
    });
    events.register({
      id: "episode.shared-laundry-search",
      position: new THREE.Vector3(-4.7, 1.64, -7.7),
      radius: 2.0,
      condition: {
        allFlags: ["episode.bloodSeen", "episode.secondHousemateTalk", "episode.prologueComplete"],
        noFlags: ["episode.sharedTask"],
        minDay: 2,
      },
      run: () => {
        characters.place("housemate", new THREE.Vector3(-5.1, 0, -7.7), Math.PI / 2);
        story.setFlag("episode.sharedTaskStarted", true);
        this.options.setObjective("Help the housemate check the laundry pipes and find where the stain came from.");
        this.options.playTone(47, 1.8, 0.045);
        this.say({
          id: "episode-shared-search",
          lines: [
            { speaker: "Mara", text: "I didn't put it there. I know what it looks like, and I know how that sounds." },
            { speaker: "You", text: "Then show me what you were trying to clean." },
            { speaker: "Mara", text: "The pipe has been leaking for months. I keep reporting it. The owner keeps painting over the stain." },
            {
              speaker: "Mara",
              text: "I was trying to stop the water reaching the fuse box. I should have told you before you found me here.",
              choices: [
                {
                  id: "help-with-pipe",
                  label: "“Show me where it leaks.”",
                  setFlag: { key: "episode.helpedMara", value: true },
                },
                {
                  id: "keep-distance",
                  label: "“I need to think about this.”",
                  setFlag: { key: "episode.keptDistance", value: true },
                },
              ],
            },
          ],
          onComplete: () => {
            story.setFlag("episode.sharedTaskConversationComplete", true);
            this.options.setObjective("Turn the seized valve behind the laundry sink and stop the leak.");
            this.options.saveCheckpoint();
          },
        });
      },
    });
    events.register({
      id: "episode.tenant-watching",
      position: new THREE.Vector3(4.7, 1.64, -8.8),
      radius: 2.0,
      condition: {
        allFlags: ["episode.housemateTrust"],
        noFlags: ["episode.tenantWatching"],
        minDay: 3,
      },
      run: () => {
        story.setFlag("episode.tenantWatching", true);
        characters.place("tenant", new THREE.Vector3(4.65, 0, -8.8), Math.PI);
        this.options.playTone(51, 1.25, 0.055);
        this.say({
          id: "episode-tenant-watching",
          lines: [
            { speaker: "Tenant", text: "There is nothing in the study you need." },
            { speaker: "You", text: "I haven't told you where I was going." },
            { speaker: "Tenant", text: "The floorboards carry. This house has no secrets." },
          ],
          onComplete: () => {
            characters.place("tenant", new THREE.Vector3(4.65, 0, -8.8), -Math.PI / 2);
            this.options.setObjective("The tenant knew where you were headed. Search their records with Mara.");
          },
        });
      },
    });
    events.register({
      id: "episode.final-transformation",
      position: FINAL_ROOM_CENTER,
      radius: 1.45,
      condition: {
        allFlags: ["episode.finalDoorOpened", "episode.friendTaken"],
        noFlags: ["episode.endingStarted"],
      },
      run: () => this.beginFinale(),
    });
  }

  private talkToHousemate(): void {
    const { story } = this.options;
    const talks = Number(story.getFlag("episode.housemateTalks") ?? 0);
    if (!story.hasFlag("episode.firstEncounterSeen")) {
      this.options.showToast("The person slipped away before you could speak.");
      return;
    }
    if (talks === 0) {
      this.say({
        id: "episode-housemate-first-meeting",
        lines: [
          { speaker: "Mara", text: "You took the room." },
          { speaker: "You", text: "You were expecting me?" },
          { speaker: "Mara", text: "The owner said someone was coming. I heard the front door before you did." },
          {
            speaker: "Mara",
            text: "Don't use the back room after midnight. If you hear your name from there, it isn't me.",
            choices: [
              {
                id: "ask-why",
                label: "“Why would you tell me that?”",
                setFlag: { key: "episode.askedMaraWhy", value: true },
              },
              {
                id: "say-thanks",
                label: "“I'll remember that.”",
                setFlag: { key: "episode.acceptedWarning", value: true },
              },
            ],
          },
        ],
        onComplete: () => {
          story.setFlag("episode.housemateTalks", talks + 1);
          story.setFlag("episode.housemateMet", true);
          this.options.setObjective("Ask the tenant who the person was, then return upstairs.");
        },
      });
      return;
    }
    if (story.hasFlag("episode.scoldingSeen") && !story.hasFlag("episode.housemateDinnerTalk")) {
      this.say({
      id: "episode-day-three-dinner",
      lines: [
        { speaker: "You", text: "The tenant spoke to you like you were property." },
        { speaker: "Mara", text: "They did that to the last renter, too. When she complained, the tenant said she had never lived here." },
        { speaker: "You", text: "You know what happened to her?" },
        {
          speaker: "Mara",
          text: "Only what I saw: her room was cleared before dawn. The tenant kept her key and told everyone she had moved away.",
          choices: [
            { id: "believe-mara", label: "“I believe what I saw tonight.”", setFlag: { key: "episode.believedMara", value: true } },
            { id: "stay-cautious", label: "“I need proof before I accuse anyone.”", setFlag: { key: "episode.stayedCautious", value: true } },
          ],
        },
        { speaker: "Mara", text: "There's a leak downstairs I've been trying to fix. The tenant keeps the repair records. Help me check both, and decide for yourself." },
      ],
      onComplete: () => {
        story.setFlag("episode.housemateDinnerTalk", true);
        story.setFlag("episode.tenantAbuseObserved", true);
        story.setFlag("episode.housemateTalks", talks + 1);
        this.options.setObjective("Investigate the laundry stain and pipe with Mara. Decide whether her story holds up.");
      },
      });
      return;
    }
    if (story.hasFlag("episode.bloodSeen") && !story.hasFlag("episode.secondHousemateTalk")) {
      this.say({
        id: "episode-housemate-stain-confrontation",
        lines: [
          { speaker: "Mara", text: "You found the stain." },
          { speaker: "You", text: "You were cleaning it." },
          { speaker: "Mara", text: "I was trying to get the smell out before the tenant came back. That's all I can say without sounding worse." },
          {
            speaker: "Mara",
            text: "The tenant keeps a key to every room. I don't. If you saw me in there, I was trying to find the leak.",
            choices: [
              {
                id: "accuse-mara",
                label: "“You're leaving something out.”",
                setFlag: { key: "episode.accusedMara", value: true },
              },
              {
                id: "ask-about-tenant",
                label: "“Why are you worried about the tenant?”",
                setFlag: { key: "episode.askedMaraAboutTenant", value: true },
              },
            ],
          },
        ],
        onComplete: () => {
          story.setFlag("episode.secondHousemateTalk", true);
          story.setFlag("episode.housemateTalks", talks + 1);
          this.advanceTo(2, "morning");
          this.options.setObjective("Check the laundry room stain, then ask Mara what she was doing there.");
          this.options.saveCheckpoint();
        },
      });
      return;
    }
    if (story.hasFlag("episode.housemateTrust") && story.hasFlag("episode.planMade")) {
      this.say({
        id: "episode-plan-conversation",
        lines: [
          { speaker: "Mara", text: "The ledger and that recording agree on one thing: the tenant is preparing the rooms for something." },
          { speaker: "You", text: "We get the tenant away from the house, then we find you a safe way out." },
          { speaker: "Mara", text: "If I knock twice, open the door. If you hear your own voice, don't answer it." },
          { speaker: "You", text: "Two knocks. I promise." },
        ],
      });
      return;
    }
    if (story.hasFlag("episode.housemateTrust") && story.hasFlag("episode.tenantSuspected")) {
      this.say({
        id: "episode-make-plan",
        lines: [
          { speaker: "Mara", text: "The rent ledger is wrong. The recorder is worse. The tenant knew the rooms would answer before anyone else did." },
          { speaker: "You", text: "We get them to the back room and make them explain it." },
          { speaker: "Mara", text: "No. We get to the outside door. If the tenant follows, we don't split up." },
          {
            speaker: "Mara",
            text: "If I get separated, go through the bedroom and keep moving. Don't wait for me.",
            choices: [
              { id: "promise-to-find-her", label: "“I won't leave you here.”", setFlag: { key: "episode.promisedMara", value: true } },
              { id: "agree-to-the-plan", label: "“We leave together.”", setFlag: { key: "episode.agreedPlan", value: true } },
            ],
          },
        ],
        onComplete: () => {
          story.setFlag("episode.planMade", true);
          this.advanceTo(3, "night");
          this.options.setObjective("You and Mara will confront the tenant tonight. Return upstairs and sleep before Sunday.");
          this.options.saveCheckpoint();
        },
      });
      return;
    }
    if (story.hasFlag("episode.housemateTrust")) {
      this.say({
        id: "episode-housemate-trust",
        lines: [
          { speaker: "Mara", text: "You came back to help. Most people decide what I am before they ask." },
          { speaker: "You", text: "I still don't know what happened here." },
          { speaker: "Mara", text: "Neither do I. But we can stop guessing alone." },
        ],
      });
      return;
    }
    this.say({
      id: "episode-housemate-repeat",
      lines: [{ speaker: "Mara", text: "The pipes knock when the rain changes. That's what I tell myself, anyway." }],
    });
  }

  private talkToTenant(): void {
    const { story } = this.options;
    const count = Number(story.getFlag("episode.tenantTalks") ?? 0);
    if (!story.hasFlag("episode.checkInComplete")) {
      this.say({
        id: "episode-reception-check-in",
        lines: [
          { speaker: "Tenant", text: "You found the place. The price is the price; I prefer to keep every room occupied." },
          { speaker: "You", text: "I can pay the first month. That's all I can promise tonight." },
          { speaker: "Tenant", text: "Then take the upstairs room, rest, and we will settle the paperwork tomorrow." },
          { speaker: "You", text: "I heard someone inside when I came up the walk." },
          {
            speaker: "Tenant",
            text: "Mara. She has her own room. Do not follow her into the locked room at the back of the house. Do not open that door.",
            choices: [
              { id: "ask-about-locked-room", label: "“Why is it locked?”", setFlag: { key: "episode.askedForbiddenRoom", value: true } },
              { id: "accept-house-rules", label: "“Understood. I need sleep.”", setFlag: { key: "episode.acceptedHouseRules", value: true } },
            ],
          },
        ],
        onComplete: () => {
          story.setFlag("episode.checkInComplete", true);
          story.setFlag("episode.forbiddenDoorWarned", true);
          story.setFlag("episode.tenantTalks", count + 1);
          this.options.setObjective("Go upstairs to your room and rest after the journey.");
          this.options.saveCheckpoint();
        },
      });
      return;
    }
    if (story.hasFlag("episode.firstEncounterSeen") && !story.hasFlag("episode.tenantAskedAboutMara")) {
      this.say({
        id: "episode-ask-tenant-about-mara",
        lines: [
          { speaker: "You", text: "The person near the entrance saw me and hurried away. Who are they?" },
          { speaker: "Tenant", text: "Mara. She has been here longer than most. Keep to your room and you will have no trouble." },
          { speaker: "You", text: "They looked frightened." },
          { speaker: "Tenant", text: "Mara enjoys making people feel watched. Go upstairs; dinner will be set out later." },
        ],
        onComplete: () => {
          story.setFlag("episode.tenantAskedAboutMara", true);
          story.setFlag("episode.tenantTalks", count + 1);
          this.options.setObjective("Return upstairs. You can come back down for supper.");
          this.options.saveCheckpoint();
        },
      });
      return;
    }
    if (!story.hasFlag("episode.housemateTrust")) {
      this.say({
        id: "episode-tenant-first",
        lines: [
          { speaker: "Tenant", text: "You must be the new renter. The low price was not a mistake; I prefer the rooms occupied." },
          { speaker: "You", text: "And the other person?" },
          { speaker: "Tenant", text: "Mara has been here longer than I have. Don't mistake familiarity for honesty." },
          {
            speaker: "Tenant",
            text: "Keep to the rooms you rent, and we'll get along.",
            choices: [
              { id: "ask-about-mara", label: "“What should I know about her?”", setFlag: { key: "episode.tenantWarnedAboutMara", value: true } },
              { id: "ask-about-price", label: "“Why is the rent so low?”", setFlag: { key: "episode.tenantPriceQuestion", value: true } },
            ],
          },
        ],
        onComplete: () => story.setFlag("episode.tenantTalks", count + 1),
      });
      return;
    }
    this.say({
      id: "episode-tenant-question",
      lines: [
        { speaker: "Tenant", text: "You and Mara have been looking through my things." },
        { speaker: "You", text: "The repair dates in your ledger don't match what you told me." },
        { speaker: "Tenant", text: "I keep records. I don't owe you an explanation for every date." },
        { speaker: "You", text: "And the recording?" },
        { speaker: "Tenant", text: "Old equipment records whatever it hears. Be careful about deciding what you heard." },
      ],
      onComplete: () => {
        story.setFlag("episode.tenantConfronted", true);
        story.setFlag("episode.tenantTalks", count + 1);
        this.evaluateTenantProgress();
      },
    });
  }

  private afterDiscovery(id: string): void {
    const { story } = this.options;
    if (id === "bills") story.setFlag("episode.billsRead", true);
    if (id === "fire-photo") story.setFlag("episode.firePhotoSeen", true);
    if (id === "laundry-blood") {
      story.setFlag("episode.bloodSeen", true);
      story.setFlag("episode.suspicionStarted", true);
      this.options.world.setMood("uneasy");
      this.options.playTone(61, 0.9, 0.055);
      if (story.value.day < 2) this.advanceTo(2, "morning");
      this.options.setObjective("Ask Mara why she was cleaning the laundry-room stain.");
    }
    if (id === "loose-valve") {
      if (!story.hasFlag("episode.sharedTaskStarted")) {
        this.options.showToast("The shutoff is seized. Mara may know why the stain keeps returning.");
        return;
      }
      story.setFlag("episode.pipeRepaired", true);
      story.setFlag("episode.sharedTask", true);
      story.setFlag("episode.housemateTrust", true);
      this.options.world.setWestStoreOpen(true);
      story.setFlag("episode.westStoreUnlocked", true);
      this.options.world.setMood("settled");
      this.options.playTone(183, 0.24, 0.04);
      this.advanceTo(3, "afternoon");
      this.options.setObjective("Mara trusts you now. Find the key she left in the storage room and compare what she says with the tenant's records.");
      this.options.showToast("The pipe stops knocking. The red stain was rust-water, not blood.");
      this.options.saveCheckpoint();
      this.evaluateTenantProgress();
      return;
    }
    if (id === "strange-person-key") {
      story.setFlag("episode.maraKeyFound", true);
      story.setFlag("episode.suspicionStarted", true);
      this.options.setObjective("Compare what you found with what Mara and the tenant have told you.");
    }
    if (id === "tenant-ledger") {
      story.setFlag("episode.tenantLedger", true);
      this.evaluateTenantProgress();
    }
    if (id === "lease-copy") {
      story.setFlag("episode.leaseContradiction", true);
      this.options.showToast("The tenant's title to the house changes from page to page.");
      this.evaluateTenantProgress();
    }
    if (id === "sealed-note") {
      story.setFlag("episode.tenantSealedNote", true);
      this.options.setObjective("The note warns the tenant not to let Mara take you downstairs. Ask Mara what is below the house.");
    }
    if (id === "tenant-audio") {
      story.setFlag("episode.tenantRecording", true);
      story.setFlag("episode.tenantEvidence", true);
      this.options.world.setMood("uneasy");
      this.options.playTone(39, 1.5, 0.07);
      this.options.setObjective("Talk to the tenant about the ledger and the recording.");
      this.evaluateTenantProgress();
    }
    if (id === "burned-key") {
      story.setFlag("episode.fireEchoFound", true);
      this.options.showToast("The soot on your hands smells exactly like the old hallway.");
    }
    if (id === "friend-token") {
      story.setFlag("episode.friendTokenFound", true);
      this.options.showToast("The button is still warm.");
    }
    if (id === "housemate-letter") {
      story.setFlag("episode.housemateLetter", true);
      this.options.showToast("Mara has been asking the owner to fix the leak for months.");
    }
    if (id === "wet-footprints") {
      story.setFlag("episode.wetFootprints", true);
      this.options.world.setMood("uneasy");
    }
    if (id === "mirror-mark") {
      story.setFlag("episode.mirrorMark", true);
      this.options.playTone(96, 0.6, 0.05);
    }
    if (id === "rest") return;
    this.options.saveCheckpoint();
    this.evaluateOpeningProgress();
  }

  private evaluateOpeningProgress(): void {
    const { story } = this.options;
    if (
      story.hasFlag("episode.billsRead") &&
      story.hasFlag("episode.firePhotoSeen") &&
      story.hasFlag("episode.housemateMet")
    ) {
      this.options.setObjective("The hallway warning does not explain the stain. Find out what Mara was cleaning.");
    }
  }

  private evaluateTenantProgress(): void {
    const { story } = this.options;
    if (story.hasFlag("episode.housemateTrust") && story.hasFlag("episode.tenantLedger")) {
      story.setFlag("episode.tenantStudyUnlocked", true);
      this.options.world.setTenantStudyOpen(true);
      this.options.setObjective("The dates in the ledger contradict the tenant. Find the recorder in the study.");
    }
    if (
      story.hasFlag("episode.housemateTrust") &&
      story.hasFlag("episode.tenantLedger") &&
      story.hasFlag("episode.tenantRecording") &&
      story.hasFlag("episode.tenantConfronted")
    ) {
      story.setFlag("episode.tenantSuspected", true);
      this.advanceTo(3, "night");
      this.options.setObjective("The tenant's account doesn't fit the evidence. Bring it to Mara and decide what to do.");
    }
  }

  private rest(): void {
    const { story } = this.options;
    if (!story.hasFlag("episode.checkInComplete")) {
      this.options.showToast("Check in with the tenant before going upstairs.");
      return;
    }
    if (this.options.player.position.y < 4.45) {
      this.options.showToast("Your room is upstairs. Follow the stairs and return to the bed.");
      return;
    }
    if (!story.hasFlag("episode.restedOnce")) {
      story.setFlag("episode.restedOnce", true);
      this.advanceTo(2, "evening");
      story.setFlag("episode.returnedFromWorkDay2", true);
      this.options.world.setEntryDoorOpen(true);
      this.options.player.restore({ x: 0, y: 0, z: 5.1, yaw: 0 });
      this.options.transition("You wake before dawn, dress for work and leave. The office stays offscreen; an ordinary shift passes in a black cut. You return home after dark.");
      this.options.setObjective("Enter the house. Someone is waiting near the front hall.");
    } else if (
      story.hasFlag("episode.tenantAskedAboutMara") &&
      !story.hasFlag("episode.returnedFromWorkDay3")
    ) {
      story.setFlag("episode.dayTwoRested", true);
      this.advanceTo(3, "evening");
      story.setFlag("episode.returnedFromWorkDay3", true);
      this.options.world.setEntryDoorOpen(true);
      this.options.player.restore({ x: 0, y: 0, z: 5.1, yaw: 0 });
      this.options.transition("Morning, commute, fluorescent office light. The day is not shown; the cut brings you home on the third evening.");
      this.options.setObjective("Go through the hall. The tenant's voice is raised.");
    } else if (story.hasFlag("episode.planMade") && story.value.day === 3) {
      story.setFlag("episode.sundayMorning", true);
      this.advanceTo(4, "morning");
      story.setFlag("episode.maraRoomAvailable", true);
      this.options.world.setMaraRoomAvailable(true);
      this.options.transition("Sunday. No commute, no office. You wake to an empty house and no answer from Mara's room.");
      this.options.setObjective("Try Mara's upstairs door.");
    } else {
      this.options.showToast("There is more to settle before you can sleep.");
      return;
    }
    this.options.world.setMood(story.hasFlag("episode.suspicionStarted") ? "uneasy" : "settled");
    this.options.saveCheckpoint();
  }

  private checkMaraRoom(): void {
    const { story, world } = this.options;
    if (!story.hasFlag("episode.sundayMorning") || !story.hasFlag("episode.planMade")) {
      this.options.showToast("The door is shut. Mara asked you to give her some privacy.");
      return;
    }
    if (!story.hasFlag("episode.maraDoorKnocked")) {
      story.setFlag("episode.maraDoorKnocked", true);
      this.say({
        id: "episode-mara-door-knock",
        lines: [
          { speaker: "You", text: "Mara? It's me." },
          { speaker: "The house", text: "No answer. You knock again. Somewhere downstairs, a latch clicks." },
        ],
        onComplete: () => {
          this.options.setObjective("Open Mara's door and check the room.");
          this.options.saveCheckpoint();
        },
      });
      return;
    }
    if (!story.hasFlag("episode.maraRoomChecked")) {
      story.setFlag("episode.maraRoomChecked", true);
      world.setMaraRoomDoorOpen(true);
      this.say({
        id: "episode-mara-room-empty",
        lines: [
          { speaker: "You", text: "Mara?" },
          { speaker: "You", text: "The room is empty. Her coat is gone, but the window is still latched." },
          { speaker: "You", text: "The tenant warned me about one room. If Mara is anywhere, it has to be behind that door." },
        ],
        onComplete: () => this.takeFriend(),
      });
    }
  }

  private takeFriend(): void {
    const { story, characters } = this.options;
    if (story.hasFlag("episode.friendTaken")) return;
    story.setFlag("episode.friendTaken", true);
    story.setFlag("episode.rescueReady", true);
    story.setFlag("episode.tenantTookMaraSuspected", true);
    characters.despawn("housemate");
    this.options.world.setBedroomDoorOpen(true);
    story.setFlag("episode.bedroomExitOpen", true);
    this.options.world.setFinalDoorOpen(false);
    this.options.setObjective("The forbidden room is at the far end of the back hall. Find something heavy enough to break its latch.");
    this.options.playTone(33, 2.3, 0.085);
    this.say({
      id: "episode-friend-taken",
      lines: [
        { speaker: "You", text: "The room has been disturbed. Someone came through here." },
        { speaker: "You", text: "The tenant took her. I have to get that forbidden door open." },
      ],
      onComplete: () => this.options.saveCheckpoint(),
    });
  }

  private onFinalDoorOpened(): void {
    const { story, characters } = this.options;
    if (!story.hasFlag("episode.stoneFound")) {
      this.options.showToast("The latch will not give. Find something heavy to break it.");
      return;
    }
    story.setFlag("episode.finalDoorOpened", true);
    characters.place("tenant", new THREE.Vector3(2, 0, -30.55), Math.PI);
    characters.spawn("housemate", new THREE.Vector3(-1.9, 0, -30.45));
    this.options.playTone(42, 0.65, 0.12);
    this.options.showToast("The stone breaks the latch. The sound carries through the hidden room.");
    this.options.saveCheckpoint();
  }

  private beginFinale(): void {
    const { story, player, cinematics, world, characters, playTone } = this.options;
    if (story.hasFlag("episode.endingStarted")) return;
    story.setFlag("episode.endingStarted", true);
    world.entity.visible = true;
    world.setFinaleFlicker(true);
    world.setEntityReveal(0);
    this.transforming = false;
    this.transformationElapsed = 0;
    world.setMood("uneasy");
    playTone(29, 3.2, 0.1);
    this.options.setObjective("The tenant is here. The room feels familiar in a way you cannot explain.");
    characters.place("tenant", new THREE.Vector3(2, 0, -30.55), Math.PI);
    const playerAt = player.position.clone();
    const monster = world.entity.position.clone().add(new THREE.Vector3(0, 1.1, 0));
    this.say({
      id: "episode-forbidden-room-rule",
      lines: [{ speaker: "You", text: "You didn't follow my rules." }],
      onComplete: () => {
        this.transforming = true;
        cinematics.play(
          player.camera,
          [
            {
              duration: 2.4,
              position: playerAt.clone().add(new THREE.Vector3(0.12, 0.06, 0.08)),
              lookAt: new THREE.Vector3(0, 1.42, -30.4),
              fov: 64,
            },
            {
              duration: 3.5,
              position: new THREE.Vector3(2.35, 1.9, -28.35),
              lookAt: monster,
              fov: 54,
            },
            {
              duration: 2.8,
              position: new THREE.Vector3(1.4, 1.72, -30.15),
              lookAt: new THREE.Vector3(0, 1.35, -30.55),
              fov: 50,
            },
          ],
          () => {
            const outcome = this.endingFor(story.value);
            this.say({
              id: "episode-canonical-reveal",
              lines: [
                { speaker: "Tenant", text: "You came back for her." },
                { speaker: "Mara", text: "You came." },
                { speaker: "Tenant", text: "I kept the rooms occupied so it would have somewhere to go." },
                { speaker: "You", text: "The doors. The sounds. The marks on the walls. I was here before I arrived." },
                { speaker: "You", text: "You are not alone." },
              ],
              onComplete: () => this.options.showEnding(outcome),
            });
          },
        );
      },
    });
  }

  private endingFor(snapshot: Readonly<StorySnapshot>): EpisodeEnding {
    const count = snapshot.discoveries.length;
    if (snapshot.flags["episode.helpedMara"] === true && snapshot.flags["episode.fireEchoFound"] === true) {
      return {
        title: "THE HOUSE REMEMBERS",
        text: "Mara's warning was meant to protect you. The fire was not the beginning. You leave the room with the truth—and the sound of a second set of footsteps.",
      };
    }
    if (count >= 8 && snapshot.flags["episode.tenantConfronted"] === true) {
      return {
        title: "THE RECORD",
        text: "You keep every clue. The tenant recognizes the pattern in your notes before you can explain it. Outside, the rain carries your reflection away from you.",
      };
    }
    return {
      title: "THE OPEN DOOR",
      text: "The tenant backs away, still holding the room key. Behind you, the house settles around a shape it already knows. Nothing in the hallway is empty now.",
    };
  }

  private advanceTo(day: number, phase: DayPhase): void {
    const { story } = this.options;
    const phaseOrder: DayPhase[] = ["morning", "afternoon", "evening", "night"];
    for (let guard = 0; guard < 20; guard += 1) {
      if (story.value.day === day && story.value.phase === phase) return;
      const dayIndex = story.value.day;
      const currentPhaseIndex = phaseOrder.indexOf(story.value.phase);
      const targetIsBehind =
        dayIndex > day ||
        (dayIndex === day && currentPhaseIndex > phaseOrder.indexOf(phase));
      if (targetIsBehind) return;
      story.advancePhase();
    }
  }

  private inspect(id: string, title: string, text: string): void {
    const { story } = this.options;
    story.discover(`episode.clue.${id}`);
    window.dispatchEvent(new CustomEvent("game:inspect", { detail: { title, text } }));
  }

  private say(conversation: Conversation): void {
    window.dispatchEvent(new CustomEvent("game:dialogue", { detail: conversation }));
  }
}
