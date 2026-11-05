/* THE VEIL: boot. Title screen (name + case code), save/continue, then start Phaser. Nothing here touches the network except HO_track(game-opened). */
(function (root) {
  'use strict';
  var HOG = root.HOG, V = root.HOG_VEIL, L = V.logic, doc = root.document, $ = function (s) { return doc.querySelector(s); };
  var variant = HOG.variant.resolve('veil'); HOG.variant.remember('veil', variant);
  var saves = HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: L.STATE_SCHEMA, summary: function (d) { return 'chapter 1 · ' + d.state.found.length + ' clues' + (d.state.caseDone ? ' · case closed' : ''); } });
  var shell = HOG.shell.mount({ game: 'veil', title: 'The Veil', variant: variant, saves: saves, baseKey: 'ho-veil', home: '../', onCleared: function () { root.location.reload(); } });
  root.__veil = { saves: saves, shell: shell, variant: variant };
  try { if (root.HO_track) root.HO_track('game-opened-the-veil'); } catch (e) { /* never break the game */ }

  /* title screen */
  var form = $('#veil-form'), nameIn = $('#veil-name'), err = $('#veil-err');
  shell.caseField($('#veil-case'), function (n) { shell.goVariant(n); });
  var existing = saves.load(variant);
  if (existing) {
    var r = $('#veil-resume'); r.hidden = false; var h = doc.createElement('p'); h.textContent = 'Saved game for case ' + variant + ': ' + existing.name + ' · ' + saves.list()[variant - 1].summary; r.appendChild(h);
    var b = doc.createElement('button'); b.type = 'button'; b.className = 'hog-btn primary'; b.id = 'veil-continue'; b.textContent = 'Continue as ' + existing.name; b.addEventListener('click', function () { start(existing); }); r.appendChild(b);
    var p = doc.createElement('p'); p.className = 'veil-small'; p.textContent = 'Or start a new investigation below. That replaces this save for case ' + variant + '.'; r.appendChild(p);
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var nm = nameIn.value.replace(/[\u0000-\u001f\u007f]/g, '').trim();
    if (nm.length < 2) { err.textContent = 'Please type a name with at least two letters.'; nameIn.focus(); return; }
    if (existing && !root.confirm('Start over? This replaces the saved game for case ' + variant + '.')) return;
    err.textContent = ''; start(L.fresh(variant, nm.slice(0, 24)));
  });

  function start(rec) {
    var game = new L.Game(rec, saves); game.save(); root.__veilGame = game;
    $('#veil-title').hidden = true; $('#veil-play').hidden = false; shell.say('The Veil, case ' + variant + '. ' + game.objective());
    var stage = $('#veil-stage'), input = HOG.input.create(doc.body, { actions: ['interact', 'shift', 'run', 'journal', 'pause'] });
    shell.attachInput(input); root.__veilInput = input;
    var hud = { refresh: function () { var o = game.objective(); var el = $('#veil-obj'); if (el.textContent !== o) el.textContent = o; $('#h-case').disabled = false; } };
    var ui = V.ui.create(game, shell, hud); root.__veilUI = ui;
    $('#h-ev').addEventListener('click', ui.evidence); $('#h-case').addEventListener('click', ui.caseFile); $('#h-story').addEventListener('click', ui.story); $('#h-menu').addEventListener('click', ui.menu);
    hud.refresh();
    var Scene = V.scene.make(game, ui, shell, input);
    root.__veilPhaser = new root.Phaser.Game({
      type: root.Phaser.CANVAS, parent: stage, width: V.data.MW * V.data.TW, height: V.data.MH * V.data.TW, backgroundColor: '#05070b', banner: false, audio: { noAudio: true },
      fps: { target: 60, smoothStep: true }, render: { pixelArt: true, antialias: false, powerPreference: 'low-power' }, input: { keyboard: false, mouse: false, touch: false, gamepad: false },
      scale: { mode: root.Phaser.Scale.FIT, autoCenter: root.Phaser.Scale.CENTER_HORIZONTALLY }, scene: [Scene]
    });
    root.setInterval(hud.refresh, 600);
    shell.say('Use the arrow keys or the on-screen controls.');
  }
})(window);
