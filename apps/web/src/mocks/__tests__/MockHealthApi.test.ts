import { ErrorEnvelopeSchema, HealthResponseSchema, type HaruApiError } from '@haru/contracts';
import { describe, expect, it, vi } from 'vitest';

import { createImmediateTimer, isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import type { HealthApi } from '../../shared/api/health-api';
import { MOCK_API_VERSION } from '../fixtures/health';
import {
  HEALTH_LOADING_DELAY_MS,
  HEALTH_SCENARIO_KEYS,
  healthScenarioGroup,
  type HealthScenarioKey,
} from '../health/MockHealthApi';
import { createMockApiClients, MOCK_EPOCH_MS } from '../index';

function healthApi(scenario: HealthScenarioKey, options: { realTimer?: boolean } = {}): HealthApi {
  return createMockApiClients({
    search: `?scenario=health:${scenario}`,
    ...(options.realTimer === true ? {} : { timer: createImmediateTimer() }),
  }).health;
}

describe('MockHealthApi — scenario 5종 (Plan §8.1)', () => {
  it('Catalogue(§5.4) 의 machine key 만 쓴다 — deprecated alias 없음', () => {
    expect(HEALTH_SCENARIO_KEYS).toStrictEqual(['success', 'loading', 'error', 'retry', 'offline']);
    expect(healthScenarioGroup.group).toBe('health');
    expect(healthScenarioGroup.defaultKey).toBe('success');
    // `empty` 는 health 에 적용하지 않는다 (Plan §8.1).
    expect(HEALTH_SCENARIO_KEYS).not.toContain('empty');
    for (const alias of ['default', 'slow']) {
      expect(HEALTH_SCENARIO_KEYS).not.toContain(alias);
    }
  });

  it('success — contracts HealthResponse 를 통과하는 응답을 준다', async () => {
    const response = await healthApi('success').get();

    expect(HealthResponseSchema.safeParse(response).success).toBe(true);
    expect(response).toStrictEqual({
      status: 'ok',
      version: MOCK_API_VERSION,
      serverTime: new Date(MOCK_EPOCH_MS).toISOString(),
    });
  });

  it('loading — 주입 timer 로 지연한 뒤 같은 성공 응답을 준다', async () => {
    const response = await healthApi('loading').get();

    expect(HealthResponseSchema.safeParse(response).success).toBe(true);
    expect(response).toStrictEqual(await healthApi('success').get());
  });

  it('loading — 실제 timer 에서는 Catalogue 의 지연(1.5s)을 기다린다', async () => {
    vi.useFakeTimers();

    try {
      const promise = healthApi('loading', { realTimer: true }).get();
      await vi.advanceTimersByTimeAsync(HEALTH_LOADING_DELAY_MS);

      expect(HealthResponseSchema.safeParse(await promise).success).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('error — contracts Error Envelope(INTERNAL_ERROR) 을 던진다', async () => {
    const error = await healthApi('error')
      .get()
      .catch((value: unknown) => value);

    expect(isHaruApiError(error)).toBe(true);

    const apiError = error as HaruApiError;
    expect(apiError.code).toBe('INTERNAL_ERROR');
    expect(apiError.httpStatus).toBe(500);
    expect(ErrorEnvelopeSchema.safeParse(apiError.toEnvelope()).success).toBe(true);
    expect(apiError.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('retry — 1회차 실패 → 2회차부터 성공', async () => {
    const api = healthApi('retry');

    const first = await api.get().catch((value: unknown) => value);
    expect(isHaruApiError(first)).toBe(true);
    expect((first as HaruApiError).code).toBe('INTERNAL_ERROR');

    const second = await api.get();
    expect(HealthResponseSchema.safeParse(second).success).toBe(true);

    const third = await api.get();
    expect(third).toStrictEqual(second);
  });

  it('offline — Error Envelope 이 없는 전송 실패를 던진다', async () => {
    const error = await healthApi('offline')
      .get()
      .catch((value: unknown) => value);

    expect(isNetworkError(error)).toBe(true);
    expect(isHaruApiError(error)).toBe(false);
  });

  it('scenario 를 지정하지 않으면 success 다', async () => {
    const response = await createMockApiClients({ timer: createImmediateTimer() }).health.get();

    expect(HealthResponseSchema.safeParse(response).success).toBe(true);
  });
});

describe('MockHealthApi — 결정성 (AC-1-39)', () => {
  it('같은 scenario 를 2회 호출하면 같은 응답 바이트다', async () => {
    const api = healthApi('success');

    const first = await api.get();
    const second = await api.get();

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('새 Mock 인스턴스도 같은 응답 바이트를 만든다 (실행 시점 무관)', async () => {
    const first = await healthApi('success').get();
    const second = await healthApi('success').get();

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('오류 scenario 도 같은 requestId 수열을 재현한다', async () => {
    const run = async (): Promise<string | undefined> => {
      const error = await healthApi('error')
        .get()
        .catch((value: unknown) => value);
      return (error as HaruApiError).requestId;
    };

    expect(await run()).toBe(await run());
  });

  it('retry scenario 의 실패/성공 순서가 매번 같다', async () => {
    const run = async (): Promise<string[]> => {
      const api = healthApi('retry');
      const results: string[] = [];

      for (let index = 0; index < 3; index += 1) {
        const value = await api.get().catch((error: unknown) => error);
        results.push(isHaruApiError(value) ? `error:${value.code}` : JSON.stringify(value));
      }

      return results;
    };

    expect(await run()).toStrictEqual(await run());
  });
});
