/**
 * 녹음 로컬 저장 플랫폼 포트 — interface + Web 구현 (`S4-E`). Native 구현은 후속 단계가 **추가만** 한다.
 * 구현 선택은 `app/providers` 한 곳에서 한다 (Plan §5.2-2). Feature 는 interface 타입만 본다.
 */
export {
  assertStorageSafeId,
  chunkFileName,
  classifyStorageError,
  isEvictable,
  isLocalStorageWriteError,
  LocalStorageWriteError,
  type AudioDecodeProbe,
  type AudioDecodeResult,
  type ChunkByteStore,
  type ChunkByteStoreKind,
  type ChunkSlot,
  type LocalKeyValueStore,
  type LocalStorageWriteFailure,
  type LocalStoreNamespace,
  type StoragePersistencePort,
  type StoragePersistenceState,
  type StoredChunkRef,
} from './recording-storage';
export {
  createIndexedDbChunkByteStore,
  createIndexedDbKeyValueStore,
  createRecordingDbConnection,
  deleteRecordingDatabase,
  indexedDbAvailable,
  RECORDING_DB_NAME,
} from './web-indexeddb';
export {
  createOpfsChunkByteStore,
  getOpfsRoot,
  OPFS_RECORDINGS_DIR,
  probeOpfsWritable,
  type OpfsDirectoryLike,
  type OpfsFileHandleLike,
  type OpfsFileLike,
  type OpfsWritableLike,
} from './web-opfs';
export {
  createLayeredChunkByteStore,
  createWebAudioDecodeProbe,
  createWebRecordingStorage,
  createWebStoragePersistence,
  wipeWebRecordingStorage,
  type LayeredChunkByteStoreOptions,
  type WebRecordingStorage,
} from './web-recording-storage';
