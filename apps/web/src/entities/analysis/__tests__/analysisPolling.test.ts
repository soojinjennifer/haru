/**
 * 분석 폴링 간격 — Stage 5 Plan §5.3 (`N5-14`, AC-5-35 의 순수 함수 부분).
 */
import type { SessionAnalysisStatus } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import {
  ANALYSIS_FAILED_POLL_INTERVAL_MS,
  ANALYSIS_POLL_INTERVAL_MS,
  selectAnalysisRefetchInterval,
} from '../analysisPolling';

function status(sessionStatus: SessionAnalysisStatus['sessionStatus']): SessionAnalysisStatus {
  return {
    sessionId: '77777777-7777-4777-8777-000000000001',
    sessionStatus,
    mode: 'recorded',
    outcome: sessionStatus === 'analyzed' ? 'full' : null,
    shortFeedback: null,
  };
}

describe('selectAnalysisRefetchInterval', () => {
  it('간격 상수 = 15초 · 실패 60초', () => {
    expect(ANALYSIS_POLL_INTERVAL_MS).toBe(15_000);
    expect(ANALYSIS_FAILED_POLL_INTERVAL_MS).toBe(60_000);
  });

  it('`analyzed` 에서 정지', () => {
    expect(selectAnalysisRefetchInterval(status('analyzed'), undefined)).toBe(false);
  });

  it.each(['ANALYSIS_NOT_AVAILABLE', 'RESOURCE_NOT_FOUND', 'FORBIDDEN'] as const)(
    '종착 오류 %s 에서 정지',
    (code) => {
      expect(selectAnalysisRefetchInterval(undefined, code)).toBe(false);
    },
  );

  it('`failed` 는 worker 재시도 대상 — 60초로 계속', () => {
    expect(selectAnalysisRefetchInterval(status('failed'), undefined)).toBe(60_000);
  });

  it('`analyzing` · `completed` · 결과 없음 · 일시 오류 → 15초', () => {
    expect(selectAnalysisRefetchInterval(status('analyzing'), undefined)).toBe(15_000);
    expect(selectAnalysisRefetchInterval(status('completed'), undefined)).toBe(15_000);
    expect(selectAnalysisRefetchInterval(undefined, undefined)).toBe(15_000);
    expect(selectAnalysisRefetchInterval(status('analyzing'), 'INTERNAL_ERROR')).toBe(15_000);
  });
});
