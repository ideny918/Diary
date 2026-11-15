import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { goTab } from '../components/BottomTabs';
import { Checklist, Field, Label, Nav, Screen } from '../components/ui';
import { addDays, MONTHS, md, parse, rotDOW, startOf, todayStr, wno } from '../data/dates';
import { tagEmoji } from '../data/logic';
import { useDiary } from '../store/DiaryContext';
import { C, font, noOutline, t, tabular } from '../theme';

/** Week: weekly goal + period log, then one box per day (events, log, notes). */
export default function WeekScreen() {
  const { ui, setUI, day, setDay, book, settings, setWeek } = useDiary();
  const ws = startOf(ui.cursor, settings.wStart);
  const we = addDays(ws, 6);
  const today = todayStr();
  const wk = book.weeks[ws] ?? {};
  const WD = rotDOW(settings.wStart);
  const openDay = (d: string) => {
    setUI({ cursor: d });
    goTab('day');
  };

  return (
    <Screen
      title={`Week ${wno(ws, settings.wStart)}`}
      sub={`${md(ws)} – ${md(we)}`}
      right={
        <Nav
          onPrev={() => setUI({ cursor: addDays(ws, -7) })}
          onNext={() => setUI({ cursor: addDays(ws, 7) })}
          onToday={today >= ws && today <= we ? undefined : () => setUI({ cursor: today })}
        />
      }
      footL={`${MONTHS[parse(ws).getMonth()].slice(0, 3)} ${parse(ws).getFullYear()}`}
      footR={parse(we).getFullYear()}
    >
      <View style={{ borderBottomWidth: 1, borderColor: C.ink, paddingBottom: 6, rowGap: 4 }}>
        <Label>Weekly Goal</Label>
        <Checklist value={wk.goal ?? ''} onChange={goal => setWeek(ws, { goal })} />
      </View>
      <Field title="Period Log" value={wk.log ?? ''} onChange={log => setWeek(ws, { log })} minHeight={44} sec />

      {[0, 1, 2, 3, 4, 5, 6].map(i => {
        const d = addDays(ws, i);
        const k = day(d);
        const isToday = d === today;
        const notes = book.notes.filter(n => n.date === d);
        return (
          <View key={d} style={{ flexDirection: 'row', columnGap: 12, borderBottomWidth: 1, borderColor: C.ink, paddingTop: 8, paddingBottom: 6, paddingHorizontal: 2 }}>
            <Pressable onPress={() => openDay(d)} accessibilityLabel={`${d} 데일리로 이동`} style={{ width: 44 }}>
              <Text style={[t(18, 500), { lineHeight: 20 }, tabular, isToday && { textDecorationLine: 'underline' }]}>{parse(d).getDate()}</Text>
              <Text style={t(10, 400, 0.16, C.soft)}>{WD[i]}</Text>
              {!!(k.mood || k.weather) && <Text style={{ fontSize: 11, letterSpacing: 1, marginTop: 5 }}>{k.mood}{k.weather}</Text>}
            </Pressable>
            <View style={{ flex: 1, minWidth: 0, rowGap: 2 }}>
              {!!k.event && <Text style={[t(12, 400, 0, C.soft), { lineHeight: 18 }]}>{k.event}</Text>}
              <TextInput
                value={k.log}
                onChangeText={log => setDay(d, { log })}
                placeholder="—"
                placeholderTextColor={C.faint}
                multiline
                scrollEnabled={false}
                accessibilityLabel={`${d} Log`}
                style={[noOutline, font(400), { fontSize: 12, lineHeight: 18, color: C.ink, minHeight: 36, padding: 0, textAlignVertical: 'top' }]}
              />
              {notes.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 10, rowGap: 2 }}>
                  {notes.map(n => (
                    <Pressable key={n.id} onPress={() => router.push({ pathname: '/note/[id]', params: { id: n.id } })}>
                      <Text style={t(11.5, 400, 0, C.soft)}>{tagEmoji(n.tag)} {n.name || '제목 없음'}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}
