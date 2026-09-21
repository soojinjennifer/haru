/**
 * TanStack Query client — `.claude/rules/frontend.md` §4 "Server State: TanStack Query".
 *
 * 기본값 근거
 * - `retry: false` — 재시도는 **사용자 행동**(ErrorState 의 Retry)으로만 일어나야 한다.
 *   자동 재시도가 있으면 `error` scenario 가 화면에 드러나지 않고, `retry` scenario 의
 *   "1회차 실패 → 재시도 성공" UX 를 검증할 수 없다 (Plan §8.1, AC-1-38).
 * - `retryOnMount: false` — 실패한 query 는 **다시 마운트돼도 자동으로 재요청하지 않는다**.
 *   기본값(true)이면 StrictMode 이중 마운트나 화면 재진입만으로 재시도가 일어나 ErrorState 가
 *   스쳐 지나간다. 재시도는 Retry 버튼으로만 (Design Spec §5.3).
 * - `refetchOnWindowFocus: false` — 결정적 재현(Playwright·테스트)을 위해 끈다.
 * - `staleTime` 30s — 화면 전환마다 같은 데이터를 다시 받지 않게 한다.
 *
 * 오프라인 큐·persist 는 Stage 1 범위가 아니다 (필요 시 Stage 3 에서 승인 후 도입 — #9).
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export const DEFAULT_STALE_TIME_MS = 30_000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: DEFAULT_STALE_TIME_MS,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export interface QueryProviderProps {
  children: ReactNode;
  /** 테스트에서 격리된 client 를 주입한다. */
  client?: QueryClient | undefined;
}

export function QueryProvider({ children, client }: QueryProviderProps) {
  // client 를 렌더마다 새로 만들면 캐시가 날아간다 — 최초 1회만 생성한다.
  const [fallbackClient] = useState(createQueryClient);

  return <QueryClientProvider client={client ?? fallbackClient}>{children}</QueryClientProvider>;
}
