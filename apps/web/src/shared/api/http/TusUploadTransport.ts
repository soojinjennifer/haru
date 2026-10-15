/**
 * `TusUploadTransport` — `UploadTransport` 의 실제 Adapter **골격** (`API_CONTRACTS` §5.1.1 Rev 8).
 *
 * ⚠ **실제 연동 검증은 전부 `BACKEND_INTEGRATION_PENDING`** 이다 (`RECORDING_UPLOAD_SPEC.md`, Stage 8).
 * 이 파일이 코드로 고정하는 것은 TUS core 1.0.0 의 바이트 전송 규약뿐이다 (외부 라이브러리 없음 —
 * 스택 추가는 승인 사항이다, `rules/frontend.md` §1).
 *
 * 가정 (Backend 확정 필요)
 * - `target.endpoint` 는 서버가 `init` 때 **이미 만든** TUS upload URL 이다 (creation 은 서버 몫).
 * - `target.uploadToken` 은 `Authorization: Bearer` 로 보낸다.
 * - 상태 코드 해석: `401`/`403` → `UPLOAD_TOKEN_EXPIRED`, `404`/`410` → `RECORDING_DELETED`,
 *   `409` → offset 충돌(`UploadOffsetConflictError`). 그 밖의 실패 → `INTERNAL_ERROR`.
 * - `fetch` 는 업로드 진행률을 주지 않는다 — `onProgress` 는 전송이 끝난 뒤 1회 호출된다.
 *
 * 토큰·`objectKey` 를 로그에 남기지 않는다.
 */
import { HaruApiError, type RecordingUploadTarget } from '@haru/contracts';

import { NetworkError } from '../helpers/toErrorEnvelope';
import {
  UploadOffsetConflictError,
  type UploadPartRequest,
  type UploadPartResult,
  type UploadTransport,
  type UploadTransportOptions,
} from '../upload-transport';

export const TUS_VERSION = '1.0.0';

export interface TusUploadTransportOptions {
  fetchImpl?: typeof fetch;
}

function assertHttps(endpoint: string): void {
  if (new URL(endpoint).protocol !== 'https:') {
    throw new Error('Upload endpoint must use https:.');
  }
}

function headersFor(target: RecordingUploadTarget): Headers {
  return new Headers({
    'Tus-Resumable': TUS_VERSION,
    Authorization: `Bearer ${target.uploadToken}`,
  });
}

function failureFor(status: number): HaruApiError {
  if (status === 401 || status === 403) {
    return new HaruApiError('UPLOAD_TOKEN_EXPIRED', 'The upload token is no longer valid.');
  }
  if (status === 404 || status === 410) {
    return new HaruApiError('RECORDING_DELETED', 'The recording is no longer available.');
  }
  return new HaruApiError('INTERNAL_ERROR', 'The upload did not complete.');
}

function readOffset(response: Response): number {
  const raw = response.headers.get('Upload-Offset');
  const value = raw === null ? Number.NaN : Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new HaruApiError('INTERNAL_ERROR', 'The upload server did not report an offset.');
  }
  return value;
}

export function createTusUploadTransport(options: TusUploadTransportOptions = {}): UploadTransport {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  /** objectKey → 진행 중 전송의 취소 수단. */
  const inFlight = new Map<string, AbortController>();

  async function call(
    target: RecordingUploadTarget,
    init: RequestInit,
    signal: AbortSignal | undefined,
  ): Promise<Response> {
    assertHttps(target.endpoint);
    const controller = new AbortController();
    inFlight.set(target.objectKey, controller);
    const combined =
      signal === undefined ? controller.signal : AbortSignal.any([signal, controller.signal]);

    try {
      return await fetchImpl(target.endpoint, { ...init, signal: combined });
    } catch (cause) {
      throw new NetworkError('Upload request failed to reach the server.', { cause });
    } finally {
      inFlight.delete(target.objectKey);
    }
  }

  async function headOffset(
    target: RecordingUploadTarget,
    signal: AbortSignal | undefined,
  ): Promise<number> {
    const response = await call(target, { method: 'HEAD', headers: headersFor(target) }, signal);
    if (!response.ok) throw failureFor(response.status);
    return readOffset(response);
  }

  async function patchFrom(
    request: UploadPartRequest,
    offset: number,
    transport: UploadTransportOptions,
  ): Promise<UploadPartResult> {
    const { target, data } = request;
    const headers = headersFor(target);
    headers.set('Upload-Offset', String(offset));
    headers.set('Content-Type', 'application/offset+octet-stream');

    const response = await call(
      target,
      { method: 'PATCH', headers, body: data.slice(offset) },
      transport.signal,
    );

    if (response.status === 409) {
      throw new UploadOffsetConflictError(await headOffset(target, transport.signal));
    }
    if (!response.ok) throw failureFor(response.status);

    const bytesUploaded = readOffset(response);
    const result: UploadPartResult = {
      partNo: target.partNo,
      bytesUploaded,
      bytesTotal: data.size,
      bytesSent: bytesUploaded - offset,
    };
    transport.onProgress?.(result);
    return result;
  }

  return {
    uploadPart: (request, transport = {}) => patchFrom(request, 0, transport),

    async resume(request, transport = {}) {
      const offset = await headOffset(request.target, transport.signal);
      if (offset >= request.data.size) {
        return {
          partNo: request.target.partNo,
          bytesUploaded: offset,
          bytesTotal: request.data.size,
          bytesSent: 0,
        };
      }
      return patchFrom(request, offset, transport);
    },

    abort(request) {
      inFlight.get(request.target.objectKey)?.abort();
      inFlight.delete(request.target.objectKey);
      return Promise.resolve();
    },
  };
}
