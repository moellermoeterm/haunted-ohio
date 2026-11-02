// Game state, autosave, and save-file export/import.
import { SAVE_KEY, SETTINGS_KEY } from '../config.js';

const mem = {};
function lsGet(k) { try { const v = localStorage.getItem(k); if (v !== null) return v; } catch (e) { /* private mode */ } return k in mem ? mem[k] : null; }
function lsSet(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) { /* quota/private */ } }
function lsDel(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }

export const defaultSettings = () => ({ music: 0.5, sfx: 0.8, captions: true, textSize: 'large' });

export const defaults = () => ({
  v: 1,
  started: false,
  name: '',
  look: { skin: 0xf1c9a5, hair: 0x4a2f1b, outfit: 0x2e4a6b, hairStyle: 'short' },
  trait: 'observant',
  motive: 'curiosity',
  chapter: 1,
  mapId: 'c1_grounds',
  x: 16.5 * 32, y: 19.5 * 32, dir: 'up',
  world: 'living',
  flags: {},
  inventory: [],
  clues: [],       // [{id, seen}]
  journal: [],     // objective log lines [{t, text}]
  notes: [],       // player writing [{id, title, text, ts}]
  decisions: [],   // [{id, text}]
  chaptersDone: [],
  meets: [],       // characters discovered
  creator: {},     // Haunting Creator answers
  story: '',
  playMs: 0,
  savedAt: 0,
});

export const state = defaults();
export const settings = Object.assign(defaultSettings(), safeParse(lsGet(SETTINGS_KEY)) || {});

function safeParse(s) { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } }

export function hasSave() { const s = safeParse(lsGet(SAVE_KEY)); return !!(s && s.started); }
export function peekSave() { return safeParse(lsGet(SAVE_KEY)); }

export function load() {
  const s = safeParse(lsGet(SAVE_KEY));
  if (!s || !s.started) return false;
  replaceState(s);
  return true;
}

export function replaceState(s) {
  const d = defaults();
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, d, s);
  state.look = Object.assign(d.look, s.look || {});
}

let lastSave = 0;
export function save(force) {
  const now = Date.now();
  if (!force && now - lastSave < 400) return;
  lastSave = now;
  state.savedAt = now;
  lsSet(SAVE_KEY, JSON.stringify(state));
}
export function saveSettings() { lsSet(SETTINGS_KEY, JSON.stringify(settings)); }

export function newGame(keepLook) {
  const keep = keepLook ? { name: state.name, look: state.look, trait: state.trait, motive: state.motive } : {};
  replaceState(Object.assign(defaults(), keep));
}

export function eraseSave() { lsDel(SAVE_KEY); }

// ---- flags / clues / notes helpers ----
export const flag = (k) => !!state.flags[k];
export function setFlag(k, v = true) { state.flags[k] = v; save(); }
export function hasItem(id) { return state.inventory.includes(id); }
export function addItem(id) { if (!state.inventory.includes(id)) { state.inventory.push(id); save(); return true; } return false; }
export function removeItem(id) { state.inventory = state.inventory.filter((i) => i !== id); save(); }
export function hasClue(id) { return state.clues.some((c) => c.id === id); }
export function addClue(id) { if (hasClue(id)) return false; state.clues.push({ id, at: Date.now() }); save(); return true; }
export function addNote(id, title, text) {
  const ex = state.notes.find((n) => n.id === id);
  if (ex) { ex.text = text; ex.ts = Date.now(); } else state.notes.push({ id, title, text, ts: Date.now() });
  save();
}
export function addDecision(id, text) { if (!state.decisions.some((d) => d.id === id)) { state.decisions.push({ id, text }); save(); } }
export function addLog(text) { state.journal.push({ t: Date.now(), text }); save(); }
export function meet(id) { if (!state.meets.includes(id)) { state.meets.push(id); save(); return true; } return false; }

// ---- export / import ----
export function exportSaveText() {
  return JSON.stringify({ game: 'the-veil', version: 1, exported: new Date().toISOString(), state }, null, 2);
}
export function importSaveText(text) {
  const obj = JSON.parse(text);
  if (!obj || obj.game !== 'the-veil' || !obj.state || typeof obj.state !== 'object') throw new Error('This is not a Veil save file.');
  if (!obj.state.started) throw new Error('This save file has no progress in it.');
  replaceState(obj.state);
  save(true);
}
export function downloadText(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type: type + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
export const wc = (t) => { t = (t || '').trim(); return t ? t.split(/\s+/).length : 0; };
