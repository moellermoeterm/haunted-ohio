# Tasks and owners

One owner per file. Status: [ ] open, [~] in progress, [x] done.

| # | Task | Owner role | Files | Status |
|---|------|-----------|-------|--------|
| S1 | Vendored Phaser 3.90.0 + checksum | Engine (shared) | games-shared/vendor/* | [x] |
| S2 | Seeds, schema, storage, saves, import hardening | Engine (shared) | games-shared/hog-core.js | [x] |
| S2t | Core unit tests (32) | QA | tests/new-games/core.test.mjs | [x] |
| S3 | Input: keyboard + touch overlay | Engine (shared) + UX | games-shared/hog-input.js, hog-shell.css | [x] |
| S4 | Audio + captions | Engine (shared) | games-shared/hog-audio.js | [x] |
| S5 | UI shell, settings, live region, modals | UX + Engine | games-shared/hog-shell.js, hog-shell.css | [x] |
| V1 | Veil design + narrative (six variants) | Game Design + Narrative | the-veil/js/data/* | [x] |
| V2 | Veil engine (worlds, shift, puzzles, writing) | Engine (Veil) | the-veil/js/* | [x] |
| V3 | Veil bots + tests | QA | tests/new-games/veil-*.mjs | [x] |
| R1.. | Room 214 | see STATUS.md | room-214/* | [x] |
| H1 | Security review | Security | SECURITY-REVIEW.md | [x] |
| H2 | UX / accessibility review | UX | UX-REVIEW.md | [x] |
| H3 | Content + safety + real-history check | Content | CONTENT-REVIEW.md | [x] |
| H4 | Performance | Performance | PERF-REPORT.md | [x] |
| L1 | Links PR (Games tab, home, teacher, ho-track events) | Release | existing files, last step only | [x] |

## How to run the new tests
```
node tests/new-games/core.test.mjs          # shared core (no browser)
node tests/new-games/veil-logic.test.mjs    # The Veil logic
node tests/new-games/room214-logic.test.mjs # Room 214 logic, AI and bot
node tests/new-games/static-security.test.mjs
node tests/new-games/shell.test.mjs         # browser
node tests/new-games/veil-play.test.mjs     # browser bots (about 4 minutes)
node tests/new-games/room214-play.test.mjs  # browser
```
(Browser tests are added per game; each file states its own command.)
