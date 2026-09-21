import type { ReactNode } from 'react';

import { useScrolledPast } from '../hooks/useScrolledPast';
import { cx } from '../lib/cx';
import { Text } from '../text/Text';

/** Design Spec §6.1 — Figma 의 오타 variant 이름(`Titla`)은 구현에 옮기지 않는다. */
export type TopBarVariant = 'inline' | 'centered' | 'large' | 'pill';

/** 스크롤이 이 값을 넘으면 배경이 glass 로 바뀐다 (§6.1). */
const SCROLL_THRESHOLD_PX = 8;

export interface TopBarProps {
  variant?: TopBarVariant;
  /** 화면 제목. 화면당 하나이므로 `h1` 으로 렌더된다 (§6.1). */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** 좌측 슬롯 — IconButton(`label` 필수) 또는 워드마크. */
  leading?: ReactNode;
  /** 우측 슬롯 — IconButton · Chip. */
  trailing?: ReactNode;
  sticky?: boolean;
  /** true 면 스크롤해도 배경을 그리지 않는다. */
  transparent?: boolean;
  /** `aria-labelledby` 연결이 필요할 때 제목 요소의 id. */
  titleId?: string;
}

/**
 * TopBar — Design Spec §6.1.
 *
 * `inline` · `pill` 은 중앙 pill, `centered` 는 중앙 텍스트 제목, `large` 는 좌측 대형 제목이다.
 * 중앙 정렬 제목은 leading / trailing 폭(44)만큼 좌우 여백을 확보해 좌우 대칭을 유지한다.
 */
export function TopBar({
  variant = 'centered',
  title,
  subtitle,
  leading,
  trailing,
  sticky = true,
  transparent = false,
  titleId,
}: TopBarProps) {
  const scrolled = useScrolledPast(SCROLL_THRESHOLD_PX, sticky && !transparent);

  const heading =
    title === undefined ? null : variant === 'large' ? (
      <Text as="h1" id={titleId} variant="title-1" weight="heavy" tone="primary" truncate={1}>
        {title}
      </Text>
    ) : variant === 'centered' ? (
      <Text
        as="h1"
        id={titleId}
        variant="subheadline"
        weight="semibold"
        tone="primary"
        align="center"
        truncate={1}
      >
        {title}
      </Text>
    ) : (
      <span className="haru-top-bar__pill">
        <Text as="h1" id={titleId} variant="footnote" weight="semibold" tone="primary" truncate={1}>
          {title}
        </Text>
      </span>
    );

  return (
    <header
      className={cx(
        'haru-top-bar',
        `haru-top-bar--${variant}`,
        sticky && 'haru-top-bar--sticky',
        scrolled && 'haru-top-bar--scrolled',
      )}
    >
      <div className="haru-top-bar__leading">{leading}</div>
      <div className="haru-top-bar__center">
        {heading}
        {subtitle === undefined ? null : (
          <Text
            variant="footnote"
            tone="secondary"
            align={variant === 'large' ? 'start' : 'center'}
            truncate={1}
          >
            {subtitle}
          </Text>
        )}
      </div>
      <div className="haru-top-bar__trailing">{trailing}</div>
    </header>
  );
}
