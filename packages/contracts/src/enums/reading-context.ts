import { z } from 'zod';

/**
 * 읽기 상황(언제 읽을지) — 근거: `docs/API_CONTRACTS.md` §2.2, PRD §7.4 · FR-08.
 * 표시 문구는 Frontend copy 모듈이 소유한다.
 */
export const ReadingContextSchema = z.enum([
  'now',
  'bedtime',
  'after_pickup',
  'weekend_morning',
  'in_the_car',
  'custom_time',
]);

export type ReadingContext = z.infer<typeof ReadingContextSchema>;
