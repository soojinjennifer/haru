/**
 * `HttpAccountApi` — 탈퇴 endpoint 의 Http Adapter **골격** (Stage 1 `D-7`, Stage 8 Rev 12 `C8-4` · `C8-9`).
 *
 * 실제 연동(계정 + 전체 데이터 삭제 · 토큰 폐기 · auth user 삭제 · 법정 보관분 가명화)은 `BACKEND_INTEGRATION_PENDING`
 * 이다 (`P8-BIP-03`). 여기에서 고정하는 규약: ① **`Idempotency-Key` 필수** ② 요청(`confirmation` literal `true` ·
 * `.strict()`) · 응답(`DeletionRequest`) contracts parse.
 */
import {
  DeleteAccountRequestSchema,
  DeletionRequestSchema,
  type DeleteAccountRequest,
} from '@haru/contracts';

import type { AccountApi } from '../account-api';
import type { ApiMutationOptions } from '../options';

import type { HttpClient } from './httpClient';
import { ME_PATH } from './HttpMeApi';

export function createHttpAccountApi(client: HttpClient): AccountApi {
  return {
    deleteAccount: (request: { body: DeleteAccountRequest }, options: ApiMutationOptions) =>
      client.request({
        method: 'DELETE',
        path: ME_PATH,
        body: DeleteAccountRequestSchema.parse(request.body),
        schema: DeletionRequestSchema,
        idempotencyKey: options.idempotencyKey,
        signal: options.signal,
      }),
  };
}
