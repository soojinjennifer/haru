/**
 * `useHealth` × scenario 5종 → Loading / Success / Error+Retry / Offline UI 전이 (AC-1-38).
 *
 * 하네스는 **테스트 전용**이다 (실제 화면은 Stage 2 이후). 확인하는 것은
 * "Query hook 이 Adapter 를 몰라도 scenario 가 화면 상태로 그대로 드러난다" 이다.
 * 하네스는 Adapter 를 직접 호출하지 않고 `useHealth` 만 쓴다.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorState, InlineAlert, Skeleton, Text } from '@haru/ui';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createMockApiClients } from '../../../mocks';
import { ApiClientsProvider } from '../../../shared/api/context';
import { createImmediateTimer } from '../../../shared/api/helpers';
import { createHttpApiClients } from '../../../shared/api/http';
import type { ApiClients } from '../../../shared/api/types';
import type { HealthScenarioKey } from '../../../mocks';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { useHealth } from '../useHealth';

function HealthPanel() {
  const health = useHealth();

  if (health.isPending) {
    // 로딩 안내는 컨테이너가 한 번만 전달한다 (Design Spec §4.9 — Skeleton 은 aria-hidden).
    return (
      <div role="status" aria-busy="true" aria-label="Loading status">
        <Skeleton lines={2} />
      </div>
    );
  }

  if (health.isError) {
    const copy = health.isOffline ? networkErrorCopy : errorCopyForCode(health.errorCode);

    return health.isOffline ? (
      <InlineAlert tone="offline" title={copy.title} description={copy.description} />
    ) : (
      <ErrorState
        title={copy.title}
        description={copy.description}
        retryLabel={retryLabel}
        onRetry={health.refetch}
      />
    );
  }

  return <Text>{`status: ${health.data?.status ?? 'unknown'}`}</Text>;
}

function renderWithClients(clients: ApiClients) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false, staleTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ApiClientsProvider clients={clients}>
        <HealthPanel />
      </ApiClientsProvider>
    </QueryClientProvider>,
  );
}

function renderWithScenario(scenario: HealthScenarioKey) {
  return renderWithClients(
    createMockApiClients({
      search: `?scenario=health:${scenario}`,
      timer: createImmediateTimer(),
    }),
  );
}

describe('useHealth × scenario 5종 (AC-1-38)', () => {
  it('success — 응답 값을 그대로 표시한다', async () => {
    renderWithScenario('success');

    expect(await screen.findByText('status: ok')).toBeDefined();
  });

  it('loading — 응답 전에는 Skeleton 이 보인다', async () => {
    renderWithScenario('loading');

    expect(screen.getByLabelText('Loading status')).toBeDefined();
    expect(await screen.findByText('status: ok')).toBeDefined();
  });

  it('error — ErrorState + Retry 버튼이 보인다 (서버 message 는 노출하지 않는다)', async () => {
    renderWithScenario('error');

    const copy = errorCopyForCode('INTERNAL_ERROR');
    expect(await screen.findByText(copy.title)).toBeDefined();
    expect(screen.getByRole('button', { name: retryLabel })).toBeDefined();
    expect(screen.queryByText(/Mock health check failed/)).toBeNull();
  });

  it('retry — 재시도 버튼을 누르면 성공 상태로 넘어간다', async () => {
    renderWithScenario('retry');

    const copy = errorCopyForCode('INTERNAL_ERROR');
    await screen.findByText(copy.title);

    fireEvent.click(screen.getByRole('button', { name: retryLabel }));

    expect(await screen.findByText('status: ok')).toBeDefined();
    await waitFor(() => {
      expect(screen.queryByText(copy.title)).toBeNull();
    });
  });

  it('offline — Offline Banner 가 보이고 Error Code 문구를 쓰지 않는다', async () => {
    renderWithScenario('offline');

    expect(await screen.findByText(networkErrorCopy.title)).toBeDefined();
    expect(screen.queryByRole('button', { name: retryLabel })).toBeNull();
  });
});

describe('Mock ↔ Http 교체 (Exit Criteria — UI·Feature·Query 코드 변경 0)', () => {
  it('같은 화면·같은 hook 이 Http Adapter 로도 그대로 동작한다', async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            status: 'ok',
            version: '1.0.0',
            serverTime: '2026-01-01T00:00:00.000Z',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    renderWithClients(
      createHttpApiClients({
        baseUrl: 'https://api.example.invalid/v1',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    );

    expect(await screen.findByText('status: ok')).toBeDefined();
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('Http Adapter 의 전송 실패도 같은 Offline 상태를 만든다', async () => {
    renderWithClients(
      createHttpApiClients({
        baseUrl: 'https://api.example.invalid/v1',
        fetchImpl: vi.fn(() => Promise.reject(new TypeError('failed'))) as unknown as typeof fetch,
      }),
    );

    expect(await screen.findByText(networkErrorCopy.title)).toBeDefined();
  });
});
