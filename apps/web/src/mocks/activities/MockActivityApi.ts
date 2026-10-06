/**
 * `MockActivityApi` — Activity Card 조회·선택의 Mock Adapter (Stage 3 Plan §8.2).
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | 책 3장 덱 + 선택 시 Prompt 세트 |
 * | `loading` | 주입 timer 로 지연 후 성공 |
 * | `empty` | `RESOURCE_NOT_FOUND` → 화면은 **오류가 아니라 안내**로 다룬다 (§8 `empty`) |
 * | `error` | `INTERNAL_ERROR` Error Envelope |
 * | `retry` | 1회차 실패 → 2회차부터 성공 |
 * | `offline` | `NetworkError` |
 * | `reread-option` | 덱에 `kind=reread_book` 포함 (§2.6) |
 * | `book-saved` | 첫 카드가 **저장된 상태**로 시작한다 (`G-14` 초기 상태 반영) |
 * | `books-exhausted` | 3장 전부 **재독 카드** (§13 "추천할 책 소진" — 책 없는 카드는 폐지) |
 * | `onboarding-incomplete` | `ONBOARDING_INCOMPLETE` |
 *
 * **결정성**: 같은 key 를 반복 실행하면 같은 3장 구성·같은 문구가 나오고, 선택 응답의
 * `promptSet` 도 같다 (덱·Prompt 가 Playwright baseline 대상이다 — Plan §8.5).
 *
 * `POST /v1/sessions` 를 만들지 않는다 (Stage 4).
 */
import {
  ActivityCardSchema,
  ActivityCardSelectionSchema,
  HaruApiError,
  SelectActivityOptionRequestSchema,
  type ActivityCard,
  type ActivityCardSelection,
  type ErrorCode,
  type SelectActivityOptionRequest,
} from '@haru/contracts';

import type { ActivityApi } from '../../shared/api/activity-api';
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
import { createActivityCardFixture, type ActivityDeckShape } from '../fixtures/activity-cards';
import { createPromptSetFixture } from '../fixtures/prompt-sets';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const ACTIVITY_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
  'reread-option',
  'books-exhausted',
  'book-saved',
  'onboarding-incomplete',
] as const;

export type ActivityScenarioKey = (typeof ACTIVITY_SCENARIO_KEYS)[number];

export const activityScenarioGroup: ScenarioGroupDefinition<ActivityScenarioKey> = {
  group: 'activity-cards',
  keys: ACTIVITY_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** NFR "카드 2초 이내" 를 체감으로 검증하기 위한 지연. 실제 대기는 주입 timer 가 정한다. */
export const ACTIVITY_LOADING_DELAY_MS = 1_500;

const GET_OPERATION = 'GET /v1/children/:childId/activity-cards/today';
const SELECT_OPERATION = 'POST /v1/activity-cards/:cardId/selection';

const DECK_SHAPES: Partial<Record<ActivityScenarioKey, ActivityDeckShape>> = {
  'reread-option': 'reread',
  'books-exhausted': 'exhausted',
  'book-saved': 'saved',
};

export interface MockActivityApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  requestLog?: RequestLog | undefined;
}

export function createMockActivityApi(deps: MockActivityApiDeps): ActivityApi {
  const { store, clock, idFactory, timer, requestLog } = deps;

  function fail(code: ErrorCode, message: string): never {
    throw HaruApiError.fromEnvelope(
      buildErrorEnvelope(code, message, { requestId: idFactory.next() }),
    );
  }

  function card(shape: ActivityDeckShape = 'books'): ActivityCard {
    return parseResponse(ActivityCardSchema, createActivityCardFixture(clock, shape), {
      operation: GET_OPERATION,
      direction: 'response',
    });
  }

  return {
    async getTodayCard(request: { childId: string }, options: ApiRequestOptions = {}) {
      // 경로 파라미터(`childId`)는 payload 로 남기지 않는다 — `MockHomeApi` 주석 참조.
      void request.childId;
      requestLog?.record(GET_OPERATION);

      const scenario = store.resolve(activityScenarioGroup);
      const attempt = consumeAttempt(store, activityScenarioGroup.group, options.signal);
      const shape = DECK_SHAPES[scenario] ?? 'books';

      switch (scenario) {
        case 'loading':
          return withDelay(timer, ACTIVITY_LOADING_DELAY_MS, () => card(), options.signal);

        case 'empty':
          // 오늘 카드가 아직 없다 — 화면은 안내(EmptyState)로 다룬다.
          return fail('RESOURCE_NOT_FOUND', "Today's activity card is not ready yet.");

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock activity card failed.');

        case 'retry':
          return attempt === 1 ? fail('INTERNAL_ERROR', 'Mock activity card failed.') : card();

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        case 'onboarding-incomplete':
          return fail('ONBOARDING_INCOMPLETE', 'Onboarding is not complete.');

        default:
          return card(shape);
      }
    },

    async selectOption(
      request: { cardId: string; selection: SelectActivityOptionRequest },
      options: ApiRequestOptions = {},
    ) {
      const parsed = parseRequest(SelectActivityOptionRequestSchema, request.selection, {
        operation: SELECT_OPERATION,
      });

      requestLog?.record(SELECT_OPERATION, { cardId: request.cardId, ...parsed });

      const scenario = store.resolve(activityScenarioGroup);
      const attempt = consumeAttempt(store, activityScenarioGroup.group, options.signal);
      const shape = DECK_SHAPES[scenario] ?? 'books';

      function selection(): ActivityCardSelection {
        const option = card(shape).options.find((item) => item.id === parsed.optionId);
        if (option === undefined) fail('RESOURCE_NOT_FOUND', 'Unknown activity card option.');

        return parseResponse(
          ActivityCardSelectionSchema,
          {
            option,
            promptSet: createPromptSetFixture('00011', option.capability ?? 'emotion_regulation'),
          },
          { operation: SELECT_OPERATION, direction: 'response' },
        );
      }

      switch (scenario) {
        case 'loading':
          return withDelay(timer, ACTIVITY_LOADING_DELAY_MS, selection, options.signal);

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock selection failed.');

        case 'retry':
          return attempt === 1 ? fail('INTERNAL_ERROR', 'Mock selection failed.') : selection();

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return selection();
      }
    },
  };
}
