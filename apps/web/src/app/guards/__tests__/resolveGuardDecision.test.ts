/**
 * `resolveGuardDecision` **전수 판정 테스트** — AC-2-42 (결정 `D-5`).
 *
 * ARCHITECTURE §2.4 의 판정 순서를 케이스별로 고정한다. 순수 함수라 Router · Query 없이
 * 검증한다. "프로필 결과 확인" 단계가 **없다**는 것도 여기에서 고정한다 (결정 `D-6`).
 */
import type {
  ConsentType,
  MeResponse,
  OnboardingStatus,
  ParentVerificationStatus,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { ROUTES } from '../../../shared/config/routes';
import { AUTH_RETURN_STATE } from '../../../shared/lib/in-app-history';
import { resolveGuardDecision } from '../resolveGuardDecision';

const REQUIRED: ConsentType[] = ['terms_of_service', 'privacy_policy', 'child_voice_data'];

function makeMe(
  options: {
    missing?: ConsentType[];
    verification?: ParentVerificationStatus;
    onboarding?: OnboardingStatus;
  } = {},
): MeResponse {
  return {
    caregiver: {
      id: '11111111-1111-4111-8111-111111111111',
      displayName: 'Sam Rivera',
      timezone: 'America/Los_Angeles',
    },
    consentStatus: {
      required: REQUIRED,
      missing: options.missing ?? [],
      grantedAt: '2026-01-01T00:00:00.000Z',
    },
    parentVerification: { status: options.verification ?? 'not_required' },
    onboardingStatus: options.onboarding ?? 'completed',
    plan: 'free',
  };
}

/** Stage 2 에서 Guard 판정을 받는 모든 경로. */
const PATHS = [
  ROUTES.home,
  ROUTES.auth.welcome,
  ROUTES.auth.signUp,
  ROUTES.auth.logIn,
  ROUTES.auth.forgotPassword,
  ROUTES.auth.resetPassword,
  ROUTES.auth.consent,
  ROUTES.auth.verifyParent,
  ROUTES.onboarding.intro,
  ROUTES.onboarding.start,
  '/onboarding/child-info',
  '/onboarding/capability-items',
  ROUTES.onboarding.saved,
  ROUTES.settings,
] as const;

describe('1. me 미해결 → pending (AC-2-44)', () => {
  it.each(PATHS)('%s 에서 pending 이다', (pathname) => {
    expect(resolveGuardDecision(undefined, pathname)).toStrictEqual({ status: 'pending' });
  });
});

describe('2. 미인증', () => {
  it.each([
    ROUTES.auth.welcome,
    ROUTES.auth.signUp,
    ROUTES.auth.logIn,
    ROUTES.auth.forgotPassword,
    ROUTES.auth.resetPassword,
    ROUTES.auth.consent,
    ROUTES.auth.verifyParent,
  ])('%s 는 그대로 허용한다', (pathname) => {
    expect(resolveGuardDecision(null, pathname)).toStrictEqual({ status: 'allow' });
  });

  it.each([ROUTES.onboarding.intro, '/onboarding/child-info', '/onboarding/capability-items'])(
    'Trial 온보딩 %s 는 미인증이어도 허용한다 (C-12 · AC-2-45)',
    (pathname) => {
      expect(resolveGuardDecision(null, pathname)).toStrictEqual({ status: 'allow' });
    },
  );

  it.each([ROUTES.home, ROUTES.settings, ROUTES.onboarding.saved])(
    '%s 는 /auth/welcome 로 보낸다',
    (pathname) => {
      expect(resolveGuardDecision(null, pathname)).toStrictEqual({
        status: 'redirect',
        to: ROUTES.auth.welcome,
        replace: true,
      });
    },
  );

  it('세션 만료로 잃은 경우에는 /auth/log-in 으로 보낸다 (AC-2-07)', () => {
    expect(resolveGuardDecision(null, ROUTES.home, { sessionExpired: true })).toStrictEqual({
      status: 'redirect',
      to: ROUTES.auth.logIn,
      replace: true,
    });
  });

  it('이미 /auth/log-in 이면 만료 상태여도 다시 보내지 않는다 (무한 리다이렉트 방지)', () => {
    expect(resolveGuardDecision(null, ROUTES.auth.logIn, { sessionExpired: true })).toStrictEqual({
      status: 'allow',
    });
  });
});

describe('3. 동의 누락 → /auth/consent', () => {
  const me = makeMe({ missing: ['child_voice_data'], onboarding: 'not_started' });

  it.each([ROUTES.home, ROUTES.auth.welcome, ROUTES.onboarding.intro, ROUTES.settings])(
    '%s 에서 동의 화면으로 보낸다',
    (pathname) => {
      expect(resolveGuardDecision(me, pathname)).toStrictEqual({
        status: 'redirect',
        to: ROUTES.auth.consent,
        replace: true,
      });
    },
  );

  it('이미 /auth/consent 면 allow 다', () => {
    expect(resolveGuardDecision(me, ROUTES.auth.consent)).toStrictEqual({ status: 'allow' });
  });

  it('동의가 VPC 보다 먼저 판정된다 (순서 고정)', () => {
    const both = makeMe({ missing: REQUIRED, verification: 'pending', onboarding: 'not_started' });

    expect(resolveGuardDecision(both, ROUTES.home)).toStrictEqual({
      status: 'redirect',
      to: ROUTES.auth.consent,
      replace: true,
    });
  });
});

describe('4. VPC pending | failed → /auth/verify-parent', () => {
  it.each(['pending', 'failed'] as const)('status=%s 이면 VPC 슬롯으로 보낸다', (verification) => {
    const me = makeMe({ verification, onboarding: 'not_started' });

    expect(resolveGuardDecision(me, ROUTES.home)).toStrictEqual({
      status: 'redirect',
      to: ROUTES.auth.verifyParent,
      replace: true,
    });
  });

  it.each(['pending', 'failed'] as const)(
    'status=%s 이면 온보딩 진입도 막는다 (아동 데이터 쓰기 0건 — AC-2-17)',
    (verification) => {
      const me = makeMe({ verification, onboarding: 'not_started' });

      expect(resolveGuardDecision(me, '/onboarding/child-info')).toStrictEqual({
        status: 'redirect',
        to: ROUTES.auth.verifyParent,
        replace: true,
      });
    },
  );

  it.each(['not_required', 'verified'] as const)('status=%s 이면 막지 않는다', (verification) => {
    const me = makeMe({ verification });

    expect(resolveGuardDecision(me, ROUTES.home)).toStrictEqual({ status: 'allow' });
  });

  it('이미 /auth/verify-parent 면 allow 다', () => {
    const me = makeMe({ verification: 'pending', onboarding: 'not_started' });

    expect(resolveGuardDecision(me, ROUTES.auth.verifyParent)).toStrictEqual({ status: 'allow' });
  });
});

describe('5. 온보딩 미완료 → 프로필 안내 또는 저장된 지점 (`§11.19` 7-2)', () => {
  it.each(['not_started', 'in_progress'] as const)(
    'status=%s · draft 없음 → 프로필 안내(`/onboarding/start`)로 보낸다',
    (onboarding) => {
      const me = makeMe({ onboarding });

      expect(resolveGuardDecision(me, ROUTES.home)).toStrictEqual({
        status: 'redirect',
        to: ROUTES.onboarding.start,
        replace: true,
      });
    },
  );

  it('`onboardingResumePath` 를 주지 않아도 프로필 안내로 보낸다 (기본값 = draft 없음)', () => {
    const me = makeMe({ onboarding: 'in_progress' });

    expect(resolveGuardDecision(me, ROUTES.home, {})).toStrictEqual({
      status: 'redirect',
      to: ROUTES.onboarding.start,
      replace: true,
    });
    expect(resolveGuardDecision(me, ROUTES.home, { onboardingResumePath: null })).toStrictEqual({
      status: 'redirect',
      to: ROUTES.onboarding.start,
      replace: true,
    });
  });

  it.each([
    '/onboarding/child-info',
    '/onboarding/reading-together',
    '/onboarding/capability-items',
  ])('draft 있음 → 저장된 지점(%s)으로 보낸다 — resume 경로가 깨지지 않는다', (resume) => {
    const me = makeMe({ onboarding: 'in_progress' });

    expect(resolveGuardDecision(me, ROUTES.home, { onboardingResumePath: resume })).toStrictEqual({
      status: 'redirect',
      to: resume,
      replace: true,
    });
  });

  it('draft 분기는 **규칙 5 의 목적지만** 바꾼다 — 다른 규칙은 그대로다', () => {
    const resume = '/onboarding/reading-together';

    // 미인증 (규칙 2)
    expect(resolveGuardDecision(null, ROUTES.home, { onboardingResumePath: resume })).toStrictEqual(
      { status: 'redirect', to: ROUTES.auth.welcome, replace: true },
    );
    // 동의 누락 (규칙 3)
    expect(
      resolveGuardDecision(makeMe({ missing: REQUIRED, onboarding: 'not_started' }), ROUTES.home, {
        onboardingResumePath: resume,
      }),
    ).toStrictEqual({ status: 'redirect', to: ROUTES.auth.consent, replace: true });
    // VPC 미완료 (규칙 4)
    expect(
      resolveGuardDecision(
        makeMe({ verification: 'pending', onboarding: 'not_started' }),
        ROUTES.home,
        { onboardingResumePath: resume },
      ),
    ).toStrictEqual({ status: 'redirect', to: ROUTES.auth.verifyParent, replace: true });
    // 온보딩 완료 (규칙 6) — draft 가 남아 있어도 온보딩으로 되돌리지 않는다.
    expect(
      resolveGuardDecision(makeMe(), ROUTES.auth.logIn, { onboardingResumePath: resume }),
    ).toStrictEqual({ status: 'redirect', to: ROUTES.home, replace: true });
  });

  it.each([
    ROUTES.onboarding.intro,
    ROUTES.onboarding.start,
    '/onboarding/child-info',
    ROUTES.onboarding.saved,
  ])('온보딩 구간 안(%s)에서는 이동시키지 않는다', (pathname) => {
    const me = makeMe({ onboarding: 'in_progress' });

    expect(resolveGuardDecision(me, pathname)).toStrictEqual({ status: 'allow' });
  });

  it('인증된 사용자가 /auth/log-in 에 있어도 온보딩으로 보낸다', () => {
    const me = makeMe({ onboarding: 'in_progress' });

    expect(resolveGuardDecision(me, ROUTES.auth.logIn)).toStrictEqual({
      status: 'redirect',
      to: ROUTES.onboarding.start,
      replace: true,
    });
  });
});

describe('6. 온보딩 완료', () => {
  const me = makeMe();

  it.each([ROUTES.home, ROUTES.settings])('%s 는 허용한다', (pathname) => {
    expect(resolveGuardDecision(me, pathname)).toStrictEqual({ status: 'allow' });
  });

  it.each([
    ROUTES.auth.welcome,
    ROUTES.auth.signUp,
    ROUTES.auth.logIn,
    ROUTES.auth.consent,
    ROUTES.auth.verifyParent,
  ])('%s 는 인증 전용 화면이므로 홈으로 보낸다', (pathname) => {
    expect(resolveGuardDecision(me, pathname)).toStrictEqual({
      status: 'redirect',
      to: ROUTES.home,
      replace: true,
    });
  });

  it('온보딩 완료 후에도 /onboarding/saved 는 볼 수 있다 (제출 직후 연속 네비게이션)', () => {
    expect(resolveGuardDecision(me, ROUTES.onboarding.saved)).toStrictEqual({ status: 'allow' });
  });

  it('복귀 경로가 있으면 `/auth/*` 에서 Home 대신 그 경로로 보낸다 + 로그인 복귀 표식 (AC-7-46 · D7-7)', () => {
    const returnPath = '/progress/reports/e7e7e7e7-0000-4000-8000-000000000002';
    expect(resolveGuardDecision(me, ROUTES.auth.logIn, { returnPath })).toStrictEqual({
      status: 'redirect',
      to: returnPath,
      replace: true,
      state: AUTH_RETURN_STATE,
    });
    expect(resolveGuardDecision(me, ROUTES.auth.welcome, { returnPath })).toStrictEqual({
      status: 'redirect',
      to: returnPath,
      replace: true,
      state: AUTH_RETURN_STATE,
    });
    // Home 이동은 Stage 2 그대로 — 표식 없음
    expect(resolveGuardDecision(me, ROUTES.auth.logIn, { returnPath: null })).toStrictEqual({
      status: 'redirect',
      to: ROUTES.home,
      replace: true,
    });
  });

  it('복귀 경로는 **규칙 6 의 목적지만** 바꾼다 — 동의 · VPC · 온보딩 게이트가 먼저다 (AC-7-46)', () => {
    const returnPath = '/progress/reports/x';
    expect(
      resolveGuardDecision(makeMe({ missing: ['child_voice_data'] }), ROUTES.auth.logIn, {
        returnPath,
      }),
    ).toStrictEqual({ status: 'redirect', to: ROUTES.auth.consent, replace: true });
    expect(
      resolveGuardDecision(makeMe({ verification: 'pending' }), returnPath, { returnPath }),
    ).toStrictEqual({ status: 'redirect', to: ROUTES.auth.verifyParent, replace: true });
    expect(
      resolveGuardDecision(makeMe({ onboarding: 'in_progress' }), ROUTES.auth.logIn, {
        returnPath,
      }),
    ).toStrictEqual({ status: 'redirect', to: ROUTES.onboarding.start, replace: true });
    expect(resolveGuardDecision(me, ROUTES.home, { returnPath })).toStrictEqual({
      status: 'allow',
    });
  });
});

describe('D-6 — 프로필 결과 확인 단계가 없다', () => {
  it('온보딩이 완료되면 어떤 경로도 /onboarding/profile 로 보내지 않는다', () => {
    const decisions = PATHS.map((pathname) => resolveGuardDecision(makeMe(), pathname));
    const targets = decisions
      .filter((decision) => decision.status === 'redirect')
      .map((decision) => (decision.status === 'redirect' ? decision.to : ''));

    expect(targets.some((to) => to.includes('profile'))).toBe(false);
    expect(targets.some((to) => to.includes('growth-capability'))).toBe(false);
  });
});

describe('무한 리다이렉트 방지 (S2-R7 · AC-2-44)', () => {
  const cases: { me: MeResponse | null; expired?: boolean; resume?: string | null }[] = [
    { me: null },
    { me: null, expired: true },
    { me: makeMe({ missing: REQUIRED, onboarding: 'not_started' }) },
    { me: makeMe({ verification: 'pending', onboarding: 'not_started' }) },
    { me: makeMe({ onboarding: 'in_progress' }) },
    // draft 분기(`§11.19`)도 전수에 넣는다 — 목적지가 하나 늘었기 때문이다.
    { me: makeMe({ onboarding: 'in_progress' }), resume: '/onboarding/reading-together' },
    { me: makeMe({ onboarding: 'not_started' }), resume: '/onboarding/child-info' },
    { me: makeMe() },
  ];

  it('판정 결과 경로에서 다시 판정하면 allow 다 (모든 상태)', () => {
    for (const { me, expired, resume } of cases) {
      for (const pathname of PATHS) {
        const options = {
          sessionExpired: expired ?? false,
          onboardingResumePath: resume ?? null,
        };
        const first = resolveGuardDecision(me, pathname, options);
        if (first.status !== 'redirect') continue;

        const second = resolveGuardDecision(me, first.to, options);
        expect(second).toStrictEqual({ status: 'allow' });
      }
    }
  });
});
