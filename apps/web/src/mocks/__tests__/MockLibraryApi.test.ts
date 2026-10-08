/**
 * `MockLibraryApi` — 서재 Mock 계약 (`docs/API_CONTRACTS.md` §3.7 + Library Plan §7.5 · §8).
 *
 * 검증하는 것
 *  - **contracts parse**: 요청·응답 양쪽이 schema 를 통과한다 (`rules/architecture.md` §4).
 *  - **멱등**: 같은 책을 두 번 저장해도 **같은 응답**(`savedAt` 포함)이고 오류가 아니다.
 *  - **상한 없음**: 여러 권을 저장해도 거부되지 않는다 (Figma 에 상한 UI 가 없다).
 *  - **신규 Error Code 0건**: 없는 책은 `RESOURCE_NOT_FOUND` 로만 거부한다.
 *  - **결정성**: 같은 key 를 두 번 불러도 같은 응답 바이트다.
 *  - **Privacy**: 요청 로그에 아동 데이터 키가 없다.
 */
import {
  GiftRequestListResponseSchema,
  GiftRequestSchema,
  LibraryBookSchema,
  LibraryListResponseSchema,
  LibraryOverviewSchema,
  SavedBookSchema,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createImmediateTimer, isHaruApiError } from '../../shared/api/helpers';
import { createFixedClock } from '../../shared/lib/clock';
import { createSeededIdFactory } from '../../shared/lib/idFactory';
import { DECK_BOOKS } from '../fixtures/saved-books';
import { createMockLibraryApi, LIBRARY_SCENARIO_KEYS } from '../library/MockLibraryApi';
import { createRequestLog, findChildDataKeys } from '../request-log';
import { createScenarioSource, createScenarioStore } from '../scenarios';

const CHILD_ID = '44444444-4444-4444-8444-444444444444';
const EPOCH = Date.UTC(2026, 0, 1);
const BOOK = DECK_BOOKS[0]?.id ?? '';
const OTHER_BOOK = DECK_BOOKS[1]?.id ?? '';

function libraryApi(scenario: string) {
  const requestLog = createRequestLog();
  const api = createMockLibraryApi({
    store: createScenarioStore([createScenarioSource('url', { library: scenario })]),
    clock: createFixedClock(EPOCH),
    idFactory: createSeededIdFactory('test'),
    timer: createImmediateTimer(),
    requestLog,
  });

  return { api, requestLog };
}

describe('scenario 목록 (API_CONTRACTS §5.4 catalogue)', () => {
  /*
   * Library 1라운드에서 **`empty` 가 들어온다** — 저장/해제만 있던 시절에는 "빈 결과" 가
   * 없었지만(상태 설정), 이제 이 그룹이 서재 **목록 조회**를 함께 다룬다 (Plan §8.1).
   * `favorites-empty` 가 특히 중요하다 — **저장 전 기본 상태**이고 가장 흔한 실제 상태다.
   */
  it('공통 5종 + offline + Library 특화 13종이다', () => {
    expect([...LIBRARY_SCENARIO_KEYS]).toStrictEqual([
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
    ]);
  });
});

describe('overview — 화면 1회 조회 (P3-BIP-18)', () => {
  it('`success` 는 4섹션을 채워 돌려주고 schema 를 통과한다', async () => {
    const { api } = libraryApi('success');
    const overview = await api.getOverview({ childId: CHILD_ID });

    expect(LibraryOverviewSchema.safeParse(overview).success).toBe(true);
    expect(overview.sections.map((section) => section.key)).toStrictEqual([
      'curated',
      'favorites',
      'finished',
    ]);
    expect(overview.readingNow).not.toBeNull();
  });

  it('캐러셀이 3-up × 3페이지를 그릴 수 있다 (dots 는 `ceil(items / 3)` 파생)', async () => {
    const { api } = libraryApi('success');
    const overview = await api.getOverview({ childId: CHILD_ID });
    const curated = overview.sections.find((section) => section.key === 'curated');

    expect(curated?.items).toHaveLength(9);
  });

  it('`reading-now-none` 은 `readingNow` 를 비운다 (블록 미렌더 경로)', async () => {
    const { api } = libraryApi('reading-now-none');
    const overview = await api.getOverview({ childId: CHILD_ID });

    expect(overview.readingNow).toBeNull();
    // 나머지 섹션은 그대로 남는다 — "섹션은 사라지지 않는다".
    expect(overview.sections).toHaveLength(3);
  });

  it('⭐ `favorites-empty` 는 Favorites 만 0건이다 (저장 전 기본 상태)', async () => {
    const { api } = libraryApi('favorites-empty');
    const overview = await api.getOverview({ childId: CHILD_ID });
    const byKey = new Map(overview.sections.map((section) => [section.key, section.items.length]));

    expect(byKey.get('favorites')).toBe(0);
    expect(byKey.get('curated')).toBeGreaterThan(0);
    expect(byKey.get('finished')).toBeGreaterThan(0);
  });

  it.each([
    ['finished-empty', 'finished'],
    ['curated-empty', 'curated'],
  ] as const)('`%s` 는 %s 만 0건이다', async (scenario, key) => {
    const { api } = libraryApi(scenario);
    const overview = await api.getOverview({ childId: CHILD_ID });
    const byKey = new Map(overview.sections.map((section) => [section.key, section.items.length]));

    expect(byKey.get(key)).toBe(0);
    expect([...byKey.values()].filter((count) => count > 0).length).toBeGreaterThan(0);
  });

  it('`empty` 는 전체 0건이다 — 3섹션 안내가 동시에 뜬다', async () => {
    const { api } = libraryApi('empty');
    const overview = await api.getOverview({ childId: CHILD_ID });

    expect(overview.readingNow).toBeNull();
    expect(overview.sections.every((section) => section.items.length === 0)).toBe(true);
  });

  it('`shelf-partial` 은 캐러셀 1권이다 (Figma 에 없는 상태)', async () => {
    const { api } = libraryApi('shelf-partial');
    const overview = await api.getOverview({ childId: CHILD_ID });

    expect(overview.sections.find((section) => section.key === 'curated')?.items).toHaveLength(1);
  });

  it('`unrated` 는 평점을 비운다 (행 우측 메타 비움 — L-OPEN-22)', async () => {
    const { api } = libraryApi('unrated');
    const overview = await api.getOverview({ childId: CHILD_ID });
    const finished = overview.sections.find((section) => section.key === 'finished');

    expect(finished?.items.every((item) => item.averageRating === null)).toBe(true);
  });

  it('`user-entered-book` 은 `book: null` + 제목만 있는 행을 섞는다', async () => {
    const { api } = libraryApi('user-entered-book');
    const overview = await api.getOverview({ childId: CHILD_ID });
    const finished = overview.sections.find((section) => section.key === 'finished');
    const entered = finished?.items.find((item) => item.book === null);

    expect(entered?.userEnteredTitle).not.toBeUndefined();
  });

  it('`gift-pending` 은 증정 대기 행을 섞는다 (상태는 표식이 아니라 데이터다)', async () => {
    const { api } = libraryApi('gift-pending');
    const overview = await api.getOverview({ childId: CHILD_ID });
    const finished = overview.sections.find((section) => section.key === 'finished');

    expect(finished?.items.some((item) => item.ownership === 'gift_pending')).toBe(true);
  });

  it('진행률은 서버 값이다 — fixture 가 `progressRatio` 를 직접 담는다', async () => {
    const { api } = libraryApi('success');
    const overview = await api.getOverview({ childId: CHILD_ID });

    expect(overview.readingNow?.readingProgress?.progressRatio).toBe(0.552);
    expect(overview.readingNow?.readingProgress?.plannedNights).toBe(5);
  });

  it('두 번 불러도 응답 바이트가 같다 (결정성 — 주입 clock 상대 오프셋)', async () => {
    const first = await libraryApi('success').api.getOverview({ childId: CHILD_ID });
    const second = await libraryApi('success').api.getOverview({ childId: CHILD_ID });

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('`error` 는 Error Envelope 을 던지고 `offline` 은 네트워크 오류다', async () => {
    await expect(libraryApi('error').api.getOverview({ childId: CHILD_ID })).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'INTERNAL_ERROR',
    );
    await expect(libraryApi('offline').api.getOverview({ childId: CHILD_ID })).rejects.toSatisfy(
      (error: unknown) => !isHaruApiError(error),
    );
  });

  it('`retry` 는 1회차만 실패한다', async () => {
    const { api } = libraryApi('retry');
    await expect(api.getOverview({ childId: CHILD_ID })).rejects.toBeDefined();

    expect((await api.getOverview({ childId: CHILD_ID })).sections).toHaveLength(3);
  });
});

describe('목록 — "See all" · 더 보기 (L-OPEN-21)', () => {
  it('요청 query 가 contracts schema 를 통과하고 limit 기본값이 채워진다', async () => {
    const { api, requestLog } = libraryApi('success');
    const page = await api.getList({ childId: CHILD_ID, query: { filter: 'saved' } });

    expect(LibraryListResponseSchema.safeParse(page).success).toBe(true);
    expect(requestLog.entries().at(-1)?.payload).toMatchObject({ filter: 'saved', limit: 20 });
  });

  it('잘못된 filter 는 요청 단계에서 거부된다 (contracts error)', async () => {
    const { api } = libraryApi('success');

    await expect(
      // @ts-expect-error — 잘못된 filter 를 **런타임에서** 거부하는지 보는 테스트다.
      api.getList({ childId: CHILD_ID, query: { filter: 'nope' } }),
    ).rejects.toBeDefined();
  });

  it('`paged` 는 `nextCursor` 를 주고 2페이지에서 끝난다', async () => {
    const { api } = libraryApi('paged');
    const first = await api.getList({ childId: CHILD_ID, query: { filter: 'curated' } });

    expect(first.nextCursor).not.toBeNull();

    const second = await api.getList({
      childId: CHILD_ID,
      query: { filter: 'curated', cursor: first.nextCursor ?? '' },
    });

    expect(second.nextCursor).toBeNull();
    expect(second.items.length).toBeGreaterThan(0);
  });

  it('쿼리 축과 표시 축이 1:1 이 아니다 — `saved` 는 Favorites 를 돌려준다', async () => {
    const { api } = libraryApi('success');
    const page = await api.getList({ childId: CHILD_ID, query: { filter: 'saved' } });

    expect(page.items.every((item) => item.saved)).toBe(true);
  });
});

describe('직접 등록 (FR-23) · 증정 (FR-22)', () => {
  const mutation = { idempotencyKey: '88888888-8888-4888-8888-888888888888' };

  it('bookId 로 등록하면 `LibraryBook` 이 돌아온다', async () => {
    const { api } = libraryApi('success');
    const added = await api.addOwnBook(
      { childId: CHILD_ID, body: { target: { bookId: BOOK } } },
      mutation,
    );

    expect(LibraryBookSchema.safeParse(added).success).toBe(true);
    expect(added.source).toBe('library_add');
  });

  it('제목만으로 등록하면 `book: null` + `userEnteredTitle` 이다', async () => {
    const { api } = libraryApi('success');
    const added = await api.addOwnBook(
      { childId: CHILD_ID, body: { target: { title: 'Moonbeam' } } },
      mutation,
    );

    expect(added.book).toBeNull();
    expect(added.userEnteredTitle).toBe('Moonbeam');
  });

  it('증정 목록이 schema 를 통과한다', async () => {
    const { api } = libraryApi('success');
    const page = await api.getGiftRequests({ childId: CHILD_ID });

    expect(GiftRequestListResponseSchema.safeParse(page).success).toBe(true);
    expect(page.items.length).toBeGreaterThan(0);
  });

  it('증정 신청은 `requested` 로 시작한다', async () => {
    const { api } = libraryApi('success');
    const created = await api.createGiftRequest(
      { childId: CHILD_ID, body: { bookId: BOOK } },
      mutation,
    );

    expect(GiftRequestSchema.safeParse(created).success).toBe(true);
    expect(created.status).toBe('requested');
  });

  /* `/library/add` 중복 등록 — Design Spec §7.2 의 `InlineAlert tone=info` 경로. */
  it('`book-already-owned` 는 `BOOK_ALREADY_OWNED` 다', async () => {
    const { api } = libraryApi('book-already-owned');

    await expect(
      api.addOwnBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } }, mutation),
    ).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'BOOK_ALREADY_OWNED',
    );
  });

  it('`gift-duplicate` 는 `GIFT_REQUEST_DUPLICATE` 다', async () => {
    const { api } = libraryApi('gift-duplicate');

    await expect(
      api.createGiftRequest({ childId: CHILD_ID, body: { bookId: BOOK } }, mutation),
    ).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'GIFT_REQUEST_DUPLICATE',
    );
  });
});

describe('저장 — contracts parse · 멱등 (§3.7.3)', () => {
  it('bookId 로 저장하면 `SavedBook` 이 돌아온다', async () => {
    const { api } = libraryApi('success');
    const saved = await api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } });

    expect(SavedBookSchema.safeParse(saved).success).toBe(true);
    expect(saved.saved).toBe(true);
    expect(saved.book.id).toBe(BOOK);
    expect(saved.savedAt).not.toBeNull();
  });

  it('제목으로도 저장된다 (카탈로그에 없는 책 경로)', async () => {
    const { api } = libraryApi('success');
    const saved = await api.saveBook({
      childId: CHILD_ID,
      body: { target: { title: DECK_BOOKS[1]?.title ?? '' } },
    });

    expect(saved.book.id).toBe(OTHER_BOOK);
  });

  it('같은 책을 두 번 저장해도 **같은 응답**이다 (오류가 아니다)', async () => {
    const { api } = libraryApi('success');
    const first = await api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } });
    const second = await api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } });

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('상한이 없다 — 여러 권을 연달아 저장해도 거부되지 않는다', async () => {
    const { api } = libraryApi('success');

    for (const book of DECK_BOOKS) {
      const saved = await api.saveBook({
        childId: CHILD_ID,
        body: { target: { bookId: book.id } },
      });
      expect(saved.saved).toBe(true);
    }
  });

  it('없는 책은 `RESOURCE_NOT_FOUND` 다 (신규 Error Code 0건)', async () => {
    const { api } = libraryApi('success');

    await expect(
      api.saveBook({
        childId: CHILD_ID,
        body: { target: { bookId: '11111111-1111-4111-8111-999999999999' } },
      }),
    ).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'RESOURCE_NOT_FOUND',
    );
  });
});

describe('해제 — 토글 (`G-13`)', () => {
  it('해제하면 `saved: false` · `savedAt: null` 이다', async () => {
    const { api } = libraryApi('success');
    await api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } });
    const released = await api.unsaveBook({ childId: CHILD_ID, bookId: BOOK });

    expect(SavedBookSchema.safeParse(released).success).toBe(true);
    expect(released.saved).toBe(false);
    expect(released.savedAt).toBeNull();
  });

  it('해제도 멱등이다 — 저장한 적 없는 책을 해제해도 오류가 아니다', async () => {
    const { api } = libraryApi('success');
    const released = await api.unsaveBook({ childId: CHILD_ID, bookId: BOOK });

    expect(released.saved).toBe(false);
  });
});

describe('시나리오', () => {
  it('`error` 는 Error Envelope 을 던진다', async () => {
    const { api } = libraryApi('error');

    await expect(
      api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } }),
    ).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'INTERNAL_ERROR',
    );
  });

  it('`retry` 는 1회차만 실패한다', async () => {
    const { api } = libraryApi('retry');

    await expect(
      api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } }),
    ).rejects.toBeDefined();

    const saved = await api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } });
    expect(saved.saved).toBe(true);
  });

  it('`offline` 은 네트워크 오류다 (Error Envelope 이 아니다)', async () => {
    const { api } = libraryApi('offline');

    await expect(
      api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } }),
    ).rejects.toSatisfy((error: unknown) => !isHaruApiError(error));
  });

  it('`loading` 은 지연 후 성공한다 (주입 timer)', async () => {
    const { api } = libraryApi('loading');
    const saved = await api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } });

    expect(saved.saved).toBe(true);
  });

  it('`success` 를 두 번 불러도 응답이 같다 (결정성)', async () => {
    const first = await libraryApi('success').api.saveBook({
      childId: CHILD_ID,
      body: { target: { bookId: BOOK } },
    });
    const second = await libraryApi('success').api.saveBook({
      childId: CHILD_ID,
      body: { target: { bookId: BOOK } },
    });

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});

describe('Privacy — 요청 로그', () => {
  it('아동 데이터 키가 요청 본문에 실리지 않는다 (경로 파라미터 `childId` 포함)', async () => {
    const { api, requestLog } = libraryApi('success');
    await api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } });
    await api.unsaveBook({ childId: CHILD_ID, bookId: BOOK });

    expect(findChildDataKeys(requestLog.entries())).toStrictEqual([]);
    expect(JSON.stringify(requestLog.entries())).not.toContain(CHILD_ID);
  });

  it('모든 endpoint 가 기록된다', async () => {
    const { api, requestLog } = libraryApi('success');
    await api.getOverview({ childId: CHILD_ID });
    await api.getList({ childId: CHILD_ID, query: { filter: 'saved' } });
    await api.getGiftRequests({ childId: CHILD_ID });
    await api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } });
    await api.unsaveBook({ childId: CHILD_ID, bookId: BOOK });

    expect(requestLog.entries().map((entry) => entry.operation)).toStrictEqual([
      'GET /v1/children/:childId/library/overview',
      'GET /v1/children/:childId/library',
      'GET /v1/children/:childId/gift-requests',
      'PUT /v1/children/:childId/saved-books',
      'DELETE /v1/children/:childId/saved-books/:bookId',
    ]);
  });

  it('읽기 호출에도 `childId` 가 payload 로 새지 않는다', async () => {
    const { api, requestLog } = libraryApi('success');
    await api.getOverview({ childId: CHILD_ID });
    await api.getList({ childId: CHILD_ID, query: { filter: 'history' } });

    expect(findChildDataKeys(requestLog.entries())).toStrictEqual([]);
    expect(JSON.stringify(requestLog.entries())).not.toContain(CHILD_ID);
  });
});
