/** Http Adapter 집합 — `app/providers` 의 Adapter 선택 지점에서만 조립한다. */
import type { ApiClients } from '../types';

import { createHttpActivityApi } from './HttpActivityApi';
import { createHttpBooksApi } from './HttpBooksApi';
import { createHttpConsentApi } from './HttpConsentApi';
import { createHttpHealthApi } from './HttpHealthApi';
import { createHttpHomeApi } from './HttpHomeApi';
import { createHttpLibraryApi } from './HttpLibraryApi';
import { createHttpMeApi } from './HttpMeApi';
import { createHttpOnboardingApi } from './HttpOnboardingApi';
import { createHttpClient, type HttpClientOptions } from './httpClient';

export { createHttpClient, normalizeBaseUrl, DEFAULT_HTTP_TIMEOUT_MS } from './httpClient';
export type { AuthTokenProvider, HttpClient, HttpClientOptions } from './httpClient';
export { createHttpHealthApi, HEALTH_PATH } from './HttpHealthApi';
export { createHttpMeApi, ME_PATH } from './HttpMeApi';
export { createHttpConsentApi, CONSENT_DOCUMENTS_PATH, CONSENTS_PATH } from './HttpConsentApi';
export {
  createHttpOnboardingApi,
  onboardingStepPath,
  ONBOARDING_PATH,
  ONBOARDING_SUBMIT_PATH,
} from './HttpOnboardingApi';
export { createHttpBooksApi, booksSearchPath, BOOKS_SEARCH_PATH } from './HttpBooksApi';
export { createHttpHomeApi, homePath } from './HttpHomeApi';
export {
  createHttpActivityApi,
  todayActivityCardPath,
  activityCardSelectionPath,
} from './HttpActivityApi';
export { createHttpLibraryApi, savedBooksPath, savedBookPath } from './HttpLibraryApi';

export function createHttpApiClients(options: HttpClientOptions): ApiClients {
  const client = createHttpClient(options);

  return {
    health: createHttpHealthApi(client),
    me: createHttpMeApi(client),
    consents: createHttpConsentApi(client),
    onboarding: createHttpOnboardingApi(client),
    books: createHttpBooksApi(client),
    home: createHttpHomeApi(client),
    activities: createHttpActivityApi(client),
    library: createHttpLibraryApi(client),
  };
}
