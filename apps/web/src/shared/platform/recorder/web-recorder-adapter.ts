/**
 * `WebRecorderAdapter` — `MediaRecorder` timeslice 청크 캡처 (Stage 4 `S4-D`, `D4-1`).
 *
 * 근거: `docs/qa/stage-4a-spike-report.md` (Chromium 실측). WebKit/iOS 는 미확정이며(`D4-27`)
 * 차이가 드러나면 **이 파일과 `web-media-environment.ts` 만** 고친다.
 *
 * ── spike 결론을 지키는 지점 ──
 * - `M-3` : 청크의 MIME 은 **`dataavailable` 시점의 `Blob.type`** (없으면 그 시점의 `recorder.mimeType`).
 *           `start()` 직후의 `recorder.mimeType` 은 읽지 않는다 (spike 가 빈 문자열을 저장해 복구가 깨졌다).
 * - `M-7` : 끊김 감지를 `track.onended` 에 맡기지 않는다 — **① 트랙 `readyState` 폴링 ② 청크 watchdog
 *           ③ `recorder.state`** 를 함께 본다 (spike §6.1: `track.stop()` 후 `ended` 이벤트 0회,
 *           `recorder.state` 가 스스로 `inactive`).
 * - `D4-27`: 청크가 기대 간격의 `RECORDER_WATCHDOG_FACTOR` 배를 넘겨 오지 않으면 먼저 `requestData()` 로
 *           한 번 깨워 본다. 그래도 오지 않으면 캡처를 정리하고 `chunk_stalled` 를 알린다. WebKit 이
 *           timeslice 를 무시하더라도 **청크 미수신이 조용히 지나가지 않는다**.
 * - `D4-28`: timeslice 는 호출자가 넘긴다 (기본 `RECORDER_TIMESLICE_MS` = 1000).
 * - `D4-26`: 탭이 숨겨지면 `background` 를 **알림으로만** 낸다 (`captureStopped: false`). 실제로 캡처가
 *           끊기면 watchdog/폴링이 별도로 `captureStopped: true` 를 낸다.
 */
import type { Clock } from '../../lib/clock';
import type { ScheduledTask, Scheduler } from '../../lib/scheduler';

import {
  RECORDER_WATCHDOG_FACTOR,
  RecorderStartError,
  type MicPermissionResult,
  type MicPermissionState,
  type RecorderAdapter,
  type RecorderChunk,
  type RecorderInterruption,
  type RecorderInterruptionCause,
  type RecorderStopResult,
} from './recorder-adapter';
import {
  createBrowserMediaEnvironment,
  type WebChunkData,
  type WebMediaEnvironment,
  type WebRecorderHandle,
  type WebStreamHandle,
} from './web-media-environment';

export interface WebRecorderAdapterOptions {
  clock: Clock;
  scheduler: Scheduler;
  /** 테스트가 가짜 브라우저를 넣는다. 기본은 실제 브라우저. */
  environment?: WebMediaEnvironment;
}

interface Run {
  readonly recorder: WebRecorderHandle;
  readonly stream: WebStreamHandle;
  readonly timesliceMs: number;
  readonly startedAtMs: number;
  seq: number;
  chunkCount: number;
  byteLength: number;
  lastMimeType: string;
  /** watchdog 기준 시각 — 마지막 청크 · 시작 · 재개 중 가장 최근. */
  lastProgressAtMs: number;
  /** `requestData()` 로 깨운 시각. 청크가 오면 `null`. */
  rescueAtMs: number | null;
  /** 청크 전달을 순서대로 잇는 사슬 (`arrayBuffer()` 는 비동기다). */
  delivery: Promise<void>;
  stopSeen: boolean;
  stopWaiters: (() => void)[];
  finishing: Promise<RecorderStopResult> | null;
  watchdog: ScheduledTask | null;
  detach: (() => void)[];
}

function errorName(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    const { name } = error;
    if (typeof name === 'string') return name;
  }
  return '';
}

/** `getUserMedia` 오류 이름 → 플랫폼 중립 권한 결과. */
function permissionFromError(error: unknown): MicPermissionResult {
  const name = errorName(error);
  if (name === 'NotFoundError' || name === 'NotReadableError' || name === 'OverconstrainedError') {
    return 'unavailable';
  }
  return 'denied';
}

export function createWebRecorderAdapter(options: WebRecorderAdapterOptions): RecorderAdapter {
  const { clock, scheduler } = options;
  const environment = options.environment ?? createBrowserMediaEnvironment();
  const chunkListeners = new Set<(chunk: RecorderChunk) => void>();
  const interruptionListeners = new Set<(interruption: RecorderInterruption) => void>();

  /** 권한 요청에서 얻은 스트림 — 바로 이어지는 `start()` 가 다시 묻지 않도록 보관한다. */
  let primed: WebStreamHandle | null = null;
  let run: Run | null = null;
  let disposed = false;

  const emitChunk = (chunk: RecorderChunk): void => {
    for (const listener of chunkListeners) listener(chunk);
  };
  const emitInterruption = (interruption: RecorderInterruption): void => {
    for (const listener of interruptionListeners) listener(interruption);
  };

  const isLive = (current: Run): boolean => run === current && current.finishing === null;

  const handleData = (current: Run, data: WebChunkData): void => {
    if (data.size === 0) return;
    // M-3: MIME 은 지금 이 청크에서 읽는다.
    const mimeType = data.type !== '' ? data.type : current.recorder.mimeType();
    const seq = ++current.seq;
    const offsetMs = clock.now() - current.startedAtMs;
    const final = current.recorder.state() === 'inactive';
    current.lastProgressAtMs = clock.now();
    current.rescueAtMs = null;
    current.delivery = current.delivery.then(async () => {
      const buffer = await data.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      current.chunkCount += 1;
      current.byteLength += bytes.byteLength;
      current.lastMimeType = mimeType;
      emitChunk({ seq, bytes, mimeType, offsetMs, final });
    });
  };

  const waitForStop = (current: Run): Promise<void> =>
    new Promise<void>((resolve) => {
      if (current.stopSeen || current.recorder.state() === 'inactive') {
        resolve();
        return;
      }
      // 엔진이 `stop` 을 끝내 보내지 않는 경우에 대비한 상한 — 무한 대기로 녹음을 잃지 않는다.
      const guard = scheduler.schedule(current.timesliceMs * RECORDER_WATCHDOG_FACTOR, () => {
        resolve();
      });
      current.stopWaiters.push(() => {
        guard.cancel();
        resolve();
      });
    });

  /** 캡처를 끝내고 남은 청크를 모두 전달한 뒤 장치를 놓는다. 여러 번 불려도 한 번만 실행된다. */
  const finish = (current: Run): Promise<RecorderStopResult> => {
    if (current.finishing !== null) return current.finishing;
    current.watchdog?.cancel();
    current.watchdog = null;
    for (const detach of current.detach) detach();
    current.detach = [];
    if (current.recorder.state() !== 'inactive') {
      try {
        current.recorder.stop();
      } catch {
        // 이미 멈춘 레코더 — 아래 대기가 곧바로 끝난다.
      }
    }
    current.finishing = (async () => {
      await waitForStop(current);
      await current.delivery.catch(() => undefined);
      current.stream.release();
      if (run === current) run = null;
      return {
        chunkCount: current.chunkCount,
        byteLength: current.byteLength,
        mimeType: current.lastMimeType,
      };
    })();
    return current.finishing;
  };

  /** 의도하지 않은 캡처 종료 — 남은 청크를 먼저 전달하고 그다음 알린다 (청크 보존 우선). */
  const lose = (current: Run, cause: RecorderInterruptionCause): void => {
    if (!isLive(current)) return;
    void finish(current).then(() => {
      if (!disposed) emitInterruption({ cause, captureStopped: true });
    });
  };

  const watch = (current: Run): void => {
    current.watchdog = scheduler.schedule(current.timesliceMs, () => {
      if (!isLive(current)) return;
      // ① 트랙 readyState 폴링 (onended 는 오지 않는다 — spike §6.1)
      if (current.stream.trackEnded()) {
        lose(current, 'capture_lost');
        return;
      }
      const state = current.recorder.state();
      // ③ 레코더가 스스로 멈춤
      if (state === 'inactive') {
        lose(current, 'capture_lost');
        return;
      }
      // ② 청크 watchdog — 녹음 중일 때만 (일시정지 중에는 청크가 오지 않는 게 정상)
      if (state === 'recording') {
        const now = clock.now();
        const limit = current.timesliceMs * RECORDER_WATCHDOG_FACTOR;
        if (current.rescueAtMs === null) {
          if (now - current.lastProgressAtMs > limit) {
            current.rescueAtMs = now;
            try {
              current.recorder.requestData();
            } catch {
              lose(current, 'chunk_stalled');
              return;
            }
          }
        } else if (now - current.rescueAtMs > limit) {
          lose(current, 'chunk_stalled');
          return;
        }
      }
      watch(current);
    });
  };

  const takeStream = async (): Promise<WebStreamHandle> => {
    if (primed !== null) {
      const stream = primed;
      primed = null;
      if (!stream.trackEnded()) return stream;
      stream.release();
    }
    try {
      return await environment.openStream();
    } catch (error) {
      const result = permissionFromError(error);
      throw new RecorderStartError(
        result === 'unavailable' ? 'unavailable' : 'permission_denied',
        'microphone could not be opened',
        { cause: error },
      );
    }
  };

  return {
    capabilities: () => ({
      platform: 'web',
      backgroundCapture: false,
      screenLockCapture: false,
      nativePause: true,
    }),

    async checkPermission(): Promise<MicPermissionState> {
      if (!environment.supported()) return 'unavailable';
      if (primed !== null) return 'granted';
      return (await environment.queryPermission()) ?? 'prompt';
    },

    async requestPermission(): Promise<MicPermissionResult> {
      if (!environment.supported()) return 'unavailable';
      if (primed !== null) return 'granted';
      try {
        primed = await environment.openStream();
        return 'granted';
      } catch (error) {
        return permissionFromError(error);
      }
    },

    async start({ timesliceMs }) {
      if (disposed) throw new RecorderStartError('failed', 'adapter disposed');
      if (run !== null) throw new RecorderStartError('busy', 'a capture is already running');
      if (!environment.supported()) {
        throw new RecorderStartError('unavailable', 'MediaRecorder is not available');
      }
      const stream = await takeStream();
      let recorder: WebRecorderHandle;
      try {
        recorder = environment.createRecorder(stream);
      } catch (error) {
        stream.release();
        throw new RecorderStartError('failed', 'MediaRecorder could not be created', {
          cause: error,
        });
      }
      const now = clock.now();
      const current: Run = {
        recorder,
        stream,
        timesliceMs,
        startedAtMs: now,
        seq: 0,
        chunkCount: 0,
        byteLength: 0,
        lastMimeType: '',
        lastProgressAtMs: now,
        rescueAtMs: null,
        delivery: Promise.resolve(),
        stopSeen: false,
        stopWaiters: [],
        finishing: null,
        watchdog: null,
        detach: [],
      };
      recorder.onData((data) => {
        handleData(current, data);
      });
      recorder.onStop(() => {
        current.stopSeen = true;
        const waiters = current.stopWaiters;
        current.stopWaiters = [];
        for (const waiter of waiters) waiter();
      });
      recorder.onError(() => {
        lose(current, 'capture_lost');
      });
      try {
        recorder.start(timesliceMs);
      } catch (error) {
        stream.release();
        throw new RecorderStartError('failed', 'MediaRecorder could not start', { cause: error });
      }
      run = current;
      current.detach.push(
        environment.onHidden(() => {
          if (isLive(current)) emitInterruption({ cause: 'background', captureStopped: false });
        }),
        environment.onDeviceChange(() => {
          if (isLive(current)) emitInterruption({ cause: 'input_changed', captureStopped: false });
        }),
      );
      watch(current);
    },

    pause() {
      const current = run;
      if (current !== null && isLive(current) && current.recorder.state() === 'recording') {
        current.recorder.pause();
      }
      return Promise.resolve();
    },

    resume() {
      const current = run;
      if (current === null || !isLive(current)) {
        return Promise.reject(
          new RecorderStartError('failed', 'no capture to resume — start a new one'),
        );
      }
      if (current.recorder.state() === 'paused') {
        current.recorder.resume();
        current.lastProgressAtMs = clock.now();
        current.rescueAtMs = null;
      }
      return Promise.resolve();
    },

    stop() {
      const current = run;
      if (current === null) return Promise.resolve({ chunkCount: 0, byteLength: 0, mimeType: '' });
      return finish(current);
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
      disposed = true;
      if (run !== null) void finish(run);
      primed?.release();
      primed = null;
      chunkListeners.clear();
      interruptionListeners.clear();
    },
  };
}
