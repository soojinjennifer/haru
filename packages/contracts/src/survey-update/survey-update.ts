import { z } from 'zod';

import { OnboardingStepSchema } from '../enums/onboarding-step.js';
import {
  CompleteOnboardingAnswersSchema,
  OnboardingDraftAnswersSchema,
} from '../onboarding/answers.js';
import { BooksAndInterestsAnswersSchema } from '../onboarding/books-and-interests.js';
import { GrowingTogetherAnswersSchema } from '../onboarding/growing-together.js';
import { InstrumentRefSchema, OnboardingInstrumentSchema } from '../onboarding/instrument.js';
import { ReadingTogetherAnswersSchema } from '../onboarding/reading-together.js';
import { CapabilityItemsAnswersSchema } from '../onboarding/survey.js';

/**
 * **설문 재응답** (survey update) — PRD §7.8 · Stage 6 Plan §7 C-6 · C-7 (`N6-05` ⓐ → `D6-3`).
 *
 * | Method | Path | Request | Response | 오류 |
 * |---|---|---|---|---|
 * | GET | `/v1/children/:childId/survey-update` | — | `SurveyUpdateState` | `CONSENT_REQUIRED` · `CHILD_NOT_FOUND` |
 * | PUT | `/v1/children/:childId/survey-update/steps/:step` | `SaveSurveyUpdateStepRequest` | `SurveyUpdateState` | `VALIDATION_FAILED` · `CONSENT_REQUIRED` |
 * | POST (IK) | `/v1/children/:childId/survey-update/submit` | `SubmitSurveyUpdateRequest` | `ProfileResult` (`snapshot.source='survey_update'`) | `VALIDATION_FAILED` · `ONBOARDING_INCOMPLETE`(필수 문항 빈칸) · `IDEMPOTENCY_KEY_REUSED` · `CONSENT_REQUIRED` |
 *
 * ── 온보딩 endpoint 와 **분리**한 이유 (`N6-05` ⓐ) ──
 * 온보딩 Route Guard·상태(`OnboardingState`)와 섞지 않고, 이미 제출된 온보딩 응답을 **덮어쓰지 않는다**.
 * 서버는 제출마다 **응답 버전 행**을 새로 만든다(온보딩 = 1행, 재응답 = 새 행) — 제출된 행은 불변이다
 * (`docs/plans/stage-6-plan.md` §6 `survey_responses` · `P6-BIP-07`). 버전 행은 응답에 노출하지 않는다.
 *
 * ── 범위 (C-7) ──
 * 온보딩 **Step 2~5** 만 다시 답한다. Step 1(아이 정보)은 `PATCH /v1/children/:childId`(`UpdateChildRequest`)
 * 경로다 — 그래서 단계 enum 에서 `child_info` 를 뺐다. 문항은 온보딩과 **같은 instrument**
 * (`{code, version}`)이며 서버가 내려준다(`D-A` — 화면 하드코딩 금지). instrument 버전이 바뀌었으면
 * 서버가 새 버전으로 내려주고 **프리필 가능한 문항만** 채운다 (`N6-15` · `P6-BIP-07`).
 *
 * 응답 값 schema 는 온보딩 단계 schema 를 **재사용**한다 — 같은 모양을 다시 선언하지 않는다.
 */

/** 재응답 단계 — 온보딩 단계에서 `child_info` 를 뺀 4단계 (C-7). 배열 순서 = 진행 순서. */
export const SurveyUpdateStepSchema = OnboardingStepSchema.exclude(['child_info']);

export type SurveyUpdateStep = z.infer<typeof SurveyUpdateStepSchema>;

/** 재응답 draft — 온보딩 draft 모양에서 `child_info` 를 뺀 것 (단계별 부분 응답 허용). */
export const SurveyUpdateDraftAnswersSchema = OnboardingDraftAnswersSchema.omit({
  child_info: true,
});

export type SurveyUpdateDraftAnswers = z.infer<typeof SurveyUpdateDraftAnswersSchema>;

/**
 * 단계별 진행 상태. **`completed` = 이번 재응답 draft 에서 저장된 단계**다 — 프리필만 된 단계는 `false`.
 * 그래서 하나라도 `true` 이면 "진행 중인 재응답이 있다"(이탈 복귀 — PLANNING Exit, AC-6-26)로 읽는다.
 */
export const SurveyUpdateStepStateSchema = z.object({
  step: SurveyUpdateStepSchema,
  completed: z.boolean(),
});

export type SurveyUpdateStepState = z.infer<typeof SurveyUpdateStepStateSchema>;

/**
 * `GET …/survey-update` · `PUT …/survey-update/steps/:step` 응답.
 *
 * - `draftAnswers` — 진행 중 draft 가 없으면 **가장 최근에 제출된 응답으로 프리필**된 값이다
 *   (빈 설문으로 다시 시작하지 않는다 — Plan §5.3). draft 가 있으면 draft 값이다.
 * - `currentStep` — 다시 들어왔을 때 열어야 할 단계 (이탈 복귀). **Rev 10.1 (`D6-9` ②)**: 사용자가 **마지막으로 보던
 *   단계**다 — ~~마지막으로 저장된 단계~~. 서버 규칙 `state.currentStep = request.currentStep ?? request.step`.
 * - draft 는 **서버가 정본**이다 — 기기 로컬에 저장하지 않는다 (`N6-07`, Plan §5.5).
 */
export const SurveyUpdateStateSchema = z.object({
  instrument: OnboardingInstrumentSchema,
  steps: z.array(SurveyUpdateStepStateSchema).length(SurveyUpdateStepSchema.options.length),
  draftAnswers: SurveyUpdateDraftAnswersSchema,
  currentStep: SurveyUpdateStepSchema,
});

export type SurveyUpdateState = z.infer<typeof SurveyUpdateStateSchema>;

/**
 * `PUT …/survey-update/steps/:step` 요청 — 온보딩 `SaveOnboardingStepRequest` 와 **같은 단계별 schema**
 * (중도 저장이라 부분 응답 허용). `child_info` 단계는 없다 (C-7). 단계 이동 시 1회 호출(`D-11` 규칙 재사용).
 *
 * **Rev 10.1 (`D6-9` ② · `VG6-C-10`)** — 4변형 공통 **선택 필드 `currentStep`** = 이 저장 뒤 사용자가 보는 단계.
 * - 단계 이동(앞·뒤): `step` = 떠나는 단계의 답 · `currentStep` = **도착 단계**.
 * - 카드 화면 이탈(앱 안 이동 · 브라우저 back · `pagehide` best-effort): `step` = 보던 단계 · `currentStep` **생략**.
 * - 서버: `state.currentStep = currentStep ?? step`. 잘못된 값 = 기존 `VALIDATION_FAILED` (신규 code 0).
 */
const surveyUpdateCurrentStep = { currentStep: SurveyUpdateStepSchema.optional() };

export const SaveSurveyUpdateStepRequestSchema = z.discriminatedUnion('step', [
  z.object({
    step: z.literal('reading_together'),
    answers: ReadingTogetherAnswersSchema.partial(),
    ...surveyUpdateCurrentStep,
  }),
  z.object({
    step: z.literal('books_and_interests'),
    answers: BooksAndInterestsAnswersSchema.partial(),
    ...surveyUpdateCurrentStep,
  }),
  z.object({
    step: z.literal('growing_together'),
    answers: GrowingTogetherAnswersSchema.partial(),
    ...surveyUpdateCurrentStep,
  }),
  z.object({
    step: z.literal('capability_items'),
    answers: CapabilityItemsAnswersSchema,
    ...surveyUpdateCurrentStep,
  }),
]);

export type SaveSurveyUpdateStepRequest = z.infer<typeof SaveSurveyUpdateStepRequestSchema>;

/** 재응답 제출 응답 묶음 — 온보딩 제출 묶음에서 `child_info` 를 뺀 것. 역량 문항은 10개 전부. */
export const CompleteSurveyUpdateAnswersSchema = CompleteOnboardingAnswersSchema.omit({
  child_info: true,
});

export type CompleteSurveyUpdateAnswers = z.infer<typeof CompleteSurveyUpdateAnswersSchema>;

/**
 * `POST …/survey-update/submit` 요청 — **`Idempotency-Key` 필수**.
 * 응답은 `ProfileResult` 이며 `snapshot.source = 'survey_update'` 인 **새 스냅샷**을 담는다.
 * 화면 데이터는 그 뒤 `GET /profile` 이 정본이다 (`D6-5`).
 */
export const SubmitSurveyUpdateRequestSchema = z.object({
  /** 응답을 수집한 문항 집합 (`D-A` ④). 서버가 내려준 `SurveyUpdateState.instrument` 의 code·version. */
  instrument: InstrumentRefSchema,
  answers: CompleteSurveyUpdateAnswersSchema,
});

export type SubmitSurveyUpdateRequest = z.infer<typeof SubmitSurveyUpdateRequestSchema>;
