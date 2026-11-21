/**
 * 서재 fixture — Library Plan §8, Library Design Spec §7.4.
 *
 * 규칙
 *  - **가상 데이터만** 담는다 (실제 아동 데이터 금지).
 *  - **결정적**이다 — id·시각·순서가 scenario 와 무관하게 호출 순서만으로 정해진다.
 *    시각은 주입 clock 의 기준 시각에서 **상대 오프셋**으로 만든다.
 *  - 표지는 **Mock 전용 표지 에셋**(Figma image fill)이다 (`shared/assets/book-covers` — Stage 8 `D8-7`
 *    에서 `S8-I` 중립 대체를 번복). 책 id → 표지는 `book-covers.ts` 한 곳에서 정한다.
 *  - `shelf-partial`(1·2권) · `unrated` · `reading-now-none` · `favorites-empty` ·
 *    `user-entered-book` 은 **Figma 에 없는 상태**다 → 이 fixture 가 유일한 검증 수단이다.
 *
 * ⚠ fixture 는 `mocks/` 안에만 둔다. Component·Page·Feature 가 이 모듈을 import 하지 않는다
 * (`rules/frontend.md` §5, `assert:no-mocks` + `mock-source-rules` 가 보증한다).
 */
import {
  LibraryOverviewSchema,
  RenderableLibraryBookSchema,
  type BookSummary,
  type GiftRequest,
  type LibraryBook,
  type LibraryFilter,
  type LibraryOverview,
  type LibrarySectionKey,
} from '@haru/contracts';

import { shiftedIso, type Clock } from '../../shared/lib/clock';

import { DECK_BOOKS } from './saved-books';
import { MOCK_BOOKS } from './books';

const DAY_MS = 24 * 60 * 60 * 1_000;

/** `child_books` 행 id — 책 id 와 다른 공간을 쓴다 (같은 책이 여러 아이에게 있을 수 있다). */
function rowId(index: number): string {
  return `33333333-3333-4333-8333-${String(index).padStart(12, '0')}`;
}

function giftId(index: number): string {
  return `77777777-7777-4777-8777-${String(index).padStart(12, '0')}`;
}

/** 기준 시각에서 `days` 일 전. clock 이 고정이므로 결과 바이트가 항상 같다. */
function daysAgo(clock: Clock, days: number): string {
  return shiftedIso(clock, -days * DAY_MS);
}

/**
 * 표지 있는 책 3권(Figma `30:74` 의 책과 표지 — `D8-7`) + 카탈로그 책(같은 id 면 같은 표지, 없으면 placeholder).
 * 캐러셀이 **3-up × 3페이지**(dots 3개 `[실측 113:1986]`)를 실제로 그릴 수 있어야 하므로
 * 큐레이션 섹션에 9권을 넣는다. 페이지 수는 `ceil(items / 3)` 로 **데이터에서 파생**된다.
 */
const SHELF_BOOKS: readonly BookSummary[] = [...DECK_BOOKS, ...MOCK_BOOKS.slice(0, 6)];

/**
 * `noUncheckedIndexedAccess` 아래에서 인덱스 접근 타입을 좁힌다.
 * `SHELF_BOOKS` 는 9권이라 아래 호출은 전부 범위 안이고 이 fallback 은 실제로 쓰이지 않는다 —
 * 그래도 `!` 단정 대신 값으로 둬서 fixture 가 조용히 `undefined` 를 흘리지 않게 한다.
 */
const FALLBACK_BOOK: BookSummary = {
  id: '22222222-2222-4222-8222-0000000000ff',
  title: 'A Quiet Evening',
  author: 'HARU Sample',
};

function bookAt(index: number): BookSummary {
  return SHELF_BOOKS[index] ?? FALLBACK_BOOK;
}

const CAPABILITIES = [
  'emotion_regulation',
  'self_directed_agency',
  'cognitive_flexibility',
  'intrinsic_motivation',
] as const;

interface BookSeed {
  book: BookSummary;
  index: number;
  saved: boolean;
  rating: number | null;
  sessions: number;
}

function libraryBook(clock: Clock, seed: BookSeed): LibraryBook {
  const { book, index, saved, rating, sessions } = seed;

  return RenderableLibraryBookSchema.parse({
    id: rowId(index),
    book,
    ownership: saved ? 'favorite_only' : 'owned',
    source: saved ? 'card_save' : 'library_add',
    capability: CAPABILITIES[index % CAPABILITIES.length],
    saved,
    savedAt: saved ? daysAgo(clock, index + 1) : null,
    firstReadAt: sessions > 0 ? daysAgo(clock, index + 20) : null,
    lastReadAt: sessions > 0 ? daysAgo(clock, index + 2) : null,
    readCount: sessions,
    sessionCount: sessions,
    averageRating: rating,
  });
}

function shelfItems(clock: Clock, books: readonly BookSummary[], offset: number): LibraryBook[] {
  return books.map((book, position) =>
    libraryBook(clock, {
      book,
      index: offset + position,
      saved: false,
      rating: null,
      sessions: 0,
    }),
  );
}

/**
 * 외부 구매 링크 fixture (`stage-3-approvals.md` §30.7 ②, Stage 4 AC-4-88).
 *
 * `favorite_only` 책 시트의 `Where to buy` 는 `purchaseUrl` 이 있을 때만 그려진다. 이 값이 fixture 에
 * 0건이라 **어떤 Mock 시나리오에서도** 그 분기가 렌더되지 않았다. Favorites **첫 권에만** 넣는다 —
 * 링크가 없는 `favorite_only`(아무것도 그리지 않는 분기)도 둘째·셋째 권으로 계속 재현된다.
 *
 * 가상 주소다 (`.example` — RFC 2606 예약 도메인). 실제 판매처를 가리키지 않는다.
 */
export const MOCK_PURCHASE_URL = 'https://books.example/where-the-wild-things-are';

function favoriteItems(clock: Clock, count: number): LibraryBook[] {
  return DECK_BOOKS.slice(0, count).map((book, position) => {
    const item = libraryBook(clock, {
      book,
      index: 100 + position,
      saved: true,
      rating: null,
      sessions: 0,
    });
    return position === 0
      ? RenderableLibraryBookSchema.parse({ ...item, purchaseUrl: MOCK_PURCHASE_URL })
      : item;
  });
}

/** `Finished together` — 행 메타(`{n} sessions · finished {date}`)와 평점이 있는 목록이다. */
function finishedItems(clock: Clock, count: number, rated: boolean): LibraryBook[] {
  return DECK_BOOKS.slice(0, Math.min(count, DECK_BOOKS.length))
    .concat(MOCK_BOOKS.slice(0, Math.max(0, count - DECK_BOOKS.length)))
    .map((book, position) =>
      libraryBook(clock, {
        book,
        index: 200 + position,
        saved: false,
        // `unrated` 는 **우측 메타를 비우는** 경로다 (`L-OPEN-22`). Figma 에 없는 상태다.
        rating: rated ? Number((3.5 + (position % 3) * 0.5).toFixed(1)) : null,
        sessions: 2 + (position % 3),
      }),
    );
}

/** `Reading now` — 진행률은 **서버 값**이다. 프론트가 회차로 계산하지 않는다. */
function readingNow(clock: Clock, plannedNights: number | null): LibraryBook {
  return RenderableLibraryBookSchema.parse({
    ...libraryBook(clock, {
      book: bookAt(1),
      index: 300,
      saved: true,
      rating: 4.5,
      sessions: 3,
    }),
    readingProgress: {
      completedNights: 3,
      plannedNights,
      progressRatio: 0.552,
      lastReadAt: daysAgo(clock, 2),
      lastSessionMinutes: 12,
    },
  });
}

/** 카탈로그에 없는 책 — 표지가 없어 `BookCover` placeholder 경로를 탄다. */
function userEnteredBook(clock: Clock): LibraryBook {
  return RenderableLibraryBookSchema.parse({
    id: rowId(400),
    book: null,
    userEnteredTitle: 'Moonbeam and the Night Train',
    userEnteredAuthor: null,
    ownership: 'owned',
    source: 'library_add',
    capability: null,
    saved: false,
    savedAt: null,
    readCount: 1,
    sessionCount: 1,
    averageRating: null,
    lastReadAt: daysAgo(clock, 4),
  });
}

/** 증정 대기 — 상태는 `Tag` **라벨 텍스트**로 표시한다 (색에만 의존하지 않는다). */
function giftPendingBook(): LibraryBook {
  return RenderableLibraryBookSchema.parse({
    id: rowId(500),
    book: bookAt(8),
    ownership: 'gift_pending',
    source: 'gift_program',
    capability: null,
    saved: false,
    savedAt: null,
    readCount: 0,
    sessionCount: 0,
    averageRating: null,
    giftRequestStatus: 'shipped',
    lastReadAt: null,
  });
}

/**
 * overview fixture 의 모양. scenario key 와 1:1 이 아니라 **화면 상태**와 1:1 이다
 * (`loading`·`error`·`retry`·`offline` 은 모양이 아니라 전달 방식이라 여기 없다).
 */
export type LibraryOverviewShape =
  | 'full'
  | 'empty'
  | 'favorites-empty'
  | 'finished-empty'
  | 'curated-empty'
  | 'reading-now-none'
  | 'shelf-partial-1'
  | 'shelf-partial-2'
  | 'unrated'
  | 'user-entered-book'
  | 'gift-pending';

interface ShapeConfig {
  readingNow: boolean;
  /** `plannedNights === null` → 회차 문구 미렌더 경로. */
  plannedNights: number | null;
  curated: number;
  favorites: number;
  finished: number;
  rated: boolean;
  extraFinished: readonly ((clock: Clock) => LibraryBook)[];
}

const BASE: ShapeConfig = {
  readingNow: true,
  plannedNights: 5,
  curated: 9,
  favorites: 3,
  finished: 4,
  rated: true,
  extraFinished: [],
};

const SHAPES: Readonly<Record<LibraryOverviewShape, ShapeConfig>> = {
  full: BASE,
  // 전체 0건 — 3섹션의 안내가 **동시에** 뜬다. 별도의 "전체 빈 화면" 을 만들지 않는다.
  empty: { ...BASE, readingNow: false, curated: 0, favorites: 0, finished: 0 },
  // ⭐ 저장 전 기본 상태 = 가장 흔한 실제 상태다.
  'favorites-empty': { ...BASE, favorites: 0 },
  'finished-empty': { ...BASE, finished: 0 },
  'curated-empty': { ...BASE, curated: 0 },
  // 유일한 "섹션 사라짐" 예외 — 화면이 L-1 `30:74` 와 완전히 같아진다.
  'reading-now-none': { ...BASE, readingNow: false },
  'shelf-partial-1': { ...BASE, curated: 1 },
  'shelf-partial-2': { ...BASE, curated: 2 },
  unrated: { ...BASE, rated: false },
  'user-entered-book': { ...BASE, extraFinished: [userEnteredBook] },
  'gift-pending': { ...BASE, extraFinished: [giftPendingBook] },
};

export function createLibraryOverviewFixture(
  clock: Clock,
  shape: LibraryOverviewShape = 'full',
): LibraryOverview {
  const config = SHAPES[shape];
  const finished = [
    ...finishedItems(clock, config.finished, config.rated),
    ...config.extraFinished.map((make) => make(clock)),
  ];

  return LibraryOverviewSchema.parse({
    readingNow: config.readingNow ? readingNow(clock, config.plannedNights) : null,
    /*
      섹션 순서는 **서버가 정한다** (`L-OPEN-01`). 프론트가 재정렬하지 않으므로 fixture 가
      화면 순서를 그대로 담는다: Reading now(단일 필드) → curated → favorites → finished.
    */
    sections: [
      {
        key: 'curated',
        items: shelfItems(clock, SHELF_BOOKS.slice(0, config.curated), 0),
        hasMore: config.curated > 3,
      },
      { key: 'favorites', items: favoriteItems(clock, config.favorites), hasMore: false },
      { key: 'finished', items: finished, hasMore: finished.length > 3 },
    ],
  });
}

/** `LibraryFilter` → overview 섹션 키. 쿼리 축과 표시 축이 1:1 이 아니다 (`L-OPEN-14`). */
const FILTER_SECTION: Readonly<Record<LibraryFilter, LibrarySectionKey>> = {
  curated: 'curated',
  saved: 'favorites',
  history: 'finished',
  owned: 'finished',
  gifted: 'finished',
};

export interface LibraryListFixtureOptions {
  filter: LibraryFilter;
  limit: number;
  cursor?: string | undefined;
  shape?: LibraryOverviewShape;
  /** `paged` scenario — 2페이지로 나눠 `nextCursor` 를 실제로 돌린다. */
  paged?: boolean;
}

export const LIBRARY_LIST_NEXT_CURSOR = 'library-page-2';

export function createLibraryListFixture(
  clock: Clock,
  options: LibraryListFixtureOptions,
): {
  items: LibraryBook[];
  nextCursor: string | null;
} {
  const { filter, limit, cursor, shape = 'full', paged = false } = options;
  const overview = createLibraryOverviewFixture(clock, shape);
  const section = overview.sections.find((entry) => entry.key === FILTER_SECTION[filter]);
  const all = section?.items ?? [];

  if (!paged) return { items: all.slice(0, limit), nextCursor: null };

  // 결정적 2페이지: 앞 절반 → cursor → 뒤 절반.
  const half = Math.max(1, Math.ceil(all.length / 2));
  if (cursor === undefined) {
    return { items: all.slice(0, half), nextCursor: LIBRARY_LIST_NEXT_CURSOR };
  }

  return { items: all.slice(half, half + limit), nextCursor: null };
}

export function createGiftRequestListFixture(clock: Clock, empty = false): GiftRequest[] {
  if (empty) return [];

  const seeds: readonly { book: BookSummary; status: GiftRequest['status']; days: number }[] = [
    { book: bookAt(7), status: 'shipped', days: 3 },
    { book: bookAt(8), status: 'requested', days: 1 },
  ];

  return seeds.map((seed, index) => ({
    id: giftId(index),
    book: seed.book,
    status: seed.status,
    requestedAt: daysAgo(clock, seed.days),
    statusUpdatedAt: daysAgo(clock, Math.max(0, seed.days - 1)),
  }));
}

/** 증정 신청 생성 응답 — 신청 직후 상태는 `requested` 다. */
export function createGiftRequestFixture(clock: Clock, book: BookSummary, id: string): GiftRequest {
  return {
    id,
    book,
    status: 'requested',
    requestedAt: clock.nowIso(),
    statusUpdatedAt: clock.nowIso(),
  };
}

/** 등록 응답 — 직접 등록한 책 1권. 카탈로그에 없으면 `book: null` 이다. */
export function createAddedBookFixture(
  id: string,
  target: { book: BookSummary } | { title: string; author?: string | undefined },
): LibraryBook {
  const shared = {
    id,
    ownership: 'owned' as const,
    source: 'library_add' as const,
    capability: null,
    saved: false,
    savedAt: null,
    readCount: 0,
    sessionCount: 0,
    averageRating: null,
    firstReadAt: null,
    lastReadAt: null,
  };

  if ('book' in target) {
    return RenderableLibraryBookSchema.parse({ ...shared, book: target.book });
  }

  return RenderableLibraryBookSchema.parse({
    ...shared,
    book: null,
    userEnteredTitle: target.title,
    userEnteredAuthor: target.author ?? null,
  });
}

/** 서재 목록에서 책을 찾는다 — Mock 은 새 책을 만들지 않는다 (`P3-BIP-15`). */
export function findLibraryBook(bookId: string): BookSummary | undefined {
  return SHELF_BOOKS.find((book) => book.id === bookId);
}

export { SHELF_BOOKS };
