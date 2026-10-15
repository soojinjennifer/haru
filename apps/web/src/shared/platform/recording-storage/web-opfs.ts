/**
 * OPFS 구현 — 청크 바이트 1개 = 파일 1개 (`ARCHITECTURE` §10.5-1, spike §3).
 *
 * - **Worker 없이** 창 컨텍스트의 `FileSystemFileHandle.createWritable()` 로 쓴다 (`M-10` — 양 엔진 실측 동작).
 * - 경로: `haru-recordings/<sessionId>/p01-000001.bin` (헤더 복제본 `.hdr` — `M-4`).
 * - 능력 탐지는 **실제 핸들에 써 보는 것**이다 — 프로토타입에 메서드가 있어도 던지는 경우가 있다 (spike §3.1).
 *
 * 테스트를 위해 브라우저 handle 은 아래의 **구조 타입**으로만 본다. 실제 `FileSystemDirectoryHandle` 은
 * `getOpfsRoot()` 에서 한 번 변환된다.
 */
import {
  assertStorageSafeId,
  chunkFileName,
  classifyStorageError,
  type ChunkByteStore,
  type StoredChunkRef,
} from './recording-storage';

export const OPFS_RECORDINGS_DIR = 'haru-recordings';

const PROBE_DIR = 'haru-recordings-probe';

export interface OpfsWritableLike {
  write(data: Uint8Array): Promise<void>;
  close(): Promise<void>;
}

export interface OpfsFileLike {
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface OpfsFileHandleLike {
  createWritable(): Promise<OpfsWritableLike>;
  getFile(): Promise<OpfsFileLike>;
}

export interface OpfsDirectoryLike {
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<OpfsDirectoryLike>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<OpfsFileHandleLike>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  /** 비동기 이터레이터 — 파일 수 측정(AC-4-71)에만 쓴다. */
  keys?: () => AsyncIterable<string>;
}

/** 실제 OPFS 루트. 없으면 `null`. */
export async function getOpfsRoot(): Promise<OpfsDirectoryLike | null> {
  const storage = typeof navigator === 'undefined' ? undefined : navigator.storage;
  if (typeof storage?.getDirectory !== 'function') return null;
  try {
    return (await storage.getDirectory()) as unknown as OpfsDirectoryLike;
  } catch {
    return null;
  }
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: unknown }).name === 'NotFoundError'
  );
}

/** `createWritable()` 로 실제로 1바이트를 써 본다 (spike `probeOpfs` 와 같은 방식). */
export async function probeOpfsWritable(
  root: () => Promise<OpfsDirectoryLike | null> = getOpfsRoot,
): Promise<boolean> {
  const dir = await root();
  if (dir === null) return false;
  try {
    const probe = await dir.getDirectoryHandle(PROBE_DIR, { create: true });
    const file = await probe.getFileHandle('probe.bin', { create: true });
    const writable = await file.createWritable();
    await writable.write(new Uint8Array([1]));
    await writable.close();
    await dir.removeEntry(PROBE_DIR, { recursive: true }).catch(() => undefined);
    return true;
  } catch {
    return false;
  }
}

export function createOpfsChunkByteStore(
  root: () => Promise<OpfsDirectoryLike | null> = getOpfsRoot,
): ChunkByteStore {
  const recordingsDir = async (create: boolean): Promise<OpfsDirectoryLike | null> => {
    const dir = await root();
    if (dir === null) return null;
    try {
      return await dir.getDirectoryHandle(OPFS_RECORDINGS_DIR, { create });
    } catch (error) {
      if (!create && isNotFound(error)) return null;
      throw error;
    }
  };

  const sessionDir = async (
    sessionId: string,
    create: boolean,
  ): Promise<OpfsDirectoryLike | null> => {
    assertStorageSafeId(sessionId);
    const base = await recordingsDir(create);
    if (base === null) return null;
    try {
      return await base.getDirectoryHandle(sessionId, { create });
    } catch (error) {
      if (!create && isNotFound(error)) return null;
      throw error;
    }
  };

  const countIn = async (dir: OpfsDirectoryLike): Promise<number> => {
    if (typeof dir.keys !== 'function') {
      throw new Error('OPFS directory iteration is not supported in this browser.');
    }
    let count = 0;
    for await (const name of dir.keys()) {
      if (name.length > 0) count += 1;
    }
    return count;
  };

  return {
    kind: 'opfs',

    async write(ref: StoredChunkRef, bytes: Uint8Array) {
      try {
        const dir = await sessionDir(ref.sessionId, true);
        if (dir === null) throw new Error('OPFS is not available.');
        const file = await dir.getFileHandle(chunkFileName(ref), { create: true });
        const writable = await file.createWritable();
        await writable.write(bytes);
        await writable.close();
      } catch (error) {
        throw classifyStorageError(error);
      }
    },

    async read(ref) {
      const dir = await sessionDir(ref.sessionId, false);
      if (dir === null) return null;
      try {
        const handle = await dir.getFileHandle(chunkFileName(ref));
        const file = await handle.getFile();
        return new Uint8Array(await file.arrayBuffer());
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },

    async countFiles(sessionId) {
      if (sessionId !== undefined) {
        const dir = await sessionDir(sessionId, false);
        return dir === null ? 0 : countIn(dir);
      }
      const base = await recordingsDir(false);
      if (base === null || typeof base.keys !== 'function') return 0;
      let total = 0;
      for await (const name of base.keys()) {
        const dir = await sessionDir(name, false).catch(() => null);
        if (dir !== null) total += await countIn(dir);
      }
      return total;
    },

    async removeSession(sessionId) {
      assertStorageSafeId(sessionId);
      const base = await recordingsDir(false);
      if (base === null) return;
      try {
        await base.removeEntry(sessionId, { recursive: true });
      } catch (error) {
        if (!isNotFound(error)) throw error;
      }
    },

    async clear() {
      const dir = await root();
      if (dir === null) return;
      try {
        await dir.removeEntry(OPFS_RECORDINGS_DIR, { recursive: true });
      } catch (error) {
        if (!isNotFound(error)) throw error;
      }
    },
  };
}
