import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';

import { dotted } from '../data/dates';
import { Note } from '../data/types';
import { useDiary } from '../store/DiaryContext';
import { C, t, tabular } from '../theme';
import { OnTag } from './ui';

export const openNote = (id: string) => router.push({ pathname: '/note/[id]', params: { id } });

/** .ncard — date, title (3 lines), tag, and an ON tag in the corner */
export function NoteCard({ n, style }: { n: Note; style?: ViewStyle }) {
  const { setNote } = useDiary();
  return (
    <View style={[{ backgroundColor: C.paper }, style]}>
      <Pressable onPress={() => openNote(n.id)} style={({ pressed }) => ({ flex: 1, padding: 12, paddingRight: 34, rowGap: 6, backgroundColor: pressed ? C.wash : 'transparent' })}>
        <Text style={[t(10.5, 400, 0.06, C.soft), tabular]}>{dotted(n.date)}</Text>
        <Text style={[t(13, 600), { lineHeight: 18 }]} numberOfLines={3}>{n.name || '제목 없음'}</Text>
        <Text style={t(11, 400, 0, C.soft)}>{n.tag}</Text>
      </Pressable>
      <View style={{ position: 'absolute', top: 10, right: 10 }}>
        <OnTag on={n.on} onPress={() => setNote(n.id, { on: !n.on })} />
      </View>
    </View>
  );
}
