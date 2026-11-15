# DIARY

Expo (React Native) app built from the Claude Design handoff in `../project`.
It follows the final direction, `DiaryBookV2.dc.html`: the "Diary Book Kit" layout with the 빛 (light) palette and the index tabs at the bottom of the page.

```bash
npm install
npx expo start        # i / a / w for iOS, Android, web
npm run typecheck
```

## Structure

| Path | What |
| --- | --- |
| `src/app/_layout.tsx` | Page frame (paper card, binding shadow, hanging tabs), font loading, lock gating with `Stack.Protected` |
| `src/app/lock.tsx` | Passcode screen |
| `src/app/index.tsx` | Today: prompt, this week, recent |
| `src/app/write.tsx` | New entry: stamp, mood + feelings, ruled body, photo, tags |
| `src/app/entry/[id].tsx` | Entry detail |
| `src/app/month.tsx` · `search.tsx` · `insight.tsx` · `setting.tsx` | The other tabs |
| `src/store/DiaryContext.tsx` | State; entries, settings and the draft persist in AsyncStorage |
| `src/theme.ts` | Palette, type scale, font stack (Avenir Next on iOS, Nunito Sans elsewhere) |

## Behaviour notes

- **Lock is a demo, as in the prototype.** Any 4 digits unlock, and the Face ID / fingerprint key unlocks right away. When 암호 잠금 is on, the app relocks whenever it goes to the background.
- **Today is the real current date.** The week strip, calendar, insights window and new entries all use it. The 12 sample entries (Oct–Nov 2026) are loaded on first launch.
- **The weather/place stamp is placeholder data** (`STAMP_PLACEHOLDER` in `src/data/seed.ts`). No location or weather service is connected.
- **Photos come from the library** via `expo-image-picker`. Sample entries show the hatched placeholder. Picked images are kept by their picker URI and are not copied into app storage yet.
- **Some settings rows don't do anything yet.** 저녁 알림 only stores the toggle and does not schedule notifications, and 내보내기 / 백업 are static rows, the same as in the design.
