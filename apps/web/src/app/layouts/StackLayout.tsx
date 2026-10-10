import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';
import { RouteErrorBoundary } from '../error/RouteErrorBoundary';

import { AppShell } from './AppShell';
import { AppShellTopBar } from './AppShellTopBar';

export interface StackLayoutProps {
  /** TopBar 슬롯 — `variant=inline | centered` 를 쓰는 화면에서 주입한다 (§2.3). */
  topBar?: ReactNode;
  /**
   * 하단 CTA. 키보드 가림을 피하려고 **스크롤 컨테이너 내부** 마지막 블록이다 (§2.2 — 고정하지 않는다).
   * 아래쪽 여백은 `AppShell bottomGap="cta"`(44)가 담당한다 — 여기에서 또 주면 이중 계산이다.
   */
  footer?: ReactNode;
  /** 주지 않으면 router `Outlet` 을 렌더한다. */
  children?: ReactNode;
}

/**
 * StackLayout — Design Spec §2.3.
 *
 * TabBar 가 없는 단일 스택 화면용. Stage 1 의 `/` 는 이 Layout 을 TopBar 없이 쓴다.
 * (Stage 2 `/auth/*` · `/onboarding/*` · `/settings` 에서 실제로 사용된다.)
 *
 * **하단 인셋 44** (`S2-FIX-1`): 마지막 블록 bottom 에서 화면 bottom 까지 Figma 실측 44 다.
 * 규칙을 route 별로 두지 않고 이 Layout 한 곳에서 지정한다 — CTA 가 없는 `/` · `/settings` ·
 * 카드 단계도 같은 값을 쓴다 (`stage-3-approvals.md` §11.3-2 승인).
 */
export function StackLayout({ topBar, footer, children }: StackLayoutProps) {
  return (
    <AppShell bottomGap="cta">
      {topBar === undefined ? null : <AppShellTopBar>{topBar}</AppShellTopBar>}
      <main className="flex flex-1 flex-col" aria-label={appCopy.landmarks.mainContent}>
        {/*
         * 세로 flex 컬럼이어야 한다. 화면 root 는 Design Spec 의 `(flex spacer)` 를
         * `flex flex-1 flex-col` + `mt-auto` 로 구현하는데, 이 래퍼가 평범한 block 이면
         * `flex-1` 이 적용될 부모가 없어 화면 높이가 콘텐츠 높이로 줄고 하단 블록이
         * 화면 중간에 뜬다 (`QA-2-002` — `/onboarding/saved`).
         * `grow` 는 유지한다 — `footer` 슬롯이 계속 맨 아래에 있어야 한다.
         */}
        <div className="flex grow flex-col">
          <RouteErrorBoundary>{children ?? <Outlet />}</RouteErrorBoundary>
        </div>
        {footer === undefined ? null : <div className="shrink-0 pt-6">{footer}</div>}
      </main>
    </AppShell>
  );
}
