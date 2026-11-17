/* Room 214: its tour (owner-approved wording, docs/redesign/TOUR-SOUND-GAMIFY-PROPOSAL.md A4 and B). Reads the game state and changes nothing in it. */
(function (root) {
  'use strict';
  var doc = root.document, $ = function (s) { return doc.querySelector(s); };
  function G() { return root.__r214Game; }
  function vis(sel) { var e = $(sel); if (!e) return null; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('[hidden]') ? e : null; }
  function playing() { var p = $('#r-play'); return !!(p && !p.hidden && G() && G().pl); }
  function free() { return playing() && !$('.hog-modal'); }
  function stage() { return vis('#r-stage'); }
  function nearItem(kind) { var g = G(); return !!g.d.items.filter(function (it) { return it.kind === kind && it.floor === g.pl.f && g.s.got.indexOf(it.id) < 0 && Math.hypot(it.x + 0.5 - g.pl.x, it.y + 0.5 - g.pl.y) < 2.5; })[0]; }
  var start = null; function moved() { var g = G(); if (!g) return false; if (!start) start = [g.pl.x, g.pl.y]; return Math.hypot(g.pl.x - start[0], g.pl.y - start[1]) > 0.8; }
  var F = { sneaked: false, heard: false, hidden: false, left: false, thrown: false, light: false, journal: false, caughtAt: null };
  if (root.HOG && root.HOG.audio) root.HOG.audio.onCue(function (c) { if (c.name === 'porterStep' || c.name === 'porterNear') F.heard = true; });
  setInterval(function () { var g = G(), I = root.__r214Input; if (!g || !g.pl) return; if (I && I.held && I.held('sneak')) F.sneaked = true; if (g.pl.hidden) F.hidden = true; else if (F.hidden) F.left = true; if (g.s.caught && F.caughtAt === null) F.caughtAt = [g.pl.x, g.pl.y]; if ($('.hog-modal') && /Journal/.test(($('.hog-modal h2') || {}).textContent || '')) F.journal = true; }, 150);
  var bells0 = null, light0 = null;

  var STEPS = [
    { id: 'move', when: free, target: stage, text: { key: 'Move with the arrow keys or W A S D.', touch: 'Drag the stick to move.', mouse: 'Move with the arrow keys or W A S D.' }, done: moved },
    { id: 'ring', when: function () { return free() && G().rings.some(function (r) { return r.src === 'player'; }); }, target: stage, text: 'Rings show how far your noise travels.', done: function () { return false; }, auto: 4000 },
    { id: 'sneak', when: function () { return free() && G().pl.f === 0 && moved(); }, target: function () { return vis('.hog-a-sneak') || stage(); }, text: { key: 'Hold C to sneak. Sneaking is silent.', touch: 'Hold Sneak to move silently.', mouse: 'Hold C to sneak. Sneaking is silent.' }, done: function () { return F.sneaked; } },
    { id: 'card', when: function () { return free() && G().s.cards < 1 && nearItem('card'); }, target: stage, text: { key: 'Press E to take the keycard.', touch: 'Tap Act.', mouse: 'Press E to take the keycard.' }, done: function () { return G().s.cards > 0; } },
    { id: 'hide', when: function () { return free() && F.heard && !G().pl.hidden; }, target: function () { return vis('.hog-a-hide') || stage(); }, text: { key: 'Footsteps. Hide: walk to the closet and press H.', touch: 'Footsteps. Hide: walk to the closet and tap Hide.', mouse: 'Footsteps. Hide: walk to the closet and press H.' }, done: function () { return F.hidden; } },
    { id: 'hidden', when: function () { return free() && G().pl.hidden; }, target: stage, text: 'Hidden. Wait until the footsteps fade.', done: function () { return F.left; } },
    { id: 'bell', when: function () { var g = G(); if (bells0 === null && g) bells0 = g.s.bells; return free() && g.s.bells > 0; }, target: function () { return vis('.hog-a-throw') || stage(); }, text: { key: 'Press T to throw a bell and lure him.', touch: 'Tap Throw.', mouse: 'Press T to throw a bell and lure him.' }, done: function () { return G().rings.some(function (r) { return r.src === 'bell'; }); } },
    { id: 'light', when: function () { var g = G(); if (light0 === null && g) light0 = g.pl.light; return free() && g.s.batt < 30; }, target: function () { return vis('.hog-a-light') || stage(); }, text: { key: 'F turns your light off to save battery.', touch: 'Tap Light.', mouse: 'F turns your light off to save battery.' }, done: function () { return G().pl.light !== light0; }, auto: 8000 },
    { id: 'stairs', when: function () { var g = G(); return free() && g.pl.f === 0 && g.s.cards > 0 && !!g.nearTile('u', 2.5); }, target: stage, text: 'Each floor up needs a keycard.', done: function () { return G().pl.f > 0; } },
    { id: 'journal', when: function () { return free() && G().pl.f > 0; }, target: function () { return vis('#h-journal'); }, text: { key: 'Press J. Write what you noticed down there.', touch: 'Tap Journal.', mouse: 'Press J. Write what you noticed down there.' }, done: function () { return F.journal; } },
    { id: 'caught', when: function () { return free() && G().s.caught > 0; }, target: stage, text: 'Caught. You restart here and keep everything you found.', done: function () { var g = G(); return !!F.caughtAt && Math.hypot(g.pl.x - F.caughtAt[0], g.pl.y - F.caughtAt[1]) > 0.8; } },
    { id: 'safe', when: function () { var g = G(); return free() && g.pl.f === 1 && !g.s.safe && !!g.nearTile('s', 2.2); }, target: stage, text: 'Enter the three numbers you found, one per floor.', done: function () { return G().s.safe || !!$('.hog-modal'); } }
  ];
  var TIPS = [
    { label: 'Moving', text: 'Arrows or W A S D, or the stick.', step: 'move' },
    { label: 'Sneak', text: 'Hold C or Sneak. Silent, but slow.', step: 'sneak' },
    { label: 'Run', text: 'Hold Shift or Run. Fast, but loud.' },
    { label: 'Hide', text: 'Closets, beds and laundry carts hide you. Press H.', step: 'hide' },
    { label: 'Light', text: 'F turns your flashlight off and saves battery.', step: 'light' },
    { label: 'Bell', text: 'Throw a bell with T to pull him away.', step: 'bell' },
    { label: 'Caught', text: 'You go back to a checkpoint and keep everything.' },
    { label: 'Journal', text: 'Write about each floor before you climb.', step: 'journal' },
    { label: 'Sound', text: 'Every sound has a caption and a direction. Sound is optional.' }
  ];
  var CARDS = [{ icon: 'hotel', text: 'A closed hotel. A floor plan with a missing room.' }, { icon: 'flashlight', text: 'Something walks the halls. Stay quiet. Stay hidden.' }, { icon: 'pencil', text: 'Collect what you sense. It becomes your story.' }];
  var PURPOSE = 'Find the room missing from the plan, unseen, and collect details for your story.', CONNECT = 'Every detail you notice becomes a note, and your notes become your story seed.';

  function boot() {
    if (!root.HOTour) return;
    var T = root.HOTour.create({ key: 'ho-room214-tour', cards: CARDS, steps: STEPS, tips: TIPS, purpose: PURPOSE, connect: CONNECT, helpButton: '[data-help]', low: function () { var sh = root.__r214 && root.__r214.shell; return !!(sh && sh.settings && sh.settings.low); } });
    root.R214Tour = T;
    doc.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-help]'); if (b) { e.preventDefault(); T.help(b); } });
    var form = $('#r-form'); if (form) form.addEventListener('submit', function () { setTimeout(function () { if (playing()) T.intro(false); }, 60); });
  }
  root.R214TourText = { CARDS: CARDS, STEPS: STEPS.map(function (s) { return { id: s.id, text: s.text }; }), TIPS: TIPS, PURPOSE: PURPOSE, CONNECT: CONNECT };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();
})(window);
