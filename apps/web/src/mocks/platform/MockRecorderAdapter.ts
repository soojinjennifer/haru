/**
 * `MockRecorderAdapter` — `RecorderAdapter` 의 Mock 구현 (Stage 4 `S4-D`, Plan §9.4 "Mock" 열).
 *
 * 무엇을 재현할지는 `mocks/recorder/recorderScenarios.ts` 의 **`RecorderScenarioPlan`** 이 정한다
 * (`S4-C` 가 만든 계획 — 이 파일은 그 계획을 **실행**만 한다):
 *
 * | plan | 동작 |
 * |---|---|
 * | `permission: 'denied'` | 권한 요청 → `denied`, `start()` → `RecorderStartError('permission_denied')` |
 * | `interruptions` | part 마다 `eventAfterChunks` 번째 청크 뒤 원인 1개를 **캡처 종료**로 낸다 — 마지막 조각을 먼저 보낸 뒤 알린다 |
 * | `backgroundOnce` | 첫 part 의 `eventAfterChunks` 번째 청크 뒤 `background` 를 **알림으로만** 낸다 (녹음 계속 — `D4-26`) |
 * | `autoTimeout` · `crashRecovered` | 어댑터는 아무것도 하지 않는다 — 각각 Controller 의 주입 clock · `S4-E` 저장소 몫 |
 *
 * 시간은 주입 `Scheduler` 로만 흐른다 (`setTimeout` 직접 호출 금지 — `mock-source-rules.test.ts`).
 * 청크 본문은 결정적이다 (`seq` 로 채운 고정 길이 바이트).
 */
import type { Clock } from '../../shared/lib/clock';
import type { ScheduledTask, Scheduler } from '../../shared/lib/scheduler';
import {
  RecorderStartError,
  type MicPermissionState,
  type RecorderAdapter,
  type RecorderChunk,
  type RecorderInterruption,
  type RecorderInterruptionCause,
  type RecorderStartFailure,
  type RecorderStopResult,
} from '../../shared/platform/recorder';
import type { InterruptionCause, RecorderScenarioPlan } from '../recorder/recorderScenarios';

/** Mock 청크 MIME — spike §5.2 Chromium 실측 원문. */
export const MOCK_RECORDER_MIME_TYPE = 'audio/webm;codecs=opus';

/** Mock 청크 1개의 바이트 수. */
export const MOCK_RECORDER_CHUNK_BYTES = 256;

/** `recorder` scenario 의 원인 이름 → 플랫폼 중립 원인 (`WebRecorderAdapter` 와 같은 매핑). */
const CAUSE_MAP: Readonly<Record<InterruptionCause, RecorderInterruptionCause>> = {
  visibilitychange: 'background',
  devicechange: 'input_changed',
  'track-ended': 'capture_lost',
};

export type MockRecorderCall =
  'checkPermission' | 'requestPermission' | 'start' | 'pause' | 'resume' | 'stop';

export interface MockRecorderControls {
  /** 호출 기록 — "녹음기를 부르지 않았다" 의 증거 (AC-4-62). */
  readonly calls: readonly MockRecorderCall[];
  isCapturing(): boolean;
  /** 테스트가 임의 시점에 인터럽션을 낸다. `captureStopped` 면 캡처를 먼저 끝낸다. */
  interrupt(cause: RecorderInterruptionCause, captureStopped: boolean): void;
  /** 다음 `start()` 1회를 실패시킨다. */
  failNextStart(reason: RecorderStartFailure): void;
}

export interface MockRecorderAdapter extends RecorderAdapter {
  readonly controls: MockRecorderControls;
}

export interface MockRecorderAdapterOptions {
  plan: RecorderScenarioPlan;
  clock: Clock;
  scheduler: Scheduler;
  chunkBytes?: number;
  mimeType?: string;
}

export function createMockRecorderAdapter(
  options: MockRecorderAdapterOptions,
): MockRecorderAdapter {
  const { plan, clock, scheduler } = options;
  const chunkBytes = options.chunkBytes ?? MOCK_RECORDER_CHUNK_BYTES;
  const mimeType = options.mimeType ?? MOCK_RECORDER_MIME_TYPE;

  const chunkListeners = new Set<(chunk: RecorderChunk) => void>();
  const interruptionListeners = new Set<(interruption: RecorderInterruption) => void>();
  const calls: MockRecorderCall[] = [];
  const pendingInterruptions = [...plan.interruptions];

  let permission: MicPermissionState = 'prompt';
  let state: 'inactive' | 'recording' | 'paused' = 'inactive';
  let timesliceMs = 0;
  let startedAtMs = 0;
  let seq = 0;
  let partChunks = 0;
  let partBytes = 0;
  let partIndex = 0;
  let backgroundSent = false;
  let nextStartFailure: RecorderStartFailure | null = null;
  let task: ScheduledTask | null = null;

  const emitChunk = (final: boolean): void => {
    seq += 1;
    partChunks += 1;
    partBytes += chunkBytes;
    const bytes = new Uint8Array(chunkBytes).fill(seq % 256);
    const chunk: RecorderChunk = {
      seq,
      bytes,
      mimeType,
      offsetMs: clock.now() - startedAtMs,
      final,
    };
    for (const listener of chunkListeners) listener(chunk);
  };

  const emitInterruption = (interruption: RecorderInterruption): void => {
    for (const listener of interruptionListeners) listener(interruption);
  };

  /** 캡처를 끝낸다 — 마지막 조각을 보내고 장치를 놓는다. */
  const finish = (): RecorderStopResult => {
    task?.cancel();
    task = null;
    if (state !== 'inactive') emitChunk(true);
    state = 'inactive';
    return {
      chunkCount: partChunks,
      byteLength: partBytes,
      mimeType: partChunks > 0 ? mimeType : '',
    };
  };

  const interrupt = (cause: RecorderInterruptionCause, captureStopped: boolean): void => {
    if (captureStopped) {
      if (state === 'inactive') return;
      finish();
    }
    emitInterruption({ cause, captureStopped });
  };

  const afterChunk = (): void => {
    if (partChunks !== plan.eventAfterChunks) return;
    if (plan.backgroundOnce && !backgroundSent && partIndex === 1) {
      backgroundSent = true;
      interrupt('background', false);
      return;
    }
    const next = pendingInterruptions.shift();
    if (next !== undefined) interrupt(CAUSE_MAP[next], true);
  };

  const scheduleChunk = (): void => {
    task = scheduler.schedule(timesliceMs, () => {
      task = null;
      if (state !== 'recording') return;
      emitChunk(false);
      afterChunk();
      if (state === 'recording') scheduleChunk();
    });
  };

  const adapter: MockRecorderAdapter = {
    capabilities: () => ({
      platform: 'web',
      backgroundCapture: false,
      screenLockCapture: false,
      nativePause: true,
    }),

    checkPermission() {
      calls.push('checkPermission');
      return Promise.resolve(permission);
    },

    requestPermission() {
      calls.push('requestPermission');
      permission = plan.permission;
      return Promise.resolve(plan.permission);
    },

    start(startOptions) {
      calls.push('start');
      if (nextStartFailure !== null) {
        const reason = nextStartFailure;
        nextStartFailure = null;
        return Promise.reject(new RecorderStartError(reason, 'mock start failure'));
      }
      if (plan.permission === 'denied') {
        return Promise.reject(new RecorderStartError('permission_denied', 'mock: denied'));
      }
      if (state !== 'inactive') {
        return Promise.reject(new RecorderStartError('busy', 'mock: already capturing'));
      }
      permission = 'granted';
      timesliceMs = startOptions.timesliceMs;
      startedAtMs = clock.now();
      state = 'recording';
      seq = 0;
      partChunks = 0;
      partBytes = 0;
      partIndex += 1;
      scheduleChunk();
      return Promise.resolve();
    },

    pause() {
      calls.push('pause');
      if (state === 'recording') {
        task?.cancel();
        task = null;
        state = 'paused';
      }
      return Promise.resolve();
    },

    resume() {
      calls.push('resume');
      if (state === 'inactive') {
        return Promise.reject(new RecorderStartError('failed', 'mock: nothing to resume'));
      }
      if (state === 'paused') {
        state = 'recording';
        scheduleChunk();
      }
      return Promise.resolve();
    },

    stop() {
      calls.push('stop');
      if (state === 'inactive') {
        return Promise.resolve({ chunkCount: 0, byteLength: 0, mimeType: '' });
      }
      return Promise.resolve(finish());
    },

    onChunk(listener) {
      chunkListeners.add(listener);
      return () => {
        chunkListeners.delete(listener);
      };
    },

    onInterruption(listener) {
      interruptionListeners.add(listener);
      return () => {
        interruptionListeners.delete(listener);
      };
    },

    dispose() {
      task?.cancel();
      task = null;
      state = 'inactive';
      chunkListeners.clear();
      interruptionListeners.clear();
    },

    controls: {
      calls,
      isCapturing: () => state !== 'inactive',
      interrupt,
      failNextStart: (reason) => {
        nextStartFailure = reason;
      },
    },
  };

  return adapter;
}
