/**
 * `resolveGuardDecision` — Route Guard 판정 **순수 함수** (결정 `D-5`).
 *
 * Router · TanStack Query · React 에 의존하지 않는다. 그래서 ARCHITECTURE §2.4 의
 * 판정 순서를 **전수 케이스 단위 테스트**로 보증할 수 있다 (AC-2-42).
 *
 * 판정 순서 (위에서부터, 먼저 걸리는 규칙이 이긴다)
 * ```
 * 1. me 미해결                              → pending                (AC-2-44)
 * 2. 미인증                                  → /auth/welcome
 *      예외 ① /auth/*        = 그대로 허용
 *      예외 ② Trial 온보딩   = 그대로 허용    (/onboarding, /onboarding/:step — C-12, AC-2-45)
 *      단   ③ /onboarding/saved 는 인증·동의 이후 화면이라 Trial 예외가 아니다
 *      단   ④ 세션 만료로 잃은 경우는 /auth/log-in 으로 보낸다 (AC-2-07)
 * 3. 필수 동의 누락                           → /auth/consent
 * 4. VPC pending | failed                    → /auth/verify-parent
 * 5. 온보딩 미완료                            → /onboarding/start      (저장된 draft 가 있으면 그 지점)
 * 6. 온보딩 완료 && 현재 경로가 /auth/*        → /                      (인증 전용 화면이므로)
 * 7. 그 외                                    → allow
 * ```
 *
 * **"프로필 결과 확인" 단계는 넣지 않는다** — 결정 `D-6`. `MeResponse` 에 대응 필드를 만들지
 * 않고, 제출 직후 연속 네비게이션으로 처리한다 (Stage 2-B).
 *
 * 무한 리다이렉트 방지: 판정 결과가 **현재 경로와 같으면 `allow`** 다 (S2-R7 · AC-2-44).
 */
import { hasAllRequiredConsents, type MeResponse } from '@haru/contracts';

import { ROUTES } from '../../shared/config/routes';

/** Route 접근 판정 결과. */
export type GuardDecision =
  | { readonly status: 'allow' }
  | { readonly status: 'pending' }
  | { readonly status: 'redirect'; readonly to: string; readonly replace?: boolean };

export const ALLOW_DECISION: GuardDecision = { status: 'allow' };
export const PENDING_DECISION: GuardDecision = { status: 'pending' };

/** `undefined` 미해결 · `null` 미인증 · 값 = 해석 완료. */
export type GuardMe = MeResponse | null | undefined;

export interface GuardOptions {
  /**
   * refresh 까지 실패해 세션을 잃었는가 (AC-2-07).
   * 미인증 리다이렉트 목적지를 `/auth/welcome` → `/auth/log-in` 으로 바꾼다.
   */
  sessionExpired?: boolean;
  /**
   * 저장된 로컬 onboarding draft 가 **가리키는 지점의 경로**. draft 가 없으면 `null`.
   *
   * 결정 `§11.19` (7-2): 동의 직후 처음 도달하면 프로필 안내(`/onboarding/start`)로 보내고,
   * 중도 복귀면 **그 지점으로** 보낸다. 두 요구(새 흐름 · resume 경로)를 모두 만족시키기 위해
   * 규칙 5 의 **목적지만** 세분화한다 — 다른 규칙(미인증 · 동의 누락 · VPC)은 그대로다.
   *
   * 값은 호출부(`useGuardDecision`)가 **기존 `OnboardingDraftStore`** 를 읽어 넘긴다.
   * 이 함수는 저장소를 모른다 (순수 함수 유지 — 결정 `D-5`).
   */
  onboardingResumePath?: string | null;
}

const AUTH_PREFIX = '/auth/';

/** Trial(미인증) 로 접근할 수 있는 온보딩 경로 — C-12. `/onboarding/saved` 는 제외다. */
function isTrialOnboardingPath(pathname: string): boolean {
  if (pathname === ROUTES.onboarding.intro) return true;
  if (!pathname.startsWith(`${ROUTES.onboarding.intro}/`)) return false;

  return pathname !== ROUTES.onboarding.saved;
}

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith(AUTH_PREFIX);
}

/** 목적지가 현재 경로면 `allow` — 같은 곳으로 다시 보내지 않는다. */
function redirectTo(to: string, pathname: string): GuardDecision {
  return pathname === to ? ALLOW_DECISION : { status: 'redirect', to, replace: true };
}

export function resolveGuardDecision(
  me: GuardMe,
  pathname: string,
  options: GuardOptions = {},
): GuardDecision {
  // 1. me 미해결
  if (me === undefined) return PENDING_DECISION;

  // 2. 미인증
  if (me === null) {
    if (isAuthPath(pathname)) return ALLOW_DECISION;
    if (isTrialOnboardingPath(pathname)) return ALLOW_DECISION;

    return redirectTo(
      options.sessionExpired === true ? ROUTES.auth.logIn : ROUTES.auth.welcome,
      pathname,
    );
  }

  // 3. 필수 동의 누락
  if (!hasAllRequiredConsents(me.consentStatus)) {
    return redirectTo(ROUTES.auth.consent, pathname);
  }

  // 4. VPC 미완료
  if (me.parentVerification.status === 'pending' || me.parentVerification.status === 'failed') {
    return redirectTo(ROUTES.auth.verifyParent, pathname);
  }

  // 5. 온보딩 미완료 — 온보딩 구간 안에 있으면 그대로 두고, 밖이면 입구로 보낸다.
  if (me.onboardingStatus !== 'completed') {
    if (pathname === ROUTES.onboarding.intro) return ALLOW_DECISION;
    if (pathname.startsWith(`${ROUTES.onboarding.intro}/`)) return ALLOW_DECISION;

    // 중도 복귀면 저장된 지점으로, 처음 도달하면 프로필 안내로 (`§11.19` 7-2).
    const resume = options.onboardingResumePath;

    return redirectTo(
      resume === null || resume === undefined ? ROUTES.onboarding.start : resume,
      pathname,
    );
  }

  // 6. 온보딩까지 끝난 사용자에게 `/auth/*` 는 더 이상 보여 주지 않는다.
  if (isAuthPath(pathname)) return redirectTo(ROUTES.home, pathname);

  // 7. 그 외
  return ALLOW_DECISION;
}
