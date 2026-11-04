# Tasks and owners

One owner per file. Status: [ ] open, [~] in progress, [x] done.

| # | Task | Owner role | Files | Status |
|---|------|-----------|-------|--------|
| S1 | Vendored Phaser 3.90.0 + checksum | Engine (shared) | games-shared/vendor/* | [x] |
| S2 | Seeds, schema, storage, saves, import hardening | Engine (shared) | games-shared/hog-core.js | [x] |
| S2t | Core unit tests (32) | QA | tests/new-games/core.test.mjs | [x] |
| S3 | Input: keyboard + touch overlay | Engine (shared) + UX | games-shared/hog-input.js, hog-shell.css | [ ] |
| S4 | Audio + captions | Engine (shared) | games-shared/hog-audio.js | [ ] |
| S5 | UI shell, settings, live region, modals | UX + Engine | games-shared/hog-shell.js, hog-shell.css | [ ] |
| V1 | Veil design + narrative (six variants) | Game Design + Narrative | the-veil/js/data/* | [ ] |
| V2 | Veil engine (worlds, shift, puzzles, writing) | Engine (Veil) | the-veil/js/* | [ ] |
| V3 | Veil bots + tests | QA | tests/new-games/veil-*.mjs | [ ] |
| R1.. | Room 214 | see STATUS.md | room-214/* | [ ] |
| H1 | Security review | Security | SECURITY-REVIEW.md | [ ] |
| H2 | UX / accessibility review | UX | UX-REVIEW.md | [ ] |
| H3 | Content + safety + real-history check | Content | CONTENT-REVIEW.md | [ ] |
| H4 | Performance | Performance | PERF-REPORT.md | [ ] |
| L1 | Links PR (Games tab, home, teacher, ho-track events) | Release | existing files, last step only | [ ] |

## How to run the new tests
```
node tests/new-games/core.test.mjs          # shared core (no browser)
```
(Browser tests are added per game; each file states its own command.)
