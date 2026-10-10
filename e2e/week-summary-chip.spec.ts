/**
 * 주간 집계 칩 — **Home 헤더와 Library 헤더가 같아야 한다** (사용자 지시 2026-10-10:
 * *"Library 에 있는 것과 Home 에 있는 것을 동일한 디자인, 아이콘도 동일하게 맞추고"*).
 *
 * 두 화면은 이미 **같은 컴포넌트**(`WeekSummaryChip`)를 썼다. 갈라진 원인은 외형 CSS 가
 * `.haru-home-top-bar` 범위에 묶여 있어서 Library 에서는 공유 `Tag` 기본값(높이 26 ·
 * padding 12 · icon 16 · 아이콘색 `currentColor`)으로 렌더된 것이다.
 *
 * jsdom 은 외부 CSS 를 적용하지 않으므로 **기하·색은 여기서만** 검증된다. 소스 쪽 가드는
 * `apps/web/__tests__/stage3-css-guards.test.ts` 다.
 *
 * 한쪽만 바뀌면 깨지는 테스트다 — 두 측정값을 **서로** 비교하고, 그 다음 Figma 실측
 * 절대값과도 비교한다(두 쪽이 똑같이 틀리는 경우를 잡기 위해).
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

import { GALLERY, gotoApp, gotoStable, settle } from './support/gallery';

/** Figma `26:40` 재실측 2026-10-10 — 프레임 145×34, icon `50:161` (x 14, y 10.5) 13×13, gap 6. */
const FIGMA = {
  blockSize: 34,
  padInline: 14,
  iconSize: 13,
  gap: 6,
} as const;

interface ChipGeometry {
  blockSize: number;
  padInlineStart: number;
  padInlineEnd: number;
  gap: number;
  iconBoxSize: string;
  iconGlyphSize: string;
  iconColor: string;
  /**
   * 같은 문서에서 `var(--week-summary-chip-icon-color)` 를 해석한 값. 색 리터럴을 테스트에
   * 박지 않기 위한 기준선이다 (토큰 값 자체는 `packages/design-tokens` 테스트가 고정한다 —
   * `--color-icon-session-history` → `--haru-palette-yellow` → Figma `50:161` fill).
   */
  tokenIconColor: string;
  labelColor: string;
  background: string;
  fontSize: string;
  label: string;
}

async function measureChip(chip: Locator): Promise<ChipGeometry> {
  await expect(chip).toBeVisible();
  await settle(chip.page());

  return chip.evaluate((wrapper: HTMLElement): ChipGeometry => {
    const tag = wrapper.querySelector('.haru-tag');
    const iconBox = wrapper.querySelector('.haru-tag__icon');
    const label = wrapper.querySelector('.haru-tag__label');
    if (tag === null || iconBox === null || label === null) {
      throw new Error('칩 내부 구조가 바뀌었다');
    }
    const glyph = iconBox.querySelector('.haru-icon') ?? iconBox.firstElementChild;
    if (glyph === null) throw new Error('아이콘 글리프가 없다');

    const tagStyle = globalThis.getComputedStyle(tag);
    const iconRect = iconBox.getBoundingClientRect();
    const glyphRect = glyph.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const round = (value: number): number => Math.round(value * 100) / 100;
    const size = (rect: DOMRect): string => `${round(rect.width)}×${round(rect.height)}`;

    /** 토큰을 **문서가 해석한** 색으로 바꾼다 — 비교 대상이 리터럴이 아니라 토큰이 된다. */
    function resolveTokenColor(host: HTMLElement): string {
      const probe = host.ownerDocument.createElement('span');
      probe.style.position = 'absolute';
      probe.style.color = 'var(--week-summary-chip-icon-color)';
      host.append(probe);
      const resolved = globalThis.getComputedStyle(probe).color;
      probe.remove();
      return resolved;
    }

    return {
      blockSize: round(tag.getBoundingClientRect().height),
      padInlineStart: round(Number.parseFloat(tagStyle.paddingInlineStart)),
      padInlineEnd: round(Number.parseFloat(tagStyle.paddingInlineEnd)),
      // 선언값이 아니라 **아이콘과 라벨 사이의 실측 간격**이다.
      gap: round(labelRect.left - iconRect.right),
      iconBoxSize: size(iconRect),
      iconGlyphSize: size(glyphRect),
      iconColor: globalThis.getComputedStyle(iconBox).color,
      tokenIconColor: resolveTokenColor(wrapper),
      labelColor: globalThis.getComputedStyle(label).color,
      background: tagStyle.backgroundColor,
      fontSize: tagStyle.fontSize,
      label: label.textContent ?? '',
    };
  });
}

/** 화면 안의 칩. gallery 처럼 칩이 여러 개인 자리에서는 호출 측이 범위를 좁힌다. */
function chipOf(page: Page): Locator {
  return page.locator('.haru-week-summary-chip');
}

/** Home 에 착지한다 — 기본 `me` 는 온보딩을 마친 사용자다. */
async function logIn(page: Page): Promise<void> {
  await gotoApp(page, '/auth/log-in');
  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.locator('.haru-activity-track')).toBeVisible();
}

test.describe('주간 집계 칩이 Home 과 Library 에서 같다', () => {
  test('기하 · 아이콘 크기 · 아이콘 색 · gap 이 두 화면에서 동일하고 Figma 26:40 과 맞는다', async ({
    page,
  }) => {
    await logIn(page);
    const home = await measureChip(chipOf(page));

    /*
      **새 `goto` 는 인증을 잃으므로** 탭으로 이동한다 (실제 사용자 경로이기도 하다).
      같은 SPA 수명 안에서 이동하므로 칩의 값(`sessionsThisWeek`)도 같은 창을 본다.
    */
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Library' })
      .click();
    await expect(page).toHaveURL(/\/library$/);
    const library = await measureChip(chipOf(page));

    // ① 두 화면이 서로 같다 — 한쪽만 바뀌면 여기서 깨진다.
    expect(library).toEqual(home);

    // ② 두 쪽이 똑같이 틀리는 경우를 잡는다 — Figma 실측 절대값.
    expect(home.blockSize).toBe(FIGMA.blockSize);
    expect(home.padInlineStart).toBe(FIGMA.padInline);
    expect(home.padInlineEnd).toBe(FIGMA.padInline);
    expect(home.gap).toBe(FIGMA.gap);
    expect(home.iconBoxSize).toBe(`${FIGMA.iconSize}×${FIGMA.iconSize}`);
    expect(home.iconGlyphSize).toBe(`${FIGMA.iconSize}×${FIGMA.iconSize}`);
    expect(home.iconColor).toBe(home.tokenIconColor);
    // 아이콘만 색이 다르다 — 라벨은 본문색을 유지한다 (`A-23`-icon).
    expect(home.labelColor).not.toBe(home.iconColor);
  });

  test('칩은 조상 화면에 의존하지 않는다 — dev gallery 에서도 같은 기하다', async ({ page }) => {
    await logIn(page);
    const home = await measureChip(chipOf(page));

    /* gallery 는 인증이 필요 없고 TopBar 조상도 없다 — 그래서 좋은 대조군이다. */
    await gotoStable(page, GALLERY.components);
    const gallery = await measureChip(
      page.locator('[data-demo="s3-week-summary-chip"] .haru-week-summary-chip').first(),
    );

    expect(gallery.blockSize).toBe(home.blockSize);
    expect(gallery.padInlineStart).toBe(home.padInlineStart);
    expect(gallery.gap).toBe(home.gap);
    expect(gallery.iconBoxSize).toBe(home.iconBoxSize);
    expect(gallery.iconGlyphSize).toBe(home.iconGlyphSize);
    expect(gallery.iconColor).toBe(home.iconColor);
  });
});
