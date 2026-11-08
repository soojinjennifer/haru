/**
 * `/__dev/ui/recording-measure` 보강 — Stage 4b `S4-H4` (`D4-144`, **dev 전용**).
 *
 * A. **녹음 시작 지연** (AC-4-154 · AC-4-50 · `NV-4B-1`, `D4-145` CP-16 ⓒ — 두 끝점 모두 기록, 판정은 `start` 이벤트)
 *    탭(입력 이벤트 `timeStamp`) → ⓐ `MediaRecorder` `start` 이벤트 · ⓑ 첫 `dataavailable`.
 *    경로는 **제품 `WebRecorderAdapter`** 다 (`start()` → `getUserMedia` → `new MediaRecorder` → `start(1000)`).
 *    두 이벤트는 측정 중에만 `MediaRecorder.prototype.start` 를 감싸 **그 제품 인스턴스에** 리스너를 붙여 잰다 —
 *    별도 `MediaRecorder` 를 만들지 않고, 어댑터·환경 코드도 바꾸지 않는다(관찰 콜백 추가 0). 끝나면 원복한다.
 * B. **판정 스트림 해제** (AC-4-155 · AC-4-146 · `NV-4B-3`)
 *    실제 `resolveSessionMode` 를 부르는 동안에만 `navigator.mediaDevices.getUserMedia` 를 감싸 반환 스트림을 기록하고,
 *    반환 직후 · +1s 의 각 트랙 `readyState` 를 읽는다. 끝나면 원복한다 — 측정판 밖 호출에 영향 0.
 *
 * 🔒 `console` 0 · PII 0 (트랙 `label` 은 장치 이름이라 싣지 않는다 — `kind` · `readyState` 만).
 * 시간은 주입받는다 — 브라우저는 `performance.now()`(입력 이벤트 `timeStamp` 와 같은 시간축).
 */
import type { SessionMode } from '@haru/contracts';

import type { Scheduler } from '../../shared/lib/scheduler';
import type { RecorderAdapter } from '../../shared/platform/recorder';

/* ───────────────────────── A. 시작 지연 ───────────────────────── */

/** `MediaRecorder.prototype` 중 감싸는 부분만. 테스트는 가짜 prototype 을 넘긴다. */
export interface RecorderPrototypeLike {
  start(this: EventTarget, timeslice?: number): void;
}

export interface StartLatencySample {
  /** 탭 → `start` 이벤트 (ms). 이벤트가 오지 않으면 `null`. */
  readonly tapToStartMs: number | null;
  /** 탭 → 첫 `dataavailable` (ms). 제한 시간 안에 오지 않으면 `null`. */
  readonly tapToFirstDataMs: number | null;
  /** 첫 청크의 원문 MIME (`M-3`). */
  readonly mimeType: string;
  /** 실패 시 오류 이름 — 메시지는 싣지 않는다. */
  readonly error: string | null;
}

export interface StartLatencyInput {
  /** 탭 시각 — 입력 이벤트 `timeStamp`. */
  readonly tapAtMs: number;
  /** 이번 회차 전용 제품 어댑터 (회차마다 새로 만든다 — 권한 스트림 재사용 없이 실제 시작 경로). */
  readonly adapter: RecorderAdapter;
  readonly proto: RecorderPrototypeLike;
  readonly timesliceMs: number;
  /** 첫 `dataavailable` 대기 상한. */
  readonly timeoutMs: number;
  readonly now: () => number;
  readonly scheduler: Scheduler;
}

/**
 * 측정 중에만 `prototype.start` 를 감싼다 — 그 호출의 대상(제품 `MediaRecorder` 인스턴스)에 `start` · 첫
 * `dataavailable` 리스너를 붙이고 원래 `start` 를 그대로 부른다. 돌려준 함수로 원복한다.
 */
export function watchRecorderEvents(
  proto: RecorderPrototypeLike,
  now: () => number,
  marks: { startAtMs: number | null; firstDataAtMs: number | null },
  onFirstData: () => void,
): () => void {
  const original = proto.start;
  proto.start = function watchedStart(this: EventTarget, timeslice?: number): void {
    this.addEventListener(
      'start',
      () => {
        marks.startAtMs ??= now();
      },
      { once: true },
    );
    this.addEventListener(
      'dataavailable',
      () => {
        if (marks.firstDataAtMs !== null) return;
        marks.firstDataAtMs = now();
        onFirstData();
      },
      { once: true },
    );
    original.call(this, timeslice);
  };
  return () => {
    proto.start = original;
  };
}

function nameOf(error: unknown): string {
  return error instanceof Error ? error.name : 'unknown';
}

/** 1회 측정 — 첫 청크(또는 상한)까지 녹음한 뒤 멈추고 장치를 놓는다. */
export async function measureStartLatency(input: StartLatencyInput): Promise<StartLatencySample> {
  const { adapter, tapAtMs } = input;
  const marks: { startAtMs: number | null; firstDataAtMs: number | null } = {
    startAtMs: null,
    firstDataAtMs: null,
  };
  let mimeType = '';
  let error: string | null = null;
  let wake: () => void = () => undefined;
  const firstData = new Promise<void>((resolve) => {
    wake = resolve;
  });
  const restore = watchRecorderEvents(input.proto, input.now, marks, () => {
    wake();
  });
  const offChunk = adapter.onChunk((chunk) => {
    if (mimeType === '') mimeType = chunk.mimeType;
  });
  const timeout = input.scheduler.schedule(input.timeoutMs, () => {
    wake();
  });

  try {
    await adapter.start({ timesliceMs: input.timesliceMs });
    await firstData;
    await adapter.stop();
  } catch (caught) {
    error = nameOf(caught);
  } finally {
    timeout.cancel();
    restore();
    offChunk();
    adapter.dispose();
  }

  return {
    tapToStartMs: marks.startAtMs === null ? null : Math.round(marks.startAtMs - tapAtMs),
    tapToFirstDataMs:
      marks.firstDataAtMs === null ? null : Math.round(marks.firstDataAtMs - tapAtMs),
    mimeType,
    error,
  };
}

/** 중위값 — 값이 없으면 `null`. 짝수 개면 가운데 두 값의 평균. */
export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle] ?? 0;
  if (sorted.length % 2 === 1) return upper;
  return ((sorted[middle - 1] ?? upper) + upper) / 2;
}

/** 측정판이 모으는 회차 수 (Plan §13.5-⑤ — 5회 기록). */
export const START_LATENCY_RUNS = 5;

export interface StartLatencySummary {
  readonly runs: number;
  readonly medianStartMs: number | null;
  readonly medianFirstDataMs: number | null;
}

export function summarizeStartLatency(samples: readonly StartLatencySample[]): StartLatencySummary {
  const pick = (key: 'tapToStartMs' | 'tapToFirstDataMs'): number[] =>
    samples.flatMap((sample) => (sample[key] === null ? [] : [sample[key]]));
  return {
    runs: samples.length,
    medianStartMs: median(pick('tapToStartMs')),
    medianFirstDataMs: median(pick('tapToFirstDataMs')),
  };
}

/* ───────────────────────── B. 판정 스트림 해제 ───────────────────────── */

/** `navigator.mediaDevices` 중 감싸는 부분만. */
export interface MediaDevicesLike {
  getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
}

export interface TrackState {
  readonly kind: string;
  readonly readyState: string;
}

export interface StreamReleaseObservation {
  readonly result: SessionMode | null;
  readonly error: string | null;
  /** 판정 동안 `getUserMedia` 가 돌려준 스트림 수 */
  readonly streamsOpened: number;
  /** 열린 트랙 수 (전 스트림 합) */
  readonly tracksOpened: number;
  /** `resolveSessionMode` 반환 직후 각 트랙 상태 */
  readonly afterReturn: readonly TrackState[];
  /** 반환 +1s 각 트랙 상태 */
  readonly afterOneSecond: readonly TrackState[];
  /** 원복 확인 — 측정 후 `getUserMedia` 가 원래 함수인가 */
  readonly restored: boolean;
}

function snapshot(streams: readonly MediaStream[]): TrackState[] {
  return streams.flatMap((stream) =>
    stream.getTracks().map((track) => ({ kind: track.kind, readyState: track.readyState })),
  );
}

/**
 * `resolveSessionMode` 를 부르는 동안에만 `getUserMedia` 를 감싼다. 반환 직후 · `settleMs` 뒤 트랙 상태를 읽는다.
 * 감싸기는 `finally` 에서 원복한다 — 판정이 실패해도 측정판 밖 호출에 남지 않는다.
 */
export async function observeSessionModeStreams(input: {
  readonly devices: MediaDevicesLike;
  readonly resolveSessionMode: () => Promise<SessionMode>;
  readonly settleMs: number;
  readonly scheduler: Scheduler;
}): Promise<StreamReleaseObservation> {
  const { devices } = input;
  const original = devices.getUserMedia;
  const streams: MediaStream[] = [];
  devices.getUserMedia = async function watchedGetUserMedia(
    constraints?: MediaStreamConstraints,
  ): Promise<MediaStream> {
    const stream = await original.call(devices, constraints);
    streams.push(stream);
    return stream;
  };

  let result: SessionMode | null = null;
  let error: string | null = null;
  try {
    result = await input.resolveSessionMode();
  } catch (caught) {
    error = nameOf(caught);
  } finally {
    devices.getUserMedia = original;
  }
  const afterReturn = snapshot(streams);
  await new Promise<void>((resolve) => {
    input.scheduler.schedule(input.settleMs, resolve);
  });

  return {
    result,
    error,
    streamsOpened: streams.length,
    tracksOpened: afterReturn.length,
    afterReturn,
    afterOneSecond: snapshot(streams),
    restored: devices.getUserMedia === original,
  };
}
