import { z } from 'zod';

import { BookSummarySchema } from '../books/search.js';
import { IdSchema } from '../common/id.js';
import { IsoDateTimeSchema } from '../common/datetime.js';
import { paginated } from '../common/pagination.js';
import { GiftRequestStatusSchema } from '../enums/gift-request.js';

/**
 * 책 증정 신청 — `POST /v1/children/:childId/gift-requests` ·
 * `GET /v1/children/:childId/gift-requests` (FR-22 · PRD §13).
 * 근거: Library Plan §7.2 · §7.5, `stage-2-approvals.md` `D-15`.
 *
 * **배송지 필드가 없다** (`D-15`) — MVP 는 신청과 상태 조회만 다루고 배송 정보는 운영이
 * 별도 경로로 수집한다. Frontend 에 주소 입력 UI 를 만들지 않는다.
 *
 * 상태 enum 은 `GiftRequestStatusSchema`(6종) **재사용**이다 — 이미 존재한다.
 * 중복 신청은 `GIFT_REQUEST_DUPLICATE`(409).
 * `Idempotency-Key` **필수** — 생성 요청이다.
 */
export const CreateGiftRequestRequestSchema = z.object({ bookId: IdSchema });

export type CreateGiftRequestRequest = z.infer<typeof CreateGiftRequestRequestSchema>;

export const GiftRequestSchema = z.object({
  id: IdSchema,
  book: BookSummarySchema,
  status: GiftRequestStatusSchema,
  requestedAt: IsoDateTimeSchema,
  /** 상태가 마지막으로 바뀐 시각. 화면은 상태 **라벨 텍스트**로 표시한다 (색 의존 금지). */
  statusUpdatedAt: IsoDateTimeSchema,
});

export type GiftRequest = z.infer<typeof GiftRequestSchema>;

export const GiftRequestListResponseSchema = paginated(GiftRequestSchema);

export type GiftRequestListResponse = z.infer<typeof GiftRequestListResponseSchema>;
