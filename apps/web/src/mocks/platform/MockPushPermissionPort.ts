/**
 * `MockPushPermissionPort` — push 권한 포트의 Mock (Stage 4 `S4-J`, 이월 `QA-3-001`, AC-4-81).
 *
 * ── scenario (group `push`) — Catalogue §5.4 "push-devices (platform adapter)" ──
 * | key | 동작 |
 * |---|---|
 * | `success` | 처음 `prompt` → `request()` 가 `granted` → 결정적 Mock 토큰 |
 * | `push-permission-denied` | 처음 `prompt` → `request()` 가 `denied`. 이후 `request()` 는 다시 묻지 않고 `denied` |
 *
 * OS 권한은 **서버 API 가 아니라** 플랫폼의 일이라 `notifications` 그룹(`MockNotificationApi`)과
 * 분리한다. 같은 브라우저 번들 안에서 상태가 유지된다(새로 고침 = 새 번들). 시간·난수를 쓰지 않는다.
 *
 * `prompt` 로 시작하는 이유: 사전 안내 UX(Stage 3 Design Spec §2.14)는 **묻기 전** 상태가 출발점이다.
 * "이미 거부된 상태로 진입" 은 `push-permission-denied` 에서 `request()` 를 한 번 부른 상태와 같다.
 */
import type {
  PushPermissionPort,
  PushPermissionStatus,
} from '../../shared/platform/push-permission';
import type { ScenarioGroupDefinition, ScenarioStore } from '../scenarios';

export const PUSH_SCENARIO_KEYS = ['success', 'push-permission-denied'] as const;

export type PushScenarioKey = (typeof PUSH_SCENARIO_KEYS)[number];

export const pushScenarioGroup: ScenarioGroupDefinition<PushScenarioKey> = {
  group: 'push',
  keys: PUSH_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** Mock 기기 토큰 — 결정적이다. 실제 provider 토큰 모양을 흉내 내지 않는다. */
export const MOCK_PUSH_TOKEN = 'mock-web-push-token';

export interface MockPushPermissionPort extends PushPermissionPort {
  /** OS 프롬프트가 몇 번 떴는가 (테스트가 "재요청 0회" 를 단정한다). */
  promptCount(): number;
}

export function createMockPushPermissionPort(deps: {
  store: ScenarioStore;
}): MockPushPermissionPort {
  let status: PushPermissionStatus = 'prompt';
  let prompts = 0;

  return {
    platform: 'web',
    getStatus: () => Promise.resolve(status),
    request() {
      if (status !== 'prompt') return Promise.resolve(status);
      prompts += 1;
      status =
        deps.store.resolve(pushScenarioGroup) === 'push-permission-denied' ? 'denied' : 'granted';
      return Promise.resolve(status);
    },
    getToken: () => Promise.resolve(status === 'granted' ? MOCK_PUSH_TOKEN : null),
    promptCount: () => prompts,
  };
}
