/**
 * 하이라이트 클립 플레이어 상태 머신 — Stage 7 Plan §5.4 · Spec §2.5 (`S7-E`, `C13-S7-3`).
 *
 * 순수 reducer 다 (오디오 요소 · 네트워크 · 시계 0). 부수 효과는 `useClipPlayer` 가 맡고 이벤트로 결과만 알린다.
 *
 * 행 상태 6종 (Plan §12.2): `idle` · `loading` · `playing` · `paused` · `unavailable` · `error`(+ `offline` 구분).
 * Spec 표의 *ended* 는 별도 상태가 아니라 **`idle` + 위치 0** 이다 (버튼 `play` · 진행 0 — 표시가 idle 과 같다).
 *
 * ```
 * idle | paused | error ──requested──▶ loading ──started──▶ playing ──paused──▶ paused
 *                                        │                    │ ──buffering──▶ loading
 *                                        │                    └──ended──▶ idle(0)
 *                                        ├──failed──▶ error (generic | offline)
 *                                        └──deleted─▶ unavailable (종착 — 재시도 0)
 * 다른 행 requested → 이 행(playing | loading) ▶ paused   (동시 재생 1개 — AC-7-50)
 * released (화면 이탈 · 탭 숨김) → 활성 행(playing | loading) ▶ paused
 * ```
 */
import type { ReportHighlightClip } from '@haru/contracts';

export type ClipRowStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'unavailable' | 'error';

export type ClipErrorKind = 'generic' | 'offline';

export interface ClipRowState {
  status: ClipRowStatus;
  /** 재생 위치(초). 일시정지 · 다른 클립 전환 · 이탈 뒤 이어 듣기에 쓴다. */
  positionSeconds: number;
  /** `status === 'error'` 일 때만 값이 있다. */
  errorKind: ClipErrorKind | null;
}

export interface ClipPlayerState {
  rows: Readonly<Record<string, ClipRowState>>;
  /** 오디오 요소를 쓰고 있는(또는 쓰려는) 클립. 한 번에 하나. */
  activeClipId: string | null;
}

export type ClipPlayerEvent =
  /** 재생 탭 — URL 조회 · 버퍼링 시작. */
  | { type: 'requested'; clipId: string }
  | { type: 'started'; clipId: string }
  | { type: 'buffering'; clipId: string }
  | { type: 'progressed'; clipId: string; positionSeconds: number }
  | { type: 'paused'; clipId: string; positionSeconds: number }
  | { type: 'ended'; clipId: string }
  | { type: 'failed'; clipId: string; kind: ClipErrorKind }
  /** `RECORDING_DELETED` (삭제 · 보관 만료). */
  | { type: 'deleted'; clipId: string }
  /** 화면 이탈 · 탭 숨김 — 활성 행 정지. */
  | { type: 'released' };

const IDLE: ClipRowState = { status: 'idle', positionSeconds: 0, errorKind: null };
const UNAVAILABLE: ClipRowState = { status: 'unavailable', positionSeconds: 0, errorKind: null };

/** 오디오가 붙어 있는(또는 붙는 중인) 상태 — 다른 클립 재생 · 이탈 시 `paused` 로 돌린다. */
function isEngaged(row: ClipRowState): boolean {
  return row.status === 'playing' || row.status === 'loading';
}

/**
 * 초기 상태 — `expiresAt` 이 지난 클립은 **조회 전에도** `unavailable` (`N7-17`).
 * @param isExpired 보관 만료 판정 (entity `isClipRetentionExpired` + 주입 시계)
 */
export function createClipPlayerState(
  clips: readonly Pick<ReportHighlightClip, 'id' | 'expiresAt'>[],
  isExpired: (clip: Pick<ReportHighlightClip, 'expiresAt'>) => boolean,
): ClipPlayerState {
  const rows: Record<string, ClipRowState> = {};
  for (const clip of clips) rows[clip.id] = isExpired(clip) ? UNAVAILABLE : IDLE;
  return { rows, activeClipId: null };
}

/** 모르는 id 는 idle 로 본다 (목록 밖 이벤트는 무시된다). */
export function clipRowOf(state: ClipPlayerState, clipId: string): ClipRowState {
  return state.rows[clipId] ?? IDLE;
}

function withRow(state: ClipPlayerState, clipId: string, row: ClipRowState): ClipPlayerState {
  return { ...state, rows: { ...state.rows, [clipId]: row } };
}

function pauseRow(row: ClipRowState): ClipRowState {
  return isEngaged(row) ? { ...row, status: 'paused' } : row;
}

export function clipPlayerReducer(state: ClipPlayerState, event: ClipPlayerEvent): ClipPlayerState {
  if (event.type === 'released') {
    const active = state.activeClipId;
    if (active === null) return state;
    const next = withRow(state, active, pauseRow(clipRowOf(state, active)));
    return { ...next, activeClipId: null };
  }

  const { clipId } = event;
  if (!(clipId in state.rows)) return state;
  const row = clipRowOf(state, clipId);
  // 불가 상태는 종착이다 — 어떤 이벤트도 되돌리지 않는다 (재시도 0, Spec §14 `S7-E`).
  if (row.status === 'unavailable') return state;

  switch (event.type) {
    case 'requested': {
      if (row.status === 'loading') return state;
      let next = state;
      const previous = state.activeClipId;
      if (previous !== null && previous !== clipId) {
        next = withRow(next, previous, pauseRow(clipRowOf(next, previous)));
      }
      next = withRow(next, clipId, { ...row, status: 'loading', errorKind: null });
      return { ...next, activeClipId: clipId };
    }
    case 'started':
      if (state.activeClipId !== clipId) return state;
      if (row.status !== 'loading' && row.status !== 'paused' && row.status !== 'playing') {
        return state;
      }
      return withRow(state, clipId, { ...row, status: 'playing', errorKind: null });
    case 'buffering':
      if (state.activeClipId !== clipId || row.status !== 'playing') return state;
      return withRow(state, clipId, { ...row, status: 'loading' });
    case 'progressed':
      if (state.activeClipId !== clipId) return state;
      return withRow(state, clipId, { ...row, positionSeconds: event.positionSeconds });
    case 'paused':
      if (!isEngaged(row)) return state;
      return withRow(state, clipId, {
        ...row,
        status: 'paused',
        positionSeconds: event.positionSeconds,
      });
    case 'ended':
      return withRow(state, clipId, IDLE);
    case 'failed': {
      const next = withRow(state, clipId, { ...row, status: 'error', errorKind: event.kind });
      return state.activeClipId === clipId ? { ...next, activeClipId: null } : next;
    }
    case 'deleted': {
      const next = withRow(state, clipId, UNAVAILABLE);
      return state.activeClipId === clipId ? { ...next, activeClipId: null } : next;
    }
  }
}

/** `m:ss` — 클립은 10~15초지만 schema 는 1 이상 정수만 강제하므로 분 단위도 처리한다. */
export function formatClipTime(seconds: number): string {
  const whole = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${String(minutes)}:${String(rest).padStart(2, '0')}`;
}
