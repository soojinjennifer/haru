/**
 * `S4-A` spike — 청크 영속 계층 (**dev 전용 · 제품 코드가 아니다**)
 *
 * `ARCHITECTURE §10.5-1`/`-2` 가 요구하는 "청크마다 즉시 flush + 크래시 후 복원" 을
 * 브라우저에서 **실제로 되는지** 재기 위한 최소 구현이다. 제품의 `LocalRecordingStore`
 * (`S4-E`)를 여기서 만들지 않는다 — 이 파일은 측정이 끝나면 역할이 끝난다.
 *
 * 2계층으로 나눈 이유는 `ARCHITECTURE §10.5-1` 의 모델("레코드는 IndexedDB, 바이트는
 * 파일") 을 그대로 재보기 위해서다.
 *   - **OPFS**  — 청크 바이트 1개 = 파일 1개 (`haru-spike/<runId>/chunk-0001.bin`)
 *   - **IndexedDB** — run/chunk **색인**. OPFS 를 쓸 수 없는 브라우저에서는 바이트까지 여기 담는다.
 *
 * 디렉토리 순회(`FileSystemDirectoryHandle.values()`)에 의존하지 않는다 — 브라우저별 지원이
 * 갈리고, 색인을 IndexedDB 가 갖는 것이 §10.5 모델과도 같다.
 *
 * **PII 금지**: 이 저장소에 들어가는 바이트는 spike 가 합성한 사인파뿐이다
 * (`spike-core.ts` 의 `createSyntheticStream`). 사람 음성·아동 음성을 쓰지 않는다.
 */

/** IndexedDB 이름/버전. 제품 저장소와 섞이지 않도록 `spike` 접두어를 쓴다. */
const DB_NAME = 'haru-spike-recording';
const DB_VERSION = 1;
const STORE_RUNS = 'runs';
const STORE_CHUNKS = 'chunks';

/** OPFS 루트 아래 spike 전용 디렉토리. */
const OPFS_ROOT_DIR = 'haru-spike';

export interface RunRecord {
  readonly runId: string;
  readonly createdAt: number;
  /** `MediaRecorder` 가 실제로 돌려준 `mimeType` (요청값이 아니다). */
  readonly mimeType: string;
  readonly timesliceMs: number;
  /** `stop()` 의 `dataavailable` 까지 정상 종료했는가. 크래시 복구 판정의 기준이다. */
  readonly closed: boolean;
  readonly chunkCount: number;
}

export interface ChunkRecord {
  readonly runId: string;
  readonly seq: number;
  readonly size: number;
  /**
   * `BlobEvent.data.type` — **복원 시 컨테이너 타입의 유일한 믿을 수 있는 출처**다.
   * Chromium 의 `MediaRecorder.mimeType` 은 `start()` 뒤에도 빈 문자열이라
   * run 레코드에 담아 두면 복원할 때 쓸 수 없다 (실측 — 보고서 ④).
   */
  readonly blobType: string;
  /** 녹음 시작 시점 기준 경과 ms (`performance.now()` 차). */
  readonly tOffsetMs: number;
  /** OPFS 에 쓴 파일명. OPFS 를 못 쓰면 `null` 이고 `bytes` 가 채워진다. */
  readonly opfsName: string | null;
  /** OPFS 를 못 쓰는 브라우저의 fallback 바이트. */
  readonly bytes: ArrayBuffer | null;
}

export interface WriteLatency {
  readonly seq: number;
  readonly size: number;
  /** OPFS 파일 쓰기 + close 까지 ms. OPFS 미지원이면 `null`. */
  readonly opfsMs: number | null;
  /** IndexedDB 트랜잭션 완료까지 ms. */
  readonly idbMs: number;
}

export interface StoreCapability {
  readonly opfsDirectory: boolean;
  readonly opfsCreateWritable: boolean;
  readonly opfsSyncAccessHandleOnWindow: boolean;
  readonly indexedDb: boolean;
  /** 실제로 바이트를 담는 계층. */
  readonly bytesIn: 'opfs' | 'indexeddb' | 'none';
}

/* ===== IndexedDB ========================================================= */

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_RUNS)) {
        db.createObjectStore(STORE_RUNS, { keyPath: 'runId' });
      }
      if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
        db.createObjectStore(STORE_CHUNKS, { keyPath: ['runId', 'seq'] });
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('indexedDB.open failed'));
    };
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      resolve();
    };
    tx.onerror = () => {
      reject(tx.error ?? new Error('idb transaction failed'));
    };
    tx.onabort = () => {
      reject(tx.error ?? new Error('idb transaction aborted'));
    };
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error('idb request failed'));
    };
  });
}

/* ===== OPFS ============================================================== */

async function opfsDir(runId: string): Promise<FileSystemDirectoryHandle | null> {
  const storage: StorageManager | undefined = navigator.storage;
  if (typeof storage?.getDirectory !== 'function') return null;
  const root = await storage.getDirectory();
  const spikeRoot = await root.getDirectoryHandle(OPFS_ROOT_DIR, { create: true });
  return spikeRoot.getDirectoryHandle(runId, { create: true });
}

/**
 * `FileSystemFileHandle.createWritable()` 존재 여부를 **프로토타입이 아니라 실제 핸들**에서
 * 본다 — 프로토타입에 메서드가 있어도 OPFS 가 아닌 컨텍스트에서 던지는 브라우저가 있다.
 */
async function probeOpfs(): Promise<{
  directory: boolean;
  createWritable: boolean;
  syncAccessHandleOnWindow: boolean;
}> {
  const storage: StorageManager | undefined = navigator.storage;
  if (typeof storage?.getDirectory !== 'function') {
    return { directory: false, createWritable: false, syncAccessHandleOnWindow: false };
  }
  try {
    const root = await storage.getDirectory();
    const probeDir = await root.getDirectoryHandle('haru-spike-probe', { create: true });
    const handle = await probeDir.getFileHandle('probe.bin', { create: true });
    const record = handle as unknown as Record<string, unknown>;
    const hasWritable = typeof record['createWritable'] === 'function';
    const hasSync = typeof record['createSyncAccessHandle'] === 'function';
    let writableWorks = false;
    if (hasWritable) {
      try {
        const writable = await handle.createWritable();
        await writable.write(new Uint8Array([1]));
        await writable.close();
        writableWorks = true;
      } catch {
        writableWorks = false;
      }
    }
    let syncWorks = false;
    if (hasSync) {
      try {
        const create = record['createSyncAccessHandle'] as () => Promise<{ close: () => void }>;
        const sync = await create.call(handle);
        sync.close();
        syncWorks = true;
      } catch {
        // 창(window) 컨텍스트에서는 Worker 전용이라 던지는 것이 정상이다.
        syncWorks = false;
      }
    }
    await probeDir.removeEntry('probe.bin').catch(() => undefined);
    return {
      directory: true,
      createWritable: writableWorks,
      syncAccessHandleOnWindow: syncWorks,
    };
  } catch {
    return { directory: false, createWritable: false, syncAccessHandleOnWindow: false };
  }
}

/* ===== Store ============================================================= */

export class SpikeChunkStore {
  private db: IDBDatabase | null = null;
  private capability: StoreCapability | null = null;
  private runDir: FileSystemDirectoryHandle | null = null;
  private activeRunId: string | null = null;

  async probe(): Promise<StoreCapability> {
    if (this.capability !== null) return this.capability;
    const opfs = await probeOpfs();
    const idbOk = typeof indexedDB !== 'undefined';
    this.capability = {
      opfsDirectory: opfs.directory,
      opfsCreateWritable: opfs.createWritable,
      opfsSyncAccessHandleOnWindow: opfs.syncAccessHandleOnWindow,
      indexedDb: idbOk,
      bytesIn: opfs.createWritable ? 'opfs' : idbOk ? 'indexeddb' : 'none',
    };
    return this.capability;
  }

  private async database(): Promise<IDBDatabase> {
    this.db ??= await openDb();
    return this.db;
  }

  async beginRun(run: Omit<RunRecord, 'closed' | 'chunkCount'>): Promise<StoreCapability> {
    const capability = await this.probe();
    this.activeRunId = run.runId;
    this.runDir = capability.bytesIn === 'opfs' ? await opfsDir(run.runId) : null;
    const db = await this.database();
    const tx = db.transaction(STORE_RUNS, 'readwrite');
    tx.objectStore(STORE_RUNS).put({ ...run, closed: false, chunkCount: 0 } satisfies RunRecord);
    await txDone(tx);
    return capability;
  }

  /**
   * 청크 1개를 **받는 즉시** 영속화하고 계층별 소요를 돌려준다.
   * `ARCHITECTURE §10.5-2` 의 "청크마다 즉시 flush" 가 실제로 얼마 걸리는지가 측정 대상이다.
   */
  async appendChunk(
    seq: number,
    tOffsetMs: number,
    data: ArrayBuffer,
    blobType: string,
  ): Promise<WriteLatency> {
    const runId = this.activeRunId;
    if (runId === null) throw new Error('beginRun() before appendChunk()');
    const capability = await this.probe();

    let opfsMs: number | null = null;
    let opfsName: string | null = null;
    if (capability.bytesIn === 'opfs' && this.runDir !== null) {
      const name = `chunk-${String(seq).padStart(4, '0')}.bin`;
      const t0 = performance.now();
      const file = await this.runDir.getFileHandle(name, { create: true });
      const writable = await file.createWritable();
      await writable.write(data);
      await writable.close();
      opfsMs = performance.now() - t0;
      opfsName = name;
    }

    const db = await this.database();
    const t1 = performance.now();
    const tx = db.transaction(STORE_CHUNKS, 'readwrite');
    tx.objectStore(STORE_CHUNKS).put({
      runId,
      seq,
      size: data.byteLength,
      blobType,
      tOffsetMs,
      opfsName,
      bytes: capability.bytesIn === 'opfs' ? null : data,
    } satisfies ChunkRecord);
    await txDone(tx);
    const idbMs = performance.now() - t1;

    return { seq, size: data.byteLength, opfsMs, idbMs };
  }

  async closeRun(chunkCount: number): Promise<void> {
    const runId = this.activeRunId;
    if (runId === null) return;
    const db = await this.database();
    const tx = db.transaction(STORE_RUNS, 'readwrite');
    const store = tx.objectStore(STORE_RUNS);
    const existing = (await requestResult(store.get(runId))) as RunRecord | undefined;
    if (existing !== undefined) store.put({ ...existing, closed: true, chunkCount });
    await txDone(tx);
  }

  async listRuns(): Promise<readonly RunRecord[]> {
    const db = await this.database();
    const tx = db.transaction(STORE_RUNS, 'readonly');
    const all = (await requestResult(tx.objectStore(STORE_RUNS).getAll())) as RunRecord[];
    await txDone(tx);
    return all.toSorted((a, b) => a.createdAt - b.createdAt);
  }

  async listChunks(runId: string): Promise<readonly ChunkRecord[]> {
    const db = await this.database();
    const tx = db.transaction(STORE_CHUNKS, 'readonly');
    const all = (await requestResult(tx.objectStore(STORE_CHUNKS).getAll())) as ChunkRecord[];
    await txDone(tx);
    return all.filter((chunk) => chunk.runId === runId).toSorted((a, b) => a.seq - b.seq);
  }

  /** 저장된 청크가 적어 둔 컨테이너 타입. run 레코드의 `mimeType` 보다 믿을 수 있다. */
  async storedBlobType(runId: string): Promise<string> {
    const chunks = await this.listChunks(runId);
    return chunks[0]?.blobType ?? '';
  }

  /** 색인에 적힌 순서대로 바이트를 되읽는다. 크래시 복구의 본체다. */
  async readChunkBytes(runId: string): Promise<readonly ArrayBuffer[]> {
    const chunks = await this.listChunks(runId);
    const dir = await this.opfsRunDir(runId);
    const out: ArrayBuffer[] = [];
    for (const chunk of chunks) {
      if (chunk.opfsName !== null && dir !== null) {
        const handle = await dir.getFileHandle(chunk.opfsName);
        const file = await handle.getFile();
        out.push(await file.arrayBuffer());
      } else if (chunk.bytes !== null) {
        out.push(chunk.bytes);
      }
    }
    return out;
  }

  private async opfsRunDir(runId: string): Promise<FileSystemDirectoryHandle | null> {
    const capability = await this.probe();
    if (capability.bytesIn !== 'opfs') return null;
    try {
      return await opfsDir(runId);
    } catch {
      return null;
    }
  }

  /**
   * 마지막 청크를 **잘라서** 크래시 중단(쓰기 도중 전원이 끊긴 상태)을 재현한다.
   * 돌려주는 값은 남긴 바이트 수다.
   */
  async truncateLastChunk(runId: string, keepRatio: number): Promise<number> {
    const chunks = await this.listChunks(runId);
    const last = chunks.at(-1);
    if (last === undefined) return 0;
    const keep = Math.max(1, Math.floor(last.size * keepRatio));
    const dir = await this.opfsRunDir(runId);
    if (last.opfsName !== null && dir !== null) {
      const handle = await dir.getFileHandle(last.opfsName);
      const file = await handle.getFile();
      const full = await file.arrayBuffer();
      const writable = await handle.createWritable();
      await writable.truncate(0);
      await writable.write(full.slice(0, keep));
      await writable.close();
    } else if (last.bytes !== null) {
      const db = await this.database();
      const tx = db.transaction(STORE_CHUNKS, 'readwrite');
      tx.objectStore(STORE_CHUNKS).put({ ...last, size: keep, bytes: last.bytes.slice(0, keep) });
      await txDone(tx);
    }
    return keep;
  }

  async clear(): Promise<void> {
    const db = await this.database();
    const tx = db.transaction([STORE_RUNS, STORE_CHUNKS], 'readwrite');
    tx.objectStore(STORE_RUNS).clear();
    tx.objectStore(STORE_CHUNKS).clear();
    await txDone(tx);
    const storage: StorageManager | undefined = navigator.storage;
    if (typeof storage?.getDirectory === 'function') {
      try {
        const root = await storage.getDirectory();
        await root.removeEntry(OPFS_ROOT_DIR, { recursive: true });
      } catch {
        // 디렉토리가 없으면 그만이다.
      }
    }
    this.runDir = null;
    this.activeRunId = null;
  }
}
