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

Use the local URL printed by Vite. The app is a static Three.js + TypeScript + Vite project with the locally bundled Playgama Bridge SDK. Bridge supplies platform storage and ads when hosted on a supported platform; unsupported local development uses browser-local checkpoint storage. Production output is written to `dist/` and defaults to the GitHub Pages repository path. `npm run preview` rebuilds a fresh root-mounted production package before serving it, matching the paths used by a root-hosted Playgama ZIP.

## Playgama publishing

The production build includes the Bridge SDK and `playgama-bridge-config.json`. The game requests an interstitial when the player enters a new game and after Days 1, 2, and 3 end, plus an optional rewarded ad for a hint. When a rewarded ad cannot be served, the hint is provided free; no ad call blocks story progression. Interstitials use Bridge's configured 60-second minimum interval, so the SDK may skip an attempt made too soon after another interstitial. The game reports ready/pause/audio/gameplay lifecycle events, pauses gameplay and audio while Bridge reports a full-screen ad open, and uses Bridge storage on supported platforms. The language selected by the platform is exposed as `data-platform-language`; the game currently has English-only text.

To upload, run `VITE_BASE_PATH=/ npm run build`, then ZIP the *contents* of `dist/` so `index.html` is at the ZIP root. Create the game in the [Playgama developer account](https://developer.playgama.com/), test it with Playgama's QA tool, and configure/approve the placements there before publishing. Real ad availability depends on the host platform and approval. Bridge is licensed under LGPL-3.0-or-later; the build includes its license and [third-party notice](./public/THIRD-PARTY-NOTICES.txt).

Ads will **not** automatically appear on the existing GitHub Pages/personal website just because the SDK is integrated. Ads are served by a supported host. To monetize a self-hosted website, follow Playgama's [own-domain deployment guide](https://wiki.playgama.com/playgama/guides/deploy-a-game-on-your-own-domain/deploy-by-yourself.md) to embed the game with the standalone wrap host and your `clid` and Playgama `gameId`, or use [Playgama Wrap](https://wiki.playgama.com/playgama/guides/deploy-a-game-on-your-own-domain/deploy-with-playgama-wrap.md). Your current site does not yet have that host setup.

For earnings and reports, sign in to the [Playgama developer dashboard](https://developer.playgama.com/). Playgama says game statistics and revenue are available through the account/dashboard, with detailed reports provided for time spent, retention, and revenue. See its [payments and statistics FAQ](https://wiki.playgama.com/playgama/faq/payments-and-statistics.md) for current revenue shares and withdrawal terms.

## Project notes

Episode One and its reusable game systems are documented in [GAME_DESIGN.md](./GAME_DESIGN.md), [PLAN.md](./PLAN.md), and [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md). Environment geometry, character models, and the sound bed are currently procedural; they are not licensed production-art assets, and full-playthrough runtime and navigation QA are still in progress.
