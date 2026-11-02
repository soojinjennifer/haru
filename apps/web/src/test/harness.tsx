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
import {
  createSessionRecorderEnvironment,
  type SessionRecorderEnvironmentHandle,
} from '../app/providers/sessionRecorderEnvironment';
import {
  createMockApiClientsBundle,
  createMockAppStatePort,
  createMockRecordingPlatform,
  type MockApiClientsBundle,
} from '../mocks';
import type { MockRecordingStorage } from '../mocks/platform/MockRecordingStorage';
import { createScenarioSource, createScenarioStore } from '../mocks/scenarios';
import { createImmediateTimer } from '../shared/api/helpers';
import { createSystemClock, type Clock } from '../shared/lib/clock';
import { createSystemScheduler, type Scheduler } from '../shared/lib/scheduler';
import { wipeWebRecordingStorage } from '../shared/platform/recording-storage';

export interface HarnessOptions {
  /** `group:key` 표기 (`auth:error`). 여러 개면 배열. */
  scenarios?: readonly string[];
  initialEntries?: readonly string[];
  /**
   * 녹음 상태 머신의 시계·예약 실행기 (기본 = 시스템). 5분 리마인드·10분 방치 경계를 실시간 대기 없이
   * 검증할 때 `createManualScheduler(Date.now())` 를 넘긴다 (`S4-F1R`, AC-4-46).
   */
  recorderTime?: Clock & Scheduler;
}

export interface Harness {
  bundle: MockApiClientsBundle;
  /** 화면이 실제로 쓰는 QueryClient — 로그아웃 캐시 정리 검증(AC-2-29)에 필요하다. */
  queryClient: QueryClient;
  /**
   * 녹음 상태 머신 조립 (Stage 4 `S4-F1`) — **Mock** 녹음기 + 메모리 저장소 + Mock 연결 신호.
   * 실제 앱의 `mock` 모드와 같은 묶음이다 (scenario `recorder:*` 가 같은 store 를 읽는다).
   */
  sessionRecorder: SessionRecorderEnvironmentHandle;
  /**
   * Mock 녹음 저장소 (Stage 4b `S4-F2`) — 로컬 청크·outbox **2시점 측정**(AC-4-113 · AC-4-129)에 쓴다.
   * 세션 화면이 녹음 조립을 처음 열기 전에는 `null` 이다.
   */
  recordingStorage: () => MockRecordingStorage | null;
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
  const clock: Clock = options.recorderTime ?? createSystemClock();
  const scheduler: Scheduler = options.recorderTime ?? createSystemScheduler();
  let recordingStorage: MockRecordingStorage | null = null;
  const sessionRecorder = createSessionRecorderEnvironment({
    clients: bundle.clients,
    clock,
    scheduler,
    // 실제 앱과 같은 로그아웃 정리 — jsdom 에는 IndexedDB·OPFS 가 없어 아무것도 하지 않는다.
    wipeDevice: wipeWebRecordingStorage,
    platform: () => {
      const mock = createMockRecordingPlatform({ store: bundle.store, clock, scheduler });
      recordingStorage = mock.storage;
      return {
        createRecorder: mock.createRecorder,
        storage: mock.storage,
        appState: createMockAppStatePort(),
      };
    },
  });

  return {
    bundle,
    queryClient,
    sessionRecorder,
    recordingStorage: () => recordingStorage,
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[...(options.initialEntries ?? ['/'])]}>
        <AppProviders
          clients={bundle.clients}
          authGateway={bundle.authGateway}
          queryClient={queryClient}
          sessionRecorder={sessionRecorder}
        >
          {children}
        </AppProviders>
      </MemoryRouter>
    ),
  };
}
