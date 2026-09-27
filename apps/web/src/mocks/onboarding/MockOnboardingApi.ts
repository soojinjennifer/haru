/**
 * `MockOnboardingApi` — `GET /v1/onboarding` · `PUT …/steps/:step` · `POST …/submit`.
 *
 * Plan §8.1 `onboarding` 그룹 · API_CONTRACTS §5.4 Catalogue.
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | instrument + 저장 상태 반환 · 단계 저장 · 제출 성공 |
 * | `loading` | 주입 timer 로 지연 후 성공 |
 * | `error` | `INTERNAL_ERROR` Error Envelope |
 * | `retry` | 1회차 실패 → 2회차부터 성공 (입력 보존 검증) |
 * | `offline` | `NetworkError` (Error Envelope 없음) |
 * | `consent-missing` | **모든 호출을 `CONSENT_REQUIRED` 로 거부** — 동의 전 아동 데이터 쓰기 차단 |
 * | `vpc-pending` · `vpc-failed` | 〃 (VPC 미완료 구간도 아동 데이터 쓰기 없음) |
 * | `onboarding-incomplete` | 정상 동작 (Guard 판정은 `me` 가 표현한다) |
 * | `draft-resume` | 서버에 저장된 중도 응답 + `currentStep` 을 내려준다 |
 * | `persona-fallback` | 제출은 200, 페르소나가 fallback 문구다 |
 * | `child-limit-reached` | 제출을 `CHILD_LIMIT_REACHED` 로 거부 |
 * | `capability-all-missing` | 한 역량 문항 전부 `not_observed` → 해당 역량 `score: null` |
 *
 * ── 서버가 강제하는 규칙을 Mock 도 그대로 재현한다 ──
 * 1. **동의 기록 전에는 어떤 아동 데이터도 받지 않는다** → `CONSENT_REQUIRED`
 *    (`ARCHITECTURE` §7.3.1 · AC-2-13). 실제 서버 측 강제는 `BACKEND_INTEGRATION_PENDING`.
 * 2. 제출은 5단계 전체 + 10문항 전부가 있어야 한다 → 부족하면 `ONBOARDING_INCOMPLETE`
 * 3. `Idempotency-Key` 를 실제로 보관한다 — 같은 key + 같은 body 는 최초 응답 재생,
 *    같은 key + 다른 body 는 `IDEMPOTENCY_KEY_REUSED` (AC-2-16)
 *
 * 시간·ID·지연은 전부 주입받는다 (`Date.now()` · `Math.random()` · `setTimeout` 직접 호출 금지).
 */
import {
  CompleteOnboardingAnswersSchema,
  HaruApiError,
  OnboardingStateSchema,
  ProfileResultSchema,
  SURVEY_ANSWER_NOT_OBSERVED,
  SaveOnboardingStepRequestSchema,
  SubmitOnboardingRequestSchema,
  createSubmitOnboardingRequestSchema,
  type CompleteOnboardingAnswers,
  type ErrorCode,
  type OnboardingState,
  type ProfileResult,
  type SaveOnboardingStepRequest,
  type SubmitOnboardingRequest,
} from '@haru/contracts';

import {
  buildErrorEnvelope,
  NetworkError,
  parseRequest,
  parseResponse,
  withDelay,
  type Timer,
} from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { OnboardingApi } from '../../shared/api/onboarding-api';
import type { ApiMutationOptions } from '../../shared/api/options';
import { clockDate, type Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import type { MockConsentState } from '../consent/consentState';
import { MOCK_REQUIRED_CONSENT_TYPES } from '../fixtures/consent';
import {
  createOnboardingInstrumentFixture,
  createOnboardingStateFixture,
  createResumeDraftAnswers,
  MOCK_RESUME_STEP,
} from '../fixtures/onboarding';
import { createProfileResultFixture } from '../fixtures/profile-result';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

import type { MockOnboardingState } from './onboardingState';

export const ONBOARDING_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'consent-missing',
  'vpc-pending',
  'vpc-failed',
  'onboarding-incomplete',
  'draft-resume',
  'persona-fallback',
  'child-limit-reached',
  'capability-all-missing',
] as const;

export type OnboardingScenarioKey = (typeof ONBOARDING_SCENARIO_KEYS)[number];

export const onboardingScenarioGroup: ScenarioGroupDefinition<OnboardingScenarioKey> = {
  group: 'onboarding',
  keys: ONBOARDING_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 "1.5–3s". 실제 대기는 주입 timer 가 결정한다. */
export const ONBOARDING_LOADING_DELAY_MS = 1_500;

const STATE_OPERATION = 'GET /v1/onboarding';
const SAVE_OPERATION = 'PUT /v1/onboarding/steps/:step';
const SUBMIT_OPERATION = 'POST /v1/onboarding/submit';

/**
 * VPC 가 끝나지 않은 구간 — 아동 데이터 쓰기를 **항상** 거부한다.
 * (`consent-missing` 은 동의 기록 상태를 함께 보므로 아래에서 따로 다룬다.)
 */
const VPC_BLOCKED_KEYS: readonly OnboardingScenarioKey[] = ['vpc-pending', 'vpc-failed'];

export interface MockOnboardingApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  /** `MockMeApi` 와 공유하는 온보딩 상태 (제출이 `me` 에 반영되어야 한다). */
  onboardingState: MockOnboardingState;
  /** 동의 기록 여부 — 아동 데이터 수신 차단 판정에 쓴다 (AC-2-13). */
  consentState: MockConsentState;
  requestLog?: RequestLog | undefined;
}

/** 같은 key 로 두 번 들어온 요청이 같은 요청인지 판단하는 기준 (서버 규약과 동일). */
function fingerprint(request: SubmitOnboardingRequest): string {
  return JSON.stringify(request);
}

/** `capability-all-missing` — 감정 조절 문항을 전부 결측으로 바꾼다 (C-8 · D-2). */
function withAllMissingCapability(
  answers: CompleteOnboardingAnswers,
  missingItemCodes: readonly string[],
): CompleteOnboardingAnswers {
  return CompleteOnboardingAnswersSchema.parse({
    ...answers,
    capability_items: {
      ...answers.capability_items,
      answers: answers.capability_items.answers.map((answer) =>
        missingItemCodes.includes(answer.itemCode)
          ? { itemCode: answer.itemCode, value: SURVEY_ANSWER_NOT_OBSERVED }
          : answer,
      ),
    },
  });
}

export function createMockOnboardingApi(deps: MockOnboardingApiDeps): OnboardingApi {
  const { store, clock, idFactory, timer, onboardingState, consentState, requestLog } = deps;

  /** `Idempotency-Key` → (요청 지문, 최초 응답). 실제 서버는 24h 보관한다 (P2-BIP-11). */
  const idempotency = new Map<string, { body: string; response: ProfileResult }>();

  function fail(code: ErrorCode, message: string): never {
    throw HaruApiError.fromEnvelope(
      buildErrorEnvelope(code, message, { requestId: idFactory.next() }),
    );
  }

  /**
   * 동의·VPC 가 끝나기 전에는 아동 데이터를 다루는 모든 호출을 거부한다 (AC-2-13).
   *
   * 판정 기준이 scenario 와 `MockConsentState` **둘 다**인 이유:
   * `consent-missing` 으로 시작했더라도 같은 세션에서 `POST /v1/consents` 가 성공하면
   * 그 다음 호출은 통과해야 동의 → 온보딩 흐름이 end-to-end 로 이어진다.
   * 기본 scenario 는 `MockMeApi` fixture 와 같이 "동의 완료" 상태를 전제한다.
   */
  function requireConsent(scenario: OnboardingScenarioKey): void {
    if (VPC_BLOCKED_KEYS.includes(scenario)) {
      fail('CONSENT_REQUIRED', 'Parent verification must finish before this step.');
    }

    const missing = consentState.missingFrom(MOCK_REQUIRED_CONSENT_TYPES);

    if (scenario === 'consent-missing' && missing.length > 0) {
      fail('CONSENT_REQUIRED', 'Guardian consent must be recorded before this step.');
    }
  }

  function state(scenario: OnboardingScenarioKey): OnboardingState {
    if (scenario === 'draft-resume' && !onboardingState.submitted()) {
      return parseResponse(
        OnboardingStateSchema,
        createOnboardingStateFixture({
          answers: createResumeDraftAnswers(),
          currentStep: MOCK_RESUME_STEP,
          completedSteps: ['child_info', 'temperament'],
        }),
        { operation: STATE_OPERATION, direction: 'response' },
      );
    }

    return parseResponse(
      OnboardingStateSchema,
      createOnboardingStateFixture({
        answers: onboardingState.answers(),
        currentStep: onboardingState.currentStep(),
        completedSteps: onboardingState.completedSteps(),
      }),
      { operation: STATE_OPERATION, direction: 'response' },
    );
  }

  function applySave(request: SaveOnboardingStepRequest, scenario: OnboardingScenarioKey) {
    onboardingState.saveStep(request.step, { [request.step]: request.answers });
    return state(scenario);
  }

  function applySubmit(
    request: SubmitOnboardingRequest,
    scenario: OnboardingScenarioKey,
  ): ProfileResult {
    if (scenario === 'child-limit-reached') {
      fail('CHILD_LIMIT_REACHED', 'This account already has a child profile.');
    }

    // 나이 범위까지 서버 규칙으로 다시 본다 (C-10 — 화면이 막더라도 서버 규칙은 별도다).
    const validated = createSubmitOnboardingRequestSchema(clockDate(clock)).safeParse(request);

    if (!validated.success) {
      fail('VALIDATION_FAILED', 'Submitted onboarding answers are not valid.');
    }

    const instrument = createOnboardingInstrumentFixture();
    const answers =
      scenario === 'capability-all-missing'
        ? withAllMissingCapability(
            validated.data.answers,
            instrument.survey.items
              .filter((item) => item.capability === 'emotion_regulation')
              .map((item) => item.itemCode),
          )
        : validated.data.answers;

    onboardingState.markSubmitted();

    return parseResponse(
      ProfileResultSchema,
      createProfileResultFixture({
        instrument,
        answers,
        clock,
        idFactory,
        fallbackPersona: scenario === 'persona-fallback',
      }),
      { operation: SUBMIT_OPERATION, direction: 'response' },
    );
  }

  return {
    async getState(options: ApiRequestOptions = {}) {
      const scenario = store.resolve(onboardingScenarioGroup);
      const attempt = consumeAttempt(store, onboardingScenarioGroup.group, options.signal);

      requestLog?.record(STATE_OPERATION);
      requireConsent(scenario);

      switch (scenario) {
        case 'loading':
          return withDelay(
            timer,
            ONBOARDING_LOADING_DELAY_MS,
            () => state(scenario),
            options.signal,
          );

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock onboarding state request failed.');

        case 'retry':
          return attempt === 1
            ? fail('INTERNAL_ERROR', 'Mock onboarding state request failed.')
            : state(scenario);

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return state(scenario);
      }
    },

    async saveStep(request: SaveOnboardingStepRequest, options: ApiRequestOptions = {}) {
      const parsed = parseRequest(SaveOnboardingStepRequestSchema, request, {
        operation: SAVE_OPERATION,
      });

      // 아동 데이터가 언제 나갔는지 전수 검사할 수 있도록 **본문까지** 기록한다 (AC-2-13).
      requestLog?.record(SAVE_OPERATION, parsed);

      const scenario = store.resolve(onboardingScenarioGroup);
      const attempt = consumeAttempt(store, onboardingScenarioGroup.group, options.signal);

      requireConsent(scenario);

      switch (scenario) {
        case 'loading':
          return withDelay(
            timer,
            ONBOARDING_LOADING_DELAY_MS,
            () => applySave(parsed, scenario),
            options.signal,
          );

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock onboarding step save failed.');

        case 'retry':
          return attempt === 1
            ? fail('INTERNAL_ERROR', 'Mock onboarding step save failed.')
            : applySave(parsed, scenario);

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return applySave(parsed, scenario);
      }
    },

    async submit(request: SubmitOnboardingRequest, options: ApiMutationOptions) {
      const parsed = parseRequest(SubmitOnboardingRequestSchema, request, {
        operation: SUBMIT_OPERATION,
      });

      requestLog?.record(SUBMIT_OPERATION, parsed);

      const body = fingerprint(parsed);
      const stored = idempotency.get(options.idempotencyKey);

      if (stored !== undefined) {
        if (stored.body === body) return stored.response;

        return fail('IDEMPOTENCY_KEY_REUSED', 'That idempotency key was used with another body.');
      }

      const scenario = store.resolve(onboardingScenarioGroup);
      const attempt = consumeAttempt(store, onboardingScenarioGroup.group, options.signal);

      requireConsent(scenario);

      function commit(): ProfileResult {
        const response = applySubmit(parsed, scenario);
        idempotency.set(options.idempotencyKey, { body, response });
        return response;
      }

      switch (scenario) {
        case 'loading':
          return withDelay(timer, ONBOARDING_LOADING_DELAY_MS, commit, options.signal);

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock onboarding submit failed.');

        case 'retry':
          // 실패한 시도는 저장하지 않는다 — 같은 key 로 재시도하면 이번에 성공해 저장된다.
          return attempt === 1
            ? fail('INTERNAL_ERROR', 'Mock onboarding submit failed.')
            : commit();

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return commit();
      }
    },
  };
}
