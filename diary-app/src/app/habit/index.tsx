import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { HabitIcon, Label, Muted, OnTag, Screen, SectionHead } from '../../components/ui';
import { addDays, addMonths, dotted, MONTHS, monthRange, parse, rotDOW, startOf, todayStr } from '../../data/dates';
import { HCATS } from '../../data/kit';
import { hDone, hRate, hState, nextHState } from '../../data/logic';
import { Habit } from '../../data/types';
import { useDiary } from '../../store/DiaryContext';
import { C, noOutline, t, tabular } from '../../theme';

const openHabit = (id: string) => router.push({ pathname: '/habit/[id]', params: { id } });

/** Habit: month summary, year heatmap, this week's grid, and habit cards by category. */
export default function HabitScreen() {
  const { book, settings, ui, setUI, setHabit, setHabitState, addHabit } = useDiary();
  const today = todayStr();
  const [name, setName] = useState('');
  const visible = (h: Habit) => settings.hshow === 'all' || h.on;
  const list = book.habits.filter(visible);
  const ym = ui.habitYM;
  const y = +ym.slice(0, 4);

  // summary for the selected month
  const [a, b] = monthRange(`${ym}-01`);
  let n = 0, dn = 0, tn = 0, td = 0;
  let best: [number, Habit | null] = [0, null];
  for (const h of list) {
    let hd = 0;
    for (let x = a > h.start ? a : h.start; x <= b && x <= today; x = addDays(x, 1)) {
      n++;
      if (hDone(book, h, x)) { dn++; hd++; }
    }
    if (today >= h.start) { tn++; if (hDone(book, h, today)) td++; }
    if (hd > best[0]) best = [hd, h];
  }
  const stat = (v: React.ReactNode, l: string) => (
    <View style={{ flex: 1, rowGap: 6 }}>
      {typeof v === 'string' ? <Text style={[t(22, 500), tabular, { lineHeight: 24 }]}>{v}</Text> : v}
      <Text style={[t(9.5, 400, 0.12, C.soft), { textTransform: 'uppercase' }]}>{l}</Text>
    </View>
  );

  // year heatmap: columns are weeks, rows are weekdays
  const ya = `${y}-01-01`, yz = `${y}-12-31`;
  const cols: string[][] = [];
  for (let w = startOf(ya, settings.wStart); w <= yz; w = addDays(w, 7)) cols.push([0, 1, 2, 3, 4, 5, 6].map(i => addDays(w, i)));
  const level = (d: string) => {
    if (d < ya || d > yz) return -2;
    if (d > today) return -1;
    let c = 0, k = 0;
    for (const h of list) if (d >= h.start) { c++; if (hDone(book, h, d)) k++; }
    return c ? Math.round((k / c) * 4) : -1;
  };

  // this week grid
  const ws = startOf(today, settings.wStart);
  const week = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(ws, i));
  const WD = rotDOW(settings.wStart);

  const groups = [...HCATS, ...book.habits.map(h => h.category).filter(c => !HCATS.includes(c))]
    .filter((c, i, arr) => arr.indexOf(c) === i)
    .map(c => [c, book.habits.filter(h => h.category === c && visible(h))] as const)
    .filter(g => g[1].length);

  const add = () => {
    const v = name.trim();
    if (!v) return;
    addHabit(v, HCATS[0]);
    setName('');
  };

  return (
    <Screen
      title="Habit"
      sub={y}
      right={
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
          <Pressable onPress={() => setUI({ habitYM: addMonths(`${ym}-01`, -1).slice(0, 7) })} hitSlop={8} accessibilityLabel="이전 달"><Text style={t(9)}>◀</Text></Pressable>
          <Text style={[t(11, 400, 0.06), tabular]}>{MONTHS[parse(a).getMonth()].slice(0, 3)}</Text>
          <Pressable onPress={() => setUI({ habitYM: addMonths(`${ym}-01`, 1).slice(0, 7) })} hitSlop={8} accessibilityLabel="다음 달"><Text style={t(9)}>▶</Text></Pressable>
        </View>
      }
      footL={ym.replace('-', ' / ')}
      footR={`${book.habits.filter(h => h.on).length} on`}
    >
      <View style={{ flexDirection: 'row', columnGap: 10, borderBottomWidth: 1, borderColor: C.ink, paddingBottom: 14 }}>
        {stat(`${book.habits.filter(h => h.on).length}개`, '진행 중')}
        {stat(`${td}/${tn}`, '오늘 완료')}
        {stat(n ? `${Math.round((dn / n) * 100)}%` : '—', '이 달 전체')}
        {stat(
          <Text style={[t(13, 500), { lineHeight: 18, paddingTop: 2 }]} numberOfLines={2}>
            {best[1] ? `${best[1].icon} ${best[1].name} ` : '—'}
            {best[1] && <Text style={t(12, 400, 0, C.soft)}>{best[0]}일</Text>}
          </Text>,
          '이 달 최고',
        )}
      </View>

      {/* year heat */}
      <View style={{ rowGap: 8, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Label>{y}</Label>
          <Label>하루 달성 비율</Label>
        </View>
        <View style={{ flexDirection: 'row', columnGap: 1.5 }}>
          {cols.map((c, i) => (
            <View key={i} style={{ flex: 1, rowGap: 1.5 }}>
              {c.map(d => {
                const lv = level(d);
                return <View key={d} style={{ aspectRatio: 1, borderRadius: 1, backgroundColor: lv === -2 ? 'transparent' : lv < 0 ? C.wash : C.heat[lv], borderWidth: d === today ? 1 : 0, borderColor: C.ink }} />;
              })}
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row' }}>
          {MONTHS.map(m => <Text key={m} style={[t(8, 400, 0.08, C.soft), { flex: 1 }]}>{m.slice(0, 3)}</Text>)}
        </View>
      </View>

      {/* this week */}
      <View style={{ paddingTop: 18, rowGap: 6 }}>
        <Label>This week</Label>
        <View style={{ borderTopWidth: 1, borderColor: C.ink }}>
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: C.ink }}>
            <View style={{ flex: 2.4 }} />
            {week.map((d, i) => (
              <View key={d} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
                <Text style={[t(11, 500), tabular, d === today && { textDecorationLine: 'underline' }]}>{parse(d).getDate()}</Text>
                <Text style={t(8.5, 400, 0.06, C.soft)}>{WD[i].slice(0, 1)}</Text>
              </View>
            ))}
            <Text style={[t(11, 400, 0, C.soft), { width: 30, textAlign: 'center', alignSelf: 'center' }]}>%</Text>
          </View>
          {list.length === 0 && <Muted style={{ paddingVertical: 8 }}>켜 둔 습관이 없어요.</Muted>}
          {list.map(h => {
            const r = hRate(book, h, week[0], week[6], today);
            return (
              <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 34, borderBottomWidth: 1, borderColor: C.faint }}>
                <Pressable onPress={() => openHabit(h.id)} style={{ flex: 2.4, flexDirection: 'row', alignItems: 'center', columnGap: 4, paddingRight: 4 }}>
                  <HabitIcon icon={h.icon} name={h.name} size={16} />
                  <Text style={[t(12.5), { flexShrink: 1 }]} numberOfLines={1}>{h.name}</Text>
                </Pressable>
                {week.map(d => {
                  const dis = d > today || d < h.start;
                  const st = hState(book, h, d);
                  return (
                    <Pressable
                      key={d}
                      disabled={dis}
                      onPress={() => setHabitState(d, h.id, nextHState(st))}
                      accessibilityLabel={`${h.name} ${d}`}
                      style={{ flex: 1, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: d === today ? C.today : 'transparent' }}
                    >
                      <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderStyle: dis ? 'dotted' : 'solid', borderColor: dis ? C.faint : st ? C.point : C.soft, overflow: 'hidden', flexDirection: 'row' }}>
                        {st > 0 && <View style={{ width: st === 2 ? '100%' : '50%', backgroundColor: C.point }} />}
                      </View>
                    </Pressable>
                  );
                })}
                <Text style={[t(12), tabular, { width: 30, textAlign: 'center' }]}>{r ?? '—'}</Text>
              </View>
            );
          })}
        </View>
        <Muted style={{ fontSize: 11 }}>칸을 한 번 누르면 달성, 두 번 누르면 절반, 세 번 누르면 지워져요.</Muted>
      </View>

      {/* cards */}
      {groups.map(([c, hs]) => (
        <View key={c} style={{ paddingTop: 18, rowGap: 8 }}>
          <SectionHead title={c} right={hs.length} ruled={false} />
          <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.ink, flexDirection: 'row', flexWrap: 'wrap' }}>
            {[...hs].sort((x, z) => +z.on - +x.on).map(h => {
              const [ma, mb] = monthRange(today);
              const r = hRate(book, h, ma, mb, today);
              return (
                <View key={h.id} style={{ width: '50%', height: 128, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink }}>
                  <Pressable onPress={() => openHabit(h.id)} style={({ pressed }) => ({ flex: 1, padding: 12, rowGap: 4, opacity: h.on ? 1 : 0.45, backgroundColor: pressed ? C.wash : 'transparent' })}>
                    <HabitIcon icon={h.icon} name={h.name} size={26} />
                    <Text style={t(13, 600)} numberOfLines={2}>{h.name}</Text>
                    <Text style={[t(10.5, 400, 0.06, C.soft), tabular]}>since {dotted(h.start)}</Text>
                    <Text style={[t(11, 400, 0, C.soft), { marginTop: 'auto' }]}>
                      <Text style={t(15, 600)}>{r == null ? '—' : `${r}%`}</Text> this month
                    </Text>
                  </Pressable>
                  <View style={{ position: 'absolute', top: 10, right: 10 }}>
                    <OnTag on={h.on} onPress={() => setHabit(h.id, { on: !h.on })} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, borderBottomWidth: 1, borderColor: C.faint, paddingVertical: 4, marginTop: 14 }}>
        <Text style={t(13.5, 400, 0, C.soft)}>+</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={add}
          placeholder="새 습관"
          placeholderTextColor={C.faint}
          returnKeyType="done"
          accessibilityLabel="새 습관"
          style={[noOutline, t(13.5), { flex: 1, paddingVertical: 4, paddingHorizontal: 0 }]}
        />
      </View>
    </Screen>
  );
}
