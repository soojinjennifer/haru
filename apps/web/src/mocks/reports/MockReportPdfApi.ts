/**
 * `MockReportPdfApi` — 리포트 PDF 요청·상태 Mock Adapter (Stage 7 Plan §8 그룹 `report-pdf` · C7-6, FR-17).
 *
 * | key | `POST` | 이후 `GET` |
 * |---|---|---|
 * | `success` · `share-cancelled` · `share-unsupported` | `queued` | 1회 `generating` → 그다음 `ready` |
 * | `pdf-generating` | `queued` | `MOCK_PDF_GENERATING_READS`(3)회 `generating` → `ready` |
 * | `pdf-failed` | `queued` | 첫 작업 = `failed` · **다시 요청**하면 새 작업이 `success` 와 같이 진행 → `ready` |
 * | `pdf-timeout` | `queued` | 계속 `generating` (화면이 60초 상한에서 폴링을 멈춘다 — C7-6a) |
 * | `loading` · `error` · `retry` · `offline` | 공통 (`deliver`) |
 *
 * ── 서버 규칙 ──
 * - `POST` 는 **`Idempotency-Key` 필수** — 같은 key 재전송 = 최초 응답 재생 · 다른 리포트에 같은 key = `IDEMPOTENCY_KEY_REUSED`
 * - 같은 리포트 재요청(다른 key) = **같은 작업**(서버 멱등, `P7-BIP-09`) — `ready` 뒤 재요청도 `ready` 그대로 (AC-7-16).
 *   `failed` 뒤 재요청만 새 작업을 만든다
 * - 발행 리포트만 — 현재 주기의 (발행 전) id → `REPORT_NOT_READY` · 모르는 id → `RESOURCE_NOT_FOUND`
 * - 요청 전 `GET` → `RESOURCE_NOT_FOUND`. 생성 중은 **200 `generating`** (`PDF_NOT_READY` 는 쓰지 않는다)
 * - `ready` = 가짜 PDF `data:` URL(런타임 생성) · 만료 = `MOCK_SIGNED_URL_EXPIRES_AT` · 파일명 = 서버 값(아이 이름 없음)
 * - 진행은 GET 횟수로만 정한다 — 시간·난수 없음 (결정적).
 */
import { ReportPdfStatusSchema, type ReportPdfStatus } from '@haru/contracts';

import { parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { ApiMutationOptions } from '../../shared/api/options';
import type { ReportPdfApi } from '../../shared/api/report-pdf-api';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { idempotencyFingerprint, type IdempotencyLedger } from '../common/idempotency';
import { MOCK_SIGNED_URL_EXPIRES_AT, mockReportPdfFileName } from '../fixtures/reports';
import { createMockPdfDataUrl } from '../media/mock-pdf';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioStore } from '../scenarios';

import { ensureReportSeed } from './MockReportApi';
import {
  MOCK_PDF_GENERATING_READS,
  REPORT_LOADING_DELAY_MS,
  reportPdfScenarioGroup,
  type ReportPdfScenarioKey,
} from './reportScenarios';
import { findReport, type MockPdfJob, type MockReportState } from './reportState';

const REQUEST_OPERATION = 'POST /v1/reports/:reportId/pdf';
const STATUS_OPERATION = 'GET /v1/reports/:reportId/pdf';

/** 이 작업이 이번 GET 에서 어디까지 진행되는가. 한 번 `ready`·`failed` 면 그대로 머문다. */
function advance(job: MockPdfJob, scenario: ReportPdfScenarioKey): MockPdfJob['status'] {
  if (job.status === 'ready' || job.status === 'failed') return job.status;
  const reads = job.reads;
  switch (scenario) {
    case 'pdf-timeout':
      return 'generating';
    case 'pdf-generating':
      return reads > MOCK_PDF_GENERATING_READS ? 'ready' : 'generating';
    case 'pdf-failed':
      if (job.attempt === 1) return 'failed';
      return reads > 1 ? 'ready' : 'generating';
    default:
      return reads > 1 ? 'ready' : 'generating';
  }
}

export interface MockReportPdfApiDeps {
  store: ScenarioStore;
  idFactory: IdFactory;
  timer: Timer;
  state: MockReportState;
  idempotency: IdempotencyLedger;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockReportPdfApi(deps: MockReportPdfApiDeps): ReportPdfApi {
  const { store, idFactory, timer, state, idempotency, requestLog, errorCodes } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;

  function toStatus(reportId: string, job: MockPdfJob, operation: string): ReportPdfStatus {
    const record = findReport(state, reportId);
    const ready = job.status === 'ready' && record !== undefined;
    return parseResponse(
      ReportPdfStatusSchema,
      {
        status: job.status,
        downloadUrl: ready ? createMockPdfDataUrl() : null,
        expiresAt: ready ? MOCK_SIGNED_URL_EXPIRES_AT : null,
        fileName: ready ? mockReportPdfFileName(record.detail.summary) : null,
      },
      { operation, direction: 'response' },
    );
  }

  function call<T>(
    method: string,
    signal: AbortSignal | undefined,
    run: (scenario: ReportPdfScenarioKey) => T,
  ): Promise<T> {
    const { scenario, attempt } = beginScenarioCall(store, reportPdfScenarioGroup, method, signal);
    return deliver({
      scenario,
      attempt,
      delayMs: REPORT_LOADING_DELAY_MS,
      run: () => {
        ensureReportSeed(store, state);
        return run(scenario);
      },
      message: 'Mock report PDF request failed.',
      errorCode: resolveErrorCode(errorCodes, reportPdfScenarioGroup.group, method),
      signal,
      timer,
      failure,
    });
  }

  return {
    request(request: { reportId: string }, options: ApiMutationOptions): Promise<ReportPdfStatus> {
      // 키는 로그에 남기지 않는다 (요청 로그는 경로 파라미터만)
      requestLog?.record(REQUEST_OPERATION, { reportId: request.reportId });
      return call('request', options.signal, () => {
        if (options.idempotencyKey.length === 0) {
          return fail('VALIDATION_FAILED', 'Idempotency-Key is required.', {
            fields: ['Idempotency-Key'],
          });
        }
        const fingerprint = idempotencyFingerprint(
          REQUEST_OPERATION,
          { reportId: request.reportId },
          null,
        );
        const replayed = idempotency.replay<ReportPdfStatus>(options.idempotencyKey, fingerprint);
        if (replayed !== undefined) return replayed;

        if (findReport(state, request.reportId) === undefined) {
          return request.reportId === state.cycle.pendingReportId
            ? fail('REPORT_NOT_READY', 'This report is not ready yet.')
            : fail('RESOURCE_NOT_FOUND', 'Unknown report.');
        }

        const existing = state.pdfJobs.get(request.reportId);
        const job: MockPdfJob =
          existing !== undefined && existing.status !== 'failed'
            ? existing
            : { attempt: (existing?.attempt ?? 0) + 1, reads: 0, status: 'queued' };
        state.pdfJobs.set(request.reportId, job);

        return idempotency.remember(
          options.idempotencyKey,
          fingerprint,
          toStatus(request.reportId, job, REQUEST_OPERATION),
        );
      });
    },

    getStatus(
      request: { reportId: string },
      options: ApiRequestOptions = {},
    ): Promise<ReportPdfStatus> {
      requestLog?.record(STATUS_OPERATION, { reportId: request.reportId });
      return call('getStatus', options.signal, (scenario) => {
        const job = state.pdfJobs.get(request.reportId);
        if (job === undefined)
          return fail('RESOURCE_NOT_FOUND', 'No PDF was requested for this report.');
        job.reads += 1;
        job.status = advance(job, scenario);
        return toStatus(request.reportId, job, STATUS_OPERATION);
      });
    },
  };
}
