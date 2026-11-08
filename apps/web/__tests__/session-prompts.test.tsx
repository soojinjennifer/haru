/**
 * Stage 4b `S4-G1` — Prompts 칩 → 중앙 팝업 (Figma `296:1257`, Plan §13 `S4-G1` · AC-4-52 · 130~133 · 135,
 * + AC-4-53 · 55 의 팝업 부분 — Drawer 부분은 `S4-G2`).
 *
 * 실제 앱 조립(`createHarness` + `AppRoutes`, Page 가 `SessionPromptsPopover` 를 슬롯으로 꽂는다) 위에서
 * 녹음 시작 → 칩 → 팝업 열림/닫힘 → 종료 경로를 간다. 요청 증거 = Mock 요청 로그, 시간 = 주입 수동 시계.
 *
 * 포인터 규칙: **바깥 탭 = `pointerdown`** (팝업이 캡처 단계에서 닫는다) + `click`(대상 동작). `fireEvent.click`
 * 단독은 키보드 활성화와 같다(포인터 없음 — 팝업은 닫히지 않는다). 기하는 `e2e/session-prompts.spec.ts`.
 */
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { activityDeckCopy } from '../src/features/activity-card-deck';
import { SessionPromptsPopover, sessionPromptsCopy } from '../src/features/session-prompts';
import { storytimeSessionCopy } from '../src/features/storytime-session';
import { createSessionPromptsFixture } from '../src/mocks/fixtures/sessions';
import { ROUTES } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { createHarness, type Harness } from '../src/test/harness';
import { createManualScheduler, type ManualScheduler } from '../src/test/manual-scheduler';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const TRANSITIONS = 'POST /v1/sessions/:sessionId/transitions';
const copy = storytimeSessionCopy;
const popupCopy = sessionPromptsCopy;

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

function pathname(): string {
  return screen.getByTestId('pathname').textContent ?? '';
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

function transitionTargets(harness: Harness): readonly unknown[] {
  return harness.bundle.requestLog
    .entries()
    .filter((entry) => entry.operation === TRANSITIONS)
    .map((entry) => (entry.payload as { to?: unknown }).to);
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
  /** ready 버블에 보였던 Prompt 문구 (서버 순서) — 팝업과 같은 출처인지 대조한다 (AC-4-53). */
  readyPromptTexts: readonly string[];
}

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
  const sessionId = pathname().split('/').pop() ?? '';
  const readyPromptTexts = [
    ...document.querySelectorAll('.haru-session-bubble .haru-prompt-pill .haru-text'),
  ].map((node) => node.textContent ?? '');
  return { harness, time, sessionId, readyPromptTexts };
}

function advance(time: ManualScheduler, ms: number): void {
  act(() => {
    time.advance(ms);
  });
}

async function startRecording(opened: Opened, seconds = 0): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: copy.record.start }));
  await screen.findByRole('button', { name: copy.record.pause });
  await flush();
  for (let i = 0; i < seconds; i += 1) {
    advance(opened.time, 1_000);
    await flush();
  }
}

function chip(): HTMLElement {
  return screen.getByRole('button', { name: copy.prompts });
}

/** 보이는 팝업 (`hidden` 이면 null — role 조회는 숨은 노드를 세지 않는다). */
function popup(): HTMLElement | null {
  return screen.queryByRole('region', { name: popupCopy.title });
}

function openPopup(): HTMLElement {
  fireEvent.pointerDown(chip());
  fireEvent.click(chip());
  const region = popup();
  if (region === null) throw new Error('popup did not open');
  return region;
}

/** 포인터 탭 — 바깥 탭 판정(`pointerdown`) + 대상 동작(`click`). */
function tap(target: Element): void {
  fireEvent.pointerDown(target);
  fireEvent.click(target);
}

function timer(): string {
  return screen.getByRole('timer').textContent ?? '';
}

afterEach(() => {
  globalThis.localStorage.clear();
  vi.restoreAllMocks();
});

describe('AC-4-99 ② — 짧은 세로의 pill 목록 (`S4-K1`, Spec §9.3)', () => {
  it('넘칠 때만 목록이 Tab 정지점 + 이름을 갖고, 넘치지 않으면 속성이 없다', async () => {
    const opened = await openReady();
    await startRecording(opened);

    const noOverflow = openPopup().querySelector('ul');
    expect(noOverflow?.hasAttribute('tabindex')).toBe(false);
    expect(noOverflow?.hasAttribute('aria-labelledby')).toBe(false);
    tap(chip());

    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(214);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(120);
    const list = openPopup().querySelector('ul');
    await flush();
    expect(list?.getAttribute('tabindex')).toBe('0');
    expect(list?.getAttribute('aria-labelledby')).toBe(popup()?.getAttribute('aria-labelledby'));

    tap(chip()); // 닫히면 Tab 정지점도 사라진다
    await flush();
    expect(list?.hasAttribute('tabindex')).toBe(false);
  });
});

describe('AC-4-135 — 비모달 disclosure (`D4-54`)', () => {
  it('① 칩 aria-expanded + aria-controls ② region + aria-labelledby, aria-modal·dialog 0 ③ 포커스 칩 · DOM 칩 다음 ⑦ 닫기 버튼·scrim 0', async () => {
    const opened = await openReady();
    await startRecording(opened);
    const trigger = chip();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(popup()).toBeNull();

    trigger.focus();
    const region = openPopup();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(region.id);
    expect(region.tagName).toBe('SECTION');
    const labelledBy = region.getAttribute('aria-labelledby') ?? '';
    expect(document.getElementById(labelledBy)?.textContent).toBe('Try this prompt!');
    expect(region.hasAttribute('aria-modal')).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(region.hasAttribute('aria-live')).toBe(false); // `D4-66` — 낭독 없음
    expect(document.activeElement).toBe(trigger);
    expect(trigger.nextElementSibling).toBe(region);
    // 보이는 닫기 버튼 · scrim 0 — 팝업 안 버튼은 `See all prompts` 하나뿐
    expect(
      within(region)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toStrictEqual([popupCopy.seeAll]);
    expect(document.querySelector('.haru-scrim')).toBeNull();
  });

  it('④ Escape → 닫힘 + 포커스 칩 ⑤ 칩 재탭 → 닫힘', async () => {
    const opened = await openReady();
    await startRecording(opened);
    openPopup();
    const seeAll = screen.getByRole('button', { name: popupCopy.seeAll });
    seeAll.focus();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(popup()).toBeNull();
    expect(document.activeElement).toBe(chip());
    expect(chip().getAttribute('aria-expanded')).toBe('false');

    openPopup();
    tap(chip());
    expect(popup()).toBeNull();
    expect(chip().getAttribute('aria-expanded')).toBe('false');
  });

  it('⑥ 바깥 탭 → 닫히고 탭한 대상의 동작이 그대로 (Pause → 닫힘 + paused 전이 1건)', async () => {
    const opened = await openReady();
    await startRecording(opened);
    openPopup();
    tap(screen.getByRole('button', { name: copy.record.pause }));
    expect(popup()).toBeNull();
    await screen.findByRole('button', { name: copy.record.resume });
    await flush();
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording', 'paused']);
  });

  it('팝업 안 탭(제목 · pill)은 아무 일도 하지 않는다 — 열림 유지 · 요청 0 (`D4-58` NB-1)', async () => {
    const opened = await openReady();
    await startRecording(opened);
    const region = openPopup();
    const before = opened.harness.bundle.requestLog.entries().length;
    tap(region.querySelector('.haru-prompt-pill') as HTMLElement);
    tap(within(region).getByText(popupCopy.title));
    expect(popup()).not.toBeNull();
    expect(
      region.querySelectorAll('.haru-prompt-pill [tabindex], .haru-prompt-pill button'),
    ).toHaveLength(0);
    expect(opened.harness.bundle.requestLog.entries()).toHaveLength(before);
  });

  it('Escape 는 열린 모달이 먼저 받는다 — 확인 다이얼로그를 닫고 팝업은 그대로', async () => {
    const opened = await openReady();
    await startRecording(opened);
    openPopup();
    // 키보드로 Discard (포인터 없음 → 팝업은 열린 채) → 확인 다이얼로그
    fireEvent.click(screen.getByRole('button', { name: copy.actions.discard }));
    const dialog = await screen.findByRole('alertdialog', { name: copy.discardDialog.title });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(screen.queryByRole('region', { name: popupCopy.title, hidden: false })).not.toBeNull();
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording']);
  });
});

describe('AC-4-130 — 팝업은 세션 상태를 바꾸지 않는다 (`D4-53`)', () => {
  it('열기·닫기 전이 요청 0 · 열린 동안 시간·청크 계속 · recording ⇄ paused 에도 열린 채', async () => {
    const opened = await openReady();
    await startRecording(opened, 2);
    const files = () =>
      opened.harness.recordingStorage()?.controls.files(opened.sessionId).length ?? 0;
    const filesBefore = files();
    openPopup();
    for (let i = 0; i < 3; i += 1) {
      advance(opened.time, 1_000);
      await flush();
    }
    expect(timer()).toBe('00:05');
    expect(files()).toBeGreaterThan(filesBefore);
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording']);

    // 키보드 활성화(포인터 없음)로 일시정지 → 재개 — 팝업은 열린 채
    fireEvent.click(screen.getByRole('button', { name: copy.record.pause }));
    await screen.findByRole('button', { name: copy.record.resume });
    await flush();
    expect(popup()).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: copy.record.resume }));
    await screen.findByRole('button', { name: copy.record.pause });
    await flush();
    expect(popup()).not.toBeNull();

    tap(chip());
    expect(popup()).toBeNull();
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording', 'paused', 'recording']);
  });

  it('paused 에서도 열린다 (`D4-53`)', async () => {
    const opened = await openReady();
    await startRecording(opened, 1);
    fireEvent.click(screen.getByRole('button', { name: copy.record.pause }));
    await screen.findByRole('button', { name: copy.record.resume });
    await flush();
    openPopup();
    expect(popup()).not.toBeNull();
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording', 'paused']);
  });
});

describe('AC-4-52 — 자동으로 나타나는 버블 0 (팝업은 사용자 탭으로만)', () => {
  it('녹음 시작 · 시간 경과 · 일시정지 · 재개 동안 팝업 · tail 버블 0', async () => {
    const opened = await openReady();
    await startRecording(opened, 3);
    expect(popup()).toBeNull();
    expect(document.querySelector('.haru-session-bubble')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: copy.record.pause }));
    await screen.findByRole('button', { name: copy.record.resume });
    advance(opened.time, 60_000);
    await flush();
    expect(popup()).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: copy.record.resume }));
    await screen.findByRole('button', { name: copy.record.pause });
    await flush();
    expect(popup()).toBeNull();
    // 팝업에는 tail 이 없다
    const region = openPopup();
    expect(region.querySelector('.haru-bubble--tail-none')).not.toBeNull();
    expect(region.querySelector('.haru-bubble__tail')).toBeNull();
  });
});

describe('AC-4-131 · 132 · 53 — 제목 · 개수 · 같은 출처', () => {
  it('제목 = copy 고정 라벨 `Try this prompt!` (ready 버블 제목 줄과 다른 출처)', async () => {
    const opened = await openReady();
    const readyTitle = document.querySelector(
      '.haru-session-bubble .haru-bubble__content > .haru-text',
    )?.textContent;
    expect(readyTitle).not.toBe(popupCopy.title);
    await startRecording(opened);
    const region = openPopup();
    expect(region.querySelector('.haru-bubble__content > .haru-text')?.textContent).toBe(
      'Try this prompt!',
    );
  });

  it.each([
    ['session:prompts-1', 1, 1],
    ['session:success', 5, 5],
    ['session:prompts-7', 5, 7],
  ] as const)(
    '%s → pill %i개 (서버 순서 앞 5개) · ready 버블과 같은 문구 · `See all` 항상',
    async (scenario, shown, count) => {
      const opened = await openReady([scenario]);
      await startRecording(opened);
      const region = openPopup();
      const texts = [...region.querySelectorAll('.haru-prompt-pill .haru-text')].map(
        (node) => node.textContent ?? '',
      );
      expect(texts).toHaveLength(shown);
      // ready 버블(같은 5 컷오프)과 같은 문구·순서 — 하드코딩 0, 같은 `SessionSummary.prompts`
      expect(texts).toStrictEqual(opened.readyPromptTexts);
      expect(texts).toStrictEqual(
        createSessionPromptsFixture(count)
          .slice(0, 5)
          .map((prompt) => prompt.text),
      );
      expect(within(region).getByRole('button', { name: popupCopy.seeAll })).toBeTruthy();
    },
  );
});

describe('AC-4-133 — 정리 · 빈 목록', () => {
  it('Submit → 팝업 닫힘 · 완료 화면 잔존 0', async () => {
    const opened = await openReady();
    await startRecording(opened, 1);
    openPopup();
    tap(screen.getByRole('button', { name: copy.actions.submit }));
    expect(popup()).toBeNull();
    await waitFor(() => {
      expect(pathname()).toBe(`/session/${opened.sessionId}/complete`);
    });
    expect(document.querySelector('.haru-session-prompts')).toBeNull();
  });

  it('Discard(키보드) → 확인 → 홈 · 팝업 잔존 0', async () => {
    const opened = await openReady();
    await startRecording(opened, 1);
    openPopup();
    fireEvent.click(screen.getByRole('button', { name: copy.actions.discard }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: copy.discardDialog.confirm }));
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    expect(document.querySelector('.haru-session-prompts')).toBeNull();
    expect(transitionTargets(opened.harness).at(-1)).toBe('abandoned');
  });

  it('닫기(포인터) → 팝업 닫힘 → 확인 다이얼로그', async () => {
    const opened = await openReady();
    await startRecording(opened, 1);
    openPopup();
    tap(screen.getByRole('button', { name: copy.close }));
    expect(popup()).toBeNull();
    expect(await screen.findByRole('alertdialog', { name: copy.discardDialog.title })).toBeTruthy();
  });

  it('30분 자동 종료 → 팝업 닫힘 (칩 aria-expanded=false)', async () => {
    const opened = await openReady();
    await startRecording(opened, 1);
    openPopup();
    advance(opened.time, 1_799_000);
    await flush();
    await waitFor(() => {
      expect(transitionTargets(opened.harness).at(-1)).toBe('completed');
    });
    expect(popup()).toBeNull();
    // `S4-H2` (AC-4-64): 자동 종료는 완료 화면으로 넘어간다 — 완료 화면에 팝업·칩 잔존 0 (AC-4-133).
    await waitFor(() => {
      expect(pathname()).toBe(`/session/${opened.sessionId}/complete`);
    });
    expect(popup()).toBeNull();
    expect(screen.queryByRole('button', { name: copy.prompts })).toBeNull();
  });

  it('`prompts: []` → 칩 aria-disabled + 사유 · 팝업 미렌더 · 탭 무시 (`D4-58` NB-2)', async () => {
    const opened = await openReady(['session:prompts-empty']);
    await startRecording(opened);
    const trigger = chip();
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(trigger.hasAttribute('aria-expanded')).toBe(false);
    const reason = document.getElementById(trigger.getAttribute('aria-describedby') ?? '');
    expect(reason?.textContent).toBe('No prompts for this session');
    tap(trigger);
    expect(document.querySelector('.haru-session-prompts')).toBeNull();
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording']);
  });
});

describe('AC-4-55 (팝업 부분) — 오디오 재생 · 진동 0', () => {
  it('열기 · 닫기 동안 navigator.vibrate · HTMLMediaElement.play 0회', async () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true });
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const opened = await openReady();
    await startRecording(opened);
    openPopup();
    tap(chip());
    openPopup();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(vibrate).not.toHaveBeenCalled();
    expect(play).not.toHaveBeenCalled();
  });
});

describe('`S4-G2` — `See all prompts` → Prompt Drawer `88:960` (AC-4-137 · 56 · 53 · 54 · 55 · 130)', () => {
  const drawerCopy = popupCopy.drawer;

  function drawer(): HTMLElement | null {
    return screen.queryByRole('dialog', { name: drawerCopy.title });
  }

  async function openDrawer(): Promise<HTMLElement> {
    openPopup();
    tap(screen.getByRole('button', { name: popupCopy.seeAll }));
    return screen.findByRole('dialog', { name: drawerCopy.title });
  }

  function labels(dialog: HTMLElement): string[] {
    return [
      ...dialog.querySelectorAll('.haru-prompt-carousel__bar .haru-prompt-pill .haru-text'),
    ].map((node) => node.textContent ?? '');
  }

  function visibleSlide(dialog: HTMLElement, part: 'bar' | 'detail'): HTMLElement {
    const root =
      part === 'bar'
        ? dialog.querySelector('.haru-prompt-carousel__bar')
        : dialog.querySelector('.haru-prompt-carousel__track--detail');
    const slide = [...(root?.querySelectorAll('.haru-prompt-carousel__slide') ?? [])].find(
      (node) => !node.hasAttribute('aria-hidden'),
    );
    if (slide === undefined) throw new Error('no visible slide');
    return slide as HTMLElement;
  }

  /** 보이는 페이지의 Prompt 문구 (배지 `PRE`/`POST` 제외 — 배지는 `PromptPill` 규칙 `D-8` 그대로 렌더된다). */
  function barText(dialog: HTMLElement): string {
    return (
      visibleSlide(dialog, 'bar').querySelector('.haru-prompt-pill > .haru-text')?.textContent ?? ''
    );
  }

  it('137 ①④ See all = <button aria-haspopup="dialog"> → 팝업 닫힘 + Drawer 열림 (모달) · 전이 0', async () => {
    const opened = await openReady();
    await startRecording(opened);
    openPopup();
    const seeAll = screen.getByRole('button', { name: popupCopy.seeAll });
    expect(seeAll.tagName).toBe('BUTTON');
    expect(seeAll.getAttribute('aria-haspopup')).toBe('dialog');
    tap(seeAll);
    const dialog = await screen.findByRole('dialog', { name: drawerCopy.title });
    expect(popup()).toBeNull();
    expect(chip().getAttribute('aria-expanded')).toBe('false');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.classList.contains('haru-sheet--floating')).toBe(true);
    expect(dialog.classList.contains('haru-sheet--surface-drawer')).toBe(true);
    expect(within(dialog).getByText(drawerCopy.subtitle)).toBeTruthy();
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording']);
  });

  it('137 ② · 53 — n=7 → 7페이지 전부 · 서버 순서 · 초기 1번째 · 노트 = coachingNote (54) · dots 7', async () => {
    const opened = await openReady(['session:prompts-7']);
    await startRecording(opened);
    const dialog = await openDrawer();
    const fixture = createSessionPromptsFixture(7);
    expect(labels(dialog)).toStrictEqual(fixture.map((prompt) => prompt.text));
    // 팝업 5개 = Drawer 앞 5개 = ready 버블 (같은 출처)
    expect(labels(dialog).slice(0, 5)).toStrictEqual(opened.readyPromptTexts);
    expect(barText(dialog)).toBe(fixture[0]?.text);
    expect(visibleSlide(dialog, 'detail').textContent).toBe(fixture[0]?.coachingNote);
    expect(dialog.querySelectorAll('.haru-page-indicator__dot')).toHaveLength(7);
    expect(within(dialog).getByText(drawerCopy.position(0, 7))).toBeTruthy();
  });

  it('캐러셀 이동 — 화살표 · ArrowLeft/Right · 첫/끝 aria-disabled (포커스 유지)', async () => {
    const opened = await openReady(['session:prompts-3']);
    await startRecording(opened);
    const dialog = await openDrawer();
    const fixture = createSessionPromptsFixture(3);
    const previous = within(dialog).getByRole('button', { name: drawerCopy.previous });
    const next = within(dialog).getByRole('button', { name: drawerCopy.next });
    expect(previous.getAttribute('aria-disabled')).toBe('true');
    expect(next.hasAttribute('aria-disabled')).toBe(false);

    fireEvent.click(previous); // 첫 페이지 — 무시
    expect(barText(dialog)).toBe(fixture[0]?.text);
    fireEvent.click(next);
    expect(barText(dialog)).toBe(fixture[1]?.text);
    expect(visibleSlide(dialog, 'detail').textContent).toBe(fixture[1]?.coachingNote);
    expect(within(dialog).getByText(drawerCopy.position(1, 3))).toBeTruthy();

    const carousel = within(dialog).getByRole('group', { name: drawerCopy.carousel });
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(barText(dialog)).toBe(fixture[2]?.text);
    expect(next.getAttribute('aria-disabled')).toBe('true');
    next.focus();
    fireEvent.click(next); // 끝 페이지 — 무시, 포커스는 그대로
    expect(barText(dialog)).toBe(fixture[2]?.text);
    expect(document.activeElement).toBe(next);
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    expect(barText(dialog)).toBe(fixture[1]?.text);
  });

  it('56 — 초기 포커스 = 캐러셀 · Tab 트랩 · Escape → 닫힘 + 포커스 Prompts 칩 (137 ③)', async () => {
    const opened = await openReady();
    await startRecording(opened);
    const dialog = await openDrawer();
    const carousel = within(dialog).getByRole('group', { name: drawerCopy.carousel });
    expect(document.activeElement).toBe(carousel);
    // 트랩: 마지막 포커스 대상(Next)에서 Tab → 첫 대상(Previous)
    const next = within(dialog).getByRole('button', { name: drawerCopy.next });
    next.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(
      within(dialog).getByRole('button', { name: drawerCopy.previous }),
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(drawer()).toBeNull();
    });
    expect(document.activeElement).toBe(chip());
    expect(popup()).toBeNull();
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording']);
  });

  it('scrim 탭 → 닫힘 + 포커스 칩 · 다시 열면 1번째 페이지부터 (NB-1)', async () => {
    const opened = await openReady(['session:prompts-3']);
    await startRecording(opened);
    let dialog = await openDrawer();
    fireEvent.click(within(dialog).getByRole('button', { name: drawerCopy.next }));
    const scrim = document.querySelector('.haru-scrim');
    if (scrim === null) throw new Error('no scrim');
    fireEvent.click(scrim);
    await waitFor(() => {
      expect(drawer()).toBeNull();
    });
    expect(document.activeElement).toBe(chip());
    dialog = await openDrawer();
    expect(barText(dialog)).toBe(createSessionPromptsFixture(3)[0]?.text);
  });

  it('130 — 열린 동안 시간·청크 계속 · 전이 요청 0 (recording) · paused 에서도 열린다', async () => {
    const opened = await openReady();
    await startRecording(opened, 2);
    const files = () =>
      opened.harness.recordingStorage()?.controls.files(opened.sessionId).length ?? 0;
    const filesBefore = files();
    await openDrawer();
    for (let i = 0; i < 3; i += 1) {
      advance(opened.time, 1_000);
      await flush();
    }
    expect(timer()).toBe('00:05');
    expect(files()).toBeGreaterThan(filesBefore);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(drawer()).toBeNull();
    });
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording']);

    fireEvent.click(screen.getByRole('button', { name: copy.record.pause }));
    await screen.findByRole('button', { name: copy.record.resume });
    await flush();
    await openDrawer();
    expect(transitionTargets(opened.harness)).toStrictEqual(['recording', 'paused']);
  });

  it('30분 자동 종료 → Drawer 닫힘 · 포커스 칩 · 다시 열리지 않는다 (133 과 같은 정리)', async () => {
    const opened = await openReady();
    await startRecording(opened, 1);
    await openDrawer();
    advance(opened.time, 1_799_000);
    await flush();
    await waitFor(() => {
      expect(transitionTargets(opened.harness).at(-1)).toBe('completed');
    });
    await waitFor(() => {
      expect(drawer()).toBeNull();
    });
    // `S4-H2` (AC-4-64): 자동 종료는 완료 화면으로 넘어간다 — Drawer·팝업·칩 잔존 0 (AC-4-133).
    await waitFor(() => {
      expect(pathname()).toBe(`/session/${opened.sessionId}/complete`);
    });
    expect(popup()).toBeNull();
    expect(drawer()).toBeNull();
    expect(screen.queryByRole('button', { name: copy.prompts })).toBeNull();
  });

  it('55 (Drawer 부분) — 열기 · 페이지 이동 · 닫기 동안 vibrate · play 0회', async () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true });
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const opened = await openReady();
    await startRecording(opened);
    const dialog = await openDrawer();
    fireEvent.click(within(dialog).getByRole('button', { name: drawerCopy.next }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(vibrate).not.toHaveBeenCalled();
    expect(play).not.toHaveBeenCalled();
  });

  it('coachingNote 가 없는 Prompt 는 노트 상자를 그리지 않는다 (placeholder 0)', () => {
    const base = createSessionPromptsFixture(3);
    const prompts = base.map((prompt, index) =>
      index === 1 ? { ...prompt, kind: 'follow_up' as const, coachingNote: null } : prompt,
    );
    render(
      <SessionPromptsPopover
        open={false}
        live
        popupId="popup"
        prompts={prompts}
        focusChip={() => undefined}
        close={() => undefined}
      />,
    );
    // 닫힌 팝업 안의 See all 은 숨어 있지만 DOM 에는 있다 — 직접 눌러 Drawer 를 연다
    const seeAll = document.querySelector('.haru-session-prompts__see-all button');
    if (seeAll === null) throw new Error('no see all');
    fireEvent.click(seeAll);
    const dialog = screen.getByRole('dialog', { name: drawerCopy.title });
    expect(dialog.querySelectorAll('.haru-prompt-drawer__note')).toHaveLength(2);
    expect(
      dialog.querySelectorAll('.haru-prompt-carousel__track--detail .haru-prompt-carousel__slide'),
    ).toHaveLength(3);
  });
});
