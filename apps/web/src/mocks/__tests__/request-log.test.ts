/**
 * 요청 로그 수집기 단위 테스트 — AC-2-13 증거의 도구 자체를 먼저 검증한다.
 */
import { describe, expect, it } from 'vitest';

import {
  CHILD_DATA_KEYS,
  createRequestLog,
  findChildDataKeys,
  redactSecrets,
  REDACTED,
} from '../request-log';

describe('redactSecrets', () => {
  it('비밀번호·토큰 값을 표식으로 바꾼다 (키 이름은 남긴다)', () => {
    const result = redactSecrets({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
      nested: { accessToken: 'abc', refreshToken: 'def' },
    });

    expect(result).toStrictEqual({
      email: 'sam@example.com',
      password: REDACTED,
      nested: { accessToken: REDACTED, refreshToken: REDACTED },
    });
  });

  it('배열 안쪽까지 훑는다', () => {
    expect(redactSecrets([{ password: 'x' }])).toStrictEqual([{ password: REDACTED }]);
  });
});

describe('findChildDataKeys', () => {
  it('아동 데이터 키가 없으면 빈 배열이다', () => {
    const log = createRequestLog();
    log.record('AuthGateway.signUpWithEmail', { caregiverName: 'Sam', email: 'sam@example.com' });

    expect(findChildDataKeys(log.entries())).toStrictEqual([]);
  });

  it('중첩된 아동 데이터 키도 찾아낸다', () => {
    const log = createRequestLog();
    log.record('PUT /v1/onboarding/steps/child_info', {
      answers: { firstName: 'Haru', birthYearMonth: '2021-03' },
    });

    expect(findChildDataKeys(log.entries())).toStrictEqual([
      'answers',
      'birthYearMonth',
      'firstName',
    ]);
  });

  it('금칙 키 목록이 Plan §12 의 검사 대상을 포함한다', () => {
    for (const key of ['firstName', 'lastName', 'birthYearMonth', 'gender', 'answers']) {
      expect(CHILD_DATA_KEYS).toContain(key);
    }
  });
});

describe('RequestLog', () => {
  it('기록 순서를 유지하고 clear 로 비운다', () => {
    const log = createRequestLog();
    log.record('a');
    log.record('b');

    expect(log.entries().map((entry) => entry.operation)).toStrictEqual(['a', 'b']);

    log.clear();
    expect(log.entries()).toHaveLength(0);
  });
});
