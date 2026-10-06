/**
 * `★ Save` contract — `docs/API_CONTRACTS.md` §3.7, approvals §12.8 `A-9` · §12.10 (`G-13`).
 *
 * 이 파일이 지키는 결정
 *  - 저장 대상은 **책**이다 (카드가 아니다) — 카탈로그 `bookId` 또는 `title`(+`author?`).
 *  - **상한이 없다** — 개수 제한을 표현하는 필드가 schema 에 없다.
 *  - **신규 Error Code 0건** — 중복 저장은 오류가 아니라 같은 응답이다.
 */
import { describe, expect, it } from 'vitest';

import {
  SaveBookRequestSchema,
  SaveBookTargetSchema,
  SavedBookSchema,
  ERROR_CODES,
} from '../index.js';

const ID = '44444444-4444-4444-8444-000000000001';

describe('SaveBookTarget — 카탈로그 책 ↔ 직접 입력 (§3.7.2)', () => {
  it('bookId 만으로 통과한다', () => {
    expect(SaveBookTargetSchema.safeParse({ bookId: ID }).success).toBe(true);
  });

  it('title 만으로 통과하고 author 는 선택이다', () => {
    expect(SaveBookTargetSchema.safeParse({ title: 'Where the Wild Things Are' }).success).toBe(
      true,
    );
    expect(
      SaveBookTargetSchema.safeParse({ title: 'Wild Things', author: 'Maurice Sendak' }).success,
    ).toBe(true);
  });

  it('빈 제목·공백 제목·잘못된 id 는 거부한다', () => {
    expect(SaveBookTargetSchema.safeParse({ title: '   ' }).success).toBe(false);
    expect(SaveBookTargetSchema.safeParse({ bookId: 'not-a-uuid' }).success).toBe(false);
    expect(SaveBookTargetSchema.safeParse({}).success).toBe(false);
  });

  it('요청 본문은 target 하나만 갖는다 (카드 id·개수 제한 필드가 없다)', () => {
    const parsed = SaveBookRequestSchema.parse({ target: { bookId: ID }, cardId: ID, limit: 5 });
    expect(Object.keys(parsed)).toEqual(['target']);
  });
});

describe('SavedBook 응답 — 저장/해제가 같은 모양이다 (§3.7.3 멱등)', () => {
  const book = { id: ID, title: 'Goodnight Moon', author: 'Margaret Wise Brown' };

  it('저장 응답', () => {
    const parsed = SavedBookSchema.parse({
      book,
      saved: true,
      savedAt: '2026-10-05T09:00:00Z',
    });
    expect(parsed.saved).toBe(true);
  });

  it('해제 응답은 savedAt 이 null 이다', () => {
    expect(SavedBookSchema.safeParse({ book, saved: false, savedAt: null }).success).toBe(true);
  });

  it('offset 표기 시각은 거부한다 (UTC 문자열 규약)', () => {
    expect(
      SavedBookSchema.safeParse({ book, saved: true, savedAt: '2026-10-05T18:00:00+09:00' })
        .success,
    ).toBe(false);
  });
});

describe('Error Code — 신규 0건 (§3.7.3)', () => {
  it('저장 경로가 쓰는 코드는 기존 목록 안에 있다', () => {
    expect(ERROR_CODES).toContain('RESOURCE_NOT_FOUND');
    expect(ERROR_CODES).toContain('VALIDATION_FAILED');
  });

  it('`SAVED_BOOK_LIMIT` 같은 상한 오류 코드를 만들지 않았다', () => {
    expect(ERROR_CODES.filter((code) => code.includes('SAVED'))).toEqual([]);
  });
});
