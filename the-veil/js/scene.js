/* THE VEIL: the Phaser scene. Draws the map (two pre-rendered worlds), the player and the things you can use, and moves the player.
   All rules live in logic.js. Art is generated in code (no image files). Low-intensity mode skips the fade and shake. */
(function (root) {
  'use strict';
  var HOG = root.HOG, V = root.HOG_VEIL, D = V.data, TW = D.TW;
  var PAL = {
    L: { grass: 0x3b4a3c, grass2: 0x34423a, road: 0x4a4a4a, path: 0x6a6658, tree: 0x1f3326, fence: 0x7a6e5a, wall: 0x5c5a58, floor: 0x585148, pew: 0x4a3a2c, altar: 0x7a7a7a, grave: 0x8a8d90, door: 0x4a3626, bg: 0x10161d },
    E: { grass: 0x2c3c52, grass2: 0x273649, road: 0x3b4660, path: 0x546080, tree: 0x16263a, fence: 0x8f8466, wall: 0x6e6a74, floor: 0x7a6a52, pew: 0x5d4632, altar: 0xb99c62, grave: 0xa9b6c8, door: 0x6a4a2a, bg: 0x0a0f1c }
  };

  function makeScene(game, ui, shell, input) {
    var S = {
      create: function () {
        var sc = this, d = game.s, tilesX = D.MW, tilesY = D.MH;
        sc.cameras.main.setBackgroundColor('#05070b');
        sc.registry.set('map', game.map);
        ['L', 'E'].forEach(function (w) { sc.textures.exists('bg' + w) || bake(sc, w); });
        sc.bgL = sc.add.image(0, 0, 'bgL').setOrigin(0); sc.bgE = sc.add.image(0, 0, 'bgE').setOrigin(0);
        sc.entGfx = {}; game.ents.forEach(function (e) { sc.entGfx[e.id] = drawEntity(sc, e); });
        drawMarks(sc, game);
        sc.player = sc.add.graphics(); drawPlayer(sc.player);
        sc.px = d.px * TW + TW / 2; sc.py = d.py * TW + TW / 2;
        sc.veil = sc.add.rectangle(0, 0, tilesX * TW, tilesY * TW, 0x6fa8ff, 0).setOrigin(0).setDepth(50);
        sc.mist = sc.add.graphics().setDepth(40); sc.mist.setAlpha(0);
        sc.prompt = sc.add.text(0, 0, '', { fontFamily: 'system-ui, Segoe UI, sans-serif', fontSize: '20px', color: '#fff7dd', backgroundColor: '#000000cc', padding: { x: 8, y: 4 } }).setDepth(60).setOrigin(0.5, 1).setVisible(false);
        sc.near = null; sc.frozen = false; sc.pending = null;
        game.on('shift', function () { sc.applyWorld(true); });
        game.on('doors', function () { sc.applyWorld(false); });
        input.onPress('interact', function () { sc.useNear(); });
        input.onPress('shift', function () { ui.shift(); });
        input.onPress('journal', function () { ui.evidence(); });
        input.onPress('pause', function () { ui.menu(); });
        sc.applyWorld(false); sc.place();
        root.__veilScene = sc;
      },
      update: function (t, dt) {
        var sc = this; if (shell.modalOpen || sc.frozen) { sc.prompt.setVisible(false); return; }
        var a = input.axis(), run = input.held('run'), sp = (run ? 215 : 150) * dt / 1000;
        if (a.x || a.y) { moveBy(sc, game, a.x * sp, a.y * sp); sc.place(); }
        var tx = Math.floor(sc.px / TW), ty = Math.floor(sc.py / TW); game.setPos(tx, ty);
        var e = game.nearest(tx, ty);
        if (e !== sc.near) { sc.near = e; if (e) { sc.prompt.setText(label(e, game) + '  [E]').setVisible(true); ui.say(label(e, game)); } else sc.prompt.setVisible(false); }
        if (e) sc.prompt.setPosition(e.x * TW + (e.w2 || 1) * TW / 2, e.y * TW - 6);
      },
      place: function () { this.player.setPosition(this.px, this.py); this.player.setDepth(10 + this.py / 100); },
      useNear: function () { if (shell.modalOpen || !this.near) return; ui.act(game.interact(this.near)); },
      applyWorld: function (animate) {
        var sc = this, w = game.s.world, low = shell.settings.low;
        sc.bgL.setVisible(w === 'L'); sc.bgE.setVisible(w === 'E');
        game.ents.forEach(function (e) { var g = sc.entGfx[e.id]; if (g) g.setVisible(game.visible(e)); });
        sc.entGfx.gate && sc.drawGate(); sc.drawDoors();
        sc.mist.clear(); if (w === 'E') { sc.mist.fillStyle(0x9fb7ff, 0.06); sc.mist.fillRect(0, 0, D.MW * TW, D.MH * TW); sc.mist.setAlpha(1); } else sc.mist.setAlpha(0);
        if (animate && !low) { sc.veil.setFillStyle(w === 'E' ? 0x6fa8ff : 0xcfcfcf, 0.0).setAlpha(0.35); sc.tweens.add({ targets: sc.veil, alpha: 0, duration: 450 }); }
      },
      drawGate: function () { var g = this.entGfx.gate; g.clear(); var open = game.s.world === 'E'; g.lineStyle(4, open ? 0xd9b86c : 0x888888, 1); if (open) { g.strokeLineShape(new Phaser.Geom.Line(16 * TW + 2, 16 * TW + 2, 16 * TW + 2, 16 * TW + 30)); g.strokeLineShape(new Phaser.Geom.Line(18 * TW - 2, 16 * TW + 2, 18 * TW - 2, 16 * TW + 30)); } else { g.fillStyle(0x6a6a6a, 1); g.fillRect(16 * TW, 16 * TW + 6, 2 * TW, 20); g.lineStyle(3, 0xb0b0b0, 1); for (var i = 0; i < 6; i++) g.strokeLineShape(new Phaser.Geom.Line(16 * TW + i * 11 + 2, 16 * TW + 6, 16 * TW + i * 11 + 12, 16 * TW + 26)); } },
      drawDoors: function () {
        var sc = this; if (!sc.doorGfx) sc.doorGfx = sc.add.graphics().setDepth(5); var g = sc.doorGfx; g.clear();
        var open = game.s.doors, w = game.s.world; g.fillStyle(open ? 0x1b1410 : PAL[w].door, 1); g.fillRect(16 * TW, 13 * TW, 2 * TW, TW);
        if (!open) { g.lineStyle(2, 0xd9b86c, 1); g.strokeRect(16 * TW + 3, 13 * TW + 3, 2 * TW - 6, TW - 6); g.lineBetween(17 * TW, 13 * TW + 3, 17 * TW, 14 * TW - 3); }
        var s = game.s.world === 'L' ? PAL.L : PAL.E; g.fillStyle(s.door, 1); g.fillRect(25 * TW + 4, 7 * TW, TW - 8, TW); if (game.s.world === 'E') { g.fillStyle(0x1b1410, 1); g.fillRect(25 * TW + 4, 7 * TW, TW - 8, TW); }
      },
      teleport: function (tx, ty) { this.px = tx * TW + TW / 2; this.py = ty * TW + TW / 2; game.setPos(tx, ty); this.place(); }
    };
    function PlayScene() { Phaser.Scene.call(this, { key: 'play' }); }
    PlayScene.prototype = Object.create(Phaser.Scene.prototype); Object.assign(PlayScene.prototype, S); PlayScene.prototype.constructor = PlayScene;
    return PlayScene;
  }

  function label(e, game) { return e.label; }
  /* axis-separated tile collision with a 20 px wide body */
  function moveBy(sc, game, dx, dy) {
    var r = 9;
    function blocked(x, y) { var x0 = Math.floor((x - r) / TW), x1 = Math.floor((x + r) / TW), y0 = Math.floor((y - r) / TW), y1 = Math.floor((y + r) / TW); for (var i = x0; i <= x1; i++) for (var j = y0; j <= y1; j++) if (game.tileSolid(i, j)) return true; return false; }
    if (dx && !blocked(sc.px + dx, sc.py)) sc.px += dx; if (dy && !blocked(sc.px, sc.py + dy)) sc.py += dy;
  }
  function bake(sc, w) {
    var P = PAL[w], g = sc.make.graphics({ x: 0, y: 0, add: false }), M = D.MW * TW, H = D.MH * TW, map = sc.registry.get('map');
    g.fillStyle(P.bg, 1); g.fillRect(0, 0, M, H);
    for (var y = 0; y < D.MH; y++) for (var x = 0; x < D.MW; x++) {
      var t = map[y][x], px = x * TW, py = y * TW;
      var base = (t === ',') ? P.road : (t === 'p') ? P.path : (t === 'f' || t === 'b' || t === 'a' || t === 'S' || t === 'D') ? P.floor : ((x + y) % 2 ? P.grass : P.grass2);
      g.fillStyle(base, 1); g.fillRect(px, py, TW, TW);
      if (t === 'T') { g.fillStyle(P.tree, 1); g.fillCircle(px + 16, py + 16, 15); g.fillStyle(0x000000, 0.18); g.fillCircle(px + 20, py + 20, 8); }
      else if (t === 'F' || t === 'G') { g.fillStyle(P.fence, 1); g.fillRect(px, py + 13, TW, 6); if (t === 'F') { g.fillRect(px + 4, py + 6, 5, 20); g.fillRect(px + 23, py + 6, 5, 20); } }
      else if (t === '#') { g.fillStyle(P.wall, 1); g.fillRect(px, py, TW, TW); g.lineStyle(1, 0x000000, 0.25); g.strokeRect(px + 0.5, py + 0.5, TW - 1, TW - 1); }
      else if (t === 'b') { g.fillStyle(P.pew, 1); g.fillRect(px, py + 4, TW, TW - 8); g.fillStyle(0x000000, 0.2); g.fillRect(px, py + TW - 8, TW, 4); }
      else if (t === 'a') { g.fillStyle(P.altar, 1); g.fillRect(px + 2, py + 6, TW - 4, TW - 10); }
      else if (t === 'g') { g.fillStyle(P.grave, 1); g.fillRoundedRect(px + 8, py + 4, 16, 24, 6); g.fillStyle(0x000000, 0.25); g.fillRect(px + 14, py + 10, 4, 10); g.fillRect(px + 11, py + 13, 10, 3); }
    }
    if (w === 'E') { /* the Echo: warm window light on the nave floor */ g.fillStyle(0xffd27a, 0.1); for (var i = 0; i < 4; i++) g.fillRect((10 + i * 4) * TW, 4 * TW, TW * 2, 8 * TW); }
    g.generateTexture('bg' + w, M, H); g.destroy();
  }
  function shape(g, kind, c) { /* small distinct shapes so nothing is told apart by colour alone */
    g.fillStyle(c, 1); g.lineStyle(2, 0x000000, 0.6);
    if (kind === 'star') { var p = []; for (var i = 0; i < 10; i++) { var r = i % 2 ? 5 : 11, a = -Math.PI / 2 + i * Math.PI / 5; p.push(new Phaser.Math.Vector2(Math.cos(a) * r, Math.sin(a) * r)); } g.fillPoints(p, true); }
    else if (kind === 'flame') { g.fillTriangle(0, -12, -8, 8, 8, 8); g.fillCircle(0, 6, 8); }
    else if (kind === 'tower') { g.fillRect(-7, -8, 14, 18); g.fillRect(-9, -12, 4, 6); g.fillRect(-2, -12, 4, 6); g.fillRect(5, -12, 4, 6); }
  }
  function drawEntity(sc, e) {
    var g = sc.add.graphics().setDepth(6), cx = e.x * TW + TW / 2, cy = e.y * TW + TW / 2;
    switch (e.kind) {
      case 'bell': g.fillStyle(0xd9b86c, 1); g.fillTriangle(cx, cy - 10, cx - 11, cy + 8, cx + 11, cy + 8); g.fillRect(cx - 12, cy + 7, 24, 4); g.fillCircle(cx, cy + 13, 3); g.lineStyle(2, 0x000, .6); g.strokeCircle(cx, cy, 15); break;
      case 'board': g.fillStyle(0x8a7350, 1); g.fillRect(cx - 12, cy - 12, 24, 20); g.fillStyle(0xf0e8d0, 1); g.fillRect(cx - 9, cy - 9, 18, 14); g.fillStyle(0x333, 1); g.fillRect(cx - 7, cy - 6, 14, 2); g.fillRect(cx - 7, cy - 1, 10, 2); g.fillStyle(0x5a4630, 1); g.fillRect(cx - 2, cy + 8, 4, 10); break;
      case 'gate': break;
      case 'plates': g.fillStyle(0x6a6a6a, 1); g.fillRect(cx - 14, cy - 14, 28, 28); [[-8, 0xb59a5a], [0, 0xd9b86c], [8, 0xf0d890]].forEach(function (p, i) { g.fillStyle(p[1], 1); g.fillCircle(cx + p[0], cy + 4 - i * 3, 5 + i); }); break;
      case 'mark': g.setPosition(cx - 32, cy); break; case 'figure': g.fillStyle(0xcfe0ff, 0.85); g.fillEllipse(cx, cy + 6, 16, 24); g.fillCircle(cx, cy - 10, 7); g.lineStyle(2, 0xffffff, .6); g.strokeEllipse(cx, cy + 6, 20, 28); break;
      case 'cabinet': g.fillStyle(0x6b4a2e, 1); g.fillRect(cx - 13, cy - 14, 26, 28); g.fillStyle(0xd9b86c, 1); g.fillRect(cx - 3, cy - 2, 6, 8); g.lineStyle(2, 0x000, .5); g.strokeRect(cx - 13, cy - 14, 26, 28); break;
      case 'photo': g.fillStyle(0xe8e0c8, 1); g.fillRect(cx - 9, cy - 11, 18, 22); g.fillStyle(0x6a6a6a, 1); g.fillCircle(cx, cy - 2, 5); g.fillRect(cx - 6, cy + 3, 12, 6); break;
      case 'register': g.fillStyle(0x5c1f27, 1); g.fillRect(cx - 12, cy - 9, 24, 18); g.fillStyle(0xe8e0c8, 1); g.fillRect(cx - 9, cy - 6, 8, 12); g.fillRect(cx + 1, cy - 6, 8, 12); break;
      case 'sac': break;
      case 'scene': g.lineStyle(3, 0xd9b86c, 1); g.strokeCircle(cx, cy, 12); g.fillStyle(0xd9b86c, 0.35); g.fillCircle(cx, cy, 12); break;
    }
    return g;
  }
  /* pew marks are drawn once the symbols are known (they come from the seeded data) */
  function drawMarks(sc, game) {
    var order = ['pewFront', 'pewMiddle', 'pewBack'], rows = [6, 8, 10];
    order.forEach(function (id, i) { var g = sc.entGfx[id]; g.clear(); g.setPosition(0, 0); g.setDepth(7); var cx = 14 * TW + TW / 2, cy = rows[i] * TW + TW / 2; g.setPosition(cx, cy); shape(g, game.d.pews[i], 0xffe08a); g.lineStyle(3, 0xffe08a, 0.5); g.strokeCircle(0, 0, 16); });
  }
  function drawPlayer(g) { g.fillStyle(0x000000, 0.3); g.fillEllipse(0, 11, 20, 8); g.fillStyle(0xe8c9a0, 1); g.fillCircle(0, -9, 7); g.fillStyle(0x2f6f9f, 1); g.fillRoundedRect(-8, -3, 16, 18, 5); g.lineStyle(2, 0xffffff, 0.85); g.strokeRoundedRect(-8, -3, 16, 18, 5); }

  V.scene = { make: makeScene, drawMarks: drawMarks, PAL: PAL };
})(typeof window !== 'undefined' ? window : globalThis);
