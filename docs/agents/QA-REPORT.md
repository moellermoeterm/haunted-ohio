# QA report

Updated 2026-11-05. Tests are written from the acceptance criteria in the brief; they use the same seeded data the game uses (the answer is recomputed, not copied).

## The Veil (branch `integration/veil`)
| Suite | Command | Result |
|---|---|---|
| Shared core unit tests (seeds, strict schema, saves, 20 malicious imports) | `node tests/new-games/core.test.mjs` | 32 / 32 pass |
| Shared shell browser tests (touch + keyboard input, captions, settings, modal focus trap, saves menu, 390/768/1280/1920) | `node tests/new-games/shell.test.mjs` | 10 / 10 pass |
| Veil logic and data tests (six variants, determinism, puzzle checks, softlock reachability, full playthrough by logic, save round trip) | `node tests/new-games/veil-logic.test.mjs` | 11 / 11 pass |
| Veil browser bots + checks | `node tests/new-games/veil-play.test.mjs` | 17 / 17 pass (two tests re-run alone after a test-side fix: a "Start over?" confirm dialog) |
| Static security and privacy checks | `node tests/new-games/static-security.test.mjs` | 9 / 9 pass |

What the browser bots cover: a **walking bot** plays chapter 1 for all six variants (real movement and collisions, both worlds, the bell puzzle with a wrong try first, the symbols puzzle, the sacristy scene, the case file with a wrong answer and a wrong clue first, nine story beats, download, reload and continue); keyboard play; touch play at 390 and 768 px with the on-screen stick and buttons; no-sound play (captions with direction); low-intensity mode persistence; save slots, export/import, tampered import; damaged and blocked storage; name-seeded variation; responsive checks at 390, 768, 1280, 1920 px (no horizontal scroll, canvas fits); a 4x CPU throttle run (60 fps, 20 game objects); privacy (only expected storage keys, no cookies, no outbound requests except GoatCounter).

Every browser test also fails on any console error, page error or outbound request.

## Softlock analysis
`veil-logic` proves by breadth-first search that from the start tile every needed thing is reachable in the world and state it needs (and that the chapel interior and Echo-only rooms are NOT reachable before the doors open). Shifting out of the sacristy in the Living World moves the player to the nave. The bell cannot be lost, shifting works anywhere, no timers, no fail states. Wrong puzzle tries only show a gentle message with a hint after three.

## Existing games
No existing file is modified by `integration/shared` or `integration/veil`, so existing saves load exactly as before. The existing suite (`tests/smoke.mjs`, including "a save made BEFORE the P4 restyle still loads and plays", plus `content-check.mjs`) is the final gate and is run once, alone, before the PRs (see STATUS.md for the result).

## Known gaps
- Room 214 is not built (see STATUS.md).
- No real Microsoft tablet was available; touch was tested with Chromium touch emulation (pointer events, `hasTouch`, `isMobile`) at 390 and 768 px.
- No real screen reader was run; aria-live regions, labels, roles and focus handling are tested in the DOM only.
