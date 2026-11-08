/**
 * Stage 4b `S4-F2` — recording · paused (Plan §13 · AC-4-41 · 42 · 43 화면 · 112~116 · 125~129).
 *
 * 실제 앱과 같은 provider 순서(`createHarness`) + **Mock 녹음 조립**(MockRecorderAdapter + 메모리 저장소)
 * 위에서 Home → ready → 녹음 시작 → 일시정지 → 재개 → `Submit` / `Discard` 를 끝까지 간다.
 * 요청 증거 = Mock 요청 로그(`bundle.requestLog`), 로컬 증거 = Mock 저장소의 **실제 파일 수**
 * (`controls.files`) · outbox 색인 키 (2시점 측정). 시간 = 주입 수동 시계(`createManualScheduler`).
 *
 * 기하·픽셀(배치 y · 가운데 · 그림자 · baseline)은 `e2e/session-recording.spec.ts` 가 덮는다.
 * 클릭은 `fireEvent` 다 — 이 저장소는 `@testing-library/user-event` 를 쓰지 않는다.
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Link, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { activityDeckCopy } from '../src/features/activity-card-deck';
import { storytimeSessionCopy } from '../src/features/storytime-session';
import {
  MOCK_COMPLETION_BUBBLE,
  MOCK_SESSION_BOOK_LONG_TITLE,
  MOCK_STICKER_MESSAGE,
  MOCK_STICKER_TITLE,
  MOCK_SESSION_BOOK_NO_COVER,
} from '../src/mocks/fixtures/sessions';
import { ROUTES, sessionCompletePath, sessionPath } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { createHarness, type Harness } from '../src/test/harness';
import { createManualScheduler, type ManualScheduler } from '../src/test/manual-scheduler';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const TRANSITIONS = 'POST /v1/sessions/:sessionId/transitions';
const copy = storytimeSessionCopy;

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

function transitions(harness: Harness): readonly Record<string, unknown>[] {
  return harness.bundle.requestLog
    .entries()
    .filter((entry) => entry.operation === TRANSITIONS)
    .map((entry) => entry.payload as Record<string, unknown>);
}

/** 비동기 저장·전이 체인이 끝나도록 마이크로태스크를 충분히 돌린다. */
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

/** Home → Start Session → Reading Context → ready. 녹음 시계는 실제 시각에서 출발한다. */
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
  return { harness, time, sessionId };
}

function advance(time: ManualScheduler, ms: number): void {
  act(() => {
    time.advance(ms);
  });
}

/** ready → recording, 그리고 `seconds` 초 녹음한다 (청크 1개 / 초). */
async function recordFor(opened: Opened, seconds: number): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: copy.record.start }));
  await screen.findByRole('button', { name: copy.record.pause });
  await flush();
  for (let i = 0; i < seconds; i += 1) {
    advance(opened.time, 1_000);
    await flush();
  }
}

function localFiles(opened: Opened): number {
  return opened.harness.recordingStorage()?.controls.files(opened.sessionId).length ?? 0;
}

/** outbox 에 남은 전이의 `to` 값 (적재 순서). */
async function outboxTargets(opened: Opened): Promise<readonly unknown[]> {
  const storage = opened.harness.recordingStorage();
  if (storage === null) return [];
  const entries = await storage.kv.list('outbox');
  return entries.map((entry) => (entry as { request?: { to?: unknown } }).request?.to);
}

function timer(): string {
  return screen.getByRole('timer').textContent ?? '';
}

afterEach(() => {
  globalThis.localStorage.clear();
});

describe('AC-4-41 · 112 · 125 — Record → recording: 같은 노드 · 책 칩 · 상태 블록 · Prompts 칩 · 바 활성', () => {
  it('전이 `ready → recording` 1건 · Record Control 이 같은 노드에서 Pause · 버블이 빠지고 책 칩 + 상태 블록', async () => {
    const opened = await openReady();
    const record = screen.getByRole('button', { name: copy.record.start });
    const bar = document.querySelector('.haru-session-actions');
    const medallion = document.querySelector('.haru-session__medallion');
    const close = screen.getByRole('button', { name: copy.close });

    await recordFor(opened, 0);

    expect(screen.getByRole('button', { name: copy.record.pause })).toBe(record);
    expect(document.querySelector('.haru-session-actions')).toBe(bar);
    expect(document.querySelector('.haru-session__medallion')).toBe(medallion);
    expect(screen.getByRole('button', { name: copy.close })).toBe(close);

    expect(transitions(opened.harness)).toHaveLength(1);
    expect(transitions(opened.harness)[0]).toMatchObject({ to: 'recording' });

    expect(document.querySelector('.haru-session-bubble')).toBeNull();
    expect(document.querySelector('.haru-session-book-chip')).not.toBeNull();
    expect(screen.getByText(copy.status.recording)).toBeTruthy();
    expect(screen.getByText('Up to 30:00')).toBeTruthy();
    expect(timer()).toBe('00:00');

    // Discard · Submit 활성 (aria-disabled 0) · `Done Reading` 라벨 0 (AC-4-41)
    const buttons = within(bar as HTMLElement).getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toStrictEqual([
      copy.actions.discard,
      copy.actions.submit,
    ]);
    for (const button of buttons) expect(button.getAttribute('aria-disabled')).toBeNull();
    expect(screen.queryByText(/Done Reading/i)).toBeNull();
  });

  it('Prompts 칩 = 좌상단 버튼(이름 `Prompts`) — recording 에만, ready 에는 없다 · disclosure(닫힘)로 시작', async () => {
    const opened = await openReady();
    expect(screen.queryByRole('button', { name: copy.prompts })).toBeNull();
    await recordFor(opened, 0);
    const chip = screen.getByRole('button', { name: copy.prompts });
    const row = document.querySelector('.haru-session__top-row') as HTMLElement;
    expect(row.firstElementChild).toBe(chip);
    expect(chip.classList.contains('haru-button--sm')).toBe(true);
    expect(chip.getAttribute('aria-disabled')).toBeNull();
    // `S4-G1` 팝업 슬롯 연결 — 닫힌 disclosure 로 시작한다 (팝업 동작은 `session-prompts.test.tsx`)
    expect(chip.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById(chip.getAttribute('aria-controls') ?? '')).not.toBeNull();
    fireEvent.click(chip);
    expect(transitions(opened.harness)).toHaveLength(1); // 칩은 세션 상태를 바꾸지 않는다
  });
});

describe('AC-4-42 · 43 · 127 — 경과 시간 · 일시정지 · 재개(Record Control 토글)', () => {
  it('시간이 recordedSeconds 로 오르고 · Pause → 고정 · paused 문구 · Resume 버튼 없이 Record Control 로 재개', async () => {
    const opened = await openReady();
    await recordFor(opened, 3);
    expect(timer()).toBe('00:03');

    fireEvent.click(screen.getByRole('button', { name: copy.record.pause }));
    await screen.findByRole('button', { name: copy.record.resume });
    await flush();
    expect(transitions(opened.harness).map((body) => body['to'])).toStrictEqual([
      'recording',
      'paused',
    ]);
    expect(screen.getByText(copy.status.paused)).toBeTruthy();
    expect(screen.getByText(copy.status.pausedHint)).toBeTruthy();
    expect(document.querySelector('.haru-session-status--paused')).not.toBeNull();
    expect(document.querySelector('.haru-record__caption')?.textContent).toBe(
      copy.record.resumeCaption,
    );
    expect(screen.queryByRole('button', { name: /^Resume$/ })).toBeNull();

    // paused 동안 60초 → 시간 불변 (AC-4-43 화면)
    advance(opened.time, 60_000);
    await flush();
    expect(timer()).toBe('00:03');

    fireEvent.click(screen.getByRole('button', { name: copy.record.resume }));
    await screen.findByRole('button', { name: copy.record.pause });
    await flush();
    expect(transitions(opened.harness).map((body) => body['to'])).toStrictEqual([
      'recording',
      'paused',
      'recording',
    ]);
    advance(opened.time, 2_000);
    await flush();
    expect(timer()).toBe('00:05');
  });
});

describe('AC-4-114 — Submit → completed(user_done) + Toast + 완료 화면', () => {
  it.each([
    ['recording', false],
    ['paused', true],
  ])(
    '%s 에서 Submit: 전이 1건 · Toast `Recording submitted` · `/session/:id/complete`',
    async (_label, pause) => {
      const opened = await openReady();
      await recordFor(opened, 2);
      if (pause) {
        fireEvent.click(screen.getByRole('button', { name: copy.record.pause }));
        await screen.findByRole('button', { name: copy.record.resume });
        await flush();
      }
      fireEvent.click(screen.getByRole('button', { name: copy.actions.submit }));
      await waitFor(() => {
        expect(pathname()).toBe(`/session/${opened.sessionId}/complete`);
      });
      expect(await screen.findByText(copy.submitted)).toBeTruthy();
      const last = transitions(opened.harness).at(-1);
      expect(last).toMatchObject({ to: 'completed', completedReason: 'user_done' });
      expect(transitions(opened.harness).filter((body) => body['to'] === 'completed')).toHaveLength(
        1,
      );
    },
  );

  it('Submit 두 번 → completed 요청 1건 (중복 제출 0)', async () => {
    const opened = await openReady();
    await recordFor(opened, 1);
    const submit = screen.getByRole('button', { name: copy.actions.submit });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await waitFor(() => {
      expect(pathname()).toMatch(/\/complete$/);
    });
    expect(transitions(opened.harness).filter((body) => body['to'] === 'completed')).toHaveLength(
      1,
    );
  });
});

describe('AC-4-113 · 115 · 116 — Discard 확인 다이얼로그 (`D4-13`·`D4-17`)', () => {
  it('Discard → 다이얼로그 먼저(요청 0) · 문구 4건 · 취소 → 요청 0 · 로컬·상태 유지 · 녹음 계속 · 포커스 Discard', async () => {
    const opened = await openReady();
    await recordFor(opened, 3);
    const before = transitions(opened.harness).length;
    const files = localFiles(opened);
    expect(files).toBeGreaterThan(0);

    const discard = screen.getByRole('button', { name: copy.actions.discard });
    discard.focus();
    fireEvent.click(discard);
    const dialog = await screen.findByRole('alertdialog', { name: copy.discardDialog.title });
    expect(within(dialog).getByText(copy.discardDialog.description)).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: copy.discardDialog.confirm })).toBeTruthy();
    const cancel = within(dialog).getByRole('button', { name: copy.discardDialog.cancel });
    expect(document.activeElement).toBe(cancel); // destructive → 초기 포커스 = 취소
    expect(transitions(opened.harness)).toHaveLength(before);

    // 다이얼로그가 열린 동안에도 녹음은 계속된다
    advance(opened.time, 2_000);
    await flush();
    expect(timer()).toBe('00:05');

    fireEvent.click(cancel);
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(transitions(opened.harness)).toHaveLength(before);
    expect(localFiles(opened)).toBeGreaterThanOrEqual(files);
    expect(screen.getByRole('button', { name: copy.record.pause })).toBeTruthy();
    expect(document.activeElement).toBe(discard);
  });

  it('Escape 도 취소다 — 요청 0 · paused 유지', async () => {
    const opened = await openReady();
    await recordFor(opened, 1);
    fireEvent.click(screen.getByRole('button', { name: copy.record.pause }));
    await screen.findByRole('button', { name: copy.record.resume });
    await flush();
    const before = transitions(opened.harness).length;
    fireEvent.click(screen.getByRole('button', { name: copy.actions.discard }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(transitions(opened.harness)).toHaveLength(before);
    expect(screen.getByRole('button', { name: copy.record.resume })).toBeTruthy();
  });

  it('확인 → `→ abandoned` 1건(사유 필드 0) → 서버 확정 뒤 로컬 삭제(전 > 0 · 후 = 0) → `/`', async () => {
    const opened = await openReady();
    await recordFor(opened, 3);
    const before = localFiles(opened);
    expect(before).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: copy.actions.discard }));
    const dialog = await screen.findByRole('alertdialog');
    const confirm = within(dialog).getByRole('button', { name: copy.discardDialog.confirm });
    fireEvent.click(confirm);
    fireEvent.click(confirm); // 재탭 — 이중 요청 0 (AC-4-129 ⑤)
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    await flush();
    const abandoned = transitions(opened.harness).filter((body) => body['to'] === 'abandoned');
    expect(abandoned).toHaveLength(1);
    // 전이표 안의 값만 — 사유 필드(`completedReason`·`reason`) 0 (`D4-13` 안 A)
    expect(Object.keys(abandoned[0] ?? {}).sort()).toStrictEqual(['occurredAt', 'sessionId', 'to']);
    expect(localFiles(opened)).toBe(0);
    // 폐기 Toast 없음 (Stage 4 Spec §2.5.2 ⑥)
    expect(screen.queryByText(copy.submitted)).toBeNull();
  });

  it('전이 실패(`sessions.transition:error`) → 로컬 보존 · 홈으로', async () => {
    const opened = await openReady(['sessions.transition:error']);
    await recordFor(opened, 3);
    const before = localFiles(opened);
    expect(before).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: copy.actions.discard }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: copy.discardDialog.confirm }));
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    await flush();
    // 캡처 종료가 마지막 조각 1개를 더 쓴다 — 지워진 것은 0 (보존)
    expect(localFiles(opened)).toBe(before + 1);
  });

  it('오프라인(`sessions.transition:offline`) → 폐기 전이가 outbox 에 남고 로컬 보존 · 홈으로', async () => {
    const opened = await openReady(['sessions.transition:offline']);
    await recordFor(opened, 2);
    const before = localFiles(opened);
    fireEvent.click(screen.getByRole('button', { name: copy.actions.discard }));
    const dialog = await screen.findByRole('alertdialog');
    fireEvent.click(within(dialog).getByRole('button', { name: copy.discardDialog.confirm }));
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    await flush();
    expect(localFiles(opened)).toBe(before + 1);
    expect(await outboxTargets(opened)).toContain('abandoned');
  });
});

describe('AC-4-129 — recording · paused 닫기 = Discard 와 같은 다이얼로그 (`D4-56`)', () => {
  it('닫기 → 같은 다이얼로그(문구 4건 동일) · 요청 0 · 취소 → 포커스 닫기 · 확인 → abandoned 1건 → `/`', async () => {
    const opened = await openReady();
    await recordFor(opened, 2);
    const before = transitions(opened.harness).length;
    const close = screen.getByRole('button', { name: copy.close });
    close.focus();
    fireEvent.click(close);
    const dialog = await screen.findByRole('alertdialog', { name: copy.discardDialog.title });
    expect(within(dialog).getByText(copy.discardDialog.description)).toBeTruthy();
    expect(transitions(opened.harness)).toHaveLength(before);
    fireEvent.click(within(dialog).getByRole('button', { name: copy.discardDialog.cancel }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(document.activeElement).toBe(close);
    expect(transitions(opened.harness)).toHaveLength(before);

    fireEvent.click(close);
    const again = await screen.findByRole('alertdialog');
    fireEvent.click(within(again).getByRole('button', { name: copy.discardDialog.confirm }));
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    expect(transitions(opened.harness).filter((body) => body['to'] === 'abandoned')).toHaveLength(
      1,
    );
  });
});

describe('AC-4-126 — 책 칩 fixture 3종 (`session:book-*`)', () => {
  it('기본 = 요청한 책의 제목 그대로 + 표지 이미지', async () => {
    const opened = await openReady();
    await recordFor(opened, 0);
    const chip = document.querySelector('.haru-session-book-chip');
    expect(chip?.querySelector('img')).not.toBeNull();
    expect(
      chip?.querySelector('.haru-session-book-chip__title')?.textContent?.length,
    ).toBeGreaterThan(0);
  });

  it('`book-missing` → 칩 0 · 자리(slot) 유지', async () => {
    const opened = await openReady(['session:book-missing']);
    await recordFor(opened, 0);
    expect(document.querySelector('.haru-session-book-chip')).toBeNull();
    expect(document.querySelector('.haru-session__book-slot')).not.toBeNull();
  });

  it('`book-no-cover` → 그라디언트 자리 · 이미지 0', async () => {
    const opened = await openReady(['session:book-no-cover']);
    await recordFor(opened, 0);
    expect(document.querySelector('.haru-session-book-chip img')).toBeNull();
    expect(document.querySelector('.haru-session-book-chip__cover--placeholder')).not.toBeNull();
    expect(screen.getByText(MOCK_SESSION_BOOK_NO_COVER.title)).toBeTruthy();
  });

  it('`book-long-title` → 제목 글자 그대로 (말줄임은 CSS)', async () => {
    const opened = await openReady(['session:book-long-title']);
    await recordFor(opened, 0);
    expect(document.querySelector('.haru-session-book-chip__title')?.textContent).toBe(
      MOCK_SESSION_BOOK_LONG_TITLE.title,
    );
  });
});

describe('S4-H1 — 완료 화면 데이터 (AC-4-58 · 59 · 60)', () => {
  const DETAIL = 'GET /v1/sessions/:sessionId';

  function detailReads(harness: Harness): number {
    return harness.bundle.requestLog.entries().filter((entry) => entry.operation === DETAIL).length;
  }

  async function submitted(): Promise<Opened> {
    const opened = await openReady();
    await recordFor(opened, 1);
    fireEvent.click(screen.getByRole('button', { name: copy.actions.submit }));
    await screen.findByRole('heading', { name: copy.complete.title });
    return opened;
  }

  /** 새로고침과 같은 재진입 — 같은 Mock 서버, 빈 캐시, 실제 Route Guard 경로. */
  async function reenter(opened: Opened): Promise<void> {
    cleanup();
    opened.harness.queryClient.clear();
    const Wrapper = opened.harness.wrapper;
    render(
      <Wrapper>
        <Link to={sessionCompletePath(opened.sessionId)}>re-enter</Link>
        <AppRoutes />
      </Wrapper>,
    );
    await flush();
    fireEvent.click(screen.getByRole('link', { name: 're-enter' }));
    await waitForGuard();
    await screen.findByRole('heading', { name: copy.complete.title });
  }

  it('전이 응답 문구를 그대로 표시하고 다시 조회하지 않는다', async () => {
    const opened = await openReady();
    const before = detailReads(opened.harness);
    await recordFor(opened, 1);
    fireEvent.click(screen.getByRole('button', { name: copy.actions.submit }));
    await screen.findByRole('heading', { name: copy.complete.title });

    expect(screen.getByText(MOCK_COMPLETION_BUBBLE?.text ?? '')).toBeTruthy();
    const sticker = screen
      .getAllByRole('status')
      .find((node) => node.classList.contains('haru-attendance-sticker'));
    expect(sticker?.textContent).toBe(`${MOCK_STICKER_TITLE}${MOCK_STICKER_MESSAGE}`);
    expect(detailReads(opened.harness)).toBe(before);
  });

  it('재진입: 스티커 1개 · 버블은 `SessionDetail.completionBubble` 값 · 전이 추가 0 (AC-4-58 · 60)', async () => {
    const opened = await submitted();
    const sent = transitions(opened.harness).length;
    await reenter(opened);

    await screen.findByText(MOCK_STICKER_MESSAGE);
    expect(document.querySelectorAll('.haru-attendance-sticker')).toHaveLength(1);
    expect(document.querySelector('.haru-session-bubble--complete')?.textContent).toBe(
      `${MOCK_COMPLETION_BUBBLE.text}${MOCK_COMPLETION_BUBBLE.subtext}`,
    );
    expect(transitions(opened.harness)).toHaveLength(sent);
  });

  it('AC-4-139 ① 보조 줄은 응답 값 그대로 · 주 문구 아래 · 시간 값과 무관하다', async () => {
    await submitted();
    const line = document.querySelector('.haru-session-bubble--complete .haru-bubble__content');
    expect([...(line?.children ?? [])].map((node) => node.textContent)).toStrictEqual([
      MOCK_COMPLETION_BUBBLE.text,
      MOCK_COMPLETION_BUBBLE.subtext,
    ]);
    // 1초 녹음인데 `14 min` — Frontend 가 `recordedSeconds` 로 만들지 않았다는 증거다 (AC-4-139 ④).
    expect(document.querySelector('.haru-bubble__hint')).toBeNull();
  });

  it.each([
    ['session-completion:subtext-missing', true],
    ['session-completion:bubble-missing', false],
  ])('AC-4-139 ② `%s` → 전이 응답 · 재진입 모두 보조 줄 0', async (scenario, hasBubble) => {
    const opened = await openReady([scenario]);
    await recordFor(opened, 1);
    fireEvent.click(screen.getByRole('button', { name: copy.actions.submit }));
    await screen.findByRole('heading', { name: copy.complete.title });

    for (const pass of ['transition', 'detail']) {
      if (pass === 'detail') {
        await reenter(opened);
        await screen.findByText(MOCK_STICKER_MESSAGE);
      }
      expect(document.querySelector('.haru-session-bubble__subtext')).toBeNull();
      expect(document.querySelector('.haru-session-bubble--complete') !== null).toBe(hasBubble);
    }
  });

  it('AC-4-140 ⑤ / `D4-91` 끝난 적 없는 세션(`ready`) 직접 진입 → 홈 replace · 전이 0', async () => {
    const opened = await openReady();
    const { harness } = opened;
    // 세션 화면을 지나지 않는 경로 — Mock 서버는 ready 그대로, 캐시만 비운 재진입이다.
    cleanup();
    harness.queryClient.clear();
    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <LocationProbe />
        <Link to={sessionCompletePath(opened.sessionId)}>re-enter</Link>
        <AppRoutes />
      </Wrapper>,
    );
    await flush();
    fireEvent.click(screen.getByRole('link', { name: 're-enter' }));
    await waitForGuard();
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    expect(screen.queryByRole('heading', { name: copy.complete.title })).toBeNull();
    expect(transitions(harness)).toHaveLength(0);
  });

  it.each(['recording', 'paused'] as const)(
    'AC-4-140 ⑤ / `D4-113` 끝나지 않은 세션(`%s`) 직접 진입 → 홈 replace · 전이 추가 0',
    async (status) => {
      const opened = await openReady();
      const { harness } = opened;
      await recordFor(opened, 1);
      if (status === 'paused') {
        fireEvent.click(screen.getByRole('button', { name: copy.record.pause }));
        await screen.findByRole('button', { name: copy.record.resume });
        await flush();
      }
      // 세션 화면을 떠난 뒤(새로고침과 같은 재진입) — 전이 응답 기억 없이 Detail 만으로 판정한다.
      cleanup();
      await flush();
      harness.queryClient.clear();
      const sent = transitions(harness).length;
      const detail = await harness.bundle.clients.sessions.getDetail({
        sessionId: opened.sessionId,
      });
      expect(detail.status).toBe(status);

      const Wrapper = harness.wrapper;
      render(
        <Wrapper>
          <LocationProbe />
          <Link to={sessionCompletePath(opened.sessionId)}>re-enter</Link>
          <AppRoutes />
        </Wrapper>,
      );
      await flush();
      fireEvent.click(screen.getByRole('link', { name: 're-enter' }));
      await waitForGuard();
      await waitFor(() => {
        expect(pathname()).toBe(ROUTES.home);
      });
      expect(screen.queryByRole('heading', { name: copy.complete.title })).toBeNull();
      expect(transitions(harness)).toHaveLength(sent);
    },
  );

  it('AC-4-140 ④ 오프라인 제출(`result: null`)은 판정 대상이 아니다 — 조회 0 · 튕김 0', async () => {
    const opened = await openReady(['sessions.transition:offline']);
    await recordFor(opened, 1);
    const reads = detailReads(opened.harness);
    fireEvent.click(screen.getByRole('button', { name: copy.actions.submit }));
    await screen.findByRole('heading', { name: copy.complete.title });
    await flush();

    expect(pathname()).toBe(sessionCompletePath(opened.sessionId));
    expect(detailReads(opened.harness)).toBe(reads);
    expect(document.querySelector('.haru-session-bubble--complete')).toBeNull();
    expect(document.querySelector('.haru-attendance-sticker')).toBeNull();
  });

  it('AC-4-141 닫기 → 홈 replace · 전이 추가 0', async () => {
    const opened = await submitted();
    const sent = transitions(opened.harness).length;
    fireEvent.click(screen.getByRole('button', { name: copy.close }));
    await waitFor(() => {
      expect(pathname()).toBe(ROUTES.home);
    });
    expect(transitions(opened.harness)).toHaveLength(sent);
  });

  it('조회 실패: 오류 화면 + 다시 시도가 재요청한다', async () => {
    const harness = createHarness({
      initialEntries: [sessionCompletePath('00000000-0000-4000-8000-000000000000')],
    });
    await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <AppRoutes />
      </Wrapper>,
    );

    await waitForGuard();
    const retry = await screen.findByRole('button', { name: copy.states.retry });
    const before = detailReads(harness);
    fireEvent.click(retry);
    await waitFor(() => {
      expect(detailReads(harness)).toBeGreaterThan(before);
    });
  });

  it.each([
    ['/session/:id', (id: string) => sessionPath(id)],
    ['/session/:id/complete', (id: string) => sessionCompletePath(id)],
  ])(
    'AC-4-144 `%s` 오류 화면: `Back to Home` 은 alert 밖 · 자동 포커스 0 · 홈 replace',
    async (_n, path) => {
      const harness = createHarness({
        initialEntries: [path('00000000-0000-4000-8000-000000000000')],
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
      const home = await screen.findByRole('button', { name: copy.states.backHome });
      expect(screen.getByRole('button', { name: copy.states.retry })).toBeTruthy();
      expect(home.closest('[role="alert"]')).toBeNull();
      expect(document.activeElement).not.toBe(home);
      fireEvent.click(home);
      await waitFor(() => {
        expect(pathname()).toBe(ROUTES.home);
      });
    },
  );
});
