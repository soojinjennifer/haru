import { describe, expect, it } from 'vitest';

import { healthScenarioGroup } from '../health/MockHealthApi';
import {
  createScenarioStore,
  createScenarioStoreFrom,
  readScenarioPanelValue,
  SCENARIO_SESSION_KEY,
} from '../scenarios/scenario-store';
import { parseScenarioParam } from '../scenarios/scenario-url';

function resolveHealth(input: Parameters<typeof createScenarioStoreFrom>[0]): string {
  return createScenarioStoreFrom(input).resolve(healthScenarioGroup);
}

describe('scenario store — 3계층 우선순위 (Plan §16 D-5)', () => {
  it('아무 것도 없으면 success 다', () => {
    expect(resolveHealth({})).toBe('success');
  });

  it('URL > dev 패널 > VITE_MOCK_SCENARIO 순서다', () => {
    expect(
      resolveHealth({
        search: '?scenario=health:offline',
        panelValue: 'health:loading',
        envValue: 'health:error',
      }),
    ).toBe('offline');

    expect(resolveHealth({ panelValue: 'health:loading', envValue: 'health:error' })).toBe(
      'loading',
    );

    expect(resolveHealth({ envValue: 'health:error' })).toBe('error');
  });

  it('한 계층 안에서는 그룹 지정이 wildcard 를 이긴다', () => {
    expect(resolveHealth({ search: '?scenario=error,health:retry' })).toBe('retry');
  });

  it('상위 계층의 wildcard 가 하위 계층의 그룹 지정을 덮는다', () => {
    // URL 이 전 그룹을 지정했으면 그 지정이 끝이다 (재현 URL 공유 시 혼동 방지).
    expect(resolveHealth({ search: '?scenario=error', envValue: 'health:success' })).toBe('error');
  });

  it('그룹에 없는 key 는 그룹 기본값으로 떨어진다', () => {
    expect(resolveHealth({ search: '?scenario=health:empty' })).toBe('success');
    expect(resolveHealth({ search: '?scenario=analysis-pending' })).toBe('success');
  });

  it('다른 그룹 지정은 health 에 영향을 주지 않는다', () => {
    expect(resolveHealth({ search: '?scenario=__states:empty' })).toBe('success');
  });
});

describe('scenario store — attempt 카운터 (retry scenario 용)', () => {
  it('그룹별로 1부터 증가한다', () => {
    const store = createScenarioStore([parseScenarioParam('health:retry', 'url')]);

    expect(store.attemptCount('health')).toBe(0);
    expect(store.nextAttempt('health')).toBe(1);
    expect(store.nextAttempt('health')).toBe(2);
    expect(store.nextAttempt('other')).toBe(1);
    expect(store.attemptCount('health')).toBe(2);
  });

  it('reset 하면 같은 순서가 그대로 재현된다 (결정성)', () => {
    const store = createScenarioStore([parseScenarioParam('health:retry', 'url')]);

    store.nextAttempt('health');
    store.nextAttempt('health');
    store.reset();

    expect(store.nextAttempt('health')).toBe(1);
  });
});

describe('readScenarioPanelValue', () => {
  it('sessionStorage 값을 읽는다', () => {
    const storage = {
      getItem: (key: string) => (key === SCENARIO_SESSION_KEY ? 'health:error' : null),
    } as Storage;

    expect(readScenarioPanelValue(storage)).toBe('health:error');
  });

  it('접근이 막히면 undefined 다 (private mode)', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
    } as unknown as Storage;

    expect(readScenarioPanelValue(storage)).toBeUndefined();
  });
});
