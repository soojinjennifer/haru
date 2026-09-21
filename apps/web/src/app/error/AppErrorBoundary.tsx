import { AppBackground, AppColumn, ErrorState } from '@haru/ui';
import type { ReactNode } from 'react';

import { appCopy } from '../../shared/copy/app-copy';

import { ErrorBoundary } from './ErrorBoundary';

export interface AppErrorBoundaryProps {
  children: ReactNode;
  /** 복구 동작. 기본은 전체 새로고침이다 (테스트에서 주입한다). */
  onReload?: () => void;
}

function reloadWindow(): void {
  window.location.reload();
}

/**
 * 앱 전체 Error Boundary (Plan §5.4 — 2단 중 바깥).
 *
 * Router·Provider·Layout 을 포함한 어떤 지점에서 오류가 나도 화면이 흰 화면으로
 * 남지 않도록 `ErrorState` 를 그린다. 복구는 새로고침뿐이다(라우터를 신뢰할 수 없다).
 */
export function AppErrorBoundary({ children, onReload = reloadWindow }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      boundary="app"
      renderFallback={() => (
        <div className="relative grid min-h-dvh items-center">
          <AppBackground />
          <AppColumn as="main">
            <div className="py-8">
              <ErrorState
                title={appCopy.appError.title}
                description={appCopy.appError.description}
                retryLabel={appCopy.appError.retryLabel}
                onRetry={onReload}
                titleAs="h1"
              />
            </div>
          </AppColumn>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
