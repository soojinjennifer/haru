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

  /*
   * ⚠ Stage 3 에서 **의도적으로 바뀐 단언**이다 (회귀가 아니다).
   *
   * Stage 2 는 "어떤 scenario 도 `child` 를 담지 않는다" 였다 — 당시에는 아이가 생기는 지점이
   * 없었기 때문이다. Stage 3 의 아동 범위 endpoint(`…/home` · `…/activity-cards/today`)가
   * `:childId` 를 받으므로 **온보딩 완료 이후에는** `GET /v1/me` 가 아이 참조를 담는다
   * (contract `MeChildRefSchema` — 이미 Stage 2 에 정의되어 있던 optional 필드다).
   *
   * AC-2-13 의 실제 불변식은 "**동의·온보딩 전 구간**에 아동 데이터 0건" 이므로 그 경계를
   * 그대로 검사한다. 노출 범위도 함께 고정한다 — **first name 뿐**이고 `lastName` 은 없다 (C-6).
   */
  it('온보딩 완료 전에는 아동 데이터를 담지 않는다 (AC-2-13)', async () => {
    for (const scenario of ME_SCENARIO_KEYS) {
      if (['error', 'offline', 'retry', 'token-expired'].includes(scenario)) continue;

      const { api } = makeApi(scenario);
      const me = await api.get();

      if (me.onboardingStatus === 'completed') continue;
      expect(me.child).toBeUndefined();
    }
  });

  it('온보딩 완료 scenario 는 first name 만 담는다 (C-6 — lastName 금지)', async () => {
    const { api } = makeApi('success');
    const me = await api.get();

    expect(me.onboardingStatus).toBe('completed');
    expect(Object.keys(me.child ?? {}).sort()).toStrictEqual(['firstName', 'id']);
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
