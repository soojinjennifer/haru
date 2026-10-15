/**
 * `usePushPermission` — 사전 안내 → 요청 → 기기 등록 흐름 (이월 `QA-3-001`, AC-4-81 · Design Spec
 * Stage 3 §2.14 규칙). 실제 Mock 번들(포트 + `MockNotificationApi`)을 쓴다.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createMockApiClientsBundle, type MockPushPermissionPort } from '../../../mocks';
import { REDACTED } from '../../../mocks/request-log';
import { ApiClientsProvider } from '../../../shared/api/context';
import { createImmediateTimer } from '../../../shared/api/helpers';
import { PushPermissionProvider } from '../../../shared/platform/push-permission';
import { usePushPermission } from '../model/usePushPermission';

const REGISTER = 'POST /v1/push-devices';

function setup(scenario = '') {
  const bundle = createMockApiClientsBundle({
    search: scenario === '' ? '' : `?scenario=${scenario}`,
    timer: createImmediateTimer(),
  });
  const port = bundle.pushPermission as MockPushPermissionPort;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ApiClientsProvider clients={bundle.clients}>
        <PushPermissionProvider port={port}>{children}</PushPermissionProvider>
      </ApiClientsProvider>
    </QueryClientProvider>
  );
  const hook = renderHook(() => usePushPermission(), { wrapper });
  const registers = () =>
    bundle.requestLog.entries().filter((entry) => entry.operation === REGISTER);
  return { hook, port, registers };
}

describe('usePushPermission', () => {
  it('마운트만으로는 묻지 않는다 — 상태는 prompt, 프롬프트 0회, 등록 0회', async () => {
    const { hook, port, registers } = setup();
    await waitFor(() => {
      expect(hook.result.current.status).toBe('prompt');
    });
    expect(port.promptCount()).toBe(0);
    expect(registers()).toHaveLength(0);
  });

  it('request → granted → 기기 1회 등록 (platform web · token 은 로그에서 가려진다)', async () => {
    const { hook, port, registers } = setup();
    await waitFor(() => {
      expect(hook.result.current.status).toBe('prompt');
    });

    act(() => {
      hook.result.current.request();
    });

    await waitFor(() => {
      expect(hook.result.current.device).toBeDefined();
    });
    expect(hook.result.current.status).toBe('granted');
    expect(port.promptCount()).toBe(1);
    expect(registers()).toHaveLength(1);
    expect(registers()[0]?.payload).toStrictEqual({ platform: 'web', token: REDACTED });
    expect(hook.result.current.device).not.toHaveProperty('token');
  });

  it('push-permission-denied → denied · 등록 0회 · 다시 눌러도 프롬프트 없음', async () => {
    const { hook, port, registers } = setup('push:push-permission-denied');
    await waitFor(() => {
      expect(hook.result.current.status).toBe('prompt');
    });

    act(() => {
      hook.result.current.request();
    });
    await waitFor(() => {
      expect(hook.result.current.status).toBe('denied');
    });

    act(() => {
      hook.result.current.request();
    });
    expect(port.promptCount()).toBe(1);
    expect(registers()).toHaveLength(0);
    expect(hook.result.current.device).toBeUndefined();
  });

  it('등록 실패 → 권한은 granted 유지 · registerFailed → retryRegister 로 회복', async () => {
    const { hook, registers } = setup('notifications.registerpushdevice:retry');
    await waitFor(() => {
      expect(hook.result.current.status).toBe('prompt');
    });

    act(() => {
      hook.result.current.request();
    });
    await waitFor(() => {
      expect(hook.result.current.registerFailed).toBe(true);
    });
    expect(hook.result.current.status).toBe('granted');

    act(() => {
      hook.result.current.retryRegister();
    });
    await waitFor(() => {
      expect(hook.result.current.device).toBeDefined();
    });
    expect(registers()).toHaveLength(2);
  });
});
