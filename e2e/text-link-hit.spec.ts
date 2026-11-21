/**
 * `D8-3` (`H8-6-N4` · Visual Gap `VG8-G-09` ⓐ) — `TextLink hitArea="touch"` 3곳.
 *
 * 승인 조건 (사용자 결정 2026-11-21):
 *   ① **보이는 모습 변화 0** — 같은 화면에서 modifier 클래스만 떼고 다시 찍어 **바이트 동일**을 확인한다
 *      (런타임 토글, `R-BASELINE-1` ⑥). 기존 baseline 도 그대로 통과해야 한다.
 *   ② **누르는 영역 ≥ 44×44** — `elementFromPoint` 로 넓힌 영역 전체를 1px 간격으로 훑어 전부 링크가 받는다.
 *   ③ **이웃과 겹침 0** — 넓힌 영역의 어느 점도 이웃 인터랙티브가 받지 않고(①의 훑기),
 *      이웃 인터랙티브 상자의 어느 점도 링크가 받지 않는다(가져가지 않음).
 *
 * 폭 393(Figma 기준) · 320(최소 지원 폭) 두 가지.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

import { gotoApp, hideDevPanel, settle } from './support/gallery';
import { logInToHome } from './support/session';

const HIT_CLASS = 'haru-text-link--hit-touch';
const TOUCH_MIN = 44;

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

interface HitReport {
  readonly box: { width: number; height: number };
  /** 넓힌 영역(가로·세로 각각 max(글자 상자, 44))에서 링크가 받지 않은 점. */
  readonly missed: string[];
  /** 이웃 인터랙티브 상자 안에서 링크가 받은 점. */
  readonly stolen: string[];
  readonly neighbours: number;
}

async function probe(link: Locator): Promise<HitReport> {
  await link.scrollIntoViewIfNeeded();
  await link.evaluate((element) => {
    element.scrollIntoView({ block: 'center', inline: 'nearest' });
  });
  await settle(link.page());
  return link.evaluate((target: Element, min: number) => {
    const INTERACTIVE = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      'label',
      'summary',
      ...['button', 'link', 'radio', 'checkbox', 'switch'].map((role) => `[role="${role}"]`),
      '*[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    const owner = (x: number, y: number): Element | null =>
      document.elementFromPoint(x, y)?.closest(INTERACTIVE) ?? null;
    const rect = target.getBoundingClientRect();
    const width = Math.max(rect.width, min);
    const height = Math.max(rect.height, min);
    const left = rect.left + rect.width / 2 - width / 2;
    const top = rect.top + rect.height / 2 - height / 2;
    const missed: string[] = [];
    // 경계에서 0.5 안쪽 — 서브픽셀 반올림으로 이웃 픽셀을 읽지 않게
    for (let y = top + 0.5; y < top + height; y += 1) {
      for (let x = left + 0.5; x < left + width; x += 1) {
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
        const hit = owner(x, y);
        if (hit !== target) {
          missed.push(
            `${x.toFixed(1)},${y.toFixed(1)} → ${hit === null ? 'none' : `${hit.tagName}.${String(hit.className)}`}`,
          );
        }
      }
    }
    const stolen: string[] = [];
    const neighbours = [...document.querySelectorAll(INTERACTIVE)].filter((element) => {
      if (element === target || element.contains(target) || target.contains(element)) return false;
      if (element.closest('.haru-dev-panel, [aria-hidden="true"], [inert]') !== null) return false;
      const box = element.getBoundingClientRect();
      return (
        box.width > 0 &&
        box.height > 0 &&
        box.bottom > 0 &&
        box.top < innerHeight &&
        box.right > 0 &&
        box.left < innerWidth
      );
    });
    for (const element of neighbours) {
      const box = element.getBoundingClientRect();
      for (let y = box.top + 0.5; y < box.bottom; y += 1) {
        for (let x = box.left + 0.5; x < box.right; x += 1) {
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
          if (owner(x, y) === target) {
            stolen.push(`${element.tagName} ${x.toFixed(1)},${y.toFixed(1)}`);
          }
        }
      }
    }
    return {
      box: { width: rect.width, height: rect.height },
      missed: missed.slice(0, 20),
      stolen: stolen.slice(0, 20),
      neighbours: neighbours.length,
    };
  }, TOUCH_MIN);
}

/** modifier 를 떼기 전 · 후 같은 영역을 찍어 바이트 비교 — 보이는 모습 변화 0 (조건 ①). */
async function expectNoVisualChange(page: Page, link: Locator, region: Locator): Promise<void> {
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  });
  await settle(page);
  const withHit = await region.screenshot({ animations: 'disabled' });
  await link.evaluate((element, name) => {
    element.classList.remove(name);
  }, HIT_CLASS);
  await settle(page);
  const withoutHit = await region.screenshot({ animations: 'disabled' });
  await link.evaluate((element, name) => {
    element.classList.add(name);
  }, HIT_CLASS);
  await settle(page);
  expect(withHit.equals(withoutHit), 'hitArea="touch" 가 픽셀을 바꿨다').toBe(true);
}

async function check(page: Page, link: Locator, region: Locator): Promise<void> {
  await expect(link).toHaveClass(new RegExp(HIT_CLASS));
  await expectNoVisualChange(page, link, region);
  const report = await probe(link);
  test.info().annotations.push({
    type: 'hit',
    description: `box ${report.box.width.toFixed(1)}×${report.box.height.toFixed(1)} · neighbours ${String(report.neighbours)}`,
  });
  expect(report.box.height, '글자 상자 자체는 44 미만(보이는 모습 그대로)').toBeLessThan(TOUCH_MIN);
  expect(report.missed, '넓힌 44 영역 중 링크가 받지 않은 점').toStrictEqual([]);
  expect(report.stolen, '이웃 인터랙티브 상자 안에서 링크가 받은 점').toStrictEqual([]);
}

for (const width of [393, 320] as const) {
  test.describe(`TextLink hitArea="touch" @${String(width)} (D8-3 · H8-6-N4)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 852 });
    });

    test('consent View ×5 — 행 Checkbox · 이웃 행과 겹침 0', async ({ page }) => {
      await gotoApp(page, '/auth/sign-up?scenario=me:consent-missing');
      await page.getByLabel('Your name').fill('Sam Rivera');
      await page.getByLabel('Email').fill('sam@example.com');
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
      await page.getByRole('button', { name: 'Create account' }).click();
      await expect(page).toHaveURL(/\/auth\/consent$/);
      await settle(page);
      const rows = page.locator('.haru-consent-row');
      await expect(rows).toHaveCount(5);
      for (let index = 0; index < 5; index += 1) {
        const row = rows.nth(index);
        await check(page, row.locator('.haru-text-link'), row);
      }
    });

    test('아이 정보 Done — 헤더 행 · 첫 입력칸과 겹침 0', async ({ page }) => {
      await gotoApp(page, '/onboarding/start?scenario=me:consent-missing');
      await page.getByRole('button', { name: 'Start the questions' }).click();
      await expect(page).toHaveURL(/\/onboarding\/child-info$/);
      await settle(page);
      const link = page.locator('.haru-child-section-header .haru-text-link');
      await expect(link).toHaveText('Done');
      await check(page, link, page.locator('.haru-child-section-header').locator('..'));
    });

    test('녹음 목록 Show more — 마지막 행 · Delete 와 겹침 0', async ({ page }) => {
      await logInToHome(page);
      await page.getByRole('button', { name: 'Settings' }).click();
      await page.getByRole('button', { name: 'Data & privacy' }).click();
      await page.getByRole('button', { name: /Session recordings/ }).click();
      await expect(page).toHaveURL(/\/settings\/data\/recordings$/);
      await expect(page.getByRole('list', { name: 'Session recordings' })).toBeVisible();
      await settle(page);
      const link = page.getByRole('button', { name: 'Show more' });
      await check(page, link, page.locator('.haru-app-shell__content, main').first());
    });
  });
}
