/**
 * 부작용이 있는 호출(mutation)이 공통으로 받는 옵션.
 *
 * `docs/API_CONTRACTS.md` §1 Conventions — "`Idempotency-Key: <uuid>` **필수**: … 온보딩 submit …".
 * `POST /v1/consents` 도 같은 규약을 따른다 (§4 Stage 2 표의 **IK** 표시).
 *
 * 키를 **호출자(Mutation hook)** 가 만들어 넘기는 이유: 같은 제출을 재시도할 때 같은 키가
 * 재사용되어야 서버(향후 Backend)가 최초 응답을 재생할 수 있다 (AC-2-16). Adapter 안에서
 * 매번 새 키를 만들면 재시도가 중복 제출이 된다.
 *
 * 읽기 전용 옵션(`ApiRequestOptions`)은 Stage 1 에서 `health-api.ts` 에 정의되었고 그대로 쓴다.
 */
import type { ApiRequestOptions } from './health-api';

export interface ApiMutationOptions extends ApiRequestOptions {
  /** uuid. `shared/lib/idempotency.ts` 의 `createIdempotencyKey()` 로 만든다. */
  idempotencyKey: string;
}
