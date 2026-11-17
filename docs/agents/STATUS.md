# Status: finish-line run (unattended)

The owner authorised squash-merging the items below, one at a time, when every gate passes (touching tests, then the full suite once, alone, on the head, no conflicts), then waiting for the Pages deploy. The live site cannot be loaded from the build environment; deploy results come from the GitHub Pages workflow status.

| # | Item | PR | State |
|---|---|---|---|
| 1 | Ghost Lab | #38 | **Not merged** (see D-38) |
| 2 | Room 214 sound | #41 | Merged as `aa220a8` |
| 3 | The Last Light radio room, tour, Chapter 1 panel | #40 | Merged as `cd83121` |
| 4 | The Veil: first shift, sound, tour | #42 | Merged as `6910fb6` |
| 5 | Room 214: tour, details noticed, summary | #43 | Merged as `2efa431` |
| 6 | The Haunting Files: light tour | #44 | Merged as `786a616` |
| 7 | Cross-game finish | branch `agent/cross-game-finish` | In progress |
| 8 | Final QA sweep | (new) | Not started |
| 9 | Docs: status, morning summary, leader game guide | (new) | Not started |

## How to resume
Read this table, then `docs/agents/DECISIONS.md` from D-38 on. Each open item has its own branch named in its row once started. Run one heavy test at a time: `cd tests && node smoke.mjs` then `node content-check.mjs`; the game bots are in `tests/new-games/`.
