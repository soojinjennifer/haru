/**
 * 브라우저 Mock 기기 seed — `D4-123` (Stage 4b `S4-H3`, handoff `# S4-H2F` H2F-5 ①).
 *
 * `?scenario=…` 로 고른 key 가 "이 기기에 남은 녹음" 을 필요로 하면, 앱 조립 지점(`app/providers/apiClients.ts`)이
 * 녹음 런타임을 **시작하기 전에** 이 함수를 한 번 부른다. 그래서 데모·e2e 에서 앱 시작 안내가 실제와 같은 경로로 난다.
 *
 * | scenario | 기기(로컬) | Mock 서버 | 결과 |
 * |---|---|---|---|
 * | `recorder:crash-recovered` | 끝나지 못한 part (`seedCrashedRecording`) | 세션 `recording` | 복구 → `completed(recovered_after_crash)` → 업로드 · 복구 Toast (AC-4-65) |
 * | `recordings:upload-stalled-48h` | 48h 전에 적재된 미확정 업로드 (`seedStalledUpload`) | 세션 `completed` | 48h Toast + `Try again` · 업로드는 계속 실패 (AC-4-149) |
 * | `recorder:local-retention-notice` | 7일 넘은 미업로드 녹음 (`seedNoticeRecording`) | 없음 | Home 7일 배너 (AC-4-150) |
 * | `recorder:local-retention-exceeded` | 14일 넘은 미업로드 녹음 (`seedStaleRecording`) | 없음 | 로컬 삭제 · 14일 Toast · 서버 요청 0 (AC-4-151) |
 *
 * `recorder` 와 `recordings` 는 그룹이 달라 함께 고를 수 있다 (예: `recorder:local-retention-exceeded,recordings:upload-stalled-48h`
 * = 14일 → 48h 순차 Toast). **가상 데이터**다 — 바이트는 Mock 녹음기 규칙, 세션은 고정 uuid.
 *
 * 시계를 직접 읽지 않는다 — 기기 시계·서버(Mock) 시계를 둘 다 받는다 (`mock-source-rules`).
 */
import type { Clock } from '../../shared/lib/clock';
import type { LocalKeyValueStore } from '../../shared/platform/recording-storage';
import { MOCK_CHILD_ID } from '../fixtures/me';
import {
  seedCrashedRecording,
  seedNoticeRecording,
  seedStaleRecording,
  seedStalledUpload,
  type LocalRecordingSeedTarget,
} from '../fixtures/local-recordings';
import {
  createDeviceSeedSessionFixture,
  MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
  MOCK_DEVICE_SEED_SESSION_IDS,
} from '../fixtures/sessions';
import { recordingScenarioGroup } from '../recordings/recordingScenarios';
import type { ScenarioStore } from '../scenarios';
import type { MockSessionState } from '../sessions/sessionState';

import { resolveLocalStoreSeed } from './localStoreScenarios';

export interface RecordingDeviceSeedOptions {
  readonly scenarios: ScenarioStore;
  readonly sessionState: MockSessionState;
  /** Mock 서버 시계 — 서버 세션 시각. */
  readonly serverClock: Clock;
  /** 기기 시계 — 로컬 녹음·큐 시각 (보관·48h 판정이 이 시계를 쓴다). */
  readonly deviceClock: Clock;
  readonly target: LocalRecordingSeedTarget;
  readonly kv: LocalKeyValueStore;
}

/** 이 scenario 조합이 seed 할 세션 id (없으면 빈 배열) — e2e·테스트가 결과를 찾을 때 쓴다. */
export function resolveDeviceSeedSessionIds(scenarios: ScenarioStore): string[] {
  const ids: string[] = [];
  const local = resolveLocalStoreSeed(scenarios);
  if (local === 'crash-recovered') ids.push(MOCK_DEVICE_SEED_SESSION_IDS.crashed);
  if (local === 'local-retention-notice') ids.push(MOCK_DEVICE_SEED_SESSION_IDS.notice);
  if (local === 'local-retention-exceeded') ids.push(MOCK_DEVICE_SEED_SESSION_IDS.expired);
  if (scenarios.resolve(recordingScenarioGroup) === 'upload-stalled-48h') {
    ids.push(MOCK_DEVICE_SEED_SESSION_IDS.stalled);
  }
  return ids;
}

function putServerSession(
  options: RecordingDeviceSeedOptions,
  id: string,
  status: 'recording' | 'completed',
): void {
  options.sessionState.sessions.set(id, {
    summary: createDeviceSeedSessionFixture(id, status, options.serverClock),
    childId: MOCK_CHILD_ID,
    clientSessionKey: null,
    sticker: null,
    completionBubble: MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
    recordingId: null,
  });
}

export async function applyRecordingDeviceSeed(options: RecordingDeviceSeedOptions): Promise<void> {
  const { scenarios, target, kv, deviceClock } = options;
  const ids = MOCK_DEVICE_SEED_SESSION_IDS;

  switch (resolveLocalStoreSeed(scenarios)) {
    case 'crash-recovered':
      putServerSession(options, ids.crashed, 'recording');
      await seedCrashedRecording(target, ids.crashed, deviceClock);
      break;
    case 'local-retention-notice':
      await seedNoticeRecording(target, ids.notice, deviceClock);
      break;
    case 'local-retention-exceeded':
      await seedStaleRecording(target, ids.expired, deviceClock);
      break;
    case 'none':
      break;
  }

  if (scenarios.resolve(recordingScenarioGroup) === 'upload-stalled-48h') {
    putServerSession(options, ids.stalled, 'completed');
    await seedStalledUpload(target, kv, ids.stalled, deviceClock);
  }
}
