/**
 * 세션 상태 → `RecordControl` 변형 — **순수 함수** (4b Plan §9 · §15 · AC-4-138 · Spec §15-3).
 *
 * | 입력 | 변형 | 근거 |
 * |---|---|---|
 * | 마이크 거부 · 녹음 수단 없음 · 대화 전용 | `permission-denied` | `N4B-13` (`D4-58` NB-9) · AC-4-63 |
 * | 동의 없음 · 전이 요청 처리 중 | `disabled` | `N4B-13` · AC-4-62 · Spec §7.1 |
 * | `recording` | `recording` (Pause) | `163:1588` |
 * | `paused` | `paused` (`Tap to resume`) | `298:1227` · `D4-51` 재개 = 토글 |
 * | 그 밖 (`ready` …) | `idle` (Record) | `163:1589` |
 *
 * 우선순위는 위에서 아래다 — 녹음 수단이 없으면 동의 여부와 무관하게 `permission-denied` 다.
 *
 * 화면 연결 (`S4-H2`, AC-4-134): 플래그는 `selectSessionRecordGate` 가 컨트롤러 단계(`phase`)와 세션
 * 모드에서 만든다 — 화면은 두 함수를 이어 부르기만 한다.
 */
import type { SessionMode, SessionStatus } from '@haru/contracts';

export type SessionRecordControlState =
  'idle' | 'recording' | 'paused' | 'disabled' | 'permission-denied';

export interface RecordControlStateInput {
  readonly status: SessionStatus;
  /** 마이크 권한 거부 · 녹음 수단 없음 (`permission_denied` · `mic_unavailable`). */
  readonly micUnavailable?: boolean;
  /** 대화 전용 세션 (`mode === 'conversation_only'`, `D4-44`). */
  readonly conversationOnly?: boolean;
  /** 동의가 없어 녹음을 시작할 수 없다 (AC-4-62). */
  readonly consentBlocked?: boolean;
  /** 응답을 기다리는 전이 요청이 있다. */
  readonly transitionPending?: boolean;
}

export function selectRecordControlState(
  input: RecordControlStateInput,
): SessionRecordControlState {
  if (input.micUnavailable === true || input.conversationOnly === true) return 'permission-denied';
  if (input.consentBlocked === true || input.transitionPending === true) return 'disabled';
  if (input.status === 'recording') return 'recording';
  if (input.status === 'paused') return 'paused';
  return 'idle';
}

/** `selectRecordControlState` 의 플래그 4개 — 컨트롤러 단계 · 세션 모드에서 만든다. */
export type SessionRecordGate = Required<Omit<RecordControlStateInput, 'status'>>;

/**
 * 컨트롤러 단계(`RecordingPhase` 문자열) · 세션 모드 → Record Control 플래그 (`S4-H2`, AC-4-134 · `N4B-13`).
 *
 * | 플래그 | 단계 / 모드 | 근거 |
 * |---|---|---|
 * | `micUnavailable` | `permission_denied` · `mic_unavailable` | AC-4-63 — 탭하면 안내 시트 |
 * | `conversationOnly` | `mode === 'conversation_only'` | `D4-44` · `D4-58` CP-6 |
 * | `consentBlocked` | `consent_blocked` | AC-4-62 — 컨트롤러가 동의 없음을 확인했다(클라이언트 차단 · 서버 `CONSENT_REQUIRED` 재동기화) |
 * | `transitionPending` | `requesting_permission` · `starting` · `stopping` | 컨트롤러가 명령을 처리 중 — 이 동안 들어온 명령은 `busy` 로 거절된다 |
 *
 * ⚠ `pendingTransitions > 0`(서버 응답 대기)은 **처리 중으로 보지 않는다** — 컨트롤러는 전이를 로컬에서 먼저
 * 반영하고(낙관적) 다음 명령을 순서대로 받는다. 그 동안 막으면 Pause·재개마다 변형이 깜빡이고, 오프라인에서는
 * 전송 실패까지 막힌다 (handoff `S4-H2` 판단 기록).
 */
export function selectSessionRecordGate(input: {
  readonly phase: string | undefined;
  readonly mode: SessionMode;
}): SessionRecordGate {
  const { phase } = input;
  return {
    micUnavailable: phase === 'permission_denied' || phase === 'mic_unavailable',
    conversationOnly: input.mode === 'conversation_only',
    consentBlocked: phase === 'consent_blocked',
    transitionPending:
      phase === 'requesting_permission' || phase === 'starting' || phase === 'stopping',
  };
}
