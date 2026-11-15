import { addDays, fmt, startOf, todayStr } from './dates';
import { Book, HState } from './types';

/**
 * Sample pages for the first launch, placed around today so every screen has
 * something to show. Users can overwrite or delete any of it.
 */
export function seedBook(): Book {
  const t = todayStr();
  const d = (n: number) => addDays(t, n);
  const ym = t.slice(0, 7);
  const ws = startOf(t, 0);

  const days: Book['days'] = {
    [d(0)]: {
      wake: '07:10', bed: '23:40', mood: '🙂', weather: '🌧️',
      event: '10:00 팀 회의\n19:30 요가',
      todo: '▦ 장보기\n□ 책 반납하기\n□ 엄마한테 전화',
      log: '비가 와서 하루 종일 집에 있었다.\n밀린 빨래를 하고 책을 40쪽 읽었다.',
      joy: '창밖 빗소리 들으면서 마신 커피',
      reset: '휴대폰은 밤 11시 이후 거실에 두기',
      tomorrow: '아침 일찍 산책',
    },
    [d(-1)]: { wake: '07:30', bed: '00:20', mood: '😆', weather: '☀️', event: '저녁 약속 · 을지로', log: '마야 합격 축하 저녁. 먼 길로 걸어서 집에 왔다.', joy: '오래 웃은 저녁', todo: '▦ 선물 사기' },
    [d(-2)]: { wake: '06:50', bed: '23:10', mood: '😴', weather: '☁️', log: '마감 주간. 리뷰 세 개 중 하나 끝냈다.', reset: '점심 거르지 않기', todo: '▦ 리뷰 1\n□ 리뷰 2\n□ 리뷰 3' },
    [d(-3)]: { mood: '🙂', weather: '🌫️', log: '여름 이후 처음으로 쉬지 않고 5킬로를 뛰었다.', joy: '안개 낀 강변' },
    [d(-5)]: { mood: '😐', weather: '☁️', log: '아빠에게 편지를 쓰고 서랍에 넣었다.' },
    [d(-8)]: { mood: '😰', weather: '☀️', log: '잠이 안 오는 밤.', feeling: '괜히 마음이 무거웠다', talked: true },
  };

  const habits: Book['habits'] = [
    { id: 'h1', name: '물 2L', icon: '💧', category: '건강관리', on: true, start: d(-27) },
    { id: 'h2', name: '독서 20분', icon: '📖', category: '자기계발', on: true, start: d(-27) },
    { id: 'h3', name: '스트레칭', icon: '🧘', category: '건강관리', on: true, start: d(-20) },
    { id: 'h4', name: '일기 쓰기', icon: '✍️', category: '마음', on: true, start: d(-13) },
  ];

  // Deterministic pattern so the charts look lived-in.
  const hlog: Book['hlog'] = {};
  for (let i = -27; i <= 0; i++) {
    const day = d(i);
    const row: Record<string, HState> = {};
    habits.forEach((h, k) => {
      if (day < h.start) return;
      const v = (i * 7 + k * 3 + 100) % 5;
      row[h.id] = v < 3 ? 2 : v === 3 ? 1 : 0;
    });
    hlog[day] = row;
  }
  hlog[d(0)] = { h1: 2, h2: 0, h3: 1, h4: 0 };

  return {
    days,
    weeks: { [ws]: { goal: '▦ 5킬로 달리기 두 번\n□ 퀼트 한 칸 끝내기\n□ 일찍 자기 (12시 전)', log: '마감 주간이라 바빴지만 운동은 지켰다.' } },
    months: { [ym]: { goal: '□ 일주일에 두 번 달리기\n▦ 거의 매일 일기 쓰기\n□ 퀼트 끝내기', log: '' } },
    notes: [
      { id: 'n1', date: d(-1), name: '바다로 가는 기차', tag: '📗 에세이', on: true, body: '창가 자리에서 읽기 좋은 책.' },
      { id: 'n2', date: d(-3), name: '카페 로사', tag: '☕️ 카페', on: false, body: '창이 큰 2층 자리. 라테가 맛있다.' },
      { id: 'n3', date: d(-6), name: '가을 산책 코스', tag: '🌳 산책·여행', on: false, body: '강변 → 다리 → 공원 한 바퀴, 약 50분.' },
      { id: 'n4', date: d(-9), name: '오랜만에 드라마', tag: '📺 드라마', on: true, body: '' },
      { id: 'n5', date: d(-12), name: '수채화 연습', tag: '🎨 그리기', on: false, body: '물 조절이 제일 어렵다.' },
      { id: 'n6', date: fmt(new Date(new Date().getFullYear(), 0, 12)), name: '새해 다짐', tag: '💡 생각', on: false, body: '' },
    ],
    habits,
    hlog,
  };
}
