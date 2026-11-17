# Assets, sources and licenses

Rule for every game on this site: open licenses only, CC0 preferred. A file is listed here with its source, author and license text **before** it is added to the repo. No remote assets, no copyrighted assets, no real brand names. New assets stay under 3 MB per game.

## The Last Light: the radio room (scene 1)

**No image, audio or font file was added for this scene.** That includes the five background sounds added after the first review: all are synthesized, and no audio file is in the repo.

| What | How it is made | Where |
|---|---|---|
| The room (plank floor, walls, slatted window, door, bench, receiver, headphones, tape, procedures card, hand crank, battery crate, supply shelf, cot and notebook, grain chute, sacks, stool) | Drawn in code on a canvas when the scene loads | `last-light/js/room-art.js` |
| The survivor | Drawn in code | `last-light/js/room-art.js` |
| Lighting (lamp pool, flashlight cone, moonlight, door glow, dial glow, dust, vignette) | Painted in code; the parts that do not move are painted once | `last-light/js/radio-room.js` |
| The tour's small icons (radio, backpack, pencil) | Drawn in code as inline vector paths | `last-light/js/tour.js` |
| Every sound (the three soft reward notes, wind, hum, carrier tone, dial click, footsteps, battery, crank, gust at the door, and the six scenarios' background sounds: horn, ship's bell, three chimes, iron creak, dog bark, deep hum) | Synthesized in the browser with the Web Audio API; no audio files | `last-light/js/radio-room.js` |

All of the above was written for this project and is covered by the repo's own terms.

## Already in the repo and used by the scene

| File | Source | Author | License |
|---|---|---|---|
| `games-shared/vendor/phaser.min.js` (Phaser 3.90.0, unmodified, about 1.2 MB) | The Phaser project's official release | Richard Davey, Phaser Studio Inc. | MIT. Full text in `games-shared/vendor/PHASER-LICENSE.md`; version note in `games-shared/vendor/PHASER-VERSION.md` |
| The site's self-hosted fonts in `assets/fonts/` | Listed per font in `assets/fonts/LICENSES.md` | Listed per font in `assets/fonts/LICENSES.md` | Open font licenses; full details in `assets/fonts/LICENSES.md` |

Phaser is loaded only when the radio room first opens, so the title screen and the page-style mission do not load it.

## Later scenes and games

Code-generated art first. If an openly licensed asset (CC0 preferred) would clearly improve a scene, it is proposed to the owner first and then recorded in this file, with its source, author and full license text, before the file is added.
