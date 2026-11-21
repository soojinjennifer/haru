/**
 * 로컬 녹음 seed — `crash-recovered` · `local-retention-exceeded` (Stage 4 `S4-E`) · ⭐ `local-retention-notice` ·
 * `upload-stalled-48h` (Stage 4b `S4-H3`, `D4-123` — 브라우저 데모·e2e 재현).
 *
 * **가상 데이터**다: 바이트는 `MockRecorderAdapter` 와 같은 규칙(`seq` 로 채운 고정 길이)이며 사람 음성이 아니다.
 * seed 는 저장소의 **공개 쓰기 경로**(`beginPart` · `appendChunk` · `endPart` · `markCompleted`)로만 넣는다 —
 * 레코드 내부 모양을 여기서 다시 쓰지 않는다 (아래 `LocalRecordingSeedTarget` 은 그 경로의 구조 타입).
 *
 * ⚠️ seed 하는 세션은 **Mock 서버에도 있어야** 업로드·전이가 성공한다. 그래서 세션 id 를 인자로 받는다 —
 * 테스트는 `MockSessionApi` 로 세션을 만든 뒤 그 id 로 seed 한다. 브라우저 조립(scenario → seed)은
 * `mocks/recorder/deviceSeed.ts` (`D4-123`) — 서버 세션을 함께 넣는다.
 *
 * ⚠️ 예외 1건 — `seedStalledUpload` 는 **업로드 큐 항목**을 `kv` 에 직접 쓴다. 큐에는 "적재 시각" 을 정하는 공개
 * 경로가 없다(적재 = 지금). 항목 모양은 `UploadQueueEntry` 타입으로 묶어 tsc 가 큐와 일치를 검사한다.
 */
import type { CompletedReason, RecordingContainer } from '@haru/contracts';

import type { UploadQueueEntry } from '../../features/recording';
import type { Clock } from '../../shared/lib/clock';
import type { LocalKeyValueStore } from '../../shared/platform/recording-storage';
import {
  MOCK_RECORDER_CHUNK_BYTES,
  MOCK_RECORDER_MIME_TYPE,
} from '../platform/MockRecorderAdapter';

/** seed 대상 — `LocalRecordingStore` 의 쓰기 경로 (구조 타입). */
export interface LocalRecordingSeedTarget {
  beginPart(part: { sessionId: string; partNo: number; startedAtMs: number }): Promise<void>;
  appendChunk(chunk: {
    sessionId: string;
    partNo: number;
    seq: number;
    bytes: Uint8Array;
    mimeType: string;
    container: RecordingContainer | null;
    final: boolean;
  }): Promise<void>;
  endPart(part: {
    sessionId: string;
    partNo: number;
    endedAtMs: number;
    chunkCount: number;
    byteLength: number;
    mimeType: string;
    container: RecordingContainer | null;
  }): Promise<void>;
  markCompleted(
    sessionId: string,
    input: {
      completedReason: CompletedReason;
      recordedSeconds: number | null;
      completedAtMs: number;
    },
  ): Promise<void>;
}

/** 크래시 직전까지 저장된 청크 수 — spike §4.1 실측(9초 녹음 → 8청크 생존)과 같게 둔다. */
export const MOCK_CRASH_CHUNKS = 8;

/** 보관 상한 seed 의 청크 수. */
export const MOCK_STALE_CHUNKS = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

/** 14일 + 1분 전 — `D4-29` 경계를 넘은 시각. */
export const MOCK_STALE_AGE_MS = 14 * DAY_MS + 60_000;

/** 7일 + 1분 전 — 7일 보관 안내 경계를 넘은 시각 (`S4-H3`, Plan §12 `local-retention-notice`). */
export const MOCK_NOTICE_AGE_MS = 7 * DAY_MS + 60_000;

/** 48시간 + 1분 전 — 업로드 미확정 안내 경계를 넘은 시각 (`S4-H3`, AC-4-149). */
export const MOCK_STALLED_AGE_MS = 2 * DAY_MS + 60_000;

/** `data-management:recording-delete-local-pending` — 1시간 전에 끝난 미업로드 녹음 (7일 안내 · 48h 안내 둘 다 아직 아님). */
export const MOCK_LOCAL_PENDING_AGE_MS = 60 * 60_000;

/** 같은 seed 의 다음 업로드 시도 — 1시간 뒤. 데모 · e2e 중 큐가 스스로 올려 버리지 않게 한다 (강제 처리만 시도한다). */
export const MOCK_LOCAL_PENDING_RETRY_IN_MS = 60 * 60_000;

export function mockChunkBytes(seq: number, size = MOCK_RECORDER_CHUNK_BYTES): Uint8Array {
  return new Uint8Array(size).fill(seq % 256);
}

async function writeChunks(
  target: LocalRecordingSeedTarget,
  sessionId: string,
  count: number,
): Promise<void> {
  for (let seq = 1; seq <= count; seq += 1) {
    await target.appendChunk({
      sessionId,
      partNo: 1,
      seq,
      bytes: mockChunkBytes(seq),
      mimeType: MOCK_RECORDER_MIME_TYPE,
      container: 'webm',
      final: false,
    });
  }
}

/**
 * `crash-recovered` — 녹음 중 탭이 죽은 상태: part 1 시작 + 청크 8개, **`endPart` 없음**.
 * 다음 실행에서 `recoverUnfinishedRecordings` 가 찾는다.
 */
export async function seedCrashedRecording(
  target: LocalRecordingSeedTarget,
  sessionId: string,
  clock: Clock,
): Promise<void> {
  await target.beginPart({
    sessionId,
    partNo: 1,
    startedAtMs: clock.now() - (MOCK_CRASH_CHUNKS + 1) * 1000,
  });
  await writeChunks(target, sessionId, MOCK_CRASH_CHUNKS);
}

/** `ageMs` 전에 녹음을 마쳤지만 업로드되지 않은 녹음 1건 (part 1 · 청크 5개 · `completed`). */
async function seedCompletedRecording(
  target: LocalRecordingSeedTarget,
  sessionId: string,
  clock: Clock,
  ageMs: number,
): Promise<void> {
  const startedAtMs = clock.now() - ageMs;
  await target.beginPart({ sessionId, partNo: 1, startedAtMs });
  await writeChunks(target, sessionId, MOCK_STALE_CHUNKS);
  await target.endPart({
    sessionId,
    partNo: 1,
    endedAtMs: startedAtMs + MOCK_STALE_CHUNKS * 1000,
    chunkCount: MOCK_STALE_CHUNKS,
    byteLength: MOCK_STALE_CHUNKS * MOCK_RECORDER_CHUNK_BYTES,
    mimeType: MOCK_RECORDER_MIME_TYPE,
    container: 'webm',
  });
  await target.markCompleted(sessionId, {
    completedReason: 'user_done',
    recordedSeconds: MOCK_STALE_CHUNKS,
    completedAtMs: startedAtMs + MOCK_STALE_CHUNKS * 1000,
  });
}

/**
 * `local-retention-exceeded` — 14일 + 1분 전에 끝났지만 업로드되지 않은 녹음 (`D4-29`).
 */
export async function seedStaleRecording(
  target: LocalRecordingSeedTarget,
  sessionId: string,
  clock: Clock,
): Promise<void> {
  await seedCompletedRecording(target, sessionId, clock, MOCK_STALE_AGE_MS);
}

/**
 * `local-retention-notice` — 7일 + 1분 전에 끝났지만 업로드되지 않은 녹음 (`S4-H3`, AC-4-150). 큐 항목은 넣지 않는다 —
 * 데모에서 배너가 업로드로 곧바로 사라지지 않게 한다(업로드 성공 시 사라짐은 단위 테스트가 본다).
 */
export async function seedNoticeRecording(
  target: LocalRecordingSeedTarget,
  sessionId: string,
  clock: Clock,
): Promise<void> {
  await seedCompletedRecording(target, sessionId, clock, MOCK_NOTICE_AGE_MS);
}

/**
 * `upload-stalled-48h` (브라우저) — 48시간 + 1분 전에 적재돼 지금까지 확정되지 않은 녹음 (`S4-H3`, AC-4-149).
 * 앱 시작 시 큐가 48h 경계를 넘긴 것으로 판정한다. 서버(Mock)는 이 key 에서 계속 실패하므로 큐는 재시도를 이어 간다.
 */
export async function seedStalledUpload(
  target: LocalRecordingSeedTarget,
  kv: LocalKeyValueStore,
  sessionId: string,
  clock: Clock,
): Promise<void> {
  await seedCompletedRecording(target, sessionId, clock, MOCK_STALLED_AGE_MS);
  const entry: UploadQueueEntry = {
    version: 1,
    sessionId,
    enqueuedAtMs: clock.now() - MOCK_STALLED_AGE_MS + MOCK_STALE_CHUNKS * 1000,
    state: 'failed_retrying',
    priority: 'normal',
    attempts: 3,
    recordingId: null,
    initKey: `seed-init-${sessionId}`,
    completeKey: `seed-complete-${sessionId}`,
    uploadedPartNos: [],
    nextAttemptAtMs: clock.now(),
    lastFailure: 'network',
    stalledNoticeAtMs: null,
  };
  await kv.put('uploads', sessionId, entry);
}

/**
 * `data-management:recording-delete-local-pending` (Stage 8 `S8-A`, Plan §8) — 서버 세션은 `completed` + 녹음 `pending`,
 * 이 기기에는 미업로드 녹음(part 1 · 청크 5개) + 업로드 큐 항목이 있다. 세션 녹음 삭제가 **서버 확정 후** 로컬 청크를 지우고
 * 큐를 취소하는지(`rules/architecture.md` §7) 저장소 계수로 검증한다. 큐 항목의 다음 시도는 1시간 뒤다 — 그 전에 큐가
 * 업로드를 끝내 버리면 "로컬에 남은 녹음" 을 재현할 수 없다.
 */
export async function seedPendingLocalUpload(
  target: LocalRecordingSeedTarget,
  kv: LocalKeyValueStore,
  sessionId: string,
  clock: Clock,
): Promise<void> {
  await seedCompletedRecording(target, sessionId, clock, MOCK_LOCAL_PENDING_AGE_MS);
  const entry: UploadQueueEntry = {
    version: 1,
    sessionId,
    enqueuedAtMs: clock.now() - MOCK_LOCAL_PENDING_AGE_MS + MOCK_STALE_CHUNKS * 1000,
    state: 'failed_retrying',
    priority: 'normal',
    attempts: 1,
    recordingId: null,
    initKey: `seed-init-${sessionId}`,
    completeKey: `seed-complete-${sessionId}`,
    uploadedPartNos: [],
    nextAttemptAtMs: clock.now() + MOCK_LOCAL_PENDING_RETRY_IN_MS,
    lastFailure: 'network',
    stalledNoticeAtMs: null,
  };
  await kv.put('uploads', sessionId, entry);
}
