/**
 * `sessionApi` — Storytime Session (`docs/API_CONTRACTS.md` §3.2 · §4 Stage 4).
 *
 * | 호출 | endpoint | Idempotency-Key | 주요 오류 |
 * |---|---|---|---|
 * | `create` | `POST /v1/sessions` | **필수** | `ONBOARDING_INCOMPLETE` · `SESSION_ALREADY_ACTIVE`(`details.sessionId`) |
 * | `getDetail` | `GET /v1/sessions/:sessionId` | — | `RESOURCE_NOT_FOUND` |
 * | `transition` | `POST /v1/sessions/:sessionId/transitions` | **필수** (CG when `to=recording`) | `SESSION_INVALID_TRANSITION`(`details.from/to`) · `CONSENT_REQUIRED` · `SESSION_MAX_DURATION_EXCEEDED` |
 * | `list` | `GET /v1/children/:childId/sessions?status=&limit=&cursor=` | — | — |
 *
 * 호출 경로: `Component → Query/Mutation hook → sessionApi.* → MockSessionApi | HttpSessionApi`
 * (`API_CONTRACTS` §5.2 의 예시 경로 그대로). Component 는 이 interface 도 Adapter 도 직접 부르지 않는다.
 *
 * 사용자 `Discard` 는 **`transition({ to: 'abandoned' })`** 이다 — 별도 메서드가 없다 (`D4-12`·`D4-13`).
 * 폐기 사유는 보내지 않는다 (`N4-30`).
 */
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  ListSessionsRequestInput,
  ListSessionsResponse,
  SessionDetail,
  SessionTransitionRequest,
  SessionTransitionResult,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';
import type { ApiMutationOptions } from './options';

export interface SessionApi {
  /** `Idempotency-Key` **필수** — 호출자(Mutation hook)가 만들어 넘긴다. */
  create(
    request: { body: CreateSessionRequest },
    options: ApiMutationOptions,
  ): Promise<CreateSessionResponse>;
  getDetail(request: { sessionId: string }, options?: ApiRequestOptions): Promise<SessionDetail>;
  /** `Idempotency-Key` **필수** — 같은 전이의 재전송(오프라인 outbox)은 같은 키를 쓴다. */
  transition(
    request: { sessionId: string; body: SessionTransitionRequest },
    options: ApiMutationOptions,
  ): Promise<SessionTransitionResult>;
  list(
    request: { childId: string; query: ListSessionsRequestInput },
    options?: ApiRequestOptions,
  ): Promise<ListSessionsResponse>;
}
