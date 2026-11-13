/* THE VEIL: game logic with no Phaser and no DOM. The scene, the UI and the tests all use this one object, so what is checked is what is played.
   Chapter 1 state lives in one validated object (see STATE_SCHEMA). All content is GAME MATERIAL. */
(function (root) {
  'use strict';
  var HOG = root.HOG, V = root.HOG_VEIL = root.HOG_VEIL || {}, D = V.data, S = HOG.schema;

  var BEATS = [
    { k: 'open', n: 'Opening', p: 'Start with a moment that pulls the reader in. Where is your character, and what is wrong?' },
    { k: 'setting', n: 'Setting', p: 'Describe your haunted place using at least three senses.' },
    { k: 'char', n: 'Main character', p: 'Who are they? What do they want, and what are they afraid of?' },
    { k: 'myst', n: 'Central mystery', p: 'What strange thing is happening, and what do people believe is causing it?' },
    { k: 'clue', n: 'Clues and foreshadowing', p: 'Plant two details early that will matter later.' },
    { k: 'tens', n: 'Suspense and tension', p: 'Write the scene where the danger gets closer. Use short sentences.' },
    { k: 'conf', n: 'Conflict', p: 'Who or what stands in your character’s way?' },
    { k: 'clim', n: 'Climax', p: 'The moment everything comes to a head.' },
    { k: 'res', n: 'Resolution or cliffhanger', p: 'Finish the story, or end on a question the reader cannot shake. Remember: the strange thing is observed and investigated, never summoned.' }
  ];
  var MIN = { note1: 10, note2: 40, why: 25, beat: 15, story: 150 };

  var STATE_SCHEMA = S.obj({
    world: S.en(['L', 'E']), px: S.int(0, 39), py: S.int(0, 21), bell: S.bool(), shifts: S.int(0, 99999), found: S.arr(S.str(20), 40),
    doors: S.bool(), cabinet: S.bool(), scene: S.bool(), bellTries: S.int(0, 9999), symTries: S.int(0, 9999),
    pick: S.str(8), cites: S.arr(S.str(20), 2), caseDone: S.bool(), beats: S.arr(S.str(12), 9), done: S.bool()
  });
  function words(t) { t = String(t || '').trim(); return t ? t.split(/\s+/).length : 0; }

  function freshRecord(variant, name) {
    var seed = HOG.seed.of(variant, name), now = Date.now();
    return { v: 1, game: 'veil', variant: variant, seed: String(seed), name: String(name).trim().slice(0, 24), created: now, updated: now,
      state: { world: 'L', px: D.START.x, py: D.START.y, bell: false, shifts: 0, found: [], doors: false, cabinet: false, scene: false, bellTries: 0, symTries: 0, pick: '', cites: [], caseDone: false, beats: [], done: false }, writing: {} };
  }

  function Game(rec, saves) {
    var self = this; self.rec = rec; self.s = rec.state; self.d = D.build(rec.variant, rec.name); self.map = D.buildMap(self.d.seed); self.saves = saves; self.hooks = {};
    self.ents = D.ENTITIES.map(function (e) { return Object.assign({}, e); });
  }
  var G = Game.prototype;
  G.save = function () { if (this.saves) this.saves.save(this.rec.variant, this.rec); };
  G.on = function (k, fn) { this.hooks[k] = fn; };
  G.emit = function (k, a) { if (this.hooks[k]) this.hooks[k](a); };
  G.hasClue = function (id) { return this.s.found.indexOf(id) >= 0; };
  G.addClue = function (id) { if (!this.d.clues[id] || this.hasClue(id)) return false; this.s.found.push(id); this.emit('clue', id); this.save(); return true; };
  G.clue = function (id) { return this.d.clues[id]; };
  G.writing = function (k) { return this.rec.writing[k] || ''; };
  G.write = function (k, t) { this.rec.writing[k] = String(t).slice(0, 8000); this.save(); };

  /* ----- the world ----- */
  G.visible = function (e, world) {
    world = world || this.s.world; if (e.w !== 'B' && e.w !== world) return false; if (e.id === 'bell' && this.s.bell) return false; return true;
  };
  G.tileSolid = function (tx, ty, world) {
    world = world || this.s.world;
    if (tx < 0 || ty < 0 || tx >= D.MW || ty >= D.MH) return true;
    var t = this.map[ty][tx];
    if (t === 'G') return world === 'L';                /* the gate is chained in the Living World and open in the Echo */
    if (t === 'S') return world === 'L';                /* so is the sacristy door */
    if (t === 'D') return !this.s.doors;                /* the chapel doors open for good once the bell puzzle is solved */
    if (D.SOLID[t]) return true;
    for (var i = 0; i < this.ents.length; i++) { var e = this.ents[i]; if (e.solid && e.x === tx && e.y === ty && this.visible(e, world)) return true; }
    return false;
  };
  /* nearest thing the player can use: within one tile (including diagonals) of its tile */
  G.nearest = function (tx, ty) {
    var best = null, bd = 99;
    for (var i = 0; i < this.ents.length; i++) {
      var e = this.ents[i]; if (!this.visible(e)) continue;
      var w = e.w2 || 1, dx = Math.max(e.x - tx, 0, tx - (e.x + w - 1)), dy = Math.abs(e.y - ty), d = Math.max(dx, dy);
      if (d <= 1 && d < bd) { best = e; bd = d; }
    }
    return best;
  };
  G.canShift = function () { return this.s.bell; };
  G.shift = function () {
    if (!this.s.bell) return { msg: 'You need something to hold on to first. Look for a small brass bell near the road.' };
    this.s.world = this.s.world === 'L' ? 'E' : 'L'; this.s.shifts++;
    var moved = false;
    if (this.s.world === 'L' && this.s.px >= 25) { this.s.px = 24; this.s.py = 7; moved = true; } /* never leave the player locked in the sacristy */
    if (this.s.world === 'E') this.addClue('bellSeq');
    this.save(); this.emit('shift', { world: this.s.world, moved: moved });
    return { ok: true, world: this.s.world, moved: moved };
  };
  G.setPos = function (tx, ty) { this.s.px = tx; this.s.py = ty; };

  /* ----- interactions: return what the UI should open ----- */
  G.interact = function (e) {
    var s = this.s, w = s.world;
    switch (e.id) {
      case 'bell': s.bell = true; this.addClue('bell'); this.save(); return { open: 'clue', id: 'bell', after: 'note1' };
      case 'notice': this.addClue(w === 'L' ? 'notice' : 'noticeEcho'); return { open: 'clue', id: w === 'L' ? 'notice' : 'noticeEcho' };
      case 'gate': if (w === 'L') { this.addClue('chain'); return { open: 'clue', id: 'chain' }; } return { msg: 'In the Echo, the gate stands open.' };
      case 'plates': this.addClue('plates'); return s.doors ? { msg: 'The chapel doors stand open.' } : { open: 'plates' };
      case 'pewFront': case 'pewMiddle': case 'pewBack': this.addClue(e.id); return { open: 'clue', id: e.id };
      case 'figure': this.addClue('figure'); return { open: 'clue', id: 'figure' };
      case 'cabinet': this.addClue('lock'); return s.cabinet ? { msg: 'The cabinet is open. The ledger and the letter are in your Evidence Archive.' } : { open: 'cabinet' };
      case 'photo': this.addClue('photo'); return { open: 'clue', id: 'photo' };
      case 'register': this.addClue('register'); return { open: 'clue', id: 'register' };
      case 'sacDoor': this.addClue('sacDoor'); return { open: 'clue', id: 'sacDoor' };
      case 'echoScene': { var first = !s.scene; s.scene = true; this.addClue('echo'); this.save(); return { open: 'scene', id: 'echo', first: first }; }
    }
    return { msg: 'Nothing here.' };
  };
  G.tryBell = function (seq) {
    if (this.d.checkBell(seq)) { this.s.doors = true; this.save(); this.emit('doors'); return { ok: true }; }
    this.s.bellTries++; this.save();
    return { ok: false, hint: this.s.bellTries >= 3 ? (this.hasClue('bellSeq') ? 'Check your Evidence Archive: the Echo’s bell pattern is written there.' : 'Something rings at these doors in the Echo. Shift worlds and listen, or read the captions.') : '' };
  };
  G.trySymbols = function (dials) {
    if (this.d.checkSymbols(dials)) { this.s.cabinet = true; this.addClue('ledger'); this.addClue('letter'); this.save(); this.emit('cabinet'); return { ok: true }; }
    this.s.symTries++; this.save();
    return { ok: false, hint: this.s.symTries >= 3 ? 'The scratched note says to read the pews from the altar to the door. Have you seen all three pews in the Echo?' : '' };
  };
  G.caseReady = function () { return this.s.cabinet && this.s.scene && words(this.writing('note2')) >= MIN.note2; };
  G.caseBlock = function () {
    if (!this.s.cabinet) return 'You have not opened the cabinet yet.'; if (!this.s.scene) return 'You have not watched the Echo in the sacristy yet.';
    if (words(this.writing('note2')) < MIN.note2) return 'Write your Echo field note first (about ' + MIN.note2 + ' words).'; return '';
  };
  G.submitCase = function (pick, cites, why) {
    if (words(why) < MIN.why) return { ok: false, msg: 'Explain your choice in at least ' + MIN.why + ' words.' };
    if (cites.length !== 2) return { ok: false, msg: 'Choose exactly two clues that show what the bell was for.' };
    var r = this.d.checkCase(pick, cites);
    this.s.pick = pick; this.s.cites = cites.slice(0, 2); this.write('why', why);
    if (!r.right) { this.save(); return { ok: false, msg: 'Not quite. Look again at what the Keeper wrote down and at what the Echo showed. What was the bell doing that night?' }; }
    if (!r.cited) { this.save(); return { ok: false, msg: 'Your answer is right, but one of your two clues does not show what the bell was for. Which documents or scenes say it directly?' }; }
    this.s.caseDone = true; this.save(); this.emit('case'); return { ok: true };
  };
  G.beatDone = function (k) { return this.s.beats.indexOf(k) >= 0; };
  G.saveBeat = function (k, text) {
    if (words(text) < MIN.beat) return { ok: false, msg: 'Write at least ' + MIN.beat + ' words for this beat.' };
    this.write('b_' + k, text); if (!this.beatDone(k)) this.s.beats.push(k); this.save(); return { ok: true };
  };
  G.storyWords = function () { var n = 0, self = this; BEATS.forEach(function (b) { n += words(self.writing('b_' + b.k)); }); return n; };
  G.storyText = function () {
    var self = this, t = (self.writing('title') || 'Untitled') + '\n' + 'The Veil · ' + self.rec.name + '\n\n';
    BEATS.forEach(function (b) { var x = self.writing('b_' + b.k); if (x) t += x + '\n\n'; }); return t.trim() + '\n';
  };
  G.storyReady = function () { return this.s.beats.length === 9 && this.storyWords() >= MIN.story; };
  G.finishStory = function () { if (!this.storyReady() || this.s.done) return this.s.done; this.s.done = true; this.save(); this.emit('story'); return true; };
  /* the full written record a student can copy or download (the case number is never shown) */
  G.reportText = function () {
    var self = this, d = self.d, t = 'THE VEIL, Chapter 1: The Keeper’s Bell\nInvestigator: ' + self.rec.name + '\nGame material (fiction): ' + d.chapel + ', ' + d.place + '.\n\n';
    if (self.writing('note1')) t += 'FIELD NOTE 1 (the churchyard)\n' + self.writing('note1') + '\n\n';
    if (self.writing('note2')) t += 'FIELD NOTE 2 (the Echo)\n' + self.writing('note2') + '\n\n';
    if (self.s.pick) t += 'CASE FILE\nMy answer: ' + (D.OPTIONS[self.s.pick] || '') + '\nClues I cited: ' + self.s.cites.map(function (c) { return d.clues[c] ? d.clues[c].title : c; }).join('; ') + '\nWhy: ' + self.writing('why') + '\nResult: ' + (self.s.caseDone ? 'case closed' : 'not yet') + '\n\n';
    t += 'EVIDENCE FOUND (' + self.s.found.length + ')\n' + self.s.found.map(function (c) { return '- ' + (d.clues[c] ? d.clues[c].title : c); }).join('\n') + '\n';
    if (self.s.beats.length) t += '\nSTORY\n' + self.storyText();
    return t;
  };
  G.objective = function () {
    var s = this.s;
    if (!s.bell) return 'Find the Keeper’s Bell on the road, near the start.';
    if (s.shifts === 0) return 'Hold the bell and shift worlds: press V, or tap the Veil button.';
    if (!s.doors) return 'Listen in the Echo, then strike the bell plates by the chapel doors.';
    if (!s.cabinet) return 'Inside: read the pew marks in the Echo, then open the cabinet by the altar in the Living World.';
    if (!s.scene) return 'The sacristy door is open in the Echo. Go in and watch what happened.';
    if (!this.caseReady()) return 'Write your field note about the Echo (open Journal), then open the Case File.';
    if (!s.caseDone) return 'Open the Case File: why did the Keeper ring the bell?';
    if (!s.done) return 'Chapter solved! Write your own horror story in the Story Workshop.';
    return 'Chapter 1 complete. Well done.';
  };

  /* ----- reachability (used by tests: every needed thing can be reached from the start in the world it needs) ----- */
  G.reach = function (world, doors) {
    var saveD = this.s.doors, self = this; this.s.doors = !!doors;
    var seen = {}, q = [[D.START.x, D.START.y]]; seen[D.START.x + ',' + D.START.y] = 1;
    while (q.length) { var c = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var x = c[0] + d[0], y = c[1] + d[1], k = x + ',' + y; if (!seen[k] && !self.tileSolid(x, y, world)) { seen[k] = 1; q.push([x, y]); } }); }
    this.s.doors = saveD; return seen;
  };
  /* can the player stand within one tile of this thing (same rule as nearest())? */
  G.usable = function (e, world, doors) {
    var seen = this.reach(world, doors), w = e.w2 || 1, ks = Object.keys(seen);
    for (var i = 0; i < ks.length; i++) { var p = ks[i].split(','), tx = +p[0], ty = +p[1]; var dx = Math.max(e.x - tx, 0, tx - (e.x + w - 1)), dy = Math.abs(e.y - ty); if (Math.max(dx, dy) <= 1) return true; }
    return false;
  };

  V.logic = { Game: Game, fresh: freshRecord, STATE_SCHEMA: STATE_SCHEMA, BEATS: BEATS, MIN: MIN, words: words };
})(typeof window !== 'undefined' ? window : globalThis);
