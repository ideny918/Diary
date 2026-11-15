import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { EntryRow } from '../components/EntryRow';
import { Footer, Grid, Header, Label, OutlineButton, s } from '../components/ui';
import { DOW, MONTHS_SHORT, sameDay, weekOf } from '../data/dates';
import { PROMPTS } from '../data/seed';
import { useDiary } from '../store/DiaryContext';
import { C, fgOnMood, P, t, tabular } from '../theme';

export default function Today() {
  const { sorted, settings, ui, setUI, resetDraft } = useDiary();
  const today = new Date();
  const prompt = PROMPTS[ui.promptIdx % PROMPTS.length];

  const write = (p = '') => {
    resetDraft(p);
    router.push('/write');
  };

  const week = weekOf(today).map(dt => {
    const e = sorted.find(x => sameDay(x, dt));
    const isToday = dt.toDateString() === today.toDateString();
    const mi = e ? e.mood - 1 : -1;
    return { dt, isToday, bg: mi >= 0 ? P.moods[mi] : isToday ? P.wash : 'transparent', fg: mi >= 0 ? fgOnMood(mi) : C.ink };
  });

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={`${today.getMonth() + 1}.${String(today.getDate()).padStart(2, '0')}`}
        sub={`${DOW[today.getDay()]} · ${today.getFullYear()}`}
        right={<OutlineButton title="+ 쓰기" onPress={() => write()} />}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.scroll, { paddingTop: 14, paddingBottom: 20, rowGap: 22 }]} showsVerticalScrollIndicator={false}>
        {settings.prompts && (
          <View style={{ rowGap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label>Today&apos;s prompt</Label>
              <Pressable onPress={() => setUI(u => ({ promptIdx: (u.promptIdx + 1) % PROMPTS.length }))} style={{ paddingVertical: 6 }} hitSlop={8}>
                {({ pressed }) => <Text style={t(11.5, 400, 0, pressed ? C.ink : C.muted)}>다른 질문 ↻</Text>}
              </Pressable>
            </View>
            <Text style={[t(19, 500, -0.01), { lineHeight: 27.5, minHeight: 56 }]}>{prompt}</Text>
            <Pressable
              onPress={() => write(prompt)}
              style={({ pressed }) => ({ height: 42, backgroundColor: P.point, opacity: pressed ? 0.85 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 })}
            >
              <Text style={t(12.5, 400, 0.06, C.paper)}>이 질문으로 쓰기</Text>
              <Text style={t(12.5, 400, 0, C.paper)}>→</Text>
            </Pressable>
          </View>
        )}

        <View style={{ rowGap: 8 }}>
          <Label>This week</Label>
          <Grid
            items={week}
            cols={7}
            render={(w, i) => (
              <View style={{ height: 56, backgroundColor: w.bg, paddingVertical: 5, paddingHorizontal: 6, justifyContent: 'space-between' }}>
                <Text style={[t(9, 400, 0.14, w.fg), { opacity: 0.7 }]}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                <Text style={[t(13, w.isToday ? 700 : 400, 0, w.fg), tabular, w.isToday && { textDecorationLine: 'underline' }]}>{w.dt.getDate()}</Text>
              </View>
            )}
          />
        </View>

        <View>
          <Label ruled>Recent</Label>
          {sorted.slice(0, 5).map(e => (
            <EntryRow key={e.id} e={e} dateStyle="day" />
          ))}
        </View>
      </ScrollView>
      <Footer left={`${MONTHS_SHORT[today.getMonth()]} ${today.getFullYear()}`} right="Today" />
    </View>
  );
}
