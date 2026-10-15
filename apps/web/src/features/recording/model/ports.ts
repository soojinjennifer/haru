/**
 * `RecordingController` 가 바깥과 만나는 포트 — **경계만** 정의한다.
 *
 * | 포트 | 이 단위(`S4-D`) | 구현 담당 |
 * |---|---|---|
 * | `RecordingSink` | interface 만 | **`S4-E`** `LocalRecordingStore` (OPFS + IndexedDB) |
 * | `SessionTransitionPort` | interface + `sessionApi` 직결 구현(`session-transition-port.ts`) | **`S4-E`** `SessionOutbox` 가 감싼다 (오프라인 적재·재전송) |
 *
 * 클라이언트 전용 타입이므로 `packages/contracts` 에 두지 않는다 (Plan §5.2-6).
 * 요청·응답 모양 자체는 contracts 타입을 그대로 쓴다.
 */
import type {
  RecordingContainer,
  SessionStatus,
  SessionTransitionRequest,
  SessionTransitionResult,
} from '@haru/contracts';

/** part = **연속 녹음 구간** (`D4-24`). 캡처가 끊겼다 다시 시작되면 다음 번호가 된다. */
export interface RecordingPartStart {
  readonly sessionId: string;
  readonly partNo: number;
  readonly startedAtMs: number;
}

export interface RecordingChunkWrite {
  readonly sessionId: string;
  readonly partNo: number;
  readonly seq: number;
  readonly bytes: Uint8Array;
  /** 청크가 담고 온 MIME 원문 (`D4-23`). */
  readonly mimeType: string;
  /**
   * part 의 컨테이너 — **그 part 의 첫 청크에서 확정**한다 (`M-3`). 허용 base type 이 아니면 `null`
   * (그 경우 업로드 contract 가 받지 않는다 — `S4-E` 가 판단).
   */
  readonly container: RecordingContainer | null;
  readonly final: boolean;
}

export interface RecordingPartEnd {
  readonly sessionId: string;
  readonly partNo: number;
  readonly endedAtMs: number;
  readonly chunkCount: number;
  readonly byteLength: number;
  readonly mimeType: string;
  readonly container: RecordingContainer | null;
}

/**
 * 로컬 녹음 저장 포트. ⭐ Controller 는 **삭제를 `discardSession` 한 곳에서만** 요청하며,
 * 그것도 **서버가 `abandoned` 전이를 확정한 뒤**다 (`D4-13` 삭제 순서). 자동 종료·인터럽션·완료는
 * 아무것도 지우지 않는다 (AC-4-45 · `rules/architecture.md` §7).
 */
export interface RecordingSink {
  beginPart(part: RecordingPartStart): Promise<void>;
  appendChunk(chunk: RecordingChunkWrite): Promise<void>;
  endPart(part: RecordingPartEnd): Promise<void>;
  discardSession(sessionId: string): Promise<void>;
}

export interface SessionServerState {
  readonly status: SessionStatus;
  readonly recordedSeconds: number;
}

/**
 * 세션 전이 전송 포트. 요청 1회 = `send` 1회. 실패는 그대로 던진다 (`HaruApiError` · `NetworkError`).
 * Controller 는 재시도하지 않는다 — 재전송은 `S4-E` `SessionOutbox` 의 책임이다.
 */
export interface SessionTransitionPort {
  send(request: SessionTransitionRequest): Promise<SessionTransitionResult>;
  /** 서버 상태 조회 — `SESSION_INVALID_TRANSITION` 후 재동기화에 쓴다 (AC-4-34). */
  fetchState(): Promise<SessionServerState>;
}
