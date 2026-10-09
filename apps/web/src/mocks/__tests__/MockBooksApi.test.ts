/**
 * `MockBooksApi` — 결정 **D-17** 최소 범위 검증 (AC-2-23).
 * 공통 5종 + offline 만 쓴다. `user-entered-book` 등은 Stage 3 다 (Plan §8.4).
 */
import { describe, expect, it } from 'vitest';
import {
  BookPromptsResponseSchema,
  HaruApiError,
  SearchBooksResponseSchema,
} from '@haru/contracts';

import { createImmediateTimer, NetworkError } from '../../shared/api/helpers';
import { createFixedClock } from '../../shared/lib/clock';
import { createSeededIdFactory } from '../../shared/lib/idFactory';
import { createMockBooksApi, BOOKS_SCENARIO_KEYS } from '../books/MockBooksApi';
import { createRequestLog } from '../request-log';
import { createScenarioSource, createScenarioStore } from '../scenarios';

const EPOCH = Date.UTC(2026, 0, 1);

function makeApi(scenario = 'success') {
  const requestLog = createRequestLog();

  return {
    requestLog,
    api: createMockBooksApi({
      store: createScenarioStore([createScenarioSource('url', { books: scenario })]),
      clock: createFixedClock(EPOCH),
      idFactory: createSeededIdFactory('test'),
      timer: createImmediateTimer(),
      requestLog,
    }),
  };
}

describe('scenario 목록', () => {
  it('공통 5종 + offline + `no-reason`(2라운드-3) 이다', () => {
    expect([...BOOKS_SCENARIO_KEYS]).toStrictEqual([
      'success',
      'loading',
      'empty',
      'error',
      'retry',
      'offline',
      'no-reason',
    ]);
  });
});

describe('검색', () => {
  it('제목 부분 일치 결과가 schema 를 통과한다', async () => {
    const { api } = makeApi();
    const response = await api.search({ q: 'moon' });

    expect(SearchBooksResponseSchema.safeParse(response).success).toBe(true);
    expect(response.items[0]?.title).toBe('Goodnight Moon');
    expect(response.items[0]?.author.length).toBeGreaterThan(0);
  });

  it('Stage 2 fixture 는 표지를 넣지 않는다 (표지는 Stage 3)', async () => {
    const { api } = makeApi();
    const response = await api.search({ q: 'the' });

    expect(response.items.every((book) => book.coverUrl === undefined)).toBe(true);
  });

  it('같은 검색어는 항상 같은 결과다 (결정성)', async () => {
    const first = await makeApi().api.search({ q: 'bear' });
    const second = await makeApi().api.search({ q: 'bear' });

    expect(second).toStrictEqual(first);
  });

  it('`empty` 는 결과 0건이며 오류가 아니다 (AC-2-23 — 제목 직접 입력 경로)', async () => {
    const { api } = makeApi('empty');
    const response = await api.search({ q: 'anything' });

    expect(response.items).toStrictEqual([]);
    expect(response.nextCursor).toBeNull();
  });

  it('빈 검색어는 요청 parse 에서 거부된다', async () => {
    const { api } = makeApi();

    await expect(api.search({ q: '   ' })).rejects.toBeDefined();
  });

  it('`error` · `offline` · `retry` 를 재현한다', async () => {
    await expect(makeApi('error').api.search({ q: 'moon' })).rejects.toBeInstanceOf(HaruApiError);
    await expect(makeApi('offline').api.search({ q: 'moon' })).rejects.toBeInstanceOf(NetworkError);

    const { api } = makeApi('retry');
    await expect(api.search({ q: 'moon' })).rejects.toBeInstanceOf(HaruApiError);
    expect((await api.search({ q: 'moon' })).items.length).toBeGreaterThan(0);
  });

  it('요청을 로그에 남긴다 (AC-2-13 전수 검사 대상)', async () => {
    const { api, requestLog } = makeApi();
    await api.search({ q: 'moon' });

    expect(requestLog.entries().map((entry) => entry.operation)).toStrictEqual([
      'GET /v1/books/search',
    ]);
  });
});

/**
 * 책별 Prompt — `reason` 은 **서버가 만든 문장**이다 (사용자 결정 2026-10-09).
 * Mock 도 응답 값으로만 돌려주며, 서버가 아직 문장을 갖고 있지 않은 경우를 `no-reason` 이
 * 재현한다. 화면은 그때 **줄을 생략**해야 한다 (빈 문자열·대체 문구 금지).
 */
describe('책별 Prompt — `reason`', () => {
  const BOOK_ID = '22222222-2222-4222-8222-000000000001';
  const CHILD_ID = '33333333-3333-4333-8333-000000000001';

  it('`success` 응답이 schema 를 통과하고 이유 문장을 담는다', async () => {
    const { api } = makeApi();
    const response = await api.getPrompts({ bookId: BOOK_ID, childId: CHILD_ID });

    expect(BookPromptsResponseSchema.safeParse(response).success).toBe(true);
    expect((response.reason ?? '').length).toBeGreaterThan(0);
  });

  it('같은 책은 항상 같은 이유를 받는다 (결정성)', async () => {
    const first = await makeApi().api.getPrompts({ bookId: BOOK_ID, childId: CHILD_ID });
    const second = await makeApi().api.getPrompts({ bookId: BOOK_ID, childId: CHILD_ID });

    expect(second.reason).toBe(first.reason);
  });

  it('`no-reason` 은 필드를 **생략**하고 Prompt 세트는 그대로 준다', async () => {
    const { api } = makeApi('no-reason');
    const response = await api.getPrompts({ bookId: BOOK_ID, childId: CHILD_ID });

    expect(response.reason).toBeUndefined();
    expect(BookPromptsResponseSchema.safeParse(response).success).toBe(true);
    expect(response.promptSet.questions.length).toBeGreaterThan(0);
  });
});
