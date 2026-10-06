/**
 * `AppTabBar` — `BottomTabBar` 를 router 에 연결한다 (Stage 3 Design Spec §4.4).
 *
 * `packages/ui` 는 route 를 모르므로(AC-1-25) 항목 구성·활성 판정·이동은 app 레이어가 한다.
 * 항목에 `href` 를 주어 **링크 의미**(새 탭 열기 등)를 지키고, 클릭은 SPA 이동으로 처리한다.
 */
import { BottomTabBar } from '@haru/ui';
import { useLocation, useNavigate } from 'react-router';

import {
  activeTabKey,
  tabCopy,
  TAB_ITEMS,
  TAB_ROUTES,
  type TabKey,
} from '../../shared/config/tabs';

export function AppTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <BottomTabBar
      items={[...TAB_ITEMS]}
      activeKey={activeTabKey(location.pathname)}
      label={tabCopy.navLabel}
      onSelect={(key) => {
        void navigate(TAB_ROUTES[key as TabKey]);
      }}
    />
  );
}
