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
  type MockErrorCodes,
} from '../mocks';
import type { MockAppStatePort } from '../mocks/platform/MockAppStatePort';
import {
  createMockFileSharePort,
  type MockFileSharePort,
} from '../mocks/platform/MockFileSharePort';
import type { MockRecorderAdapter, MockRecorderCall } from '../mocks/platform/MockRecorderAdapter';
import type { MockRecordingStorage } from '../mocks/platform/MockRecordingStorage';
import { createScenarioSource, createScenarioStore } from '../mocks/scenarios';
import { createImmediateTimer } from '../shared/api/helpers';
import { createSystemClock, type Clock } from '../shared/lib/clock';
import { returnPathStore } from '../shared/lib/return-path';
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
  /**
   * `error` scenario 가 낼 Error Code (`group` · `group.method` — Mock 번들 옵션 그대로). 기본 `INTERNAL_ERROR`.
   * `S4-H4`: 서버가 `ONBOARDING_INCOMPLETE` 를 냈는데 `me` 는 `completed` 인 **어긋남**을 재현한다.
   */
  errorCodes?: MockErrorCodes;
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
  /**
   * Mock 연결·화면 신호 (Stage 4b `S4-H2`) — 세션 화면 오프라인 Toast 를 결정적으로 낸다. 녹음 조립을 처음
   * 열기 전에는 `null` 이다.
   */
  appState: () => MockAppStatePort | null;
  /**
   * 이 조립의 모든 Mock 녹음기 호출 (Stage 4b `S4-H2R`) — Start Session 판정 녹음기 + 세션 녹음기를 한 줄로 센다.
   * 프롬프트 수 = `requestPermission` 개수 (AC-4-145). 녹음 조립을 처음 열기 전에는 빈 배열이다.
   */
  recorderCalls: () => readonly MockRecorderCall[];
  /** 만들어진 Mock 녹음기 — 마지막 것이 지금 세션 화면의 녹음기다 (`failNextStart` 등 사건 주입). */
  recorders: () => readonly MockRecorderAdapter[];
  /**
   * 파일 저장·공유 Mock 포트 (Stage 7 `S7-F`) — scenario `report-pdf:share-*` 를 읽고 호출을 기록한다.
   * 저장은 기록만 한다(jsdom 다운로드 0). 실제 다운로드 계수는 e2e.
   */
  fileShare: MockFileSharePort;
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
  // 로그인 후 복귀 경로(AC-7-46)는 탭 메모리 싱글턴이다 — 테스트끼리 새지 않게 하네스마다 비운다.
  returnPathStore.clear();
  const bundle = createMockApiClientsBundle({
    store: storeFor(options.scenarios ?? []),
    ...(options.errorCodes === undefined ? {} : { errorCodes: options.errorCodes }),
    // 지연을 기다리지 않는다 — `loading` scenario 도 결정적으로 끝난다.
    timer: createImmediateTimer(),
  });

  const queryClient = createQueryClient();
  const fileShare = createMockFileSharePort({ store: bundle.store });
  const clock: Clock = options.recorderTime ?? createSystemClock();
  const scheduler: Scheduler = options.recorderTime ?? createSystemScheduler();
  let recordingStorage: MockRecordingStorage | null = null;
  let appState: MockAppStatePort | null = null;
  let recorderCalls: readonly MockRecorderCall[] = [];
  const recorders: MockRecorderAdapter[] = [];
  const sessionRecorder = createSessionRecorderEnvironment({
    clients: bundle.clients,
    clock,
    scheduler,
    // 실제 앱과 같은 로그아웃 정리 — jsdom 에는 IndexedDB·OPFS 가 없어 아무것도 하지 않는다.
    wipeDevice: wipeWebRecordingStorage,
    platform: () => {
      const mock = createMockRecordingPlatform({ store: bundle.store, clock, scheduler });
      recordingStorage = mock.storage;
      recorderCalls = mock.recorderCalls;
      appState = createMockAppStatePort();
      return {
        createRecorder: () => {
          const recorder = mock.createRecorder();
          recorders.push(recorder);
          return recorder;
        },
        storage: mock.storage,
        appState,
      };
    },
  });

  return {
    bundle,
    queryClient,
    sessionRecorder,
    recordingStorage: () => recordingStorage,
    appState: () => appState,
    recorderCalls: () => recorderCalls,
    recorders: () => recorders,
    fileShare,
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[...(options.initialEntries ?? ['/'])]}>
        <AppProviders
          clients={bundle.clients}
          authGateway={bundle.authGateway}
          queryClient={queryClient}
          fileShare={fileShare}
          sessionRecorder={sessionRecorder}
        >
          {children}
        </AppProviders>
      </MemoryRouter>
    ),
  };
}
