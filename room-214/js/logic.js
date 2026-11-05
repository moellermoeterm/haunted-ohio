/* ROOM 214: game logic with no Phaser and no DOM (so the AI, noise and stealth rules can be tested headless and the scene only draws).
   The Night Porter's AI: patrol -> investigate (noise or light) -> chase (only while he has line of sight) -> search (checks nearby hiding spots) -> return.
   He never harms anyone. If he reaches you: "checked out" to the last checkpoint with every item kept. All content is GAME MATERIAL. */
(function (root) {
  'use strict';
  var HOG = root.HOG, R = root.HOG_R214 = root.HOG_R214 || {}, D = R.data, S = HOG.schema;
  var W = D.W, H = D.H;
  var SPEED = { sneak: 1.6, walk: 3.0, run: 5.0 }, NOISE = { sneak: 0, walk: 2, run: 6, door: 3, bell: 8, pick: 1 };
  var VIS = { light: 9, dark: 4, cone: Math.PI * 0.27, near: 1.4 };
  var MIN = { journal: 30, account: 80, seed: 60 };
  var STATE_SCHEMA = S.obj({
    floor: S.int(0, 2), px: S.int(0, W - 1), py: S.int(0, H - 1), cpf: S.int(0, 2), cpx: S.int(0, W - 1), cpy: S.int(0, H - 1),
    batt: S.int(0, 100), cards: S.int(0, 3), bells: S.int(0, 9), got: S.arr(S.str(12), 40), found: S.arr(S.str(12), 10), safe: S.bool(), ledger: S.bool(),
    caught: S.int(0, 9999), done: S.bool(), seen: S.arr(S.int(0, 2), 3)
  });
  function words(t) { t = String(t || '').trim(); return t ? t.split(/\s+/).length : 0; }
  function fresh(variant, name) {
    var seed = HOG.seed.of(variant, name), now = Date.now();
    return { v: 1, game: 'room214', variant: variant, seed: String(seed), name: String(name).trim().slice(0, 24), created: now, updated: now,
      state: { floor: 0, px: D.START[0], py: D.START[1], cpf: 0, cpx: D.START[0], cpy: D.START[1], batt: 100, cards: 0, bells: 0, got: [], found: [], safe: false, ledger: false, caught: 0, done: false, seen: [0] }, writing: {} };
  }

  function Game(rec, saves) {
    var self = this; self.rec = rec; self.s = rec.state; self.d = D.build(rec.variant, rec.name); self.saves = saves; self.hooks = {};
    self.t = 0; self.acc = 0; self.rings = []; self.lastNoise = -99; self.stepAcc = 0; self.doorT = 0; self.battAcc = 0; self.cueT = 0; self.breathT = 0;
    self.pl = { x: self.s.px + 0.5, y: self.s.py + 0.5, f: self.s.floor, hidden: false, spot: null, mode: 'walk', face: 0, light: self.s.batt > 0 };
    self.por = [0, 1, 2].map(function (f) { return self.newPorter(f); });
  }
  var G = Game.prototype;
  G.on = function (k, fn) { this.hooks[k] = fn; }; G.emit = function (k, a) { if (this.hooks[k]) this.hooks[k](a); };
  G.save = function () { var s = this.s; s.px = Math.floor(this.pl.x); s.py = Math.floor(this.pl.y); s.floor = this.pl.f; if (this.saves) this.saves.save(this.rec.variant, this.rec); };
  G.writing = function (k) { return this.rec.writing[k] || ''; }; G.write = function (k, t) { this.rec.writing[k] = String(t).slice(0, 8000); this.save(); };
  G.tile = function (f, x, y) { return x < 0 || y < 0 || x >= W || y >= H ? '#' : this.d.floors[f][y][x]; };
  G.solid = function (f, x, y) { var t = this.tile(f, x, y); if (t === 'x') return !this.s.safe; return !!D.SOLID[t]; };

  /* ----- pathfinding (tiles, 4-way) ----- */
  G.path = function (f, from, to) {
    var self = this, key = function (x, y) { return y * W + x; }, sx = Math.floor(from[0]), sy = Math.floor(from[1]), tx = Math.floor(to[0]), ty = Math.floor(to[1]), prev = {}, q = [[sx, sy]]; prev[key(sx, sy)] = -1;
    if (self.solid(f, tx, ty)) { var best = null; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { if (!best && !self.solid(f, tx + d[0], ty + d[1])) best = [tx + d[0], ty + d[1]]; }); if (!best) return []; tx = best[0]; ty = best[1]; }
    var qi = 0; while (qi < q.length) { var c = q[qi++]; if (c[0] === tx && c[1] === ty) break; for (var i = 0; i < 4; i++) { var d = [[1, 0], [-1, 0], [0, 1], [0, -1]][i], x = c[0] + d[0], y = c[1] + d[1], k = key(x, y); if (!(k in prev) && !self.solid(f, x, y)) { prev[k] = key(c[0], c[1]); q.push([x, y]); } } }
    if (!(key(tx, ty) in prev)) return []; var out = [], k2 = key(tx, ty); while (k2 !== -1) { out.unshift([k2 % W + 0.5, Math.floor(k2 / W) + 0.5]); k2 = prev[k2]; } out.shift(); return out;
  };

  /* ----- the Night Porter ----- */
  G.newPorter = function (f) {
    var p = this.d.patrol[f], wp = D.WAYPOINTS.map(function (w) { return [w[0] + 0.5, w[1] + 0.5]; }), order = [];
    for (var i = 0; i < 4; i++) order.push(wp[((p.start + i * p.dir) % 4 + 4) % 4]);
    var route = [order[0]]; if (p.detour) route.push([14.5, 10.5]); route.push(order[1], order[2]); if (p.detour) route.push([22.5, 10.5]); route.push(order[3]);
    var ri0 = 0; if (f === this.s.cpf) { var bd = -1; route.forEach(function (r, i) { var d = Math.hypot(r[0] - (this.s.cpx + 0.5), r[1] - (this.s.cpy + 0.5)); if (d > bd) { bd = d; ri0 = i; } }, this); }   /* never start him next to where you wake up */
    var start = route[ri0];
    return { f: f, x: start[0], y: start[1], state: 'patrol', route: route, ri: (ri0 + 1) % route.length, path: [], pi: 0, speed: p.speed, face: 0, timer: 0, last: null, spots: [], freeze: 2, home: start };
  };
  G.porterGoto = function (po, pos) { po.path = this.path(po.f, [po.x, po.y], pos); po.pi = 0; };
  G.los = function (f, x0, y0, x1, y1) {
    var steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 3); for (var i = 1; i < steps; i++) { var t = i / steps, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, tx = Math.floor(x), ty = Math.floor(y), c = this.tile(f, tx, ty);
      if (c === '#' || c === 'x' && !this.s.safe) return false; if (c === 'd' && Math.hypot(x - this.pl.x, y - this.pl.y) > 0.9 && Math.hypot(x - this.por[f].x, y - this.por[f].y) > 0.9) return false; } return true;
  };
  G.sees = function (po) {
    var pl = this.pl; if (pl.f !== po.f || pl.hidden) return false; var dx = pl.x - po.x, dy = pl.y - po.y, d = Math.hypot(dx, dy), range = (pl.light && this.s.batt > 0 ? VIS.light : VIS.dark) * (pl.mode === 'sneak' || pl.mode === 'idle' ? 0.6 : 1);   /* staying low and still makes you harder to spot */ if (d > range) return false;
    var ang = Math.atan2(dy, dx), diff = Math.abs(Math.atan2(Math.sin(ang - po.face), Math.cos(ang - po.face))); if (d > VIS.near && diff > VIS.cone) return false; return this.los(po.f, po.x, po.y, pl.x, pl.y);
  };
  G.hear = function (n) {
    var po = this.por[n.f]; if (!po || po.freeze > 0) return; var d = Math.hypot(n.x - po.x, n.y - po.y), r = this.los(n.f, n.x, n.y, po.x, po.y) ? n.level : n.level * 0.5;
    if (d <= r && (po.state === 'patrol' || po.state === 'return' || po.state === 'investigate')) { po.state = 'investigate'; po.timer = 0; po.last = [n.x, n.y]; this.porterGoto(po, [n.x, n.y]); this.emit('alert', { kind: 'heard', dist: d }); }
  };
  G.noise = function (x, y, level, src) { if (level <= 0) return; var n = { x: x, y: y, f: this.pl.f, level: level, t: this.t, src: src }; this.rings.push(n); if (this.rings.length > 12) this.rings.shift(); if (src === 'player') this.lastNoise = this.t; this.hear(n); this.emit('noise', n); };

  G.stepPorter = function (po, dt) {
    var self = this, pl = self.pl;
    if (po.freeze > 0) { po.freeze -= dt; return; }
    var sees = self.sees(po), dist = Math.hypot(pl.x - po.x, pl.y - po.y);
    if (sees && po.state !== 'chase') { po.state = 'chase'; self.emit('alert', { kind: 'seen', dist: dist }); }
    if (po.state === 'chase') {
      if (sees) { po.last = [pl.x, pl.y]; po.timer = 0; self.porterGoto(po, po.last); } else { po.timer += dt; if (po.timer > 1.2 && (!po.path.length || po.pi >= po.path.length)) { po.state = 'search'; po.timer = 0; po.spots = self.spotsNear(po); po.si = 0; po.wait = 0; } }
    }
    var speed = po.state === 'chase' ? 3.5 : po.state === 'patrol' || po.state === 'return' ? po.speed : 2.4;
    if (po.state === 'patrol' || po.state === 'return') {
      if (po.pi >= po.path.length) { var tgt = po.state === 'return' ? po.route[po.ri] : po.route[po.ri]; if (Math.hypot(tgt[0] - po.x, tgt[1] - po.y) < 0.4) { po.ri = (po.ri + 1) % po.route.length; po.state = 'patrol'; tgt = po.route[po.ri]; } self.porterGoto(po, tgt); if (!po.path.length) po.ri = (po.ri + 1) % po.route.length; }
    } else if (po.state === 'investigate') {
      if (po.pi >= po.path.length) { po.timer += dt; if (po.timer > 2.5) { po.state = 'return'; po.timer = 0; po.path = []; } }
    } else if (po.state === 'search') {
      if (po.pi >= po.path.length) {
        if (po.si < po.spots.length) { var sp = po.spots[po.si]; if (!po.at) { self.porterGoto(po, [sp[0] + 0.5, sp[1] + 0.5]); po.at = true; po.wait = 0; } else if (po.pi >= po.path.length) { po.wait += dt; if (po.wait > 1.3) { if (pl.hidden && pl.spot && pl.spot[0] === sp[0] && pl.spot[1] === sp[1] && self.t - self.lastNoise < 3) { self.caught(); return; } po.si++; po.at = false; } } }
        else { po.timer += dt; if (po.timer > 1.5) { po.state = 'return'; po.timer = 0; po.at = false; po.path = []; } }
      }
    }
    /* walk along the path */
    if (po.pi < po.path.length) {
      var tp = po.path[po.pi], dx = tp[0] - po.x, dy = tp[1] - po.y, d = Math.hypot(dx, dy), st = speed * dt; po.face = Math.atan2(dy, dx);
      if (d <= st) { po.x = tp[0]; po.y = tp[1]; po.pi++; } else { po.x += dx / d * st; po.y += dy / d * st; }
    }
    if (pl.f === po.f && !pl.hidden && Math.hypot(pl.x - po.x, pl.y - po.y) < 0.7) self.caught();
  };
  G.spotsNear = function (po) {
    var out = [], last = po.last || [po.x, po.y], f = po.f, self = this;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) if (self.tile(f, x, y) === 'h') { var d = Math.hypot(x + 0.5 - last[0], y + 0.5 - last[1]); if (d < 7) out.push([x, y, d]); }
    out.sort(function (a, b) { return a[2] - b[2]; }); return out.slice(0, 2);
  };
  G.caught = function () {
    var s = this.s, pl = this.pl; s.caught++; s.batt = Math.max(0, s.batt - 10); pl.f = s.cpf; pl.x = s.cpx + 0.5; pl.y = s.cpy + 0.5; pl.hidden = false; pl.spot = null;
    this.por = [0, 1, 2].map(this.newPorter.bind(this)); this.por.forEach(function (p) { p.freeze = 6; });
    this.save(); this.emit('caught', {});
  };

  /* ----- the player ----- */
  G.setLight = function (on) { this.pl.light = !!on && this.s.batt > 0; };
  G.toggleLight = function () { this.setLight(!this.pl.light); return this.pl.light; };
  G.nearTile = function (ch, r) {
    var pl = this.pl, f = pl.f, best = null, bd = 99, x0 = Math.max(0, Math.floor(pl.x - r)), x1 = Math.min(W - 1, Math.floor(pl.x + r)), y0 = Math.max(0, Math.floor(pl.y - r)), y1 = Math.min(H - 1, Math.floor(pl.y + r));
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) if (this.tile(f, x, y) === ch) { var d = Math.hypot(x + 0.5 - pl.x, y + 0.5 - pl.y); if (d <= r && d < bd) { bd = d; best = [x, y]; } }
    return best;
  };
  G.itemNear = function () { var pl = this.pl, s = this.s, self = this, best = null, bd = 1.3; this.d.items.forEach(function (it) { if (it.floor !== pl.f || s.got.indexOf(it.id) >= 0) return; if (it.id === 'ledger' && !s.safe) return; var d = Math.hypot(it.x + 0.5 - pl.x, it.y + 0.5 - pl.y); if (d < bd) { bd = d; best = it; } }); return best; };
  G.nearest = function () {
    if (this.pl.hidden) return { kind: 'unhide', label: 'Leave the hiding spot' };
    var it = this.itemNear(); if (it) return { kind: 'item', item: it, label: it.kind === 'card' ? 'Take the keycard' : it.kind === 'battery' ? 'Take the battery' : it.kind === 'bell' ? 'Take the room-service bell' : it.kind === 'note' ? 'Read the note' : 'Read the ledger' };
    var pl = this.pl, f = pl.f, u = this.nearTile('u', 1.6), v = this.nearTile('v', 1.6), sf = this.nearTile('s', 1.6), ex = this.nearTile('X', 1.7), h = this.nearTile('h', 1.5);
    if (u && v) { var du = Math.hypot(u[0] + 0.5 - pl.x, u[1] + 0.5 - pl.y), dv = Math.hypot(v[0] + 0.5 - pl.x, v[1] + 0.5 - pl.y); if (du <= dv) v = null; else u = null; }
    if (u) return { kind: 'up', label: 'Go up the stairs' }; if (v) return { kind: 'down', label: 'Go down the stairs' }; if (sf) return { kind: 'safe', label: this.s.safe ? 'The safe is open' : 'Try the safe' }; if (ex) return { kind: 'exit', label: 'Leave the hotel' }; if (h) return { kind: 'hide', spot: h, label: 'Hide' };
    return null;
  };
  G.move = function (ax, ay, mode, dt) {
    var pl = this.pl; if (pl.hidden) return; var sp = SPEED[mode] || SPEED.walk, len = Math.hypot(ax, ay); if (len < 0.05) { pl.mode = 'idle'; return; } if (len > 1) { ax /= len; ay /= len; len = 1; }
    pl.mode = mode; pl.face = Math.atan2(ay, ax); var self = this, r = 0.3, dx = ax * sp * dt, dy = ay * sp * dt;
    function blocked(x, y) { for (var i = Math.floor(x - r); i <= Math.floor(x + r); i++) for (var j = Math.floor(y - r); j <= Math.floor(y + r); j++) if (self.solid(pl.f, i, j)) return true; return false; }
    var ox = pl.x, oy = pl.y; if (dx && !blocked(pl.x + dx, pl.y)) pl.x += dx; if (dy && !blocked(pl.x, pl.y + dy)) pl.y += dy;
    var moved = Math.hypot(pl.x - ox, pl.y - oy); this.stepAcc += moved; if (this.stepAcc >= 0.7) { this.stepAcc = 0; this.noise(pl.x, pl.y, NOISE[mode], 'player'); }
    var tc = this.tile(pl.f, Math.floor(pl.x), Math.floor(pl.y)); if (tc === 'd' && this.t - this.doorT > 1.2) { this.doorT = this.t; this.noise(pl.x, pl.y, NOISE.door, 'player'); }
  };
  G.hide = function () {
    var pl = this.pl; if (pl.hidden) { pl.hidden = false; pl.spot = null; this.emit('hide', false); return { ok: true }; }
    var h = this.nearTile('h', 1.5); if (!h) return { ok: false, msg: 'There is nothing to hide in here.' };
    var po = this.por[pl.f]; if (po.state === 'chase' && this.sees(po)) return { ok: false, msg: 'He is watching you. You cannot hide now. Break line of sight first.' };
    pl.hidden = true; pl.spot = h; this.emit('hide', true); return { ok: true };
  };
  G.throwBell = function () {
    var s = this.s, pl = this.pl; if (s.bells <= 0) return { ok: false, msg: 'You have no room-service bells.' }; if (pl.hidden) return { ok: false, msg: 'You cannot throw from your hiding spot.' };
    var dx = Math.cos(pl.face), dy = Math.sin(pl.face), x = pl.x, y = pl.y; for (var i = 0; i < 7; i++) { var nx = x + dx, ny = y + dy; if (this.solid(pl.f, Math.floor(nx), Math.floor(ny))) break; x = nx; y = ny; }
    s.bells--; this.noise(x, y, NOISE.bell, 'bell'); this.save(); this.emit('throw', { x: x, y: y }); return { ok: true };
  };
  G.stairs = function (dir) {
    var s = this.s, pl = this.pl; if (dir > 0 && s.cards < pl.f + 1) return { ok: false, msg: pl.f === 0 ? 'The stairwell door is locked. You need a keycard from the lobby.' : 'The next floor needs a better keycard.' };
    var near = this.nearTile(dir > 0 ? 'u' : 'v', 1.6), left = near && near[0] < 20; pl.f += dir; pl.x = (left ? 1.5 : 37.5); pl.y = 10.5; pl.hidden = false; s.cpf = pl.f; s.cpx = left ? 1 : 37; s.cpy = 10;
    var first = s.seen.indexOf(pl.f) < 0; if (first) s.seen.push(pl.f); this.por[pl.f].freeze = Math.max(this.por[pl.f].freeze, 2); this.save(); this.emit('floor', { f: pl.f, first: first }); return { ok: true, f: pl.f, first: first };
  };
  G.pick = function (it) {
    var s = this.s; if (s.got.indexOf(it.id) >= 0) return { ok: false };
    if (it.kind === 'card') s.cards = Math.max(s.cards, it.tier); else if (it.kind === 'battery') s.batt = Math.min(100, s.batt + 40); else if (it.kind === 'bell') s.bells = Math.min(9, s.bells + 1);
    else if (it.kind === 'note') { if (s.found.indexOf(it.id) < 0) s.found.push(it.id); } else if (it.kind === 'ledger') s.ledger = true;
    s.got.push(it.id); this.noise(this.pl.x, this.pl.y, NOISE.pick, 'player'); this.save(); this.emit('item', it); return { ok: true, item: it };
  };
  G.trySafe = function (code) { if (this.d.checkSafe(code)) { this.s.safe = true; this.save(); this.emit('safe'); return { ok: true }; } return { ok: false }; };
  G.digitsFound = function () { var s = this.s; return [0, 1, 2].map(function (f) { return s.found.indexOf('note' + f) >= 0; }); };
  G.finishBlock = function () { if (!this.s.ledger) return 'You have not found what is in Room 214 yet.'; if (words(this.writing('acct')) < MIN.account) return 'Write your account of Room 214 first (about ' + MIN.account + ' words).'; if (words(this.writing('seed')) < MIN.seed) return 'Write your story seed first (about ' + MIN.seed + ' words).'; return ''; };
  G.finish = function () { if (this.finishBlock()) return false; this.s.done = true; this.save(); this.emit('done'); return true; };
  G.needJournal = function (f) { return f > 0 && words(this.writing('j' + f)) < MIN.journal; };
  G.objective = function () {
    var s = this.s;
    if (s.cards < 1) return 'Find a keycard in the lobby rooms (keep quiet: sneak with C).'; if (this.pl.f === 0 && s.cards >= 1 && s.found.indexOf('note0') < 0) return 'Read the plan by the front desk, then take the stairs up.';
    if (!s.safe) { var n = this.digitsFound().filter(Boolean).length; return n < 3 ? 'Find the three numbers (one on each floor) to open the safe on the second floor. Numbers found: ' + n + ' of 3.' : 'You have all three numbers. Open the safe in the second-floor central room.'; }
    if (!s.ledger) return 'The wall by the safe has opened. Find Room 214.'; if (words(this.writing('acct')) < MIN.account || words(this.writing('seed')) < MIN.seed) return 'Write your account and story seed (open Journal), then leave through the lobby door.';
    if (!s.done) return 'Leave the hotel through the front door in the lobby.'; return 'You made it out. Well done.';
  };
  G.update = function (dt, inp) {
    this.acc += Math.min(dt, 0.1); var step = 1 / 60, n = 0;
    while (this.acc >= step && n++ < 8) {
      this.acc -= step; this.t += step; var pl = this.pl, s = this.s;
      this.move(inp.ax || 0, inp.ay || 0, inp.mode || 'walk', step);
      if (pl.light && s.batt > 0) { this.battAcc += step; if (this.battAcc >= 4) { this.battAcc = 0; s.batt = Math.max(0, s.batt - 1); if (s.batt === 0) { pl.light = false; this.emit('dark'); } } }
      this.stepPorter(this.por[pl.f], step);
      var po = this.por[pl.f], d = Math.hypot(pl.x - po.x, pl.y - po.y);
      this.cueT -= step; if (this.cueT <= 0 && d < 10 && po.freeze <= 0) { this.cueT = d < 4 ? 0.5 : 0.9; this.emit('cue', { name: 'porterStep', dx: po.x - pl.x, dy: po.y - pl.y, d: d }); }
      this.breathT -= step; if (this.breathT <= 0 && d < 3.2 && po.freeze <= 0) { this.breathT = 1.6; this.emit('cue', { name: 'porterNear', dx: po.x - pl.x, dy: po.y - pl.y, d: d }); }
    }
  };

  R.logic = { Game: Game, fresh: fresh, STATE_SCHEMA: STATE_SCHEMA, SPEED: SPEED, NOISE: NOISE, MIN: MIN, VIS: VIS, words: words };
})(typeof window !== 'undefined' ? window : globalThis);
