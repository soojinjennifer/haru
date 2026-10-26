/**
 * Stage 4b `S4-F1` — 진입 · ready (Plan §13 · AC-4-38 · 39 · 40 · 86 · 111 · 117 · 120~124 · 136).
 *
 * 실제 앱과 같은 provider 순서(`createHarness`)에 **Mock 녹음 조립**을 얹어 Home·서재에서 세션을 시작하고
 * `/session/:id` ready 화면까지 간다. 요청 증거는 Mock 요청 로그(`bundle.requestLog`)다.
 * 기하(높이 28 · 바 가운데 · 320 클리핑 · 버블 식)는 jsdom 이 레이아웃을 계산하지 않아
 * `e2e/session.spec.ts` 가 덮는다.
 *
 * 클릭은 `fireEvent` 다 — 이 저장소는 `@testing-library/user-event` 를 쓰지 않는다.
 */
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { activityDeckCopy } from '../src/features/activity-card-deck';
import { storytimeSessionCopy } from '../src/features/storytime-session';
import { applyActivityCardCacheSeed } from '../src/mocks';
import {
  MOCK_READY_BUBBLE,
  MOCK_READY_BUBBLE_LONG,
  MOCK_READY_REMINDER_BUBBLE,
} from '../src/mocks/fixtures/sessions';
import { createPromptPreviewFixture } from '../src/mocks/fixtures/prompt-sets';
import { ROUTES } from '../src/shared/config/routes';
import { createSystemClock } from '../src/shared/lib/clock';
import { libraryCopy } from '../src/shared/copy/library-copy';
import { createHarness, type Harness } from '../src/test/harness';
import { createManualScheduler, type ManualScheduler } from '../src/test/manual-scheduler';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const SESSION_PROMPTS = createPromptPreviewFixture('5e55');

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

async function renderApp(
  options: {
    scenarios?: readonly string[];
    path?: string;
    cachedCard?: boolean;
    recorderTime?: ManualScheduler;
  } = {},
): Promise<Harness> {
  const harness = createHarness({
    initialEntries: [options.path ?? ROUTES.home],
    ...(options.scenarios === undefined ? {} : { scenarios: options.scenarios }),
    ...(options.recorderTime === undefined ? {} : { recorderTime: options.recorderTime }),
  });
  if (options.cachedCard === true) {
    applyActivityCardCacheSeed({ store: harness.bundle.store, deviceClock: createSystemClock() });
  }
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  return harness;
}

function ops(harness: Harness, needle: string): readonly string[] {
  return harness.bundle.requestLog
    .entries()
    .map((entry) => entry.operation)
    .filter((operation) => operation.includes(needle));
}

function payloads(harness: Harness, operation: string): readonly unknown[] {
  return harness.bundle.requestLog
    .entries()
    .filter((entry) => entry.operation === operation)
    .map((entry) => entry.payload);
}

function pathname(): string {
  return screen.getByTestId('pathname').textContent ?? '';
}

async function firstStartButton(): Promise<HTMLElement> {
  await waitFor(() => {
    expect(
      document.querySelector('.haru-activity-track:not(.haru-activity-track--skeleton)'),
    ).not.toBeNull();
  });
  const front = document.querySelector('.haru-activity-card-flip__face--front') as HTMLElement;
  return within(front).getByRole('button', { name: activityDeckCopy.card.startSession.label });
}

/** Home → Start Session → Reading Context → `/session/:id` (ready 화면이 뜰 때까지). */
async function startFromHome(
  harness: Harness,
  pick: string = activityDeckCopy.readingContext.options.bedtime,
): Promise<void> {
  fireEvent.click(await firstStartButton());
  const sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.title });
  fireEvent.click(within(sheet).getByRole('radio', { name: pick }));
  fireEvent.click(
    within(sheet).getByRole('button', { name: activityDeckCopy.readingContext.confirm }),
  );
  await waitFor(() => {
    expect(pathname()).toMatch(/^\/session\//);
  });
  await screen.findByRole('button', { name: storytimeSessionCopy.record.start });
  expect(ops(harness, 'POST /v1/sessions')).toHaveLength(1);
}

afterEach(() => {
  globalThis.localStorage.clear();
});

describe('AC-4-38 · 39 · 86 — Home Activity Card → Reading Context → 세션 생성 1회 → ready', () => {
  it('선택 확정(selection) 뒤 `POST /v1/sessions` 가 정확히 1회 나가고 ready 화면으로 이동한다', async () => {
    const harness = await renderApp();
    await startFromHome(harness);

    const order = harness.bundle.requestLog
      .entries()
      .map((entry) => entry.operation)
      .filter((op) => op.includes('selection') || op === 'POST /v1/sessions');
    expect(order).toStrictEqual(['POST /v1/activity-cards/:cardId/selection', 'POST /v1/sessions']);
    const [selection] = payloads(harness, 'POST /v1/activity-cards/:cardId/selection');
    expect(selection).toMatchObject({ readingContext: 'bedtime' });
    const [create] = payloads(harness, 'POST /v1/sessions');
    expect(create).toMatchObject({
      mode: 'recorded',
      readingContext: 'bedtime',
      childBookId: null,
    });
    expect((create as { activityCardOptionId: string | null }).activityCardOptionId).not.toBeNull();
  });

  it('시트가 6값을 확정 라벨로 제시하고, 고르기 전에는 Continue 가 aria-disabled 다 (AC-3-22 · D-9)', async () => {
    const harness = await renderApp();
    fireEvent.click(await firstStartButton());
    const sheet = await screen.findByRole('dialog', {
      name: activityDeckCopy.readingContext.title,
    });

    const labels = within(sheet)
      .getAllByRole('radio')
      .map((radio) => radio.closest('label')?.textContent?.trim());
    expect(labels).toStrictEqual(Object.values(activityDeckCopy.readingContext.options));

    const confirm = within(sheet).getByRole('button', {
      name: activityDeckCopy.readingContext.confirm,
    });
    expect(confirm.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(confirm);
    expect(ops(harness, 'selection')).toHaveLength(0);
    expect(ops(harness, 'POST /v1/sessions')).toHaveLength(0);
  });

  it('`custom_time` 일 때만 시간 행이 나오고, 시간을 고르기 전에는 진행할 수 없다 (AC-3-23 · AC-3-24)', async () => {
    const harness = await renderApp();
    fireEvent.click(await firstStartButton());
    let sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.title });
    expect(within(sheet).queryByText(activityDeckCopy.readingContext.timeLabel)).toBeNull();

    fireEvent.click(
      within(sheet).getByRole('radio', {
        name: activityDeckCopy.readingContext.options.custom_time,
      }),
    );
    const confirm = within(sheet).getByRole('button', {
      name: activityDeckCopy.readingContext.confirm,
    });
    expect(confirm.getAttribute('aria-disabled')).toBe('true');

    // 같은 시트 안 목록 뷰로 전환 — 48항목, `HH:mm`
    fireEvent.click(within(sheet).getByRole('button', { name: /Time/ }));
    sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.timeLabel });
    const times = within(sheet).getAllByRole('radio');
    expect(times).toHaveLength(48);
    expect(
      times.map((radio) => radio.closest('label')?.textContent?.trim()).slice(0, 3),
    ).toStrictEqual(['00:00', '00:30', '01:00']);
    fireEvent.click(within(sheet).getByRole('radio', { name: '21:00' }));

    sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.title });
    fireEvent.click(
      within(sheet).getByRole('button', { name: activityDeckCopy.readingContext.confirm }),
    );
    await waitFor(() => {
      expect(pathname()).toMatch(/^\/session\//);
    });
    const [selection] = payloads(harness, 'POST /v1/activity-cards/:cardId/selection');
    expect(selection).toMatchObject({ readingContext: 'custom_time', customTime: '21:00' });
    const [create] = payloads(harness, 'POST /v1/sessions');
    expect(create).toMatchObject({ readingContext: 'custom_time', customTime: '21:00' });
  });

  it('legend 는 화면에서만 숨고(그룹 이름 유지, `D4-63`) · 시간 뷰 `Back` 은 헤더 왼쪽 첫 포커스다 (`D4-64`)', async () => {
    await renderApp();
    fireEvent.click(await firstStartButton());
    let sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.title });
    expect(
      within(sheet).getByRole('group', { name: activityDeckCopy.readingContext.legend }),
    ).toBeTruthy();
    for (const legend of sheet.querySelectorAll('legend')) {
      expect(legend.classList.contains('haru-visually-hidden')).toBe(true);
    }

    fireEvent.click(
      within(sheet).getByRole('radio', {
        name: activityDeckCopy.readingContext.options.custom_time,
      }),
    );
    fireEvent.click(within(sheet).getByRole('button', { name: /Time/ }));
    sheet = await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.timeLabel });
    const header = sheet.querySelector('.haru-sheet__header');
    const back = within(sheet).getByRole('button', { name: activityDeckCopy.readingContext.back });
    expect(back.closest('.haru-sheet__leading')).not.toBeNull();
    expect(header?.firstElementChild?.contains(back)).toBe(true);
    expect(sheet.querySelector('.haru-sheet__trailing')).toBeNull();
    expect(
      within(sheet).getByRole('group', { name: activityDeckCopy.readingContext.timeLabel }),
    ).toBeTruthy();
    expect(sheet.querySelector('legend')?.classList.contains('haru-visually-hidden')).toBe(true);
    // 포커스 순서 = DOM 순서 — `Back` 이 시트 안 첫 포커스 대상이다. (뷰 전환 시 자동 포커스 이동은
    // 현행에도 없다 — 같은 Sheet 인스턴스라 focus trap 의 초기 포커스가 다시 돌지 않는다. handoff 보고)
    const focusables = sheet.querySelectorAll('button, input');
    expect(focusables[0]).toBe(back);
  });

  it('세션 생성이 실패하면 시트에 남아 오류를 보여 주고 선택은 보존된다', async () => {
    const harness = await renderApp({ scenarios: ['sessions.create:error'] });
    fireEvent.click(await firstStartButton());
    const sheet = await screen.findByRole('dialog', {
      name: activityDeckCopy.readingContext.title,
    });
    const bedtime = within(sheet).getByRole('radio', {
      name: activityDeckCopy.readingContext.options.bedtime,
    });
    fireEvent.click(bedtime);
    fireEvent.click(
      within(sheet).getByRole('button', { name: activityDeckCopy.readingContext.confirm }),
    );

    expect(await within(sheet).findByText(activityDeckCopy.card.startFailed)).toBeTruthy();
    expect(pathname()).toBe(ROUTES.home);
    expect((bedtime as HTMLInputElement).checked).toBe(true);
    expect(ops(harness, 'POST /v1/sessions')).toHaveLength(1);
  });
});

describe('AC-4-123 · 124 — 오프라인 캐시 카드 (`D4-33` · `D4-39`)', () => {
  it('Start Session 은 aria-disabled + 포커스 가능, 사유 = 배너 제목, 눌러도 요청 0', async () => {
    const harness = await renderApp({
      scenarios: ['activity-cards:offline-cached-card'],
      cachedCard: true,
    });
    await screen.findByText(activityDeckCopy.states.cachedTitle);
    const start = await firstStartButton();

    expect(start.getAttribute('aria-disabled')).toBe('true');
    expect(start.hasAttribute('disabled')).toBe(false);
    const describedBy = start.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)?.textContent).toBe(
      activityDeckCopy.states.cachedTitle,
    );

    fireEvent.click(start);
    fireEvent.keyDown(start, { key: 'Enter' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(ops(harness, 'selection')).toHaveLength(0);
    expect(ops(harness, 'POST /v1/sessions')).toHaveLength(0);

    // Save 는 활성이다 (AC-4-124 ①)
    const front = document.querySelector('.haru-activity-card-flip__face--front') as HTMLElement;
    const save = within(front).getByRole('button', { name: activityDeckCopy.card.save });
    expect(save.getAttribute('aria-disabled')).toBeNull();
  });
});

describe('서재 경로 — Reading Context 없이 `childBookId` 로 시작 (`D4-25`, AC-4-38 · 39)', () => {
  it('책 상세 시트의 Start Session → `POST /v1/sessions` 1회 → ready', async () => {
    const harness = await renderApp({ path: ROUTES.library });
    await waitFor(() => {
      expect(document.querySelector('.haru-shelf-item--pressable')).not.toBeNull();
    });
    fireEvent.click(document.querySelector('.haru-shelf-item--pressable') as HTMLElement);
    const sheet = await screen.findByRole('dialog');
    fireEvent.click(
      within(sheet).getByRole('button', { name: libraryCopy.bookSheet.startSession.label }),
    );
    await waitFor(() => {
      expect(pathname()).toMatch(/^\/session\//);
    });
    expect(ops(harness, 'POST /v1/sessions')).toHaveLength(1);
    const [create] = payloads(harness, 'POST /v1/sessions');
    expect(create).toMatchObject({
      readingContext: null,
      bookId: null,
      activityCardOptionId: null,
    });
    expect((create as { childBookId: string | null }).childBookId).not.toBeNull();
    await screen.findByRole('button', { name: storytimeSessionCopy.record.start });
  });
});

describe('AC-4-40 · 120 · 121 · 122 — ready 버블 = 서버 값 그대로 (`D4-14` · `D4-20`~`D4-22`)', () => {
  function bubble(): HTMLElement {
    const node = document.querySelector('.haru-session-bubble .haru-bubble');
    if (node === null) throw new Error('bubble not rendered');
    return node as HTMLElement;
  }

  it('제목 줄 = Mock `bubble.text`, pill 5개 = Mock `prompts` 글자 그대로 · 서버 순서', async () => {
    const harness = await renderApp();
    await startFromHome(harness);

    const title = bubble().querySelector('.haru-bubble__content > .haru-text');
    expect(title?.textContent).toBe(MOCK_READY_BUBBLE?.text);
    expect(title?.className).toContain('haru-text--truncate-1');
    const pills = [...bubble().querySelectorAll('.haru-prompt-pill')];
    expect(pills).toHaveLength(5);
    expect(pills.map((pill) => pill.querySelector('.haru-text')?.textContent)).toStrictEqual(
      SESSION_PROMPTS.map((prompt) => prompt.text),
    );
    expect(pills.every((pill) => pill.classList.contains('haru-prompt-pill--session'))).toBe(true);
    // tail 이 위 메달리온을 가리킨다 (Type3)
    expect(bubble().classList.contains('haru-bubble--tail-top-center')).toBe(true);
  });

  it.each([
    ['greeting-missing', 'bubble: null'],
    ['greeting-empty', "text: ''"],
  ])('`session-greeting:%s` (%s) → 제목 줄 노드 0 · pill 은 그대로 · 대체 문구 0', async (key) => {
    const harness = await renderApp({ scenarios: [`session-greeting:${key}`] });
    await startFromHome(harness);
    expect(bubble().querySelectorAll('.haru-bubble__content > .haru-text')).toHaveLength(0);
    expect(bubble().querySelectorAll('.haru-prompt-pill')).toHaveLength(5);
    expect(bubble().textContent).not.toMatch(/Try this prompt/);
  });

  it('긴 인사도 가공하지 않는다 — 문자열은 그대로이고 1줄 clamp 는 CSS 표시 처리다', async () => {
    const harness = await renderApp({ scenarios: ['session-greeting:greeting-long'] });
    await startFromHome(harness);
    const title = bubble().querySelector('.haru-bubble__content > .haru-text');
    expect(title?.textContent).toBe(MOCK_READY_BUBBLE_LONG?.text);
    expect(title?.className).toContain('haru-text--truncate-1');
  });

  it.each([
    ['prompts-1', 1],
    ['prompts-3', 3],
    ['prompts-7', 5],
  ])('`session:%s` → pill %i 개 (5 에서 컷오프 — cap 아님 `D-21`)', async (key, rendered) => {
    const harness = await renderApp({ scenarios: [`session:${key}`] });
    await startFromHome(harness);
    expect(bubble().querySelectorAll('.haru-prompt-pill')).toHaveLength(rendered);
  });

  it('`session:prompts-empty` → contracts 는 받아들이고(.min 없음) 화면은 빈 버블을 만들지 않는다', async () => {
    const harness = await renderApp({ scenarios: ['session:prompts-empty'] });
    await startFromHome(harness);
    expect(document.querySelector('.haru-session-bubble')).toBeNull();
  });
});

describe('AC-4-46 화면 — ready 5분 리마인드 = 제목 줄만 `reminderBubble.text` (`S4-F1R`, `D4-59`)', () => {
  const MINUTE = 60_000;

  function title(): Element | null {
    return document.querySelector('.haru-session-bubble .haru-bubble__content > .haru-text');
  }

  /** 녹음 시계를 실제 시각에서 출발시킨다 — 서버 `readyAt`(시스템 시각) 기준 경과가 0 근처가 된다. */
  async function openReady(scenarios?: readonly string[]) {
    const time = createManualScheduler(Date.now());
    const harness = await renderApp({
      recorderTime: time,
      ...(scenarios === undefined ? {} : { scenarios }),
    });
    await startFromHome(harness);
    return { harness, time };
  }

  function advance(time: ManualScheduler, ms: number): void {
    act(() => {
      time.advance(ms);
    });
  }

  it('① 5분 전 = 인사 ② 5분 후 = 리마인드 문구(제목 글자 변화 1회) · pill 불변 · 같은 노드', async () => {
    const { time } = await openReady();
    const node = title();
    const pills = document.querySelector('.haru-session-bubble__prompts')?.outerHTML;

    // 제목 노드의 글자 변화 횟수 = 렌더 결과가 바뀐 횟수 (주입 clock 으로만 시간이 흐른다)
    let textChanges = 0;
    const observer = new MutationObserver((records) => {
      textChanges += records.length;
    });
    if (node === null) throw new Error('title not rendered');
    observer.observe(node, { characterData: true, childList: true, subtree: true });

    advance(time, 5 * MINUTE - 2_000);
    expect(title()?.textContent).toBe(MOCK_READY_BUBBLE?.text);
    expect(textChanges).toBe(0);

    advance(time, 4_000);
    await waitFor(() => {
      expect(title()?.textContent).toBe(MOCK_READY_REMINDER_BUBBLE?.text);
    });
    const afterReminder = textChanges;
    expect(afterReminder).toBeGreaterThan(0);
    expect(title()).toBe(node);
    expect(title()?.className).toContain('haru-text--truncate-1');
    expect(document.querySelector('.haru-session-bubble__prompts')?.outerHTML).toBe(pills);

    // 1회 — 방치 직전까지 다시 바뀌지 않는다
    advance(time, 4 * MINUTE);
    expect(textChanges).toBe(afterReminder);
    expect(title()?.textContent).toBe(MOCK_READY_REMINDER_BUBBLE?.text);
    observer.disconnect();
  });

  it('③ `session-greeting:reminder-missing` → 5분 전후 화면 DOM 이 같다 (대체 문구 0)', async () => {
    const { time } = await openReady(['session-greeting:reminder-missing']);
    const screenNode = document.querySelector('.haru-session');
    advance(time, 5 * MINUTE - 2_000);
    const before = screenNode?.innerHTML;
    advance(time, 4_000);
    await act(async () => {
      await Promise.resolve();
    });
    expect(document.querySelector('.haru-session')?.innerHTML).toBe(before);
    expect(title()?.textContent).toBe(MOCK_READY_BUBBLE?.text);
  });

  it('④ 10분 → `ready → abandoned` 1건 → `/` (리마인드 문구와 무관한 회귀)', async () => {
    const { harness, time } = await openReady();
    advance(time, 10 * MINUTE + 1_000);
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    await waitFor(() => {
      const transitions = payloads(harness, 'POST /v1/sessions/:sessionId/transitions');
      expect(transitions).toHaveLength(1);
      expect(transitions[0]).toMatchObject({ to: 'abandoned' });
    });
  });
});

describe('AC-4-111 · 117 — ready 의 Record Control · 하단 바', () => {
  it('Record 변형 + `Tap to recording` · Discard/Submit 은 aria-disabled + 포커스 가능 + 사유 연결 · 눌러도 요청 0', async () => {
    const harness = await renderApp();
    await startFromHome(harness);

    const record = screen.getByRole('button', { name: storytimeSessionCopy.record.start });
    expect(record.querySelector('.haru-record__caption')?.textContent).toBe(
      storytimeSessionCopy.record.caption,
    );

    const group = screen.getByRole('group', { name: storytimeSessionCopy.actions.groupLabel });
    const discard = within(group).getByRole('button', {
      name: storytimeSessionCopy.actions.discard,
    });
    const submit = within(group).getByRole('button', { name: storytimeSessionCopy.actions.submit });
    for (const button of [discard, submit]) {
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.hasAttribute('disabled')).toBe(false);
      const reason = document.getElementById(button.getAttribute('aria-describedby') ?? '');
      expect(reason?.textContent).toBe(storytimeSessionCopy.actions.readyReason);
      button.focus();
      expect(document.activeElement).toBe(button);
    }
    expect(discard.className).toContain('haru-button--neutral');
    expect(submit.className).toContain('haru-button--accent');

    const before = ops(harness, 'transitions').length;
    fireEvent.click(discard);
    fireEvent.click(submit);
    expect(ops(harness, 'transitions')).toHaveLength(before);
  });

  it('Record 를 누르면 전이 1건 · 같은 노드에서 Pause 로 바뀌고 · 바가 활성화되고 · 버블이 사라진다', async () => {
    const harness = await renderApp();
    await startFromHome(harness);

    const record = screen.getByRole('button', { name: storytimeSessionCopy.record.start });
    const discard = screen.getByRole('button', { name: storytimeSessionCopy.actions.discard });
    fireEvent.click(record);

    await waitFor(() => {
      expect(record.getAttribute('aria-label')).toBe(storytimeSessionCopy.record.pause);
    });
    expect(screen.getByRole('button', { name: storytimeSessionCopy.record.pause })).toBe(record);
    expect(screen.getByRole('button', { name: storytimeSessionCopy.actions.discard })).toBe(
      discard,
    );
    expect(discard.getAttribute('aria-disabled')).toBeNull();
    expect(document.querySelector('.haru-session-bubble')).toBeNull();
    await waitFor(() => {
      expect(payloads(harness, 'POST /v1/sessions/:sessionId/transitions')).toHaveLength(1);
    });
    expect(payloads(harness, 'POST /v1/sessions/:sessionId/transitions')[0]).toMatchObject({
      to: 'recording',
    });
  });
});

describe('AC-4-136 — ready 닫기 (`D4-57`, Figma `300:1318`)', () => {
  it('확인 다이얼로그 없이 `ready → abandoned` 1건 → `/`', async () => {
    const harness = await renderApp();
    await startFromHome(harness);

    fireEvent.click(screen.getByRole('button', { name: storytimeSessionCopy.close }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    const transitions = payloads(harness, 'POST /v1/sessions/:sessionId/transitions');
    expect(transitions).toHaveLength(1);
    expect(transitions[0]).toMatchObject({ to: 'abandoned' });
  });

  it('요청이 실패하면 화면에 머물고 오류를 알린다 (이동 0)', async () => {
    const harness = await renderApp({ scenarios: ['sessions.transition:error'] });
    await startFromHome(harness);

    fireEvent.click(screen.getByRole('button', { name: storytimeSessionCopy.close }));
    expect(await screen.findByText(storytimeSessionCopy.closeFailed)).toBeTruthy();
    expect(pathname()).toMatch(/^\/session\//);
    expect(screen.getByRole('button', { name: storytimeSessionCopy.record.start })).toBeTruthy();
    expect(ops(harness, 'transitions')).toHaveLength(1);
  });

  it('ready 에는 Prompts 칩·책 칩이 없다 (Figma `300:1309` — 닫기 하나만 추가)', async () => {
    const harness = await renderApp();
    await startFromHome(harness);
    const screenRoot = document.querySelector('.haru-session') as HTMLElement;
    expect(within(screenRoot).queryByRole('button', { name: /Prompts/ })).toBeNull();
    expect(screenRoot.querySelector('.haru-session-book-chip')).toBeNull();
    expect(
      screenRoot.querySelector('.haru-session__top-row')?.querySelectorAll('button'),
    ).toHaveLength(1);
  });
});
