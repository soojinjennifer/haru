/**
 * `MockAnalysisApi` — 분석 상태 · 짧은 피드백 Mock Adapter (Stage 5 Plan §8 · `API_CONTRACTS` §3.11 · §5.4).
 *
 * `MockSessionApi` · `MockRecordingApi` 와 **같은 서버 상태**(`MockSessionState`)를 본다 — 녹음 확정이
 * 세션을 `analyzing` 으로 옮긴 뒤(Stage 4, actor `server`) 이 Mock 이 worker 역할로 `analyzed` 를 만든다.
 *
 * ── 서버 규칙 (BACKEND 요구사항과 같다) ──
 * - `conversation_only` 세션 → 시나리오와 무관하게 `ANALYSIS_NOT_AVAILABLE` (`P5-BIP-13`)
 * - 완료 전(`ready` · `recording` · `paused`) · `abandoned` → `ANALYSIS_NOT_AVAILABLE`
 * - 모르는 세션 → `RESOURCE_NOT_FOUND`
 * - worker 전이(`analyzing → analyzed`)는 contracts **`canTransition(…, 'worker', …)`** 로 판정하고,
 *   조회 횟수로만 결정한다 — `MOCK_ANALYSIS_PENDING_READS` 번 `analyzing` 뒤 `analyzed` + `full` (AC-5-14)
 *
 * scenario 표는 `analysisScenarios.ts` 머리말. 읽기 전용 endpoint 라 `Idempotency-Key` 가 없다.
 */
import {
  canTransition,
  SessionAnalysisStatusSchema,
  type SessionAnalysisStatus,
} from '@haru/contracts';

import { parseResponse, type Timer } from '../../shared/api/helpers';
import type { AnalysisApi } from '../../shared/api/analysis-api';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { MOCK_ANALYSIS_PENDING_READS, MOCK_SHORT_FEEDBACK } from '../fixtures/analysis';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioStore } from '../scenarios';
import { ensureSessionHistory } from '../sessions/sessionHistory';
import {
  COMPLETION_STATUSES,
  type MockSessionRecord,
  type MockSessionState,
} from '../sessions/sessionState';

import {
  ANALYSIS_LOADING_DELAY_MS,
  analysisScenarioGroup,
  resolveAnalysisOverlay,
  type AnalysisScenarioKey,
} from './analysisScenarios';

const STATUS_OPERATION = 'GET /v1/sessions/:sessionId/analysis';

export interface MockAnalysisApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  state: MockSessionState;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockAnalysisApi(deps: MockAnalysisApiDeps): AnalysisApi {
  const { store, clock, idFactory, timer, state, requestLog, errorCodes } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;

  /** 조회 1회를 센다 — worker 진행·`analysis-pending-then-completed` 판정의 유일한 입력. */
  function countRead(sessionId: string): number {
    const reads = (state.analysisReads.get(sessionId) ?? 0) + 1;
    state.analysisReads.set(sessionId, reads);
    return reads;
  }

  /** Mock worker — `analyzing` 세션을 결정적으로 `analyzed` + `full` 로 옮긴다 (actor `worker`). */
  function runWorker(record: MockSessionRecord, reads: number): void {
    const { status, mode } = record.summary;
    if (status !== 'analyzing' || reads <= MOCK_ANALYSIS_PENDING_READS) return;
    if (!canTransition('analyzing', 'analyzed', 'worker', mode)) return;

    record.summary = { ...record.summary, status: 'analyzed', analysisOutcome: 'full' };
    record.shortFeedback = MOCK_SHORT_FEEDBACK;
  }

  function respond(
    record: MockSessionRecord,
    scenario: AnalysisScenarioKey,
  ): SessionAnalysisStatus {
    const { summary } = record;

    if (summary.mode === 'conversation_only') {
      return fail('ANALYSIS_NOT_AVAILABLE', 'This session has no recording to look at.');
    }
    if (scenario === 'analysis-not-available' || !COMPLETION_STATUSES.has(summary.status)) {
      return fail('ANALYSIS_NOT_AVAILABLE', 'There is nothing to look at for this session yet.');
    }

    const reads = countRead(summary.id);
    const overlay = resolveAnalysisOverlay(scenario, record, reads);
    if (overlay === undefined) runWorker(record, reads);

    const current = record.summary;
    const value =
      overlay === undefined
        ? {
            sessionId: current.id,
            sessionStatus: current.status,
            mode: current.mode,
            outcome: current.status === 'analyzed' ? current.analysisOutcome : null,
            shortFeedback: current.status === 'analyzed' ? record.shortFeedback : null,
          }
        : {
            sessionId: current.id,
            sessionStatus: overlay.sessionStatus,
            mode: current.mode,
            outcome: overlay.outcome,
            shortFeedback: overlay.shortFeedback,
          };

    return parseResponse(SessionAnalysisStatusSchema, value, {
      operation: STATUS_OPERATION,
      direction: 'response',
    });
  }

  return {
    async getStatus(
      request: { sessionId: string },
      options: ApiRequestOptions = {},
    ): Promise<SessionAnalysisStatus> {
      requestLog?.record(STATUS_OPERATION, { sessionId: request.sessionId });

      const { scenario, attempt } = beginScenarioCall(
        store,
        analysisScenarioGroup,
        'getStatus',
        options.signal,
      );

      const run = (): SessionAnalysisStatus => {
        ensureSessionHistory(state, clock);
        const record = state.sessions.get(request.sessionId);
        if (record === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown session.');
        return respond(record, scenario);
      };

      return deliver({
        scenario,
        attempt,
        delayMs: ANALYSIS_LOADING_DELAY_MS,
        run,
        message: 'Mock analysis status failed.',
        errorCode: resolveErrorCode(errorCodes, analysisScenarioGroup.group, 'getStatus'),
        signal: options.signal,
        timer,
        failure,
      });
    },
  };
}
