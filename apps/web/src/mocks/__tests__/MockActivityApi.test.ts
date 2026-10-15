/**
 * `MockActivityApi` · `MockHomeApi` — Stage 3 Mock 계약 (Plan §8.2 · §8.5).
 *
 * 검증하는 것
 *  - **결정성**: 같은 key 를 두 번 불러도 같은 응답 바이트다 (덱·Prompt 가 baseline 대상이다).
 *  - **contracts parse**: 요청·응답 양쪽이 schema 를 통과한다 (`rules/architecture.md` §4).
 *  - **D-21**: 기본 경로 fixture 가 Prompt **4개 이상**을 담는다 (상한 없음의 증거).
 *  - **D-8**: `phase`·`pageRef` 가 결정적으로 채워지고 `null` 케이스도 섞여 있다.
 *  - **D-22**: 응답에 `targetCapability` 가 없다.
 *  - **Privacy**: 요청 로그에 아동 이름·Transcript 가 없다.
 */
import {
  ActivityCardSchema,
  ActivityCardSelectionSchema,
  HomeSummarySchema,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createImmediateTimer, isHaruApiError } from '../../shared/api/helpers';
import { createFixedClock } from '../../shared/lib/clock';
import { createSeededIdFactory } from '../../shared/lib/idFactory';
import { createMockActivityApi, ACTIVITY_SCENARIO_KEYS } from '../activities/MockActivityApi';
import { createMockHomeApi, HOME_SCENARIO_KEYS } from '../home/MockHomeApi';
import { createRequestLog, findChildDataKeys } from '../request-log';
import { createScenarioSource, createScenarioStore } from '../scenarios';

const CHILD_ID = '44444444-4444-4444-8444-444444444444';
const EPOCH = Date.UTC(2026, 0, 1);

function deps(scenario: string, group: 'activity-cards' | 'home') {
  const requestLog = createRequestLog();

  return {
    requestLog,
    base: {
      store: createScenarioStore([createScenarioSource('url', { [group]: scenario })]),
      clock: createFixedClock(EPOCH),
      idFactory: createSeededIdFactory('test'),
      timer: createImmediateTimer(),
      requestLog,
    },
  };
}

function activityApi(scenario: string) {
  const { base, requestLog } = deps(scenario, 'activity-cards');
  return { api: createMockActivityApi(base), requestLog };
}

function homeApi(scenario: string) {
  const { base, requestLog } = deps(scenario, 'home');
  return { api: createMockHomeApi(base), requestLog };
}

describe('결정성 (Plan §8.5 — 같은 key 는 같은 3장 구성·같은 문구)', () => {
  it.each(['success', 'reread-option', 'books-exhausted', 'book-saved'])(
    '`%s` 를 두 번 불러도 응답이 같다',
    async (scenario) => {
      const first = await activityApi(scenario).api.getTodayCard({ childId: CHILD_ID });
      const second = await activityApi(scenario).api.getTodayCard({ childId: CHILD_ID });

      expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    },
  );

  it('선택 응답(promptSet)도 결정적이다', async () => {
    const run = async () => {
      const { api } = activityApi('success');
      const card = await api.getTodayCard({ childId: CHILD_ID });
      return api.selectOption({
        cardId: card.id,
        selection: { optionId: card.options[0].id, readingContext: 'bedtime' },
      });
    };

    expect(JSON.stringify(await run())).toBe(JSON.stringify(await run()));
  });
});

describe('contracts parse (AC-3-60 계열)', () => {
  it.each(
    ACTIVITY_SCENARIO_KEYS.filter(
      // `offline-cached-card` 는 API 쪽이 `offline` 과 같다 (NetworkError — `activity-card-cache-seed.test.ts`).
      (key) =>
        ![
          'empty',
          'error',
          'offline',
          'offline-cached-card',
          'retry',
          'onboarding-incomplete',
        ].includes(key),
    ),
  )('`%s` 응답이 ActivityCardSchema 를 통과한다', async (scenario) => {
    const card = await activityApi(scenario).api.getTodayCard({ childId: CHILD_ID });
    expect(ActivityCardSchema.safeParse(card).success).toBe(true);
  });

  it.each(
    HOME_SCENARIO_KEYS.filter(
      (key) => !['error', 'offline', 'retry', 'onboarding-incomplete'].includes(key),
    ),
  )('`%s` 응답이 HomeSummarySchema 를 통과한다', async (scenario) => {
    const summary = await homeApi(scenario).api.getSummary({ childId: CHILD_ID });
    expect(HomeSummarySchema.safeParse(summary).success).toBe(true);
  });

  it('선택 응답이 ActivityCardSelectionSchema 를 통과한다', async () => {
    const { api } = activityApi('success');
    const card = await api.getTodayCard({ childId: CHILD_ID });
    const selection = await api.selectOption({
      cardId: card.id,
      selection: {
        optionId: card.options[1].id,
        readingContext: 'custom_time',
        customTime: '19:30',
      },
    });

    expect(ActivityCardSelectionSchema.safeParse(selection).success).toBe(true);
  });

  it('`custom_time` 인데 `customTime` 이 없으면 Adapter 경계가 거부한다 (AC-3-23)', async () => {
    const { api } = activityApi('success');
    const card = await api.getTodayCard({ childId: CHILD_ID });

    await expect(
      api.selectOption({
        cardId: card.id,
        selection: { optionId: card.options[0].id, readingContext: 'custom_time' },
      }),
    ).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'VALIDATION_FAILED',
    );
  });
});

describe('fixture 규격 (D-5 · D-8 · D-21 · D-22)', () => {
  it('덱이 3장이고 카드마다 역량이 다르다 (D-5)', async () => {
    const card = await activityApi('success').api.getTodayCard({ childId: CHILD_ID });

    expect(card.options).toHaveLength(3);
    expect(new Set(card.options.map((option) => option.capability)).size).toBe(3);
  });

  it('카드에 `targetCapability` 가 없다 (D-22)', async () => {
    const card = await activityApi('success').api.getTodayCard({ childId: CHILD_ID });
    expect(card).not.toHaveProperty('targetCapability');
  });

  it('기본 경로가 Prompt 4개 이상을 담는다 (D-21 — 상한 없음의 증거)', async () => {
    const card = await activityApi('success').api.getTodayCard({ childId: CHILD_ID });
    for (const option of card.options) {
      expect(option.promptPreview.length).toBeGreaterThan(3);
    }

    const selection = await activityApi('success').api.selectOption({
      cardId: card.id,
      selection: { optionId: card.options[0].id, readingContext: 'now' },
    });
    expect(selection.promptSet.questions.length).toBeGreaterThan(3);
  });

  it('`phase`·`pageRef` 가 결정적으로 채워지고 둘 다 null 인 Prompt 도 있다 (D-8)', async () => {
    const card = await activityApi('success').api.getTodayCard({ childId: CHILD_ID });
    const prompts = card.options[0].promptPreview;

    expect(prompts.some((prompt) => prompt.phase === 'pre')).toBe(true);
    expect(prompts.some((prompt) => prompt.phase === 'post')).toBe(true);
    expect(prompts.some((prompt) => prompt.pageRef !== null)).toBe(true);
    expect(prompts.some((prompt) => prompt.phase === null && prompt.pageRef === null)).toBe(true);
  });

  it('`books-exhausted` 는 3장 모두 재독 카드이고 **전부 책이 있다** (§12.12)', async () => {
    const card = await activityApi('books-exhausted').api.getTodayCard({ childId: CHILD_ID });
    expect(card.options.every((option) => option.kind === 'reread_book')).toBe(true);
    expect(card.options.every((option) => option.book !== null)).toBe(true);
  });

  /* approvals §12.12 — 책 없는 카드는 폐지되었다. 어떤 scenario 에서도 나오지 않는다. */
  it.each(['success', 'reread-option', 'books-exhausted', 'book-saved'])(
    '`%s` 의 모든 옵션에 책과 표지가 있다',
    async (scenario) => {
      const card = await activityApi(scenario).api.getTodayCard({ childId: CHILD_ID });
      for (const option of card.options) {
        expect(option.book.title.length).toBeGreaterThan(0);
        expect(option.book.coverUrl).toBeDefined();
        expect(option).not.toHaveProperty('title');
      }
    },
  );

  /* `G-14` — 초기 저장 상태를 서버가 알려준다. */
  it('`book-saved` 는 첫 카드만 저장된 상태다 (나머지는 미저장)', async () => {
    const card = await activityApi('book-saved').api.getTodayCard({ childId: CHILD_ID });
    expect(card.options.map((option) => option.saved)).toStrictEqual([true, false, false]);
  });

  it('기본 경로는 전부 미저장이다', async () => {
    const card = await activityApi('success').api.getTodayCard({ childId: CHILD_ID });
    expect(card.options.every((option) => option.saved === false)).toBe(true);
  });

  it('`empty` 는 "아직 없다" 로 응답한다 (오류 화면이 아니다)', async () => {
    await expect(activityApi('empty').api.getTodayCard({ childId: CHILD_ID })).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'RESOURCE_NOT_FOUND',
    );
  });

  it('`session-already-active` 는 진행 중 세션을 담는다 (표시용)', async () => {
    const summary = await homeApi('session-already-active').api.getSummary({ childId: CHILD_ID });
    expect(summary.activeSession?.status).toBe('recording');
  });

  it('`HomeSummary` 에 `streakDays` 가 없다 (D-6)', async () => {
    const summary = await homeApi('success').api.getSummary({ childId: CHILD_ID });
    expect(summary).not.toHaveProperty('streakDays');
  });
});

describe('Privacy — 요청 로그 (AC-3-73 계열)', () => {
  it('아동 데이터 키가 요청 본문에 실리지 않는다 (경로 파라미터 `childId` 도 payload 로 남기지 않는다)', async () => {
    const { api, requestLog } = activityApi('success');
    const card = await api.getTodayCard({ childId: CHILD_ID });
    await api.selectOption({
      cardId: card.id,
      selection: { optionId: card.options[0].id, readingContext: 'bedtime' },
    });

    expect(findChildDataKeys(requestLog.entries())).toStrictEqual([]);
  });
});
