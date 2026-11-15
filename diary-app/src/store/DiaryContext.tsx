import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { hhmm, sortKey } from '../data/dates';
import { SEED, STAMP_PLACEHOLDER } from '../data/seed';
import { blankDraft, DEFAULT_SETTINGS, Draft, Entry, Settings } from '../data/types';

const STORAGE_KEY = 'diary:v1';

type Persisted = { entries: Entry[]; settings: Settings; draft: Draft };

export type TabKey = 'today' | 'month' | 'search' | 'insight' | 'setting';

type UI = {
  promptIdx: number;
  calY: number;
  calM: number;
  calSel: number;
  query: string;
  tagF: string | null;
  lastTab: TabKey;
};

type Ctx = Persisted & {
  hydrated: boolean;
  unlocked: boolean;
  ui: UI;
  /** Entries sorted newest first. */
  sorted: Entry[];
  setUI: (patch: Partial<UI> | ((u: UI) => Partial<UI>)) => void;
  setSetting: (k: keyof Settings, v: boolean) => void;
  setDraft: (patch: Partial<Draft> | ((d: Draft) => Partial<Draft>)) => void;
  resetDraft: (prompt?: string) => void;
  /** Saves the draft as a new entry and returns its id (null when empty). */
  saveDraft: () => string | null;
  unlock: () => void;
  lock: () => void;
};

const DiaryContext = createContext<Ctx | null>(null);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<Persisted>({ entries: SEED, settings: DEFAULT_SETTINGS, draft: blankDraft() });
  const [unlocked, setUnlocked] = useState(false);
  const [ui, setUIState] = useState<UI>({
    promptIdx: 0,
    calY: now.getFullYear(),
    calM: now.getMonth(),
    calSel: now.getDate(),
    query: '',
    tagF: null,
    lastTab: 'today',
  });

  // Load once.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<Persisted>;
        const settings = { ...DEFAULT_SETTINGS, ...saved.settings };
        setData(d => ({
          entries: saved.entries ?? d.entries,
          settings,
          draft: { ...blankDraft(), ...saved.draft },
        }));
        // With 암호 잠금 off, launch straight into the diary.
        if (!settings.lock) setUnlocked(true);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const lockOn = data.settings.lock;

  // Save on change (after hydration so we never overwrite stored data with defaults).
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, hydrated]);

  // "잠금 시점: 즉시" — relock as soon as the app leaves the foreground.
  useEffect(() => {
    if (!lockOn) return;
    const sub = AppState.addEventListener('change', s => {
      if (s === 'background') setUnlocked(false);
    });
    return () => sub.remove();
  }, [lockOn]);

  const setUI: Ctx['setUI'] = patch => setUIState(u => ({ ...u, ...(typeof patch === 'function' ? patch(u) : patch) }));
  const setSetting = (k: keyof Settings, v: boolean) => setData(d => ({ ...d, settings: { ...d.settings, [k]: v } }));
  const setDraft: Ctx['setDraft'] = patch =>
    setData(d => ({ ...d, draft: { ...d.draft, ...(typeof patch === 'function' ? patch(d.draft) : patch) } }));
  const resetDraft = (prompt = '') => setData(d => ({ ...d, draft: blankDraft(prompt) }));

  const saveDraft = () => {
    const { draft: dr, settings } = data;
    if (!dr.title.trim() && !dr.body.trim()) return null;
    const at = new Date();
    const e: Entry = {
      id: 'n' + at.getTime(),
      y: at.getFullYear(),
      m: at.getMonth(),
      d: at.getDate(),
      time: hhmm(at),
      title: dr.title.trim() || '제목 없음',
      body: dr.body.trim(),
      mood: dr.mood || 3,
      emotions: dr.emotions,
      tags: dr.tags,
      photo: !!dr.photoUri,
      photoUri: dr.photoUri ?? undefined,
      weather: settings.stamp ? STAMP_PLACEHOLDER.weather : '—',
      place: settings.stamp ? STAMP_PLACEHOLDER.place : '—',
    };
    setData(d => ({ ...d, entries: [e, ...d.entries], draft: blankDraft() }));
    return e.id;
  };

  const sorted = useMemo(() => [...data.entries].sort((a, b) => sortKey(b) - sortKey(a)), [data.entries]);

  const value: Ctx = {
    ...data,
    hydrated,
    unlocked,
    ui,
    sorted,
    setUI,
    setSetting,
    setDraft,
    resetDraft,
    saveDraft,
    unlock: () => setUnlocked(true),
    lock: () => setUnlocked(false),
  };

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used inside DiaryProvider');
  return ctx;
}
