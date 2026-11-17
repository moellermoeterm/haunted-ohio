# Tours, purpose, sound and play: proposal for all four games

Status: **proposal only. No code has been written for any item here.** Every new line of text, sound and caption below is listed for the owner's approval. Existing story text stays unchanged. After an item is approved it is built as its own small pull request.

Word counts: every intro card, bubble and tip card below has 12 words or fewer (checked by a script; numbers and "E3" count as words).

How to read the bubble tables: **When** is the moment the bubble appears. **Points at** is what it points to. **Done when** is the player action that moves the tour on (there is no Next button). Where the control differs by device, the bubble has a keyboard, touch and mouse version; the game shows the one that matches how the player last used it.

---

## A. The tour and how to play (all four games)

### How it works everywhere
- **Intro:** at most 3 cards, each with a small icon and at most 12 words. Shown the first time a player opens the game on this device. Buttons: **Skip tour** and **Start**. Swipe, arrow keys or tap to move between cards.
- **Hands-on tutorial:** small bubbles, one at a time, each pointing at the thing to use and each at most 12 words. A bubble goes away when the player does the action. Each mechanic is taught the first time it is needed, not before.
- **Idle hint:** if the player does nothing useful for about 15 seconds while a bubble is showing, the bubble gently pulses once and the target gets a soft glow (no pulse in reduced motion or low effects; the glow stays).
- **"?" Help button** always on screen: a list of one-line tip cards. Tapping a tip replays its bubble on the real control when that control is on screen, or shows the line when it is not.
- **Skip tour / Replay tour** in the Help list. Completion is remembered per game, per device (one small key per game, for example `ho-last-light-tour`). Nothing in the tour ever blocks play: every bubble can be closed, and the game works the same with the tour skipped.
- **No page of paragraphs anywhere.** The current How-to-play screens are replaced by the Help list. Teacher guides stay where they are.
- Bubbles are readable on a phone (large type, never wider than the screen, placed above or below the target so they never cover it). They are announced politely to screen readers (aria-live), they respect reduced motion, and captions stay.
- **Existing text:** removing the How-to-play screens removes text the content check protects. Each pull request lists exactly which How-to-play lines it removes and adds them to the check's allowed removals. No story text is removed.

Device words used below: **Key** version for keyboard players, **Touch** for touch screens, **Mouse** for mouse or trackpad.

### A1. The Last Light (built inside the radio room pull request, #40, once approved)
Purpose line on the title screen: **"Survive a silent Ohio, decide who to trust, and write to stay alive."**

Intro cards
| # | Icon | Text |
|---|---|---|
| 1 | radio | Ohio, 2047. The power is gone. One radio still works. |
| 2 | backpack | Every trip costs food and water. Watch your supplies. |
| 3 | pencil | Your choices and your writing decide how your story ends. |

Bubbles, in the order a player meets them
| When | Points at | Text (Key / Touch / Mouse) | Done when |
|---|---|---|---|
| Survivor screen opens | Name box | Name your survivor. | A name is typed |
| Name typed | Background choices | Pick a background. Each one changes what you notice. | A background is picked |
| All four picked | Start the story | Ready? Start the story. | Pressed |
| Map opens | Home marker | Key: Select your home with Tab and Enter. / Touch: Tap your home. / Mouse: Click your home. | Home selected |
| Home selected | Go to the radio room | Go to the radio room. | Pressed |
| Map, first time | Resource bar | Food and water drop each day. Keep them above zero. | Closed or 6 seconds |
| Radio room opens | Survivor | Key: Move with the arrow keys or W A S D. / Touch: Drag the stick to move. / Mouse: Click the floor to walk there. | The survivor moves |
| Near the receiver | Receiver | Key: Press E to use the receiver. / Touch: Tap Use. / Mouse: Click the receiver. | Panel opens |
| Panel open | Power button | Power the radio to listen. | Pressed |
| Tuning | Knob | Turn the knob until the words come in clear. | Clarity reaches the lock point |
| Clear | Lock the signal | Clear enough. Lock the signal. | Pressed |
| Transmission shown | First detail box | Tick every detail that raises a question. | One ticked |
| One ticked | Reasoning box | Explain why, using two details you ticked. | 25 words reached |
| Decision shown | Supply shelf | Not sure? Check your supplies on the shelf first. | Shelf used or a choice made |
| Journal step | Notebook | Walk to your notebook and write your entry. | Panel opens |
| Journal saved | Door | Leave by the door to reach the map. | Door used |
| First supply run | Slots counter | Your pack has limited slots. Choose what matters most. | One item picked |
| Warning step | Warning box | Name two hazards. Tell survivors what to do. | Posted |
| First stranger talk | First question | Ask questions. Watch for details that do not fit. | One asked |
| Radio message step | Message box | 20 words or fewer: what you found, where, what you need. | Sent |
| Third journal entry saved | Final story tab | Three journal entries unlock your final story. | Tab opened or closed |

Help tip cards (the "?" list)
| Tip | Text |
|---|---|
| Moving | Arrows or W A S D, the stick, or click the floor. |
| Using things | Walk up to it, then press E, tap Use, or click. |
| Supplies | Each day costs 1 food and 1 water. |
| Travel | Travelling to a new place costs one day. |
| Tuning | Turn slowly. The static fades as you get close. |
| Journal | Each mission ends with a journal entry. |
| Final story | Three journal entries unlock your final story. |
| XP | XP rewards careful thinking and writing, not speed. |
| Saves | Progress saves in this browser. Export it to change devices. |
| Sound | Every sound has a caption. Sound is optional. |
| Text mode | Prefer reading? Turn on Text mode in Save and settings. |

**What it replaces:** the How-to-play window (title, intro, six steps, three tips). The "How to play" button becomes the "?" Help button.

### A2. The Haunting Files
Purpose line: **"Sort fact from legend, then write what you can prove."**

Intro cards
| # | Icon | Text |
|---|---|---|
| 1 | folder | You are a junior investigator. Evidence beats the scariest answer. |
| 2 | magnifier | File each exhibit. Find where the witnesses disagree. |
| 3 | pencil | Build a theory you can defend, then write it up. |

Bubbles
| When | Points at | Text | Done when |
|---|---|---|---|
| New case | Name box | Enter your investigator name. | Typed |
| Case file shown | I have read the file | Read the file, then press I have read the file. | Pressed |
| Exhibits shown | First exhibit | Key: Open an exhibit with Enter. / Touch: Tap an exhibit. / Mouse: Click an exhibit. | Opened |
| Exhibit open | Evidence types | What kind of evidence is it? Pick one. | Filed |
| First Review tag | Review tag | Review means read why, then you will spot it next time. | Read or closed |
| Interview room unlocks | Interview tab | Both statements filed. The interview room is open. | Opened |
| Interview open | First statement line | Select only the lines that truly conflict. | One selected |
| Evidence board opens | First exhibit card | Tap one exhibit, then another, to tie a string. | Two tied |
| String tied | Link type | Supports, contradicts or explains? Say why in six words. | Saved |
| Theory tab opens | Theory choices | Pick a theory and two exhibits that back it. | Both chosen |
| Field report opens | Report box | Cite exhibits by number, like E3. | Checked |
| A locked tab is pressed | That tab | Locked tabs show what to finish first. | Closed |

Help tip cards
| Tip | Text |
|---|---|
| Filing | File at least six exhibits, including both witness statements. |
| Review | A Review tag means read the explanation and try again. |
| Board | Make at least two connections, each with a reason. |
| Theory | Say what new evidence would change your mind. |
| Report | At least 80 words, citing at least two exhibits. |
| Labels | Game material is fiction. Real history is labelled. |
| XP | XP rewards good reasoning and writing, not speed or guessing. |
| Saves | Progress saves in this browser. Export it to change devices. |

**What it replaces:** the How-to-play window (title, intro, seven steps, four tips).
**Note:** The Haunting Files redesign (Step 2 of the plan) has not started. If it will change these screens soon, the bubbles should be built with it, not before (see F).

### A3. The Veil
Purpose line: **"Explore two worlds, solve what happened, and write the story."**

Intro cards
| # | Icon | Text |
|---|---|---|
| 1 | bell | A closed chapel. A brass bell. Two worlds. |
| 2 | eye | Shift worlds to see what the other one hides. |
| 3 | pencil | Write field notes as you go. They become your story. |

Bubbles
| When | Points at | Text | Done when |
|---|---|---|---|
| Game starts | Player | Key: Move with the arrow keys or W A S D. / Touch: Drag the stick to move. / Mouse: Use the on-screen arrows. | Moved |
| Near the bell | Bell | Key: Press E to pick up the bell. / Touch: Tap Use. | Taken |
| Bell taken | Veil button | Key: Press V to shift worlds. / Touch: Tap Veil. | Shifted |
| First time in the Echo | Bell plates area | Listen here. The bell pattern is a clue. | Pattern heard or read |
| At the plates | Plates | Strike the plates in the order you heard. | Solved |
| First clue found | Evidence button | Clues you find go into Evidence. | Opened or closed |
| First field note | Note box | Use three senses. Show what you notice; do not name feelings. | Saved |
| Inside, first time | Pew marks | Read the marks in the Echo. Use them in the Living World. | Mark read |

Help tip cards
| Tip | Text |
|---|---|
| Moving | Arrows or W A S D, or the on-screen controls. |
| Using things | Walk up to it, then press E or tap Use. |
| Shifting | V or the Veil button switches worlds once you hold the bell. |
| Evidence | Every clue is saved in Evidence. Check it when stuck. |
| Field notes | Use at least three senses. Show, do not tell. |
| Story | Your notes feed the story you write at the end. |
| Sound | Every sound has a caption. Sound is optional. |

**What it replaces:** the long intro paragraph on the title screen is kept as is (it is story text); the controls sentence in the menu becomes the Help list.

### A4. Room 214
Purpose line: see B4.

Intro cards
| # | Icon | Text |
|---|---|---|
| 1 | hotel | A closed hotel. A floor plan with a missing room. |
| 2 | flashlight | Something walks the halls. Stay quiet. Stay hidden. |
| 3 | pencil | Collect what you sense. It becomes your story. |

Bubbles
| When | Points at | Text | Done when |
|---|---|---|---|
| Game starts | Player | Key: Move with the arrow keys or W A S D. / Touch: Drag the stick to move. | Moved |
| First steps | Noise ring | Rings show how far your noise travels. | 4 seconds |
| Still in the lobby | Sneak control | Key: Hold C to sneak. Sneaking is silent. / Touch: Hold Sneak to move silently. | Sneaked |
| Near a keycard | Keycard | Key: Press E to take the keycard. / Touch: Tap Use. | Taken |
| Porter heard for the first time | Nearest hiding spot | Footsteps. Hide: walk to the closet and press H. / Touch: walk to the closet and tap Hide. | Hidden |
| Hidden | Hiding mark | Hidden. Wait until the footsteps fade. | Left the spot |
| First bell found | Throw control | Key: Press T to throw a bell and lure him. / Touch: Tap Throw. | Thrown |
| Battery low for the first time | Light control | Key: F turns your light off to save battery. / Touch: Tap Light. | Pressed or closed |
| At the stairs | Stairs | Each floor up needs a keycard. | Climbed |
| New floor reached | Journal button | Key: Press J. Write what you noticed down there. / Touch: Tap Journal. | Journal opened |
| First time caught | Checkpoint marker | Caught. You restart here and keep everything you found. | Moved |
| At the safe | Safe | Enter the three numbers you found, one per floor. | Opened or closed |

Help tip cards
| Tip | Text |
|---|---|
| Moving | Arrows or W A S D, or the stick. |
| Sneak | Hold C or Sneak. Silent, but slow. |
| Run | Hold Shift or Run. Fast, but loud. |
| Hide | Closets, beds and laundry carts hide you. Press H. |
| Light | F turns your flashlight off and saves battery. |
| Bell | Throw a bell with T to pull him away. |
| Caught | You go back to a checkpoint and keep everything. |
| Journal | Write about each floor before you climb. |
| Sound | Every sound has a caption and a direction. Sound is optional. |

**What it replaces:** the controls paragraph in the menu.

---

## B. The purpose of each game
Each title screen gets one purpose line, and the game shows an always-visible current objective. Room 214 and The Veil already have an objective line; The Last Light (radio room) has the guide line; The Haunting Files gets one.

| Game | Purpose line (title screen) | How the writing connects to the play (one sentence, shown in the Help list) |
|---|---|---|
| The Haunting Files | Sort fact from legend, then write what you can prove. | The exhibits you file and connect become the evidence you cite in your report. |
| The Last Light | Survive a silent Ohio, decide who to trust, and write to stay alive. | Each mission ends in a journal entry, and three entries unlock your own story. |
| The Veil | Explore two worlds, solve what happened, and write the story. | What you notice in each world becomes your field notes, then your story. |
| Room 214 | Find the room missing from the plan, unseen, and collect details for your story. | Every detail you notice becomes a note, and your notes become your story seed. |

### B4. Room 214, in full (proposed)
- **What you are trying to do:** find Room 214, the room that is missing from the floor plan, without being caught by the Night Porter. (This is the existing goal: keycards, three safe numbers, the hidden door, then out through the lobby.)
- **What you collect (new, needs approval as a mechanic):** sensory details. A few spots on each floor hold a detail you can notice with E (a smell, a sound, something you see or touch). Each one becomes a short note in your journal. The objective line shows the count, for example "Details noticed: 3 of 8". The exact detail lines would come to you as a separate table for approval once the mechanic is approved. Option: use sentences that already exist in the hotel's notes instead of new text.
- **Why it matters:** your noticed details sit beside the journal box when you write each floor's journal and your story seed, so the play feeds the writing directly.
- **When you are caught:** you go back to your last checkpoint and keep everything you found (unchanged rule). A short line says so the first time (bubble above).

---

## C. Room 214 sound

### What is there now, and why it is hard to hear
All Room 214 sounds go through the shared sound code at the default volume of 60%. The quiet ones are also **very low in pitch**: the Porter's footsteps are a short rumble at about 220 Hz, and the door creak is a low buzz at 170 Hz falling to 120 Hz. Laptop and Chromebook speakers play almost nothing below about 200 to 300 Hz, so these sounds mostly vanish on them. Raising their level alone would not fix it; they need their sound moved up into the range those speakers can play.

### A question first: which sound is "the buzz when the player hits a wall"?
**Room 214 has no sound for bumping into a wall.** Two existing sounds could be heard that way:
1. **The door creak**: a low buzz that plays when you walk through a doorway, and doorways are in walls.
2. **"No" buzz**: the shared low buzz that plays when a safe code is wrong (it is also used by The Veil).

If it is the door creak, "make door creaks louder" and "do not change the buzz" contradict each other, so I need to know which one you mean. **This proposal assumes it is the "no" buzz** and leaves it untouched. A test will record its exact sound (two-part low sawtooth, its pitch, length and level) and fail if anything about it changes.

### Master limiter
A limiter on the game's master output, after the volume control: anything above about -6 dB is squeezed hard, so no sound or stack of sounds can spike. The volume slider, mute and low intensity keep working exactly as now.

### Proposed levels
Levels are relative to the sound as it plays now, at the same volume setting. "Moved up" means the same sound shifted into the range laptop speakers can play.

| Sound | Now | Proposed | Caption (existing unless marked new) | When it plays |
|---|---|---|---|---|
| Porter's footsteps | Low rumble, quiet | About 2.5 times louder, moved up (a heel click on boards, 300 to 1500 Hz) | slow footsteps | As now: every 0.5 to 0.9 seconds within 10 tiles, louder as he nears |
| Porter breathing close by | Quiet hiss | About 2 times louder | slow breathing close by | As now: within about 3 tiles |
| Door creak | Low buzz, quiet | About 2.5 times louder, moved up (a slow bend from about 600 to 350 Hz with a little grain) | a door creaks | As now: when you walk through a doorway |
| Your loud footsteps (running) | Medium | About 1.7 times louder, moved up | your footsteps echo | As now: when you run |
| Bell lands | Loud enough | Unchanged | a bell clangs | As now |
| He has seen you | Loud enough | Unchanged | a sharp bell: he has seen you | As now |
| Footsteps turn toward a sound | Quiet | About 1.5 times louder | the footsteps turn toward the sound | As now |
| "No" buzz | Fine | **Unchanged (tested)** | a low buzz: not that | As now |
| **New** heartbeat-like pulse | none | Very soft, slow low pulse with a click on top so laptops play it; faster and a little louder as he nears | **new:** [a slow pulse: he is close] | Only within about 5 tiles of the Porter, never while hidden and far |

### Proposed layered ambience (all new sounds and captions, for approval)
A quiet bed that changes with where you are and how close the Porter is. Each layer fades in and out over at least a second; none starts suddenly. No speech, no voices, no spirit contact, no jump-scare loudness. Every layer has a caption (shown once when it starts, then again only if it changes) and a small visual cue.

| Sound | Level | Caption (new) | Visual cue | When it plays |
|---|---|---|---|---|
| Building hum | Very soft, constant | [the building hums] | none needed (constant) | Everywhere, softer on floor 3 |
| Wind in the vents | Soft, slow swells | [wind moans in the vents] | vent grilles flutter (not in low effects) | Near vents; more on floor 3 |
| Pipe knocks | Soft, two or three knocks, now and then | [pipes knock in the walls] | small ring at the wall it comes from | Every 20 to 40 seconds, more often on the lobby floor |
| Distant creaks | Soft, far away | [a floorboard creaks somewhere] | direction arrow at the screen edge | Every 15 to 30 seconds |
| Door latch | Soft click | [a latch clicks down the hall] | direction arrow | Now and then, never on the player's own door |
| Footsteps overhead | Soft, muffled | [footsteps on the floor above] | arrow pointing up | Only when the Porter is on the floor above you |
| Faint radio hiss | Very soft hiss | [faint radio hiss] | none | Near the front desk only |
| Water drip | Soft, slow | [water drips] | ripple mark | Near the second-floor bathrooms |

Moods by floor (sound and light together): lobby floor, the hum and pipes (old and grand); floor 2, doors and latches (lived-in); floor 3, wind and creaks (empty and cold).

**Safety:** nothing flashes; every layer obeys mute, volume and low intensity (low intensity turns the ambience down by half and turns off the pulse); sound is never required; the direction captions already in the game keep working.

**Tests:** the "no" buzz is unchanged; no sound's peak after the limiter exceeds the limit; every new sound shows its caption with sound off; muting stops every layer; the pulse never plays while the Porter is more than 5 tiles away.

---

## D. More game-like, all four
The same few pieces in every game, in each game's own style. No speed points anywhere. All writing stays inside the play.

| Piece | The Haunting Files | The Last Light | The Veil | Room 214 |
|---|---|---|---|---|
| Always-visible objective | New objective line ("File both witness statements") | Guide line in the radio room; objective line on the map | Existing objective line | Existing objective line |
| Progress | "Exhibits filed 4 of 9", "Conflicts found 2 of 3" | "Missions 1 of 3", step dots inside a mission | "Clues 5 of 9" | "Details noticed 3 of 8", "Numbers 1 of 3" |
| Reward moment | A short stamp on the exhibit ("Filed") with a soft tone | "Signal locked" (see A-radio below) | A soft shimmer on the clue | "Detail noticed" with a soft tone |
| End-of-case summary | Theory, best evidence, XP, badges | Days survived, choices, XP, badges | Clues, notes, badges | Details, times caught, notes, badges |
| Ranks and badges | Existing XP and ranks kept | Existing ranks and achievements kept | New badges in the site's style | New badges in the site's style |
| Collectibles become notes | Filed exhibits feed the report | Clues feed the journal | Clues feed field notes | Details feed the journal and story seed |
| Fail and retry | Wrong filing: "Review" and try again | Existing checkpoint when health runs out | Wrong bell order: try again | Caught: back to checkpoint, keep everything |

Every reward line, badge name and summary heading would come to you as a table for approval in that game's pull request. No badge or rank is for speed.

### The radio room (Track A, inside PR #40): objective and reward moments
The always-visible objective is the guide line under the room (approved). Proposed additions:

**Step dots** under the guide line: five dots, the current one lit, with a hidden label for screen readers.
| Label (new, for screen readers) |
|---|
| Step 1 of 5: power the radio |
| Step 2 of 5: tune the signal |
| Step 3 of 5: study the message |
| Step 4 of 5: decide |
| Step 5 of 5: write it down |

**Reward moments** (a short label that rises over the room and fades in about 1.5 seconds, with a soft pulse on the object; no pulse in low effects or reduced motion, the label stays):
| When | Label (new) | Sound (new, synthesized) | Caption (new) |
|---|---|---|---|
| Radio powered | Radio on | none (the existing hum plays) | none (the existing hum caption shows) |
| Signal locked | Signal locked | Two soft rising notes | [a soft rising chime] |
| Analysis submitted | Analysis filed | One soft note | [a soft chime] |
| Decision made | Decision made | none | none |
| Journal saved | Mission complete: The Signal | Three soft rising notes | [a soft rising chime] |

The existing XP and achievement messages keep showing as they do now.

---

## E. First-person options (analysis and a look-test plan, not a commitment)

**In every option, only the view changes.** The game logic stays the single source of truth: line of sight, hiding, noise, puzzles, saves, random case assignment and the six variants. The first-person view reads the same game state the top-down view reads today, and the current view stays available as the text-mode-like fallback and as a map.

| | Option 1: first-person hotel corridors (Room 214) | Option 2: first-person "look at" views (The Veil, The Haunting Files) | Option 3: The Last Light keeps its map and rooms, adds first-person close-ups |
|---|---|---|---|
| What the player sees | Walking the hotel at eye level: walls, doors, the flashlight beam, the Porter as a silhouette | A painted scene of a place (the chapel, the churchyard in both worlds, the investigator's desk); click or tap what you want to look at | When you use the receiver, shelf or notebook, the view moves in close (the receiver face fills the screen, the knob under your hand) |
| How it is drawn | A small "raycaster": the hotel is already a grid of tiles, which is exactly what this technique draws well. Drawn on a small canvas (about 320 by 180) and scaled up. Textures drawn in code (wallpaper, carpet, doors with brass numbers) | Scenes drawn in code in layers; no movement in 3D | Drawn in code, building on the radio room art |
| Download size | About 25 to 40 KB of new code; no new library (does not need Phaser) | About 30 to 60 KB of code per game | About 15 KB |
| 30 fps at 4x slower processor | Likely, because the canvas is tiny and walls are simple; **must be measured while moving** in the look-test | Easy: the scene barely changes | Easy |
| Comfort | Field-of-view slider; no head bob by default; turn-speed setting; snap turning option; reduced motion turns off sway and smooth turns; low effects turns off the beam's flicker and fog | No movement, so few comfort risks | Short zoom, off in reduced motion |
| Touch | Left stick to move, drag on the right half to look, or two turn buttons | Tap to look | Tap |
| Fallback | The current top-down view, and a text summary of what is around you | The current views | The radio room as it is now, and text mode |
| Hiding and line of sight | The Porter's sight uses the same function; drawn darkness and walls come from it (same rule as the shadows decision) | Not affected | Not affected |
| Effort | About 6 small pull requests: look-test (no pull request), one-hallway prototype, one floor, all three floors, Porter and hiding, polish | About 3 or 4 per game | About 2 |
| Risk | Motion sickness for some students (comfort settings above); more work to make the Porter readable | Feels less like a game than option 1 | Smallest change, smallest gain |

**Recommendation:** start with Option 1 for Room 214. Its map is already a tile grid, its stealth rules already exist, and it is the game that would gain the most from feeling like a first-person video game. Option 3 can follow naturally after the radio room is approved. Option 2 is worth doing for The Veil after Room 214 shows how students take to it.

**Proposed look-test (before any pull request):** one straight hotel hallway with three doors, a closet, an exit sign and the Porter walking at the far end, drawn first-person at night. I would show you screenshots in full effects and low effects, and report frame rates **measured while walking and turning** at 4 times slower processor speed, the same way the radio room was measured. Nothing is committed from the look-test.

---

## F. Order, and how each piece fits with PR #40

| Order | Piece | Pull request | Size (rough) | How it fits |
|---|---|---|---|---|
| 1 | The radio room continues: polish, then the Last Light tour bubbles, step dots and reward moments (A1, and the radio-room part of D) | **PR #40** (draft, unchanged scope otherwise) | Tour and bubbles about 300 lines of code plus tests; removes the Last Light How-to-play window | The bubble code is written so the other games can reuse it, but PR #40 only uses it for The Last Light |
| 2 | Room 214 sound (C) | Own small PR, from `main` | About 150 lines plus tests | Independent of PR #40; can be reviewed while you play the radio room |
| 3 | Tours, purpose lines and objectives for The Veil and Room 214 (A3, A4, B) | One PR per game | About 150 to 250 lines each | Reuses the bubble code from PR #40, so these wait until PR #40 is merged (or are stacked on it). The Room 214 "details" collectible (B4) is a separate PR after its detail lines are approved |
| 4 | Room 214 first-person look-test (E) | No PR; screenshots and numbers to you | Throwaway | Independent |
| 5 | Room 214 one-hallway first-person prototype | Own small PR | About 500 lines plus tests | After the look-test is approved |
| 6 | The Haunting Files tour, purpose line and objective (A2, B) | One PR | About 250 lines | Best built together with The Haunting Files redesign (Step 2 of the plan), so the bubbles point at the final screens; if the redesign waits, a lighter version can go first |
| 7 | Gamification pieces (D) for the other three games | One PR per game | About 200 to 400 lines each | After each game's tour, so the rewards and the bubbles are designed together |

This keeps the radio room going first, puts the sound fix early because it is small and independent, and puts the first-person work after you have seen a look-test.

---

## Decisions needed
1. Approve, edit or reject the intro cards, bubbles and tip cards for each game (A1 to A4). The Last Light set is needed first, for PR #40.
2. Approve the four purpose lines and the four "how the writing connects" sentences (B).
3. Room 214: approve the "details noticed" collectible as a mechanic (B4)? New detail lines, or reuse existing note sentences?
4. **Which sound is "the buzz when the player hits a wall": the door creak or the "no" buzz?** (C)
5. Approve the Room 214 level changes, the limiter, the pulse and the ambience layers with their captions (C).
6. Approve the radio room step dots and reward moments with their sounds and captions (D, radio room).
7. Approve the first-person look-test for Room 214 (E)?
8. Approve the order (F)?
