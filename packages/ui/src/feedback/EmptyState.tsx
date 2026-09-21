import type { ReactNode } from 'react';

import { Button } from '../button/Button';
import { Icon, type IconName } from '../icon/Icon';
import { Surface } from '../surface/Surface';
import { Text } from '../text/Text';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** 상황에 맞는 Lucide 아이콘 (§4.10). */
  icon?: IconName;
  /**
   * 캐릭터 일러스트 슬롯. **Stage 1 에서는 쓰지 않는다**
   * (에셋 최적화 파이프라인이 Stage 2–4 — Plan §16 D-4).
   */
  illustration?: ReactNode;
  action?: EmptyStateAction;
  titleAs?: 'h1' | 'h2' | 'h3';
}

/**
 * EmptyState — Design Spec §4.10 · §5.2 (Figma 없음 → 명세).
 *
 * 일반 콘텐츠이므로 `role` 을 붙이지 않는다. 제목은 문서 구조에 맞는 heading 이다.
 */
export function EmptyState({
  title,
  description,
  icon = 'info',
  illustration,
  action,
  titleAs = 'h2',
}: EmptyStateProps) {
  return (
    <Surface fill="strong" radius="card" padding="6">
      <div className="haru-state haru-state--empty">
        <span className="haru-state__badge" aria-hidden="true">
          {illustration ?? <Icon name={icon} size="lg" decorative />}
        </span>
        <Text as={titleAs} variant="headline" tone="primary" align="center">
          {title}
        </Text>
        {description === undefined ? null : (
          <Text variant="subheadline" tone="secondary" align="center">
            {description}
          </Text>
        )}
        {action === undefined ? null : (
          <div className="haru-state__action">
            <Button variant="accent" size="md" fullWidth onPress={action.onPress}>
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </Surface>
  );
}
