/**
 * Stage 3 Library 2라운드 — `/library` **본 화면**의 DOM 계약.
 *
 * 실제 포인터 제스처·시각 비교·그림자 클리핑은 `e2e/visual.spec.ts` · `e2e/shadow.spec.ts` 가
 * 덮는다. 여기는 **DOM 수준의 계약**이다:
 *   ① 섹션 4개가 Figma 순서로 뜨고 "See all" 이 세 섹션 모두에 있다
 *   ② `Reading now` 는 **없을 때 블록 전체가 사라지는 유일한 예외**다
 *   ③ 0건 섹션은 **사라지지 않는다** — 헤더를 남기고 안내를 넣으며 "See all" 을 비활성한다
 *   ④ `plannedNights === null` → 회차 문구 미렌더 · `progressRatio` 는 **서버 값만** 그린다
 *   ⑤ `averageRating === null` → 행 우측 meta 미렌더
 *   ⑥ `Finished together` 는 **4행 고정**이고 섹션 안 "Show more" 가 없다
 *   ⑦ Figma 에 없는 UI(보유·증정 표식 · `My Saved` · 좌우 이동 버튼)가 **렌더되지 않는다**
 *   ⑧ 조회는 `GET …/library/overview` **1회**다 (섹션별 호출 금지 — `P3-BIP-18`)
 *
 * 클릭은 `fireEvent` 다 — 이 저장소는 `@testing-library/user-event` 를 쓰지 않는다.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppRoutes } from '../src/app/router';
import { MOCK_EPOCH_MS } from '../src/mocks';
import { ROUTES } from '../src/shared/config/routes';
import { appCopy } from '../src/shared/copy/app-copy';
import { capabilityCopy } from '../src/shared/copy/capability-copy';
import { libraryCopy } from '../src/shared/copy/library-copy';
import { createHarness, type Harness } from '../src/test/harness';

const CREDENTIALS = { email: 'sam@example.com', password: 'sunny-evening-8' } as const;

async function renderLibrary(scenarios: readonly string[] = []): Promise<Harness> {
  const harness = createHarness({
    initialEntries: [ROUTES.library],
    ...(scenarios.length === 0 ? {} : { scenarios }),
  });
  await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });

  const Wrapper = harness.wrapper;
  render(
    <Wrapper>
      <AppRoutes />
    </Wrapper>,
  );
  await waitForGuard();
  return harness;
}

/**
 * `QA-4B-006` · `D4-153` — 첫 화면을 기본 1000ms 창 하나로 기다리지 않는다. 진입 직후 Route Guard 가 `me`
 * 조회 동안 Spinner 를 그리고, 판정이 끝나야 화면이 마운트된다(+ 화면 query). 단계마다 기본 창을 따로 준다:
 * ① 여기 = Guard 판정 종료 ② 각 테스트의 원래 대기. 단언은 그대로이고 timeout 값은 바꾸지 않는다.
 * (Loading 테스트는 이 도우미를 쓰지 않는다 — 단계 사이의 과도 프레임을 잡는 테스트라 대기를 끼우면 그 프레임이 지나간다.)
 */
async function waitForGuard(): Promise<void> {
  await waitFor(() => {
    expect(screen.queryByRole('status', { name: appCopy.guard.loadingLabel })).toBeNull();
  });
}

function shelves(): HTMLElement {
  const node = document.querySelector('.haru-library-shelves');
  if (node === null) throw new Error('library shelves not rendered');
  return node as HTMLElement;
}

async function waitForLoaded(): Promise<void> {
  await waitFor(() => {
    expect(shelves().getAttribute('aria-busy')).toBeNull();
  });
}

beforeEach(() => {
  vi.setSystemTime(MOCK_EPOCH_MS);
});

describe('섹션 구조 (Design Spec §2.2 · §3)', () => {
  it('Reading now → Our curated shelf → Favorites → Finished together 순서로 뜬다', async () => {
    await renderLibrary();
    await waitForLoaded();

    const headings = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent);

    expect(headings).toStrictEqual([
      libraryCopy.sectionTitles.readingNow,
      libraryCopy.sectionTitles.curated,
      libraryCopy.sectionTitles.favorites,
      libraryCopy.sectionTitles.finished,
    ]);
  });

  it('"See all" 이 **세 섹션 모두**에 있고 `Reading now` 에는 없다', async () => {
    await renderLibrary();
    await waitForLoaded();

    const seeAll = screen.getAllByRole('button', { name: /^See all/ });
    expect(seeAll).toHaveLength(3);
    expect(seeAll.map((node) => node.getAttribute('aria-label') ?? node.textContent)).toBeDefined();

    // `Reading now` 의 우측 슬롯은 **비대화형**이다 (`L-OPEN-17`).
    expect(screen.getByText('3 of 5 nights').tagName).toBe('SPAN');
  });

  it('서재 조회는 `…/library/overview` **1회**다 (섹션별 호출 금지 — `P3-BIP-18`)', async () => {
    const harness = await renderLibrary();
    await waitForLoaded();

    const operations = harness.bundle.requestLog
      .entries()
      .map((entry) => entry.operation)
      .filter((operation) => operation.includes('/library'));

    expect(operations).toStrictEqual(['GET /v1/children/:childId/library/overview']);
  });

  it('`Finished together` 는 **4행 고정**이고 섹션 안 "Show more" 가 없다', async () => {
    await renderLibrary();
    await waitForLoaded();

    /*
      2라운드-2 에서 `LibraryEntryActions`(진입점 2행)가 **같은 Page** 에 생겼다. 그 행은
      서재 섹션이 아니므로 단언을 `.haru-library-shelves` 안으로 좁힌다 — 전역 `.haru-list-row`
      개수를 세면 진입점 행까지 포함해 "4행 고정" 이라는 뜻이 사라진다. 진입점 행의 개수는
      별도 테스트(`진입점`)가 고정한다.
    */
    expect(shelves().querySelectorAll('.haru-list-row')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: /show more/i })).toBeNull();
  });

  it('캐러셀 캡션은 4대 역량의 **표시 라벨**이다 (contracts 코드 키가 아니다)', async () => {
    await renderLibrary();
    await waitForLoaded();

    expect(screen.getAllByText(capabilityCopy.emotion_regulation).length).toBeGreaterThan(0);
    expect(screen.queryByText('emotion_regulation')).toBeNull();
  });
});

describe('`Reading now` (Design Spec §3.2 · §7.4)', () => {
  it('진행 바는 **서버 값**(`progressRatio`)을 그린다 — 회차로 계산하지 않는다', async () => {
    await renderLibrary();
    await waitForLoaded();

    const bar = screen.getByRole('progressbar', {
      name: libraryCopy.sectionTitles.readingNow,
    });
    /*
      fixture 의 `progressRatio` 는 **0.552** 이고 회차는 3/5(= 0.6) 다. 두 값이 **다르다**는
      것이 "프론트가 회차로 되계산하지 않는다"(`L-OPEN-16`)의 증거다 — 되계산했다면 0.6 이 나온다.
    */
    expect(bar.getAttribute('aria-valuenow')).toBe('0.552');
    expect(bar.getAttribute('aria-valuenow')).not.toBe('0.6');
    expect(bar.getAttribute('aria-valuemax')).toBe('1');
  });

  it('`readingNow === null` 이면 **블록 전체**(헤더 + 카드)가 사라진다', async () => {
    await renderLibrary(['library:reading-now-none']);
    await waitForLoaded();

    expect(
      screen.queryByRole('heading', { name: libraryCopy.sectionTitles.readingNow }),
    ).toBeNull();
    expect(document.querySelector('.haru-reading-now')).toBeNull();
    // 나머지 섹션은 그대로다.
    expect(screen.getByRole('heading', { name: libraryCopy.sectionTitles.curated })).toBeDefined();
  });
});

describe('0건 상태 — 섹션은 사라지지 않는다 (Design Spec §7.4)', () => {
  it('`favorites-empty` 는 헤더를 남기고 **저장 전 안내**를 넣는다 ("See all" 비활성)', async () => {
    await renderLibrary(['library:favorites-empty']);
    await waitForLoaded();

    expect(
      screen.getByRole('heading', { name: libraryCopy.sectionTitles.favorites }),
    ).toBeDefined();
    expect(screen.getByText(libraryCopy.states.favoritesEmpty.title)).toBeDefined();
    expect(screen.getByText(libraryCopy.states.favoritesEmpty.description)).toBeDefined();

    /*
      접근성 이름은 `aria-labelledby`(자신 + 제목)로 만들어진다 — "See all" 3개가 같은 이름이면
      구분되지 않기 때문이다 (§9.4). 그래서 **계산된 이름**으로 찾는다.
    */
    const favoritesSeeAll = screen.getByRole('button', {
      name: `${libraryCopy.seeAll} ${libraryCopy.sectionTitles.favorites}`,
    });
    expect(favoritesSeeAll.getAttribute('aria-disabled')).toBe('true');

    // 다른 섹션은 영향을 받지 않는다.
    expect(screen.queryByText(libraryCopy.states.finishedEmpty.title)).toBeNull();
  });

  it('`empty` 는 3섹션 안내가 **동시에** 뜨고 별도의 "전체 빈 화면" 을 만들지 않는다', async () => {
    await renderLibrary(['library:empty']);
    await waitForLoaded();

    expect(screen.getByText(libraryCopy.states.curatedEmpty.title)).toBeDefined();
    expect(screen.getByText(libraryCopy.states.favoritesEmpty.title)).toBeDefined();
    expect(screen.getByText(libraryCopy.states.finishedEmpty.title)).toBeDefined();
    expect(screen.getAllByRole('button', { name: /^See all/ })).toHaveLength(3);
  });

  it('`shelf-partial` 은 열을 접지 않고 **dots 를 표시하지 않는다**(페이지 1개)', async () => {
    await renderLibrary(['library:shelf-partial']);
    await waitForLoaded();

    const curated = document.querySelectorAll('.haru-shelf-carousel')[0];
    expect(curated).toBeDefined();
    expect(within(curated as HTMLElement).queryByRole('status')).toBeNull();
    expect((curated as HTMLElement).querySelector('.haru-page-indicator')).toBeNull();
    // 1권이어도 퍼센트 그리드(5열)는 그대로다 — 자리를 접지 않는다.
    expect((curated as HTMLElement).querySelectorAll('.haru-shelf-page__slot')).toHaveLength(1);
  });
});

describe('Book List 행 (Design Spec §3.5)', () => {
  it('`averageRating === null` 이면 우측 meta 를 **렌더하지 않는다** (`L-OPEN-22`)', async () => {
    await renderLibrary(['library:unrated']);
    await waitForLoaded();

    expect(screen.queryByText(libraryCopy.ratedPrefix.trim())).toBeNull();
    expect(document.querySelector('.haru-list-row__meta')).toBeNull();
    // 좌측 메타는 그대로 있다 (빈 자리에 대체 문구를 넣지 않는다).
    expect(document.querySelectorAll('.haru-list-row__subtitle').length).toBeGreaterThan(0);
  });

  it('평점이 있으면 `Rated ` + 숫자가 **2-스타일**로 합성된다', async () => {
    await renderLibrary();
    await waitForLoaded();

    const meta = document.querySelector('.haru-list-row__meta');
    expect(meta?.textContent).toMatch(/^Rated \d/);
  });

  it('보유·증정 표식을 **만들지 않는다** (`L-OPEN-14`)', async () => {
    await renderLibrary(['library:gift-pending']);
    await waitForLoaded();

    for (const label of ['Owned', 'Gifted', 'Gift pending', 'gift_pending']) {
      expect(screen.queryByText(label)).toBeNull();
    }
  });
});

describe('Figma 에 없는 UI 를 만들지 않는다', () => {
  it('`My Saved` · `Books you own` 문구가 없고 캐러셀 좌우 이동 버튼도 없다', async () => {
    await renderLibrary();
    await waitForLoaded();

    expect(screen.queryByText('My Saved')).toBeNull();
    expect(screen.queryByText('Books you own')).toBeNull();
    expect(screen.queryByRole('button', { name: /previous|next/i })).toBeNull();
  });
});

describe('Loading / Error (Design Spec §7.4)', () => {
  it('Loading 은 **헤더를 실제 텍스트로** 유지하고 본문만 Skeleton 이다', async () => {
    const harness = createHarness({
      initialEntries: [ROUTES.library],
      scenarios: ['library:loading'],
    });
    await harness.bundle.authGateway.signInWithEmail({ ...CREDENTIALS });

    const Wrapper = harness.wrapper;
    render(
      <Wrapper>
        <AppRoutes />
      </Wrapper>,
    );

    // 첫 프레임의 Skeleton — 헤더 4개는 **진짜 문구**이고 로딩 안내는 한 번만 전달된다.
    const busy = await screen.findByRole('status', { name: libraryCopy.states.loading });
    expect(within(busy).getAllByRole('heading', { level: 2 })).toHaveLength(4);
    expect(busy.querySelectorAll('.haru-page-indicator')).toHaveLength(0);
  });

  it('Error 는 Retry 를 **한 번만** 제시한다 (단일 조회라 섹션마다 두지 않는다)', async () => {
    await renderLibrary(['library:error']);

    const retry = await screen.findAllByRole('button', { name: libraryCopy.states.retry });
    expect(retry).toHaveLength(1);
    expect(screen.getByText(libraryCopy.states.errorTitle)).toBeDefined();
  });

  it('Offline 도 **같은 경로**다 — 사전 차단 UI 를 만들지 않는다', async () => {
    await renderLibrary(['library:offline']);

    expect(await screen.findByText(libraryCopy.states.errorTitle)).toBeDefined();
    expect(screen.getAllByRole('button', { name: libraryCopy.states.retry })).toHaveLength(1);
  });
});
