/** Http Adapter 집합 — `app/providers` 의 Adapter 선택 지점에서만 조립한다. */
import type { ApiClients } from '../types';

import { createHttpHealthApi } from './HttpHealthApi';
import { createHttpClient, type HttpClientOptions } from './httpClient';

export { createHttpClient, normalizeBaseUrl, DEFAULT_HTTP_TIMEOUT_MS } from './httpClient';
export type { AuthTokenProvider, HttpClient, HttpClientOptions } from './httpClient';
export { createHttpHealthApi, HEALTH_PATH } from './HttpHealthApi';

export function createHttpApiClients(options: HttpClientOptions): ApiClients {
  const client = createHttpClient(options);

  return {
    health: createHttpHealthApi(client),
  };
}
