/**
 * `MockHomeApi` — `GET /v1/children/:childId/home` 의 Mock Adapter (Stage 3 Plan §8.2).
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | 집계 + 오늘 카드 |
 * | `loading` | 주입 timer 로 지연 후 성공 |
 * | `empty` | `todayCard: null` → 덱 자리에 안내 |
 * | `error` | `INTERNAL_ERROR` Error Envelope |
 * | `retry` | 1회차 실패 → 2회차부터 성공 |
 * | `offline` | `NetworkError` |
 * | `session-already-active` | `activeSession` 존재 → Home 에 이어하기 **안내만** 표시 |
 * | `onboarding-incomplete` | `ONBOARDING_INCOMPLETE` → Guard 경계 회귀 |
 *
 * `POST /v1/sessions` 는 **만들지 않는다** (Stage 4 — `AC-3-15`).
 * 시간·ID·지연은 전부 주입받는다 (결정성).
 */
import { HaruApiError, HomeSummarySchema, type ErrorCode, type HomeSummary } from '@haru/contracts';

import {
  buildErrorEnvelope,
  NetworkError,
  parseResponse,
  withDelay,
  type Timer,
} from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { HomeApi } from '../../shared/api/home-api';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import { createHomeSummaryFixture } from '../fixtures/home';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const HOME_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
  'session-already-active',
  'onboarding-incomplete',
] as const;

export type HomeScenarioKey = (typeof HOME_SCENARIO_KEYS)[number];

export const homeScenarioGroup: ScenarioGroupDefinition<HomeScenarioKey> = {
  group: 'home',
  keys: HOME_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 "1.5–3s". 실제 대기는 주입 timer 가 결정한다. */
export const HOME_LOADING_DELAY_MS = 1_200;

const OPERATION = 'GET /v1/children/:childId/home';

export interface MockHomeApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  requestLog?: RequestLog | undefined;
}

export function createMockHomeApi(deps: MockHomeApiDeps): HomeApi {
  const { store, clock, idFactory, timer, requestLog } = deps;

  function fail(code: ErrorCode, message: string): never {
    throw HaruApiError.fromEnvelope(
      buildErrorEnvelope(code, message, { requestId: idFactory.next() }),
    );
  }

  function summary(options: Parameters<typeof createHomeSummaryFixture>[1] = {}): HomeSummary {
    return parseResponse(HomeSummarySchema, createHomeSummaryFixture(clock, options), {
      operation: OPERATION,
      direction: 'response',
    });
  }

  return {
    async getSummary(request: { childId: string }, options: ApiRequestOptions = {}) {
      /*
        **요청이 나간 사실**만 기록한다 (Privacy 전수 검사 — AC-2-13 과 같은 장치).
        `childId` 는 경로 파라미터이고 `CHILD_DATA_KEYS` 에 들어 있는 식별자라, payload 로
        남기면 "아동 데이터가 본문에 실렸다" 와 구분되지 않는다. `GET /v1/me` 와 같은 처리다.
      */
      void request.childId;
      requestLog?.record(OPERATION);

      const scenario = store.resolve(homeScenarioGroup);
      const attempt = consumeAttempt(store, homeScenarioGroup.group, options.signal);

      switch (scenario) {
        case 'loading':
          return withDelay(timer, HOME_LOADING_DELAY_MS, () => summary(), options.signal);

        case 'empty':
          return summary({ withoutCard: true, sessionsThisWeek: 0 });

        case 'session-already-active':
          return summary({ withActiveSession: true });

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock home summary failed.');

        case 'retry':
          return attempt === 1 ? fail('INTERNAL_ERROR', 'Mock home summary failed.') : summary();

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        case 'onboarding-incomplete':
          return fail('ONBOARDING_INCOMPLETE', 'Onboarding is not complete.');

        default:
          return summary();
      }
    },
  };
}
