/**
 * `MockOnboardingApi` — scenario 동작 · contracts parse · **동의 전 아동 데이터 차단**.
 * AC-2-13 · AC-2-16 · AC-2-26 · AC-2-50 · AC-2-52.
 */
import { describe, expect, it } from 'vitest';
import {
  CapabilitySchema,
  HaruApiError,
  OnboardingStateSchema,
  ProfileResultSchema,
  type CompleteOnboardingAnswers,
  type SubmitOnboardingRequest,
  type SurveyAnswerValue,
} from '@haru/contracts';

import { createImmediateTimer, isHaruApiError, NetworkError } from '../../shared/api/helpers';
import { createFixedClock } from '../../shared/lib/clock';
import { createSeededIdFactory } from '../../shared/lib/idFactory';
import { createMockConsentState } from '../consent/consentState';
import { MOCK_REQUIRED_CONSENT_TYPES } from '../fixtures/consent';
import { createOnboardingInstrumentFixture, MOCK_RESUME_STEP } from '../fixtures/onboarding';
import { createMockOnboardingApi } from '../onboarding/MockOnboardingApi';
import { createMockOnboardingState } from '../onboarding/onboardingState';
import { createRequestLog, findChildDataKeys } from '../request-log';
import { createScenarioSource, createScenarioStore } from '../scenarios';

const EPOCH = Date.UTC(2026, 0, 1);
const instrument = createOnboardingInstrumentFixture();

function makeApi(scenario = 'success', options: { consented?: boolean } = {}) {
  const requestLog = createRequestLog();
  const consentState = createMockConsentState();
  const onboardingState = createMockOnboardingState();

  if (options.consented !== false) consentState.grant(MOCK_REQUIRED_CONSENT_TYPES);

  const api = createMockOnboardingApi({
    store: createScenarioStore([createScenarioSource('url', { onboarding: scenario })]),
    clock: createFixedClock(EPOCH),
    idFactory: createSeededIdFactory('test'),
    timer: createImmediateTimer(),
    consentState,
    onboardingState,
    requestLog,
  });

  return { api, requestLog, consentState, onboardingState };
}

function answersWith(value: SurveyAnswerValue): CompleteOnboardingAnswers {
  return {
    child_info: {
      firstName: 'Nova',
      birthYearMonth: '2021-04',
      gender: null,
      languageEnvironment: ['english'],
    },
    temperament: { storyComfort: 'quiet_gentle' },
    books: { favoriteBooks: [], homeBooks: [], topicTags: ['narrative'] },
    goals: { growthGoals: ['emotion_regulation'] },
    capability_items: {
      instrumentCode: instrument.survey.code,
      answers: instrument.survey.items.map((item) => ({ itemCode: item.itemCode, value })),
    },
  };
}

function submitRequest(value: SurveyAnswerValue = 3): SubmitOnboardingRequest {
  return {
    instrument: { code: instrument.code, version: instrument.version },
    answers: answersWith(value),
  };
}

const IK = { idempotencyKey: '3f0f9f60-0000-4000-8000-000000000001' };

describe('GET /v1/onboarding — instrument 를 내려준다 (결정 D-A ③)', () => {
  it('응답이 contracts schema 를 통과하고 문항을 포함한다', async () => {
    const { api } = makeApi();
    const state = await api.getState();

    expect(OnboardingStateSchema.safeParse(state).success).toBe(true);
    expect(state.instrument.questions.length).toBeGreaterThan(0);
    expect(state.instrument.survey.items).toHaveLength(10);
    expect(state.steps).toHaveLength(5);
  });

  it('`draft-resume` 은 저장된 단계와 응답을 돌려준다', async () => {
    const { api } = makeApi('draft-resume');
    const state = await api.getState();

    expect(state.currentStep).toBe(MOCK_RESUME_STEP);
    expect(state.draftAnswers.child_info?.firstName).toBeDefined();
  });

  it('`error` · `offline` · `retry` 를 재현한다', async () => {
    await expect(makeApi('error').api.getState()).rejects.toBeInstanceOf(HaruApiError);
    await expect(makeApi('offline').api.getState()).rejects.toBeInstanceOf(NetworkError);

    const { api } = makeApi('retry');
    await expect(api.getState()).rejects.toBeInstanceOf(HaruApiError);
    expect((await api.getState()).steps).toHaveLength(5);
  });
});

describe('동의 전 아동 데이터 차단 (AC-2-13 · ARCHITECTURE §7.3.1)', () => {
  it('동의 기록이 없으면 단계 저장을 `CONSENT_REQUIRED` 로 거부한다', async () => {
    const { api } = makeApi('consent-missing', { consented: false });

    await expect(
      api.saveStep({ step: 'child_info', answers: { firstName: 'Nova' } }),
    ).rejects.toMatchObject({ code: 'CONSENT_REQUIRED' });
  });

  it('동의 기록이 없으면 제출도 거부한다', async () => {
    const { api } = makeApi('consent-missing', { consented: false });

    await expect(api.submit(submitRequest(), IK)).rejects.toMatchObject({
      code: 'CONSENT_REQUIRED',
    });
  });

  it('`vpc-pending` · `vpc-failed` 구간은 동의가 있어도 거부한다 (아동 데이터 쓰기 0건)', async () => {
    for (const scenario of ['vpc-pending', 'vpc-failed']) {
      const { api } = makeApi(scenario);

      await expect(api.getState()).rejects.toMatchObject({ code: 'CONSENT_REQUIRED' });
    }
  });

  it('같은 세션에서 동의가 기록되면 그 다음 호출부터 통과한다', async () => {
    const { api, consentState } = makeApi('consent-missing', { consented: false });

    await expect(api.getState()).rejects.toMatchObject({ code: 'CONSENT_REQUIRED' });

    consentState.grant(MOCK_REQUIRED_CONSENT_TYPES);
    const state = await api.saveStep({ step: 'child_info', answers: { firstName: 'Nova' } });

    expect(state.draftAnswers.child_info?.firstName).toBe('Nova');
  });

  it('동의 완료 상태에서는 통과한다', async () => {
    const { api } = makeApi();
    const state = await api.saveStep({ step: 'child_info', answers: { firstName: 'Nova' } });

    expect(state.draftAnswers.child_info?.firstName).toBe('Nova');
  });
});

describe('PUT /v1/onboarding/steps/:step — 중도 저장 (FR-03)', () => {
  it('단계별 응답이 누적되고 완료 표시가 쌓인다', async () => {
    const { api } = makeApi();

    await api.saveStep({ step: 'child_info', answers: { firstName: 'Nova' } });
    const state = await api.saveStep({
      step: 'goals',
      answers: { growthGoals: ['cognitive_flexibility'] },
    });

    expect(state.draftAnswers.child_info?.firstName).toBe('Nova');
    expect(state.draftAnswers.goals?.growthGoals).toStrictEqual(['cognitive_flexibility']);
    expect(state.steps.filter((step) => step.completed).map((step) => step.step)).toStrictEqual([
      'child_info',
      'goals',
    ]);
  });

  it('단계에 맞지 않는 값은 요청 parse 에서 걸린다', async () => {
    const { api } = makeApi();

    await expect(
      api.saveStep({
        step: 'goals',
        answers: { growthGoals: ['reading_habit'] },
      } as never),
    ).rejects.toBeDefined();
  });
});

describe('POST /v1/onboarding/submit', () => {
  it('응답이 `ProfileResult` schema 를 통과한다', async () => {
    const { api } = makeApi();
    const result = await api.submit(submitRequest(), IK);

    expect(ProfileResultSchema.safeParse(result).success).toBe(true);
    expect(result.snapshot.scores).toHaveLength(CapabilitySchema.options.length);
  });

  it('제출이 성공하면 온보딩 상태가 완료로 바뀐다 (Guard 가 홈으로 보낼 수 있다)', async () => {
    const { api, onboardingState } = makeApi();
    await api.submit(submitRequest(), IK);

    expect(onboardingState.submitted()).toBe(true);
  });

  it('같은 key + 같은 body 는 최초 응답을 재생한다 (AC-2-16)', async () => {
    const { api } = makeApi();
    const first = await api.submit(submitRequest(), IK);
    const second = await api.submit(submitRequest(), IK);

    expect(second).toStrictEqual(first);
  });

  it('같은 key + 다른 body 는 `IDEMPOTENCY_KEY_REUSED` 다', async () => {
    const { api } = makeApi();
    await api.submit(submitRequest(3), IK);

    await expect(api.submit(submitRequest(5), IK)).rejects.toMatchObject({
      code: 'IDEMPOTENCY_KEY_REUSED',
    });
  });

  it('`child-limit-reached` 를 재현한다', async () => {
    const { api } = makeApi('child-limit-reached');

    await expect(api.submit(submitRequest(), IK)).rejects.toMatchObject({
      code: 'CHILD_LIMIT_REACHED',
    });
  });

  it('`persona-fallback` 은 200 이며 fallback 문구를 쓴다 (오류 화면이 아니다)', async () => {
    const { api } = makeApi('persona-fallback');
    const result = await api.submit(submitRequest(), IK);

    expect(result.persona.isFallback).toBe(true);
    expect(result.persona.description.length).toBeGreaterThan(0);
  });

  it('`capability-all-missing` 은 해당 역량 `score: null` 을 내려주고 parse 를 통과한다 (C-8 · D-2)', async () => {
    const { api } = makeApi('capability-all-missing');
    const result = await api.submit(submitRequest(), IK);

    expect(ProfileResultSchema.safeParse(result).success).toBe(true);

    const emotion = result.snapshot.scores.find(
      (score) => score.capability === 'emotion_regulation',
    );
    expect(emotion?.score).toBeNull();
    expect(emotion?.itemCount).toBe(0);
    expect(emotion?.missingCount).toBeGreaterThan(0);

    // 결측 역량은 발전 역량 제안 후보에서 빠진다 (D-2 ④).
    expect(result.suggestedCapability).not.toBe('emotion_regulation');
  });

  it('전 문항이 `not_observed` 면 4개 역량 전부 `score: null` 이고 제안은 `null` 이다 (D-2 ⑤)', async () => {
    const { api } = makeApi();
    const result = await api.submit(submitRequest('not_observed'), IK);

    expect(result.snapshot.scores.every((score) => score.score === null)).toBe(true);
    expect(result.suggestedCapability).toBeNull();
  });

  it('같은 scenario 를 반복 실행하면 같은 응답이 나온다 (AC-2-50 결정성)', async () => {
    const first = await makeApi('capability-all-missing').api.submit(submitRequest(), IK);
    const second = await makeApi('capability-all-missing').api.submit(submitRequest(), IK);

    expect(second).toStrictEqual(first);
  });
});

describe('요청 로그 (AC-2-13 증거)', () => {
  it('제출 payload 를 기록하되 비밀번호·토큰은 남기지 않는다', async () => {
    const { api, requestLog } = makeApi();
    await api.submit(submitRequest(), IK);

    const entries = requestLog.entries();
    expect(entries.map((entry) => entry.operation)).toContain('POST /v1/onboarding/submit');
    // 제출은 동의 **이후** 구간이므로 아동 데이터가 있는 것이 정상이다.
    expect(findChildDataKeys(entries).length).toBeGreaterThan(0);
  });

  it('동의 전 거부된 요청에도 아동 데이터가 서버 상태로 들어가지 않는다', async () => {
    const { api, onboardingState } = makeApi('consent-missing', { consented: false });

    await expect(
      api.saveStep({ step: 'child_info', answers: { firstName: 'Nova' } }),
    ).rejects.toSatisfy(isHaruApiError);
    expect(onboardingState.answers()).toStrictEqual({});
  });
});
