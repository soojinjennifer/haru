/**
 * `MockLibraryApi` — 서재 Mock Adapter (`docs/API_CONTRACTS.md` §3.7 + Library Plan §7.5 · §8).
 *
 * ── 공통 5종 (Plan §8.1) ──
 * | key | 동작 |
 * |---|---|
 * | `success` | 4섹션 전부 채워진 기본 상태 |
 * | `loading` | 주입 timer 로 지연 후 성공 (섹션별 Skeleton 확인) |
 * | `empty` | 전체 0건 — 3섹션 안내가 **동시에** 뜨고 `readingNow` 가 `null` |
 * | `error` | `INTERNAL_ERROR` Error Envelope → `ErrorState` + Retry |
 * | `retry` | 1회차 실패 → 2회차부터 성공 |
 *
 * ── Library 특화 (Plan §8.2) ──
 * | key | 동작 | 왜 |
 * |---|---|---|
 * | **`favorites-empty`** | `Favorites` 만 0건 | **저장 전 기본 상태 = 가장 흔한 실제 상태** |
 * | `finished-empty` | `Finished together` 만 0건 | 히스토리 0건 안내 |
 * | `curated-empty` | 큐레이션만 0건 | 운영 데이터 공백 (`P3-BIP-04`) |
 * | `reading-now-none` | `readingNow: null` | **블록 미렌더 + 간격 회수** (유일한 섹션 사라짐 예외) |
 * | `shelf-partial` | 캐러셀 1권 | Figma 는 항상 3-up — 1~2권 레이아웃이 **없다** |
 * | `unrated` | `averageRating: null` | 행 우측 메타를 **비우는** 경로 (`L-OPEN-22`) |
 * | `user-entered-book` | `book: null` + 제목만 | `BookCover` placeholder |
 * | `gift-pending` | `ownership: gift_pending` + 배송 상태 | PRD §13 증정 대기 |
 * | `gift-duplicate` | `GIFT_REQUEST_DUPLICATE` | 중복 신청 안내 |
 * | `paged` | `nextCursor` 2페이지 | "See all" 더 보기 (`L-OPEN-21`) |
 * | `book-saved` | 저장 상태로 **시작** (초기 상태는 `MockActivityApi` 의 덱 모양이 만든다) | `G-14` |
 * | `unsave` | 해제 성공 경로 | `G-13` 토글 + `libraryKeys.overview` 무효화 |
 * | `offline` | `NetworkError` | 실패 경로와 같게 다룬다 (사전 차단 UI 를 만들지 않는다) |
 *
 * **멱등**: 같은 책을 두 번 저장해도 같은 응답(`savedAt` 포함)이며 오류가 아니다. 그래서 이
 * Adapter 는 `savedAt` 을 **처음 저장 시각에 고정**한다 (주입 clock 기준).
 *
 * **결정성**: 같은 key 를 반복 호출하면 같은 응답 바이트가 나온다 — 시각은 주입 clock 의
 * 기준 시각에서 상대 오프셋으로만 만든다 (`fixtures/library.ts`).
 *
 * ⚠ 이 Adapter 는 **무상태**다 (`savedAt` 멱등 맵만 예외). 그래서 `unsave` 후 `getOverview`
 * 응답의 `Favorites` 가 줄어들지는 **않는다** — 해제 성공과 캐시 무효화 경로를 검증하는 key 이고,
 * "해제가 목록에 반영된다" 를 Mock 안에서 상태로 재현하려면 overview 를 상태화해야 한다.
 * 그 판단은 서재 화면을 만드는 2라운드에서 한다.
 */
import {
  AddOwnBookRequestSchema,
  CreateGiftRequestRequestSchema,
  GiftRequestListResponseSchema,
  GiftRequestSchema,
  HaruApiError,
  LibraryBookSchema,
  LibraryListRequestSchema,
  LibraryListResponseSchema,
  LibraryOverviewSchema,
  SaveBookRequestSchema,
  SavedBookSchema,
  type AddOwnBookRequest,
  type CreateGiftRequestRequest,
  type ErrorCode,
  type GiftRequest,
  type GiftRequestListResponse,
  type LibraryBook,
  type LibraryListRequestInput,
  type LibraryListResponse,
  type LibraryOverview,
  type SaveBookRequest,
  type SavedBook,
} from '@haru/contracts';

import {
  buildErrorEnvelope,
  NetworkError,
  parseRequest,
  parseResponse,
  withDelay,
  type Timer,
} from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { ApiMutationOptions } from '../../shared/api/options';
import type { LibraryApi } from '../../shared/api/library-api';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createAddedBookFixture,
  createGiftRequestFixture,
  createGiftRequestListFixture,
  createLibraryListFixture,
  createLibraryOverviewFixture,
  findLibraryBook,
  type LibraryOverviewShape,
} from '../fixtures/library';
import { findDeckBook, resolveSaveTarget } from '../fixtures/saved-books';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const LIBRARY_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
  'favorites-empty',
  'finished-empty',
  'curated-empty',
  'reading-now-none',
  'shelf-partial',
  'unrated',
  'user-entered-book',
  'gift-pending',
  'gift-duplicate',
  'paged',
  'book-saved',
  'unsave',
] as const;

export type LibraryScenarioKey = (typeof LIBRARY_SCENARIO_KEYS)[number];

export const libraryScenarioGroup: ScenarioGroupDefinition<LibraryScenarioKey> = {
  group: 'library',
  keys: LIBRARY_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 "1.5–3s" 보다 짧다 — 저장은 작은 쓰기다. 실제 대기는 주입 timer 가 정한다. */
export const LIBRARY_LOADING_DELAY_MS = 900;

/** 서재 조회는 화면 1회 조회라 카드와 같은 체감 기준(`P3-BIP-10` 2초)을 쓴다. */
export const LIBRARY_OVERVIEW_LOADING_DELAY_MS = 1_500;

const SAVE_OPERATION = 'PUT /v1/children/:childId/saved-books';
const UNSAVE_OPERATION = 'DELETE /v1/children/:childId/saved-books/:bookId';
const OVERVIEW_OPERATION = 'GET /v1/children/:childId/library/overview';
const LIST_OPERATION = 'GET /v1/children/:childId/library';
const ADD_BOOK_OPERATION = 'POST /v1/children/:childId/library/books';
const GIFT_LIST_OPERATION = 'GET /v1/children/:childId/gift-requests';
const GIFT_CREATE_OPERATION = 'POST /v1/children/:childId/gift-requests';

/** scenario key → overview fixture 모양. 없으면 `full` 이다. */
const OVERVIEW_SHAPES: Partial<Record<LibraryScenarioKey, LibraryOverviewShape>> = {
  empty: 'empty',
  'favorites-empty': 'favorites-empty',
  'finished-empty': 'finished-empty',
  'curated-empty': 'curated-empty',
  'reading-now-none': 'reading-now-none',
  // 1권 모양을 기본으로 쓴다 — 2권 모양은 fixture 가 `shelf-partial-2` 로 함께 제공한다.
  'shelf-partial': 'shelf-partial-1',
  unrated: 'unrated',
  'user-entered-book': 'user-entered-book',
  'gift-pending': 'gift-pending',
};

export interface MockLibraryApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  requestLog?: RequestLog | undefined;
}

export function createMockLibraryApi(deps: MockLibraryApiDeps): LibraryApi {
  const { store, clock, idFactory, timer, requestLog } = deps;

  /** 저장된 책 id → 최초 저장 시각. 멱등성을 이 맵이 보장한다. */
  const savedAtById = new Map<string, string>();

  function fail(code: ErrorCode, message: string): never {
    throw HaruApiError.fromEnvelope(
      buildErrorEnvelope(code, message, { requestId: idFactory.next() }),
    );
  }

  function respond(bookId: string, saved: boolean, operation: string): SavedBook {
    const book = findDeckBook(bookId);
    if (book === undefined) fail('RESOURCE_NOT_FOUND', 'Unknown book.');

    if (saved && !savedAtById.has(bookId)) {
      savedAtById.set(bookId, clock.nowIso());
    }
    if (!saved) savedAtById.delete(bookId);

    return parseResponse(
      SavedBookSchema,
      { book, saved, savedAt: saved ? (savedAtById.get(bookId) ?? null) : null },
      { operation, direction: 'response' },
    );
  }

  /**
   * 읽기 호출의 공통 실패 경로. 네 key(`loading`·`error`·`retry`·`offline`)는 **응답 모양이
   * 아니라 전달 방식**이라 fixture 가 아니라 여기에서 분기한다.
   */
  function deliver<T>(
    scenario: LibraryScenarioKey,
    attempt: number,
    delayMs: number,
    run: () => T,
    message: string,
    signal: AbortSignal | undefined,
  ): Promise<T> | T {
    switch (scenario) {
      case 'loading':
        return withDelay(timer, delayMs, run, signal);
      case 'error':
        return fail('INTERNAL_ERROR', message);
      case 'retry':
        return attempt === 1 ? fail('INTERNAL_ERROR', message) : run();
      case 'offline':
        throw new NetworkError('Mock adapter is offline.');
      default:
        return run();
    }
  }

  return {
    async getOverview(request: { childId: string }, options: ApiRequestOptions = {}) {
      // 경로 파라미터(`childId`)는 payload 로 남기지 않는다 — `MockHomeApi` 주석 참조.
      void request.childId;
      requestLog?.record(OVERVIEW_OPERATION);

      const scenario = store.resolve(libraryScenarioGroup);
      const attempt = consumeAttempt(store, libraryScenarioGroup.group, options.signal);

      const run = (): LibraryOverview =>
        parseResponse(
          LibraryOverviewSchema,
          createLibraryOverviewFixture(clock, OVERVIEW_SHAPES[scenario] ?? 'full'),
          { operation: OVERVIEW_OPERATION, direction: 'response' },
        );

      return deliver(
        scenario,
        attempt,
        LIBRARY_OVERVIEW_LOADING_DELAY_MS,
        run,
        'Mock library overview failed.',
        options.signal,
      );
    },

    async getList(
      request: { childId: string; query: LibraryListRequestInput },
      options: ApiRequestOptions = {},
    ) {
      void request.childId;

      const query = parseRequest(LibraryListRequestSchema, request.query, {
        operation: LIST_OPERATION,
      });
      requestLog?.record(LIST_OPERATION, query);

      const scenario = store.resolve(libraryScenarioGroup);
      const attempt = consumeAttempt(store, libraryScenarioGroup.group, options.signal);

      const run = (): LibraryListResponse =>
        parseResponse(
          LibraryListResponseSchema,
          createLibraryListFixture(clock, {
            filter: query.filter,
            limit: query.limit,
            cursor: query.cursor,
            shape: OVERVIEW_SHAPES[scenario] ?? 'full',
            paged: scenario === 'paged',
          }),
          { operation: LIST_OPERATION, direction: 'response' },
        );

      return deliver(
        scenario,
        attempt,
        LIBRARY_OVERVIEW_LOADING_DELAY_MS,
        run,
        'Mock library list failed.',
        options.signal,
      );
    },

    async addOwnBook(
      request: { childId: string; body: AddOwnBookRequest },
      options: ApiMutationOptions,
    ) {
      void request.childId;

      const parsed = parseRequest(AddOwnBookRequestSchema, request.body, {
        operation: ADD_BOOK_OPERATION,
      });
      requestLog?.record(ADD_BOOK_OPERATION, parsed);

      const scenario = store.resolve(libraryScenarioGroup);
      const attempt = consumeAttempt(store, libraryScenarioGroup.group, options.signal);

      const run = (): LibraryBook => {
        const { target } = parsed;

        if ('bookId' in target) {
          const book = findLibraryBook(target.bookId);
          if (book === undefined) fail('RESOURCE_NOT_FOUND', 'Unknown book.');

          return parseResponse(
            LibraryBookSchema,
            createAddedBookFixture(idFactory.next(), { book }),
            { operation: ADD_BOOK_OPERATION, direction: 'response' },
          );
        }

        return parseResponse(
          LibraryBookSchema,
          createAddedBookFixture(idFactory.next(), {
            title: target.title,
            author: target.author,
          }),
          { operation: ADD_BOOK_OPERATION, direction: 'response' },
        );
      };

      return deliver(
        scenario,
        attempt,
        LIBRARY_LOADING_DELAY_MS,
        run,
        'Mock add book failed.',
        options.signal,
      );
    },

    async getGiftRequests(request: { childId: string }, options: ApiRequestOptions = {}) {
      void request.childId;
      requestLog?.record(GIFT_LIST_OPERATION);

      const scenario = store.resolve(libraryScenarioGroup);
      const attempt = consumeAttempt(store, libraryScenarioGroup.group, options.signal);

      const run = (): GiftRequestListResponse =>
        parseResponse(
          GiftRequestListResponseSchema,
          {
            items: createGiftRequestListFixture(clock, scenario === 'empty'),
            nextCursor: null,
          },
          { operation: GIFT_LIST_OPERATION, direction: 'response' },
        );

      return deliver(
        scenario,
        attempt,
        LIBRARY_LOADING_DELAY_MS,
        run,
        'Mock gift request list failed.',
        options.signal,
      );
    },

    async createGiftRequest(
      request: { childId: string; body: CreateGiftRequestRequest },
      options: ApiMutationOptions,
    ) {
      void request.childId;

      const parsed = parseRequest(CreateGiftRequestRequestSchema, request.body, {
        operation: GIFT_CREATE_OPERATION,
      });
      requestLog?.record(GIFT_CREATE_OPERATION, parsed);

      const scenario = store.resolve(libraryScenarioGroup);
      const attempt = consumeAttempt(store, libraryScenarioGroup.group, options.signal);

      if (scenario === 'gift-duplicate') {
        return fail('GIFT_REQUEST_DUPLICATE', 'This book was already requested.');
      }

      const run = (): GiftRequest => {
        const book = findLibraryBook(parsed.bookId);
        if (book === undefined) fail('RESOURCE_NOT_FOUND', 'Unknown book.');

        return parseResponse(
          GiftRequestSchema,
          createGiftRequestFixture(clock, book, idFactory.next()),
          { operation: GIFT_CREATE_OPERATION, direction: 'response' },
        );
      };

      return deliver(
        scenario,
        attempt,
        LIBRARY_LOADING_DELAY_MS,
        run,
        'Mock gift request failed.',
        options.signal,
      );
    },

    async saveBook(
      request: { childId: string; body: SaveBookRequest },
      options: ApiRequestOptions = {},
    ) {
      void request.childId;

      const parsed = parseRequest(SaveBookRequestSchema, request.body, {
        operation: SAVE_OPERATION,
      });
      requestLog?.record(SAVE_OPERATION, parsed);

      const scenario = store.resolve(libraryScenarioGroup);
      const attempt = consumeAttempt(store, libraryScenarioGroup.group, options.signal);
      const bookId = resolveSaveTarget(parsed.target);
      if (bookId === undefined) fail('RESOURCE_NOT_FOUND', 'Unknown book.');

      const run = (): SavedBook => respond(bookId, true, SAVE_OPERATION);

      return deliver(
        scenario,
        attempt,
        LIBRARY_LOADING_DELAY_MS,
        run,
        'Mock save failed.',
        options.signal,
      );
    },

    async unsaveBook(
      request: { childId: string; bookId: string },
      options: ApiRequestOptions = {},
    ) {
      void request.childId;
      requestLog?.record(UNSAVE_OPERATION, { bookId: request.bookId });

      const scenario = store.resolve(libraryScenarioGroup);
      const attempt = consumeAttempt(store, libraryScenarioGroup.group, options.signal);

      const run = (): SavedBook => respond(request.bookId, false, UNSAVE_OPERATION);

      return deliver(
        scenario,
        attempt,
        LIBRARY_LOADING_DELAY_MS,
        run,
        'Mock unsave failed.',
        options.signal,
      );
    },
  };
}
