// CHAPTER 1: THE FIRST SIGN
// Saint Aurelian Chapel is a FICTIONAL place. The March 1913 flood is real Ohio history; the Keeper and everything
// supernatural are invented for this game.
import { makeMap } from './mapkit.js';
import * as audio from '../systems/audio.js';

export const CHAPTER = {
  id: 1, title: 'Chapter 1: The First Sign', short: 'The First Sign',
  start: { mapId: 'c1_grounds', x: 16.5, y: 19.5, dir: 'up' },
};

// ------------------------------------------------------------------ maps
const windows = (ys, x) => ys.map((y) => ['set', x, y, 'W']);

export const MAPS = {
  c1_grounds: makeMap({
    id: 'c1_grounds', name: 'Saint Aurelian Churchyard', w: 32, h: 22, base: ',', dusk: true,
    living: [
      ['rect', 1, 18, 30, 3, ':'], ['rect', 15, 6, 2, 12, ':'],
      ['rect', 0, 0, 32, 1, 'T'], ['rect', 0, 0, 1, 22, 'T'], ['rect', 31, 0, 1, 22, 'T'], ['rect', 0, 21, 32, 1, 'T'],
      ['rect', 8, 1, 16, 6, '#'], ['set', 10, 6, 'W'], ['set', 12, 6, 'W'], ['set', 19, 6, 'W'], ['set', 21, 6, 'W'], ['rect', 15, 6, 2, 1, 'D'],
      ['rect', 9, 7, 5, 1, 'h'], ['rect', 18, 7, 5, 1, 'h'],
      ['rect', 1, 15, 14, 1, 'f'], ['rect', 17, 15, 14, 1, 'f'], ['set', 15, 15, 'G'], ['set', 16, 15, 'G'],
      ['set', 4, 9, 'g'], ['set', 7, 9, 'g'], ['set', 4, 12, 'g'], ['set', 7, 12, 'g'], ['set', 24, 9, 'g'], ['set', 27, 9, 'g'], ['set', 24, 12, 'g'], ['set', 27, 12, 'g'],
      ['set', 12, 10, 's'], ['set', 19, 10, 's'],
      ['set', 3, 3, 'T'], ['set', 5, 5, 'T'], ['set', 27, 3, 'T'], ['set', 25, 5, 'T'], ['set', 3, 13, 'T'], ['set', 28, 13, 'T'], ['set', 3, 17, 'T'], ['set', 27, 17, 'T'],
    ],
    veil: [['set', 15, 15, ':'], ['set', 16, 15, ':']],
  }),

  c1_nave: makeMap({
    id: 'c1_nave', name: 'The Nave', w: 28, h: 26, base: '.', dark: true,
    living: [
      ['rect', 0, 0, 28, 1, '#'], ['rect', 0, 0, 1, 26, '#'], ['rect', 27, 0, 1, 26, '#'], ['rect', 0, 25, 28, 1, '#'],
      ['rect', 13, 25, 2, 1, 'o'], ['rect', 13, 3, 2, 22, 'r'],
      ...windows([6, 10, 14, 18], 0), ...windows([6, 10, 14, 18], 27),
      ['rect', 11, 1, 6, 1, 'A'], ['set', 10, 1, 'c'], ['set', 17, 1, 'c'], ['set', 9, 3, 'c'], ['set', 18, 3, 'c'],
      ...[8, 10, 12, 15, 17, 19].flatMap((y) => [['rect', 1, y, 11, 1, 'p'], ['rect', 16, y, 11, 1, 'p']]),
      ['rect', 12, 13, 4, 1, 'x'], ['set', 0, 4, 'D'], ['set', 3, 22, 't'],
    ],
    veil: [
      ['set', 0, 4, 'o'], ['rect', 12, 13, 4, 1, '.'], ['rect', 13, 13, 2, 1, 'r'], ['rect', 1, 7, 26, 1, 'q'],
    ],
  }),

  c1_sacristy: makeMap({
    id: 'c1_sacristy', name: 'The Sacristy', w: 14, h: 10, base: '_', dark: true,
    living: [
      ['rect', 0, 0, 14, 1, '#'], ['rect', 0, 0, 1, 10, '#'], ['rect', 13, 0, 1, 10, '#'], ['rect', 0, 9, 14, 1, '#'],
      ['set', 13, 5, 'o'], ['set', 10, 0, 'k'], ['set', 2, 0, 'b'], ['set', 3, 0, 'b'], ['set', 5, 0, 'b'],
      ['set', 5, 4, 't'], ['set', 6, 4, 't'], ['set', 2, 8, 'c'], ['set', 11, 8, 'c'],
    ],
    veil: [],
  }),

  c1_belfry: makeMap({
    id: 'c1_belfry', name: 'The Bell Tower', w: 14, h: 12, base: '_', dark: true,
    living: [
      ['rect', 0, 0, 14, 1, '#'], ['rect', 0, 0, 1, 12, '#'], ['rect', 13, 0, 1, 12, '#'], ['rect', 0, 11, 14, 1, '#'],
      ['set', 0, 5, 'W'], ['set', 13, 5, 'W'], ['set', 0, 8, 'W'], ['set', 13, 8, 'W'], ['set', 7, 11, 'S'],
      ['set', 2, 2, 'c'], ['set', 11, 2, 'c'],
    ],
    veil: [],
  }),
};

// ------------------------------------------------------------------ helpers used by scripts
const SEQ = ['mid', 'low', 'high', 'mid'];
export const BELL_SEQUENCE = SEQ;
export const SYMBOL_SOLUTION = ['star', 'flame', 'tower'];

const traitLine = (c, map) => map[c.state.trait] || '';
const isOpen = (c) => c.flag('chapelOpen');

// ------------------------------------------------------------------ entities
// x,y are in tiles (center of the entity). worlds: where it exists. when(c): extra visibility rule. r: interact radius in pixels.
export const ENTITIES = [
  // ---------- Grounds
  {
    id: 'bell', map: 'c1_grounds', x: 12.5, y: 19.5, tex: 'ent_bell', worlds: ['living'], r: 46, bob: true, label: 'Pick up the bell',
    when: (c) => !c.flag('hasBell'),
    async run(c) {
      await c.say('', 'A glint in the roadside grass. You push the weeds aside. A small brass bell, wrapped in a strip of cloth, set down as if someone meant you to find it.');
      c.giveItem('bell'); c.setFlag('hasBell'); c.clue('bellDate');
      audio.bellToll(); c.flash();
      await c.say('', 'The moment your fingers close around it, a bell tolls once, from somewhere that is not here. The air thins. For a heartbeat the road looks like a photograph of the road.');
      c.setFlag('veilUnlocked');
      c.log('Found a small brass bell by the road outside Saint Aurelian Chapel.');
      await c.say('', 'Something has changed. Press V to shift between the Living World and the Veil. Try it now.');
      await c.once('shift');
      await c.say('', 'Same road. Same night. But different: through the trees, the churchyard gate that was chained a minute ago now stands open.');
      c.refresh();
    },
  },
  {
    id: 'notice', map: 'c1_grounds', x: 19.5, y: 16.6, tex: 'ent_board', worlds: ['living', 'veil'], r: 54, solid: true, label: 'Read the notice',
    async run(c) {
      c.clue('notice');
      await c.say('', 'A weathered notice board bolted to a post. A township order closes the chapel as unsafe, pending demolition. Across the bottom, in pencil, pressed hard: “THE BELL RINGS AT 11:14. NOBODY IS RINGING IT.”');
      const t = traitLine(c, {
        observant: 'The pencil marks are fresh. Someone wrote this within the week.',
        skeptical: 'A prank, probably. But nobody leans that hard on a pencil for a joke.',
        compassionate: 'Whoever wrote this was frightened, and had no one to tell.',
        daring: 'You wonder who dared to stand here long enough after dark to write it.',
      });
      if (t) await c.say('', t);
    },
  },
  {
    id: 'gate_chain', map: 'c1_grounds', x: 16, y: 15.5, tex: 'ent_chain', worlds: ['living'], r: 70, label: 'Examine the gate',
    async run(c) {
      c.clue('chain');
      await c.say('', 'A heavy chain is wound through the gate, the padlock fused solid with rust. Nobody has opened this in years.');
      if (c.flag('hasBell')) await c.say('', 'But in the Veil, the gate was open. If one world will not let you through, the other might.');
      else await c.say('', 'There must be another way in. You look around the road for anything useful.');
    },
  },
  {
    id: 'watcher_yard', map: 'c1_grounds', x: 16, y: 8.2, tex: 'ent_watcher', worlds: ['veil'], r: 80, ghost: true, label: 'Approach the figure',
    when: (c) => c.flag('watcherYard') && !c.flag('watcherYardGone'),
    async run(c) {
      c.meet('watcher');
      await c.say('The Watcher', '...');
      await c.say('', 'It does not speak. It lifts one long hand and points at the chapel doors. Then the edges of it come apart like smoke, and it is gone.');
      c.setFlag('watcherYardGone'); c.log('A tall figure stood at the chapel doors in the Veil. It pointed at the doors and vanished.');
      c.refresh();
    },
  },
  {
    id: 'chapel_doors', map: 'c1_grounds', x: 15.99, y: 6.6, tex: null, worlds: ['living', 'veil'], r: 64, label: (c) => (c.world() === 'veil' ? 'Listen at the chapel doors' : 'Try the chapel doors'),
    when: (c) => !isOpen(c),
    async run(c) {
      if (c.world() === 'living' && !c.flag('triedDoors')) {
        c.setFlag('triedDoors');
        await c.say('', 'Tall oak doors, black with age. Three brass bell-shaped plates are set into the wood at chest height, polished by hands long gone. They look like they are meant to be struck.');
      } else if (c.world() === 'veil' && !c.flag('heardDoorBell')) {
        await c.say('', 'In the Veil the doors are the same, but now you can hear the plates ringing faintly, as if someone just struck them.');
      }
      const ok = await c.puzzle('bell', { sequence: SEQ });
      if (ok) {
        c.setFlag('chapelOpen'); c.patch('c1_grounds', 15, 6, 'o', 'B'); c.patch('c1_grounds', 16, 6, 'o', 'B');
        audio.creak();
        c.log('Opened the chapel doors by repeating the bell pattern heard in the Veil.');
        await c.say('', 'The plates ring in answer. Deep in the oak, a bolt slides back by itself. The doors swing inward on a breath of cold air that smells of wax and wet stone.');
        c.refresh();
      }
    },
  },

  // ---------- Nave
  {
    id: 'photo', map: 'c1_nave', x: 13.5, y: 2.7, tex: 'ent_note', worlds: ['living'], r: 56, label: 'Look at the photograph',
    async run(c) {
      c.clue('photo'); c.meet('keeper');
      await c.say('', 'A faded photograph propped against the altar rail. A broad-shouldered man in shirtsleeves stands in these very doors with a small hand bell held at his side. On the back, in pencil: “T. Rourke, 1911. Rang the evening bell every day for thirty-one years.”');
      await c.say('', 'You turn the bell in your pocket over. The same bell. You are sure of it.');
    },
  },
  {
    id: 'register', map: 'c1_nave', x: 3.5, y: 22.5, tex: 'ent_note', worlds: ['living'], r: 56, label: 'Read the register',
    async run(c) {
      c.clue('register');
      await c.say('', 'A burial register left open on a table. The last entries are from the week of March 25, 1913. Line after line reads only “lost to the flood.” Then a name entered and crossed out so hard the page tore: THOMAS ROURKE, KEEPER.');
      const t = traitLine(c, {
        observant: 'The ink on the crossed-out line is a different color from the rest. It was added later, by a different hand.',
        skeptical: 'The great Ohio flood was real. A keeper lost in it is easy to believe. The rest is what you came to test.',
        compassionate: 'Someone crossed out his name because they could not stand to see it there.',
        daring: 'No grave is listed. If he is anywhere, he is still out there.',
      });
      if (t) await c.say('', t);
    },
  },
  ...[['pewStar', 'star', 11.5, 8.5, 'front pew'], ['pewFlame', 'flame', 16.5, 12.5, 'middle pew'], ['pewTower', 'tower', 11.5, 19.5, 'pew nearest the doors']].map(([id, g, x, y, where]) => ({
    id, map: 'c1_nave', x, y, tex: 'glyph_' + g, worlds: ['veil'], r: 50, glow: true, label: 'Examine the glowing mark',
    async run(c) {
      c.clue(id);
      await c.say('', `On the end of the ${where}, a mark glows pale blue in the Veil: a ${g}. In the living world there is only worn wood.`);
      if (!c.flag('symbolsNoted')) { c.setFlag('symbolsNoted'); c.log('Glowing marks appear on three pews in the Veil. Their order may matter.'); }
    },
  })),
  {
    id: 'watcher_nave', map: 'c1_nave', x: 13.5, y: 3.6, tex: 'ent_watcher', worlds: ['veil'], r: 80, ghost: true, label: 'Approach the Watcher',
    when: (c) => !c.flag('metWatcher'),
    async run(c) {
      c.meet('watcher'); c.clue('watcher1');
      await c.say('', 'A tall, still figure stands before the altar with its back half-turned. As you come closer it does not flee. It turns its face toward you: pale, blank, patient.');
      await c.say('The Watcher', 'You hold the bell.');
      await c.say('The Watcher', 'Then you can hear it. Good. Few have, since the water.');
      const i = await c.choose('The Watcher waits.', ['Who are you?', 'What do you want from me?']);
      if (i === 0) await c.say('The Watcher', 'I am what remains of someone who kept watch. That is all I am sure of. The rest is... a long way down.');
      else await c.say('The Watcher', 'I want nothing. I only point. Because I cannot do more than that.');
      await c.say('The Watcher', 'There is a door in the wall that is only a door in my world. Behind it are things your world forgot to keep.');
      await c.say('', 'It raises one hand toward the left wall, to the door of the sacristy, and the light behind it goes out.');
      c.setFlag('metWatcher'); c.log('The Watcher pointed me to the sacristy door, which is only open in the Veil.');
      c.refresh();
      const t = await c.write({ id: 'ch1_watcher', title: 'The Watcher', prompt: 'What do you think the Watcher wants? Write two or three sentences. Is it a warning, a plea, or something else?', min: 20 });
      if (t) c.toast('Added to your journal and your Haunting Creator notes.');
    },
  },
  {
    id: 'sac_door', map: 'c1_nave', x: 0.7, y: 4.5, tex: null, worlds: ['living'], r: 60, label: 'Try the sacristy door',
    when: (c) => !c.flag('sacristyOpen'),
    async run(c) {
      c.clue('sacDoor');
      await c.say('', 'The sacristy door is bolted from the other side. It will not move. But you have seen that doors here do not always agree between the two worlds.');
    },
  },

  // ---------- Sacristy
  {
    id: 'letter', map: 'c1_sacristy', x: 5.5, y: 4.5, tex: 'ent_note', worlds: ['living', 'veil'], r: 60, label: (c) => (c.world() === 'veil' ? 'Read the letter' : 'Take the letter'),
    async run(c) {
      if (c.world() === 'living') {
        if (!c.hasItem('letter')) { c.giveItem('letter'); c.clue('letter1'); }
        await c.say('', 'A letter, water-stained and half washed away. You can make out: “To whoever keeps the bell after me. It was never meant to call anything. It was made to ____ the lost toward ____ .” Most of the rest is blank.');
        if (!c.hasClue('letter2')) await c.say('', 'Where the words have washed out, the paper seems to hum slightly. Maybe the Veil remembers what the letter forgot.');
      } else {
        c.clue('letter2'); c.setFlag('readLetterVeil');
        await c.say('', 'In the Veil the washed-out words are back, glowing faintly: “It was never meant to call anything. It was made to GUIDE the lost toward HIGH GROUND. The water on the lower road ROSE FAST before dusk. I rang until THE LAST LANTERN CAME UP THE HILL.”');
        await c.say('', '“If you can hear this, you are holding my place. Do not let it GO SILENT.”');
        c.log('Read Rourke’s letter in full, in the Veil. The bell was meant to guide the lost to safety.');
      }
    },
  },
  {
    id: 'cabinet', map: 'c1_sacristy', x: 10.5, y: 0.8, tex: null, worlds: ['living'], r: 64, label: 'Examine the cabinet',
    when: (c) => !c.flag('cabinetOpen'),
    async run(c) {
      c.clue('lockPlate');
      if (!c.flag('sawLock')) {
        c.setFlag('sawLock');
        await c.say('', 'A tall oak cabinet in the wall. A brass lock with three dials, each marked with five small symbols. Beneath them, engraved in a tidy hand: FRONT. MIDDLE. BACK.');
        await c.say('', '“As they were lit, so they were kept.”');
        if (!c.hasClue('pewStar') || !c.hasClue('pewFlame') || !c.hasClue('pewTower')) await c.say('', 'Front, middle, back… the pews? You think of the nave, and whatever might have been marked there.');
      }
      const ok = await c.puzzle('symbols', { solution: SYMBOL_SOLUTION });
      if (ok) {
        c.setFlag('cabinetOpen'); c.clue('hiddenStair'); c.clue('ledger1'); c.giveItem('ledger');
        c.patch('c1_sacristy', 7, 0, 'S', 'B');
        audio.creak();
        c.log('Opened the cabinet with the three symbols seen in the Veil. A hidden stair leads up.');
        await c.say('', 'The third dial settles with a clack. The whole cabinet swings inward on a hidden hinge, and behind it a narrow stair climbs into the dark of the tower. On a shelf inside lies a narrow ledger.');
        await c.say('', 'Thirty-one years of evening bell times. The last page is torn out. In the margin of the last entry: “Eleven-fourteen. Still ringing. They are still coming.”');
        c.refresh();
      }
    },
  },

  // ---------- Belfry
  {
    id: 'bigbell', map: 'c1_belfry', x: 7, y: 4.6, tex: 'ent_bigbell', worlds: ['living', 'veil'], r: 80, solid: true, label: 'Examine the great bell',
    async run(c) {
      if (c.world() === 'living') await c.say('', 'The great bell hangs silent, green with age. The rope rotted away long ago. Whoever rang this bell for thirty-one years rang it by hand, standing right where you are.');
      else await c.say('', 'In the Veil the great bell gleams as if freshly cast. The small bell in your pack grows warm, like it recognizes its larger twin.');
    },
  },
  {
    id: 'keeper', map: 'c1_belfry', x: 9.5, y: 6.8, tex: 'ent_keeper', worlds: ['veil'], r: 80, ghost: true, label: 'Speak with the Bell Keeper',
    when: (c) => !c.flag('ch1Done'),
    async run(c) {
      c.meet('keeper');
      if (!c.flag('keeperMet')) {
        await c.say('', 'At the foot of the great bell, in the Veil, a broad-shouldered man in shirtsleeves stands with a lantern hanging from his hand. You have seen him before, in a photograph. He looks up the way people do when they have waited a very long time.');
        await c.say('Thomas Rourke', 'Easy, now. Easy. You carry my bell. I wondered who would pick it up from the road.');
        const i = await c.choose('How do you answer?', ['You’re Thomas Rourke.', 'Are you what’s been haunting the county?']);
        if (i === 0) await c.say('Thomas Rourke', 'Thomas, yes. Thirty-one years, every evening at the same hour. I never thought anyone was listening.');
        else await c.say('Thomas Rourke', 'Haunting? No. I am an echo of a promise, nothing more. The one who stood in the nave pointing at doors, that one I cannot name.');
        await c.say('Thomas Rourke', 'March, nineteen-thirteen. The river came up faster than anyone believed it could. I rang through that whole night so the ones lost on the lower road would know which way was up. They came. Not all. But they came.');
        const t = traitLine(c, {
          observant: 'You notice his boots are still wet.',
          skeptical: 'You came to test a story. It is harder to be skeptical when the story is looking at you.',
          compassionate: 'You find you want to say thank you, and you are not sure to whom.',
          daring: 'You step closer instead of back, and he seems to approve.',
        });
        if (t) await c.say('', t);
        await c.say('Thomas Rourke', 'The bell does not make the Veil, child. It lets the one who holds it hear where someone is still waiting to be found.');
        await c.say('Thomas Rourke', 'But something is tearing at the edges between my world and yours. Places that ought to stay where they are are leaking into each other. I do not know what stirs beneath. I know only that this bell was meant to guide, never to command.');
        c.clue('keeper1'); c.setFlag('keeperMet');
        c.log('Met Thomas Rourke, the Bell Keeper, in the Veil. He does not know what is tearing the worlds’ edges.');
      } else {
        await c.say('Thomas Rourke', 'You came back. Have you decided what to do with my bell?');
      }
      const d = await c.choose('What do you do with the bell?', ['Ring it once, for anyone still waiting.', 'Keep it silent for now. I need to understand first.', 'Ask him what he needs.']);
      if (d === 0) {
        c.decide('ch1_bell', 'You rang the Keeper’s Bell once, for anyone still waiting.');
        audio.bellTone('low'); setTimeout(() => audio.bellTone('high'), 650);
        await c.say('', 'You lift the bell and ring it once. The sound goes out through the tower and keeps going farther than a sound should.');
        await c.say('Thomas Rourke', 'There. Do you hear it? Somewhere a door stays open a little longer tonight.');
      } else if (d === 1) {
        c.decide('ch1_bell', 'You kept the Keeper’s Bell silent until you understood more.');
        await c.say('Thomas Rourke', 'A careful keeper. That is no bad thing. A bell that rings for the wrong reason is worse than one that does not ring.');
      } else {
        c.decide('ch1_bell', 'You asked the Keeper what he needed.');
        await c.say('Thomas Rourke', 'No one has asked me that in a hundred years. What I need is for the places on the rim of that bell to be remembered. All of them. Start with the next one.');
      }
      await c.say('', 'You turn the bell in the lantern light. Beneath the date on the rim, the column of names is clearer now. The first reads SAINT AURELIAN. The second, in a hand much like the first: SAINT BRENDAN’S BURIAL GROUND.');
      const t = await c.write({ id: 'ch1_decision', title: 'Why you made that choice', prompt: 'Why did your character choose that? Write two or three sentences about what they were thinking and feeling in that moment.', min: 20 });
      if (t) c.toast('Added to your journal and your Haunting Creator notes.');
      await c.say('Thomas Rourke', 'Go on, then. Mind the Watcher. It does not mean harm. It only cannot say more.');
      await c.say('', 'The lantern gutters. When you look again, there is only the great bell, swaying very slightly, though nothing touches it.');
      c.setFlag('ch1Done'); c.log('Chapter 1 complete. The next name on the bell: Saint Brendan’s Burial Ground.');
      c.endChapter();
    },
  },
];

// ------------------------------------------------------------------ zones
// Walk-in triggers. x,y,w,h in tiles.
export const ZONES = [
  {
    id: 'yard_enter', map: 'c1_grounds', x: 14, y: 12, w: 4, h: 2, once: true,
    async run(c) {
      c.setFlag('enteredYard'); c.log('Got into the churchyard through the gate that only stands open in the Veil.');
      await c.say('', 'You are in. The grass is knee-high and soaked, and the air smells of cold stone and lilies left too long in water. Somewhere, a long way off, there is the faint sound of a river that should not be this loud.');
      const t = await c.write({ id: 'ch1_setting', title: 'The churchyard', prompt: 'Describe the churchyard so someone who has never seen it could picture it. Use at least one sound and one smell. Two or three sentences is plenty.', min: 20 });
      if (t) c.toast('Setting detail saved.');
    },
  },
  {
    id: 'watcher_yard_trigger', map: 'c1_grounds', x: 13, y: 8, w: 6, h: 4, once: true, worlds: ['veil'],
    async run(c) {
      c.setFlag('watcherYard'); audio.whisper(); c.refresh();
      await c.say('', 'Someone is standing at the chapel doors. Tall. Perfectly still. It is facing you, and it has been for some time.');
    },
  },
  { id: 'to_nave', map: 'c1_grounds', x: 15, y: 6, w: 2, h: 1, when: (c) => c.flag('chapelOpen'), run: async (c) => c.teleport('c1_nave', 14, 23.4, 'up') },
  {
    id: 'nave_dark', map: 'c1_nave', x: 11, y: 21, w: 6, h: 3, once: true,
    async run(c) {
      c.setFlag('naveEntered');
      await c.say('', 'Inside, the dark is nearly total. Pews march away into black. Your own breath sounds loud.');
      c.toast('Press F to switch your flashlight on or off.', 5000);
      c.log('Entered the chapel. It is pitch dark inside.');
    },
  },
  { id: 'nave_exit', map: 'c1_nave', x: 13, y: 24, w: 2, h: 2, run: async (c) => c.teleport('c1_grounds', 16, 8.4, 'down') },
  { id: 'sac_enter', map: 'c1_nave', x: 0, y: 4, w: 1, h: 1, run: async (c) => c.teleport('c1_sacristy', 12.4, 5.5, 'left') },
  {
    id: 'sac_exit', map: 'c1_sacristy', x: 13, y: 5, w: 1, h: 1,
    async run(c) {
      if (!c.flag('sacristyOpen')) {
        c.setFlag('sacristyOpen'); c.patch('c1_nave', 0, 4, 'o', 'L');
        await c.say('', 'You draw back the old bolt on the inside. Now the door will open from the nave in either world.');
        c.log('Unbolted the sacristy door from the inside.');
      }
      c.teleport('c1_nave', 1.5, 4.5, 'right');
    },
  },
  { id: 'stair_up', map: 'c1_sacristy', x: 7, y: 0, w: 1, h: 1, when: (c) => c.flag('cabinetOpen'), run: async (c) => c.teleport('c1_belfry', 7.5, 10, 'up') },
  { id: 'stair_down', map: 'c1_belfry', x: 7, y: 11, w: 1, h: 1, run: async (c) => c.teleport('c1_sacristy', 7.5, 1.7, 'down') },
];

// ------------------------------------------------------------------ objectives and hints
export function objective(s) {
  const f = s.flags;
  if (f.ch1Done) return 'Chapter complete.';
  if (!f.hasBell) return 'Something is glinting by the road. Find it.';
  if (!f.enteredYard) return 'Reach the chapel. The gate is chained, but you saw it standing open.';
  if (!f.chapelOpen) return 'Open the chapel doors. Listen in the Veil, then try them in the living world.';
  if (!f.metWatcher) return 'Cross the nave. One world has a beam in your way, the other a barrier.';
  if (!f.cabinetOpen) return f.sacristyOpen || f.sawLock ? 'Open the sacristy cabinet. Symbols seen in the Veil may help.' : 'Find a way into the sacristy. The door is only open in the Veil.';
  return 'Climb the hidden stair to the bell tower.';
}
export function hint(s) {
  const f = s.flags;
  if (!f.hasBell) return 'Walk toward the left along the road. Something is shining in the grass. Press E next to it.';
  if (!f.enteredYard) return 'Stand near the gate and press V to enter the Veil. Walk through the open gate, then press V again.';
  if (!f.chapelOpen) return 'Stand at the chapel doors in the Veil and press E to listen. Then repeat the notes (keys 1, 2, 3) in the living world.';
  if (!f.metWatcher) return 'A fallen beam blocks the aisle in the living world. Shift to the Veil to pass it. A ghostly barrier waits further on. Shift back to pass that one.';
  if (!f.sacristyOpen && !f.cabinetOpen) return 'The sacristy door in the left wall is open in the Veil. Shift, walk through, then shift back if you need to touch anything.';
  if (!f.cabinetOpen) return 'In the Veil, three pews glow with marks: front, middle, back. Set the cabinet dials to match, in that order.';
  return 'Go through the opened cabinet and climb the stair. In the tower, speak with the figure in the Veil.';
}
