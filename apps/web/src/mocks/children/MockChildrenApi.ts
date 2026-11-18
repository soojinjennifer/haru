/**
 * `MockChildrenApi` — 아이 프로필 · 아이 정보 수정 · 발전 역량 · 설문 재응답 Mock Adapter
 * (Stage 6 Plan §8 `children` 그룹 · `API_CONTRACTS` §5.4 · Spec §7).
 *
 * scenario 표와 seed 동작은 `childProfileRecords.ts` 머리 주석에 있다. 여기서는 **전달 방식**과 서버 규칙을 다룬다.
 *
 * | key | 동작 |
 * |---|---|
 * | `success` · HARU 특화 key | 상태 저장형 — 수정 → 조회 반영 · 재응답 제출 → 새 스냅샷(`survey_update`) · 발전 역량 저장 → 반영 |
 * | `loading` | 주입 timer 로 지연 후 성공 |
 * | `error` | contracts Error Envelope — 기본 `INTERNAL_ERROR` (번들 옵션 `errorCodes` 로 code 지정, 예 `CONSENT_REQUIRED`) |
 * | `retry` | 메서드별 1회차 실패 → 2회차부터 성공 (같은 `Idempotency-Key` 로 재시도) |
 * | `offline` | `NetworkError` |
 * | `empty` | 갱신 이력 없는 기본 상태 (스냅샷 1 · `profileUpdatedAt: null`) |
 * | `validation-failed` | `update` 만 `VALIDATION_FAILED` + `details.fields` = 보낸 필드 이름 (값은 담지 않는다) |
 *
 * ── 서버 규칙 (BACKEND 요구사항과 같다 — `P6-BIP-07`·`08`·`09`) ──
 * - 아이 id 는 `GET /v1/me` 의 아이 하나뿐이다. 다른 id → `CHILD_NOT_FOUND` (소유권 — RLS 는 Backend)
 * - `update`: 나이 범위(3~9세)를 **서버 시계**로 다시 본다 → 위반 시 `VALIDATION_FAILED`(`details.fields`).
 *   `lastName: ''` 은 성 지우기
 * - 재응답 제출: instrument 는 이 서버가 내려준 것과 같아야 한다 · 필수 문항 응답 확인(instrument 기준)
 *   → 빈칸이면 `ONBOARDING_INCOMPLETE` · 응답 **버전 행** 추가 · 이전 행 불변 · draft 비움
 * - **`Idempotency-Key`**: 판정이 scenario 분기보다 **앞**이다 (세션·회고와 같은 보관소)
 * - 요청 body 는 contracts 로 parse 한다 — 형식 위반은 `VALIDATION_FAILED`
 *
 * 요청 로그에는 **본문까지** 남긴다 (AC-6-19 "변경 필드만 요청 body" 증거). `mocks/**` 는 Production 빌드에 없다.
 */
import {
  ChildProfileSchema,
  ProfileResultSchema,
  SaveSurveyUpdateStepRequestSchema,
  SetGrowthCapabilityRequestSchema,
  SubmitSurveyUpdateRequestSchema,
  SurveyUpdateStateSchema,
  SurveyUpdateStepSchema,
  UpdateChildRequestSchema,
  createUpdateChildRequestSchema,
  suggestGrowthCapability,
  unansweredRequiredQuestions,
  type Child,
  type ChildProfile,
  type ProfileResult,
  type SaveSurveyUpdateStepRequest,
  type SetGrowthCapabilityRequest,
  type SubmitSurveyUpdateRequest,
  type SurveyUpdateState,
  type UpdateChildRequest,
} from '@haru/contracts';

import type { ChildrenApi } from '../../shared/api/children-api';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import { parseRequest, parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiMutationOptions } from '../../shared/api/options';
import { clockDate, type Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { idempotencyFingerprint, type IdempotencyLedger } from '../common/idempotency';
import { createOnboardingInstrumentFixture } from '../fixtures/onboarding';
import { MOCK_CHILD_ID } from '../fixtures/me';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioStore } from '../scenarios';

import {
  childrenScenarioGroup,
  commitSurveyUpdate,
  ensureChildProfileRecord,
  type ChildrenScenarioKey,
} from './childProfileRecords';
import {
  latestOf,
  latestResponse,
  toChildProfile,
  type MockChildProfileRecord,
  type MockChildProfileState,
} from './childProfileState';

/** Catalogue §5.4 `loading` "1.5–3s". 실제 대기는 주입 timer 가 정한다. */
export const CHILDREN_LOADING_DELAY_MS = 1_500;

const PROFILE_OPERATION = 'GET /v1/children/:childId/profile';
const UPDATE_OPERATION = 'PATCH /v1/children/:childId';
const GROWTH_OPERATION = 'PUT /v1/children/:childId/growth-capability';
const SURVEY_STATE_OPERATION = 'GET /v1/children/:childId/survey-update';
const SURVEY_SAVE_OPERATION = 'PUT /v1/children/:childId/survey-update/steps/:step';
const SURVEY_SUBMIT_OPERATION = 'POST /v1/children/:childId/survey-update/submit';

export interface MockChildrenApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  /** `MockOnboardingApi` · `MockMeApi` 와 공유하는 아이 프로필 서버 상태. */
  childProfileState: MockChildProfileState;
  /** 세션·회고와 같은 `Idempotency-Key` 보관소 (서버 키 공간은 하나다). */
  idempotency: IdempotencyLedger;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockChildrenApi(deps: MockChildrenApiDeps): ChildrenApi {
  const { store, clock, idFactory, timer, childProfileState, idempotency, requestLog, errorCodes } =
    deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;
  /** 이 서버가 내려주는 문항 집합 — 온보딩과 같은 instrument 다 (`D-A` · C-7). */
  const instrument = createOnboardingInstrumentFixture();

  function recordFor(childId: string, scenario: ChildrenScenarioKey): MockChildProfileRecord {
    if (childId !== MOCK_CHILD_ID) return fail('CHILD_NOT_FOUND', 'Unknown child.');
    return ensureChildProfileRecord(childProfileState, scenario, instrument, clock);
  }

  function profileOf(record: MockChildProfileRecord, operation: string): ChildProfile {
    return parseResponse(ChildProfileSchema, toChildProfile(record), {
      operation,
      direction: 'response',
    });
  }

  function surveyStateOf(record: MockChildProfileRecord, operation: string): SurveyUpdateState {
    const draft = record.draft;
    const { reading_together, books_and_interests, growing_together, capability_items } =
      latestResponse(record).answers;
    const prefill = { reading_together, books_and_interests, growing_together, capability_items };

    return parseResponse(
      SurveyUpdateStateSchema,
      {
        instrument,
        steps: SurveyUpdateStepSchema.options.map((step) => ({
          step,
          completed: draft?.completed.has(step) ?? false,
        })),
        draftAnswers: draft?.answers ?? prefill,
        currentStep: draft?.currentStep ?? SurveyUpdateStepSchema.options[0],
      },
      { operation, direction: 'response' },
    );
  }

  function call<T>(
    method: string,
    options: ApiRequestOptions,
    run: (scenario: ChildrenScenarioKey) => T,
  ): Promise<T> {
    const { scenario, attempt } = beginScenarioCall(
      store,
      childrenScenarioGroup,
      method,
      options.signal,
    );
    return deliver({
      scenario,
      attempt,
      delayMs: CHILDREN_LOADING_DELAY_MS,
      run: () => run(scenario),
      message: 'Mock child profile request failed.',
      errorCode: resolveErrorCode(errorCodes, childrenScenarioGroup.group, method),
      signal: options.signal,
      timer,
      failure,
    });
  }

  /** PATCH 적용 — 보낸 필드만 바꾼다. `lastName: ''` 은 성을 지운다. */
  function applyUpdate(child: Child, body: UpdateChildRequest): Child {
    const { lastName, ...rest } = body;
    const next: Child = { ...child };
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) Object.assign(next, { [key]: value });
    }
    if (lastName !== undefined) {
      if (lastName.length === 0) delete next.lastName;
      else next.lastName = lastName;
    }
    return next;
  }

  return {
    async getProfile(request: { childId: string }, options: ApiRequestOptions = {}) {
      // 경로 파라미터는 payload 로 남기지 않는다 (`MockHomeApi` 와 같다).
      requestLog?.record(PROFILE_OPERATION);
      return call('getProfile', options, (scenario) =>
        profileOf(recordFor(request.childId, scenario), PROFILE_OPERATION),
      );
    },

    async update(
      request: { childId: string; body: UpdateChildRequest },
      options: ApiRequestOptions = {},
    ) {
      const body = parseRequest(UpdateChildRequestSchema, request.body, {
        operation: UPDATE_OPERATION,
      });
      requestLog?.record(UPDATE_OPERATION, body);

      return call('update', options, (scenario) => {
        const record = recordFor(request.childId, scenario);
        const fields = Object.keys(body).filter(
          (key) => body[key as keyof UpdateChildRequest] !== undefined,
        );

        if (scenario === 'validation-failed') {
          return fail('VALIDATION_FAILED', 'Some child details are not valid.', { fields });
        }

        // 서버 시계 기준 나이 범위 재검증 (C-10 · D-10 — 화면이 막아도 서버 규칙은 별도다).
        const ranged = createUpdateChildRequestSchema(clockDate(clock)).safeParse(body);
        if (!ranged.success) {
          const invalid = [
            ...new Set(ranged.error.issues.map((issue) => String(issue.path[0] ?? ''))),
          ].filter((field) => field.length > 0);
          return fail('VALIDATION_FAILED', 'Some child details are not valid.', {
            fields: invalid,
          });
        }

        record.child = applyUpdate(record.child, ranged.data);
        return profileOf(record, UPDATE_OPERATION);
      });
    },

    async setGrowthCapability(
      request: { childId: string; body: SetGrowthCapabilityRequest },
      options: ApiRequestOptions = {},
    ) {
      const body = parseRequest(SetGrowthCapabilityRequestSchema, request.body, {
        operation: GROWTH_OPERATION,
      });
      requestLog?.record(GROWTH_OPERATION, body);

      return call('setGrowthCapability', options, (scenario) => {
        const record = recordFor(request.childId, scenario);
        // `score: null` 역량도 고를 수 있다 (`N6-11` ⓐ — D-2 는 기본 제시값 후보에서만 제외).
        record.growthCapability = body.capability;
        record.growthSelections.push(
          Object.freeze({
            capability: body.capability,
            actor: 'caregiver_changed' as const,
            at: clock.nowIso(),
          }),
        );
        return profileOf(record, GROWTH_OPERATION);
      });
    },

    async getSurveyUpdate(request: { childId: string }, options: ApiRequestOptions = {}) {
      requestLog?.record(SURVEY_STATE_OPERATION);
      return call('getSurveyUpdate', options, (scenario) =>
        surveyStateOf(recordFor(request.childId, scenario), SURVEY_STATE_OPERATION),
      );
    },

    async saveSurveyUpdateStep(
      request: { childId: string; body: SaveSurveyUpdateStepRequest },
      options: ApiRequestOptions = {},
    ) {
      const body = parseRequest(SaveSurveyUpdateStepRequestSchema, request.body, {
        operation: SURVEY_SAVE_OPERATION,
      });
      // 아동 데이터 전송 전수 검사용 (AC-2-13 과 같은 증거 경로) — 본문까지 기록한다.
      requestLog?.record(SURVEY_SAVE_OPERATION, body);

      return call('saveSurveyUpdateStep', options, (scenario) => {
        const record = recordFor(request.childId, scenario);
        // Rev 10.1 (`D6-9` ②) — `currentStep` = 사용자가 보던 단계. 이동 PUT 은 도착 단계를 싣고,
        // 이탈 PUT 은 생략한다(= 저장한 단계를 보던 중).
        const viewing = body.currentStep ?? body.step;
        const draft = record.draft ?? {
          answers: structuredClone(latestResponse(record).answers),
          currentStep: viewing,
          completed: new Set(),
        };
        draft.answers = { ...draft.answers, [body.step]: body.answers };
        draft.currentStep = viewing;
        draft.completed.add(body.step);
        record.draft = draft;
        return surveyStateOf(record, SURVEY_SAVE_OPERATION);
      });
    },

    async submitSurveyUpdate(
      request: { childId: string; body: SubmitSurveyUpdateRequest },
      options: ApiMutationOptions,
    ): Promise<ProfileResult> {
      const body = parseRequest(SubmitSurveyUpdateRequestSchema, request.body, {
        operation: SURVEY_SUBMIT_OPERATION,
      });
      requestLog?.record(SURVEY_SUBMIT_OPERATION, body);

      const fingerprint = idempotencyFingerprint(
        SURVEY_SUBMIT_OPERATION,
        { childId: request.childId },
        body,
      );
      const replayed = idempotency.replay<ProfileResult>(options.idempotencyKey, fingerprint);
      if (replayed !== undefined) return replayed;

      return call('submitSurveyUpdate', options, (scenario) => {
        const record = recordFor(request.childId, scenario);

        if (
          body.instrument.code !== instrument.code ||
          body.instrument.version !== instrument.version
        ) {
          return fail('VALIDATION_FAILED', 'Answers were collected with another question set.');
        }
        // 서버는 화면을 믿지 않는다 — 필수 문항 응답을 instrument 기준으로 다시 본다 (`S2-ONB-1`).
        if (unansweredRequiredQuestions(instrument, body.answers).length > 0) {
          return fail('ONBOARDING_INCOMPLETE', 'Some required questions have no answer yet.');
        }

        const snapshot = commitSurveyUpdate(record, {
          instrument,
          answers: body.answers,
          snapshotId: idFactory.next(),
          at: clock.nowIso(),
        });
        // 관심사·함께 키우고 싶은 것도 아이 레코드에 반영된다 (추천 입력 — `P6-BIP-07`).
        record.child = {
          ...record.child,
          topicTags: body.answers.books_and_interests.topicTags,
          growthGoals: body.answers.growing_together.growthGoals,
          ownedBooks: body.answers.books_and_interests.ownedBooks,
        };

        const result = parseResponse(
          ProfileResultSchema,
          {
            child: record.child,
            snapshot,
            // 페르소나 재생성은 서버(AI) 몫이다 (`P6-BIP-07` · `02`) — Mock 은 현재 페르소나를 유지한다.
            persona: latestOf(record.personas),
            suggestedCapability: suggestGrowthCapability(snapshot.scores),
          },
          { operation: SURVEY_SUBMIT_OPERATION, direction: 'response' },
        );
        return idempotency.remember(options.idempotencyKey, fingerprint, result);
      });
    },
  };
}
