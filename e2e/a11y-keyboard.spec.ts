/**
 * Stage 8 `S8-G` — 키보드 · 모달 · live region (Spec §9.4).
 *
 * - AC-8-43 `S4B-F1-OPEN` ④ — 시간 목록을 열면 focus = 시트 안 첫 요소(`Back`), 닫으면 트리거로 복귀
 * - AC-8-47 키보드만으로 핵심 흐름 완료 (Tab · Shift+Tab · Enter · Space · 화살표 — 포인터 0)
 * - AC-8-48 모든 Dialog · Sheet: 열림 focus 이동 · Esc 닫기 · 닫힘 focus 복귀 · 배경 차단(`aria-modal` + scrim)
 * - AC-8-50 live region 낭독 1회 — 사건 1회당 영역 텍스트 갱신 1회 (MutationObserver 계수)
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

import { spaGoto } from './support/a11y-stops';
import { gotoApp, hideDevPanel, settle } from './support/gallery';
import { seedChildDraft } from './support/onboarding';
import { logInToHome, READY_TITLE } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

/** 지금 focus 된 요소의 접근성 이름 근사 (aria-label → 연결 label → 텍스트). */
async function focusedName(page: Page): Promise<string> {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (element === null || element === document.body) return '';
    const labelledBy = element.getAttribute('aria-labelledby');
    const byId =
      labelledBy === null
        ? null
        : labelledBy
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent ?? '')
            .join(' ');
    const forLabel =
      element.id === '' ? null : document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    return (
      element.getAttribute('aria-label') ??
      byId ??
      forLabel?.textContent ??
      element.closest('label')?.textContent ??
      element.textContent ??
      ''
    )
      .replace(/\s+/g, ' ')
      .trim();
  });
}

/** Tab(또는 Shift+Tab)만으로 이름이 맞는 요소까지 간다. 포인터를 쓰지 않는다. */
async function tabTo(page: Page, name: RegExp, max = 80, backward = false): Promise<void> {
  for (let index = 0; index < max; index += 1) {
    await page.keyboard.press(backward ? 'Shift+Tab' : 'Tab');
    if (name.test(await focusedName(page))) return;
  }
  throw new Error(`Tab ${String(max)}회 안에 ${String(name)} 에 도달하지 못했다`);
}

/** 순차 탐색 시작점을 문서 맨 앞으로 (blur 는 시작점을 남긴다 — `support/a11y.ts`). */
async function resetFocusStart(page: Page): Promise<void> {
  await page.evaluate(() => {
    const start = document.createElement('div');
    start.tabIndex = -1;
    document.body.prepend(start);
    start.focus();
    start.remove();
  });
}

async function expectFocusInside(container: Locator): Promise<void> {
  await expect
    .poll(() => container.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true);
}

/** 배경 한 점(화면 좌상단 안쪽)을 누르면 scrim 이 받는다 — 배경 요소는 포인터를 받지 못한다. */
async function backgroundIsBlocked(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const hit = document.elementFromPoint(8, 8);
    return hit !== null && hit.closest('.haru-scrim, [aria-modal="true"]') !== null;
  });
}

// ── AC-8-43 ─────────────────────────────────────────────────────────────────

test.describe('시간 목록 focus (AC-8-43 · S4B-F1-OPEN ④)', () => {
  async function openChoices(page: Page): Promise<Locator> {
    await logInToHome(page);
    const start = page
      .locator('.haru-activity-card-flip__face--front')
      .first()
      .getByRole('button', { name: 'Start Session' });
    await start.focus();
    await page.keyboard.press('Enter');
    const sheet = page.getByRole('dialog', { name: READY_TITLE });
    await expect(sheet).toBeVisible();
    await sheet.getByText('Pick a time…', { exact: true }).click();
    return sheet;
  }

  test('열면 Back · Back 이면 트리거 · 시간 고르면 트리거', async ({ page }) => {
    const sheet = await openChoices(page);
    const trigger = sheet.getByRole('button', { name: /^Time/ });

    await trigger.focus();
    await page.keyboard.press('Enter');
    const timeSheet = page.getByRole('dialog', { name: 'Time' });
    await expect(timeSheet).toBeVisible();
    await expect(timeSheet.getByRole('button', { name: 'Back' })).toBeFocused();

    await page.keyboard.press('Enter'); // Back
    await expect(page.getByRole('dialog', { name: READY_TITLE })).toBeVisible();
    await expect(sheet.getByRole('button', { name: /^Time/ })).toBeFocused();

    // 포인터로 시간을 고르면 바로 돌아오고 focus = 트리거
    await sheet.getByRole('button', { name: /^Time/ }).click();
    await page.getByRole('radio', { name: '19:30' }).click();
    await expect(page.getByRole('dialog', { name: READY_TITLE })).toBeVisible();
    await expect(sheet.getByRole('button', { name: /^Time.*19:30/ })).toBeFocused();
  });

  test('키보드: 화살표는 목록에 머물며 고르고 · Enter 로 확정 · Space 로도 확정 (2.1.1)', async ({
    page,
  }) => {
    const sheet = await openChoices(page);
    await sheet.getByRole('button', { name: /^Time/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Time' })).toBeVisible();

    await page.keyboard.press('Tab'); // Back → 목록 (radio 묶음 하나)
    for (let index = 0; index < 4; index += 1) await page.keyboard.press('ArrowDown');
    // 4칸 이동 = 02:00 — 아직 목록이다
    await expect(page.getByRole('dialog', { name: 'Time' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '02:00' })).toBeChecked();
    await page.keyboard.press('Enter');
    await expect(sheet.getByRole('button', { name: /^Time.*02:00/ })).toBeFocused();

    // 다시 열어 ArrowUp → (이미 선택된 칸의) Space 확정
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Time' })).toBeVisible();
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('radio', { name: '01:30' })).toBeChecked();
    await expect(page.getByRole('dialog', { name: 'Time' })).toBeVisible();
    await page.keyboard.press('Space');
    await expect(sheet.getByRole('button', { name: /^Time.*01:30/ })).toBeFocused();
  });

  test('시간 목록에서 Esc → 시트 닫힘 · focus = 처음 트리거(Start Session)', async ({ page }) => {
    const sheet = await openChoices(page);
    await sheet.getByRole('button', { name: /^Time/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Time' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await focusedName(page)).toBe('Start Session');
  });
});

// ── AC-8-48 ─────────────────────────────────────────────────────────────────

interface ModalCase {
  readonly name: string;
  /** 트리거에 focus 가 있는 상태까지 간다. 트리거 locator 를 돌려준다. */
  readonly arrive: (page: Page) => Promise<Locator>;
  readonly modal: (page: Page) => Locator;
}

async function settingsTrigger(page: Page, row: string): Promise<Locator> {
  await logInToHome(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  return page.getByRole('button', { name: row, exact: true });
}

const MODALS: readonly ModalCase[] = [
  {
    name: '홈 Reading context 시트',
    arrive: async (page) => {
      await logInToHome(page);
      return page
        .locator('.haru-activity-card-flip__face--front')
        .first()
        .getByRole('button', { name: 'Start Session' });
    },
    modal: (page) => page.getByRole('dialog', { name: READY_TITLE }),
  },
  {
    name: '서재 책 상세 시트',
    arrive: async (page) => {
      await logInToHome(page);
      await spaGoto(page, '/library');
      const item = page.locator('.haru-shelf-item--pressable').first();
      await expect(item).toBeVisible();
      return item;
    },
    modal: (page) => page.getByRole('dialog'),
  },
  {
    name: '설정 Log out 다이얼로그',
    arrive: (page) => settingsTrigger(page, 'Log out'),
    modal: (page) => page.getByRole('alertdialog'),
  },
  {
    name: '데이터 관리 전체 삭제 다이얼로그',
    arrive: async (page) => {
      await (await settingsTrigger(page, 'Data & privacy')).click();
      return page
        .getByRole('list', { name: 'Delete data' })
        .getByRole('button', { name: 'Delete all data' });
    },
    modal: (page) => page.getByRole('alertdialog'),
  },
  {
    name: '녹음 삭제 다이얼로그',
    arrive: async (page) => {
      await (await settingsTrigger(page, 'Data & privacy')).click();
      await page.getByRole('button', { name: /Session recordings/ }).click();
      const trigger = page.getByRole('button', { name: /^Delete recording, / }).first();
      await expect(trigger).toBeVisible();
      return trigger;
    },
    modal: (page) => page.getByRole('alertdialog'),
  },
  {
    name: '계정 탈퇴 다이얼로그',
    arrive: async (page) => {
      await (await settingsTrigger(page, 'Account')).click();
      return page
        .getByRole('list', { name: 'Delete account' })
        .getByRole('button', { name: 'Delete account' });
    },
    modal: (page) => page.getByRole('alertdialog'),
  },
  {
    name: '미가입 draft 삭제 다이얼로그',
    arrive: async (page) => {
      await seedChildDraft(page, 'Yuna');
      await gotoApp(page, '/onboarding/child-info');
      return page.getByRole('button', { name: 'Remove my answers from this device' });
    },
    modal: (page) => page.getByRole('alertdialog'),
  },
  {
    name: '아이 정보 Birth year 선택 시트',
    arrive: async (page) => {
      await gotoApp(page, '/onboarding/start?scenario=me:consent-missing');
      await page.getByRole('button', { name: 'Start the questions' }).click();
      return page.getByRole('button', { name: /Birth year/ });
    },
    modal: (page) => page.getByRole('dialog'),
  },
];

test.describe('Dialog · Sheet 공통 (AC-8-48)', () => {
  for (const item of MODALS) {
    test(item.name, async ({ page }) => {
      const trigger = await item.arrive(page);
      await trigger.focus();
      await page.keyboard.press('Enter');
      const modal = item.modal(page);
      await expect(modal).toBeVisible();
      await settle(page);

      // 열림 → focus 이동 · aria-modal · 배경 포인터 차단
      await expectFocusInside(modal);
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(await backgroundIsBlocked(page)).toBe(true);

      // Tab · Shift+Tab 20회 — 모달 밖으로 나가지 않는다
      for (const key of ['Tab', 'Shift+Tab'] as const) {
        for (let index = 0; index < 20; index += 1) {
          await page.keyboard.press(key);
          expect(await modal.evaluate((element) => element.contains(document.activeElement))).toBe(
            true,
          );
        }
      }

      // Esc → 닫힘 → focus = 트리거
      await page.keyboard.press('Escape');
      await expect(modal).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  }
});

// ── AC-8-47 ─────────────────────────────────────────────────────────────────

test.describe('키보드만으로 핵심 흐름 (AC-8-47)', () => {
  test('로그인 → Home → 세션 시작(Bedtime) → 녹음 → 일시정지 → 제출 → 완료', async ({ page }) => {
    await gotoApp(page, '/auth/log-in');
    await resetFocusStart(page);
    await tabTo(page, /^Email/);
    await page.keyboard.type('sam@example.com');
    await tabTo(page, /^Password/);
    await page.keyboard.type('sunny-evening-8');
    await page.keyboard.press('Enter');
    await expect(
      page.locator('.haru-activity-track:not(.haru-activity-track--skeleton)'),
    ).toBeVisible();

    await resetFocusStart(page);
    await tabTo(page, /^Start Session$/);
    await page.keyboard.press('Enter');
    const sheet = page.getByRole('dialog', { name: READY_TITLE });
    await expect(sheet).toBeVisible();
    // radio 묶음: 첫 Tab 정지점(Now) → 화살표로 Bedtime 선택
    await tabTo(page, /^Now$/);
    await page.keyboard.press('ArrowDown');
    await expect(sheet.getByRole('radio', { name: 'Bedtime' })).toBeChecked();
    await tabTo(page, /^Continue$/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/session\/[0-9a-f-]+$/);
    await expect(page.locator('.haru-scrim')).toHaveCount(0);

    await resetFocusStart(page);
    await tabTo(page, /^Tap to recording, Start recording$/);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Resume recording' })).toBeVisible();
    await tabTo(page, /^Submit$/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/complete$/);
  });

  test('설정 → 데이터 관리 → 세션 녹음 → 삭제 다이얼로그 → Keep', async ({ page }) => {
    await logInToHome(page);
    await resetFocusStart(page);
    await tabTo(page, /^Settings$/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/settings$/);
    await resetFocusStart(page);
    await tabTo(page, /^Data & privacy$/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/settings\/data$/);
    await resetFocusStart(page);
    await tabTo(page, /^Session recordings/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/settings\/data\/recordings$/);
    await expect(page.getByRole('list', { name: 'Session recordings' })).toBeVisible();
    await resetFocusStart(page);
    await tabTo(page, /^Delete recording, /);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alertdialog').getByRole('button', { name: 'Keep' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
  });

  test('Trial 온보딩: 시작 → 아이 정보(선택 시트 키보드) → 다음', async ({ page }) => {
    await gotoApp(page, '/onboarding/start?scenario=me:consent-missing');
    await resetFocusStart(page);
    await tabTo(page, /^Start the questions$/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/onboarding\/child-info$/);
    await resetFocusStart(page);
    await tabTo(page, /^First name/);
    await page.keyboard.type('Yuna');
    for (const [trigger, option] of [
      // 선택 트리거만 — 위쪽 요약 행(`… Edit`)과 이름이 겹친다
      [/^Birth year\*(?!.*Edit$)/, String(new Date().getUTCFullYear() - 6)],
      [/^Birth month\*(?!.*Edit$)/, '04'],
      [/^Gender(?!.*Edit$)/, 'Girl'],
    ] as const) {
      await resetFocusStart(page);
      await tabTo(page, trigger);
      await page.keyboard.press('Enter');
      const sheet = page.getByRole('dialog');
      await expect(sheet).toBeVisible();
      // radio 묶음 안에서 화살표로 목표까지
      await expectFocusInside(sheet);
      for (let index = 0; index < 40; index += 1) {
        if ((await focusedName(page)) === option) break;
        await page.keyboard.press('ArrowDown');
      }
      expect(await focusedName(page)).toBe(option);
      // 화살표는 고르기만 — 시트는 열려 있다. Enter 로 확정하면 닫히고 focus = 트리거 (S8-G 수정)
      await expect(sheet).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(trigger.test(await focusedName(page))).toBe(true);
    }
    await resetFocusStart(page);
    await tabTo(page, /^Next$/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/onboarding$/);
  });
});

// ── AC-8-50 ─────────────────────────────────────────────────────────────────

/**
 * live region 계수기 — `aria-live`(off 제외) · `role=status|alert|log` 영역의 텍스트가 **비어 있지 않은 값으로
 * 바뀐 횟수**를 메시지별로 센다. 같은 문구가 다시 쓰이면(재렌더로 노드 교체) 스크린리더가 다시 읽을 수 있으므로
 * 그것도 1회로 센다 → 중복 낭독 = 같은 문구 2회 이상.
 */
async function installLiveCounter(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const counts = new Map<string, number>();
    const last = new WeakMap<Element, string>();
    const selector =
      // `*` 접두 — 선택자 문자열이 Tailwind arbitrary variant lint(`[…]:`)에 걸리지 않게
      '*[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"], [role="log"]';
    const read = (region: Element): void => {
      const text = (region.textContent ?? '').replace(/\s+/g, ' ').trim();
      const previous = last.get(region) ?? '';
      last.set(region, text);
      if (text === '' || text === previous) return;
      counts.set(text, (counts.get(text) ?? 0) + 1);
    };
    const observer = new MutationObserver((mutations) => {
      const touched = new Set<Element>();
      for (const mutation of mutations) {
        const node =
          mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
        const region = node?.closest(selector);
        if (region !== null && region !== undefined) touched.add(region);
        for (const added of mutation.addedNodes) {
          if (!(added instanceof Element)) continue;
          if (added.matches(selector)) touched.add(added);
          for (const inner of added.querySelectorAll(selector)) touched.add(inner);
        }
      }
      for (const region of touched) read(region);
    });
    const start = (): void => {
      observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    };
    if (document.body === null)
      document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
    (globalThis as unknown as { __liveCounts: () => Record<string, number> }).__liveCounts = () =>
      Object.fromEntries(counts);
  });
}

async function liveCounts(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() =>
    (globalThis as unknown as { __liveCounts: () => Record<string, number> }).__liveCounts(),
  );
}

test.describe('live region 1회 (AC-8-50)', () => {
  test('녹음 삭제 — "Recording deleted." 1회 · 중복 0', async ({ page }) => {
    await installLiveCounter(page);
    await logInToHome(page);
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Data & privacy' }).click();
    await page.getByRole('button', { name: /Session recordings/ }).click();
    await page
      .getByRole('button', { name: /^Delete recording, / })
      .first()
      .click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete recording' }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0);
    await expect.poll(async () => (await liveCounts(page))['Recording deleted.'] ?? 0).toBe(1);
    await page.waitForTimeout(1_500);
    const counts = await liveCounts(page);
    expect(Object.entries(counts).filter(([, count]) => count > 1)).toStrictEqual([]);
  });

  test('전체 삭제 진행 — 상태가 바뀔 때만 1회씩 (폴링마다 재낭독 0) · 완료 Toast 1회', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await installLiveCounter(page);
    await logInToHome(page);
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Data & privacy' }).click();
    await page
      .getByRole('list', { name: 'Delete data' })
      .getByRole('button', { name: 'Delete all data' })
      .click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete all data' }).click();
    // received → processing → completed (5s 폴링) → 로컬 정리 → 온보딩 + Toast
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 30_000 });
    await expect.poll(async () => (await liveCounts(page))['Your data was deleted.'] ?? 0).toBe(1);
    await page.waitForTimeout(1_500);
    // 이 사건의 메시지만 본다 — 화면 이동마다 새로 뜨는 로딩 표시("Loading")는 별개의 사건이다
    const counts = Object.entries(await liveCounts(page)).filter(([text]) => /delet/i.test(text));
    expect(counts.some(([text]) => text.includes('deleting your data'))).toBe(true);
    expect(counts.filter(([, count]) => count > 1)).toStrictEqual([]);
  });
});
