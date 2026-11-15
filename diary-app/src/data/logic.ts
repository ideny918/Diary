import { addDays, parse } from './dates';
import { CATS, QUESTIONS } from './kit';
import { Book, Habit, HState } from './types';

/* ───── checklists: "□ item" / "▦ done" lines (same text format as the Kit) ───── */

export type CheckItem = { text: string; done: boolean };

export function parseChecks(v: string): CheckItem[] {
  return v
    .split('\n')
    .filter(l => l.trim())
    .map(l => {
      const m = /^\s*([□▦])\s?(.*)$/.exec(l);
      return m ? { text: m[2], done: m[1] === '▦' } : { text: l.trim(), done: false };
    });
}
export const joinChecks = (items: CheckItem[]) => items.map(i => (i.done ? '▦ ' : '□ ') + i.text).join('\n');

/* ───── today's question: one per date, stable for that date ───── */

export function autoQ(d: string, off = 0) {
  const [y, m, dd] = d.split('-').map(Number);
  const n = Math.round(Date.UTC(y, m - 1, dd) / 864e5);
  const N = QUESTIONS.length;
  return QUESTIONS[(((n * 37 + off) % N) + N) % N];
}

/* ───── year keyword · anti-goals ───── */

export const antiList = (v: string) =>
  v.split('\n').map(x => x.replace(/^\s*(?:[-•·]|\d+[.)])\s*/, '').trim()).filter(Boolean);

/** The anti-goal shown on a given date: rotates through the list, one per day (as in the Kit). */
export function antiOfDay(list: string[], d: string) {
  if (!list.length) return '';
  const [y, m, dd] = d.split('-').map(Number);
  return list[Math.round(Date.UTC(y, m - 1, dd) / 864e5) % list.length];
}

/* ───── notes ───── */

const tnorm = (s: string) => s.replace(/️/g, '');
const TAG_ORDER = CATS.flatMap(c => c[1]).map(tnorm);
export const tagIdx = (t: string) => {
  const i = TAG_ORDER.indexOf(tnorm(t));
  return i < 0 ? 999 : i;
};
export function catOf(tag: string) {
  const n = tnorm(tag);
  for (const [c, ts] of CATS) if (ts.some(x => tnorm(x) === n)) return c;
  return '기타';
}
/** First grapheme of a tag (its emoji). */
export const tagEmoji = (tag: string) => Array.from(tag)[0] ?? '';

/* ───── habits ───── */

export const hState = (b: Book, h: Habit, d: string): HState => b.hlog[d]?.[h.id] ?? 0;
export const hDone = (b: Book, h: Habit, d: string) => hState(b, h, d) === 2;

/** Done-rate (0–100) between a and b, counting only days up to today and from the habit's start. */
export function hRate(b: Book, h: Habit, a: string, z: string, today: string): number | null {
  let n = 0;
  let dn = 0;
  for (let x = a > h.start ? a : h.start; x <= z && x <= today; x = addDays(x, 1)) {
    n++;
    if (hDone(b, h, x)) dn++;
  }
  return n ? Math.round((dn / n) * 100) : null;
}

/** [current streak, best streak] in days. */
export function hStreaks(b: Book, h: Habit, today: string): [number, number] {
  let best = 0;
  let run = 0;
  for (let x = h.start; x <= today; x = addDays(x, 1)) {
    run = hDone(b, h, x) ? run + 1 : 0;
    if (run > best) best = run;
  }
  // a streak that is still open today counts even if today isn't ticked yet
  let cur = 0;
  for (let x = hDone(b, h, today) ? today : addDays(today, -1); x >= h.start && hDone(b, h, x); x = addDays(x, -1)) cur++;
  return [cur, best];
}

/** Tap cycle from the Kit: none → done → half → none. */
export const nextHState = (s: HState): HState => (s === 0 ? 2 : s === 2 ? 1 : 0);

export const yearOf = (d: string) => parse(d).getFullYear();
