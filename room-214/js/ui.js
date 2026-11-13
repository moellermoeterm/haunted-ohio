/* ROOM 214: on-page UI (DOM): HUD, notes, the safe, journal and final account, menu. Student text only ever goes in with textContent / value.
   Every sound in this game is shown as a caption with a direction, so it can be played on mute. All content is GAME MATERIAL. */
(function (root) {
  'use strict';
  var HOG = root.HOG, R = root.HOG_R214, D = R.data, L = R.logic, doc = root.document;
  function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(label, cls, fn) { var b = el('button', 'hog-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }
  function dirOf(dx, dy, d) { if (d < 2.6) return 'near'; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }

  function create(game, shell, hud) {
    var A = HOG.audio, ui = {}, lastCue = {};
    var defs = { porterStep: ['slow footsteps', function (c, o) { A.noise(c, o, { f: 220, dur: 0.1, gain: 0.12, filter: 'lowpass' }); }], porterNear: ['slow breathing close by', function (c, o) { A.noise(c, o, { f: 500, q: 2, dur: 0.9, attack: 0.3, gain: 0.08 }); }],
      alertSeen: ['a sharp bell: he has seen you', function (c, o) { A.tone(c, o, { f: 880, dur: 0.5, gain: 0.2 }); A.tone(c, o, { f: 1320, dur: 0.4, gain: 0.1, at: 0.05 }); }], alertHeard: ['the footsteps turn toward the sound', function (c, o) { A.tone(c, o, { f: 300, to: 220, dur: 0.3, type: 'triangle', gain: 0.12 }); }],
      playerLoud: ['your footsteps echo', function (c, o) { A.noise(c, o, { f: 400, dur: 0.12, gain: 0.16, filter: 'lowpass' }); }], bellLand: ['a bell clangs', function (c, o) { A.tone(c, o, { f: 520, dur: 1.2, gain: 0.22 }); A.tone(c, o, { f: 1250, dur: 0.8, gain: 0.08 }); }],
      doorCreak: ['a door creaks', function (c, o) { A.tone(c, o, { f: 170, to: 120, dur: 0.5, type: 'sawtooth', gain: 0.07 }); }], checkedOut: ['a calm voice: "Checking you out, guest."', function (c, o) { A.tone(c, o, { f: 196, dur: 0.7, gain: 0.14 }); }] };
    Object.keys(defs).forEach(function (k) { A.define(k, { caption: defs[k][0], important: k === 'alertSeen', make: defs[k][1] }); });
    ui.say = function (m) { shell.say(m); };
    function para(t) { var p = el('p'); p.style.whiteSpace = 'pre-wrap'; p.textContent = t; return p; }
    function tag(t) { var p = el('p', 'hog-muted', t); p.style.fontSize = '.85rem'; p.style.opacity = '.8'; return p; }

    /* ----- sound and noise (always captioned) ----- */
    ui.cue = function (c) { var now = Date.now(); if (lastCue[c.name] && now - lastCue[c.name] < 1200) return; lastCue[c.name] = now; A.cue(c.name, { dir: dirOf(c.dx, c.dy, c.d) }); };
    ui.alert = function (a) { if (a.kind === 'seen') A.cue('alertSeen', { dir: 'near' }); else A.cue('alertHeard', {}); };
    ui.noise = function (n) { if (n.src === 'bell') A.cue('bellLand', { dir: dirOf(n.x - game.pl.x, n.y - game.pl.y, Math.hypot(n.x - game.pl.x, n.y - game.pl.y)) }); else if (n.level >= 6) A.cue('playerLoud', {}); else if (n.level === 3) A.cue('doorCreak', {}); };
    ui.caught = function () { A.cue('checkedOut', {}); shell.toast('The Night Porter tips his cap: "Checking you out, guest." You wake at your last checkpoint. Everything you found is still with you.'); hud.refresh(); };
    ui.item = function (it) { var t = { card: 'You take the keycard.', battery: 'You take a battery. Your light is stronger.', bell: 'You take a room-service bell. Throw it (T) to lure him away.', note: 'You read the note.', ledger: 'You take the ledger.' }[it.kind]; shell.toast(t); hud.refresh(); if (it.kind === 'note') ui.read(game.d.notes[it.id], 'Game material · note'); if (it.kind === 'ledger') ui.ledger(); };
    ui.floor = function (e) { hud.refresh(); shell.say('Floor ' + (e.f + 1) + '. Checkpoint saved.'); if (e.first && game.needJournal(e.f)) setTimeout(function () { ui.journalEntry(e.f); }, 400); };

    /* ----- actions ----- */
    ui.act = function (nr) {
      if (!nr) return;
      switch (nr.kind) {
        case 'item': { var r = game.pick(nr.item); break; }
        case 'up': { var u = game.stairs(1); if (!u.ok) shell.toast(u.msg); break; }
        case 'down': { game.stairs(-1); break; }
        case 'hide': case 'unhide': ui.hide(); break;
        case 'safe': if (game.s.safe) shell.toast('The safe is open. Look for the door in the wall.'); else ui.safe(); break;
        case 'exit': ui.exit(); break;
      }
    };
    ui.hide = function () { var r = game.hide(); if (!r.ok) shell.toast(r.msg); else shell.say(game.pl.hidden ? 'You are hidden. Stay quiet.' : 'You come out of hiding.'); };
    ui.light = function () { var on = game.toggleLight(); shell.say(on ? 'Flashlight on.' : game.s.batt <= 0 ? 'The battery is empty.' : 'Flashlight off. You are harder to see.'); };
    ui.throwBell = function () { var r = game.throwBell(); if (!r.ok) shell.toast(r.msg); hud.refresh(); };

    /* ----- reading ----- */
    ui.read = function (n, kind) { var body = el('div'); body.appendChild(tag(kind)); body.appendChild(para(n.body)); shell.modal({ title: n.title, body: body, buttons: [{ label: 'Close', primary: true }] }); };
    ui.ledger = function () { ui.read(game.d.ledger, 'Game material · the room that is not on the plan'); };

    /* ----- the safe ----- */
    ui.safe = function () {
      var dg = [0, 0, 0], body = el('div'), found = game.digitsFound(), names = ['lobby', 'second floor', 'third floor'];
      body.appendChild(para('A three-number combination safe. Your notes say: ' + names.map(function (n, i) { return n + ': ' + (found[i] ? game.d.digits[i] : '?'); }).join(', ') + '. (Read the notes on every floor.)'));
      var row = el('div', 'row'), bs = []; [0, 1, 2].forEach(function (i) { var b = btn('0', '', function () { dg[i] = (dg[i] + 1) % 10; upd(); }); b.style.minWidth = '4.5rem'; b.style.fontSize = '1.6rem'; bs.push(b); row.appendChild(b); }); body.appendChild(row);
      function upd() { bs.forEach(function (b, i) { b.textContent = String(dg[i]); b.setAttribute('aria-label', 'Number ' + (i + 1) + ': ' + dg[i] + '. Press to add one.'); }); } upd();
      var m = shell.modal({ title: 'The safe', body: body, buttons: [{ label: 'Try the numbers', primary: true, keepOpen: true, onClick: function () { var r = game.trySafe(dg.slice()); if (r.ok) { A.cue('success', {}); m.close(); shell.toast('Click. The safe opens, and a door in the wall swings ajar.'); hud.refresh(); } else { A.cue('no', {}); shell.toast('The safe does not open.'); } } }, { label: 'Close' }] });
    };

    /* ----- writing ----- */
    ui.write = function (o) {
      var body = el('div'); body.appendChild(para(o.prompt)); var lab = el('label', 'hog-label', o.label || 'Your writing'); lab.htmlFor = 'r-w'; body.appendChild(lab);
      var ta = el('textarea'); ta.id = 'r-w'; ta.value = o.value || ''; ta.rows = 7; ta.setAttribute('data-autofocus', '1'); ta.maxLength = 8000; body.appendChild(ta); var cnt = el('p', 'hog-muted'); cnt.setAttribute('aria-live', 'polite'); body.appendChild(cnt); var save;
      function upd() { var n = L.words(ta.value); cnt.textContent = n + ' words' + (n < o.min ? ' (at least ' + o.min + ' to save)' : ' — ready to save'); if (save) save.disabled = n < o.min; } ta.addEventListener('input', upd);
      var m = shell.modal({ title: o.title, body: body, buttons: [{ label: o.saveLabel || 'Save', primary: true, keepOpen: true, onClick: function () { if (L.words(ta.value) < o.min) return; o.onSave(ta.value); m.close(); hud.refresh(); } }, { label: o.cancelLabel || 'Later' }], onClose: o.onClosed });
      save = m.el.querySelector('.hog-btn.primary'); upd(); return m;
    };
    ui.journalEntry = function (f) {
      return ui.write({ title: 'Journal: floor ' + (f + 1), prompt: 'You are at a stairwell checkpoint. Write what you have heard, seen and felt so far. Use at least three senses and show it with details; no feeling words.', label: 'Journal entry', min: L.MIN.journal, value: game.writing('j' + f), saveLabel: 'Save entry', onSave: function (t) { game.write('j' + f, t); shell.say('Journal entry saved.'); } });
    };
    ui.account = function () {
      return ui.write({ title: 'Your account of Room 214', prompt: 'What happened in Room 214? Write what you found and what you think it means, in your own words (about ' + L.MIN.account + ' words). Say what you saw; separate what you know from what you guess.', label: 'Account', min: L.MIN.account, value: game.writing('acct'), saveLabel: 'Save account', onSave: function (t) { game.write('acct', t); } });
    };
    ui.seed = function () {
      return ui.write({ title: 'Story seed', prompt: 'Start your own horror story set in a place that is closed for the night. Write the opening scene (about ' + L.MIN.seed + ' words). The strange thing may be seen, heard and investigated, never summoned. Keep it school-appropriate: suspense, not gore.', label: 'Story seed', min: L.MIN.seed, value: game.writing('seed'), saveLabel: 'Save story seed', onSave: function (t) { game.write('seed', t); } });
    };
    ui.journal = function () {
      if (shell.modalOpen) return; var body = el('div'); body.appendChild(para('Your journal is saved in this browser only.'));
      [[1, 'Floor 2 entry'], [2, 'Floor 3 entry']].forEach(function (e) { body.appendChild(el('h3', null, e[1])); body.appendChild(para(game.writing('j' + e[0]) || '(not written yet)')); });
      body.appendChild(el('h3', null, 'Notes found')); var fnd = game.s.found; if (!fnd.length) body.appendChild(para('None yet.')); fnd.forEach(function (id) { var d = el('details'); d.appendChild(el('summary', null, game.d.notes[id].title)); d.appendChild(para(game.d.notes[id].body)); body.appendChild(d); });
      body.appendChild(el('h3', null, 'Final writing')); body.appendChild(para('Account: ' + (L.words(game.writing('acct')) ? L.words(game.writing('acct')) + ' words' : 'not written') + '  ·  Story seed: ' + (L.words(game.writing('seed')) ? L.words(game.writing('seed')) + ' words' : 'not written')));
      var r1 = el('div', 'row'); [1, 2].forEach(function (f) { r1.appendChild(btn('Write floor ' + (f + 1) + ' entry', '', function () { m.close(); setTimeout(function () { if (game.s.seen.indexOf(f) < 0) shell.toast('You have not been to that floor yet.'); else ui.journalEntry(f); }, 30); })); }); body.appendChild(r1);
      var r2 = el('div', 'row'); r2.appendChild(btn('Write my account', '', function () { m.close(); setTimeout(function () { if (!game.s.ledger) shell.toast('Find out what is in Room 214 first.'); else ui.account(); }, 30); })); r2.appendChild(btn('Write my story seed', '', function () { m.close(); setTimeout(function () { if (!game.s.ledger) shell.toast('Find out what is in Room 214 first.'); else ui.seed(); }, 30); })); body.appendChild(r2);
      var m = shell.modal({ title: 'Journal', body: body });
    };

    /* ----- leaving the hotel ----- */
    ui.exit = function () {
      var b = game.finishBlock(); if (b) { shell.toast(b); if (game.s.ledger) setTimeout(ui.journal, 600); return; }
      game.finish(); A.cue('success', {}); if (root.HO_track) root.HO_track('chapter-complete');
      var body = el('div'); body.appendChild(para('You push through the front door into the cold air. Behind you the lobby lamp goes out, and the doors lock with a soft, final click. Whatever the Night Porter was waiting for, it is over.')); body.appendChild(para('Your written account and story seed are saved. Copy or download your journal to keep it.'));
      shell.modal({ title: 'You made it out', body: body, buttons: [{ label: 'Download my journal', keepOpen: true, onClick: function () { download('room-214-journal-' + String(game.rec.name || 'player').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) + '.txt', ui.reportText()); } }, { label: 'Close', primary: true }] }); hud.refresh();
    };
    ui.reportText = function () {
      var d = game.d, t = 'ROOM 214\nInvestigator: ' + game.rec.name + '\nGame material (fiction): ' + d.hotel + '.\n\n';
      [[1, 'JOURNAL, FLOOR 2'], [2, 'JOURNAL, FLOOR 3']].forEach(function (e) { if (game.writing('j' + e[0])) t += e[1] + '\n' + game.writing('j' + e[0]) + '\n\n'; });
      t += 'NOTES FOUND (' + game.s.found.length + ' of 3)\n' + game.s.found.map(function (id) { return '- ' + d.notes[id].title; }).join('\n') + '\n\n'; if (game.writing('acct')) t += 'MY ACCOUNT OF ROOM 214\n' + game.writing('acct') + '\n\n'; if (game.writing('seed')) t += 'STORY SEED\n' + game.writing('seed') + '\n'; t += '\nTimes checked out by the Night Porter: ' + game.s.caught + '\n'; return t;
    };
    function download(name, text) { var b = new Blob([text], { type: 'text/plain' }), u = URL.createObjectURL(b), a = el('a'); a.href = u; a.download = name; doc.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 2000); }
    function copy(text) { var ta = el('textarea'); ta.value = text; doc.body.appendChild(ta); ta.select(); try { if (root.navigator.clipboard) root.navigator.clipboard.writeText(text); else doc.execCommand('copy'); shell.toast('Copied.'); } catch (e) { shell.toast('Select the text and copy it.'); } ta.remove(); }

    ui.menu = function () {
      if (shell.modalOpen) return; var body = el('div');
      body.appendChild(para('Move: arrows or WASD. Hold C to sneak (silent), Shift to run (loud). E: use. H: hide. F: flashlight. T: throw a bell. J: journal. Esc: this menu. Everything also works with the on-screen buttons. He never hurts anyone: if he reaches you he checks you out to your last checkpoint and you keep everything.'));
      body.appendChild(para('Investigator ' + game.rec.name + ' · ' + game.d.hotel + ' (Game material).'));
      shell.modal({ title: 'Menu', body: body, buttons: [{ label: 'Journal', onClick: function () { setTimeout(ui.journal, 30); } }, { label: 'Copy my journal', keepOpen: true, onClick: function () { copy(ui.reportText()); } }, { label: 'Download my journal', keepOpen: true, onClick: function () { download('room-214-journal-' + String(game.rec.name || 'player').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) + '.txt', ui.reportText()); } }, { label: 'Saves', onClick: function () { setTimeout(shell.openSaves, 30); } }, { label: 'Settings', onClick: function () { setTimeout(shell.openSettings, 30); } }, { label: 'Resume', primary: true }] });
    };
    return ui;
  }
  R.ui = { create: create };
})(typeof window !== 'undefined' ? window : globalThis);
