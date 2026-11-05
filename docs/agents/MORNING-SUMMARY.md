# Morning summary

Nothing was merged and nothing was pushed to `main`. Every pull request below is **open for your review**.

## What shipped
| What | Branch | PR | Status |
|---|---|---|---|
| Shared framework (seeds, saves, input, captions, shell, vendored Phaser 3.90.0, plan, contracts, reviews, shared tests) | `integration/shared` | #20 (base `main`) | open |
| **The Veil, Chapter 1** | `integration/veil` | #21 (base `integration/shared`) | open |
| **Room 214** | `integration/room214` | #22 (base `integration/shared`) | open |
| Links: Games tab, search, teacher page, anonymous event names, tests | `integration/links` | LINKS_PR (base `main`; needs the three above first) | open |
| Earlier request: hide remaining student-visible "Leaders:" notes | `claude/quirky-bell-yuxloq` | #19 | open (not merged, per the new rule) |

Suggested order to merge: #20, then #21 and #22 (retarget their base to `main` once #20 is in), then the links PR.

## What is playable
- **The Veil, Chapter 1**: fully playable in all six variants (two worlds, bell puzzle, symbols puzzle, two field notes, case file, nine-beat story workshop, copy/download, saves with export/import). Open `/the-veil/` (or `?case=N`).
- **Room 214**: fully playable in all six variants (Night Porter AI, noise, hiding, light, keycards, safe, three floors, journal, account and story seed). Open `/room-214/` (or `?case=N`).
- Not built: Veil Chapters 2 to 5.

## Test results
- New games: `core` 32/32, `shell` 10/10, `static-security` 9/9, `veil-logic` 11/11, `veil-play` 17/17, `room214-logic` 21/21 (a sneaking bot finishes all six variants), `room214-play` 13/13.
- Existing suite (`smoke.mjs` + `content-check.mjs`, 41 smoke tests), run once, alone: passed on `integration/veil`, on `integration/room214`, and on `integration/links-test` (that run also covers the new links tests). Existing games' saves are unaffected (no existing file changes in the three game PRs; the existing "save made BEFORE the restyle still loads" tests passed).
- Every new browser test also fails on any console error or outbound request.
- Also passed earlier for the "Leaders:" PR #19: 41/41 + content check.

## Open risks
- No real Microsoft tablet and no screen reader were available; touch was tested with Chromium emulation and accessibility was checked in the DOM.
- The game canvases are not screen-reader navigable (everything needed to progress, including puzzles and writing, is in the DOM).
- Room 214 has no full start-to-finish browser bot (the headless bot covers the whole game).
- Room 214 is dark by design; a "brighter map" setting is a good follow-up.
- Phaser's bundle (1.2 MB, 315 KB gzipped) is a one-time download per browser.

## Known limits
Chapter 1 only for The Veil. No analytics beyond the existing anonymous GoatCounter counts (new event names only take effect once the links PR is in).

## Leaders must check
1. **Content:** read the six case texts in `the-veil/js/data.js` and the six cases and three notes in `room-214/js/data.js` (all fiction, labelled Game material). Confirm you are comfortable with the saints' names used for fictional chapels, and that Room 214's quiet, dark hotel (a looming but harmless figure) suits your classes and ages (14 to 18).
2. **Appearance:** open both games on a real tablet and on desktop Edge/Chrome; try touch and keyboard; try with sound off.
3. **Writing expectations:** both games require short writing (notes of 10 to 80 words; the Veil ends in a 150-word, nine-beat story; Room 214 ends with an 80-word account and 60-word story seed). Decide whether it is done in class or at home.
4. **The original brief** was not in this session's saved transcript (only the build brief was), so please skim PLAN.md and VEIL-DESIGN.md / ROOM214-DESIGN.md to confirm they match what you intended.
5. **Teacher tools:** after the links PR, the Teacher page lists six links per game for all four games and the same seating helper.
6. **Hosting:** GitHub Pages serves everything from `main`; nothing needs a server. Check the new pages load offline from the Pages domain once merged (the only outside script is the existing GoatCounter one).
7. **Leaders page note:** the one student-visible "Leaders:" note left (on the Leaders page itself, PR #19 description) is for you to keep or hide.
