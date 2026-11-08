/**
 * `LocalRecordingStore` 가 기기에 남기는 레코드 모양 — **클라이언트 전용** (contracts 아님, Plan §5.2-6).
 *
 * 기기에는 이전 앱 버전이 쓴 레코드가 남아 있을 수 있으므로, 읽은 값은 `unknown` 으로 받아
 * 아래 가드로 모양을 확인한다. 모양이 다른 레코드는 **지우지 않고 건너뛴다** (유실 방지 — 판단은 사람이 한다).
 *
 * 🔒 담는 것: 세션 id(opaque uuid) · part 번호 · 시각 · 크기 · MIME · 상태. 아이 이름·전사·오디오 경로 없음.
 */
import type { CompletedReason, RecordingContainer } from '@haru/contracts';

import type { StoragePersistenceState } from '../../../shared/platform/recording-storage';

export const LOCAL_RECORD_VERSION = 1;

/** 로컬 녹음 레코드 상태. `recording` 이 남아 있는데 녹음 중인 컨트롤러가 없으면 크래시로 본다 (§10.5-2). */
export type LocalRecordingState = 'recording' | 'completed';

export interface LocalPartRecord {
  readonly partNo: number;
  readonly startedAtMs: number;
  /** 정상 종료 시각. 크래시로 끝나지 못한 part 는 `null`. */
  readonly endedAtMs: number | null;
  readonly mimeType: string;
  readonly container: RecordingContainer | null;
  readonly chunkCount: number;
  readonly byteLength: number;
  /** 첫 청크(컨테이너 헤더)를 읽어 확인했는가 (`M-4`). */
  readonly headerVerified: boolean;
  /** 복구 시 디코드로 확인한 길이 (`M-6`). 디코드 전·실패는 `null`. */
  readonly decodedSeconds: number | null;
}

export interface LocalRecordingRecord {
  readonly version: typeof LOCAL_RECORD_VERSION;
  readonly sessionId: string;
  /** 첫 part 시작 시각 — 보관 상한(`D4-29`)의 기준. */
  readonly createdAtMs: number;
  readonly state: LocalRecordingState;
  readonly completedAtMs: number | null;
  readonly completedReason: CompletedReason | null;
  /** 컨트롤러가 보고한 실제 녹음 시간 (일시정지 제외). 복구 레코드는 디코드 합계. */
  readonly recordedSeconds: number | null;
  /** 녹음 시작 시점의 저장소 영속성 (`D4-30`) — `best_effort` 면 업로드를 서두른다. */
  readonly storagePersistence: StoragePersistenceState | null;
  /** 7일 안내를 낸 시각 (`D4-29`) — 한 번만 낸다. */
  readonly retentionNoticeAtMs: number | null;
  /**
   * 7일 안내 배너를 사용자가 닫은 시각 (`S4-H3`, 4b Spec §18.3 · NB-14) — 재시작 후에도 다시 띄우지 않는다.
   * 이 필드가 생기기 전 레코드에는 없다(= 닫지 않음). 그래서 선택 필드다.
   */
  readonly retentionDismissedAtMs?: number | null;
  readonly parts: readonly LocalPartRecord[];
}

export interface LocalChunkIndexEntry {
  readonly version: typeof LOCAL_RECORD_VERSION;
  readonly sessionId: string;
  readonly partNo: number;
  readonly seq: number;
  /** 청크가 담고 온 크기 — 파일이 잘렸으면 실제 바이트가 이보다 짧다 (`M-5`). */
  readonly size: number;
  readonly mimeType: string;
  readonly writtenAtMs: number;
  readonly final: boolean;
  /** 헤더 복제본이 있는가 (`M-4`, part 첫 청크). */
  readonly headerCopy: boolean;
}

/** 색인 키 — 키 오름차순 = (part, seq) 순서. */
export function chunkIndexKey(sessionId: string, partNo: number, seq: number): string {
  return `${chunkIndexPrefix(sessionId)}${String(partNo).padStart(2, '0')}/${String(seq).padStart(6, '0')}`;
}

export function chunkIndexPrefix(sessionId: string): string {
  return `${sessionId}/`;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNumberOrNull = (value: unknown): value is number | null =>
  value === null || typeof value === 'number';

function isPart(value: unknown): value is LocalPartRecord {
  return (
    isObject(value) &&
    typeof value['partNo'] === 'number' &&
    typeof value['startedAtMs'] === 'number' &&
    isNumberOrNull(value['endedAtMs']) &&
    typeof value['mimeType'] === 'string' &&
    (value['container'] === null || typeof value['container'] === 'string') &&
    typeof value['chunkCount'] === 'number' &&
    typeof value['byteLength'] === 'number' &&
    typeof value['headerVerified'] === 'boolean' &&
    isNumberOrNull(value['decodedSeconds'])
  );
}

export function isLocalRecordingRecord(value: unknown): value is LocalRecordingRecord {
  return (
    isObject(value) &&
    value['version'] === LOCAL_RECORD_VERSION &&
    typeof value['sessionId'] === 'string' &&
    typeof value['createdAtMs'] === 'number' &&
    (value['state'] === 'recording' || value['state'] === 'completed') &&
    isNumberOrNull(value['completedAtMs']) &&
    (value['completedReason'] === null || typeof value['completedReason'] === 'string') &&
    isNumberOrNull(value['recordedSeconds']) &&
    (value['storagePersistence'] === null || typeof value['storagePersistence'] === 'string') &&
    isNumberOrNull(value['retentionNoticeAtMs']) &&
    (value['retentionDismissedAtMs'] === undefined ||
      isNumberOrNull(value['retentionDismissedAtMs'])) &&
    Array.isArray(value['parts']) &&
    value['parts'].every(isPart)
  );
}

export function isLocalChunkIndexEntry(value: unknown): value is LocalChunkIndexEntry {
  return (
    isObject(value) &&
    value['version'] === LOCAL_RECORD_VERSION &&
    typeof value['sessionId'] === 'string' &&
    typeof value['partNo'] === 'number' &&
    typeof value['seq'] === 'number' &&
    typeof value['size'] === 'number' &&
    typeof value['mimeType'] === 'string' &&
    typeof value['writtenAtMs'] === 'number' &&
    typeof value['final'] === 'boolean' &&
    typeof value['headerCopy'] === 'boolean'
  );
}
