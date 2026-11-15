import { Entry } from './types';

export const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

/** "11.15" — month (1-based) . zero-padded day */
export const md = (m: number, d: number) => `${m + 1}.${pad(d)}`;
export const mdOf = (dt: Date) => md(dt.getMonth(), dt.getDate());
export const dd = (d: number) => pad(d);
export const hhmm = (dt: Date = new Date()) => `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
export const dowOf = (y: number, m: number, d: number) => DOW[new Date(y, m, d).getDay()];

export const sameDay = (e: Entry, dt: Date) => e.y === dt.getFullYear() && e.m === dt.getMonth() && e.d === dt.getDate();

export const sortKey = (e: Entry) => e.y * 1e8 + e.m * 1e6 + e.d * 1e4 + parseInt(e.time.replace(':', ''), 10);

/** Monday-first week containing `dt`. */
export function weekOf(dt: Date): Date[] {
  const mondayOffset = (dt.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - mondayOffset + i));
}

/** The last `n` days ending today, oldest first. */
export function lastDays(today: Date, n: number): Date[] {
  return Array.from({ length: n }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - (n - 1 - i)));
}
