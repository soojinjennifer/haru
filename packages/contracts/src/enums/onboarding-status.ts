import { z } from 'zod';

/**
 * 보호자 계정의 온보딩 진행 상태 — `caregiver_profiles.onboarding_status`
 * (`docs/DATA_MODEL.md` §5). 근거: `docs/plans/stage-2-plan.md` §7.1.
 *
 * `RECOMMENDED` — Stage 1 enum 표(§2.2)에 없던 값이며 Stage 2 Plan §18-④ 보고로 문서에 반영했다.
 *
 * Route Guard 판정(`docs/ARCHITECTURE.md` §2.4)이 이 값을 읽는다.
 * `completed` 이후의 "프로필 결과 확인 여부"는 **상태값으로 두지 않는다** (D-6).
 */
export const OnboardingStatusSchema = z.enum(['not_started', 'in_progress', 'completed']);

export type OnboardingStatus = z.infer<typeof OnboardingStatusSchema>;
