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
import { createFixedClock } from '../../../shared/lib/clock';
import {
  createWebRecorderAdapter,
  type WebMediaEnvironment,
} from '../../../shared/platform/recorder';
import { createManualScheduler } from '../../../test/manual-scheduler';
import { seedCrashedRecording, seedStaleRecording } from '../../../mocks/fixtures/local-recordings';
import { CONSENTED } from '../../../features/recording/model/__tests__/controller-support';
import {
  createSessionRecorderEnvironment,
  type DeviceSeedTarget,
} from '../sessionRecorderEnvironment';

function setup(options: { seedDevice?: (target: DeviceSeedTarget) => Promise<void> } = {}) {
  const scheduler = createManualScheduler(Date.UTC(2026, 0, 1));
  const clock = scheduler;
  const bundle = createMockApiClientsBundle({ timer: createImmediateTimer() });
  const appState = createMockAppStatePort();
  const platform = vi.fn(() => {
    const mock = createMockRecordingPlatform({ store: bundle.store, clock, scheduler });
    return {
      createRecorder: mock.createRecorder,
      storage: mock.storage,
      appState,
    };
  });
  const wipeDevice = vi.fn(() => Promise.resolve());
  const environment = createSessionRecorderEnvironment({
    clients: bundle.clients,
    clock,
    scheduler,
    platform,
    wipeDevice,
    ...(options.seedDevice === undefined ? {} : { seedDevice: options.seedDevice }),
  });
  return { clock, scheduler, environment, platform, wipeDevice, appState, bundle };
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

/**
 * `S4-H2R` — Start Session 권한 판정 (`D4-112` · `D4-119` CP-8, AC-4-145 · AC-4-146).
 * 실제 **Web** 어댑터를 가짜 브라우저 환경 위에 올려 판정 규칙과 스트림 해제를 함께 본다.
 */
describe('resolveSessionMode — Start Session 권한 판정 (S4-H2R)', () => {
  interface FakeMedia extends WebMediaEnvironment {
    opened: number;
    released: number;
  }

  function fakeMedia(options: {
    supported?: boolean;
    permission: 'granted' | 'denied' | 'prompt' | null;
    /** 프롬프트에서 사용자가 고른 결과 (`openStream` 의 성공·실패 이름). */
    prompt?: 'allow' | 'NotAllowedError' | 'NotFoundError';
  }): FakeMedia {
    const media: FakeMedia = {
      opened: 0,
      released: 0,
      supported: () => options.supported ?? true,
      queryPermission: () => Promise.resolve(options.permission),
      openStream() {
        const choice = options.prompt ?? 'allow';
        if (choice !== 'allow') {
          return Promise.reject(Object.assign(new Error(choice), { name: choice }));
        }
        media.opened += 1;
        return Promise.resolve({
          trackEnded: () => false,
          release: () => {
            media.released += 1;
          },
        });
      },
      createRecorder: () => {
        throw new Error('판정은 레코더를 만들지 않는다');
      },
      onHidden: () => () => undefined,
      onDeviceChange: () => () => undefined,
    };
    return media;
  }

  function webSetup(media: FakeMedia) {
    const scheduler = createManualScheduler(Date.UTC(2026, 0, 1));
    const bundle = createMockApiClientsBundle({ timer: createImmediateTimer() });
    const mock = createMockRecordingPlatform({ store: bundle.store, clock: scheduler, scheduler });
    const environment = createSessionRecorderEnvironment({
      clients: bundle.clients,
      clock: scheduler,
      scheduler,
      platform: () => ({
        createRecorder: () =>
          createWebRecorderAdapter({ clock: scheduler, scheduler, environment: media }),
        storage: mock.storage,
        appState: createMockAppStatePort(),
      }),
      wipeDevice: () => Promise.resolve(),
    });
    return environment;
  }

  it.each([
    ['① granted — 프롬프트 0', { permission: 'granted' }, 'recorded', 0],
    ['② prompt → 허용', { permission: 'prompt', prompt: 'allow' }, 'recorded', 1],
    [
      '② prompt → 거부',
      { permission: 'prompt', prompt: 'NotAllowedError' },
      'conversation_only',
      0,
    ],
    ['③ 권한 API 미지원(null) → 허용', { permission: null, prompt: 'allow' }, 'recorded', 1],
    [
      '③ 권한 API 미지원(null) → 거부',
      { permission: null, prompt: 'NotAllowedError' },
      'conversation_only',
      0,
    ],
    ['④ denied — 프롬프트 0', { permission: 'denied' }, 'conversation_only', 0],
    [
      '⑤ unavailable(장치 없음 — getUserMedia NotFoundError)',
      { permission: 'prompt', prompt: 'NotFoundError' },
      'conversation_only',
      0,
    ],
    [
      '⑤ unavailable(MediaRecorder 없음)',
      { supported: false, permission: 'granted' },
      'conversation_only',
      0,
    ],
  ] as const)('%s → %s', async (_name, options, mode, opened) => {
    const media = fakeMedia(options);
    const environment = webSetup(media);
    expect(await environment.resolveSessionMode()).toBe(mode);
    expect(media.opened).toBe(opened);
    // AC-4-146 — 판정이 연 스트림은 판정이 끝나기 전에 닫힌다 (열린 트랙 0)
    expect(media.released).toBe(opened);
  });

  it('takeConversationNotice — 세션별 처음 한 번만 true (`D4-120` Q15)', () => {
    const { environment } = setup();
    expect(environment.takeConversationNotice('a')).toBe(true);
    expect(environment.takeConversationNotice('a')).toBe(false);
    expect(environment.takeConversationNotice('b')).toBe(true);
  });
});

/**
 * `S4-H3` — 앱 수준 안내 조립: 녹음 중 보류 신호(`D4-120` Q13) · `Try again`(AC-4-149 ③ ④) · Mock 기기 seed(`D4-123`).
 */
describe('notices — 업로드 · 보관 안내 조립 (S4-H3)', () => {
  it('런타임이 없으면 안내 0 · 녹음 중 아님 · 다시 시도는 요청 없이 끝난다', () => {
    const { environment, platform } = setup();
    expect(environment.notices.peek()).toBeNull();
    expect(environment.notices.retention()).toBeNull();
    expect(environment.notices.capturing()).toBe(false);
    expect(environment.notices.retryUploads()).toBe('started');
    expect(platform).not.toHaveBeenCalled();
  });

  it('capturing — recording · paused 동안 true, 컨트롤러를 놓으면 false (구독자에게 알린다)', async () => {
    const { clock, environment } = setup();
    const changes = vi.fn();
    environment.notices.subscribe(changes);
    const recorder = environment.create({
      sessionId: '99999999-9999-4999-8999-000000000010',
      mode: 'recorded',
      readyAt: clock.nowIso(),
      readConsentStatus: () => CONSENTED,
    });
    expect(environment.notices.capturing()).toBe(false);
    await recorder.start();
    expect(recorder.getSnapshot().status).toBe('recording');
    expect(environment.notices.capturing()).toBe(true);
    await recorder.pause();
    expect(environment.notices.capturing()).toBe(true);
    expect(changes).toHaveBeenCalled();
    await recorder.dispose();
    expect(environment.notices.capturing()).toBe(false);
  });

  it('`D4-134` (`VG-H3-02`) — 녹음이 끝나도(`Submit` → completed) 세션 화면을 떠날 때까지 보류를 풀지 않는다', async () => {
    const { clock, environment } = setup();
    const recorder = environment.create({
      sessionId: '99999999-9999-4999-8999-000000000011',
      mode: 'recorded',
      readyAt: clock.nowIso(),
      readConsentStatus: () => CONSENTED,
    });
    await recorder.start();
    expect(environment.notices.capturing()).toBe(true);
    const outcome = await recorder.submit();
    expect(outcome.ok).toBe(true);
    expect(recorder.getSnapshot().status).toBe('completed');
    // 여기서 풀리면 같은 순간 꺼낸 안내를 세션 화면의 `Recording submitted` 가 교체한다 (4~8ms 실측)
    expect(environment.notices.capturing()).toBe(true);
    const changes = vi.fn();
    environment.notices.subscribe(changes);
    await recorder.dispose();
    expect(environment.notices.capturing()).toBe(false);
    expect(changes).toHaveBeenCalled();
  });

  it('`D4-134` — 녹음에 들어가지 않은 ready 화면은 보류하지 않는다 (ready 에서는 앱 Toast 가 뜬다)', async () => {
    const { clock, environment } = setup();
    const recorder = environment.create({
      sessionId: '99999999-9999-4999-8999-000000000012',
      mode: 'recorded',
      readyAt: clock.nowIso(),
      readConsentStatus: () => CONSENTED,
    });
    expect(recorder.getSnapshot().status).toBe('ready');
    expect(environment.notices.capturing()).toBe(false);
    await recorder.dispose();
    expect(environment.notices.capturing()).toBe(false);
  });

  it('retryUploads — 오프라인이면 `offline` · 요청 0 / 온라인이면 큐를 지금 돌린다', async () => {
    const { clock, environment, appState, bundle } = setup();
    const recorder = environment.create({
      sessionId: '99999999-9999-4999-8999-000000000011',
      mode: 'recorded',
      readyAt: clock.nowIso(),
      readConsentStatus: () => null,
    });
    await recorder.dispose();
    appState.setConnectivity('offline');
    const before = bundle.requestLog.entries().length;
    expect(environment.notices.retryUploads()).toBe('offline');
    await Promise.resolve();
    expect(bundle.requestLog.entries().length).toBe(before);

    appState.setConnectivity('online');
    expect(environment.notices.retryUploads()).toBe('started');
  });

  it('seedDevice — 런타임 시작 **전에** 1회 (14일 seed → 시작 보고에 `retention_expired`)', async () => {
    const seedDevice = vi.fn(async ({ store }: DeviceSeedTarget) => {
      await seedStaleRecording(store, 'stale-session', createFixedClock(Date.UTC(2026, 0, 1)));
    });
    const { environment } = setup({ seedDevice });
    environment.warmUp();
    environment.warmUp();
    await vi.waitFor(() => {
      expect(environment.notices.peek()).toBe('retention_expired');
    });
    expect(seedDevice).toHaveBeenCalledOnce();
  });

  it('seedDevice 가 실패해도 런타임은 시작한다 (복구 안내가 난다)', async () => {
    const { clock, environment } = setup({
      seedDevice: async ({ store }) => {
        await seedCrashedRecording(store, 'crashed-session', clock);
        throw new Error('seed broke halfway');
      },
    });
    environment.warmUp();
    await vi.waitFor(() => {
      expect(environment.notices.peek()).toBe('recovered');
    });
  });
});
