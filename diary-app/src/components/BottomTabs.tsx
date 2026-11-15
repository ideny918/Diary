import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { TabKey, useDiary } from '../store/DiaryContext';
import { C, P, t } from '../theme';

const TABS: { key: TabKey; label: string; path: '/' | '/month' | '/search' | '/insight' | '/setting' }[] = [
  { key: 'today', label: 'Today', path: '/' },
  { key: 'month', label: 'Month', path: '/month' },
  { key: 'search', label: 'Search', path: '/search' },
  { key: 'insight', label: 'Insight', path: '/insight' },
  { key: 'setting', label: 'Setting', path: '/setting' },
];

export function tabForPath(pathname: string): TabKey | null {
  return TABS.find(x => x.path === pathname)?.key ?? null;
}

/** Navigate to a tab. Callers record it as `ui.lastTab` (done in the press handler, never in an effect). */
export function goTab(key: TabKey) {
  const tab = TABS.find(x => x.key === key)!;
  router.dismissTo(tab.path);
}

/** Index tabs hanging from the bottom edge of the page. The active one is filled with the point colour. */
export function BottomTabs() {
  const { ui, setUI } = useDiary();
  const pathname = usePathname();
  // On a tab screen the URL decides; on Entry / Write the tab you came from stays lit.
  const active = tabForPath(pathname) ?? ui.lastTab;
  return (
    <View style={{ height: 34, flexDirection: 'row', columnGap: 4, paddingLeft: 22, paddingRight: 10 }}>
      {TABS.map(tab => {
        const on = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => {
              setUI({ lastTab: tab.key });
              goTab(tab.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              minWidth: 0,
              height: 34,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderTopWidth: 0,
              borderColor: on ? P.point : C.hair,
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
              backgroundColor: on ? P.point : C.paper,
              boxShadow: '2px 3px 8px rgba(0,0,0,0.05)',
            }}
          >
            <Text style={[t(10, 400, 0.14, on ? C.paper : C.muted), { textTransform: 'uppercase' }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
