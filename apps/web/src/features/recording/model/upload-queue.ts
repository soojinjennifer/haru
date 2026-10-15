/**
 * `UploadQueue` — 완료된 로컬 녹음의 업로드 (Stage 4 `S4-E`, `ARCHITECTURE` §10.5-3~7, `API_CONTRACTS` §5.1.1).
 *
 * `recordingApi`(init · refreshTokens · complete) 와 `UploadTransport`(uploadPart · resume · abort) 를 조합한다.
 *
 * ```
 * enqueue(sessionId)                         ← 세션이 로컬에서 completed 가 된 순간 (오프라인이어도)
 *  └ attempt
 *     ① init (IK 고정)                       → recordingId 기록 (토큰은 기기에 저장하지 않는다 — 메모리만)
 *     ② part 마다 uploadPart                 → 서버가 이미 바이트를 가졌으면(409) resume — 중복 업로드 없음 (AC-4-28)
 *        └ UPLOAD_TOKEN_EXPIRED → refreshTokens → 다시 (AC-4-29)
 *     ③ complete (part 크기 · sha256 · 길이, IK 고정)
 *     ④ ⭐ 확정 응답을 받은 **뒤에만** 로컬 녹음을 지운다 (AC-4-71 · `rules/architecture.md` §7)
 *  실패
 *     · RECORDING_DELETED → 포기 + 로컬 정리 (서버가 이 녹음을 지웠다 — AC-4-33)
 *     · RECORDING_INCOMPLETE → 서버가 말한 part 를 다시 보낸다
 *     · 그 밖 전부 → **로컬 보존** + 백오프 재시도 (AC-4-27). 연결 복구·화면 복귀 시 즉시 재개 (AC-4-31)
 *  48h — 적재 후 48시간 안에 확정되지 않으면 `stalled_48h` + 안내 이벤트 **1회** (AC-4-32 · AC-4-67). 재시도는 계속한다
 * ```
 *
 * ⭐ `D4-30` — 녹음 시점 저장소가 **영속이 아니면**(`best_effort` — 브라우저가 비울 수 있다) 그 항목을
 * **먼저** 처리하고 재시도 간격을 짧게 둔다 (`priority: 'high'`).
 *
 * 클라이언트 전용 상태 `queued | uploading | failed_retrying | stalled_48h` (+ 항목이 없을 때 `local_only` ·
 * 이벤트 `uploaded`) 는 contracts 에 없다 (AC-4-20, `ARCHITECTURE` §10.5 끝).
 *
 * 🔒 업로드 토큰은 기기에 저장하지 않고 로그에도 남기지 않는다 (`RecordingUploadTargetSchema` 주석).
 */
import {
  MAX_RECORDED_SECONDS,
  RECORDING_TOTAL_DURATION_GRACE_SECONDS,
  recordingContainerForMimeType,
  type ErrorCode,
  type RecordingUploadCompleteRequest,
  type RecordingUploadCompleteResponse,
  type RecordingUploadInitRequest,
  type RecordingUploadTarget,
} from '@haru/contracts';

import {
  isHaruApiError,
  isNetworkError,
  isUploadOffsetConflictError,
  type RecordingApi,
  type UploadTransport,
} from '../../../shared/api';
import type { Clock } from '../../../shared/lib/clock';
import type { ScheduledTask, Scheduler } from '../../../shared/lib/scheduler';
import type { Sha256Hasher } from '../../../shared/lib/sha256';
import type { AppStatePort } from '../../../shared/platform/app-state';
import { isEvictable, type LocalKeyValueStore } from '../../../shared/platform/recording-storage';

import type { LocalRecordingStore } from './local-recording-store';
import type { LocalRecordingRecord } from './local-records';

export const UPLOAD_QUEUE_RECORD_VERSION = 1;

/** 48h — PRD §13 "업로드 실패 48시간 경과 → 안내" (Frontend 로컬 판정, push 는 Handoff `P4-BIP-09`). */
export const UPLOAD_STALLED_AFTER_MS = 48 * 60 * 60 * 1000;

/** 재시도 간격 (ms) — 마지막 값에서 멈춘다. */
export const UPLOAD_BACKOFF_MS: Readonly<Record<UploadPriority, readonly number[]>> = {
  normal: [5_000, 30_000, 120_000, 600_000, 1_800_000],
  /** `D4-30` — 저장소가 비워질 수 있는 기기는 더 촘촘히 시도한다. */
  high: [2_000, 10_000, 30_000, 120_000, 300_000],
};

/** 클라이언트 전용 업로드 상태 (`ARCHITECTURE` §10.5) — contracts 아님. */
export type UploadQueueState = 'queued' | 'uploading' | 'failed_retrying' | 'stalled_48h';

/** 화면 표시용 — 항목이 없으면 `local_only`(로컬에만 있음) 또는 `null`(로컬 녹음 없음). */
export type UploadClientStatus = UploadQueueState | 'local_only';

export type UploadPriority = 'normal' | 'high';

export type UploadFailureKind = 'network' | 'local_unavailable' | 'unknown' | ErrorCode;

export interface UploadQueueEntry {
  readonly version: typeof UPLOAD_QUEUE_RECORD_VERSION;
  readonly sessionId: string;
  readonly enqueuedAtMs: number;
  readonly state: UploadQueueState;
  readonly priority: UploadPriority;
  readonly attempts: number;
  readonly recordingId: string | null;
  readonly initKey: string;
  readonly completeKey: string;
  readonly uploadedPartNos: readonly number[];
  readonly nextAttemptAtMs: number;
  readonly lastFailure: UploadFailureKind | null;
  readonly stalledNoticeAtMs: number | null;
}

export type UploadQueueEvent =
  | { readonly type: 'state'; readonly sessionId: string; readonly state: UploadQueueState }
  | {
      readonly type: 'uploaded';
      readonly sessionId: string;
      readonly response: RecordingUploadCompleteResponse;
    }
  /** 48h 안내 — 항목당 **1회** (AC-4-32). */
  | { readonly type: 'stalled_48h'; readonly sessionId: string }
  /** 서버가 이 녹음을 지웠다 — 큐가 포기하고 로컬을 정리했다 (AC-4-33). */
  | { readonly type: 'recording_deleted'; readonly sessionId: string }
  /** 올릴 수 있는 part 가 없다 (바이트 0 또는 contract 밖 컨테이너). 로컬은 그대로 둔다. */
  | { readonly type: 'nothing_to_upload'; readonly sessionId: string };

export interface UploadQueueOptions {
  readonly kv: LocalKeyValueStore;
  readonly store: LocalRecordingStore;
  readonly recordingApi: RecordingApi;
  readonly uploadTransport: UploadTransport;
  readonly appState: AppStatePort;
  readonly clock: Clock;
  readonly scheduler: Scheduler;
  readonly createKey: () => string;
  readonly hasher: Sha256Hasher;
  readonly stalledAfterMs?: number;
}

export interface UploadQueue {
  /**
   * 완료된 로컬 녹음을 큐에 넣고 처리를 **시작만** 한다 (적재가 끝나면 resolve — 업로드 완료를 기다리지 않는다).
   * 이미 있으면 그대로. 로컬 녹음이 없으면 아무것도 하지 않는다.
   */
  enqueue(sessionId: string): Promise<void>;
  /** 항목을 버리고 진행 중 전송을 끊는다. **로컬 녹음은 지우지 않는다** (지우는 쪽이 따로 부른다). */
  cancel(sessionId: string): Promise<void>;
  get(sessionId: string): Promise<UploadQueueEntry | null>;
  list(): Promise<readonly UploadQueueEntry[]>;
  statusOf(sessionId: string): Promise<UploadClientStatus | null>;
  /** 시도 시각이 된 항목을 처리한다. `force` 면 대기 중인 항목도 지금 시도한다. */
  drain(options?: { force?: boolean }): Promise<void>;
  onEvent(listener: (event: UploadQueueEvent) => void): () => void;
  /** 연결·화면 신호 구독 + 남은 항목 처리 예약. */
  start(): void;
  clear(): Promise<void>;
  dispose(): void;
}

function isEntry(value: unknown): value is UploadQueueEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v['version'] === UPLOAD_QUEUE_RECORD_VERSION &&
    typeof v['sessionId'] === 'string' &&
    typeof v['enqueuedAtMs'] === 'number' &&
    typeof v['state'] === 'string' &&
    typeof v['priority'] === 'string' &&
    typeof v['attempts'] === 'number' &&
    (v['recordingId'] === null || typeof v['recordingId'] === 'string') &&
    typeof v['initKey'] === 'string' &&
    typeof v['completeKey'] === 'string' &&
    Array.isArray(v['uploadedPartNos']) &&
    typeof v['nextAttemptAtMs'] === 'number'
  );
}

/** 업로드할 part 1개 (로컬에서 읽은 바이트). */
interface PreparedPart {
  readonly partNo: number;
  readonly mimeType: string;
  readonly container: 'webm' | 'mp4';
  readonly bytes: Uint8Array<ArrayBuffer>;
  readonly chunkCount: number;
  readonly decodedSeconds: number | null;
}

class AttemptCancelled extends Error {
  override readonly name = 'AttemptCancelled';
}

/**
 * part 별 길이 (초). 컨트롤러가 보고한 실제 녹음 시간을 **바이트 비율**로 나눈다 (같은 비트레이트).
 * 보고값이 없으면(크래시 복구) 디코드 길이 → 청크 수 × 1초(`D4-28` timeslice) 순으로 쓴다.
 */
export function partDurations(
  record: LocalRecordingRecord,
  parts: readonly Pick<PreparedPart, 'partNo' | 'bytes' | 'chunkCount' | 'decodedSeconds'>[],
): Map<number, number> {
  const out = new Map<number, number>();
  const totalBytes = parts.reduce((sum, part) => sum + part.bytes.byteLength, 0);
  const reported = record.recordedSeconds;
  for (const part of parts) {
    const seconds =
      reported !== null && reported > 0 && totalBytes > 0
        ? (reported * part.bytes.byteLength) / totalBytes
        : (part.decodedSeconds ?? part.chunkCount);
    out.set(part.partNo, Math.max(0.001, Math.round(seconds * 1000) / 1000));
  }
  return out;
}

function totalDuration(durations: Map<number, number>): number {
  const sum = [...durations.values()].reduce((total, value) => total + value, 0);
  return Math.min(
    MAX_RECORDED_SECONDS + RECORDING_TOTAL_DURATION_GRACE_SECONDS,
    Math.max(1, Math.round(sum)),
  );
}

function failureKind(error: unknown): UploadFailureKind {
  if (isHaruApiError(error)) return error.code;
  if (isNetworkError(error)) return 'network';
  return 'unknown';
}

export function createUploadQueue(options: UploadQueueOptions): UploadQueue {
  const { kv, store, recordingApi, uploadTransport, appState, clock, scheduler } = options;
  const { createKey, hasher } = options;
  const stalledAfterMs = options.stalledAfterMs ?? UPLOAD_STALLED_AFTER_MS;

  const listeners = new Set<(event: UploadQueueEvent) => void>();
  /** 업로드 대상(토큰 포함) — 메모리에만 둔다. */
  const targets = new Map<string, Map<number, RecordingUploadTarget>>();
  const active = new Map<string, AbortController>();
  const cancelled = new Set<string>();
  let draining: Promise<void> | null = null;
  let wakeTask: ScheduledTask | null = null;
  let unsubscribe: (() => void) | null = null;
  let disposed = false;

  const emit = (event: UploadQueueEvent): void => {
    for (const listener of [...listeners]) listener(event);
  };

  const readEntry = async (sessionId: string): Promise<UploadQueueEntry | null> => {
    const value = await kv.get('uploads', sessionId);
    return isEntry(value) ? value : null;
  };

  const listEntries = async (): Promise<UploadQueueEntry[]> =>
    (await kv.list('uploads')).filter(isEntry);

  const writeEntry = async (entry: UploadQueueEntry): Promise<void> => {
    if (cancelled.has(entry.sessionId)) throw new AttemptCancelled();
    await kv.put('uploads', entry.sessionId, entry);
  };

  const setState = async (
    entry: UploadQueueEntry,
    change: Partial<UploadQueueEntry>,
  ): Promise<UploadQueueEntry> => {
    const next: UploadQueueEntry = { ...entry, ...change };
    await writeEntry(next);
    if (next.state !== entry.state) {
      emit({ type: 'state', sessionId: entry.sessionId, state: next.state });
    }
    return next;
  };

  const backoff = (entry: UploadQueueEntry): number => {
    const steps = UPLOAD_BACKOFF_MS[entry.priority];
    return steps[Math.min(entry.attempts - 1, steps.length - 1)] ?? 0;
  };

  /** 48h 경계 — 넘었으면 `stalled_48h` + 안내 1회. */
  const checkStalled = async (entry: UploadQueueEntry): Promise<UploadQueueEntry> => {
    if (entry.stalledNoticeAtMs !== null) return entry;
    if (clock.now() - entry.enqueuedAtMs < stalledAfterMs) return entry;
    const next = await setState(entry, { state: 'stalled_48h', stalledNoticeAtMs: clock.now() });
    emit({ type: 'stalled_48h', sessionId: entry.sessionId });
    return next;
  };

  /** 다음에 깨어날 시각 = 재시도 시각 · 48h 경계 중 가장 이른 것. */
  const scheduleWake = async (): Promise<void> => {
    wakeTask?.cancel();
    wakeTask = null;
    if (disposed) return;
    const entries = await listEntries();
    const times = entries.flatMap((entry) => [
      active.has(entry.sessionId) ? Number.POSITIVE_INFINITY : entry.nextAttemptAtMs,
      entry.stalledNoticeAtMs === null
        ? entry.enqueuedAtMs + stalledAfterMs
        : Number.POSITIVE_INFINITY,
    ]);
    const earliest = Math.min(...times);
    if (!Number.isFinite(earliest)) return;
    wakeTask = scheduler.schedule(earliest - clock.now(), () => {
      wakeTask = null;
      void queue.drain();
    });
  };

  const prepareParts = async (record: LocalRecordingRecord): Promise<PreparedPart[]> => {
    const chunks = await store.listChunks(record.sessionId);
    const prepared: PreparedPart[] = [];
    for (const part of record.parts) {
      const raw = await store.readPart(record.sessionId, part.partNo);
      if (raw.byteLength === 0) continue;
      const firstChunk = chunks.find((chunk) => chunk.partNo === part.partNo);
      const mimeType = part.mimeType !== '' ? part.mimeType : (firstChunk?.mimeType ?? '');
      const container = recordingContainerForMimeType(mimeType);
      // contract 밖 컨테이너(또는 MIME 미상)는 올릴 수 없다 — 로컬에 남긴다.
      if (container === null || (part.container !== null && part.container !== container)) {
        continue;
      }
      prepared.push({
        partNo: part.partNo,
        mimeType,
        container,
        bytes: raw.slice(),
        chunkCount: Math.max(
          part.chunkCount,
          chunks.filter((chunk) => chunk.partNo === part.partNo).length,
        ),
        decodedSeconds: part.decodedSeconds,
      });
    }
    return prepared;
  };

  const refresh = async (
    sessionId: string,
    recordingId: string,
    partNos: readonly number[],
  ): Promise<Map<number, RecordingUploadTarget>> => {
    const response = await recordingApi.refreshTokens(
      { recordingId, body: { partNos: [...partNos] } },
      { idempotencyKey: createKey() },
    );
    const map = targets.get(sessionId) ?? new Map<number, RecordingUploadTarget>();
    for (const target of response.parts) map.set(target.partNo, target);
    targets.set(sessionId, map);
    return map;
  };

  const sendPart = async (
    sessionId: string,
    recordingId: string,
    part: PreparedPart,
    signal: AbortSignal,
  ): Promise<void> => {
    let target =
      targets.get(sessionId)?.get(part.partNo) ??
      (await refresh(sessionId, recordingId, [part.partNo])).get(part.partNo);
    if (target === undefined) throw new Error('Missing upload target.');
    const data = new Blob([part.bytes]);
    for (let tokenAttempt = 0; ; tokenAttempt += 1) {
      try {
        try {
          await uploadTransport.uploadPart({ target, data }, { signal });
        } catch (error) {
          // 서버가 이미 바이트를 갖고 있다 → 그 뒤만 보낸다 (중복 업로드 없음).
          if (!isUploadOffsetConflictError(error)) throw error;
          await uploadTransport.resume({ target, data }, { signal });
        }
        return;
      } catch (error) {
        if (tokenAttempt === 0 && isHaruApiError(error) && error.code === 'UPLOAD_TOKEN_EXPIRED') {
          target = (await refresh(sessionId, recordingId, [part.partNo])).get(part.partNo);
          if (target === undefined) throw error;
          continue;
        }
        throw error;
      }
    }
  };

  /** 서버가 이 녹음을 지웠다 — 포기하고 로컬을 정리한다. */
  const giveUpDeleted = async (sessionId: string): Promise<void> => {
    targets.delete(sessionId);
    await kv.delete('uploads', sessionId);
    await store.delete(sessionId);
    emit({ type: 'recording_deleted', sessionId });
  };

  const attempt = async (initial: UploadQueueEntry): Promise<void> => {
    const { sessionId } = initial;
    const controller = new AbortController();
    active.set(sessionId, controller);
    let entry = await setState(initial, { state: 'uploading' });
    try {
      const record = await store.get(sessionId);
      if (record === null) {
        // 로컬 녹음이 이미 없다 (다른 경로로 지워졌다) — 올릴 것이 없다.
        targets.delete(sessionId);
        await kv.delete('uploads', sessionId);
        emit({ type: 'nothing_to_upload', sessionId });
        return;
      }
      const parts = await prepareParts(record);
      if (parts.length === 0) {
        await kv.delete('uploads', sessionId);
        emit({ type: 'nothing_to_upload', sessionId });
        return;
      }
      const durations = partDurations(record, parts);

      // ① init — recordingId 가 있으면 토큰만 다시 받는다 (토큰은 기기에 저장하지 않았다).
      let recordingId = entry.recordingId;
      if (recordingId === null) {
        const body: RecordingUploadInitRequest = {
          parts: parts.map((part) => ({
            partNo: part.partNo,
            mimeType: part.mimeType,
            container: part.container,
            bytes: part.bytes.byteLength,
          })),
          totalDurationSeconds: totalDuration(durations),
        };
        const response = await recordingApi.init(
          { sessionId, body },
          { idempotencyKey: entry.initKey, signal: controller.signal },
        );
        recordingId = response.recordingId;
        targets.set(sessionId, new Map(response.parts.map((target) => [target.partNo, target])));
        entry = await setState(entry, { recordingId });
      } else if (!targets.has(sessionId)) {
        await refresh(
          sessionId,
          recordingId,
          parts.map((part) => part.partNo),
        );
      }

      // ② part 전송
      for (const part of parts) {
        if (entry.uploadedPartNos.includes(part.partNo)) continue;
        await sendPart(sessionId, recordingId, part, controller.signal);
        entry = await setState(entry, {
          uploadedPartNos: [...entry.uploadedPartNos, part.partNo],
        });
      }

      // ③ complete
      const completeBody: RecordingUploadCompleteRequest = {
        parts: await Promise.all(
          parts.map(async (part) => ({
            partNo: part.partNo,
            bytes: part.bytes.byteLength,
            sha256: await hasher(part.bytes),
            durationSeconds: durations.get(part.partNo) ?? 0.001,
          })),
        ),
      };
      const response = await recordingApi.complete(
        { recordingId, body: completeBody },
        { idempotencyKey: entry.completeKey, signal: controller.signal },
      );
      if (cancelled.has(sessionId)) return;

      // ④ 확정 응답을 받았다 — 이제 로컬을 지운다 (AC-4-71).
      targets.delete(sessionId);
      await kv.delete('uploads', sessionId);
      await store.delete(sessionId);
      emit({ type: 'uploaded', sessionId, response });
    } catch (error) {
      if (error instanceof AttemptCancelled || cancelled.has(sessionId)) return;
      await recordFailure(entry, error).catch((inner: unknown) => {
        if (!(inner instanceof AttemptCancelled)) throw inner;
      });
    } finally {
      active.delete(sessionId);
    }
  };

  /** 실패 기록 — 로컬은 보존하고 다음 시도를 예약한다 (RECORDING_DELETED 만 포기). */
  const recordFailure = async (current: UploadQueueEntry, error: unknown): Promise<void> => {
    const { sessionId } = current;
    let entry = current;
    if (isHaruApiError(error) && error.code === 'RECORDING_DELETED') {
      await giveUpDeleted(sessionId);
      return;
    }
    const change: { -readonly [K in keyof UploadQueueEntry]?: UploadQueueEntry[K] } = {};
    if (isHaruApiError(error) && error.code === 'RECORDING_INCOMPLETE') {
      // 서버가 받지 못했다고 한 part 를 다시 보낸다 (resume 이 서버 offset 뒤만 보낸다).
      const missing = (error.details as { partNos?: unknown } | undefined)?.partNos;
      const partNos = Array.isArray(missing)
        ? missing.filter((value): value is number => typeof value === 'number')
        : [];
      change.uploadedPartNos = entry.uploadedPartNos.filter((partNo) => !partNos.includes(partNo));
    }
    if (isHaruApiError(error) && error.code === 'IDEMPOTENCY_KEY_REUSED') {
      // 같은 키로 다른 본문을 보냈다 (예: 복구 후 part 크기 변화) — 새 의도로 키를 바꾼다.
      if (entry.recordingId === null) change.initKey = createKey();
      else change.completeKey = createKey();
    }
    if (isHaruApiError(error) && error.code === 'UPLOAD_TOKEN_EXPIRED') {
      targets.delete(sessionId);
    }
    const attempts = entry.attempts + 1;
    const failed: UploadQueueEntry = { ...entry, ...change, attempts };
    entry = await setState(entry, {
      ...change,
      attempts,
      state: entry.stalledNoticeAtMs === null ? 'failed_retrying' : 'stalled_48h',
      lastFailure: failureKind(error),
      nextAttemptAtMs: clock.now() + backoff(failed),
    });
    await checkStalled(entry);
  };

  const runDrain = async (force: boolean): Promise<void> => {
    const entries = (await listEntries()).sort(
      (a, b) =>
        (a.priority === b.priority ? 0 : a.priority === 'high' ? -1 : 1) ||
        a.enqueuedAtMs - b.enqueuedAtMs,
    );
    const online = appState.connectivity() === 'online';
    for (const stored of entries) {
      if (disposed) return;
      const entry = await checkStalled(stored).catch(() => stored);
      if (!online) continue;
      if (active.has(entry.sessionId)) continue;
      if (!force && entry.nextAttemptAtMs > clock.now()) continue;
      // 저장소 오류로 한 항목이 실패해도 나머지는 계속한다 (그 항목은 다음 깨어남에 다시 본다).
      await attempt(entry).catch(() => undefined);
    }
  };

  const queue: UploadQueue = {
    async enqueue(sessionId) {
      cancelled.delete(sessionId);
      const existing = await readEntry(sessionId);
      if (existing === null) {
        const record = await store.get(sessionId);
        if (record === null) return;
        const entry: UploadQueueEntry = {
          version: UPLOAD_QUEUE_RECORD_VERSION,
          sessionId,
          enqueuedAtMs: clock.now(),
          state: 'queued',
          priority: isEvictable(record.storagePersistence) ? 'high' : 'normal',
          attempts: 0,
          recordingId: null,
          initKey: createKey(),
          completeKey: createKey(),
          uploadedPartNos: [],
          nextAttemptAtMs: clock.now(),
          lastFailure: null,
          stalledNoticeAtMs: null,
        };
        await kv.put('uploads', sessionId, entry);
        emit({ type: 'state', sessionId, state: 'queued' });
      }
      // 기다리지 않는다 — 세션 완료(전이 전송)가 업로드 시간만큼 늦어지면 안 된다. 진행은 `drain()` 으로 관찰한다.
      void queue.drain();
    },

    async cancel(sessionId) {
      cancelled.add(sessionId);
      const controller = active.get(sessionId);
      controller?.abort();
      const target = targets.get(sessionId);
      if (controller !== undefined && target !== undefined) {
        for (const part of target.values()) {
          await uploadTransport.abort({ target: part }).catch(() => undefined);
        }
      }
      targets.delete(sessionId);
      await kv.delete('uploads', sessionId);
    },

    get: (sessionId) => readEntry(sessionId),
    list: () => listEntries(),

    async statusOf(sessionId) {
      const entry = await readEntry(sessionId);
      if (entry !== null) return entry.state;
      return (await store.get(sessionId)) === null ? null : 'local_only';
    },

    drain(drainOptions = {}) {
      const force = drainOptions.force === true;
      // 진행 중이면 그 다음에 한 번 더 — 진행 중 패스가 이미 목록을 읽었을 수 있다.
      if (draining !== null) return draining.then(() => queue.drain(drainOptions));
      // 저장소 오류가 나도 drain 은 reject 하지 않는다 (호출자 다수가 `void` 로 부른다). 다음 깨어남에 다시 본다.
      draining = runDrain(force)
        .then(() => scheduleWake())
        .catch(() => undefined)
        .finally(() => {
          draining = null;
        });
      return draining;
    },

    onEvent(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    start() {
      if (unsubscribe !== null || disposed) return;
      unsubscribe = appState.subscribe((event) => {
        const resume =
          (event.type === 'connectivity' && event.value === 'online') ||
          (event.type === 'visibility' && event.value === 'visible');
        if (resume) void queue.drain({ force: true });
      });
      void queue.drain();
    },

    async clear() {
      for (const sessionId of [...active.keys()]) await queue.cancel(sessionId);
      await kv.deletePrefix('uploads', '');
      targets.clear();
      wakeTask?.cancel();
      wakeTask = null;
    },

    dispose() {
      disposed = true;
      wakeTask?.cancel();
      wakeTask = null;
      unsubscribe?.();
      unsubscribe = null;
      for (const controller of active.values()) controller.abort();
      listeners.clear();
    },
  };

  return queue;
}
