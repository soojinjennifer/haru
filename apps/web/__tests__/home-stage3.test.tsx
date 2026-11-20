/**
 * Stage 3 Home — **Figma 재대조 후 재구현** (approvals §12, audit §10 · §11 · §16).
 *
 * 실제 포인터 제스처·시각 비교는 `e2e/home.spec.ts` · `e2e/visual.spec.ts` 가 덮는다.
 * 여기는 **DOM 수준의 계약**: 탭바 마운트 · 가로 트랙 3장 · flip 2면 · `★ Save` 토글 ·
 * Figma 에 없는 UI 가 **렌더되지 않는다**는 사실이다.
 *
 * 클릭은 `fireEvent` 다 — 이 저장소는 `@testing-library/user-event` 를 쓰지 않는다.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { activityDeckCopy } from '../src/features/activity-card-deck';
import { homeOverviewCopy } from '../src/features/home-overview';
import { progressOverviewCopy } from '../src/features/progress-overview';
import {
  applyActivityCardCacheSeed,
  createActivityCardFixture,
  MOCK_CHILD_ID,
  MOCK_EPOCH_MS,
} from '../src/mocks';
import { createScenarioSource, createScenarioStore } from '../src/mocks/scenarios';
import { DECK_BOOKS } from '../src/mocks/fixtures/saved-books';
import { MOCK_CARD_PROMPTS } from '../src/mocks/fixtures/prompt-sets';
import { ROUTES } from '../src/shared/config/routes';
import {
  ACTIVITY_CARD_CACHE_STORAGE_KEY,
  createActivityCardCache,
} from '../src/shared/lib/activity-card-cache';
import { createFixedClock } from '../src/shared/lib/clock';
import { tabCopy } from '../src/shared/config/tabs';
import { capabilityCopy } from '../src/shared/copy/capability-copy';
import { appCopy } from '../src/shared/copy/app-copy';
import { libraryCopy } from '../src/shared/copy/library-copy';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

async function renderHome(options: { scenarios?: readonly string[]; path?: string } = {}) {
  const harness: Harness = createHarness({
    initialEntries: [options.path ?? ROUTES.home],
    ...(options.scenarios === undefined ? {} : { scenarios: options.scenarios }),
  });
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

/**
 * `QA-4B-006` · `D4-153` — 첫 화면을 기본 1000ms 창 하나로 기다리지 않는다. 진입 직후 Route Guard 가 `me`
 * 조회 동안 Spinner 를 그리고, 판정이 끝나야 화면이 마운트된다(+ 화면 query). 단계마다 기본 창을 따로 준다:
 * ① 여기 = Guard 판정 종료 ② 각 테스트의 원래 대기. 단언은 그대로이고 timeout 값은 바꾸지 않는다.
 * 진입 도우미(`renderHome`)에는 넣지 않는다 — `loading` 테스트가 단계 사이의 과도 프레임(Skeleton)을 잡는다.
 */
async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryByRole('status', { name: appCopy.guard.loadingLabel })).toBeNull();
  });
}

/**
 * 가로 트랙 (로드 완료 상태). 1차의 Z축 스택(`.haru-swipe-deck`)은 Home 에서 쓰지 않는다.
 * Skeleton 도 같은 트랙 기하를 쓰므로 **modifier 로 구분**한다.
 */
function track(): HTMLElement {
  const node = document.querySelector('.haru-activity-track:not(.haru-activity-track--skeleton)');
  if (node === null) throw new Error('activity track not rendered');
  return node as HTMLElement;
}

/** 트랙의 n번째 카드(0-based). 세 장이 **동시에 DOM 에 있다** — 스크롤로 보일 뿐이다. */
function cardAt(position: number): HTMLElement {
  const node = track().children[position];
  if (!(node instanceof HTMLElement)) throw new Error(`card ${String(position)} not rendered`);
  return node;
}

function frontFace(position = 0): HTMLElement {
  const node = cardAt(position).querySelector('.haru-activity-card-flip__face--front');
  if (node === null) throw new Error('front face not rendered');
  return node as HTMLElement;
}

function backFace(position = 0): HTMLElement {
  const node = cardAt(position).querySelector('.haru-activity-card-flip__face--back');
  if (node === null) throw new Error('back face not rendered');
  return node as HTMLElement;
}

async function waitForTrack(): Promise<void> {
  await waitForGuard();
  await waitFor(() => {
    expect(
      document.querySelector('.haru-activity-track:not(.haru-activity-track--skeleton)'),
    ).not.toBeNull();
  });
}

beforeEach(() => {
  vi.setSystemTime(new Date(MOCK_EPOCH_MS));
});

afterEach(() => {
  vi.useRealTimers();
  globalThis.localStorage.clear();
});

describe('BottomTabBar 마운트 (AC-3-04 · AC-3-05 · AC-3-08)', () => {
  it('`/` 에 탭바가 있고 항목이 Library / Home / Progress 3개다 — `/session` 탭이 없다', async () => {
    await renderHome();

    const nav = await screen.findByRole('navigation', { name: tabCopy.navLabel });
    const links = within(nav).getAllByRole('link');

    expect(links.map((link) => link.textContent)).toStrictEqual([
      tabCopy.library,
      tabCopy.home,
      tabCopy.progress,
    ]);
    expect(within(nav).queryByText(/session/i)).toBeNull();
  });

  it('활성 탭을 색이 아닌 수단으로도 구분한다 — `aria-current="page"` + 라벨 굵기', async () => {
    await renderHome();

    const nav = await screen.findByRole('navigation', { name: tabCopy.navLabel });
    const current = within(nav)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');

    expect(current).toHaveLength(1);
    expect(current[0]?.textContent).toBe(tabCopy.home);
    expect(current[0]?.querySelector('.haru-text--weight-semibold')).not.toBeNull();
  });

  it('`/library` 에도 탭바가 마운트되고 활성 탭이 Library 다', async () => {
    await renderHome({ path: ROUTES.library });

    const nav = await screen.findByRole('navigation', { name: tabCopy.navLabel });
    const current = within(nav)
      .getAllByRole('link')
      .find((link) => link.getAttribute('aria-current') === 'page');

    expect(current?.textContent).toBe(tabCopy.library);
  });

  it('탭을 눌러 이동할 수 있다 (키보드로 포커스 가능한 링크다)', async () => {
    await renderHome();

    const nav = await screen.findByRole('navigation', { name: tabCopy.navLabel });
    const progress = within(nav).getByRole('link', { name: tabCopy.progress });

    progress.focus();
    expect(document.activeElement).toBe(progress);

    fireEvent.click(progress);
    await waitFor(() => {
      expect(screen.getByTestId('pathname').textContent).toBe(ROUTES.progress);
    });

    expect(
      screen.getByRole('heading', { level: 1, name: progressOverviewCopy.title }),
    ).toBeDefined();
    // Stage 7 `S7-C` — 준비 안내(`D-2`)가 Figma `31:102` 화면으로 대체됐다. 본문 상세는 `progress-overview.test.tsx`.
    expect(
      await screen.findByRole('heading', { level: 2, name: progressOverviewCopy.reading.title }),
    ).toBeDefined();
  });

  /*
    Library 2라운드로 `/library` 본문이 생겼다 — 이 테스트의 기존 기대값은
    "탭바 마운트 자리만 잡는다(= `EmptyState` 1개)" 라는 **과도기 상태**였고, 그 상태가 끝났다.
    여기서는 Home 탭 묶음의 관심사만 남긴다: 제목 행(`<h1>`) 과 섹션이 함께 마운트된다.
    서재 본문의 상세 계약은 `library-screen.test.tsx` 가 덮는다.
  */
  it('`/library` 에 제목 행과 서재 섹션이 함께 마운트된다', async () => {
    await renderHome({ path: ROUTES.library });
    await waitForGuard();

    expect(
      await screen.findByRole('heading', { level: 2, name: libraryCopy.sectionTitles.curated }),
    ).toBeDefined();
    expect(screen.getByRole('heading', { level: 1, name: libraryCopy.title })).toBeDefined();
  });
});

describe('Home 본문 (AC-3-09 · AC-3-10 · AC-3-13)', () => {
  it('Stage 2 skeleton 을 대체하고 `…/home` · `…/activity-cards/today` 를 호출한다', async () => {
    const harness = await renderHome();
    await waitForTrack();

    const operations = harness.bundle.requestLog.entries().map((entry) => entry.operation);
    expect(operations).toContain('GET /v1/children/:childId/home');
    expect(operations).toContain('GET /v1/children/:childId/activity-cards/today');

    expect(screen.queryByText('Your storytime space is ready.')).toBeNull();
  });

  it('트랙에 3장이 동시에 있고 앞면에 역량 배지·책·추천 이유가 있다', async () => {
    await renderHome();
    await waitForTrack();

    expect(track().children).toHaveLength(3);
    expect(document.querySelectorAll('.haru-page-indicator__dot')).toHaveLength(3);
    expect(document.querySelectorAll('.haru-page-indicator__dot--active')).toHaveLength(1);

    const front = frontFace(0);
    expect(within(front).getByText(capabilityCopy.emotion_regulation)).toBeDefined();
    expect(within(front).getByRole('heading', { level: 2 }).textContent).toBe(DECK_BOOKS[0]?.title);
    expect(
      within(front).getByText('A big feeling gets a shape your child can point at and name.'),
    ).toBeDefined();
  });

  /*
    `AC-3-10` 수정 (approvals §12.8 `A-17` + **§12.14**) — 코칭 노트의 자리는 **뒷면**이고,
    **Prompt 1개당 1개**다. 앞면에는 코칭 노트가 없다.
  */
  it('코칭 노트가 **앞면에 없고 뒷면**에 Prompt 와 1:1 로 있다', async () => {
    await renderHome();
    await waitForTrack();

    const note = MOCK_CARD_PROMPTS[0]?.coachingNote ?? '';
    expect(note.length).toBeGreaterThan(0);

    expect(within(frontFace(0)).queryByText(note)).toBeNull();
    expect(within(backFace(0)).getByText(note)).toBeDefined();

    // 개수가 Prompt 개수와 같다 (Figma 의 2쌍은 예시이고 개수는 데이터가 정한다).
    expect(backFace(0).querySelectorAll('.haru-coaching-note')).toHaveLength(
      MOCK_CARD_PROMPTS.length,
    );
    expect(backFace(0).querySelectorAll('.haru-prompt-pill')).toHaveLength(
      MOCK_CARD_PROMPTS.length,
    );
  });

  it('책 표지가 Mock 에셋 URL 로 렌더된다 — 이니셜 placeholder 가 아니다 (§12.12)', async () => {
    await renderHome();
    await waitForTrack();

    const cover = frontFace(0).querySelector('.haru-book-cover img');
    expect(cover).not.toBeNull();
    expect(cover?.getAttribute('src')).toBe(DECK_BOOKS[0]?.coverUrl);
    expect(frontFace(0).querySelector('.haru-book-cover--placeholder')).toBeNull();
  });

  it('역량 배지에 `" Day"` suffix 가 없다 (N-3 · AD-S3-2)', async () => {
    await renderHome();
    await waitForTrack();

    // 책 제목에 "Day" 가 들어갈 수 있으므로 **배지 요소만** 검사한다.
    const badges = [...document.querySelectorAll('.haru-tag')].map((tag) => tag.textContent ?? '');
    expect(badges.filter((label) => /\bDay\b/.test(label))).toStrictEqual([]);
    expect(screen.queryByText(/Emotion Day/)).toBeNull();
  });

  it('캐릭터 버블이 서버 주 문구 + copy 보조 문구 한 줄을 보여 준다 (`A-7`)', async () => {
    await renderHome();
    await waitForGuard();

    expect(
      await screen.findByText('Fifteen minutes together is plenty for tonight.'),
    ).toBeDefined();
    expect(screen.getByText(homeOverviewCopy.bubbleHint)).toBeDefined();
    // Figma 문구는 거짓 어포던스라 채택하지 않았다 (approvals §12.8).
    expect(screen.queryByText('Tap me to say hi')).toBeNull();
  });

  /*
    ⚠ 닫기(x) 버튼은 **Figma 에 없다** — 사용자 지시(2026-10-05)로 추가했고 허용 차이로
    등록한다. 닫힘 범위는 **지금 그 문구에 한정**이며 저장소를 쓰지 않는다.
  */
  describe('버블 닫기 (사용자 지시 2026-10-05)', () => {
    it('닫으면 버블이 사라진다 — 접근 가능한 이름은 기존 `Dismiss` 다', async () => {
      await renderHome();
      await waitForTrack();

      const line = 'Fifteen minutes together is plenty for tonight.';
      expect(screen.getByText(line)).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: homeOverviewCopy.bubbleDismiss }));

      await waitFor(() => {
        expect(screen.queryByText(line)).toBeNull();
      });
      // 보조 줄도 함께 사라진다 (버블 전체가 닫힌다).
      expect(screen.queryByText(homeOverviewCopy.bubbleHint)).toBeNull();
    });

    it('닫기 버튼이 키보드로 도달·실행된다', async () => {
      await renderHome();
      await waitForTrack();

      const button = screen.getByRole('button', { name: homeOverviewCopy.bubbleDismiss });
      button.focus();
      expect(document.activeElement).toBe(button);

      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByText(homeOverviewCopy.bubbleHint)).toBeNull();
      });
    });

    it('`characterLine` 이 다르면 **다른 문구는 그대로 보인다** (상태 알림이 묻히지 않는다)', async () => {
      // 같은 문구를 닫아도, 상태를 알리는 다른 문구는 별도 시나리오에서 그대로 보인다.
      await renderHome({ scenarios: ['home:session-already-active'] });
      await waitForTrack();

      const stateLine = 'A storytime is still open — you can pick it back up.';
      expect(screen.getByText(stateLine)).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: homeOverviewCopy.bubbleDismiss }));
      await waitFor(() => {
        expect(screen.queryByText(stateLine)).toBeNull();
      });
    });
  });

  it('TopBar 에 이번 주 세션 수 칩이 붙는다 (streak·분 표시 없음 — D-6)', async () => {
    await renderHome();
    await waitForGuard();

    const banner = await screen.findByRole('banner');
    await waitFor(() => {
      expect(within(banner).getByText(homeOverviewCopy.weekSummary.label(2))).toBeDefined();
    });
    expect(within(banner).queryByText(/streak|min|goal/i)).toBeNull();
  });
});

/* ── Figma 에 없는 UI 가 **렌더되지 않는다** (최우선 규칙 2 — 1차 실패의 핵심) ───────── */
describe('Figma 에 없는 UI 부재 (approvals §12.3 · §12.4 · §12.8)', () => {
  it('덱 좌우 이동 버튼이 **존재하지 않는다**', async () => {
    await renderHome();
    await waitForTrack();

    expect(screen.queryByRole('button', { name: /previous option/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /next option/i })).toBeNull();
    expect(document.querySelector('.haru-activity-deck__nav')).toBeNull();
  });

  it('`Show all N prompts` 확장 트리거가 **존재하지 않는다** (`N-2` 폐기)', async () => {
    await renderHome();
    await waitForTrack();

    expect(screen.queryByRole('button', { name: /show all \d+ prompts/i })).toBeNull();
    expect(screen.queryByText(/show fewer/i)).toBeNull();
  });

  it('`Pick a time` 과 Reading Context 진입점이 **존재하지 않는다** (이월)', async () => {
    await renderHome();
    await waitForTrack();

    expect(screen.queryByRole('button', { name: /pick a time/i })).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('지난 날짜 안내 배너가 **어떤 상태에서도** 렌더되지 않는다 (`AC-3-11` 폐기 · `AC-3-88`)', async () => {
    await renderHome();
    await waitForTrack();

    // Mock clock 은 2026-01-01 고정이다. 어떤 날짜 문자열도 화면에 나오지 않아야 한다.
    expect(screen.queryByText(/prepared for/i)).toBeNull();
    expect(screen.queryByText(/January 1, 2026/)).toBeNull();
    expect(screen.queryByText(/2026-01-01/)).toBeNull();
    expect(document.querySelector('.haru-inline-alert')).toBeNull();
  });

  it('`SwipeDeck` 을 Home 에서 쓰지 않는다 (Stage 2 설문은 계속 쓴다 — 삭제 아님)', async () => {
    await renderHome();
    await waitForTrack();

    expect(document.querySelector('.haru-swipe-deck')).toBeNull();
  });
});

describe('상태 화면 (AC-3-14 · AC-3-15 · AC-3-20 · AC-3-82)', () => {
  it('`loading` 에서 헤더·탭바는 즉시 보이고 덱 자리에 Skeleton 이 뜬다', async () => {
    await renderHome({ scenarios: ['activity-cards:loading', 'home:loading'] });

    expect(await screen.findByRole('banner')).toBeDefined();
    expect(screen.getByRole('navigation', { name: tabCopy.navLabel })).toBeDefined();

    await waitFor(() => {
      expect(document.querySelector('.haru-activity-track--skeleton')).not.toBeNull();
    });
    // `saved` 를 모르는 상태에서 `Save`/`Saved` 중 하나를 보여 주지 않는다 (audit §16.5).
    expect(screen.queryByRole('button', { name: activityDeckCopy.card.save })).toBeNull();
  });

  it('`empty` 에서 카드 없음 안내가 덱 자리에 inline 으로 뜬다 (`AC-3-82`)', async () => {
    await renderHome({ scenarios: ['activity-cards:empty'] });
    await waitForGuard();

    expect(await screen.findByText(activityDeckCopy.states.emptyTitle)).toBeDefined();
    expect(document.querySelector('.haru-activity-track')).toBeNull();
    // 트랙 높이를 그대로 점유해 레이아웃이 튀지 않는다.
    expect(document.querySelector('.haru-activity-deck__slot')).not.toBeNull();
  });

  it('`error` 에서 재시도 버튼이 있는 ErrorState 가 뜬다', async () => {
    await renderHome({ scenarios: ['activity-cards:error'] });
    await waitForGuard();

    expect(await screen.findByText(activityDeckCopy.states.errorTitle)).toBeDefined();
    expect(screen.getByRole('button', { name: activityDeckCopy.states.retry })).toBeDefined();
  });

  it('`offline` 에서 오프라인 안내가 뜬다', async () => {
    await renderHome({ scenarios: ['activity-cards:offline'] });
    await waitForGuard();

    expect(await screen.findByText(activityDeckCopy.states.offlineTitle)).toBeDefined();
  });

  /*
    ── Stage 4 `S4-J` — 오프라인 캐시 (`D-11`, 이월 `QA-3-002`, AC-4-82) ──
    이 파일은 시스템 시계를 `MOCK_EPOCH_MS` 로 고정한다 → Mock 카드 날짜(= 같은 날)가 "최근 카드" 다.
  */
  it('`success` 응답을 받으면 카드만 로컬 캐시에 남긴다 (D-11)', async () => {
    await renderHome();
    await waitForTrack();

    await waitFor(() => {
      expect(globalThis.localStorage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).not.toBeNull();
    });
    const cached = createActivityCardCache({ clock: createFixedClock(MOCK_EPOCH_MS) }).read(
      MOCK_CHILD_ID,
    );
    expect(cached.card).toStrictEqual(createActivityCardFixture(createFixedClock(MOCK_EPOCH_MS)));
  });

  it('`offline-cached-card` — 캐시 카드와 Offline Banner 가 **동시에** 보인다 (AC-4-82)', async () => {
    // 브라우저 조립 지점과 같은 seed 를 넣는다 (기기 시계 = 이 파일의 고정 시계).
    expect(
      applyActivityCardCacheSeed({
        store: createScenarioStore([
          createScenarioSource('url', { 'activity-cards': 'offline-cached-card' }),
        ]),
        deviceClock: createFixedClock(MOCK_EPOCH_MS),
      }),
    ).toBe(true);
    await renderHome({ scenarios: ['activity-cards:offline-cached-card'] });

    await waitForTrack();
    expect(track().children).toHaveLength(3);
    const banner = await screen.findByText(activityDeckCopy.states.cachedTitle);
    // 배너는 TopBar 슬롯(헤더 밑)에 있다 — 덱 슬롯의 오프라인 안내가 아니다.
    expect(banner.closest('.haru-app-shell__bar-top')).not.toBeNull();
    expect(banner.closest('.haru-alert--banner')).not.toBeNull();
    // 제목 없이 1줄 — 본문(`description`) 미렌더 (`D4-32` · `D4-37`).
    expect(banner.textContent).toBe('Go online to start a session');
    expect(banner.closest('.haru-alert__body')?.children).toHaveLength(1);
    expect(document.querySelector('.haru-activity-deck__slot')).toBeNull();
    // 오프라인 캐시 카드에서는 세션 시작이 비활성이다 (`D4-33` — 사유는 배너가 대신한다).
    expect(
      within(frontFace(0))
        .getByRole('button', { name: activityDeckCopy.card.startSession.label })
        .getAttribute('aria-disabled'),
    ).toBe('true');
  });

  it('`offline-cached-card` 인데 캐시가 없으면 Stage 3 의 오프라인 안내 (배너 없음)', async () => {
    await renderHome({ scenarios: ['activity-cards:offline-cached-card'] });
    await waitForGuard();

    expect(await screen.findByText(activityDeckCopy.states.offlineDescription)).toBeDefined();
    expect(screen.queryByText(activityDeckCopy.states.cachedTitle)).toBeNull();
    expect(document.querySelector('.haru-activity-track')).toBeNull();
  });

  it('서버 오류에는 캐시를 쓰지 않는다 — 오류를 감추지 않는다', async () => {
    createActivityCardCache({ clock: createFixedClock(MOCK_EPOCH_MS) }).write(
      MOCK_CHILD_ID,
      createActivityCardFixture(createFixedClock(MOCK_EPOCH_MS)),
    );
    await renderHome({ scenarios: ['activity-cards:error'] });
    await waitForGuard();

    expect(await screen.findByText(activityDeckCopy.states.errorTitle)).toBeDefined();
    expect(document.querySelector('.haru-activity-track')).toBeNull();
    expect(screen.queryByText(activityDeckCopy.states.cachedTitle)).toBeNull();
  });

  it('2일 지난 캐시는 쓰지 않고 지운다 (D-11 ③)', async () => {
    const twoDaysAgo = createFixedClock(MOCK_EPOCH_MS - 2 * 86_400_000);
    createActivityCardCache({ clock: twoDaysAgo }).write(
      MOCK_CHILD_ID,
      createActivityCardFixture(twoDaysAgo),
    );
    await renderHome({ scenarios: ['activity-cards:offline'] });
    await waitForGuard();

    expect(await screen.findByText(activityDeckCopy.states.offlineDescription)).toBeDefined();
    expect(document.querySelector('.haru-activity-track')).toBeNull();
    expect(globalThis.localStorage.getItem(ACTIVITY_CARD_CACHE_STORAGE_KEY)).toBeNull();
  });

  /*
    `V-15` (approvals §12.14) — Figma 에 없던 `ActiveSessionNotice` 를 **제거**했다.
    진행 중 세션은 **버블의 `characterLine`(서버 값)** 이 말한다 → 신규 UI 0건.
  */
  it('`session-already-active` 를 **버블 문구**가 알리고 세션 생성 호출이 0건이다', async () => {
    const harness = await renderHome({ scenarios: ['home:session-already-active'] });
    await waitForGuard();

    expect(
      await screen.findByText('A storytime is still open — you can pick it back up.'),
    ).toBeDefined();
    // 별도 안내 블록을 만들지 않는다.
    expect(document.querySelector('.haru-alert')).toBeNull();

    const operations = harness.bundle.requestLog.entries().map((entry) => entry.operation);
    expect(operations.filter((operation) => operation.includes('/v1/sessions'))).toStrictEqual([]);
  });

  /*
    `conversation-only-option` 은 폐지되었다 (approvals §12.12) — 책 없는 카드가 없다.
    재독 카드는 **표식 Tag 가 아니라 카드 접근성 이름**으로 종류를 전달한다 (Figma 앞면
    Cardtitle 행에 표식 자리가 없다).
  */
  it('`reread-option` 이 카드 접근성 이름으로 종류를 식별시킨다 (색 단독 금지)', async () => {
    await renderHome({ scenarios: ['activity-cards:reread-option'] });
    await waitForTrack();

    expect(cardAt(0).getAttribute('aria-label')).toContain('Read again');
    expect(cardAt(1).getAttribute('aria-label')).not.toContain('Read again');
  });

  it('`books-exhausted` 는 3장 모두 재독 카드이고 **전부 책이 있다**', async () => {
    await renderHome({ scenarios: ['activity-cards:books-exhausted'] });
    await waitForTrack();

    for (let position = 0; position < 3; position += 1) {
      expect(cardAt(position).getAttribute('aria-label')).toContain('Read again');
      expect(frontFace(position).querySelector('.haru-book-cover')).not.toBeNull();
    }
  });
});

describe('가로 트랙 (AC-3-18 · AC-3-87 — WCAG 2.5.1)', () => {
  it('트랙이 포커스를 받고 접근성 이름을 가진다 (제스처 전용이 아니다)', async () => {
    await renderHome();
    await waitForTrack();

    const node = track();
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('aria-label')).toBe(activityDeckCopy.deck.label);

    node.focus();
    expect(document.activeElement).toBe(node);
  });

  it('카드마다 `Option n of 3: {제목}` 접근성 이름을 갖는다', async () => {
    await renderHome();
    await waitForTrack();

    expect(cardAt(0).getAttribute('aria-label')).toBe(
      `Option 1 of 3: ${DECK_BOOKS[0]?.title ?? ''}`,
    );
    expect(cardAt(2).getAttribute('aria-label')).toBe(
      `Option 3 of 3: ${DECK_BOOKS[2]?.title ?? ''}`,
    );
  });

  it('←/→/Home/End 만으로 3장 전부에 도달한다 (버튼 없음)', async () => {
    await renderHome();
    await waitForTrack();

    const live = document.querySelector('[aria-live="polite"]');
    const node = track();
    node.focus();

    const seen: string[] = [live?.textContent ?? ''];

    fireEvent.keyDown(node, { key: 'ArrowRight' });
    await waitFor(() => {
      expect(live?.textContent).toContain('Option 2 of 3');
    });
    seen.push(live?.textContent ?? '');

    fireEvent.keyDown(node, { key: 'End' });
    await waitFor(() => {
      expect(live?.textContent).toContain('Option 3 of 3');
    });
    seen.push(live?.textContent ?? '');

    fireEvent.keyDown(node, { key: 'Home' });
    await waitFor(() => {
      expect(live?.textContent).toContain('Option 1 of 3');
    });

    fireEvent.keyDown(node, { key: 'ArrowLeft' });
    // 첫 카드에서 왼쪽은 더 가지 않는다 (경계).
    await waitFor(() => {
      expect(live?.textContent).toContain('Option 1 of 3');
    });

    expect(new Set(seen).size).toBe(3);
  });

  it('현재 위치를 `aria-live` 로 알린다 — "Option {n} of 3: {제목}"', async () => {
    await renderHome();
    await waitForTrack();

    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe(`Option 1 of 3: ${DECK_BOOKS[0]?.title ?? ''}`);
  });

  it('dots 는 장식이라 접근성 경로가 아니다', async () => {
    await renderHome();
    await waitForTrack();

    const dots = document.querySelector('.haru-page-indicator__dots');
    expect(dots?.getAttribute('aria-hidden')).toBe('true');
    // 위치 전달은 트랙의 `aria-live` status 가 담당한다 (dots 는 시각 표시다).
    expect(document.querySelector('.haru-page-indicator [aria-live]')).toBeNull();
  });
});

describe('Prompt 노출 (AC-3-83 — D-21)', () => {
  it('앞면이 fixture 개수를 **전부** 보여 준다 (자르지 않는다)', async () => {
    await renderHome();
    await waitForTrack();

    expect(MOCK_CARD_PROMPTS.length).toBeGreaterThan(3);
    expect(frontFace(0).querySelectorAll('.haru-prompt-pill')).toHaveLength(
      MOCK_CARD_PROMPTS.length,
    );
  });

  it('phase · pageRef 가 있으면 배지를, 없으면 아무 배지도 렌더하지 않는다', async () => {
    await renderHome();
    await waitForTrack();

    const pills = [...frontFace(0).querySelectorAll('.haru-prompt-pill')];
    const badgeCounts = pills.map((pill) => pill.querySelectorAll('.haru-tag').length);

    // fixture 순서: PRE / POST / P.6 / (POST + P.12) / 배지 없음
    expect(badgeCounts).toStrictEqual([1, 1, 1, 2, 0]);
    expect(pills[0]?.textContent).toContain('PRE');
    expect(pills[1]?.textContent).toContain('POST');
    expect(pills[2]?.textContent).toContain('P.6');
    expect(pills[3]?.textContent).toContain('P.12');
  });

  it('Prompt 목록이 스크롤 영역이면서 접근성 이름을 가진다 (n > 4 대비)', async () => {
    await renderHome();
    await waitForTrack();

    const list = frontFace(0).querySelector('.haru-prompt-preview');
    expect(list?.getAttribute('tabindex')).toBe('0');
    expect(list?.getAttribute('aria-label')).toBe(activityDeckCopy.card.promptsLabel);
  });
});

describe('카드 뒤집기 (AC-3-16 · AC-3-19 — Figma `86:482`)', () => {
  it('앞면이 기본이고 뒷면은 `inert` + `aria-hidden` 이다', async () => {
    await renderHome();
    await waitForTrack();

    expect(cardAt(0).querySelector('.haru-activity-card-flip')?.getAttribute('data-face')).toBe(
      'front',
    );
    expect(backFace(0).getAttribute('aria-hidden')).toBe('true');
    expect(frontFace(0).hasAttribute('inert')).toBe(false);
  });

  it('우상단 아이콘을 누르면 뒤집히고 두 면의 숨김이 뒤바뀐다', async () => {
    await renderHome();
    await waitForTrack();

    fireEvent.click(
      within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.showBack }),
    );

    await waitFor(() => {
      expect(cardAt(0).querySelector('.haru-activity-card-flip')?.getAttribute('data-face')).toBe(
        'back',
      );
    });
    expect(frontFace(0).getAttribute('aria-hidden')).toBe('true');
    expect(backFace(0).getAttribute('aria-hidden')).toBe('false');

    // 뒤집기 버튼은 **같은 자리**에 있고 토글 상태를 알린다.
    const backButton = within(backFace(0)).getByRole('button', {
      name: activityDeckCopy.card.showFront,
    });
    expect(backButton.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(backButton);
    await waitFor(() => {
      expect(cardAt(0).querySelector('.haru-activity-card-flip')?.getAttribute('data-face')).toBe(
        'front',
      );
    });
  });

  it('뒷면 제목이 Figma 문구(**단수형**)이고 Prompt 전부 + 코칭 노트가 있다', async () => {
    await renderHome();
    await waitForTrack();

    const back = backFace(0);
    // 뒷면은 `inert` + `aria-hidden` 이라 접근성 트리에서 숨겨져 있다 → `hidden: true`.
    expect(within(back).getByRole('heading', { level: 2, hidden: true }).textContent).toBe(
      activityDeckCopy.card.backTitle,
    );
    expect(activityDeckCopy.card.backTitle).toBe('Prompt of this book');
    expect(back.querySelectorAll('.haru-prompt-pill')).toHaveLength(MOCK_CARD_PROMPTS.length);
    expect(back.querySelectorAll('.haru-coaching-note')).toHaveLength(MOCK_CARD_PROMPTS.length);
  });

  it('뒷면에 ActionBar 가 없다 (Figma `86:482` 에 없다)', async () => {
    await renderHome();
    await waitForTrack();

    expect(backFace(0).querySelector('.haru-activity-card__actions')).toBeNull();
  });
});

describe('`★ Save` (AC-3-84 · AC-3-85 · AC-3-86 — API_CONTRACTS §3.7)', () => {
  it('기본은 `Save` 이고 `aria-pressed=false` 다', async () => {
    await renderHome();
    await waitForTrack();

    const button = within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.save });
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('누르면 `PUT …/saved-books` 가 **1회** 발생하고 라벨이 `Saved` 로 바뀐다', async () => {
    const harness = await renderHome();
    await waitForTrack();

    fireEvent.click(within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.save }));

    await waitFor(() => {
      expect(
        within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.saved }),
      ).toBeDefined();
    });

    const saves = harness.bundle.requestLog
      .entries()
      .filter((entry) => entry.operation === 'PUT /v1/children/:childId/saved-books');
    expect(saves).toHaveLength(1);
    // 저장 대상은 **현재 보이는 옵션의 책**이다 (`AC-3-86`).
    expect(saves[0]?.payload).toStrictEqual({ target: { bookId: DECK_BOOKS[0]?.id } });
    expect(
      within(frontFace(0))
        .getByRole('button', { name: activityDeckCopy.card.saved })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('다시 누르면 해제된다 — `DELETE` 가 나가고 라벨이 되돌아온다 (`G-13` 토글)', async () => {
    const harness = await renderHome({ scenarios: ['activity-cards:book-saved'] });
    await waitForTrack();

    // `G-14` — 어제 저장한 책은 **처음부터** `Saved` 다.
    const saved = within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.saved });
    expect(saved.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(saved);
    await waitFor(() => {
      expect(
        within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.save }),
      ).toBeDefined();
    });

    const operations = harness.bundle.requestLog.entries().map((entry) => entry.operation);
    expect(operations).toContain('DELETE /v1/children/:childId/saved-books/:bookId');
  });

  it('`Idempotency-Key` 를 보내지 않는다 (PUT = 상태 설정)', async () => {
    const harness = await renderHome();
    await waitForTrack();

    fireEvent.click(within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.save }));
    await waitFor(() => {
      expect(
        harness.bundle.requestLog
          .entries()
          .some((entry) => entry.operation.includes('saved-books')),
      ).toBe(true);
    });

    const save = harness.bundle.requestLog
      .entries()
      .find((entry) => entry.operation === 'PUT /v1/children/:childId/saved-books');
    expect(JSON.stringify(save?.payload ?? {})).not.toContain('dempotency');
  });

  it('실패하면 낙관적 표시가 **롤백**되고 Toast 가 뜬다 (`AC-3-85`)', async () => {
    await renderHome({ scenarios: ['library:error'] });
    await waitForTrack();

    fireEvent.click(within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.save }));

    expect(await screen.findByText(activityDeckCopy.card.saveFailed)).toBeDefined();
    await waitFor(() => {
      expect(
        within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.save }),
      ).toBeDefined();
    });
  });

  it('오프라인도 같은 실패 경로다 (사전 차단 UI 를 만들지 않는다)', async () => {
    await renderHome({ scenarios: ['library:offline'] });
    await waitForTrack();

    fireEvent.click(within(frontFace(0)).getByRole('button', { name: activityDeckCopy.card.save }));

    expect(await screen.findByText(activityDeckCopy.card.saveFailed)).toBeDefined();
  });

  it('저장 상태를 **색 단독**으로 전달하지 않는다 — 라벨이 바뀐다', async () => {
    await renderHome({ scenarios: ['activity-cards:book-saved'] });
    await waitForTrack();

    expect(frontFace(0).textContent).toContain(activityDeckCopy.card.saved);
    // 저장되지 않은 두 번째 카드는 `Save` 다 (옵션 단위 상태).
    expect(frontFace(1).textContent).toContain(activityDeckCopy.card.save);
  });
});

describe('`Start Session` 은 Stage 4 `S4-F1` 에서 활성이다 (`D-3` 해제 · AC-4-38)', () => {
  it('`aria-disabled` 가 없고, 누르면 Reading Context 시트가 열린다 (`D4-35`)', async () => {
    await renderHome();
    await waitForTrack();

    const cta = within(frontFace(0)).getByRole('button', {
      name: activityDeckCopy.card.startSession.label,
    });

    expect(cta.getAttribute('aria-disabled')).toBeNull();
    expect(cta).toHaveProperty('disabled', false);
    fireEvent.click(cta);
    expect(
      await screen.findByRole('dialog', { name: activityDeckCopy.readingContext.title }),
    ).toBeTruthy();
  });

  it('ActionBar 가 `Save` + `Start Session` 두 개뿐이다 (Figma `86:373`)', async () => {
    await renderHome();
    await waitForTrack();

    const actions = frontFace(0).querySelector('.haru-activity-card__actions');
    expect(actions?.querySelectorAll('button')).toHaveLength(2);
  });
});
