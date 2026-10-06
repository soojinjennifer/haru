import { z } from 'zod';

/**
 * Prompt 가 놓이는 읽기 단계 — **CONFIRMED (D-8, `stage-3-approvals.md` §8.1)**.
 *
 * Figma `Pagetag1`(`PRE`) · `Pagetag2`(`POST`) 를 기준으로 채택되었다.
 * 화면 라벨(`PRE` / `POST`)은 contracts 가 아니라 Frontend copy 모듈이 소유한다.
 * 판정 로직은 서버 범위다 (`P3-BIP-13`, `BACKEND_INTEGRATION_PENDING`).
 */
export const PromptPhaseSchema = z.enum(['pre', 'post']);

export type PromptPhase = z.infer<typeof PromptPhaseSchema>;
