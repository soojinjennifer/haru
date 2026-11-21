/**
 * 리포트 PDF — Stage 7 `S7-F` (`C13-S7-4`, Spec §2.6 · §9.1 · §10.4, Plan §5.3 · §5.5, FR-17 · `N7-19` · `N7-24` · `N7-40`).
 *
 * 실제 router + Mock Adapter(`report-pdf` scenario) + Mock `FileSharePort`(harness — 저장은 기록만) + **StrictMode**.
 * 폴링 2s · 상한 60s 는 가짜 타이머(`setTimeout` · `Date`)로 앞당긴다 — Mock 지연은 harness 의 즉시 타이머라 영향 없다.
 * 실제 Chromium 다운로드 이벤트 계수는 `e2e/report-pdf.spec.ts`.
 *
 * AC: 56(POST · 폴링 · ready · 자동 저장 0 · Save 탭 = 저장 1 · SR 1회) · 57(재탭 = 중복 POST 0 · 같은 키) ·
 *     58(failed → 재시도 · timeout → 폴링 중단 · offline) · 59(Save/Share · 취소 = 표시 0 · 거절 = 저장 안내 · 미지원 = Save 1) ·
 *     60(로그 0) · 61(카드 · 상세 같은 기록).
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { reportKeys } from '../src/entities/report';
import { progressOverviewCopy } from '../src/features/progress-overview';
import { reportPdfCopy as copy, type ReportPdfJob } from '../src/features/report-pdf';
import { MOCK_REPORT_IDS } from '../src/mocks/fixtures/reports';
import { progressReportPath, ROUTES } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { FileShareRejectedError } from '../src/shared/platform/file-share';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const POST = 'POST /v1/reports/:reportId/pdf';
const GET = 'GET /v1/reports/:reportId/pdf';
const PDF_NAME = /^haru-4-week-report-.*\.pdf$/;

let navigateFromTest: ((to: string) => void) | null = null;

function NavigateProbe() {
  const navigate = useNavigate();
  useEffect(() => {
    navigateFromTest = (to: string) => {
      void navigate(to);
    };
  }, [navigate]);
  return null;
}

let consoleCalls: unknown[][];

beforeEach(() => {
  consoleCalls = [];
  for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
    vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      consoleCalls.push(args);
    });
  }
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

type Entry = 'card' | 'detail';

async function renderAt(entry: Entry, scenarios: readonly string[] = []): Promise<Harness> {
  const harness = createHarness({
    initialEntries: [
      entry === 'card' ? ROUTES.progress : progressReportPath(MOCK_REPORT_IDS.latest),
    ],
    scenarios,
  });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const Wrapper = harness.wrapper;
  render(
    <StrictMode>
      <Wrapper>
        <NavigateProbe />
        <AppRoutes />
      </Wrapper>
    </StrictMode>,
  );
  await waitFor(() => {
    expect(screen.queryByRole('status', { name: appCopy.guard.loadingLabel })).toBeNull();
  });
  await screen.findByRole('button', { name: copy.download });
  // 화면이 뜬 뒤에 가짜 시계를 건다 — 폴링 간격 · 상한만 앞당긴다
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  return harness;
}

function operations(harness: Harness, operation: string): number {
  return harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation)
    .length;
}

/**
 * 가짜 시간 `ms` 를 흘리고 그 뒤 생긴 일까지 정착시킨다. TanStack 알림 배치는 `setTimeout(0)` 인데, fake-timers 는
 * tick 도중 예약된 0ms 를 **1ms** 로 바꾼다 — 그래서 1ms 를 더 흘리고 실제 이벤트 루프도 한 바퀴 돌린다.
 */
async function advance(ms: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
    await realTurn();
    await vi.advanceTimersByTimeAsync(1);
  });
}

/** 가짜 타이머를 걸기 전에 잡아 둔 실제 `setTimeout`. */
const realSetTimeout = globalThis.setTimeout;

/**
 * 실제 시간 2ms — TanStack 알림 배치는 import 때 잡힌 실제 `setTimeout(0)` 으로 돈다(가짜 시계로는 흐르지 않는다).
 */
function realTurn(): Promise<void> {
  return new Promise((resolve) => {
    realSetTimeout(resolve, 2);
  });
}

/**
 * 파일 받기(`fetch` data: URL)는 실제 비동기다 — 가짜 시계를 그대로 둔 채 실제 이벤트 루프를 돌리며
 * (가짜 0ms 타이머 = TanStack 알림 배치도 함께 흘린다) ready 가 될 때까지 기다린다.
 */
async function untilReady(): Promise<void> {
  for (let i = 0; i < 100; i += 1) {
    if (document.querySelector('.haru-report-pdf[data-state="ready"]') !== null) return;
    await advance(0);
  }
  throw new Error(`PDF did not become ready: ${pdfRoot().dataset.state ?? ''}`);
}

function pdfRoot(): HTMLElement {
  const root = document.querySelector<HTMLElement>('.haru-report-pdf');
  if (root === null) throw new Error('no pdf action');
  return root;
}

function liveRegion(): HTMLElement {
  return within(pdfRoot()).getByRole('status');
}

function tap(name: string): void {
  fireEvent.click(within(pdfRoot()).getByRole('button', { name }));
}

/** POST → GET generating(2s) → GET ready(4s) → 파일. Mock `success` 진행 (`MockReportPdfApi`). */
async function prepare(harness: Harness): Promise<void> {
  tap(copy.download);
  await advance(0);
  expect(operations(harness, POST)).toBe(1);
  await advance(2_000);
  await advance(2_000);
  await untilReady();
}

describe('ReportPdfAction — 카드(`110:835`) 발행 상태 · 상세 ⑦', () => {
  it('카드: Download PDF(idle) → loading + Preparing… → ready = Save · Share · 자동 저장 0 · Save 탭 = 저장 1 (AC-7-56 · 59)', async () => {
    const harness = await renderAt('card');
    const card = screen.getByRole('region', { name: progressOverviewCopy.reportCard.title });
    expect(within(card).getByRole('button', { name: copy.download })).toBeDefined();
    expect(liveRegion().textContent).toBe('');

    tap(copy.download);
    await advance(0);
    const busy = within(pdfRoot()).getByRole('button', { name: copy.download });
    expect(busy.getAttribute('aria-busy')).toBe('true');
    expect(liveRegion().textContent).toBe(copy.preparing);
    expect(operations(harness, POST)).toBe(1);
    expect(operations(harness, GET)).toBe(0);

    // 폴링 간격 2s — 그 전에는 GET 0
    // advance 는 정착용 1ms 를 더한다 — 여기까지 1ms 흘렀다
    await advance(1_997);
    expect(operations(harness, GET)).toBe(0);
    await advance(0);
    expect(operations(harness, GET)).toBe(1);
    await advance(2_000);
    expect(operations(harness, GET)).toBe(2);
    await untilReady();

    const buttons = within(pdfRoot())
      .getAllByRole('button')
      .map((node) => node.textContent);
    // ButtonGroup DOM 순서 = secondary(Share) → primary(Save) — Shared UI 규칙 (Figma `86:372`)
    expect(buttons).toStrictEqual([copy.share, copy.save]);
    expect(liveRegion().textContent).toBe(copy.ready);
    expect(harness.fileShare.records()).toStrictEqual([]); // ready 도달 = 자동 저장 0 (N7-40)

    tap(copy.save);
    const records = harness.fileShare.records();
    expect(records).toHaveLength(1);
    expect(records[0]?.kind).toBe('save');
    expect(records[0]?.fileName).toMatch(PDF_NAME);
    expect(records[0]?.size ?? 0).toBeGreaterThan(100);

    tap(copy.share);
    await advance(0);
    expect(harness.fileShare.records()[1]).toMatchObject({ kind: 'share', outcome: 'shared' });
    expect(operations(harness, POST)).toBe(1);
  });

  it('저장 · 공유는 탭 핸들러 안에서 같은 tick 에 포트를 부른다 — await 선행 0 (R7-04 · AC-7-59)', async () => {
    const harness = await renderAt('card');
    await prepare(harness);
    const saveSpy = vi.spyOn(harness.fileShare, 'saveFile');
    const shareSpy = vi.spyOn(harness.fileShare, 'shareFile');
    tap(copy.save);
    expect(saveSpy).toHaveBeenCalledTimes(1); // 동기 — 다음 microtask 를 기다리지 않았다
    tap(copy.share);
    expect(shareSpy).toHaveBeenCalledTimes(1);
    const [file, title] = shareSpy.mock.calls[0] ?? [];
    expect(file).toBeInstanceOf(File);
    expect((file as File).type).toBe('application/pdf');
    expect(title).toBe(copy.shareTitle);
    await advance(0);
  });

  it('진행 중 재탭 = 중복 POST 0 (StrictMode) · 같은 Idempotency-Key 1개 (AC-7-57)', async () => {
    const harness = await renderAt('card');
    const requestSpy = vi.spyOn(harness.bundle.clients.reportPdf, 'request');
    tap(copy.download);
    tap(copy.download);
    await advance(0);
    tap(copy.download);
    await advance(2_000);
    expect(operations(harness, POST)).toBe(1);
    expect(requestSpy).toHaveBeenCalledTimes(1);
    const options = requestSpy.mock.calls[0]?.[1];
    expect(options?.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('상세에서 준비 → Progress 카드도 ready (같은 기록 `reportKeys.pdf`) · 새 요청 0 (N7-24 · AC-7-61)', async () => {
    const harness = await renderAt('detail');
    expect(pdfRoot().closest('.haru-report-detail__pdf')).not.toBeNull();
    await prepare(harness);
    const job = harness.queryClient.getQueryData<ReportPdfJob>(
      reportKeys.pdf(MOCK_REPORT_IDS.latest),
    );
    expect(job?.phase).toBe('ready');

    act(() => {
      navigateFromTest?.(ROUTES.progress);
    });
    await advance(0);
    const card = screen.getByRole('region', { name: progressOverviewCopy.reportCard.title });
    expect(within(card).getByRole('button', { name: copy.save })).toBeDefined();
    expect(within(card).queryByRole('button', { name: copy.download })).toBeNull();
    expect(operations(harness, POST)).toBe(1);
    expect(operations(harness, GET)).toBe(2);
  });

  it('생성 중 이탈 → 폴링 멈춤 · 다른 진입점에서 이어서 폴링 → ready (POST 1)', async () => {
    const harness = await renderAt('card', ['report-pdf:pdf-generating']);
    tap(copy.download);
    await advance(2_000);
    expect(operations(harness, GET)).toBe(1);

    act(() => {
      navigateFromTest?.(progressReportPath(MOCK_REPORT_IDS.latest));
    });
    for (let i = 0; i < 20 && screen.queryByText(copy.preparing) === null; i += 1) {
      await advance(0);
    }
    expect(screen.getByText(copy.preparing)).toBeDefined();
    // pdf-generating = generating 3회 후 ready
    await advance(2_000);
    await advance(2_000);
    await advance(2_000);
    await untilReady();
    expect(operations(harness, POST)).toBe(1);
    expect(operations(harness, GET)).toBe(4);
    expect(pdfRoot().closest('.haru-report-detail__pdf')).not.toBeNull();
  });
});

describe('ReportPdfAction — 실패 · 지연 · 오프라인 (AC-7-58)', () => {
  it('`pdf-failed` → 오류 안내 + Try again → 새 시도(새 키) → ready', async () => {
    const harness = await renderAt('card', ['report-pdf:pdf-failed']);
    const requestSpy = vi.spyOn(harness.bundle.clients.reportPdf, 'request');
    tap(copy.download);
    await advance(2_000);
    const alert = within(pdfRoot()).getByRole('alert');
    expect(alert.textContent).toContain(copy.failed.title);
    expect(alert.textContent).toContain(copy.failed.description);
    expect(within(pdfRoot()).queryByRole('button', { name: copy.download })).toBeNull();

    tap(copy.retry);
    await advance(0);
    await advance(2_000);
    await advance(2_000);
    await untilReady();
    expect(operations(harness, POST)).toBe(2);
    const keys = requestSpy.mock.calls.map((call) => call[1].idempotencyKey);
    expect(new Set(keys).size).toBe(2);
  });

  it('`pdf-timeout` → 60s 에서 지연 안내 · 폴링 중단 · Try again = 같은 키로 다시', async () => {
    const harness = await renderAt('card', ['report-pdf:pdf-timeout']);
    const requestSpy = vi.spyOn(harness.bundle.clients.reportPdf, 'request');
    tap(copy.download);
    await advance(0);
    await advance(58_000);
    expect(within(pdfRoot()).queryByText(copy.timeout.title)).toBeNull();
    await advance(2_000);
    expect(within(pdfRoot()).getByText(copy.timeout.title)).toBeDefined();
    expect(within(pdfRoot()).getByText(copy.timeout.description)).toBeDefined();
    const polls = operations(harness, GET);
    expect(polls).toBeGreaterThanOrEqual(28);
    expect(polls).toBeLessThanOrEqual(30);
    await advance(20_000);
    expect(operations(harness, GET)).toBe(polls); // 폴링 중단

    tap(copy.retry);
    await advance(0);
    expect(operations(harness, POST)).toBe(2);
    const keys = requestSpy.mock.calls.map((call) => call[1].idempotencyKey);
    expect(keys[0]).toBe(keys[1]);
  });

  it('`offline` → 오프라인 안내 + Try again (같은 키)', async () => {
    const harness = await renderAt('card', ['report-pdf:offline']);
    tap(copy.download);
    await advance(0);
    expect(within(pdfRoot()).getByText(copy.offline.title)).toBeDefined();
    expect(within(pdfRoot()).getByText(copy.offline.description)).toBeDefined();
    expect(within(pdfRoot()).getByRole('button', { name: copy.retry })).toBeDefined();
    tap(copy.retry);
    await advance(0);
    expect(operations(harness, POST)).toBe(2);
  });

  it('`retry` → 첫 POST 오류 = 일반 실패 안내 → Try again → ready', async () => {
    const harness = await renderAt('card', ['report-pdf:retry']);
    tap(copy.download);
    await advance(0);
    expect(within(pdfRoot()).getByRole('alert').textContent).toContain(copy.failed.title);
    tap(copy.retry);
    await advance(0);
    // retry scenario 는 **메서드별** 1회차 실패 — 첫 GET 도 실패한다 → 다시 (같은 키 POST 는 서버가 최초 응답 재생)
    await advance(2_000);
    expect(within(pdfRoot()).getByRole('alert').textContent).toContain(copy.failed.title);
    tap(copy.retry);
    await advance(0);
    await advance(2_000);
    await advance(2_000);
    await untilReady();
    expect(operations(harness, POST)).toBe(3);
    expect(harness.fileShare.records()).toStrictEqual([]);
  });
});

describe('ReportPdfAction — 공유 (N7-19 · AC-7-59)', () => {
  it('`share-unsupported` → Save PDF 1개뿐', async () => {
    const harness = await renderAt('card', ['report-pdf:share-unsupported']);
    await prepare(harness);
    expect(
      within(pdfRoot())
        .getAllByRole('button')
        .map((node) => node.textContent),
    ).toStrictEqual([copy.save]);
  });

  it('`share-cancelled` → 표시 변화 0 · ready 유지', async () => {
    const harness = await renderAt('card', ['report-pdf:share-cancelled']);
    await prepare(harness);
    const before = pdfRoot().innerHTML;
    tap(copy.share);
    await advance(0);
    expect(harness.fileShare.records()[0]).toMatchObject({ kind: 'share', outcome: 'cancelled' });
    expect(pdfRoot().innerHTML).toBe(before);
    expect(within(pdfRoot()).queryByRole('alert')).toBeNull();
  });

  it('공유 거절(NotAllowedError) → ready 유지 + 저장 안내 · 다시 Save 가능', async () => {
    const harness = await renderAt('card');
    await prepare(harness);
    vi.spyOn(harness.fileShare, 'shareFile').mockRejectedValue(
      new FileShareRejectedError('NotAllowedError'),
    );
    tap(copy.share);
    await advance(0);
    expect(liveRegion().textContent).toBe(`${copy.ready}${copy.shareUnavailable}`);
    expect(within(pdfRoot()).getByRole('button', { name: copy.save })).toBeDefined();
    tap(copy.save);
    expect(harness.fileShare.records().filter((record) => record.kind === 'save')).toHaveLength(1);
  });
});

describe('ReportPdfAction — 접근성 · Privacy', () => {
  it('누른 버튼이 사라지면 포커스를 새 첫 버튼으로 (loading → Share · 실패 → Try again)', async () => {
    const harness = await renderAt('card');
    within(pdfRoot()).getByRole('button', { name: copy.download }).focus();
    await prepare(harness);
    expect(document.activeElement?.textContent).toBe(copy.share);
  });

  it('포커스가 영역 밖이면 옮기지 않는다', async () => {
    const harness = await renderAt('card');
    tap(copy.download);
    const link = screen.getByRole('link', { name: /^4-week full report/ });
    link.focus();
    await advance(0);
    await advance(2_000);
    await advance(2_000);
    await untilReady();
    expect(document.activeElement).toBe(link);
    expect(operations(harness, POST)).toBe(1);
  });

  it('콘솔에 파일명 · PDF URL · 아이 이름 0 · 영속 저장 0 (AC-7-60 · 64)', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const harness = await renderAt('card');
    await prepare(harness);
    tap(copy.save);
    tap(copy.share);
    await advance(0);
    const text = JSON.stringify(consoleCalls);
    expect(text).not.toMatch(/haru-4-week-report|data:application\/pdf|Emma|e7e7e7e7/);
    expect(setItem.mock.calls.filter(([key]) => /pdf|report/i.test(String(key)))).toStrictEqual([]);
  });

  it('로그아웃 = QueryClient.clear() 가 PDF 기록(File 포함)을 지운다 (AC-7-65)', async () => {
    const harness = await renderAt('card');
    await prepare(harness);
    const key = reportKeys.pdf(MOCK_REPORT_IDS.latest);
    expect(harness.queryClient.getQueryData(key)).toBeDefined();
    harness.queryClient.clear();
    expect(harness.queryClient.getQueryData(key)).toBeUndefined();
  });

  it('발행 카드가 아닌 상태(첫 주기 · 생성 중)에는 PDF 영역이 없다', async () => {
    for (const scenario of ['reports:empty', 'reports:report-eligible']) {
      const harness = createHarness({ initialEntries: [ROUTES.progress], scenarios: [scenario] });
      await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
      const Wrapper = harness.wrapper;
      render(
        <Wrapper>
          <AppRoutes />
        </Wrapper>,
      );
      await screen.findByRole('region', { name: progressOverviewCopy.reportCard.title });
      expect(document.querySelector('.haru-report-pdf')).toBeNull();
      cleanup();
    }
  });
});
