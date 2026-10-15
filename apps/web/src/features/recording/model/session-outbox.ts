/**
 * `SessionOutbox` — 세션 전이 이벤트 **영속·순서 보존 재전송** (Stage 4 `S4-E`, `ARCHITECTURE` §10.4,
 * `rules/architecture.md` §7 — 오프라인·전이 실패 시 적재).
 *
 * `RecordingController` 의 `SessionTransitionPort` 를 감싼다 (`portFor(sessionId)`):
 *
 * ```
 * Controller.send(request) → Outbox: ① 기기에 적재(Idempotency-Key 고정) ② 앞에서부터 순서대로 전송
 *   ├ 전달됨          → 항목 제거 · `confirmed` 이벤트 · 결과 반환
 *   ├ 연결 실패·5xx   → 항목 **유지** · 백오프 예약 · `NetworkError` 를 던진다 (Controller 는 로컬 녹음을 보존)
 *   └ 서버 거절(4xx)  → 항목 제거 · `rejected` 이벤트 · 그 오류를 던진다 (Controller 가 재동기화)
 * ```
 *
 * - **순서**: 적재 순서(`seq`) 그대로 보낸다. 앞 항목이 연결 실패면 **뒤 항목도 보내지 않는다** (AC-4-66).
 * - **재전송은 같은 `Idempotency-Key`** 다 — 서버(Mock)가 최초 응답을 재생해 중복 전이·중복 스티커가 없다.
 * - **자동 재개**: `AppStatePort` 가 `online`·`visible` 을 알리면 즉시 비운다 (AC-4-31 — 폴링·수동 버튼 없음).
 *   이벤트가 오지 않는 실패(서버 5xx 등)는 백오프 예약으로 다시 시도한다.
 * - 오프라인 `Discard`: 폐기 전이가 여기 적재되고 로컬 녹음은 **보존**된다. 전달이 확정되면 `confirmed`
 *   이벤트를 받은 조립 지점(`recording-runtime.ts`)이 로컬을 지운다 (`D4-13` 삭제 순서).
 *
 * 🔒 적재 항목은 전이 본문(상태·시각·녹음 초)과 세션 id 뿐이다 — PII 없음. 로그를 남기지 않는다.
 */
import {
  HaruApiError,
  type ErrorCode,
  type SessionTransitionRequest,
  type SessionTransitionResult,
} from '@haru/contracts';

import { isHaruApiError, NetworkError, type SessionApi } from '../../../shared/api';
import type { Clock } from '../../../shared/lib/clock';
import type { ScheduledTask, Scheduler } from '../../../shared/lib/scheduler';
import type { AppStatePort } from '../../../shared/platform/app-state';
import type { LocalKeyValueStore } from '../../../shared/platform/recording-storage';

import type { SessionTransitionPort } from './ports';

export const OUTBOX_RECORD_VERSION = 1;

/** 다시 보낼 가치가 있는 서버 오류 — 나머지 4xx 는 같은 요청을 다시 보내도 결과가 같다. */
const RETRYABLE_CODES: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
  'INTERNAL_ERROR',
  'RATE_LIMITED',
  'PROVIDER_UNAVAILABLE',
]);

/** 재시도 간격 (ms) — 마지막 값에서 멈춘다. 연결 복구 이벤트는 이 대기를 건너뛴다. */
export const OUTBOX_BACKOFF_MS: readonly number[] = [2_000, 10_000, 30_000, 60_000, 300_000];

export interface OutboxEntry {
  readonly version: typeof OUTBOX_RECORD_VERSION;
  readonly seq: number;
  readonly sessionId: string;
  readonly request: SessionTransitionRequest;
  readonly idempotencyKey: string;
  readonly enqueuedAtMs: number;
  readonly attempts: number;
}

export type OutboxEvent =
  | { readonly type: 'queued'; readonly entry: OutboxEntry }
  | {
      readonly type: 'confirmed';
      readonly entry: OutboxEntry;
      readonly result: SessionTransitionResult;
    }
  | { readonly type: 'rejected'; readonly entry: OutboxEntry; readonly code: ErrorCode };

export interface SessionOutboxOptions {
  readonly kv: LocalKeyValueStore;
  readonly sessionApi: Pick<SessionApi, 'transition' | 'getDetail'>;
  readonly appState: AppStatePort;
  readonly clock: Clock;
  readonly scheduler: Scheduler;
  readonly createKey: () => string;
}

export interface SessionOutbox {
  /** Controller 에 넘길 포트. */
  portFor(sessionId: string): SessionTransitionPort;
  send(sessionId: string, request: SessionTransitionRequest): Promise<SessionTransitionResult>;
  /** 적재된 항목을 앞에서부터 보낸다. 연결 실패에서 멈춘다. */
  flush(): Promise<void>;
  pending(sessionId?: string): Promise<readonly OutboxEntry[]>;
  onEvent(listener: (event: OutboxEvent) => void): () => void;
  /** 연결·화면 신호 구독 + 남은 항목 1회 전송. */
  start(): void;
  /** 세션의 미전송 항목을 버린다 (보관 상한·서버 삭제 후 정리). */
  dropSession(sessionId: string): Promise<void>;
  clear(): Promise<void>;
  dispose(): void;
}

const keyOf = (seq: number): string => String(seq).padStart(12, '0');

function isOutboxEntry(value: unknown): value is OutboxEntry {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v['version'] === OUTBOX_RECORD_VERSION &&
    typeof v['seq'] === 'number' &&
    typeof v['sessionId'] === 'string' &&
    typeof v['request'] === 'object' &&
    v['request'] !== null &&
    typeof v['idempotencyKey'] === 'string' &&
    typeof v['enqueuedAtMs'] === 'number' &&
    typeof v['attempts'] === 'number'
  );
}

type Outcome =
  | { readonly kind: 'delivered'; readonly result: SessionTransitionResult }
  | { readonly kind: 'rejected'; readonly error: unknown };

export function createSessionOutbox(options: SessionOutboxOptions): SessionOutbox {
  const { kv, sessionApi, appState, clock, scheduler, createKey } = options;
  const listeners = new Set<(event: OutboxEvent) => void>();
  const outcomes = new Map<number, Outcome>();
  let nextSeq: number | null = null;
  let flushing: Promise<void> | null = null;
  let retryTask: ScheduledTask | null = null;
  let failureStreak = 0;
  let lastBlockingError: unknown = null;
  let unsubscribe: (() => void) | null = null;
  let disposed = false;

  const emit = (event: OutboxEvent): void => {
    for (const listener of [...listeners]) listener(event);
  };

  const entries = async (): Promise<OutboxEntry[]> =>
    (await kv.list('outbox')).filter(isOutboxEntry).sort((a, b) => a.seq - b.seq);

  const allocateSeq = async (): Promise<number> => {
    if (nextSeq === null) {
      const existing = await entries();
      nextSeq = (existing.at(-1)?.seq ?? 0) + 1;
    }
    const seq = nextSeq;
    nextSeq += 1;
    return seq;
  };

  const scheduleRetry = (): void => {
    if (disposed || retryTask !== null) return;
    const delay = OUTBOX_BACKOFF_MS[Math.min(failureStreak - 1, OUTBOX_BACKOFF_MS.length - 1)] ?? 0;
    retryTask = scheduler.schedule(delay, () => {
      retryTask = null;
      void outbox.flush();
    });
  };

  const isRetryable = (error: unknown): boolean =>
    !isHaruApiError(error) || RETRYABLE_CODES.has(error.code);

  const runFlush = async (): Promise<void> => {
    if (appState.connectivity() === 'offline') return;
    for (const entry of await entries()) {
      if (disposed) return;
      try {
        const result = await sessionApi.transition(
          { sessionId: entry.sessionId, body: entry.request },
          { idempotencyKey: entry.idempotencyKey },
        );
        await kv.delete('outbox', keyOf(entry.seq));
        outcomes.set(entry.seq, { kind: 'delivered', result });
        failureStreak = 0;
        lastBlockingError = null;
        emit({ type: 'confirmed', entry, result });
      } catch (error) {
        if (isRetryable(error)) {
          // 이 항목과 뒤 항목을 모두 보존한다 — 순서가 깨지지 않게 여기서 멈춘다.
          await kv.put('outbox', keyOf(entry.seq), { ...entry, attempts: entry.attempts + 1 });
          failureStreak += 1;
          lastBlockingError = error;
          scheduleRetry();
          return;
        }
        await kv.delete('outbox', keyOf(entry.seq));
        outcomes.set(entry.seq, { kind: 'rejected', error });
        emit({
          type: 'rejected',
          entry,
          code: isHaruApiError(error) ? error.code : 'INTERNAL_ERROR',
        });
      }
    }
  };

  const outbox: SessionOutbox = {
    portFor(sessionId) {
      return {
        send: (request) => outbox.send(sessionId, request),
        async fetchState() {
          const detail = await sessionApi.getDetail({ sessionId });
          return { status: detail.status, recordedSeconds: detail.recordedSeconds };
        },
      };
    },

    async send(sessionId, request) {
      const seq = await allocateSeq();
      const entry: OutboxEntry = {
        version: OUTBOX_RECORD_VERSION,
        seq,
        sessionId,
        request,
        idempotencyKey: createKey(),
        enqueuedAtMs: clock.now(),
        attempts: 0,
      };
      await kv.put('outbox', keyOf(seq), entry);
      emit({ type: 'queued', entry });
      await outbox.flush();
      const outcome = outcomes.get(seq);
      outcomes.delete(seq);
      if (outcome?.kind === 'delivered') return outcome.result;
      if (outcome?.kind === 'rejected') throw outcome.error;
      // 아직 적재돼 있다 — 연결 실패(또는 앞 항목이 막혀 있음). Controller 는 이것을 network 로 본다.
      if (lastBlockingError instanceof NetworkError) throw lastBlockingError;
      if (lastBlockingError instanceof HaruApiError) throw lastBlockingError;
      throw new NetworkError('The transition is queued until the connection returns.');
    },

    flush() {
      // 진행 중이면 **그 다음에 한 번 더** 돈다 — 진행 중인 패스가 이미 목록을 읽었을 수 있으므로
      // 합류만 하면 방금 적재한 항목이 빠진다.
      if (flushing !== null) return flushing.then(() => outbox.flush());
      // 저장소 오류가 나도 flush 는 reject 하지 않는다 (항목은 남아 있고 다음 신호에 다시 보낸다).
      flushing = runFlush()
        .catch(() => undefined)
        .finally(() => {
          flushing = null;
        });
      return flushing;
    },

    async pending(sessionId) {
      const all = await entries();
      return sessionId === undefined ? all : all.filter((entry) => entry.sessionId === sessionId);
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
        if (!resume) return;
        retryTask?.cancel();
        retryTask = null;
        void outbox.flush();
      });
      void outbox.flush();
    },

    async dropSession(sessionId) {
      for (const entry of await entries()) {
        if (entry.sessionId === sessionId) await kv.delete('outbox', keyOf(entry.seq));
      }
    },

    async clear() {
      await kv.deletePrefix('outbox', '');
      nextSeq = null;
    },

    dispose() {
      disposed = true;
      retryTask?.cancel();
      retryTask = null;
      unsubscribe?.();
      unsubscribe = null;
      listeners.clear();
    },
  };

  return outbox;
}
