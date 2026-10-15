import { z } from 'zod';

import { OccurredAtSchema } from '../common/datetime.js';
import { CompletedReasonSchema } from '../enums/completed-reason.js';
import { SessionStatusSchema } from '../enums/session-status.js';
import { MAX_RECORDED_SECONDS } from '../rules/recording-limits.js';

import { SessionBubbleCopySchema, SessionSummarySchema, StickerAwardSchema } from './session.js';

/**
 * 세션 전이 요청 — `POST /v1/sessions/:sessionId/transitions` (IK, CG when `to=recording`).
 * 근거: `docs/API_CONTRACTS.md` §3.2, §4 Stage 4.
 * Errors: `SESSION_INVALID_TRANSITION` · `CONSENT_REQUIRED` · `SESSION_MAX_DURATION_EXCEEDED`.
 *
 * 허용 여부 판정은 `canTransition()` (`rules/session-transitions.ts`) 이 소유한다.
 */

/**
 * 클라이언트가 요청할 수 있는 목표 상태 4값 (AC-4-11). `SessionStatus` 의 **부분집합**이며
 * 새 값을 만들지 않는다 (`extract`). `analyzing`·`analyzed`·`failed` 는 server/worker 전이다.
 *
 * `abandoned` 는 세 경로에서 온다 — ① ready 10분 클라이언트 타이머 ② 서버 sweeper
 * ③ 사용자 `Discard` (`D4-12`·`D4-13`). ⛔ 사유를 구분하는 필드는 없다 (`N4-30` 이연).
 */
export const ClientSessionTransitionTargetSchema = SessionStatusSchema.extract([
  'recording',
  'paused',
  'completed',
  'abandoned',
]);

export type ClientSessionTransitionTarget = z.infer<typeof ClientSessionTransitionTargetSchema>;

export const SessionTransitionRequestSchema = z
  .object({
    to: ClientSessionTransitionTargetSchema,
    /** 클라이언트에서 실제로 전이가 일어난 시각 — 오프라인 재전송 시 서버는 이 값을 기록한다. */
    occurredAt: OccurredAtSchema,
    /** 실제 녹음 시간 (일시정지 제외). 상한 초과는 parse 실패 (AC-4-13). */
    recordedSeconds: z.int().min(0).max(MAX_RECORDED_SECONDS).optional(),
    completedReason: CompletedReasonSchema.optional(),
  })
  .refine((value) => value.to !== 'completed' || value.completedReason !== undefined, {
    message: 'completedReason is required when to is completed.',
    path: ['completedReason'],
  });

export type SessionTransitionRequest = z.infer<typeof SessionTransitionRequestSchema>;

/**
 * 전이 결과. `completionBubble`(종료 버블, FR-10) 과 `stickerAward`(FR-19) 는 `completed` 전이에서만
 * 올 수 있다. 같은 요청의 replay 는 같은 응답이어야 한다 (멱등 — 스티커 중복 표시 방지).
 */
export const SessionTransitionResultSchema = z.object({
  session: SessionSummarySchema,
  completionBubble: SessionBubbleCopySchema.optional(),
  stickerAward: StickerAwardSchema.nullable().optional(),
});

export type SessionTransitionResult = z.infer<typeof SessionTransitionResultSchema>;
