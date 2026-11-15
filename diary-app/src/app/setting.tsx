import Constants from 'expo-constants';
import React from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Footer, Header, Label, OutlineButton, s } from '../components/ui';
import { Settings } from '../data/types';
import { useDiary } from '../store/DiaryContext';
import { C, P, t } from '../theme';

type Row = { l: string; sub: string; toggle?: keyof Settings; value?: string };

export default function Setting() {
  const { settings, setSetting, lock } = useDiary();
  const ios = Platform.OS === 'ios';

  const groups: { title: string; rows: Row[] }[] = [
    {
      title: 'Privacy',
      rows: [
        { l: '암호 잠금', sub: '앱을 열 때 암호 확인', toggle: 'lock' },
        { l: ios ? 'Face ID' : '지문 인식', sub: '암호 대신 사용', toggle: 'bio' },
        { l: '잠금 시점', sub: '', value: '즉시' },
      ],
    },
    {
      title: 'Writing',
      rows: [
        { l: '오늘의 질문', sub: 'Today에 표시', toggle: 'prompts' },
        { l: '저녁 알림', sub: '매일 21:00', toggle: 'remind' },
        { l: '날씨·위치 기록', sub: '새 글에 자동으로 남기기', toggle: 'stamp' },
      ],
    },
    {
      title: 'Data',
      rows: [
        { l: '내보내기', sub: 'PDF · Markdown' },
        { l: '백업', sub: '암호화 · 2시간 전' },
      ],
    },
  ];

  const seg = (on: boolean, text: string, onPress: () => void, fillOn: string) => (
    <Pressable
      onPress={onPress}
      accessibilityState={{ selected: on }}
      style={{ paddingVertical: 6, paddingHorizontal: 11, backgroundColor: on ? fillOn : 'transparent' }}
    >
      <Text style={t(11, 400, 0.08, on ? C.paper : C.ink)}>{text}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <Header title="Setting" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.scroll, { paddingTop: 4, paddingBottom: 20 }]} showsVerticalScrollIndicator={false}>
        {groups.map(g => (
          <View key={g.title}>
            <Label style={{ paddingTop: 18, paddingBottom: 4 }}>{g.title}</Label>
            {g.rows.map(r => {
              const k = r.toggle;
              return (
                <View key={r.l} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 12, paddingVertical: 9, borderBottomWidth: 1, borderColor: C.hair }}>
                  <View style={{ rowGap: 1, flexShrink: 1 }}>
                    <Text style={t(13.5, 600)}>{r.l}</Text>
                    {!!r.sub && <Text style={t(12, 400, 0, C.muted)}>{r.sub}</Text>}
                  </View>
                  {k ? (
                    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: C.ink }} accessibilityLabel={r.l}>
                      {seg(settings[k], 'ON', () => setSetting(k, true), P.point)}
                      {seg(!settings[k], 'OFF', () => setSetting(k, false), C.ink)}
                    </View>
                  ) : (
                    !!r.value && <Text style={t(12.5, 400, 0, C.muted)}>{r.value}</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
        <OutlineButton title="지금 잠그기" onPress={lock} style={{ marginTop: 24, height: 44, alignItems: 'center' }} textStyle={{ letterSpacing: 0.75 }} />
      </ScrollView>
      <Footer left="Setting" right={`v${Constants.expoConfig?.version?.replace(/\.0$/, '') ?? '1.0'}`} />
    </View>
  );
}
