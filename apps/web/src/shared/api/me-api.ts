/**
 * `meApi` — `GET /v1/me` (`docs/API_CONTRACTS.md` §4 Stage 2, Plan §7.2).
 *
 * Route Guard 판정(`resolveGuardDecision` — D-5)이 이 응답 하나로 결정된다.
 *
 * - 인증 필요 (`Authorization: Bearer`)
 * - 부작용 없음 → `Idempotency-Key` 불필요
 * - 오류: `AUTH_REQUIRED` · `AUTH_TOKEN_EXPIRED` (1회 refresh 후 재시도 — AC-2-07)
 *
 * `update` 는 `PATCH /v1/me` (`UpdateCaregiver` — 결정 **D-16**) 다. 온보딩 Step 1 은 화면이
 * 하나지만 요청은 둘로 나뉜다: **보호자 소유 데이터**(관계·타임존)는 여기로, 아이 정보는
 * `onboardingApi` 로 간다. 한 payload 에 섞으면 "동의 기록 전 아동 데이터 0건"(AC-2-13)을
 * 요청 단위로 검증할 수 없다.
 */
import type { MeResponse, UpdateCaregiverRequest } from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';

export interface MeApi {
  get(options?: ApiRequestOptions): Promise<MeResponse>;
  /** `PATCH /v1/me` — 보낸 필드만 갱신한다. 부작용은 있으나 멱등이라 IK 를 쓰지 않는다. */
  update(request: UpdateCaregiverRequest, options?: ApiRequestOptions): Promise<MeResponse>;
}
