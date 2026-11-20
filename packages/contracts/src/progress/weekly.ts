import { z } from 'zod';

import { CalendarDateSchema } from '../common/datetime.js';
import { CapabilitySchema } from '../enums/capability.js';

/**
 * 주간 Progress — Stage 7 Plan §7 **C7-1** (`N7-01` → `D7-1`, `N7-03` → `D7-2`).
 * `GET /v1/children/:childId/progress/weekly?weekStart=YYYY-MM-DD` · Figma `31:102`.
 *
 * - 주 = 보호자 시간대 **월~일**(`N7-13`) — 경계·집계는 서버가 계산한다. Frontend 는 날짜 **포맷만** 한다.
 * - 비교(`+18% vs last week`)·분모(`6 of 7 nights`) **필드가 없다** (`D7-2` ①②). 화면이 계산하지도 않는다.
 * - `growthThemes[].level` 은 막대 **형상**에만 쓴다 — 숫자로 표시하지 않는다 (`D6-8` Q5 일관).
 * - Backend 요구: `P7-BIP-01`~`03` (Stage 7 Plan §10).
 */

/**
 * Growth themes 단계 — C7-1a (`N7-03` ③ → `D7-2`). 서버 판정 · 화면은 라벨만(`strong`/`growing`/`emerging`).
 * 셋 다 발달·긍정 언어이며 서열·결핍 표현이 아니다 (PRD §8.4, `P7-BIP-02`).
 *
 * 소속: `enums/` 가 아니라 이 파일 — Stage 6 `CapabilitySnapshotSource` 와 같은 배치(도메인 전용 enum,
 * `API_CONTRACTS` §2 enum 스냅샷 수 불변).
 */
export const GROWTH_THEME_STAGES = ['emerging', 'growing', 'strong'] as const;

export const GrowthThemeStageSchema = z.enum(GROWTH_THEME_STAGES);

export type GrowthThemeStage = z.infer<typeof GrowthThemeStageSchema>;

/** 한 주의 요일 수 — `days` 는 정확히 7개(월→일). */
export const WEEK_DAY_COUNT = 7;

export const WeeklyProgressQuerySchema = z.object({
  /** 주 시작일(월요일, 보호자 시간대). 생략 = 이번 주 (서버 계산). */
  weekStart: CalendarDateSchema.optional(),
});

export type WeeklyProgressQuery = z.infer<typeof WeeklyProgressQuerySchema>;

export const WeeklyProgressDaySchema = z.object({
  date: CalendarDateSchema,
  /** 그날 함께 읽은 분. 세션 없음 = `null` (`0` 도 허용 — 화면은 둘 다 "기록 없음" 스텁). */
  minutes: z.int().min(0).nullable(),
});

export type WeeklyProgressDay = z.infer<typeof WeeklyProgressDaySchema>;

export const GrowthThemeSchema = z.object({
  capability: CapabilitySchema,
  stage: GrowthThemeStageSchema,
  /** 막대 길이 (0..1, 서버 산식 `P7-BIP-02`). 숫자로 표시하지 않는다. */
  level: z.number().min(0).max(1),
});

export type GrowthTheme = z.infer<typeof GrowthThemeSchema>;

export const MomentOfWeekSchema = z.object({
  /** 서버가 안전 검증·마스킹을 통과시킨 인용 (`P7-BIP-03`). Frontend 가공 0. */
  quote: z.string().min(1),
  speakerName: z.string().min(1),
  sessionDate: CalendarDateSchema,
  bookTitle: z.string().min(1),
  /** 책 쪽 번호. 모르면 `null`. */
  pageRef: z.int().min(1).nullable(),
});

export type MomentOfWeek = z.infer<typeof MomentOfWeekSchema>;

export const WeeklyProgressSchema = z.object({
  week: z.object({ start: CalendarDateSchema, end: CalendarDateSchema }),
  /** 선택 가능한 주 시작일 — **최신 먼저**. 최소 1개(이번 주). */
  availableWeeks: z.array(CalendarDateSchema).min(1),
  sessionsCount: z.int().min(0),
  /** 함께한 분 (StatTile `together`). */
  minutesTogether: z.int().min(0),
  readingSummary: z.object({
    totalMinutes: z.int().min(0),
    nightsWithSession: z.int().min(0).max(WEEK_DAY_COUNT),
    /** 세션 0 이면 `null`. */
    averageSessionMinutes: z.int().min(0).nullable(),
  }),
  days: z.array(WeeklyProgressDaySchema).length(WEEK_DAY_COUNT),
  /** 4역량 각 1개 (순서 무관 — 화면이 Q6 순서로 배치한다). */
  growthThemes: z
    .array(GrowthThemeSchema)
    .length(CapabilitySchema.options.length)
    .refine((themes) => new Set(themes.map((theme) => theme.capability)).size === themes.length, {
      message: 'Each capability must appear exactly once.',
    }),
  momentOfWeek: MomentOfWeekSchema.nullable(),
});

export type WeeklyProgress = z.infer<typeof WeeklyProgressSchema>;
