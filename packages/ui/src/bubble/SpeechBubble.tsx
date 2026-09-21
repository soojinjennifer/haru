import type { ReactNode } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.20 — Figma `88:721` Type2 / sessopn. */
export type SpeechBubbleTail = 'bottom-right' | 'top-center' | 'none';

export type SpeechBubbleAlign = 'start' | 'center';

export interface SpeechBubbleProps {
  children: ReactNode;
  tail?: SpeechBubbleTail;
  align?: SpeechBubbleAlign;
}

/**
 * SpeechBubble — Design Spec §4.20.
 *
 * 시각 껍데기만 담당한다. 문구·상태·캐릭터 연결은 Domain `CharacterBubble`(Stage 2)이 한다.
 * 내용이 동적으로 바뀌면 **부모**가 `aria-live="polite"` 를 붙인다.
 */
export function SpeechBubble({ children, tail = 'none', align = 'start' }: SpeechBubbleProps) {
  return (
    <div className={cx('haru-bubble', `haru-bubble--tail-${tail}`, `haru-bubble--align-${align}`)}>
      <div className="haru-bubble__content">{children}</div>
      {tail === 'none' ? null : <span className="haru-bubble__tail" aria-hidden="true" />}
    </div>
  );
}
