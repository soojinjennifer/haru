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
export type { HomeApi } from './home-api';
export type { ActivityApi } from './activity-api';
export type { LibraryApi } from './library-api';
export type { SessionApi } from './session-api';
export type { RecordingApi } from './recording-api';
export type { NotificationApi } from './notification-api';
export type { ReflectionApi } from './reflection-api';
export type { AnalysisApi } from './analysis-api';
export type { ChildrenApi, SurveyUpdateSaveOptions } from './children-api';
export type { ProgressApi } from './progress-api';
export type { ReportApi } from './report-api';
export type { ReportPdfApi } from './report-pdf-api';
export type { HighlightClipApi } from './highlight-clip-api';
export {
  isUploadOffsetConflictError,
  UploadOffsetConflictError,
  type UploadPartRequest,
  type UploadPartResult,
  type UploadProgress,
  type UploadTransport,
  type UploadTransportOptions,
} from './upload-transport';
export {
  isHaruApiError,
  isNetworkError,
  NetworkError,
  toErrorEnvelope,
  createImmediateTimer,
  createRealTimer,
} from './helpers';
export type { Timer } from './helpers';
