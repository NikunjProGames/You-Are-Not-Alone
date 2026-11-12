/// <reference types="vite/client" />

import "./style.css";

const canvas = required<HTMLCanvasElement>("#game-canvas");
const loader = required<HTMLElement>("#game-loader");
const loadingStatus = required<HTMLElement>("#loading-status");
const retryButton = required<HTMLButtonElement>("#loader-retry");
const startButton = required<HTMLButtonElement>("#start-button");
const continueButton = required<HTMLButtonElement>("#continue-button");

let loading = false;

async function loadGame(): Promise<void> {
  if (loading) return;
  loading = true;
  loader.hidden = false;
  loader.classList.remove("is-error", "is-ready");
  retryButton.hidden = true;
  loadingStatus.textContent = "Loading the game systems...";

  try {
    await nextFrame();
    const { Game } = await import("./game/Game");
    loadingStatus.textContent = "Building the house...";
    await nextFrame();

    const game = new Game(canvas);
    await game.initializePlatform();
    game.start();

    loadingStatus.textContent = "The house is ready when you are.";
    loader.classList.add("is-ready");
    await nextFrame();
    loader.hidden = true;
    startButton.disabled = false;
    continueButton.disabled = false;
  } catch (error) {
    console.error("Unable to load the game.", error);
    loadingStatus.textContent = "The game could not be loaded. Please try again.";
    loader.classList.add("is-error");
    retryButton.hidden = false;
  } finally {
    loading = false;
  }
}

retryButton.addEventListener("click", () => void loadGame());
const startLoading = (): void => {
  requestAnimationFrame(() => void loadGame());
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startLoading, { once: true });
} else {
  startLoading();
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function required<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required game element is missing: ${selector}`);
  return element;
}
