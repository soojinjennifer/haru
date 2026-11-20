/**
 * `/progress/reports/:reportId` — Stage 7 `S7-D` (`C13-S7-1` · `C13-S7-7` · `C13-S7-9`, Spec §2.3 · §2.9).
 *
 * 실제 router + Mock Adapter(`reports` scenario) 로 화면을 띄운다 — **StrictMode** 로 감싸 effect 이중 실행에서도
 * `viewed` 가 1회인지 본다 (AC-7-44). 표시 모델 순수 함수는 `features/report-detail/__tests__` 가 덮는다.
 *
 * AC: 37 · 38(대체 텍스트 · 범례) · 39 · 40 · 41 · 42 · 43 · 44 · 45 · 46(Back 목적지) · 47.
 */
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { reportDetailCopy as copy } from '../src/features/report-detail';
import { MOCK_CHILD_ID } from '../src/mocks/fixtures/me';
import { MOCK_REPORT_IDS } from '../src/mocks/fixtures/reports';
import { MOCK_LONG_CHILD_FIRST_NAME } from '../src/mocks/fixtures/child-profile';
import { progressReportPath, ROUTES } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { networkErrorCopy } from '../src/shared/copy/error-copy';
import { createHarness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;
const VIEWED_OPERATION = 'POST /v1/reports/:reportId/viewed';
const DETAIL_OPERATION = 'GET /v1/reports/:reportId';

let navigateFromTest: ((to: string) => void) | null = null;

function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    navigateFromTest = (to: string) => {
      void navigate(to);
    };
  }, [navigate]);
  return <span data-testid="location">{location.pathname}</span>;
}

async function renderDetail(reportId: string, scenarios: readonly string[] = []) {
  const harness = createHarness({ initialEntries: [progressReportPath(reportId)], scenarios });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });
  const Wrapper = harness.wrapper;
  render(
    <StrictMode>
      <Wrapper>
        <LocationProbe />
        <AppRoutes />
      </Wrapper>
    </StrictMode>,
  );
  await waitFor(() => {
    expect(screen.queryByRole('status', { name: appCopy.guard.loadingLabel })).toBeNull();
  });
  return harness;
}

function operations(harness: Awaited<ReturnType<typeof renderDetail>>, operation: string) {
  return harness.bundle.requestLog.entries().filter((entry) => entry.operation === operation);
}

async function readyBody(): Promise<HTMLElement> {
  return waitFor(() => {
    const body = document.querySelector<HTMLElement>(
      '.haru-report-detail__body[data-state="ready"]',
    );
    if (body === null) throw new Error('not ready');
    return body;
  });
}

describe('/progress/reports/:reportId — 성공 (`reports:success`, 리포트 주기 2)', () => {
  it('TopBar h1 · 기간 · summaryLine · 섹션 순서 ①~⑤ (AC-7-37)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    const body = await readyBody();

    expect(screen.getByRole('heading', { level: 1, name: copy.topBarTitle })).toBeDefined();
    expect(within(body).getByText('Apr 13 – May 10')).toBeDefined();
    expect(
      within(body).getByText(
        'Four weeks of storytimes full of building, guessing and trying again.',
      ),
    ).toBeDefined();

    const headings = within(body)
      .getAllByRole('heading', { level: 2 })
      .map((node) => node.textContent);
    expect(headings).toStrictEqual([
      copy.growth.title,
      copy.persona.title('Emma'),
      copy.dialogue.title,
      copy.feedback.title,
      // ⑥ 하이라이트 클립 — `S7-E` 가 page slot 으로 꽂는다 (Spec §2.3 ⑥)
      'Highlight clips',
    ]);
    // ④ 인용은 ③ 과 ⑤ 사이 (heading 없음 — eyebrow 는 heading 이 아니다)
    const order = [...body.querySelectorAll('[data-section]')].map((node) =>
      node.getAttribute('data-section'),
    );
    expect(order).toStrictEqual(['growth', 'dialogue', 'quotes', 'feedback', 'clips']);
    const persona = body.querySelector('.haru-report-persona');
    const dialogue = body.querySelector('[data-section="dialogue"]');
    expect(persona?.compareDocumentPosition(dialogue as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('① 다이아몬드 = 이전 점선 + 현재 · 범례 · 대체 텍스트에 판정·숫자 0 (AC-7-38 · N7-15 · N7-39)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    const body = await readyBody();
    const growth = body.querySelector<HTMLElement>('[data-section="growth"]')?.parentElement;
    expect(growth).toBeDefined();

    const chart = within(growth as HTMLElement).getByRole('img');
    expect(chart.getAttribute('aria-label')).toBe(
      'Growth themes for Emma in this report. The dashed outline shows the previous report.',
    );
    expect((growth as HTMLElement).querySelector('.haru-diamond__previous')).not.toBeNull();
    expect(within(growth as HTMLElement).getByText(copy.growth.legendPrevious)).toBeDefined();
    expect(within(growth as HTMLElement).getByText(copy.growth.legendCurrent)).toBeDefined();
    // 차트·범례·근거 어디에도 숫자 0 (점수·증감 미노출)
    expect((growth as HTMLElement).textContent).not.toMatch(/\d/);
    expect(chart.getAttribute('aria-label')).not.toMatch(/\d|more|less|up|down|improv|grew/i);
  });

  it('① 근거 = 서버 문장 그대로 · Q6 순서 · evidence null 행 미렌더 (AC-7-39)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    const body = await readyBody();
    const rows = [...body.querySelectorAll('.haru-report-detail__evidence-row')].map((row) => [
      row.querySelector('dt')?.textContent,
      row.querySelector('dd')?.textContent,
    ]);
    expect(rows).toStrictEqual([
      ['Self-Direction', 'Often turned the page on her own and chose what to read next.'],
      ['Emotion Regulation', 'Named how characters felt and connected it to her own day.'],
      ['Cognitive Flexibility', 'Tried a new idea when a plan in the story did not work out.'],
    ]);
  });

  it('② 페르소나 타임라인 = 서버 순서 · SINCE/NOW · trigger 출처 3종 · 이름 h3 (AC-7-40 · N7-42)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    const section = await screen.findByRole('region', { name: copy.persona.title('Emma') });
    const items = within(section).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(
      items.map((item) => [
        item.querySelector('.haru-text--tracking-section-label')?.textContent,
        within(item).getByRole('heading', { level: 3 }).textContent,
      ]),
    ).toStrictEqual([
      ['SINCE MAR 16', 'The Quiet Noticer'],
      ['SINCE APR 20', 'Brave Little Maker'],
      ['NOW', 'The Curious Page-Turner'],
    ]);
    expect(within(items[0] as HTMLElement).getByText('From your answers')).toBeDefined();
    expect(within(items[1] as HTMLElement).getByText('From your storytimes')).toBeDefined();
    expect(within(items[2] as HTMLElement).getByText('From your updated answers')).toBeDefined();
    // 마지막(현재) 항목 표식 · rail 은 장식
    expect(items.map((item) => item.hasAttribute('data-current'))).toStrictEqual([
      false,
      false,
      true,
    ]);
    expect(section.querySelectorAll('.haru-report-persona__rail[aria-hidden="true"]')).toHaveLength(
      3,
    );
    expect(within(section).queryByText(copy.persona.unchanged('Emma'))).toBeNull();
  });

  it('③ 대화 지표 5행 = 응답 값 · 시간만 분 포맷 · 최근 신호 · 비교/백분율 0 (AC-7-41)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    const body = await readyBody();
    const card = body.querySelector<HTMLElement>('[data-section="dialogue"]');
    const rows = [...(card?.querySelectorAll('.haru-report-detail__metric-row') ?? [])].map(
      (row) => [row.querySelector('dt')?.textContent, row.querySelector('dd')?.textContent],
    );
    expect(rows).toStrictEqual([
      ['Storytimes', '9'],
      ['Time together', '1h 58m'],
      ['Things Emma said', '146'],
      ['Back-and-forth turns', '64'],
      ['Feeling words', '19'],
    ]);
    expect(within(card as HTMLElement).getByText(copy.dialogue.signalsLabel)).toBeDefined();
    expect(
      within(card as HTMLElement).getByText('Asked what a character might do next.'),
    ).toBeDefined();
    expect(card?.textContent).not.toMatch(/%|vs|average|more than|less than|rank/i);
  });

  it("④ 인용 2장 = NotableQuoteCard · eyebrow IN EMMA'S WORDS · 출처 날짜 · 책 제목 없으면 날짜만 (AC-7-42)", async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    const body = await readyBody();
    const quotes = body.querySelectorAll('[data-section="quotes"] .haru-notable-quote');
    expect(quotes).toHaveLength(2);
    expect(within(quotes[0] as HTMLElement).getByText("IN EMMA'S WORDS")).toBeDefined();
    expect(
      within(quotes[0] as HTMLElement).getByText('May 5 · The Most Magnificent Thing'),
    ).toBeDefined();
    expect(within(quotes[1] as HTMLElement).getByText('Apr 22')).toBeDefined();
    expect(quotes[0]?.textContent).toContain(
      '“Maybe she just needs to rest, like me when I’m frustrated.” — Emma',
    );
  });

  it('⑤ 부모 피드백 = summaryText · 회고 체크 라벨(Stage 5 같은 모듈) {n}× · SR "n times" · 주제 (AC-7-43)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    const body = await readyBody();
    const card = body.querySelector<HTMLElement>('[data-section="feedback"]') as HTMLElement;
    expect(
      within(card).getByText('You often noticed Emma joining in and talking about big feelings.'),
    ).toBeDefined();
    const rows = [...card.querySelectorAll('.haru-report-detail__trend-row')];
    expect(rows.map((row) => row.textContent)).toStrictEqual([
      'Engaged, 5 times5×',
      'Big feelings, 3 times3×',
      'Ask Questions, 2 times2×',
    ]);
    // 시각 메타 `5×` 는 SR 에서 숨긴다 — SR 은 "Engaged, 5 times" 로 듣는다
    expect(
      rows.every((row) => row.querySelector('[aria-hidden="true"]')?.textContent?.endsWith('×')),
    ).toBe(true);
    expect(within(card).getByText('feelings, building things, bedtime')).toBeDefined();
    expect(within(card).queryByText(copy.feedback.empty)).toBeNull();
  });

  it('⑥ 클립 = `S7-E` 플레이어 · ⑦ PDF = `S7-F` — 본문 버튼 = 클립 재생 2 + *Download PDF* 1 (콘텐츠 끝)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    const body = await readyBody();
    expect(within(body).getByRole('heading', { level: 2, name: 'Highlight clips' })).toBeDefined();
    expect(
      within(body)
        .getAllByRole('button')
        .map((node) => node.getAttribute('aria-label') ?? node.textContent),
    ).toStrictEqual([
      'Play clip: Talking about feelings',
      'Play clip: Guessing what happens next',
      'Download PDF',
    ]);
    const pdf = body.querySelector('.haru-report-detail__pdf');
    expect(pdf).not.toBeNull();
    expect(body.lastElementChild).toBe(pdf);
  });

  it('progressbar 는 클립 재생 위치뿐 · 점수 텍스트 0 (N7-15 · AC-7-31 일관 · Plan §5.7 클립 행)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    await readyBody();
    const bars = screen.queryAllByRole('progressbar');
    expect(bars).toHaveLength(2);
    expect(bars.every((bar) => bar.closest('.haru-clip-row') !== null)).toBe(true);
    expect(document.body.textContent).not.toMatch(/\b[1-5]\.\d\b|out of 5|score/i);
  });
});

describe('변형 — 첫 리포트 · 페르소나 1개 · 피드백 없음 · 이름 동결', () => {
  it('과거 리포트(주기 1) — previous null → 점선·범례 0 · 1페르소나 문구 · 피드백 빈 문구 · 발행 시점 이름 (AC-7-38 · 40 · 43 · N7-16)', async () => {
    await renderDetail(MOCK_REPORT_IDS.earlier);
    const body = await readyBody();
    const name = MOCK_LONG_CHILD_FIRST_NAME;

    expect(body.querySelector('.haru-diamond__previous')).toBeNull();
    expect(within(body).queryByText(copy.growth.legendPrevious)).toBeNull();
    expect(within(body).getByRole('img').getAttribute('aria-label')).toBe(
      `Growth themes for ${name} in this report.`,
    );

    const persona = screen.getByRole('region', { name: copy.persona.title(name) });
    expect(within(persona).queryByRole('list')).toBeNull();
    expect(persona.querySelector('.haru-report-persona__rail')).toBeNull();
    expect(within(persona).getByText(copy.persona.unchanged(name))).toBeDefined();

    const feedback = body.querySelector<HTMLElement>('[data-section="feedback"]') as HTMLElement;
    expect(within(feedback).getByText(copy.feedback.empty)).toBeDefined();
    expect(within(feedback).getByRole('heading', { level: 2 })).toBeDefined();

    // 지표 0 은 숨기지 않는다 (Spec §2.3.3) · 신호 0 이면 라벨 0
    const dialogue = body.querySelector<HTMLElement>('[data-section="dialogue"]') as HTMLElement;
    expect(within(dialogue).getByText('0')).toBeDefined();
    expect(within(dialogue).queryByText(copy.dialogue.signalsLabel)).toBeNull();
    // 근거 null 2행 미렌더
    expect(body.querySelectorAll('.haru-report-detail__evidence-row')).toHaveLength(2);
  });

  it('`reports:report-persona-unchanged` — 페르소나 1개 · 타임라인 0 (AC-7-40)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest, ['reports:report-persona-unchanged']);
    const persona = await screen.findByRole('region', { name: copy.persona.title('Emma') });
    expect(within(persona).queryByRole('list')).toBeNull();
    expect(within(persona).getByText('NOW')).toBeDefined();
    expect(within(persona).getByText(copy.persona.unchanged('Emma'))).toBeDefined();
  });

  it('`reports:report-no-previous` — 첫 리포트 오버레이 0 (AC-7-38)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest, ['reports:report-no-previous']);
    const body = await readyBody();
    expect(body.querySelector('.haru-diamond__previous')).toBeNull();
    expect(within(body).queryByText(copy.growth.legendCurrent)).toBeNull();
  });
});

describe('viewed — 최초 표시 1회 (AC-7-44)', () => {
  it('이미 열람한 리포트(`viewed=true`)는 보내지 않는다', async () => {
    const harness = await renderDetail(MOCK_REPORT_IDS.latest);
    await readyBody();
    await act(async () => {
      await Promise.resolve();
    });
    expect(operations(harness, VIEWED_OPERATION)).toHaveLength(0);
  });

  it('`report-published-unviewed` — StrictMode 이중 effect 에도 1회 · 재진입에도 1회 · 화면 변화 0', async () => {
    const harness = await renderDetail(MOCK_REPORT_IDS.latest, [
      'reports:report-published-unviewed',
    ]);
    await readyBody();
    await waitFor(() => {
      expect(operations(harness, VIEWED_OPERATION)).toHaveLength(1);
    });
    expect(operations(harness, VIEWED_OPERATION)[0]?.payload).toStrictEqual({
      reportId: MOCK_REPORT_IDS.latest,
    });

    // 다른 화면 → 다시 상세 (같은 앱 세션)
    act(() => {
      navigateFromTest?.(ROUTES.progress);
    });
    await screen.findByRole('heading', { level: 1, name: 'Progress' });
    act(() => {
      navigateFromTest?.(progressReportPath(MOCK_REPORT_IDS.latest));
    });
    await readyBody();
    await act(async () => {
      await Promise.resolve();
    });
    expect(operations(harness, VIEWED_OPERATION)).toHaveLength(1);
    // 서버 상태도 열람으로 바뀌었다 (Mock 상태 저장형)
    const page = await harness.bundle.clients.reports.list({ childId: MOCK_CHILD_ID });
    expect(page.items.find((item) => item.id === MOCK_REPORT_IDS.latest)?.viewed).toBe(true);
  });
});

describe('상태 — Loading · Error · Offline · Retry · Not ready · Not found (AC-7-45 · Spec §2.9)', () => {
  it('Loading — aria-busy + SR "Loading" 1개 · 전체 화면 스피너 0', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest, ['reports:loading']);
    const loading = await screen.findByRole('status', { name: copy.loading });
    expect(loading.getAttribute('aria-busy')).toBe('true');
    expect(document.querySelector('.haru-spinner')).toBeNull();
  });

  it('Error → Try again · Retry 회복 (`reports:retry`)', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest, ['reports:retry']);
    const retry = await screen.findByRole('button', { name: 'Try again' });
    fireEvent.click(retry);
    await readyBody();
  });

  it('Offline — 오프라인 안내 + Try again', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest, ['reports:offline']);
    expect(await screen.findByText(networkErrorCopy.title)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeDefined();
  });

  it('`report-delayed` 발행 전 id → REPORT_NOT_READY = Not ready + Back to Progress', async () => {
    await renderDetail(MOCK_REPORT_IDS.pending, ['reports:report-delayed']);
    expect(
      await screen.findByRole('heading', { level: 2, name: copy.notReady.title }),
    ).toBeDefined();
    expect(screen.getByText(copy.notReady.description)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: copy.backToProgress }));
    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toBe(ROUTES.progress);
    });
  });

  it('`report-deferred` 발행 전 id → REPORT_NOT_ELIGIBLE = 같은 Not ready 화면', async () => {
    await renderDetail(MOCK_REPORT_IDS.pending, ['reports:report-deferred']);
    expect(
      await screen.findByRole('heading', { level: 2, name: copy.notReady.title }),
    ).toBeDefined();
  });

  it('모르는 id → RESOURCE_NOT_FOUND = Not found + Back to Progress (재시도 버튼 0)', async () => {
    const harness = await renderDetail('e7e7e7e7-0000-4000-8000-0000000000ff');
    expect(
      await screen.findByRole('heading', { level: 2, name: copy.notFound.title }),
    ).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    // 오류 표시 뒤 자동 재요청 0 (StrictMode 는 첫 마운트 취소로 요청이 2번일 수 있다 — dev 전용 동작)
    const settled = operations(harness, DETAIL_OPERATION).length;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(operations(harness, DETAIL_OPERATION)).toHaveLength(settled);
    fireEvent.click(screen.getByRole('button', { name: copy.backToProgress }));
    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toBe(ROUTES.progress);
    });
  });
});

describe('TopBar Back (N7-23)', () => {
  it('앱 안 이전 기록이 없으면(deep link 진입) `/progress` 로 간다', async () => {
    await renderDetail(MOCK_REPORT_IDS.latest);
    await readyBody();
    fireEvent.click(screen.getByRole('button', { name: copy.backLabel }));
    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toBe(ROUTES.progress);
    });
  });
});
