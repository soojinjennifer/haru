import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { AnalysisOutcomeSchema } from '../enums/analysis-outcome.js';
import { SessionModeSchema } from '../enums/session-mode.js';
import { SessionStatusSchema } from '../enums/session-status.js';

/**
 * 세션 분석 상태 · 짧은 피드백 — `GET /v1/sessions/:sessionId/analysis`
 * (PRD FR-13 · FR-14 · §13, `docs/API_CONTRACTS.md` §3.11 Rev 9, Stage 5 Plan §7 C-7 · C-8).
 *
 * Errors: `ANALYSIS_NOT_AVAILABLE`(`conversation_only` 세션 · 완료 전 세션) · `RESOURCE_NOT_FOUND` · `FORBIDDEN`.
 *
 * - ⛔ `metricsPreview{emotionWordCount, newWords[]}` 는 **두지 않는다** (`N5-11` ⓐ). 아이 발화 파생 값이
 *   Frontend 로 오지 않는다 — PRD 예시 *"감정 단어를 3번 사용했어요"* 는 서버가 만든 `shortFeedback.text` 다.
 * - ⛔ 전사·발화 원문·지표 필드를 두지 않는다 (§13 민감 발화 — `N5-13`: 세션 단위 신규 outcome 없음).
 * - 녹음이 삭제·만료된 세션(`OAQ-17`)은 **enum 변경 없이** 표현한다 (`N5-12` ⓐ): 서버는
 *   `sessionStatus='completed'` 를 그대로 돌려주고, Frontend 는 `SessionDetail.recording.uploadStatus ∈
 *   {deleted, expired}` 로 "분석할 녹음 없음" 을 판별한다.
 */

/**
 * 분석 조회가 응답할 수 있는 세션 상태 — 완료 계열 4값 (`SessionStatus` 의 부분집합, 새 값 없음).
 * 완료 전(`ready` · `recording` · `paused`) · `abandoned` 은 응답이 아니라 `ANALYSIS_NOT_AVAILABLE` 이다.
 */
export const AnalysisSessionStatusSchema = SessionStatusSchema.extract([
  'completed',
  'analyzing',
  'analyzed',
  'failed',
]);

export type AnalysisSessionStatus = z.infer<typeof AnalysisSessionStatusSchema>;

/**
 * 세션 직후 짧은 성장 피드백 (FR-13). 문구는 **서버 검수 템플릿 결과**이며 Frontend 는 그대로 표시한다 —
 * 조립·보간·대체 문구 0 (`P5-BIP-09`). 쓸 문구가 없으면 `text: null` → 텍스트 줄을 렌더하지 않는다.
 * 길이(1~2줄)는 생성 측 요구이며 schema 제약이 아니다 — `SessionBubbleCopy` 와 같은 이유로 `.max()` 없음.
 */
export const ShortFeedbackSchema = z.object({
  text: z.string().nullable(),
  /** 검수 템플릿 추적용 (`P5-BIP-09`). 화면에 표시하지 않는다. */
  templateId: z.string().min(1).optional(),
});

export type ShortFeedback = z.infer<typeof ShortFeedbackSchema>;

export const SessionAnalysisStatusSchema = z
  .object({
    sessionId: IdSchema,
    sessionStatus: AnalysisSessionStatusSchema,
    mode: SessionModeSchema,
    /** `analyzed` 일 때만 값이 있다 (`full` · `excluded_low_quality`). */
    outcome: AnalysisOutcomeSchema.nullable(),
    shortFeedback: ShortFeedbackSchema.nullable(),
  })
  .refine((value) => value.outcome === null || value.sessionStatus === 'analyzed', {
    message: 'outcome is only set when sessionStatus is analyzed.',
    path: ['outcome'],
  });

export type SessionAnalysisStatus = z.infer<typeof SessionAnalysisStatusSchema>;
