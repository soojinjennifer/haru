/**
 * 반응형 — Design Spec §7.2 폭별 기대 레이아웃 · AC-1-23 · AC-1-22 (200% 확대 reflow).
 *
 * 화면은 `/__dev/ui/frame` (gallery chrome 없는 순수 앱 컬럼)을 쓰고, 측정값은 화면이 노출하는
 * `data-column-width` / `data-content-width` 를 읽는다.
 */
import { expect, test, type Page } from '@playwright/test';

import { GALLERY, gotoStable, settle } from './support/gallery';

/** Design Spec §7.2 표. content = column − 2 × gutter(24). */
const EXPECTED = [
  { viewport: { width: 320, height: 568 }, column: 320, content: 272 },
  { viewport: { width: 393, height: 852 }, column: 393, content: 345 },
  { viewport: { width: 600, height: 800 }, column: 480, content: 432 },
  { viewport: { width: 1024, height: 768 }, column: 480, content: 432 },
] as const;

async function readout(page: Page) {
  const element = page.locator('.haru-dev-readout');
  await expect(element).toHaveAttribute('data-column-width', /\d+/);

  return {
    column: Number(await element.getAttribute('data-column-width')),
    content: Number(await element.getAttribute('data-content-width')),
  };
}

test.describe('앱 컬럼 규칙 (min 320 / max 480 / gutter 24)', () => {
  for (const expectation of EXPECTED) {
    test(`${expectation.viewport.width}px — column ${expectation.column} / content ${expectation.content}`, async ({
      page,
    }) => {
      await page.setViewportSize(expectation.viewport);
      await gotoStable(page, GALLERY.frame);

      const measured = await readout(page);
      expect(measured.column).toBe(expectation.column);
      expect(measured.content).toBe(expectation.content);

      // 가로 스크롤 0 (WCAG 1.4.10).
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('600px 이상에서 앱 컬럼이 가운데 정렬된다 (다단 레이아웃 없음)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await gotoStable(page, GALLERY.frame);

    const box = await page.locator('#frame-app-column').boundingBox();
    expect(box).not.toBeNull();

    const left = box?.x ?? 0;
    const right = 1024 - ((box?.x ?? 0) + (box?.width ?? 0));
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
    expect(left).toBeGreaterThan(0);
  });
});

test.describe('텍스트 200% 확대 reflow (AC-1-22)', () => {
  test('320px 폭에서 가로 스크롤 없이 reflow 한다', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await gotoStable(page, GALLERY.frame);

    // 브라우저 텍스트 확대와 같은 효과: 루트 font-size 를 2배로 만든다.
    await page.addStyleTag({ content: 'html { font-size: 200% }' });
    await settle(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    await expect(page).toHaveScreenshot('frame-320-text-200.png');
  });
});

test.describe('prefers-reduced-motion (AC-1-22)', () => {
  test('reduce 에서 무한 애니메이션이 멈춘다', async ({ page }) => {
    await gotoStable(page, GALLERY.components);

    const animated = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.haru-skeleton, .haru-spinner'));
      return nodes
        .flatMap((node) => [node, ...Array.from(node.querySelectorAll('*'))])
        .flatMap((node) => node.getAnimations())
        .filter((animation) => animation.playState === 'running').length;
    });

    expect(animated).toBe(0);
  });

  test.describe('no-preference 에서는 모션이 살아 있다 (규칙이 실제로 작동하는지 확인)', () => {
    test.use({ reducedMotion: 'no-preference' });

    test('Skeleton pulse 가 동작한다', async ({ page }) => {
      await gotoStable(page, GALLERY.components);

      const running = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('.haru-skeleton'));
        return nodes
          .flatMap((node) => [node, ...Array.from(node.querySelectorAll('*'))])
          .flatMap((node) => node.getAnimations())
          .filter((animation) => animation.playState === 'running').length;
      });

      expect(running).toBeGreaterThan(0);
    });
  });
});
