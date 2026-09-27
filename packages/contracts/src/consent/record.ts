import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { ConsentSourceSchema } from '../enums/consent-source.js';
import { ConsentActionSchema, ConsentTypeSchema } from '../enums/consent.js';

/**
 * 동의 기록 1건 — **CONFIRMED (C-1 · C-4)**.
 * `action` 은 `'granted'` 만 존재한다 (동의 철회는 MVP 제외 — C-4).
 * 항목별로 **문서 버전(`documentId`)** 을 함께 기록해야 재동의 판정이 가능하다.
 */
export const ConsentItemSchema = z.object({
  type: ConsentTypeSchema,
  documentId: IdSchema,
  action: ConsentActionSchema,
});

export type ConsentItem = z.infer<typeof ConsentItemSchema>;

/**
 * `POST /v1/consents` 요청 — Idempotency-Key 필수.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2, `docs/plans/stage-2-plan.md` §7.2.
 *
 * 필수 동의 누락은 서버가 `VALIDATION_FAILED`,
 * 구버전 문서 제출은 `CONSENT_VERSION_OUTDATED` 로 거부한다.
 */
export const RecordConsentsRequestSchema = z.object({
  items: z.array(ConsentItemSchema).min(1),
  source: ConsentSourceSchema,
});

export type RecordConsentsRequest = z.infer<typeof RecordConsentsRequestSchema>;

/**
 * 동의 상태 — `POST /v1/consents` 응답이자 `Me.consentStatus` 의 형태다.
 *
 * - `required` — 현재 정책상 필수인 동의 종류
 * - `missing` — 그중 아직 유효한 기록이 없는 종류. 비어 있지 않으면 온보딩 쓰기 경로가 막힌다
 *   (`CONSENT_REQUIRED`).
 * - `grantedAt` — 마지막으로 동의가 기록된 시각. 기록이 없으면 `null`.
 */
export const ConsentStatusSchema = z.object({
  required: z.array(ConsentTypeSchema),
  missing: z.array(ConsentTypeSchema),
  grantedAt: IsoDateTimeSchema.nullable(),
});

export type ConsentStatus = z.infer<typeof ConsentStatusSchema>;

/**
 * 필수 동의가 모두 기록되었는지 판정한다 — 부수효과 없는 순수 함수.
 *
 * Frontend Route Guard(`docs/ARCHITECTURE.md` §2.4)와 Mock 이 같은 규칙을 쓰기 위해
 * contracts 에 둔다. 서버 측 강제는 Backend 요구사항이다 (`BACKEND_INTEGRATION_PENDING`).
 */
export function hasAllRequiredConsents(status: ConsentStatus): boolean {
  return status.missing.length === 0;
}
