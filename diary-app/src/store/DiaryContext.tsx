import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { todayStr } from '../data/dates';
import { seedBook } from '../data/seed';
import { Book, Day, DEFAULT_SETTINGS, emptyDay, Habit, HState, Note, Period, Settings } from '../data/types';

const STORAGE_KEY = 'diarybook:v1';

type Persisted = { book: Book; settings: Settings };

/** Screen state shared by the tabs (not saved). */
export type UI = {
  /** The date Year / Month / Week / Day are looking at, like the Kit's cursor. */
  cursor: string;
  yearMode: 'goal' | 'log';
  notesYear: number;
  notesYM: string; // YYYY-MM for the notes calendar
  habitYM: string; // YYYY-MM for the habit summary
  habitYear: number; // habit detail year
  /** per-date offset for "다른 질문" (not saved, like the Kit) */
  qoff: Record<string, number>;
};

type Actions = {
  setUI: (patch: Partial<UI> | ((u: UI) => Partial<UI>)) => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  setDay: (d: string, patch: Partial<Day>) => void;
  setWeek: (ws: string, patch: Partial<Period>) => void;
  setMonth: (ym: string, patch: Partial<Period>) => void;
  addNote: (date: string) => string;
  setNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addHabit: (name: string, category: string) => string;
  setHabit: (id: string, patch: Partial<Habit>) => void;
  moveHabit: (id: string, by: number) => void;
  deleteHabit: (id: string) => void;
  setHabitState: (d: string, id: string, s: HState) => void;
  unlock: () => void;
  lock: () => void;
};

type Ctx = Persisted & Actions & { hydrated: boolean; unlocked: boolean; ui: UI; day: (d: string) => Day };

const DiaryContext = createContext<Ctx | null>(null);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const t = todayStr();
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState<Persisted>({ book: seedBook(), settings: DEFAULT_SETTINGS });
  const [ui, setUIState] = useState<UI>({
    cursor: t,
    yearMode: 'goal',
    notesYear: +t.slice(0, 4),
    notesYM: t.slice(0, 7),
    habitYM: t.slice(0, 7),
    habitYear: +t.slice(0, 4),
    qoff: {},
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<Persisted>;
        const settings = { ...DEFAULT_SETTINGS, ...saved.settings };
        setData(d => ({ book: saved.book ?? d.book, settings }));
        if (!settings.lock) setUnlocked(true);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Save shortly after the last change (typing writes on every keystroke).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
    }, 400);
  }, [data, hydrated]);

  const lockOn = data.settings.lock;
  useEffect(() => {
    if (!lockOn) return;
    const sub = AppState.addEventListener('change', s => {
      if (s === 'background') setUnlocked(false);
    });
    return () => sub.remove();
  }, [lockOn]);

  // Every action uses functional updates, so the object is created once and never changes identity.
  const actions = useMemo<Actions>(() => {
    const book = (f: (b: Book) => Book) => setData(d => ({ ...d, book: f(d.book) }));
    return {
      setUI: patch =>
        setUIState(u => {
          const next = typeof patch === 'function' ? patch(u) : patch;
          const changed = (Object.keys(next) as (keyof UI)[]).some(k => next[k] !== u[k]);
          return changed ? { ...u, ...next } : u;
        }),
      setSetting: (k, v) => setData(d => ({ ...d, settings: { ...d.settings, [k]: v } })),
      setDay: (d, patch) => book(b => ({ ...b, days: { ...b.days, [d]: { ...b.days[d], ...patch } } })),
      setWeek: (ws, patch) => book(b => ({ ...b, weeks: { ...b.weeks, [ws]: { ...b.weeks[ws], ...patch } } })),
      setMonth: (ym, patch) => book(b => ({ ...b, months: { ...b.months, [ym]: { ...b.months[ym], ...patch } } })),
      addNote: date => {
        const id = 'n' + uid();
        book(b => ({ ...b, notes: [...b.notes, { id, date, name: '', tag: '💡 생각', on: false, body: '' }] }));
        return id;
      },
      setNote: (id, patch) => book(b => ({ ...b, notes: b.notes.map(n => (n.id === id ? { ...n, ...patch } : n)) })),
      deleteNote: id => book(b => ({ ...b, notes: b.notes.filter(n => n.id !== id) })),
      addHabit: (name, category) => {
        const id = 'h' + uid();
        book(b => ({ ...b, habits: [...b.habits, { id, name, icon: '', category, on: true, start: todayStr() }] }));
        return id;
      },
      setHabit: (id, patch) => book(b => ({ ...b, habits: b.habits.map(h => (h.id === id ? { ...h, ...patch } : h)) })),
      moveHabit: (id, by) =>
        book(b => {
          const i = b.habits.findIndex(h => h.id === id);
          const j = i + by;
          if (i < 0 || j < 0 || j >= b.habits.length) return b;
          const hs = [...b.habits];
          [hs[i], hs[j]] = [hs[j], hs[i]];
          return { ...b, habits: hs };
        }),
      deleteHabit: id => book(b => ({ ...b, habits: b.habits.filter(h => h.id !== id) })),
      setHabitState: (d, id, s) => book(b => ({ ...b, hlog: { ...b.hlog, [d]: { ...b.hlog[d], [id]: s } } })),
      unlock: () => setUnlocked(true),
      lock: () => setUnlocked(false),
    };
  }, [setData, setUIState, setUnlocked]);

  const days = data.book.days;
  const value: Ctx = {
    ...data,
    ...actions,
    hydrated,
    unlocked,
    ui,
    day: d => ({ ...emptyDay, ...days[d] }),
  };

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used inside DiaryProvider');
  return ctx;
}
