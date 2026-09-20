import { z } from 'zod';

/**
 * 책 보유 상태 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-20 · FR-22 · FR-23.
 */
export const BookOwnershipSchema = z.enum(['owned', 'gifted', 'gift_pending', 'favorite_only']);

export type BookOwnership = z.infer<typeof BookOwnershipSchema>;
