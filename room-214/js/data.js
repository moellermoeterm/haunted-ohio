/* ROOM 214: data. Six variants, three floors built from one template, seeded item placement, notes and the safe code.
   EVERYTHING is GAME MATERIAL (fiction): hotels, people and events are invented; any resemblance to real ones is coincidental.
   Nothing is Real history. Nobody is harmed in this game: being caught means being "checked out" to the last checkpoint. */
(function (root) {
  'use strict';
  var HOG = root.HOG, R = root.HOG_R214 = root.HOG_R214 || {};
  var W = 40, H = 22, TW = 32;

  var CASES = {
    1: { hotel: 'Hotel Marigold', porter: 'the Night Porter', guest: 'a violin case', tag: 'A. Whitlow', town: 'Cedar Hollow' },
    2: { hotel: 'The Larkspur', porter: 'the Night Porter', guest: 'a child’s red scarf', tag: 'M. Okonkwo', town: 'Fairmont Rise' },
    3: { hotel: 'Hotel Corvina', porter: 'the Night Porter', guest: 'a brass camera', tag: 'R. Delacroix', town: 'Willow Bend' },
    4: { hotel: 'The Alder Arms', porter: 'the Night Porter', guest: 'a stack of letters tied with string', tag: 'T. Hargrove', town: 'Marsh Landing' },
    5: { hotel: 'Hotel Tamsin', porter: 'the Night Porter', guest: 'a patched travelling coat', tag: 'S. Almeida', town: 'Orchard Gap' },
    6: { hotel: 'The Westerly', porter: 'the Night Porter', guest: 'a wind-up music box', tag: 'P. Nakamura', town: 'Stone Ferry' }
  };

  /* ----- geometry shared by all three floors ----- */
  var TOP = [[7, 12], [14, 19], [21, 26], [28, 33]];
  function rooms() {
    var out = [], i;
    TOP.forEach(function (s, k) { out.push({ id: 't' + k, kind: 'top', x0: s[0], x1: s[1], y0: 1, y1: 3, door: [Math.round((s[0] + s[1]) / 2), 4], hide: [s[0], 1], spot: [Math.round((s[0] + s[1]) / 2), 2] }); });
    TOP.forEach(function (s, k) { out.push({ id: 'b' + k, kind: 'bottom', x0: s[0], x1: s[1], y0: 18, y1: 20, door: [Math.round((s[0] + s[1]) / 2), 17], hide: [s[1], 20], spot: [Math.round((s[0] + s[1]) / 2), 19] }); });
    out.push({ id: 'c0', kind: 'center', x0: 10, x1: 25, y0: 8, y1: 13, door: [14, 7], hide: [10, 8], hide2: [25, 13], spot: [18, 10] });
    return out;
  }
  var ROOMS = rooms();
  var WAYPOINTS = [[5, 5], [34, 5], [34, 15], [5, 15]];          /* ring corners (tile coords, centre of the corridor) */
  var STAIRS = { L: { door: [3, 10], up: [2, 9], down: [2, 12] }, R: { door: [36, 10], up: [37, 9], down: [37, 12] } };
  var EXIT = [4, 17], START = [5, 16], SAFE = [18, 11], R214 = { x0: 27, x1: 29, y0: 9, y1: 12, secret: [26, 10], spot: [28, 10] };

  /* the template, as characters:  # wall  . floor  d door  h hiding spot  u stairs up  v stairs down  X exit  x secret door (looks like wall)  s safe */
  function buildFloor(f) {
    var g = [], x, y; for (y = 0; y < H; y++) { g.push([]); for (x = 0; x < W; x++) g[y].push('#'); }
    function rect(x0, y0, x1, y1, t) { for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) g[yy][xx] = t; }
    rect(4, 5, 35, 6, '.'); rect(4, 15, 35, 16, '.'); rect(4, 5, 5, 16, '.'); rect(34, 5, 35, 16, '.');
    ROOMS.forEach(function (r) { rect(r.x0, r.y0, r.x1, r.y1, '.'); g[r.door[1]][r.door[0]] = 'd'; g[r.hide[1]][r.hide[0]] = 'h'; });
    g[7][22] = 'd'; g[14][14] = 'd'; g[14][22] = 'd'; g[13][25] = 'h';
    rect(R214.x0, R214.y0, R214.x1, R214.y1, '.'); g[R214.secret[1]][R214.secret[0]] = 'x';
    ['L', 'R'].forEach(function (k) { var s = STAIRS[k], x0 = k === 'L' ? 1 : 37; rect(x0, 9, x0 + 1, 12, '.'); g[s.door[1]][s.door[0]] = 'd'; if (f < 2) g[s.up[1]][s.up[0]] = 'u'; if (f > 0) g[s.down[1]][s.down[0]] = 'v'; });
    g[EXIT[1]][EXIT[0]] = f === 0 ? 'X' : '#';
    g[SAFE[1]][SAFE[0]] = f === 1 ? 's' : g[SAFE[1]][SAFE[0]];
    return g;
  }
  var SOLID = { '#': 1, h: 1, x: 1, s: 1 };

  /* ----- build everything a variant needs from (variant, name). Pure and deterministic. ----- */
  function build(variant, name) {
    var S = HOG.seed, seed = S.of(variant, name), c = CASES[variant];
    var digits = [S.int(seed, 'd0', 1, 9), S.int(seed, 'd1', 0, 9), S.int(seed, 'd2', 1, 9)];   /* one on each floor; the safe on floor 2 takes all three, lobby, second, third */
    var floors = [buildFloor(0), buildFloor(1), buildFloor(2)];
    var spotsOf = function (f, tag) { return S.shuffle(ROOMS.filter(function (r) { return r.kind !== 'center'; }), seed, tag + f); };
    var items = [], used = {};
    function place(f, tag, id, kind, extra) { var list = spotsOf(f, tag + id), r = list.filter(function (x) { return !used[f + x.id]; })[0] || list[0]; used[f + r.id] = 1; items.push(Object.assign({ id: id, kind: kind, floor: f, x: r.spot[0], y: r.spot[1], room: r.id }, extra || {})); }
    /* cards: tier 1 in the lobby, tier 2 on floor 1; batteries and bells spread over all floors */
    place(0, 'card', 'card1', 'card', { tier: 1 }); place(1, 'card', 'card2', 'card', { tier: 2 });
    [[0, 'bat0'], [0, 'bat1'], [1, 'bat2'], [1, 'bat3'], [2, 'bat4'], [2, 'bat5']].forEach(function (b) { place(b[0], 'bat', b[1], 'battery'); });
    [[0, 'bell0'], [1, 'bell1'], [2, 'bell2']].forEach(function (b) { place(b[0], 'bell', b[1], 'bell'); });
    [0, 1, 2].forEach(function (f) { place(f, 'note', 'note' + f, 'note', { digit: digits[f] }); });
    items.push({ id: 'ledger', kind: 'ledger', floor: 1, x: R214.spot[0], y: R214.spot[1], room: 'r214' });
    var fill = function (s) { return String(s).replace(/\{hotel\}/g, c.hotel).replace(/\{guest\}/g, c.guest).replace(/\{tag\}/g, c.tag).replace(/\{town\}/g, c.town); };
    var NOTES = {
      note0: { title: 'The floor plan by the front desk', body: fill('{hotel}. Floors 1 to 3. Rooms 201 to 213 and 215 to 220 are marked on the plan. There is no Room 214 on the plan.\n\nA brass plaque screwed to the desk reads: "Lobby number: ' + digits[0] + '."') },
      note1: { title: 'A note under a door', body: fill('Written in pencil: "He walks the halls to be sure everyone is out before the doors lock. He is not angry. He is only very late. Do not run and he will not hurry. The second number is ' + digits[1] + '."') },
      note2: { title: 'A page from a housekeeping log', body: fill('"Third floor done. Everything left behind goes to the room that is not on the plan, so it can be given back. Third number: ' + digits[2] + '."') }
    };
    var ledger = { title: 'The Lost and Found ledger', body: fill('A tall ledger in careful handwriting. Page after page of names, each beside an item and a date long past: "{tag}: {guest}. To be returned." The last line has no date: "Everyone is out. The doors can lock now."\n\nShelves along the walls hold hundreds of forgotten things, each with a paper tag. Nothing here is broken. Everything is waiting.') };
    var seedPatrol = function (f) { return { dir: S.int(seed, 'dir' + f, 0, 1) ? 1 : -1, start: S.int(seed, 'start' + f, 0, 3), speed: 1.7 + S.int(seed, 'spd' + f, 0, 4) * 0.1, detour: S.int(seed, 'det' + f, 0, 1) }; };
    return {
      variant: variant, seed: seed, c: c, hotel: c.hotel, floors: floors, items: items, digits: digits, notes: NOTES, ledger: ledger, patrol: [seedPatrol(0), seedPatrol(1), seedPatrol(2)],
      checkSafe: function (code) { return code.length === 3 && code.every(function (d, i) { return d === digits[i]; }); }
    };
  }
  R.data = { CASES: CASES, build: build, ROOMS: ROOMS, WAYPOINTS: WAYPOINTS, STAIRS: STAIRS, EXIT: EXIT, START: START, SAFE: SAFE, R214: R214, SOLID: SOLID, W: W, H: H, TW: TW, buildFloor: buildFloor };
})(typeof window !== 'undefined' ? window : globalThis);
