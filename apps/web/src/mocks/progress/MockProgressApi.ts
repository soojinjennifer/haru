/**
 * `MockProgressApi` — 주간 Progress Mock Adapter (Stage 7 Plan §8 그룹 `progress` · `API_CONTRACTS` §4 Stage 7 C7-1).
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | 이번 주 = **Figma `31:102` 수치**(`fixtures/weekly-progress.ts`) · 선택 가능 주 2개(이번 주 · 달 넘김 주) |
 * | `loading` · `error` · `retry` · `offline` | 공통 (`deliver`) — 성공 응답은 `success` 와 같다 |
 * | `empty` | 이번 주 세션 0 — `sessionsCount 0` · `days` 전부 `null` · `momentOfWeek null` · 선택 가능 주 1개 |
 * | `progress-first-week` | 가입 첫 주 — 선택 가능 주 1개 (주 chip = 정적 라벨) |
 * | `progress-multi-week` | 선택 가능 주 4개(달 넘김 · 연 넘김 각 1) — 이전 주 선택 시 다른 fixture |
 *
 * ── 서버 규칙 (Backend 요구 `P7-BIP-01` 과 같다) ──
 * - 아이 id 는 `GET /v1/me` 의 아이 하나뿐 — 다른 id → `CHILD_NOT_FOUND` (소유권, RLS 는 Backend)
 * - `weekStart` 는 `availableWeeks` 중 하나여야 한다 — 아니면 `VALIDATION_FAILED` (`details.fields: ['weekStart']`)
 * - `weekStart` 생략 = 이번 주. 읽기 전용 · 상태 없음 · 시간·난수 없음 (결정적).
 */
import {
  WeeklyProgressQuerySchema,
  WeeklyProgressSchema,
  type WeeklyProgress,
  type WeeklyProgressQuery,
} from '@haru/contracts';

import { parseRequest, parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { ProgressApi } from '../../shared/api/progress-api';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { MOCK_CHILD_ID } from '../fixtures/me';
import {
  createWeeklyProgressFixture,
  MOCK_THIS_WEEK_START,
  type WeeklyProgressWorld,
} from '../fixtures/weekly-progress';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const PROGRESS_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
  'progress-first-week',
  'progress-multi-week',
] as const;

export type ProgressScenarioKey = (typeof PROGRESS_SCENARIO_KEYS)[number];

export const progressScenarioGroup: ScenarioGroupDefinition<ProgressScenarioKey> = {
  group: 'progress',
  keys: PROGRESS_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 `loading` "1.5–3s". 실제 대기는 주입 timer 가 정한다. */
export const PROGRESS_LOADING_DELAY_MS = 1_500;

const WEEKLY_OPERATION = 'GET /v1/children/:childId/progress/weekly';

function worldOf(scenario: ProgressScenarioKey): WeeklyProgressWorld {
  switch (scenario) {
    case 'empty':
      return 'empty';
    case 'progress-first-week':
      return 'first-week';
    case 'progress-multi-week':
      return 'multi-week';
    default:
      return 'standard';
  }
}

export interface MockProgressApiDeps {
  store: ScenarioStore;
  idFactory: IdFactory;
  timer: Timer;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockProgressApi(deps: MockProgressApiDeps): ProgressApi {
  const { store, idFactory, timer, requestLog, errorCodes } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;

  return {
    async getWeekly(
      request: { childId: string; query?: WeeklyProgressQuery },
      options: ApiRequestOptions = {},
    ): Promise<WeeklyProgress> {
      const query = parseRequest(WeeklyProgressQuerySchema, request.query ?? {}, {
        operation: WEEKLY_OPERATION,
      });
      requestLog?.record(WEEKLY_OPERATION, { childId: request.childId, ...query });

      const { scenario, attempt } = beginScenarioCall(
        store,
        progressScenarioGroup,
        'getWeekly',
        options.signal,
      );

      const run = (): WeeklyProgress => {
        if (request.childId !== MOCK_CHILD_ID) return fail('CHILD_NOT_FOUND', 'Unknown child.');
        const value = createWeeklyProgressFixture(
          worldOf(scenario),
          query.weekStart ?? MOCK_THIS_WEEK_START,
        );
        if (value === undefined) {
          return fail('VALIDATION_FAILED', 'That week is not available.', {
            fields: ['weekStart'],
          });
        }
        return parseResponse(WeeklyProgressSchema, value, {
          operation: WEEKLY_OPERATION,
          direction: 'response',
        });
      };

      return deliver({
        scenario,
        attempt,
        delayMs: PROGRESS_LOADING_DELAY_MS,
        run,
        message: 'Mock weekly progress failed.',
        errorCode: resolveErrorCode(errorCodes, progressScenarioGroup.group, 'getWeekly'),
        signal: options.signal,
        timer,
        failure,
      });
    },
  };
}
