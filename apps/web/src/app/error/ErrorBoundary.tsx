import { Component, type ErrorInfo, type ReactNode } from 'react';

import { errorName, logger } from '../../shared/lib/logger';

export interface ErrorBoundaryFallbackProps {
  /** 다시 렌더를 시도한다 (상태 초기화). */
  reset: () => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  renderFallback: (props: ErrorBoundaryFallbackProps) => ReactNode;
  /** 로그 이벤트에 붙는 경계 이름 (`app` · `route`). */
  boundary: string;
  /** 테스트·상위 경계 연동용. 기본은 PII 금지 logger 기록이다. */
  onError?: (error: unknown) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * 2단 Error Boundary 의 공통 구현 (Plan §5.4).
 *
 * React 는 class 컴포넌트로만 error boundary 를 만들 수 있다. `AppErrorBoundary` 와
 * `RouteErrorBoundary` 가 이 클래스를 각각의 fallback 으로 감싼다.
 *
 * 로깅은 **이름만** 남긴다 — message / stack 은 PII 를 포함할 수 있다 (Plan §5.6).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    logger.error('ui_error_boundary', {
      boundary: this.props.boundary,
      errorName: errorName(error),
    });
    this.props.onError?.(error);
  }

  private readonly reset = (): void => {
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.renderFallback({ reset: this.reset });
    }
    return this.props.children;
  }
}
