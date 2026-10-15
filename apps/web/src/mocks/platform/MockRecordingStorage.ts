/**
 * `MockRecordingStorage` — 녹음 로컬 저장 포트의 **메모리 구현** (Stage 4 `S4-E`, Plan §9.4 "Mock" 열 ·
 * `API_CONTRACTS` §5.4 `crash-recovered` "LocalRecordingStore mock").
 *
 * | 포트 | 메모리 동작 | 테스트 조작 (`controls`) |
 * |---|---|---|
 * | `ChunkByteStore` | `Map<path, Uint8Array>` — **파일 수 = 맵 크기** (AC-4-71 측정 대상) | `failWrites(reason, n)` (할당량 초과 주입 — spike §8-3) · `truncate` (`M-5`) · `removeFile` (`M-4`) |
 * | `LocalKeyValueStore` | 이름 공간별 정렬 맵 | `snapshot()` |
 * | `StoragePersistencePort` | 주입 상태 (`D4-30`) | `setPersistence` · `requests` |
 * | `AudioDecodeProbe` | ⬇ 규칙 | — |
 *
 * **Mock 디코드 규칙** (`M-6` 재현): `MockRecorderAdapter` 의 청크는 `seq` 로 채운 바이트다. part 첫 청크
 * (`seq 1`, 컨테이너 헤더 역할)가 맨 앞에 있으면 **디코드 성공**, 길이 = 바이트 수 ÷ 청크 크기 × 1초
 * (`D4-28` timeslice). 첫 청크를 잃으면 **실패** — 실제 WebM 이 그렇다 (spike §4.1-3).
 *
 * 시간·난수를 쓰지 않는다 (`mock-source-rules.test.ts`).
 */
import {
  assertStorageSafeId,
  chunkFileName,
  LocalStorageWriteError,
  type AudioDecodeProbe,
  type ChunkByteStore,
  type LocalKeyValueStore,
  type LocalStorageWriteFailure,
  type LocalStoreNamespace,
  type StoragePersistencePort,
  type StoragePersistenceState,
  type StoredChunkRef,
} from '../../shared/platform/recording-storage';

import { MOCK_RECORDER_CHUNK_BYTES } from './MockRecorderAdapter';

/** Mock 청크 1개 = timeslice 1개 = 1초 (`D4-28`). */
export const MOCK_SECONDS_PER_CHUNK = 1;

export interface MockRecordingStorageControls {
  /** 다음 `n` 번의 바이트 쓰기를 실패시킨다 (기본: 할당량 초과). */
  failWrites(reason?: LocalStorageWriteFailure, count?: number): void;
  /** 파일을 앞 `keepBytes` 만 남기고 자른다 (쓰기 도중 전원 차단 재현 — `M-5`). */
  truncate(ref: StoredChunkRef, keepBytes: number): void;
  /** 파일 하나를 없앤다 (`M-4` — 첫 청크 유실 재현). */
  removeFile(ref: StoredChunkRef): void;
  setPersistence(state: StoragePersistenceState): void;
  /** `persist()` 요청 횟수. */
  persistRequests(): number;
  /** 저장된 파일 이름 전부 (정렬). */
  files(sessionId?: string): readonly string[];
  /** 이름 공간별 키 (정렬). */
  keys(namespace: LocalStoreNamespace): readonly string[];
}

export interface MockRecordingStorage {
  readonly bytes: ChunkByteStore;
  readonly kv: LocalKeyValueStore;
  readonly persistence: StoragePersistencePort;
  readonly decoder: AudioDecodeProbe;
  readonly controls: MockRecordingStorageControls;
}

export interface MockRecordingStorageOptions {
  /** 기본 `best_effort` — spike §8 실측(두 엔진 모두 `persisted() === false`)과 같게 시작한다. */
  persistence?: StoragePersistenceState;
  /** `persist()` 요청 결과. 기본 = 요청해도 그대로(`best_effort`). */
  persistGrant?: StoragePersistenceState;
  chunkBytes?: number;
}

const pathOf = (ref: StoredChunkRef): string => {
  assertStorageSafeId(ref.sessionId);
  return `${ref.sessionId}/${chunkFileName(ref)}`;
};

export function createMockRecordingStorage(
  options: MockRecordingStorageOptions = {},
): MockRecordingStorage {
  const files = new Map<string, Uint8Array>();
  const spaces = new Map<LocalStoreNamespace, Map<string, unknown>>();
  let failing: { reason: LocalStorageWriteFailure; remaining: number } | null = null;
  let persistence: StoragePersistenceState = options.persistence ?? 'best_effort';
  const grant = options.persistGrant ?? persistence;
  const chunkBytes = options.chunkBytes ?? MOCK_RECORDER_CHUNK_BYTES;
  let persistRequests = 0;

  const space = (namespace: LocalStoreNamespace): Map<string, unknown> => {
    let map = spaces.get(namespace);
    if (map === undefined) {
      map = new Map();
      spaces.set(namespace, map);
    }
    return map;
  };
  const sortedKeys = (map: Map<string, unknown>): string[] => [...map.keys()].sort();
  /** IndexedDB 처럼 값은 복제본으로 저장·반환한다 (호출자가 바꿔도 저장값이 안 바뀐다). */
  const clone = <T>(value: T): T => structuredClone(value);

  const bytes: ChunkByteStore = {
    kind: 'memory',
    write(ref, data) {
      if (failing !== null && failing.remaining > 0) {
        failing.remaining -= 1;
        const { reason } = failing;
        if (failing.remaining === 0) failing = null;
        return Promise.reject(new LocalStorageWriteError(reason));
      }
      files.set(pathOf(ref), data.slice());
      return Promise.resolve();
    },
    read(ref) {
      const value = files.get(pathOf(ref));
      return Promise.resolve(value === undefined ? null : value.slice());
    },
    countFiles(sessionId) {
      const prefix = sessionId === undefined ? '' : `${sessionId}/`;
      return Promise.resolve([...files.keys()].filter((key) => key.startsWith(prefix)).length);
    },
    removeSession(sessionId) {
      for (const key of [...files.keys()]) {
        if (key.startsWith(`${sessionId}/`)) files.delete(key);
      }
      return Promise.resolve();
    },
    clear() {
      files.clear();
      return Promise.resolve();
    },
  };

  const kv: LocalKeyValueStore = {
    put(namespace, key, value) {
      space(namespace).set(key, clone(value));
      return Promise.resolve();
    },
    get(namespace, key) {
      const value = space(namespace).get(key);
      return Promise.resolve(value === undefined ? undefined : clone(value));
    },
    list(namespace, prefix) {
      const map = space(namespace);
      return Promise.resolve(
        sortedKeys(map)
          .filter((key) => prefix === undefined || key.startsWith(prefix))
          .map((key) => clone(map.get(key))),
      );
    },
    delete(namespace, key) {
      space(namespace).delete(key);
      return Promise.resolve();
    },
    deletePrefix(namespace, prefix) {
      const map = space(namespace);
      for (const key of [...map.keys()]) if (key.startsWith(prefix)) map.delete(key);
      return Promise.resolve();
    },
    clear() {
      spaces.clear();
      return Promise.resolve();
    },
  };

  return {
    bytes,
    kv,
    persistence: {
      check: () => Promise.resolve(persistence),
      request() {
        persistRequests += 1;
        persistence = grant;
        return Promise.resolve(persistence);
      },
    },
    decoder: {
      decode(data) {
        // part 첫 청크(seq 1 로 채운 바이트)가 맨 앞에 있어야 재생 가능하다.
        if (data.byteLength === 0 || data[0] !== 1) return Promise.resolve({ ok: false });
        return Promise.resolve({
          ok: true,
          durationSeconds: (data.byteLength / chunkBytes) * MOCK_SECONDS_PER_CHUNK,
        });
      },
    },
    controls: {
      failWrites(reason = 'quota_exceeded', count = 1) {
        failing = { reason, remaining: count };
      },
      truncate(ref, keepBytes) {
        const path = pathOf(ref);
        const value = files.get(path);
        if (value !== undefined) files.set(path, value.slice(0, keepBytes));
      },
      removeFile(ref) {
        files.delete(pathOf(ref));
      },
      setPersistence(state) {
        persistence = state;
      },
      persistRequests: () => persistRequests,
      files(sessionId) {
        const prefix = sessionId === undefined ? '' : `${sessionId}/`;
        return [...files.keys()].filter((key) => key.startsWith(prefix)).sort();
      },
      keys: (namespace) => sortedKeys(space(namespace)),
    },
  };
}
