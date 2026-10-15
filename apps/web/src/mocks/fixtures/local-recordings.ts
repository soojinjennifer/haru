/**
 * 로컬 녹음 seed — `crash-recovered` · `local-retention-exceeded` (Stage 4 `S4-E`).
 *
 * **가상 데이터**다: 바이트는 `MockRecorderAdapter` 와 같은 규칙(`seq` 로 채운 고정 길이)이며 사람 음성이 아니다.
 * seed 는 저장소의 **공개 쓰기 경로**(`beginPart` · `appendChunk` · `endPart` · `markCompleted`)로만 넣는다 —
 * 레코드 내부 모양을 여기서 다시 쓰지 않는다 (아래 `LocalRecordingSeedTarget` 은 그 경로의 구조 타입).
 *
 * ⚠️ seed 하는 세션은 **Mock 서버에도 있어야** 업로드·전이가 성공한다. 그래서 세션 id 를 인자로 받는다 —
 * 테스트는 `MockSessionApi` 로 세션을 만든 뒤 그 id 로 seed 한다. 브라우저 조립(scenario → seed)은 `S4-F`.
 */
import type { CompletedReason, RecordingContainer } from '@haru/contracts';

import type { Clock } from '../../shared/lib/clock';
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

/** 14일 + 1분 전 — `D4-29` 경계를 넘은 시각. */
export const MOCK_STALE_AGE_MS = 14 * 24 * 60 * 60 * 1000 + 60_000;

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

/**
 * `local-retention-exceeded` — 14일 + 1분 전에 끝났지만 업로드되지 않은 녹음 (`D4-29`).
 */
export async function seedStaleRecording(
  target: LocalRecordingSeedTarget,
  sessionId: string,
  clock: Clock,
): Promise<void> {
  const startedAtMs = clock.now() - MOCK_STALE_AGE_MS;
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
