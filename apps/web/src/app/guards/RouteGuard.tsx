import { Spinner } from '@haru/ui';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

import { appCopy } from '../../shared/copy/app-copy';

/**
 * Route 접근 판정 결과.
 *
 * Stage 1 은 **shell 만** 만든다 (Plan §5.4). ARCHITECTURE §2.4 의 판정 순서
 * (미인증 → 동의 → VPC → 온보딩 → 프로필 결과 → Home)는 `GET /v1/me` 계약에 의존하므로
 * **Stage 2** 에서 `useGuardDecision` 구현을 교체하며 붙인다.
 */
export type GuardDecision =
  | { readonly status: 'allow' }
  | { readonly status: 'pending' }
  | { readonly status: 'redirect'; readonly to: string; readonly replace?: boolean };

export const ALLOW_DECISION: GuardDecision = { status: 'allow' };

/** Stage 1 구현 — 항상 `allow`. 판정 로직을 미리 넣지 않는다 (Out of Scope 선행 구현 금지). */
export function useGuardDecision(): GuardDecision {
  return ALLOW_DECISION;
}

export interface RouteGuardProps {
  children: ReactNode;
  /**
   * 판정 hook 주입 지점. 기본은 Stage 1 의 항상-allow 구현이다.
   * Stage 2 는 여기에 실제 판정 hook 을 주입하고, 테스트는 임의 판정을 주입한다.
   */
  useDecision?: () => GuardDecision;
  /** `pending` 동안 보여줄 내용. 기본은 Spinner. */
  fallback?: ReactNode;
}

/**
 * RouteGuard — Plan §5.4 (shell).
 *
 * 판정 자체는 `useDecision` 이 하고, 이 컴포넌트는 결과에 따른 렌더만 담당한다.
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
    return <Navigate to={decision.to} replace={decision.replace ?? true} />;
  }

  return <>{children}</>;
}
