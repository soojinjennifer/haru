import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';
import { RouteErrorBoundary } from '../error/RouteErrorBoundary';

import { AppShell } from './AppShell';
import { AppShellTopBar } from './AppShellTopBar';

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
 * ── Toast 보정은 더 이상 여기에 없다 (사용자 결정 2026-10-10) ──
 * Toast 가 화면 **상단**으로 옮겨져 탭바와 겹칠 수 없으므로 하단 보정(`QA-3-004` 의
 * `useToastTabBarInset`)을 **지웠다** — 남겨 두면 아무것도 켜지 않는 도달 불가 코드가 된다.
 * 같은 메커니즘은 대상만 TopBar 로 바뀌어 `AppShellTopBar` 가 소유한다. Toast 가 탭바를
 * 덮지 않는다는 단정은 `e2e/tabs.spec.ts` 가 계속 지킨다.
 */
export function TabLayout({ topBar, tabBar, children }: TabLayoutProps) {
  return (
    <AppShell>
      {topBar === undefined ? null : <AppShellTopBar>{topBar}</AppShellTopBar>}
      <main className="flex flex-1 flex-col" aria-label={appCopy.landmarks.mainContent}>
        <RouteErrorBoundary>{children ?? <Outlet />}</RouteErrorBoundary>
      </main>
      {tabBar === undefined ? null : (
        <div className="haru-app-shell__bar-bottom shrink-0">{tabBar}</div>
      )}
    </AppShell>
  );
}
