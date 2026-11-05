# QA report: Room 214 (branch `integration/room214`)

| Suite | Command | Result |
|---|---|---|
| Logic and AI tests (determinism, map connectivity, stairs/keycards, noise, vision, chase/caught/checkpoint, hiding, patrol loops, battery, saves, content) and a **sneaking bot that finishes all six variants** (plus three more names) | `node tests/new-games/room214-logic.test.mjs` | 21 / 21 pass (bot: about 220 to 260 simulated seconds per run, caught 0 or 1 times) |
| Browser tests (six variants load, first-floor walk with real movement, stealth with sound off, hiding and being caught, the safe, writing and download, keyboard, touch at 390 and 768, saves, privacy, responsive 390 to 1920, 4x-throttle performance) | `node tests/new-games/room214-play.test.mjs` | 13 / 13 pass |
| Static security and privacy | `node tests/new-games/static-security.test.mjs` | 9 / 9 pass |
| Shared core and shell | `core.test.mjs`, `shell.test.mjs` | 32 / 32 and 10 / 10 pass |

Every browser test fails on any console error, page error or outbound request.

**How the bot proves it is finishable:** the bot plays by the real rules (sneaking, real collisions, real AI). Like a careful player it waits (standing still and low) until a simulated look-ahead of its next leg would not be caught. Being caught (it happened up to once) never lost an item or blocked progress. The AI's reset places the Night Porter far from the checkpoint and pauses him for 6 seconds, so a catch cannot trap a player in a loop (an earlier version could; the bot found it and it was fixed).

**Softlock analysis:** every item is reachable from its floor's start (BFS); Room 214 is sealed until the safe opens; stairs down are always allowed and up need only the keycards found on the way; the battery running out only turns the light off (you can still play by the small glow). No timers end the game.

**Known gaps:** a full start-to-finish run through the real browser (as the Veil has) is not automated for Room 214: the headless bot covers the whole game logic, and the browser tests cover the first floor, the safe, the writing and the ending by teleporting between stages. No real tablet or screen reader was available. Existing games are untouched (no existing file modified); the existing full suite is run once, alone, as the gate (see STATUS.md).
