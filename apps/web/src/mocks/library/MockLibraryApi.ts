/**
 * `MockLibraryApi` — `★ Save` 저장/해제의 Mock Adapter (`docs/API_CONTRACTS.md` §3.7).
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | 저장/해제가 즉시 성공한다 |
 * | `loading` | 주입 timer 로 지연 후 성공 (낙관적 갱신이 지연을 가리는지 확인) |
 * | `error` | `INTERNAL_ERROR` Error Envelope → 화면은 **롤백 + Toast** |
 * | `retry` | 1회차 실패 → 2회차부터 성공 |
 * | `offline` | `NetworkError` → 실패 경로와 같게 다룬다 (사전 차단 UI 를 만들지 않는다) |
 * | `book-saved` | 저장 상태로 **시작**한다 — 오늘 카드가 처음부터 `Saved` 로 보이는 경로 (`G-14`) |
 *
 * **멱등**: 같은 책을 두 번 저장해도 같은 응답(`savedAt` 포함)을 돌려주며 오류가 아니다.
 * 그래서 이 Adapter 는 `savedAt` 을 **처음 저장 시각에 고정**한다 (주입 clock 기준).
 *
 * `empty` 키를 두지 않는다 — 저장은 목록 조회가 아니라 상태 설정이라 "빈 결과" 가 없다.
 * 서재 **목록**(`LibraryFilter=saved`)은 Library 라운드에서 이 그룹에 추가한다.
 */
import {
  HaruApiError,
  SaveBookRequestSchema,
  SavedBookSchema,
  type ErrorCode,
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
import type { LibraryApi } from '../../shared/api/library-api';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import { findDeckBook, resolveSaveTarget } from '../fixtures/saved-books';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const LIBRARY_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'book-saved',
] as const;

export type LibraryScenarioKey = (typeof LIBRARY_SCENARIO_KEYS)[number];

export const libraryScenarioGroup: ScenarioGroupDefinition<LibraryScenarioKey> = {
  group: 'library',
  keys: LIBRARY_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 "1.5–3s" 보다 짧다 — 저장은 작은 쓰기다. 실제 대기는 주입 timer 가 정한다. */
export const LIBRARY_LOADING_DELAY_MS = 900;

const SAVE_OPERATION = 'PUT /v1/children/:childId/saved-books';
const UNSAVE_OPERATION = 'DELETE /v1/children/:childId/saved-books/:bookId';

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

  return {
    async saveBook(
      request: { childId: string; body: SaveBookRequest },
      options: ApiRequestOptions = {},
    ) {
      // 경로 파라미터(`childId`)는 payload 로 남기지 않는다 — `MockHomeApi` 주석 참조.
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

      switch (scenario) {
        case 'loading':
          return withDelay(timer, LIBRARY_LOADING_DELAY_MS, run, options.signal);
        case 'error':
          return fail('INTERNAL_ERROR', 'Mock save failed.');
        case 'retry':
          return attempt === 1 ? fail('INTERNAL_ERROR', 'Mock save failed.') : run();
        case 'offline':
          throw new NetworkError('Mock adapter is offline.');
        default:
          return run();
      }
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

      switch (scenario) {
        case 'loading':
          return withDelay(timer, LIBRARY_LOADING_DELAY_MS, run, options.signal);
        case 'error':
          return fail('INTERNAL_ERROR', 'Mock unsave failed.');
        case 'retry':
          return attempt === 1 ? fail('INTERNAL_ERROR', 'Mock unsave failed.') : run();
        case 'offline':
          throw new NetworkError('Mock adapter is offline.');
        default:
          return run();
      }
    },
  };
}
