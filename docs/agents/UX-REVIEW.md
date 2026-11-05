# UX and accessibility review

Updated 2026-11-05.

## Checklist (The Veil + shared shell)
| Item | Status | Evidence |
|---|---|---|
| Keyboard parity | Pass | Arrows/WASD, E/Enter, V, J, Esc; keyboard test; every menu and puzzle is DOM buttons |
| Touch parity | Pass | On-screen stick (or four-arrow D-pad option) + Act/Veil/Journal/Menu buttons, 44 px+ targets, pointer events, tested at 390 and 768 px |
| Visible focus | Pass | `:focus-visible` 3 px gold outline in the shell; focus trap in dialogs, focus restored on close |
| Captions for every sound | Pass | `HOG.audio.cue` always emits a caption + direction pulse, even when muted or with no WebAudio (tested) |
| Mute and volume | Pass | Top-bar Sound button and Settings slider, persisted |
| No flashing over 3 Hz | Pass | Shift is a single 450 ms fade; cues are rate-limited to under 3 per second (340 ms gap); the pulse is a one-shot fade; low-intensity turns the fade and animation off |
| Low-intensity option | Pass | Settings; no screen fade, static pulses, longer captions; persisted |
| Colour-blind-safe cues | Pass | Pew symbols are different shapes (star, flame, tower) with text names; bell plates have text + bar-height glyphs; things you can use show a text prompt, never colour alone |
| Readable text / text size | Pass | System font stack, 1.0 / 1.15 / 1.3 scale in Settings |
| aria-live for key messages | Pass | `#hog-live` (objective changes, new evidence, shift result), captions as a `role=log`, toasts as `role=status`, word counts `aria-live` |
| Responsive 390 to 1920 | Pass | No horizontal scroll at 390, 768, 1280, 1920 (tests); canvas scales to fit |
| Prompt and objective | Pass | A text objective above the game always says what to do next |

## Notes and follow-ups for a human
- Real-tablet and real screen-reader testing has not been done (only emulation and DOM checks).
- The game canvas itself is not screen-reader navigable; everything needed to progress (objective, evidence, puzzles, writing) is in the DOM, but walking the map is visual. A text-only route (for example, a list of nearby things with Go-to buttons) would be a good Chapter 2 addition and is listed as a known limit.
