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
 * Stage 2-B(`/onboarding/profile` · `/onboarding/growth-capability`)는 Stage 6 에서 design-agent 명세로
 * 들어왔다 (`D6-1`). `S6-E1` 이 `profile` 을, `S6-E2` 가 `growthCapability` 를 등록했다.
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
    /**
     * 프로필 결과 — 온보딩 모드 (Stage 6 `C13-09`, Spec §2.1). `saved` CTA 가 **replace** 로 들어온다 (R-7).
     * `:step` 보다 먼저 등록해야 slug 로 잡히지 않는다.
     */
    profile: '/onboarding/profile',
    /**
     * 발전 역량 제시 — 온보딩 모드 (Stage 6 `C13-10`, Spec §2.3). 프로필 `Next` 의 목적지.
     * `S6-E2` 가 등록했다. 확정 → Home(replace).
     */
    growthCapability: '/onboarding/growth-capability',
  },

  /**
   * Stage 3 탭 route. 탭 항목은 **Library / Home(가운데) / Progress 3개**이며 `/session` 탭은
   * 없다 (`CONFIRMED (#15 · D-02)`).
   *
   * `/progress` — Stage 7 `S7-C` 가 Stage 3 준비 안내(`D-2`)를 **대체**했다: Figma `31:102` 주간 관찰 +
   * `110:835` 4주 리포트 카드 (`D7-1`). 이전 주 선택은 query `?week=YYYY-MM-DD` (`PROGRESS_WEEK_PARAM`).
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
  /**
   * 4주 리포트 상세 (Stage 7 `C13-S7-1`) — 경로를 만들 때는 `progressReportPath(id)` 를 쓴다.
   * 화면 등록 = `S7-D` (`app/router.tsx` — `ReportDetailPage`). `S7-C` 는 카드 헤더 링크(`N7-37`)의 목적지 상수를 두었다.
   * deep link 경로에는 `reportId` 만 넣는다 (이름·기간 금지 — Plan §5.6).
   */
  progressReport: '/progress/reports/:reportId',

  /** `2-HOME` 가 화면을 등록한다. */
  settings: '/settings',
  /**
   * 프로필 — 재방문 모드 (Stage 6 `C13-09`, Spec §2.2 · `D6-4`). 진입 행(설정 목록)은 `S6-B` 가 붙인다.
   * 평면 key — `settings` 를 객체로 바꾸면 기존 `ROUTES.settings` 사용처가 전부 깨진다 (`libraryAdd` 선례).
   */
  settingsProfile: '/settings/profile',
  /** 아이 정보 수정 (Stage 6 `C13-S6-2`, Spec §2.5) — `S6-B`. */
  settingsChild: '/settings/child',
  /**
   * 설문 재응답 진입 (Stage 6 `C13-S6-3`, Spec §2.6.1) — `S6-C` 가 등록했다. 설정 목록 행(`S6-B`)의 목적지.
   */
  settingsChildSurvey: '/settings/child/survey',
  /**
   * 설문 재응답 카드 (Spec §2.6.2 · `N6-48` → `D6-8`). `:step` = 온보딩과 **같은 slug** 중 카드 단계 4개
   * (`reading-together` · `books-and-interests` · `growing-together` · `capability-items`). 경로를 만들 때는
   * `settingsChildSurveyStepPath(slug)` 를 쓴다.
   */
  settingsChildSurveyStep: '/settings/child/survey/:step',
  /**
   * 발전 역량 · 설정 모드 (Stage 6 `C13-S6-4`, Spec §2.3) — `S6-D` 가 등록했다 (온보딩과 같은 컴포넌트 `mode="settings"`).
   * 설정 목록 행(`S6-B`, Spec §2.4)이 이 상수로 이동한다.
   */
  settingsGrowthCapability: '/settings/growth-capability',
  /**
   * 데이터 관리 (Stage 8 `C13-S8-2`, Spec §2.2) — 보관 정책 안내 · 녹음 목록 진입 · 전체 삭제. 설정 `ACCOUNT` 행
   * *Data & privacy* 의 목적지 (`Q8-02` ⓐ). 화면 등록 = `S8-B`.
   */
  settingsData: '/settings/data',
  /** 세션 녹음 목록 (Stage 8 `C13-S8-3`, Spec §2.3) — 행별 *Delete*. 데이터 관리 행의 목적지. `S8-B`. */
  settingsDataRecordings: '/settings/data/recordings',
  /**
   * 계정 (Stage 8 `C13-S8-6`, Spec §2.6) — 설정 `ACCOUNT` 행 *Account* 의 목적지.
   * `S8-B` 는 route 와 진입 행만 등록한다. 화면 내용(이메일 · 탈퇴)은 `S8-D`.
   */
  settingsAccount: '/settings/account',

  /**
   * Stage 4 세션 화면 (Plan §9.1 · Figma `300:1309`) — 탭이 아니라 **Fullscreen** 이다 (탭바 없음).
   * 경로를 만들 때는 `sessionPath(id)` 를 쓴다 (문자열을 흩어 조립하지 않는다).
   */
  session: '/session/:sessionId',
  /**
   * 완료 화면 (Figma `29:62` y 0~468, Stage 4 Design Spec §2.5.1 · §2.7) — `Submit` 뒤 이동한다.
   * 경로는 `FIGMA_SCREEN_MAP.md` RECOMMENDED 값 그대로. 화면 본체는 `S4-H1` 이 채운다.
   */
  sessionComplete: '/session/:sessionId/complete',
  /**
   * 피드백 · 분석 상태 화면 (Stage 5 `S5-C`, Figma 없음 — `C13-S5-1` design-agent 명세 Spec §2.3).
   * **deep link 전용**이다 — 앱 안에 이 경로로 가는 진입점이 없다 (`N5-10` ⓐ). push `short_feedback_ready` 의
   * 도착 URL 이다 (`P5-BIP-10`).
   */
  sessionFeedback: '/session/:sessionId/feedback',

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

/** `/settings/child/survey/reading-together` 형태의 경로를 만든다 (Stage 6 `S6-C`). */
export function settingsChildSurveyStepPath(slug: OnboardingStepSlug): string {
  return `${ROUTES.settingsChildSurvey}/${slug}`;
}

/** `/session/:sessionId` 의 실제 경로. */
export function sessionPath(sessionId: string): string {
  return ROUTES.session.replace(':sessionId', encodeURIComponent(sessionId));
}

/** `/session/:sessionId/complete` 의 실제 경로. */
export function sessionCompletePath(sessionId: string): string {
  return ROUTES.sessionComplete.replace(':sessionId', encodeURIComponent(sessionId));
}

/** `/session/:sessionId/feedback` 의 실제 경로 (deep link 도착 URL). */
export function sessionFeedbackPath(sessionId: string): string {
  return ROUTES.sessionFeedback.replace(':sessionId', encodeURIComponent(sessionId));
}

/**
 * `/progress` 의 주 선택 query 이름 (`S7-C`, Spec §2.7). 값 = 선택한 주의 시작일(서버 `availableWeeks` 값 그대로).
 * 없으면 이번 주다. TopBar 의 chip 과 본문이 **같은 값**을 보도록 URL 이 상태를 소유한다 (두 슬롯이 형제 route element).
 */
export const PROGRESS_WEEK_PARAM = 'week';

/** `/progress/reports/:reportId` 경로를 만든다 (`S7-C` 카드 헤더 링크 · 과거 리포트 행). */
export function progressReportPath(reportId: string): string {
  return ROUTES.progressReport.replace(':reportId', encodeURIComponent(reportId));
}

/**
 * 앱 안 기록이 없을 때 Back 의 **논리적 부모** (Stage 8 `VG6-D-12` — `N8-14` · `Q8-17`, Spec §6.3 부모 표 · AC-8-40).
 *
 * 앱 안 기록이 있으면 Back = `navigate(-1)`. 없으면(직접 URL · 새로고침 · 알림 진입 · 로그인 복귀) 이 표의 부모로 **replace**
 * 한다 — 뒤로 가기로 앱 밖에 나가거나 같은 화면 사이를 도는 고리를 만들지 않는다. 판정 · 이동은 `useBackNavigation`.
 * 시각 변화 0 (Back 버튼 모양 · 위치 그대로).
 *
 * 순서가 의미를 가진다 — 위에서부터 처음 맞는 패턴을 쓴다(구체적인 패턴이 먼저).
 */
export const BACK_PARENT_ROUTES: readonly (readonly [pattern: string, parent: string])[] = [
  [ROUTES.settingsChildSurveyStep, ROUTES.settingsChildSurvey],
  [ROUTES.settingsDataRecordings, ROUTES.settingsData],
  [ROUTES.settingsProfile, ROUTES.settings],
  [ROUTES.settingsChild, ROUTES.settings],
  [ROUTES.settingsChildSurvey, ROUTES.settings],
  [ROUTES.settingsGrowthCapability, ROUTES.settings],
  [ROUTES.settingsData, ROUTES.settings],
  [ROUTES.settingsAccount, ROUTES.settings],
  [ROUTES.settings, ROUTES.home],
  [ROUTES.libraryAdd, ROUTES.library],
  [ROUTES.libraryGiftRequests, ROUTES.library],
  [ROUTES.progressReport, ROUTES.progress],
  [ROUTES.auth.signUp, ROUTES.auth.welcome],
  [ROUTES.auth.logIn, ROUTES.auth.welcome],
  [ROUTES.auth.forgotPassword, ROUTES.auth.welcome],
  [ROUTES.auth.resetPassword, ROUTES.auth.welcome],
];

function matchesRoutePattern(pattern: string, pathname: string): boolean {
  const expected = pattern.split('/');
  const actual = pathname.replace(/\/+$/, '').split('/');
  if (expected.length !== actual.length) return false;
  return expected.every((segment, index) =>
    segment.startsWith(':') ? (actual[index] ?? '') !== '' : segment === actual[index],
  );
}

/** 이 화면의 논리적 부모 경로. 표에 없으면 Home (`/`). */
export function logicalParentPath(pathname: string): string {
  for (const [pattern, parent] of BACK_PARENT_ROUTES) {
    if (matchesRoutePattern(pattern, pathname)) return parent;
  }
  return ROUTES.home;
}
