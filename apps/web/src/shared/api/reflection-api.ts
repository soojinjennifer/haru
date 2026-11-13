/**
 * `reflectionApi` — 세션 회고 제출 (`docs/API_CONTRACTS.md` §3.10 · §4 Stage 5, PRD FR-12).
 *
 * | 호출 | endpoint | Idempotency-Key | 주요 오류 |
 * |---|---|---|---|
 * | `submit` | `POST /v1/sessions/:sessionId/reflection` | **필수** | `REFLECTION_ALREADY_SUBMITTED` · `SESSION_INVALID_TRANSITION`(`details.from` — 완료 전 세션) · `VALIDATION_FAILED` · `IDEMPOTENCY_KEY_REUSED` |
 *
 * 호출 경로: `Component → useSubmitReflection → reflectionApi.submit → MockReflectionApi | HttpReflectionApi`.
 *
 * - 건너뛰기(닫기)는 **요청이 없다** — `skip` 메서드를 두지 않는다 (`N5-06` ⓐ).
 * - 폼 정의 조회(`GET /v1/reflection-form`)는 없다 — 칩은 `ReflectionCheckKey` enum + copy 모듈 (`N5-03` ⓐ).
 * - 회고는 이미 제출된 세션의 재진입 표시를 `SessionDetail.reflection` 으로 읽는다 (별도 조회 메서드 없음).
 */
import type { Reflection, SubmitReflectionRequest } from '@haru/contracts';

import type { ApiMutationOptions } from './options';

export interface ReflectionApi {
  /**
   * `Idempotency-Key` **필수** — 같은 입력의 재시도는 같은 키, 입력이 바뀌면 새 키
   * (같은 키 + 다른 body 는 `IDEMPOTENCY_KEY_REUSED` — Plan `R5-04`).
   */
  submit(
    request: { sessionId: string; body: SubmitReflectionRequest },
    options: ApiMutationOptions,
  ): Promise<Reflection>;
}
