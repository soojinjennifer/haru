/**
 * `ApiClientProvider` — Adapter 를 고르고(=`apiClients.ts`) 앱 트리에 공급한다 (Plan §5.2).
 *
 * Stage 2-AUTH 부터 `ApiClients` 와 `AuthGateway` **두 Adapter**를 함께 공급한다.
 * Stage 4(`S4-J`)부터 push 권한 **플랫폼 포트**(`PushPermissionPort`)도 같은 지점에서 공급한다.
 * 둘을 한 번에 만들어야 `mock` 모드에서 scenario store 와 요청 로그를 공유한다.
 *
 * `mock` 모드의 Adapter 는 동적 import 로 들어오므로 첫 프레임에서는 아직 없다.
 * 그 사이에는 `fallback` 을 렌더한다(기본은 아무것도 그리지 않음 — 화면 깜빡임 방지).
 *
 * 테스트·dev gallery 는 `clients` · `authGateway` prop 으로 Adapter 를 직접 주입한다.
 * 그때도 **분기 지점은 여전히 한 곳**이다: 주입이 없으면 `resolveAdapters()` 만 쓴다.
 */
import { useEffect, useState, type ReactNode } from 'react';

import { SessionRecorderProvider, type SessionRecorderEnvironment } from '../../entities/session';
import { ApiClientsProvider } from '../../shared/api/context';
import type { ApiClients } from '../../shared/api/types';
import { createSystemClock } from '../../shared/lib/clock';
import { createSystemScheduler } from '../../shared/lib/scheduler';
import { wipeWebRecordingStorage } from '../../shared/platform/recording-storage';
import { createUnavailableAuthGateway, type AuthGateway } from '../../shared/auth';
import { errorName, logger } from '../../shared/lib/logger';
import {
  createWebPushPermissionPort,
  PushPermissionProvider,
  type PushPermissionPort,
} from '../../shared/platform/push-permission';

import { createWebRecordingPlatform, resolveAdapters, type AppAdapters } from './apiClients';
import { AuthProvider } from './AuthProvider';
import { createSessionRecorderEnvironment } from './sessionRecorderEnvironment';

export interface ApiClientProviderProps {
  children: ReactNode;
  /** 주입된 Adapter 집합 (테스트 · dev gallery 전용). */
  clients?: ApiClients | undefined;
  /** 주입된 인증 Gateway. `clients` 만 주입하면 "Gateway 없음" 구현이 들어간다. */
  authGateway?: AuthGateway | undefined;
  /** 주입된 push 권한 포트. `clients` 만 주입하면 Web 구현이 들어간다 (jsdom = `unsupported`). */
  pushPermission?: PushPermissionPort | undefined;
  /**
   * 주입된 녹음 조립 (테스트 전용). `clients` 만 주입하면 그 clients + **Web** 플랫폼으로 만든다 —
   * 런타임은 세션 화면이 처음 쓸 때 열리므로 세션을 다루지 않는 테스트는 브라우저 저장소를 열지 않는다.
   */
  sessionRecorder?: SessionRecorderEnvironment | undefined;
  /** Adapter 준비 전에 보여줄 내용. */
  fallback?: ReactNode;
}

export function ApiClientProvider({
  children,
  clients,
  authGateway,
  pushPermission,
  sessionRecorder,
  fallback = null,
}: ApiClientProviderProps) {
  const [loaded, setLoaded] = useState<AppAdapters | null>(null);
  const [failure, setFailure] = useState<unknown>(null);

  // 주입이 있으면 그것이 곧 결과다 — effect 로 state 를 동기화하지 않는다.
  const [injectedPush] = useState<PushPermissionPort>(
    () => pushPermission ?? createWebPushPermissionPort(),
  );
  const [injectedRecorder] = useState<SessionRecorderEnvironment | null>(() =>
    clients === undefined
      ? null
      : (sessionRecorder ??
        createSessionRecorderEnvironment({
          clients,
          clock: createSystemClock(),
          scheduler: createSystemScheduler(),
          platform: createWebRecordingPlatform,
          wipeDevice: wipeWebRecordingStorage,
        })),
  );
  const resolved:
    | (Omit<AppAdapters, 'sessionRecorder'> & {
        sessionRecorder: SessionRecorderEnvironment;
      })
    | null =
    clients === undefined || injectedRecorder === null
      ? loaded
      : {
          clients,
          authGateway: authGateway ?? createUnavailableAuthGateway(),
          pushPermission: pushPermission ?? injectedPush,
          sessionRecorder: sessionRecorder ?? injectedRecorder,
        };

  useEffect(() => {
    if (clients !== undefined) return;

    let cancelled = false;

    void resolveAdapters()
      .then((next) => {
        if (cancelled) return;
        // 채택한 벌만 녹음 런타임을 연다 (복구 → 보관 정리 → outbox·큐). 버려진 벌(StrictMode)은 열지 않는다.
        next.sessionRecorder.warmUp();
        setLoaded(next);
      })
      .catch((error: unknown) => {
        // 여기서 실패하면 앱이 API 를 전혀 쓸 수 없다. AppErrorBoundary 로 올린다.
        logger.error('api_clients_resolve_failed', { errorName: errorName(error) });
        if (!cancelled) setFailure(error);
      });

    return () => {
      cancelled = true;
    };
  }, [clients]);

  // 렌더 중에 던져야 Error Boundary 가 잡는다 (effect 안에서 던지면 잡히지 않는다).
  if (failure !== null) throw failure;

  if (resolved === null) return <>{fallback}</>;

  return (
    <ApiClientsProvider clients={resolved.clients}>
      <PushPermissionProvider port={resolved.pushPermission}>
        <SessionRecorderProvider environment={resolved.sessionRecorder}>
          <AuthProvider gateway={resolved.authGateway}>{children}</AuthProvider>
        </SessionRecorderProvider>
      </PushPermissionProvider>
    </ApiClientsProvider>
  );
}
