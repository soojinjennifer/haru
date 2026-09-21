import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Spinner } from '../feedback/Spinner';
import { cx } from '../lib/cx';

/** Design Spec §4.5 — `plain` 은 TopBar 밀집 배치용(배경·그림자 없음). */
export type IconButtonVariant = 'glass' | 'plain';

/**
 * Design Spec §4.5 — 치수 표에는 38×38 한 값만 있다.
 * 사용자 결정 S1-D1-2 (`docs/decisions/stage-1-approvals.md` §7): prop 은 유지하되
 * Spec 에 없는 크기를 만들지 않는다. 다른 크기가 필요한 화면이 나오는 Stage 에서
 * Figma 치수를 받아 값을 늘린다(optional prop 에 값 추가이므로 비파괴적).
 */
export type IconButtonSize = 'md';

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style' | 'children' | 'onClick' | 'type' | 'disabled' | 'aria-label'
>;

export interface IconButtonProps extends NativeButtonProps {
  /**
   * 아이콘 노드. `packages/ui` 는 특정 아이콘 세트를 알지 않는다
   * (Icon 컴포넌트 §4.2 는 Stage 1-D2 범위).
   */
  icon: ReactNode;
  /** 접근성 이름 — 필수 (§4.5). */
  label: string;
  variant?: IconButtonVariant;
  /** 시각 38×38 · 아이콘 20 · hit area 44 (§4.5). 현재 값은 `md` 하나다. */
  size?: IconButtonSize;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onPress?: () => void;
}

/**
 * IconButton — Design Spec §4.5.
 *
 * 시각 크기 38×38 (`--icon-button-size`), 터치 타깃 44×44 (`--icon-button-hit-size`)를
 * `::before` 확장으로 분리한다 (§9.3 터치 타깃 표).
 */
export function IconButton({
  icon,
  label,
  variant = 'glass',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onPress,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx(
        'haru-icon-button',
        'haru-focus-ring',
        `haru-icon-button--${variant}`,
        `haru-icon-button--${size}`,
        loading && 'haru-icon-button--loading',
      )}
      aria-label={label}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      aria-busy={loading || undefined}
      onClick={() => {
        if (loading) return;
        onPress?.();
      }}
    >
      <span className="haru-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
      {loading ? (
        <span className="haru-icon-button__indicator">
          {/* 버튼이 `aria-busy` 를 갖고 있으므로 Spinner 는 장식이다 (§4.9). */}
          <Spinner size="sm" tone="inherit" decorative />
        </span>
      ) : null}
    </button>
  );
}
