import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  CursorPageRequestSchema,
  PAGE_LIMIT_DEFAULT,
  PAGE_LIMIT_MAX,
  PAGE_LIMIT_MIN,
  paginated,
} from '../common/index.js';

describe('CursorPageRequestSchema (API_CONTRACTS §1 Pagination)', () => {
  it('limit 규약 상수가 문서와 일치한다 (1 / 20 / 50)', () => {
    expect(PAGE_LIMIT_MIN).toBe(1);
    expect(PAGE_LIMIT_DEFAULT).toBe(20);
    expect(PAGE_LIMIT_MAX).toBe(50);
  });

  it('limit 을 생략하면 기본값 20 이 채워진다', () => {
    expect(CursorPageRequestSchema.parse({})).toEqual({ limit: 20 });
  });

  it.each([1, 20, 50])('limit %i 는 허용된다', (limit) => {
    expect(CursorPageRequestSchema.parse({ limit }).limit).toBe(limit);
  });

  it.each([0, 51, -1, 1.5])('limit %s 는 거부된다', (limit) => {
    expect(CursorPageRequestSchema.safeParse({ limit }).success).toBe(false);
  });

  it('cursor 는 선택이며 비어 있는 문자열을 거부한다', () => {
    expect(CursorPageRequestSchema.parse({ cursor: 'opaque-token' }).cursor).toBe('opaque-token');
    expect(CursorPageRequestSchema.safeParse({ cursor: '' }).success).toBe(false);
  });
});

describe('paginated(T)', () => {
  const PageSchema = paginated(z.object({ id: z.string() }));

  it('items 와 nextCursor 를 parse 한다', () => {
    expect(PageSchema.parse({ items: [{ id: 'a' }], nextCursor: 'next' })).toEqual({
      items: [{ id: 'a' }],
      nextCursor: 'next',
    });
  });

  it('마지막 페이지의 nextCursor 는 null 이다', () => {
    expect(PageSchema.parse({ items: [], nextCursor: null }).nextCursor).toBeNull();
  });

  it('nextCursor 누락 · item schema 불일치를 거부한다', () => {
    expect(PageSchema.safeParse({ items: [] }).success).toBe(false);
    expect(PageSchema.safeParse({ items: [{ id: 1 }], nextCursor: null }).success).toBe(false);
  });
});
