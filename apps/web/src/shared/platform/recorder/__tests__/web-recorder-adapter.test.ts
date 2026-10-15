/**
 * `WebRecorderAdapter` 판단 로직 테스트 (`S4-D`) — 가짜 브라우저 환경(`WebMediaEnvironment`) 주입.
 *
 * 실제 `MediaRecorder` 거동은 spike 가 측정했다 (`docs/qa/stage-4a-spike-report.md`). 여기서는 그 측정
 * 결과를 **입력으로 재현**해 어댑터가 올바르게 반응하는지 본다:
 * - `M-3` 시작 직후 `recorder.mimeType === ''` → 청크 MIME 은 청크에서 읽는다 (§5.4)
 * - `M-7` 트랙이 죽어도 `ended` 이벤트가 오지 않는다 → readyState 폴링 · `recorder.state` · watchdog (§6.1)
 * - `D4-27` 청크가 오지 않으면 `requestData()` 로 깨우고, 그래도 없으면 `chunk_stalled`
 */
import { describe, expect, it } from 'vitest';

import { createManualScheduler } from '../../../../test/manual-scheduler';
import {
  RECORDER_TIMESLICE_MS,
  RECORDER_WATCHDOG_FACTOR,
  isRecorderStartError,
  type RecorderChunk,
  type RecorderInterruption,
} from '../recorder-adapter';
import type {
  WebChunkData,
  WebMediaEnvironment,
  WebRecorderHandle,
  WebRecorderState,
  WebStreamHandle,
} from '../web-media-environment';
import { createWebRecorderAdapter } from '../web-recorder-adapter';

async function flush(): Promise<void> {
  for (let index = 0; index < 20; index += 1) await Promise.resolve();
}

class FakeRecorder implements WebRecorderHandle {
  current: WebRecorderState = 'inactive';
  /** spike §5.4: 시작 직후 빈 문자열, 첫 청크 이후 실제 값 */
  reportedMime = '';
  readonly calls: string[] = [];
  private data: ((data: WebChunkData) => void)[] = [];
  private stops: (() => void)[] = [];
  private errors: (() => void)[] = [];

  constructor(private readonly blobType: string) {}

  state = (): WebRecorderState => this.current;
  mimeType = (): string => this.reportedMime;
  start(timesliceMs: number): void {
    this.calls.push(`start:${String(timesliceMs)}`);
    this.current = 'recording';
  }
  pause(): void {
    this.calls.push('pause');
    this.current = 'paused';
  }
  resume(): void {
    this.calls.push('resume');
    this.current = 'recording';
  }
  stop(): void {
    this.calls.push('stop');
    this.current = 'inactive';
    this.chunk(3);
    for (const listener of this.stops) listener();
  }
  requestData(): void {
    this.calls.push('requestData');
  }
  onData(listener: (data: WebChunkData) => void): void {
    this.data.push(listener);
  }
  onStop(listener: () => void): void {
    this.stops.push(listener);
  }
  onError(listener: () => void): void {
    this.errors.push(listener);
  }
  /** 브라우저가 청크를 내는 것처럼 */
  chunk(size: number, type = this.blobType): void {
    this.reportedMime = this.blobType;
    const bytes = new Uint8Array(size).fill(size % 256);
    const data: WebChunkData = { size, type, arrayBuffer: () => Promise.resolve(bytes.buffer) };
    for (const listener of this.data) listener(data);
  }
  /** spike §6.1: 트랙이 죽은 뒤 레코더가 스스로 inactive — stop 이벤트는 온다 */
  dieOnItsOwn(): void {
    this.current = 'inactive';
    for (const listener of this.stops) listener();
  }
  fail(): void {
    for (const listener of this.errors) listener();
  }
}

interface FakeEnv extends WebMediaEnvironment {
  recorders: FakeRecorder[];
  streams: { ended: boolean; released: boolean }[];
  hide(): void;
  deviceChange(): void;
  openError: { name: string } | null;
  permission: 'granted' | 'denied' | 'prompt' | null;
  isSupported: boolean;
}

function fakeEnv(blobType = 'audio/mp4; codecs=mp4a.40.2'): FakeEnv {
  const hidden = new Set<() => void>();
  const devices = new Set<() => void>();
  const env: FakeEnv = {
    recorders: [],
    streams: [],
    openError: null,
    permission: null,
    isSupported: true,
    supported: () => env.isSupported,
    queryPermission: () => Promise.resolve(env.permission),
    openStream() {
      if (env.openError !== null) return Promise.reject(env.openError);
      const state = { ended: false, released: false };
      env.streams.push(state);
      const handle: WebStreamHandle = {
        trackEnded: () => state.ended,
        release: () => {
          state.released = true;
        },
      };
      return Promise.resolve(handle);
    },
    createRecorder() {
      const recorder = new FakeRecorder(blobType);
      env.recorders.push(recorder);
      return recorder;
    },
    onHidden(listener) {
      hidden.add(listener);
      return () => hidden.delete(listener);
    },
    onDeviceChange(listener) {
      devices.add(listener);
      return () => devices.delete(listener);
    },
    hide: () => {
      for (const listener of hidden) listener();
    },
    deviceChange: () => {
      for (const listener of devices) listener();
    },
  };
  return env;
}

function setup(blobType?: string) {
  const scheduler = createManualScheduler(0);
  const env = fakeEnv(blobType);
  const adapter = createWebRecorderAdapter({ clock: scheduler, scheduler, environment: env });
  const chunks: RecorderChunk[] = [];
  const interruptions: RecorderInterruption[] = [];
  adapter.onChunk((chunk) => chunks.push(chunk));
  adapter.onInterruption((event) => interruptions.push(event));
  const recorder = (): FakeRecorder => {
    const last = env.recorders.at(-1);
    if (last === undefined) throw new Error('no recorder');
    return last;
  };
  return { scheduler, env, adapter, chunks, interruptions, recorder };
}

const LIMIT = RECORDER_TIMESLICE_MS * RECORDER_WATCHDOG_FACTOR;

describe('D4-28 · 시작', () => {
  it('timeslice 기본값은 1000ms 다', () => {
    expect(RECORDER_TIMESLICE_MS).toBe(1000);
  });

  it('start 가 넘긴 timeslice 로 MediaRecorder 를 시작한다', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: RECORDER_TIMESLICE_MS });
    expect(t.recorder().calls).toEqual(['start:1000']);
  });

  it('녹음 수단이 없으면 unavailable', async () => {
    const t = setup();
    t.env.isSupported = false;
    expect(await t.adapter.checkPermission()).toBe('unavailable');
    expect(await t.adapter.requestPermission()).toBe('unavailable');
    const error = await t.adapter.start({ timesliceMs: 1000 }).catch((e: unknown) => e);
    expect(isRecorderStartError(error) && error.reason).toBe('unavailable');
  });

  it('getUserMedia 오류 이름을 권한 결과로 바꾼다', async () => {
    const cases = [
      ['NotAllowedError', 'denied'],
      ['SecurityError', 'denied'],
      ['NotFoundError', 'unavailable'],
      ['NotReadableError', 'unavailable'],
    ] as const;
    for (const [name, expected] of cases) {
      const t = setup();
      t.env.openError = { name };
      expect(await t.adapter.requestPermission()).toBe(expected);
    }
  });

  it('권한 요청에서 연 스트림을 바로 다음 start 가 재사용한다 (두 번 묻지 않는다)', async () => {
    const t = setup();
    expect(await t.adapter.requestPermission()).toBe('granted');
    expect(await t.adapter.checkPermission()).toBe('granted');
    await t.adapter.start({ timesliceMs: 1000 });
    expect(t.env.streams).toHaveLength(1);
  });

  it('permissions.query 를 지원하지 않으면 prompt', async () => {
    const t = setup();
    expect(await t.adapter.checkPermission()).toBe('prompt');
    t.env.permission = 'denied';
    expect(await t.adapter.checkPermission()).toBe('denied');
  });

  it('이미 캡처 중이면 busy', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    const error = await t.adapter.start({ timesliceMs: 1000 }).catch((e: unknown) => e);
    expect(isRecorderStartError(error) && error.reason).toBe('busy');
  });
});

describe('M-3 — 청크 MIME 은 청크 시점의 원문', () => {
  it('start 직후 recorder.mimeType 이 빈 문자열이어도 청크는 Blob.type 원문을 싣는다', async () => {
    const t = setup('audio/mp4; codecs=mp4a.40.2');
    await t.adapter.start({ timesliceMs: 1000 });
    expect(t.recorder().mimeType()).toBe('');
    t.recorder().chunk(10);
    t.recorder().chunk(20);
    await flush();
    expect(t.chunks.map((chunk) => [chunk.seq, chunk.mimeType, chunk.bytes.byteLength])).toEqual([
      [1, 'audio/mp4; codecs=mp4a.40.2', 10],
      [2, 'audio/mp4; codecs=mp4a.40.2', 20],
    ]);
  });

  it('Blob.type 이 비면 그 시점의 recorder.mimeType 을 쓴다', async () => {
    const t = setup('audio/webm;codecs=opus');
    await t.adapter.start({ timesliceMs: 1000 });
    t.recorder().chunk(5, '');
    await flush();
    expect(t.chunks[0]?.mimeType).toBe('audio/webm;codecs=opus');
  });

  it('크기 0 청크는 버린다', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.recorder().chunk(0);
    await flush();
    expect(t.chunks).toEqual([]);
  });

  it('stop 은 마지막 조각을 전달한 뒤 resolve 하고 마이크를 놓는다', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.recorder().chunk(10);
    const result = await t.adapter.stop();
    expect(t.chunks.map((chunk) => chunk.final)).toEqual([false, true]);
    expect(result).toEqual({
      chunkCount: 2,
      byteLength: 13,
      mimeType: 'audio/mp4; codecs=mp4a.40.2',
    });
    expect(t.env.streams[0]?.released).toBe(true);
  });
});

describe('M-7 — 인터럽션 감지는 onended 에 의존하지 않는다', () => {
  it('① 트랙 readyState=ended 폴링 → capture_lost (마지막 조각 먼저)', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.recorder().chunk(10);
    const stream = t.env.streams[0];
    if (stream === undefined) throw new Error('no stream');
    stream.ended = true;
    t.scheduler.advance(1000);
    await flush();
    expect(t.interruptions).toEqual([{ cause: 'capture_lost', captureStopped: true }]);
    expect(t.chunks.at(-1)?.final).toBe(true);
    expect(stream.released).toBe(true);
  });

  it('③ 레코더가 스스로 inactive → capture_lost', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.recorder().dieOnItsOwn();
    t.scheduler.advance(1000);
    await flush();
    expect(t.interruptions).toEqual([{ cause: 'capture_lost', captureStopped: true }]);
  });

  it('레코더 오류 이벤트 → capture_lost', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.recorder().fail();
    await flush();
    expect(t.interruptions).toEqual([{ cause: 'capture_lost', captureStopped: true }]);
  });

  it('② 청크 정체 → requestData() 로 깨우고, 청크가 오면 계속한다 (D4-27)', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.scheduler.advance(LIMIT + 1000);
    await flush();
    expect(t.recorder().calls).toContain('requestData');
    t.recorder().chunk(8);
    t.scheduler.advance(LIMIT);
    await flush();
    expect(t.interruptions).toEqual([]);
  });

  it('② requestData 뒤에도 청크가 없으면 chunk_stalled + 캡처 정리', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.scheduler.advance(LIMIT * 3);
    await flush();
    expect(t.interruptions).toEqual([{ cause: 'chunk_stalled', captureStopped: true }]);
    expect(t.recorder().current).toBe('inactive');
    expect(t.env.streams[0]?.released).toBe(true);
  });

  it('정상 간격(1초)으로 청크가 오면 watchdog 이 조용하다', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    for (let second = 0; second < 30; second += 1) {
      t.scheduler.advance(1000);
      t.recorder().chunk(4);
      await flush();
    }
    expect(t.interruptions).toEqual([]);
    expect(t.recorder().calls).not.toContain('requestData');
  });

  it('일시정지 중에는 청크 watchdog 이 돌지 않는다 (트랙 폴링은 계속)', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    await t.adapter.pause();
    t.scheduler.advance(LIMIT * 5);
    await flush();
    expect(t.interruptions).toEqual([]);
    const stream = t.env.streams[0];
    if (stream === undefined) throw new Error('no stream');
    stream.ended = true;
    t.scheduler.advance(1000);
    await flush();
    expect(t.interruptions).toEqual([{ cause: 'capture_lost', captureStopped: true }]);
  });

  it('끊긴 뒤 resume 은 거절된다 — 새 start 가 필요하다', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.recorder().fail();
    await flush();
    const error = await t.adapter.resume().catch((e: unknown) => e);
    expect(isRecorderStartError(error)).toBe(true);
    await t.adapter.start({ timesliceMs: 1000 });
    expect(t.env.recorders).toHaveLength(2);
  });
});

describe('알림성 인터럽션 (captureStopped: false)', () => {
  it('탭 숨김 → background 알림, 캡처 유지 (D4-26)', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.env.hide();
    expect(t.interruptions).toEqual([{ cause: 'background', captureStopped: false }]);
    expect(t.recorder().current).toBe('recording');
  });

  it('devicechange → input_changed 알림', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    t.env.deviceChange();
    expect(t.interruptions).toEqual([{ cause: 'input_changed', captureStopped: false }]);
  });

  it('캡처가 끝나면 리스너를 떼어 더 알리지 않는다', async () => {
    const t = setup();
    await t.adapter.start({ timesliceMs: 1000 });
    await t.adapter.stop();
    t.env.hide();
    t.env.deviceChange();
    expect(t.interruptions).toEqual([]);
  });
});

describe('capabilities', () => {
  it('Web 은 백그라운드·화면 잠금 캡처를 보장하지 않는다 (D4-4)', () => {
    const t = setup();
    expect(t.adapter.capabilities()).toEqual({
      platform: 'web',
      backgroundCapture: false,
      screenLockCapture: false,
      nativePause: true,
    });
  });
});
