# DIARY

An Expo (React Native) diary app laid out like the **Diary Book Kit**: one notebook page on a desk, with hanging index tabs along the bottom edge.
It uses IBM Plex Sans KR for text, Gowun Batang for date and month titles, and black as the only accent colour.

```bash
npm install
npx expo start        # i / a / w for iOS, Android, web
npm run typecheck
```

## Screens (tabs, left to right)

| Tab | What's on it |
| --- | --- |
| **Year** | 12 month cards, each showing either the month's goal checklist or its period log (toggle in the header). Tap a month name to open it. |
| **Month** | Calendar with week links (W46…), mood/weather and events per day. Monthly goal checklist and period log below. |
| **Week** | Weekly goal checklist and period log, then one box per day: events, log, notes. |
| **Day** | Mood · weather, wake/bed times with sleep length, habit icons, photo, today's question, Joy, 마음 한 줄 (with 말했어요), Reset, Tomorrow, Comment. Below that: Event, To do, Log, and the day's notes. |
| **Notes** | Contents by category for the year, notes marked ON, and a month calendar of notes. Tapping a category opens its cards; tapping a note opens the editor (title, date, tag, ON, body). |
| **Habit** | Month summary, year heatmap, this week's grid, and habit cards by category. A habit's detail page has its settings, stats and a 12-month calendar. |
| **⚙ Setting** | Week start day (월/일) for Month and Week, paper pattern (무지 / 모눈 / 도트 / 줄), whether OFF habits are shown, and the passcode lock. |

Year, Month, Week and Day share one date. Moving it on one screen moves it on all four, as in the Kit.
Tap a habit once for done, twice for half, and a third time to clear it.

## Data

- Everything is saved on the device in AsyncStorage (`diarybook:v1`) a moment after each change. Nothing syncs to Notion or Google Calendar.
- The first launch fills in sample pages around today's date.
- Day checklists use the Kit's text format (`□ item` / `▦ done`).
- The question list, mood and weather sets, note categories, habit categories and habit icons are copied from the Kit (`src/data/kit.ts`).

## Structure

| Path | What |
| --- | --- |
| `src/app/_layout.tsx` | Page frame, fonts, lock gating, bottom tabs |
| `src/app/{index,week,month,year,setting,lock}.tsx` | Day (index), Week, Month, Year, Setting, Lock |
| `src/app/notes/`, `src/app/note/[id].tsx` | Notes contents, category grid, note editor |
| `src/app/habit/` | Habit overview and habit detail |
| `src/store/DiaryContext.tsx` | State and persistence |
| `src/data/` | Types, dates, logic (checklists, questions, habit rates), seed data, Kit lists |
| `src/components/ui.tsx` | Page shell, nav, fields, checklist, emoji picker, segmented control, ON tag… |
