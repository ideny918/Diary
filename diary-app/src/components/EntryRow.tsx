import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { dd, dowOf, md } from '../data/dates';
import { Entry } from '../data/types';
import { C, t, tabular } from '../theme';
import { MoodLine, PressRow } from './ui';

/** First ~60 chars, cut at a word boundary; line breaks collapse like inline HTML text. */
export const excerpt = (body: string) => {
  const cut = body.length > 60 ? body.slice(0, 60).replace(/\s+\S*$/, '') + '…' : body;
  return cut.replace(/\s+/g, ' ');
};

export const openEntry = (id: string) => router.push({ pathname: '/entry/[id]', params: { id } });

/** List row: date column on the left, title / excerpt / mood + tags on the right. */
export function EntryRow({ e, dateStyle }: { e: Entry; dateStyle: 'day' | 'monthDay' }) {
  return (
    <PressRow
      onPress={() => openEntry(e.id)}
      style={{ flexDirection: 'row', columnGap: 12, paddingVertical: 10, paddingHorizontal: 2, borderBottomWidth: 1, borderColor: C.ink }}
    >
      <View style={{ width: 44, rowGap: 3 }}>
        <Text style={[dateStyle === 'day' ? t(18, 500) : t(16, 500), { lineHeight: dateStyle === 'day' ? 20 : 18 }, tabular]}>
          {dateStyle === 'day' ? dd(e.d) : md(e.m, e.d)}
        </Text>
        <Text style={t(10, 400, 0.16, C.muted)}>{dowOf(e.y, e.m, e.d)}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, rowGap: 3 }}>
        <Text style={t(14, 600)}>{e.title}</Text>
        <Text style={[t(12.5, 400, 0, C.muted), { lineHeight: 19 }]}>{excerpt(e.body)}</Text>
        <MoodLine mood={e.mood}>
          <Text style={t(11.5, 400, 0, C.muted)}>{e.tags.map(x => '#' + x).join(' ')}</Text>
        </MoodLine>
      </View>
    </PressRow>
  );
}
