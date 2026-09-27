/**
 * `MockConsentApi` — `GET /v1/consent-documents/current` · `POST /v1/consents` 의 Mock Adapter.
 *
 * Plan §8.1 `consents` 그룹 · API_CONTRACTS §5.4 Catalogue.
 *
 * | key | 동작 |
 * |---|---|
 * | `success` | 문서 5종 반환 · 동의 기록 성공 |
 * | `loading` | 주입 timer 로 지연 후 성공 |
 * | `error` | `INTERNAL_ERROR` Error Envelope |
 * | `retry` | 1회차 실패 → 2회차부터 성공 (체크 상태 보존 UX 검증) |
 * | `offline` | `NetworkError` (Error Envelope 없음) |
 * | `consent-missing` | 정상 동작. 이 key 의 의미는 `me` 가 표현한다(아래 주) |
 * | `consent-version-outdated` | **버전이 올라간** 문서 묶음을 반환 → 재동의 흐름 |
 *
 * 주) `consent-missing` 을 이 그룹에도 두는 이유는 두 가지다. ① `?scenario=consent-missing`
 * 처럼 그룹을 생략해 지정했을 때 Catalogue 에 있는 key 가 "이 그룹에 없는 key" 로 경고를 내지
 * 않게 한다. ② Catalogue 의 적용 그룹 열이 `me, consents, onboarding …` 이다.
 * 동의 화면 자체는 "아직 동의가 없는 상태" 에서 여는 화면이므로 Adapter 동작은 `success` 와 같다.
 *
 * ── 서버가 강제하는 규칙을 Mock 도 그대로 재현한다 ──
 * 1. 제출한 `documentId` 가 **현재 배포 문서와 다르면** `CONSENT_VERSION_OUTDATED` (P2-BIP-04)
 * 2. **필수 동의 누락**이면 `VALIDATION_FAILED` (화면이 막더라도 서버 규칙은 별도다)
 * 3. `Idempotency-Key` 를 실제로 보관한다 — 같은 key + 같은 body 는 **최초 응답 재생**,
 *    같은 key + 다른 body 는 `IDEMPOTENCY_KEY_REUSED` (AC-2-16 · S2-R12)
 *
 * 실제 **서버 측 동의 강제**(동의 없이 아동 데이터 쓰기 거부)는 `BACKEND_INTEGRATION_PENDING`
 * (P2-BIP-03) 이다. Frontend 는 Route Guard 와 Mock 으로만 재현한다.
 *
 * 시간·ID·지연은 전부 주입받는다 (`Date.now()` · `Math.random()` · `setTimeout` 직접 호출 금지).
 */
import {
  ConsentStatusSchema,
  CurrentConsentDocumentsSchema,
  HaruApiError,
  RecordConsentsRequestSchema,
  type ConsentStatus,
  type CurrentConsentDocuments,
  type ErrorCode,
  type RecordConsentsRequest,
} from '@haru/contracts';

import type { ConsentApi } from '../../shared/api/consent-api';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { ApiMutationOptions } from '../../shared/api/options';
import {
  buildErrorEnvelope,
  NetworkError,
  parseRequest,
  parseResponse,
  withDelay,
  type Timer,
} from '../../shared/api/helpers';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createConsentDocumentsFixture,
  MOCK_REQUIRED_CONSENT_TYPES,
  type ConsentDocumentSetName,
} from '../fixtures/consent';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

import type { MockConsentState } from './consentState';

export const CONSENT_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'consent-missing',
  'consent-version-outdated',
] as const;

export type ConsentScenarioKey = (typeof CONSENT_SCENARIO_KEYS)[number];

export const consentScenarioGroup: ScenarioGroupDefinition<ConsentScenarioKey> = {
  group: 'consents',
  keys: CONSENT_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 "1.5–3s". 실제 대기는 주입 timer 가 결정한다. */
export const CONSENT_LOADING_DELAY_MS = 1_500;

const DOCUMENTS_OPERATION = 'GET /v1/consent-documents/current';
const RECORD_OPERATION = 'POST /v1/consents';

export interface MockConsentApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  /** `MockMeApi` 와 공유하는 동의 상태. 주지 않으면 이 Adapter 전용 상태를 쓴다. */
  consentState: MockConsentState;
  requestLog?: RequestLog | undefined;
}

/** 같은 key 로 두 번 들어온 요청이 **같은 요청**인지 판단하는 기준 (서버 규약과 동일). */
function fingerprint(request: RecordConsentsRequest): string {
  return JSON.stringify(request);
}

export function createMockConsentApi(deps: MockConsentApiDeps): ConsentApi {
  const { store, clock, idFactory, timer, consentState, requestLog } = deps;

  /** `Idempotency-Key` → (요청 지문, 최초 응답). 실제 서버는 24h 보관한다 (P2-BIP-11). */
  const idempotency = new Map<string, { body: string; response: ConsentStatus }>();

  function fail(code: ErrorCode, message: string): never {
    throw HaruApiError.fromEnvelope(
      buildErrorEnvelope(code, message, { requestId: idFactory.next() }),
    );
  }

  function documentSet(scenario: ConsentScenarioKey): ConsentDocumentSetName {
    return scenario === 'consent-version-outdated' ? 'updated' : 'current';
  }

  function documents(scenario: ConsentScenarioKey): CurrentConsentDocuments {
    // Mock 도 Http 와 동일하게 경계에서 parse 한다 (Plan §7.3).
    return parseResponse(
      CurrentConsentDocumentsSchema,
      createConsentDocumentsFixture(documentSet(scenario)),
      { operation: DOCUMENTS_OPERATION, direction: 'response' },
    );
  }

  function status(): ConsentStatus {
    const missing = consentState.missingFrom(MOCK_REQUIRED_CONSENT_TYPES);

    return parseResponse(
      ConsentStatusSchema,
      {
        required: [...MOCK_REQUIRED_CONSENT_TYPES],
        missing,
        grantedAt: consentState.granted().length === 0 ? null : clock.nowIso(),
      },
      { operation: RECORD_OPERATION, direction: 'response' },
    );
  }

  function applyRecord(
    request: RecordConsentsRequest,
    scenario: ConsentScenarioKey,
  ): ConsentStatus {
    const current = createConsentDocumentsFixture(documentSet(scenario)).documents;

    // ① 항목별 문서 버전 검사 — 구버전 제출은 재동의 대상이다.
    for (const item of request.items) {
      const document = current.find((candidate) => candidate.type === item.type);

      if (document === undefined || document.documentId !== item.documentId) {
        fail('CONSENT_VERSION_OUTDATED', 'A newer version of that document is in effect.');
      }
    }

    // ② 필수 동의 누락 검사 — 화면이 막더라도 서버 규칙은 따로 존재한다.
    const submitted = new Set(request.items.map((item) => item.type));
    const requiredTypes = current.filter((document) => document.required).map((doc) => doc.type);
    const missingRequired = requiredTypes.filter((type) => !submitted.has(type));

    if (missingRequired.length > 0) {
      fail('VALIDATION_FAILED', 'Required consent items are missing from the request.');
    }

    consentState.grant(request.items.map((item) => item.type));

    return status();
  }

  return {
    async getCurrentDocuments(options: ApiRequestOptions = {}) {
      const scenario = store.resolve(consentScenarioGroup);
      const attempt = consumeAttempt(store, consentScenarioGroup.group, options.signal);

      // 공개 endpoint 라도 **요청이 나갔다는 사실**을 기록한다 (AC-2-13 전수 검사).
      requestLog?.record(DOCUMENTS_OPERATION);

      switch (scenario) {
        case 'loading':
          return withDelay(
            timer,
            CONSENT_LOADING_DELAY_MS,
            () => documents(scenario),
            options.signal,
          );

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock consent documents request failed.');

        case 'retry':
          return attempt === 1
            ? fail('INTERNAL_ERROR', 'Mock consent documents request failed.')
            : documents(scenario);

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return documents(scenario);
      }
    },

    async record(request: RecordConsentsRequest, options: ApiMutationOptions) {
      const parsed = parseRequest(RecordConsentsRequestSchema, request, {
        operation: RECORD_OPERATION,
      });

      // payload 에 아동 데이터가 없다는 사실을 전수 검사할 수 있도록 **본문까지** 기록한다.
      requestLog?.record(RECORD_OPERATION, parsed);

      const body = fingerprint(parsed);
      const stored = idempotency.get(options.idempotencyKey);

      if (stored !== undefined) {
        // 같은 key + 같은 body → 최초 응답 재생. 상태를 다시 바꾸지 않는다.
        if (stored.body === body) return stored.response;

        return fail('IDEMPOTENCY_KEY_REUSED', 'That idempotency key was used with another body.');
      }

      const scenario = store.resolve(consentScenarioGroup);
      const attempt = consumeAttempt(store, consentScenarioGroup.group, options.signal);

      function commit(): ConsentStatus {
        const response = applyRecord(parsed, scenario);
        idempotency.set(options.idempotencyKey, { body, response });
        return response;
      }

      switch (scenario) {
        case 'loading':
          return withDelay(timer, CONSENT_LOADING_DELAY_MS, commit, options.signal);

        case 'error':
          return fail('INTERNAL_ERROR', 'Mock consent record request failed.');

        case 'retry':
          // 실패한 시도는 저장하지 않는다 — 같은 key 로 재시도하면 이번에 성공해 저장된다.
          return attempt === 1
            ? fail('INTERNAL_ERROR', 'Mock consent record request failed.')
            : commit();

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return commit();
      }
    },
  };
}
