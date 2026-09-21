import { cx } from '../lib/cx';

/** Design Spec §4.3 — `flat` 은 reduced-transparency · 인쇄용 단색 배경이다. */
export type AppBackgroundVariant = 'gradient' | 'flat';

export interface AppBackgroundProps {
  variant?: AppBackgroundVariant;
}

/**
 * AppBackground — Design Spec §4.3.
 *
 * 뷰포트 전체를 덮는 장식 레이어다(`aria-hidden`). 본문 텍스트를 이 위에 직접 두지 않는다
 * (배경 대비 4.14:1 — §9.4). 콘텐츠는 DOM 상 이 요소 **뒤에** 오며 그 위에 그려진다.
 */
export function AppBackground({ variant = 'gradient' }: AppBackgroundProps) {
  return (
    <div
      className={cx('haru-app-background', `haru-app-background--${variant}`)}
      aria-hidden="true"
    />
  );
}
