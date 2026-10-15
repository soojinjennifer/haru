/**
 * `recordingApi` — Recording Upload Contract (`docs/API_CONTRACTS.md` §3.3 · §3.9 · §4 Stage 4 · §5.1.1).
 *
 * 메서드는 §5.1.1 이 고정한 **4개**다 — `init` · `refreshTokens` · `complete` · `status`.
 * ⛔ `abort()` 를 두지 않는다: 폐기는 `sessionApi.transition({ to: 'abandoned' })` 하나이며 서버가
 * part 를 스스로 정리한다 (`P4-BIP-21`). 바이트 전송 취소는 **다른 층**의 `UploadTransport.abort` 다.
 *
 * | 호출 | endpoint | Idempotency-Key | 주요 오류 |
 * |---|---|---|---|
 * | `init` | `POST /v1/sessions/:sessionId/recordings` | **필수** (CG) | `CONSENT_REQUIRED` · `RECORDING_NOT_ALLOWED_FOR_MODE` · `SESSION_INVALID_TRANSITION` |
 * | `refreshTokens` | `POST /v1/recordings/:recordingId/upload-tokens` | **필수** (CG) | `RECORDING_DELETED` |
 * | `complete` | `POST /v1/recordings/:recordingId/complete` | **필수** (CG) | `RECORDING_INCOMPLETE` · `UPLOAD_TOKEN_EXPIRED` |
 * | `status` | `GET /v1/recordings/:recordingId` ⚠ | — | `RESOURCE_NOT_FOUND` · `RECORDING_DELETED` · `FORBIDDEN` |
 *
 * ⚠ `status` 의 경로는 §4 Stage 4 endpoint 표에 **없다** (§5.1.1 이 메서드만 선언했다).
 * Http 골격은 `GET /v1/recordings/:recordingId` 를 쓴다 — Handoff 확정 대상 (`docs/qa/stage-4a-handoff.md` `S4-C`).
 *
 * 로컬 녹음 삭제 시점: **`complete` 성공 응답을 받은 뒤**에만 지운다 (`rules/architecture.md` §7).
 */
import type {
  RecordingStatus,
  RecordingUploadCompleteRequest,
  RecordingUploadCompleteResponse,
  RecordingUploadInitRequest,
  RecordingUploadInitResponse,
  RefreshUploadTokensRequest,
} from '@haru/contracts';

import type { ApiRequestOptions } from './health-api';
import type { ApiMutationOptions } from './options';

export interface RecordingApi {
  init(
    request: { sessionId: string; body: RecordingUploadInitRequest },
    options: ApiMutationOptions,
  ): Promise<RecordingUploadInitResponse>;
  /** 만료된 업로드 토큰 재발급. 응답은 `init` 과 같은 모양이다. */
  refreshTokens(
    request: { recordingId: string; body: RefreshUploadTokensRequest },
    options: ApiMutationOptions,
  ): Promise<RecordingUploadInitResponse>;
  complete(
    request: { recordingId: string; body: RecordingUploadCompleteRequest },
    options: ApiMutationOptions,
  ): Promise<RecordingUploadCompleteResponse>;
  status(request: { recordingId: string }, options?: ApiRequestOptions): Promise<RecordingStatus>;
}
