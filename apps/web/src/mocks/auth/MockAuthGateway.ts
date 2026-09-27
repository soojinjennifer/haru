/**
 * `MockAuthGateway` — `AuthGateway` 의 Mock 구현 (Plan §5.2 · §8.1 `auth` 그룹).
 *
 * 실제 인증 Provider 는 이 프로젝트에서 구현하지 않는다 (#27, `BACKEND_INTEGRATION_PENDING`
 * P2-BIP-01·02). 이 Gateway 는 **화면과 상태 전이를 검증할 수 있을 만큼만** 재현한다.
 *
 * | key                 | 동작                                                                  |
 * |---------------------|------------------------------------------------------------------------|
 * | `success`           | 가입·로그인 성공(세션 발급), refresh 성공                              |
 * | `loading`           | 주입 timer 로 지연 후 성공                                             |
 * | `error`             | 동작별 Error Envelope (아래 표), refresh 는 `null`                      |
 * | `retry`             | 1회차 실패 → 2회차부터 성공 (입력 보존 UX 검증)                        |
 * | `offline`           | `NetworkError` (Error Envelope 없음)                                   |
 * | `token-expired`     | refresh 성공 — `GET /v1/me` 의 만료 재시도와 짝을 이룬다 (AC-2-07)      |
 * | `provider-cancelled`| 소셜 로그인 취소 = `session: null` **성공** 반환 (오류 아님 — AC-2-08)  |
 *
 * `error` 의 동작별 코드
 * | 동작                  | code                  | 이유                                             |
 * |----------------------|-----------------------|--------------------------------------------------|
 * | `signUpWithEmail`    | `VALIDATION_FAILED`   | 입력 문제로 표현 (계정 존재 여부를 말하지 않는다) |
 * | `signInWithEmail`    | `AUTH_REQUIRED`       | 잘못된 자격 증명 — 계정 존재 여부 비노출          |
 * | `signInWithProvider` | `PROVIDER_UNAVAILABLE`| provider 응답 실패                                |
 * | `requestPasswordReset`| `INTERNAL_ERROR`     | 전송 실패. 계정 존재 여부는 여전히 말하지 않는다  |
 * | `updatePassword`     | `AUTH_TOKEN_EXPIRED`  | 재설정 **링크 만료** (Design Spec §2.5)           |
 *
 * 신규 Error Code 는 만들지 않는다 (AC-2-48 — 기존 28종 범위).
 * 시간·ID·지연은 전부 주입받는다 (AC-2-52 결정성).
 */
import {
  HaruApiError,
  AuthResultSchema,
  RequestPasswordResetInputSchema,
  SignInWithEmailInputSchema,
  SignUpWithEmailInputSchema,
  UpdatePasswordInputSchema,
  type AuthProvider,
  type AuthResult,
  type AuthSession,
  type ErrorCode,
  type RequestPasswordResetInput,
  type SignInWithEmailInput,
  type SignUpWithEmailInput,
  type UpdatePasswordInput,
} from '@haru/contracts';

import {
  buildErrorEnvelope,
  NetworkError,
  parseRequest,
  parseResponse,
  withDelay,
  type Timer,
} from '../../shared/api/helpers';
import type { AuthGateway, Unsubscribe } from '../../shared/auth';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import { createAuthSessionFixture } from '../fixtures/auth';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const AUTH_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'token-expired',
  'provider-cancelled',
] as const;

export type AuthScenarioKey = (typeof AUTH_SCENARIO_KEYS)[number];

export const authScenarioGroup: ScenarioGroupDefinition<AuthScenarioKey> = {
  group: 'auth',
  keys: AUTH_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 "1.5–3s". 실제 대기는 주입 timer 가 결정한다. */
export const AUTH_LOADING_DELAY_MS = 1_500;

export interface MockAuthGatewayDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  requestLog?: RequestLog | undefined;
}

export function createMockAuthGateway(deps: MockAuthGatewayDeps): AuthGateway {
  const { store, clock, idFactory, timer, requestLog } = deps;

  let session: AuthSession | null = null;
  let generation = 0;
  const listeners = new Set<(next: AuthSession | null) => void>();

  function publish(next: AuthSession | null): void {
    session = next;
    for (const listener of listeners) listener(next);
  }

  function issueSession(): AuthSession {
    generation += 1;
    const next = createAuthSessionFixture(clock, generation);
    publish(next);
    return next;
  }

  function fail(code: ErrorCode, message: string): never {
    throw HaruApiError.fromEnvelope(
      buildErrorEnvelope(code, message, { requestId: idFactory.next() }),
    );
  }

  function result(next: AuthSession | null): AuthResult {
    return parseResponse(
      AuthResultSchema,
      { session: next },
      { operation: 'AuthGateway', direction: 'response' },
    );
  }

  /**
   * 공통 실행 경로 — scenario 해석 · 지연 · 실패 재현을 한 곳에 모은다.
   * 각 메서드는 "성공했을 때 무엇을 돌려주는가" 와 "`error` 일 때 어떤 코드인가" 만 정한다.
   */
  async function run<T>(
    operation: string,
    errorCode: ErrorCode,
    errorMessage: string,
    onSuccess: () => T,
    signal?: AbortSignal,
  ): Promise<T> {
    const scenario = store.resolve(authScenarioGroup);
    const attempt = consumeAttempt(store, authScenarioGroup.group, signal);

    switch (scenario) {
      case 'loading':
        return withDelay(timer, AUTH_LOADING_DELAY_MS, onSuccess, signal);

      case 'error':
        return fail(errorCode, errorMessage);

      case 'retry':
        return attempt === 1 ? fail(errorCode, errorMessage) : onSuccess();

      case 'offline':
        throw new NetworkError(`Mock auth gateway is offline (${operation}).`);

      default:
        return onSuccess();
    }
  }

  return {
    getSession() {
      return Promise.resolve(session);
    },

    onChange(listener: (next: AuthSession | null) => void): Unsubscribe {
      listeners.add(listener);
      // 구독 즉시 현재 값을 통지한다 — 소비자가 초기 상태를 따로 조회하지 않아도 된다.
      listener(session);

      return () => {
        listeners.delete(listener);
      };
    },

    async signUpWithEmail(input: SignUpWithEmailInput) {
      // `.strict()` 라서 아이 필드가 섞이면 여기에서 걸린다 (AC-2-05).
      const parsed = parseRequest(SignUpWithEmailInputSchema, input, {
        operation: 'AuthGateway.signUpWithEmail',
      });
      // 비밀번호는 `redactSecrets` 가 표식으로 바꾼다 (§5.5 로그 PII 금지).
      requestLog?.record('AuthGateway.signUpWithEmail', parsed);

      return run(
        'signUpWithEmail',
        'VALIDATION_FAILED',
        'We could not create the account with that information.',
        () => result(issueSession()),
      );
    },

    async signInWithEmail(input: SignInWithEmailInput) {
      const parsed = parseRequest(SignInWithEmailInputSchema, input, {
        operation: 'AuthGateway.signInWithEmail',
      });
      requestLog?.record('AuthGateway.signInWithEmail', parsed);

      return run(
        'signInWithEmail',
        'AUTH_REQUIRED',
        // 계정 존재 여부를 구분해 주지 않는다 (enumeration 방지 — NFR 보안).
        'That email and password did not match.',
        () => result(issueSession()),
      );
    },

    async signInWithProvider(provider: AuthProvider) {
      requestLog?.record('AuthGateway.signInWithProvider', { provider });

      if (store.resolve(authScenarioGroup) === 'provider-cancelled') {
        // 취소는 오류가 아니다 — 같은 화면을 유지하고 안내만 한다 (AC-2-08).
        consumeAttempt(store, authScenarioGroup.group, undefined);
        return result(null);
      }

      return run(
        'signInWithProvider',
        'PROVIDER_UNAVAILABLE',
        'That sign-in option is not responding right now.',
        () => result(issueSession()),
      );
    },

    async requestPasswordReset(input: RequestPasswordResetInput) {
      const parsed = parseRequest(RequestPasswordResetInputSchema, input, {
        operation: 'AuthGateway.requestPasswordReset',
      });
      requestLog?.record('AuthGateway.requestPasswordReset', parsed);

      // 성공·실패를 **계정 존재 여부로 구분하지 않는다** (AC-2-09).
      await run(
        'requestPasswordReset',
        'INTERNAL_ERROR',
        'We could not send the email just now.',
        () => undefined,
      );
    },

    async updatePassword(input: UpdatePasswordInput) {
      const parsed = parseRequest(UpdatePasswordInputSchema, input, {
        operation: 'AuthGateway.updatePassword',
      });
      requestLog?.record('AuthGateway.updatePassword', parsed);

      await run(
        'updatePassword',
        // 재설정 링크 만료 (Design Spec §2.5 "This link isn't active anymore").
        'AUTH_TOKEN_EXPIRED',
        'This reset link is no longer active.',
        () => undefined,
      );
    },

    refreshSession() {
      requestLog?.record('AuthGateway.refreshSession');

      if (session === null) return Promise.resolve(null);

      // `error` 에서는 갱신이 불가능하다 → 호출자가 signOut 으로 정리한다 (AC-2-07 2회 실패 경로).
      if (store.resolve(authScenarioGroup) === 'error') return Promise.resolve(null);

      return Promise.resolve(issueSession());
    },

    signOut() {
      requestLog?.record('AuthGateway.signOut');
      publish(null);
      return Promise.resolve();
    },
  };
}
