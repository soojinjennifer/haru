import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';
import { RouteErrorBoundary } from '../error/RouteErrorBoundary';

import { AppShell } from './AppShell';
import { AppShellTopBar } from './AppShellTopBar';

export interface FullscreenLayoutProps {
  /** TopBar 슬롯 — 없거나 `variant=pill` (§2.3). */
  topBar?: ReactNode;
  /** 화면 하단 영역. 내용 다음에 놓이며 내용이 넘치면 함께 스크롤된다. */
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * FullscreenLayout — Design Spec §2.3.
 *
 * 한 화면에 고정 배치하는 몰입 화면용 (Stage 4 `/session/:id`). 각 화면이 내부에서 높이를 배분한다.
 *
 * 화면이 내용 하한보다 짧을 때만 세로로 스크롤된다 (`D4-82`, `AD-S4-23`) — 잘리면 Submit · Discard 에
 * 닿을 수 없다. 하한은 각 화면이 정한다(`.haru-session`). 그보다 긴 높이는 넘치는 내용이 없어 스크롤이 없다.
 *
 * 스크롤 지점은 앱 컬럼 **바깥**의 AppShell 뷰포트다 (`R-SHADOW-1`). 컬럼 안쪽에 두면 카드 그림자가
 * 컬럼 폭에 맞춰 직사각형으로 잘린다 (AppShell 주석 참조).
 */
export function FullscreenLayout({ topBar, footer, children }: FullscreenLayoutProps) {
  return (
    <AppShell scroll="auto">
      {topBar === undefined ? null : <AppShellTopBar>{topBar}</AppShellTopBar>}
      <main className="flex min-h-0 flex-1 flex-col" aria-label={appCopy.landmarks.mainContent}>
        <RouteErrorBoundary>{children ?? <Outlet />}</RouteErrorBoundary>
      </main>
      {footer === undefined ? null : <div className="shrink-0 pt-4">{footer}</div>}
    </AppShell>
  );
}
