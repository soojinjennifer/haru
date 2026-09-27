/**
 * `auth` fixture — 가상 세션만 만든다.
 *
 * 토큰 문자열은 **누가 봐도 가짜**여야 한다 (실제 JWT 형태를 흉내 내지 않는다).
 * 만료 시각은 주입된 `clock` 에서만 나온다 (AC-2-52 결정성).
 */
import { AuthSessionSchema, type AuthSession } from '@haru/contracts';

import { createFixedClock, type Clock } from '../../shared/lib/clock';

import { MOCK_CAREGIVER_ID } from './me';

/** 한 시간짜리 가상 세션. */
export const MOCK_SESSION_TTL_MS = 60 * 60 * 1000;

export function createAuthSessionFixture(clock: Clock, generation = 1): AuthSession {
  return AuthSessionSchema.parse({
    userId: MOCK_CAREGIVER_ID,
    accessToken: `mock-access-token-${String(generation)}`,
    refreshToken: `mock-refresh-token-${String(generation)}`,
    // `new Date()` 를 Mock 안에서 직접 쓰지 않는다 (AC-1-39) — clock 을 옮겨서 만든다.
    expiresAt: createFixedClock(clock.now() + MOCK_SESSION_TTL_MS).nowIso(),
  });
}
