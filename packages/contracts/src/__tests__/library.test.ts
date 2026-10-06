import { describe, expect, it } from 'vitest';

import {
  AddOwnBookRequestSchema,
  BookPromptsResponseSchema,
  CreateGiftRequestRequestSchema,
  ERROR_CODE_HTTP_STATUS,
  GiftRequestListResponseSchema,
  GiftRequestSchema,
  LibraryBookSchema,
  LibraryListRequestSchema,
  LibraryListResponseSchema,
  LibraryOverviewSchema,
  ReadingProgressSchema,
  RenderableLibraryBookSchema,
  SaveBookTargetSchema,
} from '../index.js';

/**
 * Library contracts (1라운드) — Library Plan §7, Design Spec §3 · §7.4.
 *
 * 검증 축 4개
 *   ① 재사용분을 다시 선언하지 않았다 (`BookSummary` · `SaveBookTarget` · pagination · 공통 원시)
 *   ② 결정 사항이 타입으로 남아 있다 (`progressRatio` 서버 전달 · `plannedNights` nullable ·
 *      `averageRating` nullable · 배송지 필드 없음)
 *   ③ **응답 필드에 과한 제약이 없다** — Backend 가 벗어나도 화면이 통째로 비지 않아야 한다
 *   ④ Figma 에 없는 상태(`unrated` · `reading-now-none` · `user-entered-book`)가 parse 된다
 */

const BOOK = {
  id: '22222222-2222-4222-8222-000000000004',
  title: 'Where the Wild Things Are',
  author: 'Maurice Sendak',
} as const;

const LIBRARY_BOOK = {
  id: '33333333-3333-4333-8333-000000000001',
  book: BOOK,
  ownership: 'owned',
  source: 'library_add',
  capability: 'self_directed_agency',
  saved: false,
  savedAt: null,
  readCount: 2,
  sessionCount: 3,
  averageRating: 4.5,
} as const;

describe('ReadingProgress — 진행률은 서버가 직접 준다 (L-OPEN-16 · L-OPEN-17)', () => {
  const base = {
    completedNights: 3,
    plannedNights: 5,
    progressRatio: 0.55,
    lastReadAt: '2026-01-01T00:00:00.000Z',
    lastSessionMinutes: 12,
  };

  it('기본 형태를 parse 한다', () => {
    expect(ReadingProgressSchema.parse(base).progressRatio).toBe(0.55);
  });

  it('plannedNights 가 null 이어도 통과한다 (회차 문구를 생략하는 경로)', () => {
    expect(ReadingProgressSchema.parse({ ...base, plannedNights: null }).plannedNights).toBeNull();
  });

  it('plannedNights 0 은 거부한다 (`n of 0 nights` 는 문장이 되지 않는다)', () => {
    expect(ReadingProgressSchema.safeParse({ ...base, plannedNights: 0 }).success).toBe(false);
  });

  it('progressRatio 가 null 이어도 통과한다 (진행 바 미렌더)', () => {
    expect(ReadingProgressSchema.parse({ ...base, progressRatio: null }).progressRatio).toBeNull();
  });

  it('progressRatio 0–1 밖은 거부한다 (바 폭이 깨진다)', () => {
    expect(ReadingProgressSchema.safeParse({ ...base, progressRatio: 1.2 }).success).toBe(false);
    expect(ReadingProgressSchema.safeParse({ ...base, progressRatio: -0.1 }).success).toBe(false);
  });

  it('회차 필드만으로 비율을 파생시키지 않는다 (progressRatio 는 독립 필드다)', () => {
    const parsed = ReadingProgressSchema.parse({ ...base, completedNights: 1, progressRatio: 0.9 });
    // 3/5 ≠ 0.9 라도 서버 값을 그대로 보존한다 — 프론트 계산 금지의 타입 수준 증거.
    expect(parsed.progressRatio).toBe(0.9);
  });
});

describe('LibraryBook', () => {
  it('기본 형태를 parse 한다', () => {
    expect(LibraryBookSchema.parse(LIBRARY_BOOK).averageRating).toBe(4.5);
  });

  it('averageRating 이 null 이어도 통과한다 (`unrated` — L-OPEN-22)', () => {
    expect(LibraryBookSchema.parse({ ...LIBRARY_BOOK, averageRating: null }).averageRating).toBe(
      null,
    );
  });

  it('capability 가 null 이어도 통과한다 (캡션 2행을 저자명으로 대체하는 경로)', () => {
    expect(LibraryBookSchema.parse({ ...LIBRARY_BOOK, capability: null }).capability).toBeNull();
  });

  it('카탈로그에 없는 책은 book=null + userEnteredTitle 로 통과한다 (FR-23)', () => {
    const parsed = RenderableLibraryBookSchema.parse({
      ...LIBRARY_BOOK,
      book: null,
      userEnteredTitle: 'Moonbeam',
      userEnteredAuthor: null,
    });
    expect(parsed.book).toBeNull();
    expect(parsed.userEnteredTitle).toBe('Moonbeam');
  });

  it('그릴 제목이 하나도 없으면 Renderable 이 거부한다', () => {
    const result = RenderableLibraryBookSchema.safeParse({ ...LIBRARY_BOOK, book: null });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['userEnteredTitle']);
  });

  it('BookSummary 를 다시 선언하지 않는다 (같은 schema 를 통과한다)', () => {
    expect(LibraryBookSchema.parse(LIBRARY_BOOK).book?.title).toBe(BOOK.title);
    expect(LibraryBookSchema.safeParse({ ...LIBRARY_BOOK, book: { id: BOOK.id } }).success).toBe(
      false,
    );
  });

  /*
   * `characterLine` 선례 — 응답 필드에 길이 제약을 걸면 Backend 가 한 번만 넘겨도 parse 가
   * 던져 화면이 통째로 빈다. 제목·저자에 `.max()` 가 없는 것을 **의도**로 고정한다.
   */
  it('긴 제목을 parse 가 거부하지 않는다 (degrade 는 UI 가 흡수한다)', () => {
    const long = 'A'.repeat(4_000);
    expect(
      LibraryBookSchema.safeParse({ ...LIBRARY_BOOK, book: { ...BOOK, title: long } }).success,
    ).toBe(true);
  });
});

describe('LibraryOverview — 화면 1회 조회 (P3-BIP-18)', () => {
  const overview = {
    readingNow: { ...LIBRARY_BOOK, readingProgress: null },
    sections: [
      { key: 'curated', items: [LIBRARY_BOOK], hasMore: true },
      { key: 'favorites', items: [], hasMore: false },
      { key: 'finished', items: [], hasMore: false },
    ],
  };

  it('4섹션 구성을 parse 한다', () => {
    expect(LibraryOverviewSchema.parse(overview).sections).toHaveLength(3);
  });

  it('readingNow 가 null 이어도 통과한다 (`reading-now-none` → 블록 미렌더)', () => {
    expect(LibraryOverviewSchema.parse({ ...overview, readingNow: null }).readingNow).toBeNull();
  });

  it('섹션이 0건이어도 통과한다 (섹션은 사라지지 않는다 — 본문만 안내로 바뀐다)', () => {
    const empty = {
      readingNow: null,
      sections: overview.sections.map((s) => ({ ...s, items: [] })),
    };
    expect(LibraryOverviewSchema.parse(empty).sections.every((s) => s.items.length === 0)).toBe(
      true,
    );
  });

  it('reading_now 는 섹션 키가 아니다 (단일 필드다)', () => {
    const bad = { ...overview, sections: [{ key: 'reading_now', items: [], hasMore: false }] };
    expect(LibraryOverviewSchema.safeParse(bad).success).toBe(false);
  });
});

describe('LibraryList — pagination 규약 재사용', () => {
  it('limit 기본값이 채워진다 (CursorPageRequest 재사용)', () => {
    const parsed = LibraryListRequestSchema.parse({ filter: 'saved' });
    expect(parsed.limit).toBe(20);
    expect(parsed.filter).toBe('saved');
  });

  it('limit 상한을 넘기면 거부한다', () => {
    expect(LibraryListRequestSchema.safeParse({ filter: 'saved', limit: 51 }).success).toBe(false);
  });

  it('filter 는 필수다 (쿼리 축이 없으면 무엇을 받는지 알 수 없다)', () => {
    expect(LibraryListRequestSchema.safeParse({}).success).toBe(false);
  });

  it('응답은 `paginated(LibraryBook)` 이다', () => {
    const parsed = LibraryListResponseSchema.parse({ items: [LIBRARY_BOOK], nextCursor: 'c2' });
    expect(parsed.nextCursor).toBe('c2');
    expect(LibraryListResponseSchema.parse({ items: [], nextCursor: null }).items).toEqual([]);
  });
});

describe('AddOwnBook — SaveBookTarget 공용화 (FR-23)', () => {
  it('bookId 형태를 parse 한다', () => {
    expect(AddOwnBookRequestSchema.parse({ target: { bookId: BOOK.id } }).target).toEqual({
      bookId: BOOK.id,
    });
  });

  it('title 형태를 parse 한다 (카탈로그에 없는 책)', () => {
    expect(
      AddOwnBookRequestSchema.parse({ target: { title: 'Moonbeam', author: 'Ada' } }).target,
    ).toEqual({ title: 'Moonbeam', author: 'Ada' });
  });

  it('`SaveBookTargetSchema` 와 **같은** 판별 구조다 (다시 선언하지 않았다)', () => {
    const target = { title: 'Moonbeam' };
    expect(SaveBookTargetSchema.parse(target)).toEqual(
      AddOwnBookRequestSchema.parse({ target }).target,
    );
  });

  it('빈 제목은 거부한다', () => {
    expect(AddOwnBookRequestSchema.safeParse({ target: { title: '  ' } }).success).toBe(false);
  });
});

describe('GiftRequest — FR-22 · D-15', () => {
  const request = {
    id: '44444444-4444-4444-8444-000000000001',
    book: BOOK,
    status: 'requested',
    requestedAt: '2026-01-01T00:00:00.000Z',
    statusUpdatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('신청 요청은 bookId 하나다 — 배송지 필드가 없다 (D-15)', () => {
    const parsed = CreateGiftRequestRequestSchema.parse({ bookId: BOOK.id });
    expect(Object.keys(parsed)).toEqual(['bookId']);
  });

  it('배송지 필드를 보내도 schema 에 남지 않는다 (주소 수집 UI 를 만들지 않는다)', () => {
    const parsed = CreateGiftRequestRequestSchema.parse({
      bookId: BOOK.id,
      address: '1 Main St',
    });
    expect('address' in parsed).toBe(false);
  });

  it('상태 6종을 그대로 쓴다 (기존 enum 재사용)', () => {
    for (const status of [
      'requested',
      'approved',
      'shipped',
      'delivered',
      'cancelled',
      'rejected',
    ]) {
      expect(GiftRequestSchema.parse({ ...request, status }).status).toBe(status);
    }
  });

  it('목록은 `paginated(GiftRequest)` 다', () => {
    expect(
      GiftRequestListResponseSchema.parse({ items: [request], nextCursor: null }).items,
    ).toHaveLength(1);
  });
});

describe('BookPrompts — PromptSet 재사용 (FR-20)', () => {
  const promptSet = {
    id: '55555555-5555-4555-8555-000000000001',
    capability: 'emotion_regulation',
    ageBand: '5_6',
    questions: [
      {
        id: '55555555-5555-4555-8555-000000000002',
        kind: 'question',
        text: 'What do you think he felt?',
        order: 0,
        coachingNote: 'Wait a beat before helping.',
      },
    ],
    followUps: [],
  };

  it('promptSet 을 그대로 담는다 (prompts/followUps 를 다시 선언하지 않는다)', () => {
    const parsed = BookPromptsResponseSchema.parse({ bookId: BOOK.id, promptSet });
    expect(parsed.promptSet.questions).toHaveLength(1);
  });

  it('question 에 coachingNote 가 없으면 거부한다 (§12.14 규칙이 그대로 적용된다)', () => {
    const bad = {
      bookId: BOOK.id,
      promptSet: {
        ...promptSet,
        questions: [{ ...promptSet.questions[0], coachingNote: undefined }],
      },
    };
    expect(BookPromptsResponseSchema.safeParse(bad).success).toBe(false);
  });

  it('세트 단위 coachingLine 을 되살리지 않는다 (§12.14 로 삭제됐다)', () => {
    const parsed = BookPromptsResponseSchema.parse({ bookId: BOOK.id, promptSet });
    expect('coachingLine' in parsed.promptSet).toBe(false);
  });
});

describe('Error Code — 신규는 BOOK_ALREADY_OWNED 1건뿐이다 (Plan §7.4)', () => {
  it('BOOK_ALREADY_OWNED 가 409 다', () => {
    expect(ERROR_CODE_HTTP_STATUS.BOOK_ALREADY_OWNED).toBe(409);
  });

  it('GIFT_REQUEST_DUPLICATE 는 기존 등재분이다 (409)', () => {
    expect(ERROR_CODE_HTTP_STATUS.GIFT_REQUEST_DUPLICATE).toBe(409);
  });

  it('저장/해제용 신규 코드를 만들지 않았다 (A-9 · §12.10 — 신규 0건)', () => {
    const codes = Object.keys(ERROR_CODE_HTTP_STATUS);
    expect(codes.filter((code) => code.includes('SAVED') || code.includes('FAVORITE'))).toEqual([]);
  });
});
