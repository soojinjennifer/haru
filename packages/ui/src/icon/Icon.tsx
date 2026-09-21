import { cx } from '../lib/cx';
import { devWarn } from '../lib/devWarn';

import { HARU_ICONS, type HaruIconName } from './haru';
import { LUCIDE_ICONS, LUCIDE_STROKE_WIDTH, type LucideIconName } from './registry';

/** Design Spec §4.2 — Lucide 이름 또는 `haru:*` 접두 이름. */
export type IconName = LucideIconName | HaruIconName;

/** Design Spec §4.2 · §8.4 — 16 / 20 / 24 (`가값 P-09`). */
export type IconSize = 'sm' | 'md' | 'lg';

export type IconTone = 'primary' | 'secondary' | 'on-accent' | 'inherit';

interface IconBaseProps {
  name: IconName;
  size?: IconSize;
  tone?: IconTone;
}

/**
 * 의미 있는 아이콘은 `label`, 장식 아이콘은 `decorative` 가 **필수**다 (§4.2).
 * 둘 중 하나를 반드시 지정하게 해 접근성 이름 누락을 타입 단계에서 막는다.
 */
export type IconProps = IconBaseProps &
  ({ label: string; decorative?: false } | { decorative: true; label?: never });

/**
 * Icon — Design Spec §4.2.
 *
 * 색은 부모의 `currentColor` 를 상속한다(`tone` 으로 덮어쓸 수 있다).
 * 아이콘만 있는 버튼은 Icon 이 아니라 IconButton 을 쓴다 (§4.2).
 */
export function Icon({ name, size = 'md', tone = 'inherit', ...rest }: IconProps) {
  const decorative = rest.decorative === true;
  const label = 'label' in rest ? rest.label : undefined;

  if (!decorative && !label) {
    // 타입으로 막지만 JS 소비자를 위해 런타임에서도 알린다 (§4.2).
    // `console` 직접 호출은 금지되어 있다 (QA-1-001). packages/ui 는 경계 규칙상
    // apps/web 의 PII 금지 logger 를 import 할 수 없으므로 lib/devWarn 을 거친다.
    devWarn('Icon', 'missing-accessible-name', name);
  }

  const className = cx('haru-icon', `haru-icon--${size}`, `haru-icon--tone-${tone}`);
  const a11yProps = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': label } as const);

  if (name.startsWith('haru:')) {
    const HaruGlyph = HARU_ICONS[name as HaruIconName];
    return (
      <span className={className} {...a11yProps}>
        <HaruGlyph />
      </span>
    );
  }

  const LucideGlyph = LUCIDE_ICONS[name as LucideIconName];
  return (
    <span className={className} {...a11yProps}>
      <LucideGlyph
        size="100%"
        strokeWidth={LUCIDE_STROKE_WIDTH}
        aria-hidden="true"
        focusable="false"
      />
    </span>
  );
}
