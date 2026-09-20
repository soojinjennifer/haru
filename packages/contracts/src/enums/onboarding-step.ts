import { z } from 'zod';

/**
 * 온보딩 5단계 — 구성·순서 **CONFIRMED (사용자 결정 2026-09-14, C-9)** / 식별자 문자열 RECOMMENDED.
 * 근거: `docs/API_CONTRACTS.md` §2.2, PRD §7.2.
 *
 * 배열 순서가 곧 진행 순서다.
 */
export const OnboardingStepSchema = z.enum([
  'child_info',
  'temperament',
  'books',
  'goals',
  'capability_items',
]);

export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;
