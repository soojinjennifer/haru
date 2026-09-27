/**
 * `HttpConsentApi` — 동의 endpoint 2종의 Http Adapter 골격 (Plan §16 D-7).
 *
 * 실제 Backend 연동 검증은 `BACKEND_INTEGRATION_PENDING` (P2-BIP-03 · P2-BIP-04 · P2-BIP-11) 이다.
 * 여기에서 코드로 고정하는 규약은 세 가지다.
 *   ① `GET /v1/consent-documents/current` 는 **공개 endpoint** (`auth: false`)
 *   ② `POST /v1/consents` 는 인증 필요 + `Idempotency-Key` 필수
 *   ③ 응답은 contracts schema 로 parse 한다
 */
import { ConsentStatusSchema, CurrentConsentDocumentsSchema } from '@haru/contracts';
import type { RecordConsentsRequest } from '@haru/contracts';

import type { ApiRequestOptions } from '../health-api';
import type { ApiMutationOptions } from '../options';
import type { ConsentApi } from '../consent-api';

import type { HttpClient } from './httpClient';

export const CONSENT_DOCUMENTS_PATH = '/consent-documents/current';
export const CONSENTS_PATH = '/consents';

export function createHttpConsentApi(client: HttpClient): ConsentApi {
  return {
    getCurrentDocuments: (options: ApiRequestOptions = {}) =>
      client.request({
        method: 'GET',
        path: CONSENT_DOCUMENTS_PATH,
        schema: CurrentConsentDocumentsSchema,
        auth: false,
        signal: options.signal,
      }),

    record: (request: RecordConsentsRequest, options: ApiMutationOptions) =>
      client.request({
        method: 'POST',
        path: CONSENTS_PATH,
        schema: ConsentStatusSchema,
        body: request,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),
  };
}
