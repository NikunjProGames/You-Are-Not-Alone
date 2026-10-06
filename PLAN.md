# YOU ARE NOT ALONE — Development Plan

## Status snapshot

- Phase 0: complete.
- Phase 1: reusable foundation implemented; acceptance/QA not fully complete.
- Phase 2: Episode 1 story spine and current timeline anchors authored; complete-playthrough and pacing validation remain.
- Phase 3: partial implementation; playable path exists, but full-playthrough validation and target runtime are unproven.
- Phases 4–5: in progress only to the extent recorded in [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md); substantial work remains.

## Phase 0 — Repository and architecture planning

- Inspect the repository and preserve existing useful work.
- Confirm Three.js + TypeScript + Vite, static hosting, local saves, desktop priority, and licensed asset strategy.
- Maintain the four canonical documents separately.

## Phase 1 — Reusable browser 3D foundation (implemented; validation incomplete)

### Application and world

- Create a static-host-compatible Vite/TypeScript application with an intentional title-to-game flow.
- Build the Three.js renderer, resize handling, quality-aware settings, input abstraction, first-person movement, camera, and simple collision.
- Establish consistent materials, lighting, environmental audio, and a representative lived-in interior. This has since been expanded into the current Episode 1 map; procedural assets remain a foundation, not final art.

### Reusable gameplay systems

- Interaction registry and raycast focus for objects, doors, inspection, and characters.
- Door state and animation.
- Reusable dialogue sequences, choices, subtitles, and pause/control flow.
- Typed story-state flags, choices, discoveries, day/phase clock, and serializable event conditions.
- One-shot/conditional triggers and explicit event application.
- Environmental state changes wired to story state/events.
- Authored character spawn/position and scripted behavior primitives.
- Audio and lighting transitions exposed to events.
- Reusable cinematic camera sequencing with safe input handoff.
- Versioned local checkpoint save, validation, and recovery behavior.
- Desktop controls and practical mobile movement/look/interaction.

### Foundation acceptance criteria

- Install, development launch, and production build succeed. Rerun typecheck/build after the latest complete-door-target correction.
- The title enters a real-time first-person 3D scene.
- The player can move, inspect at least one clue, operate at least one door, and interact with a scripted character/demo interaction.
- A story-state event demonstrably changes the environment or lighting.
- Dialogue, choices, event conditions, clock progression, cinematic camera control, and save/load APIs are reusable and independently testable.
- Controls are usable by keyboard/mouse and touch; static production paths work under a GitHub Pages subpath.
- The reusable foundation is separate from Episode 1 content, which is tracked in Phase 3 below.

## Phase 2 — Episode 1 content design (story spine authored; expansion remains)

- Expand the canon into connected day/phase sequences and scene/event definitions.
- Define clue graph, character milestones, dialogue and consequences.
- Specify recoverable progression for variable exploration order.
- Define three ending conditions that all preserve the canonical reveal and exact line.

## Phase 3 — Full Episode 1 implementation (partial; final verification outstanding)

- [~] Expand the connected procedural house to two storeys, with stairs, upstairs bedroom, reception/dining spaces, front exterior, garden, fence, service rooms, tenant areas, and rescue route. Continue geometry, furnishing, asset, and traversal QA.
- [x] Establish fire loss, financial pressure, job, unusually cheap rental, outside arrival, check-in, upstairs rest, and offscreen work transitions.
- [~] Implement multiple suspicious encounters/clues involving Mara, the distinct first strange person. Mara retreats on first encounter; stain cleaning, warnings, repeated talks, shared repair, and the Day 3 scolding support suspicion-to-trust progression. Full pacing and missable-clue recovery remain unverified.
- [~] Implement a separate post-trust tenant investigation with behavior, clues, contradictions, and confrontation. The complete evidence chain remains to be fresh-play tested.
- [~] Implement the Day 3 plan, Sunday/Day 4 room check and disappearance, stone-gated forbidden door, transformation, canonical line, and three state-based ending cards. Full finale and each variant remain unverified.
- [~] Include door-detail meshes in their interaction targets so decorative insets do not occlude prompts. Controlled checks confirmed front-door focus, opening, and passage; test every route in a foreground playthrough.
- [ ] Reach and measure 45–60 minutes of meaningful first-playthrough content without traversal padding.

## Phase 4 — Visual, audio, and gameplay polish (substantial work remains)

- Replace foundation-only environment and character treatments with a coherent licensed/custom asset set.
- Refine house dressing, faces, clothing, gestures, animation, lighting, sound, title, camera, pacing, UI, subtitles, accessibility, and interaction feedback.
- Tune desktop visual quality and add reasonable mobile quality scaling.
- Keep an asset/license inventory and document any real sourcing or quality limitations.

## Phase 5 — Story validation, bug fixing, and release QA (not complete)

- Fresh-play the complete narrative through every ending in a foreground browser; the existing smoke harness suspended its animation-frame loop when backgrounded.
- Test exploration order, optional/missed clues, event repetition, story gates, dialogue choices, both floors, doors, save/reload, and interruption/recovery around cinematics.
- Rerun typecheck, production build, and diff checks after the latest door interaction-target fix; verify static-host subpath, browser console, asset loading, controls, and representative desktop/mobile performance.
- Fix progression blockers and major presentation faults; a successful build alone is not release readiness.

## Risks and mitigations

- **Asset consistency/licensing:** verify source, usage rights, quality, and style before integration; document gaps instead of disguising placeholders.
- **Performance variation:** budget geometry, textures, lights, shadows, post-processing, and memory; test representative devices and allow lower quality settings.
- **Softlocks from free exploration:** explicit story state, condition-driven events, alternative critical evidence, safe checkpoints, and varied-order QA.
- **Scope and episode length:** protect the complete cause-and-effect story and quality; defer optional systems and non-story polish.
- **Static hosting:** exercise the production build from a repository subpath early; avoid assumptions that root-relative dev URLs prove deployment.

## Documentation and resume protocol

Keep `AGENTS.md`, `GAME_DESIGN.md`, `PLAN.md`, and `DEVELOPMENT_STATUS.md` separate and mutually consistent. After each significant phase, update status with verified completed systems/content, remaining work, known issues, commands, manual setup, and the precise next step. Track asset sources and licenses. Never claim external setup was completed if it needs a user action.

## Out of scope

Episode 2, backend, accounts, databases, multiplayer, analytics, tracking, ads, monetization, and unrelated infrastructure.
