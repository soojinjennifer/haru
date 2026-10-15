/**
 * `UploadTransport` — part 바이트 전송 (`docs/API_CONTRACTS.md` §5.1.1, Rev 8).
 *
 * | 구현 | 위치 |
 * |---|---|
 * | `MockUploadTransport` | `src/mocks/recordings/MockUploadTransport.ts` |
 * | `TusUploadTransport` (골격) | `shared/api/http/TusUploadTransport.ts` — 실제 연동 `BACKEND_INTEGRATION_PENDING` |
 *
 * 메서드 이름 3개(`uploadPart` · `resume` · `abort`)는 §5.1.1 이 고정했다. 인자·반환은 **`S4-C` 초안**이며
 * `S4-E`(`UploadQueue`)가 실제로 쓰면서 확정한다. 근거 = `S4-A` spike: part 1개 = 연속 녹음 구간
 * (청크 수백~천 개를 이어 붙인 Blob), 재개 = **서버가 가진 offset 뒤부터** 보내는 것 (TUS).
 *
 * 의미 (TUS core 와 같다)
 * - `uploadPart` — **처음부터**(offset 0) 보낸다. 서버가 이미 바이트를 갖고 있으면 보내지 않고
 *   `UploadOffsetConflictError` 를 던진다 (TUS `409 Conflict`). → 호출자는 `resume` 으로 넘어간다.
 *   이 규칙 덕분에 **재전송이 중복 업로드를 만들지 않는다** (AC-4-28).
 * - `resume` — 서버 offset 을 조회(TUS `HEAD`)하고 **그 뒤만** 보낸다. 이미 끝난 part 는 0 바이트로 끝난다.
 * - `abort` — 진행 중인 바이트 전송을 끊는다. 서버에 올라간 바이트를 지우는 것이 **아니다**
 *   (폐기는 세션 전이 `abandoned` 로 서버가 정리한다 — `P4-BIP-21`).
 *
 * 오류: 토큰 만료 → `HaruApiError('UPLOAD_TOKEN_EXPIRED')` · 폐기·삭제된 녹음 → `RECORDING_DELETED` ·
 * 전송 실패 → `NetworkError` · offset 충돌 → `UploadOffsetConflictError`.
 *
 * 토큰(`target.uploadToken`)은 로그에 남기지 않는다 (`RecordingUploadTargetSchema` 주석).
 */
import type { RecordingUploadTarget } from '@haru/contracts';

export interface UploadPartRequest {
  /** `recordingApi.init`/`refreshTokens` 가 준 대상 1개. */
  target: RecordingUploadTarget;
  /** part 전체 바이트 (연속 녹음 구간 1개). */
  data: Blob;
}

export interface UploadProgress {
  partNo: number;
  /** 서버가 가진 바이트 수 (= 다음 offset). */
  bytesUploaded: number;
  bytesTotal: number;
}

export interface UploadPartResult extends UploadProgress {
  /** 이번 호출이 실제로 보낸 바이트 수. 이미 끝난 part 를 `resume` 하면 0 이다. */
  bytesSent: number;
}

export interface UploadTransportOptions {
  signal?: AbortSignal | undefined;
  onProgress?: ((progress: UploadProgress) => void) | undefined;
}

export interface UploadTransport {
  uploadPart(
    request: UploadPartRequest,
    options?: UploadTransportOptions,
  ): Promise<UploadPartResult>;
  resume(request: UploadPartRequest, options?: UploadTransportOptions): Promise<UploadPartResult>;
  abort(request: { target: RecordingUploadTarget }): Promise<void>;
}

/**
 * offset 0 업로드를 시도했는데 서버가 이미 바이트를 갖고 있다 (TUS `409`).
 * contracts Error Code 가 아니다 — 전송 계층 프로토콜 사실이며 API Error Envelope 이 없다.
 */
export class UploadOffsetConflictError extends Error {
  override readonly name = 'UploadOffsetConflictError';

  readonly serverOffset: number;

  constructor(serverOffset: number) {
    super('The server already holds bytes for this part. Resume from its offset.');
    this.serverOffset = serverOffset;
  }
}

export function isUploadOffsetConflictError(value: unknown): value is UploadOffsetConflictError {
  return value instanceof UploadOffsetConflictError;
}
