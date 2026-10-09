/**
 * `MockBooksApi` — `GET /v1/books/search` (결정 **D-17** 최소 범위) +
 * `GET /v1/books/:bookId/prompts` (Library Plan §7.5 · §8, FR-20) 의 Mock Adapter.
 *
 * Plan §8.1 `books` 그룹.
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | 제목 부분 일치 결과 / 책별 Prompt 세트 |
 * | `loading` | 주입 timer 로 지연 후 성공 |
 * | `empty` | `items: []` → 화면이 **제목 직접 입력** 경로를 연다 (AC-2-23). Prompt 조회에는
 *   **적용하지 않는다** — 빈 Prompt 세트는 contract 가 금지한다(`questions.min(1)`) |
 * | `error` | `INTERNAL_ERROR` Error Envelope |
 * | `retry` | 1회차 실패 → 2회차부터 성공 |
 * | `offline` | `NetworkError` |
 * | `no-reason` | **Prompt 조회만** 달라진다 — `reason` 을 **생략**한다 (서버가 아직 문장을
 *   갖고 있지 않은 경우). 검색은 `success` 와 같다 |
 *
 * Prompt 세트는 **Home 카드와 같은 fixture**(`createPromptSetFixture`)를 쓴다 — 같은 책의
 * Prompt 가 화면마다 달라 보이면 안 된다. `bookId` 를 seed 로 넣어 책마다 결정적으로 다르다.
 *
 * **검색어는 아동 데이터가 아니다** — 보호자가 입력한 책 제목이다. 그래도 요청 사실과
 * 본문을 기록해 AC-2-13 전수 검사에 포함시킨다.
 *
 * 시간·ID·지연은 전부 주입받는다.
 */
import {
  BookPromptsResponseSchema,
  HaruApiError,
  SearchBooksRequestSchema,
  SearchBooksResponseSchema,
  type BookPromptsResponse,
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
import {
  createBookReasonFixture,
  createBookSearchFixture,
  createEmptyBookSearchFixture,
} from '../fixtures/books';
import { findLibraryBook } from '../fixtures/library';
import { createPromptSetFixture } from '../fixtures/prompt-sets';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const BOOKS_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
  'no-reason',
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
const PROMPTS_OPERATION = 'GET /v1/books/:bookId/prompts';

/** 책마다 다른 역량을 결정적으로 고른다 — 같은 `bookId` 는 항상 같은 세트를 받는다. */
const PROMPT_CAPABILITIES = [
  'emotion_regulation',
  'self_directed_agency',
  'cognitive_flexibility',
  'intrinsic_motivation',
] as const;

function capabilityFor(bookId: string): (typeof PROMPT_CAPABILITIES)[number] {
  const sum = [...bookId].reduce((total, char) => total + (char.codePointAt(0) ?? 0), 0);
  return PROMPT_CAPABILITIES[sum % PROMPT_CAPABILITIES.length] ?? 'emotion_regulation';
}

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

    async getPrompts(
      request: { bookId: string; childId: string },
      options: ApiRequestOptions = {},
    ) {
      // 경로·query 파라미터는 payload 로 남기지 않는다 — `MockHomeApi` 주석 참조.
      void request.childId;
      requestLog?.record(PROMPTS_OPERATION, { bookId: request.bookId });

      const scenario = store.resolve(booksScenarioGroup);
      const attempt = consumeAttempt(store, booksScenarioGroup.group, options.signal);

      function prompts(): BookPromptsResponse {
        if (findLibraryBook(request.bookId) === undefined) {
          fail('RESOURCE_NOT_FOUND', 'Unknown book.');
        }

        return parseResponse(
          BookPromptsResponseSchema,
          {
            bookId: request.bookId,
            promptSet: createPromptSetFixture(
              request.bookId.slice(-4),
              capabilityFor(request.bookId),
            ),
            /*
              `no-reason` 은 **필드를 통째로 빼서** 서버가 문장을 주지 않는 경우를 재현한다
              (`reason` 은 nullable·optional 이다). 화면은 그 줄을 **생략**해야 하며 빈
              문자열이나 대체 문구를 만들지 않는다.
            */
            ...(scenario === 'no-reason'
              ? {}
              : { reason: createBookReasonFixture(request.bookId) }),
          },
          { operation: PROMPTS_OPERATION, direction: 'response' },
        );
      }

      switch (scenario) {
        case 'loading':
          return withDelay(timer, BOOKS_LOADING_DELAY_MS, prompts, options.signal);

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock book prompts failed.');

        case 'retry':
          return attempt === 1 ? fail('INTERNAL_ERROR', 'Mock book prompts failed.') : prompts();

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        // `empty` 는 적용하지 않는다 — 빈 Prompt 세트는 contract 가 금지한다.
        default:
          return prompts();
      }
    },
  };
}
