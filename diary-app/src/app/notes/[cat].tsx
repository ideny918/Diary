import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { goTab } from '../../components/BottomTabs';
import { NoteCard } from '../../components/NoteCard';
import { Muted, Screen } from '../../components/ui';
import { catOf, tagIdx } from '../../data/logic';
import { useDiary } from '../../store/DiaryContext';
import { C } from '../../theme';

/** One category's notes for the year, as a grid of cards. */
export default function NotesCategory() {
  const { cat } = useLocalSearchParams<{ cat: string }>();
  const { book, ui } = useDiary();
  const y = String(ui.notesYear);
  const list = book.notes
    .filter(n => catOf(n.tag) === cat && n.date.slice(0, 4) === y)
    .sort((a, b) => tagIdx(a.tag) - tagIdx(b.tag) || (a.date < b.date ? 1 : -1));
  const back = () => (router.canGoBack() ? router.back() : goTab('notes'));

  const rows: (typeof list)[] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));

  return (
    <Screen title={cat ?? ''} sub={`${y} · ${list.length}`} onBack={back} footL={cat} footR={y}>
      {list.length === 0 ? (
        <Muted>이 분류에 노트가 없어요.</Muted>
      ) : (
        <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.ink }}>
          {rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              {[0, 1].map(j => (
                <View key={j} style={{ flex: 1, height: 136, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink }}>
                  {r[j] && <NoteCard n={r[j]} style={{ flex: 1 }} />}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
