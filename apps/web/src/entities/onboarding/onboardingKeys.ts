/** `onboarding` query key factory — `.claude/rules/frontend.md` §4. */
export const onboardingKeys = {
  all: ['onboarding'] as const,
  /** `GET /v1/onboarding` — instrument + 서버 draft + 진행 상태. */
  state: () => [...onboardingKeys.all, 'state'] as const,
} as const;

export type OnboardingStateQueryKey = ReturnType<typeof onboardingKeys.state>;
