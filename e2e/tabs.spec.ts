/**
 * 탭 이동 e2e — `X-1` 회귀 (2026-10-06).
 *
 * `TAB_ITEMS` 가 `href` 를 주입하므로 `BottomTabBar` 는 `<a>` 를 렌더한다. 그 클릭 핸들러가
 * `preventDefault()` 를 하지 않으면 `onSelect` 의 `navigate()` 와 **브라우저 기본 이동이 동시에**
 * 일어나 전체 문서 리로드가 된다. 리로드되면 메모리 Mock 세션이 사라져 Route Guard 가
 * `/auth/welcome` 으로 되돌린다 — 즉 탭이 아예 동작하지 않는다.
 *
 * **이 결함은 e2e 로만 잡힌다.** jsdom 은 `<a>` 의 기본 이동(문서 교체)을 수행하지 않으므로
 * 단위 테스트에서는 수정 전·후가 똑같이 통과한다. 그래서 회귀 방어선을 여기 둔다.
 *
 * 세는 신호는 **`resourceType === 'document'` 요청 수**다. SPA 이동이면 0건이다.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './support/gallery';

/**
 * 로그인해서 `/` 에 착지한다 — 기본 `me` 는 온보딩까지 마친 사용자다.
 *
 * `scenario` 를 주면 `?scenario=` 로 Mock 시나리오를 고정한다. URL 계층이 1순위이고
 * ScenarioStore 는 앱 시작 시 한 번 읽으므로, 로그인 후 SPA 이동에도 선택이 유지된다.
 */
async function logIn(page: Page, scenario?: string): Promise<void> {
  const query = scenario === undefined ? '' : `?scenario=${encodeURIComponent(scenario)}`;
  await gotoApp(page, `/auth/log-in${query}`);

  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
}

/**
 * 호출 시점 이후의 document 요청(= 전체 리로드)을 센다.
 *
 * 로그인 과정의 최초 `goto` 를 세지 않으려면 **착지 후에** 붙여야 한다.
 */
function watchDocumentRequests(page: Page): () => string[] {
  const urls: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'document') urls.push(request.url());
  });
  return () => urls;
}

function tabs(page: Page) {
  return page.getByRole('navigation', { name: 'Main' });
}

/**
 * 이동이 **유지되는지** 본다. 리로드가 끼면 load → Guard 판정 순서로 `/auth/welcome` 으로
 * 튕기므로, 전환 시간을 준 뒤 다시 확인해야 한다 (부정 단정은 즉시 통과해서 못 잡는다).
 */
async function expectUrlStays(page: Page, pattern: RegExp): Promise<void> {
  await expect(page).toHaveURL(pattern);
  await page.waitForTimeout(1_000);
  await expect(page).toHaveURL(pattern);
}

test.describe('BottomTabBar 이동 (`X-1`)', () => {
  test('Home → Library 가 SPA 이동이고 Welcome 으로 튕기지 않는다', async ({ page }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    const documents = watchDocumentRequests(page);

    await tabs(page).getByRole('link', { name: 'Library' }).click();

    await expectUrlStays(page, /\/library$/);
    await expect(page).not.toHaveURL(/\/auth\/welcome$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Library' })).toBeVisible();
    await expect(tabs(page).getByRole('link', { name: 'Library' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    expect(documents()).toEqual([]);
  });

  test('Library → Home 도 SPA 이동이다 (역방향)', async ({ page }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    await tabs(page).getByRole('link', { name: 'Library' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Library' })).toBeVisible();

    const documents = watchDocumentRequests(page);

    await tabs(page).getByRole('link', { name: 'Home' }).click();

    await expectUrlStays(page, /\/$/);
    await expect(page).not.toHaveURL(/\/auth\/welcome$/);
    await expect(page.locator('.haru-activity-track')).toBeVisible();
    await expect(tabs(page).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    expect(documents()).toEqual([]);
  });

  /*
    기본 viewport **393×852** 에서 돈다 (`X-3`). 한때 dev Scenario Panel(fixed 우하단, dev 전용)이
    가장 오른쪽 `Progress` 탭을 덮어 클릭을 가로챘고, 그때는 1024px 로 우회해 두었다. 패널을
    탭바 위로 올려(`dev.css`) 겹침을 없앴으므로 **실제 기준 폭으로 되돌렸다** — 우회를 남겨두면
    같은 겹침이 재발해도 테스트가 통과한다.
  */
  test('Home → Progress 도 SPA 이동이다 (탭 3개 전부)', async ({ page }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    const documents = watchDocumentRequests(page);

    await tabs(page).getByRole('link', { name: 'Progress' }).click();

    await expectUrlStays(page, /\/progress$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();

    expect(documents()).toEqual([]);
  });

  /*
    `X-3` (2026-10-06) — dev Scenario Panel 이 **기준 폭 393px 에서 탭을 덮지 않는다**.

    `.click()` 만으로는 부족하다: 가려진 탭은 Playwright 가 60s 를 기다렸다가 timeout 으로
    죽어 "왜" 가 안 남는다. 여기서는 **탭 중심의 hit-test 결과**를 직접 본다 — 겹치면
    `elementFromPoint` 가 `.haru-dev-panel` 쪽 노드를 돌려준다.
  */
  test('dev Scenario Panel 이 393px 에서 탭 3개를 가리지 않는다 (`X-3`)', async ({ page }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    // 패널이 실제로 떠 있는 상태에서 봐야 의미가 있다.
    await expect(page.locator('.haru-dev-panel')).toBeVisible();
    expect(page.viewportSize()).toEqual({ width: 393, height: 852 });

    for (const name of ['Home', 'Library', 'Progress']) {
      const box = await tabs(page).getByRole('link', { name }).boundingBox();
      if (box === null) throw new Error(`${name} 탭 박스를 못 구했다`);

      const hit = await page.evaluate(
        ({ x, y }) => {
          const node = document.elementFromPoint(x, y);
          return {
            inTabBar: node !== null && node.closest('.haru-tab-bar') !== null,
            inDevPanel: node !== null && node.closest('.haru-dev-panel') !== null,
            tag: node === null ? null : node.className,
          };
        },
        { x: box.x + box.width / 2, y: box.y + box.height / 2 },
      );

      expect(hit.inDevPanel, `${name} 탭 중심이 dev 패널에 가려짐 (${String(hit.tag)})`).toBe(
        false,
      );
      expect(hit.inTabBar, `${name} 탭 중심 hit-test (${String(hit.tag)})`).toBe(true);
    }
  });

  /*
    `QA-3-004` (2026-10-09) — **Toast 가 떠 있어도 탭 3개를 클릭할 수 있다.**

    QA 측정: 탭 화면에서 Toast 가 `y 786–836`, 탭바가 `y 766–836` 으로 **50px 겹쳤고**
    `--z-toast`(60) > `--z-tabbar`(20) 이라 탭 3개 중심의 `elementFromPoint` 가 **전부 Toast**
    를 돌려줬다. 원인은 탭바 보정 수식어를 **아무도 붙이지 않은 것**이다.

    2026-10-10 에 Toast 가 화면 **상단**으로 옮겨져 이 단정은 기하적으로 여유로워졌다. 그래도
    **지우면 아무도 보지 않는 축이 생긴다** — Toast 가 다시 하단으로 가거나 세로로 늘어나는
    변경은 이 단정으로만 잡힌다 (상단 이동 중간 상태에서 `inset-block-start` 와
    `inset-block-end` 가 동시에 걸려 Toast 높이가 **715px** 로 늘어난 실제 사례가 있었다).
    상단 쪽 대응 단정은 `e2e/toast.spec.ts` 가 가진다.

    왜 CSS 가드로는 안 되는가: `stage3-css-guards.test.ts` 는 그 클래스 **규칙 안에 토큰이
    있는지만** 봤다. 규칙이 존재한다는 사실은 적용된다는 뜻이 아니다 (approvals §26.3).
    그래서 여기서는 **실제 렌더 좌표의 hit-test** 로 단정한다.

    `.click()` 을 주 단정으로 쓰지 않는 이유: Toast 는 4s 뒤 자동 해제되므로, 가려져 있어도
    Playwright 가 기다리는 동안 Toast 가 사라져 클릭이 **늦게 성공**한다 — 결함을 통과시킨다.
    hit-test 는 즉시·결정적이다. 측정과 Toast 존재 확인을 **같은 evaluate 안**에서 하므로
    Toast 가 이미 사라진 상태로 헛돌 수도 없다.
  */
  test('Toast 가 떠 있어도 탭 3개가 가려지지 않는다 (`QA-3-004`)', async ({ page }) => {
    // `library:error` → Activity Card 의 `★ Save` 가 실패해 error Toast 가 뜬다.
    await logIn(page, 'library:error');
    await expect(page.locator('.haru-activity-track')).toBeVisible();
    expect(page.viewportSize()).toEqual({ width: 393, height: 852 });

    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await expect(page.locator('.haru-toast')).toBeVisible();

    const probe = await page.evaluate(() => {
      const toast = document.querySelector('.haru-toast');
      const viewport = document.querySelector('.haru-toast-viewport');
      const bar = document.querySelector('.haru-tab-bar');
      if (toast === null || viewport === null || bar === null) {
        return {
          ok: false as const,
          toastPresent: toast !== null,
          barPresent: bar !== null,
        };
      }

      const toastRect = toast.getBoundingClientRect();
      const barRect = bar.getBoundingClientRect();

      const links = [...bar.querySelectorAll('a')].map((link) => {
        const rect = link.getBoundingClientRect();
        const node = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return {
          label: (link.textContent ?? '').trim(),
          inTabBar: node !== null && node.closest('.haru-tab-bar') !== null,
          inToast: node !== null && node.closest('.haru-toast-viewport') !== null,
          topNode: node === null ? null : node.className,
        };
      });

      return {
        ok: true as const,
        toastPresent: true,
        barPresent: true,
        viewportClass: viewport.className,
        insetBlockStart: getComputedStyle(viewport).insetBlockStart,
        toast: { top: Math.round(toastRect.top), bottom: Math.round(toastRect.bottom) },
        bar: { top: Math.round(barRect.top), bottom: Math.round(barRect.bottom) },
        links,
      };
    });

    expect(probe.toastPresent, 'Toast 가 떠 있는 상태에서 재야 한다').toBe(true);
    expect(probe.barPresent, '탭바가 있어야 한다').toBe(true);
    if (!probe.ok) throw new Error(`측정 실패 ${JSON.stringify(probe)}`);

    const diagnostic = JSON.stringify(probe);

    // ① 기하 — Toast 아래 끝이 탭바 위 끝보다 위에 있어야 한다 (겹침 0).
    expect(probe.toast.bottom, `Toast 가 탭바를 덮는다 ${diagnostic}`).toBeLessThanOrEqual(
      probe.bar.top,
    );

    // ② hit-test — 탭 3개 중심의 최상단 요소가 탭바여야 한다.
    expect(probe.links).toHaveLength(3);
    for (const link of probe.links) {
      expect(link.inToast, `${link.label} 탭 중심이 Toast 에 가려짐 ${diagnostic}`).toBe(false);
      expect(link.inTabBar, `${link.label} 탭 중심 hit-test ${diagnostic}`).toBe(true);
    }
  });

  /*
    `QA-3-004` 의 반대 방향 테스트(**탭바가 없는 스택 화면에서는 하단 보정을 하지 않는다**)는
    2026-10-10 Toast 상단 이동으로 **대상이 바뀌어** `e2e/toast.spec.ts` 로 옮겼다. 하단 보정
    자체가 사라졌으므로 여기에서 잴 것이 없다 — 같은 역할(= 보정을 하드코딩하면 TopBar 가
    없는 화면 Toast 가 떠 버린다)은 `layouts.test.tsx` "Toast 상단 보정 배선" 이 맡는다.
  */

  /*
    `href` 를 준 이유가 **링크 의미 유지**(새 탭 열기 등 — Design Spec §6.2)이므로 수정이 그
    의도를 깨면 안 된다. 수식 키 클릭은 브라우저 기본 동작에 맡기고, 그때 `onSelect` 를 함께
    호출하지 않아야 **현재 탭이 같이 이동하지 않는다**.
  */
  test('수식 키 클릭은 현재 탭을 이동시키지 않는다 (링크 의미 유지)', async ({ page, context }) => {
    await logIn(page);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    // 새 탭이 열리는지 자체는 브라우저 몫이다. 열리면 정리하고, 안 열려도 테스트를 막지 않는다.
    const opened = context.waitForEvent('page', { timeout: 3_000 }).catch(() => null);

    await tabs(page)
      .getByRole('link', { name: 'Library' })
      .click({ modifiers: ['ControlOrMeta'] });

    await expectUrlStays(page, /\/$/);
    await expect(page.locator('.haru-activity-track')).toBeVisible();

    const extra = await opened;
    if (extra !== null) await extra.close();
  });
});
