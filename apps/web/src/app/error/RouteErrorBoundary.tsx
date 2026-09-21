import { ErrorState } from '@haru/ui';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';

import { ErrorBoundary } from './ErrorBoundary';

export interface RouteErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Route 단위 Error Boundary (Plan §5.4 — 2단 중 안쪽).
 *
 * Layout chrome(TopBar·TabBar)은 그대로 두고 화면 내용만 `ErrorState` 로 바꾼다.
 * `location.key` 를 key 로 써서 **다른 화면으로 이동하면 자동으로 복구**된다.
 */
export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const location = useLocation();

  return (
    <ErrorBoundary
      key={location.key}
      boundary="route"
      renderFallback={({ reset }) => (
        <ErrorState
          title={appCopy.routeError.title}
          description={appCopy.routeError.description}
          retryLabel={appCopy.routeError.retryLabel}
          onRetry={reset}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
