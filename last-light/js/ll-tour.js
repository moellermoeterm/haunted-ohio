/* The Last Light: its tour (all wording approved by the owner). Reads the game state through window.LL_TOUR_API and changes nothing in it. */
(function (root) {
  'use strict';
  var doc = root.document, $ = function (s) { return doc.querySelector(s); };
  function api() { return root.LL_TOUR_API; }
  function S() { return api().S(); }
  function m() { return S().m || {}; }
  function sig() { var s = S(); return s.screen === 'mission' && s.m && s.m.id === 'signal'; }
  function mis(id) { var s = S(); return s.screen === 'mission' && s.m && s.m.id === id; }
  function wc(t) { t = (t || '').trim(); return t ? t.split(/\s+/).length : 0; }
  function vis(sel) { var e = $(sel); if (!e) return null; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('[hidden]') ? e : null; }
  function room() { var R = root.LLRoom; if (!R || !R.on || !R.on()) return null; var d = R.debug(); return d.mounted && d.ready ? d : null; }
  /* the screen rectangle of an object in the room, so a bubble can point at it */
  function objRect(id) { var d = room(), c = $('#rr-canvas'); if (!d || !c) return null; var o = d.objects.filter(function (x) { return x.id === id; })[0]; if (!o) return null; var r = c.getBoundingClientRect(), k = r.width / d.size[0], h = { left: r.left + o.hit[0] * k, top: r.top + o.hit[1] * k, width: o.hit[2] * k, height: o.hit[3] * k }; h.right = h.left + h.width; h.bottom = h.top + h.height; return h; }
  var start = null;
  function moved() { var d = room(); if (!d) return false; if (!start) start = [d.x, d.y]; return Math.hypot(d.x - start[0], d.y - start[1]) > 30; }

  var STEPS = [
    { id: 'name', when: function () { return S().screen === 'create'; }, target: function () { return vis('#nm'); }, text: 'Name your survivor.', done: function () { return (S().cr.name || '').trim().length >= 2; } },
    { id: 'bg', when: function () { return S().screen === 'create' && (S().cr.name || '').trim().length >= 2; }, target: function () { return vis('[data-cr^="bg:"]'); }, text: 'Pick a background. Each one changes what you notice.', done: function () { return !!S().cr.bg; } },
    { id: 'start', when: function () { var c = S().cr; return S().screen === 'create' && c.bg && c.pers && c.str && c.weak; }, target: function () { return vis('[data-act="start"]'); }, text: 'Ready? Start the story.', done: function () { return S().started; } },
    { id: 'home', when: function () { return S().screen === 'map' && !S().done.signal; }, target: function () { return vis('[data-loc="home"]'); }, text: { key: 'Select your home with Tab and Enter.', touch: 'Tap your home.', mouse: 'Click your home.' }, done: function () { return S().sel === 'home' || !!S().m || !!S().done.signal; } },
    { id: 'travel', when: function () { return S().screen === 'map' && S().sel === 'home'; }, target: function () { return vis('[data-act="travel"]'); }, text: 'Go to the radio room.', done: function () { return !!S().m || !!S().done.signal; } },
    { id: 'supplies', when: function () { return S().screen === 'map'; }, target: function () { return vis('.meters'); }, text: 'Food and water drop each day. Keep them above zero.', done: function () { return false; }, auto: 6000 },
    { id: 'move', when: function () { return sig() && !!room(); }, target: function () { return vis('#rr-canvas'); }, text: { key: 'Move with the arrow keys or W A S D.', touch: 'Drag the stick to move.', mouse: 'Click the floor to walk there.' }, done: function () { return moved(); } },
    { id: 'receiver', when: function () { return sig() && !!room() && (m().step || 0) === 0 && moved(); }, target: function () { return objRect('receiver'); }, text: { key: 'Press E to use the receiver.', touch: 'Tap Use.', mouse: 'Click the receiver.' }, done: function () { var d = room(); return !d || d.panel || (m().step || 0) > 0; } },
    { id: 'power', when: function () { return sig() && (m().step || 0) === 0; }, target: function () { return vis('[data-act="sig-power"]'); }, text: 'Power the radio to listen.', done: function () { return (m().step || 0) >= 1; } },
    { id: 'knob', when: function () { return sig() && m().step === 1 && !m().sub; }, target: function () { return vis('#rr-knob') || vis('#tune'); }, text: 'Turn the knob until the words come in clear.', done: function () { var b = $('#lockbtn'); return (m().step || 0) > 1 || !!m().sub || (b && !b.disabled); } },
    { id: 'lock', when: function () { var b = $('#lockbtn'); return sig() && m().step === 1 && !m().sub && b && !b.disabled; }, target: function () { return vis('#lockbtn'); }, text: 'Clear enough. Lock the signal.', done: function () { return (m().step || 0) > 1 || !!m().sub; } },
    { id: 'detail', when: function () { return sig() && m().step === 2 && !m().judged; }, target: function () { var e = vis('[data-sigpick]'); return e && e.closest('label') || e; }, text: 'Tick every detail that raises a question.', done: function () { return (m().pick || []).length > 0 || !!m().judged; } },
    { id: 'reason', when: function () { return sig() && m().step === 2 && (m().pick || []).length > 0 && !m().judged; }, target: function () { return vis('[data-bind="m.reason"]'); }, text: 'Explain why, using two details you ticked.', done: function () { return wc(m().reason) >= 25 || !!m().judged; } },
    { id: 'shelf', when: function () { return sig() && m().step === 3 && !m().checked; }, target: function () { return room() ? objRect('shelf') : vis('[data-act="sig-dec"][data-v="supplies"]'); }, text: 'Not sure? Check your supplies on the shelf first.', done: function () { return !!m().checked || (m().step || 0) > 3; } },
    { id: 'notebook', when: function () { return sig() && m().step === 4 && !!room(); }, target: function () { return objRect('notebook'); }, text: 'Walk to your notebook and write your entry.', done: function () { var d = room(); return !d || d.panel; } },
    { id: 'door', when: function () { var d = room(); return !!d && d.after; }, target: function () { return objRect('door'); }, text: 'Leave by the door to reach the map.', done: function () { var d = room(); return !d || !d.after; } },
    { id: 'slots', when: function () { return mis('supply') && m().step === 1; }, target: function () { return vis('#app .wrap h2 + p'); }, text: 'Your pack has limited slots. Choose what matters most.', done: function () { return (m().take || []).length > 0; } },
    { id: 'warn', when: function () { return mis('supply') && m().step === 3; }, target: function () { return vis('[data-bind="m.warn"]'); }, text: 'Name two hazards. Tell survivors what to do.', done: function () { return (m().step || 0) > 3; } },
    { id: 'ask', when: function () { return mis('stranger') && m().step === 1; }, target: function () { return vis('[data-act="str-ch"]:not([disabled])'); }, text: 'Ask questions. Watch for details that do not fit.', done: function () { return (m().talks || 0) >= 1; } },
    { id: 'radio', when: function () { return mis('stranger') && m().step === 5; }, target: function () { return vis('[data-bind="m.radio"]'); }, text: '20 words or fewer: what you found, where, what you need.', done: function () { return (m().step || 0) > 5; } },
    { id: 'final', when: function () { return S().journal.length >= 3 && S().screen !== 'final'; }, target: function () { return vis('[data-go="final"]'); }, text: 'Three journal entries unlock your final story.', done: function () { return S().screen === 'final'; } }
  ];
  var TIPS = [
    { label: 'Moving', text: 'Arrows or W A S D, the stick, or click the floor.', step: 'move' },
    { label: 'Using things', text: 'Walk up to it, then press E, tap Use, or click.', step: 'receiver' },
    { label: 'Supplies', text: 'Each day costs 1 food and 1 water.', step: 'supplies' },
    { label: 'Travel', text: 'Travelling to a new place costs one day.', step: 'travel' },
    { label: 'Tuning', text: 'Turn slowly. The static fades as you get close.', step: 'knob' },
    { label: 'Journal', text: 'Each mission ends with a journal entry.' },
    { label: 'Final story', text: 'Finish all three missions and write three journal entries to unlock the final story.', step: 'final' },
    { label: 'XP', text: 'XP rewards careful thinking and writing, not speed.' },
    { label: 'Saves', text: 'Progress saves in this browser. Export it to change devices.' },
    { label: 'Sound', text: 'Every sound has a caption. Sound is optional.' },
    { label: 'Text mode', text: 'Prefer reading? Turn on Text mode in Save and settings.' }
  ];
  var CARDS = [{ icon: 'radio', text: 'Ohio, 2047. The power is gone. One radio still works.' }, { icon: 'backpack', text: 'Every trip costs food and water. Watch your supplies.' }, { icon: 'pencil', text: 'Your choices and your writing decide how your story ends.' }];
  var PURPOSE = 'Survive a silent Ohio, decide who to trust, and write to stay alive.', CONNECT = 'Each mission ends in a journal entry, and three entries unlock your own story.';

  function boot() {
    if (!root.HOTour || !api()) return;
    var T = root.HOTour.create({ key: 'ho-last-light-tour', cards: CARDS, steps: STEPS, tips: TIPS, purpose: PURPOSE, connect: CONNECT, helpButton: '[data-help]', low: function () { return !!(root.LLRoom && root.LLRoom.debug && root.LLRoom.debug().low); } });
    root.LLTour = T;
    /* the "?" button opens Help (it replaced the How-to-play window) */
    doc.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-help]'); if (b) { e.preventDefault(); T.help(b); } });
    /* the intro cards show the first time a player starts a new game on this device */
    doc.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act="newgame"]'); if (b) setTimeout(function () { if (S().screen === 'create') T.intro(false); }, 0); });
  }
  root.LLTourBoot = boot;
  root.LLTourText = { CARDS: CARDS, STEPS: STEPS.map(function (s) { return { id: s.id, text: s.text }; }), TIPS: TIPS, PURPOSE: PURPOSE, CONNECT: CONNECT };
})(window);
