/**
 * `MockMeApi` scenario 테스트 — AC-2-50 · AC-2-51 · AC-2-52.
 *
 * 응답이 Guard 판정 입력으로 바로 쓰일 수 있는 형태인지까지 확인한다.
 */
import { hasAllRequiredConsents, MeResponseSchema } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createImmediateTimer, isHaruApiError, NetworkError } from '../../shared/api/helpers';
import { createFixedClock } from '../../shared/lib/clock';
import { createSeededIdFactory } from '../../shared/lib/idFactory';
import { createMockConsentState } from '../consent/consentState';
import { createMockMeApi, ME_SCENARIO_KEYS } from '../me/MockMeApi';
import { createRequestLog } from '../request-log';
import { createMockOnboardingState } from '../onboarding/onboardingState';
import { createScenarioSource, createScenarioStore } from '../scenarios';

const EPOCH = Date.UTC(2026, 0, 1);

function makeApi(scenario = 'success') {
  const requestLog = createRequestLog();
  const consentState = createMockConsentState();
  const api = createMockMeApi({
    store: createScenarioStore([createScenarioSource('url', { me: scenario })]),
    clock: createFixedClock(EPOCH),
    idFactory: createSeededIdFactory('test'),
    timer: createImmediateTimer(),
    consentState,
    onboardingState: createMockOnboardingState(),
    requestLog,
  });

  return { api, requestLog, consentState };
}

describe('scenario catalogue (AC-2-53)', () => {
  it('me 그룹 key 는 catalogue 값만 쓴다', () => {
    expect([...ME_SCENARIO_KEYS]).toStrictEqual([
      'success',
      'loading',
      'error',
      'retry',
      'offline',
      'token-expired',
      'consent-missing',
      'consent-version-outdated',
      'vpc-pending',
      'vpc-failed',
      'onboarding-incomplete',
    ]);
  });
});

describe('응답이 contracts schema 를 통과한다 (AC-2-50)', () => {
  it.each([
    'success',
    'loading',
    'consent-missing',
    'consent-version-outdated',
    'vpc-pending',
    'vpc-failed',
    'onboarding-incomplete',
  ])('%s', async (scenario) => {
    const { api } = makeApi(scenario);
    const response = await api.get();

    expect(() => MeResponseSchema.parse(response)).not.toThrow();
  });
});

describe('scenario 별 Guard 입력', () => {
  it('success → 동의 완료 · VPC 불필요 · 온보딩 완료', async () => {
    const { api } = makeApi();
    const me = await api.get();

    expect(hasAllRequiredConsents(me.consentStatus)).toBe(true);
    expect(me.parentVerification.status).toBe('not_required');
    expect(me.onboardingStatus).toBe('completed');
  });

  it.each(['consent-missing', 'consent-version-outdated'])(
    '%s → 필수 동의가 비어 있지 않다',
    async (scenario) => {
      const { api } = makeApi(scenario);
      const me = await api.get();

      expect(hasAllRequiredConsents(me.consentStatus)).toBe(false);
      expect(me.consentStatus.missing.length).toBeGreaterThan(0);
    },
  );

  it.each([
    ['vpc-pending', 'pending'],
    ['vpc-failed', 'failed'],
  ])('%s → parentVerification=%s', async (scenario, status) => {
    const { api } = makeApi(scenario);
    const me = await api.get();

    expect(me.parentVerification.status).toBe(status);
  });

  it('onboarding-incomplete → onboardingStatus=in_progress', async () => {
    const { api } = makeApi('onboarding-incomplete');
    const me = await api.get();

    expect(me.onboardingStatus).toBe('in_progress');
  });

  it('어떤 scenario 도 아동 데이터를 담지 않는다 (AC-2-13)', async () => {
    for (const scenario of ME_SCENARIO_KEYS) {
      if (['error', 'offline', 'retry', 'token-expired'].includes(scenario)) continue;

      const { api } = makeApi(scenario);
      const me = await api.get();

      expect(me.child).toBeUndefined();
    }
  });
});

describe('실패 scenario', () => {
  it('error → INTERNAL_ERROR', async () => {
    const { api } = makeApi('error');

    await expect(api.get()).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'INTERNAL_ERROR',
    );
  });

  it('offline → NetworkError (Error Envelope 없음)', async () => {
    const { api } = makeApi('offline');

    await expect(api.get()).rejects.toBeInstanceOf(NetworkError);
  });

  it('retry → 1회차 실패, 2회차 성공', async () => {
    const { api } = makeApi('retry');

    await expect(api.get()).rejects.toBeDefined();
    expect((await api.get()).onboardingStatus).toBe('completed');
  });

  it('token-expired → 1회차 AUTH_TOKEN_EXPIRED, 2회차 성공 (AC-2-07)', async () => {
    const { api } = makeApi('token-expired');

    await expect(api.get()).rejects.toSatisfy(
      (error: unknown) => isHaruApiError(error) && error.code === 'AUTH_TOKEN_EXPIRED',
    );
    expect((await api.get()).caregiver.displayName).toBeDefined();
  });
});

describe('결정성 (AC-2-52)', () => {
  it('같은 scenario 를 반복하면 같은 응답 바이트다', async () => {
    const first = await makeApi().api.get();
    const second = await makeApi().api.get();

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});
