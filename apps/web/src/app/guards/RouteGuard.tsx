import { Spinner } from '@haru/ui';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';

import type { GuardDecision } from './resolveGuardDecision';
import { useGuardDecision } from './useGuardDecision';

export type { GuardDecision, GuardMe, GuardOptions } from './resolveGuardDecision';
export { ALLOW_DECISION, PENDING_DECISION, resolveGuardDecision } from './resolveGuardDecision';
export { useGuardDecision } from './useGuardDecision';

export interface RouteGuardProps {
  children: ReactNode;
  /**
   * 판정 hook 주입 지점. 기본은 `useGuardDecision`(= `useMe()` + `resolveGuardDecision`).
   * 테스트는 임의 판정을 주입한다.
   */
  useDecision?: () => GuardDecision;
  /** `pending` 동안 보여줄 내용. 기본은 Spinner. */
  fallback?: ReactNode;
}

/**
 * RouteGuard — Plan §5.4.
 *
 * 판정 자체는 `useDecision` 이 하고, 이 컴포넌트는 결과에 따른 렌더만 담당한다.
 * 판정 순서는 `resolveGuardDecision` (순수 함수, 결정 `D-5`) 에 있다.
 */
export function RouteGuard({
  children,
  useDecision = useGuardDecision,
  fallback,
}: RouteGuardProps) {
  const decision = useDecision();

  if (decision.status === 'pending') {
    return (
      <div className="flex min-h-40 items-center justify-center">
        {fallback ?? <Spinner label={appCopy.guard.loadingLabel} />}
      </div>
    );
  }

  if (decision.status === 'redirect') {
    return <Navigate to={decision.to} replace={decision.replace ?? true} state={decision.state} />;
  }

  return <>{children}</>;
}
