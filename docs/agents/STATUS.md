# STATUS

Updated: 2026-11-05 (autonomous build, owner away). Nothing has been merged; nothing was pushed to `main`.

## Done
- Phase 0 to 2: plan, frozen contracts, decisions, vendored Phaser 3.90.0 (checksummed), shared core/input/audio+captions/shell. `integration/shared`.
- Phase 3: **The Veil chapter 1 is fully playable** in all six variants (bot-verified): two worlds, bell puzzle, symbols puzzle, writing (2 field notes, case file, 9-beat story workshop with copy/download), saves with strict export/import. `integration/veil`.
- Phase 4 for The Veil: QA bots, static security checks, UX/content/performance reviews, teacher guide (`the-veil/TEACHER-GUIDE.md`). See the reports in this folder.

## Not done
- **Room 214 is not built.** Only the design (`ROOM214-DESIGN.md`) exists. Decision D-12: per the brief, finish ONE game completely rather than two half-built ones.
- The final "links" PR (Games tab, home page, teacher page, `ho-track.js` event names) is not made: it edits existing files and tests (the existing suite asserts exact card and link counts), so it needs the owner's review of how Room 214 will appear. The Veil is reachable at `/the-veil/` and with `?case=N`.
- Real tablet / screen-reader testing.

## Branches and last commits
- `integration/shared`: shared framework + docs + Room 214 design.
- `integration/veil`: everything in `integration/shared` + The Veil. (PR base for the Veil PR is `integration/shared` so the diff shows only the Veil.)
- `claude/quirky-bell-yuxloq`: separate small PR "Hide remaining student-visible Leaders: notes" (#19), left OPEN.
- Old `claude/the-veil-ch1` WIP: untouched; superseded.

## How to continue
1. `git fetch`; check out `integration/veil`; read PLAN.md, CONTRACTS.md, VEIL-DESIGN.md.
2. Run: `node tests/new-games/core.test.mjs`, `veil-logic.test.mjs`, `static-security.test.mjs`, then `shell.test.mjs` and `veil-play.test.mjs` (browser, needs Playwright; `ln -s` the global playwright into `tests/node_modules`).
3. Room 214: branch `integration/room214` from `integration/shared`, follow ROOM214-DESIGN.md. Reuse `HOG.*` for input, audio+captions, shell, saves and seeds; add `room-214/`.
