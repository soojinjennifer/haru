import { z } from 'zod';

/**
 * 책 증정 신청 상태 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-22 · §13.
 */
export const GiftRequestStatusSchema = z.enum([
  'requested',
  'approved',
  'shipped',
  'delivered',
  'cancelled',
  'rejected',
]);

export type GiftRequestStatus = z.infer<typeof GiftRequestStatusSchema>;
