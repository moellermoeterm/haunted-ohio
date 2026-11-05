/* THE VEIL: on-page UI (DOM, so it is keyboard-, touch- and screen-reader-friendly): evidence archive, bell plates, cabinet lock, writing editor,
   case file, story workshop, menu. Every string from a student or the game goes in through textContent (never innerHTML). */
(function (root) {
  'use strict';
  var HOG = root.HOG, V = root.HOG_VEIL, D = V.data, L = V.logic, doc = root.document;
  function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(label, cls, fn) { var b = el('button', 'hog-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }
  var SYM_GLYPH = { star: '★ Star', flame: '▲ Flame', tower: '♖ Tower' };
  var NOTE_GLYPH = { LOW: '▁ LOW', MIDDLE: '▃ MIDDLE', HIGH: '▇ HIGH' };

  function create(game, shell, hud) {
    var A = HOG.audio, ui = {}, tollTimers = [];
    ['LOW', 'MIDDLE', 'HIGH'].forEach(function (n) { A.define('bell' + n, { caption: 'a ' + n + ' bell', important: true, make: function (c, o) { A.tone(c, o, { f: game.d.noteF[n], dur: 1.4, gain: 0.22 }); A.tone(c, o, { f: game.d.noteF[n] * 2.4, dur: 0.9, gain: 0.07 }); } }); });
    function say(m) { shell.say(m); }
    ui.say = say;
    function para(t) { var p = el('p'); p.style.whiteSpace = 'pre-wrap'; p.textContent = t; return p; }
    function tag(t) { var p = el('p', 'hog-muted', t); p.style.fontSize = '.85rem'; p.style.opacity = '.8'; return p; }

    /* ----- clues ----- */
    ui.clue = function (id, after) {
      var c = game.clue(id), body = el('div'); body.appendChild(tag('Game material · ' + c.cat + ' · ' + (c.world === 'Both' ? 'both worlds' : 'the ' + c.world + ' World' )));
      body.appendChild(para(c.body)); var tail = el('p', 'hog-muted', 'Saved to your Evidence Archive.'); tail.style.fontSize = '.85rem'; body.appendChild(tail);
      shell.modal({ title: c.title, body: body, buttons: [{ label: 'Close', primary: true }], onClose: function () { hud.refresh(); if (after === 'note1') ui.note1(false); } });
    };
    /* ----- writing editor ----- */
    ui.write = function (o) {
      var body = el('div'); body.appendChild(para(o.prompt)); var lab = el('label', 'hog-label', o.label || 'Your writing'); lab.htmlFor = 'veil-w'; body.appendChild(lab);
      var ta = el('textarea'); ta.id = 'veil-w'; ta.value = o.value || ''; ta.rows = 7; ta.setAttribute('data-autofocus', '1'); ta.maxLength = 8000; body.appendChild(ta);
      var cnt = el('p', 'hog-muted'); cnt.setAttribute('aria-live', 'polite'); body.appendChild(cnt); var save;
      function upd() { var n = L.words(ta.value); cnt.textContent = n + ' words' + (n < o.min ? ' (at least ' + o.min + ' to save)' : ' — ready to save'); if (save) save.disabled = n < o.min; }
      ta.addEventListener('input', upd); var m;
      m = shell.modal({ title: o.title, body: body, buttons: [{ label: o.saveLabel || 'Save', primary: true, keepOpen: true, onClick: function () { if (L.words(ta.value) < o.min) return; var res = o.onSave(ta.value); if (res && res.ok === false) { shell.toast(res.msg); return; } m.close(); hud.refresh(); } }, { label: o.cancelLabel || 'Later' }], onClose: o.onClosed });
      save = m.el.querySelector('.hog-btn.primary'); upd(); return m;
    };
    ui.note1 = function (thenShift) {
      return ui.write({ title: 'Field note 1: the churchyard', prompt: 'You are standing outside a closed chapel. Using at least three senses (sight, sound, smell, touch), describe what you notice. Show it; do not tell us how you feel.', label: 'Field note', min: L.MIN.note1, value: game.writing('note1'), saveLabel: thenShift ? 'Save note and shift' : 'Save note',
        onSave: function (t) { game.write('note1', t); if (thenShift) setTimeout(function () { ui.shift(); }, 50); return { ok: true }; } });
    };
    ui.note2 = function () {
      return ui.write({ title: 'Field note 2: the Echo', prompt: 'Write what you just watched as a scene of about ' + L.MIN.note2 + ' words. Use what you saw and heard. Do not use feeling words (like "scary" or "sad"); let the details show it.', label: 'Field note', min: L.MIN.note2, value: game.writing('note2'),
        onSave: function (t) { game.write('note2', t); say('Field note saved. The Case File is ready.'); return { ok: true }; } });
    };

    /* ----- shift ----- */
    ui.shift = function () {
      if (shell.modalOpen) return;
      if (!game.canShift()) { shell.toast(game.shift().msg); return; }
      if (!game.writing('note1') && game.s.shifts === 0) { ui.note1(true); return; }
      var r = game.shift(); A.cue('shift', {}); hud.refresh();
      say(r.world === 'E' ? 'You shift into the Echo. The gate stands open and the air hums.' : 'You shift back to the Living World.' + (r.moved ? ' The sacristy door is locked again, so you are back in the nave.' : ''));
      clearToll(); if (r.world === 'E' && !game.s.doors) ui.toll();
    };
    function clearToll() { tollTimers.forEach(clearTimeout); tollTimers = []; }
    ui.toll = function () { clearToll(); game.d.bell.forEach(function (n, i) { tollTimers.push(setTimeout(function () { A.cue('bell' + n, { dir: 'up' }); }, 900 + i * 1000)); }); };

    /* ----- bell plates ----- */
    ui.plates = function () {
      var seq = [], body = el('div'); body.appendChild(para('Three bell plates are set into the doors. Strike four notes in the order the Echo’s bell tolled. (The pattern is in your Evidence Archive once you have heard it.)'));
      var shown = el('p'); shown.setAttribute('aria-live', 'polite'); shown.style.fontWeight = '700'; body.appendChild(shown); var row = el('div', 'row'); body.appendChild(row);
      function upd() { shown.textContent = 'Your pattern: ' + (seq.length ? seq.join(', ') : '(none yet)') + '  ·  ' + seq.length + ' of 4'; }
      D.NOTES.forEach(function (n) { var b = btn(NOTE_GLYPH[n], '', function () { A.cue('bell' + n, {}); seq.push(n); upd(); if (seq.length === 4) setTimeout(check, 600); }); b.style.minWidth = '8rem'; b.setAttribute('aria-label', 'Strike the ' + n + ' plate'); row.appendChild(b); });
      var m = shell.modal({ title: 'The bell plates', body: body, buttons: [{ label: 'Clear', keepOpen: true, onClick: function () { seq = []; upd(); } }, { label: 'Close' }] }); upd();
      function check() {
        var r = game.tryBell(seq.slice());
        if (r.ok) { A.cue('success', {}); m.close(); shell.toast('The bells ring true. The chapel doors swing open.'); hud.refresh(); }
        else { A.cue('no', {}); shell.toast('The doors stay shut.' + (r.hint ? ' ' + r.hint : '')); seq = []; upd(); }
      }
    };

    /* ----- cabinet lock ----- */
    ui.cabinet = function () {
      var dials = [0, 0, 0], body = el('div'); body.appendChild(para(game.clue('lock').body)); var row = el('div', 'row'); body.appendChild(row); var bs = [];
      function upd() { bs.forEach(function (b, i) { b.textContent = SYM_GLYPH[D.SYMBOLS[dials[i]]]; b.setAttribute('aria-label', 'Dial ' + (i + 1) + ': ' + D.SYMBOLS[dials[i]] + '. Press to change.'); }); }
      [0, 1, 2].forEach(function (i) { var b = btn('', '', function () { dials[i] = (dials[i] + 1) % 3; upd(); }); b.style.minWidth = '8rem'; bs.push(b); row.appendChild(b); }); upd();
      var m = shell.modal({ title: 'The cabinet lock', body: body, buttons: [{ label: 'Try the lock', primary: true, keepOpen: true, onClick: function () {
        var r = game.trySymbols(dials.map(function (x) { return D.SYMBOLS[x]; }));
        if (r.ok) { A.cue('success', {}); m.close(); shell.toast('The lock clicks open. Inside: a ledger and a letter.'); hud.refresh(); } else { A.cue('no', {}); shell.toast('The dials will not turn all the way.' + (r.hint ? ' ' + r.hint : '')); }
      } }, { label: 'Close' }] });
    };

    /* ----- the Echo scene (watch, never contact) ----- */
    ui.scene = function (first) {
      var lines = game.clue('echo').body.split('\n').filter(Boolean), i = 0, body = el('div'); body.appendChild(tag('Game material · an Echo of the past · you are only watching'));
      var out = el('div'); out.setAttribute('aria-live', 'polite'); body.appendChild(out); var next;
      function show() { out.appendChild(para(lines[i])); i++; if (i >= lines.length) { next.textContent = 'Done watching'; } }
      A.cue('whisper', {});
      var m = shell.modal({ title: 'The Echo of the night', body: body, buttons: [{ label: 'Next', primary: true, keepOpen: true, onClick: function () { if (i >= lines.length) { m.close(); hud.refresh(); if (!game.writing('note2')) ui.note2(); return; } show(); } }] });
      next = m.el.querySelector('.hog-btn.primary'); show();
    };

    /* ----- evidence archive ----- */
    ui.evidence = function () {
      var body = el('div'), found = game.s.found, total = Object.keys(game.d.clues).length;
      body.appendChild(para('Evidence found: ' + found.length + ' of ' + total + '. Everything here is Game material (fiction).'));
      if (!found.length) body.appendChild(para('Nothing yet. Explore the churchyard.'));
      found.forEach(function (id) { var c = game.clue(id); var d = el('details'); var s = el('summary', null, c.title + ' (' + c.cat + ')'); d.appendChild(s); d.appendChild(para(c.body));
        if (id === 'bellSeq') d.appendChild(btn('Hear it again', '', function () { ui.toll(); })); body.appendChild(d); });
      var row = el('div', 'row'); row.appendChild(btn('Field notes', '', function () { m.close(); ui.notes(); })); body.appendChild(row);
      var m = shell.modal({ title: 'Evidence Archive', body: body });
    };
    ui.notes = function () {
      var body = el('div'); body.appendChild(para('Your notes are saved in this browser only.'));
      [['note1', 'Field note 1: the churchyard'], ['note2', 'Field note 2: the Echo']].forEach(function (n) { var t = game.writing(n[0]); body.appendChild(el('h3', null, n[1])); body.appendChild(para(t || '(not written yet)')); });
      shell.modal({ title: 'Field notes', body: body, buttons: [{ label: 'Edit note 1', keepOpen: false, onClick: function () { setTimeout(function () { ui.note1(false); }, 30); } }, { label: 'Edit note 2', onClick: function () { setTimeout(function () { if (game.s.scene) ui.note2(); else shell.toast('You have not watched the Echo yet.'); }, 30); } }, { label: 'Close' }] });
    };

    /* ----- case file ----- */
    ui.caseFile = function () {
      var why = game.caseBlock(); if (why) { shell.toast(why); return; }
      var body = el('div'), pick = game.s.pick || '', cites = (game.s.cites || []).slice();
      body.appendChild(para(game.d.chapel + ' Chapel, ' + game.d.place + '. The township says the chapel is unsafe. The Keeper rang a bell that night, ' + game.d.night + '. What was the bell for?'));
      var fs = el('fieldset'); var lg = el('legend', 'hog-label', 'Choose the best explanation'); fs.appendChild(lg);
      game.d.options.forEach(function (o, i) { var l = el('label'); l.style.display = 'block'; l.style.margin = '.3rem 0'; var r = el('input'); r.type = 'radio'; r.name = 'veil-pick'; r.value = o.id; r.checked = o.id === pick; r.addEventListener('change', function () { pick = o.id; }); l.appendChild(r); l.appendChild(doc.createTextNode(' ' + o.text)); fs.appendChild(l); }); body.appendChild(fs);
      var fc = el('fieldset'); fc.appendChild(el('legend', 'hog-label', 'Cite exactly two clues that show it')); var boxes = [];
      game.s.found.forEach(function (id) { var l = el('label'); l.style.display = 'block'; var c = el('input'); c.type = 'checkbox'; c.value = id; c.checked = cites.indexOf(id) >= 0; boxes.push(c); l.appendChild(c); l.appendChild(doc.createTextNode(' ' + game.clue(id).title)); fc.appendChild(l); }); body.appendChild(fc);
      var lab = el('label', 'hog-label', 'Explain your answer in at least ' + L.MIN.why + ' words'); lab.htmlFor = 'veil-why'; body.appendChild(lab); var ta = el('textarea'); ta.id = 'veil-why'; ta.rows = 5; ta.value = game.writing('why'); ta.maxLength = 8000; body.appendChild(ta);
      var m = shell.modal({ title: 'Case File', body: body, buttons: [{ label: 'Submit', primary: true, keepOpen: true, onClick: function () {
        var cs = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
        var r = game.submitCase(pick, cs, ta.value); if (!r.ok) { A.cue('no', {}); shell.toast(r.msg); return; }
        A.cue('success', {}); m.close(); hud.refresh(); if (HOG.shell && root.HO_track) root.HO_track('chapter-complete');
        var b2 = el('div'); b2.appendChild(para('Case closed. The Keeper rang the bell to look after other people, and the township’s notice never said so. You found it by reading the evidence in two worlds.')); b2.appendChild(para('Now it is your turn to be the author. Use what you learned about atmosphere, clues and suspense to write an original horror story in the Story Workshop.'));
        shell.modal({ title: 'Chapter 1 solved', body: b2, buttons: [{ label: 'Open the Story Workshop', primary: true, onClick: function () { setTimeout(ui.story, 30); } }, { label: 'Later' }] });
      } }, { label: 'Close' }] });
    };

    /* ----- story workshop ----- */
    ui.story = function () {
      if (!game.s.caseDone) { shell.toast('Solve the Case File first. Then the Story Workshop opens.'); return; }
      var body = el('div'); body.appendChild(para('Write an original horror story in nine short beats (at least ' + L.MIN.beat + ' words each, ' + L.MIN.story + ' in all). The strange thing may be seen, heard and investigated, never summoned. Keep it school-appropriate: suspense, not gore.'));
      var tl = el('label', 'hog-label', 'Story title'); tl.htmlFor = 'veil-story-title'; body.appendChild(tl); var ti = el('input'); ti.type = 'text'; ti.id = 'veil-story-title'; ti.maxLength = 80; ti.value = game.writing('title'); ti.addEventListener('change', function () { game.write('title', ti.value); }); body.appendChild(ti);
      var list = el('div', 'hog-slots'); body.appendChild(list);
      L.BEATS.forEach(function (b, i) { var r = el('div', 'hog-slot'), g = el('div', 'grow'); g.appendChild(el('b', null, (i + 1) + '. ' + b.n + (game.beatDone(b.k) ? '  ✓' : ''))); g.appendChild(el('div', 'hog-muted', game.beatDone(b.k) ? L.words(game.writing('b_' + b.k)) + ' words' : 'not written yet')); r.appendChild(g);
        r.appendChild(btn(game.beatDone(b.k) ? 'Edit' : 'Write', '', function () { game.write('title', ti.value); m.close(); ui.write({ title: b.n, prompt: b.p, label: 'Your beat', min: L.MIN.beat, value: game.writing('b_' + b.k), saveLabel: 'Save beat', cancelLabel: 'Back', onSave: function (t) { return game.saveBeat(b.k, t); }, onClosed: function () { setTimeout(ui.story, 30); } }); })); list.appendChild(r); });
      var tot = el('p', 'hog-muted', 'Words so far: ' + game.storyWords() + ' of ' + L.MIN.story + ' needed.'); tot.setAttribute('aria-live', 'polite'); body.appendChild(tot);
      var m = shell.modal({ title: 'Story Workshop', body: body, buttons: [{ label: game.storyReady() ? 'Finish and read my story' : 'Keep writing', primary: game.storyReady(), onClick: function () { game.write('title', ti.value); if (game.storyReady()) { game.finishStory(); A.cue('success', {}); hud.refresh(); setTimeout(function () { ui.storyDone(); }, 30); } } }, { label: 'Close' }] });
    };
    ui.storyDone = function () {
      var body = el('div'), ta = el('textarea'); ta.readOnly = true; ta.rows = 14; ta.value = game.storyText(); ta.setAttribute('aria-label', 'Your finished story'); body.appendChild(para('Your story is finished. Copy it or download it to keep it; nothing is sent anywhere.')); body.appendChild(ta);
      shell.modal({ title: 'Your story', body: body, buttons: [{ label: 'Copy', keepOpen: true, onClick: function () { copy(ta); } }, { label: 'Download .txt', keepOpen: true, onClick: function () { download('the-veil-story-case' + game.rec.variant + '.txt', game.storyText()); } }, { label: 'Close', primary: true }] });
    };
    function copy(ta) { try { ta.select(); if (root.navigator.clipboard) root.navigator.clipboard.writeText(ta.value).then(function () { shell.toast('Copied.'); }, function () { doc.execCommand('copy'); shell.toast('Copied.'); }); else { doc.execCommand('copy'); shell.toast('Copied.'); } } catch (e) { shell.toast('Select the text and copy it.'); } }
    function download(name, text) { var b = new Blob([text], { type: 'text/plain' }), u = URL.createObjectURL(b), a = el('a'); a.href = u; a.download = name; doc.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 2000); }

    /* ----- menu + help ----- */
    ui.menu = function () {
      if (shell.modalOpen) return; var body = el('div');
      body.appendChild(para('Move: arrows or WASD, or the on-screen stick. E / Enter: use what is near. V: shift between the Living World and the Echo. J: Evidence Archive. Esc: this menu. Everything works by keyboard or touch.'));
      body.appendChild(para('Case ' + game.rec.variant + ' · Investigator ' + game.rec.name + ' · ' + game.d.chapel + ' Chapel (Game material).'));
      shell.modal({ title: 'Menu', body: body, buttons: [
        { label: 'Evidence', onClick: function () { setTimeout(ui.evidence, 30); } }, { label: 'Case File', onClick: function () { setTimeout(ui.caseFile, 30); } }, { label: 'Story Workshop', onClick: function () { setTimeout(ui.story, 30); } },
        { label: 'Copy my journal', keepOpen: true, onClick: function () { var t = el('textarea'); t.value = game.reportText(); doc.body.appendChild(t); copy(t); t.remove(); } },
        { label: 'Download my journal', keepOpen: true, onClick: function () { download('the-veil-journal-case' + game.rec.variant + '.txt', game.reportText()); } },
        { label: 'Saves', onClick: function () { setTimeout(shell.openSaves, 30); } }, { label: 'Settings', onClick: function () { setTimeout(shell.openSettings, 30); } }, { label: 'Resume', primary: true }] });
    };

    /* a result from game.interact() */
    ui.act = function (r) {
      if (!r) return; if (r.msg) { shell.toast(r.msg); return; }
      if (r.open === 'clue') ui.clue(r.id, r.after); else if (r.open === 'plates') ui.plates(); else if (r.open === 'cabinet') ui.cabinet(); else if (r.open === 'scene') ui.scene(r.first);
    };
    game.on('clue', function (id) { shell.say('New evidence: ' + game.clue(id).title); });
    return ui;
  }
  V.ui = { create: create };
})(typeof window !== 'undefined' ? window : globalThis);
