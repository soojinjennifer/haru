import { z } from 'zod';

/**
 * 아이 성별 — **CONFIRMED (사용자 결정 2026-09-14, C-7)**.
 * 근거: `docs/API_CONTRACTS.md` §2.2.
 *
 * 필드는 **nullable** 이며 미응답은 `null` 이다 (`GenderFieldSchema` 사용).
 */
export const GenderSchema = z.enum(['girl', 'boy', 'prefer_not_to_say']);

export type Gender = z.infer<typeof GenderSchema>;

/** 미응답(`null`)을 허용하는 필드용 schema. */
export const GenderFieldSchema = GenderSchema.nullable();

export type GenderField = z.infer<typeof GenderFieldSchema>;
