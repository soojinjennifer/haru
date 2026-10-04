import { z } from 'zod';

/**
 * 온보딩 5단계 — 구성·순서 **CONFIRMED (사용자 결정 2026-09-14, C-9)** / 식별자 문자열 RECOMMENDED.
 * 근거: `docs/API_CONTRACTS.md` §2.2, PRD §7.2.
 *
 * 배열 순서가 곧 진행 순서다.
 *
 * 설문 재구성(2026-10-03, `stage-3-approvals.md` §11.12 · §11.16)으로 **단계 이름이 바뀌었다**.
 * `child_info` 는 카드 단계가 아니라 프로필 입력이므로 이름이 유지된다 (`R-06`).
 * 배열 길이 5 는 그대로이므로 `OnboardingState.steps.length(5)` 검증은 변하지 않는다.
 *
 * | 이전 | 현재 |
 * |---|---|
 * | `temperament` | `reading_together` |
 * | `books` | `books_and_interests` |
 * | `goals` | `growing_together` |
 */
export const OnboardingStepSchema = z.enum([
  'child_info',
  'reading_together',
  'books_and_interests',
  'growing_together',
  'capability_items',
]);

export type OnboardingStep = z.infer<typeof OnboardingStepSchema>;
