import type * as THREE from "three";

export type StoryValue = boolean | number | string;
export type DayPhase = "morning" | "afternoon" | "evening" | "night";

export interface PlayerCheckpoint {
  x: number;
  y: number;
  z: number;
  yaw: number;
}

export interface StorySnapshot {
  version: 1;
  day: number;
  phase: DayPhase;
  flags: Record<string, StoryValue>;
  discoveries: string[];
  choices: Record<string, string>;
  completedEvents: string[];
  player: PlayerCheckpoint;
}

export interface StoryCondition {
  allFlags?: string[];
  anyFlags?: string[];
  noFlags?: string[];
  choices?: Record<string, string>;
  completedEvents?: string[];
  minDay?: number;
  maxDay?: number;
  phases?: DayPhase[];
  discoveries?: string[];
  minDiscoveries?: number;
}

export interface DialogueChoice {
  id: string;
  label: string;
  next?: number;
  setFlag?: { key: string; value: StoryValue };
}

export interface DialogueLine {
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
}

export interface Conversation {
  id: string;
  lines: DialogueLine[];
  onComplete?: () => void;
}

export interface Interactable {
  id: string;
  prompt: string | (() => string);
  object: THREE.Object3D;
  enabled?: () => boolean;
  interact: () => void;
}
