import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { goTab } from '../components/BottomTabs';
import { Checklist, Nav, Screen } from '../components/ui';
import { YearEditor } from '../components/YearKeyword';
import { MONTHS, todayStr } from '../data/dates';
import { useDiary } from '../store/DiaryContext';
import { C, font, noOutline, t } from '../theme';

/** Year: twelve month cards, each showing the monthly goal checklist or the period log. */
export default function YearScreen() {
  const { ui, setUI, book, setMonth } = useDiary();
  const y = +ui.cursor.slice(0, 4);
  const cur = todayStr().slice(0, 7);
  const goal = ui.yearMode === 'goal';

  const toggle = (
    <Pressable
      onPress={() => setUI({ yearMode: goal ? 'log' : 'goal' })}
      accessibilityLabel={goal ? 'Period Log 보기' : 'Goal 보기'}
      hitSlop={8}
      style={{ marginRight: 8 }}
    >
      {goal ? (
        <Svg width={14} height={14} viewBox="0 0 16 16"><Path d="M3 4h10M3 8h10M3 12h7" stroke={C.soft} strokeWidth={1.1} strokeLinecap="round" /></Svg>
      ) : (
        <Svg width={14} height={14} viewBox="0 0 16 16"><Rect x={2.5} y={2.5} width={11} height={11} fill="none" stroke={C.soft} strokeWidth={1.1} /><Path d="M5 8.2l2 2 4-4.4" fill="none" stroke={C.soft} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" /></Svg>
      )}
    </Pressable>
  );

  const card = (m: number) => {
    const ym = `${y}-${String(m + 1).padStart(2, '0')}`;
    const mo = book.months[ym] ?? {};
    return (
      <View key={m} style={{ flex: 1, minWidth: 0, minHeight: 150, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink, paddingVertical: 10, paddingHorizontal: 10, rowGap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Pressable
            onPress={() => {
              setUI({ cursor: `${ym}-01` });
              goTab('month');
            }}
            accessibilityLabel={`${MONTHS[m]} 먼슬리로 이동`}
          >
            <Text style={[t(15, 700), ym === cur && { textDecorationLine: 'underline' }]}>{MONTHS[m]}</Text>
          </Pressable>
          <Text style={t(10, 400, 0.14, C.soft)}>{String(m + 1).padStart(2, '0')}</Text>
        </View>
        {goal ? (
          <Checklist value={mo.goal ?? ''} onChange={g => setMonth(ym, { goal: g })} small placeholder="목표 추가" />
        ) : (
          <TextInput
            value={mo.log ?? ''}
            onChangeText={log => setMonth(ym, { log })}
            placeholder="—"
            placeholderTextColor={C.faint}
            multiline
            scrollEnabled={false}
            accessibilityLabel={`${MONTHS[m]} Period Log`}
            style={[noOutline, font(400), { fontSize: 12, lineHeight: 19, color: C.ink, padding: 0, flex: 1, textAlignVertical: 'top' }]}
          />
        )}
      </View>
    );
  };

  return (
    <Screen
      title={String(y)}
      sub={goal ? 'Goal' : 'Period Log'}
      right={
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {toggle}
          <Nav
            onPrev={() => setUI({ cursor: `${y - 1}-01-01` })}
            onNext={() => setUI({ cursor: `${y + 1}-01-01` })}
            onToday={y === +cur.slice(0, 4) ? undefined : () => setUI({ cursor: todayStr() })}
          />
        </View>
      }
      footL={y}
      footR=""
    >
      <View style={{ paddingBottom: 18 }}>
        <YearEditor year={String(y)} />
      </View>
      <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.ink }}>
        {[0, 2, 4, 6, 8, 10].map(m => (
          <View key={m} style={{ flexDirection: 'row' }}>
            {card(m)}
            {card(m + 1)}
          </View>
        ))}
      </View>
    </Screen>
  );
}
