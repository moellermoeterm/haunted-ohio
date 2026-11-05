# Morning summary (unattended run, merge-authorized)

Everything below is **merged to `main` and deployed** unless it says otherwise. Squash merges, one at a time; after each, the GitHub Pages deploy was checked and succeeded.

## What merged (in order)
| # | PR | Merge commit | Pages deploy |
|---|----|--------------|--------------|
| 1 | #20 Shared game framework (seeds, saves, input, captions, shell, vendored Phaser 3.90.0, plan/contracts/reviews, shared tests) | `d8112e5924f9520d6572f8e8b47ef84591aafe35` | success (run 22) |
| 2 | #21 The Veil, Chapter 1 | `ead2616d88dddda8fb621b23af7cdf07a3fd3407` | success (run 23) |
| 3 | #22 Room 214 | `671f2d377a9b072e7337e2ce5b2f5df8782d0c3d` | success (run 24) |
| 4 | #19 Hide remaining student-visible "Leaders:" notes (home map list, Dossier Field Facts) | `fe17968bff831ff01c21ed45e1654b1849d4bbc3` | success (run 25) |
| 5 | #23 Links to both games (Games tab, home page, search, teacher page, anonymous event names) + **Preview badges** (`PREVIEW_BADGE = true`) | `e098aa5144dd2f864f5498d8857e3d0a3a56464a` | success (run 26) |
| 6 | #24 Remove the last student-visible "Leaders:" prefix (Leaders page) + a site-wide test (Stage 3) | `cf216b7e6273f8be78efe32b149c6db8ca137245` | success (run 27) |
| 7 | #25 Print or save as PDF: paper copy of the Spring Grove hunt answers, plus a blank copy (Stage 4) | `035f05dc306bad5c3c82d74936ea490fead4e376` | see STATUS.md (final deploy check) |

Nothing failed or was skipped. This summary and STATUS.md are on branch `agent/docs-summary` in an open PR (docs only; not merged, because merging docs was not one of the authorized PRs).

## The two game URLs (the live site could not be loaded from my environment, the proxy blocks it with a 403, so I relied on the Pages deploy status; open these yourself)
- The Veil: https://moellermoeterm.github.io/haunted-ohio/the-veil/  (add `?case=1` to `?case=6` for a variant)
- Room 214: https://moellermoeterm.github.io/haunted-ohio/room-214/  (same `?case=N`)

## Verified on a clean checkout of `main` (local server, Chromium)
- **Games tab:** four cards in order (Haunting Files, Last Light, The Veil, Room 214). **Home page:** the case index lists both new games. **Teacher page:** six case links each for The Veil and Room 214; all twelve open to a title screen with no errors.
- **Preview badges:** four (two on the Games tab, two on the home page), tooltip "Leaders are still testing this game.". To remove them all, set `PREVIEW_BADGE = false` in `index.html`.
- **Direct URLs** of both games load, start, show the canvas, with **no console errors and no horizontal scroll at 1920, 1280 and 390 px**.
- **No student-visible text starting with "Leaders:"** on any tab, the Dossier (all stops open), "Turn it in", or any page (one remained on the Leaders page; fixed in #24; a test now guards it).

## Tests
- New games: shared `core` 32/32, `shell` 10/10, `static-security` 9/9; Veil `veil-logic` 11/11 and `veil-play` 17/17 (walking bot finishes all six variants); Room 214 `room214-logic` 21/21 (a sneaking bot finishes all six variants) and `room214-play` 13/13.
- Existing full suite (`smoke.mjs` + `content-check.mjs`), run once, alone, on `main` after the links merge: **42/42 + content check passed**. It was run again, alone, on the final `main` (after #25): see STATUS.md for the result.
- Print: `node tests/print-pdf.mjs` 11/11 (real PDFs via `page.pdf()`, 7 pages each; no network, no clipping, `<script>` and `& < >` print as plain text, stops never split, 1920/1280/390 sweep).

## Revert instructions (each merge is one squash commit)
Revert in **reverse order** (a later PR depends on earlier ones), each as a new PR with its tests:
```bash
git fetch origin && git checkout -b revert/<name> origin/main
git revert <merge commit SHA>        # e.g. 035f05d for the print feature
git push -u origin revert/<name>     # open a PR, run the tests, merge
```
Order: print (`035f05d`), Leaders prefix (`cf216b7`), links + badges (`e098aa5`), #19 (`fe17968`), Room 214 (`671f2d3`), The Veil (`ead2616`), shared (`d8112e5`). To just hide the new games without reverting, set `PREVIEW_BADGE` or remove the two Games-tab/home cards (the pages stay reachable by URL).

## Open risks and limits
- No real tablet or screen reader was available (touch was tested with emulation; accessibility checked in the DOM). Game canvases are not screen-reader navigable (everything needed to progress is in the DOM).
- Room 214 has no full start-to-finish browser bot (the headless bot covers the whole game; browser tests cover the first floor, safe, writing, ending). It is dark by design.
- The print sheet could not be matched to the Microsoft Form's 36 questions (the form needs a sign-in). It follows your seven sections using the Dossier's own questions; items the Dossier does not collect print as blank lines (see DECISIONS D-18). Print layout is checked in Chromium PDFs; "Page n of N" uses the page-margin feature of Edge/Chrome 131 and later (older browsers still show the squad-name footer, without the page number).

## Leaders must check
1. **Play both games on a real tablet** (touch, keyboard, sound off) and on desktop Edge/Chrome.
2. **Have Mr. Girard or Mr. Bennett test Room 214 for intensity** (dark hotel, a looming but harmless figure; no harm is ever shown). Decide whether it suits ages 14 to 18 and your classes.
3. **Print the two sample PDFs** (`docs/samples/print/sample-filled.pdf` and `sample-blank.pdf`) and check them against the Microsoft Form; adjust `buildSheet()` if the wording or order differs.
4. **Remove the Preview badges when you are ready** (`PREVIEW_BADGE = false`).
5. Skim the six case texts in `the-veil/js/data.js` and `room-214/js/data.js` (all fiction, labelled Game material) and confirm you are comfortable with the saints' names used for fictional chapels.
6. Decide whether the games' short writing (notes, case file, story workshop; journal, account, story seed) is done in class or at home.
7. Read PLAN.md and the design docs: the original brief was not in the saved transcript, so confirm they match what you intended.
