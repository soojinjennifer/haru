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
 *
 * ⭐ `S4-H2R` — **권한 상태와 녹음기 호출 기록도 묶음 하나에 하나**다. Start Session 판정이 만든 녹음기와 세션
 * 화면의 녹음기가 같은 기기 권한을 본다(브라우저가 권한을 기억하는 것과 같다). 권한 칸은 scenario key 가 바뀌면
 * 그 key 의 처음 값으로 다시 시작한다(dev 패널 전환).
 */
import type { Clock } from '../../shared/lib/clock';
import type { Scheduler } from '../../shared/lib/scheduler';
import type { ScenarioStore } from '../scenarios';
import { resolveRecorderScenario } from '../recorder/recorderScenarios';

import {
  createMockRecorderAdapter,
  type MockPermissionCell,
  type MockRecorderAdapter,
  type MockRecorderCall,
} from './MockRecorderAdapter';
import { createMockRecordingStorage, type MockRecordingStorage } from './MockRecordingStorage';

export interface MockRecordingPlatform {
  createRecorder(): MockRecorderAdapter;
  readonly storage: MockRecordingStorage;
  /** 이 묶음의 모든 녹음기 호출 — 프롬프트 수(`requestPermission`) 증거 (AC-4-145). */
  readonly recorderCalls: readonly MockRecorderCall[];
}

export function createMockRecordingPlatform(deps: {
  store: ScenarioStore;
  clock: Clock;
  scheduler: Scheduler;
}): MockRecordingPlatform {
  const storage = createMockRecordingStorage();
  const calls: MockRecorderCall[] = [];
  let permission: { key: string; cell: MockPermissionCell } | null = null;
  return {
    storage,
    recorderCalls: calls,
    createRecorder: () => {
      const plan = resolveRecorderScenario(deps.store);
      if (permission?.key !== plan.key) {
        permission = { key: plan.key, cell: { current: plan.initialPermission } };
      }
      return createMockRecorderAdapter({
        plan,
        clock: deps.clock,
        scheduler: deps.scheduler,
        permissionCell: permission.cell,
        calls,
      });
    },
  };
}
