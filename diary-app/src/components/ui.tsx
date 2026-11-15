import React, { useState } from 'react';
import {
  Modal, Pressable, PressableProps, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle,
} from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';

import { CheckItem, joinChecks, parseChecks } from '../data/logic';
import { HState } from '../data/types';
import { useDiary } from '../store/DiaryContext';
import { C, font, label, noOutline, serif, t, tabular } from '../theme';

export const GUTTER_L = 26;
export const GUTTER_R = 18;

/* ───────── text ───────── */

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[label, style]}>{children}</Text>;
}

export function Muted({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[t(12.5, 400, 0, C.soft), style]}>{children}</Text>;
}

/** .nhead — bold section title with a count, on a black rule */
export function SectionHead({ title, right, ruled = true }: { title: React.ReactNode; right?: React.ReactNode; ruled?: boolean }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 4 }, ruled && { borderBottomWidth: 1, borderColor: C.ink }]}>
      {typeof title === 'string' ? <Text style={t(15, 700)}>{title}</Text> : title}
      {typeof right === 'string' || typeof right === 'number' ? <Text style={t(11, 400, 0, C.soft)}>{right}</Text> : right}
    </View>
  );
}

/* ───────── page shell: header (serif title) · scrolling body · footer ───────── */

export function Screen({
  title, sub, right, onBack, footL, footR, children, scroll = true,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  onBack?: () => void;
  footL?: React.ReactNode;
  footR?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const { settings } = useDiary();
  return (
    <View style={{ flex: 1 }}>
      <Paper kind={settings.paper} />
      <View style={{ paddingTop: 22, paddingRight: GUTTER_R, paddingLeft: onBack ? 22 : GUTTER_L }}>
        <View style={s.headerRow}>
          {onBack && (
            <Pressable onPress={onBack} accessibilityLabel="뒤로" hitSlop={10} style={{ paddingRight: 2, marginRight: 8 }}>
              <Text style={[t(20), { lineHeight: 24 }]}>←</Text>
            </Pressable>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', columnGap: 12, flexShrink: 1 }}>
            {typeof title === 'string' ? (
              <Text style={[serif(), { fontSize: 28, lineHeight: 32, color: C.ink }, tabular]} numberOfLines={1}>
                {title}
              </Text>
            ) : (
              title
            )}
            {sub !== undefined && <Text style={t(13, 300, 0.06, C.soft)} numberOfLines={1}>{sub}</Text>}
          </View>
          {right && <View style={{ marginLeft: 'auto', paddingLeft: 8 }}>{right}</View>}
        </View>
      </View>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24, paddingLeft: GUTTER_L, paddingRight: GUTTER_R }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: 12, paddingLeft: GUTTER_L, paddingRight: GUTTER_R }}>{children}</View>
      )}
      <View style={s.footer}>
        <Text style={s.footText}>{footL}</Text>
        <Text style={s.footText}>{footR}</Text>
      </View>
    </View>
  );
}

/** ◀ | ▶ with a "Today" link, as in the Kit header nav */
export function Nav({ onPrev, onNext, onToday }: { onPrev: () => void; onNext: () => void; onToday?: () => void }) {
  const arrow = (txt: string, onPress: () => void, a11y: string) => (
    <Pressable onPress={onPress} accessibilityLabel={a11y} hitSlop={10} style={{ paddingVertical: 6, paddingHorizontal: 6 }}>
      <Text style={t(10, 400, 0, C.ink)}>{txt}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6 }}>
      {onToday && (
        <Pressable onPress={onToday} hitSlop={6} style={{ paddingVertical: 4, paddingHorizontal: 2, marginRight: 4 }}>
          {({ pressed }) => <Text style={t(11, 400, 0.06, pressed ? C.ink : C.soft)}>Today</Text>}
        </Pressable>
      )}
      {arrow('◀', onPrev, '이전')}
      <View style={{ width: 1, height: 12, backgroundColor: C.ink, opacity: 0.7 }} />
      {arrow('▶', onNext, '다음')}
    </View>
  );
}

/* ───────── buttons ───────── */

/** .mk-one — small outlined button, filled when `on` */
export function MkBtn({ title, onPress, on, style }: { title: string; onPress: () => void; on?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.mk, (on || pressed) && { backgroundColor: C.ink }, style]}>
      {({ pressed }) => <Text style={t(12, 400, 0, on || pressed ? C.paper : C.ink)}>{title}</Text>}
    </Pressable>
  );
}

/** Destructive action with an inline "are you sure?" step (works the same on phone and web). */
export function ConfirmButton({ title, message, confirmLabel = '지우기', onConfirm }: { title: string; message: string; confirmLabel?: string; onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);
  if (!asking) return <MkBtn title={title} onPress={() => setAsking(true)} />;
  return (
    <View style={{ borderWidth: 1, borderColor: C.ink, padding: 12, rowGap: 10, backgroundColor: C.today }}>
      <Text style={[t(13), { lineHeight: 20 }]}>{message}</Text>
      <View style={{ flexDirection: 'row', columnGap: 8 }}>
        <MkBtn title={confirmLabel} on onPress={() => { setAsking(false); onConfirm(); }} />
        <MkBtn title="취소" onPress={() => setAsking(false)} />
      </View>
    </View>
  );
}

export function PressRow({ style, children, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return (
    <Pressable {...rest} style={({ pressed }) => [style, pressed && { backgroundColor: C.wash }]}>
      {children}
    </Pressable>
  );
}

/** .seg2 — segmented control with a black hairline */
export function Seg<T extends string | number>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: C.ink, alignSelf: 'flex-start' }}>
      {options.map(([v, l]) => {
        const on = v === value;
        return (
          <Pressable key={String(v)} onPress={() => onChange(v)} accessibilityState={{ selected: on }} style={{ paddingVertical: 4, paddingHorizontal: 12, backgroundColor: on ? C.point : 'transparent' }}>
            <Text style={t(12.5, 400, 0, on ? C.paper : C.ink)}>{l}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** .ontg — tiny "ON" tag */
export function OnTag({ on, onPress, big }: { on: boolean; onPress: () => void; big?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={on ? 'On 끄기' : 'On 켜기'}
      accessibilityState={{ selected: on }}
      style={{ borderWidth: 1, borderColor: on ? C.point : C.faint, backgroundColor: on ? C.point : C.paper, paddingHorizontal: big ? 7 : 4, paddingTop: big ? 5 : 3, paddingBottom: big ? 4 : 2.5 }}
    >
      <Text style={[t(big ? 10 : 8, 700, 0.1, on ? C.paper : C.soft), { lineHeight: big ? 11 : 9 }]}>ON</Text>
    </Pressable>
  );
}

/* ───────── fields ───────── */

const LH = 20.8; // 13px × 1.6

/** .fld — label + borderless multiline text; "line" paper draws rules under each line */
export function Field({
  title, value, onChange, placeholder = '—', minHeight = 64, sec, right, size = 13,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
  sec?: boolean;
  right?: React.ReactNode;
  size?: number;
}) {
  const { settings } = useDiary();
  const [h, setH] = useState(minHeight);
  const lined = settings.paper === 'line';
  return (
    <View style={{ paddingTop: 8, paddingBottom: 4, borderBottomWidth: 1, borderColor: sec ? C.ink : C.faint, rowGap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 6 }}>
        <Label>{title}</Label>
        {right && <View style={{ marginLeft: 'auto' }}>{right}</View>}
      </View>
      <View>
        {lined &&
          Array.from({ length: Math.ceil(h / LH) }, (_, i) => (
            <View key={i} pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: (i + 1) * LH - 1, height: 1, backgroundColor: 'rgba(0,0,0,.1)' }} />
          ))}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={C.faint}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          onContentSizeChange={e => setH(Math.max(minHeight, e.nativeEvent.contentSize.height))}
          style={[noOutline, font(400), { fontSize: size, lineHeight: LH, color: C.ink, minHeight, padding: 0 }]}
        />
      </View>
    </View>
  );
}

/** Single-line underline input (HH:MM, names, dates). */
export function LineInput({ style, ...rest }: React.ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor={C.faint} {...rest} style={[noOutline, t(13), { padding: 0, paddingVertical: 2 }, style]} />;
}

/* ───────── checklist (.glist) ───────── */

function Box({ done, small, onPress }: { done: boolean; small?: boolean; onPress: () => void }) {
  const sz = small ? 11 : 13;
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel="완료"
      style={{ width: sz, height: sz, borderWidth: 1, borderColor: C.ink, backgroundColor: done ? C.point : C.paper, alignItems: 'center', justifyContent: 'center' }}>
      {done && <View style={{ width: sz * 0.46, height: sz * 0.23, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: C.paper, transform: [{ rotate: '-45deg' }], marginTop: -2 }} />}
    </Pressable>
  );
}

export function Checklist({ value, onChange, placeholder = '목표 추가', small }: { value: string; onChange: (v: string) => void; placeholder?: string; small?: boolean }) {
  const items = parseChecks(value);
  const [draft, setDraft] = useState('');
  const set = (next: CheckItem[]) => onChange(joinChecks(next));
  const fs = small ? 11.5 : 13;
  const rowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', columnGap: small ? 6 : 8, minHeight: small ? 22 : 27, borderBottomWidth: small ? 0 : 1, borderColor: C.faint };
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={rowStyle}>
          <Box done={it.done} small={small} onPress={() => set(items.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} />
          <TextInput
            value={it.text}
            onChangeText={txt => set(items.map((x, j) => (j === i ? { ...x, text: txt } : x)))}
            onEndEditing={() => { if (!it.text.trim()) set(items.filter((_, j) => j !== i)); }}
            returnKeyType="done"
            style={[noOutline, t(fs, 400, 0, it.done ? C.soft : C.ink), { flex: 1, padding: 0, paddingVertical: small ? 1 : 3 }, it.done && { textDecorationLine: 'line-through' }]}
          />
          <Pressable onPress={() => set(items.filter((_, j) => j !== i))} hitSlop={8} accessibilityLabel="삭제">
            <Text style={[t(small ? 11 : 15, 400, 0, C.soft), { opacity: 0.45 }]}>×</Text>
          </Pressable>
        </View>
      ))}
      <View style={[rowStyle, { borderBottomWidth: 0 }]}>
        <Text style={[t(fs, 400, 0, C.soft), { width: small ? 11 : 13, textAlign: 'center' }]}>+</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          placeholderTextColor={C.faint}
          returnKeyType="done"
          submitBehavior="submit"
          onSubmitEditing={() => {
            if (draft.trim()) set([...items, { text: draft.trim(), done: false }]);
            setDraft('');
          }}
          style={[noOutline, t(fs), { flex: 1, padding: 0, paddingVertical: small ? 1 : 3 }]}
        />
      </View>
    </View>
  );
}

/* ───────── emoji picker (mood · weather · habit icon) ───────── */

export function EmojiPicker({
  visible, title, options, value, onPick, onClose, cols = 4,
}: {
  visible: boolean;
  title: string;
  options: [string, string][];
  value: string;
  onPick: (v: string) => void;
  onClose: () => void;
  cols?: number;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.18)', justifyContent: 'center', padding: 28 }}>
        <Pressable style={{ backgroundColor: C.paper, borderWidth: 1, borderColor: C.ink, padding: 10, boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' }}>
          <Label style={{ marginBottom: 8 }}>{title}</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {options.map(([e, l]) => (
              <Pressable
                key={e}
                onPress={() => { onPick(e); onClose(); }}
                accessibilityLabel={l || e}
                style={{ width: `${100 / cols}%`, alignItems: 'center', paddingVertical: 8, borderWidth: 1, borderColor: value === e ? C.ink : 'transparent' }}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
                {!!l && <Text style={t(10, 400, 0, C.soft)}>{l}</Text>}
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => { onPick(''); onClose(); }} style={{ borderTopWidth: 1, borderColor: C.faint, marginTop: 6, paddingTop: 8, alignItems: 'center' }}>
            <Text style={t(11, 400, 0, C.soft)}>지우기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ───────── habits ───────── */

/** Habit icon in 3 states: done = full, half = left half coloured, none = faded. */
export function HabitIcon({ icon, name, state = 2, size = 18 }: { icon: string; name: string; state?: HState; size?: number }) {
  const glyph = icon || name.slice(0, 1);
  const g = <Text style={{ fontSize: size * 0.82, lineHeight: size, textAlign: 'center', width: size, color: C.ink }}>{glyph}</Text>;
  if (state === 2) return <View style={{ width: size, height: size }}>{g}</View>;
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ opacity: 0.3 }}>{g}</View>
      {state === 1 && <View style={{ position: 'absolute', left: 0, top: 0, width: size / 2, height: size, overflow: 'hidden' }}>{g}</View>}
    </View>
  );
}

/* ───────── graphics ───────── */

export function Hatch({ id }: { id: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id={id} patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(45)">
          <Rect x={6} y={0} width={1} height={7} fill={C.wash} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/** Setting › 종이 무늬: grid / dot background for the page */
export function Paper({ kind }: { kind: '' | 'grid' | 'dot' | 'line' }) {
  if (kind !== 'grid' && kind !== 'dot') return null;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        {kind === 'grid' ? (
          <Pattern id="paper" patternUnits="userSpaceOnUse" width={18} height={18}>
            <Rect x={0} y={0} width={18} height={1} fill="rgba(0,0,0,0.055)" />
            <Rect x={0} y={0} width={1} height={18} fill="rgba(0,0,0,0.055)" />
          </Pattern>
        ) : (
          <Pattern id="paper" patternUnits="userSpaceOnUse" width={16} height={16}>
            <Circle cx={8} cy={8} r={0.9} fill="rgba(0,0,0,0.16)" />
          </Pattern>
        )}
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#paper)" />
    </Svg>
  );
}

export function PhotoIcon({ color = C.faint, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.2}>
      <Rect x={3} y={5} width={18} height={14} />
      <Circle cx={9} cy={10} r={1.8} />
      <Path d="M21 16l-5-5-8 8" />
    </Svg>
  );
}

/** Hairline grid: black top/left on the grid, right/bottom on each cell, explicit rows. */
export function Grid<T>({ items, cols, render, cellStyle }: { items: T[]; cols: number; render: (item: T, i: number) => React.ReactNode; cellStyle?: ViewStyle }) {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.ink }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((it, c) => (
            <View key={c} style={[{ flex: 1, minWidth: 0, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink }, cellStyle]}>
              {render(it, r * cols + c)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export const s = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', minHeight: 40, borderBottomWidth: 1, borderColor: C.ink, paddingBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 12, paddingLeft: GUTTER_L, paddingRight: GUTTER_R },
  footText: { ...t(10.5, 400, 0.14, C.soft), textTransform: 'uppercase', ...tabular },
  mk: { borderWidth: 1, borderColor: C.ink, paddingVertical: 5, paddingHorizontal: 10, alignSelf: 'flex-start' },
});
