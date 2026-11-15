import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { goTab } from '../components/BottomTabs';
import { Checklist, Field, Hatch, Label, Nav, Screen } from '../components/ui';
import { addDays, addMonths, MONTHS, monthRange, parse, rotDOW, startOf, todayStr, wno } from '../data/dates';
import { useDiary } from '../store/DiaryContext';
import { C, t, tabular } from '../theme';

/** Month: calendar with week links, mood/weather and events per day; monthly goal and period log below. */
export default function MonthScreen() {
  const { ui, setUI, day, book, settings, setMonth } = useDiary();
  const [a, b] = monthRange(ui.cursor);
  const ym = a.slice(0, 7);
  const dt = parse(a);
  const today = todayStr();
  const start = startOf(a, settings.mStart);
  const weeks: string[] = [];
  for (let w = start; w <= b; w = addDays(w, 7)) weeks.push(w);
  const mo = book.months[ym] ?? {};

  const go = (d: string, tab: 'day' | 'week') => {
    setUI({ cursor: d });
    goTab(tab);
  };

  return (
    <Screen
      title={MONTHS[dt.getMonth()]}
      sub={dt.getFullYear()}
      right={
        <Nav
          onPrev={() => setUI({ cursor: addMonths(a, -1) })}
          onNext={() => setUI({ cursor: addMonths(a, 1) })}
          onToday={today.slice(0, 7) === ym ? undefined : () => setUI({ cursor: today })}
        />
      }
      footL={ym.replace('-', ' / ')}
      footR={dt.getFullYear()}
    >
      <View style={{ flexDirection: 'row', paddingBottom: 6, paddingLeft: 22 }}>
        {rotDOW(settings.mStart).map(x => (
          <Text key={x} style={[t(9.5, 500, 0.1), { flex: 1, textAlign: 'center' }]}>{x.slice(0, 1)}</Text>
        ))}
      </View>
      <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.ink }}>
        {weeks.map(ws => (
          <View key={ws} style={{ flexDirection: 'row' }}>
            <Pressable
              onPress={() => go(addDays(ws, settings.mStart), 'week')}
              accessibilityLabel={`${wno(ws, settings.mStart)}주차`}
              style={({ pressed }) => ({ width: 22, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink, backgroundColor: pressed ? C.wash : 'transparent' })}
            >
              <Text style={[t(8, 500, 0.06), { transform: [{ rotate: '90deg' }], width: 40, textAlign: 'center' }]}>W{wno(ws, settings.mStart)}</Text>
            </Pressable>
            {[0, 1, 2, 3, 4, 5, 6].map(i => {
              const d = addDays(ws, i);
              const out = d < a || d > b;
              const k = day(d);
              const isToday = d === today;
              return (
                <View key={d} style={{ flex: 1, minWidth: 0, height: 64, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink, backgroundColor: isToday ? C.today : 'transparent', overflow: 'hidden' }}>
                  {out ? (
                    <Hatch id={`m-${d}`} />
                  ) : (
                    <Pressable onPress={() => go(d, 'day')} accessibilityLabel={`${d} 데일리로 이동`} style={({ pressed }) => ({ flex: 1, paddingTop: 4, paddingHorizontal: 4, backgroundColor: pressed ? C.wash : 'transparent' })}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[t(11, isToday ? 600 : 400), tabular, isToday && { textDecorationLine: 'underline' }]}>{parse(d).getDate()}</Text>
                        {!!(k.mood || k.weather) && <Text style={{ fontSize: 9, lineHeight: 13 }}>{k.mood}{k.weather}</Text>}
                      </View>
                      {!!k.event && <Text style={[t(8.5, 400, 0, C.soft), { lineHeight: 11 }]} numberOfLines={3}>{k.event}</Text>}
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={{ borderBottomWidth: 1, borderColor: C.ink, paddingTop: 16, paddingBottom: 6, rowGap: 4 }}>
        <Label>Monthly Goal</Label>
        <Checklist value={mo.goal ?? ''} onChange={goal => setMonth(ym, { goal })} />
      </View>
      <Field title="Period Log" value={mo.log ?? ''} onChange={log => setMonth(ym, { log })} minHeight={64} sec />
    </Screen>
  );
}
