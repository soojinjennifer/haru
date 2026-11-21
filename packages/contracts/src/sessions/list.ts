import { z } from 'zod';

import { CursorPageRequestSchema, paginated } from '../common/pagination.js';
import { SessionStatusSchema } from '../enums/session-status.js';
import { RecordingStatusSchema } from '../recordings/status.js';

import { SessionSummarySchema } from './session.js';

/**
 * 세션 목록 — `GET /v1/children/:childId/sessions` (cursor, `?status=`).
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 4, Stage 4 Plan §7.4 `C4-OPEN-4` (Contract 를 만든다).
 * 화면 소비는 Stage 7/8 (FR-20 히스토리 · FR-21 세션별 녹음 삭제 목록) 이며,
 * Stage 4 에서는 크래시 복구 시 "진행 중 세션 찾기" 에 쓸 수 있다.
 *
 * Stage 8 Rev 12 `C8-2` — `hasRecording` 필터 추가 (**추가만** — 기존 요청은 그대로 통과한다).
 * `true` = 녹음 레코드가 있는 세션만(`recording !== null` — `deleted` · `expired` 포함, `Q8-07` ⓐ 행 유지).
 * `false` = 녹음이 없는 세션만. 생략 = 필터 없음. 세션별 녹음 삭제 목록(FR-21)이 `true` 로 쓴다.
 */
export const ListSessionsRequestSchema = CursorPageRequestSchema.extend({
  status: SessionStatusSchema.optional(),
  hasRecording: z.boolean().optional(),
});

export type ListSessionsRequestInput = z.input<typeof ListSessionsRequestSchema>;
export type ListSessionsRequest = z.infer<typeof ListSessionsRequestSchema>;

/**
 * 세션 목록 항목 — `SessionSummary` + 서버가 본 녹음 상태 (Stage 8 Rev 12 `C8-2`, `API_CONTRACTS.md` §3.13).
 *
 * `recording` 은 `SessionDetail.recording` 과 같은 schema(§3.9)다. 녹음이 없는 세션(대화 전용 등)은 `null`.
 * 목록 화면이 이 값으로 행 상태(*Saved* · *Uploading* …)를 판정한다.
 *
 * **추가만 — 기존 parse 호환** (Plan §7 `C8-2` · AC-8-05): 입력에서 key 가 없으면 `null` 로 채운다(`.default(null)`).
 * 그래서 Stage 4 형태의 항목(`SessionSummary` 만)도 그대로 통과하고, parse **결과** 타입은 항상
 * `recording: RecordingStatus | null` 이다. Backend 는 key 를 **항상 보낸다** — `hasRecording=true` 목록에서 key 가 빠지면
 * 화면은 그 행을 "녹음 없음" 으로 읽는다 (`P8-BIP-04`).
 */
export const SessionListItemSchema = SessionSummarySchema.extend({
  recording: RecordingStatusSchema.nullable().default(null),
});

export type SessionListItem = z.infer<typeof SessionListItemSchema>;
export type SessionListItemInput = z.input<typeof SessionListItemSchema>;

export const ListSessionsResponseSchema = paginated(SessionListItemSchema);

export type ListSessionsResponse = z.infer<typeof ListSessionsResponseSchema>;
