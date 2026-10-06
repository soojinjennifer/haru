import { z } from 'zod';

/**
 * Prompt 세트의 연령대 — 근거: PRD §8.2, `docs/DATA_MODEL.md` §7 `prompt_sets.age_band`.
 * MVP 대상은 3~9세이며 3구간이다.
 */
export const AgeBandSchema = z.enum(['3_4', '5_6', '7_9']);

export type AgeBand = z.infer<typeof AgeBandSchema>;
