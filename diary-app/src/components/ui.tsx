import React from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';

import { C, label, MOOD_LABELS, P, t, tabular } from '../theme';

/* ───────── text ───────── */

export function Label({ children, style, ruled }: { children: React.ReactNode; style?: StyleProp<TextStyle>; ruled?: boolean }) {
  const text = <Text style={[label, style]}>{children}</Text>;
  // `ruled` = section label sitting on a black rule (Recent, Results…)
  return ruled ? <View style={{ paddingBottom: 6, borderBottomWidth: 1, borderColor: C.ink }}>{text}</View> : text;
}

/* ───────── page header: big number/title + light sub, hairline under ───────── */

export function Header({
  title, sub, onBack, right, gap = 12,
}: { title: string; sub?: string | number; onBack?: () => void; right?: React.ReactNode; gap?: number }) {
  return (
    <View style={{ paddingTop: 20, paddingRight: 18, paddingLeft: onBack ? 22 : 26 }}>
      <View style={s.headerRow}>
        {onBack && (
          <Pressable onPress={onBack} accessibilityLabel="뒤로" hitSlop={10} style={{ paddingRight: 4, paddingVertical: 4, marginRight: 10 }}>
            <Text style={[t(20), { lineHeight: 22 }]}>←</Text>
          </Pressable>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', columnGap: onBack ? 10 : gap, flexShrink: 1 }}>
          <Text style={[t(28, 700, -0.01), { lineHeight: 30 }, tabular]} numberOfLines={1}>{title}</Text>
          {sub !== undefined && <Text style={t(13, 300, 0.06, C.muted)}>{sub}</Text>}
        </View>
        {right && <View style={{ marginLeft: 'auto' }}>{right}</View>}
      </View>
    </View>
  );
}

export function Footer({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  const st = [t(10.5, 400, 0.14, C.muted), { textTransform: 'uppercase' as const }];
  return (
    <View style={s.footer}>
      <Text style={st}>{left}</Text>
      <Text style={st}>{right}</Text>
    </View>
  );
}

/* ───────── buttons ───────── */

/** Outlined button that inverts on press ("+ 쓰기", "지금 잠그기"). */
export function OutlineButton({ title, onPress, style, textStyle }: { title: string; onPress: () => void; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.outline, pressed && { backgroundColor: C.ink }, style]}>
      {({ pressed }) => <Text style={[t(12.5), pressed && { color: C.paper }, textStyle]}>{title}</Text>}
    </Pressable>
  );
}

/** Row button with the Kit's light-grey pressed state. */
export function PressRow({ style, children, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return (
    <Pressable {...rest} style={({ pressed }) => [style, pressed && { backgroundColor: C.pressed }]}>
      {children}
    </Pressable>
  );
}

/** Rounded toggle chip used for feelings and tags. */
export function Chip({ label: l, on, onPress, outlined }: { label: string; on?: boolean; onPress?: () => void; outlined?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        outlined
          ? { borderColor: C.ink, backgroundColor: pressed ? C.ink : 'transparent' }
          : { borderColor: on ? P.point : C.chipBorder, backgroundColor: on ? P.point : 'transparent' },
      ]}
    >
      {({ pressed }) => <Text style={t(12, 400, 0, on || (outlined && pressed) ? C.paper : C.ink)}>{l}</Text>}
    </Pressable>
  );
}

/* ───────── mood ───────── */

export function Swatch({ mood, size = 9, color }: { mood?: number; size?: number; color?: string }) {
  return <View style={{ width: size, height: size, backgroundColor: color ?? P.moods[(mood ?? 3) - 1], borderWidth: 1, borderColor: C.hair }} />;
}

export function MoodLine({ mood, children, marginTop = 2 }: { mood: number; children?: React.ReactNode; marginTop?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, marginTop }}>
      <Swatch mood={mood} />
      <Text style={t(11.5)}>{MOOD_LABELS[mood - 1]}</Text>
      {children}
    </View>
  );
}

/* ───────── graphics ───────── */

/** Kit hatch: repeating-linear-gradient(135deg, transparent 0 6px, #ecece9 6px 7px). */
export function Hatch({ id }: { id: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id={id} patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(45)">
          <Rect x={6} y={0} width={1} height={7} fill={C.hatch} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

export function PhotoPlaceholder({ height, id }: { height: number; id: string }) {
  return (
    <View style={[s.photo, { height }]}>
      <Hatch id={id} />
      <Text style={[t(11, 500, 0, C.muted), { fontFamily: 'Menlo' }]}>photo</Text>
    </View>
  );
}

export function SearchIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={1.4}>
      <Circle cx={11} cy={11} r={6.5} />
      <Path d="M16 16l4.5 4.5" />
    </Svg>
  );
}

export function PhotoIcon({ color = C.muted }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.2}>
      <Rect x={3} y={5} width={18} height={14} />
      <Circle cx={9} cy={10} r={1.8} />
      <Path d="M21 16l-5-5-8 8" />
    </Svg>
  );
}

/**
 * Hairline grid (Kit style): black top/left border on the grid, right/bottom on each cell.
 * Items are laid out in explicit rows so cells always divide the width evenly.
 */
export function Grid<T>({ items, cols, render }: { items: T[]; cols: number; render: (item: T, i: number) => React.ReactNode }) {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return (
    <View style={{ borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.ink }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((it, c) => (
            <View key={c} style={{ flex: 1, minWidth: 0, borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink }}>
              {render(it, r * cols + c)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Numbered leader row: "01  #tag ........ 4" (Search tags, Insight feelings). */
export function LeaderRow({ no, text, n, fg = C.ink, height }: { no: string; text: string; n: number; fg?: string; height: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height, paddingHorizontal: 6, columnGap: 8 }}>
      <Text style={[t(11, 400, 0, fg), { width: 24, opacity: 0.6 }, tabular]}>{no}</Text>
      <Text style={t(13, 400, 0, fg)}>{text}</Text>
      <View style={{ flex: 1, minWidth: 12, borderBottomWidth: 1, borderStyle: 'dotted', borderColor: fg, opacity: 0.35 }} />
      <Text style={[t(12, 400, 0, fg), tabular]}>{n}</Text>
    </View>
  );
}

export const s = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    borderBottomWidth: 1,
    borderColor: C.ink,
    paddingBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingRight: 18,
    paddingBottom: 12,
    paddingLeft: 26,
  },
  scroll: { paddingRight: 18, paddingLeft: 26 },
  outline: { height: 34, paddingHorizontal: 12, borderWidth: 1, borderColor: C.ink, justifyContent: 'center' },
  chip: { height: 30, paddingHorizontal: 11, borderRadius: 999, borderWidth: 1, justifyContent: 'center' },
  photo: { borderWidth: 1, borderColor: C.hair, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  /** Grid with hairline: top+left on the container, right+bottom on each cell. */
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderLeftWidth: 1, borderColor: C.ink },
  cell: { borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.ink },
  hairRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderColor: C.hair },
});
