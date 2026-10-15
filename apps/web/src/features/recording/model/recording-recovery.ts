/**
 * 크래시 복구 (Stage 4 `S4-E`, `ARCHITECTURE` §10.5-2, spike §4 · `M-4`·`M-5`·`M-6`).
 *
 * 앱(탭)이 녹음 중에 정리 없이 죽으면 로컬 레코드가 `state: 'recording'` 으로 남는다. 다음 실행 시:
 *
 * 1. 색인 순서대로 part 바이트를 이어 붙인다 — 없는 파일은 건너뛰고 **잘린 마지막 파일은 버리지 않는다** (`M-5`).
 *    첫 청크는 원본·헤더 복제본 중 온전한 쪽을 쓴다 (`M-4`).
 * 2. **디코드로 판정**한다 (`M-6` — `<audio>.duration` 이 아니다). 디코드한 길이가 part 길이가 된다.
 * 3. 마지막 청크 시각을 `endedAt` 으로 `completed(recovered_after_crash)` 전이를 만든다 → 조립 지점이
 *    `SessionOutbox` 에 적재하고 `UploadQueue` 에 넣는다.
 *
 * 디코드에 실패한 part 도 **지우지 않는다** — 판정 결과(`decodable: false`)만 기록한다. 지우는 것은 유실이며,
 * 그 결정은 보관 상한(`D4-29`)이나 사용자 행위에 맡긴다.
 */
import {
  MAX_RECORDED_SECONDS,
  recordingContainerForMimeType,
  type SessionTransitionRequest,
} from '@haru/contracts';

import type { Clock } from '../../../shared/lib/clock';
import type { AudioDecodeProbe } from '../../../shared/platform/recording-storage';

import type { LocalRecordingStore } from './local-recording-store';
import type { LocalPartRecord } from './local-records';

export interface RecoveredPart {
  readonly partNo: number;
  readonly byteLength: number;
  readonly chunkCount: number;
  readonly decodable: boolean;
  readonly decodedSeconds: number | null;
}

export interface RecoveredRecording {
  readonly sessionId: string;
  readonly parts: readonly RecoveredPart[];
  readonly recordedSeconds: number;
  /** `SessionOutbox` 에 적재할 전이 — `completed(recovered_after_crash)`. */
  readonly transition: SessionTransitionRequest;
}

export interface RecoverOptions {
  readonly store: LocalRecordingStore;
  readonly decoder: AudioDecodeProbe;
  readonly clock: Clock;
  /** 지금 이 탭에서 녹음 중인 세션 — 복구 대상이 아니다. */
  readonly activeSessionIds?: ReadonlySet<string>;
}

export async function recoverUnfinishedRecordings(
  options: RecoverOptions,
): Promise<readonly RecoveredRecording[]> {
  const { store, decoder, clock } = options;
  const active = options.activeSessionIds ?? new Set<string>();
  const recovered: RecoveredRecording[] = [];

  for (const record of await store.listUnfinished()) {
    if (active.has(record.sessionId)) continue;
    const chunks = await store.listChunks(record.sessionId);
    const partNos = [
      ...new Set([...record.parts.map((part) => part.partNo), ...chunks.map((c) => c.partNo)]),
    ].sort((a, b) => a - b);

    const parts: RecoveredPart[] = [];
    const nextParts: LocalPartRecord[] = [];
    let lastChunkAtMs = record.createdAtMs;

    for (const partNo of partNos) {
      const partChunks = chunks.filter((chunk) => chunk.partNo === partNo);
      const existing = record.parts.find((part) => part.partNo === partNo);
      const bytes = await store.readPart(record.sessionId, partNo);
      const mimeType =
        existing !== undefined && existing.mimeType !== ''
          ? existing.mimeType
          : (partChunks.find((chunk) => chunk.mimeType !== '')?.mimeType ?? '');
      const decoded =
        bytes.byteLength > 0 ? await decoder.decode(bytes, mimeType) : ({ ok: false } as const);
      const partEnd = Math.max(
        existing?.startedAtMs ?? record.createdAtMs,
        ...partChunks.map((chunk) => chunk.writtenAtMs),
      );
      lastChunkAtMs = Math.max(lastChunkAtMs, partEnd);
      const decodedSeconds = decoded.ok ? decoded.durationSeconds : null;
      parts.push({
        partNo,
        byteLength: bytes.byteLength,
        chunkCount: partChunks.length,
        decodable: decoded.ok,
        decodedSeconds,
      });
      nextParts.push({
        partNo,
        startedAtMs: existing?.startedAtMs ?? record.createdAtMs,
        endedAtMs: existing?.endedAtMs ?? partEnd,
        mimeType,
        container: existing?.container ?? recordingContainerForMimeType(mimeType),
        chunkCount: partChunks.length,
        byteLength: bytes.byteLength,
        headerVerified: existing?.headerVerified ?? false,
        decodedSeconds,
      });
    }

    // 실제 녹음 시간: 디코드 길이 합 → 없으면 청크 수 × 1초 (`D4-28` timeslice).
    const estimate = parts.reduce((sum, part) => sum + (part.decodedSeconds ?? part.chunkCount), 0);
    const recordedSeconds = Math.min(MAX_RECORDED_SECONDS, Math.round(estimate));
    const occurredAt = new Date(Math.min(lastChunkAtMs, clock.now())).toISOString();

    await store.update(record.sessionId, (current) => ({
      ...current,
      parts: nextParts,
      state: 'completed',
      completedAtMs: Date.parse(occurredAt),
      completedReason: 'recovered_after_crash',
      recordedSeconds,
    }));

    recovered.push({
      sessionId: record.sessionId,
      parts,
      recordedSeconds,
      transition: {
        to: 'completed',
        occurredAt,
        completedReason: 'recovered_after_crash',
        recordedSeconds,
      },
    });
  }

  return recovered;
}
