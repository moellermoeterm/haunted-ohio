/* The Haunting Files: its tour (owner-approved wording, docs/redesign/TOUR-SOUND-GAMIFY-PROPOSAL.md A2 and B). Reads the game state and changes nothing in it. */
(function (root) {
  'use strict';
  var doc = root.document, $ = function (s) { return doc.querySelector(s); };
  function api() { return root.HF_TOUR_API; }
  function S() { return api().S(); }
  function scr(n) { return S().screen === n; }
  function vis(sel) { var e = $(sel); if (!e) return null; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('[hidden]') ? e : null; }
  function nColl() { return Object.keys(S().coll).length; }
  var lockedTab = null; doc.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('.tab.locked'); if (t) { lockedTab = t.getAttribute('data-go'); setTimeout(function () { lockedTab = lockedTab; }, 0); } }, true);
  var STEPS = [
    { id: 'name', when: function () { return !!vis('#nm'); }, target: function () { return vis('#nm'); }, text: 'Enter your investigator name.', done: function () { var e = $('#nm'); return !!e && e.value.trim().length >= 2 || S().started; } },
    { id: 'read', when: function () { return !!vis('[data-act="readcase"]'); }, target: function () { return vis('[data-act="readcase"]'); }, text: 'Read the file, then press I have read the file.', done: function () { return S().readCase; } },
    { id: 'exhibit', when: function () { return scr('case') && S().readCase && !S().sel && nColl() === 0; }, target: function () { return vis('[data-ex]'); }, text: { key: 'Open an exhibit with Enter.', touch: 'Tap an exhibit.', mouse: 'Click an exhibit.' }, done: function () { return !!S().sel || nColl() > 0; } },
    { id: 'type', when: function () { return scr('case') && !!vis('[data-file]'); }, target: function () { return vis('[data-file]'); }, text: 'What kind of evidence is it? Pick one.', done: function () { return nColl() > 0; } },
    { id: 'review', when: function () { return scr('case') && !!vis('.tick.no'); }, target: function () { return vis('.tick.no'); }, text: 'Review means read why, then you will spot it next time.', done: function () { return false; }, auto: 6000 },
    { id: 'interview', when: function () { return api().unlocked('interview') && !scr('interview') && !S().contra.done; }, target: function () { return vis('[data-go="interview"]'); }, text: 'Both statements filed. The interview room is open.', done: function () { return scr('interview') || S().contra.done; } },
    { id: 'conflict', when: function () { return scr('interview') && !S().contra.done; }, target: function () { return vis('[data-i]'); }, text: 'Select only the lines that truly conflict.', done: function () { return S().contra.pick.length > 0 || S().contra.done; } },
    { id: 'board', when: function () { return scr('board') && S().links.length === 0; }, target: function () { return vis('[data-pin]'); }, text: 'Tap one exhibit, then another, to tie a string.', done: function () { return S().links.length > 0 || !!vis('#lkwhy'); } },
    { id: 'link', when: function () { return scr('board') && !!vis('#lkwhy'); }, target: function () { return vis('#lkwhy'); }, text: 'Supports, contradicts or explains? Say why in six words.', done: function () { return S().links.length > 0; } },
    { id: 'theory', when: function () { return scr('theory') && !S().th.done; }, target: function () { return vis('[data-th]'); }, text: 'Pick a theory and two exhibits that back it.', done: function () { return !!S().th.choice && S().th.cites.length >= 2 || S().th.done; } },
    { id: 'report', when: function () { return scr('report') && !S().filed; }, target: function () { return vis('[data-bind="report"]'); }, text: 'Cite exhibits by number, like E3.', done: function () { return S().filed; } },
    { id: 'locked', when: function () { return !!lockedTab; }, target: function () { return lockedTab ? vis('[data-go="' + lockedTab + '"]') : null; }, text: 'Locked tabs show what to finish first.', done: function () { return false; }, auto: 5000 }
  ];
  var TIPS = [
    { label: 'Filing', text: 'File at least six exhibits, including both witness statements.', step: 'type' },
    { label: 'Review', text: 'A Review tag means read the explanation and try again.' },
    { label: 'Board', text: 'Make at least two connections, each with a reason.', step: 'board' },
    { label: 'Theory', text: 'Say what new evidence would change your mind.' },
    { label: 'Report', text: 'At least 80 words, citing at least two exhibits.', step: 'report' },
    { label: 'Labels', text: 'Game material is fiction. Real history is labelled.' },
    { label: 'XP', text: 'XP rewards good reasoning and writing, not speed or guessing.' },
    { label: 'Saves', text: 'Progress saves in this browser. Export it to change devices.' }
  ];
  var CARDS = [{ icon: 'folder', text: 'You are a junior investigator. Evidence beats the scariest answer.' }, { icon: 'magnifier', text: 'File each exhibit. Find where the witnesses disagree.' }, { icon: 'pencil', text: 'Build a theory you can defend, then write it up.' }];
  var PURPOSE = 'Sort fact from legend, then write what you can prove.', CONNECT = 'The exhibits you file and connect become the evidence you cite in your report.';
  function boot() {
    if (!root.HOTour || !api()) return;
    var T = root.HOTour.create({ key: 'ho-haunting-files-tour', cards: CARDS, steps: STEPS, tips: TIPS, purpose: PURPOSE, connect: CONNECT, helpButton: '[data-help]' });
    root.HFTour = T;
    doc.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-help]'); if (b) { e.preventDefault(); T.help(b); } });
    doc.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act="newcase"],[data-act="newgame"]'); if (b) setTimeout(function () { T.intro(false); }, 0); });
    /* the locked-tab bubble is a one-off: it clears itself when shown long enough */
    setInterval(function () { if (lockedTab && T.state().done.indexOf('locked') >= 0) lockedTab = null; }, 500);
  }
  root.HFTourBoot = boot;
  root.HFTourText = { CARDS: CARDS, STEPS: STEPS.map(function (s) { return { id: s.id, text: s.text }; }), TIPS: TIPS, PURPOSE: PURPOSE, CONNECT: CONNECT };
})(window);
