import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { excerpt, openEntry } from '../components/EntryRow';
import { Footer, Grid, Hatch, Header, MoodLine, PressRow, s, Swatch } from '../components/ui';
import { dowOf, md, MONTHS } from '../data/dates';
import { useDiary } from '../store/DiaryContext';
import { C, fgOnMood, MOOD_LABELS, P, t, tabular } from '../theme';

type Cell = { day: number | null };

export default function Month() {
  const { sorted, ui, setUI } = useDiary();
  const today = new Date();
  const first = new Date(ui.calY, ui.calM, 1);
  const cy = first.getFullYear();
  const cm = first.getMonth();
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const dim = new Date(cy, cm + 1, 0).getDate();
  const selDay = Math.min(ui.calSel, dim);

  const byDay = (d: number) => sorted.filter(e => e.y === cy && e.m === cm && e.d === d);

  const cells: Cell[] = [];
  for (let i = 0; i < lead; i++) cells.push({ day: null });
  for (let d = 1; d <= dim; d++) cells.push({ day: d });
  while (cells.length % 7) cells.push({ day: null });

  const shift = (n: number) => {
    const dt = new Date(cy, cm + n, 1);
    setUI({ calY: dt.getFullYear(), calM: dt.getMonth(), calSel: 1 });
  };

  const selEntries = byDay(selDay);

  const navBtn = (text: string, onPress: () => void, a11y: string, arrowFirst: boolean) => (
    <Pressable onPress={onPress} accessibilityLabel={a11y} hitSlop={6} style={{ height: 34, paddingHorizontal: 2, flexDirection: 'row', alignItems: 'center', columnGap: 5 }}>
      {arrowFirst && <Text style={t(7)}>◀</Text>}
      <Text style={t(10, 400, 0.16)}>{text}</Text>
      {!arrowFirst && <Text style={t(7)}>▶</Text>}
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={MONTHS[cm]}
        sub={cy}
        gap={10}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
            {navBtn('PREV', () => shift(-1), '이전 달', true)}
            <View style={{ width: 1, height: 12, backgroundColor: C.ink, opacity: 0.7 }} />
            {navBtn('NEXT', () => shift(1), '다음 달', false)}
          </View>
        }
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.scroll, { paddingTop: 12, paddingBottom: 20, rowGap: 14 }]} showsVerticalScrollIndicator={false}>
        <View>
          <View style={{ flexDirection: 'row', paddingBottom: 6 }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <Text key={i} style={[t(10, 500, 0.16), { flex: 1, textAlign: 'center' }]}>{d}</Text>
            ))}
          </View>
          <Grid
            items={cells}
            cols={7}
            render={(c, i) => {
              if (c.day === null) {
                return <View style={{ height: 50, overflow: 'hidden' }}><Hatch id={`cal-${i}`} /></View>;
              }
              const day = c.day;
              const es = byDay(day);
              const mi = es.length ? es[0].mood - 1 : -1;
              const isToday = cy === today.getFullYear() && cm === today.getMonth() && day === today.getDate();
              const sel = day === selDay;
              return (
                <Pressable
                  onPress={() => setUI({ calSel: day })}
                  accessibilityLabel={`${cm + 1}월 ${day}일`}
                  accessibilityState={{ selected: sel }}
                  style={{ height: 50, paddingVertical: 5, paddingHorizontal: 6, backgroundColor: mi >= 0 ? P.moods[mi] : isToday ? P.wash : 'transparent' }}
                >
                  {sel && <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 2, borderColor: C.ink }} />}
                  <Text style={[t(11, isToday || sel ? 700 : 400, 0, mi >= 0 ? fgOnMood(mi) : C.ink), tabular, isToday && { textDecorationLine: 'underline' }]}>{day}</Text>
                </Pressable>
              );
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {P.moods.map((c, i) => (
            <View key={c} style={{ flexDirection: 'row', alignItems: 'center', columnGap: 5 }}>
              <Swatch color={c} />
              <Text style={t(11)}>{MOOD_LABELS[i]}</Text>
            </View>
          ))}
        </View>

        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', columnGap: 8, paddingBottom: 6, borderBottomWidth: 1, borderColor: C.ink }}>
            <Text style={[t(15, 600), tabular]}>{md(cm, selDay)}</Text>
            <Text style={t(10, 400, 0.16, C.muted)}>{dowOf(cy, cm, selDay)}</Text>
          </View>
          {selEntries.map(e => (
            <PressRow
              key={e.id}
              onPress={() => openEntry(e.id)}
              style={{ rowGap: 3, paddingVertical: 10, paddingHorizontal: 2, borderBottomWidth: 1, borderColor: C.hair }}
            >
              <MoodLine mood={e.mood} marginTop={0}>
                <Text style={[t(11.5, 400, 0, C.muted), tabular]}>{e.time}</Text>
              </MoodLine>
              <Text style={t(14, 600)}>{e.title}</Text>
              <Text style={[t(12.5, 400, 0, C.muted), { lineHeight: 19 }]}>{excerpt(e.body)}</Text>
            </PressRow>
          ))}
          {selEntries.length === 0 && <Text style={[t(12.5, 400, 0, C.muted), { marginTop: 10 }]}>이 날은 기록이 없어요.</Text>}
        </View>
      </ScrollView>
      <Footer left="Month" right={cy} />
    </View>
  );
}
