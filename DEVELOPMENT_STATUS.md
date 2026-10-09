# Development Status — YOU ARE NOT ALONE

## Current phase

**Episode 1 story systems are implemented and the latest narrative/progression audit fixes are in place; full playthrough, navigation, and release QA are still outstanding.** The build has not been verified to meet the 30–45-minute target.

## Implemented

- Static Three.js + TypeScript + Vite app with a cinematic title screen, first-person movement, view-relative WASD, ordinary mouse look/pointer-lock fallback, touch joystick/look, mobile interaction, pause, inspection, dialogue/choices, and browser-local saves.
- Reusable story state, day/phase progression, conditional proximity events, character positioning, raycast interaction with world occlusion, animated doors, ambience/lighting changes, camera cinematics, and versioned checkpoint support.
- Expanded procedural house footprint with a reception/front room, dining area, kitchen, central hall, laundry, utility/bathroom area, tenant bedroom and study, back bedroom, escape hall, and finale room. The upper floor has separately furnished protagonist, Zayan, and tenant private areas, an extended atmospheric corridor, and a notably larger finale room; the garden stone now gates the upstairs rescue route. The exterior has a front walk, garden, partial fencing, distant forest, uneven terrain, moon, stars, and subtle moving grass.
- The upstairs layout now has a stair landing, a framed central corridor entrance, the protagonist's bedroom on the left and Zayan's door on the right, with the tenant's separate room farther down and the larger finale room at the end. The intended route is implemented, but movement through the reshaped upstairs layout has not yet been verified.
- The front facade now includes a broad glazed transom above the entrance, upper window details, porch trim/supports, and improved garden/forest dressing. The laundry room has added sink, shelf, bottles, cloth, and hamper details; the lower laundry and tenant doors swing into their respective rooms.
- Door interaction targets now include their complete hinged assembly, so door insets and handles no longer intercept the raycast before the interaction target. Front-door collision permits passage through the threshold after opening.
- Opening dialogue establishes the bank taking possession after the fire, ongoing financial pressure despite employment, an unusually cheap rental, and arrival outside the house; the player can choose how to respond to the listing.
- The corrected timeline includes reception check-in and upstairs rest, black-cut offscreen work transitions, Zayan's first retreating encounter and tenant question, later dining conversations, a Day 3 evening scolding and investigation, and a Sunday/Day 4 empty-room discovery.
- Episode sequence includes the implied stain-cleaning scene, suspicious observations and clues, a shared pipe-repair task that changes the relationship, and a separate post-trust tenant investigation with a watching event, lease/ledger contradictions, a recording, and confrontation.
- The Day 2 laundry encounter is now gated to occur after Zayan's first encounter and the tenant question. It stages Zayan cleaning the physical stain with an animated cloth and visible coat mark, and the tenant tells him not to frighten the new resident and orders him to his room. The stain inspection, follow-up conversation, and shared pipe investigation must be completed before sleep advances to Day 3.
- Tenant conversations now avoid referring to ledger or recording evidence before the player has found it; the full confrontation requires both discoveries.
- After the friend disappears, the rescue path requires finding a stone in the garden and opening the tenant-forbidden door at the end of the upstairs corridor. The non-graphic finale stages “You didn't follow my rules.” before the transformation and preserves “You are not alone.” as the canonical final line.
- The check-in now explicitly warns the player against opening the door at the end of the upstairs hall. Sunday sleep uses a red “DAY 4 — THE LAST DAY” title card before the empty-room search objective.
- The Day 4 stone uses the existing serialized `episode.stoneFound` flag for possession, hides its world prop when collected/restored, and refuses repeat collection. Zayan's room approach now clears the doorway path; its discovery trigger sits inside the room rather than at the threshold.
- The friend is named Zayan throughout player-facing story text and UI, with a short, scarf-free hairstyle. Existing internal event/flag identifiers remain stable; legacy save identifiers remain compatible, and old character names in saved objective text migrate to Zayan.
- The finale now moves into a side-on camera shot within 2.6 seconds of entering the last room, holds that view for the short exchange, then sweeps around as the protagonist's hidden form transforms. The canonical line and all three ending variants remain.
- Added a Day 2 Zayan evidence conversation for players who find the tenant's ledger and recording before the Day 3 scolding. It now advances to the remaining laundry investigation, rest, or scolding objective instead of leaving the player stuck before confronting the tenant.
- Added visible lamps/sconces and grounded rugs on the upper floor, and filled small seams where the bedroom partitions join the corridor walls.
- Rendering now observes a capped pixel budget. Mobile render resolution is capped at 1.75x device pixels and scales down only below 35 fps, with a 1.0x minimum to prevent severe softness; desktop retains its existing adaptive scaling and shadow fallback. Player movement reuses scratch vectors, and interaction raycasts are limited to 30 Hz while movement/rendering remain frame-driven.
- Distinct procedural character silhouettes/faces and a separate hidden entity model are present. The game remains a static deployment with no backend or third-party runtime service.
- Fixed the known stair obstruction by moving the colliding cabinet outside the stair footprint. Added upper-floor furniture blockers and collision around the garden fence, planters, mailbox, and porch rails; the porch fence now leaves a central approach to the front door.
- Added a restrained Web Audio forest/wind layer beneath the existing house drone and story cues; increased objective text contrast/size and added direction arrows for authored, actionable destinations.
- Added synthesized UI-click and door creak/thud feedback. Rest transitions hold their caption on black for 4.2 seconds and pause movement/interactions during the cut. Creator information opens in a native dialog rather than remaining in the page flow during play.
- Added canonical, Open Graph, X/Twitter, and VideoGame structured metadata; an indexable robots file and sitemap; an original social preview; and crawlable, spoiler-safe game information, controls, and creator credit below the game.
- Added a hinged, interactable door to the protagonist's upstairs bedroom, with room entry gated by that door while keeping the existing room and corridor collision.
- Replaced the open upper landing facade with framed glazing, and added the missing solid stair-side wall. Stair floor selection now follows the ramp only when the player's current height is continuous with the next stair step, preventing shortcuts through the stair underside and abrupt floor snaps.
- Added concise, character-specific replies after story choices (including the tenant's refusal to explain the forbidden door). The Day 3 return transition now cues the player to the tenant shouting at Zayan before the existing hallway scene.
- On phone-sized screens, reduced the objective card and dialogue typography/spacing and made dialogue a smaller, opaque, scroll-safe card. Travel cuts now use letterboxed, eased title cards; ending typography and entry motion have a darker cinematic treatment.

## Validation completed

- Narrative-audit verification: `npm run typecheck`, `npm run build`, `git diff --check`, and Problems checks for the changed TypeScript sources all passed. The build still emits the existing warning for the 516 kB Three.js chunk.
- Launched the Vite development server and visually inspected the title screen, opening dialogue, and first-person front-door/reception view in the integrated browser. This was not a full fresh-start playthrough; the laundry, Day 3 gates, Day 4 title card, hidden room, finale, and ending variants still need sequential play testing.
- Checked the new Day 4 card's red title, copy, letterboxing, and layout at a 390×844 mobile viewport using a staged in-game overlay. This verifies presentation only; the Day 4 sleep trigger and story handoff still need fresh-playthrough testing.
- Searched player-facing episode content and current story/design descriptions for the retired spellings; no dialogue, objective, or current narrative description retains them. Internal event/state IDs and this migration note retain old spellings for save and progression compatibility.
- GitHub Pages production base path defaults to `/You-Are-Not-Alone/` while the development server continues to use `/`. Production builds generate HTML that points at assets under this case-sensitive repository path. The public page still serves an older unbuilt entrypoint with `/src/main.ts`; its `robots.txt` and `sitemap.xml` both return 404. A Pages workflow run succeeded for the current remote `main` commit, but the published page does not match the current local working tree and is not verified as a deployment of these changes.
- Running the source `index.html` through VS Code Live Server does not build the TypeScript or CSS imports. Start the Vite dev server with `npm run dev` and open its printed local URL.
- `npm run typecheck` and `npm run build` — passed after the current mobile, dialogue, stair, window, bedroom-door, and cinematic changes. Vite reports its existing large Three.js chunk warning (about 516 kB); the build completes. With the default `/You-Are-Not-Alone/` Pages base, generated HTML references repository-prefixed JS, Three.js, and CSS assets; `dist/` contains the canonical page, `robots.txt`, `sitemap.xml`, and social preview. Generated HTML contains no `/src/main.ts`, localhost, loopback, or `/public/social-card.png` references.
- A production-preview mobile-layout smoke check at 390×844 measured a 245×71 px objective card and a 351×162 px dialogue panel with an opaque background, using representative text. This verified responsive CSS in the browser preview, not on a physical phone or through a complete story conversation.
- A production-preview save seeded with legacy Silas story keys resumed with Zayan labels/state, and an ending checkpoint triggered the new cinematic/dialogue after the side-shot move. This was a seeded smoke check, not a full story/endings test.
- Checked the `/You-Are-Not-Alone/` preview responses: HTML, JS, Three.js, CSS, robots, sitemap, and `social-card.png` all returned HTTP 200 with the expected content types. Twitter-card and structured-data image URLs now point to the deployed root-level social card.
- The production preview mounted at `/You-Are-Not-Alone/` loaded the current generated JS, Three.js, and CSS assets and displayed the title/opening UI. A seeded Day 4 checkpoint let the player cross the Zayan-room doorway and trigger the empty-room discovery dialogue/objective. This is a focused route check, not a full story playthrough.
- `git diff --check` — passed after the latest source and documentation edits.
- A root-mounted production preview confirmed the title/page information, opening and front-door smoke path, stair ascent, garden stone inspection and objective update, passage through the relocated upstairs finale door, finale trigger, exact “You are not alone.” line, and one ending card. The finale and stair checks used seeded checkpoints; this does not replace a fresh-start story playthrough or verify every ending.
- A previous browser traversal from the saved Zayan-side upstairs suite entered the extended corridor and saved at `x=-1.04, z=-4.90`; that check predates the current layout change and does not validate the new route.
- Earlier targeted browser checks exercised the title/opening and a seeded friend-taken event. These checks are not a fresh-start playthrough.
- The creator dialog and page-scroll reset have been browser-smoke-tested. Stone pickup/reload/repeat behavior has not been directly exercised in a running game. Adaptive quality logic has type/build validation and preview smoke coverage, but no physical-device or controlled frame-rate benchmark.

## Remaining work

- Play the entire story from a fresh save in ordinary player order, including the laundry task, relationship progression, all tenant clues, plan, abduction, route traversal, final door, cinematic, exact line, and all three endings. Test alternate exploration orders and save/reload at each milestone.
- Complete the door/room collision audit throughout both floors and the expanded map. The prior saved-suite route test predates the latest upper-layout change; test the stairs, central corridor door, both bedrooms, tenant room, garden-stone return, back-bedroom furniture, laundry/storage and tenant/study doors, and the full route through the finale.
- Verify that the corrected upper landing opens into the corridor and that the protagonist's left bedroom, Zayan's right bedroom, separate tenant room, and larger finale room are all physically accessible without clipping, gaps, or unintended blockers.
- The implemented narrative is not yet demonstrated to last 30–45 minutes. Add meaningful playable investigation and character beats where needed; do not inflate runtime with traversal.
- Replace or substantially improve primitive procedural furniture and character art before claiming final visual quality. There is no production asset inventory or verified third-party asset license set yet.
- Refine staged character behavior, animation/expression, environmental changes, sound design, and lighting progression; current custom sounds are limited procedural tones/ambience.
- Test controls and performance on a physical desktop and mobile device/browser. The browser smoke environment does not certify device behavior or frame-rate performance.
- The latest public Pages workflow run succeeded for remote `main`, but the live page still serves an older raw-source entrypoint and misses the crawler files. Verify the Pages source/deployment artifact and live asset paths after these worktree changes reach the deployed branch.

## Known limitations

- This is not yet a polished final game. The house is assembled from procedural geometric forms and simple materials; several furnishings and all character models are still stand-ins, not quality-verified production assets.
- The rooms, house exterior, forest, ground cover, characters, and audio are procedural; no external 2K/4K production asset or third-party audio license set has been sourced or quality-verified.
- Narrative dialogue and clue interactions are implemented, but the complete cause-and-effect path and its recovery behavior have not yet been verified by a full fresh-playthrough. The 30–45-minute target is unmeasured and currently unproven.
- All three endings are implemented in state selection, but browser traversal to each ending and confirmation that each displays the exact canonical line remains outstanding.
- Desktop pointer behavior was browser-smoke-tested before this phase; actual physical desktop and mobile device testing is still needed.
- The repository has a GitHub Actions Pages workflow, but a successful workflow run has not translated into a verified current live site: the public HTML still points at `/src/main.ts` and crawler files return 404. The unauthenticated public Pages settings endpoint did not disclose the repository configuration.

## Manual setup

Use Node.js and npm. Do not open `index.html` with Live Server; run the Vite dev server instead:

```sh
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

`npm run dev` serves the game locally at the URL printed by Vite. `npm run build` creates static output in `dist/` and defaults to this repository's GitHub Pages path (`/You-Are-Not-Alone/`); set `VITE_BASE_PATH=/` for a domain-root deployment or another path for a different host. To publish, select GitHub Actions as the Pages build source and push to `main` so `.github/workflows/deploy.yml` can build and deploy `dist/`. No external service, account, API key, backend, or art-tool setup is required by the current code.

## Precise next steps

1. Validate stone pickup, save/reload persistence, and non-repeat collection in a foreground browser; test the complete upper-floor route from the stairs through the finale.
2. Perform a fresh-start playthrough and record/fix blockers in the clue, door, event, day, save, ending, and whole-house route chain. The previous upper-suite route check predates the current layout.
3. Measure the actual runtime and add only meaningful story content if needed; the finale is now at the end of the upstairs corridor.
4. Exercise continue/reload around the shared task, tenant investigation, friend-taken sequence, final door, and each ending; add focused tests for progression logic that can be tested independently.
5. Add meaningful mid-story tasks/encounters only where needed to earn the intended 30–45-minute experience; remeasure rather than assuming runtime.
6. Upgrade and license-check final environment, character, animation, and audio assets. Document any asset gap honestly.
7. Profile desktop/mobile builds, verify the static subpath output and live Pages asset/crawler responses after deployment, and update this file with measured results before release.
