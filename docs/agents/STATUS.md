# STATUS

Updated: 2026-11-05 (autonomous build, owner away). **Nothing has been merged. Nothing was pushed to `main`.** Every pull request is open for review.

## Done
- **Shared framework** (`games-shared/`, `docs/agents/`, vendored Phaser 3.90.0, tests infrastructure): seeds and variants, strict saves with export/import, keyboard + touch input, audio with captions, UI shell. Branch `integration/shared`.
- **The Veil, Chapter 1** (`the-veil/`): fully playable in all six variants (browser bots), two puzzles, writing, story workshop, teacher guide. Branch `integration/veil`.
- **Room 214** (`room-214/`): playable in all six variants (headless bot finishes each; browser tests cover the first floor, safe, writing, ending, touch, keyboard, saves, performance), teacher guide. Branch `integration/room214`.
- **Links** (Games tab, teacher page, search, anonymous event names): branch `integration/links` (one commit on top of `main`), tested together with both games on `integration/links-test`.
- Reports: QA, security, UX, content and performance reports for both games in this folder.

## Not done / known limits
- No real tablet or screen reader was available (touch tested with Chromium emulation; accessibility checked in the DOM).
- The game canvas is not screen-reader navigable (everything needed to progress is in the DOM; walking the map is visual). A text-only route is a good next step.
- Room 214 has no full browser start-to-finish bot (the headless logic bot covers the whole game; see QA-REPORT-ROOM214.md).
- The Veil has Chapter 1 only (the design supports more chapters).

## Branches
`integration/shared`, `integration/veil`, `integration/room214`, `integration/links` (+ `integration/links-test`), and the earlier `claude/quirky-bell-yuxloq` (PR "Hide remaining student-visible Leaders: notes"). See MORNING-SUMMARY.md for PR numbers. The old `claude/the-veil-ch1` WIP branch is untouched.

## How to continue
1. `git fetch`; read PLAN.md, CONTRACTS.md, DECISIONS.md.
2. Tests (new games): `node tests/new-games/core.test.mjs`, `veil-logic.test.mjs`, `room214-logic.test.mjs`, `static-security.test.mjs` (no browser) and `shell.test.mjs`, `veil-play.test.mjs`, `room214-play.test.mjs` (Playwright; link the global `playwright` into `tests/node_modules`).
3. Existing suite: `cd tests && node smoke.mjs && node content-check.mjs` (about 12 minutes; run alone).
