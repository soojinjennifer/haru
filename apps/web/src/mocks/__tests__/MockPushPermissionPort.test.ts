/**
 * `MockPushPermissionPort` — scenario `push:push-permission-denied` (이월 `QA-3-001`, AC-4-81).
 */
import { describe, expect, it } from 'vitest';

import {
  MOCK_PUSH_TOKEN,
  PUSH_SCENARIO_KEYS,
  pushScenarioGroup,
} from '../platform/MockPushPermissionPort';

import { bundle } from './stage4-support';

describe('MockPushPermissionPort', () => {
  it('group `push` — Catalogue §5.4 key 만 쓴다', () => {
    expect(pushScenarioGroup.group).toBe('push');
    expect(PUSH_SCENARIO_KEYS).toStrictEqual(['success', 'push-permission-denied']);
  });

  it('success — prompt 에서 시작, request 1회 → granted → 결정적 토큰', async () => {
    const { pushPermission } = bundle();
    expect(pushPermission.platform).toBe('web');
    expect(await pushPermission.getStatus()).toBe('prompt');
    expect(await pushPermission.getToken()).toBeNull();

    expect(await pushPermission.request()).toBe('granted');
    expect(await pushPermission.getToken()).toBe(MOCK_PUSH_TOKEN);
  });

  it('push-permission-denied — request → denied, 다시 묻지 않는다, 토큰 없음', async () => {
    const { pushPermission } = bundle('push:push-permission-denied');
    expect(await pushPermission.getStatus()).toBe('prompt');
    expect(await pushPermission.request()).toBe('denied');
    expect(await pushPermission.request()).toBe('denied');
    expect(await pushPermission.getStatus()).toBe('denied');
    expect(await pushPermission.getToken()).toBeNull();
  });

  it('다른 그룹의 scenario 는 push 권한에 영향이 없다', async () => {
    const { pushPermission } = bundle('notifications:error');
    expect(await pushPermission.request()).toBe('granted');
  });
});
