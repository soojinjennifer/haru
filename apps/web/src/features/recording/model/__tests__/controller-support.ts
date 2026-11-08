/**
 * `RecordingController` 테스트 준비물 (`S4-D`). 테스트 전용 — 앱 코드가 import 하지 않는다.
 *
 * - 시간: `createManualScheduler` (실시간 대기 없음)
 * - 녹음기: `MockRecorderAdapter` (+ `recorder` scenario 계획)
 * - 로컬 저장: 메모리 sink — **청크 파일 수 · 총 바이트**를 센다 (AC-4-45 측정 대상)
 * - 전이: 요청을 기록하는 가짜 포트 (실패 주입 가능). Mock API 연동 검증은 별도 통합 테스트.
 */
import {
  HaruApiError,
  SessionTransitionRequestSchema,
  type ConsentStatus,
  type ErrorCode,
  type SessionMode,
  type SessionStatus,
  type SessionTransitionRequest,
  type SessionTransitionResult,
} from '@haru/contracts';

import { NetworkError } from '../../../../shared/api';
import {
  createMockRecorderAdapter,
  type MockRecorderAdapter,
} from '../../../../mocks/platform/MockRecorderAdapter';
import type { RecorderScenarioPlan } from '../../../../mocks/recorder/recorderScenarios';
import { createManualScheduler, type ManualScheduler } from '../../../../test/manual-scheduler';
import { createConsentGate } from '../consent-gate';
import { createPermissionService } from '../permission-service';
import type {
  RecordingChunkWrite,
  RecordingPartEnd,
  RecordingPartStart,
  RecordingSink,
  SessionServerState,
  SessionTransitionPort,
} from '../ports';
import {
  createRecordingController,
  type RecordingController,
  type RecordingControllerEvent,
  type RecordingControllerOptions,
} from '../recording-controller';

export const START_MS = Date.UTC(2026, 0, 1, 0, 0, 0);
export const SESSION_ID = '00000000-0000-4000-8000-0000000000a1';
/** 테스트용 리마인드 시점 — 실제 값은 미결(handoff S4-D NEEDS_DECISION). 경계 검증에만 쓴다. */
export const TEST_REMINDER_SECONDS = 300;

export const CONSENTED: ConsentStatus = {
  required: ['terms_of_service', 'privacy_policy', 'child_voice_data'],
  missing: [],
  grantedAt: '2026-01-01T00:00:00.000Z',
};

export const VOICE_MISSING: ConsentStatus = {
  required: ['terms_of_service', 'privacy_policy', 'child_voice_data'],
  missing: ['child_voice_data'],
  grantedAt: null,
};

export const PLAN_SUCCESS: RecorderScenarioPlan = {
  key: 'success',
  initialPermission: 'prompt',
  permission: 'granted',
  revokedOnStart: false,
  interruptions: [],
  backgroundOnce: false,
  autoTimeout: false,
  crashRecovered: false,
  eventAfterChunks: 3,
};

export interface MemorySink extends RecordingSink {
  readonly parts: Map<number, { start: RecordingPartStart; end: RecordingPartEnd | null }>;
  readonly chunks: RecordingChunkWrite[];
  readonly discarded: string[];
  /** 로컬에 남은 청크 "파일" 수 (discard 후 0). */
  fileCount(): number;
  totalBytes(): number;
}

export function createMemorySink(): MemorySink {
  const parts = new Map<number, { start: RecordingPartStart; end: RecordingPartEnd | null }>();
  const chunks: RecordingChunkWrite[] = [];
  const discarded: string[] = [];
  return {
    parts,
    chunks,
    discarded,
    beginPart(part) {
      parts.set(part.partNo, { start: part, end: null });
      return Promise.resolve();
    },
    appendChunk(chunk) {
      chunks.push(chunk);
      return Promise.resolve();
    },
    endPart(part) {
      const entry = parts.get(part.partNo);
      if (entry !== undefined) entry.end = part;
      return Promise.resolve();
    },
    discardSession(sessionId) {
      discarded.push(sessionId);
      chunks.length = 0;
      parts.clear();
      return Promise.resolve();
    },
    fileCount: () => chunks.length,
    totalBytes: () => chunks.reduce((sum, chunk) => sum + chunk.bytes.byteLength, 0),
  };
}

export interface FakeTransitionPort extends SessionTransitionPort {
  readonly requests: SessionTransitionRequest[];
  /** 서버 상태 (요청 성공 시 `to` 로 바뀐다). */
  server: SessionServerState;
  /** 다음 요청 1회를 실패시킨다. */
  failNext(error: unknown): void;
  fetchCount(): number;
}

export function apiError(code: ErrorCode): HaruApiError {
  return new HaruApiError(code, code);
}

export function networkError(): NetworkError {
  return new NetworkError('offline');
}

export function createFakeTransitionPort(mode: SessionMode = 'recorded'): FakeTransitionPort {
  const requests: SessionTransitionRequest[] = [];
  const failures: unknown[] = [];
  let fetches = 0;
  const port: FakeTransitionPort = {
    requests,
    server: { status: 'ready', recordedSeconds: 0 },
    failNext(error) {
      failures.push(error);
    },
    fetchCount: () => fetches,
    send(request) {
      // 컨트롤러가 만든 요청이 contracts 를 통과하는지 매번 확인한다.
      SessionTransitionRequestSchema.parse(request);
      requests.push(request);
      const failure = failures.shift();
      if (failure !== undefined) return Promise.reject(failure);
      port.server = {
        status: request.to,
        recordedSeconds: request.recordedSeconds ?? port.server.recordedSeconds,
      };
      const result: SessionTransitionResult = {
        session: {
          id: SESSION_ID,
          status: request.to,
          mode,
          book: null,
          readingContext: null,
          readyAt: '2026-01-01T00:00:00.000Z',
          startedAt: null,
          completedAt: null,
          completedReason: request.completedReason ?? null,
          recordedSeconds: port.server.recordedSeconds,
          analysisOutcome: null,
          prompts: [],
          bubble: null,
          reminderBubble: null,
        },
      };
      return Promise.resolve(result);
    },
    fetchState() {
      fetches += 1;
      return Promise.resolve(port.server);
    },
  };
  return port;
}

export interface Harness {
  readonly controller: RecordingController;
  readonly scheduler: ManualScheduler;
  readonly recorder: MockRecorderAdapter;
  readonly sink: MemorySink;
  readonly port: FakeTransitionPort;
  readonly events: RecordingControllerEvent[];
  setConsent(status: ConsentStatus | null): void;
  /** 시간을 `ms` 앞으로 돌리고 microtask 를 비운다 (1초 단위로 나눠 진행). */
  advance(ms: number): Promise<void>;
}

export interface HarnessOptions {
  mode?: SessionMode;
  plan?: RecorderScenarioPlan;
  consent?: ConsentStatus | null;
  overrides?: Partial<RecordingControllerOptions>;
}

export async function flush(): Promise<void> {
  for (let index = 0; index < 20; index += 1) await Promise.resolve();
}

export function createHarness(options: HarnessOptions = {}): Harness {
  const scheduler = createManualScheduler(START_MS);
  const recorder = createMockRecorderAdapter({
    plan: options.plan ?? PLAN_SUCCESS,
    clock: scheduler,
    scheduler,
  });
  const sink = createMemorySink();
  const mode = options.mode ?? 'recorded';
  const port = createFakeTransitionPort(mode);
  let consent: ConsentStatus | null = options.consent === undefined ? CONSENTED : options.consent;
  const controller = createRecordingController({
    sessionId: SESSION_ID,
    mode,
    recorder,
    permissions: createPermissionService(recorder),
    consentGate: createConsentGate(() => consent),
    transitions: port,
    sink,
    clock: scheduler,
    scheduler,
    readyReminderAfterSeconds: TEST_REMINDER_SECONDS,
    ...options.overrides,
  });
  const events: RecordingControllerEvent[] = [];
  controller.onEvent((event) => {
    events.push(event);
  });
  return {
    controller,
    scheduler,
    recorder,
    sink,
    port,
    events,
    setConsent(status) {
      consent = status;
    },
    async advance(ms) {
      let left = ms;
      while (left > 0) {
        const step = Math.min(1000, left);
        scheduler.advance(step);
        left -= step;
        await flush();
      }
    },
  };
}

export function statusOf(harness: Harness): SessionStatus {
  return harness.controller.getSnapshot().status;
}
