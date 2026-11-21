import { describe, expect, it } from 'vitest';

import {
  BASELINE_INSTRUMENT_CODE,
  ActivityCardOptionSchema,
  ActivityCardSchema,
  CAPABILITY_SNAPSHOT_SOURCES,
  CapabilitySnapshotPageSchema,
  CapabilitySnapshotSchema,
  CapabilitySnapshotSourceSchema,
  CHILD_NAME_MAX_LENGTH,
  ChildProfileSchema,
  CompleteSurveyUpdateAnswersSchema,
  ERROR_CODES,
  PersonaPageSchema,
  ProfileResultSchema,
  SaveSurveyUpdateStepRequestSchema,
  SubmitSurveyUpdateRequestSchema,
  SurveyUpdateStateSchema,
  SurveyUpdateStepSchema,
  UPDATE_CHILD_FIELDS,
  UpdateChildRequestSchema,
  createUpdateChildRequestSchema,
} from '../index.js';

/**
 * Stage 6 `S6-A` — Personalization · Profile Update contracts (Plan §7 C-1~C-11, AC-6-03~08).
 */

const NOW = new Date(Date.UTC(2026, 0, 15));
const CHILD_ID = '44444444-4444-4444-8444-444444444444';

const scores = [
  { capability: 'emotion_regulation', score: 3.5, itemCount: 2, missingCount: 0 },
  { capability: 'self_directed_agency', score: 4, itemCount: 3, missingCount: 0 },
  { capability: 'cognitive_flexibility', score: 2.5, itemCount: 2, missingCount: 0 },
  { capability: 'intrinsic_motivation', score: 3, itemCount: 3, missingCount: 0 },
];

function snapshot(source: string) {
  return {
    id: '7b6d5c4e-3a21-4b0f-9c8d-2e1f0a3b4c5d',
    source,
    scoringVersion: 'v1',
    createdAt: '2026-01-01T00:00:00.000Z',
    scores,
  };
}

const persona = {
  id: '11111111-2222-4333-8444-555555555555',
  name: 'The Quiet Noticer',
  description: 'Takes their time with a page.',
  isFallback: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const child = {
  id: CHILD_ID,
  firstName: 'Emma',
  birthYearMonth: '2021-04',
  gender: null,
  languageEnvironment: ['english'],
  topicTags: [],
  growthGoals: [],
  ownedBooks: [],
  createdAt: '2026-01-01T00:00:00.000Z',
};

const profile = {
  child,
  latestSnapshot: snapshot('onboarding_survey'),
  strengths: ['self_directed_agency'],
  growingEdges: ['cognitive_flexibility'],
  persona,
  growthCapability: 'cognitive_flexibility',
  profileUpdatedAt: null,
};

describe('CapabilitySnapshotSource (C-2 · `N6-08` · AC-6-03)', () => {
  it('값 스냅샷 = onboarding_survey · survey_update · session_analysis (순서 고정)', () => {
    expect(CapabilitySnapshotSourceSchema.options).toStrictEqual([
      'onboarding_survey',
      'survey_update',
      'session_analysis',
    ]);
    expect(CAPABILITY_SNAPSHOT_SOURCES).toStrictEqual(CapabilitySnapshotSourceSchema.options);
  });

  it('세 값 모두 스냅샷으로 parse 되고, 그 밖의 값은 거부한다', () => {
    for (const source of CAPABILITY_SNAPSHOT_SOURCES) {
      expect(CapabilitySnapshotSchema.safeParse(snapshot(source)).success).toBe(true);
    }
    expect(CapabilitySnapshotSchema.safeParse(snapshot('caregiver_edit')).success).toBe(false);
  });
});

describe('ChildProfile.profileUpdatedAt (C-3 · AC-6-04)', () => {
  it('required + nullable — `null` 과 ISO 시각을 받는다', () => {
    expect(ChildProfileSchema.parse(profile).profileUpdatedAt).toBeNull();
    expect(
      ChildProfileSchema.parse({
        ...profile,
        latestSnapshot: snapshot('session_analysis'),
        profileUpdatedAt: '2026-01-10T07:00:00.000Z',
      }).profileUpdatedAt,
    ).toBe('2026-01-10T07:00:00.000Z');
  });

  it('키가 없는 응답은 거부한다', () => {
    const { profileUpdatedAt: _omitted, ...withoutKey } = profile;
    void _omitted;
    expect(ChildProfileSchema.safeParse(withoutKey).success).toBe(false);
  });

  it('ISO 시각이 아니면 거부한다', () => {
    expect(
      ChildProfileSchema.safeParse({ ...profile, profileUpdatedAt: '2026-01-10' }).success,
    ).toBe(false);
  });
});

describe('UpdateChildRequest (C-4 · `N6-04` · `N6-39` · AC-6-05)', () => {
  const schema = createUpdateChildRequestSchema(NOW);

  it('편집 가능 필드 = Step 1 아이 필드 6개 · `relationship` 없음', () => {
    expect(UPDATE_CHILD_FIELDS).toStrictEqual([
      'firstName',
      'lastName',
      'birthYearMonth',
      'gender',
      'languageEnvironment',
      'readingRoutine',
    ]);
    expect(UPDATE_CHILD_FIELDS).not.toContain('relationship');
    expect(Object.keys(UpdateChildRequestSchema.shape)).toStrictEqual([...UPDATE_CHILD_FIELDS]);
  });

  it('빈 요청을 거부한다 (`{}` · 전부 undefined)', () => {
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ firstName: undefined }).success).toBe(false);
    expect(UpdateChildRequestSchema.safeParse({}).success).toBe(false);
  });

  it('필드 하나만 보내도 된다 — `gender: null` 도 값이다', () => {
    expect(schema.parse({ readingRoutine: 'daily' })).toStrictEqual({ readingRoutine: 'daily' });
    expect(schema.parse({ gender: null })).toStrictEqual({ gender: null });
  });

  it('이름은 trim 되고 1~40자다', () => {
    expect(schema.parse({ firstName: '  Mia  ' })).toStrictEqual({ firstName: 'Mia' });
    expect(schema.safeParse({ firstName: '   ' }).success).toBe(false);
    expect(schema.safeParse({ firstName: 'W'.repeat(CHILD_NAME_MAX_LENGTH) }).success).toBe(true);
    expect(schema.safeParse({ firstName: 'W'.repeat(CHILD_NAME_MAX_LENGTH + 1) }).success).toBe(
      false,
    );
  });

  it('`lastName: ""` = 성 지우기 (trim 후 빈 값 허용, D-1)', () => {
    expect(schema.parse({ lastName: '   ' })).toStrictEqual({ lastName: '' });
  });

  it('생년월은 clock 주입 기준 3.0세 이상 10.0세 미만이다 (D-10)', () => {
    // NOW = 2026-01 → 3세 = 2023-01, 10세 미만 = 2016-02 부터
    expect(schema.safeParse({ birthYearMonth: '2023-01' }).success).toBe(true);
    expect(schema.safeParse({ birthYearMonth: '2023-02' }).success).toBe(false);
    expect(schema.safeParse({ birthYearMonth: '2016-02' }).success).toBe(true);
    expect(schema.safeParse({ birthYearMonth: '2016-01' }).success).toBe(false);
    expect(schema.safeParse({ birthYearMonth: '2021-13' }).success).toBe(false);
    // 형식만 보는 schema 는 범위를 보지 않는다
    expect(UpdateChildRequestSchema.safeParse({ birthYearMonth: '2025-01' }).success).toBe(true);
  });

  it('미허용 필드를 거부한다 — relationship · topicTags · id', () => {
    expect(schema.safeParse({ firstName: 'Mia', relationship: 'mother' }).success).toBe(false);
    expect(schema.safeParse({ firstName: 'Mia', topicTags: ['narrative'] }).success).toBe(false);
    expect(UpdateChildRequestSchema.safeParse({ id: CHILD_ID, firstName: 'Mia' }).success).toBe(
      false,
    );
  });

  it('언어 환경은 빈 배열을 받고 5개를 넘으면 거부한다', () => {
    expect(schema.parse({ languageEnvironment: [] })).toStrictEqual({ languageEnvironment: [] });
    expect(
      schema.safeParse({
        languageEnvironment: ['english', 'spanish', 'korean', 'chinese', 'tagalog', 'french'],
      }).success,
    ).toBe(false);
  });
});

describe('Survey update (C-6 · C-7 · `N6-05` · AC-6-06)', () => {
  it('단계 = 온보딩 Step 2~5 (child_info 없음)', () => {
    expect(SurveyUpdateStepSchema.options).toStrictEqual([
      'reading_together',
      'books_and_interests',
      'growing_together',
      'capability_items',
    ]);
  });

  it('단계 저장 요청 — child_info 단계는 거부한다', () => {
    expect(
      SaveSurveyUpdateStepRequestSchema.safeParse({
        step: 'reading_together',
        answers: { storyComfort: 'wild_ride' },
      }).success,
    ).toBe(true);
    expect(
      SaveSurveyUpdateStepRequestSchema.safeParse({
        step: 'child_info',
        answers: { firstName: 'Mia' },
      }).success,
    ).toBe(false);
  });

  it('Rev 10.1 — 단계 저장 요청 `currentStep` 은 선택 · 재응답 단계만 (`D6-9` ②)', () => {
    const base = { step: 'reading_together', answers: { storyComfort: 'wild_ride' } } as const;
    // 생략 = 이탈 저장 (서버는 `step` 을 보던 단계로 기록)
    const omitted = SaveSurveyUpdateStepRequestSchema.parse(base);
    expect('currentStep' in omitted).toBe(false);
    // 단계 이동 = 도착 단계 (앞·뒤 모두, 4변형 공통)
    for (const step of SurveyUpdateStepSchema.options) {
      expect(
        SaveSurveyUpdateStepRequestSchema.safeParse({ ...base, currentStep: step }).success,
      ).toBe(true);
    }
    expect(
      SaveSurveyUpdateStepRequestSchema.parse({
        step: 'capability_items',
        answers: { instrumentCode: BASELINE_INSTRUMENT_CODE, answers: [] },
        currentStep: 'growing_together',
      }).currentStep,
    ).toBe('growing_together');
    // `child_info` · 모르는 값 = 거부 (기존 `VALIDATION_FAILED`)
    expect(
      SaveSurveyUpdateStepRequestSchema.safeParse({ ...base, currentStep: 'child_info' }).success,
    ).toBe(false);
    expect(
      SaveSurveyUpdateStepRequestSchema.safeParse({ ...base, currentStep: 'done' }).success,
    ).toBe(false);
  });

  it('state — steps 는 정확히 4개 · draft 에 child_info 가 오면 버린다', () => {
    const steps = SurveyUpdateStepSchema.options.map((step) => ({ step, completed: false }));
    const base = {
      instrument: { not: 'checked here' },
      steps,
      draftAnswers: { reading_together: { storyComfort: 'quiet_gentle' } },
      currentStep: 'reading_together',
    };
    const shape = SurveyUpdateStateSchema.shape;
    expect(shape.steps.safeParse(steps).success).toBe(true);
    expect(shape.steps.safeParse(steps.slice(0, 3)).success).toBe(false);
    expect(shape.currentStep.safeParse('child_info').success).toBe(false);
    expect(
      shape.draftAnswers.parse({ ...base.draftAnswers, child_info: { firstName: 'Mia' } }),
    ).toStrictEqual(base.draftAnswers);
  });

  it('제출 요청 — 4단계 전부 + 역량 10문항, child_info 는 요구하지 않는다', () => {
    const answers = {
      reading_together: { storyComfort: 'quiet_gentle', readAloudBehavior: 'sits_and_listens' },
      books_and_interests: { favoriteBooks: [], ownedBooks: [], topicTags: [] },
      growing_together: { growthGoals: [] },
      capability_items: {
        instrumentCode: 'baseline_v1',
        answers: ['ER1', 'ER2', 'AG1', 'AG2', 'AG3', 'CF1', 'CF2', 'IM1', 'IM2', 'IM3'].map(
          (itemCode) => ({ itemCode, value: 3 }),
        ),
      },
    };
    const instrument = { code: 'onboarding_v1_1', version: '2.0.0' };
    expect(SubmitSurveyUpdateRequestSchema.safeParse({ instrument, answers }).success).toBe(true);
    expect(Object.keys(CompleteSurveyUpdateAnswersSchema.shape)).not.toContain('child_info');

    const { growing_together: _missing, ...incomplete } = answers;
    void _missing;
    expect(
      SubmitSurveyUpdateRequestSchema.safeParse({ instrument, answers: incomplete }).success,
    ).toBe(false);
  });

  it('제출 응답 = ProfileResult · snapshot.source = survey_update', () => {
    const result = ProfileResultSchema.parse({
      child,
      snapshot: snapshot('survey_update'),
      persona,
      suggestedCapability: 'cognitive_flexibility',
    });
    expect(result.snapshot.source).toBe('survey_update');
  });
});

describe('히스토리 목록 schema (C-8 · `N6-12` · AC-6-07)', () => {
  it('CapabilitySnapshotPage · PersonaPage 가 cursor page 로 parse 된다', () => {
    expect(
      CapabilitySnapshotPageSchema.parse({
        items: [snapshot('session_analysis'), snapshot('onboarding_survey')],
        nextCursor: 'c2',
      }).items,
    ).toHaveLength(2);
    expect(PersonaPageSchema.parse({ items: [persona], nextCursor: null }).nextCursor).toBeNull();
    expect(PersonaPageSchema.safeParse({ items: [persona] }).success).toBe(false);
  });
});

describe('변경 0 확인 (C-9 · C-10 · `N6-09` · AC-6-08)', () => {
  it('ActivityCard 에 recommendationPhase · reasonKey 가 없다', () => {
    expect(Object.keys(ActivityCardSchema.shape)).not.toContain('recommendationPhase');
    expect(Object.keys(ActivityCardOptionSchema.shape)).not.toContain('reasonKey');
  });

  it('error code 는 29종 그대로다 (신규 0)', () => {
    // Stage 8 `C8-5` 가 `ACCOUNT_DELETION_PENDING` 1종을 더했다 — 이 Stage 의 불변식(신규 0)은 그 1종을 뺀 29종으로 본다.
    expect(ERROR_CODES.filter((code) => code !== 'ACCOUNT_DELETION_PENDING')).toHaveLength(29);
  });
});
