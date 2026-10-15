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
 * | **`book-already-owned`** | `BOOK_ALREADY_OWNED` | `/library/add` 중복 등록 안내 (Design Spec §7.2) |
 * | `paged` | `nextCursor` 2페이지 | "See all" 더 보기 (`L-OPEN-21`) |
 * | `book-saved` | 저장 상태로 **시작** (초기 상태는 `MockActivityApi` 의 덱 모양이 만든다) | `G-14` |
 * | `unsave` | 해제 성공 경로 | `G-13` 토글 + `libraryKeys.overview` 무효화 |
 * | `offline` | `NetworkError` | 실패 경로와 같게 다룬다 (사전 차단 UI 를 만들지 않는다) |
 *
 * ── 메서드 단위 override (Stage 4 `S4-C`, AC-4-87 · `stage-3-approvals.md` §30.7) ──
 * `?scenario=library.savebook:error` 는 **`saveBook` 만** 실패시키고 나머지 메서드는 그룹 지정
 * (없으면 `success`)을 따른다 → "목록 성공 + 저장만 실패" 를 실브라우저에서 재현한다.
 * 시도 카운터는 **그룹 단위 그대로**다 (Stage 3 동작 불변).
 *
 * **멱등**: 같은 책을 두 번 저장해도 같은 응답(`savedAt` 포함)이며 오류가 아니다. 그래서 이
 * Adapter 는 `savedAt` 을 **처음 저장 시각에 고정**한다 (주입 clock 기준).
 *
 * **`Idempotency-Key`** (`AC-3-36` · `QA-3-005`): 비멱등 POST 2종(`addOwnBook` ·
 * `createGiftRequest`)은 키를 **보관**한다. 같은 key + 같은 body 는 최초 응답을 그대로
 * 재생하고(새 리소스를 만들지 않는다), 같은 key + 다른 body 는 `IDEMPOTENCY_KEY_REUSED` 다.
 * Stage 2 `MockConsentApi` · `MockOnboardingApi` 와 **같은 방식**이다 — 서버 보관(24h)은
 * `P3-BIP-22` 로 Backend 몫이다.
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
  'book-already-owned',
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

/**
 * 같은 key 로 두 번 들어온 요청이 **같은 요청**인지 판단하는 기준 (서버 규약과 동일).
 *
 * `MockConsentApi` · `MockOnboardingApi` 의 `fingerprint` 와 같은 방식이다 — Stage 2 선례를
 * 그대로 따른다 (`QA-3-005`). 요청은 Adapter 경계에서 이미 schema parse 를 통과했으므로
 * 키 순서가 정규화되어 있고, `JSON.stringify` 비교가 결정적이다.
 */
function fingerprint(request: AddOwnBookRequest | CreateGiftRequestRequest): string {
  return JSON.stringify(request);
}

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

  /**
   * `Idempotency-Key` → (요청 지문, 최초 응답). 실제 서버는 24h 보관한다 (`P3-BIP-22`).
   *
   * `addOwnBook` · `createGiftRequest` 는 **비멱등 POST** 이고 `Idempotency-Key` 가 필수다
   * (`shared/api/library-api.ts` 표). 보관이 없으면 같은 키로 재시도할 때 리소스가 두 번
   * 만들어지고 `IDEMPOTENCY_KEY_REUSED` 경로가 재현되지 않는다 (`AC-3-36` · `QA-3-005`).
   * 응답을 **그대로** 재생하므로 `idFactory.next()` 가 두 번째 id 를 만들지 않는다.
   */
  const addBookIdempotency = new Map<string, { body: string; response: LibraryBook }>();
  const giftIdempotency = new Map<string, { body: string; response: GiftRequest }>();

  /**
   * 보관된 응답을 재생하거나, 같은 키가 **다른 body** 로 재사용되면 거절한다.
   *
   * `undefined` 를 돌려주면 "처음 보는 키" 다 — 호출자가 평소 경로로 진행한다.
   */
  function replay<T>(
    bucket: Map<string, { body: string; response: T }>,
    key: string,
    body: string,
  ): T | undefined {
    const stored = bucket.get(key);
    if (stored === undefined) return undefined;

    // 같은 key + 같은 body → 최초 응답 재생. 새 리소스를 만들지 않는다.
    if (stored.body === body) return stored.response;

    return fail('IDEMPOTENCY_KEY_REUSED', 'That idempotency key was used with another body.');
  }

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

      const scenario = store.resolve(libraryScenarioGroup, 'getOverview');
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

      const scenario = store.resolve(libraryScenarioGroup, 'getList');
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

      /*
        멱등 판정이 **시나리오 분기보다 앞**이다 (Stage 2 선례와 같은 자리) — 한 번 성공한
        요청은 그 뒤 scenario 가 무엇이든 같은 응답을 돌려줘야 재시도가 안전하다.
      */
      const body = fingerprint(parsed);
      const replayed = replay(addBookIdempotency, options.idempotencyKey, body);
      if (replayed !== undefined) return replayed;

      const scenario = store.resolve(libraryScenarioGroup, 'addOwnBook');
      const attempt = consumeAttempt(store, libraryScenarioGroup.group, options.signal);

      /*
        중복 등록 — `gift-duplicate` 와 같은 자리에서 분기한다. 등록 **전**에 거절되는
        경로이므로 `deliver`(지연·재시도) 보다 앞이다 (Design Spec §7.2 `InlineAlert tone=info`).
      */
      if (scenario === 'book-already-owned') {
        return fail('BOOK_ALREADY_OWNED', 'This book is already in the library.');
      }

      const run = (): LibraryBook => {
        const { target } = parsed;

        const added = (): LibraryBook => {
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

        // 성공한 응답만 보관한다 — 실패한 시도는 같은 key 로 재시도해 성공할 수 있어야 한다.
        const response = added();
        addBookIdempotency.set(options.idempotencyKey, { body, response });
        return response;
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

      const scenario = store.resolve(libraryScenarioGroup, 'getGiftRequests');
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

      const body = fingerprint(parsed);
      const replayed = replay(giftIdempotency, options.idempotencyKey, body);
      if (replayed !== undefined) return replayed;

      const scenario = store.resolve(libraryScenarioGroup, 'createGiftRequest');
      const attempt = consumeAttempt(store, libraryScenarioGroup.group, options.signal);

      if (scenario === 'gift-duplicate') {
        return fail('GIFT_REQUEST_DUPLICATE', 'This book was already requested.');
      }

      const run = (): GiftRequest => {
        const book = findLibraryBook(parsed.bookId);
        if (book === undefined) fail('RESOURCE_NOT_FOUND', 'Unknown book.');

        const response = parseResponse(
          GiftRequestSchema,
          createGiftRequestFixture(clock, book, idFactory.next()),
          { operation: GIFT_CREATE_OPERATION, direction: 'response' },
        );

        giftIdempotency.set(options.idempotencyKey, { body, response });
        return response;
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

      const scenario = store.resolve(libraryScenarioGroup, 'saveBook');
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

      const scenario = store.resolve(libraryScenarioGroup, 'unsaveBook');
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
