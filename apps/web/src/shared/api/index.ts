/**
 * API Client 계층 공개 진입점 — `.claude/rules/frontend.md` §4.
 *
 * ```
 * Component → Query/Mutation hook → <domain>Api interface → Mock<Domain>Api | Http<Domain>Api
 * ```
 *
 * Component 와 Query hook 은 여기(interface · context)만 쓰고, 구체 Adapter 를 직접
 * import 하지 않는다. Adapter 조립은 `app/providers` 한 곳에서만 한다.
 */
export { ApiClientsProvider, useApiClients } from './context';
export type { ApiClientsProviderProps } from './context';
export type { ApiClients } from './types';
export type { ApiRequestOptions, HealthApi } from './health-api';
export type { ApiMutationOptions } from './options';
export type { MeApi } from './me-api';
export type { ConsentApi } from './consent-api';
export type { OnboardingApi } from './onboarding-api';
export type { BooksApi } from './books-api';
export {
  isHaruApiError,
  isNetworkError,
  NetworkError,
  toErrorEnvelope,
  createImmediateTimer,
  createRealTimer,
} from './helpers';
export type { Timer } from './helpers';
