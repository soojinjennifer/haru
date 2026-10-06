/**
 * BottomTabBar 항목 — `CONFIRMED (#15 · D-02)` · Stage 3 Design Spec §4.4.
 *
 * | 항목 | 아이콘 (`S1-D2-5` 확정값) |
 * |---|---|
 * | Library | Lucide `book` |
 * | **Home (가운데)** | HARU SVG `haru:tab-center-home` (`140:2971`) |
 * | Progress | Lucide `chart-no-axes-column-increasing` |
 *
 * **`/session` 탭이 없다.** 세션은 카드에서 시작하는 흐름이고 탭 구조는 3개로 고정이다.
 *
 * 활성 표시는 **색 단독이 아니다** (WCAG 1.4.1): `BottomTabBar` 가 `aria-current="page"` +
 * 라벨 `--font-weight-semibold` 로도 전달한다. 중앙 버튼의 원형 강조는 **활성 표시가 아니다**
 * (항상 강조되어 있다).
 *
 * Badge 는 Stage 3 에서 쓰지 않는다 (`count` 근거 없음).
 */
import type { TabBarItem } from '@haru/ui';

import { ROUTES } from './routes';

export const TAB_KEYS = {
  library: 'library',
  home: 'home',
  progress: 'progress',
} as const;

export type TabKey = (typeof TAB_KEYS)[keyof typeof TAB_KEYS];

/** key → route. 탭 선택이 이 표 하나로 이동한다. */
export const TAB_ROUTES: Readonly<Record<TabKey, string>> = {
  library: ROUTES.library,
  home: ROUTES.home,
  progress: ROUTES.progress,
};

/** 라벨은 copy 가 소유한다 — `packages/ui` 는 route 도 라벨도 모른다 (AC-1-25). */
export const tabCopy = {
  navLabel: 'Main',
  library: 'Library',
  home: 'Home',
  progress: 'Progress',
} as const;

export const TAB_ITEMS: readonly TabBarItem[] = [
  { key: TAB_KEYS.library, label: tabCopy.library, icon: 'book', href: ROUTES.library },
  {
    key: TAB_KEYS.home,
    label: tabCopy.home,
    icon: 'haru:tab-center-home',
    emphasis: 'center',
    href: ROUTES.home,
  },
  {
    key: TAB_KEYS.progress,
    label: tabCopy.progress,
    icon: 'chart-no-axes-column-increasing',
    href: ROUTES.progress,
  },
];

/** 현재 경로 → 활성 탭 key. 알 수 없으면 Home 이다 (탭 레이아웃은 세 경로에서만 쓰인다). */
export function activeTabKey(pathname: string): TabKey {
  if (pathname.startsWith(ROUTES.library)) return TAB_KEYS.library;
  if (pathname.startsWith(ROUTES.progress)) return TAB_KEYS.progress;
  return TAB_KEYS.home;
}
