import { Platform, TextStyle } from 'react-native';

/** Diary Book Kit tokens (app-diary paper colour). */
export const C = {
  desk: '#e7e8eb',
  paper: '#fffdf8',
  ink: '#000',
  point: '#000',
  soft: 'rgba(0,0,0,.52)',
  faint: 'rgba(0,0,0,.13)',
  wash: '#f5f5f6',
  /** color-mix(point 5%, paper) — today's cell */
  today: '#f2f0ec',
  /** habit heat levels: color-mix(point 8/25/45/70/100%) */
  heat: ['#ebe9e4', '#bfbeba', '#8c8b88', '#4d4c4a', '#000'],
};

type Weight = 300 | 400 | 500 | 600 | 700;
const SANS: Record<Weight, string> = {
  300: 'IBMPlexSansKR_300Light',
  400: 'IBMPlexSansKR_400Regular',
  500: 'IBMPlexSansKR_500Medium',
  600: 'IBMPlexSansKR_600SemiBold',
  700: 'IBMPlexSansKR_700Bold',
};

/** Body font: IBM Plex Sans KR (one file per weight). */
export const font = (w: Weight = 400): TextStyle => ({ fontFamily: SANS[w] });
/** Heading font for dates, months and week names: Gowun Batang. */
export const serif = (bold = true): TextStyle => ({ fontFamily: bold ? 'GowunBatang_700Bold' : 'GowunBatang_400Regular' });

export const em = (n: number, size: number) => +(n * size).toFixed(2);

/** size, weight, letter-spacing (em), colour */
export function t(size: number, weight: Weight = 400, ls = 0, color: string = C.ink): TextStyle {
  return { ...font(weight), fontSize: size, letterSpacing: em(ls, size), color };
}

/** Uppercase micro-label (.label) */
export const label: TextStyle = { ...t(10.5, 400, 0.16, C.soft), textTransform: 'uppercase' };
export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

/** Web only: no browser focus ring on inputs. */
export const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : {};
