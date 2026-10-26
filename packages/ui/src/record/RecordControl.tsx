import type { ButtonHTMLAttributes } from 'react';

import { Icon } from '../icon/Icon';
import { cx } from '../lib/cx';

/**
 * Figma `163:1590` 의 변형과 1:1 — `idle` = `Property 1=Record`(`163:1589`) ·
 * `recording` = `Property 1=Pause`(`163:1588`). Stage 4 Design Spec §2.6.
 *
 * `paused` · `disabled` · `permission-denied`(4b Spec §2.5 — `298:1227`·`1236`·`1245`)는
 * 다음 작업 단위(`S4-F2`)가 이 타입에 **추가**한다 (기존 값은 바뀌지 않는다).
 */
export type RecordControlState = 'idle' | 'recording';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style' | 'children' | 'onClick' | 'type' | 'aria-label'
>;

export interface RecordControlProps extends NativeButtonProps {
  state: RecordControlState;
  /**
   * 접근성 이름 — **상태가 아니라 동작**을 읽는다 (`Start recording` / `Pause recording`, Spec §2.6.3).
   * `packages/ui` 는 문구를 소유하지 않는다 — 소비자 copy 모듈이 넘긴다.
   */
  label: string;
  /**
   * 코어 위 시각 라벨 (Figma `140:2854` `Tap to recording`). `idle` 에서만 렌더한다 — `Pause` 변형에는
   * 라벨 노드가 없다 (Spec §2.6.2). 시각 라벨이므로 접근성 트리에서 숨긴다(이름은 `label` 이 준다).
   */
  caption?: string;
  onToggle?: () => void;
}

/**
 * RecordControl — Stage 4 Design Spec §2.6 (Figma `163:1590`).
 *
 * **시각만** 담당한다. 상태 머신은 `features/recording` 의 `RecordingController` 가 소유하고 이 컴포넌트는
 * prop 으로 받는다 (`rules/architecture.md` §7).
 *
 * - 링 2겹(150 · 122)은 `border` 로 그린다 — Figma 에셋은 stroke 2 가 박스 **안쪽**에 붙는 원이다
 *   (`r = 74`, stroke 2 → 바깥 경계 75 = 박스). SVG 에셋을 넣지 않는다 (Spec §2.6.3).
 * - ⚠ 상태가 바뀌어도 **다시 마운트하지 않는다** — 같은 `<button>` 에서 글리프·라벨만 교체한다
 *   (AC-4-111 ④, `R-BASELINE-1`).
 * - 터치 타깃 150×150 ≥ 44×44.
 * - `aria-disabled` 를 주면 누름만 무시하고 포커스는 유지한다 (`Button` 과 같은 규칙).
 */
export function RecordControl({ state, label, caption, onToggle, ...rest }: RecordControlProps) {
  const blocked = rest['aria-disabled'] === true || rest['aria-disabled'] === 'true';
  const showCaption = state === 'idle' && caption !== undefined && caption.length > 0;

  return (
    <button
      {...rest}
      type="button"
      className={cx(
        'haru-record',
        'haru-focus-ring',
        `haru-record--${state}`,
        showCaption && 'haru-record--captioned',
      )}
      aria-label={label}
      onClick={() => {
        if (blocked) return;
        onToggle?.();
      }}
    >
      <span className="haru-record__ring haru-record__ring--outer" aria-hidden="true" />
      <span className="haru-record__ring haru-record__ring--mid" aria-hidden="true" />
      <span className="haru-record__core" aria-hidden="true" />
      <span className="haru-record__glyph" aria-hidden="true">
        <Icon name={state === 'idle' ? 'haru:record-mic' : 'haru:record-pause'} decorative />
      </span>
      {showCaption ? (
        <span className="haru-record__caption" aria-hidden="true">
          {caption}
        </span>
      ) : null}
    </button>
  );
}
