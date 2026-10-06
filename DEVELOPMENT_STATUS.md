# Development Status — YOU ARE NOT ALONE

## Current phase

**Episode 1 timeline corrections and the expanded two-storey house are implemented; full-playthrough validation and visual polish remain.** The build is not release-complete and has not been verified to meet the 45–60-minute target.

## Implemented

- Static Three.js + TypeScript + Vite app with a cinematic title screen, first-person movement, view-relative WASD, ordinary mouse look/pointer-lock fallback, touch joystick/look, mobile interaction, pause, inspection, dialogue/choices, and browser-local saves.
- Reusable story state, day/phase progression, conditional proximity events, character positioning, raycast interaction with world occlusion, animated doors, ambience/lighting changes, camera cinematics, and versioned checkpoint support.
- Expanded procedural house footprint with a reception/front room, dining area, kitchen, central hall, laundry, utility/bathroom area, tenant bedroom and study, back bedroom, escape hall, and finale room. A furnished upstairs bedroom is reached by stairs; the exterior has a front walk, garden, and partial fencing.
- Door interaction targets now include their complete hinged assembly, so door insets and handles no longer intercept the raycast before the interaction target. Front-door collision permits passage through the threshold after opening.
- Opening dialogue establishes the bank taking possession after the fire, ongoing financial pressure despite employment, an unusually cheap rental, and arrival outside the house; the player can choose how to respond to the listing.
- The corrected timeline includes reception check-in and upstairs rest, black-cut offscreen work transitions, Mara's first retreating encounter and tenant question, later dining conversations, a Day 3 evening scolding and investigation, and a Sunday/Day 4 empty-room discovery.
- Episode sequence includes the implied stain-cleaning scene, suspicious observations and clues, a shared pipe-repair task that changes the relationship, and a separate post-trust tenant investigation with a watching event, lease/ledger contradictions, a recording, and confrontation.
- After the friend disappears, the rescue path requires finding a stone and opening the tenant-forbidden door. The non-graphic finale stages “You didn't follow my rules.” before the transformation and preserves “You are not alone.” as the canonical final line.
- The finale includes a rescue gate, third-person camera sequence, visible supernatural silhouette growth, the canonical final line, and three state-dependent ending cards.
- Distinct procedural character silhouettes/faces and a separate hidden entity model are present. The game remains a static deployment with no backend or third-party runtime service.

## Validation completed

- `npm run typecheck` — passed after the complete-door-target correction.
- `npm run build` — passed; Vite emitted static production assets.
- `git diff --check` — passed after the source and documentation edits.
- Browser inspection confirmed the corrected opening objective and front-door raycast target. Controlled movement/collision checks confirmed the exterior approach, door interaction target, and entry threshold route. The browser harness suspended its animation-frame loop while the page was backgrounded, so this is not equivalent to a normal live-play control test.
- Earlier targeted browser checks exercised the title/opening and a seeded friend-taken event. These checks are not a fresh-start playthrough.

## Remaining work

- Play the entire story from a fresh save in ordinary player order, including the laundry task, relationship progression, all tenant clues, plan, abduction, route traversal, final door, cinematic, exact line, and all three endings. Test alternate exploration orders and save/reload at each milestone.
- Verify door/room collision throughout both floors and the expanded map. In particular, test stairs, the upstairs bedroom, the back-bedroom route around furniture, the laundry/storage and tenant/study connecting doors, the forbidden-door route, and traversal through the final doorway.
- The implemented narrative is not yet demonstrated to last 45–60 minutes. Add meaningful playable investigation and character beats where needed; do not inflate runtime with traversal.
- Replace or substantially improve primitive procedural furniture and character art before claiming final visual quality. There is no production asset inventory or verified third-party asset license set yet.
- Refine staged character behavior, animation/expression, environmental changes, sound design, and lighting progression; current custom sounds are limited procedural tones/ambience.
- Test controls and performance on a physical desktop and mobile device/browser. The browser smoke environment does not certify device behavior or frame-rate performance.
- Verify the final built output under a GitHub Pages-style subpath after narrative/UI work stabilizes.

## Known limitations

- This is not yet a polished final game. The house is assembled from procedural geometric forms and simple materials; several furnishings and all character models are still stand-ins, not quality-verified production assets.
- The house now has a second-storey bedroom, stairs, exterior approach, garden, and partial fence, but its geometry, furniture, and textures are still procedural and have not been art-directed or quality-verified as final assets.
- Narrative dialogue and clue interactions are implemented, but the complete cause-and-effect path and its recovery behavior have not yet been verified by a full fresh-playthrough. The 45–60-minute target is unmeasured and currently unproven.
- All three endings are implemented in state selection, but browser traversal to each ending and confirmation that each displays the exact canonical line remains outstanding.
- Desktop pointer behavior was browser-smoke-tested before this phase; actual physical desktop and mobile device testing is still needed.
- GitHub Pages configuration is static-host compatible, but repository-side Pages configuration/deployment has not been performed.

## Manual setup

Use Node.js and npm:

```sh
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

The static output is `dist/`. For a repository subpath, build with `VITE_BASE_PATH=/repository-name/ npm run build`. Repository-side Pages settings/workflow configuration, if desired, still requires a maintainer action. No external service, account, API key, backend, or art-tool setup is required by the current code.

## Precise next steps

1. Re-run typecheck, production build, and diff checks; then perform a fresh-start playthrough in a foreground browser so requestAnimationFrame and input remain active.
2. Record and fix any blocker in the clue, door, event, day, save, or ending chain; verify both floors and each required doorway during that run.
3. Exercise continue/reload around the shared task, tenant investigation, friend-taken sequence, final door, and each ending. Add focused tests for any progression logic that can be tested independently.
4. Add meaningful mid-story tasks/encounters only where needed to earn the intended 45–60-minute experience; remeasure rather than assuming runtime.
5. Upgrade and license-check final environment, character, animation, and audio assets. Document any asset gap honestly.
6. Profile desktop/mobile builds, verify static subpath output, and update this file with measured results before release.
