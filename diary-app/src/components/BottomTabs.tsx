import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { C, t } from '../theme';

export type TabKey = 'year' | 'month' | 'week' | 'day' | 'notes' | 'habit' | 'setting';

const TABS: { key: TabKey; label: string; path: '/year' | '/month' | '/week' | '/' | '/notes' | '/habit' | '/setting' }[] = [
  { key: 'year', label: 'Year', path: '/year' },
  { key: 'month', label: 'Month', path: '/month' },
  { key: 'week', label: 'Week', path: '/week' },
  { key: 'day', label: 'Day', path: '/' },
  { key: 'notes', label: 'Notes', path: '/notes' },
  { key: 'habit', label: 'Habit', path: '/habit' },
  { key: 'setting', label: 'Setting', path: '/setting' },
];

/** Which tab a route belongs to (detail pages light their parent tab). */
export function tabForPath(p: string): TabKey {
  if (p === '/' || p === '/index') return 'day';
  if (p.startsWith('/note')) return 'notes';
  if (p.startsWith('/habit')) return 'habit';
  const hit = TABS.find(x => x.path !== '/' && p.startsWith(x.path));
  return hit ? hit.key : 'day';
}

export function goTab(key: TabKey) {
  router.dismissTo(TABS.find(x => x.key === key)!.path);
}

function Gear({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6}>
      <Circle cx={12} cy={12} r={3.2} />
      <Path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </Svg>
  );
}

/** Index tabs hanging from the page's bottom edge; the active one is filled black. */
export function BottomTabs() {
  const active = tabForPath(usePathname());
  return (
    <View style={{ height: 34, flexDirection: 'row', columnGap: 3, paddingLeft: 18, paddingRight: 10 }}>
      {TABS.map(tab => {
        const on = active === tab.key;
        const gear = tab.key === 'setting';
        return (
          <Pressable
            key={tab.key}
            onPress={() => goTab(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: on }}
            style={{
              flexGrow: gear ? 0 : 1,
              flexShrink: gear ? 0 : 1,
              flexBasis: gear ? 30 : 0,
              minWidth: 0,
              height: 34,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderTopWidth: 0,
              borderColor: on ? C.point : C.faint,
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
              backgroundColor: on ? C.point : C.paper,
              boxShadow: '2px 3px 8px rgba(0,0,0,0.05)',
            }}
          >
            {gear ? (
              <Gear color={on ? C.paper : C.soft} />
            ) : (
              <Text style={[t(9.5, 400, 0.12, on ? C.paper : C.soft), { textTransform: 'uppercase' }]} numberOfLines={1}>
                {tab.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
