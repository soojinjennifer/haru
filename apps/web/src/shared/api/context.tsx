/**
 * API Client 접근 지점 (context) — Query/Mutation hook 이 Adapter 를 **주입받는** 통로다.
 *
 * 선택(Mock | Http)은 `app/providers/ApiClientProvider.tsx` 가 하고, 여기에는
 * 선택 로직이 없다. context 가 `shared` 에 있어야 `entities/*` 의 query hook 이
 * 레이어 역방향 import 없이 접근할 수 있다 (`.claude/rules/architecture.md` §3).
 */
import { createContext, use, type ReactNode } from 'react';

import type { ApiClients } from './types';

const ApiClientsContext = createContext<ApiClients | null>(null);

export interface ApiClientsProviderProps {
  clients: ApiClients;
  children: ReactNode;
}

/** 이미 결정된 Adapter 집합을 하위 트리에 공급한다 (선택 로직 없음). */
export function ApiClientsProvider({ clients, children }: ApiClientsProviderProps) {
  return <ApiClientsContext value={clients}>{children}</ApiClientsContext>;
}

export function useApiClients(): ApiClients {
  const clients = use(ApiClientsContext);

  if (clients === null) {
    throw new Error('useApiClients must be used inside <ApiClientProvider>.');
  }

  return clients;
}
