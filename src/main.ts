/// <reference types="vite/client" />

import "./style.css";
import { Game } from "./game/Game";

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
if (!canvas) {
  throw new Error("The game canvas could not be found.");
}

const game = new Game(canvas);
game.start();
