import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';
import { RouteErrorBoundary } from '../error/RouteErrorBoundary';

import { AppShell } from './AppShell';

export interface FullscreenLayoutProps {
  /** TopBar 슬롯 — 없거나 `variant=pill` (§2.3). */
  topBar?: ReactNode;
  /** 화면 하단 고정 영역 (세션 컨트롤 등). 스크롤되지 않는다. */
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * FullscreenLayout — Design Spec §2.3.
 *
 * 스크롤 없이 고정 배치하는 몰입 화면용 (Stage 4 `/session/:id`).
 * 콘텐츠가 넘치면 스크롤 대신 잘린다 — 각 화면이 내부에서 높이를 배분한다.
 */
export function FullscreenLayout({ topBar, footer, children }: FullscreenLayoutProps) {
  return (
    <AppShell>
      {topBar === undefined ? null : <div className="shrink-0">{topBar}</div>}
      <main
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        aria-label={appCopy.landmarks.mainContent}
      >
        <RouteErrorBoundary>{children ?? <Outlet />}</RouteErrorBoundary>
      </main>
      {footer === undefined ? null : <div className="shrink-0 pt-4">{footer}</div>}
    </AppShell>
  );
}
