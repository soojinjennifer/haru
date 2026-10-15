/**
 * 녹음 로컬 저장 **플랫폼 포트** (Stage 4 `S4-E`, `docs/ARCHITECTURE.md` §10.5-1·2, spike `M-4`~`M-8`·`M-10`).
 *
 * `features/recording` 의 `LocalRecordingStore` · `SessionOutbox` · `UploadQueue` 는 아래 포트만 본다.
 *
 * | 포트 | Web (Stage 4) | Mock / 테스트 | 후속 (Native) |
 * |---|---|---|---|
 * | `ChunkByteStore` — 청크 바이트 1개 = 파일 1개 | **OPFS** `createWritable()` (Worker 없음 — `M-10`). OPFS 가 없으면 IndexedDB | 메모리 (`mocks/platform/MockRecordingStorage`) | 앱 샌드박스 파일 |
 * | `LocalKeyValueStore` — 색인·복구 메타·outbox·업로드 큐 | **IndexedDB** | 메모리 | SQLite/Preferences |
 * | `StoragePersistencePort` — `navigator.storage.persist()` (`D4-30`, `M-8`) | `persist()`·`persisted()` | 주입 값 | 항상 `persisted` |
 * | `AudioDecodeProbe` — 복구 성공 판정 (`M-6`) | `decodeAudioData` | 주입 판정 | 네이티브 디코더 |
 *
 * ⭐ `RecorderAdapter` 와 같은 원칙 — **이 파일에는 DOM 타입이 나오지 않는다** (`R4-01`).
 * 바이트는 `Uint8Array`, 값은 구조 복제 가능한 평범한 객체다.
 *
 * 🔒 Privacy: 키·파일 이름에는 **opaque 세션 id(uuid)·part 번호·순번만** 쓴다. 아이 이름·오디오 내용을
 * 키에 넣지 않으며, 이 계층은 로그를 남기지 않는다 (`rules/architecture.md` §9).
 */

/** 같은 청크의 저장 위치 — `header_copy` 는 part 첫 청크(컨테이너 헤더)의 **복제본**이다 (`M-4`). */
export type ChunkSlot = 'primary' | 'header_copy';

export interface StoredChunkRef {
  readonly sessionId: string;
  readonly partNo: number;
  readonly seq: number;
  readonly slot: ChunkSlot;
}

export type ChunkByteStoreKind = 'opfs' | 'indexeddb' | 'memory';

export interface ChunkByteStore {
  readonly kind: ChunkByteStoreKind;
  /** 바이트를 쓴다. 이미 있으면 덮어쓴다. 실패는 `LocalStorageWriteError`. */
  write(ref: StoredChunkRef, bytes: Uint8Array): Promise<void>;
  /** 없으면 `null`. 잘린 파일은 **잘린 그대로** 돌려준다 (`M-5`). */
  read(ref: StoredChunkRef): Promise<Uint8Array | null>;
  /**
   * **실제로 남아 있는 파일 수** — 색인이 아니라 저장소를 직접 센다 (AC-4-71 2시점 측정의 대상).
   * `sessionId` 를 주면 그 세션만.
   */
  countFiles(sessionId?: string): Promise<number>;
  /** 세션의 모든 바이트를 지운다. 없으면 그대로 끝난다. */
  removeSession(sessionId: string): Promise<void>;
  clear(): Promise<void>;
}

/** 색인 저장소의 이름 공간. */
export type LocalStoreNamespace = 'recordings' | 'chunks' | 'outbox' | 'uploads';

/**
 * 색인·메타 저장소. 값은 **구조 복제 가능한 평범한 데이터**여야 한다.
 * 읽은 값은 `unknown` 이다 — 기기에 남은 이전 버전 레코드일 수 있으므로 쓰는 쪽이 모양을 검사한다.
 */
export interface LocalKeyValueStore {
  put(namespace: LocalStoreNamespace, key: string, value: unknown): Promise<void>;
  get(namespace: LocalStoreNamespace, key: string): Promise<unknown>;
  /** 키 오름차순. `prefix` 를 주면 그 접두어로 시작하는 키만. */
  list(namespace: LocalStoreNamespace, prefix?: string): Promise<unknown[]>;
  delete(namespace: LocalStoreNamespace, key: string): Promise<void>;
  deletePrefix(namespace: LocalStoreNamespace, prefix: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * 저장소 영속성 (`D4-30`).
 * - `persisted`   — 브라우저가 임의로 비우지 않는다
 * - `best_effort` — 브라우저가 압박 시 비울 수 있다 (spike §8: 측정한 두 엔진 모두 기본값이 이것이었다)
 * - `unsupported` — API 가 없다 (best_effort 로 취급한다)
 */
export type StoragePersistenceState = 'persisted' | 'best_effort' | 'unsupported';

export interface StoragePersistencePort {
  /** 현재 상태 — 사용자에게 묻지 않는다. */
  check(): Promise<StoragePersistenceState>;
  /** 영속 저장을 요청한다. 승인 여부는 브라우저 정책에 달려 있어 **보장되지 않는다**. */
  request(): Promise<StoragePersistenceState>;
}

/** 저장소가 브라우저에 의해 비워질 수 있는가 (`best_effort` · `unsupported`). */
export function isEvictable(state: StoragePersistenceState | null): boolean {
  return state !== 'persisted';
}

export type AudioDecodeResult =
  { readonly ok: true; readonly durationSeconds: number } | { readonly ok: false };

/**
 * 복구한 바이트가 **실제로 재생 가능한가** — `M-6`: 판정은 디코드다. `<audio>.duration` 을 쓰지 않는다
 * (이어 붙인 WebM 은 탐색 불가 스트림이라 메타데이터를 못 읽는 경우가 있다 — spike §4.1-5).
 */
export interface AudioDecodeProbe {
  decode(bytes: Uint8Array, mimeType: string): Promise<AudioDecodeResult>;
}

export type LocalStorageWriteFailure = 'quota_exceeded' | 'unavailable' | 'failed';

/** 로컬 쓰기 실패 — 원인을 플랫폼 중립 값으로 싣는다. 오류 메시지에 경로·내용을 넣지 않는다. */
export class LocalStorageWriteError extends Error {
  override readonly name = 'LocalStorageWriteError';
  readonly reason: LocalStorageWriteFailure;

  constructor(reason: LocalStorageWriteFailure, options: { cause?: unknown } = {}) {
    super(
      `Local recording storage write failed (${reason}).`,
      options.cause === undefined ? undefined : { cause: options.cause },
    );
    this.reason = reason;
  }
}

export function isLocalStorageWriteError(value: unknown): value is LocalStorageWriteError {
  return value instanceof LocalStorageWriteError;
}

/** 플랫폼 오류 이름으로 실패 원인을 고른다 (`QuotaExceededError` — spike §8-3 주입 테스트 대상). */
export function classifyStorageError(error: unknown): LocalStorageWriteError {
  if (isLocalStorageWriteError(error)) return error;
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name: unknown }).name)
      : '';
  if (name === 'QuotaExceededError')
    return new LocalStorageWriteError('quota_exceeded', { cause: error });
  if (name === 'SecurityError' || name === 'NotAllowedError' || name === 'InvalidStateError') {
    return new LocalStorageWriteError('unavailable', { cause: error });
  }
  return new LocalStorageWriteError('failed', { cause: error });
}

/** 세션 id 는 파일·디렉토리 이름이 된다 — 경로 문자를 막는다 (uuid 만 들어온다). */
export function assertStorageSafeId(id: string): void {
  if (!/^[A-Za-z0-9-]{1,64}$/.test(id)) {
    throw new LocalStorageWriteError('failed');
  }
}

/** 청크 파일 이름 — `p01-000001.bin` / 헤더 복제본 `p01-000001.hdr` (정렬 가능). */
export function chunkFileName(ref: Pick<StoredChunkRef, 'partNo' | 'seq' | 'slot'>): string {
  const part = String(ref.partNo).padStart(2, '0');
  const seq = String(ref.seq).padStart(6, '0');
  return `p${part}-${seq}.${ref.slot === 'header_copy' ? 'hdr' : 'bin'}`;
}
