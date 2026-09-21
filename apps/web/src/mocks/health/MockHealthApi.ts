/**
 * `MockHealthApi` — `healthApi` 의 Mock Adapter. **Stage 1 의 레퍼런스 구현**이다 (Plan §16 D-8).
 *
 * 다른 도메인 Mock 은 이 파일의 형태를 따른다:
 * 1. 그룹 scenario 정의(`ScenarioGroupDefinition`)를 선언한다 — key 는 API_CONTRACTS §5.4 만.
 * 2. 공통 helper(`withDelay` · `buildErrorEnvelope` · `parseResponse`)만 쓰고 도메인 로직만 갖는다.
 * 3. 시간·ID·지연은 전부 주입받는다 (`clock` · `idFactory` · `timer`) — `Date.now()` ·
 *    `Math.random()` · `setTimeout` 을 직접 호출하지 않는다 (AC-1-39).
 * 4. 성공 응답은 fixture → contracts parse, 오류는 contracts Error Envelope → `HaruApiError`.
 *
 * health scenario (Plan §8.1 — `empty` 는 health 에 적용하지 않는다)
 * | key       | 동작                                             |
 * |-----------|--------------------------------------------------|
 * | `success` | 성공 fixture                                      |
 * | `loading` | 주입 timer 로 지연 후 성공                        |
 * | `error`   | `INTERNAL_ERROR` Error Envelope                   |
 * | `retry`   | 1회차 `INTERNAL_ERROR` → 2회차부터 성공           |
 * | `offline` | `NetworkError` throw (Error Envelope 없음)        |
 */
import { HaruApiError, HealthResponseSchema } from '@haru/contracts';

import type { ApiRequestOptions, HealthApi } from '../../shared/api/health-api';
import {
  buildErrorEnvelope,
  NetworkError,
  parseResponse,
  withDelay,
  type Timer,
} from '../../shared/api/helpers';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import { createHealthResponseFixture } from '../fixtures/health';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const HEALTH_SCENARIO_KEYS = ['success', 'loading', 'error', 'retry', 'offline'] as const;

export type HealthScenarioKey = (typeof HEALTH_SCENARIO_KEYS)[number];

export const healthScenarioGroup: ScenarioGroupDefinition<HealthScenarioKey> = {
  group: 'health',
  keys: HEALTH_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** `loading` scenario 의 지연 (Catalogue §5.4 "1.5–3s"). 실제 대기는 주입 timer 가 결정한다. */
export const HEALTH_LOADING_DELAY_MS = 1_500;

const OPERATION = 'GET /v1/health';

export interface MockHealthApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
}

export function createMockHealthApi(deps: MockHealthApiDeps): HealthApi {
  const { store, clock, idFactory, timer } = deps;

  function success(): ReturnType<typeof createHealthResponseFixture> {
    // Mock 도 Http 와 동일하게 경계에서 parse 한다 (Plan §7.3).
    return parseResponse(HealthResponseSchema, createHealthResponseFixture(clock), {
      operation: OPERATION,
      direction: 'response',
    });
  }

  function failure(): never {
    const envelope = buildErrorEnvelope('INTERNAL_ERROR', 'Mock health check failed.', {
      requestId: idFactory.next(),
    });

    throw HaruApiError.fromEnvelope(envelope);
  }

  return {
    async get(options: ApiRequestOptions = {}) {
      const scenario = store.resolve(healthScenarioGroup);
      // 취소된 요청은 시도로 세지 않는다 — `retry` 1회차가 조용히 소비되지 않게 한다.
      const attempt = consumeAttempt(store, healthScenarioGroup.group, options.signal);

      switch (scenario) {
        case 'success':
          return success();

        case 'loading':
          return withDelay(timer, HEALTH_LOADING_DELAY_MS, success, options.signal);

        case 'error':
          return failure();

        case 'retry':
          // 1회차만 실패하고 이후에는 성공한다 (재시도 UX 검증 — Catalogue §5.4 `retry`).
          return attempt === 1 ? failure() : success();

        case 'offline':
          // 전송 자체가 실패한 상태. Error Envelope 이 존재하지 않는다.
          throw new NetworkError('Mock adapter is offline.');
      }
    },
  };
}
