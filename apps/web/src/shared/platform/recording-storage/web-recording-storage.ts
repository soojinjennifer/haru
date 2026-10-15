/**
 * Web 녹음 저장소 조립 — OPFS(바이트) + IndexedDB(색인) + `persist()` + `decodeAudioData` (Stage 4 `S4-E`).
 *
 * 선택은 `app/providers` 한 곳에서 한다 (Plan §5.2-2). 이 파일은 **Web 구현을 묶어 주기만** 한다.
 */
import type {
  AudioDecodeProbe,
  ChunkByteStore,
  ChunkByteStoreKind,
  LocalKeyValueStore,
  StoragePersistencePort,
  StoragePersistenceState,
} from './recording-storage';
import {
  createIndexedDbChunkByteStore,
  createIndexedDbKeyValueStore,
  createRecordingDbConnection,
  deleteRecordingDatabase,
} from './web-indexeddb';
import { createOpfsChunkByteStore, getOpfsRoot, probeOpfsWritable } from './web-opfs';

/* ===== D4-30 — navigator.storage.persist() ================================ */

interface StorageManagerLike {
  persisted?: () => Promise<boolean>;
  persist?: () => Promise<boolean>;
}

export function createWebStoragePersistence(
  storage: () => StorageManagerLike | undefined = () =>
    typeof navigator === 'undefined' ? undefined : navigator.storage,
): StoragePersistencePort {
  const toState = (value: boolean): StoragePersistenceState =>
    value ? 'persisted' : 'best_effort';

  return {
    async check() {
      const manager = storage();
      if (typeof manager?.persisted !== 'function') return 'unsupported';
      try {
        return toState(await manager.persisted());
      } catch {
        return 'unsupported';
      }
    },
    async request() {
      const manager = storage();
      if (typeof manager?.persist !== 'function') return 'unsupported';
      try {
        return toState(await manager.persist());
      } catch {
        return 'unsupported';
      }
    },
  };
}

/* ===== M-6 — decodeAudioData ============================================== */

interface DecodingContextLike {
  decodeAudioData(data: ArrayBuffer): Promise<{ duration: number }>;
}

/**
 * 디코드 판정. `OfflineAudioContext` 를 쓴다 — 소리를 내지 않으므로 autoplay 제약(사용자 제스처)에
 * 걸리지 않는다. 1프레임 컨텍스트로도 디코드는 원본 길이를 돌려준다.
 */
export function createWebAudioDecodeProbe(
  createContext: () => DecodingContextLike | null = () =>
    typeof OfflineAudioContext === 'undefined' ? null : new OfflineAudioContext(1, 1, 44_100),
): AudioDecodeProbe {
  return {
    async decode(bytes) {
      if (bytes.byteLength === 0) return { ok: false };
      const context = createContext();
      if (context === null) return { ok: false };
      try {
        // decodeAudioData 는 버퍼를 detach 할 수 있다 — 원본을 지키려고 복사본을 넘긴다.
        const buffer = bytes.slice().buffer;
        const decoded = await context.decodeAudioData(buffer);
        return decoded.duration > 0
          ? { ok: true, durationSeconds: decoded.duration }
          : { ok: false };
      } catch {
        return { ok: false };
      }
    },
  };
}

/* ===== 바이트 저장소 선택 (OPFS → IndexedDB fallback) ======================= */

export interface LayeredChunkByteStoreOptions {
  readonly opfs: ChunkByteStore;
  readonly indexedDb: ChunkByteStore;
  /** OPFS 에 실제로 쓸 수 있는가 (`probeOpfsWritable`). */
  readonly probe: () => Promise<boolean>;
}

/**
 * 첫 사용 시 OPFS 쓰기를 실제로 시험하고, 안 되면 IndexedDB 에 바이트를 **쓴다**. 고른 계층은 이 인스턴스
 * 동안 바꾸지 않는다.
 *
 * ⚠️ **읽기·세기·지우기는 두 계층 모두** 본다. 실측(2026-10-15, Playwright WebKit 26.6 headless): OPFS
 * `createWritable()` 이 `UnknownError — "transient reason"` 으로 실패했다(Chromium 은 성공). 탐지 결과가
 * 실행마다 달라지면 **앞 실행이 IndexedDB 에 쓴 바이트를 다음 실행이 OPFS 에서만 찾게** 된다 — 지워지지
 * 않았는데 읽을 수 없는 녹음(=사실상 유실)이 생긴다. 그래서 쓰기 계층만 고르고, 나머지는 양쪽을 본다.
 */
export function createLayeredChunkByteStore(options: LayeredChunkByteStoreOptions): ChunkByteStore {
  const { opfs, indexedDb, probe } = options;
  let chosen: Promise<{ primary: ChunkByteStore; secondary: ChunkByteStore }> | null = null;
  // 선택 전에는 OPFS 를 가정해 보고하고, 선택 후 실제 값을 쓴다 (`kind` 는 진단용).
  let actualKind: ChunkByteStoreKind = 'opfs';
  const pick = (): Promise<{ primary: ChunkByteStore; secondary: ChunkByteStore }> => {
    chosen ??= probe()
      .catch(() => false)
      .then((ok) => {
        const layers = ok
          ? { primary: opfs, secondary: indexedDb }
          : { primary: indexedDb, secondary: opfs };
        actualKind = layers.primary.kind;
        return layers;
      });
    return chosen;
  };
  /** 보조 계층은 없거나 쓸 수 없을 수 있다 — 그 실패가 주 계층 결과를 가리지 않게 한다. */
  const quietly = async <T>(run: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await run();
    } catch {
      return fallback;
    }
  };

  return {
    get kind() {
      return actualKind;
    },
    write: async (ref, bytes) => (await pick()).primary.write(ref, bytes),
    async read(ref) {
      const { primary, secondary } = await pick();
      return (await primary.read(ref)) ?? (await quietly(() => secondary.read(ref), null));
    },
    async countFiles(sessionId) {
      const { primary, secondary } = await pick();
      return (
        (await primary.countFiles(sessionId)) +
        (await quietly(() => secondary.countFiles(sessionId), 0))
      );
    },
    async removeSession(sessionId) {
      const { primary, secondary } = await pick();
      await quietly(() => secondary.removeSession(sessionId), undefined);
      await primary.removeSession(sessionId);
    },
    async clear() {
      const { primary, secondary } = await pick();
      await quietly(() => secondary.clear(), undefined);
      await primary.clear();
    },
  };
}

function createAutoChunkByteStore(database: () => Promise<IDBDatabase>): ChunkByteStore {
  return createLayeredChunkByteStore({
    opfs: createOpfsChunkByteStore(getOpfsRoot),
    indexedDb: createIndexedDbChunkByteStore(database),
    probe: () => probeOpfsWritable(),
  });
}

export interface WebRecordingStorage {
  readonly bytes: ChunkByteStore;
  readonly kv: LocalKeyValueStore;
  readonly persistence: StoragePersistencePort;
  readonly decoder: AudioDecodeProbe;
}

export function createWebRecordingStorage(): WebRecordingStorage {
  const database = createRecordingDbConnection();
  return {
    bytes: createAutoChunkByteStore(database),
    kv: createIndexedDbKeyValueStore(database),
    persistence: createWebStoragePersistence(),
    decoder: createWebAudioDecodeProbe(),
  };
}

/**
 * 이 기기의 녹음 로컬 데이터를 **전부** 지운다 — IndexedDB DB 삭제 + OPFS 디렉토리 삭제.
 * 로그아웃 정리(AC-4-72)의 기본 구현이다. 브라우저 API 가 없으면 아무것도 하지 않는다.
 */
export async function wipeWebRecordingStorage(): Promise<void> {
  const root = await getOpfsRoot();
  let failure: unknown = null;
  if (root !== null) {
    await createOpfsChunkByteStore(() => Promise.resolve(root))
      .clear()
      .catch((error: unknown) => {
        failure = error;
      });
  }
  // 한쪽이 실패해도 다른 쪽은 지운다. IndexedDB 바이트 fallback 도 DB 와 함께 사라진다.
  await deleteRecordingDatabase();
  // 실패를 숨기지 않는다 — 아동 음성이 남았을 수 있다 (로그아웃 화면이 안내할 수 있게).
  if (failure !== null) throw failure;
}
