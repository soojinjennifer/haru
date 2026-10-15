/**
 * **Adapter 선택 지점 (1곳)** — Plan §5.2 · §16 D-6 · `.claude/rules/architecture.md` §4.
 *
 * 저장소 전체에서 `Mock*` 과 `Http*` 중 무엇을 쓸지 정하는 곳은 이 파일 하나다.
 * Component · Page · Feature · Query hook 은 절대 분기하지 않는다 (AC-1-12 · AC-2-06).
 *
 * Stage 2-AUTH 부터는 **`AuthGateway` 도 같은 지점에서** 고른다. Gateway 는 HTTP API 가
 * 아니지만(ARCHITECTURE §7.2) "선택 지점 한 곳" 규칙은 동일하다. 두 Adapter 를 **한 번에**
 * 만드는 이유는 `mock` 모드에서 scenario store · 요청 로그를 공유해야 하기 때문이다.
 *
 * ── `import.meta.env.VITE_API_MODE` 를 여기에서 **인라인으로** 비교하는 이유 ──
 * `vite.config.ts` 가 빌드마다 이 자리에 문자열 리터럴을 고정한다.
 * `http` 빌드에서는 `"http" === 'mock'` 이 되어 아래 `await import('../../mocks')` 가
 * 도달 불가능해지고, Rollup 이 `src/mocks/**` 전체를 산출물에서 제거한다.
 * 비교를 상수나 함수 뒤로 감추면 이 제거가 보장되지 않는다 (AC-1-42 / `pnpm assert:no-mocks`).
 */
import { createHttpApiClients } from '../../shared/api/http';
import type { ApiClients } from '../../shared/api/types';
import { createUnavailableAuthGateway, type AuthGateway } from '../../shared/auth';
import { createSystemClock } from '../../shared/lib/clock';
import { env } from '../../shared/lib/env';
import {
  createWebPushPermissionPort,
  type PushPermissionPort,
} from '../../shared/platform/push-permission';

export interface AppAdapters {
  clients: ApiClients;
  authGateway: AuthGateway;
  /**
   * Stage 4 (이월 `QA-3-001`, `D-16`) — push 권한 포트. `mock` = Mock 포트(scenario `push:*`),
   * `http` = Web 구현(`Notification` API 까지만). Native 는 후속 `S4N-D` 가 여기에 한 줄 추가한다.
   */
  pushPermission: PushPermissionPort;
}

export async function resolveAdapters(): Promise<AppAdapters> {
  if (import.meta.env.VITE_API_MODE === 'mock') {
    const { createBrowserMockApiClients } = await import('../../mocks');
    // 세 번째 인자 = **기기** 시계 (Mock 서버 시계가 아니다) — `offline-cached-card` 캐시 seed 가 쓴다.
    const bundle = createBrowserMockApiClients(env.mockScenario, undefined, createSystemClock());

    return {
      clients: bundle.clients,
      authGateway: bundle.authGateway,
      pushPermission: bundle.pushPermission,
    };
  }

  return {
    clients: createHttpApiClients({ baseUrl: env.apiBaseUrl }),
    // 실제 인증 Adapter 는 아직 없다 (#27) — 조용히 성공하지 않고 명시적으로 실패한다.
    authGateway: createUnavailableAuthGateway(),
    pushPermission: createWebPushPermissionPort(),
  };
}
