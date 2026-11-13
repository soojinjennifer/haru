/**
 * 피드백 · 분석 상태 화면 — Stage 5 `S5-C` (Spec §2.3 `C13-S5-1`, AC-5-34~43 의 컴포넌트 부분).
 *
 * 실제 앱과 같은 조립(`createHarness` — Mock 번들 · Router · Guard)으로 `/session/:id/feedback` 을 직접 연다 (deep link).
 * 세션 = Mock 지난 세션 `analyzing`(`77777777-…0002`).
 */
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import {
  ANALYSIS_FAILED_POLL_INTERVAL_MS,
  ANALYSIS_POLL_INTERVAL_MS,
} from '../src/entities/analysis';
import { sessionFeedbackCopy as copy } from '../src/features/session-feedback';
import { appCopy } from '../src/shared/copy/app-copy';
import { ERROR_COPY, networkErrorCopy, retryLabel } from '../src/shared/copy/error-copy';
import {
  MOCK_SHORT_FEEDBACK,
  MOCK_SHORT_FEEDBACK_LOW_QUALITY,
} from '../src/mocks/fixtures/analysis';
import { createHarness, type HarnessOptions } from '../src/test/harness';

const SESSION = '77777777-7777-4777-8777-000000000002';
const PATH = `/session/${SESSION}/feedback`;
const ANALYSIS_OP = 'GET /v1/sessions/:sessionId/analysis';
const DETAIL_OP = 'GET /v1/sessions/:sessionId';

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryAllByRole('status', { name: appCopy.guard.loadingLabel })).toHaveLength(0);
  });
}

async function renderFeedback(
  scenarios: readonly string[] = [],
  options: Omit<HarnessOptions, 'scenarios' | 'initialEntries'> = {},
  path: string = PATH,
) {
  const harness = createHarness({ ...options, scenarios, initialEntries: [path] });
  await harness.bundle.authGateway.signInWithEmail({
    email: 'sam@example.com',
    password: 'sunny-evening-8',
  });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  await waitForGuard();
  await screen.findByRole('heading', { level: 1, name: copy.title });
  const count = (operation: string) =>
    harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation).length;
  const slot = () => document.querySelector('.haru-session-feedback__state') as HTMLElement;
  return { harness, count, slot };
}

async function expectState(slot: () => HTMLElement, kind: string): Promise<void> {
  await waitFor(() => expect(slot().dataset['state']).toBe(kind));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('피드백 화면 골격 (Spec §2.3)', () => {
  it('h1 · 닫기 · 메달리온 · aria-live 슬롯 1개 · 앱 안 진입점 없음(deep link)', async () => {
    const { slot } = await renderFeedback(['analysis:analysis-pending']);
    expect(screen.getByRole('button', { name: copy.close })).toBeTruthy();
    expect(document.querySelector('.haru-session-feedback__medallion')).not.toBeNull();
    expect(slot().getAttribute('aria-live')).toBe('polite');
    // 스티커는 그리지 않는다 (Spec §2.3 "스티커 슬롯 없음")
    expect(document.querySelector('.haru-attendance-sticker')).toBeNull();
  });

  it('닫기 = 홈 replace', async () => {
    await renderFeedback(['analysis:analysis-pending']);
    fireEvent.click(screen.getByRole('button', { name: copy.close }));
    await waitFor(() => expect(screen.getByTestId('pathname').textContent).toBe('/'));
  });
});

describe('표시 상태 (Spec §2.3 표 · AC-5-36~42)', () => {
  it('pending — 안내 InlineAlert · 버블 0 (AC-5-36)', async () => {
    const { slot } = await renderFeedback(['analysis:analysis-pending']);
    await expectState(slot, 'pending');
    within(slot()).getByText(copy.pending.title);
    within(slot()).getByText(copy.pending.description);
    expect(slot().querySelector('.haru-bubble')).toBeNull();
  });

  it('analyzed — 버블 = 응답 text 그대로, InlineAlert 0 (AC-5-37)', async () => {
    const { slot } = await renderFeedback(['analysis:analysis-completed']);
    await expectState(slot, 'analyzed');
    const bubble = slot().querySelector('.haru-bubble');
    expect(bubble?.textContent).toBe(MOCK_SHORT_FEEDBACK.text);
    expect(slot().querySelector('.haru-alert')).toBeNull();
  });

  it('analyzed + text null — 슬롯 비움 (fallback 0, AC-5-37)', async () => {
    const { slot } = await renderFeedback(['analysis:analysis-feedback-missing']);
    await expectState(slot, 'analyzed');
    expect(slot().childElementCount).toBe(0);
    expect(slot().textContent).toBe('');
  });

  it('low-quality — 버블(응답 text) + 그 아래 안내 (AC-5-38)', async () => {
    const { slot } = await renderFeedback(['analysis:analysis-low-quality']);
    await expectState(slot, 'low-quality');
    const children = [...slot().children];
    expect(children[0]?.querySelector('.haru-bubble')?.textContent).toBe(
      MOCK_SHORT_FEEDBACK_LOW_QUALITY.text,
    );
    expect(children[1]?.textContent).toContain(copy.lowQuality.title);
    expect(children[1]?.textContent).toContain(copy.lowQuality.description);
  });

  it('failed — 안내 · 버튼 0 (AC-5-39, `N5-15` ⓐ)', async () => {
    const { slot } = await renderFeedback(['analysis:analysis-failed']);
    await expectState(slot, 'failed');
    within(slot()).getByText(copy.failed.title);
    expect(within(slot()).queryAllByRole('button')).toHaveLength(0);
  });

  it('not-available (대화 전용) — 기존 ANALYSIS_NOT_AVAILABLE 문구 (AC-5-40)', async () => {
    const { slot } = await renderFeedback(['analysis:analysis-not-available']);
    await expectState(slot, 'not-available');
    within(slot()).getByText(ERROR_COPY.ANALYSIS_NOT_AVAILABLE.title);
    within(slot()).getByText(ERROR_COPY.ANALYSIS_NOT_AVAILABLE.description);
  });

  it('recording-deleted — 녹음 없음 사유 · 상세 1회 · 폴링 정지 (AC-5-41, enum 변경 0)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { slot, count } = await renderFeedback(['analysis:recording-deleted']);
    await expectState(slot, 'not-available');
    within(slot()).getByText(copy.noRecording.description);
    const reads = count(ANALYSIS_OP);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS * 3);
    });
    expect(count(ANALYSIS_OP)).toBe(reads);
    expect(count(DETAIL_OP)).toBe(1);
  });

  it('Error — ErrorState + Try again → 다시 조회 (`retry` = 1회 실패 후 성공, AC-5-42)', async () => {
    const { slot } = await renderFeedback(['analysis:retry']);
    await expectState(slot, 'error');
    fireEvent.click(within(slot()).getByRole('button', { name: retryLabel }));
    await waitFor(() => expect(slot().dataset['state']).not.toBe('error'));
  });

  it('Offline — offline ErrorState + Try again', async () => {
    const { slot } = await renderFeedback(['analysis:offline']);
    await expectState(slot, 'offline');
    within(slot()).getByText(networkErrorCopy.title);
    within(slot()).getByRole('button', { name: retryLabel });
  });

  it('RESOURCE_NOT_FOUND (없는 세션) — Go home, 재시도 없음 (AC-5-42)', async () => {
    const { slot } = await renderFeedback(
      [],
      {},
      '/session/99999999-9999-4999-8999-999999999999/feedback',
    );
    await expectState(slot, 'not-found');
    within(slot()).getByText(ERROR_COPY.RESOURCE_NOT_FOUND.title);
    expect(within(slot()).queryByRole('button', { name: retryLabel })).toBeNull();
    fireEvent.click(within(slot()).getByRole('button', { name: copy.goHome }));
    await waitFor(() => expect(screen.getByTestId('pathname').textContent).toBe('/'));
  });
});

describe('폴링 (AC-5-35, `N5-14`)', () => {
  it('다른 화면(완료 화면)은 분석 상태를 조회하지 않는다', async () => {
    const harness = createHarness({ initialEntries: [`/session/${SESSION}/complete`] });
    await harness.bundle.authGateway.signInWithEmail({
      email: 'sam@example.com',
      password: 'sunny-evening-8',
    });
    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <AppRoutes />
      </Wrapper>,
    );
    await waitForGuard();
    await waitFor(() => {
      expect(document.querySelector('.haru-session-complete')).not.toBeNull();
    });
    expect(
      harness.bundle.requestLog.entries().filter((entry) => entry.operation === ANALYSIS_OP),
    ).toHaveLength(0);
  });

  it('pending → 15초 간격 → analyzed 에서 정지 · 버블 등장 모션 = play', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { slot, count } = await renderFeedback(['analysis:analysis-pending-then-completed']);
    await expectState(slot, 'pending');
    expect(count(ANALYSIS_OP)).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS - 1_000);
    });
    expect(count(ANALYSIS_OP)).toBe(1);
    for (let i = 0; i < 2; i += 1) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS);
      });
    }
    await expectState(slot, 'analyzed');
    expect(count(ANALYSIS_OP)).toBe(3);
    expect(
      slot().querySelector('.haru-session-feedback__bubble')?.getAttribute('data-entrance'),
    ).toBe('play');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS * 4);
    });
    expect(count(ANALYSIS_OP)).toBe(3);
  });

  it('처음부터 analyzed — 등장 모션 없음(static) · 조회 1회', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { slot, count } = await renderFeedback(['analysis:analysis-completed']);
    await expectState(slot, 'analyzed');
    expect(
      slot().querySelector('.haru-session-feedback__bubble')?.getAttribute('data-entrance'),
    ).toBe('static');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS * 3);
    });
    expect(count(ANALYSIS_OP)).toBe(1);
  });

  it('failed — 60초 간격', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { slot, count } = await renderFeedback(['analysis:analysis-failed']);
    await expectState(slot, 'failed');
    expect(count(ANALYSIS_OP)).toBe(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS * 3);
    });
    expect(count(ANALYSIS_OP)).toBe(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(
        ANALYSIS_FAILED_POLL_INTERVAL_MS - ANALYSIS_POLL_INTERVAL_MS * 3,
      );
    });
    expect(count(ANALYSIS_OP)).toBe(2);
  });

  it('화면 이탈(닫기) 후 조회 0', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { count } = await renderFeedback(['analysis:analysis-pending']);
    await waitFor(() => expect(count(ANALYSIS_OP)).toBe(1));
    fireEvent.click(screen.getByRole('button', { name: copy.close }));
    await waitFor(() => expect(screen.getByTestId('pathname').textContent).toBe('/'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANALYSIS_POLL_INTERVAL_MS * 4);
    });
    expect(count(ANALYSIS_OP)).toBe(1);
  });
});
