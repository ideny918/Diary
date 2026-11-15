import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { Grid } from '../components/ui';
import { useDiary } from '../store/DiaryContext';
import { C, label, P, t, tabular } from '../theme';

const SUBS: Record<string, string> = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ' };
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'bio', '0', 'del'];

/** Demo lock: any 4 digits unlock; the Face ID / fingerprint key unlocks immediately. */
export default function Lock() {
  const { settings, unlock } = useDiary();
  const [code, setCode] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const press = (k: string) => {
    if (k === 'del') return setCode(c => c.slice(0, -1));
    if (k === 'bio') return settings.bio && unlock();
    if (code.length >= 4) return;
    const next = code + k;
    setCode(next);
    if (next.length === 4) timer.current = setTimeout(unlock, 280);
  };

  const bioLabel = settings.bio ? (Platform.OS === 'ios' ? 'FACE ID' : 'FINGERPRINT') : '';

  return (
    <View style={{ flex: 1, paddingTop: 20, paddingRight: 20, paddingBottom: 12, paddingLeft: 26 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', columnGap: 12, minHeight: 40, borderBottomWidth: 1, borderColor: C.ink, paddingBottom: 8 }}>
        <Text style={[t(28, 700, -0.01), { lineHeight: 30 }]}>DIARY</Text>
        <Text style={t(13, 300, 0.06, C.muted)}>{new Date().getFullYear()}</Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end', rowGap: 28, paddingBottom: 18 }}>
        <View style={{ alignItems: 'center', rowGap: 14 }}>
          <Text style={label}>Passcode</Text>
          <View style={{ flexDirection: 'row', columnGap: 16 }}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={{ width: 14, height: 14, borderWidth: 1, borderColor: C.ink, backgroundColor: i < code.length ? P.point : 'transparent' }} />
            ))}
          </View>
          <Text style={t(12.5, 400, 0, C.muted)}>암호를 입력하세요</Text>
        </View>

        <Grid
          items={KEYS}
          cols={3}
          render={k => {
            const digit = /\d/.test(k);
            const text = digit ? k : k === 'del' ? '←' : bioLabel;
            return (
              <Pressable
                onPress={() => press(k)}
                accessibilityLabel={k === 'del' ? '지우기' : k === 'bio' ? bioLabel || undefined : k}
                disabled={k === 'bio' && !settings.bio}
                style={({ pressed }) => ({ height: 66, alignItems: 'center', justifyContent: 'center', rowGap: 2, backgroundColor: pressed ? C.pressed : 'transparent' })}
              >
                <Text style={[digit ? t(22, 500) : k === 'del' ? t(18, 500) : t(9.5, 500, 0.14), tabular]}>{text}</Text>
                {!!SUBS[k] && <Text style={t(8.5, 400, 0.16, C.muted)}>{SUBS[k]}</Text>}
              </Pressable>
            );
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[t(10.5, 400, 0.14, C.muted), { textTransform: 'uppercase' }]}>Locked</Text>
        <Text style={t(10.5, 400, 0.14, C.muted)}>아무 숫자 4개</Text>
      </View>
    </View>
  );
}
