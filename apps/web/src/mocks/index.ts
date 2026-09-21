/**
 * Mock Adapter 집합 — **`http` 빌드에서 완전히 제거되어야 하는 모듈 그래프의 뿌리** (Plan §16 D-6).
 *
 * `app/providers/apiClients.ts` 가 `import.meta.env.VITE_API_MODE === 'mock'` 일 때만
 * 이 모듈을 동적 import 한다. `http` 빌드에서는 그 비교가 `"http" === "mock"` 으로
 * 상수 접혀 도달 불가능해지고, Rollup 이 `src/mocks/**` 전체를 산출물에서 지운다.
 *
 * 아래 sentinel 은 그 사실을 **기계적으로** 증명하기 위한 표식이다.
 * `pnpm assert:no-mocks` 가 `apps/web/dist/**` 에서 이 문자열을 찾아 1건이라도 나오면 실패한다
 * (AC-1-42).
 */
import { createRealTimer, type Timer } from '../shared/api/helpers';
import type { ApiClients } from '../shared/api/types';
import { createFixedClock, type Clock } from '../shared/lib/clock';
import { createSeededIdFactory, type IdFactory } from '../shared/lib/idFactory';

import { createMockHealthApi } from './health/MockHealthApi';
import {
  createScenarioStoreFrom,
  readScenarioPanelValue,
  type ScenarioStore,
  type ScenarioStoreInput,
} from './scenarios';

/** 빌드 산출물 검증용 표식 (`scripts/assert-no-mocks.mjs`). 값을 바꾸면 스크립트도 함께 바꾼다. */
export const __HARU_MOCK_SENTINEL__ = '__HARU_MOCK_SENTINEL__';

/**
 * Mock 의 고정 기준 시각 — 2026-01-01T00:00:00Z.
 * 모든 fixture 시각이 여기에서 나오므로 응답 바이트가 실행 시점과 무관하게 같다.
 */
export const MOCK_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

/** `idFactory` seed. scenario 와 무관하게 호출 순서만으로 ID 가 결정된다. */
export const MOCK_ID_SEED = 'haru-mock';

export interface MockApiClientsOptions extends ScenarioStoreInput {
  /** 이미 만들어진 store 를 주입한다 (테스트에서 scenario 를 직접 지정할 때). */
  store?: ScenarioStore;
  clock?: Clock;
  idFactory?: IdFactory;
  /** 기본은 실제 지연(`createRealTimer`). 테스트는 `createImmediateTimer()` 를 넣는다. */
  timer?: Timer;
}

export interface MockApiClientsBundle {
  clients: ApiClients;
  store: ScenarioStore;
  /**
   * sentinel 을 **실제로 사용하는** 자리. 이 참조가 없으면 Rollup 이
   * `mock` 빌드에서도 상수를 tree-shaking 으로 지워 버려서
   * `pnpm assert:no-mocks` 가 무엇도 검출하지 못하는 헛된 검사가 된다.
   */
  sentinel: string;
}

/** Adapter 집합 + store 를 함께 만든다 (dev Scenario Panel 이 store 를 필요로 한다). */
export function createMockApiClientsBundle(
  options: MockApiClientsOptions = {},
): MockApiClientsBundle {
  const store =
    options.store ??
    createScenarioStoreFrom({
      search: options.search,
      panelValue: options.panelValue,
      envValue: options.envValue,
    });

  const clock = options.clock ?? createFixedClock(MOCK_EPOCH_MS);
  const idFactory = options.idFactory ?? createSeededIdFactory(MOCK_ID_SEED);
  const timer = options.timer ?? createRealTimer();

  return {
    store,
    sentinel: __HARU_MOCK_SENTINEL__,
    clients: {
      health: createMockHealthApi({ store, clock, idFactory, timer }),
    },
  };
}

export function createMockApiClients(options: MockApiClientsOptions = {}): ApiClients {
  return createMockApiClientsBundle(options).clients;
}

/** 브라우저 환경(URL · sessionStorage · 빌드 기본값)에서 Mock 을 조립한다. */
export function createBrowserMockApiClients(envValue: string | undefined): MockApiClientsBundle {
  return createMockApiClientsBundle({
    search: globalThis.location?.search ?? '',
    panelValue: readScenarioPanelValue(),
    envValue,
  });
}

export {
  createMockHealthApi,
  healthScenarioGroup,
  HEALTH_SCENARIO_KEYS,
  HEALTH_LOADING_DELAY_MS,
} from './health/MockHealthApi';
export type { HealthScenarioKey } from './health/MockHealthApi';
export { createHealthResponseFixture, MOCK_API_VERSION } from './fixtures/health';
export * from './scenarios';
