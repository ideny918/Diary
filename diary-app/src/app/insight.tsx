import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Footer, Grid, Header, Label, LeaderRow, s } from '../components/ui';
import { lastDays, mdOf, sameDay } from '../data/dates';
import { Entry } from '../data/types';
import { useDiary } from '../store/DiaryContext';
import { C, MOOD_LABELS, P, t, tabular } from '../theme';

const DAYS = 30;

export default function Insight() {
  const { sorted } = useDiary();
  const days = lastDays(new Date(), DAYS);

  const recent: Entry[] = [];
  const heat = days.map(dt => {
    const es = sorted.filter(e => sameDay(e, dt));
    recent.push(...es);
    return es.length ? P.moods[es[0].mood - 1] : 'transparent';
  });

  const mixN = [1, 2, 3, 4, 5].map(v => recent.filter(e => e.mood === v).length);
  const maxN = Math.max(1, ...mixN);
  const mix = [4, 3, 2, 1, 0].map(i => ({ l: MOOD_LABELS[i], c: P.moods[i], n: mixN[i], w: `${Math.round((mixN[i] / maxN) * 100)}%` as const }));

  const ec: Record<string, number> = {};
  recent.forEach(e => e.emotions.forEach(x => (ec[x] = (ec[x] || 0) + 1)));
  const emoTop = Object.keys(ec).sort((a, b) => ec[b] - ec[a]).slice(0, 6);
  const avg = recent.length ? recent.reduce((a, e) => a + e.mood, 0) / recent.length : 3;

  const stats = [
    { v: String(recent.length), l: 'ENTRIES' },
    { v: recent.length ? MOOD_LABELS[Math.round(avg) - 1] : '—', l: 'AVG MOOD' },
    { v: emoTop[0] ?? '—', l: 'FELT MOST' },
  ];

  const start = mdOf(days[0]);
  const end = mdOf(days[DAYS - 1]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Insight" sub={`${DAYS} DAYS`} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.scroll, { paddingTop: 12, paddingBottom: 20, rowGap: 22 }]} showsVerticalScrollIndicator={false}>
        <Grid
          items={stats}
          cols={3}
          render={x => (
            <View style={{ paddingTop: 10, paddingHorizontal: 10, paddingBottom: 8, rowGap: 6 }}>
              <Text style={[t(24, 500), { lineHeight: 26 }, tabular]} numberOfLines={1}>{x.v}</Text>
              <Text style={t(9.5, 400, 0.14, C.muted)}>{x.l}</Text>
            </View>
          )}
        />

        <View style={{ rowGap: 8 }}>
          <Label>Mood by day</Label>
          <Grid items={heat} cols={15} render={c => <View style={{ aspectRatio: 1, backgroundColor: c }} />} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {[start, mdOf(days[Math.floor(DAYS / 2) - 1]), end].map(x => (
              <Text key={x} style={[t(10, 400, 0.1, C.muted), tabular]}>{x}</Text>
            ))}
          </View>
        </View>

        <View style={{ rowGap: 9 }}>
          <Label>Mood mix</Label>
          {mix.map(m => (
            <View key={m.l} style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
              <Text style={[t(12), { width: 36 }]}>{m.l}</Text>
              <View style={{ flex: 1, height: 12, borderWidth: 1, borderColor: C.ink }}>
                <View style={{ height: '100%', width: m.w, backgroundColor: m.c }} />
              </View>
              <Text style={[t(12), { width: 16, textAlign: 'right' }, tabular]}>{m.n}</Text>
            </View>
          ))}
        </View>

        <View>
          <Label style={{ paddingBottom: 6 }}>Feelings</Label>
          {emoTop.map((l, i) => (
            <LeaderRow key={l} no={String(i + 1).padStart(2, '0')} text={l} n={ec[l]} height={30} />
          ))}
        </View>
      </ScrollView>
      <Footer left="Insight" right={`${start} – ${end}`} />
    </View>
  );
}
