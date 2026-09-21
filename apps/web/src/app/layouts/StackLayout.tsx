import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';
import { RouteErrorBoundary } from '../error/RouteErrorBoundary';

import { AppShell } from './AppShell';

export interface StackLayoutProps {
  /** TopBar 슬롯 — `variant=inline | centered` 를 쓰는 화면에서 주입한다 (§2.3). */
  topBar?: ReactNode;
  /** 하단 고정 CTA. 키보드 가림을 피하려고 **스크롤 컨테이너 내부** 마지막 블록이다 (§2.2). */
  footer?: ReactNode;
  /** 주지 않으면 router `Outlet` 을 렌더한다. */
  children?: ReactNode;
}

/**
 * StackLayout — Design Spec §2.3.
 *
 * TabBar 가 없는 단일 스택 화면용. Stage 1 의 `/` 는 이 Layout 을 TopBar 없이 쓴다.
 * (Stage 2 `/auth/*` · `/onboarding/*` · `/settings` 에서 실제로 사용된다.)
 */
export function StackLayout({ topBar, footer, children }: StackLayoutProps) {
  return (
    <AppShell>
      {topBar === undefined ? null : <div className="shrink-0">{topBar}</div>}
      <main
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        aria-label={appCopy.landmarks.mainContent}
      >
        <div className="grow">
          <RouteErrorBoundary>{children ?? <Outlet />}</RouteErrorBoundary>
        </div>
        {footer === undefined ? null : <div className="shrink-0 pt-6 pb-6">{footer}</div>}
      </main>
    </AppShell>
  );
}
