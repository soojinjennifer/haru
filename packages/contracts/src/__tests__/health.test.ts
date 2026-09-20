import { describe, expect, it } from 'vitest';

import { HealthResponseSchema } from '../health/index.js';

describe('HealthResponseSchema (API_CONTRACTS §4 Stage 1 — GET /v1/health)', () => {
  it('정상 응답을 parse 한다', () => {
    const parsed = HealthResponseSchema.parse({
      status: 'ok',
      version: '1.0.0',
      serverTime: '2026-09-20T09:00:00Z',
    });
    expect(parsed).toEqual({
      status: 'ok',
      version: '1.0.0',
      serverTime: '2026-09-20T09:00:00Z',
    });
  });

  it('응답의 unknown key 는 strip 된다 (필드 추가 = non-breaking, §1 "버전")', () => {
    const parsed = HealthResponseSchema.parse({
      status: 'ok',
      version: '1.0.0',
      serverTime: '2026-09-20T09:00:00Z',
      uptimeSeconds: 42,
    });
    expect(parsed).not.toHaveProperty('uptimeSeconds');
  });

  it('status 는 ok 리터럴만 허용한다', () => {
    expect(
      HealthResponseSchema.safeParse({
        status: 'degraded',
        version: '1.0.0',
        serverTime: '2026-09-20T09:00:00Z',
      }).success,
    ).toBe(false);
  });

  it('serverTime 은 ISO 8601 UTC 문자열이어야 한다 (offset 표기 거부)', () => {
    expect(
      HealthResponseSchema.safeParse({
        status: 'ok',
        version: '1.0.0',
        serverTime: '2026-09-20T18:00:00+09:00',
      }).success,
    ).toBe(false);
    expect(
      HealthResponseSchema.safeParse({
        status: 'ok',
        version: '1.0.0',
        serverTime: '2026-09-20',
      }).success,
    ).toBe(false);
  });

  it('version 은 비어 있을 수 없다', () => {
    expect(
      HealthResponseSchema.safeParse({
        status: 'ok',
        version: '',
        serverTime: '2026-09-20T09:00:00Z',
      }).success,
    ).toBe(false);
  });
});
