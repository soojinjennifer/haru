import { z } from 'zod';

/**
 * 삭제 요청 범위 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-21 · §7.8.
 */
export const DeletionScopeSchema = z.enum(['session_recording', 'all_data']);

export type DeletionScope = z.infer<typeof DeletionScopeSchema>;

/**
 * 삭제 요청 처리 상태 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-21.
 */
export const DeletionRequestStatusSchema = z.enum([
  'received',
  'processing',
  'completed',
  'failed',
]);

export type DeletionRequestStatus = z.infer<typeof DeletionRequestStatusSchema>;
