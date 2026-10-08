# Development Status — YOU ARE NOT ALONE

## Current phase

**Episode 1 story systems are implemented; navigation, environment, audio, page metadata, and interface polish have received a focused refinement pass.** The build is not release-complete and has not been verified to meet the 30–45-minute target.

## Implemented

- Static Three.js + TypeScript + Vite app with a cinematic title screen, first-person movement, view-relative WASD, ordinary mouse look/pointer-lock fallback, touch joystick/look, mobile interaction, pause, inspection, dialogue/choices, and browser-local saves.
- Reusable story state, day/phase progression, conditional proximity events, character positioning, raycast interaction with world occlusion, animated doors, ambience/lighting changes, camera cinematics, and versioned checkpoint support.
- Expanded procedural house footprint with a reception/front room, dining area, kitchen, central hall, laundry, utility/bathroom area, tenant bedroom and study, back bedroom, escape hall, and finale room. The upper floor has separately furnished protagonist, Silas, and tenant private areas, an extended atmospheric corridor, and a notably larger finale room; the garden stone now gates the upstairs rescue route. The exterior has a front walk, garden, partial fencing, distant forest, uneven terrain, moon, stars, and subtle moving grass.
- The upstairs layout now has a stair landing, a framed central corridor entrance, the protagonist's bedroom on the left and Silas's door on the right, with the tenant's separate room farther down and the larger finale room at the end. The intended route is implemented, but movement through the reshaped upstairs layout has not yet been verified.
- The front facade now includes a broad glazed transom above the entrance, upper window details, porch trim/supports, and improved garden/forest dressing. The laundry room has added sink, shelf, bottles, cloth, and hamper details; the lower laundry and tenant doors swing into their respective rooms.
- Door interaction targets now include their complete hinged assembly, so door insets and handles no longer intercept the raycast before the interaction target. Front-door collision permits passage through the threshold after opening.
- Opening dialogue establishes the bank taking possession after the fire, ongoing financial pressure despite employment, an unusually cheap rental, and arrival outside the house; the player can choose how to respond to the listing.
- The corrected timeline includes reception check-in and upstairs rest, black-cut offscreen work transitions, Silas's first retreating encounter and tenant question, later dining conversations, a Day 3 evening scolding and investigation, and a Sunday/Day 4 empty-room discovery.
- Episode sequence includes the implied stain-cleaning scene, suspicious observations and clues, a shared pipe-repair task that changes the relationship, and a separate post-trust tenant investigation with a watching event, lease/ledger contradictions, a recording, and confrontation.
- Tenant conversations now avoid referring to ledger or recording evidence before the player has found it; the full confrontation requires both discoveries.
- After the friend disappears, the rescue path requires finding a stone in the garden and opening the tenant-forbidden door at the end of the upstairs corridor. The non-graphic finale stages “You didn't follow my rules.” before the transformation and preserves “You are not alone.” as the canonical final line.
- The Day 4 stone uses the existing serialized `episode.stoneFound` flag for possession, hides its world prop when collected/restored, and refuses repeat collection. Silas's room approach now clears the doorway path; its discovery trigger sits inside the room rather than at the threshold.
- The finale includes a rescue gate, third-person camera sequence, visible supernatural silhouette growth, the canonical final line, and three state-dependent ending cards.
- Distinct procedural character silhouettes/faces and a separate hidden entity model are present. The game remains a static deployment with no backend or third-party runtime service.
- Fixed the known stair obstruction by moving the colliding cabinet outside the stair footprint. Added upper-floor furniture blockers and collision around the garden fence, planters, mailbox, and porch rails; the porch fence now leaves a central approach to the front door.
- Added a restrained Web Audio forest/wind layer beneath the existing house drone and story cues; increased objective text contrast/size and added direction arrows for authored, actionable destinations.
- Added synthesized UI-click and door creak/thud feedback. Rest transitions hold their caption on black for 4.2 seconds and pause movement/interactions during the cut. Creator information opens in a native dialog rather than remaining in the page flow during play.
- Added canonical, Open Graph, X/Twitter, and VideoGame structured metadata; an indexable robots file and sitemap; an original social preview; and crawlable, spoiler-safe game information, controls, and creator credit below the game.

## Validation completed

- GitHub Pages production base path defaults to `/You-Are-Not-Alone/` while the development server continues to use `/`. Production builds generate HTML that points at assets under this case-sensitive repository path. The public page still serves an older unbuilt entrypoint with `/src/main.ts`; its `robots.txt` and `sitemap.xml` both return 404. A Pages workflow run succeeded for the current remote `main` commit, but the published page does not match the current local working tree and is not verified as a deployment of these changes.
- Running the source `index.html` through VS Code Live Server does not build the TypeScript or CSS imports. Start the Vite dev server with `npm run dev` and open its printed local URL.
- `npm run typecheck` — passed after the Day 4 room-entry trigger and furniture/collision adjustments.
- `npm run build` — passed with the default `/You-Are-Not-Alone/` Pages base; generated HTML references the repository-prefixed JS, Three.js, and CSS assets, and `dist/` contains the canonical page, `robots.txt`, `sitemap.xml`, and social preview. The generated HTML contains no `/src/main.ts`, localhost, or loopback references.
- The production preview mounted at `/You-Are-Not-Alone/` loaded the generated JS, Three.js, and CSS assets and displayed the title/opening UI. A seeded Day 4 checkpoint let the player cross the Silas-room doorway and trigger the empty-room discovery dialogue/objective. This is a focused route check, not a full story playthrough.
- `git diff --check` — passed after the latest source and documentation edits.
- A root-mounted production preview confirmed the title/page information, opening and front-door smoke path, stair ascent, garden stone inspection and objective update, passage through the relocated upstairs finale door, finale trigger, exact “You are not alone.” line, and one ending card. The finale and stair checks used seeded checkpoints; this does not replace a fresh-start story playthrough or verify every ending.
- A previous browser traversal from the saved Silas-side upstairs suite entered the extended corridor and saved at `x=-1.04, z=-4.90`; that check predates the current layout change and does not validate the new route.
- Earlier targeted browser checks exercised the title/opening and a seeded friend-taken event. These checks are not a fresh-start playthrough.
- The creator dialog and page-scroll reset have been browser-smoke-tested. Stone pickup/reload/repeat behavior has not been directly exercised in a running game.

## Remaining work

- Play the entire story from a fresh save in ordinary player order, including the laundry task, relationship progression, all tenant clues, plan, abduction, route traversal, final door, cinematic, exact line, and all three endings. Test alternate exploration orders and save/reload at each milestone.
- Complete the door/room collision audit throughout both floors and the expanded map. The prior saved-suite route test predates the latest upper-layout change; test the stairs, central corridor door, both bedrooms, tenant room, garden-stone return, back-bedroom furniture, laundry/storage and tenant/study doors, and the full route through the finale.
- Verify that the corrected upper landing opens into the corridor and that the protagonist's left bedroom, Silas's right bedroom, separate tenant room, and larger finale room are all physically accessible without clipping, gaps, or unintended blockers.
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
