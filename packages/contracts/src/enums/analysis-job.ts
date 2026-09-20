import { z } from 'zod';

/**
 * 분석 Job 상태 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-14.
 *
 * Frontend 화면에는 노출하지 않는다 (사용자에게는 `SessionStatus` 기반 안내만 한다).
 * 향후 Backend Worker 와 공유하기 위한 계약이다.
 */
export const AnalysisJobStatusSchema = z.enum([
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
]);

export type AnalysisJobStatus = z.infer<typeof AnalysisJobStatusSchema>;
