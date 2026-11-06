# Morning summary (updated 2026-11-06)

Everything below is **merged to `main` and deployed**. All merges were squash merges, one at a time; the GitHub Pages deploy was checked after each and succeeded. Nothing failed or was skipped.

## Current state in one paragraph
Both new games (The Veil, Room 214) are live on the Games tab, the home page, the Teacher page and the site search. The **Preview badges are off** (#27). The Spring Grove hunt can **print or save as PDF** a paper copy of the squad's answers, and the printed sheet **matches your 30-question Microsoft Form** (#28). No student-visible text begins with "Leaders:".

## Every PR, in the order merged
| PR | What | Squash merge commit | Pages deploy |
|----|------|---------------------|--------------|
| #20 | Shared game framework (seeds, saves, input, captions, shell, vendored Phaser 3.90.0, plan/contracts/reviews, shared tests) | `d8112e5924f9520d6572f8e8b47ef84591aafe35` | success (run 22) |
| #21 | The Veil, Chapter 1 | `ead2616d88dddda8fb621b23af7cdf07a3fd3407` | success (run 23) |
| #22 | Room 214 | `671f2d377a9b072e7337e2ce5b2f5df8782d0c3d` | success (run 24) |
| #19 | Hide remaining student-visible "Leaders:" notes (home map list, Dossier Field Facts) | `fe17968bff831ff01c21ed45e1654b1849d4bbc3` | success (run 25) |
| #23 | Links to both games (Games tab, home page, search, teacher page, anonymous event names) + Preview badges | `e098aa5144dd2f864f5498d8857e3d0a3a56464a` | success (run 26) |
| #24 | Remove the last student-visible "Leaders:" prefix (Leaders page) + a site-wide test | `cf216b7e6273f8be78efe32b149c6db8ca137245` | success (run 27) |
| #25 | Spring Grove hunt: print or save as PDF (answers sheet and blank copy) | `035f05dc306bad5c3c82d74936ea490fead4e376` | success (run 28) |
| #27 | **Turn the Preview badges off** (`PREVIEW_BADGE = false`) | `6c5c7904e75c61fcd1fe297cf34c596e27488201` | success (run 29) |
| #28 | **Print sheet matches the 30-question Microsoft Form** | `0dbcde464025bf133337a70e3cd5063bb3f56ec8` | success (run 30) |
| #26 | Docs: morning summary and status (first version) | `82cb62b99b9682530ad8611b2c4eac012816dccf` | success (run 31) |

(#19 through #28 are all merged; the table is in merge order, not numeric order. This file was refreshed by a later docs-only PR.)

## The two game URLs
The live site could not be loaded from my environment (the proxy blocks it with a 403), so I relied on the Pages deploy status and on checks against a clean local copy of `main`. Open these yourself:
- The Veil: https://moellermoeterm.github.io/haunted-ohio/the-veil/  (add `?case=1` to `?case=6` for a variant)
- Room 214: https://moellermoeterm.github.io/haunted-ohio/room-214/  (same `?case=N`)

## Preview badges are off
`PREVIEW_BADGE` is `false` in `index.html` (#27), so the "Preview" badges and tooltips are gone from the Games tab and the home page. The cards still link to both games. To bring the badges back, set it to `true`; the smoke test follows the constant.

## The print sheet matches your Microsoft Form (#28)
The sheet prints **30 numbered questions, numbered straight through**, with your wording and options:
- **Header (unnumbered):** "Squad name(s)" with "Write the names of everyone in your group", plus the date, points, rank and badges lines.
- **Q1** Who is submitting this form? **Stops 1 to 4** are Q2 to 6, 7 to 11, 12 to 16, 17 to 21 (photo upload as a labelled blank box, the lettered Experiment question, the verdict, one supporting fact, the Margin Note). **Reflection / Finale** is Q22 to 28. **Field Rules** is Q29 to 30, with the rules list at the top.
- **Not printed:** "The Record" and the squad members/roles (the form does not ask for them; the Dossier still saves them).
- **Saved answers carry over** only where the Dossier asked the same thing: the group names, the verdict (chosen option filled), one supporting fact, the margin note, the two temperatures, the "why" and the Fifth File line. Everything else prints blank or unchecked.
- The sheet is 4 pages. Sample PDFs: `docs/samples/print/sample-filled.pdf` and `sample-blank.pdf`. Decision notes: DECISIONS.md D-18 to D-20. To change the form wording, edit `FORM_STOPS`, `FORM_EXPERIMENT` and `buildSheet()` in `index.html` and the `FORM` list in `tests/print-pdf.mjs`.

## Verified
- Games tab (four cards), home page cards, teacher page (six links each for both games, all twelve open to a title screen), and the direct URLs of both games load with no console errors and no horizontal scroll at 1920, 1280 and 390 px.
- No student-visible text starting with "Leaders:" on any tab, the Dossier, "Turn it in", or any page (a test now guards it).
- Full existing suite (`smoke.mjs` + `content-check.mjs`), run once, alone, on `main` at `82cb62b` (after #28 and #26): **43/43 smoke tests + content check passed**. Print: `node tests/print-pdf.mjs` 13/13. New-game suites (last run on their own branches before merging): shared 32/32 + 10/10 + 9/9, The Veil 11/11 + 17/17, Room 214 21/21 + 13/13.

## Revert instructions (each merge is one squash commit)
Revert in **reverse merge order** (later PRs depend on earlier ones), each as a new PR with its tests:
```bash
git fetch origin && git checkout -b revert/<name> origin/main
git revert <merge commit SHA>
git push -u origin revert/<name>     # open a PR, run the tests, merge
```
Order: #26 `82cb62b`, #28 `0dbcde4`, #27 `6c5c790`, #25 `035f05d`, #24 `cf216b7`, #23 `e098aa5`, #19 `fe17968`, #22 `671f2d3`, #21 `ead2616`, #20 `d8112e5`. To only hide the new games, remove the two cards on the Games tab and the home page (the pages stay reachable by URL).

## Open risks and limits
- No real tablet or screen reader was available (touch tested with emulation; accessibility checked in the DOM). The game canvases are not screen-reader navigable (everything needed to progress is in the DOM).
- Room 214 has no full start-to-finish *browser* bot (the headless bot finishes all six variants; browser tests cover the first floor, safe, writing and ending). It is dark by design.
- The print layout is checked in Chromium PDFs. "Page n of N" uses the page-margin feature of Edge/Chrome 131 and later; older browsers still show the squad name in the footer without the page number.

## Leaders must check
1. **Play both games on a real tablet** (touch, keyboard, sound off) and on desktop Edge/Chrome.
2. **Have Mr. Girard or Mr. Bennett test Room 214 for intensity** (dark hotel, a looming but harmless figure; no harm is ever shown). Decide whether it suits ages 14 to 18 and your classes.
3. **Print the two sample PDFs** and compare them with the Microsoft Form once more.
4. Skim the six case texts in `the-veil/js/data.js` and `room-214/js/data.js` (all fiction, labelled Game material) and confirm you are comfortable with the saints' names used for fictional chapels.
5. Decide whether the games' short writing is done in class or at home.
6. The original brief was not in the saved transcript, so confirm PLAN.md and the design docs match what you intended.
