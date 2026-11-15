/** One page per date (Kit "Diary" DB). Checklists are text lines: "□ item" / "▦ done item". */
export type Day = {
  event: string;
  todo: string;
  log: string;
  joy: string;
  reset: string;
  tomorrow: string;
  comment: string;
  wake: string; // HH:MM
  bed: string; // HH:MM
  mood: string; // emoji
  weather: string; // emoji
  question: string; // saved only once answered or changed
  answer: string;
  feeling: string;
  talked: boolean;
  photoUri: string;
};

/** Week / month planner page (Kit "Planner" DB). */
export type Period = { goal: string; log: string };

export type Note = { id: string; date: string; name: string; tag: string; on: boolean; body: string };

export type Habit = { id: string; name: string; icon: string; category: string; on: boolean; start: string };

/** 0 = not done, 1 = half, 2 = done */
export type HState = 0 | 1 | 2;

export type Settings = {
  lock: boolean;
  bio: boolean;
  /** first day of week: 0 = Monday, 1 = Sunday */
  mStart: 0 | 1;
  wStart: 0 | 1;
  paper: '' | 'grid' | 'dot' | 'line';
  hshow: 'on' | 'all';
};

export type Book = {
  days: Record<string, Partial<Day>>; // YYYY-MM-DD
  weeks: Record<string, Partial<Period>>; // week start YYYY-MM-DD
  months: Record<string, Partial<Period>>; // YYYY-MM
  notes: Note[];
  habits: Habit[]; // array order = habit order
  hlog: Record<string, Record<string, HState>>; // date -> habit id -> state
};

export const DEFAULT_SETTINGS: Settings = { lock: true, bio: true, mStart: 0, wStart: 0, paper: '', hshow: 'on' };

export const emptyDay: Day = {
  event: '', todo: '', log: '', joy: '', reset: '', tomorrow: '', comment: '', wake: '', bed: '',
  mood: '', weather: '', question: '', answer: '', feeling: '', talked: false, photoUri: '',
};
