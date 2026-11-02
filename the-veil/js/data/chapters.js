// Chapter registry. Add a new chapter file (chapter2.js ...) and register it here.
import * as ch1 from './chapter1.js';

const LIST = [ch1];
export const CHAPTERS = LIST;
export const MAPS = Object.assign({}, ...LIST.map((c) => c.MAPS));
export const ENTITIES = LIST.flatMap((c) => c.ENTITIES);
export const ZONES = LIST.flatMap((c) => c.ZONES);
export const chapterOf = (n) => LIST.find((c) => c.CHAPTER.id === n);
export const hasNextChapter = (n) => !!chapterOf(n + 1);
export const TOTAL_CHAPTERS_PLANNED = 5;
