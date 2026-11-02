import type { ButtonHTMLAttributes } from 'react';

import { Icon, type IconName } from '../icon/Icon';
import { cx } from '../lib/cx';

/**
 * Figma 변형과 1:1 (4b Design Spec §2.5 · `D4-51`):
 *
 * | state | Figma | 글리프 | 시각 라벨 | 차이 |
 * |---|---|---|---|---|
 * | `idle` | `163:1589` Record | mic | `Tap to recording` | ready pulse |
 * | `recording` | `163:1588` Pause | pause | 없음 | |
 * | `paused` | `298:1227` Paused | mic | `Tap to resume` | |
 * | `disabled` | `298:1236` Disabled | mic | `Tap to recording` | 컴포넌트 opacity .5 + **코어 그림자 0** |
 * | `permission-denied` | `298:1245` PermissionDenied | mic-off (`haru:record-mic-off`, `298:1254`) | `Mic is off` | 링·코어 gray-2 |
 *
 * Stage 4 Design Spec §2.6.3 의 `disabled?: boolean` prop 은 `state="disabled"` 로 흡수됐다 (4b §4 #1).
 */
export type RecordControlState = 'idle' | 'recording' | 'paused' | 'disabled' | 'permission-denied';

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
   * 코어 위 시각 라벨 (`Tap to recording` · `Tap to resume` · `Mic is off`). `recording` 에서는 렌더하지
   * 않는다 — `Pause` 변형에는 라벨 노드가 없다 (Spec §2.6.2). 시각 라벨이므로 접근성 트리에서 숨긴다
   * (이름은 `label` 이 준다). 문구는 소비자 copy 모듈이 상태별로 넘긴다.
   */
  caption?: string;
  onToggle?: () => void;
}

const GLYPH: Record<RecordControlState, IconName> = {
  idle: 'haru:record-mic',
  recording: 'haru:record-pause',
  paused: 'haru:record-mic',
  disabled: 'haru:record-mic',
  'permission-denied': 'haru:record-mic-off',
};

/**
 * RecordControl — Stage 4 Design Spec §2.6 (Figma `163:1590`) + 4b Spec §2.5 (`298:1261` 변형 3).
 *
 * **시각만** 담당한다. 상태 머신은 `features/recording` 의 `RecordingController` 가 소유하고 이 컴포넌트는
 * prop 으로 받는다 (`rules/architecture.md` §7). 상태 → 변형 선택은 소비자의 순수 함수다 (AC-4-138).
 *
 * - 링 2겹(150 · 122)은 `border` 로 그린다 — Figma 에셋은 stroke 2 가 박스 **안쪽**에 붙는 원이다
 *   (`r = 74`, stroke 2 → 바깥 경계 75 = 박스). SVG 에셋을 넣지 않는다 (Spec §2.6.3).
 * - ⚠ 상태가 바뀌어도 **다시 마운트하지 않는다** — 같은 `<button>` 에서 글리프·라벨만 교체한다
 *   (AC-4-111 ④, `R-BASELINE-1`).
 * - 터치 타깃 150×150 ≥ 44×44.
 * - `disabled` 변형은 `aria-disabled` 를 스스로 단다 — 누름만 무시하고 포커스는 유지한다 (`Button` 과
 *   같은 규칙). 사유 문구(`aria-describedby`)는 소비자 책임이다. 다른 변형에서도 소비자가
 *   `aria-disabled` 를 주면 같은 방식으로 막힌다.
 */
export function RecordControl({ state, label, caption, onToggle, ...rest }: RecordControlProps) {
  const blocked =
    state === 'disabled' || rest['aria-disabled'] === true || rest['aria-disabled'] === 'true';
  const showCaption = state !== 'recording' && caption !== undefined && caption.length > 0;

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
      aria-disabled={blocked || undefined}
      onClick={() => {
        if (blocked) return;
        onToggle?.();
      }}
    >
      <span className="haru-record__ring haru-record__ring--outer" aria-hidden="true" />
      <span className="haru-record__ring haru-record__ring--mid" aria-hidden="true" />
      <span className="haru-record__core" aria-hidden="true" />
      <span className="haru-record__glyph" aria-hidden="true">
        <Icon name={GLYPH[state]} decorative />
      </span>
      {showCaption ? (
        <span className="haru-record__caption" aria-hidden="true">
          {caption}
        </span>
      ) : null}
    </button>
  );
}
