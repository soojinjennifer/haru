/**
 * `AUTH_TOKEN_EXPIRED` 1회 refresh 후 재시도 — ARCHITECTURE §7.2, AC-2-07.
 *
 * 순수 함수다(React·Router 의존 없음). 그래서 Query hook 없이 단위 테스트할 수 있다.
 *
 * 규칙
 * 1. 첫 호출이 `AUTH_TOKEN_EXPIRED` 로 실패하면 `refresh()` 를 **1회** 호출한다.
 * 2. refresh 가 세션을 돌려주면 동작을 **한 번만** 다시 실행한다.
 * 3. 재시도도 `AUTH_TOKEN_EXPIRED` 면 `signOut()` + `onSessionLost()` 후 오류를 그대로 던진다.
 * 4. 다른 오류 코드는 건드리지 않는다 (재시도하지 않는다).
 */
import type { AuthSession } from '@haru/contracts';

import { isHaruApiError } from '../api/helpers';

export interface AuthRefreshDeps {
  refresh: () => Promise<AuthSession | null>;
  signOut: () => Promise<void>;
  /** 세션을 완전히 잃었을 때 (로그인 화면 이동 · 안내 Toast). */
  onSessionLost?: (() => void) | undefined;
}

function isTokenExpired(error: unknown): boolean {
  return isHaruApiError(error) && error.code === 'AUTH_TOKEN_EXPIRED';
}

export async function withAuthRefresh<T>(run: () => Promise<T>, deps: AuthRefreshDeps): Promise<T> {
  try {
    return await run();
  } catch (error: unknown) {
    if (!isTokenExpired(error)) throw error;

    const refreshed = await deps.refresh();

    if (refreshed === null) {
      await deps.signOut();
      deps.onSessionLost?.();
      throw error;
    }

    try {
      return await run();
    } catch (retryError: unknown) {
      if (isTokenExpired(retryError)) {
        // 2회 실패 — 세션을 신뢰할 수 없다. 정리하고 로그인 화면으로 보낸다.
        await deps.signOut();
        deps.onSessionLost?.();
      }

      throw retryError;
    }
  }
}
