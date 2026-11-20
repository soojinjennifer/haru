/**
 * `MockReportApi` — 4주 리포트 overview · 목록 · 상세 · 열람 Mock Adapter
 * (Stage 7 Plan §8 그룹 `reports` · `API_CONTRACTS` §4 Stage 7 C7-2~C7-4 · C7-7).
 *
 * scenario 표 = `reportState.ts` 의 `seedReportState`. 공통 `loading`·`error`·`retry`·`offline` 은 `deliver`.
 *
 * ── 서버 규칙 (Backend 요구와 같다) ──
 * - 아이 id 는 `GET /v1/me` 의 아이 하나뿐 — 다른 id → `CHILD_NOT_FOUND` (`P7-BIP-13`, RLS 는 Backend)
 * - overview: `latestReport` = 목록 맨 앞 · `currentCycle` = 상태의 주기 · `reportCount` = 발행 수 (C7-2a)
 * - 상세: 발행 리포트 = 스냅샷 그대로 · **현재 주기의 (발행 전) id** → `deferred` 면 `REPORT_NOT_ELIGIBLE`,
 *   그 밖이면 `REPORT_NOT_READY`(`delayed` 는 `details.retryAfter`) · 모르는 id → `RESOURCE_NOT_FOUND`
 * - `viewed`: 발행 리포트만 · 멱등(반복 호출 = 204) · 이후 list·overview 의 `viewed = true` (AC-7-16)
 * - 목록: 최신 먼저 · cursor = 불투명 문자열(Mock 은 offset) · 잘못된 cursor → `VALIDATION_FAILED`
 * - `highlight-clips:clip-expired` 이면 상세의 두 번째 클립 `expiresAt` = 과거 (그룹 간 일관 — 재생 Mock 과 같은 클립)
 */
import {
  ReportDetailSchema,
  ReportListQuerySchema,
  ReportOverviewSchema,
  ReportSummaryPageSchema,
  type ReportDetail,
  type ReportListQueryInput,
  type ReportOverview,
  type ReportSummaryPage,
} from '@haru/contracts';

import { parseRequest, parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { ReportApi } from '../../shared/api/report-api';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { MOCK_HIGHLIGHT_CLIP_IDS } from '../fixtures/highlight-clips';
import { MOCK_CHILD_ID } from '../fixtures/me';
import { MOCK_EXPIRED_AT, MOCK_REPORT_RETRY_AFTER } from '../fixtures/reports';
import { highlightClipScenarioGroup } from '../highlight-clips/highlightClipScenarios';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioStore } from '../scenarios';

import {
  REPORT_LOADING_DELAY_MS,
  reportScenarioGroup,
  type ReportScenarioKey,
} from './reportScenarios';
import { findReport, seedReportState, toReportCycle, type MockReportState } from './reportState';

const OVERVIEW_OPERATION = 'GET /v1/children/:childId/reports/overview';
const LIST_OPERATION = 'GET /v1/children/:childId/reports';
const DETAIL_OPERATION = 'GET /v1/reports/:reportId';
const VIEWED_OPERATION = 'POST /v1/reports/:reportId/viewed';

const CURSOR_PREFIX = 'mock-offset-';

/** 상태 seed — 공통 key 는 `success` 와 같은 세계다. */
export function ensureReportSeed(store: ScenarioStore, state: MockReportState): void {
  seedReportState(state, store.resolve(reportScenarioGroup));
}

export interface MockReportApiDeps {
  store: ScenarioStore;
  idFactory: IdFactory;
  timer: Timer;
  state: MockReportState;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockReportApi(deps: MockReportApiDeps): ReportApi {
  const { store, idFactory, timer, state, requestLog, errorCodes } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;

  function call<T>(
    method: string,
    signal: AbortSignal | undefined,
    run: (scenario: ReportScenarioKey) => T,
  ): Promise<T> {
    const { scenario, attempt } = beginScenarioCall(store, reportScenarioGroup, method, signal);
    return deliver({
      scenario,
      attempt,
      delayMs: REPORT_LOADING_DELAY_MS,
      run: () => {
        ensureReportSeed(store, state);
        return run(scenario);
      },
      message: 'Mock report request failed.',
      errorCode: resolveErrorCode(errorCodes, reportScenarioGroup.group, method),
      signal,
      timer,
      failure,
    });
  }

  function assertChild(childId: string): void {
    if (childId !== MOCK_CHILD_ID) fail('CHILD_NOT_FOUND', 'Unknown child.');
  }

  /** `highlight-clips:clip-expired` — 상세 응답에만 겹치는 표시(스냅샷은 바꾸지 않는다). */
  function withClipOverlay(detail: ReportDetail): ReportDetail {
    if (store.resolve(highlightClipScenarioGroup) !== 'clip-expired') return detail;
    return {
      ...detail,
      highlightClips: detail.highlightClips.map((clip) =>
        clip.id === MOCK_HIGHLIGHT_CLIP_IDS[1] ? { ...clip, expiresAt: MOCK_EXPIRED_AT } : clip,
      ),
    };
  }

  function decodeCursor(cursor: string | undefined): number {
    if (cursor === undefined) return 0;
    const offset = Number(cursor.slice(CURSOR_PREFIX.length));
    if (!cursor.startsWith(CURSOR_PREFIX) || !Number.isInteger(offset) || offset < 0) {
      return fail('VALIDATION_FAILED', 'Unknown cursor.', { fields: ['cursor'] });
    }
    return offset;
  }

  return {
    getOverview(
      request: { childId: string },
      options: ApiRequestOptions = {},
    ): Promise<ReportOverview> {
      requestLog?.record(OVERVIEW_OPERATION, { childId: request.childId });
      return call('getOverview', options.signal, () => {
        assertChild(request.childId);
        const [first] = state.reports;
        return parseResponse(
          ReportOverviewSchema,
          {
            currentCycle: toReportCycle(state.cycle),
            latestReport: first === undefined ? null : first.detail.summary,
            reportCount: state.reports.length,
          },
          { operation: OVERVIEW_OPERATION, direction: 'response' },
        );
      });
    },

    list(
      request: { childId: string; query?: ReportListQueryInput },
      options: ApiRequestOptions = {},
    ): Promise<ReportSummaryPage> {
      const query = parseRequest(ReportListQuerySchema, request.query ?? {}, {
        operation: LIST_OPERATION,
      });
      requestLog?.record(LIST_OPERATION, { childId: request.childId, ...query });
      return call('list', options.signal, () => {
        assertChild(request.childId);
        const offset = decodeCursor(query.cursor);
        const end = offset + query.limit;
        const items = state.reports.slice(offset, end).map((record) => record.detail.summary);
        return parseResponse(
          ReportSummaryPageSchema,
          {
            items,
            nextCursor: end < state.reports.length ? `${CURSOR_PREFIX}${String(end)}` : null,
          },
          { operation: LIST_OPERATION, direction: 'response' },
        );
      });
    },

    getDetail(
      request: { reportId: string },
      options: ApiRequestOptions = {},
    ): Promise<ReportDetail> {
      requestLog?.record(DETAIL_OPERATION, { reportId: request.reportId });
      return call('getDetail', options.signal, () => {
        const record = findReport(state, request.reportId);
        if (record === undefined) {
          if (request.reportId !== state.cycle.pendingReportId) {
            return fail('RESOURCE_NOT_FOUND', 'Unknown report.');
          }
          if (state.cycle.status === 'deferred') {
            return fail('REPORT_NOT_ELIGIBLE', 'This report cycle was carried over.');
          }
          return fail(
            'REPORT_NOT_READY',
            'This report is not ready yet.',
            state.cycle.status === 'delayed' ? { retryAfter: MOCK_REPORT_RETRY_AFTER } : undefined,
          );
        }
        return parseResponse(ReportDetailSchema, withClipOverlay(record.detail), {
          operation: DETAIL_OPERATION,
          direction: 'response',
        });
      });
    },

    markViewed(request: { reportId: string }, options: ApiRequestOptions = {}): Promise<void> {
      requestLog?.record(VIEWED_OPERATION, { reportId: request.reportId });
      return call('markViewed', options.signal, () => {
        const record = findReport(state, request.reportId);
        if (record === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown report.');
        if (record.detail.summary.viewed) return;
        record.detail = {
          ...record.detail,
          summary: { ...record.detail.summary, viewed: true },
        };
      });
    },
  };
}
