# STATUS

Updated: 2026-11-06. **All pull requests #19 through #28 are merged to `main` and deployed.** Nothing is open, blocked or failing.

## Current state
- **The Veil (Chapter 1) and Room 214** are live and linked from the Games tab, the home page, the Teacher page and the site search.
- **Preview badges are off** (#27): `PREVIEW_BADGE = false` in `index.html`.
- **Print or save as PDF** of the Spring Grove hunt answers is live, and the printed sheet **matches the 30-question Microsoft Form** (#28).
- No student-visible text begins with "Leaders:" (guarded by a smoke test).

## PRs #19 to #28 (squash merges, in the order merged; Pages deploy succeeded after each)
| PR | What | Merge SHA |
|----|------|-----------|
| #20 | Shared game framework | `d8112e5924f9520d6572f8e8b47ef84591aafe35` |
| #21 | The Veil, Chapter 1 | `ead2616d88dddda8fb621b23af7cdf07a3fd3407` |
| #22 | Room 214 | `671f2d377a9b072e7337e2ce5b2f5df8782d0c3d` |
| #19 | Hide remaining student-visible "Leaders:" notes | `fe17968bff831ff01c21ed45e1654b1849d4bbc3` |
| #23 | Links to both games + Preview badges | `e098aa5144dd2f864f5498d8857e3d0a3a56464a` |
| #24 | Remove the last "Leaders:" prefix + site-wide test | `cf216b7e6273f8be78efe32b149c6db8ca137245` |
| #25 | Print or save as PDF (hunt answers) | `035f05dc306bad5c3c82d74936ea490fead4e376` |
| #27 | Preview badges off | `6c5c7904e75c61fcd1fe297cf34c596e27488201` |
| #28 | Print sheet matches the 30-question form | `0dbcde464025bf133337a70e3cd5063bb3f56ec8` |
| #26 | Docs (first version of this summary) | `82cb62b99b9682530ad8611b2c4eac012816dccf` |

(#29 or later: the docs-only refresh that updated this file; see `git log`.)

## Direct URLs (the live site could not be loaded from my environment; checked on a clean local copy of main)
- https://moellermoeterm.github.io/haunted-ohio/the-veil/
- https://moellermoeterm.github.io/haunted-ohio/room-214/

## Last full test run
Full existing suite, once, alone, on `main` at `82cb62b`: 43/43 smoke tests + content-check passed.

## What is next
The Leaders' checklist in MORNING-SUMMARY.md (real-tablet play, intensity check of Room 214, print the sample PDFs and compare with the form). Ideas: Veil chapters 2 to 5, a text-only route through the game maps, a "brighter map" setting for Room 214. To bring the Preview badges back, set `PREVIEW_BADGE = true`.

## How to resume
`git fetch origin && git checkout main`. New-games tests: `node tests/new-games/*.test.mjs` (browser ones need Playwright linked into `tests/node_modules`). Print test: `node tests/print-pdf.mjs`. Existing suite: `cd tests && node smoke.mjs && node content-check.mjs` (about 12 minutes, run alone). Revert instructions: MORNING-SUMMARY.md.
