# The Last Light: background sounds for the other five scenarios (proposal)

Status: **approved by the owner and built** (in the radio room pull request, still a draft). All five captions and all five sounds were approved as written. The dog bark is the synthesized version first: if it does not pass the owner's listen on a real device, it falls back to caption only, or to an openly licensed (CC0) recording proposed first with its source, author and license.

Rules the owner added, each with a test: a sound plays once per transmission view; it never replays on a re-render, on going back, or on a reload; no sound is louder than the horn (louder ones are scaled down in code); no sound starts after the student has muted (the Sound effects switch off, or Volume at zero), and muting silences one that is still ringing; the caption always shows.

## Why
Each scenario's transmission has one "[BACKGROUND]" line. In the radio room, scenario 1's line (the horn) already has a sound and a caption. The other five are still text only. This proposes a sound and a caption for each, so all six scenarios are treated the same.

## What does not change
- Every existing word. The "[BACKGROUND]" lines stay exactly as written, on the same panel.
- Every rule, observation, score and outcome. The sound is atmosphere only; the clue is still the text.
- Sound is never required: each sound has a caption, and captions show with sound off.

## The five sounds
All are synthesized in the browser, like the horn. No audio files. Each plays once, about two seconds after the transmission appears (the same moment the horn plays in scenario 1). Each fades in; none starts abruptly. Each is quieter than the static the student has just been listening to.

| Scenario | Existing line (unchanged) | Proposed sound | Proposed caption (new text) |
|---|---|---|---|
| 2 | A slow, hollow ring, like a ship's bell. | One soft bell note: a low tone with a faint higher overtone, about half a second to swell and three seconds to ring away. | [a slow, hollow ring, far off] |
| 3 | A steady three-note chime, like an alert tone. | Three gentle, evenly spaced notes at the same pitch, each about half a second, soft-edged. Played once, not looped. | [three steady chimes] |
| 4 | A faint creak, like a heavy iron door. | A low, slowly bending tone with a little rasp, about one and a half seconds, very quiet. | [a faint creak, like iron] |
| 5 | A dog barks once, then stops. | One short, muffled, low burst, shaped to sound distant (filtered so it has no sharp edge), then silence. | [a dog barks once, far off] |
| 6 | A deep, slow hum, like something very large turning over. | A very low tone that swells over a second and a half, wavers slowly, and fades over three seconds. | [a deep, slow hum, far off] |

## Safety and comfort
- **Nothing loud or sudden.** Every sound fades in over at least a fifth of a second and is capped at the same level as the horn. The dog bark is the shortest sound, so it is made the softest and the most muffled; it should read as far away, never as a jump.
- The three chimes are slow (well under two a second) and play once.
- Volume and the Sound effects switch in Settings apply to all of them.
- Low effects and reduced motion do not change sounds; they have no visual effect apart from the caption.

## Limits, stated plainly
- These are simple synthesized sounds. The bell, the chime, the hum and the creak will be recognizable. **The dog bark is the hardest to make convincing in code**; it may sound more like a soft thud than a dog. If it does not pass your ear on a real device, the fallback is to keep that scenario as caption only, or to propose an openly licensed (CC0) recording for your approval, recorded in `docs/ASSETS.md` first.
- I cannot hear audio in the build environment. Sounds are checked by their captions and by reading the code, so your listen on a real device is the real test.

## Size and tests
- No asset files. About 1 KB of code.
- Tests: each scenario shows its own caption once after the transmission appears, and no other scenario's caption; captions show with sound off; the existing horn test still passes.

## Decisions
All decided by the owner: the five captions and the five sounds are approved as written; the dog bark is tried synthesized first.
