import { describe, expect, it } from 'vitest';

import {
  parseScenarioParam,
  parseScenarioSearch,
  serializeScenarioSource,
} from '../scenarios/scenario-url';

describe('scenario URL 파서 — 그룹 표기 (Plan §8.3 · §16 D-5)', () => {
  it('`group:key` 를 그룹 지정으로 읽는다', () => {
    const source = parseScenarioParam('health:loading', 'url');

    expect(source.explicit).toStrictEqual({ health: 'loading' });
    expect(source.wildcard).toBeUndefined();
  });

  it('그룹을 생략하면 전 그룹 지정(wildcard)이다', () => {
    const source = parseScenarioParam('loading', 'url');

    expect(source.explicit).toStrictEqual({});
    expect(source.wildcard).toBe('loading');
  });

  it('쉼표로 여러 그룹을 지정한다', () => {
    const source = parseScenarioParam('health:error,__states:empty', 'url');

    expect(source.explicit).toStrictEqual({ health: 'error', __states: 'empty' });
  });

  it('wildcard 와 그룹 지정을 함께 쓸 수 있다', () => {
    const source = parseScenarioParam('success,health:offline', 'url');

    expect(source.wildcard).toBe('success');
    expect(source.explicit).toStrictEqual({ health: 'offline' });
  });

  it('대소문자·공백을 정규화한다', () => {
    expect(parseScenarioParam(' HEALTH : ', 'url').explicit).toStrictEqual({});
    expect(parseScenarioParam(' Health:Loading ', 'url').explicit).toStrictEqual({
      health: 'loading',
    });
  });

  it('형식에 맞지 않는 항목은 버린다 (잘못된 URL 로 앱이 죽지 않는다)', () => {
    const source = parseScenarioParam('health:loading,!!!,:,a:b:c,9bad:key', 'url');

    expect(source.explicit).toStrictEqual({ health: 'loading' });
  });

  it('빈 값은 아무것도 지정하지 않은 것과 같다', () => {
    for (const raw of ['', '   ', null, undefined]) {
      const source = parseScenarioParam(raw, 'url');
      expect(source.explicit).toStrictEqual({});
      expect(source.wildcard).toBeUndefined();
    }
  });

  it('같은 그룹이 반복되면 마지막 지정이 이긴다', () => {
    expect(parseScenarioParam('health:error,health:success', 'url').explicit).toStrictEqual({
      health: 'success',
    });
  });

  it('location.search 문자열에서 읽는다', () => {
    expect(parseScenarioSearch('?scenario=health:retry&other=1').explicit).toStrictEqual({
      health: 'retry',
    });
    expect(parseScenarioSearch('scenario=health:retry').explicit).toStrictEqual({
      health: 'retry',
    });
    expect(parseScenarioSearch('').explicit).toStrictEqual({});
  });

  it('직렬화 → 재파싱이 같은 값을 준다 (dev 패널 ↔ URL 동기화)', () => {
    const source = parseScenarioParam('success,health:offline', 'url');
    const round = parseScenarioParam(serializeScenarioSource(source), 'url');

    expect(round.explicit).toStrictEqual(source.explicit);
    expect(round.wildcard).toBe(source.wildcard);
  });
});
