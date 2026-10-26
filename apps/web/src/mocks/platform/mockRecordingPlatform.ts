/**
 * Mock 녹음 플랫폼 — `RecorderAdapter`(Mock) + 로컬 저장소(메모리) 묶음 (Stage 4 `S4-F1` 조립용).
 *
 * 조립 지점(`app/providers`)이 `mock` 모드에서 이 묶음을 고른다 — 선택 지점은 그곳 한 곳이다
 * (Plan §5.2-2). 녹음기 계획은 같은 scenario store 의 `recorder:*` 를 읽는다
 * (`?scenario=recorder:mic-permission-denied` 등). 시계·스케줄러는 주입받는다 (Mock 소스는 시계를
 * 직접 읽지 않는다 — `mock-source-rules`).
 *
 * 세션마다 녹음기를 새로 만든다 (`createRecorder`) — 화면이 떠날 때 컨트롤러와 함께 정리된다.
 * 저장소는 묶음 하나에 하나다 (런타임이 공유한다).
 */
import type { Clock } from '../../shared/lib/clock';
import type { Scheduler } from '../../shared/lib/scheduler';
import type { RecorderAdapter } from '../../shared/platform/recorder';
import type { ScenarioStore } from '../scenarios';
import { resolveRecorderScenario } from '../recorder/recorderScenarios';

import { createMockRecorderAdapter } from './MockRecorderAdapter';
import { createMockRecordingStorage, type MockRecordingStorage } from './MockRecordingStorage';

export interface MockRecordingPlatform {
  createRecorder(): RecorderAdapter;
  readonly storage: MockRecordingStorage;
}

export function createMockRecordingPlatform(deps: {
  store: ScenarioStore;
  clock: Clock;
  scheduler: Scheduler;
}): MockRecordingPlatform {
  const storage = createMockRecordingStorage();
  return {
    storage,
    createRecorder: () =>
      createMockRecorderAdapter({
        plan: resolveRecorderScenario(deps.store),
        clock: deps.clock,
        scheduler: deps.scheduler,
      }),
  };
}
