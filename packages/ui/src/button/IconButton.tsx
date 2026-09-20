import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cx } from '../lib/cx';

/** Design Spec §4.5 — `plain` 은 TopBar 밀집 배치용(배경·그림자 없음). */
export type IconButtonVariant = 'glass' | 'plain';

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
      {loading ? <span className="haru-icon-button__indicator" aria-hidden="true" /> : null}
    </button>
  );
}
