/* The Veil: its tour (owner-approved wording, docs/redesign/TOUR-SOUND-GAMIFY-PROPOSAL.md A3). Reads the game state and changes nothing in it. */
(function (root) {
  'use strict';
  var doc = root.document, $ = function (s) { return doc.querySelector(s); };
  function G() { return root.__veilGame; }
  function S() { return G() ? G().s : null; }
  function vis(sel) { var e = $(sel); if (!e) return null; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('[hidden]') ? e : null; }
  function playing() { var p = $('#veil-play'); return !!(p && !p.hidden && G()); }
  function modal() { return !!$('.hog-modal'); }
  function stage() { return vis('#veil-stage'); }
  function near(id, r) { var g = G(); if (!g) return false; var e = g.ents.filter(function (x) { return x.id === id; })[0]; return !!e && Math.hypot(e.x - g.s.px, e.y - g.s.py) <= r; }
  var start = null; function moved() { var s = S(); if (!s) return false; if (!start) start = [s.px, s.py]; return s.px !== start[0] || s.py !== start[1]; }
  var heard = false; if (root.HOG && root.HOG.audio) root.HOG.audio.onCue(function () { heard = true; });
  function soundOn() { var A = root.HOG && root.HOG.audio, b = A && A.bus && A.bus(); return !!(b && b.ctx.state === 'running' && !A.isMuted()); }
  var evOpened = false; doc.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#h-ev')) evOpened = true; }, true);

  var STEPS = [
    { id: 'move', when: function () { return playing() && !modal(); }, target: stage, text: { key: 'Move with the arrow keys or W A S D.', touch: 'Drag the stick to move.', mouse: 'Use the on-screen arrows.' }, done: moved },
    { id: 'sound', when: function () { return playing() && !modal() && soundOn(); }, target: function () { return vis('#hog-mute'); }, text: 'Sound on. Tap Sound to mute.', done: function () { return false; }, auto: 5000 },
    { id: 'bell', when: function () { return playing() && !modal() && !S().bell && near('bell', 2.5); }, target: stage, text: { key: 'Press E to pick up the bell.', touch: 'Tap Act.', mouse: 'Press E to pick up the bell.' }, done: function () { return S().bell; } },
    { id: 'note', when: function () { return playing() && !!$('#veil-w') && !G().writing('note1'); }, target: function () { return vis('#veil-w'); }, text: 'Use three senses. Show what you notice; do not name feelings.', done: function () { return !!G().writing('note1'); } },
    { id: 'veil', when: function () { var s = S(); return playing() && !modal() && s.bell && s.shifts === 0 && !!G().writing('note1'); }, target: function () { return vis('.hog-a-shift') || stage(); }, text: { key: 'Press V to shift worlds.', touch: 'Tap Veil.', mouse: 'Press V to shift worlds.' }, done: function () { return S().shifts > 0; } },
    { id: 'evidence', when: function () { return playing() && !modal() && S().found.length > 0; }, target: function () { return vis('#h-ev'); }, text: 'Clues you find go into Evidence.', done: function () { return evOpened; }, auto: 7000 },
    { id: 'echo', when: function () { var s = S(); return playing() && !modal() && s.world === 'E' && !s.doors && !G().hasClue('bellSeq'); }, target: stage, text: 'Listen here. The bell pattern is a clue.', done: function () { return G().hasClue('bellSeq') || S().doors; } },
    { id: 'plates', when: function () { var s = S(); return playing() && !modal() && !s.doors && G().hasClue('bellSeq') && near('plates', 2.5); }, target: stage, text: 'Strike the plates in the order you heard.', done: function () { return S().doors; } },
    { id: 'pews', when: function () { var s = S(); return playing() && !modal() && s.doors && !s.cabinet && s.world === 'E' && s.py <= 12 && s.px >= 9; }, target: stage, text: 'Read the marks in the Echo. Use them in the Living World.', done: function () { return G().hasClue('pewFront') || G().hasClue('pewMiddle') || G().hasClue('pewBack') || S().cabinet; } }
  ];
  var TIPS = [
    { label: 'Moving', text: 'Arrows or W A S D, or the on-screen controls.', step: 'move' },
    { label: 'Using things', text: 'Walk up to it, then press E or tap Act.' },
    { label: 'Shifting', text: 'V or the Veil button switches worlds once you hold the bell.', step: 'veil' },
    { label: 'Evidence', text: 'Every clue is saved in Evidence. Check it when stuck.', step: 'evidence' },
    { label: 'Field notes', text: 'Use at least three senses. Show, do not tell.' },
    { label: 'Story', text: 'Your notes feed the story you write at the end.' },
    { label: 'Sound', text: 'Every sound has a caption. Sound is optional.', step: 'sound' }
  ];
  var CARDS = [{ icon: 'bell', text: 'A closed chapel. A brass bell. Two worlds.' }, { icon: 'eye', text: 'Shift worlds to see what the other one hides.' }, { icon: 'pencil', text: 'Write field notes as you go. They become your story.' }];
  var PURPOSE = 'Explore two worlds, solve what happened, and write the story.', CONNECT = 'What you notice in each world becomes your field notes, then your story.';

  function boot() {
    if (!root.HOTour) return;
    var T = root.HOTour.create({ key: 'ho-veil-tour', cards: CARDS, steps: STEPS, tips: TIPS, purpose: PURPOSE, connect: CONNECT, helpButton: '[data-help]', low: function () { var sh = root.__veil && root.__veil.shell; return !!(sh && sh.settings && sh.settings.low); } });
    root.VeilTour = T;
    doc.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-help]'); if (b) { e.preventDefault(); T.help(b); } });
    /* the cards show the first time a player begins on this device */
    var begin = $('#veil-form'); if (begin) begin.addEventListener('submit', function () { setTimeout(function () { if (playing()) T.intro(false); }, 60); });
    /* before the first field note opens instead of a shift: one short bubble on the Veil control */
    var UI = function () { return root.__veilUI; };
    var hook = setInterval(function () { var u = UI(); if (!u) return; clearInterval(hook); u.firstNoteHint = function () { var t = vis('.hog-a-shift') || stage(); if (!t) return false; T.flash('A quick field note comes first.', t, 1400); return true; }; }, 100);
  }
  root.VeilTourText = { CARDS: CARDS, STEPS: STEPS.map(function (s) { return { id: s.id, text: s.text }; }), TIPS: TIPS, PURPOSE: PURPOSE, CONNECT: CONNECT, FIRST_NOTE: 'A quick field note comes first.' };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
