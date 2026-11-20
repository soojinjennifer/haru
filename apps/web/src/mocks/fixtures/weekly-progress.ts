/**
 * 주간 Progress fixture — Stage 7 Plan §8 그룹 `progress` · Spec §13 · §14 (`S7-A`).
 *
 * ⭐ **이번 주(`MOCK_THIS_WEEK_START`) = Figma `31:102` 과 같은 수치 1세트** (시각 비교 전제 — Spec §13):
 * StatTile `5` · `62m` · 합계 `1h 12m`(72) · `6 nights · avg 12 min` · 막대 `8/13/—/16/11/20/4` ·
 * Growth `strong/growing/emerging/emerging` · Moment 인용(Emma, *The Most Magnificent Thing*, p.14).
 * - `5 sessions` 인데 `6 nights`, `62m` 인데 합계 `72` 인 것은 **Figma placeholder 그대로**다 (`M-10` · `AD7-13`) —
 *   서버 값을 표시하는 화면이므로 fixture 가 Figma 와 같아야 나란히 비교할 수 있다.
 * - 인용 문구 출처: Figma `110:522`/`31:102` 의 원본 HTML 프로토타입(`$HARU_ONEDRIVE/디자인/HARU-Report-2b.html`
 *   "Moment of the week") — 가상 문장이다. Growth `level` 은 Figma `163:2607` 막대 fill 폭 / track 313 (0.78 · 0.54 · 0.32 · 0.32 — `VG7-A-04`).
 *
 * - 영어 · 진단·판정·비교 표현 0 (`vs` · `% of` · `of 7` · `streak` 0 — `D7-2`). 실제 아동 데이터 0.
 * - 날짜는 서버가 계산한 **보호자 시간대 달력 날짜**다 (Mock 서버 시계와 무관한 고정 값 — 결정성).
 */
import {
  shiftCalendarDate,
  WeeklyProgressSchema,
  type GrowthTheme,
  type MomentOfWeek,
  type WeeklyProgress,
} from '@haru/contracts';

import { MOCK_CHILD_FIRST_NAME } from './me';

/** 이번 주(Figma `31:118` chip "May 4 – 10"). */
export const MOCK_THIS_WEEK_START = '2026-05-04';
/** 달 넘김 주 — chip "Apr 27 – May 3" (Spec §14). */
export const MOCK_MONTH_CROSSING_WEEK_START = '2026-04-27';
/** 연 넘김 주 — chip "Dec 29 – Jan 4" (Spec §14 · §8.1 최장 라벨). */
export const MOCK_YEAR_CROSSING_WEEK_START = '2025-12-29';
/** `progress-multi-week` 의 네 번째 주. */
export const MOCK_EARLY_JANUARY_WEEK_START = '2026-01-05';

/** Figma `163:2633` 인용 — 가상 문장. */
export const MOCK_MOMENT_OF_WEEK: MomentOfWeek = {
  quote: 'Maybe she just needs to rest, like me when I’m frustrated.',
  speakerName: MOCK_CHILD_FIRST_NAME,
  sessionDate: '2026-05-05',
  bookTitle: 'The Most Magnificent Thing',
  pageRef: 14,
};

/** Figma `163:2607` — Self-Direction strong · Emotion Regulation growing · CF emerging · IM emerging. */
export const MOCK_GROWTH_THEMES: readonly GrowthTheme[] = [
  { capability: 'self_directed_agency', stage: 'strong', level: 0.78 },
  { capability: 'emotion_regulation', stage: 'growing', level: 0.54 },
  { capability: 'cognitive_flexibility', stage: 'emerging', level: 0.32 },
  // VG7-A-04 (S7-C 반영): Figma `163:2632` fill 100 / track 313 = 0.319 → 0.32 (CF 와 같은 폭). 이전 0.30 은 프로토타입 추정치였다.
  { capability: 'intrinsic_motivation', stage: 'emerging', level: 0.32 },
];

/** Figma 막대 `8 / 13 / — / 16 / 11 / 20 / 4` (월→일). */
export const MOCK_FIGMA_DAILY_MINUTES: readonly (number | null)[] = [8, 13, null, 16, 11, 20, 4];

interface WeekShape {
  weekStart: string;
  dailyMinutes: readonly (number | null)[];
  sessionsCount: number;
  minutesTogether: number;
  totalMinutes: number;
  nightsWithSession: number;
  averageSessionMinutes: number | null;
  growthThemes?: readonly GrowthTheme[];
  momentOfWeek: MomentOfWeek | null;
}

function buildWeek(shape: WeekShape, availableWeeks: readonly string[]): WeeklyProgress {
  return WeeklyProgressSchema.parse({
    week: { start: shape.weekStart, end: shiftCalendarDate(shape.weekStart, 6) },
    availableWeeks,
    sessionsCount: shape.sessionsCount,
    minutesTogether: shape.minutesTogether,
    readingSummary: {
      totalMinutes: shape.totalMinutes,
      nightsWithSession: shape.nightsWithSession,
      averageSessionMinutes: shape.averageSessionMinutes,
    },
    days: shape.dailyMinutes.map((minutes, index) => ({
      date: shiftCalendarDate(shape.weekStart, index),
      minutes,
    })),
    growthThemes: shape.growthThemes ?? MOCK_GROWTH_THEMES,
    momentOfWeek: shape.momentOfWeek,
  });
}

/** 주 시작일 → 그 주의 모양. 화면이 고를 수 있는 주는 scenario 의 `availableWeeks` 가 정한다. */
const WEEKS: Readonly<Record<string, WeekShape>> = {
  [MOCK_THIS_WEEK_START]: {
    weekStart: MOCK_THIS_WEEK_START,
    dailyMinutes: MOCK_FIGMA_DAILY_MINUTES,
    sessionsCount: 5,
    minutesTogether: 62,
    totalMinutes: 72,
    nightsWithSession: 6,
    averageSessionMinutes: 12,
    momentOfWeek: MOCK_MOMENT_OF_WEEK,
  },
  [MOCK_MONTH_CROSSING_WEEK_START]: {
    weekStart: MOCK_MONTH_CROSSING_WEEK_START,
    dailyMinutes: [10, null, 12, 9, null, 15, 7],
    sessionsCount: 5,
    minutesTogether: 53,
    totalMinutes: 53,
    nightsWithSession: 5,
    averageSessionMinutes: 11,
    growthThemes: [
      { capability: 'self_directed_agency', stage: 'growing', level: 0.62 },
      { capability: 'emotion_regulation', stage: 'growing', level: 0.5 },
      { capability: 'cognitive_flexibility', stage: 'emerging', level: 0.3 },
      { capability: 'intrinsic_motivation', stage: 'emerging', level: 0.28 },
    ],
    momentOfWeek: {
      quote: 'If the tower falls down, we can build it taller next time.',
      speakerName: MOCK_CHILD_FIRST_NAME,
      sessionDate: '2026-04-30',
      bookTitle: 'The Little Builder',
      pageRef: null,
    },
  },
  [MOCK_EARLY_JANUARY_WEEK_START]: {
    weekStart: MOCK_EARLY_JANUARY_WEEK_START,
    dailyMinutes: [null, 9, null, 11, null, 13, null],
    sessionsCount: 3,
    minutesTogether: 33,
    totalMinutes: 33,
    nightsWithSession: 3,
    averageSessionMinutes: 11,
    growthThemes: [
      { capability: 'self_directed_agency', stage: 'growing', level: 0.46 },
      { capability: 'emotion_regulation', stage: 'emerging', level: 0.34 },
      { capability: 'cognitive_flexibility', stage: 'emerging', level: 0.22 },
      { capability: 'intrinsic_motivation', stage: 'emerging', level: 0.25 },
    ],
    momentOfWeek: null,
  },
  [MOCK_YEAR_CROSSING_WEEK_START]: {
    weekStart: MOCK_YEAR_CROSSING_WEEK_START,
    dailyMinutes: [12, null, null, 10, null, null, 14],
    sessionsCount: 3,
    minutesTogether: 36,
    totalMinutes: 36,
    nightsWithSession: 3,
    averageSessionMinutes: 12,
    growthThemes: [
      { capability: 'self_directed_agency', stage: 'emerging', level: 0.4 },
      { capability: 'emotion_regulation', stage: 'emerging', level: 0.3 },
      { capability: 'cognitive_flexibility', stage: 'emerging', level: 0.2 },
      { capability: 'intrinsic_motivation', stage: 'emerging', level: 0.24 },
    ],
    momentOfWeek: {
      quote: 'The snow is quiet like a library.',
      speakerName: MOCK_CHILD_FIRST_NAME,
      sessionDate: '2026-01-04',
      bookTitle: 'Snowy Night Walk',
      pageRef: 6,
    },
  },
};

/** 이번 주 세션 0 (`empty` — Spec §2.8): 0 은 사실 표기, 막대 전부 "기록 없음", Moment 미렌더. */
const EMPTY_THIS_WEEK: WeekShape = {
  weekStart: MOCK_THIS_WEEK_START,
  dailyMinutes: [null, null, null, null, null, null, null],
  sessionsCount: 0,
  minutesTogether: 0,
  totalMinutes: 0,
  nightsWithSession: 0,
  averageSessionMinutes: null,
  momentOfWeek: null,
};

/** 가입 첫 주 (`progress-first-week`) — 선택 가능한 주 1개. */
const FIRST_WEEK: WeekShape = {
  weekStart: MOCK_THIS_WEEK_START,
  dailyMinutes: [null, null, 9, null, 14, null, null],
  sessionsCount: 2,
  minutesTogether: 23,
  totalMinutes: 23,
  nightsWithSession: 2,
  averageSessionMinutes: 12,
  growthThemes: [
    { capability: 'self_directed_agency', stage: 'emerging', level: 0.36 },
    { capability: 'emotion_regulation', stage: 'emerging', level: 0.3 },
    { capability: 'cognitive_flexibility', stage: 'emerging', level: 0.2 },
    { capability: 'intrinsic_motivation', stage: 'emerging', level: 0.26 },
  ],
  momentOfWeek: {
    quote: 'Can we read the page with the moon again?',
    speakerName: MOCK_CHILD_FIRST_NAME,
    sessionDate: '2026-05-08',
    bookTitle: 'Goodnight, Little Moon',
    pageRef: null,
  },
};

export type WeeklyProgressWorld = 'standard' | 'empty' | 'first-week' | 'multi-week';

/** scenario 세계별 선택 가능 주 — **최신 먼저**. */
export const MOCK_AVAILABLE_WEEKS: Readonly<Record<WeeklyProgressWorld, readonly string[]>> = {
  standard: [MOCK_THIS_WEEK_START, MOCK_MONTH_CROSSING_WEEK_START],
  empty: [MOCK_THIS_WEEK_START],
  'first-week': [MOCK_THIS_WEEK_START],
  'multi-week': [
    MOCK_THIS_WEEK_START,
    MOCK_MONTH_CROSSING_WEEK_START,
    MOCK_EARLY_JANUARY_WEEK_START,
    MOCK_YEAR_CROSSING_WEEK_START,
  ],
};

/**
 * 그 세계에서 `weekStart` 주의 응답. `weekStart` 가 선택 가능 주가 아니면 `undefined` (Mock 이 `VALIDATION_FAILED`).
 */
export function createWeeklyProgressFixture(
  world: WeeklyProgressWorld,
  weekStart: string = MOCK_THIS_WEEK_START,
): WeeklyProgress | undefined {
  const available = MOCK_AVAILABLE_WEEKS[world];
  if (!available.includes(weekStart)) return undefined;

  if (weekStart === MOCK_THIS_WEEK_START && world === 'empty')
    return buildWeek(EMPTY_THIS_WEEK, available);
  if (weekStart === MOCK_THIS_WEEK_START && world === 'first-week')
    return buildWeek(FIRST_WEEK, available);

  const shape = WEEKS[weekStart];
  return shape === undefined ? undefined : buildWeek(shape, available);
}
