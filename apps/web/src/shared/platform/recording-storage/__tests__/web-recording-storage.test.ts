/**
 * Web 녹음 저장소 구현 — OPFS(구조 타입 가짜 디렉토리) · `persist()` · `decodeAudioData` 판정 (Stage 4 `S4-E`).
 *
 * jsdom 에는 OPFS · IndexedDB · `OfflineAudioContext` 가 없다. 그래서 **브라우저 handle 은 구조 타입으로 주입**해
 * 이 저장소의 판단(경로 · 파일 수 · 없는 파일 · 할당량 오류 해석 · 정리)을 검증한다.
 * IndexedDB 구현의 실브라우저 동작은 dev 측정판(`/__dev/ui/recording-measure`)의 self-test 로 확인한다.
 */
import { describe, expect, it } from 'vitest';

import { isLocalStorageWriteError, type ChunkByteStore } from '../recording-storage';
import {
  createOpfsChunkByteStore,
  OPFS_RECORDINGS_DIR,
  probeOpfsWritable,
  type OpfsDirectoryLike,
  type OpfsFileHandleLike,
} from '../web-opfs';
import {
  createLayeredChunkByteStore,
  createWebAudioDecodeProbe,
  createWebStoragePersistence,
} from '../web-recording-storage';

const SESSION = '00000000-0000-4000-8000-0000000000f1';

function notFound(): Error {
  const error = new Error('not found');
  error.name = 'NotFoundError';
  return error;
}

/** 메모리 디렉토리 트리 — `FileSystemDirectoryHandle` 의 쓰는 부분만. */
function fakeDirectory(options: { failWrite?: () => Error | null; noKeys?: boolean } = {}) {
  type Node = { kind: 'dir'; children: Map<string, Node> } | { kind: 'file'; data: Uint8Array };
  const root: Node = { kind: 'dir', children: new Map() };

  const wrap = (node: Extract<Node, { kind: 'dir' }>): OpfsDirectoryLike => {
    const directory: OpfsDirectoryLike = {
      getDirectoryHandle(name, opts) {
        let child = node.children.get(name);
        if (child === undefined) {
          if (opts?.create !== true) return Promise.reject(notFound());
          child = { kind: 'dir', children: new Map() };
          node.children.set(name, child);
        }
        if (child.kind !== 'dir') return Promise.reject(new TypeError('not a dir'));
        return Promise.resolve(wrap(child));
      },
      getFileHandle(name, opts) {
        let child = node.children.get(name);
        if (child === undefined) {
          if (opts?.create !== true) return Promise.reject(notFound());
          child = { kind: 'file', data: new Uint8Array(0) };
          node.children.set(name, child);
        }
        if (child.kind !== 'file') return Promise.reject(new TypeError('not a file'));
        const file = child;
        const handle: OpfsFileHandleLike = {
          createWritable() {
            let pending = new Uint8Array(0);
            return Promise.resolve({
              write(data: Uint8Array) {
                const failure = options.failWrite?.() ?? null;
                if (failure !== null) return Promise.reject(failure);
                pending = data.slice();
                return Promise.resolve();
              },
              close() {
                file.data = pending;
                return Promise.resolve();
              },
            });
          },
          getFile: () =>
            Promise.resolve({ arrayBuffer: () => Promise.resolve(file.data.slice().buffer) }),
        };
        return Promise.resolve(handle);
      },
      removeEntry(name) {
        if (!node.children.has(name)) return Promise.reject(notFound());
        node.children.delete(name);
        return Promise.resolve();
      },
    };
    if (options.noKeys !== true) {
      directory.keys = async function* keys() {
        for (const name of node.children.keys()) {
          await Promise.resolve();
          yield name;
        }
      };
    }
    return directory;
  };

  return { root, handle: wrap(root) };
}

const ref = (seq: number, slot: 'primary' | 'header_copy' = 'primary') => ({
  sessionId: SESSION,
  partNo: 1,
  seq,
  slot,
});

describe('OPFS 바이트 저장소', () => {
  it('haru-recordings/<session>/p01-000001.bin 에 쓰고 되읽는다 · 파일 수를 센다', async () => {
    const dir = fakeDirectory();
    const store = createOpfsChunkByteStore(() => Promise.resolve(dir.handle));
    await store.write(ref(1), new Uint8Array([1, 2, 3]));
    await store.write(ref(1, 'header_copy'), new Uint8Array([1, 2, 3]));
    await store.write(ref(2), new Uint8Array([4]));

    expect(store.kind).toBe('opfs');
    expect([...((await store.read(ref(1))) ?? [])]).toStrictEqual([1, 2, 3]);
    expect(await store.countFiles(SESSION)).toBe(3);
    expect(await store.countFiles()).toBe(3);
    const sessionDir = dir.root.children.get(OPFS_RECORDINGS_DIR);
    expect(sessionDir?.kind === 'dir' && [...sessionDir.children.keys()]).toStrictEqual([SESSION]);
  });

  it('없는 파일·없는 세션은 null / 0 이다', async () => {
    const store = createOpfsChunkByteStore(() => Promise.resolve(fakeDirectory().handle));
    expect(await store.read(ref(9))).toBeNull();
    expect(await store.countFiles(SESSION)).toBe(0);
    await expect(store.removeSession(SESSION)).resolves.toBeUndefined();
    await expect(store.clear()).resolves.toBeUndefined();
  });

  it('QuotaExceededError 는 LocalStorageWriteError(quota_exceeded) 로 바뀐다', async () => {
    const quota = new Error('quota');
    quota.name = 'QuotaExceededError';
    const store = createOpfsChunkByteStore(() =>
      Promise.resolve(fakeDirectory({ failWrite: () => quota }).handle),
    );
    const error: unknown = await store.write(ref(1), new Uint8Array([1])).catch((e: unknown) => e);
    expect(isLocalStorageWriteError(error) && error.reason).toBe('quota_exceeded');
  });

  it('removeSession 은 그 세션 디렉토리만 · clear 는 녹음 디렉토리 전체를 지운다', async () => {
    const dir = fakeDirectory();
    const store = createOpfsChunkByteStore(() => Promise.resolve(dir.handle));
    const other = '00000000-0000-4000-8000-0000000000f2';
    await store.write(ref(1), new Uint8Array([1]));
    await store.write({ ...ref(1), sessionId: other }, new Uint8Array([1]));

    await store.removeSession(SESSION);
    expect(await store.countFiles(SESSION)).toBe(0);
    expect(await store.countFiles(other)).toBe(1);

    await store.clear();
    expect(dir.root.children.has(OPFS_RECORDINGS_DIR)).toBe(false);
  });

  it('경로 문자가 든 세션 id 는 거절한다', async () => {
    const store = createOpfsChunkByteStore(() => Promise.resolve(fakeDirectory().handle));
    await expect(
      store.write({ ...ref(1), sessionId: '../x' }, new Uint8Array([1])),
    ).rejects.toThrow();
  });

  it('디렉토리 순회를 못 하는 브라우저에서는 파일 수를 지어내지 않고 던진다', async () => {
    const dir = fakeDirectory({ noKeys: true });
    const store = createOpfsChunkByteStore(() => Promise.resolve(dir.handle));
    await store.write(ref(1), new Uint8Array([1]));
    await expect(store.countFiles(SESSION)).rejects.toThrow(/iteration/);
  });

  it('OPFS 가 없으면 쓰기는 unavailable/failed 로 던진다', async () => {
    const store = createOpfsChunkByteStore(() => Promise.resolve(null));
    await expect(store.write(ref(1), new Uint8Array([1]))).rejects.toMatchObject({
      name: 'LocalStorageWriteError',
    });
    expect(await store.read(ref(1))).toBeNull();
  });

  it('probeOpfsWritable — 실제로 써 보고 판단한다 (M-10)', async () => {
    expect(await probeOpfsWritable(() => Promise.resolve(fakeDirectory().handle))).toBe(true);
    const broken = fakeDirectory({ failWrite: () => new Error('denied') });
    expect(await probeOpfsWritable(() => Promise.resolve(broken.handle))).toBe(false);
    expect(await probeOpfsWritable(() => Promise.resolve(null))).toBe(false);
  });
});

describe('D4-30 — persist() / persisted()', () => {
  it('persisted() 결과를 상태로 바꾼다 · persist() 를 요청한다', async () => {
    let granted = false;
    let requests = 0;
    const port = createWebStoragePersistence(() => ({
      persisted: () => Promise.resolve(granted),
      persist: () => {
        requests += 1;
        granted = true;
        return Promise.resolve(true);
      },
    }));
    expect(await port.check()).toBe('best_effort');
    expect(await port.request()).toBe('persisted');
    expect(await port.check()).toBe('persisted');
    expect(requests).toBe(1);
  });

  it('API 가 없거나 던지면 unsupported', async () => {
    expect(await createWebStoragePersistence(() => undefined).check()).toBe('unsupported');
    const throwing = createWebStoragePersistence(() => ({
      persist: () => Promise.reject(new Error('x')),
    }));
    expect(await throwing.request()).toBe('unsupported');
    expect(await throwing.check()).toBe('unsupported');
  });
});

describe('M-6 — 복구 판정은 decodeAudioData', () => {
  it('디코드 길이를 돌려준다 · 원본 버퍼를 넘기지 않는다(복사본)', async () => {
    const original = new Uint8Array([9, 9, 9]);
    let received: ArrayBuffer | null = null;
    const probe = createWebAudioDecodeProbe(() => ({
      decodeAudioData(data) {
        received = data;
        return Promise.resolve({ duration: 8.1 });
      },
    }));
    expect(await probe.decode(original, 'audio/webm')).toStrictEqual({
      ok: true,
      durationSeconds: 8.1,
    });
    expect(received).not.toBe(original.buffer);
  });

  it('EncodingError · 0초 · 빈 입력 · 컨텍스트 없음 → ok:false', async () => {
    const failing = createWebAudioDecodeProbe(() => ({
      decodeAudioData: () => Promise.reject(new Error('EncodingError')),
    }));
    expect(await failing.decode(new Uint8Array([1]), 'audio/webm')).toStrictEqual({ ok: false });
    const zero = createWebAudioDecodeProbe(() => ({
      decodeAudioData: () => Promise.resolve({ duration: 0 }),
    }));
    expect(await zero.decode(new Uint8Array([1]), 'audio/webm')).toStrictEqual({ ok: false });
    expect(await zero.decode(new Uint8Array(0), 'audio/webm')).toStrictEqual({ ok: false });
    const none = createWebAudioDecodeProbe(() => null);
    expect(await none.decode(new Uint8Array([1]), 'audio/webm')).toStrictEqual({ ok: false });
  });
});

describe('쓰기 계층 선택 — 읽기·세기·지우기는 두 계층 모두 (탐지 결과가 실행마다 달라도 바이트를 잃지 않는다)', () => {
  function memoryLayer(kind: 'opfs' | 'indexeddb', options: { broken?: boolean } = {}) {
    const files = new Map<string, Uint8Array>();
    const key = (r: { sessionId: string; partNo: number; seq: number; slot: string }) =>
      `${r.sessionId}/${String(r.partNo)}/${String(r.seq)}/${r.slot}`;
    const store: ChunkByteStore = {
      kind,
      write(r, bytes) {
        if (options.broken === true) return Promise.reject(new Error('broken'));
        files.set(key(r), bytes.slice());
        return Promise.resolve();
      },
      read: (r) =>
        options.broken === true
          ? Promise.reject(new Error('broken'))
          : Promise.resolve(files.get(key(r)) ?? null),
      countFiles: (sessionId) =>
        options.broken === true
          ? Promise.reject(new Error('broken'))
          : Promise.resolve(
              [...files.keys()].filter((k) => sessionId === undefined || k.startsWith(sessionId))
                .length,
            ),
      removeSession(sessionId) {
        for (const k of [...files.keys()]) if (k.startsWith(sessionId)) files.delete(k);
        return Promise.resolve();
      },
      clear() {
        files.clear();
        return Promise.resolve();
      },
    };
    return { store, files };
  }

  it('1회차는 IndexedDB 에 썼고 2회차는 OPFS 가 잡혀도 — 읽기·세기·지우기가 1회차 바이트를 본다', async () => {
    const opfs = memoryLayer('opfs');
    const idb = memoryLayer('indexeddb');
    const firstRun = createLayeredChunkByteStore({
      opfs: opfs.store,
      indexedDb: idb.store,
      probe: () => Promise.resolve(false), // WebKit 실측처럼 transient 실패
    });
    await firstRun.write(ref(1), new Uint8Array([7, 7]));
    expect(firstRun.kind).toBe('indexeddb');

    const secondRun = createLayeredChunkByteStore({
      opfs: opfs.store,
      indexedDb: idb.store,
      probe: () => Promise.resolve(true),
    });
    expect([...((await secondRun.read(ref(1))) ?? [])]).toStrictEqual([7, 7]);
    await secondRun.write(ref(2), new Uint8Array([8]));
    expect(secondRun.kind).toBe('opfs');
    expect(await secondRun.countFiles(SESSION)).toBe(2);

    await secondRun.removeSession(SESSION);
    expect(opfs.files.size + idb.files.size).toBe(0);
  });

  it('보조 계층이 망가져 있어도 주 계층 결과를 가리지 않는다', async () => {
    const store = createLayeredChunkByteStore({
      opfs: memoryLayer('opfs', { broken: true }).store,
      indexedDb: memoryLayer('indexeddb').store,
      probe: () => Promise.reject(new Error('probe threw')),
    });
    await store.write(ref(1), new Uint8Array([1]));
    expect(await store.read(ref(9))).toBeNull();
    expect(await store.countFiles(SESSION)).toBe(1);
    await expect(store.clear()).resolves.toBeUndefined();
  });
});
