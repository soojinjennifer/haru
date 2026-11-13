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
  Reflection,
  SessionBubbleCopy,
  SessionStatus,
  SessionSummary,
  ShortFeedback,
  StickerAward,
  UploadStatus,
} from '@haru/contracts';

/**
 * 완료 계열 상태 — `SessionDetail.completionBubble`(§3.2.3) 이 값을 갖고, 회고 제출(§3.10)과
 * 분석 조회(§3.11)가 허용되는 상태다 (Stage 5 Plan §7 C-6 · C-8).
 */
export const COMPLETION_STATUSES: ReadonlySet<SessionStatus> = new Set([
  'completed',
  'analyzing',
  'analyzed',
  'failed',
]);

export interface MockSessionRecord {
  summary: SessionSummary;
  childId: string;
  /** 오프라인 생성 멱등 키 (§3.2). 같은 키의 재생성은 같은 세션을 돌려준다. */
  clientSessionKey: string | null;
  sticker: StickerAward | null;
  completionBubble: SessionBubbleCopy;
  recordingId: string | null;
  /** Stage 5 — 이 세션의 회고 (세션당 1건, `REFLECTION_ALREADY_SUBMITTED`). */
  reflection: Reflection | null;
  /** Stage 5 — worker 가 `analyzed` 로 옮길 때 남긴 짧은 피드백 (FR-13). 그 전에는 `null`. */
  shortFeedback: ShortFeedback | null;
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
  /**
   * Stage 5 — 세션별 분석 조회 횟수. Mock worker 의 `analyzing → analyzed` 전이를 **호출 횟수**로
   * 결정한다 (시간 기반 비결정 전이 금지 — Plan §8, AC-5-14).
   */
  readonly analysisReads: Map<string, number>;
  /** 지난 세션 fixture 를 넣었는지 (최초 접근 시 1회). */
  seeded: boolean;
}

export function createMockSessionState(): MockSessionState {
  return {
    sessions: new Map(),
    recordings: new Map(),
    objects: new Map(),
    analysisReads: new Map(),
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
