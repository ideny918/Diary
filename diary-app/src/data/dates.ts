/** Date helpers. Dates are local "YYYY-MM-DD" strings, as in the Kit. */

export const DOW = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const p2 = (n: number) => String(n).padStart(2, '0');

export const fmt = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export function parse(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
export const todayStr = () => fmt(new Date());
export function addDays(s: string, n: number) {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return fmt(d);
}
export function addMonths(s: string, n: number) {
  const d = parse(s);
  return fmt(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

/** Monday = 0 … Sunday = 6 */
export const dowIdx = (s: string) => (parse(s).getDay() + 6) % 7;

/** Day-of-week labels for a week starting on Monday (sun=0) or Sunday (sun=1). */
export const rotDOW = (sun: 0 | 1) => (sun ? ['SUN', ...DOW.slice(0, 6)] : DOW);

export function startOf(s: string, sun: 0 | 1) {
  const d = parse(s);
  d.setDate(d.getDate() - (sun ? d.getDay() : (d.getDay() + 6) % 7));
  return fmt(d);
}

export function monthRange(s: string): [string, string] {
  const d = parse(s);
  return [fmt(new Date(d.getFullYear(), d.getMonth(), 1)), fmt(new Date(d.getFullYear(), d.getMonth() + 1, 0))];
}

export function isoWeek(s: string) {
  const d = parse(s);
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round(((t.getTime() - w1.getTime()) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}
/** Week number shown for a week starting at `ws` (a Sunday start counts as the following Monday's week). */
export const wno = (ws: string, sun: 0 | 1) => isoWeek(addDays(ws, sun ? 1 : 0));

/** "11.15" */
export const md = (s: string) => {
  const d = parse(s);
  return `${d.getMonth() + 1}.${p2(d.getDate())}`;
};
export const dotted = (s: string) => s.replace(/-/g, '.');

/** Sleep length from "In Bed" (previous night) to "Wake Up", e.g. "7h 30m". */
export function sleepH(wake: string, bed: string) {
  const a = /^(\d{1,2}):(\d{2})$/.exec(wake.trim());
  const b = /^(\d{1,2}):(\d{2})$/.exec(bed.trim());
  if (!a || !b) return '';
  let m = +a[1] * 60 + +a[2] - (+b[1] * 60 + +b[2]);
  if (m <= 0) m += 1440;
  return m > 960 ? '' : `${Math.floor(m / 60)}h ${p2(m % 60)}m`;
}
