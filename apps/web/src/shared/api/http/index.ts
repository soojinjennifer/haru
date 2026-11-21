/** Http Adapter 집합 — `app/providers` 의 Adapter 선택 지점에서만 조립한다. */
import type { ApiClients } from '../types';

import { createHttpAccountApi } from './HttpAccountApi';
import { createHttpActivityApi } from './HttpActivityApi';
import { createHttpAnalysisApi } from './HttpAnalysisApi';
import { createHttpBooksApi } from './HttpBooksApi';
import { createHttpChildrenApi } from './HttpChildrenApi';
import { createHttpConsentApi } from './HttpConsentApi';
import { createHttpDataManagementApi } from './HttpDataManagementApi';
import { createHttpHealthApi } from './HttpHealthApi';
import { createHttpHighlightClipApi } from './HttpHighlightClipApi';
import { createHttpHomeApi } from './HttpHomeApi';
import { createHttpLibraryApi } from './HttpLibraryApi';
import { createHttpMeApi } from './HttpMeApi';
import { createHttpNotificationApi } from './HttpNotificationApi';
import { createHttpOnboardingApi } from './HttpOnboardingApi';
import { createHttpProgressApi } from './HttpProgressApi';
import { createHttpRecordingApi } from './HttpRecordingApi';
import { createHttpReflectionApi } from './HttpReflectionApi';
import { createHttpReportApi } from './HttpReportApi';
import { createHttpReportPdfApi } from './HttpReportPdfApi';
import { createHttpSessionApi } from './HttpSessionApi';
import { createHttpClient, type HttpClientOptions } from './httpClient';
import { createTusUploadTransport } from './TusUploadTransport';

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
export {
  childSessionsPath,
  createHttpSessionApi,
  sessionPath,
  sessionTransitionsPath,
  SESSIONS_PATH,
} from './HttpSessionApi';
export { createHttpRecordingApi, recordingPath, sessionRecordingsPath } from './HttpRecordingApi';
export {
  createHttpNotificationApi,
  NOTIFICATION_PREFERENCES_PATH,
  PUSH_DEVICES_PATH,
  pushDevicePath,
} from './HttpNotificationApi';
export { createTusUploadTransport, TUS_VERSION } from './TusUploadTransport';
export { createHttpReflectionApi, sessionReflectionPath } from './HttpReflectionApi';
export { createHttpAnalysisApi, sessionAnalysisPath } from './HttpAnalysisApi';
export {
  childGrowthCapabilityPath,
  childPath,
  childProfilePath,
  createHttpChildrenApi,
  surveyUpdatePath,
  surveyUpdateStepPath,
  surveyUpdateSubmitPath,
} from './HttpChildrenApi';
export { createHttpProgressApi, weeklyProgressPath } from './HttpProgressApi';
export {
  childReportsPath,
  createHttpReportApi,
  reportOverviewPath,
  reportPath,
  reportViewedPath,
  REPORTS_PATH,
} from './HttpReportApi';
export { createHttpReportPdfApi, reportPdfPath } from './HttpReportPdfApi';
export { createHttpHighlightClipApi, highlightClipPlaybackPath } from './HttpHighlightClipApi';
export {
  createHttpDataManagementApi,
  DATA_DELETION_REQUESTS_PATH,
  DATA_MANAGEMENT_PATH,
  dataDeletionRequestPath,
  recordingSessionsPath,
  sessionRecordingPath,
} from './HttpDataManagementApi';
export { createHttpAccountApi } from './HttpAccountApi';

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
    sessions: createHttpSessionApi(client),
    recordings: createHttpRecordingApi(client),
    uploadTransport: createTusUploadTransport(
      options.fetchImpl === undefined ? {} : { fetchImpl: options.fetchImpl },
    ),
    notifications: createHttpNotificationApi(client),
    reflections: createHttpReflectionApi(client),
    analysis: createHttpAnalysisApi(client),
    children: createHttpChildrenApi(client),
    progress: createHttpProgressApi(client),
    reports: createHttpReportApi(client),
    reportPdf: createHttpReportPdfApi(client),
    highlightClips: createHttpHighlightClipApi(client),
    dataManagement: createHttpDataManagementApi(client),
    account: createHttpAccountApi(client),
  };
}
