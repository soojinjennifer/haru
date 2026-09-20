import { z } from 'zod';

/**
 * 분석 결과 구분 — **CONFIRMED (#16)**. 근거: `docs/API_CONTRACTS.md` §2.2, PRD §13.
 *
 * - `skipped_consent_revoked` 는 동의 철회 MVP 제외(C-4)로 **없다**.
 * - `skipped_audio_deleted` 는 OAQ-17 결정 전까지 enum 에 **넣지 않는다** (#16).
 */
export const AnalysisOutcomeSchema = z.enum(['full', 'excluded_low_quality']);

export type AnalysisOutcome = z.infer<typeof AnalysisOutcomeSchema>;
