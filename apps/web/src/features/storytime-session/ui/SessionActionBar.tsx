/**
 * `SessionActionBar` — 세션 하단 바 (Figma `285:1445` "After_record", Stage 4 Design Spec §2.3.3).
 *
 * ```
 * <div role="group">  279 = 135 + 9 + 135 · 열 가운데 (`D4-19`, 허용 차이 `AD-S4-5`)
 *   Button neutral  `Discard`   (Figma `163:1618` = `Accent/Secondary`, 가값 `P-25`)
 *   Button accent   `Submit`    (Figma `163:1620` = `Accent/Rest`)
 * ```
 *
 * - `ready` → **둘 다 비활성** = `aria-disabled` + 포커스 가능 + 사유 `aria-describedby` (`D4-18`,
 *   AC-4-111 ②·AC-4-117 ③). 시각은 전역 `opacity .5` 하나 — 비활성 전용 색·테두리 0건.
 * - `recording` · `paused` → 둘 다 활성 (`D4-12`).
 * - `conversation` (대화 전용 ready, `D4-58` CP-6 · 4b Spec §7.1) → `Submit` **활성** · `Discard` 비활성
 *   (지울 녹음이 없다). 사유 문구는 `Discard` 에만 붙는다.
 * - `submitting` — `Submit` 을 누른 뒤 응답까지: `Submit` 은 loading(누름 무시·폭 유지), `Discard` 는
 *   누름만 무시한다 (Stage 4 Spec §2.5.1 ① "두 버튼 잠금" — 중복 제출 방지). 시각 변화는 Spinner 뿐이다.
 * - ⚠ 상태가 바뀌어도 **다시 마운트하지 않는다** — 같은 버튼에서 `aria-disabled` 만 토글한다.
 * - 320px 컬럼(272)에서는 버튼이 각 131.5 로 줄어든다 (허용 차이 `AD-S4-10`, `D4-49`).
 * - Figma 에 Hover·Pressed 변형이 없어 공통 선언만 쓴다.
 */
import { Button } from '@haru/ui';

import { storytimeSessionCopy } from '../copy';

export type SessionActionBarState = 'ready' | 'recording' | 'paused' | 'conversation';

export interface SessionActionBarProps {
  state: SessionActionBarState;
  /** ready 비활성 사유 문구의 id (화면에 하나뿐인 숨김 텍스트). */
  reasonId: string;
  /** `Submit` 처리 중 — 두 버튼 잠금 (Stage 4 Spec §2.5.1 ①). */
  submitting?: boolean;
  onDiscard: () => void;
  onSubmit: () => void;
}

export function SessionActionBar({
  state,
  reasonId,
  submitting = false,
  onDiscard,
  onSubmit,
}: SessionActionBarProps) {
  const copy = storytimeSessionCopy.actions;
  const blockedProps = { 'aria-disabled': true, 'aria-describedby': reasonId } as const;
  const discardProps = state === 'ready' || state === 'conversation' ? blockedProps : {};
  const submitProps = state === 'ready' ? blockedProps : {};

  return (
    <div className="haru-session-actions" role="group" aria-label={copy.groupLabel}>
      <Button
        variant="neutral"
        {...discardProps}
        onPress={() => {
          if (!submitting) onDiscard();
        }}
      >
        {copy.discard}
      </Button>
      <Button variant="accent" {...submitProps} loading={submitting} onPress={onSubmit}>
        {copy.submit}
      </Button>
      <span className="haru-visually-hidden" id={reasonId}>
        {state === 'conversation' ? copy.conversationReason : copy.readyReason}
      </span>
    </div>
  );
}
