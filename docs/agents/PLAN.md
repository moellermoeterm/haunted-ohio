# Plan: The Veil and Room 214

Goal: two new Phaser 3 games for the Haunted Ohio site, built on one shared framework, delivered as OPEN pull requests (nothing merged by this build).

## Scope order (safety valve)
1. Shared framework (this branch): variants/seeds, strict saves + export/import, input (keyboard + touch), audio + captions, UI shell.
2. **The Veil** first, finished completely (chapter 1 playable in all six variants, both puzzles, writing + final story).
3. **Room 214** second, only if time and usage allow: core loop (stealth, AI, noise, resources, journal) then more.
4. If short on time, ONE game is finished completely rather than two half-built ones. STATUS.md says which.

## Branches
`integration/shared` -> `integration/veil` -> PR; `integration/shared` -> `integration/room214` -> PR; final small `integration/links` PR (Games tab, home page, teacher page, `ho-track.js` event names). Agent work on `agent/<role>-<task>` or directly on the integration branch when there is one writer. Worktrees live in `.wt/` (git-excluded).

## Roles (played by parallel agents where the environment allows, otherwise one at a time with the same hand-offs)
Orchestrator, Game Design, Narrative + Writing-Pedagogy, Architect, Engine (shared / Veil / Room 214), UX/Design, QA + Test Automation, Security + Privacy, Content + Safety, Performance, Release, Documentation. One owner per file (see TASKS.md). Contract-first: CONTRACTS.md and the save schema are frozen before game code.

## Gates (each ends with commit + push + STATUS.md update)
0 Discovery. 1 Architecture + contracts. 2 Shared systems. 3 Game playable (Veil, then Room 214). 4 Hardening (QA at 390/768/1280/1920 with touch emulation, security, UX, performance, accessibility, content + real-history). 5 Open PRs + teacher guides + MORNING-SUMMARY.md.

## Test discipline
Targeted tests while developing (`tests/new-games/*`). The existing full suite (`tests/smoke.mjs` + `content-check.mjs`, ~10 min) runs ONCE, alone, as the final gate before each PR. A failing test is re-run alone before it is treated as real. No overlapping runs.

## Discovery findings (Phase 0)
- Existing games are single-page, no build step, classic scripts. Shared helpers already exist: `assets/js/ho-variant.js` (HOV hash/rng/case codes), `assets/js/ho-track.js` (GoatCounter whitelist), `assets/js/ho-ui.js`, `assets/css/ho-core.css` (design tokens). Save keys: `ho-hf`-style base key, variant slots `_cN`. Case code field, `?case=N`, remembered case, seeded shuffle with `hash(case|name)`.
- `ho-track.js` only sends whitelisted event names; new names need a one-line addition (final shared PR).
- `teacher/index.html` lists six links per game plus a seating helper; both new games get the same rows in the final PR.
- Old WIP branch `claude/the-veil-ch1` (17 files, ~2,000 lines): scaffolding only, no variants, unverified vendored Phaser. Ideas reused, code ported.
- Environment: npm registry and Playwright (Chromium) available; no outbound game assets needed.
