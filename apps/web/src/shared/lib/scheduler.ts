/**
 * 주입 가능한 예약 실행기 — `Clock`(지금 몇 시인가) 과 짝을 이루는 "언제 깨워 달라" 포트.
 *
 * Stage 4 `S4-D` 의 `RecordingController` 타이머(30분 자동 종료 · 10분 방치)와
 * `RecorderAdapter` 의 청크 watchdog 이 이 포트만 쓴다. 그래서 테스트는 실시간을 기다리지 않고
 * 수동 시계를 앞으로 돌려 1800초 · 600초 경계를 결정적으로 검증한다 (AC-4-43 · 44 · 46).
 *
 * 실제 `setTimeout` 을 호출하는 곳은 이 파일의 `createSystemScheduler()` 하나뿐이다
 * (Mock 소스는 `setTimeout` 을 직접 부르지 못한다 — `mock-source-rules.test.ts`).
 */
import type { Clock } from './clock';

/** 예약 취소 핸들. 값의 모양은 구현마다 다르므로 불투명하게 다룬다. */
export interface ScheduledTask {
  cancel(): void;
}

export interface Scheduler {
  /** `delayMs` 뒤에 `run` 을 한 번 실행한다. 음수는 0 으로 본다. */
  schedule(delayMs: number, run: () => void): ScheduledTask;
}

/** 실제 시간이 흐르는 시계 + 예약 실행기 (앱 실행 경로). */
export interface ClockScheduler extends Clock, Scheduler {}

export function createSystemScheduler(): Scheduler {
  return {
    schedule(delayMs, run) {
      const id = setTimeout(run, Math.max(0, delayMs));
      return {
        cancel: () => {
          clearTimeout(id);
        },
      };
    },
  };
}
