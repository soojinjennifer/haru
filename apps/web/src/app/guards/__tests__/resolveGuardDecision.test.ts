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

describe('5. 온보딩 미완료 → /onboarding', () => {
  it.each(['not_started', 'in_progress'] as const)(
    'status=%s 이면 온보딩으로 보낸다',
    (onboarding) => {
      const me = makeMe({ onboarding });

      expect(resolveGuardDecision(me, ROUTES.home)).toStrictEqual({
        status: 'redirect',
        to: ROUTES.onboarding.intro,
        replace: true,
      });
    },
  );

  it.each([ROUTES.onboarding.intro, '/onboarding/child-info', ROUTES.onboarding.saved])(
    '온보딩 구간 안(%s)에서는 이동시키지 않는다',
    (pathname) => {
      const me = makeMe({ onboarding: 'in_progress' });

      expect(resolveGuardDecision(me, pathname)).toStrictEqual({ status: 'allow' });
    },
  );

  it('인증된 사용자가 /auth/log-in 에 있어도 온보딩으로 보낸다', () => {
    const me = makeMe({ onboarding: 'in_progress' });

    expect(resolveGuardDecision(me, ROUTES.auth.logIn)).toStrictEqual({
      status: 'redirect',
      to: ROUTES.onboarding.intro,
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
  const cases: { me: MeResponse | null; expired?: boolean }[] = [
    { me: null },
    { me: null, expired: true },
    { me: makeMe({ missing: REQUIRED, onboarding: 'not_started' }) },
    { me: makeMe({ verification: 'pending', onboarding: 'not_started' }) },
    { me: makeMe({ onboarding: 'in_progress' }) },
    { me: makeMe() },
  ];

  it('판정 결과 경로에서 다시 판정하면 allow 다 (모든 상태)', () => {
    for (const { me, expired } of cases) {
      for (const pathname of PATHS) {
        const first = resolveGuardDecision(me, pathname, { sessionExpired: expired ?? false });
        if (first.status !== 'redirect') continue;

        const second = resolveGuardDecision(me, first.to, { sessionExpired: expired ?? false });
        expect(second).toStrictEqual({ status: 'allow' });
      }
    }
  });
});
