/**
 * `homeApi` — `GET /v1/children/:childId/home` (`docs/API_CONTRACTS.md` §4 Stage 3).
 *
 * 호출 경로: `Component → useHomeSummary → homeApi.getSummary → MockHomeApi | HttpHomeApi`.
 * Component 는 이 interface 도 Adapter 도 직접 호출하지 않는다 (`rules/frontend.md` §4).
 *
 * - 인증 필요 · 부작용 없음 → `Idempotency-Key` 불필요
 * - 오류: `ONBOARDING_INCOMPLETE` · `CHILD_NOT_FOUND` · `FORBIDDEN` · `INTERNAL_ERROR`
 */
import type { HomeSummary } from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface HomeApi {
  getSummary(request: { childId: string }, options?: ApiRequestOptions): Promise<HomeSummary>;
}
