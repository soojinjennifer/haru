/**
 * `healthApi` — `GET /v1/health` (`docs/API_CONTRACTS.md` §4 Stage 1, Plan §7.2).
 *
 * 호출 경로: `Component → useHealth → healthApi.get → MockHealthApi | HttpHealthApi`
 * (API_CONTRACTS §5.2). Component 는 이 interface 도 Adapter 도 직접 호출하지 않는다.
 *
 * - 공개 endpoint (인증 헤더 불필요)
 * - 부작용 없음 → `Idempotency-Key` 불필요
 * - 오류: `INTERNAL_ERROR` · `RATE_LIMITED` (Error Envelope) / 전송 실패는 `NetworkError`
 */
import type { HealthResponse } from '@haru/contracts';

/** 모든 도메인 API 호출이 공통으로 받는 옵션. */
export interface ApiRequestOptions {
  /** TanStack Query 가 넘기는 취소 신호. */
  signal?: AbortSignal | undefined;
}

export interface HealthApi {
  get(options?: ApiRequestOptions): Promise<HealthResponse>;
}
