/**
 * `S4-A` spike — 측정 엔진 (**dev 전용 · 제품 코드가 아니다**)
 *
 * Stage 4 Plan §16.1 `S4-A` 의 7개 항목을 **브라우저 안에서 실제로 돌려** 재기 위한 계측기다.
 * 제품의 `RecordingController`(`S4-D`) · `LocalRecordingStore`(`S4-E`) 를 여기서 만들지 않는다.
 *
 * 설계 제약 3가지
 *   1. **`console` 을 쓰지 않는다** — 저장소 전역 `no-console`(PII 유출 경로 차단, AC-1-45).
 *      결과는 전부 반환값과 DOM readout 으로 나간다.
 *   2. **실제 음성을 쓰지 않는다** — 소리는 `AudioContext` 가 합성한 사인파다
 *      (`createSyntheticStream`). 마이크 경로(`source: 'mic'`)는 Chromium 의 가짜 장치
 *      (`--use-fake-device-for-media-stream`)로만 쓴다. 사람·아동 음성을 녹음하지 않는다.
 *   3. **전역 1개** — Playwright 드라이버가 `page.evaluate` 로 여러 번 호출하므로 상태는
 *      모듈 싱글턴에 둔다. `window.__haruRecordingSpike` 가 그 입구다.
 */
import {
  SpikeChunkStore,
  type RunRecord,
  type StoreCapability,
  type WriteLatency,
} from './spike-store';

/* ===== 공개 타입 ========================================================== */

export interface ChunkLogEntry {
  readonly seq: number;
  /** `start()` 호출 시점 기준 경과 ms. */
  readonly tOffsetMs: number;
  /** 직전 청크와의 간격 ms (`seq === 1` 이면 `null`). */
  readonly gapMs: number | null;
  readonly size: number;
  /** `BlobEvent.data.type` — 요청한 mimeType 이 아니라 **실제로 나온 값**. */
  readonly blobType: string;
  /** 이 청크가 도착한 순간의 `document.visibilityState`. */
  readonly visibility: string;
  /** 도착 순간의 `AudioContext.currentTime` — 소스 클럭과 청크 수신을 나란히 본다. */
  readonly audioClock: number | null;
  readonly fromStop: boolean;
}

export interface SpikeEvent {
  readonly kind:
    | 'visibilitychange'
    | 'devicechange'
    | 'track-ended'
    | 'track-mute'
    | 'track-unmute'
    | 'recorder-error'
    | 'recorder-stop'
    | 'recorder-pause'
    | 'recorder-resume';
  readonly tOffsetMs: number;
  readonly detail: string;
}

export interface MimeProbe {
  readonly requested: string;
  readonly isTypeSupported: boolean;
}

export interface EnvironmentProbe {
  readonly userAgent: string;
  readonly platform: string;
  readonly hardwareConcurrency: number;
  readonly mediaRecorder: boolean;
  readonly mediaDevices: boolean;
  readonly mimeSupport: readonly MimeProbe[];
  readonly store: StoreCapability;
  readonly quota: { readonly usage: number | null; readonly quota: number | null };
  readonly persisted: boolean | null;
  readonly storagePersistAvailable: boolean;
}

export interface TimerCounters {
  /** `setInterval(250)` 이 실제로 몇 번 울렸는가 — 탭 비활성 throttle 비교용. */
  readonly intervalTicks: number;
  readonly intervalWindowMs: number;
  readonly rafTicks: number;
}

export interface RunSnapshot {
  readonly runId: string;
  readonly requestedMimeType: string | null;
  /** `MediaRecorder.mimeType` — 생성 직후 브라우저가 확정한 값. */
  readonly recorderMimeType: string;
  readonly timesliceMs: number;
  readonly state: string;
  readonly startLatencyMs: number | null;
  readonly audioContextState: string | null;
  /**
   * `AudioContext.currentTime` — **합성 소스가 실제로 돌고 있는지**의 증거다.
   * 이 값이 멈춰 있으면 "청크가 안 왔다" 는 관찰은 `MediaRecorder` 의 거동이 아니라
   * **소리 원천이 멈춘 것**일 수 있다. 두 원인을 섞지 않기 위해 함께 싣는다.
   */
  readonly audioContextCurrentTime: number | null;
  readonly chunks: readonly ChunkLogEntry[];
  readonly writes: readonly WriteLatency[];
  readonly events: readonly SpikeEvent[];
  readonly timers: TimerCounters;
  readonly trackState: { readonly readyState: string; readonly muted: boolean } | null;
  readonly storeCapability: StoreCapability | null;
  readonly error: string | null;
}

export interface PlayabilityProbe {
  readonly parts: number;
  readonly totalBytes: number;
  readonly blobType: string;
  /** `decodeAudioData` 가 돌려준 길이(초). 실패하면 `null` + `decodeError`. */
  readonly decodedDurationSec: number | null;
  readonly decodeError: string | null;
  /** `<audio>` 가 메타데이터에서 읽은 길이(초). `Infinity` 는 비탐색 스트림 신호다. */
  readonly elementDurationSec: number | null;
  readonly elementError: string | null;
}

export interface RecoveryProbe {
  readonly runId: string;
  /** 복원에 쓴 컨테이너 타입 (청크가 적어 둔 값). */
  readonly blobTypeUsed: string;
  readonly indexedChunks: number;
  readonly recoveredChunks: number;
  readonly closed: boolean;
  readonly whole: PlayabilityProbe;
  /** 첫 청크를 뺀 경우 — 컨테이너 헤더 유실의 영향을 본다. */
  readonly withoutFirst: PlayabilityProbe | null;
  /** 마지막 청크만 쓴 경우 — 조각 1개가 단독 재생되는지 본다. */
  readonly lastOnly: PlayabilityProbe | null;
}

export interface StartOptions {
  readonly timesliceMs: number;
  readonly source: 'synthetic' | 'mic';
  readonly mimeType?: string;
  readonly audioBitsPerSecond?: number;
}

/* ===== mimeType 후보 ====================================================== */

/**
 * `isTypeSupported` 를 물어볼 후보. `docs/API_CONTRACTS.md` §(RecordingPart) 의
 * `z.enum(['audio/webm','audio/mp4','audio/aac','audio/m4a'])` 와 **코덱 파라미터가 붙은 형태**를
 * 함께 넣었다 — `C4-OPEN-2` 의 쟁점이 바로 그 파라미터다.
 */
const MIME_CANDIDATES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/webm;codecs=vorbis',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/mp4;codecs=opus',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/aac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mpeg',
  'audio/wav',
] as const;

/* ===== 내부 상태 ========================================================== */

interface ActiveRun {
  runId: string;
  recorder: MediaRecorder;
  stream: MediaStream;
  audioContext: AudioContext | null;
  oscillator: OscillatorNode | null;
  startedAt: number;
  startLatencyMs: number | null;
  requestedMimeType: string | null;
  timesliceMs: number;
  chunks: ChunkLogEntry[];
  writes: WriteLatency[];
  events: SpikeEvent[];
  intervalTicks: number;
  intervalStartedAt: number;
  rafTicks: number;
  intervalId: number | null;
  rafId: number | null;
  storeCapability: StoreCapability | null;
  error: string | null;
  pendingWrites: Promise<void>;
  onVisibility: () => void;
  onDeviceChange: () => void;
}

const store = new SpikeChunkStore();
let active: ActiveRun | null = null;
let lastSnapshot: RunSnapshot | null = null;

/* ===== 환경 조사 ========================================================== */

export async function probeEnvironment(): Promise<EnvironmentProbe> {
  const hasRecorder = typeof MediaRecorder !== 'undefined';
  const mimeSupport = MIME_CANDIDATES.map((requested) => ({
    requested,
    isTypeSupported:
      hasRecorder && typeof MediaRecorder.isTypeSupported === 'function'
        ? MediaRecorder.isTypeSupported(requested)
        : false,
  }));

  let usage: number | null = null;
  let quota: number | null = null;
  const storage: StorageManager | undefined = navigator.storage;
  if (typeof storage?.estimate === 'function') {
    const estimate = await storage.estimate();
    usage = estimate.usage ?? null;
    quota = estimate.quota ?? null;
  }
  let persisted: boolean | null = null;
  if (typeof storage?.persisted === 'function') {
    persisted = await storage.persisted();
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    mediaRecorder: hasRecorder,
    mediaDevices: typeof navigator.mediaDevices?.getUserMedia === 'function',
    mimeSupport,
    store: await store.probe(),
    quota: { usage, quota },
    persisted,
    storagePersistAvailable: typeof storage?.persist === 'function',
  };
}

/* ===== 오디오 소스 ======================================================== */

/**
 * **합성** 오디오 스트림 — 440Hz 사인파. 마이크를 쓰지 않으므로 권한도, 사람 음성도 없다.
 * WebKit 처럼 autoplay 에 user activation 을 요구하는 엔진에서는 `resume()` 이 `suspended`
 * 로 남을 수 있어 그 상태를 `audioContextState` 로 함께 보고한다.
 */
async function createSyntheticStream(): Promise<{
  stream: MediaStream;
  context: AudioContext;
  oscillator: OscillatorNode;
}> {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = 440;
  const gain = context.createGain();
  gain.gain.value = 0.25;
  const destination = context.createMediaStreamDestination();
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start();
  if (context.state !== 'running') {
    await context.resume().catch(() => undefined);
  }
  return { stream: destination.stream, context, oscillator };
}

/* ===== 녹음 ============================================================== */

function pushEvent(run: ActiveRun, kind: SpikeEvent['kind'], detail: string): void {
  run.events.push({ kind, tOffsetMs: performance.now() - run.startedAt, detail });
}

export async function startRun(options: StartOptions): Promise<RunSnapshot> {
  if (active !== null) throw new Error('a run is already active — stopRun() first');

  const runId = `run-${String(Date.now())}`;
  const t0 = performance.now();

  let stream: MediaStream;
  let audioContext: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  if (options.source === 'mic') {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } else {
    const synthetic = await createSyntheticStream();
    stream = synthetic.stream;
    audioContext = synthetic.context;
    oscillator = synthetic.oscillator;
  }

  const recorderOptions: MediaRecorderOptions = {};
  if (options.mimeType !== undefined) recorderOptions.mimeType = options.mimeType;
  if (options.audioBitsPerSecond !== undefined) {
    recorderOptions.audioBitsPerSecond = options.audioBitsPerSecond;
  }
  const recorder = new MediaRecorder(stream, recorderOptions);

  const run: ActiveRun = {
    runId,
    recorder,
    stream,
    audioContext,
    oscillator,
    startedAt: t0,
    startLatencyMs: null,
    requestedMimeType: options.mimeType ?? null,
    timesliceMs: options.timesliceMs,
    chunks: [],
    writes: [],
    events: [],
    intervalTicks: 0,
    intervalStartedAt: t0,
    rafTicks: 0,
    intervalId: null,
    rafId: null,
    storeCapability: null,
    error: null,
    pendingWrites: Promise.resolve(),
    onVisibility: () => undefined,
    onDeviceChange: () => undefined,
  };
  active = run;

  run.storeCapability = await store.beginRun({
    runId,
    createdAt: Date.now(),
    mimeType: recorder.mimeType,
    timesliceMs: options.timesliceMs,
  });

  recorder.addEventListener('dataavailable', (event: BlobEvent) => {
    const tOffsetMs = performance.now() - run.startedAt;
    const previous = run.chunks.at(-1);
    const seq = run.chunks.length + 1;
    run.chunks.push({
      seq,
      tOffsetMs,
      gapMs: previous === undefined ? null : tOffsetMs - previous.tOffsetMs,
      size: event.data.size,
      blobType: event.data.type,
      visibility: document.visibilityState,
      audioClock: run.audioContext?.currentTime ?? null,
      fromStop: recorder.state === 'inactive',
    });
    if (run.startLatencyMs === null) run.startLatencyMs = tOffsetMs;
    // 영속화는 비동기지만 **순서를 지켜** 직렬로 잇는다. 쓰기 지연이 청크 수신을 막는지
    // 보려면 `dataavailable` 핸들러가 await 로 멈추지 않아야 한다.
    run.pendingWrites = run.pendingWrites.then(async () => {
      const buffer = await event.data.arrayBuffer();
      const latency = await store.appendChunk(seq, tOffsetMs, buffer, event.data.type);
      run.writes.push(latency);
    });
  });

  recorder.addEventListener('error', (event: Event) => {
    const named = event as Event & { error?: { name?: string } };
    pushEvent(run, 'recorder-error', named.error?.name ?? event.type);
  });
  recorder.addEventListener('stop', () => {
    pushEvent(run, 'recorder-stop', 'stop');
  });
  recorder.addEventListener('pause', () => {
    pushEvent(run, 'recorder-pause', 'pause');
  });
  recorder.addEventListener('resume', () => {
    pushEvent(run, 'recorder-resume', 'resume');
  });

  for (const track of stream.getAudioTracks()) {
    track.addEventListener('ended', () => {
      pushEvent(run, 'track-ended', `readyState=${track.readyState}`);
    });
    track.addEventListener('mute', () => {
      pushEvent(run, 'track-mute', 'mute');
    });
    track.addEventListener('unmute', () => {
      pushEvent(run, 'track-unmute', 'unmute');
    });
  }

  run.onVisibility = () => {
    pushEvent(run, 'visibilitychange', document.visibilityState);
  };
  document.addEventListener('visibilitychange', run.onVisibility);

  run.onDeviceChange = () => {
    pushEvent(run, 'devicechange', 'devicechange');
  };
  navigator.mediaDevices?.addEventListener('devicechange', run.onDeviceChange);

  // JS 타이머 throttle 비교용. `MediaRecorder` timeslice 와 **같은 조건에서** 센다.
  run.intervalId = window.setInterval(() => {
    run.intervalTicks += 1;
  }, 250);
  const rafLoop = (): void => {
    run.rafTicks += 1;
    run.rafId = window.requestAnimationFrame(rafLoop);
  };
  run.rafId = window.requestAnimationFrame(rafLoop);

  recorder.start(options.timesliceMs);
  return snapshot();
}

export function snapshot(): RunSnapshot {
  const run = active;
  if (run === null) {
    if (lastSnapshot !== null) return lastSnapshot;
    throw new Error('no run');
  }
  const track = run.stream.getAudioTracks()[0];
  return {
    runId: run.runId,
    requestedMimeType: run.requestedMimeType,
    recorderMimeType: run.recorder.mimeType,
    timesliceMs: run.timesliceMs,
    state: run.recorder.state,
    startLatencyMs: run.startLatencyMs,
    audioContextState: run.audioContext?.state ?? null,
    audioContextCurrentTime: run.audioContext?.currentTime ?? null,
    chunks: [...run.chunks],
    writes: [...run.writes],
    events: [...run.events],
    timers: {
      intervalTicks: run.intervalTicks,
      intervalWindowMs: performance.now() - run.intervalStartedAt,
      rafTicks: run.rafTicks,
    },
    trackState: track === undefined ? null : { readyState: track.readyState, muted: track.muted },
    storeCapability: run.storeCapability,
    error: run.error,
  };
}

/** 타이머 카운터만 0 으로 되돌린다 — 구간별(전경/배경) 비교에 쓴다. */
export function resetTimers(): void {
  if (active === null) return;
  active.intervalTicks = 0;
  active.rafTicks = 0;
  active.intervalStartedAt = performance.now();
}

export function pauseRun(): string {
  if (active === null) throw new Error('no run');
  active.recorder.pause();
  return active.recorder.state;
}

export function resumeRun(): string {
  if (active === null) throw new Error('no run');
  active.recorder.resume();
  return active.recorder.state;
}

/**
 * 트랙을 끊어 **장치 소실**(`MediaStreamTrack` 종료)을 재현한다.
 * ⚠️ 명세상 `stop()` 은 `ended` 를 발생시키지 않는다 — 그 차이가 측정 대상이다.
 */
export function stopTrack(): { readyState: string; recorderState: string } {
  if (active === null) throw new Error('no run');
  const track = active.stream.getAudioTracks()[0];
  track?.stop();
  return {
    readyState: track?.readyState ?? 'none',
    recorderState: active.recorder.state,
  };
}

export async function stopRun(): Promise<RunSnapshot> {
  const run = active;
  if (run === null) throw new Error('no run');
  // `stop` 이 오지 않는 경우가 있다 — 트랙이 이미 끝난 뒤(`stopTrack()`) `stop()` 을 부르면
  // 엔진에 따라 이벤트가 생략되거나 `InvalidStateError` 가 난다. 측정이 거기서 멈추면
  // 그 사실 자체를 잃으므로 **상한을 두고 그대로 기록**한다.
  const stopEventSeen = await new Promise<boolean>((resolve) => {
    const timer = window.setTimeout(() => {
      resolve(false);
    }, 4000);
    run.recorder.addEventListener('stop', () => {
      window.clearTimeout(timer);
      resolve(true);
    });
    try {
      run.recorder.stop();
    } catch (error) {
      run.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      window.clearTimeout(timer);
      resolve(false);
    }
  });
  if (!stopEventSeen) {
    pushEvent(run, 'recorder-stop', 'stop 이벤트 4000ms 내 미도착');
  }
  await Promise.race([
    run.pendingWrites,
    new Promise((resolve) => window.setTimeout(resolve, 4000)),
  ]);
  await store.closeRun(run.chunks.length);

  if (run.intervalId !== null) window.clearInterval(run.intervalId);
  if (run.rafId !== null) window.cancelAnimationFrame(run.rafId);
  document.removeEventListener('visibilitychange', run.onVisibility);
  navigator.mediaDevices?.removeEventListener('devicechange', run.onDeviceChange);
  run.oscillator?.stop();
  await run.audioContext?.close().catch(() => undefined);
  for (const track of run.stream.getAudioTracks()) track.stop();

  const final = snapshot();
  lastSnapshot = final;
  active = null;
  return final;
}

/**
 * **정리 없이** 버린다 — 탭 강제 종료에 준하는 상태를 같은 페이지 안에서 만든다.
 * `stop()` 을 부르지 않으므로 마지막 timeslice 이후의 버퍼는 영속되지 않는다.
 */
export function abandonRun(): RunSnapshot {
  const run = active;
  if (run === null) throw new Error('no run');
  const final = snapshot();
  lastSnapshot = final;
  active = null;
  return final;
}

/* ===== 재생 가능성 ======================================================== */

function concat(parts: readonly ArrayBuffer[]): ArrayBuffer {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(new Uint8Array(part), offset);
    offset += part.byteLength;
  }
  return out.buffer;
}

async function probePlayability(
  parts: readonly ArrayBuffer[],
  mimeType: string,
): Promise<PlayabilityProbe> {
  const joined = concat(parts);
  const blob = new Blob([joined], { type: mimeType });

  let decodedDurationSec: number | null = null;
  let decodeError: string | null = null;
  try {
    const context = new AudioContext();
    const decoded = await context.decodeAudioData(joined.slice(0));
    decodedDurationSec = decoded.duration;
    await context.close();
  } catch (error) {
    decodeError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  }

  let elementDurationSec: number | null = null;
  let elementError: string | null = null;
  const url = URL.createObjectURL(blob);
  try {
    elementDurationSec = await new Promise<number>((resolve, reject) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      const timer = window.setTimeout(() => {
        reject(new Error('loadedmetadata timeout (3000ms)'));
      }, 3000);
      audio.addEventListener('loadedmetadata', () => {
        window.clearTimeout(timer);
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        window.clearTimeout(timer);
        reject(new Error(`media error code=${String(audio.error?.code ?? 'unknown')}`));
      });
      audio.src = url;
    });
  } catch (error) {
    elementError = error instanceof Error ? error.message : String(error);
  } finally {
    URL.revokeObjectURL(url);
  }

  return {
    parts: parts.length,
    totalBytes: joined.byteLength,
    blobType: blob.type,
    decodedDurationSec,
    decodeError,
    elementDurationSec,
    elementError,
  };
}

/** 크래시 복구 — 저장된 청크만으로 재생 가능한 파일을 되만든다. */
export async function recover(runId?: string): Promise<RecoveryProbe> {
  const runs = await store.listRuns();
  const target = runId === undefined ? runs.at(-1) : runs.find((run) => run.runId === runId);
  if (target === undefined) throw new Error('no stored run');
  const indexed = await store.listChunks(target.runId);
  const bytes = await store.readChunkBytes(target.runId);
  // run 레코드의 `mimeType` 은 Chromium 에서 빈 문자열이다 — 청크가 적어 둔 타입을 쓴다.
  const blobType = (await store.storedBlobType(target.runId)) || target.mimeType;

  const whole = await probePlayability(bytes, blobType);
  const withoutFirst = bytes.length > 1 ? await probePlayability(bytes.slice(1), blobType) : null;
  const lastOnly = bytes.length > 1 ? await probePlayability(bytes.slice(-1), blobType) : null;

  return {
    runId: target.runId,
    blobTypeUsed: blobType,
    indexedChunks: indexed.length,
    recoveredChunks: bytes.length,
    closed: target.closed,
    whole,
    withoutFirst,
    lastOnly,
  };
}

/** 마지막 청크를 잘라 "쓰기 도중 중단" 을 만들고 다시 재생 가능성을 본다. */
export async function recoverWithTornTail(
  keepRatio: number,
  runId?: string,
): Promise<{ keptBytes: number; probe: RecoveryProbe }> {
  const runs = await store.listRuns();
  const target = runId === undefined ? runs.at(-1) : runs.find((run) => run.runId === runId);
  if (target === undefined) throw new Error('no stored run');
  const keptBytes = await store.truncateLastChunk(target.runId, keepRatio);
  const probe = await recover(target.runId);
  return { keptBytes, probe };
}

export async function listRuns(): Promise<readonly RunRecord[]> {
  return store.listRuns();
}

export async function clearStore(): Promise<void> {
  await store.clear();
}

export async function storageEstimate(): Promise<{
  usage: number | null;
  quota: number | null;
}> {
  const storage: StorageManager | undefined = navigator.storage;
  if (typeof storage?.estimate !== 'function') return { usage: null, quota: null };
  const estimate = await storage.estimate();
  return { usage: estimate.usage ?? null, quota: estimate.quota ?? null };
}

/* ===== 전역 입구 ========================================================== */

export interface RecordingSpikeApi {
  readonly probeEnvironment: typeof probeEnvironment;
  readonly startRun: typeof startRun;
  readonly snapshot: typeof snapshot;
  readonly resetTimers: typeof resetTimers;
  readonly pauseRun: typeof pauseRun;
  readonly resumeRun: typeof resumeRun;
  readonly stopTrack: typeof stopTrack;
  readonly stopRun: typeof stopRun;
  readonly abandonRun: typeof abandonRun;
  readonly recover: typeof recover;
  readonly recoverWithTornTail: typeof recoverWithTornTail;
  readonly listRuns: typeof listRuns;
  readonly clearStore: typeof clearStore;
  readonly storageEstimate: typeof storageEstimate;
}

declare global {
  interface Window {
    __haruRecordingSpike?: RecordingSpikeApi;
  }
}

export function installRecordingSpike(): void {
  window.__haruRecordingSpike = {
    probeEnvironment,
    startRun,
    snapshot,
    resetTimers,
    pauseRun,
    resumeRun,
    stopTrack,
    stopRun,
    abandonRun,
    recover,
    recoverWithTornTail,
    listRuns,
    clearStore,
    storageEstimate,
  };
}
