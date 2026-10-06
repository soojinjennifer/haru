import { useId, type ReactNode } from 'react';

import { cx } from '../lib/cx';

/** 우측 액션 — `See all`. 문구는 호출 측이 소유한다 (`packages/ui` 는 copy 를 갖지 않는다). */
export interface SectionHeaderAction {
  label: string;
  onPress: () => void;
  /**
   * 눌릴 수 없는 상태 (예: `Favorites` 0건 → "See all" 비활성).
   * `aria-disabled` 로 표시하고 포커스는 유지한다 — 사라지지 않는 섹션 구조를 지키기 위해서다.
   */
  disabled?: boolean;
}

export interface SectionHeaderProps {
  title: string;
  /** heading 레벨. 페이지 `<h1>` 은 `TopBar` 가 갖는다 (Library Design Spec §9.4). */
  as?: 'h2' | 'h3';
  /** `action` 모드 — `<button>`. `meta` 와 **동시에 쓰지 않는다**. */
  action?: SectionHeaderAction;
  /**
   * `meta` 모드 — `3 of 5 nights` 같은 **비대화형** 텍스트 (`L-OPEN-17`).
   * 값이 없으면(`plannedNights === null`) 넘기지 않는다 — 헤더 높이는 그대로 유지된다.
   */
  meta?: ReactNode;
}

/**
 * SectionHeader — Library Design Spec §3.1 (Figma `163:1624` · `163:1632` · `30:138` · `145:1142`
 * + 시트 헤더, **7곳** 실측).
 *
 * 제목(17/Bold) + 우측 슬롯을 `space-between` · baseline 으로 놓는다.
 * 우측 슬롯은 **두 모드**다:
 *
 * | 모드 | 요소 | 예 |
 * |---|---|---|
 * | `action` | `<button>` (hit area 44 — §9.2) | `See all` |
 * | `meta` | `<span>` — **비대화형** | `3 of 5 nights` |
 *
 * 접근성 이름(§9.4): "See all" 3개가 같은 이름이면 구분되지 않으므로 액션의 이름은
 * **`{label} {섹션 제목}`** 이다. 문자열을 조립하지 않고 `aria-labelledby` 로 **자신 + 제목**을
 * 가리켜 만든다 — `packages/ui` 안에 문구를 만들지 않는다.
 *
 * 높이를 고정하지 않는다 (Figma 20 은 결과값) — 텍스트 200% 확대에서 늘어나야 한다.
 */
export function SectionHeader({ title, as = 'h2', action, meta }: SectionHeaderProps) {
  const titleId = useId();
  const actionId = useId();
  const Heading = as;

  return (
    <div className="haru-section-header">
      <Heading id={titleId} className="haru-section-header__title">
        {title}
      </Heading>
      {action === undefined ? (
        meta === undefined ? null : (
          <span className="haru-section-header__meta">{meta}</span>
        )
      ) : (
        <button
          type="button"
          id={actionId}
          className={cx(
            'haru-section-header__action',
            'haru-focus-ring',
            action.disabled === true && 'haru-section-header__action--disabled',
          )}
          aria-labelledby={`${actionId} ${titleId}`}
          aria-disabled={action.disabled === true ? true : undefined}
          onClick={() => {
            if (action.disabled === true) return;
            action.onPress();
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
