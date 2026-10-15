/**
 * 로컬 미업로드 녹음 **보관 상한** (`D4-29`, 사용자 결정 2026-10-15 — `N4-09`·`OAQ-11` 해소, `R4-11` 완화).
 *
 * - **7일** 경과 → 안내 신호 **1회** (`retention_notice`)
 * - **14일** 경과 → 로컬 삭제 (`retention_expired`)
 *
 * 근거는 용량이 아니라 **아동 음성 최소 보관 원칙**이다 (spike §8.2 — 30분 세션이 할당량의 0.27%).
 * 기준 시각은 레코드의 `createdAtMs`(첫 part 시작)다. 안내 **화면**은 `S4-H2` 의 일이다 — 여기는 판정·신호뿐.
 *
 * ⚠️ 14일 삭제는 **유실**이다. 사용자 결정으로 허용되었고, 삭제는 `onExpired` 를 받은 조립 지점이 한다
 * (업로드 큐 취소 → 로컬 삭제). 업로드가 확정된 녹음은 이미 지워졌으므로 여기 오지 않는다.
 */
import type { Clock } from '../../../shared/lib/clock';
import type { ScheduledTask, Scheduler } from '../../../shared/lib/scheduler';

import type { LocalRecordingStore } from './local-recording-store';
import type { LocalRecordingRecord } from './local-records';

const DAY_MS = 24 * 60 * 60 * 1000;

/** 7일 — 안내 시점 (`D4-29`). */
export const LOCAL_RECORDING_NOTICE_MS = 7 * DAY_MS;

/** 14일 — 로컬 삭제 시점 (`D4-29`). */
export const LOCAL_RECORDING_RETENTION_MS = 14 * DAY_MS;

export type LocalRetentionVerdict = 'keep' | 'notice' | 'expired';

/** 순수 판정 — 경계는 **이상**(`≥`)이다. 이미 안내한 레코드는 `notice` 를 다시 내지 않는다. */
export function evaluateLocalRetention(
  record: Pick<LocalRecordingRecord, 'createdAtMs' | 'retentionNoticeAtMs'>,
  nowMs: number,
): LocalRetentionVerdict {
  const age = nowMs - record.createdAtMs;
  if (age >= LOCAL_RECORDING_RETENTION_MS) return 'expired';
  if (age >= LOCAL_RECORDING_NOTICE_MS && record.retentionNoticeAtMs === null) return 'notice';
  return 'keep';
}

export type LocalRetentionEvent =
  | {
      readonly type: 'retention_notice';
      readonly sessionId: string;
      /** 이 시각에 로컬에서 지워진다 (안내 문구용). */
      readonly deleteAtMs: number;
    }
  | { readonly type: 'retention_expired'; readonly sessionId: string };

export interface LocalRetentionSweepResult {
  readonly noticed: readonly string[];
  readonly expired: readonly string[];
}

export interface LocalRetentionMonitorOptions {
  readonly store: LocalRecordingStore;
  readonly clock: Clock;
  readonly scheduler: Scheduler;
  /** 14일 경과 — 로컬 삭제를 수행한다 (업로드 큐 취소 + 로컬 삭제). */
  readonly onExpired: (sessionId: string) => Promise<void>;
}

export interface LocalRetentionMonitor {
  sweep(): Promise<LocalRetentionSweepResult>;
  onEvent(listener: (event: LocalRetentionEvent) => void): () => void;
  /** 1회 정리 + 다음 경계에 깨어나도록 예약한다. */
  start(): void;
  dispose(): void;
}

export function createLocalRetentionMonitor(
  options: LocalRetentionMonitorOptions,
): LocalRetentionMonitor {
  const { store, clock, scheduler, onExpired } = options;
  const listeners = new Set<(event: LocalRetentionEvent) => void>();
  let wake: ScheduledTask | null = null;
  let running: Promise<LocalRetentionSweepResult> | null = null;
  let started = false;
  let disposed = false;

  const emit = (event: LocalRetentionEvent): void => {
    for (const listener of [...listeners]) listener(event);
  };

  /** 다음 경계(7일·14일 중 아직 지나지 않은 가장 이른 것)에 다시 본다. */
  const scheduleNext = (records: readonly LocalRecordingRecord[]): void => {
    wake?.cancel();
    wake = null;
    if (!started || disposed) return;
    const now = clock.now();
    const boundaries = records.flatMap((record) =>
      [
        record.retentionNoticeAtMs === null
          ? record.createdAtMs + LOCAL_RECORDING_NOTICE_MS
          : Number.POSITIVE_INFINITY,
        record.createdAtMs + LOCAL_RECORDING_RETENTION_MS,
      ].filter((at) => at > now),
    );
    const earliest = Math.min(...boundaries);
    if (!Number.isFinite(earliest)) return;
    wake = scheduler.schedule(earliest - now, () => {
      wake = null;
      void monitor.sweep().catch(() => undefined);
    });
  };

  const runSweep = async (): Promise<LocalRetentionSweepResult> => {
    const noticed: string[] = [];
    const expired: string[] = [];
    const now = clock.now();
    for (const record of await store.list()) {
      const verdict = evaluateLocalRetention(record, now);
      if (verdict === 'expired') {
        await onExpired(record.sessionId);
        expired.push(record.sessionId);
        emit({ type: 'retention_expired', sessionId: record.sessionId });
      } else if (verdict === 'notice') {
        await store.update(record.sessionId, (current) => ({
          ...current,
          retentionNoticeAtMs: now,
        }));
        noticed.push(record.sessionId);
        emit({
          type: 'retention_notice',
          sessionId: record.sessionId,
          deleteAtMs: record.createdAtMs + LOCAL_RECORDING_RETENTION_MS,
        });
      }
    }
    scheduleNext(await store.list());
    return { noticed, expired };
  };

  const monitor: LocalRetentionMonitor = {
    sweep() {
      running ??= runSweep().finally(() => {
        running = null;
      });
      return running;
    },
    onEvent(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start() {
      if (started || disposed) return;
      started = true;
      void monitor.sweep().catch(() => undefined);
    },
    dispose() {
      disposed = true;
      wake?.cancel();
      wake = null;
      listeners.clear();
    },
  };

  return monitor;
}
