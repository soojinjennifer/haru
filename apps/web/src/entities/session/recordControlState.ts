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
 * ⚠ 화면 연결 범위: `S4-F2` 는 `status` 만 넘긴다(`idle`·`recording`·`paused`). 동의·마이크·대화 전용·
 * 처리 중 플래그의 **화면 연결**과 안내 시트는 `S4-H2`(AC-4-134)가 한다 — 이 함수는 그때 그대로 쓴다.
 */
import type { SessionStatus } from '@haru/contracts';

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
