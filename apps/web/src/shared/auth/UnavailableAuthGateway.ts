/**
 * `http` 빌드용 자리 표시 Gateway — **BACKEND_INTEGRATION_PENDING**.
 *
 * 승인 #27 에 따라 Stage 1–8 에서는 Supabase JS Client 를 쓰지 않는다. 따라서 `http` 모드에는
 * 실제 인증 Adapter 가 없다. 조용히 성공한 척하지 않고 **명시적으로 `PROVIDER_UNAVAILABLE`**
 * 을 던져, 연동 전 빌드에서 인증이 동작하는 것처럼 보이는 일을 막는다.
 *
 * 실제 Adapter(`SupabaseWebAuthGateway`)는 Backend 연동 시점 또는 사용자 승인 후 추가한다.
 */
import { HaruApiError } from '@haru/contracts';

import { buildErrorEnvelope } from '../api/helpers';

import type { AuthGateway } from './AuthGateway';

function unavailable(): never {
  throw HaruApiError.fromEnvelope(
    buildErrorEnvelope(
      'PROVIDER_UNAVAILABLE',
      'No authentication provider is wired up in this build.',
    ),
  );
}

export function createUnavailableAuthGateway(): AuthGateway {
  return {
    getSession: () => Promise.resolve(null),
    onChange: (listener) => {
      listener(null);
      return () => undefined;
    },
    signUpWithEmail: () => unavailable(),
    signInWithEmail: () => unavailable(),
    signInWithProvider: () => unavailable(),
    requestPasswordReset: () => unavailable(),
    updatePassword: () => unavailable(),
    refreshSession: () => Promise.resolve(null),
    signOut: () => Promise.resolve(),
  };
}
