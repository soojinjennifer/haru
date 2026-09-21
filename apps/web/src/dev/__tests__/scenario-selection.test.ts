/**
 * Scenario Panel 로직 — 우선순위 해석 · 직렬화 · URL 동기화 (Plan §16 D-5 ②).
 *
 * 패널이 보여 주는 값과 Mock 이 실제로 쓰는 값이 **같은 해석기**에서 나오는지 확인한다.
 */
import { describe, expect, it } from 'vitest';

import { healthScenarioGroup } from '../../mocks/health/MockHealthApi';
import { SCENARIO_SESSION_KEY } from '../../mocks/scenarios';
import { DEV_SCENARIO_GROUPS, statesScenarioGroup } from '../scenario-panel/devScenarios';
import {
  persistSelection,
  resolveSelection,
  serializeSelection,
  withGroupKey,
  withScenarioParam,
} from '../scenario-panel/scenario-selection';

describe('resolveSelection — 우선순위 (URL > panel > env > success)', () => {
  it('아무것도 없으면 전 그룹이 기본값이다', () => {
    expect(resolveSelection(DEV_SCENARIO_GROUPS, {})).toStrictEqual({
      health: 'success',
      __states: 'success',
    });
  });

  it('URL 이 패널·env 를 이긴다', () => {
    const selection = resolveSelection(DEV_SCENARIO_GROUPS, {
      search: '?scenario=health:error',
      panelValue: 'health:loading',
      envValue: 'health:offline',
    });

    expect(selection['health']).toBe('error');
  });

  it('패널 값이 env 를 이긴다', () => {
    const selection = resolveSelection(DEV_SCENARIO_GROUPS, {
      panelValue: 'health:loading',
      envValue: 'health:offline',
    });

    expect(selection['health']).toBe('loading');
  });

  it('그룹을 생략한 wildcard 는 전 그룹에 적용된다', () => {
    expect(resolveSelection(DEV_SCENARIO_GROUPS, { search: '?scenario=error' })).toStrictEqual({
      health: 'error',
      __states: 'error',
    });
  });

  it('그룹별 다중 지정을 함께 해석한다', () => {
    const selection = resolveSelection(DEV_SCENARIO_GROUPS, {
      search: '?scenario=health:retry,__states:empty',
    });

    expect(selection).toStrictEqual({ health: 'retry', __states: 'empty' });
  });

  it('그룹에 없는 key 는 그룹 기본값으로 떨어진다 (health 에는 empty 가 없다)', () => {
    const selection = resolveSelection(DEV_SCENARIO_GROUPS, { search: '?scenario=empty' });

    expect(selection['health']).toBe('success');
    expect(selection['__states']).toBe('empty');
  });
});

describe('serializeSelection / withGroupKey', () => {
  it('선택을 group:key 목록으로 직렬화한다', () => {
    expect(serializeSelection({ health: 'error', __states: 'empty' })).toBe(
      'health:error,__states:empty',
    );
  });

  it('한 그룹만 바꾼 새 선택을 만든다 (원본 불변)', () => {
    const before = { health: 'success', __states: 'success' };
    const after = withGroupKey(before, 'health', 'offline');

    expect(after).toStrictEqual({ health: 'offline', __states: 'success' });
    expect(before['health']).toBe('success');
  });

  it('직렬화 → 재해석이 같은 선택을 만든다 (URL 공유 재현성)', () => {
    const selection = { health: 'retry', __states: 'error' };
    const restored = resolveSelection(DEV_SCENARIO_GROUPS, {
      search: `?scenario=${serializeSelection(selection)}`,
    });

    expect(restored).toStrictEqual(selection);
  });
});

describe('withScenarioParam', () => {
  it('scenario 파라미터를 설정한다', () => {
    expect(withScenarioParam('https://x.invalid/__dev/ui/states', 'health:error')).toBe(
      'https://x.invalid/__dev/ui/states?scenario=health%3Aerror',
    );
  });

  it('기존 값을 덮어쓴다', () => {
    expect(withScenarioParam('https://x.invalid/?scenario=health%3Aerror', 'health:success')).toBe(
      'https://x.invalid/?scenario=health%3Asuccess',
    );
  });

  it('빈 값이면 파라미터를 제거한다 (reset)', () => {
    expect(withScenarioParam('https://x.invalid/?scenario=health%3Aerror&a=1', '')).toBe(
      'https://x.invalid/?a=1',
    );
  });

  it('다른 쿼리 파라미터는 건드리지 않는다', () => {
    expect(withScenarioParam('https://x.invalid/?a=1', 'health:error')).toContain('a=1');
  });
});

describe('persistSelection', () => {
  function createStorage(): Storage {
    const map = new Map<string, string>();

    return {
      get length() {
        return map.size;
      },
      clear: () => {
        map.clear();
      },
      getItem: (key: string) => map.get(key) ?? null,
      key: (index: number) => Array.from(map.keys())[index] ?? null,
      removeItem: (key: string) => {
        map.delete(key);
      },
      setItem: (key: string, value: string) => {
        map.set(key, value);
      },
    };
  }

  it('선택을 sessionStorage 에 기록한다', () => {
    const storage = createStorage();
    persistSelection('health:error', storage);

    expect(storage.getItem(SCENARIO_SESSION_KEY)).toBe('health:error');
  });

  it('빈 값이면 키를 지운다', () => {
    const storage = createStorage();
    storage.setItem(SCENARIO_SESSION_KEY, 'health:error');
    persistSelection('', storage);

    expect(storage.getItem(SCENARIO_SESSION_KEY)).toBeNull();
  });

  it('저장소 접근이 막혀도 예외를 던지지 않는다', () => {
    const blocked = {
      ...createStorage(),
      setItem: () => {
        throw new Error('blocked');
      },
    } as Storage;

    expect(() => {
      persistSelection('health:error', blocked);
    }).not.toThrow();
  });
});

describe('DEV_SCENARIO_GROUPS — Catalogue 준수 (AC-1-40)', () => {
  /** `docs/API_CONTRACTS.md` §5.4 machine key 중 Stage 1 에서 쓰는 것. */
  const CATALOGUE_STAGE_1 = ['success', 'loading', 'empty', 'error', 'retry', 'offline'];

  it('패널이 다루는 그룹은 health 와 __states 다', () => {
    expect(DEV_SCENARIO_GROUPS.map((group) => group.group)).toStrictEqual(['health', '__states']);
  });

  it('모든 key 가 Catalogue machine key 다 (deprecated alias 없음)', () => {
    for (const group of DEV_SCENARIO_GROUPS) {
      for (const key of group.keys) {
        expect(CATALOGUE_STAGE_1).toContain(key);
      }
    }
  });

  it('health 그룹에는 empty 가 없고 __states 그룹에는 있다 (Plan §8.1 ④)', () => {
    expect(healthScenarioGroup.keys).not.toContain('empty');
    expect(statesScenarioGroup.keys).toContain('empty');
  });
});
