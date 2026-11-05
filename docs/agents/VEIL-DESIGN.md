# The Veil: design (Chapter 1, "The Keeper's Bell")

Owners: Game Design + Narrative (this file and `the-veil/js/data/*`). All story content is **Game material** (fiction). Nothing is marked "Real history".

## Pitch
A student creates an investigator and visits a closed parish chapel. The **Living World** is the chapel today (chained gate, dust, a condemned notice). Holding the Keeper's Bell lets them **shift (V)** into the **Echo**, how the place looked on one night long ago. Doors, objects and messages differ between the two worlds. The supernatural is **observed and investigated, never contacted**: no seance, no Ouija, no talking to spirits. The Echo is a replay the student reads like evidence.

## Chapter 1 flow (about 25 to 35 minutes)
1. **Churchyard (Living).** Read the township notice. The gate is chained. Find the Keeper's Bell by the gate (pick up) which unlocks the shift. Field note 1 (writing): describe the churchyard with three senses.
2. **Shift.** In the Echo the gate stands open and a bell tolls a pattern at the chapel doors (caption + direction pulse, so it works with no sound). The pattern is recorded in the Evidence Archive.
3. **Bell puzzle.** The chapel doors have three bell plates (LOW, MIDDLE, HIGH). Strike the pattern heard in the Echo. The pattern is seeded by variant and name. Doors open in both worlds.
4. **Nave.** Living: dusty pews, a burial register, a photograph, a locked cabinet with a three-dial symbol lock. Echo: a symbol glows on three pews (star, flame, tower) and a still figure by the altar points at the sacristy. The sacristy door is locked in the Living World and open in the Echo.
5. **Symbols puzzle.** In the Echo, read which symbol marks the front, middle and back pew (seeded permutation). In the Living World, set the cabinet dials front to back. The cabinet holds the Keeper's Ledger and a letter.
6. **Sacristy (Echo only).** Watch the Echo scene: the Keeper rings the bell on the night in the story. Observe only. Field note 2 (writing): write the scene in 60+ words with no feeling words ("show, don't tell").
7. **Case file.** Pick the best explanation of why the Keeper rang the bell (three options) and cite two clues. The correct option and the clues that support it come from the same seeded data. Feedback explains what each clue shows.
8. **Story workshop.** Nine beats (opening, setting, character, mystery, clues, tension, conflict, climax, resolution) with prompts. The student writes an original horror story set in a haunted place of their choosing, then copies or downloads it as a text file. Completing the case file earns the chapter badge and fires the anonymous `chapter-complete` event.

## Two puzzles, fully seeded
- **Bell puzzle:** sequence of 4 notes from {LOW, MIDDLE, HIGH}, never all the same note, from `seed.rng(seed,'bell')`. The Echo plays it; the check compares to the same array.
- **Symbols puzzle:** a permutation of {star, flame, tower} over {front, middle, back} from `seed.shuffle(...,'pews')`. The check compares dials to the same array. A hint after 3 wrong tries names the pew to re-check, never the answer.
- No timers, no fail states: wrong tries only give a gentle message. No softlocks: every required item is reachable in both worlds from the start of the chapter; shifting is allowed anywhere except while a dialog is open; the bell can't be lost.

## Six variants (case codes 1 to 6): different chapel, different night
| Case | Chapel (fictional) | Keeper | Night | Truth (what the bell was for) |
|---|---|---|---|---|
| 1 | Saint Aurelian | Thomas Rourke | thick fog on the river road | guide: lost travelers |
| 2 | Saint Odile | Clara Hennessy | high water rising in the creek | warn: the flood is coming |
| 3 | Saint Brigid | August Lindqvist | a blizzard | guide: lost travelers |
| 4 | Saint Colman | Rosa Delgado | a prairie-grass fire | warn: the fire is near |
| 5 | Saint Aldric | Walter Pruitt | a storm wind that took the roof off the school | gather: call everyone into the stone chapel |
| 6 | Saint Perpetua | Nora Kincaid | ice breaking on the pond | gather: call everyone off the ice and in |
Each variant has its own clue wording, Echo scene lines and register entries. Seeded by variant + name: bell pattern, pew-symbol order, the number of rings in the ledger, the register's page number, and the order of the three explanation options. Names are fictional and any resemblance to real people or parishes is coincidental. Nobody is harmed on screen; the story is about care and warning.

## Writing is play
Field notes (2) and Echo-scene writing unlock evidence entries. The case file and the final story need minimum word counts (30 / 60 / 150) but are never graded by the game. Text stays in the browser; the save holds up to 24 writing entries of 8,000 characters.

## Out of scope for this PR
Chapters 2 to 5 (the Veil's registry supports adding chapter files later).
