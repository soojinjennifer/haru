import { ERROR_CODES } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { ERROR_COPY, errorCopyForCode, networkErrorCopy, unknownErrorCopy } from '../error-copy';

describe('error copy — Error Code → 사용자 문구 (rules/frontend §8)', () => {
  it('contracts 의 모든 Error Code 에 문구가 있다', () => {
    const missing = ERROR_CODES.filter((code) => ERROR_COPY[code] === undefined);

    expect(missing).toStrictEqual([]);
    expect(Object.keys(ERROR_COPY)).toHaveLength(ERROR_CODES.length);
  });

  it('제거된 코드(TRIAL_ACCOUNT_RESTRICTED — C-12)는 없다', () => {
    expect(Object.keys(ERROR_COPY)).not.toContain('TRIAL_ACCOUNT_RESTRICTED');
  });

  it('모든 문구가 비어 있지 않다', () => {
    for (const code of ERROR_CODES) {
      expect(ERROR_COPY[code].title.length).toBeGreaterThan(0);
      expect(ERROR_COPY[code].description.length).toBeGreaterThan(0);
    }
  });

  it('진단·판정·비교 표현을 쓰지 않는다 (rules/frontend §8)', () => {
    const banned =
      /\b(diagnos|disorder|delay(ed)?\s+development|below average|abnormal|score[sd]? lower|worse than|better than|compared to other)/i;

    for (const code of ERROR_CODES) {
      const text = `${ERROR_COPY[code].title} ${ERROR_COPY[code].description}`;
      expect(text).not.toMatch(banned);
    }
  });

  it('코드가 없는 실패에는 일반 문구를 쓴다', () => {
    expect(errorCopyForCode(undefined)).toStrictEqual(unknownErrorCopy);
    expect(errorCopyForCode('RATE_LIMITED')).toStrictEqual(ERROR_COPY.RATE_LIMITED);
  });

  it('전송 실패(offline)는 별도 문구를 쓴다', () => {
    expect(networkErrorCopy.title).not.toBe(unknownErrorCopy.title);
  });
});
