/**
 * 접근성 — AC-1-20 (키보드 · focus 표시 · 접근성 이름) · AC-1-21 (터치 타깃 44).
 *
 * gallery 의 `/a11y` 화면이 측정 결과를 DOM 에 노출하므로, 여기서는 그 값을 읽어 판정한다.
 * (측정 코드가 화면과 테스트에 두 벌 존재하지 않게 한다.)
 */
import { expect, test } from '@playwright/test';

import { GALLERY, gotoStable } from './support/gallery';

test.describe('키보드 탐색 · focus 표시 (AC-1-20)', () => {
  test('Tab 으로 모든 인터랙티브 요소를 순회하고 focus 링이 보인다', async ({ page }) => {
    await gotoStable(page, GALLERY.a11y);

    const tour = page.locator('[data-testid="focus-tour"]');
    const focusables = tour.locator('button, a[href], input, *[tabindex="0"]');
    const total = await focusables.count();
    expect(total).toBeGreaterThan(0);

    // gallery nav 를 지나 focus tour 첫 요소까지 Tab 으로 이동한다.
    const first = focusables.first();
    await first.focus();

    for (let index = 0; index < total; index += 1) {
      const active = await page.evaluate(() => {
        const element = document.activeElement;
        if (element === null) return null;

        const style = window.getComputedStyle(element);
        const inTour = element.closest('[data-testid="focus-tour"]') !== null;

        return {
          tag: element.tagName.toLowerCase(),
          inTour,
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
          name: element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '',
        };
      });

      expect(active).not.toBeNull();
      if (active?.inTour !== true) break;

      // 접근성 이름이 비어 있지 않다.
      expect(active.name.length).toBeGreaterThan(0);
      // `:focus-visible` 이므로 키보드 포커스에서는 outline 이 그려져야 한다.
      expect(active.outlineStyle).not.toBe('none');
      expect(Number.parseFloat(active.outlineWidth)).toBeGreaterThan(0);

      await page.keyboard.press('Tab');
    }
  });

  test('마우스 클릭으로는 focus 링을 그리지 않는다 (:focus-visible 만)', async ({ page }) => {
    await gotoStable(page, GALLERY.a11y);

    const button = page.locator('[data-testid="focus-tour"] button').first();
    await button.click();

    const outlineStyle = await button.evaluate(
      (element) => window.getComputedStyle(element).outlineStyle,
    );
    expect(outlineStyle).toBe('none');
  });
});

/**
 * 44 에 도달하지 못하는 것이 **확인된** 요소 — Stage 1-G 발견 사항.
 * 목록을 정확히 일치시켜서, 새 위반이 생기면 이 테스트가 깨지게 한다.
 *
 *  · TextField 행 — `--field-row-height` 42(Figma `76:364`) 로 44 에 2px 모자란다.
 *    사용자 수용 예외 **S1-G-2** (approvals §8): 42 를 유지하고 QA 는 `PASS (accepted: S1-G-2)` 로
 *    기록한다. Checkbox 행은 `min-block-size: var(--size-touch-min)` 이라 통과한다.
 *
 * PageIndicator dot 은 결정 `S1-G-1` 로 표시 전용이 되어 인터랙티브 요소가 아니다(목록에서 제외).
 */
const KNOWN_BELOW_44 = ['div · Password'];

test.describe('터치 타깃 44×44 (AC-1-21)', () => {
  test('알려진 예외 외의 인터랙티브 요소는 모두 44×44 에 도달한다', async ({ page }) => {
    await gotoStable(page, GALLERY.a11y);

    const rows = page.locator('[data-testid="touch-table"] tbody tr');
    await expect(rows.first()).toBeVisible();

    const results = await rows.evaluateAll((elements) =>
      elements.map((element) => ({
        label: element.children[0]?.textContent ?? '',
        hit: element.children[2]?.getAttribute('data-hit') ?? '',
        verdict: element.children[3]?.textContent ?? '',
      })),
    );

    expect(results.length).toBeGreaterThan(0);

    const below = results.filter((row) => row.verdict !== 'reaches').map((row) => row.label);
    expect(below.sort()).toStrictEqual([...KNOWN_BELOW_44].sort());
  });

  test('IconButton 은 시각 38 이지만 hit area 는 44 다 (::before 확장)', async ({ page }) => {
    await gotoStable(page, GALLERY.a11y);

    const row = page
      .locator('[data-testid="touch-table"] tbody tr')
      .filter({ hasText: 'button · Back' });

    await expect(row.locator('[data-hit]')).toHaveAttribute('data-hit', '44x44');
  });
});

test.describe('대비 측정 (Design Spec §9.4)', () => {
  test('측정값이 표시되고, D-01 수용 예외 외에는 기준을 만족한다', async ({ page }) => {
    await gotoStable(page, GALLERY.a11y);

    const rows = page.locator('[data-testid="contrast-table"] tbody tr');
    await expect(rows.first()).toBeVisible();

    const results = await rows.evaluateAll((elements) =>
      elements.map((element) => ({
        id: element.getAttribute('data-contrast-id') ?? '',
        ratio: Number(element.querySelector('[data-ratio]')?.getAttribute('data-ratio') ?? '0'),
        marker: element.children[4]?.textContent ?? '',
      })),
    );

    expect(results.length).toBeGreaterThan(0);
    // 모든 쌍이 실제로 계산되었다 (토큰 해석 실패 0건).
    expect(results.filter((row) => row.ratio === 0)).toStrictEqual([]);

    // D-01 수용 예외 — Accent 버튼 흰 라벨은 4.5 미만이며 그 사실 자체가 기록 대상이다.
    const accent = results.find((row) => row.id === 'A-1');
    expect(accent?.ratio).toBeLessThan(4.5);

    // 본문 텍스트는 AA 를 만족한다.
    const body = results.find((row) => row.id === 'E-1');
    expect(body?.ratio).toBeGreaterThanOrEqual(4.5);
  });
});
