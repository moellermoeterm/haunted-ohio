# The Last Light redesign: proposal (Step 3a)

Status: **proposal only. No game code has been written.** Nothing is built until this is approved. Then only ONE scene is built first (the Haven Ridge radio room), delivered for review, and work stops again.

## What does not change
- Every existing word: all six scenarios, the three missions (The Signal, The Supply Run, The Stranger), every transmission, every observation, every choice label, every journal and writing prompt, the ten final-story beats, the character creator and its perks.
- Outcomes, flags, resources, experience points, achievements, checkpoints.
- The save format and save keys. Saves made before the redesign load and continue.
- Random case assignment and the leader preview (from the separate pull request).
- The route (`/last-light/`), the anonymous counter, and the rule that nothing a student types is sent anywhere.

## What changes (whole game, in order)
1. **Scene 1: the radio room** (this proposal covers it in full; see below). The Signal mission is played inside it.
2. **Scene 2: the supply-run building.** The same items, slots and hazards, found by searching shelves with the flashlight. The "sound upstairs" becomes something you hear above you before the existing choice appears.
3. **Scene 3: the stranger at the door.** The same lines, heard through a door or across a room; the existing "tells" are noticed by looking and listening.
4. **The map** stays as the way to travel, restyled, with the three scenes behind its markers.
5. **Consequences that show:** the existing flags change what later scenes look like (for example, a warning you posted is on the door when you come back).
Each of steps 2 to 5 gets its own short proposal and approval. Nothing in them is designed in detail yet.

## Scene 1 in detail: the Haven Ridge radio room

### What the student does
The existing first paragraph ("It is past two in the morning. The grain elevator hums with the wind. On the old receiver, a needle twitches that has not moved in years.") is the first thing shown, unchanged, over a dark room.

Then the student is **in** the room: a small top-down space inside the grain elevator (about 14 by 9 tiles), lit by one work lamp over the radio bench and by the student's flashlight. They move with arrows, WASD, the on-screen stick, or by tapping or clicking a spot (trackpad friendly). The line of text under the game always says what to do next, so nothing depends on seeing in the dark.

Things in the room, each with one purpose:
| Object | What it does | Rule it uses (all existing) |
|---|---|---|
| The receiver on the bench | Opens the radio. This is the existing mission, step by step. | The Signal, steps 0 to 4 |
| Battery crate | Shows how many batteries you have. Powering the radio takes one from here. | "costs 1 battery" (free for the mechanic, as now) |
| Hand crank on the bench (only if the existing crank flag is set) | The free way to power the radio. | existing `crank` flag |
| Supply shelf | Shows your food, water, medicine, battery and fuel. This is the existing "Check your supplies first" choice, done by walking to the shelf. | existing step 3 choice |
| The door | The existing "Leave the radio room for now" choice. | existing step 0 choice |
| Notebook on the cot | The existing journal step: the same prompt, the same word count. | existing step 4 |
| Window slats | Look out: wind, dark fields. No text, no rule. Atmosphere only. | none |

### The radio as an instrument
The existing tuning puzzle is kept exactly (same target frequency, same tolerance, same "steady hands" bonus, same radio-operator hint, same garbled text clearing as you approach). What is added is feel:
- The dial is a large knob you drag, turn with the arrow keys, or step with two on-screen buttons. The existing slider remains underneath as the accessible control.
- Static gets quieter and a carrier tone rises as you close in, so you can tune by ear. The same information is always shown as the existing clarity bar and as captions, so sound is never required.
- The needle on the receiver moves with the dial.
- "Lock the signal", the transmission text, the six observations to judge, the written reasoning (25 words) and the three-way decision are unchanged screens, presented on the radio panel.

For scenarios whose signal has a second decoding puzzle (shift cipher or code word), that existing puzzle appears on the same panel, unchanged.

### Proposed new narrative lines (need your approval; nothing else is added)
These are short object labels and look-at lines. They are marked "Game material", they add no plot, and no existing line is changed. If you reject any, the object simply shows its name.
1. Receiver: "The old receiver. Its needle is twitching."
2. Battery crate: "Batteries. Count them before you spend one."
3. Hand crank: "A hand crank, wired to the bench."
4. Supply shelf: "Everything you have, on one shelf."
5. Door: "The door to the yard. The wind is pushing on it."
6. Notebook: "Your notebook."
7. Window slats: "Dark fields. Nothing moving."
8. Under-game guide line, before the radio is powered: "Walk to the receiver and power it."
9. Under-game guide line, after the decision: "Write in your notebook, then leave by the door."
10. Radio panel buttons: "Turn left", "Turn right" (labels for the on-screen dial buttons).

### Sounds and captions (every sound has a caption; sound is off-by-choice and never required)
All sounds are synthesized in the browser (no audio files).
| Sound | When | Caption |
|---|---|---|
| Wind through the elevator (low, looping) | whole scene | [wind in the grain elevator] |
| Electrical hum | radio powered | [the receiver hums] |
| Static | while tuning, quieter as the signal clears | [static] / [static, fading] |
| Carrier tone | near the signal | [a steady tone under the static] |
| Dial click | each dial step | [click] |
| Lock tone | signal locked | [the signal locks] |
| Footsteps on boards | walking | [footsteps] (shown once, not every step) |
| Battery clunk | battery taken | [a battery slots in] |
| Crank whirr | cranking | [the crank whirrs] |
| Wind gust at the door | at the door | [wind at the door] |
| Low horn | where the existing transmission says "[BACKGROUND] A low horn, like a train." | [a low horn, far off] |
No sudden loud sounds. Volume and mute are in Settings.

### Visuals
- Top-down room drawn in code: plank floor, bench, receiver with a lit dial, crates, cot, slatted window. Textures are generated at load (wood grain, metal, dust), not image files.
- Lighting: a warm pool from the work lamp, a cool flashlight cone that follows the direction you face, soft darkness elsewhere. Dust drifts in the lamp light; the lamp flickers slightly.
- Interactable objects have a soft outline when you are near, plus a text prompt ("E: use the receiver"), so darkness never hides what can be used.
- Low-effects mode: no flicker, no dust, no moving light, flat even lighting.
- Brightness and contrast setting: three steps each, applied to the whole scene.
- Reduced motion (system setting): same as low-effects for motion, no screen fades.

### Controls
Keyboard (arrows or WASD, E or Enter to use, Esc for the menu), touch (on-screen stick and a Use button), and pointer (tap or click a spot to walk there, tap an object to use it). All three work for the whole scene, including the dial.

### Technology
- Phaser 3.90.0, already vendored in the repo. Loaded only when the scene starts, so the title screen stays light.
- The existing shared game shell (`games-shared/`) provides captions, settings, input and the modal, as in The Veil and Room 214.
- The mission logic stays in one place: the existing functions decide every outcome; the scene only presents them. **Text mode** (decided): a visible setting students can choose, which opens the original page-style mission, and also the automatic fallback if the canvas cannot start.

## Performance and size budget
| Item | Budget |
|---|---|
| Frame rate | 30 or more frames per second with the processor throttled 4 times (measured in the test suite, as for the other two games) |
| New image and audio assets | 0 files for this scene (everything drawn and synthesized). Hard cap for the whole game: 3 MB |
| New code | about 40 KB uncompressed for this scene |
| Phaser | 1.2 MB, already in the repo, loaded only inside the game |
| Network | none, except the existing anonymous counter |
| Objects on screen | under 150 |

## Assets, sources and licenses
For this scene: **none added.** No image, font or audio file is introduced; everything is drawn or synthesized by code written for this project.
Already in the repo and used: Phaser 3.90.0 (MIT license, recorded in `games-shared/vendor/`), and the site's self-hosted fonts.
`docs/ASSETS.md` will be created with this scene, listing the above with source and license text, and stating the rule for later scenes: open licenses only, CC0 preferred, each file listed with its source, author and license before it is added.

## Saves and tests
- Old saves: the scene reads and writes the same save fields. A save made mid-mission before the redesign opens at the same step.
- The existing playthrough tests for every scenario's signal keep passing (they will drive the same mission functions).
- New tests: the room loads; every object can be reached and used by keyboard, touch and pointer; the dial can be tuned by each control; the mission completes for all six scenarios through the scene; captions appear for every sound; low-effects, brightness and contrast work; frame rate under 4 times throttling; no console errors or sideways scroll at 1920, 1280 and 390 px; nothing is sent to the network.

## What you will get for review (Step 3c)
A pull request on the development branch with the radio room playable for all six scenarios, a one-page play guide, the test results, and `docs/ASSETS.md`. Then work stops until you have played it on a real device.

## Decisions
Decided by the owner:
- **Text mode** is both a visible student setting and an automatic fallback.
- **One shared room shape** for all six scenarios is acceptable for the first review scene (each scenario keeps its own text and puzzle).

Still needed:
1. Approve the scene design above?
2. Approve, edit or reject each of the ten proposed lines?
