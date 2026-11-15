import Constants from 'expo-constants';
import React from 'react';
import { Platform, Text, View } from 'react-native';

import { Label, MkBtn, Muted, Screen, Seg } from '../components/ui';
import { useDiary } from '../store/DiaryContext';
import { C, t } from '../theme';

function Row({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: C.faint }}>
      <View style={{ flexShrink: 1, rowGap: 2 }}>
        <Text style={t(15, 700)}>{title}</Text>
        {!!sub && <Muted>{sub}</Muted>}
      </View>
      {children}
    </View>
  );
}

const onOff: [number, string][] = [[1, 'ON'], [0, 'OFF']];

export default function SettingScreen() {
  const { settings: S, setSetting, lock } = useDiary();
  const ver = Constants.expoConfig?.version?.replace(/\.0$/, '') ?? '1.0';
  return (
    <Screen title="Setting" footL="Setting" footR={`v${ver}`}>
      <View style={{ rowGap: 22 }}>
        <View>
          <Label>시작 요일</Label>
          <Row title="Monthly" sub="달력 첫 칸">
            <Seg options={[[0, '월'], [1, '일']]} value={S.mStart} onChange={v => setSetting('mStart', v as 0 | 1)} />
          </Row>
          <Row title="Weekly" sub="한 주의 시작">
            <Seg options={[[0, '월'], [1, '일']]} value={S.wStart} onChange={v => setSetting('wStart', v as 0 | 1)} />
          </Row>
        </View>

        <View>
          <Label>디자인</Label>
          <Row title="종이 무늬" sub="페이지 배경">
            <Seg options={[['', '무지'], ['grid', '모눈'], ['dot', '도트'], ['line', '줄']]} value={S.paper} onChange={v => setSetting('paper', v)} />
          </Row>
        </View>

        <View>
          <Label>Habit</Label>
          <Row title="보이는 습관" sub="꺼 둔(OFF) 습관도 보일지">
            <Seg options={[['on', 'ON만'], ['all', '전체']]} value={S.hshow} onChange={v => setSetting('hshow', v)} />
          </Row>
          <Muted style={{ marginTop: 8 }}>습관 칸은 한 번 누르면 달성, 두 번 누르면 절반, 세 번 누르면 지워져요.</Muted>
        </View>

        <View>
          <Label>Privacy</Label>
          <Row title="암호 잠금" sub="앱을 열 때 암호 확인">
            <Seg options={onOff} value={+S.lock} onChange={v => setSetting('lock', !!v)} />
          </Row>
          <Row title={Platform.OS === 'ios' ? 'Face ID' : '지문 인식'} sub="암호 대신 사용">
            <Seg options={onOff} value={+S.bio} onChange={v => setSetting('bio', !!v)} />
          </Row>
          <MkBtn title="지금 잠그기" onPress={lock} style={{ marginTop: 16, alignSelf: 'stretch', alignItems: 'center', paddingVertical: 12 }} />
        </View>

        <View>
          <Label>Data</Label>
          <Muted style={{ marginTop: 8 }}>모든 기록은 이 기기에만 저장돼요. 처음 열면 예시 페이지가 들어 있어요.</Muted>
        </View>
      </View>
    </Screen>
  );
}
