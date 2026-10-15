/**
 * `LocalRecordingStore` — 녹음 청크 영속 + 복구 메타 (Stage 4 `S4-E`, `ARCHITECTURE` §10.4·§10.5).
 *
 * `RecordingController` 의 `RecordingSink` 포트를 구현한다. 바이트는 `ChunkByteStore`(Web = OPFS),
 * 색인·레코드는 `LocalKeyValueStore`(Web = IndexedDB) — 둘 다 플랫폼 포트라 테스트는 메모리 구현을 쓴다.
 *
 * ── 불변 규칙 ──
 * 1. **청크마다 즉시 기록**한다 (§10.5-2). 색인을 **먼저** 쓰고 바이트를 쓴다 — 바이트 쓰기 도중 끊기면
 *    색인이 잘린 파일을 가리키고, 복구는 **잘린 채로 이어 붙인다** (`M-5` — 버리면 더 잃는다).
 * 2. **part 첫 청크는 특별히 보호**한다 (`M-4` — 컨테이너 헤더가 거기에만 있어 잃으면 part 전체가 재생 불가):
 *    ① 복제본(`header_copy`)을 함께 쓰고 ② 원본을 **되읽어 크기를 확인**한다. 어긋나면 1회 다시 쓴다.
 * 3. **이 저장소는 스스로 지우지 않는다.** 삭제는 `delete` / `discardSession` / `clear` 를 부르는 쪽의
 *    결정이다 — 업로드 확정 응답 후(`UploadQueue`), 서버가 폐기를 확정한 후(`D4-13`), 보관 상한(`D4-29`),
 *    서버가 녹음 삭제를 알린 경우(`RECORDING_DELETED`), 로그아웃(AC-4-72).
 * 4. 쓰기 실패는 **던진다** (`LocalStorageWriteError` — 할당량 초과 포함). 그때까지의 청크는 남는다.
 *
 * 🔒 로그를 남기지 않는다. 오류 메시지에 경로·내용이 없다.
 */
import type { CompletedReason } from '@haru/contracts';

import type { Clock } from '../../../shared/lib/clock';
import {
  LocalStorageWriteError,
  type ChunkByteStore,
  type LocalKeyValueStore,
  type StoragePersistencePort,
  type StoragePersistenceState,
} from '../../../shared/platform/recording-storage';

import {
  chunkIndexKey,
  chunkIndexPrefix,
  isLocalChunkIndexEntry,
  isLocalRecordingRecord,
  LOCAL_RECORD_VERSION,
  type LocalChunkIndexEntry,
  type LocalPartRecord,
  type LocalRecordingRecord,
} from './local-records';
import type {
  RecordingChunkWrite,
  RecordingPartEnd,
  RecordingPartStart,
  RecordingSink,
} from './ports';

export interface LocalRecordingStoreOptions {
  readonly bytes: ChunkByteStore;
  readonly kv: LocalKeyValueStore;
  readonly persistence: StoragePersistencePort;
  readonly clock: Clock;
}

export interface MarkCompletedInput {
  readonly completedReason: CompletedReason;
  readonly recordedSeconds: number | null;
  readonly completedAtMs: number;
}

export interface LocalRecordingStore extends RecordingSink {
  /**
   * `navigator.storage.persist()` 를 **한 번** 요청하고 결과를 기억한다 (`D4-30`). 녹음 시작 전에 부른다.
   * 이후 생기는 레코드에 결과가 기록된다.
   */
  ensurePersistence(): Promise<StoragePersistenceState>;
  get(sessionId: string): Promise<LocalRecordingRecord | null>;
  list(): Promise<readonly LocalRecordingRecord[]>;
  /** 크래시로 끝나지 못한 레코드 (`state === 'recording'`). */
  listUnfinished(): Promise<readonly LocalRecordingRecord[]>;
  listChunks(sessionId: string): Promise<readonly LocalChunkIndexEntry[]>;
  markCompleted(sessionId: string, input: MarkCompletedInput): Promise<void>;
  /** 레코드를 갱신한다 (복구 결과 · 보관 안내 시각). 없으면 아무것도 하지 않는다. */
  update(
    sessionId: string,
    change: (record: LocalRecordingRecord) => LocalRecordingRecord,
  ): Promise<LocalRecordingRecord | null>;
  /**
   * part 바이트를 색인 순서대로 이어 붙인다. 없는 파일은 건너뛰고 **잘린 파일은 그대로** 쓴다 (`M-5`).
   * 첫 청크는 원본·복제본 중 긴 쪽을 쓴다 (`M-4`).
   */
  readPart(sessionId: string, partNo: number): Promise<Uint8Array>;
  /** 저장소에 **실제로 남은 파일 수** (AC-4-71 2시점 측정). */
  countChunkFiles(sessionId?: string): Promise<number>;
  /** 세션의 로컬 녹음을 지운다 — 바이트 → 색인 → 레코드 순. 없으면 그대로 끝난다. */
  delete(sessionId: string): Promise<void>;
  /** 이 기기의 로컬 녹음을 **전부** 지운다 (로그아웃 — AC-4-72). */
  clear(): Promise<void>;
}

function concat(chunks: readonly Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export function createLocalRecordingStore(
  options: LocalRecordingStoreOptions,
): LocalRecordingStore {
  const { bytes, kv, persistence, clock } = options;

  let persistenceState: StoragePersistenceState | null = null;
  let persistenceRequest: Promise<StoragePersistenceState> | null = null;
  /** 이 인스턴스가 첫 청크를 이미 받은 part (`sessionId/partNo`). */
  const headerSeen = new Set<string>();
  /** 레코드 갱신 직렬화 — read-modify-write 경합 방지. */
  let recordChain: Promise<unknown> = Promise.resolve();

  const serial = <T>(run: () => Promise<T>): Promise<T> => {
    const next = recordChain.then(run, run);
    recordChain = next.catch(() => undefined);
    return next;
  };

  const readRecord = async (sessionId: string): Promise<LocalRecordingRecord | null> => {
    const value = await kv.get('recordings', sessionId);
    return isLocalRecordingRecord(value) ? value : null;
  };

  const writeRecord = (record: LocalRecordingRecord): Promise<void> =>
    kv.put('recordings', record.sessionId, record);

  const mutate = (
    sessionId: string,
    change: (record: LocalRecordingRecord | null) => LocalRecordingRecord | null,
  ): Promise<LocalRecordingRecord | null> =>
    serial(async () => {
      const current = await readRecord(sessionId);
      const next = change(current);
      if (next !== null && next !== current) await writeRecord(next);
      return next;
    });

  const replacePart = (
    record: LocalRecordingRecord,
    partNo: number,
    change: (part: LocalPartRecord) => LocalPartRecord,
  ): LocalRecordingRecord => ({
    ...record,
    parts: record.parts.map((part) => (part.partNo === partNo ? change(part) : part)),
  });

  const listChunks = async (sessionId: string): Promise<readonly LocalChunkIndexEntry[]> => {
    const values = await kv.list('chunks', chunkIndexPrefix(sessionId));
    return values.filter(isLocalChunkIndexEntry);
  };

  /** M-4 — 첫 청크: 원본 + 복제본, 원본 되읽기 확인 (어긋나면 1회 재기록). */
  const writeHeaderChunk = async (chunk: RecordingChunkWrite): Promise<boolean> => {
    const primary = { sessionId: chunk.sessionId, partNo: chunk.partNo, seq: chunk.seq } as const;
    await bytes.write({ ...primary, slot: 'primary' }, chunk.bytes);
    await bytes.write({ ...primary, slot: 'header_copy' }, chunk.bytes);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const back = await bytes.read({ ...primary, slot: 'primary' });
      if (back !== null && back.byteLength === chunk.bytes.byteLength) return true;
      await bytes.write({ ...primary, slot: 'primary' }, chunk.bytes);
    }
    const copy = await bytes.read({ ...primary, slot: 'header_copy' });
    // 원본이 끝내 맞지 않아도 복제본이 온전하면 복구는 가능하다 — 그래도 확인 실패로 기록한다.
    if (copy === null || copy.byteLength !== chunk.bytes.byteLength) {
      throw new LocalStorageWriteError('failed');
    }
    return false;
  };

  const store: LocalRecordingStore = {
    ensurePersistence() {
      persistenceRequest ??= (async () => {
        const current = await persistence.check();
        const result = current === 'persisted' ? current : await persistence.request();
        persistenceState = result;
        return result;
      })();
      return persistenceRequest;
    },

    async beginPart(part: RecordingPartStart) {
      await mutate(part.sessionId, (current) => {
        const base: LocalRecordingRecord = current ?? {
          version: LOCAL_RECORD_VERSION,
          sessionId: part.sessionId,
          createdAtMs: part.startedAtMs,
          state: 'recording',
          completedAtMs: null,
          completedReason: null,
          recordedSeconds: null,
          storagePersistence: persistenceState,
          retentionNoticeAtMs: null,
          parts: [],
        };
        const others = base.parts.filter((existing) => existing.partNo !== part.partNo);
        return {
          ...base,
          state: 'recording',
          parts: [
            ...others,
            {
              partNo: part.partNo,
              startedAtMs: part.startedAtMs,
              endedAtMs: null,
              mimeType: '',
              container: null,
              chunkCount: 0,
              byteLength: 0,
              headerVerified: false,
              decodedSeconds: null,
            },
          ].sort((a, b) => a.partNo - b.partNo),
        };
      });
    },

    async appendChunk(chunk: RecordingChunkWrite) {
      const partKey = `${chunk.sessionId}/${String(chunk.partNo)}`;
      const isHeader = !headerSeen.has(partKey);
      headerSeen.add(partKey);
      const entry: LocalChunkIndexEntry = {
        version: LOCAL_RECORD_VERSION,
        sessionId: chunk.sessionId,
        partNo: chunk.partNo,
        seq: chunk.seq,
        size: chunk.bytes.byteLength,
        mimeType: chunk.mimeType,
        writtenAtMs: clock.now(),
        final: chunk.final,
        headerCopy: isHeader,
      };
      // ① 색인 먼저 (M-5) ② 바이트
      await kv.put('chunks', chunkIndexKey(chunk.sessionId, chunk.partNo, chunk.seq), entry);
      if (!isHeader) {
        await bytes.write(
          { sessionId: chunk.sessionId, partNo: chunk.partNo, seq: chunk.seq, slot: 'primary' },
          chunk.bytes,
        );
        return;
      }
      const verified = await writeHeaderChunk(chunk);
      await mutate(chunk.sessionId, (current) =>
        current === null
          ? null
          : replacePart(current, chunk.partNo, (part) => ({
              ...part,
              headerVerified: verified,
              mimeType: part.mimeType === '' ? chunk.mimeType : part.mimeType,
              container: part.container ?? chunk.container,
            })),
      );
    },

    async endPart(part: RecordingPartEnd) {
      await mutate(part.sessionId, (current) =>
        current === null
          ? null
          : replacePart(current, part.partNo, (existing) => ({
              ...existing,
              endedAtMs: part.endedAtMs,
              chunkCount: part.chunkCount,
              byteLength: part.byteLength,
              mimeType: part.mimeType !== '' ? part.mimeType : existing.mimeType,
              container: part.container ?? existing.container,
            })),
      );
    },

    discardSession: (sessionId) => store.delete(sessionId),

    get: (sessionId) => readRecord(sessionId),

    async list() {
      const values = await kv.list('recordings');
      return values.filter(isLocalRecordingRecord);
    },

    async listUnfinished() {
      return (await store.list()).filter((record) => record.state === 'recording');
    },

    listChunks,

    async markCompleted(sessionId, input) {
      await mutate(sessionId, (current) =>
        current === null
          ? null
          : {
              ...current,
              state: 'completed',
              completedAtMs: input.completedAtMs,
              completedReason: input.completedReason,
              recordedSeconds: input.recordedSeconds,
            },
      );
    },

    update: (sessionId, change) =>
      mutate(sessionId, (current) => (current === null ? null : change(current))),

    async readPart(sessionId, partNo) {
      const entries = (await listChunks(sessionId)).filter((entry) => entry.partNo === partNo);
      const pieces: Uint8Array[] = [];
      for (const entry of entries) {
        const ref = { sessionId, partNo, seq: entry.seq } as const;
        const primary = await bytes.read({ ...ref, slot: 'primary' });
        if (!entry.headerCopy) {
          if (primary !== null && primary.byteLength > 0) pieces.push(primary);
          continue;
        }
        const copy = await bytes.read({ ...ref, slot: 'header_copy' });
        const best =
          primary === null
            ? copy
            : copy === null
              ? primary
              : copy.byteLength > primary.byteLength
                ? copy
                : primary;
        if (best !== null && best.byteLength > 0) pieces.push(best);
      }
      return concat(pieces);
    },

    countChunkFiles: (sessionId) => bytes.countFiles(sessionId),

    async delete(sessionId) {
      await serial(async () => {
        await bytes.removeSession(sessionId);
        await kv.deletePrefix('chunks', chunkIndexPrefix(sessionId));
        await kv.delete('recordings', sessionId);
      });
      for (const key of [...headerSeen]) {
        if (key.startsWith(`${sessionId}/`)) headerSeen.delete(key);
      }
    },

    async clear() {
      await serial(async () => {
        await bytes.clear();
        // 이 저장소의 이름 공간만 — outbox·업로드 큐는 각자의 소유자가 지운다.
        await kv.deletePrefix('chunks', '');
        await kv.deletePrefix('recordings', '');
      });
      headerSeen.clear();
    },
  };

  return store;
}
