import { describe, expect, it } from 'vitest';

import { IdSchema, IsoDateTimeSchema, OccurredAtFieldsSchema } from '../common/index.js';

describe('IdSchema (API_CONTRACTS §1 — ID = uuid)', () => {
  it('uuid 를 허용한다', () => {
    const id = '2f3b0f2c-2b3f-4a8e-9f0a-6d0b6a2a9d11';
    expect(IdSchema.parse(id)).toBe(id);
  });

  it('uuid 가 아닌 문자열을 거부한다', () => {
    expect(IdSchema.safeParse('123').success).toBe(false);
    expect(IdSchema.safeParse('').success).toBe(false);
  });
});

describe('IsoDateTimeSchema (API_CONTRACTS §1 — ISO 8601 UTC)', () => {
  it('UTC(Z) 표기를 허용한다', () => {
    expect(IsoDateTimeSchema.parse('2026-09-20T09:00:00Z')).toBe('2026-09-20T09:00:00Z');
    expect(IsoDateTimeSchema.parse('2026-09-20T09:00:00.123Z')).toBe('2026-09-20T09:00:00.123Z');
  });

  it('offset · 날짜만 · 공백 구분 표기를 거부한다', () => {
    expect(IsoDateTimeSchema.safeParse('2026-09-20T18:00:00+09:00').success).toBe(false);
    expect(IsoDateTimeSchema.safeParse('2026-09-20').success).toBe(false);
    expect(IsoDateTimeSchema.safeParse('2026-09-20 09:00:00Z').success).toBe(false);
  });
});

describe('occurredAt 규약', () => {
  it('선택 필드이며 생략할 수 있다', () => {
    expect(OccurredAtFieldsSchema.parse({})).toEqual({});
  });

  it('제공되면 ISO 8601 UTC 형식을 따라야 한다', () => {
    expect(OccurredAtFieldsSchema.parse({ occurredAt: '2026-09-20T09:00:00Z' })).toEqual({
      occurredAt: '2026-09-20T09:00:00Z',
    });
    expect(OccurredAtFieldsSchema.safeParse({ occurredAt: 'yesterday' }).success).toBe(false);
  });
});
