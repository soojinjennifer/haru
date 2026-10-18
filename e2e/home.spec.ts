/**
 * Home e2e — 착지 화면(Stage 3 본문) · 설정 진입 · 로그아웃 로컬 정리 · 반응형.
 * AC-2-29 · AC-2-39 · AC-2-40 · AC-2-41 · AC-2-59 · AC-2-60 · AC-2-66.
 *
 * 여기에서만 확인할 수 있는 것: **실제 브라우저의 `localStorage`** 와 포커스·키 입력.
 * jsdom 단위 테스트(`apps/web/__tests__/home-settings.test.tsx`)는 같은 경로를 DOM 수준에서 덮는다.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './support/gallery';

const DRAFT_KEY = 'haru.onboarding.draft.v1';

/** Activity Card 오프라인 캐시 키 (`D-11`, Stage 4 `S4-J`). */
const CARD_CACHE_KEY = 'haru.activity-card.v1';

/** 로그인해서 `/` 에 착지한다 — 기본 `me` 는 온보딩까지 마친 사용자다. */
async function logIn(page: Page, scenario?: string): Promise<void> {
  const query = scenario === undefined ? '' : `?scenario=${encodeURIComponent(scenario)}`;
  await gotoApp(page, `/auth/log-in${query}`);

  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
}

/** Trial 구간에서 실제로 만들어지는 draft 를 남긴 뒤 로그인한다 (D-3 삭제 시점 ② 검증용). */
async function leaveOnboardingDraft(page: Page): Promise<void> {
  await gotoApp(page, '/onboarding/child-info');
  await page.getByLabel('First name').fill('Nova');

  await expect
    .poll(async () => page.evaluate((key) => globalThis.localStorage.getItem(key), DRAFT_KEY))
    .not.toBeNull();
}

/*
 * ⚠ **Home 재구현 (2026-10-05)** — Figma 전수 재대조 결과를 반영했다 (approvals §12, audit §16).
 * 바뀐 것: 덱이 `SwipeDeck` 스택 → **가로 scroll-snap 트랙**, 좌우 버튼 **제거**,
 * `Pick a time` → **`★ Save`**, Prompt **전부 노출**, 카드 **flip** 추가.
 * 이 파일에서만 확인할 수 있는 것: **실제 브라우저의 스크롤·스냅 기하**와 `localStorage`.
 */
test.describe('`/` Home (AC-3-04 · AC-3-09 · AC-3-10 · AC-3-18 · AC-3-87)', () => {
  test('로그인하면 워드마크 · 주간 집계 칩 · 설정 아이콘 + 트랙 + 탭바가 있는 화면에 착지한다', async ({
    page,
  }) => {
    await logIn(page);

    const header = page.getByRole('banner');
    await expect(header.getByText('HARU')).toBeVisible();
    await expect(header.getByRole('button', { name: 'Settings' })).toBeVisible();

    const tabs = page.getByRole('navigation', { name: 'Main' });
    await expect(tabs.getByRole('link')).toHaveCount(3);
    await expect(tabs.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

    await expect(page.locator('.haru-activity-track__item')).toHaveCount(3);
    await expect(page.locator('.haru-page-indicator__dot')).toHaveCount(3);
  });

  test('덱 좌우 이동 버튼이 존재하지 않는다 (Figma 에 없다 — approvals §12.3)', async ({
    page,
  }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Previous option' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Next option' })).toHaveCount(0);
    await expect(page.locator('.haru-swipe-deck')).toHaveCount(0);
  });

  test('키보드(←/→/Home/End)만으로 3장 전부에 도달한다 (AC-3-18 · WCAG 2.5.1)', async ({
    page,
  }) => {
    await logIn(page);

    const track = page.locator('.haru-activity-track');
    await expect(track).toBeVisible();
    await track.focus();

    const status = page.locator('[aria-live="polite"]');
    await expect(status).toHaveText(/Option 1 of 3/);

    await page.keyboard.press('ArrowRight');
    await expect(status).toHaveText(/Option 2 of 3/);

    await page.keyboard.press('End');
    await expect(status).toHaveText(/Option 3 of 3/);

    // 마지막 카드가 실제로 스냅 끝까지 간다 (남는 공백이 없다).
    await expect
      .poll(async () =>
        track.evaluate((node) => {
          const left = Math.round(node.scrollLeft);
          const max = Math.round(node.scrollWidth - node.clientWidth);
          return left === max;
        }),
      )
      .toBe(true);

    await page.keyboard.press('Home');
    await expect(status).toHaveText(/Option 1 of 3/);
    await expect.poll(async () => track.evaluate((node) => Math.round(node.scrollLeft))).toBe(0);
  });

  test('트랙 공식이 성립한다 — 카드 = W − 28, peek = 8 (AC-3-87)', async ({ page }) => {
    for (const width of [320, 393, 600, 1024]) {
      await page.setViewportSize({ width, height: 852 });
      await logIn(page);

      /*
        `logIn` 은 URL 만 기다린다. 측정 전에 **로드 완료 트랙**(Skeleton 이 아닌)이 그려질
        때까지 기다려야 한다 — 기다리지 않으면 레이아웃 도중의 폭 0 을 읽는다
        (전체 e2e 실행에서 재현된 실패 원인이다).
      */
      const loaded = page.locator('.haru-activity-track:not(.haru-activity-track--skeleton)');
      await expect(loaded).toBeVisible();
      await expect.poll(async () => loaded.evaluate((node) => node.clientWidth > 0)).toBe(true);

      const measured = await loaded.evaluate((node: HTMLElement) => {
        const first = node.firstElementChild as HTMLElement;
        const styles = globalThis.getComputedStyle(node);
        return {
          track: Math.round(node.getBoundingClientRect().width),
          card: Math.round(first.getBoundingClientRect().width),
          pad: Math.round(Number.parseFloat(styles.paddingInlineStart)),
          gap: Math.round(Number.parseFloat(styles.columnGap)),
          /*
            415 는 **카드** 높이(`--activity-card-track-size`)다. 트랙 border box 는 그림자
            inset 만큼 더 크다 (519 = 24 + 415 + 80 — `R-SHADOW-1` · approvals §12.15).
            그래서 `__item` 을 잰다.
          */
          height: Math.round(first.getBoundingClientRect().height),
        };
      });

      const column = Math.min(width, 480);
      expect(measured.track).toBe(column);
      expect(measured.card).toBe(column - 28);
      expect(measured.pad).toBe(14);
      expect(measured.gap).toBe(6);
      // peek = pad − gap, 모든 폭에서 불변이다.
      expect(measured.pad - measured.gap).toBe(8);
      expect(measured.height).toBe(415);
    }
  });

  test('카드 하단이 탭바를 덮지 않고 탭바 아래 16px 이 남는다 (AC-3-06 · A-6)', async ({
    page,
  }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    for (const width of [320, 393, 600, 1024]) {
      await page.setViewportSize({ width, height: 852 });
      await expect(page.locator('.haru-tab-bar')).toBeVisible();

      const card = await page.locator('.haru-activity-track__item').first().boundingBox();
      const bar = await page.locator('.haru-tab-bar').boundingBox();
      const viewport = page.viewportSize();

      expect(card).not.toBeNull();
      expect(bar).not.toBeNull();
      // 카드 하단 ≤ 탭바 상단 (겹침 0).
      expect((card?.y ?? 0) + (card?.height ?? 0)).toBeLessThanOrEqual((bar?.y ?? 0) + 1);
      // 탭바 하단 ↔ 화면 하단 = 16 (Figma `26:21`).
      expect(Math.round((viewport?.height ?? 0) - ((bar?.y ?? 0) + (bar?.height ?? 0)))).toBe(16);
    }
  });

  test('ActionBar 가 1행이고 `Save` 가 최소 87px 이다 (320px 포함)', async ({ page }) => {
    for (const width of [320, 393]) {
      await page.setViewportSize({ width, height: 852 });
      await logIn(page);
      await expect(page.locator('.haru-activity-track')).toBeVisible();

      const actions = page.locator('.haru-activity-card__actions').first();
      await expect(actions).toBeVisible();

      const box = await actions.boundingBox();
      const save = await page.locator('.haru-activity-card__save').first().boundingBox();

      // 1행 = ActionBar 높이가 버튼 높이(45)와 같다.
      expect(Math.round(box?.height ?? 0)).toBe(45);
      expect(Math.round(save?.width ?? 0)).toBeGreaterThanOrEqual(87);
    }
  });

  test('`★ Save` 를 누르면 라벨이 `Saved` 로 바뀌고 다시 누르면 되돌아온다 (G-13)', async ({
    page,
  }) => {
    await logIn(page);

    const save = page.getByRole('button', { name: 'Save', exact: true }).first();
    await expect(save).toHaveAttribute('aria-pressed', 'false');

    await save.click();
    const saved = page.getByRole('button', { name: 'Saved', exact: true }).first();
    await expect(saved).toHaveAttribute('aria-pressed', 'true');

    await saved.click();
    await expect(page.getByRole('button', { name: 'Save', exact: true }).first()).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('카드를 뒤집으면 뒷면이 보이고 카드 하단 모서리가 움직이지 않는다 (AC-3-16 · AC-3-19)', async ({
    page,
  }) => {
    await logIn(page);

    const card = page.locator('.haru-activity-card-flip').first();
    await expect(card).toBeVisible();
    const before = await card.boundingBox();

    await page.getByRole('button', { name: 'Show prompts and coaching notes' }).first().click();

    await expect(card).toHaveAttribute('data-face', 'back');
    await expect(page.getByRole('heading', { name: 'Prompt of this book' }).first()).toBeVisible();

    const after = await card.boundingBox();
    // 컨테이너는 415 고정이라 하단 모서리가 1px 도 움직이지 않는다.
    expect((after?.y ?? 0) + (after?.height ?? 0)).toBeCloseTo(
      (before?.y ?? 0) + (before?.height ?? 0),
      0,
    );

    await page.getByRole('button', { name: 'Show the book' }).first().click();
    await expect(card).toHaveAttribute('data-face', 'front');
  });

  /*
    `§12.14` — Prompt 1개당 상세 코칭 노트 1개. 개수는 데이터가 정하고, 넘치면 **본문만**
    세로 스크롤한다. 트랙 415 와 카드 하단 705 는 **절대 바뀌지 않는다** (`A-5`·`A-11`).
  */
  test('뒷면이 Prompt 와 코칭 노트를 1:1 로 보여 주고 본문만 스크롤한다 (§12.14)', async ({
    page,
  }) => {
    await logIn(page);

    const card = page.locator('.haru-activity-card-flip').first();
    const track = page.locator('.haru-activity-track');
    await expect(track).toBeVisible();
    const trackBefore = await track.boundingBox();

    await page.getByRole('button', { name: 'Show prompts and coaching notes' }).first().click();
    await expect(card).toHaveAttribute('data-face', 'back');

    const back = page.locator('.haru-activity-card--back').first();
    const pills = await back.locator('.haru-prompt-pill').count();
    const notes = await back.locator('.haru-coaching-note').count();
    expect(pills).toBe(notes);
    expect(pills).toBeGreaterThan(3);

    const body = page.locator('.haru-activity-card__back-body').first();
    const scroll = await body.evaluate((node) => ({
      client: node.clientHeight,
      total: node.scrollHeight,
    }));
    // 설계치를 넘으므로 **실제로** 스크롤이 돈다.
    expect(scroll.total).toBeGreaterThan(scroll.client);

    await body.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await expect.poll(async () => body.evaluate((node) => node.scrollTop > 0)).toBe(true);

    // 본문이 스크롤돼도 트랙·카드 기하는 1px 도 바뀌지 않는다.
    const trackAfter = await track.boundingBox();
    expect(trackAfter?.height).toBe(trackBefore?.height);
    expect(trackAfter?.y).toBe(trackBefore?.y);
    expect(Math.round((await card.boundingBox())?.height ?? 0)).toBe(415);
  });

  /*
    `V-15` (approvals §12.14) — Figma 에 없던 `ActiveSessionNotice` 를 제거했다.
    진행 중 세션은 **서버 `characterLine`** 이 말하므로 신규 UI 가 0건이고 캐릭터를 가리지 않는다.
  */
  test('진행 중 세션을 버블이 알리고 캐릭터를 가리지 않는다 (V-15)', async ({ page }) => {
    await gotoApp(page, '/auth/log-in?scenario=home:session-already-active');
    await page.getByLabel('Email').fill('sam@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    await expect(
      page.getByText('A storytime is still open — you can pick it back up.'),
    ).toBeVisible();
    // 안내 블록을 만들지 않는다.
    await expect(page.locator('.haru-alert, .haru-inline-alert')).toHaveCount(0);

    // 버블 아래부터 트랙 위까지가 비어 있어야 캐릭터 얼굴이 보인다.
    const bubble = await page.locator('.haru-bubble').boundingBox();
    // 카드 **상단**이 기준이다 (트랙 border box 는 그림자 inset 만큼 위로 넓다 — §12.15).
    const card = await page.locator('.haru-activity-track__item').first().boundingBox();
    expect((bubble?.y ?? 0) + (bubble?.height ?? 0)).toBeLessThan(card?.y ?? 0);

    const character = await page.locator('.haru-home-stage__character').boundingBox();
    expect(Math.round(character?.y ?? 0)).toBe(29);
    expect(Math.round(character?.width ?? 0)).toBe(357);
  });

  /*
    버블은 **내용에 따라 자란다** (사용자 지시 2026-10-05 — 문구를 줄이지 않는다).
    늘어난 높이는 spacer 가 흡수하므로 트랙·dots·탭바는 **Figma 위치 그대로**여야 하고,
    캐릭터 얼굴(눈 ≈184 · 입 ≈201)도 가려지면 안 된다.
  */
  /*
    `W-5` (approvals §13.3) — 버블은 **1~4줄 가변이고 5줄째부터 말줄임**이다.
    근거는 캐릭터 **눈 상단 y=183** 실측과 높이 공식 `20n+42`: 4줄 173(여유 10) / 5줄 193(눈을 덮는다).
    문구는 서버(Mock) 값이라 Frontend 가 길이를 보장할 수 없으므로 **레이아웃 내성**으로 막는다.
  */
  test('버블이 2~4줄로 자라고 5줄째부터 말줄임한다 (`W-5`)', async ({ page }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    const read = async () =>
      page.evaluate(() => {
        const box = (sel: string) => {
          const node = document.querySelector(sel);
          if (node === null) return null;
          const rect = node.getBoundingClientRect();
          return { y: Math.round(rect.y), bottom: Math.round(rect.bottom) };
        };
        const main = document.querySelector('.haru-bubble__content .haru-text');
        const content = document.querySelector('.haru-bubble__content');
        return {
          // 주 문구 line-height 는 20 이다 (Figma `50:172`).
          lines: Math.round((main?.getBoundingClientRect().height ?? 0) / 20),
          // 클램프는 `content` 상자에 걸린다 — 안쪽 텍스트는 잘리기 전 높이를 보고할 수 있다.
          visibleLines: Math.round((content?.getBoundingClientRect().height ?? 0) / 20),
          bubble: box('.haru-bubble'),
          // 290 은 **카드** 상단이다. 트랙 border box 는 그림자 inset 만큼 위다 (§12.15).
          track: box('.haru-activity-track__item'),
          dots: box('.haru-page-indicator__dots'),
          tabbar: box('.haru-tab-bar'),
          character: box('.haru-home-stage__character'),
        };
      });

    /** 캐릭터 눈 ≈ 184 (audit §11.1 렌더 실측). 그 위에서 멈춰야 얼굴이 보인다. */
    const EYES_Y = 184;
    const base = await read();
    expect(base.lines).toBe(2);
    expect(base.track?.y).toBe(290);

    // 서버 문구가 길어진 상황을 재현한다 (앱 로직이 아니라 **레이아웃 내성** 검사다).
    // 30 단어는 클램프가 없으면 5줄을 넘긴다 — 상한이 실제로 걸리는지 보는 구간이다.
    for (const words of [8, 12, 16, 30, 80]) {
      await page.locator('.haru-bubble__content .haru-text').evaluate((node, count) => {
        node.textContent = Array.from({ length: count }, () => 'tonight').join(' ');
      }, words);

      const grown = await read();

      // ① 하단 고정 요소는 1px 도 움직이지 않는다 (spacer 가 흡수한다).
      expect(grown.track?.y).toBe(290);
      expect(grown.dots?.y).toBe(717);
      expect(grown.tabbar?.y).toBe(766);
      expect(grown.character?.y).toBe(base.character?.y);

      // ② 보이는 줄은 **4줄을 넘지 않는다** (`W-5` 말줄임). 조건부가 아니다.
      expect(grown.visibleLines).toBeLessThanOrEqual(4);

      // ③ 그래서 **어떤 길이에서도** 캐릭터 얼굴(눈)을 가리지 않는다.
      expect(grown.bubble?.bottom ?? 0).toBeLessThan(EYES_Y);

      // ④ 카드(290)도 밀지 않는다.
      expect(grown.bubble?.bottom ?? 0).toBeLessThanOrEqual(290);
    }
  });

  test('버블 닫기 — 터치 타깃 44×44, 닫아도 다른 요소가 밀리지 않는다', async ({ page }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    const dismiss = page.getByRole('button', { name: 'Dismiss' });
    await expect(dismiss).toBeVisible();

    // 시각 크기는 작아도 되고, **터치 타깃**이 44×44 여야 한다 (`::before` 확장).
    const hit = await dismiss.evaluate((node) => {
      const styles = globalThis.getComputedStyle(node, '::before');
      const rect = node.getBoundingClientRect();
      const inset = Number.parseFloat(styles.insetBlockStart);
      return {
        width: Math.round(rect.width - inset * 2),
        height: Math.round(rect.height - inset * 2),
      };
    });
    expect(hit.width).toBe(44);
    expect(hit.height).toBe(44);

    // 닫기 전 기하
    const before = await page.evaluate(() => ({
      // 290 은 **카드** 상단이다 (트랙 border box 는 그림자 inset 만큼 위 — §12.15).
      track: Math.round(
        document.querySelector('.haru-activity-track__item')!.getBoundingClientRect().y,
      ),
      dots: Math.round(
        document.querySelector('.haru-page-indicator__dots')!.getBoundingClientRect().y,
      ),
      tabbar: Math.round(document.querySelector('.haru-tab-bar')!.getBoundingClientRect().y),
    }));

    await dismiss.click();
    await expect(page.locator('.haru-bubble')).toHaveCount(0);

    const after = await page.evaluate(() => ({
      // 290 은 **카드** 상단이다 (트랙 border box 는 그림자 inset 만큼 위 — §12.15).
      track: Math.round(
        document.querySelector('.haru-activity-track__item')!.getBoundingClientRect().y,
      ),
      dots: Math.round(
        document.querySelector('.haru-page-indicator__dots')!.getBoundingClientRect().y,
      ),
      tabbar: Math.round(document.querySelector('.haru-tab-bar')!.getBoundingClientRect().y),
    }));

    expect(after).toStrictEqual(before);
    expect(after.track).toBe(290);
    expect(after.dots).toBe(717);
    expect(after.tabbar).toBe(766);
  });

  test('닫기는 **그 문구에만** 적용된다 — 상태 알림이 영구히 묻히지 않는다 (AC-3-15)', async ({
    page,
  }) => {
    await logIn(page);
    await expect(page.getByText('Fifteen minutes together is plenty for tonight.')).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(page.locator('.haru-bubble')).toHaveCount(0);

    // 서버 문구가 **바뀌면** 버블이 다시 보인다 (저장소를 쓰지 않으므로 세션에도 남지 않는다).
    await gotoApp(page, '/auth/log-in?scenario=home:session-already-active');
    await page.getByLabel('Email').fill('sam@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();

    await expect(
      page.getByText('A storytime is still open — you can pick it back up.'),
    ).toBeVisible();
  });

  test('Figma 에 없는 UI 가 화면에 없다 (최우선 규칙 2)', async ({ page }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Pick a time' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Show all \d+ prompts/ })).toHaveCount(0);
    await expect(page.getByText(/prepared for/i)).toHaveCount(0);
  });
});

/*
 * Stage 4 `S4-J` — 이월 `QA-3-003` (에셋 파이프라인, AC-4-84). `<picture>` 가 실제 브라우저에서
 * **AVIF 를 고르는지** 는 DOM 구조만으로는 알 수 없다 — `currentSrc` 로 확인한다.
 */
test.describe('캐릭터 `<picture>` (AC-4-84)', () => {
  test('Home 캐릭터가 picture 로 그려지고 브라우저가 AVIF 를 고른다', async ({ page }) => {
    await logIn(page);

    const img = page.locator('.haru-home-stage__character picture img');
    await expect(img).toHaveCount(1);
    await expect
      .poll(async () => img.evaluate((node) => (node as HTMLImageElement).complete))
      .toBe(true);

    const picked = await img.evaluate((node) => {
      const image = node as HTMLImageElement;
      const picture = image.parentElement;
      return {
        currentSrc: image.currentSrc,
        naturalWidth: image.naturalWidth,
        sources: [...(picture?.querySelectorAll('source') ?? [])].map((source) =>
          source.getAttribute('type'),
        ),
        pictureDisplay: picture === null ? null : getComputedStyle(picture).display,
      };
    });
    expect(picked.sources).toEqual(['image/avif', 'image/webp']);
    expect(picked.currentSrc).toMatch(/\.avif$/);
    // 같은 마스터에서 나온 무손실 산출물 — 해상도가 PNG 와 같다 (915×1133).
    expect(picked.naturalWidth).toBe(915);
    // 레이아웃 상자를 만들지 않는다.
    expect(picked.pictureDisplay).toBe('contents');
  });
});

/*
 * Stage 4 `S4-J` — 이월 `QA-3-002` (Activity Card 오프라인 캐시, `D-11`).
 * 실제 브라우저의 `localStorage` 와 **TopBar 슬롯 안의 배너 위치**는 여기에서만 확인된다.
 */
test.describe('오프라인 캐시 카드 (AC-4-82 · AC-4-83, `D-11`)', () => {
  test('`offline-cached-card` — 캐시된 카드 3장과 Offline Banner 가 동시에 보인다', async ({
    page,
  }) => {
    await logIn(page, 'activity-cards:offline-cached-card');

    const track = page.locator('.haru-activity-track:not(.haru-activity-track--skeleton)');
    await expect(track).toBeVisible();
    await expect(track.locator('.haru-activity-card--front')).toHaveCount(3);

    const banner = page.locator('.haru-app-shell__bar-top .haru-alert--banner');
    await expect(banner).toBeVisible();
    // 제목 없이 1줄 — 본문 없음 (`D4-32` · `D4-37`).
    await expect(banner).toHaveText('Go online to start a session');
    // 카드가 없을 때의 덱 슬롯 안내는 뜨지 않는다.
    await expect(page.locator('.haru-activity-deck__slot')).toHaveCount(0);

    // 배너는 헤더 밴드 **밑**이다 — 헤더(48) 아래에서 시작하고 탭바를 가리지 않는다.
    const geometry = await page.evaluate(() => {
      const header = document.querySelector('.haru-home-top-bar');
      const alert = document.querySelector('.haru-app-shell__bar-top .haru-alert--banner');
      if (header === null || alert === null) throw new Error('header or banner missing');
      return {
        headerBottom: header.getBoundingClientRect().bottom,
        bannerTop: alert.getBoundingClientRect().top,
      };
    });
    expect(geometry.bannerTop).toBeGreaterThanOrEqual(geometry.headerBottom);

    // 저장된 것은 카드 1건뿐이다 (D-11 — `{ schemaVersion, childId, card }`).
    const stored = await page.evaluate(
      (key) => JSON.parse(globalThis.localStorage.getItem(key) ?? 'null') as unknown,
      CARD_CACHE_KEY,
    );
    expect(Object.keys(stored as Record<string, unknown>).sort()).toEqual([
      'card',
      'childId',
      'schemaVersion',
    ]);
  });

  /*
   * 배너 1줄 프로브 (`D4-32` · `D4-37`, visual-gap-s4j §6.2 실측 기준).
   * 높이 54 = 아이콘 20 + padding `--space-4` 16×2 + border 1×2 — 2줄이면 74 이상이 된다.
   * 줄 수는 제목 텍스트 Range 의 client rect 서로 다른 top 개수로 센다 (§6.0 측정 방법).
   */
  for (const width of [393, 320] as const) {
    test(`\`offline-cached-card\` 배너 — ${width}×852 에서 1줄 · 높이 54`, async ({ page }) => {
      await page.setViewportSize({ width, height: 852 });
      await logIn(page, 'activity-cards:offline-cached-card');

      const banner = page.locator('.haru-app-shell__bar-top .haru-alert--banner');
      await expect(banner).toBeVisible();

      const probe = await banner.evaluate((node) => {
        const title = node.querySelector('.haru-alert__body > *');
        if (title === null) throw new Error('banner title missing');
        const range = document.createRange();
        range.selectNodeContents(title);
        const tops = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
        return {
          height: node.getBoundingClientRect().height,
          lines: tops.size,
          bodyChildren: node.querySelector('.haru-alert__body')?.children.length ?? 0,
        };
      });
      expect(probe.height).toBe(54);
      expect(probe.lines).toBe(1);
      expect(probe.bodyChildren).toBe(1);
    });
  }

  test('캐시 없는 `offline` 은 Stage 3 의 덱 슬롯 안내 그대로 — 배너 없음', async ({ page }) => {
    await logIn(page, 'activity-cards:offline');

    await expect(page.locator('.haru-activity-deck__slot')).toBeVisible();
    await expect(
      page.getByText("We'll load today's options when the connection is back."),
    ).toBeVisible();
    await expect(page.locator('.haru-app-shell__bar-top .haru-alert--banner')).toHaveCount(0);
  });

  test('로그아웃하면 카드 캐시가 지워진다 (AC-4-83)', async ({ page }) => {
    await logIn(page, 'activity-cards:offline-cached-card');
    await expect(page.locator('.haru-app-shell__bar-top .haru-alert--banner')).toBeVisible();
    expect(
      await page.evaluate((key) => globalThis.localStorage.getItem(key), CARD_CACHE_KEY),
    ).not.toBeNull();

    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Log out', exact: true })
      .click();
    await expect(page).toHaveURL(/\/auth\/welcome$/);

    expect(
      await page.evaluate((key) => globalThis.localStorage.getItem(key), CARD_CACHE_KEY),
    ).toBeNull();
  });
});

test.describe('`/settings` · 로그아웃 (AC-2-40 · AC-2-41 · AC-2-29 · D-7 · D-3)', () => {
  test('설정 아이콘 → 로그아웃 1행 → 확인 Dialog → Welcome + 로컬 draft 삭제', async ({ page }) => {
    await leaveOnboardingDraft(page);
    await logIn(page);

    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();

    // 목록은 로그아웃 1행뿐이다 (C13-12).
    const list = page.getByRole('list', { name: 'Account' });
    await expect(list.getByRole('listitem')).toHaveCount(1);

    await page.getByRole('button', { name: 'Log out', exact: true }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText('Onboarding answers saved on this device will be removed.'),
    ).toBeVisible();
    // destructive — 초기 포커스는 취소다.
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();

    await dialog.getByRole('button', { name: 'Log out', exact: true }).click();

    await expect(page).toHaveURL(/\/auth\/welcome$/);

    // AC-2-29 — 이 기기에 HARU 키가 하나도 남지 않는다.
    const remaining = await page.evaluate(() =>
      Object.keys(globalThis.localStorage).filter((key) => key.startsWith('haru.')),
    );
    expect(remaining).toEqual([]);
  });

  test('취소하면 로그아웃하지 않고 로컬 draft 도 남는다', async ({ page }) => {
    await leaveOnboardingDraft(page);
    await logIn(page);

    // 새로고침으로 들어가지 않는다 — Mock 세션은 메모리에 있어 reload 하면 로그인이 풀린다.
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings$/);

    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/settings$/);
    expect(
      await page.evaluate((key) => globalThis.localStorage.getItem(key), DRAFT_KEY),
    ).not.toBeNull();
  });

  test('키보드만으로 설정 진입 → 로그아웃 확인까지 간다 (AC-2-60)', async ({ page }) => {
    await logIn(page);

    const settings = page.getByRole('button', { name: 'Settings' });
    await settings.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/settings$/);

    const row = page.getByRole('button', { name: 'Log out', exact: true });
    await row.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();

    // Esc 는 취소와 같다 (ConfirmDialog 규약).
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/settings$/);
  });
});

test.describe('반응형 (AC-2-59)', () => {
  for (const width of [320, 393, 600, 1024]) {
    test(`Home 이 ${String(width)}px 에서 가로 스크롤을 만들지 않는다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await logIn(page);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    });
  }

  test('600px 이상에서 앱 컬럼이 480 을 넘지 않고 가운데 정렬된다', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await logIn(page);

    const column = page.locator('[data-app-shell-viewport] > *').first();
    const box = await column.boundingBox();

    expect(box).not.toBeNull();
    expect(box?.width).toBeLessThanOrEqual(480);
    // 좌우 여백이 같다 (가운데 정렬).
    expect(
      Math.abs((box?.x ?? 0) - (1024 - (box?.width ?? 0) - (box?.x ?? 0))),
    ).toBeLessThanOrEqual(1);
  });
});
