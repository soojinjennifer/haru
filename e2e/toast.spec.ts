/**
 * Toast 배치 e2e — **상단 Toast 가 TopBar 를 가리지 않는다** (사용자 결정 2026-10-10).
 *
 * Toast 는 2026-10-10 부터 화면 **상단**에서 내려온다. 그 이동은 `QA-3-004`(하단 Toast 가 탭바를
 * 50px 덮어 탭 3개 클릭을 전부 막았다)를 **반대 방향으로 재현할 위험**을 그대로 들고 온다 —
 * TopBar 는 `position: sticky` 이고 설정 아이콘·뒤로 가기 같은 **대화형 요소**를 담는다.
 *
 * 그래서 측정 방식을 `QA-3-004` 수정과 **같게** 둔다.
 *
 *  - **`.click()` 을 주 단정으로 쓰지 않는다.** Toast 는 4s 뒤 자동 해제되므로, 가려져 있어도
 *    Playwright 가 기다리는 동안 Toast 가 사라져 클릭이 **늦게 성공**한다 — 결함이 통과한다.
 *    `elementFromPoint` hit-test 는 즉시·결정적이다.
 *  - 측정과 "Toast 가 떠 있다" 확인을 **같은 `evaluate` 안**에서 한다. 그래야 Toast 가 이미
 *    사라진 상태로 헛돌 수 없다.
 *
 * 탭 화면(`/` · `/library`)과 스택 화면(`/auth/log-in`) **양쪽**을 잰다. 두 쪽 모두 TopBar 를
 * `StackLayout`·`TabLayout` 의 같은 슬롯(`.haru-app-shell__bar-top`)에 꽂으므로, 보정 등록
 * 지점도 한 곳이다 (`AppShellTopBar`).
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp } from './support/gallery';

/** 상단 Toast 와 TopBar 를 **한 번에** 재는 프로브. */
async function probeToastAgainstTopBar(page: Page) {
  return page.evaluate(() => {
    const toast = document.querySelector('.haru-toast');
    const viewport = document.querySelector('.haru-toast-viewport');
    const bar = document.querySelector('.haru-app-shell__bar-top');

    if (toast === null || viewport === null || bar === null) {
      return {
        ok: false as const,
        toastPresent: toast !== null,
        barPresent: bar !== null,
      };
    }

    const toastRect = toast.getBoundingClientRect();
    const barRect = bar.getBoundingClientRect();

    /* TopBar 안의 대화형 요소 — 가려지면 그대로 클릭 불능이다. */
    const controls = [...bar.querySelectorAll('button, a')].map((control) => {
      const rect = control.getBoundingClientRect();
      const node = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return {
        label: (control.getAttribute('aria-label') ?? control.textContent ?? '').trim(),
        inTopBar: node !== null && node.closest('.haru-app-shell__bar-top') !== null,
        inToast: node !== null && node.closest('.haru-toast-viewport') !== null,
        topNode: node === null ? null : node.className,
      };
    });

    /* 대화형 요소가 없는 TopBar(제목만)도 글자가 가려지면 안 된다 — 밴드 중앙을 함께 찍는다. */
    const bandCenter = document.elementFromPoint(
      barRect.x + barRect.width / 2,
      barRect.y + barRect.height / 2,
    );

    return {
      ok: true as const,
      toastPresent: true,
      barPresent: true,
      viewportClass: viewport.className,
      insetBlockStart: getComputedStyle(viewport).insetBlockStart,
      toast: { top: Math.round(toastRect.top), bottom: Math.round(toastRect.bottom) },
      bar: {
        top: Math.round(barRect.top),
        bottom: Math.round(barRect.bottom),
        height: Math.round(barRect.height),
      },
      controls,
      band: {
        inToast: bandCenter !== null && bandCenter.closest('.haru-toast-viewport') !== null,
      },
    };
  });
}

/** 공통 단정 — 기하(겹침 0) + hit-test(최상단 요소가 TopBar). */
async function expectTopBarNotCovered(page: Page, screen: string): Promise<void> {
  const probe = await probeToastAgainstTopBar(page);

  expect(probe.toastPresent, `${screen}: Toast 가 떠 있는 상태에서 재야 한다`).toBe(true);
  expect(probe.barPresent, `${screen}: TopBar 슬롯이 있어야 한다`).toBe(true);
  if (!probe.ok) throw new Error(`${screen}: 측정 실패 ${JSON.stringify(probe)}`);

  const diagnostic = `${screen} ${JSON.stringify(probe)}`;
  // eslint-disable-next-line no-console -- 실측값을 보고에 그대로 옮긴다 (추정 금지)
  console.log(
    `[toast-top] ${screen} toast=${probe.toast.top}–${probe.toast.bottom} ` +
      `bar=${probe.bar.top}–${probe.bar.bottom}(h${probe.bar.height}) ` +
      `inset=${probe.insetBlockStart} class="${probe.viewportClass}"`,
  );

  // ① 기하 — Toast 위 끝이 TopBar 아래 끝보다 아래에 있어야 한다 (겹침 0).
  expect(probe.toast.top, `Toast 가 TopBar 를 덮는다 ${diagnostic}`).toBeGreaterThanOrEqual(
    probe.bar.bottom,
  );

  // ② hit-test — TopBar 밴드 중앙과 대화형 요소 중심의 최상단 요소가 Toast 가 아니어야 한다.
  expect(probe.band.inToast, `TopBar 밴드 중앙이 Toast 에 가려짐 ${diagnostic}`).toBe(false);
  for (const control of probe.controls) {
    expect(control.inToast, `"${control.label}" 이 Toast 에 가려짐 ${diagnostic}`).toBe(false);
    expect(control.inTopBar, `"${control.label}" 중심 hit-test ${diagnostic}`).toBe(true);
  }
}

/** 로그인해서 `/` 에 착지한다 (기본 `me` 는 온보딩까지 마친 사용자다). */
async function logIn(page: Page, scenario?: string): Promise<void> {
  const query = scenario === undefined ? '' : `?scenario=${encodeURIComponent(scenario)}`;
  await gotoApp(page, `/auth/log-in${query}`);

  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();

  await expect(page).toHaveURL(/\/$/);
}

/**
 * `/library/add` 로 **SPA 이동**한다.
 *
 * `page.goto` 로는 갈 수 없다 — Mock 세션은 메모리에만 있어 전체 리로드가 되면 Route Guard 가
 * `/auth/welcome` 으로 되돌린다 (`support/onboarding.ts` 와 같은 제약).
 */
async function goToLibraryAdd(page: Page): Promise<void> {
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Library' })
    .click();
  await expect(page).toHaveURL(/\/library$/);

  await page.getByRole('button', { name: 'Add a book you own' }).click();
  await expect(page).toHaveURL(/\/library\/add$/);
}

test.describe('상단 Toast 는 TopBar 를 가리지 않는다 (2026-10-10)', () => {
  /*
    탭 화면 — `HomeTopBar` 는 `variant=large` 에 **설정 IconButton** 이 있다 (`26:44`).
    `library:error` 로 `★ Save` 를 실패시켜 error Toast 를 띄운다.
  */
  test('탭 화면 `/` — 설정 아이콘이 Toast 에 가려지지 않는다', async ({ page }) => {
    await logIn(page, 'library:error');
    await expect(page.locator('.haru-activity-track')).toBeVisible();
    expect(page.viewportSize()).toEqual({ width: 393, height: 852 });

    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await expect(page.locator('.haru-toast')).toBeVisible();

    await expectTopBarNotCovered(page, '/');
  });

  /*
    스택 화면 — `/auth/reset-password` 제출 → `/auth/log-in` 으로 `replace` 이동하고 그 화면에서
    success Toast 가 뜬다. 로그인 화면 TopBar 는 투명하지만 **뒤로 가기 IconButton** 이 있다.
    스택 → 스택 이동이라 보정 등록이 **재마운트를 건너 유지되는지**도 함께 본다.
  */
  test('스택 화면 `/auth/log-in` — 뒤로 가기가 Toast 에 가려지지 않는다', async ({ page }) => {
    await gotoApp(page, '/auth/reset-password?token=mock-reset-token');

    await page.getByLabel('New password', { exact: true }).fill('sunny-evening-8');
    await page.getByLabel('Confirm password', { exact: true }).fill('sunny-evening-8');
    await page.getByRole('button', { name: 'Save new password', exact: true }).click();

    await expect(page.locator('.haru-toast')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/log-in$/);

    await expectTopBarNotCovered(page, '/auth/log-in');
  });

  /*
    스택 → 탭 이동 — `/library/add` 에서 책을 등록하면 `/library` 로 이동하며 success Toast 가
    뜬다. Layout 이 **바뀌는** 경로이므로 보정 등록이 route 전환에서 풀렸다 다시 걸리는 순서
    (StrictMode 의 mount → unmount → mount 포함)를 실제로 통과해야 한다.
  */
  test('스택 → 탭 이동 `/library` — 서재 헤더가 Toast 에 가려지지 않는다', async ({ page }) => {
    await logIn(page);
    await goToLibraryAdd(page);

    /* 필수 표시 `*` 가 label 텍스트에 붙어 있어 정확 일치로는 못 잡는다. */
    await page.getByLabel(/^Title/).fill('The Paper Boat');
    await page.getByRole('button', { name: 'Add to library', exact: true }).click();

    await expect(page.locator('.haru-toast')).toBeVisible();
    await expect(page).toHaveURL(/\/library$/);

    await expectTopBarNotCovered(page, '/library');
  });
});

/**
 * Toast 가 **없는** 화면의 TopBar 기하 측정 (보고용).
 *
 * `/settings` · `/library/add` 는 Toast 를 띄우는 행동이 없어 실제 Toast 로 잴 수 없다. 대신
 * **보정이 쓰는 입력값**(TopBar 슬롯 높이)을 기록해, 슬롯이 실제로 존재하는지(= 등록 대상이
 * 있는지)를 고정한다.
 *
 * ⚠ `/onboarding/:step` 은 여기에 **없다**. 그 화면은 TopBar 를 feature 가 `main` 안에서
 * 렌더하므로 이 슬롯 자체가 비어 있다 — Toast 를 띄우는 코드가 생기면 보정이 걸리지 않는다
 * (handoff 에 기록). 구조를 바꾸는 일은 이 과제 범위가 아니다.
 */
test.describe('TopBar 슬롯 높이 실측 (Toast 없는 화면)', () => {
  test('스택 화면의 TopBar 슬롯이 보정 대상으로 존재한다', async ({ page }) => {
    await logIn(page);

    /*
      SPA 이동만 쓴다 — `page.goto` 는 메모리 세션을 잃고 `/auth/welcome` 으로 튕긴다.

      **URL 단정만으로는 못 센다.** `navigate()` 는 즉시 URL 을 바꾸지만 새 Layout 의 커밋은
      그 뒤다. URL 만 기다리고 재면 **직전 화면의 TopBar** 가 잡힌다 (실제로 `/settings` 에서
      Home 헤더 48 이 찍혔다). 그래서 화면 고유 요소까지 기다린 뒤 측정한다.
    */
    const steps: readonly {
      path: RegExp;
      open: () => Promise<void>;
      ready: () => Promise<void>;
    }[] = [
      {
        path: /\/settings$/,
        open: async () => {
          await page.getByRole('button', { name: 'Settings' }).click();
        },
        ready: async () => {
          await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
        },
      },
      {
        path: /\/library\/add$/,
        open: async () => {
          await page.goBack();
          await expect(page).toHaveURL(/\/$/);
          await goToLibraryAdd(page);
        },
        ready: async () => {
          await expect(page.getByLabel(/^Title/)).toBeVisible();
        },
      },
    ];

    for (const step of steps) {
      await step.open();
      await expect(page).toHaveURL(step.path);
      await step.ready();

      const measured = await page.evaluate(() => {
        const bar = document.querySelector('.haru-app-shell__bar-top');
        if (bar === null) return null;
        const rect = bar.getBoundingClientRect();
        return {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
        };
      });

      const where = page.url();
      expect(measured, `${where}: TopBar 슬롯이 없다`).not.toBeNull();
      expect(measured?.height, `${where} ${JSON.stringify(measured)}`).toBeGreaterThan(0);
      // eslint-disable-next-line no-console -- 보고용 실측값
      console.log(`[toast-inset] ${where} bar-top=${JSON.stringify(measured)}`);
    }
  });
});
