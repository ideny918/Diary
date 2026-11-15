import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

import { KeywordLine } from '../components/YearKeyword';
import {
  Checklist, ConfirmButton, EmojiPicker, Field, HabitIcon, Label, LineInput, Muted, Nav, PhotoIcon, Screen,
} from '../components/ui';
import { addDays, DOW, dotted, dowIdx, parse, sleepH, todayStr } from '../data/dates';
import { MOODS, WEATHERS } from '../data/kit';
import { autoQ, hState, nextHState } from '../data/logic';
import { useDiary } from '../store/DiaryContext';
import { C, noOutline, serif, t, tabular } from '../theme';

/** Day: the Kit's daily spread, left page then right page, in one scroll. */
export default function DayScreen() {
  const { ui, setUI, day, setDay, book, settings, setHabitState, addNote, clearDay } = useDiary();
  const d = ui.cursor;
  const k = day(d);
  const dt = parse(d);
  const today = todayStr();
  const set = (patch: Parameters<typeof setDay>[1]) => setDay(d, patch);
  const [picker, setPicker] = useState<'mood' | 'weather' | null>(null);
  const [editQ, setEditQ] = useState(false);

  // Today's question: saved one wins, otherwise the date's automatic pick (offset by "다른 질문").
  const question = k.question || autoQ(d, ui.qoff[d] ?? 0);
  const nextQ = () => {
    const off = (ui.qoff[d] ?? 0) + 1;
    setUI(u => ({ qoff: { ...u.qoff, [d]: off } }));
    if (k.answer.trim() || k.question) set({ question: autoQ(d, off) });
  };

  const habits = book.habits.filter(h => (settings.hshow === 'all' || h.on) && h.start <= d);
  const notes = book.notes.filter(n => n.date === d);
  const hrs = sleepH(k.wake, k.bed);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]) set({ photoUri: res.assets[0].uri });
  };

  const mwBtn = (kind: 'mood' | 'weather') => {
    const v = kind === 'mood' ? k.mood : k.weather;
    return (
      <Pressable
        onPress={() => setPicker(kind)}
        accessibilityLabel={kind === 'mood' ? '기분' : '날씨'}
        style={{ minWidth: 30, height: 26, paddingHorizontal: v ? 6 : 10, borderWidth: 1, borderColor: C.faint, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
      >
        {v ? <Text style={{ fontSize: 15, lineHeight: 18 }}>{v}</Text> : <Text style={t(10.5, 400, 0.08, C.soft)}>{kind === 'mood' ? '기분' : '날씨'}</Text>}
      </Pressable>
    );
  };

  return (
    <Screen
      title={`${dt.getMonth() + 1}.${dt.getDate()}`}
      sub={`${DOW[dowIdx(d)]} · ${dt.getFullYear()}`}
      right={<Nav onPrev={() => setUI({ cursor: addDays(d, -1) })} onNext={() => setUI({ cursor: addDays(d, 1) })} onToday={d === today ? undefined : () => setUI({ cursor: today })} />}
      footL={dotted(d)}
      footR={dt.getFullYear()}
    >
      {/* ── left page ── */}
      <KeywordLine d={d} />
      <View style={{ flexDirection: 'row', columnGap: 6, justifyContent: 'flex-end', marginTop: 8, marginBottom: 6 }}>
        {mwBtn('mood')}
        {mwBtn('weather')}
      </View>

      <View style={{ flexDirection: 'row', columnGap: 12, borderBottomWidth: 1, borderColor: C.ink, paddingBottom: 8 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {/* sleep */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 18, rowGap: 4, paddingBottom: 7, borderBottomWidth: 1, borderColor: C.faint }}>
            {(['wake', 'bed'] as const).map(f => (
              <View key={f} style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
                <Label>{f === 'wake' ? 'Wake Up' : 'In Bed'}</Label>
                <LineInput
                  value={k[f]}
                  onChangeText={v => set({ [f]: v })}
                  placeholder={f === 'wake' ? '07:00' : '23:30'}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  accessibilityLabel={f === 'wake' ? 'Wake Up' : 'In Bed'}
                  style={[{ width: 46 }, tabular]}
                />
              </View>
            ))}
            {!!hrs && (
              <View style={{ borderWidth: 1, borderColor: C.ink, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
                <Text style={[t(11.5), tabular, { lineHeight: 14 }]}>{hrs}</Text>
              </View>
            )}
          </View>
          {/* habits */}
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10, paddingTop: 6 }}>
            <Label>Habit</Label>
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', columnGap: 4 }}>
              {habits.length === 0 ? (
                <Muted>습관을 Habit 탭에서 추가해요</Muted>
              ) : (
                habits.map(h => {
                  const st = hState(book, h, d);
                  return (
                    <Pressable
                      key={h.id}
                      disabled={d > today}
                      onPress={() => setHabitState(d, h.id, nextHState(st))}
                      accessibilityLabel={h.name}
                      accessibilityState={{ selected: st === 2 }}
                      style={({ pressed }) => ({ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: pressed ? C.wash : 'transparent', opacity: d > today ? 0.5 : 1 })}
                    >
                      <HabitIcon icon={h.icon} name={h.name} state={st} size={20} />
                    </Pressable>
                  );
                })
              )}
            </View>
          </View>
        </View>
        {/* photo */}
        <Pressable
          onPress={pickPhoto}
          onLongPress={() => k.photoUri && set({ photoUri: '' })}
          accessibilityLabel={k.photoUri ? '사진 바꾸기 (길게 눌러 지우기)' : '사진 올리기'}
          style={{ width: 84, height: 84, borderWidth: 1, borderStyle: k.photoUri ? 'solid' : 'dashed', borderColor: C.faint, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          {k.photoUri ? <Image source={{ uri: k.photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <PhotoIcon />}
        </Pressable>
      </View>

      {/* today's question */}
      <View style={{ paddingTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderColor: C.faint, rowGap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Label>Today&apos;s Question</Label>
          <View style={{ marginLeft: 'auto', flexDirection: 'row', columnGap: 10 }}>
            <Pressable onPress={nextQ} hitSlop={6}><Text style={t(10.5, 400, 0.04, C.soft)}>다른 질문</Text></Pressable>
            <Pressable onPress={() => setEditQ(true)} hitSlop={6}><Text style={t(10.5, 400, 0.04, C.soft)}>직접 쓰기</Text></Pressable>
          </View>
        </View>
        {editQ ? (
          <TextInput
            autoFocus
            defaultValue={question}
            onEndEditing={e => { const q = e.nativeEvent.text.trim(); if (q) set({ question: q }); setEditQ(false); }}
            returnKeyType="done"
            style={[noOutline, serif(false), { fontSize: 14, color: C.ink, borderBottomWidth: 1, borderColor: C.ink, padding: 0, paddingBottom: 2 }]}
          />
        ) : (
          <Text style={[serif(false), { fontSize: 14, lineHeight: 20, color: C.ink, paddingTop: 2, paddingBottom: 3 }]}>{question}</Text>
        )}
        <TextInput
          value={k.answer}
          onChangeText={answer => set(k.question ? { answer } : { answer, question })}
          placeholder="—"
          placeholderTextColor={C.faint}
          multiline
          scrollEnabled={false}
          style={[noOutline, t(13), { lineHeight: 20.8, minHeight: 52, padding: 0, textAlignVertical: 'top' }]}
        />
      </View>

      <View style={{ flexDirection: 'row', columnGap: 16 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field title="Joy" value={k.joy} onChange={joy => set({ joy })} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Field
            title="마음 한 줄"
            value={k.feeling}
            onChange={feeling => set({ feeling })}
            placeholder="서운하거나 버거웠던 일"
            right={
              <Pressable onPress={() => set({ talked: !k.talked })} accessibilityState={{ selected: k.talked }}
                style={{ borderWidth: 1, borderColor: k.talked ? C.ink : C.faint, backgroundColor: k.talked ? C.ink : 'transparent', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
                <Text style={t(10.5, 400, 0.04, k.talked ? C.paper : C.soft)}>{k.talked ? '말했어요 ✓' : '말했어요'}</Text>
              </Pressable>
            }
          />
        </View>
      </View>
      <Field title="Reset" value={k.reset} onChange={reset => set({ reset })} minHeight={44} />
      <Field title="Tomorrow" value={k.tomorrow} onChange={tomorrow => set({ tomorrow })} minHeight={44} sec />
      <Field title="Comment" value={k.comment} onChange={comment => set({ comment })} minHeight={44} sec />

      {/* ── right page ── */}
      <View style={{ height: 22 }} />
      <Field title="Event" value={k.event} onChange={event => set({ event })} minHeight={44} />
      <View style={{ paddingTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderColor: C.faint, rowGap: 2 }}>
        <Label>To do</Label>
        <Checklist value={k.todo} onChange={todo => set({ todo })} placeholder="할 일 추가" />
      </View>
      <Field title="Log" value={k.log} onChange={log => set({ log })} minHeight={104} sec />

      <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: C.ink, rowGap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
          <Label>Notes</Label>
          <Pressable
            onPress={() => router.push({ pathname: '/note/[id]', params: { id: addNote(d) } })}
            accessibilityLabel="이 날 노트 추가"
            hitSlop={8}
          >
            <Text style={t(13, 400, 0, C.soft)}>+</Text>
          </Pressable>
        </View>
        {notes.length ? (
          notes.map(n => (
            <Pressable key={n.id} onPress={() => router.push({ pathname: '/note/[id]', params: { id: n.id } })} style={{ paddingVertical: 2 }}>
              <Text style={t(12.5)}>{n.tag} · {n.name || '제목 없음'}</Text>
            </Pressable>
          ))
        ) : (
          <Muted>이 날 쓴 노트가 없어요.</Muted>
        )}
      </View>

      {!!(book.days[d] || book.hlog[d]) && (
        <View style={{ marginTop: 18, alignItems: 'flex-start' }}>
          <ConfirmButton
            title="이 날 기록 지우기"
            message={`${dotted(d)}에 쓴 내용과 습관 체크를 지워요. 이 날의 노트는 남아요.`}
            onConfirm={() => clearDay(d)}
          />
        </View>
      )}

      <EmojiPicker
        visible={picker !== null}
        title={picker === 'mood' ? '기분' : '날씨'}
        options={picker === 'weather' ? WEATHERS : MOODS}
        value={picker === 'weather' ? k.weather : k.mood}
        onPick={v => set(picker === 'weather' ? { weather: v } : { mood: v })}
        onClose={() => setPicker(null)}
      />
    </Screen>
  );
}
