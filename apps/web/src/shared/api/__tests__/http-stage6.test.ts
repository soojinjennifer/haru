/**
 * Stage 6 Http Adapter 골격 — `S6-A`. 실제 Backend 연동은 `BACKEND_INTEGRATION_PENDING` 이며,
 * 여기서는 **경로 · method · Idempotency-Key · schema parse** 규약만 고정한다 (Mock ↔ Http 교체 가능성, AC-6-48).
 */
import { HaruApiError } from '@haru/contracts';
import { describe, expect, it, vi } from 'vitest';

import { createDefaultSurveyAnswers, createMockApiClientsBundle } from '../../../mocks';
import { createOnboardingInstrumentFixture } from '../../../mocks/fixtures/onboarding';
import { createImmediateTimer } from '../helpers';
import { createSeededIdFactory } from '../../lib/idFactory';
import { createHttpApiClients, createHttpClient } from '../http';
import { createHttpChildrenApi } from '../http/HttpChildrenApi';

const BASE_URL = 'https://api.example.invalid/v1';
const CHILD_ID = '44444444-4444-4444-8444-444444444444';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function api(fetchImpl: ReturnType<typeof vi.fn>) {
  return createHttpChildrenApi(
    createHttpClient({
      baseUrl: BASE_URL,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      idFactory: createSeededIdFactory('http-stage6'),
    }),
  );
}

function call(fetchImpl: ReturnType<typeof vi.fn>, index = 0): [string, RequestInit] {
  return fetchImpl.mock.calls[index] as unknown as [string, RequestInit];
}

/** 응답 본문은 Mock 이 만든 값을 쓴다 — 같은 contract 를 두 Adapter 가 공유한다는 증거. */
async function mockBodies() {
  const bundle = createMockApiClientsBundle({ timer: createImmediateTimer() });
  const profile = await bundle.clients.children.getProfile({ childId: CHILD_ID });
  const survey = await bundle.clients.children.getSurveyUpdate({ childId: CHILD_ID });
  const instrument = createOnboardingInstrumentFixture();
  const submitBody = {
    instrument: { code: instrument.code, version: instrument.version },
    answers: createDefaultSurveyAnswers(instrument),
  };
  const result = await bundle.clients.children.submitSurveyUpdate(
    { childId: CHILD_ID, body: submitBody },
    { idempotencyKey: 'ik-mock' },
  );
  return { profile, survey, submitBody, result };
}

describe('createHttpApiClients — Stage 6 도메인 포함', () => {
  it('children 은 6 메서드다 — 히스토리 목록 메서드 없음 (`N6-12`)', () => {
    const clients = createHttpApiClients({
      baseUrl: BASE_URL,
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });
    expect(Object.keys(clients.children).sort()).toStrictEqual([
      'getProfile',
      'getSurveyUpdate',
      'saveSurveyUpdateStep',
      'setGrowthCapability',
      'submitSurveyUpdate',
      'update',
    ]);
  });
});

describe('HttpChildrenApi', () => {
  it('getProfile = GET /children/:id/profile + 응답 parse', async () => {
    const { profile } = await mockBodies();
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(profile)));
    expect(await api(fetchImpl).getProfile({ childId: CHILD_ID })).toStrictEqual(profile);
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/children/${CHILD_ID}/profile`);
    expect(init.method).toBe('GET');
  });

  it('profileUpdatedAt 키가 없는 응답 → VALIDATION_FAILED (AC-6-04)', async () => {
    const { profile } = await mockBodies();
    const { profileUpdatedAt: _omitted, ...withoutKey } = profile;
    void _omitted;
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(withoutKey)));
    const error: unknown = await api(fetchImpl)
      .getProfile({ childId: CHILD_ID })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HaruApiError);
    expect((error as HaruApiError).code).toBe('VALIDATION_FAILED');
  });

  it('update = PATCH /children/:id · body 는 trim 된 변경 필드만', async () => {
    const { profile } = await mockBodies();
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(profile)));
    await api(fetchImpl).update({ childId: CHILD_ID, body: { firstName: '  Mia ' } });
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/children/${CHILD_ID}`);
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(String(init.body))).toStrictEqual({ firstName: 'Mia' });
    expect(new Headers(init.headers).get('Idempotency-Key')).toBeNull();
  });

  it('update — 빈 요청 · relationship 은 보내기 전에 거부된다 (요청 0)', async () => {
    const fetchImpl = vi.fn();
    const children = api(fetchImpl);
    await expect(async () =>
      children.update({ childId: CHILD_ID, body: {} }),
    ).rejects.toBeDefined();
    await expect(async () =>
      children.update({
        childId: CHILD_ID,
        body: { firstName: 'Mia', relationship: 'mother' } as never,
      }),
    ).rejects.toBeDefined();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('setGrowthCapability = PUT /children/:id/growth-capability', async () => {
    const { profile } = await mockBodies();
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(profile)));
    await api(fetchImpl).setGrowthCapability({
      childId: CHILD_ID,
      body: { capability: 'intrinsic_motivation' },
    });
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/children/${CHILD_ID}/growth-capability`);
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toStrictEqual({ capability: 'intrinsic_motivation' });
  });

  it('getSurveyUpdate = GET /children/:id/survey-update', async () => {
    const { survey } = await mockBodies();
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(survey)));
    expect(await api(fetchImpl).getSurveyUpdate({ childId: CHILD_ID })).toStrictEqual(survey);
    expect(call(fetchImpl)[0]).toBe(`${BASE_URL}/children/${CHILD_ID}/survey-update`);
  });

  it('saveSurveyUpdateStep = PUT /children/:id/survey-update/steps/:step (step 은 경로)', async () => {
    const { survey } = await mockBodies();
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(survey)));
    await api(fetchImpl).saveSurveyUpdateStep({
      childId: CHILD_ID,
      body: { step: 'growing_together', answers: { growthGoals: ['emotion_regulation'] } },
    });
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/children/${CHILD_ID}/survey-update/steps/growing_together`);
    expect(init.method).toBe('PUT');
    expect(init.keepalive).toBeUndefined();
  });

  it('Rev 10.1 — `currentStep` 은 본문 · `pagehide` 저장은 `keepalive: true` (`D6-9` ②)', async () => {
    const { survey } = await mockBodies();
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(survey)));
    await api(fetchImpl).saveSurveyUpdateStep(
      {
        childId: CHILD_ID,
        body: { step: 'reading_together', answers: {}, currentStep: 'books_and_interests' },
      },
      { keepalive: true },
    );
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/children/${CHILD_ID}/survey-update/steps/reading_together`);
    expect(init.keepalive).toBe(true);
    expect(JSON.parse(String(init.body))).toStrictEqual({
      step: 'reading_together',
      answers: {},
      currentStep: 'books_and_interests',
    });
  });

  it('submitSurveyUpdate = POST …/survey-update/submit + Idempotency-Key + ProfileResult parse', async () => {
    const { submitBody, result } = await mockBodies();
    const fetchImpl = vi.fn(() => Promise.resolve(jsonResponse(result)));
    expect(
      await api(fetchImpl).submitSurveyUpdate(
        { childId: CHILD_ID, body: submitBody },
        { idempotencyKey: 'ik-s' },
      ),
    ).toStrictEqual(result);
    const [url, init] = call(fetchImpl);
    expect(url).toBe(`${BASE_URL}/children/${CHILD_ID}/survey-update/submit`);
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Idempotency-Key')).toBe('ik-s');
  });
});
