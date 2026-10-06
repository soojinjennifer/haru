/**
 * `MockLibraryApi` — `★ Save` Mock 계약 (`docs/API_CONTRACTS.md` §3.7, approvals §12.8 · §12.10).
 *
 * 검증하는 것
 *  - **contracts parse**: 요청·응답 양쪽이 schema 를 통과한다 (`rules/architecture.md` §4).
 *  - **멱등**: 같은 책을 두 번 저장해도 **같은 응답**(`savedAt` 포함)이고 오류가 아니다.
 *  - **상한 없음**: 여러 권을 저장해도 거부되지 않는다 (Figma 에 상한 UI 가 없다).
 *  - **신규 Error Code 0건**: 없는 책은 `RESOURCE_NOT_FOUND` 로만 거부한다.
 *  - **결정성**: 같은 key 를 두 번 불러도 같은 응답 바이트다.
 *  - **Privacy**: 요청 로그에 아동 데이터 키가 없다.
 */
import { SavedBookSchema } from '@haru/contracts';
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
  it('공통 4종 + offline + `book-saved` 다 — `empty` 는 없다 (상태 설정이라 빈 결과가 없다)', () => {
    expect([...LIBRARY_SCENARIO_KEYS]).toStrictEqual([
      'success',
      'loading',
      'error',
      'retry',
      'offline',
      'book-saved',
    ]);
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

  it('두 endpoint 가 모두 기록된다', async () => {
    const { api, requestLog } = libraryApi('success');
    await api.saveBook({ childId: CHILD_ID, body: { target: { bookId: BOOK } } });
    await api.unsaveBook({ childId: CHILD_ID, bookId: BOOK });

    expect(requestLog.entries().map((entry) => entry.operation)).toStrictEqual([
      'PUT /v1/children/:childId/saved-books',
      'DELETE /v1/children/:childId/saved-books/:bookId',
    ]);
  });
});
