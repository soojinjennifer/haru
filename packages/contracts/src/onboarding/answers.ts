import { z } from 'zod';

import { ChildInfoAnswersSchema } from './child-info.js';
import { BooksAndInterestsAnswersSchema } from './books-and-interests.js';
import { GrowingTogetherAnswersSchema } from './growing-together.js';
import { CapabilityItemsAnswersSchema, CompleteCapabilityItemsAnswersSchema } from './survey.js';
import { ReadingTogetherAnswersSchema } from './reading-together.js';

/**
 * 온보딩 5단계 응답 묶음 — 키는 `OnboardingStep` enum 값과 1:1 이다.
 * 근거: `docs/API_CONTRACTS.md` §3.4 (`OnboardingDraft.answers`), `docs/plans/stage-2-plan.md` §7.1.
 *
 * 설문 재구성(2026-10-03)으로 세 키가 rename 되었다 (`reading_together` ·
 * `books_and_interests` · `growing_together` — Plan §7.2). 1:1 불변식을 유지하기 위해
 * enum 과 **같이** 바꾼다.
 */

/** 중도 저장(draft) 형태 — 단계별로 없거나 일부만 채워져 있을 수 있다. */
export const OnboardingDraftAnswersSchema = z.object({
  child_info: ChildInfoAnswersSchema.partial().optional(),
  reading_together: ReadingTogetherAnswersSchema.partial().optional(),
  books_and_interests: BooksAndInterestsAnswersSchema.partial().optional(),
  growing_together: GrowingTogetherAnswersSchema.partial().optional(),
  capability_items: CapabilityItemsAnswersSchema.optional(),
});

export type OnboardingDraftAnswers = z.infer<typeof OnboardingDraftAnswersSchema>;

/**
 * 제출 형태 — 5단계가 **모두** 있어야 하고 역량 문항은 10개 전부여야 한다.
 * 부족하면 서버는 `ONBOARDING_INCOMPLETE` 로 거부한다.
 *
 * 나이 범위(3~9세)까지 검증하려면 `createCompleteOnboardingAnswersSchema(now)` 를 쓴다 (D-10).
 */
export const CompleteOnboardingAnswersSchema = z.object({
  child_info: ChildInfoAnswersSchema,
  reading_together: ReadingTogetherAnswersSchema,
  books_and_interests: BooksAndInterestsAnswersSchema,
  growing_together: GrowingTogetherAnswersSchema,
  capability_items: CompleteCapabilityItemsAnswersSchema,
});

export type CompleteOnboardingAnswers = z.infer<typeof CompleteOnboardingAnswersSchema>;
