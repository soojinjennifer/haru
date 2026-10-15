import { type z } from 'zod';

import { CursorPageRequestSchema, paginated } from '../common/pagination.js';
import { SessionStatusSchema } from '../enums/session-status.js';

import { SessionSummarySchema } from './session.js';

/**
 * 세션 목록 — `GET /v1/children/:childId/sessions` (cursor, `?status=`).
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 4, Stage 4 Plan §7.4 `C4-OPEN-4` (Contract 를 만든다).
 * 화면 소비는 Stage 7/8 (FR-20 히스토리 · FR-21 세션별 녹음 삭제 목록) 이며,
 * Stage 4 에서는 크래시 복구 시 "진행 중 세션 찾기" 에 쓸 수 있다.
 */
export const ListSessionsRequestSchema = CursorPageRequestSchema.extend({
  status: SessionStatusSchema.optional(),
});

export type ListSessionsRequestInput = z.input<typeof ListSessionsRequestSchema>;
export type ListSessionsRequest = z.infer<typeof ListSessionsRequestSchema>;

export const ListSessionsResponseSchema = paginated(SessionSummarySchema);

export type ListSessionsResponse = z.infer<typeof ListSessionsResponseSchema>;
