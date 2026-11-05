# STATUS

Updated: 2026-11-05, end of the unattended merge-authorized run. **All authorized PRs are merged and deployed.**

## Merged (squash, in order; Pages deploy succeeded after each of the first six)
#20 `d8112e5` shared framework · #21 `ead2616` The Veil · #22 `671f2d3` Room 214 · #19 `fe17968` Leaders-notes cleanup · #23 `e098aa5` links + Preview badges · #24 `cf216b7` last "Leaders:" prefix + site-wide test · #25 `035f05d` print or save as PDF (hunt answers).
Final deploy check for #25 and the final full-suite run on `main`: see the bottom of this file.

## Direct URLs (live site not reachable from my environment; verified on a local clean checkout of main)
- https://moellermoeterm.github.io/haunted-ohio/the-veil/
- https://moellermoeterm.github.io/haunted-ohio/room-214/

## What is next
Leaders' checklist in MORNING-SUMMARY.md (real-tablet play, intensity check of Room 214, print the sample PDFs and compare with the Microsoft Form, remove Preview badges when ready). Ideas: Veil chapters 2 to 5, a text-only route through the game maps, a "brighter map" setting for Room 214.

## How to resume
`git fetch origin && git checkout main`. New-games tests: `node tests/new-games/*.test.mjs` (browser ones need Playwright linked into `tests/node_modules`). Existing suite: `cd tests && node smoke.mjs && node content-check.mjs` (about 12 minutes, run alone). Print test: `node tests/print-pdf.mjs`. Revert instructions: MORNING-SUMMARY.md.

## Blocked / failed
Nothing.
