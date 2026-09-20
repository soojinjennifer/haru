import { z } from 'zod';

/**
 * 동의 종류 — **CONFIRMED (사용자 결정 2026-09-14, C-1)**.
 * 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-02 · §7.1.
 *
 * 필수 여부는 enum 이 아니라 `ConsentDocument.required` 가 표현한다 (Stage 2).
 * `third_party_disclosure` 는 법무 결정(L-02 계열) 시에만 추가한다.
 */
export const ConsentTypeSchema = z.enum([
  'terms_of_service',
  'privacy_policy',
  'child_voice_data',
  'marketing',
  'pilot_participation',
]);

export type ConsentType = z.infer<typeof ConsentTypeSchema>;

/**
 * 동의 행위 — **CONFIRMED (C-4)**. `revoked` 는 **없다** (동의 철회 MVP 제외).
 * 근거: `docs/API_CONTRACTS.md` §2.2.
 */
export const ConsentActionSchema = z.enum(['granted']);

export type ConsentAction = z.infer<typeof ConsentActionSchema>;
