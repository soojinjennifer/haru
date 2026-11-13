/**
 * `useSessionAnalysis` — Mock ↔ hook 연결 · 폴링 종료 (AC-5-35 hook 부분, fake timer).
 * 화면은 `S5-C` 가 만든다 — 여기서는 hook 결과만 본다.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMockApiClientsBundle } from '../../../mocks';
import { ApiClientsProvider } from '../../../shared/api/context';
import { createImmediateTimer } from '../../../shared/api/helpers';
import { ANALYSIS_POLL_INTERVAL_MS } from '../analysisPolling';
import { useSessionAnalysis } from '../useSessionAnalysis';

const HISTORY_ANALYZING = '77777777-7777-4777-8777-000000000002';

function setup(scenario: string) {
  const bundle = createMockApiClientsBundle({
    search: scenario.length > 0 ? `?scenario=${scenario}` : '',
    timer: createImmediateTimer(),
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ApiClientsProvider clients={bundle.clients}>{children}</ApiClientsProvider>
      </QueryClientProvider>
    );
  }
  const reads = () =>
    bundle.requestLog
      .entries()
      .filter((entry) => entry.operation === 'GET /v1/sessions/:sessionId/analysis').length;
  return { bundle, wrapper, reads };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('useSessionAnalysis', () => {
  it('pending → 15초 폴링 → `analyzed` 에서 정지 (`analysis-pending-then-completed`)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { wrapper, reads } = setup('analysis:analysis-pending-then-completed');
    const { result } = renderHook(() => useSessionAnalysis(HISTORY_ANALYZING), { wrapper });

    await waitFor(() => expect(result.current.analysis?.sessionStatus).toBe('analyzing'));
    expect(reads()).toBe(1);

    for (let i = 0; i < 2; i += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS);
      });
    }
    await waitFor(() => expect(result.current.analysis?.sessionStatus).toBe('analyzed'));
    expect(reads()).toBe(3);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS * 4);
    });
    expect(reads()).toBe(3);
  });

  it('`analysis-not-available` → errorCode, 재조회 0', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { wrapper, reads } = setup('analysis:analysis-not-available');
    const { result } = renderHook(() => useSessionAnalysis(HISTORY_ANALYZING), { wrapper });

    await waitFor(() => expect(result.current.errorCode).toBe('ANALYSIS_NOT_AVAILABLE'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS * 3);
    });
    expect(reads()).toBe(1);
  });

  it('`offline` → isOffline', async () => {
    const { wrapper } = setup('analysis:offline');
    const { result } = renderHook(() => useSessionAnalysis(HISTORY_ANALYZING), { wrapper });
    await waitFor(() => expect(result.current.isOffline).toBe(true));
  });

  it('`enabled: false` → 요청 0', async () => {
    const { wrapper, reads } = setup('');
    renderHook(() => useSessionAnalysis(HISTORY_ANALYZING, { enabled: false }), { wrapper });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(reads()).toBe(0);
  });
});
