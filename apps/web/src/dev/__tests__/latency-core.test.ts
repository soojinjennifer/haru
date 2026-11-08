/**
 * `latency-core` — `/__dev/ui/recording-measure` 보강 (Stage 4b `S4-H4`, AC-4-154 · AC-4-155, `D4-144`).
 *
 * A. 시작 지연: **제품 `createWebRecorderAdapter`** 에 가짜 브라우저 환경을 넣고, 그 환경이 만드는 "네이티브" 레코더의
 *    prototype `start` 를 측정이 감싼다 — 실제 브라우저에서 `MediaRecorder.prototype` 을 감싸는 것과 같은 경로다.
 *    ① 두 끝점(`start` 이벤트 · 첫 `dataavailable`) ② 중위값 ③ 측정 후 prototype 원복 · 어댑터 정리 ④ 상한.
 * B. 판정 스트림: `getUserMedia` 감싸기는 호출 동안만 · 원복(실패해도) · 반환 직후 / +1s 트랙 상태.
 */
import { describe, expect, it } from 'vitest';

import type { SessionMode } from '@haru/contracts';

import { createManualScheduler } from '../../test/manual-scheduler';
import { createWebRecorderAdapter } from '../../shared/platform/recorder';
import type {
  WebChunkData,
  WebMediaEnvironment,
  WebRecorderHandle,
  WebRecorderState,
  WebStreamHandle,
} from '../../shared/platform/recorder/web-media-environment';
import {
  measureStartLatency,
  median,
  observeSessionModeStreams,
  summarizeStartLatency,
  watchRecorderEvents,
  type MediaDevicesLike,
  type RecorderPrototypeLike,
} from '../recording-measure/latency-core';

const MIME = 'audio/webm;codecs=opus';

async function flush(): Promise<void> {
  for (let index = 0; index < 30; index += 1) await Promise.resolve();
}

/**
 * "네이티브" 레코더 — `start()` 가 prototype 에 있다 (실제 `MediaRecorder` 처럼). `startDelayMs` 뒤 `start` 이벤트,
 * `firstDataDelayMs` 뒤 `dataavailable` 을 낸다 (`null` 이면 안 낸다).
 */
function nativeClass(
  scheduler: ReturnType<typeof createManualScheduler>,
  timing: { startDelayMs: number; firstDataDelayMs: number | null },
) {
  return class NativeRecorder extends EventTarget {
    state: WebRecorderState = 'inactive';
    data: ((chunk: WebChunkData) => void) | null = null;
    stops: (() => void)[] = [];

    start(this: NativeRecorder, _timeslice?: number): void {
      this.state = 'recording';
      scheduler.schedule(timing.startDelayMs, () => {
        this.dispatchEvent(new Event('start'));
      });
      if (timing.firstDataDelayMs === null) return;
      scheduler.schedule(timing.firstDataDelayMs, () => {
        this.dispatchEvent(new Event('dataavailable'));
        const bytes = new Uint8Array(8);
        this.data?.({ size: 8, type: MIME, arrayBuffer: () => Promise.resolve(bytes.buffer) });
      });
    }
  };
}

function setup(timing: { startDelayMs: number; firstDataDelayMs: number | null }) {
  const scheduler = createManualScheduler(1_000);
  const Native = nativeClass(scheduler, timing);
  const opened: { released: boolean }[] = [];
  const environment: WebMediaEnvironment = {
    supported: () => true,
    queryPermission: () => Promise.resolve('granted'),
    openStream() {
      const state = { released: false };
      opened.push(state);
      const handle: WebStreamHandle = {
        trackEnded: () => false,
        release: () => {
          state.released = true;
        },
      };
      return Promise.resolve(handle);
    },
    createRecorder() {
      const native = new Native();
      const handle: WebRecorderHandle = {
        state: () => native.state,
        mimeType: () => MIME,
        start: (timesliceMs) => {
          native.start(timesliceMs);
        },
        pause: () => undefined,
        resume: () => undefined,
        stop: () => {
          native.state = 'inactive';
          for (const stop of native.stops) stop();
        },
        requestData: () => undefined,
        onData: (listener) => {
          native.data = listener;
        },
        onStop: (listener) => {
          native.stops.push(listener);
        },
        onError: () => undefined,
      };
      return handle;
    },
    onHidden: () => () => undefined,
    onDeviceChange: () => () => undefined,
  };
  const adapter = createWebRecorderAdapter({ clock: scheduler, scheduler, environment });
  const proto = Native.prototype as unknown as RecorderPrototypeLike;
  return { scheduler, adapter, proto, opened, originalStart: Native.prototype.start };
}

describe('AC-4-154 — 녹음 시작 지연 두 끝점 (제품 WebRecorderAdapter 경로)', () => {
  it('탭 → `start` 이벤트 · 첫 `dataavailable` 를 따로 잰다 · 첫 청크 MIME · 측정 뒤 원복·장치 해제', async () => {
    const t = setup({ startDelayMs: 40, firstDataDelayMs: 1_010 });
    const tapAtMs = t.scheduler.now() - 15; // 탭은 측정 시작 15ms 전
    const pending = measureStartLatency({
      tapAtMs,
      adapter: t.adapter,
      proto: t.proto,
      timesliceMs: 1_000,
      timeoutMs: 5_000,
      now: () => t.scheduler.now(),
      scheduler: t.scheduler,
    });
    await flush();
    expect(t.proto.start).not.toBe(t.originalStart); // 측정 중에는 감싸져 있다
    t.scheduler.advance(40);
    await flush();
    t.scheduler.advance(970);
    await flush();
    const sample = await pending;

    expect(sample).toStrictEqual({
      tapToStartMs: 55,
      tapToFirstDataMs: 1_025,
      mimeType: MIME,
      error: null,
    });
    expect(t.proto.start).toBe(t.originalStart);
    expect(t.opened).toHaveLength(1);
    expect(t.opened[0]?.released).toBe(true);
  });

  it('첫 청크가 상한 안에 안 오면 그 끝점은 `null` · 여전히 원복한다', async () => {
    const t = setup({ startDelayMs: 30, firstDataDelayMs: null });
    const pending = measureStartLatency({
      tapAtMs: t.scheduler.now(),
      adapter: t.adapter,
      proto: t.proto,
      timesliceMs: 1_000,
      timeoutMs: 5_000,
      now: () => t.scheduler.now(),
      scheduler: t.scheduler,
    });
    await flush();
    t.scheduler.advance(5_000);
    await flush();
    const sample = await pending;
    expect(sample.tapToStartMs).toBe(30);
    expect(sample.tapToFirstDataMs).toBeNull();
    expect(t.proto.start).toBe(t.originalStart);
  });

  it('감싸기는 원래 `start` 를 같은 대상·인자로 부른다 (동작 변경 0)', () => {
    const calls: unknown[] = [];
    const proto: RecorderPrototypeLike = {
      start(this: EventTarget, timeslice?: number) {
        calls.push([this, timeslice]);
      },
    };
    const original = proto.start;
    const target = new EventTarget();
    const restore = watchRecorderEvents(
      proto,
      () => 0,
      { startAtMs: null, firstDataAtMs: null },
      () => undefined,
    );
    proto.start.call(target, 1_000);
    restore();
    expect(calls).toStrictEqual([[target, 1_000]]);
    expect(proto.start).toBe(original);
  });

  it('중위값 — 홀수 · 짝수 · 빈 값, 끝점별 요약은 `null` 회차를 뺀다', () => {
    expect(median([300, 100, 200])).toBe(200);
    expect(median([100, 200, 300, 400])).toBe(250);
    expect(median([])).toBeNull();
    const summary = summarizeStartLatency([
      { tapToStartMs: 120, tapToFirstDataMs: 1_180, mimeType: MIME, error: null },
      { tapToStartMs: 90, tapToFirstDataMs: null, mimeType: MIME, error: null },
      { tapToStartMs: 150, tapToFirstDataMs: 1_220, mimeType: MIME, error: null },
    ]);
    expect(summary).toStrictEqual({ runs: 3, medianStartMs: 120, medianFirstDataMs: 1_200 });
  });
});

/** 가짜 트랙·스트림 — `stop()` 하면 `ended`. */
function fakeStream(): MediaStream {
  let readyState: MediaStreamTrackState = 'live';
  const track = {
    kind: 'audio',
    get readyState(): MediaStreamTrackState {
      return readyState;
    },
    stop: (): void => {
      readyState = 'ended';
    },
  };
  return { getTracks: () => [track] } as unknown as MediaStream;
}

describe('AC-4-155 — 판정 스트림 해제 관측', () => {
  it('판정 동안 열린 트랙 수 · 반환 직후 · +1s readyState · 판정 결과 · 감싸기 원복', async () => {
    const scheduler = createManualScheduler(0);
    const stream = fakeStream();
    const original = (): Promise<MediaStream> => Promise.resolve(stream);
    const devices: MediaDevicesLike = { getUserMedia: original };
    const pending = observeSessionModeStreams({
      devices,
      // 제품 판정처럼 — 스트림을 열고 결과를 낸 뒤 놓는다
      resolveSessionMode: async (): Promise<SessionMode> => {
        const opened = await devices.getUserMedia({ audio: true });
        for (const track of opened.getTracks()) track.stop();
        return 'recorded';
      },
      settleMs: 1_000,
      scheduler,
    });
    await flush();
    expect(devices.getUserMedia).toBe(original); // 반환 직후 이미 원복
    scheduler.advance(1_000);
    const observed = await pending;
    expect(observed).toStrictEqual({
      result: 'recorded',
      error: null,
      streamsOpened: 1,
      tracksOpened: 1,
      afterReturn: [{ kind: 'audio', readyState: 'ended' }],
      afterOneSecond: [{ kind: 'audio', readyState: 'ended' }],
      restored: true,
    });
  });

  it('판정이 실패해도 원복한다 — 측정판 밖 호출에 감싸기가 남지 않는다', async () => {
    const scheduler = createManualScheduler(0);
    const original = (): Promise<MediaStream> => Promise.resolve(fakeStream());
    const devices: MediaDevicesLike = { getUserMedia: original };
    const pending = observeSessionModeStreams({
      devices,
      resolveSessionMode: () => Promise.reject(new TypeError('boom')),
      settleMs: 1_000,
      scheduler,
    });
    await flush();
    scheduler.advance(1_000);
    const observed = await pending;
    expect(observed.error).toBe('TypeError');
    expect(observed.result).toBeNull();
    expect(observed.streamsOpened).toBe(0);
    expect(devices.getUserMedia).toBe(original);
  });
});
