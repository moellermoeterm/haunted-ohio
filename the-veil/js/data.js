/* THE VEIL, Chapter 1: "The Keeper's Bell". Data only: six variants, seeded puzzle data, clues, the map.
   EVERYTHING here is GAME MATERIAL (fiction). Names, chapels and places are invented; any resemblance to real people or parishes is coincidental.
   Nothing is presented as Real history. Every puzzle answer is computed in build() from the same seeded values the game checks against. */
(function (root) {
  'use strict';
  var HOG = root.HOG, V = root.HOG_VEIL = root.HOG_VEIL || {};

  var NOTES = ['LOW', 'MIDDLE', 'HIGH'], NOTE_F = { LOW: 262, MIDDLE: 392, HIGH: 523 };
  var SYMBOLS = ['star', 'flame', 'tower'], SYM_NAME = { star: 'a star', flame: 'a flame', tower: 'a tower' };
  var PEWS = ['front', 'middle', 'back'];

  /* one record per case code */
  var CASES = {
    1: { chapel: 'Saint Aurelian', keeper: 'Thomas Rourke', place: 'Harlow Crossing', truth: 'guide',
      night: 'a night of thick fog on the river road', weather: 'fog',
      ledger: 'Rang every quarter hour from dusk. The fog was too thick to see the lantern at the gate. Two wagons found the road by the sound. The last one reached the door near midnight.',
      letter: 'To whoever finds this: if you can hear the bell, keep walking toward it. The road bends where the sound is loudest. I will ring until the last lamp comes in.',
      echo: ['Fog presses against the chapel windows.', '{keeper} stands at the door with the bell and rings it slowly, again and again.', 'Out on the road, small lamps wobble closer, one at a time.', 'Each traveler who arrives is handed a blanket and a place by the stove.'] },
    2: { chapel: 'Saint Odile', keeper: 'Clara Hennessy', place: 'Pell Creek Bottom', truth: 'warn',
      night: 'a night of rising water in the creek', weather: 'rain',
      ledger: 'Rang without stopping from the first rise of the creek. Sent the boy to the farms by the low road to say the water was coming. By dawn the creek had covered the low road.',
      letter: 'To whoever finds this: if you hear the bell ring without stopping, do not wait for the water to reach your door. Take the children and walk uphill.',
      echo: ['Rain hammers the chapel roof.', '{keeper} rings the bell without pausing, long after her arms must ache.', 'A boy runs out into the dark with a lantern, toward the farms by the low road.', 'By the window, the creek is already spilling over the bank.'] },
    3: { chapel: 'Saint Brigid', keeper: 'August Lindqvist', place: 'Ketter Ridge', truth: 'guide',
      night: 'a blizzard that closed the roads', weather: 'snow',
      ledger: 'Rang the long note every quarter hour all night. The snow was too deep to see the fence. Four sleighs found the ridge road by the sound.',
      letter: 'To whoever finds this: in a storm like that one, a voice is lost but a bell carries. Stand still, listen, and walk toward the sound. Do not leave the road.',
      echo: ['Snow drives against the door.', '{keeper} stamps his boots, takes the bell and rings the long note into the white dark.', 'One by one, bundled shapes appear out of the storm, following the sound.', 'He counts each one in and sets the kettle on the stove.'] },
    4: { chapel: 'Saint Colman', keeper: 'Rosa Delgado', place: 'Tallgrass Bend', truth: 'warn',
      night: 'a dry autumn night when a grass fire ran toward the farms', weather: 'smoke',
      ledger: 'Rang the alarm pattern until my arms gave out. The wind turned the fire along the creek bed. The farms on the east road were empty by dawn, and everyone was counted.',
      letter: 'To whoever finds this: when the bell rings fast and hard, it is not for Mass. Leave the barns, take the animals if you can, and go to the creek road.',
      echo: ['An orange glow flickers beyond the windows.', '{keeper} rings the bell fast and hard, the alarm everyone in the valley knows.', 'Doors open down the road. Lanterns swing as families hurry toward the creek.', 'The glow turns slowly away from the farms.'] },
    5: { chapel: 'Saint Aldric', keeper: 'Walter Pruitt', place: 'Marlin Fork', truth: 'gather',
      night: 'a night when a storm wind lifted the roof off the schoolhouse', weather: 'wind',
      ledger: 'Rang the long call. By midnight the stone chapel held forty-one people, and the school children slept under the pews with coats for blankets.',
      letter: 'To whoever finds this: the chapel is stone and it will stand. If the long call sounds, come inside, all of you. There is room for everyone.',
      echo: ['Wind shrieks around the stone walls.', '{keeper} rings the long call, one slow note after another.', 'Families push in through the doors with children in their arms.', 'The pews fill, and then the floor, and the noise outside turns small.'] },
    6: { chapel: 'Saint Perpetua', keeper: 'Nora Kincaid', place: 'Quarry Pond', truth: 'gather',
      night: 'a night when the ice on the pond began to break', weather: 'ice',
      ledger: 'Rang the long call to bring the skaters in off the ice. Counted everyone in by lantern. All accounted for by ten.',
      letter: 'To whoever finds this: when you hear the long call, leave the pond at once and come to the chapel. Do not stop for skates. We will count everyone in.',
      echo: ['Far off, the ice on the pond groans and cracks.', '{keeper} rings the long call from the chapel door.', 'Skaters hurry up the bank in a ragged line, skates slung over their shoulders.', 'She counts them in by lantern, and then counts again.'] }
  };

  var OPTIONS = {
    guide: 'The Keeper rang the bell to help lost travelers find their way to the chapel.',
    warn: 'The Keeper rang the bell to warn people that danger was coming.',
    gather: 'The Keeper rang the bell to gather everyone into the chapel to be safe.'
  };
  var SUPPORT = ['ledger', 'letter', 'echo']; /* the three clues that actually show what the bell was for */

  function fill(s, c) { return String(s).replace(/\{keeper\}/g, c.keeper).replace(/\{chapel\}/g, c.chapel).replace(/\{place\}/g, c.place); }

  /* build everything a variant needs from (variant, name). Pure and deterministic. */
  function build(variant, name) {
    var seed = HOG.seed.of(variant, name), c = CASES[variant], S = HOG.seed;
    var bell = null;
    for (var t = 0; t < 20 && !bell; t++) { var b = []; for (var i = 0; i < 4; i++) b.push(S.pick(NOTES, seed, 'bell' + t + '_' + i)); if (!(b[0] === b[1] && b[1] === b[2] && b[2] === b[3])) bell = b; }
    if (!bell) bell = ['LOW', 'MIDDLE', 'HIGH', 'MIDDLE'];
    var pews = S.shuffle(SYMBOLS, seed, 'pews');            /* pews[0] = symbol on the FRONT pew, [1] middle, [2] back */
    var rings = S.int(seed, 'rings', 31, 59), page = S.int(seed, 'page', 12, 87), sheltered = S.int(seed, 'sheltered', 23, 48);
    var optionOrder = S.shuffle(['guide', 'warn', 'gather'], seed, 'options');
    var bellWords = bell.join(', ');
    var clues = {
      notice: { title: 'Township notice', cat: 'Document', world: 'Living', body: fill('POSTED BY ORDER OF THE TOWNSHIP TRUSTEES: {chapel} Chapel is closed to the public. The structure is unsafe. Demolition is pending a final vote.\n\nSomeone has written across the bottom in pencil, pressing hard: "The bell was not the problem."', c) },
      chain: { title: 'The chained gate', cat: 'Observation', world: 'Living', body: 'The churchyard gate is wrapped in a heavy chain and the padlock is fused with rust. It has not been opened in years. But the gate you saw while holding the bell was standing open.' },
      noticeEcho: { title: 'Notice board (the Echo)', cat: 'Document', world: 'Echo', body: fill('In the Echo the board reads, in fresh paint: "The bell of {chapel} is rung at dusk, and whenever the road is unsafe. All are welcome inside. \u2014 {keeper}"', c) },
      bell: { title: 'The Keeper’s Bell', cat: 'Object', world: 'Both', body: fill('A small brass hand bell, green at the edges. Scratched inside the rim: "' + c.keeper + ', Keeper." When you hold it, the world seems to lean a little closer. (Press V, or the Veil button, to shift between the Living World and the Echo.)', c) },
      bellSeq: { title: 'Bell pattern at the chapel doors', cat: 'Sound (captioned)', world: 'Echo', body: 'In the Echo, a bell tolls at the chapel doors in a pattern of four notes: ' + bellWords + '. Three bell plates are set into the doors in the Living World. They look made to be struck.' },
      plates: { title: 'Bell plates on the doors', cat: 'Observation', world: 'Both', body: 'Three brass plates are set into the chapel doors: LOW, MIDDLE and HIGH. Each one rings when struck. The doors are shut tight.' },
      pewFront: { title: 'Glowing mark: front pew', cat: 'Symbol', world: 'Echo', body: 'In the Echo, ' + SYM_NAME[pews[0]] + ' glows on the end of the FRONT pew, the one closest to the altar.' },
      pewMiddle: { title: 'Glowing mark: middle pew', cat: 'Symbol', world: 'Echo', body: 'In the Echo, ' + SYM_NAME[pews[1]] + ' glows on the end of the MIDDLE pew.' },
      pewBack: { title: 'Glowing mark: back pew', cat: 'Symbol', world: 'Echo', body: 'In the Echo, ' + SYM_NAME[pews[2]] + ' glows on the end of the BACK pew, the one nearest the doors.' },
      lock: { title: 'The cabinet lock', cat: 'Observation', world: 'Living', body: 'A tall cabinet beside the altar is locked with three dials. Each dial shows a star, a flame or a tower. Scratched beside it, in a careful hand: "Read the pews from the altar to the door."' },
      figure: { title: 'A figure by the altar', cat: 'Observation', world: 'Echo', body: 'In the Echo, a tall, still figure stands by the altar. It does not speak and it does not look at you. It points toward the wall where the sacristy door is. In the Living World, that door is locked. This is something you are watching, not someone you are talking to.' },
      sacDoor: { title: 'The sacristy door', cat: 'Observation', world: 'Both', body: 'In the Living World the sacristy door is locked. In the Echo it stands open. Doors do not always agree between the two worlds.' },
      register: { title: 'Burial register, page ' + page, cat: 'Document', world: 'Living', body: fill('A register left open on a table. Page ' + page + ' lists ' + sheltered + ' names written in one careful hand, each one marked "sheltered" with a date. Below them a different hand has added a single line: "Chapel closed. Keeper dismissed." The note does not say why.', c) },
      photo: { title: 'Photograph of the Keeper', cat: 'Photograph', world: 'Living', body: fill('A faded photograph propped on the altar rail. A person in work clothes stands at the chapel door holding a small hand bell. Written on the back: "{keeper}, Keeper of {chapel}."', c) },
      ledger: { title: 'The Keeper’s Ledger', cat: 'Document', world: 'Living', body: fill('A narrow ledger of bell-ringing times. The last page reads:\n\n"' + c.ledger + ' Total: ' + rings + ' rings."\n\nUnder it, in the same hand: "I would do it again."', c) },
      letter: { title: 'A letter in the cabinet', cat: 'Document', world: 'Living', body: fill('A letter signed by {keeper}, water-stained but readable:\n\n"' + c.letter + '"', c) },
      echo: { title: 'The Echo of the night', cat: 'Echo scene', world: 'Echo', body: c.echo.map(function (l) { return fill(l, c); }).join('\n') + '\n\nYou only watched. Nothing here answered you, and you did not try to make it.' }
    };
    var options = optionOrder.map(function (k) { return { id: k, text: OPTIONS[k] }; });
    return {
      variant: variant, seed: seed, c: c, chapel: c.chapel, keeper: c.keeper, place: c.place, night: c.night, truth: c.truth,
      bell: bell, bellNotes: NOTES, noteF: NOTE_F, pews: pews, pewNames: PEWS, symbols: SYMBOLS, symName: SYM_NAME,
      clues: clues, options: options, support: SUPPORT, rings: rings, page: page, sheltered: sheltered,
      /* the checks: both use the same arrays the world was built from */
      checkBell: function (seq) { return seq.length === bell.length && seq.every(function (n, i) { return n === bell[i]; }); },
      checkSymbols: function (dials) { return dials.length === 3 && dials.every(function (s, i) { return s === pews[i]; }); },
      checkCase: function (pick, cites) { var ok = pick === c.truth, good = cites.filter(function (x) { return SUPPORT.indexOf(x) >= 0; }); return { right: ok, cited: good.length >= 2 && cites.length === 2 && ok, supported: good.length }; }
    };
  }

  /* ---------- the map: 40 x 22 tiles of 32 px, shared by both worlds ----------
     . grass  , road  p path  T tree  F fence  G gate  # chapel wall  f chapel floor  D chapel doors  S sacristy door  b pew  a altar  g gravestone */
  var TW = 32, MW = 40, MH = 22;
  function buildMap(seed) {
    var g = []; for (var y = 0; y < MH; y++) { g.push([]); for (var x = 0; x < MW; x++) g[y].push('.'); }
    function rect(x0, y0, x1, y1, t) { for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) g[y][x] = t; }
    rect(1, 18, 38, 20, ','); rect(16, 17, 17, 17, 'p'); rect(16, 14, 17, 15, 'p');
    rect(3, 16, 36, 16, 'F'); rect(16, 16, 17, 16, 'G');
    rect(8, 2, 31, 13, '#'); rect(9, 3, 24, 12, 'f'); rect(26, 3, 30, 12, 'f'); rect(16, 13, 17, 13, 'D'); g[7][25] = 'S';
    rect(15, 3, 18, 3, 'a');
    [6, 8, 10].forEach(function (r) { rect(10, r, 14, r, 'b'); rect(19, r, 23, r, 'b'); });
    for (var x = 0; x < MW; x++) { g[0][x] = 'T'; g[MH - 1][x] = 'T'; } for (var y = 0; y < MH; y++) { g[y][0] = 'T'; g[y][MW - 1] = 'T'; }
    var r = HOG.seed.rng(seed, 'graves'), placed = 0, tries = 0;
    while (placed < 18 && tries++ < 400) { var gx = 1 + Math.floor(r() * 38), gy = 2 + Math.floor(r() * 13); if (g[gy][gx] === '.' && (gx < 7 || gx > 32) && gy < 15) { g[gy][gx] = 'g'; placed++; } }
    return g;
  }
  var SOLID = { T: 1, F: 1, G: 1, '#': 1, D: 1, S: 1, b: 1, a: 1, g: 1 };

  /* interactive things. at = tile; solid blocks walking; w = which world it exists in ('L', 'E', 'B' both) */
  var ENTITIES = [
    { id: 'bell', x: 10, y: 19, w: 'B', solid: false, label: 'Pick up the bell', kind: 'bell' },
    { id: 'notice', x: 14, y: 17, w: 'B', solid: true, label: 'Read the notice', kind: 'board' },
    { id: 'gate', x: 16, y: 16, w: 'B', solid: false, label: 'Look at the gate', kind: 'gate', w2: 2 },
    { id: 'plates', x: 14, y: 14, w: 'B', solid: true, label: 'Strike the bell plates', kind: 'plates' },
    { id: 'pewFront', x: 15, y: 6, w: 'E', solid: false, label: 'Look at the front pew', kind: 'mark' },
    { id: 'pewMiddle', x: 15, y: 8, w: 'E', solid: false, label: 'Look at the middle pew', kind: 'mark' },
    { id: 'pewBack', x: 15, y: 10, w: 'E', solid: false, label: 'Look at the back pew', kind: 'mark' },
    { id: 'figure', x: 17, y: 5, w: 'E', solid: true, label: 'Watch the figure', kind: 'figure' },
    { id: 'cabinet', x: 9, y: 4, w: 'L', solid: true, label: 'Try the cabinet lock', kind: 'cabinet' },
    { id: 'photo', x: 14, y: 3, w: 'L', solid: true, label: 'Look at the photograph', kind: 'photo' },
    { id: 'register', x: 23, y: 11, w: 'L', solid: true, label: 'Read the register', kind: 'register' },
    { id: 'sacDoor', x: 24, y: 7, w: 'B', solid: false, label: 'Try the sacristy door', kind: 'sac' },
    { id: 'echoScene', x: 28, y: 6, w: 'E', solid: false, label: 'Watch the Echo', kind: 'scene' }
  ];
  var START = { x: 16, y: 19 };

  V.data = { CASES: CASES, build: build, buildMap: buildMap, SOLID: SOLID, ENTITIES: ENTITIES, START: START, TW: TW, MW: MW, MH: MH, NOTES: NOTES, SYMBOLS: SYMBOLS, PEWS: PEWS, OPTIONS: OPTIONS, SUPPORT: SUPPORT };
})(typeof window !== 'undefined' ? window : globalThis);
