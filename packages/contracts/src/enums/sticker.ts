import { z } from 'zod';

/**
 * 스티커 종류 — `sticker_awards.sticker_type` (`docs/DATA_MODEL.md` §8, PRD FR-19 · §7.6).
 * 근거: Stage 4 Plan §7.4 `C4-OPEN-5` (단일 값이라도 **만든다** — 수집 요소 확장 예고, PRD §7.9).
 */
export const StickerTypeSchema = z.enum(['attendance']);

export type StickerType = z.infer<typeof StickerTypeSchema>;
