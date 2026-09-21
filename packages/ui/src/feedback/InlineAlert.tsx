import type { ReactNode } from 'react';

import { IconButton } from '../button/IconButton';
import { Icon, type IconName } from '../icon/Icon';
import { cx } from '../lib/cx';
import { Text } from '../text/Text';

/** Design Spec §4.11 — `offline` 만 status 색이 아니라 note 색을 쓴다. */
export type InlineAlertTone = 'info' | 'success' | 'warning' | 'error' | 'offline';

/** `banner` 는 TopBar 바로 아래 sticky 로 붙는다 (§5.4). */
export type InlineAlertPlacement = 'inline' | 'banner';

const TONE_ICON: Record<InlineAlertTone, IconName> = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  error: 'octagon-alert',
  offline: 'wifi-off',
};

export interface InlineAlertAction {
  label: string;
  onPress: () => void;
}

export interface InlineAlertProps {
  tone?: InlineAlertTone;
  placement?: InlineAlertPlacement;
  title: string;
  description?: string;
  /** tone 기본 아이콘을 덮어쓴다. */
  icon?: ReactNode;
  action?: InlineAlertAction;
  onDismiss?: () => void;
  /** 닫기 버튼 접근성 이름 — `onDismiss` 와 함께 준다. */
  dismissLabel?: string;
}

/**
 * InlineAlert / Banner — Design Spec §4.11 · §5.4 (Figma 없음 → 명세).
 *
 * 색 단독으로 뜻을 전달하지 않는다 — 아이콘 + 문구를 항상 함께 표시한다 (WCAG 1.4.1).
 * Offline Banner 는 수동 닫기를 제공하지 않는다 (§5.4).
 */
export function InlineAlert({
  tone = 'info',
  placement = 'inline',
  title,
  description,
  icon,
  action,
  onDismiss,
  dismissLabel,
}: InlineAlertProps) {
  const role = tone === 'error' || tone === 'warning' ? 'alert' : 'status';

  return (
    <div
      className={cx('haru-alert', `haru-alert--${tone}`, `haru-alert--${placement}`)}
      role={role}
      aria-live={role === 'alert' ? undefined : 'polite'}
    >
      <span className="haru-alert__icon" aria-hidden="true">
        {icon ?? <Icon name={TONE_ICON[tone]} size="md" decorative />}
      </span>
      <div className="haru-alert__body">
        <Text variant="subheadline" weight="semibold">
          {title}
        </Text>
        {description === undefined ? null : <Text variant="footnote">{description}</Text>}
        {action === undefined ? null : (
          <button
            type="button"
            className="haru-alert__action haru-focus-ring"
            onClick={action.onPress}
          >
            <Text as="span" variant="footnote" weight="semibold">
              {action.label}
            </Text>
          </button>
        )}
      </div>
      {onDismiss === undefined || dismissLabel === undefined ? null : (
        <span className="haru-alert__dismiss">
          <IconButton
            variant="plain"
            icon={<Icon name="x" size="md" decorative />}
            label={dismissLabel}
            onPress={onDismiss}
          />
        </span>
      )}
    </div>
  );
}
