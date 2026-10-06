import type { ReactNode } from 'react';

import { Icon } from '../icon/Icon';
import { IconButton } from '../button/IconButton';
import { cx } from '../lib/cx';

/**
 * Design Spec §4.20 — Figma `50:176` `Bubble` (`type=Type2`).
 *
 * Stage 3 Home 재대조(2026-10-05)에서 Home 버블이 `88:922` → **`261:1293`**(`50:176` 인스턴스)
 * 로 교체되었고 tail 이 본체 좌측 끝에서 **76.32%** 지점(= `bottom-right`)으로 옮겨졌다.
 */
export type SpeechBubbleTail = 'bottom-right' | 'bottom-left' | 'top-center' | 'none';

export type SpeechBubbleAlign = 'start' | 'center';

export interface SpeechBubbleProps {
  children: ReactNode;
  /**
   * 주 문구 아래 **보조 한 줄** (Figma `I261:1293;50:173`). 작은 글씨·보조 색이며
   * 값이 없으면 슬롯 자체를 렌더하지 않는다 (빈 줄을 만들지 않는다).
   */
  hint?: ReactNode;
  tail?: SpeechBubbleTail;
  align?: SpeechBubbleAlign;
  /**
   * 닫기 버튼을 켠다. **`InlineAlert` 와 같은 API**이며(`onDismiss` + `dismissLabel`) 둘 다
   * 주어질 때만 렌더한다 — 접근 가능한 이름 없는 버튼을 만들지 않기 위해서다.
   *
   * ⚠ **Figma `50:176` 에는 닫기 버튼이 없다.** 사용자 지시(2026-10-05)로 추가했으며
   * **허용 차이 등록 + 디자이너 확인** 대상이다. 본체 기하(303 · radius 22 · tail 76.32%)를
   * 바꾸지 않도록 절대 배치한다.
   */
  onDismiss?: () => void;
  dismissLabel?: string;
  /**
   * 주 문구를 `--bubble-content-max-lines`(4) 줄에서 **말줄임**한다 (`W-5`, approvals §13.3).
   *
   * 기본은 끄기다 — 상한의 근거가 **Home 캐릭터 얼굴 위치 실측**(눈 상단 y=183)이라 다른
   * 화면에 그대로 적용할 근거가 없다. 고정 높이가 아니므로 켜도 1~4줄은 그대로 가변이다.
   */
  clampContent?: boolean;
}

/**
 * SpeechBubble — Design Spec §4.20.
 *
 * 시각 껍데기만 담당한다. 문구·상태·캐릭터 연결은 Domain `CharacterBubble`(Stage 2)이 한다.
 * 내용이 동적으로 바뀌면 **부모**가 `aria-live="polite"` 를 붙인다.
 */
export function SpeechBubble({
  children,
  hint,
  tail = 'none',
  align = 'start',
  onDismiss,
  dismissLabel,
  clampContent = false,
}: SpeechBubbleProps) {
  const dismissible = onDismiss !== undefined && dismissLabel !== undefined;

  return (
    <div
      className={cx(
        'haru-bubble',
        `haru-bubble--tail-${tail}`,
        `haru-bubble--align-${align}`,
        dismissible && 'haru-bubble--dismissible',
        clampContent && 'haru-bubble--clamp',
      )}
    >
      <div className="haru-bubble__content">{children}</div>
      {hint === undefined || hint === null ? null : <div className="haru-bubble__hint">{hint}</div>}
      {dismissible ? (
        <span className="haru-bubble__dismiss">
          <IconButton
            variant="plain"
            icon={<Icon name="x" size="md" decorative />}
            label={dismissLabel}
            onPress={onDismiss}
          />
        </span>
      ) : null}
      {tail === 'none' ? null : <span className="haru-bubble__tail" aria-hidden="true" />}
    </div>
  );
}
