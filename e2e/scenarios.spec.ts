/**
 * Mock scenario 5종 → UI 상태 (AC-1-38 · AC-1-39) · Scenario Panel (Plan §16 D-5 ②).
 *
 * `useHealth → healthApi → MockHealthApi` 경로가 만드는 실제 화면 상태를 확인한다.
 * gallery 의 live 블록은 상태를 `data-health-state` 로 노출한다.
 */
import { expect, test, type Page } from '@playwright/test';

import { GALLERY, gotoScenario, gotoStable, settle } from './support/gallery';

function liveState(page: Page) {
  return page.locator('[data-demo="v9-state-live"] [data-health-state]');
}

test.describe('health scenario → UI 상태', () => {
  test('success — 정상 콘텐츠', async ({ page }) => {
    await gotoScenario(page, GALLERY.states, 'health:success');
    await expect(liveState(page)).toHaveAttribute('data-health-state', 'success');
  });

  test('loading — Skeleton (지연 중)', async ({ page }) => {
    await gotoScenario(page, GALLERY.states, 'health:loading');
    await expect(liveState(page)).toHaveAttribute('data-health-state', 'loading');
    await expect(page.locator('[data-demo="v9-state-live"] .haru-skeleton').first()).toBeVisible();
  });

  test('error — ErrorState + Retry', async ({ page }) => {
    await gotoScenario(page, GALLERY.states, 'health:error');
    await expect(liveState(page)).toHaveAttribute('data-health-state', 'error');
    await expect(page.getByRole('button', { name: 'Try again' }).first()).toBeVisible();
  });

  test('offline — Offline Banner', async ({ page }) => {
    await gotoScenario(page, GALLERY.states, 'health:offline');
    await expect(liveState(page)).toHaveAttribute('data-health-state', 'offline');
    await expect(page.locator('[data-demo="v9-state-live"] .haru-alert--offline')).toBeVisible();
  });

  test('retry — 1회차 실패 → 재시도 성공', async ({ page }) => {
    await gotoScenario(page, GALLERY.states, 'health:retry');

    const live = liveState(page);
    await expect(live).toHaveAttribute('data-health-state', 'error');

    await page
      .locator('[data-demo="v9-state-live"]')
      .getByRole('button', { name: 'Try again' })
      .click();

    await expect(live).toHaveAttribute('data-health-state', 'success');
  });
});

test.describe('결정성 (AC-1-39)', () => {
  test('같은 scenario 를 두 번 열면 같은 응답 바이트가 표시된다', async ({ page }) => {
    // 로딩 중 텍스트를 읽지 않도록 매번 success 상태가 된 뒤에 읽는다.
    async function readSettledText(): Promise<string> {
      await expect(liveState(page)).toHaveAttribute('data-health-state', 'success');
      await settle(page);
      return liveState(page).innerText();
    }

    await gotoScenario(page, GALLERY.states, 'health:success');
    const first = await readSettledText();

    await page.reload({ waitUntil: 'domcontentloaded' });
    const second = await readSettledText();

    expect(second).toBe(first);
    // 고정 clock 이므로 serverTime 도 같아야 한다 (AC-1-39).
    expect(first).toContain('2026-01-01');
  });
});

test.describe('__states scenario — 공통 상태 데모 (Design Spec §5.7)', () => {
  test('__states:empty 는 EmptyState 하나만 보여 준다', async ({ page }) => {
    await gotoScenario(page, GALLERY.states, '__states:empty');

    await expect(page.locator('[data-demo="v9-state-empty"]')).toBeVisible();
    await expect(page.locator('[data-demo="v9-state-loading"]')).toHaveCount(0);
  });

  test('그룹을 조합해 지정할 수 있다', async ({ page }) => {
    await gotoScenario(page, GALLERY.states, 'health:error,__states:offline');

    await expect(page.locator('[data-demo="v9-state-offline"]')).toBeVisible();
    await expect(liveState(page)).toHaveAttribute('data-health-state', 'error');
  });
});

test.describe('Scenario Panel (dev 전용)', () => {
  test('현재 scenario 를 표시하고 전환하면 URL 과 sessionStorage 가 함께 바뀐다', async ({
    page,
  }) => {
    await gotoStable(page, GALLERY.states);

    await page.getByRole('button', { name: 'scenario' }).click();
    const health = page.getByRole('group', { name: 'health' });
    await expect(health.getByRole('button', { name: 'success' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await health.getByRole('button', { name: 'error' }).click();
    await page.waitForURL(/scenario=/);

    expect(page.url()).toContain('health%3Aerror');
    expect(await page.evaluate(() => window.sessionStorage.getItem('haru:scenario'))).toContain(
      'health:error',
    );
    await expect(liveState(page)).toHaveAttribute('data-health-state', 'error');
  });

  test('dev 번들 표식이 dev 서버에서는 존재한다 (assert:no-mocks 검사가 헛돌지 않음)', async ({
    page,
  }) => {
    await gotoStable(page, GALLERY.states);

    await expect(page.locator('[data-dev-sentinel]').first()).toHaveAttribute(
      'data-dev-sentinel',
      '__HARU_DEV_SENTINEL__',
    );
  });
});

test.describe('외부 네트워크 요청 0건 (AC-1-14 · AC-1-44)', () => {
  test('gallery 전 화면에서 외부 도메인 요청이 없다', async ({ page }) => {
    const external: string[] = [];

    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol === 'data:' || url.protocol === 'blob:') return;
      if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return;
      external.push(request.url());
    });

    for (const path of Object.values(GALLERY)) {
      await gotoStable(page, path);
    }

    expect(external).toStrictEqual([]);
  });
});
