# YOU ARE NOT ALONE — Game Design

## Vision

A complete, atmospheric browser-based first-person 3D psychological/supernatural horror game. The target is a meaningful 30–45-minute first playthrough over roughly four in-game days, with up to an hour acceptable for slower exploration. Desktop browser quality leads; mobile remains usable with a lower rendering profile and touch controls.

The game uses authored spaces, purposeful interaction, investigation, character behavior, lighting, sound, and controlled cinematic moments. It is not a text adventure, visual novel, educational experience, or empty walking simulator.

## Canonical story foundation

The protagonist has a job and is under financial pressure. Their previous home burned, so they need somewhere affordable. They find an unusually cheap house and move in. Strange events gradually begin.

The first strange person encountered is not the tenant and not the supernatural monster. Multiple observations, encounters, clues, and suspicious actions give the player real reasons to suspect them. Repeated interactions, shared discoveries, help, and admitted secrets gradually turn suspicion into familiarity, trust, and friendship.

Only after that trust develops does a separate tenant/renter/owner become the focus of suspicion. A sustained chain of clues, contradictions, behavior, and strange events makes the tenant seem like a plausible threat. The protagonist and friend investigate and form a plan. Before it is completed, the tenant takes the friend. The protagonist attempts a rescue and opens the relevant door.

The door begins a cinematic camera transition and the protagonist transforms into the supernatural entity. The protagonist was the real threat; earlier events become newly legible. Looking toward the tenant, the protagonist says exactly **"You are not alone."** Episode 1 ends shortly afterward. At least three meaningful endings may vary consequences, but every ending preserves this reveal and line.

## Mystery as a playable chain

The progression is continuous cause and effect, not a sequence of plot summaries:

1. Establish daily routine, job, bills, the fire, housing pressure, the implausibly cheap listing, and the decision to move.
2. Teach a believable, lived-in home through ordinary exploration before disturbing patterns appear.
3. Let unexplained events intersect with the first strange person's movements and knowledge, producing several concrete suspicions.
4. Add further evidence and suspicious behavior—including an implied, non-graphic blood-cleaning observation—then provide conflicting evidence that makes the simple accusation less certain.
5. Use repeated voluntary interactions, verifiable help, shared risk, and a truthful admission to earn a gradual friendship.
6. Let the trust and accumulated evidence open a separate investigation into the tenant. Use independent clues and contradictory behavior, not one decisive exposition dump.
7. Escalate the tenant's behavior as the player and friend investigate; turn discoveries into an understandable plan and consequences.
8. Have the tenant take the friend before the plan is completed. Make the rescue objective follow from evidence and prior investigation.
9. The player reaches and opens the relevant door. Cinematic staging reveals the protagonist's transformation and recontextualizes earlier events without invalidating the established facts.

Critical information must be available through recoverable alternatives if a player explores out of order or misses an optional scene. Optional exploration should add interpretation and ending context, not pad runtime.

## Experience structure

| In-game period | Experience focus | Approximate first-playthrough time |
|---|---|---:|
| Opening and move | Title, job, financial pressure, fire aftermath, house discovery, move-in | 6–8 min |
| Day 1 | Learn the home; ordinary routine gives way to first disturbances | 9–11 min |
| Day 2 | Suspicion of the first strange person; repeated encounters and contradictory traces | 10–13 min |
| Day 3 | Growing familiarity and earned alliance; evidence begins shifting toward tenant | 12–15 min |
| Day 4 | Investigation, plan, abduction, rescue, transformation, ending | 10–13 min |

These are pacing targets rather than time gates. The job provides context and passage of time, not an office simulator.

## Spaces and environmental storytelling

Design the house organically rather than treating a sample room list as a fixed map. Choose a believable footprint, room count, circulation, storage, hallways, stairs, bathrooms, service areas, and exterior transitions that support both domestic realism and story pacing. Every authored space should serve exploration, characterization, a clue, a story event, or atmosphere.

The house starts inexpensive and lived-in, not as an obvious haunted mansion. Build familiarity first, then make known routes and objects change over time through sound, light, access, character behavior, and environmental state. Upstairs, the stairs reach a landing and a framed central doorway into a progressively unsettling corridor. The protagonist's bedroom opens on the left and Aren's distinct room is on the right; a separate tenant private room lies farther along, before the substantially larger hidden room where the rescue and reveal occur. The heavy stone latch-breaker is found in the garden and carried back upstairs. The downstairs tenant bedroom/study remain distinct from the upper private spaces, and the lower back hall remains a separate route. The existing map also includes reception, dining, kitchen, laundry and utility/bathroom rooms, a rear bedroom, escape hall, stairs, and exterior garden. The revised upper entrance and room layout are implemented in code but still require fresh movement and collision validation. The forest, terrain, moon, and garden dressing are procedural additions; none should be represented as sourced 2K/4K production art.

### Implemented story-time anchors

- **Arrival / Day 1 evening:** opening dialogue establishes the previous fire, bank possession, financial pressure and unusually cheap listing before the player starts outside. Entering leads to tenant check-in at reception and an upstairs rest.
- **Day 2 evening:** the office shift remains an offscreen black-cut transition. On returning, the player sees Aren retreat into the house, questions the tenant, and later encounters Aren around dining and household events. Their warnings and behavior create suspicion, not instant trust.
- **Day 3 evening:** after another offscreen work shift, the player witnesses the tenant harshly scold Aren. Their later conversation at dinner gives context but does not settle whether he is telling the truth. Evidence-gathering and shared repair work continue the relationship and move suspicion toward the tenant only after trust has grown.
- **Day 4 / Sunday:** there is no office transition. After sleeping, the player knocks at Aren's upstairs door, then checks the empty room. The disappearance and prior tenant behavior lead to the forbidden-room rescue attempt; a stone from the garden is needed to break its latch.
- **Finale:** entering the hidden room triggers the controlled sequence. The protagonist says “You didn't follow my rules.” before the transformation; the final reveal retains the exact canonical line “You are not alone.” The reveal is not optional or reversed by ending state.

These anchors organize authored story state and do not replace the intended connected play. The first-strange-person suspicion, earned trust, tenant investigation, and rescue still depend on exploration, conversations, clues, and triggered events; full story pacing and recovery remain to be verified in a fresh playthrough.

## Character presentation

The protagonist, first strange person/friend, and tenant are distinct, authored characters. Prioritize silhouette, clothing, posture, body language, animation, face, and expression where asset quality permits. Use authored positions, schedules, and scene behaviors rather than complex autonomous AI.

## Horror and accessibility

Progress from normality to abnormality, uncertainty, suspicion, investigation, danger, urgency, confrontation, transformation, and revelation. Use silence, environmental audio, restrained lighting, framing, character reactions, and selective scares; avoid graphic violence and constant jumpscares.

Provide readable interaction prompts, subtitles, adjustable audio, and controls suitable for mouse/keyboard and touch. Reduced quality settings should preserve the desktop visual target rather than dictate it.

## Ending variations

At least three endings vary meaningful consequences based on state such as trust, discoveries, or the tenant investigation. Each retains the transformation and exact final line; none substitutes an unrelated twist or negates the protagonist's role.

## Current implementation status

The reusable Three.js foundation is wired to the corrected Episode 1 sequence described above. The player meets Aren, finds unsettling observations including an implied stain-cleaning scene, questions the tenant, and can help investigate and repair a leaking pipe. Only after the relationship develops does the separate tenant investigation become the main suspicion path; it uses a watching event, conflicting lease/ledger information, a voice recording, and a confrontation. The plan, friend-taken beat, Sunday room check, stone-gated rescue route, final door, entity reveal, exact line, and three outcome variations are authored. Door/button feedback and readable black-screen rest transitions are implemented, while every interaction gate and the reshaped upstairs route still require fresh-playthrough validation.

This is not a release claim. Fresh-start validation of the complete chain and all three endings remains outstanding; the 30–45-minute target is unmeasured and not yet demonstrated. The house and human/entity models remain largely procedural low-detail geometry, with no verified production asset/license inventory. Door raycast targets now encompass the complete hinged assembly so their inset panels do not block interaction; the finale now opens on a timed side-angle dialogue shot before its transformation sweep. Normal foreground-browser traversal still needs full QA. Continue to use the canon and intended quality above as the acceptance target rather than treating current content and art as finished.
