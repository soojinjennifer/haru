import { z } from 'zod';

/**
 * Prompt 종류 — 근거: `docs/DATA_MODEL.md` §7 `prompts.kind`, Stage 3 Plan §7.1.
 *
 * `question` 은 아이에게 건네는 질문, `follow_up` 은 그 뒤에 이어 갈 수 있는 문장이다.
 * 표시 문구·라벨은 contracts 가 아니라 Frontend copy 모듈이 소유한다.
 */
export const PromptKindSchema = z.enum(['question', 'follow_up']);

export type PromptKind = z.infer<typeof PromptKindSchema>;
