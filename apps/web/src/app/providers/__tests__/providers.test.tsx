import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createImmediateTimer } from '../../../shared/api/helpers';
import { useApiClients } from '../../../shared/api/context';
import type { ApiClients } from '../../../shared/api/types';
import { AppProviders } from '../AppProviders';
import { createQueryClient, DEFAULT_STALE_TIME_MS } from '../QueryProvider';

const stubClients: ApiClients = {
  health: {
    get: () =>
      Promise.resolve({
        status: 'ok' as const,
        version: 'stub',
        serverTime: '2026-01-01T00:00:00.000Z',
      }),
  },
  me: {
    get: () => Promise.reject(new Error('not used in this test')),
    update: () => Promise.reject(new Error('not used in this test')),
  },
  consents: {
    getCurrentDocuments: () => Promise.reject(new Error('not used in this test')),
    record: () => Promise.reject(new Error('not used in this test')),
  },
  onboarding: {
    getState: () => Promise.reject(new Error('not used in this test')),
    saveStep: () => Promise.reject(new Error('not used in this test')),
    submit: () => Promise.reject(new Error('not used in this test')),
  },
  books: {
    search: () => Promise.reject(new Error('not used in this test')),
    getPrompts: () => Promise.reject(new Error('not used in this test')),
  },
  home: {
    getSummary: () => Promise.reject(new Error('not used in this test')),
  },
  activities: {
    getTodayCard: () => Promise.reject(new Error('not used in this test')),
    selectOption: () => Promise.reject(new Error('not used in this test')),
  },
  library: {
    getOverview: () => Promise.reject(new Error('not used in this test')),
    getList: () => Promise.reject(new Error('not used in this test')),
    addOwnBook: () => Promise.reject(new Error('not used in this test')),
    getGiftRequests: () => Promise.reject(new Error('not used in this test')),
    createGiftRequest: () => Promise.reject(new Error('not used in this test')),
    saveBook: () => Promise.reject(new Error('not used in this test')),
    unsaveBook: () => Promise.reject(new Error('not used in this test')),
  },
};

function Probe() {
  const clients = useApiClients();
  const queryClient = useQueryClient();

  return (
    <div>
      <span>{`adapter: ${typeof clients.health.get === 'function' ? 'ready' : 'missing'}`}</span>
      <span>{`retry: ${String(queryClient.getDefaultOptions().queries?.retry)}`}</span>
    </div>
  );
}

describe('AppProviders — 조립 지점', () => {
  it('주입된 Adapter 집합을 하위 트리에 공급한다', async () => {
    render(
      <AppProviders clients={stubClients} queryClient={createQueryClient()}>
        <Probe />
      </AppProviders>,
    );

    expect(await screen.findByText('adapter: ready')).toBeDefined();
  });

  it('clients 주입이 없으면 선택 지점이 스스로 Adapter 를 고른다 (준비 전에는 fallback)', async () => {
    render(
      <AppProviders fallback={<span>preparing</span>}>
        <Probe />
      </AppProviders>,
    );

    // `mock` 모드는 동적 import 이므로 첫 프레임에는 Adapter 가 아직 없다.
    expect(screen.getByText('preparing')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('adapter: ready')).toBeDefined();
    });
  });
});

describe('useApiClients — Provider 밖 사용 금지', () => {
  it('Provider 없이 쓰면 명확한 오류를 던진다', () => {
    expect(() => render(<Probe />)).toThrow(/ApiClientProvider/);
  });
});

describe('QueryClient 기본값 (Plan §8.1 결정적 재현)', () => {
  it('자동 재시도를 끄고 focus refetch 를 끈다', () => {
    const client: QueryClient = createQueryClient();
    const queries = client.getDefaultOptions().queries;

    expect(queries?.retry).toBe(false);
    expect(queries?.refetchOnWindowFocus).toBe(false);
    expect(queries?.staleTime).toBe(DEFAULT_STALE_TIME_MS);
  });
});

describe('Mock Adapter 주입 (Adapter 교체 가능성)', () => {
  it('Mock 집합도 같은 ApiClients 타입으로 들어간다', async () => {
    const { createMockApiClients } = await import('../../../mocks');
    const clients: ApiClients = createMockApiClients({ timer: createImmediateTimer() });

    render(
      <AppProviders clients={clients} queryClient={createQueryClient()}>
        <Probe />
      </AppProviders>,
    );

    expect(await screen.findByText('adapter: ready')).toBeDefined();
  });
});
