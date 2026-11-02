// DOM user interface: HUD, dialogue, choices, and the keyboard-driven panels
// (inventory, journal, evidence archive, pause, settings, writing prompts).
// DOM text stays crisp and readable on school laptops and tablets, and can be resized.
import { state, settings, saveSettings, save, addNote, wc, downloadText, exportSaveText, importSaveText, eraseSave } from './state.js';
import { setUiHandler } from './input.js';
import * as audio from './audio.js';
import { ITEMS, CLUES, CHARACTERS, CATEGORY_ORDER } from '../data/content.js';
import { GLYPHS, glyphSvg } from './textures.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// hooks are filled in by the scenes
export const hooks = { objective: () => '', quitToMenu() {}, restartChapter() {}, afterImport() {}, onChange() {} };

let hud, dlgEl, layer, toastT = 0, capT = 0;
const modals = [];
let dlg = null;
const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isLocked = () => !!dlg || modals.length > 0;

export function init() {
  const root = document.getElementById('ui');
  root.innerHTML = `
  <div id="hud" hidden>
    <div class="hud-top"><div class="hud-chap" id="hudChap"></div><div class="hud-obj" id="hudObj"></div></div>
    <div class="hud-world" id="hudWorld"></div>
    <div class="hud-tip" id="hudTip"></div>
    <div class="hud-prompt" id="hudPrompt" hidden></div>
    <div class="hud-caption" id="hudCap" hidden role="status" aria-live="polite"></div>
    <div class="hud-toast" id="hudToast" hidden role="status" aria-live="polite"></div>
  </div>
  <div id="dlg" hidden role="dialog" aria-live="polite">
    <div class="dlg-name" id="dlgName"></div>
    <div class="dlg-text" id="dlgText"></div>
    <div class="dlg-choices" id="dlgChoices"></div>
    <div class="dlg-hint" id="dlgHint">Space ▸</div>
  </div>
  <div id="modalLayer"></div>`;
  hud = document.getElementById('hud'); dlgEl = document.getElementById('dlg'); layer = document.getElementById('modalLayer');
  setUiHandler(onKey);
  audio.onCaption((t) => caption(t));
  applyTextSize();
  const fit = () => { const w = document.getElementById('wrap'); w.style.setProperty('--s', (w.clientWidth / 960).toFixed(4)); };
  window.addEventListener('resize', fit); fit();
  setInterval(() => { if (!hud.hidden) hudTip(); }, 5000);
}
export function applyTextSize() {
  document.getElementById('wrap').dataset.text = settings.textSize;
}

// ---------------- HUD ----------------
export function showHud(on) { hud.hidden = !on; if (on) hudTip(); }
export function setChapter(t) { document.getElementById('hudChap').textContent = t; }
export function setObjective(t) { document.getElementById('hudObj').textContent = t ? 'Objective: ' + t : ''; }
export function setWorld(w) { const e = document.getElementById('hudWorld'); e.textContent = w === 'veil' ? 'THE VEIL' : 'LIVING WORLD'; e.dataset.w = w; }
function hudTip() {
  const e = document.getElementById('hudTip');
  const full = state.playMs < 120000;
  e.classList.toggle('min', !full);
  e.innerHTML = full
    ? '<b>WASD</b>/arrows move · <b>Shift</b> run · <b>E</b> interact · <b>V</b> shift worlds · <b>F</b> flashlight · <b>R</b> evidence · <b>I</b> pack · <b>J</b> journal · <b>Esc</b> pause'
    : '<b>Esc</b> pause &amp; controls';
}
export function prompt(text) {
  const e = document.getElementById('hudPrompt');
  if (!text) { e.hidden = true; return; }
  if (e.textContent !== text) e.textContent = text;
  e.hidden = false;
}
export function toast(text, ms = 2800) {
  const e = document.getElementById('hudToast'); e.textContent = text; e.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { e.hidden = true; }, ms);
}
export function caption(text, ms = 4200) {
  const e = document.getElementById('hudCap'); e.textContent = text; e.hidden = false;
  clearTimeout(capT); capT = setTimeout(() => { e.hidden = true; }, ms);
}

// ---------------- dialogue ----------------
let typeTimer = 0;
function typeInto(el, text, done) {
  clearInterval(typeTimer);
  if (reduced()) { el.textContent = text; done(); return; }
  let i = 0; el.textContent = '';
  typeTimer = setInterval(() => {
    i += 2; el.textContent = text.slice(0, i);
    if (i >= text.length) { clearInterval(typeTimer); done(); }
  }, 16);
}
export function say(speaker, text) {
  return new Promise((res) => {
    dlg = { res, text, done: false, choices: null };
    dlgEl.hidden = false;
    const n = document.getElementById('dlgName'); n.textContent = speaker || ''; n.hidden = !speaker; n.dataset.who = (speaker || '').toLowerCase().replace(/[^a-z]/g, '');
    document.getElementById('dlgChoices').innerHTML = '';
    document.getElementById('dlgHint').hidden = false;
    typeInto(document.getElementById('dlgText'), text, () => { dlg.done = true; });
    hooks.onChange();
  });
}
export async function sayAll(lines) { for (const [who, t] of lines) await say(who, t); }
export function choose(promptText, options) {
  return new Promise((res) => {
    dlg = { res, text: promptText, done: true, choices: options, sel: 0 };
    dlgEl.hidden = false;
    const n = document.getElementById('dlgName'); n.textContent = ''; n.hidden = true;
    document.getElementById('dlgText').textContent = promptText;
    document.getElementById('dlgHint').hidden = true;
    renderChoices();
    hooks.onChange();
  });
}
function renderChoices() {
  const c = document.getElementById('dlgChoices');
  c.innerHTML = dlg.choices.map((o, i) => `<button type="button" class="dlg-choice${i === dlg.sel ? ' on' : ''}" data-i="${i}"><b>${i + 1}</b> ${esc(o)}</button>`).join('');
  c.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => pickChoice(+b.dataset.i)));
}
function pickChoice(i) {
  const d = dlg; dlg = null; dlgEl.hidden = true; document.getElementById('dlgChoices').innerHTML = '';
  audio.uiBlip(); d.res(i); hooks.onChange();
}
function advance() {
  if (!dlg.done) { clearInterval(typeTimer); document.getElementById('dlgText').textContent = dlg.text; dlg.done = true; return; }
  const d = dlg; dlg = null; dlgEl.hidden = true; d.res(); hooks.onChange();
}

// ---------------- modal system ----------------
export function openModal({ cls = '', title = '', html = '', closable = true, onKey, onOpen }) {
  const el = document.createElement('div'); el.className = 'modal ' + cls;
  el.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1">${title ? `<h2>${esc(title)}</h2>` : ''}<div class="body">${html}</div></div>`;
  layer.appendChild(el);
  const m = { el, card: el.firstChild, body: el.querySelector('.body'), closable, onKey, alive: true };
  m.closed = new Promise((r) => {
    m.close = (v) => { if (!m.alive) return; m.alive = false; modals.splice(modals.indexOf(m), 1); el.remove(); r(v); hooks.onChange(); };
  });
  if (closable) el.addEventListener('mousedown', (e) => { if (e.target === el) m.close(); });
  modals.push(m);
  m.card.focus();
  if (onOpen) onOpen(m);
  hooks.onChange();
  return m;
}
export function closeAllModals() { [...modals].forEach((m) => m.close()); }
const topModal = () => modals[modals.length - 1];

function arrowFocus(m, k) {
  const bs = [...m.body.querySelectorAll('button:not([disabled])')];
  if (!bs.length) return false;
  let i = bs.indexOf(document.activeElement);
  if (k === 'arrowdown' || k === 's') i = (i + 1) % bs.length; else i = (i - 1 + bs.length) % bs.length;
  bs[i].focus(); return true;
}

function onKey(k, e, typingEl) {
  const top = topModal();
  if (typingEl) { return top && top.onKey ? !!top.onKey(k, e, true) : false; }
  if (dlg) {
    if (dlg.choices) {
      if (k === 'arrowdown' || k === 's') { dlg.sel = (dlg.sel + 1) % dlg.choices.length; renderChoices(); audio.uiBlip(); }
      else if (k === 'arrowup' || k === 'w') { dlg.sel = (dlg.sel - 1 + dlg.choices.length) % dlg.choices.length; renderChoices(); audio.uiBlip(); }
      else if (k === 'enter' || k === ' ' || k === 'e') pickChoice(dlg.sel);
      else if (/^[1-9]$/.test(k) && +k <= dlg.choices.length) pickChoice(+k - 1);
    } else if (k === ' ' || k === 'enter' || k === 'e') advance();
    return true;
  }
  if (top) {
    if (top.onKey && top.onKey(k, e, false)) return true;
    if (k === 'escape' && top.closable) { top.close(); return true; }
    if (k === 'tab') return false;
    const ae = document.activeElement;
    if ((k === 'enter' || k === ' ') && ae && (ae.tagName === 'BUTTON' || ae.tagName === 'SUMMARY' || ae.tagName === 'INPUT')) return false;
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(k) && ae && ['INPUT', 'SELECT'].includes(ae.tagName)) return false;
    return true;
  }
  return false;
}

// ---------------- panels ----------------
export function openPanel(name) {
  const t = topModal();
  if (t && t.panel) { const same = t.panel === name; t.close(); if (same) return null; }
  else if (t) return null;
  if (dlg) return null;
  const fn = { inventory: openInventory, journal: openJournal, archive: openArchive, pause: openPause }[name];
  return fn ? fn() : null;
}
const panelKeys = (self, key, extra) => (k, e, typingEl) => {
  if (typingEl) { if (k === 'escape') { self().close(); return true; } return extra ? extra(k, e, true) : false; }
  if (k === key || k === 'escape') { self().close(); return true; }
  if (['i', 'j', 'r'].includes(k)) { const n = { i: 'inventory', j: 'journal', r: 'archive' }[k]; self().close(); setTimeout(() => openPanel(n), 0); return true; }
  return extra ? extra(k, e, false) : false;
};

function openInventory() {
  let sel = 0, m;
  const draw = () => {
    const ids = state.inventory;
    m.body.innerHTML = ids.length ? `<div class="inv"><div class="inv-grid">${ids.map((id, i) => `<button type="button" class="inv-item${i === sel ? ' on' : ''}" data-i="${i}">${ITEMS[id].icon}<span>${esc(ITEMS[id].name)}</span></button>`).join('')}</div>
      <div class="inv-detail"><h3>${esc(ITEMS[ids[sel]].name)}</h3><p>${esc(ITEMS[ids[sel]].desc)}</p></div></div>` : '<p class="muted">Your pack is empty. Items you pick up appear here.</p>';
    m.body.querySelectorAll('.inv-item').forEach((b) => b.addEventListener('click', () => { sel = +b.dataset.i; draw(); }));
  };
  m = openModal({
    cls: 'panel', title: 'Pack', onOpen: () => draw(),
    onKey: panelKeys(() => m, 'i', (k) => {
      const n = state.inventory.length; if (!n) return false;
      if (k === 'arrowright' || k === 'd' || k === 'arrowdown' || k === 's') { sel = (sel + 1) % n; draw(); return true; }
      if (k === 'arrowleft' || k === 'a' || k === 'arrowup' || k === 'w') { sel = (sel - 1 + n) % n; draw(); return true; }
      return false;
    }),
  });
  m.panel = 'inventory'; return m;
}

function openJournal(startTab = 0) {
  const tabs = ['Objective', 'Notes', 'Characters', 'Decisions'];
  let tab = startTab, m;
  const draw = () => {
    let body = '';
    if (tab === 0) {
      const log = [...state.journal].reverse();
      body = `<h3>Current objective</h3><p class="big">${esc(hooks.objective() || 'Explore.')}</p><h3>What has happened</h3>` +
        (log.length ? `<ul class="log">${log.map((l) => `<li>${esc(l.text)}</li>`).join('')}</ul>` : '<p class="muted">Nothing yet.</p>');
    } else if (tab === 1) {
      body = `<p class="muted">Your own writing. Short notes you save in the game appear here, and they carry into the Haunting Creator. Write anything you want to remember.</p>
        ${state.notes.map((n) => `<div class="note"><b>${esc(n.title)}</b><p>${esc(n.text)}</p></div>`).join('') || '<p class="muted">No notes yet.</p>'}
        <label class="fl" for="newNote">New note</label><textarea id="newNote" rows="3" placeholder="What do you want to remember or wonder about?"></textarea>
        <p class="row"><button type="button" class="btn" id="saveNote">Save note (Ctrl+Enter)</button><span class="muted" id="noteWc">0 words</span></p>`;
    } else if (tab === 2) {
      body = state.meets.length ? state.meets.map((id) => `<div class="note"><b>${esc(CHARACTERS[id].name)}</b><p>${esc(CHARACTERS[id].desc)}</p></div>`).join('') : '<p class="muted">You have not met anyone yet.</p>';
    } else {
      body = state.decisions.length ? `<ul class="log">${state.decisions.map((d) => `<li>${esc(d.text)}</li>`).join('')}</ul>` : '<p class="muted">You have not made any major decisions yet.</p>';
    }
    m.body.innerHTML = `<div class="tabs">${tabs.map((t, i) => `<button type="button" class="tab${i === tab ? ' on' : ''}" data-t="${i}">${t}</button>`).join('')}</div><div class="jbody">${body}</div>`;
    m.body.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => { tab = +b.dataset.t; draw(); }));
    const ta = m.body.querySelector('#newNote');
    if (ta) {
      const save1 = () => { const t = ta.value.trim(); if (!t) return; addNote('free' + Date.now(), 'Note', t); toast('Note saved.'); draw(); };
      ta.addEventListener('input', () => { m.body.querySelector('#noteWc').textContent = wc(ta.value) + ' words'; });
      m.body.querySelector('#saveNote').addEventListener('click', save1);
      ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save1(); } });
    }
  };
  m = openModal({
    cls: 'panel wide', title: 'Journal', onOpen: draw,
    onKey: panelKeys(() => m, 'j', (k, e, typingEl) => {
      if (typingEl) return false;
      if (k === 'arrowright' || k === 'd') { tab = (tab + 1) % tabs.length; draw(); return true; }
      if (k === 'arrowleft' || k === 'a') { tab = (tab - 1 + tabs.length) % tabs.length; draw(); return true; }
      return false;
    }),
  });
  m.panel = 'journal'; return m;
}

function clueIcon(id) { const g = id.startsWith('pew') ? { pewStar: 'star', pewFlame: 'flame', pewTower: 'tower' }[id] : null; return g && GLYPHS[g] ? glyphSvg(g, '#9fe3ff', 56) : ''; }
function openArchive() {
  let sel = 0, m;
  const list = () => CATEGORY_ORDER.flatMap((c) => state.clues.map((x) => x.id).filter((id) => CLUES[id] && CLUES[id].cat === c));
  const draw = () => {
    const ids = list();
    if (!ids.length) { m.body.innerHTML = '<p class="muted">No evidence yet. Examine objects with <b>E</b> and they appear here.</p>'; return; }
    sel = Math.min(sel, ids.length - 1);
    const c = CLUES[ids[sel]];
    m.body.innerHTML = `<div class="arc"><div class="arc-list">${ids.map((id, i) => `<button type="button" class="arc-item${i === sel ? ' on' : ''}" data-i="${i}"><small>${esc(CLUES[id].cat)}</small>${esc(CLUES[id].title)}</button>`).join('')}</div>
      <div class="arc-detail"><div class="chips"><span class="chip">${esc(c.cat)}</span><span class="chip w-${c.world.toLowerCase()}">${esc(c.world)}</span></div>
      <h3>${esc(c.title)}</h3>${clueIcon(ids[sel])}<div class="paper">${esc(c.body).replace(/\n/g, '<br>')}</div></div></div>`;
    m.body.querySelectorAll('.arc-item').forEach((b) => b.addEventListener('click', () => { sel = +b.dataset.i; draw(); }));
  };
  m = openModal({
    cls: 'panel wide', title: 'Evidence archive', onOpen: draw,
    onKey: panelKeys(() => m, 'r', (k) => {
      const n = list().length; if (!n) return false;
      if (k === 'arrowdown' || k === 's') { sel = (sel + 1) % n; draw(); return true; }
      if (k === 'arrowup' || k === 'w') { sel = (sel - 1 + n) % n; draw(); return true; }
      return false;
    }),
  });
  m.panel = 'archive'; return m;
}

export function controlsHtml() {
  const rows = [['W A S D / arrow keys', 'Move'], ['Shift', 'Run'], ['E', 'Interact / talk / examine'], ['V', 'Shift between the Living World and the Veil'], ['F', 'Flashlight'], ['R', 'Evidence archive'], ['I', 'Pack (inventory)'], ['J', 'Journal'], ['Space', 'Advance dialogue'], ['H', 'Hint for your objective'], ['Esc', 'Pause']];
  return `<table class="ctl">${rows.map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</table>`;
}

export function openPause() {
  let m;
  m = openModal({
    cls: 'panel narrow', title: 'Paused',
    html: `<div class="menu"><button class="btn" data-a="resume">Resume</button><button class="btn" data-a="controls">Controls</button><button class="btn" data-a="settings">Settings &amp; sound</button>
      <button class="btn" data-a="export">Save to a file</button><button class="btn" data-a="import">Load from a file</button>
      <button class="btn" data-a="restart">Restart this chapter</button><button class="btn" data-a="quit">Quit to main menu</button></div><input type="file" id="impFile" accept=".json,application/json" hidden>`,
    onKey: (k, e, typingEl) => {
      if (typingEl) return false;
      if (k === 'escape') { m.close(); return true; }
      if (k === 'arrowdown' || k === 'arrowup' || k === 's' || k === 'w') return arrowFocus(m, k);
      return false;
    },
    onOpen: (mm) => {
      mm.body.querySelector('button').focus();
      mm.body.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', async () => {
        const a = b.dataset.a;
        if (a === 'resume') mm.close();
        else if (a === 'controls') openModal({ cls: 'panel narrow', title: 'Controls', html: controlsHtml() + '<p class="row"><button class="btn" data-x>Back</button></p>', onOpen: (c) => c.body.querySelector('[data-x]').addEventListener('click', () => c.close()) });
        else if (a === 'settings') openSettings();
        else if (a === 'export') { save(true); downloadText('the-veil-save-' + (state.name || 'player').replace(/\W+/g, '-') + '.json', exportSaveText(), 'application/json'); toast('Save file downloaded.'); }
        else if (a === 'import') mm.body.querySelector('#impFile').click();
        else if (a === 'restart') { if (await confirmBox('Restart this chapter?', 'You will return to the start of the chapter. Clues and notes you already collected are kept.', 'Restart')) { mm.close(); hooks.restartChapter(); } }
        else if (a === 'quit') { save(true); mm.close(); hooks.quitToMenu(); }
      }));
      mm.body.querySelector('#impFile').addEventListener('change', (ev) => importFile(ev.target.files[0], mm));
    },
  });
  m.panel = 'pause'; return m;
}
export function importFile(file, modal) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => { try { importSaveText(String(r.result)); if (modal) modal.close(); toast('Save loaded.'); hooks.afterImport(); } catch (err) { toast(err.message || 'That file could not be loaded.', 4500); } };
  r.readAsText(file);
}

export function confirmBox(title, text, yesLabel = 'Yes', noLabel = 'Cancel') {
  return new Promise((res) => {
    let m;
    m = openModal({
      cls: 'panel narrow', title, html: `<p>${esc(text)}</p><p class="row"><button class="btn" data-y>${esc(yesLabel)}</button><button class="btn ghost" data-n>${esc(noLabel)}</button></p>`,
      onOpen: (mm) => { mm.body.querySelector('[data-n]').focus(); mm.body.querySelector('[data-y]').addEventListener('click', () => { mm.close(true); }); mm.body.querySelector('[data-n]').addEventListener('click', () => mm.close(false)); },
      onKey: (k, e, t) => { if (!t && (k === 'arrowleft' || k === 'arrowright')) { const b = [...m.body.querySelectorAll('button')]; b[(b.indexOf(document.activeElement) + 1) % b.length].focus(); return true; } return false; },
    });
    m.closed.then((v) => res(!!v));
  });
}

export function openSettings() {
  let m;
  m = openModal({
    cls: 'panel narrow', title: 'Settings',
    html: `<label class="fl" for="sMusic">Music volume</label><input type="range" id="sMusic" min="0" max="1" step="0.05" value="${settings.music}">
      <label class="fl" for="sSfx">Sound effects volume</label><input type="range" id="sSfx" min="0" max="1" step="0.05" value="${settings.sfx}">
      <label class="chk"><input type="checkbox" id="sCap" ${settings.captions ? 'checked' : ''}> Show captions for important sounds</label>
      <label class="fl" for="sText">Text size</label><select id="sText"><option value="normal">Normal</option><option value="large">Large</option><option value="xlarge">Extra large</option></select>
      <details class="teacher"><summary>Teacher tools</summary><p class="muted">Erasing removes this device’s saved game. A backup file can be downloaded first.</p><button class="btn ghost" id="sErase">Erase saved progress…</button></details>
      <p class="row"><button class="btn" id="sDone">Done</button></p>`,
    onKey: (k, e, t) => (t ? false : false),
    onOpen: (mm) => {
      const b = mm.body;
      b.querySelector('#sText').value = settings.textSize;
      b.querySelector('#sMusic').addEventListener('input', (e) => { settings.music = +e.target.value; saveSettings(); audio.applyVolumes(); });
      b.querySelector('#sSfx').addEventListener('input', (e) => { settings.sfx = +e.target.value; saveSettings(); audio.applyVolumes(); audio.uiBlip(); });
      b.querySelector('#sCap').addEventListener('change', (e) => { settings.captions = e.target.checked; saveSettings(); });
      b.querySelector('#sText').addEventListener('change', (e) => { settings.textSize = e.target.value; saveSettings(); applyTextSize(); });
      b.querySelector('#sDone').addEventListener('click', () => mm.close());
      b.querySelector('#sErase').addEventListener('click', openErase);
      b.querySelector('#sDone').focus();
    },
  });
  return m;
}
function openErase() {
  let m;
  m = openModal({
    cls: 'panel narrow', title: 'Erase saved progress',
    html: `<p>This removes the saved game on <b>this device</b>. It cannot be undone.</p><p><button class="btn ghost" id="eBackup">Download a backup file first</button></p>
      <label class="fl" for="eType">Type RESET to confirm</label><input type="text" id="eType" autocomplete="off" spellcheck="false">
      <p class="row"><button class="btn" id="eGo" disabled>Erase</button><button class="btn ghost" id="eNo">Cancel</button></p>`,
    onOpen: (mm) => {
      const b = mm.body, t = b.querySelector('#eType'), go = b.querySelector('#eGo');
      b.querySelector('#eBackup').addEventListener('click', () => { downloadText('the-veil-backup.json', exportSaveText(), 'application/json'); toast('Backup downloaded.'); });
      t.addEventListener('input', () => { go.disabled = t.value.trim() !== 'RESET'; });
      go.addEventListener('click', () => { eraseSave(); closeAllModals(); toast('Saved progress erased.'); hooks.quitToMenu(true); });
      b.querySelector('#eNo').addEventListener('click', () => mm.close());
      t.focus();
    },
  });
  return m;
}

// Short optional writing moment. Resolves to the saved text, or null if skipped.
export function writePrompt({ id, title, prompt: pr, min = 15, optional = true }) {
  return new Promise((res) => {
    let m;
    const existing = state.notes.find((n) => n.id === id);
    m = openModal({
      cls: 'panel write', title, closable: optional,
      html: `<p class="big">${esc(pr)}</p><label class="fl" for="wp">Your words</label><textarea id="wp" rows="5">${esc(existing ? existing.text : '')}</textarea>
        <p class="count" id="wpc"></p><p class="row"><button class="btn" id="wpSave">Save to my journal (Ctrl+Enter)</button>${optional ? '<button class="btn ghost" id="wpSkip">Skip for now (Esc)</button>' : ''}</p>`,
      onKey: (k, e, t) => {
        if (k === 'escape' && optional) { m.close(null); return true; }
        if (t && k === 'enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); doSave(); return true; }
        return false;
      },
      onOpen: (mm) => {
        const ta = mm.body.querySelector('#wp'), c = mm.body.querySelector('#wpc');
        const upd = () => { const n = wc(ta.value); c.textContent = n + ' word' + (n === 1 ? '' : 's') + (min ? ' · try for ' + min + ' or more' : ''); c.classList.toggle('ok', n >= min); };
        ta.addEventListener('input', upd); upd();
        mm.body.querySelector('#wpSave').addEventListener('click', doSave);
        const sk = mm.body.querySelector('#wpSkip'); if (sk) sk.addEventListener('click', () => mm.close(null));
        ta.focus();
      },
    });
    function doSave() {
      const t = m.body.querySelector('#wp').value.trim();
      if (!t) { toast('Write a few words first, or skip this one.'); return; }
      addNote(id, title, t); toast('Saved to your journal.'); m.close(t);
    }
    m.closed.then((v) => res(v == null ? null : v));
  });
}
