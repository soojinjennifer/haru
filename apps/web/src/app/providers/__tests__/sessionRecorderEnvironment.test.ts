/**
 * 녹음 조립 (`S4-F1`) — `S4-D` handoff D-8 ① · `S4-E` E-8 ② · `D4-46` 을 닫는다.
 */
import { describe, expect, it, vi } from 'vitest';

import {
  createMockApiClientsBundle,
  createMockAppStatePort,
  createMockRecordingPlatform,
} from '../../../mocks';
import { createImmediateTimer } from '../../../shared/api/helpers';
import { createManualScheduler } from '../../../test/manual-scheduler';
import { createSessionRecorderEnvironment } from '../sessionRecorderEnvironment';

function setup() {
  const scheduler = createManualScheduler(Date.UTC(2026, 0, 1));
  const clock = scheduler;
  const bundle = createMockApiClientsBundle({ timer: createImmediateTimer() });
  const platform = vi.fn(() => {
    const mock = createMockRecordingPlatform({ store: bundle.store, clock, scheduler });
    return {
      createRecorder: mock.createRecorder,
      storage: mock.storage,
      appState: createMockAppStatePort(),
    };
  });
  const wipeDevice = vi.fn(() => Promise.resolve());
  const environment = createSessionRecorderEnvironment({
    clients: bundle.clients,
    clock,
    scheduler,
    platform,
    wipeDevice,
  });
  return { clock, scheduler, environment, platform, wipeDevice };
}

describe('createSessionRecorderEnvironment', () => {
  it('플랫폼·런타임을 처음 쓸 때만 연다 (세션 없는 트리는 저장소를 열지 않는다)', async () => {
    const { platform, environment, wipeDevice } = setup();
    expect(platform).not.toHaveBeenCalled();
    await environment.clearLocalRecordings();
    expect(platform).not.toHaveBeenCalled();
    expect(wipeDevice).toHaveBeenCalledOnce();
  });

  it('ready 리마인드 = 5분 · 방치 = 10분 (`D4-46`) — 컨트롤러가 그 값으로 조립된다', async () => {
    const { clock, scheduler, environment } = setup();
    const recorder = environment.create({
      sessionId: '99999999-9999-4999-8999-000000000001',
      mode: 'recorded',
      readyAt: clock.nowIso(),
      readConsentStatus: () => null,
    });
    expect(recorder.getSnapshot().readyReminderShown).toBe(false);
    scheduler.advance(300_000 - 1);
    expect(recorder.getSnapshot().readyReminderShown).toBe(false);
    scheduler.advance(1);
    expect(recorder.getSnapshot().readyReminderShown).toBe(true);
    await recorder.dispose();
  });

  it('동의를 모르면 녹음을 시작하지 않는다 (fail-closed — AC-4-62 조립 경로)', async () => {
    const { clock, environment } = setup();
    const recorder = environment.create({
      sessionId: '99999999-9999-4999-8999-000000000002',
      mode: 'recorded',
      readyAt: clock.nowIso(),
      readConsentStatus: () => undefined,
    });
    const outcome = await recorder.start();
    expect(outcome).toMatchObject({ ok: false, reason: 'consent_required' });
    expect(recorder.getSnapshot().status).toBe('ready');
    await recorder.dispose();
  });

  it('로그아웃 정리 = 런타임 clearAll(메모리 큐·outbox) + 기기 저장소 삭제 (E-8 ②)', async () => {
    const { clock, environment, wipeDevice, platform } = setup();
    const recorder = environment.create({
      sessionId: '99999999-9999-4999-8999-000000000003',
      mode: 'recorded',
      readyAt: clock.nowIso(),
      readConsentStatus: () => null,
    });
    expect(platform).toHaveBeenCalledOnce();
    await recorder.dispose();
    await environment.clearLocalRecordings();
    expect(wipeDevice).toHaveBeenCalledOnce();
  });
});
