/**
 * `/__dev/ui/recording-measure` 측정 코어 — **AC-4-108 재현 경로** (Stage 4 `S4-E`, **dev 전용**).
 *
 * spike(`S4-A`)는 합성 사인파 + spike 전용 저장소로 쟀다. 이 측정판은 **제품 파이프라인**으로 다시 잰다
 * (spike §7.4 끝 권고 — "`RecorderAdapter` 가 완성된 뒤 실제 마이크로 다시"):
 *
 * ```
 * WebRecorderAdapter(실제 마이크, timeslice 1000ms — D4-28)
 *   → CaptureTimeline.wrapSink → LocalRecordingStore(OPFS + IndexedDB)
 * WebAppStatePort(visibilitychange · online/offline · devicechange) → CaptureTimeline
 * ```
 *
 * 사람이 실기기에서 ① 녹음 시작 → 탭 전환 / 창 최소화 / 화면 잠금 → ② 종료 → ③ 요약을 읽는다.
 * `hiddenIntervals[].chunksDuring` 이 0 이고 `maxChunkGapMs` 가 숨긴 시간만큼 벌어지면 **그 구간 녹음이 끊긴 것**이다.
 * ⚠️ e2e 로 재지 않는다 (`M-11`). Playwright 는 `selfTest()` 로 **저장소 구현만** 확인한다.
 *
 * 🔒 `console` 을 쓰지 않는다. 화면에 내는 값은 시각·개수·크기·MIME·저장소 상태뿐이다. 세션 id 는 이 측정판이
 * 만든 임의 uuid 이며 서버 세션이 아니다. 측정이 끝나면 ⑤ 로 지운다.
 */
import { recordingContainerForMimeType } from '@haru/contracts';

import {
  createCaptureTimeline,
  createLocalRecordingStore,
  type CaptureTimeline,
  type LocalRecordingStore,
} from '../../features/recording';
import { createSystemClock } from '../../shared/lib/clock';
import { createRandomIdFactory } from '../../shared/lib/idFactory';
import { createSystemScheduler } from '../../shared/lib/scheduler';
import { createWebAppStatePort, type AppStatePort } from '../../shared/platform/app-state';
import {
  RECORDER_TIMESLICE_MS,
  createWebRecorderAdapter,
  type RecorderAdapter,
  type RecorderInterruption,
} from '../../shared/platform/recorder';
import {
  createWebRecordingStorage,
  type WebRecordingStorage,
} from '../../shared/platform/recording-storage';

const clock = createSystemClock();
const scheduler = createSystemScheduler();
const ids = createRandomIdFactory();

interface Environment {
  readonly storage: WebRecordingStorage;
  readonly store: LocalRecordingStore;
  readonly appState: AppStatePort;
}

let environment: Environment | null = null;

function env(): Environment {
  if (environment === null) {
    const storage = createWebRecordingStorage();
    environment = {
      storage,
      store: createLocalRecordingStore({
        bytes: storage.bytes,
        kv: storage.kv,
        persistence: storage.persistence,
        clock,
      }),
      appState: createWebAppStatePort(),
    };
  }
  return environment;
}

interface Run {
  readonly sessionId: string;
  readonly startedAtMs: number;
  readonly adapter: RecorderAdapter;
  readonly timeline: CaptureTimeline;
  readonly interruptions: { atMs: number; cause: string; captureStopped: boolean }[];
  readonly release: () => void;
  partNo: number;
}

let current: Run | null = null;
let lastSessionId: string | null = null;

export async function startMeasure(): Promise<Record<string, unknown>> {
  if (current !== null) throw new Error('already recording');
  const { store, appState, storage } = env();
  const persistence = await store.ensurePersistence();
  const sessionId = ids.next();
  const timeline = createCaptureTimeline({ clock, appState });
  const sink = timeline.wrapSink(store);
  const adapter = createWebRecorderAdapter({ clock, scheduler });
  const interruptions: Run['interruptions'] = [];
  let container: ReturnType<typeof recordingContainerForMimeType> = null;

  const offChunk = adapter.onChunk((chunk) => {
    if (current === null) return;
    if (container === null && chunk.mimeType !== '') {
      container = recordingContainerForMimeType(chunk.mimeType);
    }
    void sink.appendChunk({
      sessionId,
      partNo: current.partNo,
      seq: chunk.seq,
      bytes: chunk.bytes,
      mimeType: chunk.mimeType,
      container,
      final: chunk.final,
    });
  });
  const offInterruption = adapter.onInterruption((event: RecorderInterruption) => {
    interruptions.push({ atMs: clock.now(), ...event });
  });

  await sink.beginPart({ sessionId, partNo: 1, startedAtMs: clock.now() });
  await adapter.start({ timesliceMs: RECORDER_TIMESLICE_MS });
  current = {
    sessionId,
    startedAtMs: clock.now(),
    adapter,
    timeline,
    interruptions,
    partNo: 1,
    release: () => {
      offChunk();
      offInterruption();
      adapter.dispose();
      timeline.dispose();
    },
  };
  lastSessionId = sessionId;
  return {
    sessionId,
    persistence,
    bytesIn: storage.bytes.kind,
    timesliceMs: RECORDER_TIMESLICE_MS,
  };
}

export function liveMeasure(): Record<string, unknown> {
  if (current === null) return { recording: false };
  return {
    recording: true,
    elapsedMs: clock.now() - current.startedAtMs,
    summary: current.timeline.summary(),
    interruptions: current.interruptions,
    lastEntries: current.timeline.entries().slice(-8),
  };
}

export async function stopMeasure(): Promise<Record<string, unknown>> {
  const run = current;
  if (run === null) return { recording: false };
  const stopped = await run.adapter.stop();
  await env().store.endPart({
    sessionId: run.sessionId,
    partNo: run.partNo,
    endedAtMs: clock.now(),
    chunkCount: stopped.chunkCount,
    byteLength: stopped.byteLength,
    mimeType: stopped.mimeType,
    container: recordingContainerForMimeType(stopped.mimeType),
  });
  const result = {
    elapsedMs: clock.now() - run.startedAtMs,
    stopped,
    summary: run.timeline.summary(),
    interruptions: run.interruptions,
    timeline: run.timeline.entries(),
    filesOnDisk: await env().store.countChunkFiles(run.sessionId),
  };
  run.release();
  current = null;
  return result;
}

/** 저장소에서 되읽어 디코드한다 (`M-6` — 복구 성공 판정 = decodeAudioData). */
export async function recoverMeasure(): Promise<Record<string, unknown>> {
  if (lastSessionId === null) return { session: null };
  const { store, storage } = env();
  const record = await store.get(lastSessionId);
  const bytes = await store.readPart(lastSessionId, 1);
  const mimeType = record?.parts[0]?.mimeType ?? '';
  return {
    parts: record?.parts ?? [],
    bytes: bytes.byteLength,
    decode: await storage.decoder.decode(bytes, mimeType),
  };
}

/** 재생 준비 결과 — part 하나 = 연속 녹음 구간 하나 (이어 붙이지 않는다). */
export interface PlaybackPart {
  readonly partNo: number;
  /** 색인에 남은 청크 수 (실제 파일 수가 아니라 색인 기준). */
  readonly chunks: number;
  readonly bytes: number;
  /** 첫 청크에서 확정된 원문 mimeType — Blob type 으로 쓴다. */
  readonly mimeType: string;
  readonly decodedSeconds: number | null;
  readonly blob: Blob;
}

export interface PlaybackPreparation {
  readonly bytesIn: string;
  readonly parts: readonly PlaybackPart[];
}

/**
 * 저장된 녹음을 **들어 보기** 위해 되읽는다 — `recoverMeasure()` 와 같은 경로(`store.readPart`, 색인 순서로
 * 이어 붙임)를 part 마다 돈다. 이 화면에서 만든 세션이 없으면(새로고침 뒤) 저장소의 가장 최근 레코드를 쓴다.
 * 🔒 세션 id 는 결과에 싣지 않는다.
 */
export async function preparePlayback(): Promise<PlaybackPreparation | null> {
  const { store, storage } = env();
  let sessionId = lastSessionId;
  if (sessionId === null) {
    const latest = [...(await store.list())].sort((a, b) => b.createdAtMs - a.createdAtMs)[0];
    sessionId = latest?.sessionId ?? null;
  }
  if (sessionId === null) return null;
  const record = await store.get(sessionId);
  if (record === null) return null;
  const index = await store.listChunks(sessionId);
  const parts: PlaybackPart[] = [];
  for (const part of [...record.parts].sort((a, b) => a.partNo - b.partNo)) {
    const entries = index
      .filter((entry) => entry.partNo === part.partNo)
      .sort((a, b) => a.seq - b.seq);
    const firstMime = entries.find((entry) => entry.mimeType !== '')?.mimeType;
    const mimeType = firstMime ?? part.mimeType;
    const bytes = await store.readPart(sessionId, part.partNo);
    const decoded = await storage.decoder.decode(bytes, mimeType);
    parts.push({
      partNo: part.partNo,
      chunks: entries.length,
      bytes: bytes.byteLength,
      mimeType,
      decodedSeconds: decoded.ok ? decoded.durationSeconds : null,
      blob: new Blob([new Uint8Array(bytes)], mimeType === '' ? {} : { type: mimeType }),
    });
  }
  return { bytesIn: storage.bytes.kind, parts };
}

export async function storageState(): Promise<Record<string, unknown>> {
  const { store, storage } = env();
  // 파일 수를 먼저 센다 — 쓰기 계층(`bytesIn`)은 첫 사용 때 실측으로 정해진다.
  const filesOnDisk = await store.countChunkFiles();
  return {
    bytesIn: storage.bytes.kind,
    persistence: await storage.persistence.check(),
    records: (await store.list()).map((record) => ({
      sessionId: record.sessionId,
      state: record.state,
      parts: record.parts.length,
    })),
    filesOnDisk,
  };
}

export async function clearMeasure(): Promise<Record<string, unknown>> {
  await env().store.clear();
  lastSessionId = null;
  return { filesOnDisk: await env().store.countChunkFiles() };
}

/**
 * 실브라우저 **저장소 구현 self-test** — 마이크 없이 합성 바이트로 OPFS + IndexedDB 경로를 돈다.
 * ① 쓰기 → 파일 수 ② 새 연결(=재시작)로 다시 열어 레코드·바이트가 남았는지 ③ 삭제 → 파일 0.
 */
export async function selfTest(): Promise<Record<string, unknown>> {
  const first = env();
  const sessionId = ids.next();
  const chunks = [
    new Uint8Array(64).fill(1),
    new Uint8Array(64).fill(2),
    new Uint8Array(32).fill(3),
  ];
  await first.store.beginPart({ sessionId, partNo: 1, startedAtMs: clock.now() });
  for (const [index, bytes] of chunks.entries()) {
    await first.store.appendChunk({
      sessionId,
      partNo: 1,
      seq: index + 1,
      bytes,
      mimeType: 'audio/webm;codecs=opus',
      container: 'webm',
      final: index === chunks.length - 1,
    });
  }
  const filesAfterWrite = await first.store.countChunkFiles(sessionId);

  // 재시작 흉내 — 새 저장소 객체(새 IndexedDB 연결 · OPFS 재탐지)
  const reopenedStorage = createWebRecordingStorage();
  const reopened = createLocalRecordingStore({
    bytes: reopenedStorage.bytes,
    kv: reopenedStorage.kv,
    persistence: reopenedStorage.persistence,
    clock,
  });
  const record = await reopened.get(sessionId);
  const bytesAfterReopen = (await reopened.readPart(sessionId, 1)).byteLength;
  const unfinished = (await reopened.listUnfinished()).some((r) => r.sessionId === sessionId);

  await reopened.delete(sessionId);
  const filesAfterDelete = await reopened.countChunkFiles(sessionId);

  return {
    bytesIn: reopenedStorage.bytes.kind,
    persistence: await reopenedStorage.persistence.check(),
    filesAfterWrite,
    recordFoundAfterReopen: record !== null,
    headerVerified: record?.parts[0]?.headerVerified ?? null,
    unfinishedAfterReopen: unfinished,
    bytesAfterReopen,
    filesAfterDelete,
    recordAfterDelete: (await reopened.get(sessionId)) !== null,
  };
}

declare global {
  interface Window {
    __haruRecordingMeasure?: { selfTest: typeof selfTest; storageState: typeof storageState };
  }
}

export function installRecordingMeasure(): void {
  window.__haruRecordingMeasure = { selfTest, storageState };
}
