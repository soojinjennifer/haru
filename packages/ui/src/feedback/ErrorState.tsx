import type { ReactNode } from 'react';

import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { cx } from '../lib/cx';
import { Surface } from '../surface/Surface';
import { Text } from '../text/Text';

/** Design Spec §4.10 — `offline` 은 status 색이 아니라 note 색을 쓴다 (§4.11). */
export type ErrorStateTone = 'error' | 'offline';

export interface ErrorStateProps {
  title: string;
  description?: string;
  /** 재시도 핸들러. 주면 카드 **내부 하단**에 버튼이 렌더된다 (§5.3). */
  onRetry?: () => void;
  /** 재시도 버튼 라벨 — 문구는 앱의 copy 모듈이 소유한다. */
  retryLabel?: string;
  retrying?: boolean;
  tone?: ErrorStateTone;
  /** Stage 1 에서는 아이콘만 쓴다. 일러스트 슬롯은 열어만 둔다 (§4.10). */
  illustration?: ReactNode;
  /** 화면 전체 실패는 `alert`, 부분 실패는 `status` (§4.10). */
  announce?: 'alert' | 'status';
  /** 제목 heading 레벨 — 문서 구조에 맞춘다. */
  titleAs?: 'h1' | 'h2' | 'h3';
}

/**
 * ErrorState — Design Spec §4.10 · §5.3 (Figma 없음 → 명세).
 *
 * 진단·판정 문구를 쓰지 않는다. 문구는 전부 prop 으로 받는다 (§5.0).
 */
export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel,
  retrying = false,
  tone = 'error',
  illustration,
  announce = 'alert',
  titleAs = 'h2',
}: ErrorStateProps) {
  return (
    <Surface fill="strong" radius="card" padding="6">
      <div className={cx('haru-state', `haru-state--${tone}`)} role={announce}>
        <span className="haru-state__badge" aria-hidden="true">
          {illustration ?? (
            <Icon name={tone === 'offline' ? 'wifi-off' : 'triangle-alert'} size="lg" decorative />
          )}
        </span>
        <Text as={titleAs} variant="headline" tone="primary" align="center">
          {title}
        </Text>
        {description === undefined ? null : (
          <Text variant="subheadline" tone="secondary" align="center">
            {description}
          </Text>
        )}
        {onRetry === undefined || retryLabel === undefined ? null : (
          <div className="haru-state__action">
            <Button variant="glass" size="md" fullWidth loading={retrying} onPress={onRetry}>
              {retryLabel}
            </Button>
          </div>
        )}
      </div>
    </Surface>
  );
}
