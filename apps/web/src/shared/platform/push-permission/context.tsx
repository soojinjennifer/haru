/**
 * `PushPermissionPort` 공급 — 선택은 `app/providers` 한 곳에서 하고(Web | Mock), 소비자는
 * `usePushPermissionPort()` 로만 받는다 (`shared/api/context.tsx` 와 같은 모양).
 */
import { createContext, use, type ReactNode } from 'react';

import type { PushPermissionPort } from './push-permission-port';

const PushPermissionContext = createContext<PushPermissionPort | null>(null);

export interface PushPermissionProviderProps {
  port: PushPermissionPort;
  children: ReactNode;
}

export function PushPermissionProvider({ port, children }: PushPermissionProviderProps) {
  return <PushPermissionContext value={port}>{children}</PushPermissionContext>;
}

export function usePushPermissionPort(): PushPermissionPort {
  const port = use(PushPermissionContext);
  if (port === null) {
    throw new Error('usePushPermissionPort must be used inside <PushPermissionProvider>.');
  }
  return port;
}
