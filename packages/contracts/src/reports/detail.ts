import { z } from 'zod';

import { CalendarDateSchema, IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { CapabilityScoreSchema, CapabilitySnapshotSourceSchema } from '../children/snapshot.js';
import { CapabilitySchema } from '../enums/capability.js';
import { ReflectionCheckKeySchema } from '../enums/reflection-check.js';

import { ReportHighlightClipSchema } from './highlight-clip.js';
import { ReportSummarySchema } from './summary.js';

/**
 * 4주 리포트 상세 — Stage 7 Plan §7 **C7-4** · **C7-4a** · **C7-4b** (`N7-15`·`N7-16`·`N7-42`).
 * `GET /v1/reports/:reportId` · 오류 `REPORT_NOT_READY`(`details.retryAfter?`) · `REPORT_NOT_ELIGIBLE` · `RESOURCE_NOT_FOUND`.
 *
 * - 발행 리포트는 **불변 스냅샷**이다 (`report_snapshots`, `P7-BIP-07`). `childDisplayName` 은 발행 시점 이름으로
 *   **동결**된다 (`N7-16`) — 이후 이름 변경이 과거 리포트를 바꾸지 않는다.
 * - 모든 문장(`summaryLine`·`evidence`·persona·인용·신호·요약·클립 라벨)은 **서버 값만** 표시한다.
 * - 역량 점수 숫자는 **차트 형상에만** 쓴다 — 텍스트 숫자·증감 미노출 (`N7-15` · `D6-8` Q5). 초안의 `deltas` 는 없다.
 */

/** 4역량 점수 묶음 — 4역량 각 1행. `score: null` = 관찰 기회 없음(결측, C-8). */
export const CapabilityScoresSchema = z
  .array(CapabilityScoreSchema)
  .length(CapabilitySchema.options.length)
  .refine((rows) => new Set(rows.map((row) => row.capability)).size === rows.length, {
    message: 'Each capability must appear exactly once.',
  });

export type CapabilityScores = z.infer<typeof CapabilityScoresSchema>;

export const ReportCapabilityEvidenceSchema = z.object({
  capability: CapabilitySchema,
  /** 서버 근거 문장. 없으면 `null` → 화면은 그 행을 그리지 않는다. */
  evidence: z.string().min(1).nullable(),
});

export type ReportCapabilityEvidence = z.infer<typeof ReportCapabilityEvidenceSchema>;

export const ReportCapabilityChangeSchema = z.object({
  /** 이전 리포트 시점 점수. 첫 리포트면 `null` (오버레이 없음). */
  previous: CapabilityScoresSchema.nullable(),
  current: CapabilityScoresSchema,
  items: z
    .array(ReportCapabilityEvidenceSchema)
    .length(CapabilitySchema.options.length)
    .refine((rows) => new Set(rows.map((row) => row.capability)).size === rows.length, {
      message: 'Each capability must appear exactly once.',
    }),
});

export type ReportCapabilityChange = z.infer<typeof ReportCapabilityChangeSchema>;

/**
 * 페르소나 히스토리 1행 — **오래된 것 먼저**(서버 정렬, Frontend 정렬 0).
 * `trigger` = 그 페르소나를 만든 역량 스냅샷의 `source` (C7-4b — Stage 6 enum **재사용**, 신규 enum 0).
 */
export const ReportPersonaHistoryEntrySchema = z.object({
  personaId: IdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  effectiveFrom: IsoDateTimeSchema,
  trigger: CapabilitySnapshotSourceSchema,
});

export type ReportPersonaHistoryEntry = z.infer<typeof ReportPersonaHistoryEntrySchema>;

export const ReportDialogueSchema = z.object({
  sessionCount: z.int().min(0),
  totalMinutes: z.int().min(0),
  childUtteranceCount: z.int().min(0),
  turnTakingCount: z.int().min(0),
  emotionWordCount: z.int().min(0),
  /** 서버 문장 — 관찰·신호 언어 (`P7-BIP-06`). */
  recentSignals: z.array(z.string().min(1)),
});

export type ReportDialogue = z.infer<typeof ReportDialogueSchema>;

export const NOTABLE_QUOTES_MIN = 1;
export const NOTABLE_QUOTES_MAX = 2;

export const ReportNotableQuoteSchema = z.object({
  text: z.string().min(1),
  sessionDate: CalendarDateSchema,
  bookTitle: z.string().min(1).nullable(),
});

export type ReportNotableQuote = z.infer<typeof ReportNotableQuoteSchema>;

export const ReportCheckTrendSchema = z.object({
  key: ReflectionCheckKeySchema,
  count: z.int().min(1),
});

export type ReportCheckTrend = z.infer<typeof ReportCheckTrendSchema>;

export const ReportParentFeedbackSummarySchema = z.object({
  summaryText: z.string().min(1).nullable(),
  checkTrends: z.array(ReportCheckTrendSchema),
  frequentTopics: z.array(z.string().min(1)),
});

export type ReportParentFeedbackSummary = z.infer<typeof ReportParentFeedbackSummarySchema>;

export const ReportDetailSchema = z.object({
  summary: ReportSummarySchema,
  /** 발행 시점 아이 이름 (동결 — `N7-16`). */
  childDisplayName: z.string().min(1),
  capabilityChange: ReportCapabilityChangeSchema,
  personaHistory: z.array(ReportPersonaHistoryEntrySchema).min(1),
  dialogueMetrics: ReportDialogueSchema,
  notableQuotes: z.array(ReportNotableQuoteSchema).min(NOTABLE_QUOTES_MIN).max(NOTABLE_QUOTES_MAX),
  parentFeedbackSummary: ReportParentFeedbackSummarySchema,
  highlightClips: z.array(ReportHighlightClipSchema),
});

export type ReportDetail = z.infer<typeof ReportDetailSchema>;

/**
 * `REPORT_NOT_READY` 의 `details` — 선택 필드. `retryAfter` = 서버가 다시 시도할 예정 시각(익일 재생성 등, `P7-BIP-06`).
 * 화면은 이 값을 표시하지 않는다 (Spec §2.9 Not ready 문구는 고정).
 */
export const ReportNotReadyDetailsSchema = z.object({
  retryAfter: IsoDateTimeSchema.optional(),
});

export type ReportNotReadyDetails = z.infer<typeof ReportNotReadyDetailsSchema>;
