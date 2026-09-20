import { describe, expect, it } from 'vitest';

import { ReportEligibilitySchema } from '../enums/index.js';
import {
  MIN_REPORT_RECORDED_SECONDS,
  MIN_REPORT_RECORDED_SESSIONS,
  REPORT_CYCLE_DAYS,
  type ReportEligibilityInput,
  isReportEligible,
} from '../rules/report-eligibility.js';

/**
 * 경계 fixture — Stage 1 Plan §12 "isReportEligible 경계 6 케이스
 * (3599/3600초 × 2/3세션 조합)", §11.6 AC-1-33.
 */
const BOUNDARY_CASES: ReadonlyArray<[ReportEligibilityInput, string]> = [
  [{ recordedSeconds: 3599, recordedSessions: 2 }, 'insufficient_both'],
  [{ recordedSeconds: 3599, recordedSessions: 3 }, 'insufficient_recorded_minutes'],
  [{ recordedSeconds: 3600, recordedSessions: 2 }, 'insufficient_recorded_sessions'],
  [{ recordedSeconds: 3600, recordedSessions: 3 }, 'eligible'],
  [{ recordedSeconds: 0, recordedSessions: 0 }, 'insufficient_both'],
  [{ recordedSeconds: 7200, recordedSessions: 5 }, 'eligible'],
];

describe('상수 (CONFIRMED #17)', () => {
  it('리포트 발행 기준 상수가 결정값과 일치한다', () => {
    expect(MIN_REPORT_RECORDED_SESSIONS).toBe(3);
    expect(MIN_REPORT_RECORDED_SECONDS).toBe(3600);
    expect(REPORT_CYCLE_DAYS).toBe(28);
  });
});

describe('isReportEligible', () => {
  it.each(BOUNDARY_CASES)('%j → %s', (input, expected) => {
    expect(isReportEligible(input)).toBe(expected);
  });

  it('반환값은 항상 ReportEligibility enum 값이다', () => {
    for (const [input] of BOUNDARY_CASES) {
      expect(ReportEligibilitySchema.safeParse(isReportEligible(input)).success).toBe(true);
    }
  });

  it('cycle_in_progress 는 반환하지 않는다 (주기 판정은 호출부 책임 — §3.5 주석)', () => {
    const results = BOUNDARY_CASES.map(([input]) => isReportEligible(input));
    expect(results).not.toContain('cycle_in_progress');
  });

  it('순수 함수다 — 같은 입력은 항상 같은 결과를 준다', () => {
    const input: ReportEligibilityInput = { recordedSeconds: 3600, recordedSessions: 3 };
    expect(isReportEligible(input)).toBe(isReportEligible(input));
    expect(input).toEqual({ recordedSeconds: 3600, recordedSessions: 3 });
  });
});
