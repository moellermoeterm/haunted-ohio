# Haunted Ohio game redesign: audit and plan (Phase 0 and Phase 1)

Status: **audit only. Nothing in the site or games has been changed.** This file is the only change on the development branch, and the branch is local (not pushed).

## Phase 0: protection
- Working trees: the main checkout and all 22 worktrees had no uncommitted changes. Nothing was overwritten or discarded.
- `backup/pre-haunted-ohio-redesign`: created from `main` at `e821025`. Its file tree is identical to `main` (105 files).
- `feature/haunted-ohio-game-redesign`: created from the same commit. Local only.
- Not pushed, merged or deployed.
- One thing differs from "the current working state": `main` does not yet contain the Ghost Lab page. That work sits on its own pushed branch (`agent/ghost-lab`), tested but not merged. See "Open items" at the end.

## What is in the repo
- Static site for GitHub Pages: no build step, no framework, no package manager at the root. No `.nojekyll`, `_config.yml` or `CNAME`, so Pages serves the default Jekyll build of the root.
- Routes: `/` (home, one large page with hash tabs), `/show-dont-tell/`, `/haunting-files/`, `/last-light/`, `/the-veil/`, `/room-214/`, `/teacher/` (password-locked), `/tools/` (lock tool), `/design-system/`.
- Shared code: `assets/css/ho-core.css` (design tokens, Night and Daylight themes), `assets/js/ho-ui.js`, `ho-track.js` (anonymous counting), `ho-variant.js` (case codes, seeded shuffles).
- Dependencies: one. Phaser 3.90.0, vendored unmodified (about 1.2 MB) under `games-shared/vendor/`, used only by The Veil and Room 214. Fonts are self-hosted. No external network calls except the anonymous counter.
- Assets: two PNGs (logo, icon), one SVG icon sheet, nine font files. **There are no image, texture or audio files for any game.** All game visuals are CSS, inline SVG or shapes drawn in code; all sound is synthesized tones and noise.
- Tests: a Playwright suite (81 smoke tests plus a content check that fails if existing text is removed), plus per-game logic and play bots for The Veil and Room 214.

## The four games as they are
"The Haunting" in the brief is taken to mean **The Haunting Files** (there is no other game by that name).

### The Last Light (`last-light/`, one HTML file plus six scenario data files)
What it is: a text survival story set in a silent future Ohio. A title screen, a character creator (background, personality, strength, weakness), a map with three locations, three missions (The Signal, The Supply Run, The Stranger), a journal entry after each, then a ten-beat final story the student writes.

Strengths
- The character choices matter mechanically (a mechanic powers the radio without a battery, sharp eyes reveal a hidden item, quiet footsteps open a sneak option).
- Two real mechanics: tuning a radio dial until a garbled message clears, and a pack with limited slots.
- Resources (food, water, battery) drain with travel, and running out ends the run with a checkpoint.
- Six scenarios with different maps, signals, strangers and causes; saves, export and import work.
- The writing tasks are specific (a warning with a word range that must name hazards, an evidence-based trust judgement).

Weaknesses
- It is a story with buttons. Apart from the radio dial, every step is: read a paragraph, press one of two or three buttons, or tick checkboxes.
- The map is a flat polygon with four markers. There is no place to move through: locations are a paragraph of description.
- Suspense is told, not staged. The "sound upstairs" in the supply run is one sentence and one button.
- Decisions have thin consequences: flags are recorded and listed at the end, but the world does not change.
- No environmental audio beyond radio static and short beeps. No lighting, weather or motion.
- All code, style and markup for the game are in one 68 KB file, which makes changes risky.

### The Haunting Files (`haunting-files/`, one HTML file plus six case data files)
What it is: an investigation desk. Tabs for Case file, Evidence board, Interview room, Theory, Field report, Final story and Profile. Students read exhibits, classify each (verified fact, documented claim, eyewitness, folklore, speculation, possibly misleading), connect exhibits with string, find real contradictions between two witnesses, defend a theory with citations, write a report, then a nine-beat story.

Strengths
- The strongest teaching design on the site: it trains students to separate record, account, legend and guess, and the cases use real places with real history kept apart from invented "game material".
- Progress gates are meaningful (the board needs filed exhibits; the theory needs connections).
- Six cases with different strongest explanations.

Weaknesses
- It feels like a form. Exhibits are cards of text; the "board" is a list; there is no desk, no object to pick up, no place visited.
- Nothing is discovered: every exhibit is handed over at once, so curiosity never drives progress.
- The interview room is a checkbox list of statements, not a conversation.
- No atmosphere: no sound at all, no sense of the location at night that the case describes.

### The Veil (`the-veil/`, Phaser)
What it is: a top-down exploration game. Walk a churchyard and chapel in two layers (the Living World and the Echo), find a bell, solve a bell-order puzzle and a symbols puzzle, collect evidence, then write in a story workshop.

Strengths
- Real movement (arrows, WASD, on-screen stick), collision, two-world switching, inventory of evidence, checkpoints, a bot-tested full playthrough of all six cases, strict save validation.
- Good accessibility groundwork: captions for sounds, reduced motion, keyboard and touch.

Weaknesses
- Visuals are placeholder shapes: flat rectangles for walls, rounded tiles for gravestones, a capsule for the player. No textures, no lighting, no shadows.
- The whole scene is 123 lines; there is little environmental storytelling in the space itself.
- Audio is a handful of synthesized tones.

### Room 214 (`room-214/`, Phaser)
What it is: top-down stealth in a closed hotel. Flashlight cone, noise (sneak, walk, run), hiding, throwing a bell as a distraction, a patrolling Night Porter who never harms the player (being caught returns you to a checkpoint), keycards, a safe code, journals.

Strengths
- The most "game" of the four: a real threat loop, tension from noise and light, a fair failure rule suited to the age group.
- Darkness with a flashlight mask already exists.

Weaknesses
- Same placeholder look: the hotel is rectangles and room numbers.
- The Porter has little presence: no footsteps approaching, no light under a door, no sound that tells you where he is.
- Browser coverage is narrower than The Veil's (noted in the QA report).

### The rest of the site
- Home page: polished and consistent (hero with a flashlight effect, case-index cards, field map, search, tour). It is a single 264 KB HTML file holding every tab, which is the main maintenance risk on the site.
- Show, Don't Tell (ten lessons, quiz, character lab), Spring Grove Dossier, The Week, Prompts, Draft Lab, Legend Lab, Dread Meter: all working; these are lessons and tools, not games, and should stay that way.
- Catholic content ("Ghosts and faith", the field rules against contacting spirits) is handled carefully and should be preserved as is.

## Technical findings
- No broken routes or console errors in the tested paths; the suite is green on `main`.
- The two older games keep logic, markup and style in single large files with string-built HTML. Any redesign should first split them (data, logic, view) without changing behavior, under the existing tests.
- Case selection: students can currently choose their case by code or URL. A change to assign cases at random was requested earlier and has not been built. It touches the same title screens and save code as a redesign, so the order matters (see Open items).
- Saves: each game stores progress in the browser only. Any redesign must keep old saves loading (tests already guard this for the two older games).
- Performance budget: school Chromebooks. Phaser is already the heaviest download; added art and audio must stay small (compressed images, short looped audio, lazy loading per game).
- I could not load the live site from this environment (the network proxy blocks it). The audit is from the source and from running the site locally in Chromium, including starting each game and taking screenshots. Real Chromebooks, Microsoft tablets and screen readers were not available.

## Design direction (proposal, for approval)
One language, four identities: all four share the Haunted Ohio header, type and controls, and each gets its own palette, light and sound.
- **The Last Light**: cold, rural, analog. Dusk light, wind, radio static, a dying flashlight.
- **The Haunting Files**: paper, lamp light and night photography. A desk you work at and a place you visit.
- **The Veil**: stone, candle and fog; the Echo as a drained, colder copy of the same space.
- **Room 214**: carpet, brass and dark corridors; light under doors, distant footsteps.

Rules for all four: psychological suspense only. No gore, no harm shown, no jump scares used as the main effect, sound always optional with captions, reduced motion respected, keyboard and touch equal.

## Plan, one game at a time

### Step 1. The Last Light (first, as requested)
Keep every word of the story, all six scenarios, the three missions, every writing task, the character creator and the save format. Change how it is played:
1. **Split the file** into data, logic and view with no behavior change (existing tests must pass unchanged).
2. **Explorable locations.** Each of the three locations becomes a small scene the student moves through (arrows, WASD, touch), lit by their flashlight. Searching the store shelf by shelf replaces the item list; the pack limit stays. Battery is spent by light, which makes the existing resource matter moment to moment.
3. **The radio as an instrument.** Keep the dial, add signal strength you can hear, interference that depends on where you stand, and the message arriving in pieces.
4. **The stranger as an encounter.** The existing lines stay, delivered at a distance through a door or across a room, with the "tells" noticed by looking and listening instead of read from a list.
5. **Consequences that show.** The existing flags (investigated, warned, helped, traded, refused) change later scenes: a warning you posted is on the door when you return; the stranger's outcome changes what is in the radio room.
6. **Atmosphere.** Wind, static, floor creaks and a generator hum, synthesized or small recorded loops; dusk-to-dark lighting; no music.
7. **Writing stays central**, but arrives as part of the world: the journal is a physical notebook at camp; the door warning is written on the door.
Technology: plain canvas or the already-vendored Phaser (no new dependency). Decision needed, see below.

### Step 2. The Haunting Files
Keep every case, exhibit, classification, contradiction, theory, report and story beat. Change the experience:
- A desk scene: exhibits are objects (a photo, a log sheet, a tape) you pick up, turn over and file.
- A site visit: a short walk through the location at night where some exhibits are found, not handed over.
- The interview as a conversation: the same statements, asked for in the order the student chooses, with the contradiction found by the student, not ticked.
- The board as a real board with string.

### Step 3. The Veil and Room 214
Art and sound pass on what already works: tile textures, lighting and shadows, weather, footsteps, doors, the Porter's presence. No rule or story changes.

#### Room 214 visual direction (owner's brief, recorded; no work starts until its own proposal is approved)
The order of the games is unchanged. This is art and feel only: every mechanic, story line, variant, save, the random case assignment, and touch and keyboard controls stay as they are.

Problem: Room 214 looks bland. Sneaking through the hotel at night should feel like a video game, with atmosphere, depth and tension, not flat shapes.

Goals
1. **Lighting and shadow.** A visible flashlight cone with soft edges, dust or fog in the beam, and walls and furniture that cast shadows. A few working ceiling lights with warm pools, light under doors, moonlight through windows. Darkness is tense but never hides controls or objectives: outline-when-near plus a text prompt on every interactable, a visible next-step line, nothing essential shown by darkness alone.
2. **Hotel detail.** Patterned carpet with wear, stained and peeling wallpaper, baseboards, door frames with brass room numbers, a red exit sign with a slow flicker (no more than 2 flashes a second), a luggage cart, a vending machine, an elevator with a floor indicator, a stairwell, vents, light fixtures. Each floor has its own mood. Props make hiding spots readable at a glance.
3. **The threat.** A distinct silhouette, readable movement, and a clear "it noticed you" cue (screen-edge tint, a pulse, an indicator). Tense, not graphic: no gore, no blood, no injuries, for ages 14 to 18. Being caught still returns the player to a checkpoint.
4. **Noise and feedback.** Visible noise rings and footstep trails, a proximity heartbeat or tone that rises as the threat nears, creaks, drips, a distant hum. Every sound has an on-screen caption and a visual indicator; sound is never required. No sudden loud sounds; volume and mute stay in Settings.
5. **Camera and polish.** Smooth follow with slight look-ahead, a vignette, optional film grain, subtle sway while running, tidy transitions, all respecting the settings below.
6. **Settings and safety.** Low-effects mode (no flicker, grain, sway or moving light; even lighting), brightness and contrast (three steps each), reduced motion, no flashing above 3 times a second, a text mode or fallback if the canvas cannot start, and keyboard, touch and trackpad all working.
7. **Performance.** At least 30 frames per second with the processor throttled 4 times, measured in the existing test, with automatic drop to low-effects as the fallback. Static lighting baked once, a smaller internal canvas scaled up if needed, capped light redraws, new assets under 3 MB. No remote assets or network calls except the anonymous counter. Code-generated textures first; any openly licensed asset (CC0 preferred) is proposed first and recorded in `docs/ASSETS.md` with source, author and license text before it is added. No copyrighted assets, no real brand names.

Process (same as The Last Light)
- a) A short proposal first, no game code: every change, the budget, every proposed new line of text, sound or caption, and every asset with its license. Wait for approval.
- b) Before building, an in-engine look-test of one hallway section at night (full effects and low-effects, before and after), with frame rates measured while moving, not only standing still.
- c) ONE hallway or floor first, as a pull request on the development branch with a short play guide. Stop for review on a real device. Nothing else is built until approved.
- d) The playthrough bots, the sneaking bot and all six variants keep passing. Touching tests, then the full suite once, alone, before any pull request.

How the brief meets the game as it is today (to settle in the proposal, not decided here)
- The hotel has three floors (the lobby floor, floor 2, floor 3) joined by a stairwell. There is no basement, service corridor or working elevator in the map. Giving each of the three existing floors its own mood changes nothing; adding areas would change the map and the bots.
- There is one kind of hiding spot in the rules. It can be drawn as a closet, a bed or a laundry cart depending on where it sits, with the same rule underneath.
- The Porter's sight already follows line of sight through the map. Drawn shadows must match that rule exactly, so what looks like cover is cover.
- An elevator can be set dressing (an indicator that does not move the player) without a rule change.

### Step 4. The site
Light touch: carry the visual language to the game cards and loading screens. Lessons and tools keep their layout and text.

## Story protection
Nothing above changes a storyline, a character, a line of dialogue, an outcome or a writing task. Two things would count as narrative additions and need separate approval before any work:
1. New short environmental text (labels on objects, notes found while exploring) in The Last Light and The Haunting Files.
2. New captions for new sounds.
Each would be listed line by line for approval, marked as game material.

## Risks and limits, stated plainly
- **Art.** "Realistic environments" need image assets. I can produce original procedural and vector art, lighting and shaders, and I can use photographs or textures you supply or that carry a clear free license. I cannot produce painted or photographic art myself; the result will be stylized-realistic (lit, textured, atmospheric), not photoreal.
- **Audio.** Synthesized sound is possible now; recorded ambience needs licensed files added to the repo.
- **Size.** This is a large project: several working sessions per game, delivered as small reviewable pull requests, each with tests.
- **Devices.** Nothing can be verified on real Chromebooks or tablets from here; someone needs to check each stage on school hardware.

## Decisions needed before any redesign work
1. Approve the direction and the order (Last Light, then The Haunting Files, then The Veil and Room 214, then the site)?
2. Last Light engine: reuse the vendored Phaser (consistent with the two newer games, larger download) or plain canvas (smaller, more code to write)? Recommendation: Phaser, loaded only inside the game.
3. May I add environmental text and sound captions, each listed for your approval first?
4. Will you supply photos or textures, or should everything be drawn in code?
5. Random case assignment (requested earlier, not built): do it before the redesign, fold it into each game's redesign, or drop it?

## Open items from earlier work (not part of the redesign)
- **Ghost Lab page**: built on branch `agent/ghost-lab` (pushed). Touching tests passed, and the full suite passed once, alone, on its head (81 smoke tests, content check clean). **No pull request is open and nothing is merged**, because the redesign brief says not to push, merge or deploy without approval. `ghost-lab-source.html` is therefore still on `main` until that work merges.
- **Random case assignment in all four games**: not started.
