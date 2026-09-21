/**
 * 시각 비교 baseline — Design Spec §10.2 (V-1 … V-9) · Plan §12 · AC-1-24.
 *
 * V-1 … V-8 은 Figma node 와 대조하는 항목이고, V-9 는 Figma 가 없는 항목(공통 상태 · focus ·
 * 반응형)의 **회귀 기준**이다. 여기서 만드는 것은 "구현 스냅샷" 이며, Figma 와의 대조 판정은
 * QA 가 Figma screenshot 과 나란히 놓고 한다 (§10.3 허용 차이 AD-1 … AD-10 적용).
 *
 * 임계값은 `playwright.config.ts` 의 `VISUAL_MAX_DIFF_PIXEL_RATIO`(0.002) + `VISUAL_MAX_DIFF_PIXELS`(200)
 * 이며 결정 `S1-D2-6` 으로 확정되었다.
 */
import { expect, test } from '@playwright/test';

import { demo, GALLERY, gotoStable } from './support/gallery';

/** Design Spec §10.2 — Figma 대조 대상. */
const FIGMA_BACKED: readonly { id: string; figma: string; page: string }[] = [
  { id: 'v1-button', figma: '17:20', page: GALLERY.components },
  { id: 'v2-surface', figma: '17:332 / 16:24', page: GALLERY.components },
  { id: 'v2-material', figma: '17:332 / 16:24', page: GALLERY.tokens },
  { id: 'v3-tab-bar', figma: '25:87', page: GALLERY.components },
  { id: 'v4-tag-chip', figma: '76:440 / 90:626 / 40:316', page: GALLERY.components },
  { id: 'v5-field', figma: '76:417', page: GALLERY.components },
  { id: 'v6-bubble', figma: '88:721', page: GALLERY.components },
  { id: 'v7-progress', figma: '88:789 / 179:1779', page: GALLERY.components },
  { id: 'v8-color-semantic', figma: '17:366', page: GALLERY.tokens },
  { id: 'v8-typography', figma: '17:298', page: GALLERY.tokens },
];

/** Figma 가 없는 항목 — 회귀 기준만 (V-9). */
const SPEC_ONLY: readonly { id: string; page: string }[] = [
  { id: 'v9-text', page: GALLERY.components },
  { id: 'v9-icon', page: GALLERY.components },
  { id: 'v9-icon-button', page: GALLERY.components },
  { id: 'v9-top-bar', page: GALLERY.components },
  { id: 'v9-spinner-skeleton', page: GALLERY.components },
  { id: 'v9-state-cards', page: GALLERY.components },
  { id: 'v9-toast', page: GALLERY.components },
  { id: 'v9-state-loading', page: GALLERY.states },
  { id: 'v9-state-empty', page: GALLERY.states },
  { id: 'v9-state-error', page: GALLERY.states },
  { id: 'v9-state-offline', page: GALLERY.states },
  { id: 'v9-focus', page: GALLERY.a11y },
];

test.describe('Figma 대조 baseline (V-1 … V-8)', () => {
  for (const target of FIGMA_BACKED) {
    test(`${target.id} — Figma ${target.figma}`, async ({ page }) => {
      await gotoStable(page, target.page);
      await expect(demo(page, target.id)).toHaveScreenshot(`${target.id}.png`);
    });
  }
});

test.describe('명세 기준 baseline (V-9, Figma 없음)', () => {
  for (const target of SPEC_ONLY) {
    test(target.id, async ({ page }) => {
      await gotoStable(page, target.page);
      await expect(demo(page, target.id)).toHaveScreenshot(`${target.id}.png`);
    });
  }
});

test.describe('반응형 baseline — 앱 컬럼 (AC-1-23)', () => {
  const VIEWPORTS = [
    { width: 320, height: 568 },
    { width: 393, height: 852 },
    { width: 600, height: 800 },
    { width: 1024, height: 768 },
  ] as const;

  for (const viewport of VIEWPORTS) {
    test(`frame ${viewport.width}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await gotoStable(page, GALLERY.frame);
      await expect(page).toHaveScreenshot(`frame-${viewport.width}.png`, { fullPage: false });
    });
  }
});
