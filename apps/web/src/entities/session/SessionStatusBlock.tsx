/**
 * `SessionStatusBlock` — recording · paused 상태 블록 (Figma `298:1320` / `298:1398`, 4b Spec §2.2 · §2.3 · §4 #6).
 *
 * ```
 * flex column · gap 10 · 가운데                     높이 = 32 + 10 + 41 + 10 + 18 = 111
 * ├ 상태 pill  hug · white 74% · 그림자 없음 · pad 14/6 · gap 8
 * │   ├ dot 8   recording = 채운 원 teal / paused = 빈 원 stroke 1.5 secondary
 * │   └ 라벨    Subheadline 15/20 · primary          (`Recording` / `Paused`)
 * ├ 경과 시간  Bold 48/41 · tabular-nums · `mm:ss`    recording = primary / paused = secondary (고정)
 * └ 보조 줄    Footnote 13/18 · secondary            (`Up to 30:00` / `Tap the button to keep recording`)
 * ```
 *
 * - **표시만 한다.** 시간은 `RecordingController` 의 `recordedSeconds` 를 받는다 — 계산·타이머를 갖지
 *   않는다 (Plan §9 "계산은 RecordingController 소유"). paused 동안 값이 멈추는 것도 컨트롤러 몫이다.
 * - 문구는 소비자 copy 모듈이 넘긴다 (`rules/frontend.md` §8).
 * - 상태 구분은 **텍스트 + dot 형태 + 시간 색** 세 가지다 — reduced-motion 에서도 남는다 (AC-4-128).
 * - 접근성: 시간 = `role="timer"` + `aria-live="off"` (매초 읽지 않는다, AC-4-127) · dot 은 장식.
 * - 상태가 바뀌어도 같은 노드다 — 변형 클래스만 바뀐다.
 */
import { formatSessionClock } from './sessionClock';

export type SessionStatusBlockState = 'recording' | 'paused';

export interface SessionStatusBlockProps {
  state: SessionStatusBlockState;
  /** 실제 녹음 시간 (초) — 컨트롤러 스냅샷 값. */
  recordedSeconds: number;
  /** pill 라벨 (`Recording` / `Paused`). */
  label: string;
  /** 보조 줄 (`Up to 30:00` / `Tap the button to keep recording`). */
  hint: string;
}

export function SessionStatusBlock({
  state,
  recordedSeconds,
  label,
  hint,
}: SessionStatusBlockProps) {
  return (
    <div className={`haru-session-status haru-session-status--${state}`}>
      <span className="haru-session-status__pill">
        <span className="haru-session-status__dot" aria-hidden="true" />
        <span className="haru-session-status__label">{label}</span>
      </span>
      <span className="haru-session-status__time" role="timer" aria-live="off">
        {formatSessionClock(recordedSeconds)}
      </span>
      <span className="haru-session-status__hint">{hint}</span>
    </div>
  );
}
