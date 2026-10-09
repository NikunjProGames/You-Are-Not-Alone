# AGENTS.md

## Project

Standalone PleyZ Original browser horror game.

**Final title: YOU ARE NOT ALONE**

Build a genuine, polished browser 3D/2.5D horror game—not a text adventure, visual novel, educational project, or empty walking simulator. The project is a static browser game using Three.js, TypeScript, and Vite. Desktop is the primary quality target; mobile should remain practical with appropriate quality adjustments.

## Scope and boundaries

- Episode 1 is the complete current target. Do not implement Episode 2.
- No custom backend, accounts, database, multiplayer, analytics, or tracking.
- Use Playgama Bridge storage for platform saves and local browser storage only as a fallback outside Bridge-supported platforms.
- Use Playgama Bridge ads at natural story breaks; never interrupt active gameplay or cinematics.
- Prefer a small dependency set and static-host-compatible paths.
- Use properly licensed assets and document sources/limitations. Never represent placeholders as finished final art.
- Keep `DEVELOPMENT_STATUS.md` accurate after each phase so work can resume safely.

## Canonical Episode 1 story

The protagonist has a job, struggles financially, and loses their previous home in a fire. They need affordable housing, discover an unusually cheap house, and move in. Strange events gradually follow.

The first strange person is a separate character: not the tenant and not the supernatural entity. The player initially has multiple reasons to suspect them. Through repeated encounters, observations, clues, choices, and shared experiences, suspicion becomes uncertainty and then earned trust/friendship.

Only after that relationship develops does suspicion shift toward a separate tenant/renter/owner. A substantial chain of discoveries, contradictions, behavior, and supernatural incidents makes the tenant appear to be the threat. The protagonist and friend investigate and make a plan. Before carrying it out, the tenant takes the friend. The protagonist attempts a rescue and opens the relevant door.

The door leads into a controlled cinematic. The camera changes perspective; the protagonist transforms into the supernatural entity. The protagonist was the real threat, and earlier events gain new meaning. Looking toward the tenant, the protagonist says exactly:

**"You are not alone."**

Episode 1 ends shortly afterward. At least three meaningful ending variations must preserve this reveal and exact line.

Target approximately 30–45 minutes over 3–4 in-game days, with up to an hour acceptable for slower exploration. The job establishes ordinary life and financial pressure; it is not a full work simulator.

## Story and gameplay principles

- Major plot points are destinations in a connected chain of playable, cause-and-effect events, not single scenes or exposition.
- Earn suspicion, uncertainty, trust, tenant suspicion, urgency, and the reveal through things the player sees, hears, investigates, interacts with, and experiences.
- Keep the first strange person and tenant visually and narratively distinct.
- Support reasonable exploration freedom. Optional discoveries enrich the story; missing one must not permanently break critical progression.
- Use first-person exploration, objects, doors, clues, dialogue, choices, objectives, characters, environmental changes, sound, lighting, and cinematics.
- Avoid meaningless traversal, jumpscare spam, graphic violence, and a house that begins as an abandoned haunted mansion.
- Design the house organically as a coherent lived-in home. Room lists are examples, not fixed requirements.

## Technical principles

- Separate reusable game systems from Episode 1-specific content.
- Prefer explicit, serializable story flags, event IDs, clock state, choices, and character milestones over scattered magic values.
- Make day/time, dialogue, choices, characters, triggers, environment, audio, lighting, cinematics, and saves reusable without building unnecessary abstraction.
- Keep authored character behavior reliable; do not add complex AI without a clear need.
- Protect frame time, memory, input usability, and recovery from invalid/interrupted saves.
- Keep a playable build after every significant phase. Validate the production build and the story from a fresh start before release.

## Documentation

Keep these separate and mutually consistent:

- `AGENTS.md`: project rules and canon.
- `GAME_DESIGN.md`: complete experience and story design.
- `PLAN.md`: phases, dependencies, risks, and acceptance criteria.
- `DEVELOPMENT_STATUS.md`: verified progress, known issues, manual setup, and precise next step.
