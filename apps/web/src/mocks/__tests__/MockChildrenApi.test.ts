/**
 * `MockChildrenApi` — Stage 6 `S6-A` (Plan §8 그룹 `children` · AC-6-10 · AC-6-11 · AC-6-07, Spec §7).
 */
import {
  CapabilitySnapshotPageSchema,
  ChildProfileSchema,
  HaruApiError,
  MeResponseSchema,
  PersonaPageSchema,
  ProfileResultSchema,
  SurveyUpdateStateSchema,
  type SubmitSurveyUpdateRequest,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { isNetworkError } from '../../shared/api/helpers';
import { createFixedClock } from '../../shared/lib/clock';
import { CHILDREN_SCENARIO_KEYS, childrenScenarioGroup } from '../children/childProfileRecords';
import {
  createCapabilitySnapshotPageFixture,
  createDefaultSurveyAnswers,
  createPersonaPageFixture,
  MOCK_CHANGED_PERSONA_COPY,
  MOCK_LONG_CHILD_FIRST_NAME,
  MOCK_SURVEY_UPDATE_DRAFT_STEP,
} from '../fixtures/child-profile';
import { MOCK_REQUIRED_CONSENT_TYPES } from '../fixtures/consent';
import { MOCK_CHILD_FIRST_NAME, MOCK_CHILD_ID } from '../fixtures/me';
import { createOnboardingInstrumentFixture } from '../fixtures/onboarding';
import { MOCK_FALLBACK_PERSONA_COPY, MOCK_PERSONA_COPY } from '../fixtures/profile-result';
import { MOCK_EPOCH_MS } from '../index';

import { bundle, ik } from './stage4-support';

const CHILD = { childId: MOCK_CHILD_ID };
const instrument = createOnboardingInstrumentFixture();
const INSTRUMENT_REF = { code: instrument.code, version: instrument.version };

async function codeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HaruApiError) return error.code;
    if (isNetworkError(error)) return 'NETWORK';
    throw error;
  }
  return 'OK';
}

async function errorOf(promise: Promise<unknown>): Promise<HaruApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HaruApiError) return error;
    throw error;
  }
  throw new Error('expected a HaruApiError');
}

function submitBody(
  overrides: Partial<SubmitSurveyUpdateRequest['answers']> = {},
): SubmitSurveyUpdateRequest {
  return {
    instrument: INSTRUMENT_REF,
    answers: {
      ...createDefaultSurveyAnswers(instrument),
      growing_together: { growthGoals: ['cognitive_flexibility'] },
      ...overrides,
    },
  };
}

const scoreOf = (
  profile: { latestSnapshot: { scores: { capability: string; score: number | null }[] } },
  capability: string,
) => profile.latestSnapshot.scores.find((entry) => entry.capability === capability)?.score;

describe('MockChildrenApi — Catalogue key (§5.4 · Plan §8)', () => {
  it('group `children` 는 Plan §8 key 만 쓴다 (공통 6 + 특화 8)', () => {
    expect(childrenScenarioGroup.group).toBe('children');
    expect(CHILDREN_SCENARIO_KEYS).toStrictEqual([
      'success',
      'loading',
      'empty',
      'error',
      'retry',
      'offline',
      'profile-updated',
      'persona-changed',
      'persona-fallback',
      'all-scores-missing',
      'scores-partially-missing',
      'validation-failed',
      'survey-update-draft',
      'survey-update-submitted',
    ]);
  });

  it('모든 key 에서 getProfile · getSurveyUpdate 응답이 contracts parse 를 통과한다 (AC-6-10)', async () => {
    for (const key of CHILDREN_SCENARIO_KEYS) {
      const b = bundle(`children:${key}`);
      const profile = b.clients.children.getProfile(CHILD);
      const survey = b.clients.children.getSurveyUpdate(CHILD);
      if (key === 'error' || key === 'offline') {
        const expected = key === 'error' ? 'INTERNAL_ERROR' : 'NETWORK';
        expect(await codeOf(profile)).toBe(expected);
        expect(await codeOf(survey)).toBe(expected);
        continue;
      }
      if (key === 'retry') {
        expect(await codeOf(profile)).toBe('INTERNAL_ERROR');
        expect(await codeOf(survey)).toBe('INTERNAL_ERROR');
        expect(
          ChildProfileSchema.safeParse(await b.clients.children.getProfile(CHILD)).success,
        ).toBe(true);
        continue;
      }
      expect(ChildProfileSchema.safeParse(await profile).success).toBe(true);
      expect(SurveyUpdateStateSchema.safeParse(await survey).success).toBe(true);
    }
  });
});

describe('MockChildrenApi — 기본 상태 (`success` · `empty`)', () => {
  it('Emma · 온보딩 스냅샷 1개 · profileUpdatedAt null · 강점/edge 는 contracts 규칙으로 서버가 고른다', async () => {
    for (const key of ['success', 'empty']) {
      const profile = await bundle(`children:${key}`).clients.children.getProfile(CHILD);
      expect(profile.child.firstName).toBe(MOCK_CHILD_FIRST_NAME);
      expect(profile.latestSnapshot.source).toBe('onboarding_survey');
      expect(profile.profileUpdatedAt).toBeNull();
      expect(profile.persona.name).toBe(MOCK_PERSONA_COPY.name);
      expect(profile.strengths).toStrictEqual(['self_directed_agency', 'intrinsic_motivation']);
      expect(profile.growingEdges).toStrictEqual(['cognitive_flexibility', 'emotion_regulation']);
      expect(profile.growthCapability).toBe('cognitive_flexibility');
    }
  });

  it('다른 아이 id → CHILD_NOT_FOUND', async () => {
    const b = bundle();
    expect(
      await codeOf(
        b.clients.children.getProfile({ childId: '44444444-4444-4444-8444-000000000000' }),
      ),
    ).toBe('CHILD_NOT_FOUND');
  });

  it('같은 scenario 를 두 번 만들면 응답 바이트가 같다 (결정성)', async () => {
    const first = await bundle('children:persona-changed').clients.children.getProfile(CHILD);
    const second = await bundle('children:persona-changed').clients.children.getProfile(CHILD);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe('MockChildrenApi — FR-15 · D-2 seed key', () => {
  it('`profile-updated` — session_analysis 스냅샷 · 4축 점수 변화 · profileUpdatedAt = 1일 전', async () => {
    const base = await bundle().clients.children.getProfile(CHILD);
    const updated = await bundle('children:profile-updated').clients.children.getProfile(CHILD);

    expect(updated.latestSnapshot.source).toBe('session_analysis');
    expect(updated.profileUpdatedAt).toBe(new Date(MOCK_EPOCH_MS - 86_400_000).toISOString());
    for (const capability of [
      'emotion_regulation',
      'self_directed_agency',
      'cognitive_flexibility',
      'intrinsic_motivation',
    ]) {
      expect(scoreOf(updated, capability)).not.toBe(scoreOf(base, capability));
    }
    expect(updated.persona).toStrictEqual(base.persona);
  });

  it('`persona-changed` — 새 페르소나 name·description (응답 값 그대로) + 갱신 표시', async () => {
    const profile = await bundle('children:persona-changed').clients.children.getProfile(CHILD);
    expect(profile.persona.name).toBe(MOCK_CHANGED_PERSONA_COPY.name);
    expect(profile.persona.description).toBe(MOCK_CHANGED_PERSONA_COPY.description);
    expect(profile.persona.isFallback).toBe(false);
    expect(profile.profileUpdatedAt).not.toBeNull();
  });

  it('`persona-fallback` — isFallback true · Stage 2 fallback 문구 재사용 (R-9)', async () => {
    const profile = await bundle('children:persona-fallback').clients.children.getProfile(CHILD);
    expect(profile.persona.isFallback).toBe(true);
    expect(profile.persona.name).toBe(MOCK_FALLBACK_PERSONA_COPY.name);
  });

  it('`all-scores-missing` — 4축 null · 강점/edge 빈 배열 · growthCapability null (D-2 변형 C)', async () => {
    const profile = await bundle('children:all-scores-missing').clients.children.getProfile(CHILD);
    expect(
      profile.latestSnapshot.scores.every((entry) => entry.score === null && entry.itemCount === 0),
    ).toBe(true);
    expect(profile.strengths).toStrictEqual([]);
    expect(profile.growingEdges).toStrictEqual([]);
    expect(profile.growthCapability).toBeNull();
  });

  it('`scores-partially-missing` — 1~3축 null 이 값 있는 축과 섞인다 (D-2 변형 B)', async () => {
    const profile = await bundle('children:scores-partially-missing').clients.children.getProfile(
      CHILD,
    );
    const nulls = profile.latestSnapshot.scores.filter((entry) => entry.score === null);
    expect(nulls.map((entry) => entry.capability)).toStrictEqual(['cognitive_flexibility']);
    expect(profile.strengths).toHaveLength(1);
    expect(profile.growingEdges).toHaveLength(1);
    expect(profile.growthCapability).not.toBe('cognitive_flexibility');
  });

  it('페르소나 description 은 110~220자 fixture 가 있다 (말줄임 검증용 — Spec §15)', async () => {
    const lengths = [MOCK_PERSONA_COPY.description, MOCK_CHANGED_PERSONA_COPY.description].map(
      (text) => text.length,
    );
    for (const length of lengths) {
      expect(length).toBeGreaterThanOrEqual(110);
      expect(length).toBeLessThanOrEqual(220);
    }
    expect(MOCK_CHANGED_PERSONA_COPY.name.length).toBeLessThanOrEqual(24);
  });

  it('Stage 6 페르소나 문구에 진단·판정·비교 금칙어 0 (AC-6-42 · §8.4)', () => {
    const forbidden = [
      'diagnos',
      'delay',
      'behind',
      'normal',
      'score',
      'worse',
      'better than',
      'peers',
      'weak',
      'lowest',
      'below',
    ];
    const text =
      `${MOCK_CHANGED_PERSONA_COPY.name} ${MOCK_CHANGED_PERSONA_COPY.description}`.toLowerCase();
    for (const word of forbidden) expect(text).not.toContain(word);
  });
});

describe('MockChildrenApi — 상태 저장형 (AC-6-11)', () => {
  it('update → getProfile · GET /v1/me 가 새 이름을 쓴다 (AC-6-22 Mock 부분)', async () => {
    const b = bundle();
    const updated = await b.clients.children.update({ ...CHILD, body: { firstName: '  Mia ' } });
    expect(updated.child.firstName).toBe('Mia');
    expect((await b.clients.children.getProfile(CHILD)).child.firstName).toBe('Mia');

    const me = MeResponseSchema.parse(await b.clients.me.get());
    expect(me.child?.firstName).toBe('Mia');
  });

  it('보낸 필드만 바뀐다 · `lastName: ""` 은 성을 지운다 · 요청 로그 = 보낸 body 그대로 (AC-6-19 증거)', async () => {
    const b = bundle();
    await b.clients.children.update({ ...CHILD, body: { lastName: 'Rivera' } });
    const before = await b.clients.children.getProfile(CHILD);
    expect(before.child.lastName).toBe('Rivera');

    const after = await b.clients.children.update({
      ...CHILD,
      body: { lastName: '', readingRoutine: 'daily' },
    });
    expect(after.child.lastName).toBeUndefined();
    expect(after.child.readingRoutine).toBe('daily');
    expect(after.child.birthYearMonth).toBe(before.child.birthYearMonth);

    const entries = b.requestLog
      .entries()
      .filter((entry) => entry.operation === 'PATCH /v1/children/:childId');
    expect(entries.map((entry) => entry.payload)).toStrictEqual([
      { lastName: 'Rivera' },
      { lastName: '', readingRoutine: 'daily' },
    ]);
  });

  it('40자 이름도 저장된다 (줄바꿈 검증 fixture)', async () => {
    expect(MOCK_LONG_CHILD_FIRST_NAME).toHaveLength(40);
    const b = bundle();
    const profile = await b.clients.children.update({
      ...CHILD,
      body: { firstName: MOCK_LONG_CHILD_FIRST_NAME },
    });
    expect(profile.child.firstName).toBe(MOCK_LONG_CHILD_FIRST_NAME);
  });

  it('서버 시계 기준 나이 범위 밖 → VALIDATION_FAILED + details.fields (값은 담지 않는다)', async () => {
    const b = bundle();
    const error = await errorOf(
      b.clients.children.update({
        ...CHILD,
        body: { birthYearMonth: '2024-06', firstName: 'Mia' },
      }),
    );
    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.details).toStrictEqual({ fields: ['birthYearMonth'] });
    expect((await b.clients.children.getProfile(CHILD)).child.firstName).toBe(
      MOCK_CHILD_FIRST_NAME,
    );
  });

  it('`validation-failed` — update 만 실패하고 fields = 보낸 필드, 조회는 정상', async () => {
    const b = bundle('children:validation-failed');
    const error = await errorOf(
      b.clients.children.update({ ...CHILD, body: { firstName: 'Mia', gender: null } }),
    );
    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.details).toStrictEqual({ fields: ['firstName', 'gender'] });
    expect(await codeOf(b.clients.children.getProfile(CHILD))).toBe('OK');
  });

  it('빈 요청 · 미허용 필드(relationship) → 보내기 전 경계에서 VALIDATION_FAILED', async () => {
    const b = bundle();
    expect(await codeOf(b.clients.children.update({ ...CHILD, body: {} }))).toBe(
      'VALIDATION_FAILED',
    );
    expect(
      await codeOf(
        b.clients.children.update({
          ...CHILD,
          body: { firstName: 'Mia', relationship: 'mother' } as never,
        }),
      ),
    ).toBe('VALIDATION_FAILED');
  });

  it('발전 역량 저장 → growthCapability 반영 · `all-scores-missing` 에서도 null 축을 고를 수 있다 (`N6-11` ⓐ)', async () => {
    const b = bundle('children:all-scores-missing');
    const saved = await b.clients.children.setGrowthCapability({
      ...CHILD,
      body: { capability: 'intrinsic_motivation' },
    });
    expect(saved.growthCapability).toBe('intrinsic_motivation');
    expect((await b.clients.children.getProfile(CHILD)).growthCapability).toBe(
      'intrinsic_motivation',
    );
    const record = b.childProfileState.current();
    expect(record?.growthSelections.at(-1)).toMatchObject({
      capability: 'intrinsic_motivation',
      actor: 'caregiver_changed',
    });
  });

  it('발전 역량 저장 실패(`error`) → 상태 불변', async () => {
    const b = bundle('children.setgrowthcapability:error');
    expect(
      await codeOf(
        b.clients.children.setGrowthCapability({
          ...CHILD,
          body: { capability: 'intrinsic_motivation' },
        }),
      ),
    ).toBe('INTERNAL_ERROR');
    expect((await b.clients.children.getProfile(CHILD)).growthCapability).toBe(
      'cognitive_flexibility',
    );
  });
});

describe('MockChildrenApi — 설문 재응답 (AC-6-06 · 11 · 26)', () => {
  it('진입: draft 가 없으면 최근 제출 응답으로 프리필 · 진행 중 단계 0 · 첫 단계', async () => {
    const state = await bundle().clients.children.getSurveyUpdate(CHILD);
    expect(state.steps.map((step) => step.completed)).toStrictEqual([false, false, false, false]);
    expect(state.currentStep).toBe('reading_together');
    expect(state.draftAnswers).toStrictEqual(createDefaultSurveyAnswers(instrument));
    expect(state.instrument.code).toBe(instrument.code);
  });

  it('단계 저장 → 서버 draft · 다시 들어오면 그 단계부터 · 바꾼 답 보존', async () => {
    const b = bundle();
    await b.clients.children.saveSurveyUpdateStep({
      ...CHILD,
      body: {
        step: 'reading_together',
        answers: { storyComfort: 'quiet_gentle', readAloudBehavior: 'acts_it_out' },
      },
    });
    const state = await b.clients.children.getSurveyUpdate(CHILD);
    expect(state.currentStep).toBe('reading_together');
    expect(state.steps.find((step) => step.step === 'reading_together')?.completed).toBe(true);
    expect(state.draftAnswers.reading_together).toStrictEqual({
      storyComfort: 'quiet_gentle',
      readAloudBehavior: 'acts_it_out',
    });
    // 나머지 단계는 프리필 그대로
    expect(state.draftAnswers.capability_items).toStrictEqual(
      createDefaultSurveyAnswers(instrument).capability_items,
    );
  });

  it('Rev 10.1 — `currentStep` = 보던 단계: 이동 PUT 은 도착 단계 · 이탈 PUT(생략) 은 저장한 단계 (`D6-9` ②)', async () => {
    const b = bundle();
    // 단계 이동: reading_together 를 저장하고 books_and_interests 로 간다
    const moved = await b.clients.children.saveSurveyUpdateStep({
      ...CHILD,
      body: {
        step: 'reading_together',
        answers: { storyComfort: 'quiet_gentle' },
        currentStep: 'books_and_interests',
      },
    });
    expect(moved.currentStep).toBe('books_and_interests');
    expect((await b.clients.children.getSurveyUpdate(CHILD)).currentStep).toBe(
      'books_and_interests',
    );
    // 뒤로 이동도 도착 단계를 싣는다
    const back = await b.clients.children.saveSurveyUpdateStep({
      ...CHILD,
      body: { step: 'growing_together', answers: {}, currentStep: 'books_and_interests' },
    });
    expect(back.currentStep).toBe('books_and_interests');
    // 이탈 저장(생략) — 보던 단계 = 저장한 단계
    const left = await b.clients.children.saveSurveyUpdateStep({
      ...CHILD,
      body: { step: 'books_and_interests', answers: {} },
    });
    expect(left.currentStep).toBe('books_and_interests');
    expect(left.steps.filter((step) => step.completed).map((step) => step.step)).toStrictEqual([
      'reading_together',
      'books_and_interests',
      'growing_together',
    ]);
  });

  it('Rev 10.1 — 첫 저장이 이동이어도 draft 의 `currentStep` 은 도착 단계', async () => {
    const b = bundle();
    const state = await b.clients.children.saveSurveyUpdateStep({
      ...CHILD,
      body: { step: 'reading_together', answers: {}, currentStep: 'books_and_interests' },
    });
    expect(state.currentStep).toBe('books_and_interests');
  });

  it('Rev 10.1 — `currentStep: child_info` 는 경계에서 거부 (`VALIDATION_FAILED`)', async () => {
    expect(
      await codeOf(
        bundle().clients.children.saveSurveyUpdateStep({
          ...CHILD,
          body: { step: 'reading_together', answers: {}, currentStep: 'child_info' } as never,
        }),
      ),
    ).toBe('VALIDATION_FAILED');
  });

  it('`child_info` 단계 저장은 경계에서 거부 (C-7)', async () => {
    const b = bundle();
    expect(
      await codeOf(
        b.clients.children.saveSurveyUpdateStep({
          ...CHILD,
          body: { step: 'child_info', answers: { firstName: 'Mia' } } as never,
        }),
      ),
    ).toBe('VALIDATION_FAILED');
  });

  it('`survey-update-draft` — 이탈한 draft: books_and_interests 에서 복귀 · reading_together 바뀐 답', async () => {
    const state = await bundle('children:survey-update-draft').clients.children.getSurveyUpdate(
      CHILD,
    );
    expect(state.currentStep).toBe(MOCK_SURVEY_UPDATE_DRAFT_STEP);
    expect(state.steps.filter((step) => step.completed).map((step) => step.step)).toStrictEqual([
      'reading_together',
    ]);
    expect(state.draftAnswers.reading_together).toStrictEqual({
      storyComfort: 'wild_ride',
      readAloudBehavior: 'acts_it_out',
    });
  });

  it('제출 → ProfileResult(source survey_update) · 새 스냅샷 행 · 응답 버전 행 v2 · v1 불변 · draft 비움', async () => {
    const b = bundle('children:survey-update-draft');
    await b.clients.children.getSurveyUpdate(CHILD);
    const before = b.childProfileState.current();
    const v1 = before?.responses[0];
    const v1Json = JSON.stringify(v1);

    const result = await b.clients.children.submitSurveyUpdate(
      { ...CHILD, body: submitBody() },
      ik('s1'),
    );
    expect(ProfileResultSchema.safeParse(result).success).toBe(true);
    expect(result.snapshot.source).toBe('survey_update');

    const record = b.childProfileState.current();
    expect(record?.responses.map((row) => [row.version, row.origin])).toStrictEqual([
      [1, 'onboarding'],
      [2, 'survey_update'],
    ]);
    expect(JSON.stringify(record?.responses[0])).toBe(v1Json);
    expect(Object.isFrozen(record?.responses[0])).toBe(true);
    expect(record?.snapshots.map((row) => row.source)).toStrictEqual([
      'onboarding_survey',
      'survey_update',
    ]);
    expect(record?.draft).toBeNull();

    const profile = await b.clients.children.getProfile(CHILD);
    expect(profile.latestSnapshot.source).toBe('survey_update');
    expect(profile.profileUpdatedAt).toBe(new Date(MOCK_EPOCH_MS).toISOString());
    expect(profile.child.growthGoals).toStrictEqual(['cognitive_flexibility']);

    const fresh = await b.clients.children.getSurveyUpdate(CHILD);
    expect(fresh.steps.some((step) => step.completed)).toBe(false);
    expect(fresh.draftAnswers.growing_together).toStrictEqual({
      growthGoals: ['cognitive_flexibility'],
    });
  });

  it('`survey-update-submitted` — 이미 재응답한 상태: survey_update 스냅샷 · 갱신 표시', async () => {
    const profile = await bundle('children:survey-update-submitted').clients.children.getProfile(
      CHILD,
    );
    expect(profile.latestSnapshot.source).toBe('survey_update');
    expect(profile.profileUpdatedAt).not.toBeNull();
    expect(profile.child.topicTags).toStrictEqual(['narrative', 'artistic']);
  });

  it('Idempotency-Key — 같은 key + 같은 body = 최초 응답 · 다른 body = IDEMPOTENCY_KEY_REUSED', async () => {
    const b = bundle();
    const first = await b.clients.children.submitSurveyUpdate(
      { ...CHILD, body: submitBody() },
      ik('k'),
    );
    const replay = await b.clients.children.submitSurveyUpdate(
      { ...CHILD, body: submitBody() },
      ik('k'),
    );
    expect(replay).toStrictEqual(first);
    expect(b.childProfileState.current()?.responses).toHaveLength(2);

    expect(
      await codeOf(
        b.clients.children.submitSurveyUpdate(
          {
            ...CHILD,
            body: submitBody({ growing_together: { growthGoals: ['intrinsic_motivation'] } }),
          },
          ik('k'),
        ),
      ),
    ).toBe('IDEMPOTENCY_KEY_REUSED');
  });

  it('`retry` — 1회차 실패는 보관하지 않는다 → 같은 key 재시도가 성공한다 (AC-6-28 Mock 부분)', async () => {
    const b = bundle('children:retry');
    expect(
      await codeOf(
        b.clients.children.submitSurveyUpdate({ ...CHILD, body: submitBody() }, ik('r')),
      ),
    ).toBe('INTERNAL_ERROR');
    const result = await b.clients.children.submitSurveyUpdate(
      { ...CHILD, body: submitBody() },
      ik('r'),
    );
    expect(result.snapshot.source).toBe('survey_update');
  });

  it('필수 문항 빈칸 → ONBOARDING_INCOMPLETE · 다른 instrument → VALIDATION_FAILED', async () => {
    const b = bundle();
    expect(
      await codeOf(
        b.clients.children.submitSurveyUpdate(
          { ...CHILD, body: submitBody({ growing_together: { growthGoals: [] } }) },
          ik('i1'),
        ),
      ),
    ).toBe('ONBOARDING_INCOMPLETE');
    expect(
      await codeOf(
        b.clients.children.submitSurveyUpdate(
          {
            ...CHILD,
            body: { ...submitBody(), instrument: { code: instrument.code, version: '9.9.9' } },
          },
          ik('i2'),
        ),
      ),
    ).toBe('VALIDATION_FAILED');
  });

  it('`error` + code 지정 — CONSENT_REQUIRED 재현 (새 key 아님, §5.4)', async () => {
    const b = bundle('children:error', {
      errorCodes: { 'children.getsurveyupdate': 'CONSENT_REQUIRED' },
    });
    expect(await codeOf(b.clients.children.getSurveyUpdate(CHILD))).toBe('CONSENT_REQUIRED');
    expect(await codeOf(b.clients.children.getProfile(CHILD))).toBe('INTERNAL_ERROR');
  });
});

describe('MockChildrenApi — 온보딩 제출과 같은 서버 상태 (`D6-5` · R-9)', () => {
  it('온보딩 제출 결과가 GET /profile 로 그대로 보인다 (이름 · 스냅샷 · 페르소나 · 제안 역량)', async () => {
    const b = bundle('onboarding:persona-fallback');
    b.consentState.grant(MOCK_REQUIRED_CONSENT_TYPES);
    const result = await b.clients.onboarding.submit(
      {
        instrument: INSTRUMENT_REF,
        answers: {
          child_info: {
            firstName: 'Yuna',
            birthYearMonth: '2021-04',
            gender: null,
            languageEnvironment: ['english'],
          },
          ...createDefaultSurveyAnswers(instrument),
        },
      },
      ik('onb'),
    );

    const profile = await b.clients.children.getProfile(CHILD);
    expect(profile.child.id).toBe(MOCK_CHILD_ID);
    expect(profile.child.firstName).toBe('Yuna');
    expect(profile.latestSnapshot).toStrictEqual(result.snapshot);
    expect(profile.persona).toStrictEqual(result.persona);
    expect(profile.persona.isFallback).toBe(true);
    expect(profile.growthCapability).toBe(result.suggestedCapability);
    expect(profile.profileUpdatedAt).toBeNull();
    expect((await b.clients.me.get()).child?.firstName).toBe('Yuna');
  });
});

describe('히스토리 목록 fixture (C-8 · AC-6-07)', () => {
  it('CapabilitySnapshotPage · PersonaPage fixture 가 parse 된다 — API 메서드는 없다', () => {
    const clock = createFixedClock(MOCK_EPOCH_MS);
    expect(
      CapabilitySnapshotPageSchema.safeParse(createCapabilitySnapshotPageFixture(instrument, clock))
        .success,
    ).toBe(true);
    expect(PersonaPageSchema.safeParse(createPersonaPageFixture(clock)).success).toBe(true);
    expect(Object.keys(bundle().clients.children).sort()).toStrictEqual([
      'getProfile',
      'getSurveyUpdate',
      'saveSurveyUpdateStep',
      'setGrowthCapability',
      'submitSurveyUpdate',
      'update',
    ]);
  });
});
