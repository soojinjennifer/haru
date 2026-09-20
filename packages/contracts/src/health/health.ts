import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';

/**
 * `GET /v1/health` 응답 — `docs/API_CONTRACTS.md` §4 Stage 1.
 *
 * - **공개 endpoint** 다 (인증 헤더 불필요).
 * - 부작용이 없으므로 `Idempotency-Key` 도 동의 가드도 필요 없다.
 * - 오류는 공통 Error Envelope 을 따른다 (`INTERNAL_ERROR`, `RATE_LIMITED`).
 *
 * 이 파일은 **계약만** 정의한다. 실제 endpoint·서버 코드는 이 프로젝트에서 구현하지 않는다
 * (`.claude/rules/backend.md` §1). Mock Adapter 와 Http Adapter 가 이 schema 를 공유한다.
 */
export const HealthStatusSchema = z.literal('ok');

export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const HealthResponseSchema = z.object({
  status: HealthStatusSchema,
  /** 배포 식별용 버전 문자열. 형식은 서버가 정한다 (예: `1.0.0`, git sha). */
  version: z.string().min(1),
  /** 서버 기준 현재 시각 (ISO 8601 UTC). */
  serverTime: IsoDateTimeSchema,
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
