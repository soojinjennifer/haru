import { z } from 'zod';

/**
 * Activity Card 가 제시하는 선택지 종류 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD §7.4 · §13.
 */
export const ActivityOptionKindSchema = z.enum(['book', 'reread_book', 'conversation_only']);

export type ActivityOptionKind = z.infer<typeof ActivityOptionKindSchema>;
