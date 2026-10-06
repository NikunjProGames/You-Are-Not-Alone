import type { StorySnapshot } from "../types";

const STORAGE_KEY = "you-are-not-alone:checkpoint";
const SAVE_VERSION = 1;

export class SaveSystem {
  hasSave(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      console.error("Unable to read local save availability.", error);
      return false;
    }
  }

  load(): StorySnapshot | null {
    let serialized: string | null;
    try {
      serialized = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Unable to access the local save.", error);
      return null;
    }
    if (!serialized) return null;

    try {
      const value: unknown = JSON.parse(serialized);
      if (!isStorySnapshot(value)) {
        console.warn("The local save is invalid or from an unsupported version.");
        return null;
      }
      return structuredClone(value);
    } catch (error) {
      console.error("Unable to parse the local save.", error);
      return null;
    }
  }

  save(snapshot: StorySnapshot): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      return true;
    } catch (error) {
      console.error("Unable to save checkpoint to local browser storage.", error);
      return false;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Unable to clear the local save.", error);
    }
  }
}

function isStorySnapshot(value: unknown): value is StorySnapshot {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StorySnapshot>;
  return (
    candidate.version === SAVE_VERSION &&
    Number.isInteger(candidate.day) &&
    (candidate.phase === "morning" ||
      candidate.phase === "afternoon" ||
      candidate.phase === "evening" ||
      candidate.phase === "night") &&
    isRecord(candidate.flags) &&
    Array.isArray(candidate.discoveries) &&
    candidate.discoveries.every((item) => typeof item === "string") &&
    isRecord(candidate.choices) &&
    Array.isArray(candidate.completedEvents) &&
    candidate.completedEvents.every((item) => typeof item === "string") &&
    isPlayer(candidate.player)
  );
}

function isRecord(value: unknown): value is Record<string, string | number | boolean> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (item) =>
        typeof item === "string" || typeof item === "number" || typeof item === "boolean",
    )
  );
}

function isPlayer(value: unknown): value is StorySnapshot["player"] {
  if (!value || typeof value !== "object") return false;
  const position = value as Partial<StorySnapshot["player"]>;
  return [position.x, position.y, position.z, position.yaw].every(
    (component) => typeof component === "number" && Number.isFinite(component),
  );
}
