/**
 * Scenario store — 3계층 우선순위 해석 + 그룹별 호출 횟수 (Plan §16 D-5).
 *
 * 우선순위: **URL query > dev Scenario Panel(session) > `VITE_MOCK_SCENARIO` > `success`**
 * 한 계층 안에서는 **메서드 지정(`library.savebook:error`) > 그룹 지정(`health:error`) > wildcard(`error`)**.
 * 계층은 위에서부터 훑되, 해당 그룹(또는 그 메서드)을 언급한 **첫 계층**에서 결정이 끝난다.
 *
 * 결정성: store 는 시간·난수를 쓰지 않는다. `retry` 처럼 호출 순서에 따라 달라지는
 * scenario 를 위해 그룹별 attempt 카운터만 갖고, 같은 순서의 호출은 항상 같은 결과를 낸다.
 */
import { logger } from '../../shared/lib/logger';

import { parseScenarioParam, parseScenarioSearch } from './scenario-url';
import {
  DEFAULT_SCENARIO_KEY,
  methodScope,
  type ScenarioGroupDefinition,
  type ScenarioSource,
} from './types';

/** 결정된 key 가 **어느 표기**에서 왔는지. 메서드 override 여부를 구분해야 하는 Mock 이 쓴다. */
export type ScenarioScope = 'method' | 'group' | 'wildcard' | 'default';

export interface ScopedScenario<TKey extends string> {
  readonly key: TKey;
  readonly scope: ScenarioScope;
}

/** dev Scenario Panel(Stage 1-G)이 쓰는 sessionStorage 키. */
export const SCENARIO_SESSION_KEY = 'haru:scenario';

export interface ScenarioStore {
  /**
   * 그룹의 현재 scenario key. 목록에 없는 값은 그룹 기본값으로 떨어진다.
   * `method` 를 주면 `group.method` 지정이 그룹 지정보다 먼저다 (메서드 단위 override).
   */
  resolve<TKey extends string>(definition: ScenarioGroupDefinition<TKey>, method?: string): TKey;
  /** `resolve` 와 같지만 결정된 표기(`method`·`group`·`wildcard`·`default`)도 돌려준다. */
  resolveScoped<TKey extends string>(
    definition: ScenarioGroupDefinition<TKey>,
    method?: string,
  ): ScopedScenario<TKey>;
  /** 그룹의 n번째 호출인지 (1부터). `retry` scenario 가 쓴다. */
  nextAttempt(group: string): number;
  /**
   * 소비한 시도를 되돌린다 — **취소된 요청은 시도로 세지 않는다.**
   * (React StrictMode 이중 마운트나 화면 이탈로 in-flight 요청이 취소되면
   *  `retry` scenario 의 1회차가 조용히 소비돼 "실패 → 재시도 성공" 이 관찰되지 않는다.)
   */
  releaseAttempt(group: string): void;
  /** 지금까지의 호출 횟수 (증가시키지 않음). */
  attemptCount(group: string): number;
  /** attempt 카운터 초기화 — 테스트·dev 패널 전환에서 쓴다. */
  reset(): void;
  /** 우선순위 계층 (디버깅·테스트 확인용). */
  readonly sources: readonly ScenarioSource[];
}

/** 계층 목록(우선순위 순)으로 store 를 만든다. */
export function createScenarioStore(sources: readonly ScenarioSource[]): ScenarioStore {
  const attempts = new Map<string, number>();

  function resolveKey(
    group: string,
    method: string | undefined,
  ): { key: string; scope: ScenarioScope } | undefined {
    const scoped = method === undefined ? undefined : methodScope(group, method);

    for (const source of sources) {
      if (scoped !== undefined) {
        const byMethod = source.explicit[scoped];
        if (byMethod !== undefined) return { key: byMethod, scope: 'method' };
      }
      const explicit = source.explicit[group];
      if (explicit !== undefined) return { key: explicit, scope: 'group' };
      if (source.wildcard !== undefined) return { key: source.wildcard, scope: 'wildcard' };
    }

    return undefined;
  }

  function resolveScoped<TKey extends string>(
    definition: ScenarioGroupDefinition<TKey>,
    method?: string,
  ): ScopedScenario<TKey> {
    const requested = resolveKey(definition.group, method) ?? {
      key: DEFAULT_SCENARIO_KEY,
      scope: 'default' as const,
    };
    const match = definition.keys.find((key) => key === requested.key);

    if (match === undefined) {
      // Catalogue(§5.4) 밖의 key 이거나 이 그룹에 적용되지 않는 key.
      logger.warn('mock_scenario_unknown_key', { scenario: definition.group });
      return { key: definition.defaultKey, scope: 'default' };
    }

    return { key: match, scope: requested.scope };
  }

  return {
    sources,

    resolve<TKey extends string>(definition: ScenarioGroupDefinition<TKey>, method?: string): TKey {
      return resolveScoped(definition, method).key;
    },

    resolveScoped,

    nextAttempt(group: string): number {
      const next = (attempts.get(group) ?? 0) + 1;
      attempts.set(group, next);
      return next;
    },

    releaseAttempt(group: string): void {
      const current = attempts.get(group) ?? 0;
      attempts.set(group, Math.max(0, current - 1));
    },

    attemptCount(group: string): number {
      return attempts.get(group) ?? 0;
    },

    reset(): void {
      attempts.clear();
    },
  };
}

/**
 * 시도를 하나 소비하되, 그 요청이 **취소되면 되돌린다**.
 *
 * 도메인 Mock 은 이 helper 만 쓰고 카운터를 직접 만지지 않는다 (API_CONTRACTS §5.2 "중복 방지").
 * 취소는 요청이 진행 중일 때만 일어나므로(TanStack Query 는 settle 된 query 를 abort 하지 않는다)
 * 성공적으로 전달된 응답의 시도가 뒤늦게 취소되어 되돌아가는 일은 없다.
 */
export function consumeAttempt(
  store: ScenarioStore,
  group: string,
  signal: AbortSignal | undefined,
): number {
  const attempt = store.nextAttempt(group);

  if (signal !== undefined && !signal.aborted) {
    signal.addEventListener(
      'abort',
      () => {
        store.releaseAttempt(group);
      },
      { once: true },
    );
  }

  return attempt;
}

/**
 * 한 호출의 scenario 와 시도 번호를 함께 정한다 (Stage 4 `S4-C` 신규 Mock 의 공통 진입점).
 *
 * - scenario 는 **메서드 override 를 먼저** 본다 (`resolve(definition, method)`).
 * - 시도 카운터는 **메서드 단위**(`group.method`)다. 한 그룹에 메서드가 여럿인 Stage 4 그룹
 *   (sessions: create/transition/detail …)에서 그룹 단위로 세면, `retry` 의 1회차 실패를
 *   **다른 메서드가 먼저 소비**해 "실패 → 재시도 성공" 이 관찰되지 않는다.
 *   Stage 1–3 Mock 은 그룹 단위 카운터를 그대로 쓴다 (동작 불변).
 */
export function beginScenarioCall<TKey extends string>(
  store: ScenarioStore,
  definition: ScenarioGroupDefinition<TKey>,
  method: string,
  signal: AbortSignal | undefined,
): { scenario: TKey; attempt: number } {
  const scenario = store.resolve(definition, method);
  const attempt = consumeAttempt(store, methodScope(definition.group, method), signal);
  return { scenario, attempt };
}

export interface ScenarioStoreInput {
  /** `location.search` (1순위) */
  search?: string | undefined;
  /** dev Scenario Panel 이 sessionStorage 에 넣은 값 (2순위) */
  panelValue?: string | null | undefined;
  /** `VITE_MOCK_SCENARIO` 빌드 기본값 (3순위) */
  envValue?: string | null | undefined;
}

/** 3계층 입력에서 store 를 만든다. 값이 하나도 없으면 전 그룹이 `success` 다. */
export function createScenarioStoreFrom(input: ScenarioStoreInput): ScenarioStore {
  return createScenarioStore([
    parseScenarioSearch(input.search ?? ''),
    parseScenarioParam(input.panelValue, 'panel'),
    parseScenarioParam(input.envValue, 'env'),
  ]);
}

/** 브라우저에서 dev 패널 값이 있으면 읽는다. 없거나 접근 불가면 `undefined`. */
export function readScenarioPanelValue(storage?: Storage | undefined): string | undefined {
  const target = storage ?? globalThis.sessionStorage;

  try {
    return target?.getItem(SCENARIO_SESSION_KEY) ?? undefined;
  } catch {
    // Safari private mode 등에서 sessionStorage 접근이 막힐 수 있다.
    return undefined;
  }
}
