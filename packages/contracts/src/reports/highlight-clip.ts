import { z } from 'zod';

import { CalendarDateSchema } from '../common/datetime.js';
import { HighlightClipSummarySchema } from '../highlight-clips/clip.js';

/**
 * 소속: Stage 5 `highlight-clips` 모듈의 공개 표면(AC-5-08 스냅샷)을 바꾸지 않도록 리포트 도메인에 둔다.
 * Stage 5 schema 는 **import 해서 확장**한다 — 같은 모양을 다시 선언하지 않는다.
 */
/**
 * 리포트 안의 하이라이트 클립 — Stage 7 Plan §7 **C7-5** (`N7-18`). Stage 5 `HighlightClipSummary` 를
 * **확장(extend)** 한다 — Stage 5 fixture 는 확장 필드만 더하면 그대로 parse 된다.
 *
 * - `label` = 서버가 만든 짧은 캡션 (예 *"Talking about feelings"*). 인용 원문이 아니다. Frontend 생성 0.
 * - `expiresAt` 이 지난 클립은 조회 전에도 "더 이상 들을 수 없음" 으로 표시한다 (`N7-17`).
 */
export const ReportHighlightClipSchema = HighlightClipSummarySchema.extend({
  label: z.string().min(1),
  sessionDate: CalendarDateSchema,
});

export type ReportHighlightClip = z.infer<typeof ReportHighlightClipSchema>;

/**
 * `GET /v1/highlight-clips/:clipId/playback-url` 의 `RECORDING_DELETED` `details` — C7-8 (`N7-17`).
 * 삭제(`deleted`)와 보관 만료(`expired`) 모두 같은 code 다. 화면 문구는 둘 다 같다 — `reason` 은 선택 필드.
 */
export const RECORDING_DELETED_REASONS = ['deleted', 'expired'] as const;

export const RecordingDeletedDetailsSchema = z.object({
  reason: z.enum(RECORDING_DELETED_REASONS).optional(),
});

export type RecordingDeletedDetails = z.infer<typeof RecordingDeletedDetailsSchema>;
