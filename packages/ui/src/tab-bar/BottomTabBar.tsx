import { Icon, type IconName } from '../icon/Icon';
import { cx } from '../lib/cx';
import { Text } from '../text/Text';

/**
 * Design Spec §6.2 — `packages/ui` 는 route·capability·도메인 enum 을 모른다 (AC-1-25).
 * 항목 구성은 앱(`shared/config` + `shared/copy`)이 주입한다.
 */
export interface TabBarItem {
  key: string;
  /** 표시 라벨 — copy 모듈에서 주입한다. 아이콘과 **항상 함께** 표시된다. */
  label: string;
  icon: IconName;
  /** 가운데 강조 항목. 배열당 최대 1개 (§6.2). */
  emphasis?: 'center';
  /** 예약 — Stage 1 은 렌더만 지원한다. */
  badge?: number | 'dot';
  /** 라우터 링크 목적지. 주면 `<a>`, 없으면 `<button>` 으로 렌더한다. */
  href?: string;
}

export interface BottomTabBarProps {
  /** 길이 2~5 를 허용한다. HARU 는 3개 고정이며 그 강제는 앱이 한다 (§6.2). */
  items: TabBarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** nav 접근성 이름. */
  label?: string;
}

/** `emphasis: 'center'` 항목을 배열 위치와 무관하게 가운데로 배치한다 (§6.2). */
function orderItems(items: TabBarItem[]): TabBarItem[] {
  const center = items.find((item) => item.emphasis === 'center');
  if (!center) return items;

  const others = items.filter((item) => item !== center);
  const leftCount = Math.floor(others.length / 2);
  return [...others.slice(0, leftCount), center, ...others.slice(leftCount)];
}

function TabBarLink({
  item,
  active,
  onSelect,
}: {
  item: TabBarItem;
  active: boolean;
  onSelect: (key: string) => void;
}) {
  const content = (
    <>
      <span className="haru-tab-bar__icon">
        <Icon name={item.icon} decorative />
        {item.badge === undefined ? null : (
          <span
            className={cx(
              'haru-tab-bar__badge',
              item.badge === 'dot' && 'haru-tab-bar__badge--dot',
            )}
            aria-hidden="true"
          >
            {item.badge === 'dot' ? null : item.badge}
          </span>
        )}
      </span>
      <Text
        as="span"
        variant="caption-2"
        weight={active ? 'semibold' : 'medium'}
        tone={active ? 'primary' : 'secondary'}
      >
        {item.label}
      </Text>
    </>
  );

  const className = cx('haru-tab-bar__link', 'haru-focus-ring');
  const ariaCurrent = active ? 'page' : undefined;
  const handleClick = () => {
    onSelect(item.key);
  };

  // 라우터가 있는 앱은 `href` 를 주입해 링크 의미(새 탭 열기 등)를 유지한다 (§6.2).
  if (item.href === undefined) {
    return (
      <button type="button" className={className} aria-current={ariaCurrent} onClick={handleClick}>
        {content}
      </button>
    );
  }

  return (
    <a href={item.href} className={className} aria-current={ariaCurrent} onClick={handleClick}>
      {content}
    </a>
  );
}

/**
 * BottomTabBar — Design Spec §6.2 (Figma `25:87` · `140:2971`).
 *
 * 링크 목록이므로 항목 간 화살표 키 순환을 도입하지 않고 Tab 으로 순차 이동한다.
 * 중앙 항목은 시각적으로만 돌출하며 나머지와 같은 종류의 컨트롤이다.
 */
export function BottomTabBar({ items, activeKey, onSelect, label = 'Main' }: BottomTabBarProps) {
  const ordered = orderItems(items);

  return (
    <nav className="haru-tab-bar" aria-label={label}>
      <ul className="haru-tab-bar__list">
        {ordered.map((item) => (
          <li
            key={item.key}
            className={cx(
              'haru-tab-bar__item',
              item.emphasis === 'center' && 'haru-tab-bar__item--center',
              item.key === activeKey && 'haru-tab-bar__item--active',
            )}
          >
            <TabBarLink item={item} active={item.key === activeKey} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
