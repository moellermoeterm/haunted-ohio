/* ROOM 214: boot. Title screen (name only; the case is assigned at random), save/continue, then start Phaser. Nothing here touches the network except HO_track(game-opened). */
(function (root) {
  'use strict';
  var HOG = root.HOG, R = root.HOG_R214, L = R.logic, doc = root.document, $ = function (s) { return doc.querySelector(s); };
  /* Which case: a leader preview (?preview=N, a throwaway save), else the case already assigned on this device, else the case of a save made
     before cases were assigned. 0 means none yet: it is picked at random when the student first presses Begin. Its number is never shown. */
  var preview = HOG.variant.preview();
  var saves = HOG.save.create({ game: 'room214', baseKey: preview ? 'ho-room214-pv' : 'ho-room214', stateSchema: L.STATE_SCHEMA, summary: function (d) { return 'floor ' + (d.state.floor + 1) + ' · ' + d.state.got.length + ' items' + (d.state.done ? ' · escaped' : ''); } });
  var variant = preview || HOG.variant.assigned('room214') || HOG.variant.legacy('room214', saves);
  if (!preview && variant && !HOG.variant.assigned('room214')) HOG.variant.assign('room214', variant);
  var shell = HOG.shell.mount({ game: 'room214', title: 'Room 214', variant: variant, preview: preview, saves: saves, baseKey: 'ho-room214', home: '../', onCleared: function () { root.location.reload(); } });
  root.__r214 = { saves: saves, shell: shell, variant: variant };
  try { if (root.HO_track) root.HO_track('game-opened-room-214'); } catch (e) { /* never break the game */ }
  var form = $('#r-form'), nameIn = $('#r-name'), err = $('#r-err');
  var existing = variant ? saves.load(variant) : null;
  if (existing) {
    var r = $('#r-resume'); r.hidden = false; var h = doc.createElement('p'); h.textContent = 'Saved game: ' + existing.name + ' · ' + saves.list()[variant - 1].summary; r.appendChild(h);
    var b = doc.createElement('button'); b.type = 'button'; b.className = 'hog-btn primary'; b.id = 'r-continue'; b.textContent = 'Continue as ' + existing.name; b.addEventListener('click', function () { start(existing); }); r.appendChild(b);
    var p = doc.createElement('p'); p.className = 'r-small'; p.textContent = 'Or start over below. That replaces this saved game.'; r.appendChild(p);
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var nm = nameIn.value.replace(/[\u0000-\u001f\u007f]/g, '').trim();
    if (nm.length < 2) { err.textContent = 'Please type a name with at least two letters.'; nameIn.focus(); return; }
    if (existing && !root.confirm('Start over? This replaces your saved game.')) return;
    /* the first Begin on this device: pick one of the six cases at random and keep it (starting over never picks again) */
    if (!variant) { variant = HOG.variant.roll(); HOG.variant.assign('room214', variant); shell.setVariant(variant); root.__r214.variant = variant; }
    err.textContent = ''; start(L.fresh(variant, nm.slice(0, 24)));
  });
  function start(rec) {
    var game = new L.Game(rec, saves); game.save(); root.__r214Game = game;
    $('#r-title').hidden = true; $('#r-play').hidden = false;
    var stage = $('#r-stage'), input = HOG.input.create(doc.body, { actions: ['interact', 'hide', 'light', 'throw', 'sneak', 'run', 'journal', 'pause'] });
    shell.attachInput(input); root.__r214Input = input;
    var hud = { refresh: function () { var o = game.objective(), s = game.s, el = $('#r-obj'); if (el.textContent !== o) el.textContent = o; var t = 'Floor ' + (game.pl.f + 1) + ' · Battery ' + s.batt + '% · Bells ' + s.bells + ' · Keycard ' + s.cards + ' · Checked out ' + s.caught + '×'; var st = $('#r-stats'); if (st.textContent !== t) st.textContent = t; } };
    var ui = R.ui.create(game, shell, hud); root.__r214UI = ui;
    $('#h-journal').addEventListener('click', ui.journal); $('#h-menu').addEventListener('click', ui.menu);
    hud.refresh(); root.setInterval(hud.refresh, 500);
    root.__r214Phaser = new root.Phaser.Game({
      type: root.Phaser.CANVAS, parent: stage, width: R.data.W * R.data.TW, height: R.data.H * R.data.TW, backgroundColor: '#000000', banner: false, audio: { noAudio: true },
      fps: { target: 60, smoothStep: true }, render: { pixelArt: true, antialias: false, powerPreference: 'low-power' }, input: { keyboard: false, mouse: false, touch: false, gamepad: false },
      scale: { mode: root.Phaser.Scale.FIT, autoCenter: root.Phaser.Scale.CENTER_HORIZONTALLY }, scene: [R.scene.make(game, ui, shell, input)]
    });
    shell.say('Room 214. ' + game.objective());
  }
})(window);
