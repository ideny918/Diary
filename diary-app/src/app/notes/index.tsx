import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { NoteCard, openNote } from '../../components/NoteCard';
import { Hatch, MkBtn, Muted, Screen, SectionHead } from '../../components/ui';
import { addDays, addMonths, MONTHS, monthRange, parse, rotDOW, startOf, todayStr } from '../../data/dates';
import { CATS } from '../../data/kit';
import { catOf, tagEmoji } from '../../data/logic';
import { useDiary } from '../../store/DiaryContext';
import { C, t, tabular } from '../../theme';

const byDateDesc = (a: { date: string }, b: { date: string }) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

/** Notes: contents by category for the year, notes marked ON, and a month calendar of notes. */
export default function NotesScreen() {
  const { book, ui, setUI, settings, addNote } = useDiary();
  const y = ui.notesYear;
  const today = todayStr();
  const NY = book.notes.filter(n => n.date.slice(0, 4) === String(y));
  const by: Record<string, number> = {};
  NY.forEach(n => (by[catOf(n.tag)] = (by[catOf(n.tag)] || 0) + 1));
  const cats = [...CATS.map(c => c[0]), '기타'].filter(c => by[c]);
  const onList = NY.filter(n => n.on).sort(byDateDesc);

  // month calendar
  const ym = ui.notesYM.slice(0, 4) === String(y) ? ui.notesYM : `${y}${ui.notesYM.slice(4)}`;
  const [a, b] = monthRange(`${ym}-01`);
  const start = startOf(a, settings.mStart);
  const cells: string[] = [];
  for (let d = start; d <= b || cells.length % 7; d = addDays(d, 1)) cells.push(d);
  const monthCount = book.notes.filter(n => n.date >= a && n.date <= b).length;

  const newNote = () => openNote(addNote(today.slice(0, 4) === String(y) ? today : `${y}-01-01`));

  return (
    <Screen
      title="Notes"
      sub={NY.length}
      right={<View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}><MkBtn title="+ 새 노트" onPress={newNote} style={{ paddingVertical: 2, paddingHorizontal: 9 }} /></View>}
      footL={y}
      footR=""
    >
      {/* contents */}
      <View style={{ width: '78%', maxWidth: 260, alignSelf: 'center', rowGap: 14, paddingTop: 6, paddingBottom: 22 }}>
        <View style={{ alignItems: 'center', rowGap: 10, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 18 }}>
            <Pressable onPress={() => setUI({ notesYear: y - 1 })} hitSlop={10} accessibilityLabel="이전 해"><Text style={t(9)}>◀</Text></Pressable>
            <Text style={[t(30, 700, 0.04), tabular]}>{y}</Text>
            <Pressable onPress={() => setUI({ notesYear: y + 1 })} hitSlop={10} accessibilityLabel="다음 해"><Text style={t(9)}>▶</Text></Pressable>
          </View>
          <Text style={[t(11, 400, 0.42), { textTransform: 'uppercase' }]}>Contents</Text>
        </View>
        {cats.length === 0 && <Muted style={{ textAlign: 'center' }}>이 해에 쓴 노트가 없어요.</Muted>}
        {cats.map((c, i) => (
          <Pressable key={c} onPress={() => router.push({ pathname: '/notes/[cat]', params: { cat: c } })} style={{ flexDirection: 'row', alignItems: 'baseline', columnGap: 10 }}>
            <Text style={[t(10.5, 400, 0.1, C.soft), tabular]}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={t(17, 600)}>{c}</Text>
            <View style={{ flex: 1, minWidth: 20, borderBottomWidth: 1, borderStyle: 'dotted', borderColor: C.soft, transform: [{ translateY: -4 }] }} />
            <Text style={[t(13), tabular]}>{by[c]}</Text>
          </Pressable>
        ))}
      </View>

      {/* ON */}
      {onList.length > 0 && (
        <View style={{ rowGap: 8, marginBottom: 18 }}>
          <SectionHead title="On" right={onList.length} ruled={false} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderTopWidth: 1, borderBottomWidth: 1, borderLeftWidth: 1, borderColor: C.ink }}>
            {onList.map(n => (
              <NoteCard key={n.id} n={n} style={{ width: 160, height: 104, borderRightWidth: 1, borderColor: C.ink }} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* month calendar */}
      <View style={{ rowGap: 8 }}>
        <SectionHead
          ruled={false}
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
              <Pressable onPress={() => setUI({ notesYM: addMonths(`${ym}-01`, -1).slice(0, 7), notesYear: +addMonths(`${ym}-01`, -1).slice(0, 4) })} hitSlop={8} accessibilityLabel="이전 달"><Text style={t(9)}>◀</Text></Pressable>
              <Text style={t(15, 700)}>{MONTHS[parse(a).getMonth()]}</Text>
              <Pressable onPress={() => setUI({ notesYM: addMonths(`${ym}-01`, 1).slice(0, 7), notesYear: +addMonths(`${ym}-01`, 1).slice(0, 4) })} hitSlop={8} accessibilityLabel="다음 달"><Text style={t(9)}>▶</Text></Pressable>
            </View>
          }
          right={monthCount}
        />
        <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.ink }}>
          <View style={{ flexDirection: 'row' }}>
            {rotDOW(settings.mStart).map(x => (
              <Text key={x} style={[t(9, 400, 0.12, C.soft), { flex: 1, textAlign: 'center', paddingVertical: 4, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink }]}>{x.slice(0, 1)}</Text>
            ))}
          </View>
          {Array.from({ length: cells.length / 7 }, (_, r) => (
            <View key={r} style={{ flexDirection: 'row' }}>
              {cells.slice(r * 7, r * 7 + 7).map(d => {
                const out = d < a || d > b;
                const ns = book.notes.filter(n => n.date === d);
                return (
                  <View key={d} style={{ flex: 1, minWidth: 0, minHeight: 48, padding: 3, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink, backgroundColor: d === today ? C.today : 'transparent', overflow: 'hidden' }}>
                    {out ? (
                      <Hatch id={`nc-${d}`} />
                    ) : (
                      <>
                        <Text style={[t(10, d === today ? 600 : 400, 0, ns.length || d === today ? C.ink : C.soft), tabular, d === today && { textDecorationLine: 'underline' }]}>{parse(d).getDate()}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {ns.slice(0, 3).map(n => (
                            <Pressable key={n.id} onPress={() => openNote(n.id)} accessibilityLabel={n.name} hitSlop={2}>
                              <Text style={{ fontSize: 13, lineHeight: 16 }}>{tagEmoji(n.tag)}</Text>
                            </Pressable>
                          ))}
                          {ns.length > 3 && <Text style={t(9, 400, 0, C.soft)}>+{ns.length - 3}</Text>}
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}
