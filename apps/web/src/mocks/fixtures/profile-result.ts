/**
 * `POST /v1/onboarding/submit` 응답 fixture — `ProfileResult`.
 *
 * **Stage 2 에는 이 값을 표시하는 화면이 없다** (프로필 결과 · 페르소나 · 다이아몬드는
 * Stage 2-B). Stage 2 는 응답이 contracts schema 를 통과하는지까지만 검증한다.
 *
 * - 점수는 **contracts 의 산식**(`scoreCapabilities`)으로 계산한다 — Mock 이 별도 산식을
 *   갖지 않아야 향후 Backend 와 결과가 갈라지지 않는다 (C-8 · D-2).
 * - 한 역량의 문항이 전부 `not_observed` 면 `score: null` 이다. 0 이나 최저값으로 내리지 않는다.
 * - 페르소나 문구는 **가상**이며 AI 생성이 아니다. `persona-fallback` scenario 는
 *   `isFallback: true` 로 내려온다 (`PROVIDER_UNAVAILABLE` 이어도 200 — API_CONTRACTS §4).
 */
import {
  CAPABILITY_SCORING_VERSION,
  ProfileResultSchema,
  scoreCapabilities,
  suggestGrowthCapability,
  type ChildInfoAnswers,
  type CompleteOnboardingAnswers,
  type OnboardingInstrument,
  type ProfileResult,
} from '@haru/contracts';

import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';

/**
 * 가상 페르소나 — 실제 AI 생성 결과가 아니다.
 * Stage 6 `children` 그룹이 **같은 문구**를 재사용한다 (Plan R-9 — 이중 정의 금지, `fixtures/child-profile.ts`).
 */
export const MOCK_PERSONA_COPY = {
  name: 'The Quiet Noticer',
  description:
    'Right now they take their time with a page and come back to it later. That is a good starting point to build on together.',
};

/** AI 생성 실패 대체 문구 (`persona-fallback`). `children` 그룹도 같은 값을 쓴다 (R-9). */
export const MOCK_FALLBACK_PERSONA_COPY = {
  name: 'A story in progress',
  description:
    'We are still getting to know your reader. Their profile will fill in as you read together.',
};

export interface ProfileResultFixtureOptions {
  instrument: OnboardingInstrument;
  answers: CompleteOnboardingAnswers;
  clock: Clock;
  idFactory: IdFactory;
  /** AI 생성 실패 대체 문구를 쓸지 (`persona-fallback`). */
  fallbackPersona?: boolean;
}

function childFrom(info: ChildInfoAnswers, id: string, createdAt: string) {
  return {
    id,
    firstName: info.firstName,
    ...(info.lastName === undefined ? {} : { lastName: info.lastName }),
    birthYearMonth: info.birthYearMonth,
    gender: info.gender,
    languageEnvironment: info.languageEnvironment,
    ...(info.readingRoutine === undefined ? {} : { readingRoutine: info.readingRoutine }),
    topicTags: [],
    growthGoals: [],
    ownedBooks: [],
    createdAt,
  };
}

export function createProfileResultFixture(options: ProfileResultFixtureOptions): ProfileResult {
  const { instrument, answers, clock, idFactory } = options;
  const createdAt = clock.nowIso();

  const scores = scoreCapabilities(instrument.survey.items, answers.capability_items.answers);

  const child = {
    ...childFrom(answers.child_info, idFactory.next(), createdAt),
    topicTags: answers.books_and_interests.topicTags,
    growthGoals: answers.growing_together.growthGoals,
    ownedBooks: answers.books_and_interests.ownedBooks,
  };

  const persona = options.fallbackPersona === true ? MOCK_FALLBACK_PERSONA_COPY : MOCK_PERSONA_COPY;

  return ProfileResultSchema.parse({
    child,
    snapshot: {
      id: idFactory.next(),
      source: 'onboarding_survey',
      scoringVersion: CAPABILITY_SCORING_VERSION,
      createdAt,
      scores,
    },
    persona: {
      id: idFactory.next(),
      name: persona.name,
      description: persona.description,
      isFallback: options.fallbackPersona === true,
      createdAt,
    },
    suggestedCapability: suggestGrowthCapability(scores),
  });
}
