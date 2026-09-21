import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';
import { RouteErrorBoundary } from '../error/RouteErrorBoundary';

import { AppShell } from './AppShell';

export interface TabLayoutProps {
  /** TopBar 슬롯 — `variant=large` 또는 없음 (§2.3). */
  topBar?: ReactNode;
  /**
   * BottomTabBar 슬롯. **Stage 1 의 `/` 에는 마운트하지 않는다** — 탭 항목과 route 는
   * Stage 3 에서 확정된다 (Plan §3.1). 주지 않으면 탭 영역 자체가 렌더되지 않는다.
   */
  tabBar?: ReactNode;
  children?: ReactNode;
}

/**
 * TabLayout — Design Spec §2.3.
 *
 * BottomTabBar 는 앱 컬럼 **안쪽** 마지막 flex 행이다. `position: fixed` 를 쓰지 않으므로
 * 컬럼 폭·gutter·safe-area 정렬이 AppColumn 규칙을 그대로 따른다 (§2.2 "컬럼 폭 안에 정렬").
 */
export function TabLayout({ topBar, tabBar, children }: TabLayoutProps) {
  return (
    <AppShell>
      {topBar === undefined ? null : <div className="shrink-0">{topBar}</div>}
      <main
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        aria-label={appCopy.landmarks.mainContent}
      >
        <RouteErrorBoundary>{children ?? <Outlet />}</RouteErrorBoundary>
      </main>
      {tabBar === undefined ? null : <div className="z-tabbar shrink-0 pt-3">{tabBar}</div>}
    </AppShell>
  );
}
