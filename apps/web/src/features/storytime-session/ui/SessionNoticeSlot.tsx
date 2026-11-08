/**
 * 공지 슬롯 — recording · paused 의 **유연 간격**(상태 블록 bottom ~ Record top) 안 `InlineAlert` 1개
 * (4b Design Spec §7.2, C13-4B-8 · 허용 차이 `AD-S4-14`, `D4-58` CP-5 채택).
 *
 * - 지금 들어가는 공지 = Web 백그라운드 경고(`D4-26` 조건 없는 안내 · `D4-111`) 1종. 30분 근접 경고는
 *   임계값이 정해지지 않아 넣지 않았다 (handoff `S4-H2` H2-D3).
 * - **Figma 요소를 하나도 움직이지 않는다** — 슬롯은 `__stage` 의 남는 공간에만 놓인다(`margin-block: auto`).
 *   stage 는 `flex: 1 · min-block-size: 0` 이라 슬롯이 stage 를 키우지 않는다.
 * - 남는 공간이 슬롯보다 작으면(세로 압축, §8.2) 슬롯 대신 `Toast` 로 알린다 (§7.2 셋째 줄). 판정 = 렌더 직후
 *   stage 가 넘치는지(`scrollHeight > clientHeight`) 한 번 잰다 — 넘치면 슬롯을 거두고 `onOverflow` 를 부른다.
 * - `InlineAlert info` 는 `role="status"` + `aria-live="polite"` 다 (컴포넌트 기본값). 닫기 = `Dismiss`.
 * - `R-SHADOW-1`: `InlineAlert` 는 그림자가 없다 → 새 overflow 0, inset 불필요.
 */
import { InlineAlert } from '@haru/ui';
import { useLayoutEffect, useRef, type RefObject } from 'react';

import { storytimeSessionCopy } from '../copy';

export type SessionNotice = 'background';

export interface SessionNoticeSlotProps {
  notice: SessionNotice;
  /** 넘침을 재는 기준 — `__stage` 요소. */
  stageRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
  /** 슬롯이 들어가지 않았다 — 호출한 쪽이 Toast 로 바꾼다. */
  onOverflow: () => void;
}

export function SessionNoticeSlot({
  notice,
  stageRef,
  onDismiss,
  onOverflow,
}: SessionNoticeSlotProps) {
  const copy = storytimeSessionCopy.notices;
  const reported = useRef(false);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (stage === null || reported.current) return;
    if (stage.scrollHeight > stage.clientHeight) {
      reported.current = true;
      onOverflow();
    }
  }, [notice, stageRef, onOverflow]);

  const content = copy[notice];
  return (
    <div className="haru-session__notice">
      <InlineAlert
        tone="info"
        title={content.title}
        description={content.description}
        onDismiss={onDismiss}
        dismissLabel={copy.dismiss}
      />
    </div>
  );
}
