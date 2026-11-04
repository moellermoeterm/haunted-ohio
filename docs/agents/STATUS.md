# STATUS

Updated: 2026-11-04 (autonomous build, owner away).

## Done
- Phase 0 discovery (PLAN.md), Phase 1 contracts (CONTRACTS.md), DECISIONS.md.
- Shared core `games-shared/hog-core.js` with 32 unit tests passing.
- Phaser 3.90.0 vendored and checksummed.

## Next
Shared input, audio/captions, shell. Then The Veil chapter 1.

## Blocked
Nothing.

## Branches
- `integration/shared`: this branch (see `git log`).
- The small "Leaders: notes" PR is on `claude/quirky-bell-yuxloq` and is left OPEN (DECISIONS D-1).

## How to continue
`git fetch`, check out `integration/shared`, read PLAN.md, TASKS.md, CONTRACTS.md, then take the first open task. Run `node tests/new-games/core.test.mjs` after any change to `games-shared/hog-core.js`.
