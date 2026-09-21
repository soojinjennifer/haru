/**
 * `health` fixture — `.claude/rules/frontend.md` §5 "fixture 는 `mocks/` 에만 둔다".
 *
 * Component · Page · Feature 안에 이 값을 하드코딩하지 않는다 (AC-1-41).
 * 값은 주입된 `clock` 에서만 나온다 — 같은 scenario 는 항상 같은 응답 바이트다 (AC-1-39).
 * 아동 데이터는 없다 (health 는 데이터 저장을 요구하지 않는다 — Plan §6).
 */
import { HealthResponseSchema, type HealthResponse } from '@haru/contracts';

import type { Clock } from '../../shared/lib/clock';

/** Mock 서버가 보고하는 버전 문자열. 실제 배포 버전이 아님을 이름에서 드러낸다. */
export const MOCK_API_VERSION = '0.0.0-mock';

export function createHealthResponseFixture(clock: Clock): HealthResponse {
  // Mock 응답도 contracts schema 를 통과해야 한다 (API_CONTRACTS §5.4 "fixture drift 방지").
  return HealthResponseSchema.parse({
    status: 'ok',
    version: MOCK_API_VERSION,
    serverTime: clock.nowIso(),
  });
}
