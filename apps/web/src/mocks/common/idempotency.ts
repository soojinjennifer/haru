/**
 * `Idempotency-Key` 보관·재생 — Stage 4 Plan §8.4-5 · AC-4-37 (Stage 3 `QA-3-005` 재발 방지).
 *
 * Stage 2·3 Mock(`MockConsentApi` · `MockOnboardingApi` · `MockLibraryApi`)은 같은 규칙을 각자
 * 구현했다. Stage 4 는 endpoint 가 5개(create · transition · init · upload-tokens · complete)라
 * 규칙을 **한 곳**에 둔다 (`API_CONTRACTS` §5.2 "중복 방지").
 *
 * 규칙 (서버 규약과 동일, 보관 기간 24h 는 Backend 몫)
 * - 같은 key + 같은 요청 → **최초 응답을 그대로 재생**한다 (새 리소스·상태 변화 없음)
 * - 같은 key + 다른 요청 → `IDEMPOTENCY_KEY_REUSED`
 * - **성공한 응답만** 보관한다 — 실패한 시도는 같은 key 로 다시 보내 성공할 수 있어야 한다
 *
 * "같은 요청" 은 **operation + 경로 파라미터 + parse 된 body** 의 지문이다. 경로 파라미터를
 * 넣는 이유: 같은 key 를 다른 세션의 전이에 쓰면 body 가 같아도 다른 요청이다.
 * body 는 Adapter 경계에서 이미 schema parse 를 통과했으므로 키 순서가 정규화되어 있고
 * `JSON.stringify` 비교가 결정적이다.
 */
import type { MockFailure } from './delivery';

interface StoredResponse {
  readonly fingerprint: string;
  readonly response: unknown;
}

export interface IdempotencyLedger {
  /**
   * 보관된 응답이 있으면 그것을, 처음 보는 key 면 `undefined` 를 돌려준다.
   * 같은 key 가 다른 요청으로 오면 `IDEMPOTENCY_KEY_REUSED` 를 던진다.
   */
  replay<T>(key: string, fingerprint: string): T | undefined;
  remember<T>(key: string, fingerprint: string, response: T): T;
  /** 보관 개수 (테스트 확인용). */
  size(): number;
}

export function idempotencyFingerprint(
  operation: string,
  params: Readonly<Record<string, string>>,
  body: unknown,
): string {
  return JSON.stringify({ operation, params, body });
}

export function createIdempotencyLedger(failure: MockFailure): IdempotencyLedger {
  const stored = new Map<string, StoredResponse>();

  return {
    replay<T>(key: string, fingerprint: string): T | undefined {
      const hit = stored.get(key);
      if (hit === undefined) return undefined;
      if (hit.fingerprint === fingerprint) return hit.response as T;

      return failure.fail(
        'IDEMPOTENCY_KEY_REUSED',
        'That idempotency key was used with another request.',
      );
    },

    remember<T>(key: string, fingerprint: string, response: T): T {
      stored.set(key, { fingerprint, response });
      return response;
    },

    size(): number {
      return stored.size;
    },
  };
}
