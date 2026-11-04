# Contracts (frozen)

Change a contract only through a DECISIONS.md entry and a version bump. Everything is a classic script on `window.HOG`. Files load in this order on a game page:

```
../assets/js/ho-variant.js     (HOV, existing)
../assets/js/ho-track.js       (HO_track, existing)
../games-shared/vendor/phaser.min.js
../games-shared/hog-core.js    (seed, schema, storage, save)
../games-shared/hog-input.js   (keyboard + touch -> actions)
../games-shared/hog-audio.js   (WebAudio cues + captions)
../games-shared/hog-shell.js   (top bar, live region, captions, dialogs, settings)
```

## 1. Variants and seeds (`HOG.variant`, `HOG.seed`)
- Variant = integer 1 to 6. Source order: `?case=N`, then the last variant on this device (`HOV.remember`), then 1. A title-screen field and a "Random" button change it.
- `HOG.seed.of(variant, name)` = `HOV.hash(variant + '|' + name.trim().toLowerCase())` (unsigned 32-bit int). Same name + variant gives the same game every time.
- `HOG.seed.rng(seed, tag)` returns a repeatable `() => [0,1)`. Every random-looking detail takes its own `tag`, so adding a new detail never changes the others.
- `HOG.seed.int(seed, tag, min, max)`, `HOG.seed.pick(arr, seed, tag)`, `HOG.seed.shuffle(arr, seed, tag)`.
- Rule: every answer and puzzle check is computed from `HOG.seed` data, never hard-coded beside it. The tests recompute the answer from the same data.

## 2. Save schema v1 (`HOG.save.create(opts)`)
Envelope (all keys required, no others allowed):
```
{ v: 1, game: 'veil' | 'room214', variant: 1..6, seed: "<digits, max 10>",
  name: string<=24, created: int, updated: int,
  state: <game schema>, writing: { <key /^[a-z0-9_]{1,24}$/>: string<=8000 } (max 24 keys) }
```
- Key: `HOV.slot(baseKey, variant)`: variant 1 uses `baseKey`, others `baseKey_cN`. Base keys: `ho-veil`, `ho-room214`.
- Reads and writes are wrapped in try/catch with an in-memory fallback (`usingMemory` is true when storage is blocked).
- API: `load(variant)`, `save(variant, data)`, `clear(variant)`, `list()` (variant, name, updated, summary for all six), `exportText(variant)`, `importText(text, {overwrite})`.
- Export file: `{ format: 'haunted-ohio-save', formatVersion: 1, game, variant, exported: int, data: <envelope> }`.
- **Import validation (strict):** text <= 300,000 chars; `JSON.parse` in try/catch; unknown keys rejected at every level; `__proto__`, `constructor`, `prototype` keys rejected; numbers must be finite ints in range; strings stripped of control characters and length-limited; arrays and maps size-limited; `game` must match this game; variant 1 to 6. Nothing is written until the whole file validates. Errors are plain sentences and never echo file content into the page as HTML.
- Game `state` schemas use the tiny schema language in `hog-core.js` (`int`, `num`, `bool`, `str`, `enum`, `arr`, `obj`, `map`).

## 3. Input (`HOG.input.create(root, opts)`)
Actions: `up down left right interact shift hide run journal pause`. Keyboard: arrows/WASD move, E/Enter/Space interact, V shift worlds (Veil), H hide (Room 214), Shift run, J journal, Esc pause. Touch: a DOM overlay (not canvas) with a 96 px joystick (left) and 56 px buttons (right), `touch-action:none`, pointer events, `aria-label` on every control, visible focus. Overlay shows when `(pointer: coarse)` or when the user turns it on. API returns `{ axis():{x,y}, held(a), onPress(a, fn), setActions(list), show(bool), destroy() }`.

## 4. Audio and captions (`HOG.audio`)
- `HOG.audio.define(name, { caption, visual, make(ctx, out, vol) })`; `HOG.audio.cue(name, { dir })`.
- Every cue ALWAYS emits `onCue({ name, caption, dir })` even when muted or WebAudio is unavailable. The shell turns that into a caption line plus a direction pulse, so noise detection and puzzles work with no sound at all.
- Mute and volume persist in settings. No cue ever flashes more than 3 times a second.

## 5. Shell (`HOG.shell.mount(opts)`)
Builds the standard top bar (brand link back to the site, game title, "Case N" variant badge, case-code field, Random, Save/Export/Import, Mute, Volume, Low-intensity, Text size), a polite `aria-live` region `#hog-live`, a caption bar `#hog-captions`, a modal helper with focus trap, and a toast. Returns `{ say(msg), caption(c), modal(opts), settings }`. Settings: `{ mute, volume 0..1, low (bool), text 1|1.15|1.3 }`.

## 6. Privacy and network
Only `HO_track(name)` leaves the browser, with names from the fixed whitelist. New names: `game-opened-the-veil`, `game-opened-room-214`, `chapter-complete`. No other request is made. Phaser's loader is never used (procedural art only). Tests intercept all requests and fail on anything but same-origin files and GoatCounter.

## 7. Performance budget
Download (first load, uncompressed, excluding the shared Phaser file): <= 450 KB per game. Phaser: 1.2 MB (315 KB gzipped), shared. No images, no audio files. Runtime: 60 fps target, >= 30 fps floor on a low-end tablet (4x CPU throttle test); <= 400 live game objects; internal canvas <= 1280 x 720 scaled to fit; no per-frame allocations in hot loops; low-intensity mode halves particles and disables screen shake.
