/**
 * `MockAuthGateway` scenario 테스트 — AC-2-06 · AC-2-07 · AC-2-08 · AC-2-50 · AC-2-52.
 */
import {
  AuthResultSchema,
  HaruApiError,
  SignUpWithEmailInputSchema,
  type AuthSession,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createImmediateTimer, isHaruApiError, NetworkError } from '../../shared/api/helpers';
import { AUTH_GATEWAY_METHODS } from '../../shared/auth';
import { createFixedClock } from '../../shared/lib/clock';
import { createSeededIdFactory } from '../../shared/lib/idFactory';
import { createMockAuthGateway, AUTH_SCENARIO_KEYS } from '../auth/MockAuthGateway';
import { createRequestLog } from '../request-log';
import { createScenarioSource, createScenarioStore } from '../scenarios';

const EPOCH = Date.UTC(2026, 0, 1);
const VALID_SIGN_UP = {
  caregiverName: 'Sam Rivera',
  email: 'sam@example.com',
  password: 'sunny-evening-8',
};

function makeGateway(scenario = 'success') {
  const requestLog = createRequestLog();
  const gateway = createMockAuthGateway({
    store: createScenarioStore([createScenarioSource('url', { auth: scenario })]),
    clock: createFixedClock(EPOCH),
    idFactory: createSeededIdFactory('test'),
    timer: createImmediateTimer(),
    requestLog,
  });

  return { gateway, requestLog };
}

describe('AuthGateway 9 메서드 (AC-2-06)', () => {
  it('ARCHITECTURE §7.2 의 메서드를 모두 구현한다', () => {
    const { gateway } = makeGateway();

    expect(AUTH_GATEWAY_METHODS).toHaveLength(9);
    for (const method of AUTH_GATEWAY_METHODS) {
      expect(typeof gateway[method]).toBe('function');
    }
  });
});

describe('scenario catalogue (§5.4 · AC-2-53)', () => {
  it('auth 그룹 key 는 catalogue 값만 쓴다', () => {
    expect([...AUTH_SCENARIO_KEYS]).toStrictEqual([
      'success',
      'loading',
      'error',
      'retry',
      'offline',
      'token-expired',
      'provider-cancelled',
    ]);
  });
});

describe('success', () => {
  it('가입 결과가 contracts schema 를 통과한다 (AC-2-50)', async () => {
    const { gateway } = makeGateway();
    const result = await gateway.signUpWithEmail(VALID_SIGN_UP);

    expect(() => AuthResultSchema.parse(result)).not.toThrow();
    expect(result.session).not.toBeNull();
  });

  it('구독자는 구독 즉시 현재 값을, 이후 변화를 통지받는다', async () => {
    const { gateway } = makeGateway();
    const seen: (AuthSession | null)[] = [];
    const unsubscribe = gateway.onChange((session) => seen.push(session));

    await gateway.signInWithEmail({ email: 'sam@example.com', password: 'sunny-evening-8' });
    await gateway.signOut();
    unsubscribe();

    expect(seen[0]).toBeNull();
    expect(seen[1]).not.toBeNull();
    expect(seen[2]).toBeNull();
  });

  it('같은 scenario 를 반복하면 같은 응답이 나온다 (결정성 — AC-2-52)', async () => {
    const first = await makeGateway().gateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });
    const second = await makeGateway().gateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe('error — 동작별 Error Code (AC-2-48 신규 코드 0건)', () => {
  it.each([
    ['signUpWithEmail', 'VALIDATION_FAILED'],
    ['signInWithEmail', 'AUTH_REQUIRED'],
    ['signInWithProvider', 'PROVIDER_UNAVAILABLE'],
    ['requestPasswordReset', 'INTERNAL_ERROR'],
    ['updatePassword', 'AUTH_TOKEN_EXPIRED'],
  ] as const)('%s → %s', async (method, code) => {
    const { gateway } = makeGateway('error');

    const call = {
      signUpWithEmail: () => gateway.signUpWithEmail(VALID_SIGN_UP),
      signInWithEmail: () =>
        gateway.signInWithEmail({ email: 'sam@example.com', password: 'sunny-evening-8' }),
      signInWithProvider: () => gateway.signInWithProvider('google'),
      requestPasswordReset: () => gateway.requestPasswordReset({ email: 'sam@example.com' }),
      updatePassword: () => gateway.updatePassword({ password: 'sunny-evening-8' }),
    }[method];

    await expect(call()).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === code,
    );
  });
});

describe('retry — 1회차 실패 → 2회차 성공', () => {
  it('두 번째 호출이 성공한다', async () => {
    const { gateway } = makeGateway('retry');

    await expect(
      gateway.signInWithEmail({ email: 'sam@example.com', password: 'sunny-evening-8' }),
    ).rejects.toBeInstanceOf(HaruApiError);

    const result = await gateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });

    expect(result.session).not.toBeNull();
  });
});

describe('offline', () => {
  it('Error Envelope 없이 NetworkError 를 던진다', async () => {
    const { gateway } = makeGateway('offline');

    await expect(
      gateway.signInWithEmail({ email: 'a@b.co', password: 'x' }),
    ).rejects.toBeInstanceOf(NetworkError);
  });
});

describe('provider-cancelled (AC-2-08)', () => {
  it('오류가 아니라 session:null 성공이다', async () => {
    const { gateway } = makeGateway('provider-cancelled');
    const result = await gateway.signInWithProvider('apple');

    expect(result.session).toBeNull();
    expect(await gateway.getSession()).toBeNull();
  });
});

describe('refreshSession (AC-2-07)', () => {
  it('세션이 있으면 새 세션을 발급한다', async () => {
    const { gateway } = makeGateway();
    const signedIn = await gateway.signInWithEmail({
      email: 'a@b.co',
      password: 'sunny-evening-8',
    });
    const refreshed = await gateway.refreshSession();

    expect(refreshed).not.toBeNull();
    expect(refreshed?.accessToken).not.toBe(signedIn.session?.accessToken);
  });

  it('세션이 없으면 null 이다 (예외를 던지지 않는다)', async () => {
    const { gateway } = makeGateway();

    expect(await gateway.refreshSession()).toBeNull();
  });

  it('`error` scenario 에서는 갱신하지 못하고 null 이다', async () => {
    const { gateway } = makeGateway('success');
    await gateway.signInWithEmail({ email: 'a@b.co', password: 'sunny-evening-8' });

    const { gateway: failing } = makeGateway('error');
    expect(await failing.refreshSession()).toBeNull();
  });
});

describe('입력 검증 — 아이 필드 차단 (AC-2-05)', () => {
  it('SignUpWithEmailInputSchema 가 `.strict()` 라 아이 필드가 섞이면 parse 실패한다', () => {
    const withChild = { ...VALID_SIGN_UP, firstName: 'Haru', birthYearMonth: '2021-03' };

    expect(SignUpWithEmailInputSchema.safeParse(withChild).success).toBe(false);
  });

  it('Gateway 가 아이 필드가 섞인 입력을 거부한다', async () => {
    const { gateway } = makeGateway();
    const withChild = { ...VALID_SIGN_UP, firstName: 'Haru' } as typeof VALID_SIGN_UP;

    await expect(gateway.signUpWithEmail(withChild)).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'VALIDATION_FAILED',
    );
  });
});

describe('요청 로그 — 비밀번호는 기록하지 않는다 (§5.5)', () => {
  it('payload 의 password 가 표식으로 바뀐다', async () => {
    const { gateway, requestLog } = makeGateway();
    await gateway.signUpWithEmail(VALID_SIGN_UP);

    const serialized = JSON.stringify(requestLog.entries());

    expect(serialized).not.toContain('sunny-evening-8');
    expect(serialized).toContain('[redacted]');
  });
});
