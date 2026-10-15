/**
 * 테스트 전용 수동 시계 + 예약 실행기 — `advance(ms)` 로만 시간이 흐른다.
 *
 * `RecordingController` 의 30분 · 10분 경계와 `RecorderAdapter` mock 의 청크 주기를
 * 실시간 대기 없이 결정적으로 검증한다. 예약은 (실행 시각, 등록 순서) 순으로 실행되며,
 * 실행 중에 새로 등록된 예약도 `advance` 범위 안이면 같은 호출에서 실행된다.
 */
import type { Clock } from '../shared/lib/clock';
import type { ScheduledTask, Scheduler } from '../shared/lib/scheduler';

export interface ManualScheduler extends Clock, Scheduler {
  /** 시간을 `ms` 만큼 앞으로 돌리며 그 사이 예약을 순서대로 실행한다. */
  advance(ms: number): void;
  /** 대기 중인 예약 수 (누수 검사용). */
  pendingCount(): number;
}

interface Entry {
  at: number;
  order: number;
  run: () => void;
  cancelled: boolean;
}

export function createManualScheduler(startEpochMs = 0): ManualScheduler {
  let now = startEpochMs;
  let order = 0;
  const queue: Entry[] = [];

  const nextDue = (limit: number): Entry | undefined => {
    let best: Entry | undefined;
    for (const entry of queue) {
      if (entry.cancelled || entry.at > limit) continue;
      if (
        best === undefined ||
        entry.at < best.at ||
        (entry.at === best.at && entry.order < best.order)
      ) {
        best = entry;
      }
    }
    return best;
  };

  const remove = (entry: Entry): void => {
    const index = queue.indexOf(entry);
    if (index >= 0) queue.splice(index, 1);
  };

  return {
    now: () => now,
    nowIso: () => new Date(now).toISOString(),
    schedule(delayMs, run): ScheduledTask {
      const entry: Entry = {
        at: now + Math.max(0, delayMs),
        order: order++,
        run,
        cancelled: false,
      };
      queue.push(entry);
      return {
        cancel: () => {
          entry.cancelled = true;
          remove(entry);
        },
      };
    },
    advance(ms) {
      const target = now + ms;
      for (;;) {
        const entry = nextDue(target);
        if (entry === undefined) break;
        remove(entry);
        now = Math.max(now, entry.at);
        entry.run();
      }
      now = target;
    },
    pendingCount: () => queue.filter((entry) => !entry.cancelled).length,
  };
}
