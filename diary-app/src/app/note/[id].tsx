import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, Text, TextInput, View } from 'react-native';

import { goTab } from '../../components/BottomTabs';
import { Label, LineInput, MkBtn, Muted, OnTag, Screen } from '../../components/ui';
import { dotted, parse } from '../../data/dates';
import { CATS } from '../../data/kit';
import { catOf } from '../../data/logic';
import { useDiary } from '../../store/DiaryContext';
import { C, font, noOutline, t } from '../../theme';

/** Note editor: title, date, category tag, ON, body. */
export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { book, setNote, deleteNote } = useDiary();
  const n = book.notes.find(x => x.id === id);
  const [cat, setCat] = useState<string | null>(null);
  const back = () => {
    if (n && !n.name.trim() && !n.body.trim()) deleteNote(n.id); // don't keep empty notes
    if (router.canGoBack()) router.back();
    else goTab('notes');
  };

  if (!n) return <Screen title="Note" onBack={back}><Muted>노트를 찾을 수 없어요.</Muted></Screen>;

  const shownCat = cat ?? catOf(n.tag);
  const tags = CATS.find(c => c[0] === shownCat)?.[1] ?? [];
  const set = (patch: Parameters<typeof setNote>[1]) => setNote(n.id, patch);

  const remove = () => {
    const go = () => {
      deleteNote(n.id);
      back();
    };
    if (Platform.OS === 'web') return go();
    Alert.alert('노트 삭제', '이 노트를 지울까요?', [{ text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: go }]);
  };

  return (
    <Screen
      title="Note"
      sub={dotted(n.date)}
      onBack={back}
      right={<OnTag big on={n.on} onPress={() => set({ on: !n.on })} />}
      footL={n.tag}
      footR={parse(n.date).getFullYear()}
    >
      <View style={{ rowGap: 14 }}>
        <TextInput
          value={n.name}
          onChangeText={name => set({ name })}
          placeholder="제목"
          placeholderTextColor={C.faint}
          autoFocus={!n.name}
          style={[noOutline, t(18), { borderBottomWidth: 1, borderColor: C.ink, paddingVertical: 6, paddingHorizontal: 0 }]}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
          <Label>Date</Label>
          <LineInput
            defaultValue={n.date}
            onEndEditing={e => { const v = e.nativeEvent.text.trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(v)) set({ date: v }); }}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            style={{ width: 110, borderBottomWidth: 1, borderColor: C.faint }}
          />
        </View>
        <View style={{ rowGap: 8 }}>
          <Label>Tag</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {CATS.map(([c]) => (
              <Pressable key={c} onPress={() => setCat(c)} style={{ borderWidth: 1, borderColor: c === shownCat ? C.ink : C.faint, paddingHorizontal: 9, paddingVertical: 3 }}>
                <Text style={t(12, 400, 0, c === shownCat ? C.ink : C.soft)}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {tags.map(tag => (
              <MkBtn key={tag} title={tag} on={tag === n.tag} onPress={() => set({ tag })} style={{ paddingVertical: 3, paddingHorizontal: 9 }} />
            ))}
          </View>
        </View>
        <TextInput
          value={n.body}
          onChangeText={body => set({ body })}
          placeholder="본문을 써요"
          placeholderTextColor={C.faint}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          style={[noOutline, font(400), { fontSize: 13.5, lineHeight: 23, color: C.ink, minHeight: 200, borderTopWidth: 1, borderColor: C.ink, paddingTop: 12, paddingHorizontal: 0 }]}
        />
        <Pressable onPress={remove} style={{ alignSelf: 'flex-end', paddingVertical: 6 }}>
          <Text style={t(11, 400, 0, C.soft)}>노트 삭제</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
