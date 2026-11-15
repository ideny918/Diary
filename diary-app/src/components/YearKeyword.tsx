import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { antiList, antiOfDay } from '../data/logic';
import { useDiary } from '../store/DiaryContext';
import { C, noOutline, serif, t, tabular } from '../theme';
import { Label, MkBtn } from './ui';

/** Keyword + numbered anti-goal list for one year, editable in place. */
export function YearEditor({ year }: { year: string }) {
  const { book, setYear } = useDiary();
  const rec = book.years[year] ?? {};
  const items = antiList(rec.anti ?? '');
  const [draft, setDraft] = useState('');
  const setItems = (next: string[]) => setYear(year, { anti: next.join('\n') });

  return (
    <View style={{ rowGap: 14 }}>
      <View style={{ rowGap: 4 }}>
        <Label>올해의 키워드</Label>
        <TextInput
          value={rec.keyword ?? ''}
          onChangeText={keyword => setYear(year, { keyword })}
          placeholder="한 단어나 짧은 문장"
          placeholderTextColor={C.faint}
          accessibilityLabel="올해의 키워드"
          style={[noOutline, serif(), { fontSize: 18, color: C.ink, borderBottomWidth: 1, borderColor: C.ink, paddingVertical: 4, paddingHorizontal: 0 }]}
        />
      </View>
      <View style={{ rowGap: 2 }}>
        <Label>안티 목표</Label>
        {items.map((a, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, minHeight: 30, borderBottomWidth: 1, borderColor: C.faint }}>
            <Text style={[t(10.5, 400, 0.1, C.soft), tabular, { width: 18 }]}>{String(i + 1).padStart(2, '0')}</Text>
            <TextInput
              value={a}
              onChangeText={v => setItems(items.map((x, j) => (j === i ? v : x)))}
              onEndEditing={() => { if (!a.trim()) setItems(items.filter((_, j) => j !== i)); }}
              returnKeyType="done"
              style={[noOutline, t(13), { flex: 1, paddingVertical: 4, paddingHorizontal: 0 }]}
            />
            <Pressable onPress={() => setItems(items.filter((_, j) => j !== i))} hitSlop={8} accessibilityLabel="안티 목표 삭제">
              <Text style={[t(15, 400, 0, C.soft), { opacity: 0.45 }]}>×</Text>
            </Pressable>
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, minHeight: 30 }}>
          <Text style={[t(13, 400, 0, C.soft), { width: 18, textAlign: 'center' }]}>+</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => {
              if (draft.trim()) setItems([...items, draft.trim()]);
              setDraft('');
            }}
            submitBehavior="submit"
            returnKeyType="done"
            placeholder="하지 않을 것 추가"
            placeholderTextColor={C.faint}
            accessibilityLabel="안티 목표 추가"
            style={[noOutline, t(13), { flex: 1, paddingVertical: 4, paddingHorizontal: 0 }]}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Top line of the Day page (Kit .kwl): this year's keyword and one anti-goal that changes daily.
 * Tapping it opens the full list, editable.
 */
export function KeywordLine({ d }: { d: string }) {
  const { book } = useDiary();
  const [open, setOpen] = useState(false);
  const year = d.slice(0, 4);
  const rec = book.years[year] ?? {};
  const kw = (rec.keyword ?? '').trim();
  const ag = antiOfDay(antiList(rec.anti ?? ''), d);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="올해의 키워드와 안티 목표 보기"
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'baseline', columnGap: 8, paddingTop: 3, paddingBottom: 6, borderBottomWidth: 1, borderColor: C.faint, backgroundColor: pressed ? C.wash : 'transparent' })}
      >
        <Text style={[serif(), { fontSize: 13, color: kw ? C.ink : C.soft }]}>{kw || '올해의 키워드'}</Text>
        {!!ag && <Text style={[t(11.5, 400, 0, C.soft), { flex: 1 }]} numberOfLines={1}>· {ag}</Text>}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.18)', justifyContent: 'center', padding: 22 }}>
            <Pressable style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.ink, maxHeight: '85%', boxShadow: '0px 10px 28px rgba(0,0,0,0.14)' }}>
              <ScrollView contentContainerStyle={{ padding: 16, rowGap: 16 }} keyboardShouldPersistTaps="handled">
                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <Text style={[serif(), { fontSize: 20, color: C.ink }]}>{year}</Text>
                  <Text style={t(11, 400, 0, C.soft)}>안티 목표는 날마다 하나씩 Day 맨 위에 보여요</Text>
                </View>
                <YearEditor year={year} />
                <MkBtn title="닫기" onPress={() => setOpen(false)} style={{ alignSelf: 'flex-end' }} />
              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
