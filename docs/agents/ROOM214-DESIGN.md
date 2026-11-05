# Room 214: design

Owners: Game Design + Narrative (this file, `room-214/js/data/*`). All content is **Game material** (fiction).

## Feel (must be nothing like The Veil)
The Veil is slow, bright-edged, text-forward detective work in two worlds with no danger. Room 214 is **tense, dark and mostly wordless**: a single pool of flashlight light, a shrinking battery, footsteps you must keep quiet, and something walking the halls. Short, urgent sessions; no puzzles solved by reading; decisions made by listening and watching.

## Pitch
Jules (the student's character, 16, on a family vacation and bored) sneaks into a closed hotel after dark on a dare. The floor plan by the front desk shows rooms 201 to 213 and 215 to 220. There is no 214. But there is a door.

## Core loop (about 25 to 35 minutes)
Explore by flashlight, collect keys, batteries and notes, avoid the **Night Porter** (an echo of a night shift that never ended: he escorts "guests" out before closing, which is why being caught means being **checked out to the lobby**, never harm). Reach Room 214 by combining clues from three floors, read what is inside, then escape through the lobby.

## Systems
- **Stealth.** Three speeds: sneak (silent, slow), walk (quiet), run (loud). Light on = visible from farther. Light off = you see almost nothing but you are harder to spot.
- **Enemy AI (state machine):** `patrol` (waypoints) -> `investigate` (walks to the last noise or the last place he saw light) -> `chase` (only while he has line of sight, with a short memory) -> `search` (checks hiding spots near where you vanished) -> `return` (back to patrol). Vision is a cone with distance and a light bonus; walls and doors block it. He never fires, grabs or hurts: when he touches you the screen fades and you wake at the last checkpoint with your items kept (you lose the time and a little battery).
- **Hiding (H / Hide button):** wardrobes, behind the front desk, under beds. While hidden he can still search your spot; if he checks it and you were noisy in the last seconds you are caught, otherwise he moves on. A tiny "peek" shows his direction.
- **Noise.** Everything has a noise value (run 6, walk 2, sneak 0, door 3, dropped bell 8). Noise travels as a ring; he reacts to rings that reach him through open space. **Every noise shows a visual ring and a caption**, and his footsteps, breathing and bell are captioned with direction, so the game is fully playable on mute.
- **Resources.** Flashlight battery (drains while on, found batteries refill it), keycards (open doors by level), and **room-service bells** (throw to lure him away: costs the bell). Limited supply on purpose.
- **Interconnected hotel:** three floors (lobby, second floor, third floor) joined by a stairwell, a service lift (needs a card, becomes a shortcut) and a laundry chute (one way down). Loops let you circle him; locked doors create choices.
- **Checkpoints:** the lobby door, each floor's stairwell landing, and the staff room. Autosave at each.

## Writing is play
- **Journal:** notes you find are added automatically; at each checkpoint Jules writes a short **journal entry** (30+ words) before the save is accepted (skippable once, then offered again).
- **Notes from the walls:** some notes are unfinished and ask the student to write what the missing line might say.
- **Final written account:** after Room 214, "What happened in Room 214?" (80+ words) plus a short original story seed (60+ words). Everything exportable as a text file. The case code and name appear in the report.

## Six variants (case codes 1 to 6)
Seeded by variant + name: which rooms hold keycards and batteries, the Night Porter's patrol route and speed band, hiding-spot positions, the **safe combination** (derived from three seeded clue numbers on three floors: the check uses the same array), and the hotel's name and the guest whose belongings fill Room 214. Six fictional hotels and six "lost guest" stories; no real people or real places; no harm to anyone.

## Out of scope for the first PR
Later floors, boss sequences, multiple endings. The framework supports more floors by adding map files.

## Test plan (QA writes from acceptance criteria)
- Pure-logic tests: AI state transitions (vision cone, noise radius, line of sight), noise propagation through doors, determinism per seed, safe combination from seeded clues, checkpoint restore.
- Bot: for each variant, a scripted bot uses a debug `disableEnemy`-free path: it walks a precomputed safe route timed against the seeded patrol (the patrol is deterministic from the seed) and also a "get caught on purpose" run that proves the checkpoint return never loses items or softlocks.
- Same responsive, touch, keyboard, privacy, performance and static-security tests as The Veil.
