/**
 * Stage 4b `S4-H2R` — Start Session 전 마이크 권한 판정 → 대화 전용 세션 (Plan §13.3 · AC-4-63(재정의) ·
 * AC-4-145 · AC-4-147 · AC-4-148, 4b Spec §18.2, `D4-112` · `D4-119` CP-8~11 · `D4-120` Q15·Q16).
 * `D4-121` — 세션 화면 Toast 가 상단 줄 아래로 내려간다 (기하는 `e2e/session-exceptions.spec.ts`).
 *
 * 실제 provider 순서 + Mock 녹음기(권한 상태는 플랫폼 하나에 하나 — 판정 녹음기와 세션 녹음기가 공유) 위에서
 * 두 경로(Home Activity Card · 서재 책 시트)를 돈다. 증거 = Mock 요청 로그(body · 순서) · 녹음기 호출 기록
 * (`requestPermission` = 프롬프트 수) · DOM.
 * AC-4-146(판정 스트림 해제)은 Web 어댑터 위 단위 테스트(`sessionRecorderEnvironment.test.ts`)가 덮는다.
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useNavigate, useLocation, type NavigateFunction } from 'react-router';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SessionMode } from '@haru/contracts';

import { AppRoutes } from '../src/app/router';
import { activityDeckCopy } from '../src/features/activity-card-deck';
import { storytimeSessionCopy } from '../src/features/storytime-session';
import { ROUTES, sessionPath } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { libraryCopy } from '../src/shared/copy/library-copy';
import { createHarness, type Harness } from '../src/test/harness';
import { createManualScheduler, type ManualScheduler } from '../src/test/manual-scheduler';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const CREATE = 'POST /v1/sessions';
const SELECTION = 'POST /v1/activity-cards/:cardId/selection';
const TRANSITIONS = 'POST /v1/sessions/:sessionId/transitions';
const copy = storytimeSessionCopy;

let navigateRef: NavigateFunction | null = null;

function Probe() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    navigateRef = navigate;
  }, [navigate]);
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

function prompts(harness: Harness): number {
  return harness.recorderCalls().filter((call) => call === 'requestPermission').length;
}

async function flush(): Promise<void> {
  await act(async () => {
    for (let i = 0; i < 20; i += 1) await Promise.resolve();
  });
}

function recordControl(): HTMLElement {
  const node = document.querySelector('.haru-record');
  if (!(node instanceof HTMLElement)) throw new Error('no record control');
  return node;
}

interface Rendered {
  harness: Harness;
  time: ManualScheduler;
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

async function renderApp(
  options: { scenarios?: readonly string[]; path?: string } = {},
): Promise<Rendered> {
  const time = createManualScheduler(Date.now());
  const harness = createHarness({
    initialEntries: [options.path ?? ROUTES.home],
    recorderTime: time,
    ...(options.scenarios === undefined ? {} : { scenarios: options.scenarios }),
  });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <Probe />
      <AppRoutes />
    </Wrapper>,
  );
  return { harness, time };
}

/** 판정을 테스트가 끝내도록 바꾼다 — 프롬프트가 떠 있는 동안을 재현한다. */
function holdPermission(harness: Harness) {
  let release: (mode: SessionMode) => void = () => undefined;
  let calls = 0;
  harness.sessionRecorder.resolveSessionMode = () => {
    calls += 1;
    return new Promise<SessionMode>((resolve) => {
      release = resolve;
    });
  };
  return {
    calls: () => calls,
    release: async (mode: SessionMode) => {
      await act(async () => {
        release(mode);
        await Promise.resolve();
      });
      await flush();
    },
  };
}

// ── Home Activity Card 경로 ──

async function openReadingContext(): Promise<HTMLElement> {
  await waitForGuard();
  await waitFor(() => {
    expect(
      document.querySelector('.haru-activity-track:not(.haru-activity-track--skeleton)'),
    ).not.toBeNull();
  });
  const front = document.querySelector('.haru-activity-card-flip__face--front') as HTMLElement;
  fireEvent.click(
    within(front).getByRole('button', { name: activityDeckCopy.card.startSession.label }),
  );
  const sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.title });
  fireEvent.click(
    within(sheet).getByRole('radio', { name: activityDeckCopy.readingContext.options.bedtime }),
  );
  return sheet;
}

function confirmButton(sheet: HTMLElement): HTMLElement {
  return within(sheet).getByRole('button', { name: activityDeckCopy.readingContext.confirm });
}

async function startFromHome(): Promise<void> {
  const sheet = await openReadingContext();
  fireEvent.click(confirmButton(sheet));
  await waitFor(() => {
    expect(pathname()).toMatch(/^\/session\//);
  });
  await waitFor(() => {
    expect(document.querySelector('.haru-record')).not.toBeNull();
  });
}

// ── 서재 경로 ──

async function openBookSheet(): Promise<HTMLElement> {
  await waitForGuard();
  await waitFor(() => {
    expect(document.querySelector('.haru-shelf-item--pressable')).not.toBeNull();
  });
  fireEvent.click(document.querySelector('.haru-shelf-item--pressable') as HTMLElement);
  return screen.findByRole('dialog');
}

function libraryStart(sheet: HTMLElement): HTMLElement {
  return within(sheet).getByRole('button', { name: libraryCopy.bookSheet.startSession.label });
}

async function startFromLibrary(): Promise<void> {
  fireEvent.click(libraryStart(await openBookSheet()));
  await waitFor(() => {
    expect(pathname()).toMatch(/^\/session\//);
  });
  await waitFor(() => {
    expect(document.querySelector('.haru-record')).not.toBeNull();
  });
}

const PATHS = [
  { name: 'Home Activity Card', path: ROUTES.home, start: startFromHome },
  { name: '서재 책 시트', path: ROUTES.library, start: startFromLibrary },
] as const;

/*
  AC-4-145 ①~⑤ — 상태 × 경로. `prompts` = 판정이 띄운 OS 프롬프트 수(`requestPermission`). 세션 화면 녹음기는
  같은 기기 권한을 보므로 Record 를 누르기 전까지 더 묻지 않는다.
*/
const STATES = [
  { label: '① granted', scenario: 'recorder:mic-permission-revoked', mode: 'recorded', prompts: 0 },
  { label: '② prompt → 허용', scenario: null, mode: 'recorded', prompts: 1 },
  {
    label: '② prompt → 거부',
    scenario: 'recorder:mic-permission-denied',
    mode: 'conversation_only',
    prompts: 1,
  },
  {
    label: '④ denied',
    scenario: 'recorder:mic-permission-blocked',
    mode: 'conversation_only',
    prompts: 0,
  },
  {
    label: '⑤ unavailable',
    scenario: 'recorder:mic-unavailable',
    mode: 'conversation_only',
    prompts: 0,
  },
] as const;

afterEach(() => {
  cleanup();
  navigateRef = null;
  globalThis.localStorage.clear();
});

describe('AC-4-145 · AC-4-63 — Start Session 권한 판정 매트릭스 (경로 2 × 상태)', () => {
  for (const path of PATHS) {
    for (const state of STATES) {
      it(`${path.name} · ${state.label} → mode=${state.mode} · 프롬프트 ${String(state.prompts)}`, async () => {
        const { harness } = await renderApp({
          path: path.path,
          ...(state.scenario === null ? {} : { scenarios: [state.scenario] }),
        });
        await path.start();

        const created = requests(harness, CREATE);
        expect(created).toHaveLength(1);
        expect(created[0]?.mode).toBe(state.mode);
        expect(prompts(harness)).toBe(state.prompts);
        // ③ 녹음·업로드·전이 요청 0 (Record 를 누르지 않았다)
        expect(requests(harness, TRANSITIONS)).toHaveLength(0);
        expect(harness.recorderCalls().includes('start')).toBe(false);

        if (path.path === ROUTES.home) {
          // ⑦ 순서 = 권한 → selection → sessions · 책 id 는 모드와 무관하게 같다
          const order = harness.bundle.requestLog
            .entries()
            .map((entry) => entry.operation)
            .filter((operation) => operation === SELECTION || operation === CREATE);
          expect(order).toStrictEqual([SELECTION, CREATE]);
          expect(created[0]?.activityCardOptionId).not.toBeNull();
          expect(created[0]?.bookId).not.toBeNull();
          expect(created[0]?.childBookId).toBeNull();
        } else {
          expect(created[0]?.childBookId).not.toBeNull();
          expect(created[0]?.activityCardOptionId).toBeNull();
          expect(created[0]?.bookId).toBeNull();
        }

        // AC-4-63 ② · AC-4-134 — 대화 전용이면 Record = `permission-denied` · `Submit` 활성
        const control = recordControl();
        const bar = screen.getByRole('group', { name: copy.actions.groupLabel });
        const submit = within(bar).getByRole('button', { name: copy.actions.submit });
        if (state.mode === 'conversation_only') {
          expect(control.classList.contains('haru-record--permission-denied')).toBe(true);
          expect(submit.hasAttribute('aria-disabled')).toBe(false);
        } else {
          expect(control.classList.contains('haru-record--idle')).toBe(true);
          expect(submit.getAttribute('aria-disabled')).toBe('true');
          expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();
        }
      });
    }
  }

  it('Home 대화 전용 → `Submit` → `ready → completed` 1건 → 완료 화면 · 녹음기 start 0 (AC-4-63 ②③)', async () => {
    const { harness } = await renderApp({ scenarios: ['recorder:mic-permission-blocked'] });
    await startFromHome();
    const id = pathname().split('/').pop() ?? '';
    fireEvent.click(screen.getByRole('button', { name: copy.actions.submit }));
    await waitFor(() => {
      expect(pathname()).toBe(`${sessionPath(id)}/complete`);
    });
    const sent = requests(harness, TRANSITIONS);
    expect(sent.map((body) => body.to)).toStrictEqual(['completed']);
    expect(harness.recorderCalls().includes('start')).toBe(false);
    expect(
      harness.bundle.requestLog.entries().some((entry) => entry.operation.includes('recordings')),
    ).toBe(false);
  });
});

describe('AC-4-145 ⑥ ⑦ — 판정 중 `loading` · 재탭 · 이탈', () => {
  it('Home: 판정 중 확인 버튼 `loading` · 재탭 → 판정·선택·생성 각 1건', async () => {
    const { harness } = await renderApp();
    const hold = holdPermission(harness);
    const sheet = await openReadingContext();
    fireEvent.click(confirmButton(sheet));
    await flush();
    expect(confirmButton(sheet).getAttribute('aria-busy')).toBe('true');
    fireEvent.click(confirmButton(sheet));
    fireEvent.click(confirmButton(sheet));
    expect(requests(harness, SELECTION)).toHaveLength(0);

    await hold.release('recorded');
    await waitFor(() => {
      expect(pathname()).toMatch(/^\/session\//);
    });
    expect(hold.calls()).toBe(1);
    expect(requests(harness, SELECTION)).toHaveLength(1);
    expect(requests(harness, CREATE)).toHaveLength(1);
  });

  it('Home: 판정 중 시트를 닫으면(Escape) 늦게 온 결과로 selection · 생성 0', async () => {
    const { harness } = await renderApp();
    const hold = holdPermission(harness);
    const sheet = await openReadingContext();
    fireEvent.click(confirmButton(sheet));
    await flush();
    // 판정 중에도 닫기는 막지 않는다 (4b Spec §18.2 ①)
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: activityDeckCopy.readingContext.title }),
      ).toBeNull();
    });
    await hold.release('conversation_only');
    expect(requests(harness, SELECTION)).toHaveLength(0);
    expect(requests(harness, CREATE)).toHaveLength(0);
    expect(pathname()).toBe(ROUTES.home);
  });

  it('서재: 판정 중 `Start Session` `loading` · 재탭 → 생성 1건', async () => {
    const { harness } = await renderApp({ path: ROUTES.library });
    const hold = holdPermission(harness);
    const sheet = await openBookSheet();
    fireEvent.click(libraryStart(sheet));
    await flush();
    expect(libraryStart(sheet).getAttribute('aria-busy')).toBe('true');
    fireEvent.click(libraryStart(sheet));
    await hold.release('conversation_only');
    await waitFor(() => {
      expect(pathname()).toMatch(/^\/session\//);
    });
    expect(hold.calls()).toBe(1);
    const created = requests(harness, CREATE);
    expect(created).toHaveLength(1);
    expect(created[0]?.mode).toBe('conversation_only');
  });

  it('서재: 판정 중 시트를 닫으면(Escape) 생성 0', async () => {
    const { harness } = await renderApp({ path: ROUTES.library });
    const hold = holdPermission(harness);
    const sheet = await openBookSheet();
    fireEvent.click(libraryStart(sheet));
    await flush();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await hold.release('recorded');
    expect(requests(harness, CREATE)).toHaveLength(0);
    expect(pathname()).toBe(ROUTES.library);
  });
});

describe('AC-4-147 — 대화 전용 첫 진입 안내 (`D4-119` CP-10 · `D4-120` Q15·Q16)', () => {
  for (const scenario of ['recorder:mic-permission-blocked', 'recorder:mic-unavailable']) {
    it(`${scenario}: 시트 자동 1회 · 대화 전용 문단 · \`Not now\` → 포커스 = Record Control · 전이 0`, async () => {
      const { harness } = await renderApp({ scenarios: [scenario] });
      await startFromHome();

      const sheet = await screen.findByRole('dialog', { name: copy.micSheet.title });
      // ② 대화 전용 변형 문단 — "이 화면으로 돌아오면 녹음된다" 류 문장 0
      expect(within(sheet).getByText(copy.micSheet.conversationDescription)).toBeTruthy();
      expect(sheet.textContent).not.toContain('come back to this screen');
      expect(
        within(sheet)
          .getAllByRole('button')
          .map((button) => button.textContent),
      ).toStrictEqual([copy.micSheet.notNow]);

      fireEvent.click(within(sheet).getByRole('button', { name: copy.micSheet.notNow }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();
      });
      // ③ 자동으로 열린 시트는 연 요소가 없다 — 닫힌 뒤 포커스는 Record Control
      expect(document.activeElement).toBe(recordControl());
      // ④ 시트 열림·닫힘 동안 상태 전이 0
      expect(requests(harness, TRANSITIONS)).toHaveLength(0);
    });
  }

  it('같은 세션에 다시 들어오면(같은 앱 실행) 자동 0 · Record 탭으로는 열린다', async () => {
    await renderApp({ scenarios: ['recorder:mic-permission-blocked'] });
    await startFromHome();
    const id = pathname().split('/').pop() ?? '';
    const sheet = await screen.findByRole('dialog', { name: copy.micSheet.title });
    fireEvent.click(within(sheet).getByRole('button', { name: copy.micSheet.notNow }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();
    });

    act(() => {
      void navigateRef?.(ROUTES.home);
    });
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    act(() => {
      void navigateRef?.(sessionPath(id));
    });
    await waitFor(() => {
      expect(document.querySelector('.haru-record')).not.toBeNull();
    });
    await flush();
    expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();

    fireEvent.click(recordControl());
    expect(await screen.findByRole('dialog', { name: copy.micSheet.title })).toBeTruthy();
  });

  it('녹음 세션(허용)에는 자동 시트가 없다', async () => {
    await renderApp();
    await startFromHome();
    await flush();
    expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();
  });
});

describe('AC-4-148 — 녹음 세션 중 권한 상실', () => {
  it('② ready 에서 거부 → 시트 → 닫기(`ready → abandoned`) → 홈 → 다시 Start → `conversation_only` 새 세션', async () => {
    const { harness } = await renderApp({ scenarios: ['recorder:mic-permission-revoked'] });
    await startFromHome();
    const first = pathname().split('/').pop() ?? '';
    fireEvent.click(screen.getByRole('button', { name: copy.record.start }));
    const sheet = await screen.findByRole('dialog', { name: copy.micSheet.title });
    // 녹음 세션 문단 (설정 후 이 화면으로 돌아오면 녹음된다 — 녹음 세션에서는 사실이다)
    expect(within(sheet).getByText(copy.micSheet.description)).toBeTruthy();
    fireEvent.click(within(sheet).getByRole('button', { name: copy.micSheet.notNow }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();
    });
    expect(requests(harness, CREATE)).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: copy.close }));
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    expect(requests(harness, TRANSITIONS).map((body) => body.to)).toStrictEqual(['abandoned']);

    await startFromHome();
    expect(pathname().split('/').pop()).not.toBe(first);
    const created = requests(harness, CREATE);
    expect(created.map((body) => body.mode)).toStrictEqual(['recorded', 'conversation_only']);
    // 거부된 뒤에는 묻지 않는다 (프롬프트 0)
    expect(prompts(harness)).toBe(0);
  });

  it('③ paused 재개가 거부 → 시트 · 녹음 파일 보존 · `Submit` → `paused → completed` 1건', async () => {
    const { harness, time } = await renderApp();
    await startFromHome();
    const id = pathname().split('/').pop() ?? '';
    fireEvent.click(screen.getByRole('button', { name: copy.record.start }));
    await screen.findByRole('button', { name: copy.record.pause });
    for (let i = 0; i < 2; i += 1) {
      act(() => {
        time.advance(1_000);
      });
      await flush();
    }
    // 캡처가 끊겨 paused 로 간다(인터럽션) — 재개는 새 캡처를 시작하고, 그 시작이 거부된다
    const recorder = harness.recorders().at(-1);
    if (recorder === undefined) throw new Error('no recorder');
    act(() => {
      recorder.controls.interrupt('capture_lost', true);
    });
    await screen.findByRole('button', { name: copy.record.resume });
    await flush();
    const files = harness.recordingStorage()?.controls.files(id).length ?? 0;
    expect(files).toBeGreaterThan(0);

    recorder.controls.failNextStart('permission_denied');
    fireEvent.click(screen.getByRole('button', { name: copy.record.resume }));
    expect(await screen.findByRole('dialog', { name: copy.micSheet.title })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: copy.micSheet.notNow }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();
    });
    expect(harness.recordingStorage()?.controls.files(id).length ?? 0).toBeGreaterThanOrEqual(
      files,
    );

    fireEvent.click(screen.getByRole('button', { name: copy.actions.submit }));
    await waitFor(() => {
      expect(pathname()).toBe(`${sessionPath(id)}/complete`);
    });
    const targets = requests(harness, TRANSITIONS).map((body) => body.to);
    expect(targets).toStrictEqual(['recording', 'paused', 'completed']);
    expect(requests(harness, CREATE)).toHaveLength(1);
  });
});

describe('`D4-121` — 세션 화면 Toast 는 상단 줄 아래 (`VG-H2-02`)', () => {
  it('ready 에서 연결 Toast → 뷰포트가 상단 줄 보정을 받는다 (`--below-top-bar`)', async () => {
    const { harness } = await renderApp();
    await startFromHome();
    const appState = harness.appState();
    if (appState === null) throw new Error('recording platform is not open');
    act(() => {
      appState.setConnectivity('offline');
    });
    const message = await screen.findByText(copy.connectivity.offline);
    const viewport = message.closest('.haru-toast-viewport');
    expect(viewport?.classList.contains('haru-toast-viewport--below-top-bar')).toBe(true);
  });
});

/**
 * `D4-125` — `VG-H2R-01` (판정 → 생성 사이 `loading` 이 한 번 꺼졌다 켜짐) · `VG-H2R-02` (자동 시트 닫힘 후 포커스가
 * 짧은 세로에서 화면을 스크롤). 판정은 Mock 즉시 결정(실제 조립 그대로) — 끊김이 가장 잘 드러나는 조건이다.
 */
describe('`D4-125` — loading 이음매 · 포커스 이동 스크롤', () => {
  /**
   * 버튼의 `aria-busy` 가 **켜진 횟수**를 센다 (`attributeOldValue` — 콜백 시점에 값이 다시 바뀌어 있어도 기록이 남는다).
   * 끊김 없이 이어지면 1, 한 번 끊겼다 다시 켜지면 2.
   */
  function countBusyStarts(button: HTMLElement): { starts: () => number; stop: () => void } {
    const records: (string | null)[] = [];
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.target === button) records.push(mutation.oldValue);
      }
    });
    observer.observe(button, {
      attributes: true,
      attributeFilter: ['aria-busy'],
      attributeOldValue: true,
    });
    return {
      starts: () => records.filter((old) => old === null || old === 'false').length,
      stop: () => {
        observer.takeRecords().forEach((mutation) => {
          if (mutation.target === button) records.push(mutation.oldValue);
        });
        observer.disconnect();
      },
    };
  }

  it('Home: 확인 탭 → 판정 → selection → 생성 → 이동까지 `aria-busy` 가 한 번만 켜진다 (`VG-H2R-01`)', async () => {
    const { harness } = await renderApp();
    const sheet = await openReadingContext();
    const button = confirmButton(sheet);
    const busy = countBusyStarts(button);
    fireEvent.click(button);
    await waitFor(() => {
      expect(pathname()).toMatch(/^\/session\//);
    });
    busy.stop();
    expect(busy.starts()).toBe(1);
    expect(requests(harness, CREATE)).toHaveLength(1);
  });

  it('서재: 탭 → 판정 → 생성 → 이동까지 `aria-busy` 가 한 번만 켜진다 (`VG-H2R-01`)', async () => {
    const { harness } = await renderApp({ path: ROUTES.library });
    const sheet = await openBookSheet();
    const button = libraryStart(sheet);
    const busy = countBusyStarts(button);
    fireEvent.click(button);
    await waitFor(() => {
      expect(pathname()).toMatch(/^\/session\//);
    });
    busy.stop();
    expect(busy.starts()).toBe(1);
    expect(requests(harness, CREATE)).toHaveLength(1);
  });

  it('Home: 생성이 실패하면 `loading` 이 꺼지고 시트에 머문다 (이음매가 실패를 덮지 않는다)', async () => {
    await renderApp({ scenarios: ['sessions:error'] });
    const sheet = await openReadingContext();
    fireEvent.click(confirmButton(sheet));
    await waitFor(() => {
      expect(confirmButton(sheet).getAttribute('aria-busy')).toBeNull();
    });
    expect(pathname()).toBe(ROUTES.home);
  });

  it('자동 시트를 닫으면 Record Control 로 포커스 — `preventScroll` (`VG-H2R-02`)', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    await renderApp({ scenarios: ['recorder:mic-permission-blocked'] });
    await startFromHome();
    const sheet = await screen.findByRole('dialog', { name: copy.micSheet.title });
    focus.mockClear();
    fireEvent.click(within(sheet).getByRole('button', { name: copy.micSheet.notNow }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: copy.micSheet.title })).toBeNull();
    });
    expect(document.activeElement).toBe(recordControl());
    const onRecord = focus.mock.calls.filter(
      (_, index) => focus.mock.contexts[index] === recordControl(),
    );
    expect(onRecord.at(-1)).toStrictEqual([{ preventScroll: true }]);
    focus.mockRestore();
  });
});
