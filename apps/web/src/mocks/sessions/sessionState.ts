/**
 * 세션 · 녹음 · 업로드 객체의 **서버 측 상태** (Mock).
 *
 * `MockSessionApi` · `MockRecordingApi` · `MockUploadTransport` 가 **같은 인스턴스**를 공유한다 —
 * 실제 서버에서 세 경로가 같은 DB·Storage 를 보는 것과 같다. 그래야
 *  - `complete` 확정이 세션을 `analyzing` 으로 옮기고 (AC-4-26)
 *  - 사용자 `Discard`(`to='abandoned'`)가 녹음을 `deleted` 로 만들며 (`D4-13`, §3.9)
 *  - 업로드되지 않은 part 로 `complete` 하면 `RECORDING_INCOMPLETE` 가 나온다 (AC-4-30).
 *
 * 번들마다 새로 만든다 — 테스트 간 상태가 새지 않는다. 시간·ID 는 만들지 않는다(호출자가 주입 값을 넣는다).
 */
import type {
  SessionBubbleCopy,
  SessionSummary,
  StickerAward,
  UploadStatus,
} from '@haru/contracts';

export interface MockSessionRecord {
  summary: SessionSummary;
  childId: string;
  /** 오프라인 생성 멱등 키 (§3.2). 같은 키의 재생성은 같은 세션을 돌려준다. */
  clientSessionKey: string | null;
  sticker: StickerAward | null;
  completionBubble: SessionBubbleCopy;
  recordingId: string | null;
}

export interface MockUploadPartRecord {
  partNo: number;
  /** `init` 이 선언한 part 크기. */
  bytes: number;
  objectKey: string;
  /** 현재 유효한(마지막으로 발급된) 토큰. */
  uploadToken: string;
  /** 발급 시점부터 만료로 취급하는 토큰인지 (`upload-token-expired` · `recording-deleted`). */
  tokenExpired: boolean;
  /** 서버가 받은 바이트 수 (TUS offset). */
  offset: number;
  /** `upload-retry` — 이 part 가 이미 1회 실패했는지. */
  failedOnce: boolean;
}

export interface MockRecordingRecord {
  recordingId: string;
  sessionId: string;
  parts: Map<number, MockUploadPartRecord>;
  uploadStatus: UploadStatus;
  expiresAt: string | null;
  deletedAt: string | null;
}

export interface MockSessionState {
  readonly sessions: Map<string, MockSessionRecord>;
  readonly recordings: Map<string, MockRecordingRecord>;
  /** `objectKey` → 소속 녹음 id. `MockUploadTransport` 가 대상 part 를 찾는다. */
  readonly objects: Map<string, string>;
  /** 지난 세션 fixture 를 넣었는지 (최초 접근 시 1회). */
  seeded: boolean;
}

export function createMockSessionState(): MockSessionState {
  return {
    sessions: new Map(),
    recordings: new Map(),
    objects: new Map(),
    seeded: false,
  };
}

/** 진행 중(ready/recording/paused) 세션 — `SESSION_ALREADY_ACTIVE` 판정 기준 (§1.2). */
export function findActiveSession(state: MockSessionState): MockSessionRecord | undefined {
  return [...state.sessions.values()].find((record) =>
    ['ready', 'recording', 'paused'].includes(record.summary.status),
  );
}

/**
 * 녹음을 서버에서 지운 것으로 표시한다 (`Discard` → `abandoned`, `P4-BIP-21`).
 * 이미 올라온 part 도 함께 무효다 — 이후 전송·토큰 재발급·확정은 `RECORDING_DELETED`.
 */
export function markRecordingDeleted(
  state: MockSessionState,
  recordingId: string | null,
  nowIso: string,
): void {
  if (recordingId === null) return;
  const recording = state.recordings.get(recordingId);
  if (recording === undefined || recording.uploadStatus === 'deleted') return;

  recording.uploadStatus = 'deleted';
  recording.deletedAt = nowIso;
  recording.expiresAt = null;
}
