# Security and privacy review

Reviewer role: Security + Privacy. Updated 2026-11-05. Scope: `games-shared/`, `the-veil/`, vendored Phaser. Findings: **0 high, 0 medium**. Notes below.

## Checks (automated: `tests/new-games/static-security.test.mjs`, 9 checks, all pass)
- **Vendored Phaser** is the unmodified official `phaser@3.90.0` build (published 2025-05-23, over 14 days old). SHA-256 `e92ddef1...a7` verified against the npm tarball; MIT licence and version file included. The test re-checks the checksum.
- **No code from strings:** no `eval`, `new Function`, string `setTimeout/setInterval`, `document.write`, workers, WebSockets, EventSource or `importScripts` in our code.
- **No network calls in our code:** no `fetch`, `XMLHttpRequest`, `sendBeacon`. Phaser's loader is never used (all art is generated in code; no image or audio files). Browser tests intercept every request and fail on anything other than same-origin files, `data:`/`blob:` and the existing GoatCounter script.
- **No third-party hosts** in scripts, styles, fonts, images or CSS `url()`, except the one GoatCounter snippet the other pages already use. Only whitelisted anonymous events can be sent (`game-opened-the-veil`, `chapter-complete`; the names are added to `ho-track.js` in the final links PR, until then unknown names are silently ignored).
- **XSS:** every string from the student or the game is set with `textContent` or `value`; the only `innerHTML` uses are constant markup. Test saves with `<img onerror>` text show as plain text.
- **Saves and imports:** all parsing goes through one strict schema validator (unknown keys, `__proto__`/`constructor`/`prototype` keys, wrong types, ranges, long strings, long lists, wrong game, variant mismatch are refused; control characters stripped; 300,000-character cap; nothing written until the whole file validates). 20 hostile imports are in `core.test.mjs`; the browser tests also import a tampered Veil file and check that nothing changes.
- **Storage:** own keys per game and variant (`ho-veil`, `ho-veil_cN`, `ho-veil_set`, `hog_case_veil`); every access is in try/catch with in-memory fallback (tested with storage that throws). No cookies.
- **Inline handlers / `javascript:`:** none, so a strict CSP is possible later.

## Privacy
The student's name seeds the puzzles and stays in their browser. No names, writing, saves or scores are sent anywhere. The saved name and writing are in localStorage only; the Saves menu exports a file the student chooses to keep.

## Residual risks (low)
- GoatCounter (existing, approved) loads from `gc.zgo.at`; if blocked, the game works unchanged.
- Phaser's minified bundle contains generic loader code (including XHR) that this game never calls. If a future change adds loaded assets, rerun the request-intercept tests.
- A student can edit their own localStorage to cheat. There is no scoring that leaves the browser, so this has no consequence.

Sign-off: Security approves the shared framework and The Veil for opening as PRs (not for merge by this build).
