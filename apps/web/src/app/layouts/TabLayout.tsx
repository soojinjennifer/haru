import { useToastTabBarInset } from '@haru/ui';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';
import { RouteErrorBoundary } from '../error/RouteErrorBoundary';

import { AppShell } from './AppShell';

export interface TabLayoutProps {
  /** TopBar 슬롯 — `variant=large` 또는 없음 (§2.3). */
  topBar?: ReactNode;
  /**
   * BottomTabBar 슬롯. Stage 3 에서 `/` · `/library` · `/progress` 에 마운트된다
   * (항목 3개 — Library / Home(가운데) / Progress, `/session` 탭 없음 — #15 · `D-02`).
   * 주지 않으면 탭 영역 자체가 렌더되지 않는다.
   */
  tabBar?: ReactNode;
  children?: ReactNode;
}

/**
 * TabLayout — Design Spec §2.3.
 *
 * BottomTabBar 는 앱 컬럼 **안쪽** 마지막 flex 행이다. `position: fixed` 를 쓰지 않으므로
 * 컬럼 폭·gutter·safe-area 정렬이 AppColumn 규칙을 그대로 따른다 (§2.2 "컬럼 폭 안에 정렬").
 * 스크롤 컨테이너가 앱 컬럼 바깥으로 옮겨졌으므로(AppShell 주석) 탭 바와 TopBar 는
 * `position: sticky` 로 고정한다 — 스크롤과 함께 사라지지 않는다 (`app-shell.css`).
 *
 * 중앙 버튼 overhang 여백은 `.haru-app-shell__bar-bottom` 의 `padding-block-start` 가 소유한다
 * (Stage 3 Design Spec §2.1 — `pt-3` 리터럴을 토큰 참조로 바꿨다, `AD-S3-13`).
 *
 * ── Toast 하단 보정의 **소유자가 여기다** (`QA-3-004`) ──
 * `ToastProvider` 는 router 바깥(앱 조립 지점)에 한 번 마운트되므로 현재 화면에 탭바가 있는지
 * 모른다. 그 결과 탭바 보정 CSS(`.haru-toast-viewport--tabbar`)가 아무도 켜 주지 않는
 * 도달 불가 코드였고, Toast 가 탭 3개를 50px 덮어 클릭을 전부 가로막았다.
 * 탭바를 실제로 렌더하는 지점이 여기뿐이므로 **`tabBar` 슬롯이 있을 때만** 보정을 요청한다 —
 * `tabBar` 가 없으면(Stage 1 `/`) 탭바도 없고 보정도 없다. 스택·풀스크린 Layout 은 등록하지
 * 않으므로 온보딩·설정 Toast 위치는 그대로다.
 */
export function TabLayout({ topBar, tabBar, children }: TabLayoutProps) {
  useToastTabBarInset(tabBar !== undefined);

  return (
    <AppShell>
      {topBar === undefined ? null : (
        <div className="haru-app-shell__bar-top shrink-0">{topBar}</div>
      )}
      <main className="flex flex-1 flex-col" aria-label={appCopy.landmarks.mainContent}>
        <RouteErrorBoundary>{children ?? <Outlet />}</RouteErrorBoundary>
      </main>
      {tabBar === undefined ? null : (
        <div className="haru-app-shell__bar-bottom shrink-0">{tabBar}</div>
      )}
    </AppShell>
  );
}
