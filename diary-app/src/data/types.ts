export type Entry = {
  id: string;
  /** Full year, 0-based month, day of month (local time). */
  y: number;
  m: number;
  d: number;
  /** HH:MM */
  time: string;
  title: string;
  body: string;
  /** 1 (최악) … 5 (최고) */
  mood: number;
  emotions: string[];
  tags: string[];
  weather: string;
  place: string;
  /** true = sample entry with a placeholder photo. */
  photo: boolean;
  /** Local image URI picked from the library. */
  photoUri?: string;
};

export type Draft = {
  title: string;
  body: string;
  mood: number; // 0 = not picked
  emotions: string[];
  tags: string[];
  photoUri: string | null;
  prompt: string;
  tagText: string;
};

export type Settings = {
  lock: boolean;
  bio: boolean;
  prompts: boolean;
  remind: boolean;
  stamp: boolean;
};

export const blankDraft = (prompt = ''): Draft => ({
  title: '',
  body: '',
  mood: 0,
  emotions: [],
  tags: [],
  photoUri: null,
  prompt,
  tagText: '',
});

export const DEFAULT_SETTINGS: Settings = { lock: true, bio: true, prompts: true, remind: true, stamp: true };
