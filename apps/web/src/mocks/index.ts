/**
 * Mock Adapter 집합 — **`http` 빌드에서 완전히 제거되어야 하는 모듈 그래프의 뿌리** (Plan §16 D-6).
 *
 * `app/providers/apiClients.ts` 가 `import.meta.env.VITE_API_MODE === 'mock'` 일 때만
 * 이 모듈을 동적 import 한다. `http` 빌드에서는 그 비교가 `"http" === "mock"` 으로
 * 상수 접혀 도달 불가능해지고, Rollup 이 `src/mocks/**` 전체를 산출물에서 지운다.
 *
 * 아래 sentinel 은 그 사실을 **기계적으로** 증명하기 위한 표식이다.
 * `pnpm assert:no-mocks` 가 `apps/web/dist/**` 에서 이 문자열을 찾아 1건이라도 나오면 실패한다
 * (AC-1-42).
 */
import { createRealTimer, type Timer } from '../shared/api/helpers';
import type { ApiClients } from '../shared/api/types';
import { createFixedClock, type Clock } from '../shared/lib/clock';
import { createSeededIdFactory, type IdFactory } from '../shared/lib/idFactory';

import type { AuthGateway } from '../shared/auth';

import { createMockActivityApi } from './activities/MockActivityApi';
import { createMockAuthGateway } from './auth/MockAuthGateway';
import { createMockBooksApi } from './books/MockBooksApi';
import { createMockConsentApi } from './consent/MockConsentApi';
import { createMockConsentState, type MockConsentState } from './consent/consentState';
import { createMockHealthApi } from './health/MockHealthApi';
import { createMockHomeApi } from './home/MockHomeApi';
import { createMockLibraryApi } from './library/MockLibraryApi';
import { createMockMeApi } from './me/MockMeApi';
import { createMockOnboardingApi } from './onboarding/MockOnboardingApi';
import { createMockOnboardingState, type MockOnboardingState } from './onboarding/onboardingState';
import { createRequestLog, type RequestLog } from './request-log';
import {
  createScenarioStoreFrom,
  readScenarioPanelValue,
  type ScenarioStore,
  type ScenarioStoreInput,
} from './scenarios';

/** 빌드 산출물 검증용 표식 (`scripts/assert-no-mocks.mjs`). 값을 바꾸면 스크립트도 함께 바꾼다. */
export const __HARU_MOCK_SENTINEL__ = '__HARU_MOCK_SENTINEL__';

/**
 * Mock 의 고정 기준 시각 — 2026-01-01T00:00:00Z.
 * 모든 fixture 시각이 여기에서 나오므로 응답 바이트가 실행 시점과 무관하게 같다.
 */
export const MOCK_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

/** `idFactory` seed. scenario 와 무관하게 호출 순서만으로 ID 가 결정된다. */
export const MOCK_ID_SEED = 'haru-mock';

export interface MockApiClientsOptions extends ScenarioStoreInput {
  /** 이미 만들어진 store 를 주입한다 (테스트에서 scenario 를 직접 지정할 때). */
  store?: ScenarioStore;
  clock?: Clock;
  idFactory?: IdFactory;
  /** 기본은 실제 지연(`createRealTimer`). 테스트는 `createImmediateTimer()` 를 넣는다. */
  timer?: Timer;
  /**
   * 요청 로그 수집기 (Privacy 불변식 AC-2-13 증거). 주지 않으면 새로 만든다.
   * 번들에는 `mock` 빌드에서만 들어간다 (AC-2-55).
   */
  requestLog?: RequestLog;
  /**
   * `MockConsentApi`(쓰기)와 `MockMeApi`(읽기)가 공유하는 동의 상태.
   * 주지 않으면 번들마다 새로 만든다 — 테스트 간 상태가 새지 않는다.
   */
  consentState?: MockConsentState;
  /**
   * `MockOnboardingApi`(쓰기)와 `MockMeApi`(읽기)가 공유하는 온보딩 상태.
   * 주지 않으면 번들마다 새로 만든다 — 테스트 간 상태가 새지 않는다.
   */
  onboardingState?: MockOnboardingState;
}

export interface MockApiClientsBundle {
  clients: ApiClients;
  store: ScenarioStore;
  /** `AuthGateway` 는 HTTP API 가 아니므로 `clients` 와 분리해 제공한다 (Plan §5.2). */
  authGateway: AuthGateway;
  /** 이 번들이 기록한 모든 요청 (AC-2-13 전수 검사용). */
  requestLog: RequestLog;
  /** 기록된 동의 (테스트가 "동의 전/후" 를 구분할 때 쓴다). */
  consentState: MockConsentState;
  /** 온보딩 진행·제출 상태 (테스트가 "제출 전/후" 를 구분할 때 쓴다). */
  onboardingState: MockOnboardingState;
  /**
   * sentinel 을 **실제로 사용하는** 자리. 이 참조가 없으면 Rollup 이
   * `mock` 빌드에서도 상수를 tree-shaking 으로 지워 버려서
   * `pnpm assert:no-mocks` 가 무엇도 검출하지 못하는 헛된 검사가 된다.
   */
  sentinel: string;
}

/** Adapter 집합 + store 를 함께 만든다 (dev Scenario Panel 이 store 를 필요로 한다). */
export function createMockApiClientsBundle(
  options: MockApiClientsOptions = {},
): MockApiClientsBundle {
  const store =
    options.store ??
    createScenarioStoreFrom({
      search: options.search,
      panelValue: options.panelValue,
      envValue: options.envValue,
    });

  const clock = options.clock ?? createFixedClock(MOCK_EPOCH_MS);
  const idFactory = options.idFactory ?? createSeededIdFactory(MOCK_ID_SEED);
  const timer = options.timer ?? createRealTimer();
  const requestLog = options.requestLog ?? createRequestLog();
  const consentState = options.consentState ?? createMockConsentState();
  const onboardingState = options.onboardingState ?? createMockOnboardingState();
  const deps = { store, clock, idFactory, timer, requestLog };

  return {
    store,
    requestLog,
    consentState,
    onboardingState,
    sentinel: __HARU_MOCK_SENTINEL__,
    authGateway: createMockAuthGateway(deps),
    clients: {
      health: createMockHealthApi({ store, clock, idFactory, timer }),
      me: createMockMeApi({ ...deps, consentState, onboardingState }),
      consents: createMockConsentApi({ ...deps, consentState }),
      onboarding: createMockOnboardingApi({ ...deps, consentState, onboardingState }),
      books: createMockBooksApi(deps),
      home: createMockHomeApi(deps),
      activities: createMockActivityApi(deps),
      library: createMockLibraryApi(deps),
    },
  };
}

export function createMockApiClients(options: MockApiClientsOptions = {}): ApiClients {
  return createMockApiClientsBundle(options).clients;
}

/**
 * 브라우저 환경(URL · sessionStorage · 빌드 기본값)에서 Mock 을 조립한다.
 *
 * `clock` 은 조립 지점이 넘길 수 있다. **기본값은 `MOCK_EPOCH_MS` 고정 시계**이며 브라우저도
 * 그대로 쓴다 — 응답 바이트가 실행 시점과 무관하게 같아야 한다 (AC-1-39).
 *
 * 그 결과 Mock 데모의 Activity Card 날짜는 **2026-01-01** 이지만 **화면에 전혀 노출되지 않는다** —
 * `AC-3-11`(지난 날짜 안내 배너)이 폐기되면서 날짜를 표시하는 자리가 사라졌다
 * (approvals §12.8, audit §16.7 ⓐ). `D-10`(서버 `date` 를 그대로 신뢰, 클라이언트 재판정 금지)은
 * 그대로 유지된다.
 */
export function createBrowserMockApiClients(
  envValue: string | undefined,
  clock?: Clock,
): MockApiClientsBundle {
  return createMockApiClientsBundle({
    search: globalThis.location?.search ?? '',
    panelValue: readScenarioPanelValue(),
    envValue,
    ...(clock === undefined ? {} : { clock }),
  });
}

export {
  createMockAuthGateway,
  authScenarioGroup,
  AUTH_SCENARIO_KEYS,
  AUTH_LOADING_DELAY_MS,
} from './auth/MockAuthGateway';
export type { AuthScenarioKey } from './auth/MockAuthGateway';
export {
  createMockMeApi,
  meScenarioGroup,
  ME_SCENARIO_KEYS,
  ME_LOADING_DELAY_MS,
} from './me/MockMeApi';
export type { MeScenarioKey } from './me/MockMeApi';
export {
  createMockConsentApi,
  consentScenarioGroup,
  CONSENT_SCENARIO_KEYS,
  CONSENT_LOADING_DELAY_MS,
} from './consent/MockConsentApi';
export type { ConsentScenarioKey } from './consent/MockConsentApi';
export { createMockConsentState } from './consent/consentState';
export type { MockConsentState } from './consent/consentState';
export {
  createMockOnboardingApi,
  onboardingScenarioGroup,
  ONBOARDING_SCENARIO_KEYS,
  ONBOARDING_LOADING_DELAY_MS,
} from './onboarding/MockOnboardingApi';
export type { OnboardingScenarioKey } from './onboarding/MockOnboardingApi';
export { createMockOnboardingState } from './onboarding/onboardingState';
export type { MockOnboardingState } from './onboarding/onboardingState';
export {
  createMockBooksApi,
  booksScenarioGroup,
  BOOKS_SCENARIO_KEYS,
  BOOKS_LOADING_DELAY_MS,
} from './books/MockBooksApi';
export type { BooksScenarioKey } from './books/MockBooksApi';
export {
  createMockHomeApi,
  homeScenarioGroup,
  HOME_SCENARIO_KEYS,
  HOME_LOADING_DELAY_MS,
} from './home/MockHomeApi';
export type { HomeScenarioKey } from './home/MockHomeApi';
export {
  createMockActivityApi,
  activityScenarioGroup,
  ACTIVITY_SCENARIO_KEYS,
  ACTIVITY_LOADING_DELAY_MS,
} from './activities/MockActivityApi';
export type { ActivityScenarioKey } from './activities/MockActivityApi';
export {
  createMockLibraryApi,
  libraryScenarioGroup,
  LIBRARY_SCENARIO_KEYS,
  LIBRARY_LOADING_DELAY_MS,
  LIBRARY_OVERVIEW_LOADING_DELAY_MS,
} from './library/MockLibraryApi';
export type { LibraryScenarioKey } from './library/MockLibraryApi';
export {
  createAddedBookFixture,
  createGiftRequestFixture,
  createGiftRequestListFixture,
  createLibraryListFixture,
  createLibraryOverviewFixture,
  findLibraryBook,
  LIBRARY_LIST_NEXT_CURSOR,
  SHELF_BOOKS,
} from './fixtures/library';
export type { LibraryListFixtureOptions, LibraryOverviewShape } from './fixtures/library';
export { DECK_BOOKS, findDeckBook, resolveSaveTarget } from './fixtures/saved-books';
export { createActivityCardFixture, MOCK_ACTIVITY_CARD_ID } from './fixtures/activity-cards';
export type { ActivityDeckShape } from './fixtures/activity-cards';
export {
  createPromptPreviewFixture,
  createPromptSetFixture,
  MOCK_CARD_PROMPTS,
} from './fixtures/prompt-sets';
export { createHomeSummaryFixture, MOCK_ACTIVE_SESSION_ID } from './fixtures/home';
export {
  createOnboardingInstrumentFixture,
  createOnboardingStateFixture,
  createResumeDraftAnswers,
  MOCK_BASELINE_VERSION,
  MOCK_RESUME_STEP,
} from './fixtures/onboarding';
export type { OnboardingStateFixtureOptions } from './fixtures/onboarding';
export { createProfileResultFixture } from './fixtures/profile-result';
export type { ProfileResultFixtureOptions } from './fixtures/profile-result';
export {
  createBookSearchFixture,
  createEmptyBookSearchFixture,
  MOCK_BOOKS,
} from './fixtures/books';
export {
  createConsentDocumentsFixture,
  createConsentDocumentFixture,
  MOCK_CONSENT_VERSION,
  MOCK_CONSENT_VERSION_UPDATED,
  MOCK_REQUIRED_CONSENT_TYPES,
} from './fixtures/consent';
export type { ConsentDocumentSetName } from './fixtures/consent';
export {
  createRequestLog,
  findChildDataKeys,
  redactSecrets,
  CHILD_DATA_KEYS,
  REDACTED,
} from './request-log';
export type { RequestLog, RequestLogEntry } from './request-log';
export { createAuthSessionFixture, MOCK_SESSION_TTL_MS } from './fixtures/auth';
export {
  createMeResponseFixture,
  MOCK_CAREGIVER_ID,
  MOCK_CAREGIVER_DISPLAY_NAME,
  MOCK_CHILD_FIRST_NAME,
  MOCK_CHILD_ID,
  MOCK_REQUIRED_CONSENTS,
  MOCK_TIMEZONE,
} from './fixtures/me';
export {
  createMockHealthApi,
  healthScenarioGroup,
  HEALTH_SCENARIO_KEYS,
  HEALTH_LOADING_DELAY_MS,
} from './health/MockHealthApi';
export type { HealthScenarioKey } from './health/MockHealthApi';
export { createHealthResponseFixture, MOCK_API_VERSION } from './fixtures/health';
export * from './scenarios';
