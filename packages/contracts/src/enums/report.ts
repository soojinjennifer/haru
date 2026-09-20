import { z } from 'zod';

/**
 * 리포트 발행 자격 판정 결과 — 근거: `docs/API_CONTRACTS.md` §2.2 · §3.5, PRD FR-16 · §7.7.
 * 판정 기준 상수와 순수 함수는 `rules/report-eligibility.ts` 에 있다 (#17).
 */
export const ReportEligibilitySchema = z.enum([
  'eligible',
  'insufficient_recorded_minutes',
  'insufficient_recorded_sessions',
  'insufficient_both',
  'cycle_in_progress',
]);

export type ReportEligibility = z.infer<typeof ReportEligibilitySchema>;

/**
 * 리포트 생성·발행 상태 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-16 · §13.
 */
export const ReportStatusSchema = z.enum([
  'in_progress',
  'generating',
  'published',
  'deferred',
  'delayed',
]);

export type ReportStatus = z.infer<typeof ReportStatusSchema>;
