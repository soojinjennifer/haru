/**
 * `MockBooksApi` — `GET /v1/books/search` 의 Mock Adapter (결정 **D-17** 최소 범위).
 *
 * Plan §8.1 `books` 그룹. Stage 2 는 공통 5종만 쓴다 (`user-entered-book` 등은 Stage 3).
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | 제목 부분 일치 결과 |
 * | `loading` | 주입 timer 로 지연 후 성공 |
 * | `empty` | `items: []` → 화면이 **제목 직접 입력** 경로를 연다 (AC-2-23) |
 * | `error` | `INTERNAL_ERROR` Error Envelope |
 * | `retry` | 1회차 실패 → 2회차부터 성공 |
 * | `offline` | `NetworkError` |
 *
 * **검색어는 아동 데이터가 아니다** — 보호자가 입력한 책 제목이다. 그래도 요청 사실과
 * 본문을 기록해 AC-2-13 전수 검사에 포함시킨다.
 *
 * 시간·ID·지연은 전부 주입받는다.
 */
import {
  HaruApiError,
  SearchBooksRequestSchema,
  SearchBooksResponseSchema,
  type ErrorCode,
  type SearchBooksRequestInput,
  type SearchBooksResponse,
} from '@haru/contracts';

import type { BooksApi } from '../../shared/api/books-api';
import {
  buildErrorEnvelope,
  NetworkError,
  parseRequest,
  parseResponse,
  withDelay,
  type Timer,
} from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import { createBookSearchFixture, createEmptyBookSearchFixture } from '../fixtures/books';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const BOOKS_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
] as const;

export type BooksScenarioKey = (typeof BOOKS_SCENARIO_KEYS)[number];

export const booksScenarioGroup: ScenarioGroupDefinition<BooksScenarioKey> = {
  group: 'books',
  keys: BOOKS_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 "1.5–3s". 실제 대기는 주입 timer 가 결정한다. */
export const BOOKS_LOADING_DELAY_MS = 1_500;

const OPERATION = 'GET /v1/books/search';

export interface MockBooksApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  requestLog?: RequestLog | undefined;
}

export function createMockBooksApi(deps: MockBooksApiDeps): BooksApi {
  const { store, idFactory, timer, requestLog } = deps;

  function fail(code: ErrorCode, message: string): never {
    throw HaruApiError.fromEnvelope(
      buildErrorEnvelope(code, message, { requestId: idFactory.next() }),
    );
  }

  return {
    async search(request: SearchBooksRequestInput, options: ApiRequestOptions = {}) {
      const parsed = parseRequest(SearchBooksRequestSchema, request, { operation: OPERATION });

      requestLog?.record(OPERATION, parsed);

      const scenario = store.resolve(booksScenarioGroup);
      const attempt = consumeAttempt(store, booksScenarioGroup.group, options.signal);

      function results(): SearchBooksResponse {
        return parseResponse(
          SearchBooksResponseSchema,
          createBookSearchFixture(parsed.q, parsed.limit),
          { operation: OPERATION, direction: 'response' },
        );
      }

      switch (scenario) {
        case 'loading':
          return withDelay(timer, BOOKS_LOADING_DELAY_MS, results, options.signal);

        case 'empty':
          return parseResponse(SearchBooksResponseSchema, createEmptyBookSearchFixture(), {
            operation: OPERATION,
            direction: 'response',
          });

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock book search failed.');

        case 'retry':
          return attempt === 1 ? fail('INTERNAL_ERROR', 'Mock book search failed.') : results();

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return results();
      }
    },
  };
}
