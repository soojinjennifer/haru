/**
 * **Adapter 선택 지점 (1곳)** — Plan §5.2 · §16 D-6 · `.claude/rules/architecture.md` §4.
 *
 * 저장소 전체에서 `Mock*` 과 `Http*` 중 무엇을 쓸지 정하는 곳은 이 파일 하나다.
 * Component · Page · Feature · Query hook 은 절대 분기하지 않는다 (AC-1-12).
 *
 * ── `import.meta.env.VITE_API_MODE` 를 여기에서 **인라인으로** 비교하는 이유 ──
 * `vite.config.ts` 가 빌드마다 이 자리에 문자열 리터럴을 고정한다.
 * `http` 빌드에서는 `"http" === 'mock'` 이 되어 아래 `await import('../../mocks')` 가
 * 도달 불가능해지고, Rollup 이 `src/mocks/**` 전체를 산출물에서 제거한다.
 * 비교를 상수나 함수 뒤로 감추면 이 제거가 보장되지 않는다 (AC-1-42 / `pnpm assert:no-mocks`).
 */
import { createHttpApiClients } from '../../shared/api/http';
import type { ApiClients } from '../../shared/api/types';
import { env } from '../../shared/lib/env';

export async function resolveApiClients(): Promise<ApiClients> {
  if (import.meta.env.VITE_API_MODE === 'mock') {
    const { createBrowserMockApiClients } = await import('../../mocks');
    return createBrowserMockApiClients(env.mockScenario).clients;
  }

  return createHttpApiClients({ baseUrl: env.apiBaseUrl });
}
