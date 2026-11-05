/* ROOM 214: the Phaser scene. Draws the current floor (pre-rendered), a flashlight cone that reveals it, the Night Porter's lantern, items, hiding spots and noise rings.
   Dark by design: only what your light touches is bright. Everything that matters is also shown in the DOM HUD and as captions. No image files. */
(function (root) {
  'use strict';
  var HOG = root.HOG, R = root.HOG_R214, D = R.data, TW = D.TW, MW = D.W, MH = D.H;
  var COL = { wall: 0x2a3140, wall2: 0x353d50, floor: 0x6b5a46, floor2: 0x625240, corr: 0x5a5f6a, corr2: 0x535863, door: 0xb58a4a, hide: 0x7a5a38, stair: 0x8fb4d9, exit: 0x6fc27d, safe: 0x9aa0a8, bg: 0x000000 };

  function bake(sc, game, f) {
    var g = sc.make.graphics({ x: 0, y: 0, add: false }), M = MW * TW, Hh = MH * TW; g.fillStyle(COL.bg, 1); g.fillRect(0, 0, M, Hh);
    for (var y = 0; y < MH; y++) for (var x = 0; x < MW; x++) {
      var t = game.d.floors[f][y][x], px = x * TW, py = y * TW, corr = (x >= 4 && x <= 35 && y >= 5 && y <= 16 && !(x >= 6 && x <= 33 && y >= 7 && y <= 14));
      if (t === '#' || t === 'x') { g.fillStyle((x + y) % 2 ? COL.wall : COL.wall2, 1); g.fillRect(px, py, TW, TW); g.lineStyle(1, 0x000000, 0.35); g.strokeRect(px + .5, py + .5, TW - 1, TW - 1); continue; }
      g.fillStyle(corr ? ((x + y) % 2 ? COL.corr : COL.corr2) : ((x + y) % 2 ? COL.floor : COL.floor2), 1); g.fillRect(px, py, TW, TW);
      if (t === 'd') { g.fillStyle(COL.door, 1); g.fillRect(px + 2, py + 10, TW - 4, 12); g.lineStyle(2, 0x000000, .5); g.strokeRect(px + 2, py + 10, TW - 4, 12); }
      else if (t === 'h') { g.fillStyle(COL.hide, 1); g.fillRect(px + 3, py + 2, TW - 6, TW - 4); g.lineStyle(2, 0x000, .6); g.strokeRect(px + 3, py + 2, TW - 6, TW - 4); g.lineBetween(px + TW / 2, py + 4, px + TW / 2, py + TW - 4); g.fillStyle(0xd9b86c, 1); g.fillCircle(px + 12, py + 16, 2); g.fillCircle(px + 20, py + 16, 2); }
      else if (t === 'u' || t === 'v') { g.fillStyle(COL.stair, 1); if (t === 'u') g.fillTriangle(px + 16, py + 4, px + 4, py + 28, px + 28, py + 28); else g.fillTriangle(px + 16, py + 28, px + 4, py + 4, px + 28, py + 4); }
      else if (t === 'X') { g.fillStyle(COL.exit, 1); g.fillRect(px + 2, py + 2, TW - 4, TW - 4); g.lineStyle(2, 0x000, .6); g.strokeRect(px + 2, py + 2, TW - 4, TW - 4); }
      else if (t === 's') { g.fillStyle(COL.safe, 1); g.fillRect(px + 2, py + 2, TW - 4, TW - 4); g.lineStyle(3, 0x333, 1); g.strokeCircle(px + 16, py + 16, 8); g.lineBetween(px + 16, py + 16, px + 22, py + 12); }
    }
    g.generateTexture('fl' + f, M, Hh); g.destroy();
  }
  function label(sc, x, y, t) { return sc.add.text(x * TW + 16, y * TW + 16, t, { fontFamily: 'system-ui, Segoe UI, sans-serif', fontSize: '11px', color: '#dfe9f5', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3); }

  function makeScene(game, ui, shell, input) {
    var S = {
      create: function () {
        var sc = this, pl = game.pl; sc.cameras.main.setBackgroundColor('#000000');
        [0, 1, 2].forEach(function (f) { bake(sc, game, f); });
        sc.dim = sc.add.image(0, 0, 'fl0').setOrigin(0).setAlpha(0.16);
        sc.bright = sc.add.image(0, 0, 'fl0').setOrigin(0).setDepth(1);
        sc.maskG = sc.make.graphics({ x: 0, y: 0, add: false }); sc.bright.setMask(sc.maskG.createGeometryMask());
        sc.labels = []; sc.itemG = {}; sc.ring = sc.add.graphics().setDepth(8); sc.porterG = sc.add.graphics().setDepth(7); sc.playerG = sc.add.graphics().setDepth(6); sc.lightG = sc.add.graphics().setDepth(2);
        game.d.items.forEach(function (it) { var g = sc.add.graphics().setDepth(4); drawItem(g, it); sc.itemG[it.id] = g; });
        sc.hidTxt = sc.add.text(MW * TW / 2, 40, 'HIDDEN: press H to come out', { fontFamily: 'system-ui, sans-serif', fontSize: '22px', color: '#fff7dd', backgroundColor: '#000000cc', padding: { x: 10, y: 4 } }).setOrigin(0.5).setDepth(20).setVisible(false);
        sc.prompt = sc.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#fff7dd', backgroundColor: '#000000cc', padding: { x: 8, y: 3 } }).setOrigin(0.5, 1).setDepth(21).setVisible(false);
        sc.fade = sc.add.rectangle(0, 0, MW * TW, MH * TW, 0x000000, 0).setOrigin(0).setDepth(30); sc.flr = -1; sc.near = null; sc.rt = 0;
        game.on('noise', function (n) { sc.rings.push({ x: n.x, y: n.y, r: n.level, t: 0, src: n.src, f: n.f }); if (sc.rings.length > 10) sc.rings.shift(); ui.noise(n); });
        sc.rings = [];
        game.on('caught', function () { ui.caught(); if (!shell.settings.low) { sc.fade.setAlpha(1); sc.tweens.add({ targets: sc.fade, alpha: 0, duration: 1400 }); } });
        game.on('cue', function (c) { ui.cue(c); }); game.on('alert', function (a) { ui.alert(a); }); game.on('floor', function (e) { ui.floor(e); }); game.on('item', function (it) { ui.item(it); });
        game.on('hide', function () { sc.hidTxt.setVisible(game.pl.hidden); }); game.on('safe', function () { ui.say('The safe swings open. Somewhere in the wall, a door clicks.'); sc.flr = -1; });
        input.onPress('interact', function () { sc.use(); }); input.onPress('hide', function () { ui.hide(); }); input.onPress('light', function () { ui.light(); }); input.onPress('throw', function () { ui.throwBell(); });
        input.onPress('journal', function () { ui.journal(); }); input.onPress('pause', function () { ui.menu(); });
        root.__r214Scene = sc; sc.setFloor(pl.f);
      },
      setFloor: function (f) { var sc = this; sc.flr = f; sc.dim.setTexture('fl' + f); sc.bright.setTexture('fl' + f); sc.labels.forEach(function (l) { l.destroy(); }); sc.labels = [];
        var st = D.STAIRS; [st.L, st.R].forEach(function (s) { if (f < 2) sc.labels.push(label(sc, s.up[0], s.up[1] - 1, 'UP')); if (f > 0) sc.labels.push(label(sc, s.down[0], s.down[1] + 1, 'DOWN')); }); if (f === 0) sc.labels.push(label(sc, D.EXIT[0], D.EXIT[1] + 1, 'EXIT')); if (f === 1) sc.labels.push(label(sc, D.SAFE[0], D.SAFE[1] + 1, 'SAFE'));
        ['t0', 't1', 't2', 't3', 'b0', 'b1', 'b2', 'b3'].forEach(function (id, i) { var r = D.ROOMS.filter(function (x) { return x.id === id; })[0]; sc.labels.push(label(sc, r.door[0], r.door[1] + (r.kind === 'top' ? -0.1 : 0.1), String(f === 1 ? 201 + i : f === 2 ? 301 + i : 101 + i))); }); },
      update: function (t, dt) {
        var sc = this, pl = game.pl, s = game.s; if (sc.flr !== pl.f || sc.flr < 0) sc.setFloor(pl.f);
        if (!shell.modalOpen) {
          var a = input.axis(), mode = input.held('run') ? 'run' : input.held('sneak') ? 'sneak' : 'walk'; game.update(dt / 1000, { ax: a.x, ay: a.y, mode: mode });
        }
        /* light: a flashlight cone (when on and charged) plus a small glow around you; the mask reveals the bright floor inside it */
        var g = sc.maskG; g.clear(); sc.lightG.clear(); var px = pl.x * TW, py = pl.y * TW; var poly = []; var on = pl.light && s.batt > 0, range = on ? 9 : 0, half = 0.62;
        g.fillStyle(0xffffff, 1); g.fillCircle(px, py, TW * 2.3);
        if (on) { for (var i = 0; i <= 28; i++) { var an = pl.face - half + (2 * half) * i / 28, d = 0.4; while (d < range && !game.solid(pl.f, Math.floor(pl.x + Math.cos(an) * d), Math.floor(pl.y + Math.sin(an) * d))) d += 0.25; poly.push(new Phaser.Math.Vector2(px + Math.cos(an) * d * TW, py + Math.sin(an) * d * TW)); } poly.push(new Phaser.Math.Vector2(px, py)); g.fillPoints(poly, true); sc.lightG.fillStyle(0xfff1c0, 0.08); sc.lightG.fillPoints(poly, true); }
        /* things only appear where the light is */
        function lit(x, y) { var dx = x - pl.x, dy = y - pl.y, d = Math.hypot(dx, dy); if (d <= 2.4) return true; if (!on || d > range) return false; var an = Math.atan2(dy, dx), df = Math.abs(Math.atan2(Math.sin(an - pl.face), Math.cos(an - pl.face))); return df <= half && game.los(pl.f, pl.x, pl.y, x, y); }
        game.d.items.forEach(function (it) { var g2 = sc.itemG[it.id]; g2.setVisible(it.floor === pl.f && s.got.indexOf(it.id) < 0 && (it.id !== 'ledger' || s.safe) && lit(it.x + 0.5, it.y + 0.5)); g2.setPosition(it.x * TW + 16, it.y * TW + 16); });
        /* the player */
        var p = sc.playerG; p.clear(); p.setPosition(px, py); if (!pl.hidden) { p.fillStyle(0x000000, 0.35); p.fillEllipse(0, 9, 18, 7); p.fillStyle(0xe8c9a0, 1); p.fillCircle(0, -8, 6); p.fillStyle(0x3f7fb0, 1); p.fillRoundedRect(-7, -3, 14, 16, 4); p.lineStyle(2, 0xffffff, 0.8); p.strokeRoundedRect(-7, -3, 14, 16, 4); if (pl.mode === 'sneak') { p.lineStyle(2, 0x9fe0b0, 1); p.strokeCircle(0, 4, 14); } } else { p.lineStyle(2, 0x9fe0b0, 1); p.strokeCircle(0, 0, 10); }
        /* the Night Porter: a pale lantern glow you can see wherever you have a clear line of sight (so you can plan), and his shape only when he is in your light */
        var po = game.por[pl.f], pg = sc.porterG; pg.clear(); var vis = game.los(pl.f, pl.x, pl.y, po.x, po.y) && Math.hypot(po.x - pl.x, po.y - pl.y) < 16;
        if (vis) { pg.setPosition(po.x * TW, po.y * TW); pg.fillStyle(0xffe9b0, 0.18); pg.fillCircle(0, 0, 22); pg.fillStyle(0xffe9b0, 0.55); pg.fillCircle(0, 0, 6);
          var dir = po.freeze > 0 ? null : { x: Math.cos(po.face), y: Math.sin(po.face) }; if (lit(po.x, po.y)) { pg.fillStyle(0x0a0a0f, 1); pg.fillEllipse(0, 5, 18, 26); pg.fillCircle(0, -10, 8); pg.lineStyle(2, po.state === 'chase' ? 0xff8a6a : 0xb7c4d9, 1); pg.strokeEllipse(0, 5, 20, 28); pg.strokeCircle(0, -10, 9); }
          if (dir) { pg.lineStyle(3, po.state === 'chase' ? 0xff8a6a : po.state === 'investigate' ? 0xffd27a : 0xb7c4d9, 0.9); pg.lineBetween(0, 0, dir.x * 18, dir.y * 18); } }
        /* noise rings (also captioned) */
        var rg = sc.ring; rg.clear(); sc.rings = sc.rings.filter(function (n) { n.t += dt / 1000; return n.t < 1.1; }); sc.rings.forEach(function (n) { if (n.f !== pl.f) return; var k = n.t / 1.1; rg.lineStyle(3, n.src === 'bell' ? 0xffd27a : 0x9fd0ff, 0.8 * (1 - k)); rg.strokeCircle(n.x * TW, n.y * TW, Math.max(4, n.r * TW * k)); });
        /* prompt */
        var nr = game.nearest(); if (!nr || shell.modalOpen) { sc.prompt.setVisible(false); sc.near = null; } else { if (!sc.near || sc.near.label !== nr.label) ui.say(nr.label); sc.near = nr; sc.prompt.setText(nr.label + '  [E]').setPosition(px, py - 18).setVisible(true); }
        if (!pl.hidden) sc.hidTxt.setVisible(false);
      },
      use: function () { if (shell.modalOpen) return; ui.act(game.nearest()); },
      teleport: function (x, y) { game.pl.x = x + 0.5; game.pl.y = y + 0.5; }
    };
    function PlayScene() { Phaser.Scene.call(this, { key: 'play' }); }
    PlayScene.prototype = Object.create(Phaser.Scene.prototype); Object.assign(PlayScene.prototype, S); PlayScene.prototype.constructor = PlayScene;
    return PlayScene;
  }
  function drawItem(g, it) {
    switch (it.kind) {
      case 'card': g.fillStyle(0x6fc2ff, 1); g.fillRoundedRect(-10, -7, 20, 14, 3); g.fillStyle(0x000000, .5); g.fillRect(-8, -3, 16, 3); g.lineStyle(2, 0xffffff, .9); g.strokeRoundedRect(-10, -7, 20, 14, 3); break;
      case 'battery': g.fillStyle(0xd9e36a, 1); g.fillRect(-8, -5, 16, 11); g.fillStyle(0x333, 1); g.fillRect(8, -2, 3, 5); g.lineStyle(2, 0x000, .6); g.strokeRect(-8, -5, 16, 11); break;
      case 'bell': g.fillStyle(0xd9b86c, 1); g.fillTriangle(0, -9, -9, 7, 9, 7); g.fillRect(-10, 6, 20, 3); g.fillCircle(0, 11, 2.5); break;
      case 'note': g.fillStyle(0xf0e8d0, 1); g.fillRect(-8, -10, 16, 20); g.fillStyle(0x333, 1); g.fillRect(-5, -6, 10, 2); g.fillRect(-5, -1, 10, 2); g.fillRect(-5, 4, 6, 2); break;
      case 'ledger': g.fillStyle(0x6b2a2f, 1); g.fillRect(-11, -9, 22, 18); g.fillStyle(0xf0e8d0, 1); g.fillRect(-8, -6, 7, 12); g.fillRect(1, -6, 7, 12); break;
    }
  }
  R.scene = { make: makeScene };
})(typeof window !== 'undefined' ? window : globalThis);
