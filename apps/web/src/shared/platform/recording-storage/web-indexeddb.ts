/**
 * IndexedDB 구현 — 색인·메타(`LocalKeyValueStore`) + OPFS 를 못 쓰는 브라우저의 바이트 fallback.
 *
 * 브라우저 전역(`indexedDB`)은 호출 시점에 읽는다. 키는 **out-of-line 문자열**이고
 * `list(prefix)` 는 `IDBKeyRange.bound(prefix, prefix + '￿')` 로 키 오름차순을 돌려준다.
 */
import {
  assertStorageSafeId,
  chunkFileName,
  classifyStorageError,
  type ChunkByteStore,
  type LocalKeyValueStore,
  type LocalStoreNamespace,
  type StoredChunkRef,
} from './recording-storage';

export const RECORDING_DB_NAME = 'haru-local-recordings';
export const RECORDING_DB_VERSION = 1;

const NAMESPACES: readonly LocalStoreNamespace[] = ['recordings', 'chunks', 'outbox', 'uploads'];
const BYTES_STORE = 'bytes';

export function indexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined' && typeof IDBKeyRange !== 'undefined';
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      resolve(req.result);
    };
    req.onerror = () => {
      reject(req.error ?? new Error('IndexedDB request failed.'));
    };
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      resolve();
    };
    tx.onerror = () => {
      reject(tx.error ?? new Error('IndexedDB transaction failed.'));
    };
    tx.onabort = () => {
      reject(tx.error ?? new Error('IndexedDB transaction aborted.'));
    };
  });
}

function prefixRange(prefix: string): IDBKeyRange {
  return IDBKeyRange.bound(prefix, `${prefix}￿`);
}

/** DB 연결 1개를 지연 생성해 공유한다. */
export function createRecordingDbConnection(): () => Promise<IDBDatabase> {
  let pending: Promise<IDBDatabase> | null = null;
  return () => {
    pending ??= new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open(RECORDING_DB_NAME, RECORDING_DB_VERSION);
      open.onupgradeneeded = () => {
        const db = open.result;
        for (const name of [...NAMESPACES, BYTES_STORE]) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
        }
      };
      open.onsuccess = () => {
        const db = open.result;
        // 다른 탭이 wipe(deleteDatabase)하면 연결을 놓아 준다.
        db.onversionchange = () => {
          db.close();
          pending = null;
        };
        resolve(db);
      };
      open.onerror = () => {
        pending = null;
        reject(open.error ?? new Error('IndexedDB open failed.'));
      };
    });
    return pending;
  };
}

export function createIndexedDbKeyValueStore(
  database: () => Promise<IDBDatabase> = createRecordingDbConnection(),
): LocalKeyValueStore {
  const write = async (
    namespace: LocalStoreNamespace,
    run: (store: IDBObjectStore) => void,
  ): Promise<void> => {
    try {
      const db = await database();
      const tx = db.transaction(namespace, 'readwrite');
      run(tx.objectStore(namespace));
      await done(tx);
    } catch (error) {
      throw classifyStorageError(error);
    }
  };

  return {
    put: (namespace, key, value) =>
      write(namespace, (store) => {
        store.put(value, key);
      }),
    async get(namespace, key) {
      const db = await database();
      const tx = db.transaction(namespace, 'readonly');
      const value = await request(tx.objectStore(namespace).get(key));
      await done(tx);
      return value;
    },
    async list(namespace, prefix) {
      const db = await database();
      const tx = db.transaction(namespace, 'readonly');
      const store = tx.objectStore(namespace);
      const values = await request(
        prefix === undefined ? store.getAll() : store.getAll(prefixRange(prefix)),
      );
      await done(tx);
      return values;
    },
    delete: (namespace, key) =>
      write(namespace, (store) => {
        store.delete(key);
      }),
    deletePrefix: (namespace, prefix) =>
      write(namespace, (store) => {
        store.delete(prefixRange(prefix));
      }),
    async clear() {
      try {
        const db = await database();
        const tx = db.transaction([...NAMESPACES], 'readwrite');
        for (const name of NAMESPACES) tx.objectStore(name).clear();
        await done(tx);
      } catch (error) {
        throw classifyStorageError(error);
      }
    },
  };
}

/** OPFS 를 못 쓰는 브라우저의 바이트 저장소 (spike `spike-store.ts` 의 fallback 과 같은 모델). */
export function createIndexedDbChunkByteStore(
  database: () => Promise<IDBDatabase> = createRecordingDbConnection(),
): ChunkByteStore {
  const keyOf = (ref: StoredChunkRef): string => {
    assertStorageSafeId(ref.sessionId);
    return `${ref.sessionId}/${chunkFileName(ref)}`;
  };

  const write = async (run: (store: IDBObjectStore) => void): Promise<void> => {
    try {
      const db = await database();
      const tx = db.transaction(BYTES_STORE, 'readwrite');
      run(tx.objectStore(BYTES_STORE));
      await done(tx);
    } catch (error) {
      throw classifyStorageError(error);
    }
  };

  return {
    kind: 'indexeddb',
    write: (ref, bytes) =>
      write((store) => {
        store.put(bytes.slice(), keyOf(ref));
      }),
    async read(ref) {
      const db = await database();
      const tx = db.transaction(BYTES_STORE, 'readonly');
      const value: unknown = await request(tx.objectStore(BYTES_STORE).get(keyOf(ref)));
      await done(tx);
      return value instanceof Uint8Array ? value : null;
    },
    async countFiles(sessionId) {
      const db = await database();
      const tx = db.transaction(BYTES_STORE, 'readonly');
      const store = tx.objectStore(BYTES_STORE);
      const count = await request(
        sessionId === undefined ? store.count() : store.count(prefixRange(`${sessionId}/`)),
      );
      await done(tx);
      return count;
    },
    removeSession: (sessionId) =>
      write((store) => {
        assertStorageSafeId(sessionId);
        store.delete(prefixRange(`${sessionId}/`));
      }),
    clear: () =>
      write((store) => {
        store.clear();
      }),
  };
}

/** DB 전체를 지운다 (로그아웃 정리). 열린 연결이 있으면 `onversionchange` 로 닫힌다. */
export function deleteRecordingDatabase(): Promise<void> {
  if (!indexedDbAvailable()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(RECORDING_DB_NAME);
    req.onsuccess = () => {
      resolve();
    };
    req.onerror = () => {
      reject(req.error ?? new Error('IndexedDB delete failed.'));
    };
    // 다른 탭이 연결을 쥐고 있으면 blocked — 그 탭이 닫히면 이어서 지워진다. 여기서 기다리지 않는다.
    req.onblocked = () => {
      resolve();
    };
  });
}
