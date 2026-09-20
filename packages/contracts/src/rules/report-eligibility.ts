import { type ReportEligibility } from '../enums/report.js';

/**
 * 4주 리포트 발행 기준 — **CONFIRMED (사용자 결정 2026-09-14, #17)**.
 * 근거: `docs/API_CONTRACTS.md` §3.5, PRD FR-16 · §7.7.
 */

/** 최소 녹음 세션 수. */
export const MIN_REPORT_RECORDED_SESSIONS = 3;

/** 최소 누적 녹음 시간 (초) — 1시간. */
export const MIN_REPORT_RECORDED_SECONDS = 3600;

/** 리포트 주기 (일) — 첫 세션 완료일부터 28일 단위로 반복한다. */
export const REPORT_CYCLE_DAYS = 28;

export interface ReportEligibilityInput {
  /**
   * 누적 실제 녹음 시간 (초). 일시정지 구간은 제외하며 세션당
   * `MAX_RECORDED_SECONDS` 를 넘지 않는다 (#17-②).
   */
  recordedSeconds: number;
  /**
   * 집계 대상 세션 수. `mode === 'recorded'` 이고
   * `analysisOutcome !== 'excluded_low_quality'` 인 세션만 센다 (#17-③).
   */
  recordedSessions: number;
}

/**
 * 누적 집계값으로 리포트 발행 자격을 판정한다. 부수효과 없는 순수 함수다.
 *
 * `'cycle_in_progress'` 는 **이 함수가 반환하지 않는다**. 주기 경과 여부는 날짜 계산이
 * 필요하며 판정 시점 규칙이 Stage 7 Plan 의 미결 항목이기 때문이다
 * (`docs/API_CONTRACTS.md` §3.5 주석). 주기 판정은 호출부에서 이 결과와 결합한다.
 */
export function isReportEligible(input: ReportEligibilityInput): ReportEligibility {
  const minutesOk = input.recordedSeconds >= MIN_REPORT_RECORDED_SECONDS;
  const sessionsOk = input.recordedSessions >= MIN_REPORT_RECORDED_SESSIONS;

  if (minutesOk && sessionsOk) return 'eligible';
  if (!minutesOk && !sessionsOk) return 'insufficient_both';
  if (!minutesOk) return 'insufficient_recorded_minutes';
  return 'insufficient_recorded_sessions';
}
