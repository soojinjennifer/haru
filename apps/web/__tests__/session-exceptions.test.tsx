/**
 * Stage 4b `S4-H2` — 예외·안내 UI (Plan §13 · AC-4-63 · 64 · 68 · 69 · 70 · 134, 4b Spec §7).
 * `S4-H2F` — 크래시 복구 Toast (AC-4-65, `D4-117`) · 대화 전용 `Submit` 문구 (`D4-118`).
 *
 * `session-recording.test.tsx` 와 같은 조립(실제 provider 순서 + Mock 녹음기 + 메모리 저장소 + 수동 시계) 위에서
 * Mock scenario 로 사건을 낸다. 요청 증거 = Mock 요청 로그, 로컬 증거 = Mock 저장소 파일 수,
 * 연결 신호 = harness 의 Mock `AppStatePort`.
 * 기하(공지 슬롯이 Figma 요소를 움직이지 않음 · 압축 시 Toast)는 `e2e/session-exceptions.spec.ts` 가 덮는다.
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Link, MemoryRouter, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AppProviders } from '../src/app/providers/AppProviders';
import { createSessionRecorderEnvironment } from '../src/app/providers/sessionRecorderEnvironment';
import { AppRoutes } from '../src/app/router';
import { activityDeckCopy } from '../src/features/activity-card-deck';
import { createLocalRecordingStore } from '../src/features/recording';
import { storytimeSessionCopy } from '../src/features/storytime-session';
import { createMockAppStatePort, createMockRecordingPlatform } from '../src/mocks';
import { sessionBody } from '../src/mocks/__tests__/stage4-support';
import { seedCrashedRecording } from '../src/mocks/fixtures/local-recordings';
import { ROUTES, sessionCompletePath, sessionPath } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { createSystemClock } from '../src/shared/lib/clock';
import { createIdempotencyKey } from '../src/shared/lib/idempotency';
import { createSystemScheduler } from '../src/shared/lib/scheduler';
import { createHarness, type Harness } from '../src/test/harness';
import { createManualScheduler, type ManualScheduler } from '../src/test/manual-scheduler';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const TRANSITIONS = 'POST /v1/sessions/:sessionId/transitions';
const CREATE = 'POST /v1/sessions';
const copy = storytimeSessionCopy;

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

function pathname(): string {
  return screen.getByTestId('pathname').textContent ?? '';
}

function requests(harness: Harness, operation: string): readonly Record<string, unknown>[] {
  return harness.bundle.requestLog
    .entries()
    .filter((entry) => entry.operation === operation)
    .map((entry) => entry.payload as Record<string, unknown>);
}

function transitionTargets(harness: Harness): readonly unknown[] {
  return requests(harness, TRANSITIONS).map((payload) => payload.to);
}

async function flush(): Promise<void> {
  await act(async () => {
    for (let i = 0; i < 20; i += 1) await Promise.resolve();
  });
}

interface Opened {
  harness: Harness;
  time: ManualScheduler;
  sessionId: string;
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

async function waitForHome(): Promise<void> {
  await waitForGuard();
  await waitFor(() => {
    expect(
      document.querySelector('.haru-activity-track:not(.haru-activity-track--skeleton)'),
    ).not.toBeNull();
  });
}

async function startFromHome(): Promise<string> {
  const front = document.querySelector('.haru-activity-card-flip__face--front') as HTMLElement;
  fireEvent.click(
    within(front).getByRole('button', { name: activityDeckCopy.card.startSession.label }),
  );
  const sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.title });
  fireEvent.click(
    within(sheet).getByRole('radio', { name: activityDeckCopy.readingContext.options.bedtime }),
  );
  fireEvent.click(
    within(sheet).getByRole('button', { name: activityDeckCopy.readingContext.confirm }),
  );
  // `QA-4B-005` · `D4-150` — 확인 → 녹음 버튼을 기본 1000ms 창 하나로 기다리지 않는다(부하 시 최대 964ms 실측).
  // 단계마다 기본 창을 따로 준다: ① 세션 생성 → `/session/<id>` 이동 ② 상세 query 대기(pending Spinner) 종료
  // ③ 녹음 버튼. 단언은 그대로다 — 각 단계도 결국 도달해야 하며 timeout 값은 바꾸지 않는다.
  await waitFor(() => {
    expect(pathname()).toMatch(/^\/session\/[^/]+$/);
  });
  await waitFor(() => {
    expect(document.querySelector('.haru-session:not(.haru-session--pending)')).not.toBeNull();
  });
  await screen.findByRole('button', { name: copy.record.start });
  return pathname().split('/').pop() ?? '';
}

/** Home → Start Session → Reading Context → ready. */
async function openReady(scenarios?: readonly string[]): Promise<Opened> {
  const time = createManualScheduler(Date.now());
  const harness = createHarness({
    initialEntries: [ROUTES.home],
    recorderTime: time,
    ...(scenarios === undefined ? {} : { scenarios }),
  });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  await waitForHome();
  const sessionId = await startFromHome();
  return { harness, time, sessionId };
}

function advance(time: ManualScheduler, ms: number): void {
  act(() => {
    time.advance(ms);
  });
}

async function recordFor(opened: Opened, seconds: number): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: copy.record.start }));
  await screen.findByRole('button', { name: copy.record.pause });
  await flush();
  for (let i = 0; i < seconds; i += 1) {
    advance(opened.time, 1_000);
    await flush();
  }
}

function recordControl(): HTMLElement {
  const node = document.querySelector('.haru-record');
  if (!(node instanceof HTMLElement)) throw new Error('no record control');
  return node;
}

function localFiles(opened: Opened): number {
  return opened.harness.recordingStorage()?.controls.files(opened.sessionId).length ?? 0;
}

afterEach(() => {
  cleanup();
  globalThis.localStorage.clear();
});

describe('AC-4-148 · AC-4-134 — 녹음 세션 중 권한 상실: `permission-denied` 변형 + 안내 시트 (4b Spec §7.3 · §18.2 ④)', () => {
  /*
    `S4-H2R` 이후 Start Session 에서 거부되면 처음부터 대화 전용이다(`session-permission.test.tsx`). 녹음 세션의
    거부는 **Start 때 허용 → Record 탭에서 거부**(`mic-permission-revoked`) 경로로만 생긴다.
  */
  it('거부 → 전이 0 · 시트 자동 1회(녹음 세션 문단) · 변형 `permission-denied`(이름 = 시각 라벨 `Mic is off` — `D8-5`)', async () => {
    const opened = await openReady(['recorder:mic-permission-revoked']);
    expect(requests(opened.harness, CREATE)[0]?.mode).toBe('recorded');
    fireEvent.click(screen.getByRole('button', { name: copy.record.start }));

    const sheet = await screen.findByRole('dialog', { name: copy.micSheet.title });
    expect(within(sheet).getByText(copy.micSheet.description)).toBeTruthy();
    expect(within(sheet).queryByText(copy.micSheet.conversationDescription)).toBeNull();
    // `D4-119` CP-11 — 버튼은 `Not now` 하나 (`Talk without recording` 폐기)
    expect(
      within(sheet)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toStrictEqual([copy.micSheet.notNow]);

    const control = recordControl();
    expect(control.classList.contains('haru-record--permission-denied')).toBe(true);
    expect(control.getAttribute('aria-label')).toBe(copy.record.micOff);
    expect(control.getAttribute('aria-haspopup')).toBe('dialog');
    expect(control.textContent).toContain(copy.record.micOffCaption);
    expect(transitionTargets(opened.harness)).toStrictEqual([]);
    expect(localFiles(opened)).toBe(0);
    // AC-4-148 ① — 세션 생성 · 모드 전환 요청 0 (생성은 Start Session 의 1건뿐)
    expect(requests(opened.harness, CREATE)).toHaveLength(1);
  });

  it('`Not now` → 닫힘 · 포커스 = Record Control · 요청 0 · 변형 탭 → 시트 다시 (녹음 시도 0)', async () => {
    const opened = await openReady(['recorder:mic-permission-revoked']);
    fireEvent.click(screen.getByRole('button', { name: copy.record.start }));
    const sheet = await screen.findByRole('dialog', { name: copy.micSheet.title });
    fireEvent.click(within(sheet).getByRole('button', { name: copy.micSheet.notNow }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();
    });
    expect(document.activeElement).toBe(recordControl());

    fireEvent.click(screen.getByRole('button', { name: copy.record.micOff }));
    await screen.findByRole('dialog', { name: copy.micSheet.title });
    await flush();
    expect(transitionTargets(opened.harness)).toStrictEqual([]);
    // 바 = ready 그대로(둘 다 비활성) — 녹음 세션은 대화 전용으로 바뀌지 않았다
    const bar = screen.getByRole('group', { name: copy.actions.groupLabel });
    for (const button of within(bar).getAllByRole('button')) {
      expect(button.getAttribute('aria-disabled')).toBe('true');
    }
  });
});

describe('AC-4-134 — `disabled` 변형: 동의 없음', () => {
  it('서버 `CONSENT_REQUIRED` → `disabled`(이름 = `Tap to recording, Start recording` — `D8-3`, 사유 연결) · 탭 → 추가 요청 0', async () => {
    const opened = await openReady(['sessions:consent-missing']);
    fireEvent.click(screen.getByRole('button', { name: copy.record.start }));
    await waitFor(() => {
      expect(recordControl().classList.contains('haru-record--disabled')).toBe(true);
    });
    const control = recordControl();
    expect(control.getAttribute('aria-label')).toBe(copy.record.start);
    expect(control.getAttribute('aria-disabled')).toBe('true');
    const reason = document.getElementById(control.getAttribute('aria-describedby') ?? '');
    expect(reason?.textContent).toBe(copy.record.consentReason);

    const before = transitionTargets(opened.harness).length;
    fireEvent.click(control);
    await flush();
    expect(transitionTargets(opened.harness)).toHaveLength(before);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('`D4-44` · `D4-58` CP-6 — 대화 전용 ready', () => {
  async function openConversation(): Promise<Opened> {
    const time = createManualScheduler(Date.now());
    const harness = createHarness({ initialEntries: [ROUTES.home], recorderTime: time });
    await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
    const me = await harness.bundle.clients.me.get();
    const childId = me.child?.id ?? '';
    const created = await harness.bundle.clients.sessions.create(
      {
        body: {
          childId,
          mode: 'conversation_only',
          activityCardOptionId: null,
          bookId: null,
          childBookId: null,
          readingContext: 'bedtime',
          clientSessionKey: createIdempotencyKey(),
          readyAt: new Date().toISOString(),
        },
      },
      { idempotencyKey: createIdempotencyKey() },
    );
    const sessionId = created.session.id;
    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <LocationProbe />
        <Link to={sessionPath(sessionId)}>open</Link>
        <AppRoutes />
      </Wrapper>,
    );
    await waitForHome();
    fireEvent.click(screen.getByRole('link', { name: 'open' }));
    // `D4-153` — 이동 → 상세 query 대기(pending Spinner) → 녹음 버튼을 한 창에 몰지 않는다 (`D4-150` 과 같은 단계).
    await waitFor(() => {
      expect(pathname()).toBe(sessionPath(sessionId));
    });
    await waitFor(() => {
      expect(document.querySelector('.haru-session:not(.haru-session--pending)')).not.toBeNull();
    });
    await screen.findByRole('button', { name: copy.record.micOff });
    return { harness, time, sessionId };
  }

  it('Record = `permission-denied` · `Submit` 활성 · `Discard` 비활성(사유) · Record 탭 → 안내 시트, 전이 0 (`D4-118` 시트 유지)', async () => {
    const opened = await openConversation();
    const bar = screen.getByRole('group', { name: copy.actions.groupLabel });
    const submit = within(bar).getByRole('button', { name: copy.actions.submit });
    const discard = within(bar).getByRole('button', { name: copy.actions.discard });
    expect(submit.hasAttribute('aria-disabled')).toBe(false);
    expect(discard.getAttribute('aria-disabled')).toBe('true');
    const reason = document.getElementById(discard.getAttribute('aria-describedby') ?? '');
    expect(reason?.textContent).toBe(copy.actions.conversationReason);

    // 첫 진입 = 시트 자동 1회 (`S4-H2R`, AC-4-147 — `session-permission.test.tsx`). 닫고 Record 를 누른다.
    const entry = await screen.findByRole('dialog', { name: copy.micSheet.title });
    fireEvent.click(within(entry).getByRole('button', { name: copy.micSheet.notNow }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();
    });

    const control = screen.getByRole('button', { name: copy.record.micOff });
    expect(control.getAttribute('aria-haspopup')).toBe('dialog');
    fireEvent.click(control);
    // 녹음 세션의 거부 시트와 같은 시트 — 같은 제목 · `Not now` (`D4-118`), 문단만 대화 전용 변형(§18.2 ③)
    const sheet = await screen.findByRole('dialog', { name: copy.micSheet.title });
    expect(within(sheet).getByText(copy.micSheet.conversationDescription)).toBeTruthy();
    expect(within(sheet).getByRole('button', { name: copy.micSheet.notNow })).toBeTruthy();
    fireEvent.click(discard);
    await flush();
    expect(transitionTargets(opened.harness)).toStrictEqual([]);
    expect(localFiles(opened)).toBe(0);
  });

  it('`Submit` → `ready → completed(user_done)` 1건(recordedSeconds 없음) → 완료 화면', async () => {
    const opened = await openConversation();
    fireEvent.click(screen.getByRole('button', { name: copy.actions.submit }));
    await waitFor(() => {
      expect(pathname()).toBe(sessionCompletePath(opened.sessionId));
    });
    const sent = requests(opened.harness, TRANSITIONS);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toBe('completed');
    expect(sent[0]?.completedReason).toBe('user_done');
    expect('recordedSeconds' in (sent[0] ?? {})).toBe(false);
    // `D4-118` — 녹음이 없으므로 `Recording submitted` 가 아니라 별도 문구
    expect(await screen.findByText(copy.conversationSubmitted)).toBeTruthy();
    expect(screen.queryByText(copy.submitted)).toBeNull();
  });
});

describe('AC-4-65 · `D4-117` — 크래시 복구 안내 = 앱 시작 후 Toast 1회', () => {
  /**
   * 직전 실행이 녹음 중에 죽은 기기 — Mock 서버 세션 `recording` + 로컬에 `endPart` 없는 part 1개.
   * 앱 조립은 실제와 같다(`createSessionRecorderEnvironment` + Mock 플랫폼 + `AppProviders`). 다른 점은 저장소를
   * 미리 채워 두는 것 하나다 — 브라우저 scenario(`recorder:crash-recovered`) → seed 연결은 아직 없다 (handoff H2F-5).
   */
  async function bootAfterCrash(options: { crashed: boolean }) {
    const harness = createHarness({ initialEntries: [ROUTES.home] });
    await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
    const clock = createSystemClock();
    const scheduler = createSystemScheduler();
    const platform = createMockRecordingPlatform({ store: harness.bundle.store, clock, scheduler });
    if (options.crashed) {
      const { session } = await harness.bundle.clients.sessions.create(
        {
          body: sessionBody({
            clientSessionKey: createIdempotencyKey(),
            readyAt: new Date().toISOString(),
          }),
        },
        { idempotencyKey: createIdempotencyKey() },
      );
      await harness.bundle.clients.sessions.transition(
        { sessionId: session.id, body: { to: 'recording', occurredAt: new Date().toISOString() } },
        { idempotencyKey: createIdempotencyKey() },
      );
      const seedTarget = createLocalRecordingStore({
        bytes: platform.storage.bytes,
        kv: platform.storage.kv,
        persistence: platform.storage.persistence,
        clock,
      });
      await seedCrashedRecording(seedTarget, session.id, clock);
    }
    const environment = createSessionRecorderEnvironment({
      clients: harness.bundle.clients,
      clock,
      scheduler,
      wipeDevice: () => Promise.resolve(),
      platform: () => ({
        createRecorder: platform.createRecorder,
        storage: platform.storage,
        appState: createMockAppStatePort(),
      }),
    });
    return { harness, environment };
  }

  function mount(booted: Awaited<ReturnType<typeof bootAfterCrash>>): void {
    const { harness, environment } = booted;
    render(
      <MemoryRouter initialEntries={[ROUTES.home]}>
        <AppProviders
          clients={harness.bundle.clients}
          authGateway={harness.bundle.authGateway}
          queryClient={harness.queryClient}
          sessionRecorder={environment}
        >
          <LocationProbe />
          <AppRoutes />
        </AppProviders>
      </MemoryRouter>,
    );
  }

  function recoveredTransitions(harness: Harness): readonly unknown[] {
    return requests(harness, TRANSITIONS)
      .filter((body) => body.to === 'completed')
      .map((body) => body.completedReason);
  }

  it('복구 1건 → Toast 1회(`neutral`) · 전이 `completed(recovered_after_crash)` · 다시 마운트해도 0', async () => {
    const booted = await bootAfterCrash({ crashed: true });
    mount(booted);
    await waitForHome();
    booted.environment.warmUp();

    const message = await screen.findByText(copy.recovered);
    expect(screen.getAllByText(copy.recovered)).toHaveLength(1);
    expect(message.closest('.haru-toast--neutral')).not.toBeNull();
    await waitFor(() => {
      expect(recoveredTransitions(booted.harness)).toStrictEqual(['recovered_after_crash']);
    });

    // 앱 실행당 1회 — 화면 트리를 다시 붙여도(같은 실행) 다시 뜨지 않는다.
    cleanup();
    mount(booted);
    await waitForHome();
    await flush();
    expect(screen.queryByText(copy.recovered)).toBeNull();
  });

  it('복구가 화면보다 먼저 끝나도 화면이 붙을 때 1회', async () => {
    const booted = await bootAfterCrash({ crashed: true });
    booted.environment.warmUp();
    await waitFor(() => {
      expect(recoveredTransitions(booted.harness)).toHaveLength(1);
    });
    mount(booted);
    await waitForGuard();
    expect(await screen.findByText(copy.recovered)).toBeTruthy();
  });

  it('복구 0건 → Toast 0 · 전이 0', async () => {
    const booted = await bootAfterCrash({ crashed: false });
    mount(booted);
    await waitForHome();
    booted.environment.warmUp();
    await flush();
    await flush();
    expect(screen.queryByText(copy.recovered)).toBeNull();
    expect(requests(booted.harness, TRANSITIONS)).toHaveLength(0);
  });
});

describe('AC-4-70 — Web 백그라운드 경고 (`D4-26` 조건 없는 안내, 공지 슬롯 `InlineAlert info`)', () => {
  it('녹음 중 탭이 숨겨지면 공지 1개 · 녹음 계속(전이 = recording 뿐) · `Dismiss` → 사라짐', async () => {
    const opened = await openReady(['recorder:web-background-warning']);
    expect(screen.queryByText(copy.notices.background.title)).toBeNull();
    await recordFor(opened, 5);

    const alert = await screen.findByRole('status', {
      name: (_, node) => node.textContent.includes(copy.notices.background.title),
    });
    expect(alert.closest('.haru-session__notice')).not.toBeNull();
    expect(alert.textContent).toContain(copy.notices.background.description);
    expect(screen.getByRole('button', { name: copy.record.pause })).toBeTruthy();
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording']);

    fireEvent.click(within(alert).getByRole('button', { name: copy.notices.dismiss }));
    expect(screen.queryByText(copy.notices.background.title)).toBeNull();
  });

  it('기본 scenario 에서는 공지 0', async () => {
    const opened = await openReady();
    await recordFor(opened, 5);
    expect(screen.queryByText(copy.notices.background.title)).toBeNull();
  });
});

describe('4b Spec §7.1 — 세션 화면 오프라인 Toast (끊김 1회 + 복구 1회)', () => {
  it('ready · recording 에서 연결이 바뀔 때만 Toast · 레이아웃 노드 불변', async () => {
    const opened = await openReady();
    const appState = opened.harness.appState();
    if (appState === null) throw new Error('recording platform is not open');
    const record = recordControl();

    act(() => {
      appState.setConnectivity('offline');
    });
    expect(await screen.findByText(copy.connectivity.offline)).toBeTruthy();
    act(() => {
      appState.setConnectivity('offline'); // 같은 값 — 알리지 않는다
    });
    act(() => {
      appState.setConnectivity('online');
    });
    // Toast 는 한 번에 하나다 — 복구 Toast 가 끊김 Toast 를 대신한다.
    expect(await screen.findByText(copy.connectivity.online)).toBeTruthy();
    expect(screen.queryByText(copy.connectivity.offline)).toBeNull();
    expect(recordControl()).toBe(record);

    // recording 에서도 같다
    await recordFor(opened, 1);
    act(() => {
      appState.setConnectivity('offline');
    });
    expect(await screen.findByText(copy.connectivity.offline)).toBeTruthy();
    expect(screen.getByRole('button', { name: copy.record.pause })).toBeTruthy();
  });
});

describe('AC-4-64 — 30분 자동 종료 → 안내 + 완료 화면', () => {
  it('누적 30분 → `completed(auto_timeout)` 1건(1800s) · Toast(`30:00`) · 완료 화면', async () => {
    const opened = await openReady();
    await recordFor(opened, 1);
    // 로컬 녹음은 업로드 확정 전까지 남는다 — 자동 종료 직전에 이미 파일이 있다 (완료 뒤 Mock 업로드가 확정하면 정리된다)
    expect(localFiles(opened)).toBeGreaterThan(0);
    advance(opened.time, 1_799_000);
    await flush();
    await waitFor(() => {
      expect(pathname()).toBe(sessionCompletePath(opened.sessionId));
    });
    expect(await screen.findByText(copy.autoTimeout('30:00'))).toBeTruthy();
    expect(screen.queryByText(copy.submitted)).toBeNull();
    const completed = requests(opened.harness, TRANSITIONS).filter(
      (body) => body.to === 'completed',
    );
    expect(completed).toHaveLength(1);
    expect(completed[0]?.completedReason).toBe('auto_timeout');
    expect(completed[0]?.recordedSeconds).toBe(1800);
  });
});

describe('AC-4-68 — 인터럽션 3종: paused 화면 + 로컬 청크 보존 + 재개', () => {
  for (const cause of ['visibilitychange', 'devicechange', 'track-ended'] as const) {
    it(`\`${cause}\` → paused(재개 안내 문구) · 파일 유지 · Resume → recording`, async () => {
      const opened = await openReady([`recorder.${cause}:recording-interrupted`]);
      await recordFor(opened, 5);
      await screen.findByRole('button', { name: copy.record.resume });
      expect(screen.getByText(copy.status.pausedHint)).toBeTruthy();
      const files = localFiles(opened);
      expect(files).toBeGreaterThan(0);
      expect(transitionTargets(opened.harness)).toStrictEqual(['recording', 'paused']);

      fireEvent.click(screen.getByRole('button', { name: copy.record.resume }));
      await screen.findByRole('button', { name: copy.record.pause });
      await flush();
      expect(localFiles(opened)).toBeGreaterThanOrEqual(files);
      expect(transitionTargets(opened.harness)).toStrictEqual(['recording', 'paused', 'recording']);
    });
  }
});

describe('AC-4-69 — `abandoned` 이후 새 세션', () => {
  it('ready 10분 방치 → 홈 · 다시 Start Session → 새 세션 id (생성 요청 2건)', async () => {
    const opened = await openReady();
    // 방치 기준 = 서버 `readyAt`(실제 시각) — 수동 시계는 harness 생성 시각에서 출발하므로 여유를 둔다
    advance(opened.time, 620_000);
    await flush();
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    expect(transitionTargets(opened.harness)).toStrictEqual(['abandoned']);

    await waitForHome();
    const next = await startFromHome();
    expect(next).not.toBe(opened.sessionId);
    expect(requests(opened.harness, CREATE)).toHaveLength(2);
  });
});
