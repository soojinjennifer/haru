import { z } from 'zod';

import { CalendarDateSchema } from '../common/datetime.js';
import { ReportEligibilitySchema, ReportStatusSchema } from '../enums/report.js';

import { ReportSummarySchema } from './summary.js';

/**
 * Progress 탭 4주 리포트 카드 데이터 — Stage 7 Plan §7 **C7-2** · **C7-2a** (`N7-04`·`N7-05`·`N7-35`·`N7-36`).
 * `GET /v1/children/:childId/reports/overview`.
 *
 * ── 의미 (C7-2a — schema 모양이 아니라 값의 뜻, Frontend · Mock · 향후 Backend 공통) ──
 * ① `latestReport` = 가장 최근 **발행된** 리포트(없으면 `null`) · `currentCycle` = 지금 쌓이고 있는 주기.
 *   **두 필드는 독립**이며 카드가 둘을 **조합**한다 (배타 상태 아님).
 * ② 발행 직후 서버는 `currentCycle` 을 **다음 주기 `in_progress`** 로 넘긴다.
 * ③ `currentCycle.status = 'published'` 는 정상 응답에서 오지 않는다 — 오면 화면은 `in_progress` 와 같게 처리한다.
 * ④ `deferred` = 미충족으로 **이월되어 합쳐진 현재 주기** — `progressRatio`·`nextReportDate` 는 그 주기 기준.
 * ⑤ `generating`·`delayed` 의 `progressRatio` 는 화면에 표시하지 않는다 (값은 존재).
 * ⑥ `reportCount` = 발행 리포트 수 (`latestReport` 포함).
 *
 * - `progressRatio` = **서버 산식**(`P7-BIP-08`). Frontend 는 계산하지 않고 막대 형상에만 쓴다 —
 *   분자/분모·퍼센트 텍스트를 그리지 않는다 (`N7-05`). `progress` 원값은 Backend 계약 표현용이다.
 * - `eligibility` 세부 사유를 화면 문구로 나누지 않는다 (Spec §2.2). Frontend 재판정 0 (Plan §5.1).
 * - 초안의 `latestSnapshot`(다이아몬드)·`archive[]` 는 **없다** (`N7-04` · 목록 = C7-3).
 */
export const ReportCycleProgressSchema = z.object({
  recordedSeconds: z.int().min(0),
  requiredSeconds: z.int().min(1),
  recordedSessions: z.int().min(0),
  requiredSessions: z.int().min(1),
});

export type ReportCycleProgress = z.infer<typeof ReportCycleProgressSchema>;

export const ReportCycleSchema = z.object({
  cycleNo: z.int().min(1),
  periodStart: CalendarDateSchema,
  periodEnd: CalendarDateSchema,
  status: ReportStatusSchema,
  eligibility: ReportEligibilitySchema,
  progressRatio: z.number().min(0).max(1),
  /** 다음 리포트 예정일 (보호자 시간대 날짜). 생성 중·지연처럼 예정일이 없으면 `null`. */
  nextReportDate: CalendarDateSchema.nullable(),
  progress: ReportCycleProgressSchema,
});

export type ReportCycle = z.infer<typeof ReportCycleSchema>;

export const ReportOverviewSchema = z.object({
  currentCycle: ReportCycleSchema,
  latestReport: ReportSummarySchema.nullable(),
  reportCount: z.int().min(0),
});

export type ReportOverview = z.infer<typeof ReportOverviewSchema>;
