import type { StorySnapshot } from "../types";
import bridge from "@playgama/bridge";

const STORAGE_KEY = "you-are-not-alone:checkpoint";
const SAVE_VERSION = 1;

export class SaveSystem {
  private useLocalStorage = true;
  private serializedSnapshot: string | null = null;
  private pendingWrite: Promise<void> = Promise.resolve();

  async initialize(useLocalStorage: boolean): Promise<void> {
    this.useLocalStorage = useLocalStorage;
    if (useLocalStorage) {
      this.serializedSnapshot = this.readLocalStorage();
      return;
    }

    try {
      const value = await bridge.storage.get(STORAGE_KEY);
      this.serializedSnapshot = typeof value === "string" ? value : null;
      if (value !== null && typeof value !== "string") {
        console.warn("The Playgama checkpoint has an unsupported storage format.");
      }
    } catch (error) {
      this.serializedSnapshot = null;
      console.error("Unable to load the Playgama checkpoint.", error);
    }
  }

  hasSave(): boolean {
    return this.serializedSnapshot !== null;
  }

  load(): StorySnapshot | null {
    const serialized = this.serializedSnapshot;
    if (!serialized) return null;

    try {
      const value: unknown = JSON.parse(serialized);
      if (!isStorySnapshot(value)) {
        console.warn("The saved checkpoint is invalid or from an unsupported version.");
        return null;
      }
      return migrateFriendName(structuredClone(value));
    } catch (error) {
      console.error("Unable to parse the saved checkpoint.", error);
      return null;
    }
  }

  async save(snapshot: StorySnapshot): Promise<boolean> {
    const serialized = JSON.stringify(snapshot);
    this.serializedSnapshot = serialized;
    if (!this.useLocalStorage) {
      const write = this.pendingWrite.then(() => bridge.storage.set(STORAGE_KEY, serialized));
      this.pendingWrite = write.catch((error: unknown) => {
        console.error("Unable to save the checkpoint to Playgama storage.", error);
      });
      try {
        await write;
        return true;
      } catch {
        return false;
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      console.error("Unable to save checkpoint to local browser storage.", error);
      return false;
    }
  }

  async clear(): Promise<void> {
    this.serializedSnapshot = null;
    if (!this.useLocalStorage) {
      const remove = this.pendingWrite.then(() => bridge.storage.delete(STORAGE_KEY));
      this.pendingWrite = remove.catch((error: unknown) => {
        console.error("Unable to clear the Playgama checkpoint.", error);
      });
      await this.pendingWrite;
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Unable to clear the local save.", error);
    }
  }

  private readLocalStorage(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Unable to access the local save.", error);
      return null;
    }
  }
}

function migrateFriendName(snapshot: StorySnapshot): StorySnapshot {
  snapshot.flags = Object.fromEntries(
    Object.entries(snapshot.flags).map(([key, value]) => [
      renameStoredName(key),
      typeof value === "string" ? renameDisplayName(value) : value,
    ]),
  );
  snapshot.choices = Object.fromEntries(
    Object.entries(snapshot.choices).map(([key, value]) => [
      renameStoredName(key),
      renameStoredName(value),
    ]),
  );
  snapshot.discoveries = snapshot.discoveries.map(renameStoredName);
  snapshot.completedEvents = snapshot.completedEvents.map(renameStoredName);
  return snapshot;
}

function renameStoredName(value: string): string {
  return value.replace(/mara|silas/gi, (match) => {
    if (match === match.toUpperCase()) return "AREN";
    return match[0] === match[0].toUpperCase() ? "Aren" : "aren";
  });
}

function renameDisplayName(value: string): string {
  return value.replace(/\b(?:mara|silas|aren|aaron)\b/gi, "Zayan");
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
