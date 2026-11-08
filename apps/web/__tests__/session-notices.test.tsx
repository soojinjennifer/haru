/**
 * Stage 4b `S4-H3` — 업로드 · 48h · 7일 · 14일 안내 화면 (Plan §13.4 · AC-4-149 ~ 153 · AC-4-30 · 32 · 67 화면 부분,
 * 4b Spec §18.3 ~ §18.5, `D4-119` CP-12 ~ 14 · `D4-120` Q10 ~ Q14) + `D4-123` 브라우저 Mock 기기 seed.
 *
 * 두 층으로 본다.
 * ① Toast 순차 · 녹음 중 보류 · `Try again` — `RecordingNoticeToasts` 를 **가짜 안내 상태** 위에 올려 시간(가짜 타이머)을
 *    정확히 넘긴다. 순서 자체(14일 → 48h → 복구)는 런타임 단위 테스트(`recording-notices.test.ts`)가 실제 경로로 본다.
 * ② 실제 조립 — 앱 조립(`createSessionRecorderEnvironment` + Mock 플랫폼 + `AppProviders` + 라우터)에 **브라우저와 같은
 *    seed 함수**(`applyRecordingDeviceSeed`)를 넣고 앱 시작 안내 · Home 배너 · 오프라인 배너 우선을 본다.
 * 기하(배너 밀림 · 줄 수)는 `e2e/session-notices.spec.ts` 가 덮는다.
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ToastProvider, useToast } from '@haru/ui';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppProviders } from '../src/app/providers/AppProviders';
import { createSessionRecorderEnvironment } from '../src/app/providers/sessionRecorderEnvironment';
import { AppRoutes } from '../src/app/router';
import { activityDeckCopy } from '../src/features/activity-card-deck';
import { homeOverviewCopy } from '../src/features/home-overview';
import {
  SessionRecorderProvider,
  type RecordingAppNotice,
  type SessionRecorderEnvironment,
  type SessionRecorderNotices,
} from '../src/entities/session';
import { RecordingNoticeToasts, storytimeSessionCopy } from '../src/features/storytime-session';
import {
  applyActivityCardCacheSeed,
  applyRecordingDeviceSeed,
  createMockAppStatePort,
  createMockRecordingPlatform,
  MOCK_DEVICE_SEED_SESSION_IDS,
  MOCK_NOTICE_AGE_MS,
  type MockAppStatePort,
  type MockRecordingPlatform,
} from '../src/mocks';
import { createScenarioSource, createScenarioStore } from '../src/mocks/scenarios';
import { ROUTES } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { createSystemClock } from '../src/shared/lib/clock';
import { formatMonthDay } from '../src/shared/lib/date-format';
import { createSystemScheduler } from '../src/shared/lib/scheduler';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const INIT = 'POST /v1/sessions/:sessionId/recordings';
const copy = storytimeSessionCopy;
const DAY_MS = 24 * 60 * 60 * 1000;

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  globalThis.localStorage.clear();
});

// ── ① Toast 순차 · 보류 · Try again (가짜 안내 상태) ──

interface FakeNotices extends SessionRecorderNotices {
  queue: RecordingAppNotice[];
  setCapturing(value: boolean): void;
  retried: number;
  online: boolean;
}

function fakeNotices(initial: RecordingAppNotice[]): FakeNotices {
  const listeners = new Set<() => void>();
  let capturing = false;
  const emit = () => {
    for (const listener of [...listeners]) listener();
  };
  const notices: FakeNotices = {
    queue: [...initial],
    retried: 0,
    online: true,
    peek: () => notices.queue[0] ?? null,
    take() {
      const next = notices.queue.shift() ?? null;
      emit();
      return next;
    },
    retention: () => null,
    dismissRetention: () => Promise.resolve(),
    capturing: () => capturing,
    retryUploads() {
      if (!notices.online) return 'offline';
      notices.retried += 1;
      return 'started';
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setCapturing(value) {
      capturing = value;
      emit();
    },
  };
  return notices;
}

function environmentWith(notices: SessionRecorderNotices): SessionRecorderEnvironment {
  const unused = (): never => {
    throw new Error('not used in this test');
  };
  return {
    create: unused,
    clearLocalRecordings: () => Promise.resolve(),
    notices,
    resolveSessionMode: () => Promise.resolve('recorded'),
    takeConversationNotice: () => false,
  };
}

let showOther: ((message: string) => void) | null = null;

function OtherToast() {
  const toast = useToast();
  useEffect(() => {
    showOther = (message) => {
      toast.show({ message, tone: 'neutral' });
    };
  }, [toast]);
  return null;
}

function renderToasts(notices: SessionRecorderNotices): void {
  render(
    <SessionRecorderProvider environment={environmentWith(notices)}>
      <ToastProvider>
        <OtherToast />
        <RecordingNoticeToasts />
      </ToastProvider>
    </SessionRecorderProvider>,
  );
}

function toasts(): string[] {
  return [...document.querySelectorAll('.haru-toast')].map((node) => node.textContent ?? '');
}

/**
 * 시간을 100ms 씩 넘긴다 — 각 걸음을 `act` 로 감싸야 React 가 그 사이에 렌더해 다음 타이머(퇴장 모션 등)를 건다.
 */
function passToast(ms = 6_500): void {
  for (let passed = 0; passed < ms; passed += 100) {
    act(() => {
      vi.advanceTimersByTime(Math.min(100, ms - passed));
    });
  }
}

describe('AC-4-153 ③ · `D4-120` Q14 — 앱 Toast 는 한 번에 1개, 앞 Toast 가 사라진 뒤 다음', () => {
  it('14일 → 48h → 크래시 복구 · 동시에 2개 0 · 꺼낸 안내는 다시 나오지 않는다', () => {
    vi.useFakeTimers();
    const notices = fakeNotices(['retention_expired', 'upload_stalled', 'recovered']);
    renderToasts(notices);

    expect(toasts()).toStrictEqual([copy.uploads.retentionExpired]);
    passToast(4_000 - 1);
    expect(toasts()).toStrictEqual([copy.uploads.retentionExpired]);
    passToast(1_000);
    expect(toasts()).toHaveLength(1);
    expect(toasts()[0]).toContain(copy.uploads.stalled);
    passToast();
    expect(toasts()).toStrictEqual([copy.recovered]);
    passToast();
    expect(toasts()).toStrictEqual([]);
    expect(notices.queue).toStrictEqual([]);
  });

  it('다른 화면의 Toast 가 떠 있으면 기다린다 (교체하지 않는다)', () => {
    vi.useFakeTimers();
    const notices = fakeNotices([]);
    renderToasts(notices);
    act(() => {
      showOther?.('Something else');
    });
    act(() => {
      notices.queue.push('recovered');
      notices.setCapturing(false);
    });
    expect(toasts()).toStrictEqual(['Something else']);
    passToast(4_500);
    expect(toasts()).toStrictEqual([copy.recovered]);
  });
});

describe('`D4-120` Q13 — 녹음 중(recording · paused)에는 앱 Toast 를 보류한다', () => {
  it('보류 중 0 → 녹음 화면을 떠나면 그때 1회', () => {
    vi.useFakeTimers();
    const notices = fakeNotices([]);
    act(() => {
      notices.setCapturing(true);
    });
    renderToasts(notices);
    act(() => {
      notices.queue.push('upload_stalled');
      notices.setCapturing(true);
    });
    passToast(60_000);
    expect(toasts()).toStrictEqual([]);
    expect(notices.queue).toStrictEqual(['upload_stalled']);

    act(() => {
      notices.setCapturing(false);
    });
    expect(toasts()).toHaveLength(1);
    expect(notices.queue).toStrictEqual([]);
  });
});

describe('AC-4-149 ②③④⑤ — 48h Toast: `neutral` + `Try again` + 닫기', () => {
  it('tone neutral · 문구에 failed/error 0 · `Dismiss` 버튼 · `Try again` → 큐 1회 + Toast 닫힘 · 성공 Toast 0', () => {
    vi.useFakeTimers();
    const notices = fakeNotices(['upload_stalled']);
    renderToasts(notices);
    const toast = document.querySelector('.haru-toast') as HTMLElement;
    expect(toast.classList.contains('haru-toast--neutral')).toBe(true);
    expect(copy.uploads.stalled).not.toMatch(/fail|error/i);
    expect(within(toast).getByRole('button', { name: copy.notices.dismiss })).toBeTruthy();

    fireEvent.click(within(toast).getByRole('button', { name: copy.states.retry }));
    expect(notices.retried).toBe(1);
    passToast(1_000);
    expect(toasts()).toStrictEqual([]);
  });

  it('오프라인에서 `Try again` → 요청 0 + 오프라인 안내 1회 (`connectivity.offline` 재사용)', () => {
    vi.useFakeTimers();
    const notices = fakeNotices(['upload_stalled']);
    notices.online = false;
    renderToasts(notices);
    const toast = document.querySelector('.haru-toast') as HTMLElement;
    fireEvent.click(within(toast).getByRole('button', { name: copy.states.retry }));
    expect(notices.retried).toBe(0);
    expect(toasts()).toStrictEqual([copy.connectivity.offline]);
  });

  it('14일 Toast 는 action 0 · neutral · failed/error 0', () => {
    vi.useFakeTimers();
    renderToasts(fakeNotices(['retention_expired']));
    const toast = document.querySelector('.haru-toast') as HTMLElement;
    expect(toast.classList.contains('haru-toast--neutral')).toBe(true);
    expect(within(toast).queryAllByRole('button')).toHaveLength(0);
    expect(copy.uploads.retentionExpired).not.toMatch(/fail|error/i);
  });
});

// ── ② 실제 조립 + 브라우저와 같은 seed (`D4-123`) ──

interface Booted {
  harness: Harness;
  environment: ReturnType<typeof createSessionRecorderEnvironment>;
  platform: () => MockRecordingPlatform | null;
  appState: MockAppStatePort;
}

function boot(scenarios: readonly string[]): Booted {
  const harness = createHarness({ initialEntries: [ROUTES.home], scenarios });
  const clock = createSystemClock();
  const scheduler = createSystemScheduler();
  const appState = createMockAppStatePort();
  let platform: MockRecordingPlatform | null = null;
  const environment = createSessionRecorderEnvironment({
    clients: harness.bundle.clients,
    clock,
    scheduler,
    wipeDevice: () => Promise.resolve(),
    platform: () => {
      platform = createMockRecordingPlatform({ store: harness.bundle.store, clock, scheduler });
      return {
        createRecorder: platform.createRecorder,
        storage: platform.storage,
        appState,
      };
    },
    // 브라우저 조립(`apiClients.ts`)과 같은 seed
    seedDevice: (target) =>
      applyRecordingDeviceSeed({
        scenarios: harness.bundle.store,
        sessionState: harness.bundle.sessionState,
        serverClock: harness.bundle.clock,
        deviceClock: clock,
        target: target.store,
        kv: target.kv,
      }),
  });
  return { harness, environment, platform: () => platform, appState };
}

/**
 * `QA-4B-006` · `D4-153` — 첫 화면을 기본 1000ms 창 하나로 기다리지 않는다. 진입 직후 Route Guard 가 `me`
 * 조회 동안 Spinner 를 그리고, 판정이 끝나야 화면이 마운트된다(+ 화면 query). 단계마다 기본 창을 따로 준다:
 * ① 여기 = Guard 판정 종료 ② 각 테스트의 원래 대기. 단언은 그대로이고 timeout 값은 바꾸지 않는다.
 * 세션 화면의 상세 대기 Spinner(`.haru-session--pending`)도 이름이 `Loading` 이라 Guard 의 것만 센다.
 */
async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(
      screen
        .queryAllByRole('status', { name: appCopy.guard.loadingLabel })
        .filter((node) => node.closest('.haru-session') === null),
    ).toHaveLength(0);
  });
}

async function mount(booted: Booted): Promise<void> {
  await booted.harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  render(
    <MemoryRouter initialEntries={[ROUTES.home]}>
      <AppProviders
        clients={booted.harness.bundle.clients}
        authGateway={booted.harness.bundle.authGateway}
        queryClient={booted.harness.queryClient}
        sessionRecorder={booted.environment}
      >
        <AppRoutes />
      </AppProviders>
    </MemoryRouter>,
  );
  await waitForGuard();
  await waitFor(() => {
    expect(
      document.querySelector('.haru-activity-track:not(.haru-activity-track--skeleton)'),
    ).not.toBeNull();
  });
}

/** 업로드 경로 요청 수 (init · 토큰 재발급 · 바이트 전송 · 확정). */
function uploadRequests(harness: Harness): number {
  return harness.bundle.requestLog
    .entries()
    .filter((entry) => /recordings|upload-tokens|TUS/.test(entry.operation)).length;
}

function requests(harness: Harness, operation: string): number {
  return harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation)
    .length;
}

describe('`D4-123` — 브라우저 seed 로 앱 시작 안내를 재현한다', () => {
  it('`recorder:crash-recovered` → 복구 Toast 1회 (AC-4-65 — 이전에는 unit 선 seed 로만 재현)', async () => {
    const booted = boot(['recorder:crash-recovered']);
    await mount(booted);
    booted.environment.warmUp();
    expect(await screen.findByText(copy.recovered)).toBeTruthy();
  });

  it('`recorder:local-retention-exceeded` → 14일 Toast 1회 · 로컬 파일 0 · 서버 요청 0 (AC-4-151 ①②③)', async () => {
    const booted = boot(['recorder:local-retention-exceeded']);
    await mount(booted);
    const before = booted.harness.bundle.requestLog.entries().length;
    booted.environment.warmUp();
    expect(await screen.findByText(copy.uploads.retentionExpired)).toBeTruthy();
    expect(await booted.platform()?.storage.bytes.countFiles()).toBe(0);
    const after = booted.harness.bundle.requestLog
      .entries()
      .slice(before)
      .map((entry) => entry.operation);
    expect(after.filter((operation) => /recordings|transitions|TUS/.test(operation))).toEqual([]);
  });

  it('`recordings:upload-stalled-48h` → 48h Toast · `Try again` → 업로드 요청 +1 · 로컬 파일 보존 (AC-4-149 ③)', async () => {
    const booted = boot(['recordings:upload-stalled-48h']);
    await mount(booted);
    booted.environment.warmUp();
    const message = await screen.findByText(copy.uploads.stalled);
    const toast = message.closest('.haru-toast') as HTMLElement;
    // 시작 직후 큐의 첫 시도가 끝날 때까지 기다린다 (seed 항목 `nextAttemptAtMs` = 지금)
    await waitFor(() => {
      expect(requests(booted.harness, INIT)).toBeGreaterThan(0);
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    // 첫 시도에서 `init` 은 끝났다(recordingId 기록) — 이후 시도는 토큰 재발급·전송부터 다시 한다
    const before = uploadRequests(booted.harness);
    fireEvent.click(within(toast).getByRole('button', { name: copy.states.retry }));
    await waitFor(() => {
      expect(uploadRequests(booted.harness)).toBeGreaterThan(before);
    });
    await waitFor(() => {
      expect(document.querySelector('.haru-toast')).toBeNull();
    });
    expect(await booted.platform()?.storage.bytes.countFiles()).toBeGreaterThan(0);
  });
});

describe('AC-4-150 — Home 7일 보관 배너 (`D4-120` Q10 · Q11 · Q12)', () => {
  it('제목 한 문장(절대 날짜) + 닫기 · `Try again` 0 · `role="alert"` · Home 헤더 슬롯', async () => {
    const booted = boot(['recorder:local-retention-notice']);
    await mount(booted);
    booted.environment.warmUp();
    const now = Date.now();
    const deleteAt = now - MOCK_NOTICE_AGE_MS + 14 * DAY_MS;
    const title = copy.uploads.retentionNotice(formatMonthDay(deleteAt, now));
    const text = await screen.findByText(title);
    const banner = text.closest('.haru-alert') as HTMLElement;
    expect(banner.classList.contains('haru-alert--warning')).toBe(true);
    expect(banner.classList.contains('haru-alert--banner')).toBe(true);
    expect(banner.getAttribute('role')).toBe('alert');
    expect(banner.closest('.haru-app-shell__bar-top')).not.toBeNull();
    expect(
      within(banner)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label')),
    ).toEqual([copy.notices.dismiss]);
    expect(title).toMatch(/[A-Z][a-z]{2} \d{1,2}/);
    expect(title).not.toMatch(/in \d+ days|fail|error/i);
  });

  it('닫기 → 사라짐 · 레코드에 닫기 기록 · 화면을 다시 붙여도 0 (AC-4-153 ①)', async () => {
    const booted = boot(['recorder:local-retention-notice']);
    await mount(booted);
    booted.environment.warmUp();
    const banner = (await screen.findByRole('alert')).closest('.haru-alert') as HTMLElement;
    fireEvent.click(within(banner).getByRole('button', { name: copy.notices.dismiss }));
    await waitFor(() => {
      expect(document.querySelector('.haru-alert--warning')).toBeNull();
    });
    const stored = await booted
      .platform()
      ?.storage.kv.get('recordings', MOCK_DEVICE_SEED_SESSION_IDS.notice);
    expect((stored as { retentionDismissedAtMs?: number }).retentionDismissedAtMs).toBeTypeOf(
      'number',
    );

    cleanup();
    await mount(booted);
    await act(async () => {
      for (let index = 0; index < 20; index += 1) await Promise.resolve();
    });
    expect(document.querySelector('.haru-alert--warning')).toBeNull();
  });

  it('`D4-134` (`VG-H3-04`) — 닫기 버튼에서 닫으면 포커스는 `BODY` 가 아니라 배너 다음 Tab 대상(버블 닫기)', async () => {
    const booted = boot(['recorder:local-retention-notice']);
    await mount(booted);
    booted.environment.warmUp();
    const banner = (await screen.findByRole('alert')).closest('.haru-alert') as HTMLElement;
    const close = within(banner).getByRole('button', { name: copy.notices.dismiss });
    close.focus();
    fireEvent.click(close);
    await waitFor(() => {
      expect(document.querySelector('.haru-alert--warning')).toBeNull();
    });
    const focused = document.activeElement as HTMLElement;
    expect(focused).not.toBe(document.body);
    expect(focused.getAttribute('aria-label')).toBe(homeOverviewCopy.bubbleDismiss);
    expect(focused.closest('.haru-app-shell__bar-top')).toBeNull();
  });

  it('오프라인 캐시 배너가 있으면 그것만 (같은 슬롯 1개 · 오프라인 우선, Q11)', async () => {
    applyActivityCardCacheSeed({
      store: createScenarioStore([
        createScenarioSource('url', { 'activity-cards': 'offline-cached-card' }),
      ]),
      // 기기 시계 = 이 테스트의 시스템 시계 (캐시 신선도 판정이 같은 시계를 본다)
      deviceClock: createSystemClock(),
    });
    const booted = boot(['activity-cards:offline-cached-card', 'recorder:local-retention-notice']);
    await mount(booted);
    booted.environment.warmUp();
    expect(await screen.findByText(activityDeckCopy.states.cachedTitle)).toBeTruthy();
    // 7일 상태는 계산돼 있다 — 슬롯만 오프라인 배너가 쓴다 (닫기 기록 소비 0)
    await waitFor(() => {
      expect(booted.environment.notices.retention()).not.toBeNull();
    });
    expect(document.querySelectorAll('.haru-alert--banner')).toHaveLength(1);
    expect(document.querySelector('.haru-alert--warning')).toBeNull();
  });
});
