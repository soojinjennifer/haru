/**
 * 리포트 PDF 상태 머신 reducer — Stage 7 Plan §5.3 · Spec §2.6 (`S7-F`). AC-7-56 · 57 · 58.
 */
import { describe, expect, it } from 'vitest';

import {
  IDLE_REPORT_PDF_JOB,
  isReportPdfBusy,
  reportPdfReducer,
  type ReportPdfJob,
} from '../model/reportPdfState';

const file = new File(['%PDF-1.4'], 'report.pdf', { type: 'application/pdf' });

function started(): ReportPdfJob {
  return reportPdfReducer(IDLE_REPORT_PDF_JOB, { type: 'start', now: 1_000, freshKey: 'k1' });
}

describe('reportPdfReducer', () => {
  it('idle → start → requesting (시도 1 · 새 키 · 시작 시각)', () => {
    expect(started()).toStrictEqual({
      phase: 'requesting',
      attempt: 1,
      key: 'k1',
      startedAt: 1_000,
    });
  });

  it('진행 중 · ready 의 start 는 무시한다 — 같은 객체 (재탭 = 중복 POST 0, AC-7-57)', () => {
    const requesting = started();
    expect(reportPdfReducer(requesting, { type: 'start', now: 2_000, freshKey: 'k2' })).toBe(
      requesting,
    );
    const generating = reportPdfReducer(requesting, {
      type: 'server-status',
      key: 'k1',
      status: 'queued',
    });
    expect(reportPdfReducer(generating, { type: 'start', now: 2_000, freshKey: 'k2' })).toBe(
      generating,
    );
    const ready = reportPdfReducer(generating, { type: 'file-ready', key: 'k1', file });
    expect(reportPdfReducer(ready, { type: 'start', now: 2_000, freshKey: 'k2' })).toBe(ready);
  });

  it('queued · generating · ready(파일 전) → generating — 시작 시각 유지', () => {
    for (const status of ['queued', 'generating', 'ready'] as const) {
      expect(
        reportPdfReducer(started(), { type: 'server-status', key: 'k1', status }),
      ).toStrictEqual({ phase: 'generating', attempt: 1, key: 'k1', startedAt: 1_000 });
    }
  });

  it('파일 받음 → ready — 저장 · 공유는 상태가 아니다 (자동 저장 0, N7-40)', () => {
    const generating = reportPdfReducer(started(), {
      type: 'server-status',
      key: 'k1',
      status: 'generating',
    });
    const ready = reportPdfReducer(generating, { type: 'file-ready', key: 'k1', file });
    expect(ready).toStrictEqual({ phase: 'ready', attempt: 1, key: 'k1', file });
    expect(isReportPdfBusy(ready)).toBe(false);
  });

  it('서버 failed → 재시도 = 시도 2 · **새 키** (AC-7-58)', () => {
    const failed = reportPdfReducer(started(), {
      type: 'server-status',
      key: 'k1',
      status: 'failed',
    });
    expect(failed).toStrictEqual({ phase: 'failed', attempt: 1, key: 'k1', serverFailed: true });
    expect(reportPdfReducer(failed, { type: 'start', now: 5_000, freshKey: 'k2' })).toStrictEqual({
      phase: 'requesting',
      attempt: 2,
      key: 'k2',
      startedAt: 5_000,
    });
  });

  it('요청 오류 · 오프라인 · 시간 초과 → 재시도 = **같은 키** (서버가 받았을 수 있다)', () => {
    const generic = reportPdfReducer(started(), {
      type: 'request-failed',
      key: 'k1',
      offline: false,
    });
    expect(generic).toStrictEqual({ phase: 'failed', attempt: 1, key: 'k1', serverFailed: false });
    const offline = reportPdfReducer(started(), {
      type: 'request-failed',
      key: 'k1',
      offline: true,
    });
    expect(offline).toStrictEqual({ phase: 'offline', attempt: 1, key: 'k1' });
    const generating = reportPdfReducer(started(), {
      type: 'server-status',
      key: 'k1',
      status: 'generating',
    });
    const timeout = reportPdfReducer(generating, { type: 'poll-timed-out', key: 'k1' });
    expect(timeout).toStrictEqual({ phase: 'timeout', attempt: 1, key: 'k1' });

    for (const job of [generic, offline, timeout]) {
      expect(reportPdfReducer(job, { type: 'start', now: 9_000, freshKey: 'other' })).toStrictEqual(
        { phase: 'requesting', attempt: 1, key: 'k1', startedAt: 9_000 },
      );
    }
  });

  it('다른 시도의 늦은 응답 · 끝난 단계의 이벤트는 무시한다', () => {
    const requesting = started();
    expect(
      reportPdfReducer(requesting, { type: 'server-status', key: 'old', status: 'failed' }),
    ).toBe(requesting);
    expect(reportPdfReducer(requesting, { type: 'file-ready', key: 'old', file })).toBe(requesting);
    // requesting 단계는 폴링 전 — 시간 초과 이벤트 무시
    expect(reportPdfReducer(requesting, { type: 'poll-timed-out', key: 'k1' })).toBe(requesting);
    const ready = reportPdfReducer(requesting, { type: 'file-ready', key: 'k1', file });
    expect(reportPdfReducer(ready, { type: 'request-failed', key: 'k1', offline: true })).toBe(
      ready,
    );
    expect(reportPdfReducer(IDLE_REPORT_PDF_JOB, { type: 'poll-timed-out', key: 'k1' })).toBe(
      IDLE_REPORT_PDF_JOB,
    );
  });
});
