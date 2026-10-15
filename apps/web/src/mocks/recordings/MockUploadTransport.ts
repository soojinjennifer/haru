/**
 * `MockUploadTransport` — part 바이트 전송 Mock (`API_CONTRACTS` §5.1.1 — 이름 변형 금지).
 *
 * TUS core 를 흉내낸다 (`shared/api/upload-transport.ts` 의 의미 그대로):
 *  - `uploadPart` = offset 0 전송. 서버가 이미 바이트를 갖고 있으면 **보내지 않고**
 *    `UploadOffsetConflictError` → 호출자는 `resume` 으로 간다
 *  - `resume` = 서버 offset 조회(HEAD) 후 **그 뒤만** 전송. 끝난 part 는 0 바이트
 *  - `abort` = 진행 중 전송(=`loading` 지연)을 끊는다. 서버가 받은 바이트는 그대로다
 *
 * 바이트는 읽지 않는다 — `Blob.size` 만 쓴다. 서버가 받은 양은 `sessionState` 의 part `offset` 이다.
 *
 * ── scenario (group `recordings` — `MockRecordingApi` 와 같은 그룹, 메서드 `uploadpart`·`resume`·`abort`) ──
 * | key | 전송 동작 |
 * |---|---|
 * | `success` 계열 | 전부 받는다 |
 * | `loading` · `error` · `retry` · `offline` | 공통 (`common/delivery.ts`) |
 * | `recording-upload-failure` · `upload-stalled-48h` | **지속** `NetworkError` — 바이트 0 (AC-4-27 · AC-4-32) |
 * | `upload-retry` | part 마다 **1회** 절반까지 받고 `NetworkError` → `resume` 이 나머지만 받는다 (AC-4-28) |
 * | `upload-token-expired` · `recording-deleted` | `init` 이 준 만료 토큰 → `UPLOAD_TOKEN_EXPIRED` (AC-4-29 · AC-4-33) |
 * | `offline-queued` | 연결 복구 전 `NetworkError` (AC-4-31) |
 * | 폐기된 녹음 (상태) | `RECORDING_DELETED` |
 *
 * **요청 로그** (AC-4-28 · AC-4-29 증거): 호출마다 `TUS PATCH`/`TUS HEAD` 1건을 남기고,
 * `bytes` 에 **이번 호출에서 서버가 실제로 받은 바이트 수**를 적는다. 한 part 의 `bytes` 합이 part
 * 크기와 같으면 중복 업로드가 없다는 뜻이다. 토큰은 남기지 않는다.
 */
import { NetworkError, type Timer } from '../../shared/api/helpers';
import {
  UploadOffsetConflictError,
  type UploadPartRequest,
  type UploadPartResult,
  type UploadTransport,
  type UploadTransportOptions,
} from '../../shared/api/upload-transport';
import type { IdFactory } from '../../shared/lib/idFactory';
import type { MockConnectivity } from '../common/connectivity';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import type { RequestLog } from '../request-log';
import { beginScenarioCall, type ScenarioStore } from '../scenarios';
import type { MockSessionState, MockUploadPartRecord } from '../sessions/sessionState';

import {
  isPersistentUploadFailure,
  RECORDING_LOADING_DELAY_MS,
  recordingScenarioGroup,
  type RecordingScenarioKey,
} from './recordingScenarios';

export const TUS_PATCH_OPERATION = 'TUS PATCH';
export const TUS_HEAD_OPERATION = 'TUS HEAD';
export const TUS_ABORT_OPERATION = 'UploadTransport.abort';

export interface MockUploadTransportDeps {
  store: ScenarioStore;
  idFactory: IdFactory;
  timer: Timer;
  state: MockSessionState;
  connectivity: MockConnectivity;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockUploadTransport(deps: MockUploadTransportDeps): UploadTransport {
  const { store, idFactory, timer, state, connectivity, requestLog } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;
  const group = recordingScenarioGroup.group;
  /** objectKey → 진행 중 전송의 취소 수단 (`abort`). */
  const inFlight = new Map<string, AbortController>();

  /** 대상 part 를 찾고 서버 규칙(삭제 · 토큰 · 크기)을 검사한다. */
  function locate(request: UploadPartRequest): MockUploadPartRecord {
    const recordingId = state.objects.get(request.target.objectKey);
    const recording = recordingId === undefined ? undefined : state.recordings.get(recordingId);
    const part = recording?.parts.get(request.target.partNo);
    if (recording === undefined || part === undefined) {
      return fail('RESOURCE_NOT_FOUND', 'Unknown upload target.');
    }
    if (recording.uploadStatus === 'deleted') {
      return fail('RECORDING_DELETED', 'This recording is no longer available.');
    }
    if (part.tokenExpired || part.uploadToken !== request.target.uploadToken) {
      return fail('UPLOAD_TOKEN_EXPIRED', 'The upload token is no longer valid.');
    }
    if (request.data.size !== part.bytes) {
      return fail('VALIDATION_FAILED', 'The part size does not match what was declared.');
    }
    return part;
  }

  /** `from` 부터 끝까지 받는다. scenario 에 따라 중간에 끊긴다. 받은 바이트 수를 돌려준다. */
  function transfer(
    part: MockUploadPartRecord,
    from: number,
    scenario: RecordingScenarioKey,
    received: { bytes: number },
  ): void {
    if (isPersistentUploadFailure(scenario)) {
      throw new NetworkError('Mock upload failed.');
    }

    if (scenario === 'upload-retry' && !part.failedOnce) {
      part.failedOnce = true;
      const half = from + Math.floor((part.bytes - from) / 2);
      received.bytes = half - from;
      part.offset = half;
      throw new NetworkError('Mock upload was interrupted.');
    }

    received.bytes = part.bytes - from;
    part.offset = part.bytes;
  }

  function result(part: MockUploadPartRecord, bytesSent: number): UploadPartResult {
    return {
      partNo: part.partNo,
      bytesUploaded: part.offset,
      bytesTotal: part.bytes,
      bytesSent,
    };
  }

  async function send(
    method: 'uploadPart' | 'resume',
    request: UploadPartRequest,
    options: UploadTransportOptions,
  ): Promise<UploadPartResult> {
    const { objectKey, partNo } = request.target;
    const { scenario, attempt } = beginScenarioCall(
      store,
      recordingScenarioGroup,
      method,
      options.signal,
    );

    const controller = new AbortController();
    inFlight.set(objectKey, controller);
    const signal =
      options.signal === undefined
        ? controller.signal
        : AbortSignal.any([options.signal, controller.signal]);

    /** `from` = PATCH 를 보낸 offset (`null` 이면 PATCH 까지 가지 않았다), `bytes` = 서버가 받은 양. */
    const received: { from: number | null; bytes: number } = { from: null, bytes: 0 };

    const run = (): UploadPartResult => {
      if (scenario === 'offline-queued' && !connectivity.isOnline()) {
        throw new NetworkError('Mock adapter is offline (queued).');
      }

      if (method === 'resume') {
        // HEAD 는 서버에 닿은 요청이다 — 토큰이 만료돼 거절돼도 기록한다.
        requestLog?.record(TUS_HEAD_OPERATION, { partNo });
        const part = locate(request);
        if (part.offset >= part.bytes) return result(part, 0);
        received.from = part.offset;
        transfer(part, part.offset, scenario, received);
        const done = result(part, received.bytes);
        options.onProgress?.(done);
        return done;
      }

      // uploadPart = offset 0 PATCH. 거절(토큰 만료 등)도 서버에 닿은 PATCH 다.
      received.from = 0;
      const part = locate(request);
      if (part.offset > 0) throw new UploadOffsetConflictError(part.offset);

      transfer(part, 0, scenario, received);
      const done = result(part, received.bytes);
      options.onProgress?.(done);
      return done;
    };

    try {
      return await deliver({
        scenario,
        attempt,
        delayMs: RECORDING_LOADING_DELAY_MS,
        run,
        message: 'Mock upload failed.',
        errorCode: resolveErrorCode(deps.errorCodes, group, method),
        signal,
        timer,
        failure,
      });
    } finally {
      inFlight.delete(objectKey);
      if (received.from !== null) {
        requestLog?.record(TUS_PATCH_OPERATION, {
          partNo,
          offset: received.from,
          bytes: received.bytes,
        });
      }
    }
  }

  return {
    uploadPart: (request, options = {}) => send('uploadPart', request, options),
    resume: (request, options = {}) => send('resume', request, options),

    abort(request) {
      requestLog?.record(TUS_ABORT_OPERATION, { partNo: request.target.partNo });
      inFlight.get(request.target.objectKey)?.abort();
      inFlight.delete(request.target.objectKey);
      return Promise.resolve();
    },
  };
}
