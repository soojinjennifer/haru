import type { ReactNode } from 'react';

import { Icon } from '../icon/Icon';
import { cx } from '../lib/cx';
import { devWarn } from '../lib/devWarn';

/** Design Spec §4.6 — 본문 안 링크 · 단독 줄. */
export type TextLinkTone = 'default' | 'standalone';

export interface TextLinkProps {
  children: ReactNode;
  /** 경로 이동이면 `href`, 동작이면 `onPress`. 둘 중 하나만 준다. */
  href?: string;
  onPress?: () => void;
  tone?: TextLinkTone;
  /** 새 탭으로 여는 외부 링크 (약관·개인정보방침 — 결정 D-4). */
  external?: boolean;
  /**
   * 외부 링크임을 알리는 시각 숨김 문구 (예: "Opens in a new tab").
   * 문구는 소비자가 소유하므로 `external` 일 때 반드시 준다.
   */
  externalHint?: string;
  /**
   * **disclosure(펼침) 트리거**로 쓸 때의 상태 — `<button>` 경로에서만 의미가 있다
   * (Stage 3 Design Spec §5.1.1 "트리거 컴포넌트 = 기존 `TextLink`" + `aria-expanded`).
   *
   * 이동이 아니라 상태 전환이므로 `href` 와 함께 쓰지 않는다.
   */
  expanded?: boolean;
  /** 이 트리거가 펼치는 영역의 id (`aria-controls`). `expanded` 와 함께 준다. */
  controls?: string;
}

/**
 * TextLink — Stage 2 Design Spec §4.6.
 *
 * 색(`--color-fg-link`) + **밑줄**로 구분한다 — 색 단독 구분이 아니다 (WCAG 1.4.1).
 * 경로 이동은 `<a>`, 동작은 `<button>` 으로 렌더한다. 세로 padding 으로 hit area 44 를 만든다.
 * 링크 텍스트만으로 목적지를 알 수 있어야 한다("here" 금지) — 문구는 소비자 책임이다.
 */
export function TextLink({
  children,
  href,
  onPress,
  tone = 'default',
  external = false,
  externalHint,
  expanded,
  controls,
}: TextLinkProps) {
  if (external && externalHint === undefined) {
    devWarn('TextLink', 'missing-external-hint', 'external');
  }

  const className = cx('haru-text-link', `haru-text-link--${tone}`, 'haru-focus-ring');

  const content = (
    <>
      <span className="haru-text-link__label">{children}</span>
      {external ? (
        <>
          <span className="haru-text-link__icon">
            <Icon name="external-link" size="sm" decorative />
          </span>
          {externalHint === undefined ? null : (
            <span className="haru-visually-hidden">{externalHint}</span>
          )}
        </>
      ) : null}
    </>
  );

  if (href === undefined) {
    return (
      <button
        type="button"
        className={className}
        aria-expanded={expanded}
        aria-controls={controls}
        onClick={onPress}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      className={className}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={onPress}
    >
      {content}
    </a>
  );
}
