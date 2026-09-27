/**
 * 테스트 조립 헬퍼 — 실제 앱과 **같은 provider 순서**로 화면을 띄운다.
 *
 * Mock 번들을 하나 만들어 `ApiClients` 와 `AuthGateway` 를 함께 주입한다. 그래야
 * scenario store 와 요청 로그를 화면·Gateway 가 공유하고, AC-2-13 요청 전수 검사가
 * "그 화면에서 실제로 나간 요청" 을 근거로 성립한다.
 */
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

import { AppProviders } from '../app/providers/AppProviders';
import { createQueryClient } from '../app/providers/QueryProvider';
import { createMockApiClientsBundle, type MockApiClientsBundle } from '../mocks';
import { createScenarioSource, createScenarioStore } from '../mocks/scenarios';
import { createImmediateTimer } from '../shared/api/helpers';

export interface HarnessOptions {
  /** `group:key` 표기 (`auth:error`). 여러 개면 배열. */
  scenarios?: readonly string[];
  initialEntries?: readonly string[];
}

export interface Harness {
  bundle: MockApiClientsBundle;
  /** 화면이 실제로 쓰는 QueryClient — 로그아웃 캐시 정리 검증(AC-2-29)에 필요하다. */
  queryClient: QueryClient;
  wrapper: (props: { children: ReactNode }) => ReactNode;
}

function storeFor(scenarios: readonly string[]) {
  const explicit: Record<string, string> = {};

  for (const entry of scenarios) {
    const [group, key] = entry.split(':');
    if (group !== undefined && key !== undefined) explicit[group] = key;
  }

  return createScenarioStore([createScenarioSource('url', explicit)]);
}

export function createHarness(options: HarnessOptions = {}): Harness {
  const bundle = createMockApiClientsBundle({
    store: storeFor(options.scenarios ?? []),
    // 지연을 기다리지 않는다 — `loading` scenario 도 결정적으로 끝난다.
    timer: createImmediateTimer(),
  });

  const queryClient = createQueryClient();

  return {
    bundle,
    queryClient,
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[...(options.initialEntries ?? ['/'])]}>
        <AppProviders
          clients={bundle.clients}
          authGateway={bundle.authGateway}
          queryClient={queryClient}
        >
          {children}
        </AppProviders>
      </MemoryRouter>
    ),
  };
}
