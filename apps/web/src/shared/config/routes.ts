/**
 * Route 경로 상수 — Plan §9.1 (Stage 2 = 14 route, approvals §5).
 *
 * **경로 문자열의 단일 출처**다. Route Guard(`resolveGuardDecision`)가 판정 결과로
 * 돌려주는 경로도 여기에서 온다. 화면·테스트에 문자열을 흩어 쓰지 않는다.
 *
 * Stage 2-AUTH 시점에 router 에 실제로 등록된 화면은 `/auth/*` 5건 + `/` + `*` 이다.
 * `/auth/consent` · `/auth/verify-parent` · `/onboarding/*` · `/settings` 는 **경로만** 있고
 * 화면은 각각 `2-CONSENT` · `2-ONBOARDING` · `2-HOME` Step 이 등록한다 — Guard 가 그 경로로
 * 리다이렉트 판정을 내려야 하므로 상수는 먼저 존재해야 한다.
 *
 * Stage 2-B(`/onboarding/profile` · `/onboarding/growth-capability`)는 **여기에도 없다**
 * (approvals §3).
 *
 * dev UI gallery(`/__dev/ui/*`)의 경로는 **여기에 두지 않는다.** 이 객체는 Production 번들에
 * 그대로 남으므로, 경로 문자열도 dev 에서만 존재하도록 `app/router.tsx` 의 가드 안에 인라인한다
 * (AC-1-42 — 산출물에 dev 흔적 0건).
 */
export const ROUTES = {
  home: '/',

  auth: {
    welcome: '/auth/welcome',
    signUp: '/auth/sign-up',
    logIn: '/auth/log-in',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    /** `2-CONSENT` 가 화면을 등록한다. */
    consent: '/auth/consent',
    /** VPC 슬롯 — `2-CONSENT`. */
    verifyParent: '/auth/verify-parent',
  },

  onboarding: {
    /**
     * 설문 소개 화면 (Figma `179:1748`) — 프로필 입력이 끝난 뒤 **카드 단계 앞**에 온다.
     * 경로 문자열은 `/onboarding` 그대로 유지한다 (`ONBOARDING_STEP_SLUGS` 의 부모 경로다).
     */
    intro: '/onboarding',
    /** 프로필 입력 소개 (Figma `243:1147`, `R-12`) — 동의 직후 첫 화면이다. */
    start: '/onboarding/start',
    /**
     * 위저드 — `:step` = `child-info` · `reading-together` · `books-and-interests` ·
     * `growing-together` · `capability-items`.
     */
    step: '/onboarding/:step',
    saved: '/onboarding/saved',
  },

  /**
   * Stage 3 탭 route. 탭 항목은 **Library / Home(가운데) / Progress 3개**이며 `/session` 탭은
   * 없다 (`CONFIRMED (#15 · D-02)`).
   *
   * `/progress` 는 리포트 준비 안내만 둔다 (`CONFIRMED (D-2)` — 진행도 수치 0건).
   */
  library: '/library',
  /**
   * 서재 하위 스택 화면 2개 — Figma 에 없고 `C-13` ②(`L-OPEN-12`·`L-OPEN-13`)로 승인된
   * design-agent 명세다 (Library Design Spec §7.2 · §7.3).
   *
   * 평면 key 로 둔다 — `library` 를 객체로 바꾸면 기존 `ROUTES.library` 사용처(router ·
   * `AppTabBar` · 테스트)가 전부 깨진다. 탭 route 는 `/library` 하나이고 이 둘은 탭이 아니다.
   */
  libraryAdd: '/library/add',
  libraryGiftRequests: '/library/gift-requests',
  progress: '/progress',

  /** `2-HOME` 가 화면을 등록한다. */
  settings: '/settings',

  /**
   * Stage 4 세션 화면 (Plan §9.1 · Figma `300:1309`) — 탭이 아니라 **Fullscreen** 이다 (탭바 없음).
   * 경로를 만들 때는 `sessionPath(id)` 를 쓴다 (문자열을 흩어 조립하지 않는다).
   */
  session: '/session/:sessionId',

  notFound: '*',
} as const;

/**
 * 온보딩 위저드 step slug — 배열 **순서가 contracts `OnboardingStep` 순서와 같다**
 * (`model/steps.ts` 가 index 로만 연결한다). 설문 재구성(2026-10-03)으로 3건이 rename 됐다.
 */
export const ONBOARDING_STEP_SLUGS = [
  'child-info',
  'reading-together',
  'books-and-interests',
  'growing-together',
  'capability-items',
] as const;

export type OnboardingStepSlug = (typeof ONBOARDING_STEP_SLUGS)[number];

/** `/onboarding/child-info` 형태의 경로를 만든다. */
export function onboardingStepPath(slug: OnboardingStepSlug): string {
  return `${ROUTES.onboarding.intro}/${slug}`;
}

/** `/session/:sessionId` 의 실제 경로. */
export function sessionPath(sessionId: string): string {
  return ROUTES.session.replace(':sessionId', encodeURIComponent(sessionId));
}
