/**
 * `MockMeApi` — `GET /v1/me` 의 Mock Adapter (Plan §8.1 `me` 그룹).
 *
 * Route Guard 판정 데이터를 scenario 로 바꿔 가며 공급한다. 화면은 이 값을 그대로 쓰고
 * 판정은 순수 함수 `resolveGuardDecision` 이 한다 (D-5).
 *
 * | key                        | 동작                                                        |
 * |----------------------------|-------------------------------------------------------------|
 * | `success`                  | 동의 완료 · VPC 불필요 · 온보딩 완료                         |
 * | `loading`                  | 주입 timer 로 지연 후 성공                                   |
 * | `error`                    | `INTERNAL_ERROR` Error Envelope                              |
 * | `retry`                    | 1회차 실패 → 2회차부터 성공                                  |
 * | `offline`                  | `NetworkError` (Error Envelope 없음)                         |
 * | `token-expired`            | 1회차 `AUTH_TOKEN_EXPIRED` → refresh 후 재시도 성공 (AC-2-07) |
 * | `consent-missing`          | `consentStatus.missing` 비어 있지 않음 → Guard 가 동의 화면으로 |
 * | `consent-version-outdated` | 재동의 필요 — `grantedAt` 은 있는데 필수 동의가 다시 `missing`  |
 * | `vpc-pending` · `vpc-failed` | `parentVerification.status` 로 VPC 슬롯에 머묾              |
 * | `onboarding-incomplete`    | `onboardingStatus='in_progress'` → Guard 가 온보딩으로        |
 *
 * Stage 8 (`C8-10`): 모든 응답의 `caregiver.email` = 가상 주소 `MOCK_CAREGIVER_EMAIL` (읽기 전용 — `PATCH` 로 바뀌지 않는다).
 * Stage 8 (`N8-10` ⓐ): 전체 데이터 삭제 · 탈퇴 완료 뒤에는 `success` 계열이 온보딩 전 상태(`not_started` · 아이 없음)다.
 *
 * `S4-H4` (NB-16): scenario 와 별개로, 세션 endpoint 가 `ONBOARDING_INCOMPLETE` 를 낸 뒤에는
 * (`MockOnboardingState.serverIncomplete()`) `onboardingStatus='in_progress'` 를 돌려준다 — 제출이 우선한다.
 *
 * `consent-missing` · `consent-version-outdated` 의 `missing` 목록은 **고정값이 아니라**
 * `MockConsentState` 에서 계산한다. `POST /v1/consents` 가 성공하면 같은 상태가 갱신되므로
 * 동의 → (VPC) → 온보딩 흐름이 Mock 만으로 end-to-end 로 진행된다 (실제 Backend 의
 * `consent_events` 에 해당 — P2-BIP-04).
 *
 * 시간·ID·지연은 전부 주입받는다 (`Date.now()` · `Math.random()` · `setTimeout` 직접 호출 금지).
 */
import {
  HaruApiError,
  MeResponseSchema,
  UpdateCaregiverRequestSchema,
  type MeResponse,
  type UpdateCaregiverRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from '../../shared/api/health-api';
import {
  buildErrorEnvelope,
  NetworkError,
  parseRequest,
  parseResponse,
  withDelay,
  type Timer,
} from '../../shared/api/helpers';
import type { MeApi } from '../../shared/api/me-api';
import type { Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import type { MockChildProfileState } from '../children/childProfileState';
import type { MockConsentState } from '../consent/consentState';
import type { MockDeletionState } from '../data-management/deletionState';
import type { MockOnboardingState } from '../onboarding/onboardingState';
import {
  createMeResponseFixture,
  MOCK_CHILD_FIRST_NAME,
  MOCK_CHILD_ID,
  MOCK_REQUIRED_CONSENTS,
} from '../fixtures/me';
import type { RequestLog } from '../request-log';
import { consumeAttempt, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

export const ME_SCENARIO_KEYS = [
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
] as const;

export type MeScenarioKey = (typeof ME_SCENARIO_KEYS)[number];

export const meScenarioGroup: ScenarioGroupDefinition<MeScenarioKey> = {
  group: 'me',
  keys: ME_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Catalogue §5.4 "1.5–3s". 실제 대기는 주입 timer 가 결정한다. */
export const ME_LOADING_DELAY_MS = 1_500;

const OPERATION = 'GET /v1/me';
const UPDATE_OPERATION = 'PATCH /v1/me';

export interface MockMeApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  /** `MockConsentApi` 와 공유하는 동의 상태 (동의 기록이 `me` 에 반영되어야 한다). */
  consentState: MockConsentState;
  /** `MockOnboardingApi` 와 공유하는 온보딩 상태 (제출이 `me` 에 반영되어야 한다). */
  onboardingState: MockOnboardingState;
  /**
   * Stage 6 — 아이 프로필 서버 상태. 아이 정보 수정(`PATCH /v1/children/:childId`)·온보딩 제출 뒤
   * `child.firstName` 이 새 이름을 쓴다 (AC-6-22). 상태가 아직 없으면 fixture 이름(`Emma`).
   */
  childProfileState?: MockChildProfileState | undefined;
  /**
   * Stage 8 — 삭제 요청 서버 상태. 전체 데이터 삭제 · 탈퇴가 `completed` 면 아이 참조가 사라지고 온보딩 전 상태가 된다
   * (`N8-10` ⓐ — Guard 가 온보딩으로 보낸다). 없으면(단위 테스트 단독 조립) 반영하지 않는다.
   */
  deletionState?: MockDeletionState | undefined;
  requestLog?: RequestLog | undefined;
}

export function createMockMeApi(deps: MockMeApiDeps): MeApi {
  const { store, clock, idFactory, timer, consentState, onboardingState, requestLog } = deps;
  const childFirstName = (): string =>
    deps.childProfileState?.current()?.child.firstName ?? MOCK_CHILD_FIRST_NAME;

  /** `PATCH /v1/me` 로 갱신된 보호자 필드 (D-16). 아동 데이터는 여기에 들어오지 않는다. */
  let caregiverPatch: UpdateCaregiverRequest = {};

  function respond(scenario: MeScenarioKey): MeResponse {
    const fixture = ((): MeResponse => {
      switch (scenario) {
        case 'consent-missing':
          return createMeResponseFixture(clock, {
            missingConsents: consentState.missingFrom(MOCK_REQUIRED_CONSENTS),
            onboardingStatus: 'not_started',
          });

        case 'consent-version-outdated':
          // 이전에 동의한 적은 있다(`grantedAt`) — 문서 버전이 올라가 다시 필요한 상태다.
          return createMeResponseFixture(clock, {
            missingConsents: consentState.missingFrom(MOCK_REQUIRED_CONSENTS),
            grantedAt: clock.nowIso(),
            onboardingStatus: 'not_started',
          });

        case 'vpc-pending':
          return createMeResponseFixture(clock, {
            parentVerification: 'pending',
            onboardingStatus: 'not_started',
          });

        case 'vpc-failed':
          return createMeResponseFixture(clock, {
            parentVerification: 'failed',
            onboardingStatus: 'not_started',
          });

        case 'onboarding-incomplete':
          return createMeResponseFixture(clock, { onboardingStatus: 'in_progress' });

        default:
          // Stage 8 — 전체 데이터 삭제 · 탈퇴가 끝나 서버에 아이가 없다 → 온보딩 전 상태 (`N8-10` ⓐ). 다시 제출하면 아래가 완료로 바꾼다.
          if (deps.deletionState?.childDataDeleted === true && !onboardingState.submitted()) {
            return createMeResponseFixture(clock, { onboardingStatus: 'not_started' });
          }
          // 세션 endpoint 가 `ONBOARDING_INCOMPLETE` 를 낸 뒤면 같은 서버의 `me` 도 미완료다 (`S4-H4`, `P4B-BIP-08`)
          return onboardingState.serverIncomplete()
            ? createMeResponseFixture(clock, { onboardingStatus: 'in_progress' })
            : createMeResponseFixture(clock);
      }
    })();

    // 제출이 끝났으면 어떤 scenario 든 온보딩은 완료다 — 그래야 Guard 가 홈으로 보낸다.
    const onboardingStatus = onboardingState.submitted()
      ? ('completed' as const)
      : fixture.onboardingStatus;

    const merged: MeResponse = {
      ...fixture,
      caregiver: {
        ...fixture.caregiver,
        // `exactOptionalPropertyTypes` — 보낸 필드만 덮어쓴다 (`PATCH` 의미와 같다).
        ...(caregiverPatch.displayName === undefined
          ? {}
          : { displayName: caregiverPatch.displayName }),
        ...(caregiverPatch.relationship === undefined
          ? {}
          : { relationship: caregiverPatch.relationship }),
        ...(caregiverPatch.timezone === undefined ? {} : { timezone: caregiverPatch.timezone }),
      },
      onboardingStatus,
      /*
        아이 참조는 **온보딩 완료 상태의 함수**다. 제출로 완료가 되면 같은 턴에 생긴다.
        반대 방향(완료 → 미완료)은 일어나지 않는다 — fixture 가 `child` 를 담는 경우는
        fixture 자체가 `completed` 일 때뿐이고 그러면 여기도 `completed` 다. 그래서 지우는
        분기를 두지 않는다 (AC-2-13 — 아동 데이터가 온보딩 전 구간에 새지 않는다).
      */
      ...(onboardingStatus === 'completed'
        ? { child: { id: MOCK_CHILD_ID, firstName: childFirstName() } }
        : {}),
    };

    // Mock 도 Http 와 동일하게 경계에서 parse 한다 (Plan §7.3).
    return parseResponse(MeResponseSchema, merged, {
      operation: OPERATION,
      direction: 'response',
    });
  }

  function failure(code: 'INTERNAL_ERROR' | 'AUTH_TOKEN_EXPIRED', message: string): never {
    throw HaruApiError.fromEnvelope(
      buildErrorEnvelope(code, message, { requestId: idFactory.next() }),
    );
  }

  return {
    async get(options: ApiRequestOptions = {}) {
      const scenario = store.resolve(meScenarioGroup);
      const attempt = consumeAttempt(store, meScenarioGroup.group, options.signal);

      // 요청 본문이 없는 GET 이라도 **요청이 나갔다는 사실**을 기록한다 (AC-2-13 전수 검사).
      requestLog?.record(OPERATION);

      switch (scenario) {
        case 'loading':
          return withDelay(timer, ME_LOADING_DELAY_MS, () => respond(scenario), options.signal);

        case 'error':
          return failure('INTERNAL_ERROR', 'Mock me request failed.');

        case 'retry':
          return attempt === 1
            ? failure('INTERNAL_ERROR', 'Mock me request failed.')
            : respond(scenario);

        case 'token-expired':
          // 1회차만 만료. Gateway refresh 후 재시도가 성공한다 (AC-2-07).
          return attempt === 1
            ? failure('AUTH_TOKEN_EXPIRED', 'Mock access token expired.')
            : respond(scenario);

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return respond(scenario);
      }
    },

    /**
     * `PATCH /v1/me` — **보호자 데이터 전용** (D-16). 온보딩 Step 1 이 관계·타임존을 여기로
     * 보낸다. 아동 데이터가 섞여 오면 schema parse 에서 제거되므로, 요청 로그에도 남지 않는다.
     */
    async update(request: UpdateCaregiverRequest, options: ApiRequestOptions = {}) {
      const parsed = parseRequest(UpdateCaregiverRequestSchema, request, {
        operation: UPDATE_OPERATION,
      });

      requestLog?.record(UPDATE_OPERATION, parsed);

      const scenario = store.resolve(meScenarioGroup);
      const attempt = consumeAttempt(store, meScenarioGroup.group, options.signal);

      function commit(): MeResponse {
        caregiverPatch = { ...caregiverPatch, ...parsed };
        return respond(scenario);
      }

      switch (scenario) {
        case 'loading':
          return withDelay(timer, ME_LOADING_DELAY_MS, commit, options.signal);

        case 'error':
          return failure('INTERNAL_ERROR', 'Mock caregiver update failed.');

        case 'retry':
          return attempt === 1
            ? failure('INTERNAL_ERROR', 'Mock caregiver update failed.')
            : commit();

        case 'offline':
          throw new NetworkError('Mock adapter is offline.');

        default:
          return commit();
      }
    },
  };
}
