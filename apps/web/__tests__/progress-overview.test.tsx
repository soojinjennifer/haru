/**
 * `/progress` — Stage 7 `S7-C` (Figma `31:102` + `110:835`, Spec §2.1 · §2.2 · §2.4 · §2.7 · §2.8 · §2.9).
 *
 * 실제 router + Mock Adapter(`progress` · `reports` scenario) 로 화면을 띄운다. 분기 순수 함수의 10칸은
 * `features/progress-overview/__tests__/resolveReportCardView.test.ts` 가 덮는다 — 여기서는 시나리오별 **렌더 결과**다.
 *
 * AC: 03 · 21 · 22(대체 텍스트) · 23 · 24 · 25 · 26 · 27 · 28 · 29 · 30 · 31 · 32 · 33 · 34 · 76.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { progressOverviewCopy as copy } from '../src/features/progress-overview';
import { MOCK_REPORT_IDS } from '../src/mocks/fixtures/reports';
import { ROUTES } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { networkErrorCopy } from '../src/shared/copy/error-copy';
import { createHarness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;

function LocationProbe() {
  const location = useLocation();
  return (
    <span data-testid="location">
      {location.pathname}
      {location.search}
    </span>
  );
}

async function renderProgress(scenarios: readonly string[] = []) {
  const harness = createHarness({ initialEntries: [ROUTES.progress], scenarios });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <LocationProbe />
      <AppRoutes />
    </Wrapper>,
  );
  await waitFor(() => {
    expect(screen.queryByRole('status', { name: appCopy.guard.loadingLabel })).toBeNull();
  });
  return harness;
}

async function reportCard(): Promise<HTMLElement> {
  return screen.findByRole('region', { name: copy.reportCard.title });
}

function pastReports(): HTMLElement | null {
  return screen.queryByRole('region', { name: copy.pastReports.heading });
}

describe('/progress — 주간 관찰 (Figma `31:102`)', () => {
  it('준비 안내(D-2)가 사라지고 Figma 4블록이 응답 값으로 그려진다 (AC-7-03 · 21 · 23 · 25 · 26)', async () => {
    await renderProgress();

    expect(screen.getByRole('heading', { level: 1, name: copy.title })).toBeDefined();
    expect(screen.queryByText('Your first report is on the way')).toBeNull();

    // ① StatTile — `5 sessions` · `62m together` (Figma `163:2549` 은 62 를 분 단위로)
    expect(await screen.findByText('5')).toBeDefined();
    expect(screen.getByText('62m')).toBeDefined();
    // ② 합계 · 보조 줄 — 비교 · 분모 0 (D7-2 ① ②)
    const reading = screen.getByRole('region', { name: copy.reading.title });
    expect(within(reading).getByText('1h 12m')).toBeDefined();
    expect(within(reading).getByText('6 nights · avg 12 min')).toBeDefined();
    expect(reading.textContent).not.toMatch(/vs last week|of 7|%/);
    // 막대 목록 — 항목 이름 (AC-7-22 대체 텍스트)
    const bars = within(reading).getByRole('list', { name: copy.reading.barsLabel });
    expect(within(bars).getAllByRole('listitem')).toHaveLength(7);
    expect(within(bars).getByText('Wednesday, no storytime')).toBeDefined();
    // ③ Growth themes — Q6 순서 · 단계 라벨
    const growth = screen.getByRole('list', { name: copy.growth.title });
    expect(
      within(growth)
        .getAllByRole('listitem')
        .map((row) => row.textContent),
    ).toStrictEqual([
      'Self-Direction, strong',
      'Emotion Regulation, growing',
      'Cognitive Flexibility, emerging',
      'Intrinsic Motivation, emerging',
    ]);
    // ④ Moment — 서버 인용 그대로
    expect(
      screen.getByText(/Maybe she just needs to rest, like me when I’m frustrated\./),
    ).toBeDefined();
    expect(screen.getByText('Tue · The Most Magnificent Thing, p.14')).toBeDefined();
  });

  it('주간 카드에 접기 chevron 토글이 없다 — 버튼 · aria-expanded 0 (AC-7-24 개정 · N7-41 ⓐ)', async () => {
    await renderProgress();
    const reading = await screen.findByRole('region', { name: copy.reading.title });
    expect(within(reading).queryAllByRole('button')).toHaveLength(0);
    expect(reading.querySelector('[aria-expanded]')).toBeNull();
  });

  it('Growth themes · 리포트 카드 막대는 접근성 트리에 progressbar 로 나오지 않는다 (AC-7-31 · M7-11)', async () => {
    await renderProgress();
    await reportCard();
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
  });

  it('이번 주 0 (`progress:empty`) = 레이아웃 유지 + 0 표기 · Moment 미렌더 (AC-7-28 · Spec §2.8)', async () => {
    await renderProgress(['progress:empty']);
    const reading = await screen.findByRole('region', { name: copy.reading.title });
    expect(within(reading).getByText('0m')).toBeDefined();
    expect(within(reading).getByText(copy.reading.none)).toBeDefined();
    expect(screen.getByText('0')).toBeDefined();
    expect(screen.queryByText(copy.moment.eyebrow)).toBeNull();
    expect(screen.getByRole('list', { name: copy.growth.title })).toBeDefined();
  });

  it('주간 오류는 리포트 카드를 가리지 않는다 — 두 쿼리 독립 (AC-7-29)', async () => {
    await renderProgress(['progress:error']);
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeDefined();
    expect(await reportCard()).toBeDefined();
  });

  it('주간 offline = offline 안내 · retry = 1회 실패 후 *Try again* 으로 회복 (AC-7-29)', async () => {
    await renderProgress(['progress:offline']);
    expect(await screen.findByText(networkErrorCopy.title)).toBeDefined();
  });

  it('주간 retry — 첫 조회 실패 → Try again → 데이터 (AC-7-29)', async () => {
    await renderProgress(['progress:retry']);
    const retry = await screen.findByRole('button', { name: 'Try again' });
    retry.click();
    expect(await screen.findByRole('region', { name: copy.reading.title })).toBeDefined();
  });

  it('리포트 오류는 주간 블록을 가리지 않는다 (AC-7-29)', async () => {
    await renderProgress(['reports:error']);
    expect(await screen.findByRole('region', { name: copy.reading.title })).toBeDefined();
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeDefined();
  });

  it('주 선택 — chip → 시트 → 이전 주 → 그 주 데이터 · URL ?week= · 시트 닫힘 (AC-7-27)', async () => {
    await renderProgress(['progress:progress-multi-week']);
    const chip = await screen.findByRole('button', { name: 'Week: May 4 – 10. Change week' });
    chip.click();

    const sheet = await screen.findByRole('dialog', { name: copy.weekPicker.sheetTitle });
    const options = within(sheet).getAllByRole('radio');
    expect(options.map((option) => option.getAttribute('value'))).toStrictEqual([
      '2026-05-04',
      '2026-04-27',
      '2026-01-05',
      '2025-12-29',
    ]);
    within(sheet)
      .getByRole('radio', { name: /Apr 27 – May 3/ })
      .click();

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(screen.getByTestId('location').textContent).toBe('/progress?week=2026-04-27');
    expect(
      await screen.findByRole('button', { name: 'Week: Apr 27 – May 3. Change week' }),
    ).toBeDefined();
    // 4월 27일 주 — StatTile *53m* · 합계 *53m* (Mock `progress-multi-week`)
    expect(await screen.findAllByText('53m')).toHaveLength(2);
  });

  it('선택 가능한 주가 1개면 chip 은 정적 라벨 — 버튼 · chevron 0 (N7-25 · Spec §2.7)', async () => {
    await renderProgress(['progress:progress-first-week']);
    await screen.findByRole('region', { name: copy.reading.title });
    expect(screen.queryByRole('button', { name: /Change week/ })).toBeNull();
    expect(screen.getByText('May 4 – 10')).toBeDefined();
  });
});

describe('/progress — 4주 리포트 카드 (Figma `110:835` + C13-S7-2)', () => {
  it('success = 발행 리포트 + 다음 주기 막대 + Next report on — 헤더만 링크 (AC-7-30 · 32 · 33 · 76)', async () => {
    await renderProgress();
    const card = await reportCard();
    expect(card.getAttribute('data-state')).toBe('published');

    // `D8-3` (`H8-6-N1`) — 이름 = 보이는 제목 + 범위가 든 설명 (aria-label 없음, WCAG 2.5.3)
    const link = within(card).getByRole('link', {
      name: /^4-week full report\s*Apr 13 – May 10 · a deeper read/,
    });
    expect(link.hasAttribute('aria-label')).toBe(false);
    expect(link.getAttribute('href')).toBe(`/progress/reports/${MOCK_REPORT_IDS.latest}`);
    expect(within(card).getAllByRole('link')).toHaveLength(1);
    expect(within(link).queryAllByRole('button')).toHaveLength(0);

    expect(
      within(card).getByText(
        'Apr 13 – May 10 · a deeper read on the four themes, with the moments behind them.',
      ),
    ).toBeDefined();
    expect(within(card).getByText('Next report on Jun 7')).toBeDefined();
    expect(card.textContent).not.toMatch(/email/i);
    // VG7-A-05 ⓑ — success 는 Figma 처럼 막대가 꽉 찬다 (서버 ratio 1)
    const fill = card.querySelector<HTMLElement>('.haru-progress__fill');
    expect(fill?.style.getPropertyValue('--progress-fill-size')).toBe('100%');
  });

  it('report-no-previous — 막대 = 다음 주기 progressRatio (100% 고정 아님 — AC-7-76 판별 장면, VG7-A-05 ⓑ)', async () => {
    await renderProgress(['reports:report-no-previous']);
    const card = await reportCard();
    expect(card.getAttribute('data-state')).toBe('published');
    const fill = card.querySelector<HTMLElement>('.haru-progress__fill');
    expect(fill?.style.getPropertyValue('--progress-fill-size')).toBe('40%');
    // 발행 1건이고 카드가 보여 준다 → 과거 목록 0 (AC-7-34)
    expect(pastReports()).toBeNull();
  });

  it('success — 과거 리포트 = 카드 리포트를 뺀 1건 · 행 탭 → 상세 경로 (AC-7-34)', async () => {
    await renderProgress();
    await reportCard();
    const past = await screen.findByRole('region', { name: copy.pastReports.heading });
    const rows = within(past).getAllByRole('button');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.textContent).toMatch(/^Mar 16 – Apr 12/);
    rows[0]?.click();
    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toBe(
        `/progress/reports/${MOCK_REPORT_IDS.earlier}`,
      );
    });
  });

  it('empty — 첫 주기: 안내 문구 + 막대 · 링크 0 · 과거 목록 0 (C13-S7-8)', async () => {
    await renderProgress(['reports:empty']);
    const card = await reportCard();
    expect(card.getAttribute('data-state')).toBe('first-cycle');
    expect(within(card).getByText(copy.reportCard.firstCycle.description)).toBeDefined();
    expect(within(card).queryAllByRole('link')).toHaveLength(0);
    expect(card.querySelector('.haru-progress')).not.toBeNull();
    expect(pastReports()).toBeNull();
  });

  it('report-eligible — 생성 중: Spinner 상태 문구 · 막대 0 · 링크 0 · 과거 목록 2건 (N7-35 ⓐ)', async () => {
    await renderProgress(['reports:report-eligible']);
    const card = await reportCard();
    expect(card.getAttribute('data-state')).toBe('generating');
    expect(within(card).getByRole('status').textContent).toContain(copy.reportCard.generating.note);
    expect(card.querySelector('.haru-progress')).toBeNull();
    expect(within(card).queryAllByRole('link')).toHaveLength(0);
    const past = await screen.findByRole('region', { name: copy.pastReports.heading });
    expect(within(past).getAllByRole('button')).toHaveLength(2);
  });

  it('report-not-eligible — 진행 중(미충족)은 첫 주기 카드 · 사유 문구 0 (AC-7-30)', async () => {
    await renderProgress(['reports:report-not-eligible']);
    const card = await reportCard();
    expect(card.getAttribute('data-state')).toBe('first-cycle');
    expect(card.textContent).not.toMatch(/minute|session|insufficient/i);
  });

  it('report-deferred — 이월 문구 + 막대 + footer · 과거 목록 1건 (reportCount ≥ 1)', async () => {
    await renderProgress(['reports:report-deferred']);
    const card = await reportCard();
    expect(card.getAttribute('data-state')).toBe('deferred');
    expect(within(card).getByText(copy.reportCard.deferred.description)).toBeDefined();
    expect(card.querySelector('.haru-progress')).not.toBeNull();
    expect(within(card).getByText('Next report on Jun 7')).toBeDefined();
    const past = await screen.findByRole('region', { name: copy.pastReports.heading });
    expect(within(past).getAllByRole('button')).toHaveLength(1);
  });

  it('report-deferred-first — 이월 + 발행 0 → 과거 목록 미렌더', async () => {
    await renderProgress(['reports:report-deferred-first']);
    const card = await reportCard();
    expect(card.getAttribute('data-state')).toBe('deferred');
    expect(pastReports()).toBeNull();
  });

  it('report-delayed — 지연 문구 · 막대 0 · footer 0', async () => {
    await renderProgress(['reports:report-delayed']);
    const card = await reportCard();
    expect(card.getAttribute('data-state')).toBe('delayed');
    expect(within(card).getByText(copy.reportCard.delayed.description)).toBeDefined();
    expect(card.querySelector('.haru-progress')).toBeNull();
    expect(within(card).queryByText(/Next report on/)).toBeNull();
  });
});
