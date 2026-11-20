/**
 * 앱 조립 지점 — provider 순서를 한 곳에 고정한다.
 *
 * `QueryProvider` 가 바깥이다: Query hook 은 `ApiClients` 를 **queryFn 안에서** 쓰므로
 * 순서 의존은 없지만, Adapter 준비 중(`mock` 동적 import)에도 QueryClient 가 살아 있어야
 * 재마운트로 캐시가 날아가지 않는다.
 */
import { ToastProvider } from '@haru/ui';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import type { SessionRecorderEnvironment } from '../../entities/session';
import { RecordingNoticeToasts } from '../../features/storytime-session';
import type { ApiClients } from '../../shared/api/types';
import type { AuthGateway } from '../../shared/auth';
import type { FileSharePort } from '../../shared/platform/file-share';
import type { PushPermissionPort } from '../../shared/platform/push-permission';

import { ApiClientProvider } from './ApiClientProvider';
import { QueryProvider } from './QueryProvider';

export interface AppProvidersProps {
  children: ReactNode;
  /** 테스트 · dev gallery 전용 주입 지점. */
  clients?: ApiClients | undefined;
  authGateway?: AuthGateway | undefined;
  /** 테스트 · dev gallery 전용 주입 지점 (push 권한 포트). */
  pushPermission?: PushPermissionPort | undefined;
  /** 테스트 전용 주입 지점 (파일 저장·공유 포트 — Stage 7 `S7-F`). */
  fileShare?: FileSharePort | undefined;
  /** 테스트 전용 주입 지점 (녹음 상태 머신 조립 — Stage 4 `S4-F1`). */
  sessionRecorder?: SessionRecorderEnvironment | undefined;
  queryClient?: QueryClient | undefined;
  /** Adapter 준비 전 표시할 내용. */
  fallback?: ReactNode;
}

export function AppProviders({
  children,
  clients,
  authGateway,
  pushPermission,
  fileShare,
  sessionRecorder,
  queryClient,
  fallback,
}: AppProvidersProps) {
  return (
    <QueryProvider client={queryClient}>
      <ApiClientProvider
        clients={clients}
        authGateway={authGateway}
        pushPermission={pushPermission}
        fileShare={fileShare}
        sessionRecorder={sessionRecorder}
        fallback={fallback}
      >
        {/* Toast 는 화면 위에 하나만 뜬다 (§4.12). 앱 조립 지점에서 한 번 마운트한다. */}
        <ToastProvider>
          {/*
            앱 수준 녹음 안내 — 14일 삭제 · 48h 미확정 · 크래시 복구 Toast 를 한 번에 1개씩 (`S4-H3` · `D4-117`).
            화면이 아니라 앱 수명에 묶는다.
          */}
          <RecordingNoticeToasts />
          {children}
        </ToastProvider>
      </ApiClientProvider>
    </QueryProvider>
  );
}
