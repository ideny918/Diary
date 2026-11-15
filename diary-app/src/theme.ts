import { Platform, TextStyle } from 'react-native';

/** "빛" (light) palette — the direction chosen in the design handoff (DiaryBookV2). */
export const P = {
  point: '#496275',
  wash: '#C8E4CA',
  moods: ['#496275', '#A693AC', '#999393', '#7AB6D9', '#D5CD94'],
};

export const C = {
  desk: '#e7e8eb', // behind the page
  paper: '#fffdf8',
  ink: '#000',
  muted: 'rgba(0,0,0,.52)',
  hair: 'rgba(0,0,0,.13)',
  chipBorder: 'rgba(0,0,0,.25)',
  placeholder: 'rgba(0,0,0,.3)',
  pressed: '#f5f5f6',
  hatch: '#ecece9',
};

export const MOOD_LABELS = ['최악', '별로', '보통', '좋음', '최고'];

/** Text colour on top of a filled mood swatch (index 0 is dark). */
export const fgOnMood = (i: number) => (i === 0 ? C.paper : C.ink);

type Weight = 300 | 400 | 500 | 600 | 700;

const ANDROID_FONTS: Record<Weight, string> = {
  300: 'NunitoSans_300Light',
  400: 'NunitoSans_400Regular',
  500: 'NunitoSans_500Medium',
  600: 'NunitoSans_600SemiBold',
  700: 'NunitoSans_700Bold',
};

/**
 * Design font stack: 'Avenir Next', 'Avenir', 'Nunito Sans'.
 * iOS ships Avenir Next; Android/web fall back to Nunito Sans (one file per weight).
 */
export function font(weight: Weight = 400): TextStyle {
  if (Platform.OS === 'ios') {
    return { fontFamily: 'Avenir Next', fontWeight: String(weight === 300 ? 400 : weight) as TextStyle['fontWeight'] };
  }
  return { fontFamily: ANDROID_FONTS[weight] };
}

/** CSS `letter-spacing: Nem` → RN points. */
export const em = (n: number, size: number) => +(n * size).toFixed(2);

/** Text style helper: size, weight, letter-spacing in em. */
export function t(size: number, weight: Weight = 400, ls = 0, color: string = C.ink): TextStyle {
  return { ...font(weight), fontSize: size, letterSpacing: em(ls, size), color };
}

/** The uppercase micro-label used everywhere in the Kit ("TODAY'S PROMPT", "MOOD"…). */
export const label: TextStyle = { ...t(10.5, 400, 0.16, C.muted), textTransform: 'uppercase' };

export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

/** Web only: drop the browser focus ring on text inputs (the Kit uses rules instead). */
export const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : {};
