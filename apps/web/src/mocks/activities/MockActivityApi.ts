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
 * | `offline-cached-card` | `NetworkError` (조회·선택 모두) + **최근 카드 캐시가 있는 기기** — 캐시 seed 는
 * |   | 브라우저 조립 지점이 넣는다 (`activityCardCacheSeed.ts`, 이월 `QA-3-002` · AC-4-82) |
 * | `reread-option` | 덱에 `kind=reread_book` 포함 (§2.6) |
 * | `book-saved` | 첫 카드가 **저장된 상태**로 시작한다 (`G-14` 초기 상태 반영) |
 * | `books-exhausted` | 3장 전부 **재독 카드** (§13 "추천할 책 소진" — 책 없는 카드는 폐지) |
 * | `onboarding-incomplete` | `ONBOARDING_INCOMPLETE` |
 * | `cold-to-warm` | (Stage 6) 완료 계열 세션 수 ≤ 3 → cold 덱, **≥ 4** → warm 덱 (`reason` 문장만 다르다) |
 * | `difficulty-lowered` | (Stage 6) **가장 최근 완료 세션의 회고**에 `tricky_today` 가 있으면 첫 장 = 더 쉬운 책 + 그 `reason` |
 *
 * Stage 6 두 key 는 **세션·회고 서버 상태**(`MockSessionState`)를 읽는다 — 시간이 아니라 기록으로 정해지므로
 * 결정적이다 (AC-6-12). 회고는 `MockReflectionApi` 가 같은 상태에 남긴다 (Stage 5 연쇄, AC-6-40).
 * 카드 UI 는 바뀌지 않는다 — 책과 `reason` 만 다르다 (Spec §2.8, `PF6-1`).
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
import { ensureSessionHistory } from '../sessions/sessionHistory';
import { COMPLETION_STATUSES, type MockSessionState } from '../sessions/sessionState';
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
  'offline-cached-card',
  'reread-option',
  'books-exhausted',
  'book-saved',
  'onboarding-incomplete',
  'cold-to-warm',
  'difficulty-lowered',
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

/** warm 단계 시작 = 완료 세션 4회째 (PRD §8.3 "cold: 가입~세션 3회 → warm: 4회~", `P6-BIP-03`). */
export const MOCK_WARM_MIN_COMPLETED_SESSIONS = 4;

export interface MockActivityApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  requestLog?: RequestLog | undefined;
  /**
   * Stage 6 — 세션·회고 서버 상태 (`cold-to-warm` · `difficulty-lowered`). 없으면 두 key 는 cold 덱이다.
   */
  sessionState?: MockSessionState | undefined;
}

/** 완료 계열 세션 — 오래된 것 → 최근 (`completedAt`, 같으면 생성 순서). */
function completedSessions(state: MockSessionState, clock: Clock) {
  ensureSessionHistory(state, clock);
  return [...state.sessions.values()]
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => COMPLETION_STATUSES.has(record.summary.status))
    .sort(
      (a, b) =>
        (a.record.summary.completedAt ?? '').localeCompare(b.record.summary.completedAt ?? '') ||
        a.index - b.index,
    )
    .map(({ record }) => record);
}

/**
 * Stage 6 key 의 덱 모양 — **서버 기록**으로 정한다 (Plan §8, AC-6-12).
 * 실제 추천 규칙(cold→warm 전환 · 난이도 하향 · 반영 시점)은 Backend 다 (`P6-BIP-03`·`04`).
 */
export function resolveRecommendationShape(
  scenario: ActivityScenarioKey,
  state: MockSessionState | undefined,
  clock: Clock,
): ActivityDeckShape | undefined {
  if (state === undefined) return undefined;

  if (scenario === 'cold-to-warm') {
    return completedSessions(state, clock).length >= MOCK_WARM_MIN_COMPLETED_SESSIONS
      ? 'warm'
      : 'books';
  }

  if (scenario === 'difficulty-lowered') {
    const latest = completedSessions(state, clock).at(-1);
    return latest?.reflection?.checks.includes('tricky_today') === true ? 'lowered' : 'books';
  }

  return undefined;
}

export function createMockActivityApi(deps: MockActivityApiDeps): ActivityApi {
  const { store, clock, idFactory, timer, requestLog, sessionState } = deps;

  function shapeFor(scenario: ActivityScenarioKey): ActivityDeckShape {
    return (
      resolveRecommendationShape(scenario, sessionState, clock) ?? DECK_SHAPES[scenario] ?? 'books'
    );
  }

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
      const shape = shapeFor(scenario);

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
        case 'offline-cached-card':
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
      const shape = shapeFor(scenario);

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
        case 'offline-cached-card':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return selection();
      }
    },
  };
}
