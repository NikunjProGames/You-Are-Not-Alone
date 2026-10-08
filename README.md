# YOU ARE NOT ALONE

**A PleyZ Original** — a first-person psychological horror game for the browser.

An unusually affordable home offers a fresh start. Get to know the people who live there, pay attention to the rooms and objects around you, and decide what the growing mystery means. Episode One is playable free in a modern desktop or mobile browser.

**Created by Nikunj Arora.**

Play: [YOU ARE NOT ALONE](https://nikunjprogames.github.io/You-Are-Not-Alone/)

## Controls

- **Move:** W A S D or arrow keys
- **Look:** move the mouse; click the game to recapture it after opening a menu
- **Interact:** E
- **Continue dialogue:** Enter or use the on-screen button
- **Run:** hold Shift
- **Pause or resume:** Escape
- **Touch:** use the on-screen movement pad, drag to look, and tap the interaction button

## Run locally

Requires Node.js and npm.

Use the local URL printed by Vite. The app is a static Three.js + TypeScript + Vite project; it has no backend or third-party runtime service. Production output is written to `dist/` and is configured for the GitHub Pages repository path. Set `VITE_BASE_PATH=/` for a root-domain deployment.

## Project notes

Episode One and its reusable game systems are documented in [GAME_DESIGN.md](./GAME_DESIGN.md), [PLAN.md](./PLAN.md), and [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md). Environment geometry, character models, and the sound bed are currently procedural; they are not licensed production-art assets, and full-playthrough runtime and navigation QA are still in progress.
