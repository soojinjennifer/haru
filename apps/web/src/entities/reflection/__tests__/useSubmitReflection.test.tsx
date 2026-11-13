/**
 * `useSubmitReflection` — Idempotency-Key 를 body 단위로 관리한다 (Plan `R5-04`, AC-5-24 · 26 hook 부분).
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { SessionDetail, SubmitReflectionRequest } from '@haru/contracts';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { createMockApiClientsBundle } from '../../../mocks';
import { ApiClientsProvider } from '../../../shared/api/context';
import { createImmediateTimer } from '../../../shared/api/helpers';
import type { ApiClients } from '../../../shared/api/types';
import { sessionKeys } from '../../session';
import { useSubmitReflection } from '../useSubmitReflection';

const HISTORY_ANALYZED = '77777777-7777-4777-8777-000000000001';
const BODY: SubmitReflectionRequest = { rating: 5, checks: ['big_feelings'], note: null };

function setup(scenario = '') {
  const bundle = createMockApiClientsBundle({
    search: scenario.length > 0 ? `?scenario=${scenario}` : '',
    timer: createImmediateTimer(),
  });
  const submit = vi.spyOn(bundle.clients.reflections, 'submit');
  const clients: ApiClients = bundle.clients;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ApiClientsProvider clients={clients}>{children}</ApiClientsProvider>
      </QueryClientProvider>
    );
  }
  const keys = () => submit.mock.calls.map(([, options]) => options.idempotencyKey);
  return { bundle, wrapper, queryClient, submit, keys };
}

describe('useSubmitReflection', () => {
  it('실패 후 같은 입력 재시도 = 같은 key, 입력을 바꾸면 새 key (`retry`)', async () => {
    const { wrapper, keys } = setup('reflections:retry');
    const onFailed = vi.fn();
    const { result } = renderHook(() => useSubmitReflection(HISTORY_ANALYZED, { onFailed }), {
      wrapper,
    });

    act(() => result.current.submit(BODY));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(onFailed).toHaveBeenCalledWith('INTERNAL_ERROR', false);

    act(() => result.current.submit(BODY));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(keys()).toHaveLength(2);
    expect(keys()[0]).toBe(keys()[1]);
  });

  it('입력을 바꾸면 새 key 를 쓴다 — `IDEMPOTENCY_KEY_REUSED` 가 나지 않는다', async () => {
    const { wrapper, keys } = setup('reflections:error');
    const { result } = renderHook(() => useSubmitReflection(HISTORY_ANALYZED), { wrapper });

    act(() => result.current.submit(BODY));
    await waitFor(() => expect(result.current.isError).toBe(true));
    act(() => result.current.submit({ ...BODY, rating: 3 }));
    await waitFor(() => expect(keys()).toHaveLength(2));
    expect(keys()[0]).not.toBe(keys()[1]);
  });

  it('진행 중 중복 호출 → 요청 1건 (`loading`)', async () => {
    const { wrapper, submit } = setup('reflections:loading');
    const { result } = renderHook(() => useSubmitReflection(HISTORY_ANALYZED), { wrapper });

    act(() => {
      result.current.submit(BODY);
      result.current.submit(BODY);
      result.current.submit(BODY);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('성공 → 캐시된 세션 상세의 `reflection` 을 채우고 onSubmitted 를 부른다', async () => {
    const { wrapper, queryClient, bundle } = setup();
    const detail = await bundle.clients.sessions.getDetail({ sessionId: HISTORY_ANALYZED });
    queryClient.setQueryData(sessionKeys.completionDetail(HISTORY_ANALYZED), detail);
    const onSubmitted = vi.fn();
    const { result } = renderHook(() => useSubmitReflection(HISTORY_ANALYZED, { onSubmitted }), {
      wrapper,
    });

    act(() => result.current.submit(BODY));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const cached = queryClient.getQueryData<SessionDetail>(
      sessionKeys.completionDetail(HISTORY_ANALYZED),
    );
    expect(cached?.reflection).toMatchObject(BODY);
    expect(onSubmitted).toHaveBeenCalledWith(result.current.reflection);
    // 캐시에 없던 key 는 만들지 않는다
    expect(queryClient.getQueryData(sessionKeys.detail(HISTORY_ANALYZED))).toBeUndefined();
  });

  it('입력을 어떤 저장소에도 쓰지 않는다 (`N5-17`)', async () => {
    localStorage.clear();
    sessionStorage.clear();
    const { wrapper } = setup('reflections:error');
    const { result } = renderHook(() => useSubmitReflection(HISTORY_ANALYZED), { wrapper });
    act(() => result.current.submit({ ...BODY, note: 'private words' }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(JSON.stringify({ ...localStorage })).not.toContain('private words');
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('private words');
  });
});
