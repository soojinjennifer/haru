/**
 * `/library` 본 화면 — 브라우저에서만 확인되는 계약 (Library Design Spec §2.2 · §3.3 · §9 · §10).
 *
 * jsdom 은 레이아웃을 계산하지 않으므로 **기하·스크롤·hit area** 는 여기서만 검증된다.
 * 그림자 클리핑은 `shadow.spec.ts`, 시각 baseline 은 `visual.spec.ts` 가 덮는다.
 *
 *  ① 섹션 간격이 **전부 16** 이고 Figma 열 offset(0 / 120.948 / 238.922)이 재현된다
 *  ② 캐러셀이 **페이지 단위**로 스냅하고 ←/→ 로 움직인다 (WCAG 2.5.1 — 좌우 버튼이 없다)
 *  ③ 다음 페이지가 gutter 에 **비치지 않는다** (Figma 에 peek 이 없다)
 *  ④ 네 폭 모두에서 **페이지 가로 스크롤이 생기지 않는다** (트랙의 gutter bleed 가 새지 않는다)
 *  ⑤ "See all" 의 hit area 가 44 에 도달한다 (시각 크기는 그대로)
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp, hideDevPanel, settle } from './support/gallery';

/** Design Spec §10 의 4개 폭. */
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
  { width: 1024, height: 768 },
] as const;

/**
 * Library 는 인증이 필요하다. **새 `goto` 는 인증을 잃으므로** 탭으로 이동한다
 * (실제 사용자 경로이기도 하다).
 */
async function goToLibrary(page: Page, scenario?: string): Promise<void> {
  await gotoApp(
    page,
    scenario === undefined ? '/auth/log-in' : `/auth/log-in?scenario=${scenario}`,
  );
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.locator('.haru-activity-track')).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Library' })
    .click();

  const shelves = page.locator('.haru-library-shelves');
  await expect(shelves).toBeVisible();
  await expect(shelves).not.toHaveAttribute('aria-busy', 'true');
  await settle(page);
}

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

test.describe('기하 (Design Spec §2.2 · §3.3)', () => {
  test('섹션 간격이 전부 16 이다 (헤더↔본문 · 섹션↔섹션 구분 없음)', async ({ page }) => {
    await goToLibrary(page);

    const gaps = await page.evaluate(() => {
      const shelves = document.querySelector('.haru-library-shelves');
      if (shelves === null) throw new Error('shelves not rendered');

      const rows = [...shelves.children].map((child) => child.getBoundingClientRect());
      return rows
        .slice(1)
        .map((rect, index) => Math.round(rect.top - (rows[index] as DOMRect).bottom));
    });

    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) expect(gap).toBe(16);
  });

  test('캐러셀 열이 Figma offset 을 재현한다 (0 / 120.948 / 238.922 · 3번째가 0.92 넘침)', async ({
    page,
  }) => {
    await goToLibrary(page);

    const columns = await page.evaluate(() => {
      const page1 = document.querySelector('.haru-shelf-page');
      if (page1 === null) throw new Error('shelf page not rendered');
      const origin = page1.getBoundingClientRect().left;
      return [...page1.querySelectorAll('.haru-book-cover')].map((cover) => {
        const rect = cover.getBoundingClientRect();
        return { left: rect.left - origin, width: rect.width, height: rect.height };
      });
    });

    expect(columns).toHaveLength(3);
    expect(columns[0]?.left).toBeCloseTo(0, 1);
    expect(columns[1]?.left).toBeCloseTo(120.948, 0);
    expect(columns[2]?.left).toBeCloseTo(238.922, 0);

    // 표지 폭·높이 = Figma 107 × 151. 이미지 원본 비가 상자를 밀지 못해야 한다.
    for (const column of columns) {
      expect(column.width).toBeCloseTo(107, 1);
      expect(column.height).toBeCloseTo(151, 1);
    }

    // 3번째 표지는 content 345 를 0.92 넘는다 — Figma 자신의 % 그리드 잔차다.
    const end = (columns[2]?.left ?? 0) + (columns[2]?.width ?? 0);
    expect(end - 345).toBeGreaterThan(0.85);
    expect(end - 345).toBeLessThan(1);
  });

  test('다음 페이지가 gutter 에 비치지 않는다 (Figma 에 peek 이 없다)', async ({ page }) => {
    await goToLibrary(page);

    const secondPageLeft = await page.evaluate(() => {
      const pages = document.querySelectorAll('.haru-shelf-track .haru-shelf-page');
      const second = pages[1];
      return second === undefined ? null : second.getBoundingClientRect().left;
    });

    expect(secondPageLeft).not.toBeNull();
    expect(secondPageLeft ?? 0).toBeGreaterThanOrEqual(393);
  });
});

test.describe('캐러셀 조작 (§6.1 · §9.4 · WCAG 2.5.1)', () => {
  test('←/→ 로 **페이지 단위**로 움직이고 현재 위치를 읽어 준다', async ({ page }) => {
    await goToLibrary(page);

    const track = page.locator('.haru-shelf-track').first();
    await track.focus();

    const status = page.locator('.haru-shelf-carousel').first().getByRole('status');
    await expect(status).toHaveText('Page 1 of 3');

    await page.keyboard.press('ArrowRight');
    await expect(status).toHaveText('Page 2 of 3');

    await page.keyboard.press('End');
    await expect(status).toHaveText('Page 3 of 3');

    await page.keyboard.press('Home');
    await expect(status).toHaveText('Page 1 of 3');
  });

  test('좌우 이동 버튼을 만들지 않는다 (Figma 에 없다)', async ({ page }) => {
    await goToLibrary(page);

    await expect(page.getByRole('button', { name: /previous|next/i })).toHaveCount(0);
  });

  test('페이지가 1개면 dots 를 표시하지 않는다 (`shelf-partial`)', async ({ page }) => {
    await goToLibrary(page, 'library:shelf-partial');

    const first = page.locator('.haru-shelf-carousel').first();
    await expect(first.locator('.haru-page-indicator')).toHaveCount(0);
  });
});

test.describe('반응형 (§10)', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px — 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await goToLibrary(page);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('320px 에서 표지가 비례 축소된다 (content × 31.0145% ≈ 84.4) — 캡션 타이포는 그대로', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await goToLibrary(page);

    const measured = await page.evaluate(() => {
      const cover = document.querySelector('.haru-shelf-page .haru-book-cover');
      const caption = document.querySelector('.haru-shelf-item .haru-text--caption-2');
      if (cover === null || caption === null) throw new Error('shelf item not rendered');
      return {
        coverWidth: cover.getBoundingClientRect().width,
        captionFontSize: getComputedStyle(caption).fontSize,
      };
    });

    expect(measured.coverWidth).toBeCloseTo(84.36, 1);
    // 11px 하한 — 좁은 폭에서도 **축소하지 않는다** (`L-OPEN-11`, Stage 0 `#10-②`).
    expect(measured.captionFontSize).toBe('11px');
  });
});

test.describe('접근성 (§9.2 · §9.4)', () => {
  test('"See all" 은 시각 크기를 유지한 채 hit area 가 44 다', async ({ page }) => {
    await goToLibrary(page);

    const hit = await page.evaluate(() => {
      const action = document.querySelector('.haru-section-header__action');
      if (action === null) throw new Error('see all not rendered');
      const visual = action.getBoundingClientRect();
      const after = getComputedStyle(action, '::after');
      return {
        visualHeight: visual.height,
        hitWidth: Number.parseFloat(after.minWidth),
        hitHeight: visual.height - 2 * Number.parseFloat(after.top),
      };
    });

    /*
      시각 높이는 `--text-caption-1--line-height`(**16**) 다. Figma 의 텍스트 상자는 14 지만
      타이포 토큰의 line-height 가 16 이고, hit area 레시피도 그 16 을 기준으로 계산한다
      (`SectionHeader.css`: `(16 − 44) / 2 = −14` → `16 + 28 = 44`). 여기서 고정하는 것은
      "**hit area 를 넓혀도 시각 상자가 커지지 않는다**" 이다.
    */
    expect(hit.visualHeight).toBeCloseTo(16, 0);
    expect(hit.hitWidth).toBeGreaterThanOrEqual(44);
    expect(hit.hitHeight).toBeGreaterThanOrEqual(44);
  });

  test('"See all" 3개의 접근성 이름이 서로 구분된다', async ({ page }) => {
    await goToLibrary(page);

    for (const section of ['Our curated shelf', 'Favorites', 'Finished together']) {
      await expect(page.getByRole('button', { name: `See all ${section}` })).toBeVisible();
    }
  });

  test('캐러셀 트랙이 섹션 제목으로 이름을 갖는다', async ({ page }) => {
    await goToLibrary(page);

    await expect(page.getByRole('group', { name: 'Our curated shelf' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Favorites' })).toBeVisible();
  });
});

/*
 * ───────────────────────────────────────────────────────────────────────────
 * 2라운드-2 — 시트 2종 · 진입점 · 하위 화면 2종
 *
 * jsdom 이 못 보는 것만 여기에 둔다: 떠 있는 카드의 **기하**(inset 14 · radius 28 · 아래 여백) ·
 * 본문 **스크롤** · 진입점 행의 **hit area** · 하위 화면의 가로 스크롤.
 * 그림자 클리핑은 `shadow.spec.ts`, DOM 계약은 `apps/web/__tests__/library-sheets.test.tsx` ·
 * `library-entry-screens.test.tsx` 가 덮는다.
 */

/** "See all" 을 눌러 Shelf 시트를 연다. */
async function openShelfSheet(page: Page, section: string): Promise<void> {
  await page.getByRole('button', { name: `See all ${section}` }).click();
  const sheet = page.locator('.haru-sheet--inset-card');
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('.haru-list-row').first()).toBeVisible();
  await settle(page);
}

test.describe('떠 있는 시트 기하 (§3.7 · §3.9 · `L-NEW-03`)', () => {
  test('좌우 inset 14 · radius 28(네 모서리) · grabber 없음', async ({ page }) => {
    await goToLibrary(page);
    await openShelfSheet(page, 'Our curated shelf');

    const geometry = await page.evaluate(() => {
      const sheet = document.querySelector('.haru-sheet--inset-card');
      if (sheet === null) throw new Error('sheet not rendered');
      const rect = sheet.getBoundingClientRect();
      const style = getComputedStyle(sheet);
      return {
        left: rect.left,
        right: window.innerWidth - rect.right,
        bottom: window.innerHeight - rect.bottom,
        radius: [
          style.borderTopLeftRadius,
          style.borderTopRightRadius,
          style.borderBottomLeftRadius,
          style.borderBottomRightRadius,
        ],
        padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
        gap: style.rowGap,
        grabbers: sheet.querySelectorAll('.haru-sheet__grabber').length,
      };
    });

    expect(geometry.left).toBeCloseTo(14, 1);
    expect(geometry.right).toBeCloseTo(14, 1);
    // 아래 여백 = 14 + safe-area. 테스트 브라우저의 safe-area 는 0 이다.
    expect(geometry.bottom).toBeCloseTo(14, 1);
    // 네 모서리 전부 28 (`bottom` 변형은 상단만 둥글다).
    expect(geometry.radius).toStrictEqual(['28px', '28px', '28px', '28px']);
    // 상·좌·우 18 · 하 **16** (§3.7 — Figma 13 을 기존 토큰 16 으로 흡수).
    expect(geometry.padding).toStrictEqual(['18px', '18px', '16px', '18px']);
    // 행 간격 12 (`--activity-card-row-gap`).
    expect(geometry.gap).toBe('12px');
    // 떠 있는 카드에는 grabber 가 없다 `[실측 145:1085 · 163:2347]`.
    expect(geometry.grabbers).toBe(0);
  });

  test('상단 40 은 scrim 이 보이도록 남는다 (긴 목록에서 본문이 스크롤한다)', async ({ page }) => {
    await goToLibrary(page);
    await openShelfSheet(page, 'Our curated shelf');

    const measured = await page.evaluate(() => {
      const sheet = document.querySelector('.haru-sheet--inset-card');
      const content = document.querySelector('.haru-sheet__content');
      if (sheet === null || content === null) throw new Error('sheet not rendered');
      return {
        top: sheet.getBoundingClientRect().top,
        scrollable: content.scrollHeight - content.clientHeight,
      };
    });

    expect(measured.top).toBeGreaterThanOrEqual(40);
    // 9권 목록은 시트 안에서 **실제로 스크롤한다** — `R-SHADOW-1` 이 필요한 이유다.
    expect(measured.scrollable).toBeGreaterThan(0);
  });

  test('≥600 에서도 앱 컬럼(480) 안쪽 좌우 14 를 유지한다', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await goToLibrary(page);
    await openShelfSheet(page, 'Our curated shelf');

    const width = await page.evaluate(() => {
      const sheet = document.querySelector('.haru-sheet--inset-card');
      return sheet === null ? 0 : sheet.getBoundingClientRect().width;
    });

    expect(width).toBeCloseTo(480 - 2 * 14, 1);
  });
});

test.describe('진입점 (§7.1) · 하위 화면 (§7.2 · §7.3)', () => {
  test('행 높이 56 · hit area 44 이고 두 route 로 이동한다', async ({ page }) => {
    await goToLibrary(page);

    const rows = page.getByRole('list', { name: 'Library actions' }).getByRole('listitem');
    await expect(rows).toHaveCount(2);

    const heights = await rows.evaluateAll((nodes) =>
      nodes.map((node) => {
        const button = node.querySelector('button');
        return button === null ? 0 : button.getBoundingClientRect().height;
      }),
    );
    for (const height of heights) expect(height).toBeGreaterThanOrEqual(44);
    for (const height of heights) expect(height).toBeCloseTo(56, 0);

    await page.getByRole('button', { name: 'Add a book you own' }).click();
    await expect(page).toHaveURL(/\/library\/add$/);

    await page.getByRole('button', { name: 'Go back' }).click();
    await expect(page).toHaveURL(/\/library$/);

    await page.getByRole('button', { name: 'Gift requests' }).click();
    await expect(page).toHaveURL(/\/library\/gift-requests$/);
  });

  for (const viewport of VIEWPORTS) {
    test(`${viewport.width}px — 하위 화면에 가로 스크롤이 생기지 않는다`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await goToLibrary(page);

      for (const name of ['Add a book you own', 'Gift requests'] as const) {
        await page.getByRole('button', { name }).click();
        await settle(page);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);

        await page.getByRole('button', { name: 'Go back' }).click();
        await settle(page);
      }
    });
  }
});
