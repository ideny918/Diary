import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, Text, TextInput, View } from 'react-native';

import { goTab } from '../../components/BottomTabs';
import { EmojiPicker, HabitIcon, Label, LineInput, Muted, Nav, OnTag, Screen } from '../../components/ui';
import { addDays, dowIdx, fmt, MONTHS, rotDOW, todayStr } from '../../data/dates';
import { HCATS, HICONS } from '../../data/kit';
import { hRate, hState, hStreaks, nextHState } from '../../data/logic';
import { useDiary } from '../../store/DiaryContext';
import { C, noOutline, t, tabular } from '../../theme';

/** Habit detail: settings (on, start, order, category, icon), stats and a 12-month calendar. */
export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { book, ui, setUI, settings, setHabit, moveHabit, deleteHabit, setHabitState } = useDiary();
  const h = book.habits.find(x => x.id === id);
  const [iconOpen, setIconOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const back = () => (router.canGoBack() ? router.back() : goTab('habit'));
  if (!h) return <Screen title="Habit" onBack={back}><Muted>습관을 찾을 수 없어요.</Muted></Screen>;

  const today = todayStr();
  const y = ui.habitYear;
  const [cur, best] = hStreaks(book, h, today);
  const yr = hRate(book, h, `${y}-01-01`, `${y}-12-31`, today);
  const mr = hRate(book, h, `${today.slice(0, 7)}-01`, today, today);
  const idx = book.habits.indexOf(h);
  const cats = [...HCATS, ...book.habits.map(x => x.category)].filter((c, i, a) => a.indexOf(c) === i);

  const remove = () => {
    const go = () => {
      deleteHabit(h.id);
      back();
    };
    if (Platform.OS === 'web') return go();
    Alert.alert('습관 삭제', `「${h.name}」을 지울까요? 기록도 함께 보이지 않게 돼요.`, [{ text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: go }]);
  };

  const month = (m: number) => {
    const a = fmt(new Date(y, m, 1));
    const last = new Date(y, m + 1, 0).getDate();
    const lead = settings.mStart ? new Date(y, m, 1).getDay() : dowIdx(a);
    const cells: (string | null)[] = [...Array(lead).fill(null)];
    for (let i = 0; i < last; i++) cells.push(addDays(a, i));
    while (cells.length < 42) cells.push(null);
    const r = hRate(book, h, a, addDays(a, last - 1), today);
    const now = a.slice(0, 7) === today.slice(0, 7);
    return (
      <View key={m} style={{ flex: 1, minWidth: 0, rowGap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderBottomWidth: 1, borderColor: C.ink, paddingBottom: 3 }}>
          <Text style={[t(12, 600, 0.04), now && { textDecorationLine: 'underline' }]}>{MONTHS[m].slice(0, 3)}</Text>
          <Text style={[t(12), tabular]}>{r == null ? '—' : `${r}%`}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {rotDOW(settings.mStart).map(x => <Text key={x} style={[t(8, 400, 0, C.soft), { width: '14.285%', textAlign: 'center' }]}>{x[0]}</Text>)}
          {cells.map((d, i) => {
            if (!d) return <View key={i} style={{ width: '14.285%', aspectRatio: 1 }} />;
            const dis = d > today || d < h.start;
            const st = hState(book, h, d);
            return (
              <View key={i} style={{ width: '14.285%', aspectRatio: 1, padding: 1 }}>
                <Pressable
                  disabled={dis}
                  onPress={() => setHabitState(d, h.id, nextHState(st))}
                  accessibilityLabel={d}
                  style={{ flex: 1, borderRadius: 999, borderWidth: 1, borderColor: dis ? 'transparent' : st ? C.point : C.faint, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: st === 2 ? C.point : 'transparent', outlineWidth: d === today ? 1 : 0, outlineColor: C.point, outlineOffset: 1 }}
                >
                  {st === 1 && <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', backgroundColor: C.point }} />}
                  <Text style={[t(8, 400, 0, dis ? C.faint : st === 2 ? C.paper : C.soft), tabular]}>{+d.slice(8)}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const stat = (v: string, l: string) => (
    <View style={{ flex: 1, rowGap: 6 }}>
      <Text style={[t(22, 500), tabular, { lineHeight: 24 }]}>{v}</Text>
      <Text style={[t(9.5, 400, 0.12, C.soft), { textTransform: 'uppercase' }]}>{l}</Text>
    </View>
  );

  return (
    <Screen
      title={
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6, flexShrink: 1 }}>
          <HabitIcon icon={h.icon} name={h.name} size={24} />
          <TextInput
            value={h.name}
            onChangeText={name => setHabit(h.id, { name })}
            style={[noOutline, { fontFamily: 'GowunBatang_700Bold', fontSize: 24, color: C.ink, padding: 0, flexShrink: 1, minWidth: 60 }]}
          />
        </View>
      }
      onBack={back}
      right={<Nav onPrev={() => setUI({ habitYear: y - 1 })} onNext={() => setUI({ habitYear: y + 1 })} />}
      footL={h.category}
      footR={y}
    >
      <View style={{ rowGap: 12, borderBottomWidth: 1, borderColor: C.ink, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 10, rowGap: 8 }}>
          <Label>On</Label>
          <OnTag big on={h.on} onPress={() => setHabit(h.id, { on: !h.on })} />
          <Label style={{ marginLeft: 6 }}>Start</Label>
          <LineInput
            defaultValue={h.start}
            onEndEditing={e => { const v = e.nativeEvent.text.trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(v)) setHabit(h.id, { start: v }); }}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            style={{ width: 92, borderBottomWidth: 1, borderColor: C.faint }}
          />
          <Label style={{ marginLeft: 6 }}>Order</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
            <Pressable onPress={() => moveHabit(h.id, -1)} hitSlop={8} accessibilityLabel="순서 앞으로"><Text style={t(9)}>◀</Text></Pressable>
            <Text style={[t(13, 700), tabular]}>{idx + 1}</Text>
            <Pressable onPress={() => moveHabit(h.id, 1)} hitSlop={8} accessibilityLabel="순서 뒤로"><Text style={t(9)}>▶</Text></Pressable>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          <Label style={{ marginRight: 6 }}>Category</Label>
          {cats.map(c => (
            <Pressable key={c} onPress={() => setHabit(h.id, { category: c })} style={{ borderWidth: 1, borderColor: c === h.category ? C.point : C.faint, backgroundColor: c === h.category ? C.point : 'transparent', paddingHorizontal: 9, paddingVertical: 3 }}>
              <Text style={t(12, 400, 0, c === h.category ? C.paper : C.soft)}>{c}</Text>
            </Pressable>
          ))}
          <TextInput
            value={newCat}
            onChangeText={setNewCat}
            onSubmitEditing={() => { if (newCat.trim()) setHabit(h.id, { category: newCat.trim() }); setNewCat(''); }}
            placeholder="+ 직접 입력"
            placeholderTextColor={C.faint}
            returnKeyType="done"
            style={[noOutline, t(12), { width: 90, borderBottomWidth: 1, borderColor: C.faint, paddingVertical: 3, paddingHorizontal: 0 }]}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
          <Label>Icon</Label>
          <Pressable onPress={() => setIconOpen(true)} accessibilityLabel="아이콘 고르기" style={{ width: 28, height: 28, borderWidth: 1, borderColor: C.faint, alignItems: 'center', justifyContent: 'center' }}>
            <HabitIcon icon={h.icon} name={h.name} size={16} />
          </Pressable>
          <Pressable onPress={remove} style={{ marginLeft: 'auto' }}>
            <Text style={[t(11, 400, 0, C.soft)]}>삭제</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', columnGap: 10, paddingVertical: 14, borderBottomWidth: 1, borderColor: C.ink }}>
        {stat(yr == null ? '—' : `${yr}%`, `${y} 달성률`)}
        {stat(mr == null ? '—' : `${mr}%`, '이번 달')}
        {stat(`${cur}일`, '연속')}
        {stat(`${best}일`, '최장 연속')}
      </View>

      <View style={{ rowGap: 16, paddingTop: 14 }}>
        {[0, 2, 4, 6, 8, 10].map(m => (
          <View key={m} style={{ flexDirection: 'row', columnGap: 16 }}>
            {month(m)}
            {month(m + 1)}
          </View>
        ))}
      </View>

      <EmojiPicker
        visible={iconOpen}
        title="아이콘"
        options={HICONS.map(e => [e, ''] as [string, string])}
        value={h.icon}
        onPick={icon => setHabit(h.id, { icon })}
        onClose={() => setIconOpen(false)}
        cols={8}
      />
    </Screen>
  );
}
