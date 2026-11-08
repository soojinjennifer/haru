/**
 * Stage 4b QA 독립 프로브 (stage-qa-agent, 2026-11-05) — 구현자 e2e 와 별개로 QA 가 작성한 단정.
 * Product Code 수정 0. 실행: `pnpm exec playwright test -c docs/qa/evidence/stage-4b/qa-4b.config.ts`
 *
 * P1  AC-4-63 ① 서재 경로 — `mic-permission-blocked` → POST /v1/sessions body mode=conversation_only,
 *     책 id 가 granted(기본) 경로와 같다 (구현자 e2e 는 Home 경로만 브라우저로 본다)
 * P2  AC-4-129 — recording 닫기 → 확인 → abandoned 1건 → `/`
 * P3  AC-4-140 ⑤ (`D4-113`) — recording 세션의 `/complete` 클라이언트 진입 → 홈 replace · 전이 0
 * P4  Privacy — 전 흐름 동안 console 에 아이 이름(Nova)·uploadToken·OPFS 경로 0
 * P5  AC-4-55 — 팝업·Drawer 동안 navigator.vibrate · HTMLMediaElement.play 호출 0
 */
import { expect, test, type Page } from '@playwright/test';

import {
  logInToHome,
  requestOperations,
  requestPayloads,
  startSession,
} from '../../../../e2e/support/session';

async function startFromLibrary(page: Page, scenario?: string): Promise<Record<string, unknown>> {
  await logInToHome(page, scenario);
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Library' }).click();
  await expect(page.locator('.haru-library-shelves')).toBeVisible();
  await page.locator('.haru-shelf-item--pressable').first().click();
  const sheet = page.locator('.haru-sheet--inset-card');
  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: 'Start Session' }).click();
  await expect(page).toHaveURL(/\/session\/[0-9a-f-]+$/);
  const [created] = (await requestPayloads(page, 'POST /v1/sessions')) as Record<string, unknown>[];
  return created ?? {};
}

test.describe('QA-4B probe', () => {
  test('P1 AC-4-63 ① 서재 경로: blocked → conversation_only, 책 id 는 granted 와 같다', async ({
    browser,
  }) => {
    const granted = await browser.newPage();
    const g = await startFromLibrary(granted);
    await granted.close();
    const blocked = await browser.newPage();
    const b = await startFromLibrary(blocked, 'recorder:mic-permission-blocked');
    console.log('QA-P1', JSON.stringify({ granted: g, blocked: b }));
    expect(g['mode']).toBe('recorded');
    expect(b['mode']).toBe('conversation_only');
    expect(b['childBookId'] ?? null).toEqual(g['childBookId'] ?? null);
    expect(b['bookId'] ?? null).toEqual(g['bookId'] ?? null);
    expect(b['activityCardOptionId'] ?? null).toEqual(g['activityCardOptionId'] ?? null);
    await expect(blocked.getByRole('dialog', { name: 'Your microphone is off' })).toBeVisible();
    // 녹음·업로드 요청 0
    const ops = await requestOperations(blocked);
    expect(ops.filter((op) => op.includes('/recordings') || op.includes('upload'))).toEqual([]);
    await blocked.close();
  });

  test('P2 AC-4-129 recording 닫기 → 확인 → abandoned 1건 → /', async ({ page }) => {
    await startSession(page);
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.locator('.haru-record')).toHaveClass(/haru-record--recording/);
    await page.getByRole('button', { name: 'Close session' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    const before = (await requestOperations(page)).filter((op) => op.includes('/transitions'));
    await dialog.getByRole('button', { name: 'Discard', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    const transitions = (await requestPayloads(page, 'POST /v1/sessions/:sessionId/transitions')) as {
      to?: string;
    }[];
    console.log('QA-P2', JSON.stringify({ before, transitions }));
    expect(transitions.filter((t) => t.to === 'abandoned')).toHaveLength(1);
  });

  test('P3 AC-4-140 ⑤ recording 세션 /complete 클라이언트 진입 → 홈 replace · 전이 0', async ({
    page,
  }) => {
    const id = await startSession(page);
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.locator('.haru-record')).toHaveClass(/haru-record--recording/);
    const transitionsBefore = (await requestOperations(page)).filter((op) =>
      op.includes('/transitions'),
    ).length;
    const historyBefore = await page.evaluate(() => history.length);
    await page.evaluate((sid) => {
      history.pushState({}, '', `/session/${sid}/complete`);
      dispatchEvent(new PopStateEvent('popstate'));
    }, id);
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
    const transitionsAfter = (await requestOperations(page)).filter((op) =>
      op.includes('/transitions'),
    ).length;
    console.log(
      'QA-P3',
      JSON.stringify({ transitionsBefore, transitionsAfter, historyBefore, after: await page.evaluate(() => history.length) }),
    );
    expect(transitionsAfter).toBe(transitionsBefore);
    await expect(page.locator('.haru-session-complete')).toHaveCount(0);
  });

  test('P4 Privacy · P5 무음: 전 흐름 console PII 0 · vibrate/play 0', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (m) => messages.push(m.text()));
    await page.addInitScript(() => {
      const w = window as unknown as { __qaCalls: string[] };
      w.__qaCalls = [];
      if ('vibrate' in navigator) {
        navigator.vibrate = () => {
          w.__qaCalls.push('vibrate');
          return true;
        };
      }
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
        w.__qaCalls.push('play');
        return play.call(this);
      };
    });
    await startSession(page);
    await page.getByRole('button', { name: 'Start recording' }).click();
    await page.getByRole('button', { name: 'Prompts', exact: true }).click();
    await page.getByRole('button', { name: 'See all prompts' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page).toHaveURL(/\/complete$/);
    await page.waitForTimeout(1500);
    const calls = await page.evaluate(() => (window as unknown as { __qaCalls: string[] }).__qaCalls);
    const leaks = messages.filter((m) => /Nova|uploadToken|opfs|indexeddb|transcript/i.test(m));
    console.log('QA-P4', JSON.stringify({ consoleCount: messages.length, leaks, calls }));
    expect(leaks).toEqual([]);
    expect(calls).toEqual([]);
  });
  for (const vp of [
    { width: 320, height: 568 },
    { width: 320, height: 852 },
    { width: 1024, height: 500 },
  ]) {
    test(`P6 AC-4-99 클래식 스크롤바(15px 강제) ${vp.width}x${vp.height} — 가로 넘침 · 컬럼 중심`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = '::-webkit-scrollbar{width:15px;height:15px;background:#ccc}';
        document.documentElement.appendChild(style);
      });
      await startSession(page);
      const m = await page.evaluate(() => {
        const out: Record<string, unknown> = {
          docScrollW: document.documentElement.scrollWidth,
          docClientW: document.documentElement.clientWidth,
          innerW: innerWidth,
        };
        const boxes = [...document.querySelectorAll<HTMLElement>('*')].filter((el) => {
          const cs = getComputedStyle(el);
          return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1;
        });
        out['scrollers'] = boxes.map((el) => ({
          cls: el.className.toString().slice(0, 60),
          clientW: el.clientWidth,
          scrollW: el.scrollWidth,
          offsetW: el.offsetWidth,
        }));
        const record = document.querySelector('.haru-record')?.getBoundingClientRect();
        out['recordCenterX'] = record ? record.left + record.width / 2 : null;
        return out;
      });
      console.log('QA-P6', JSON.stringify({ vp, m }));
      expect(m['docScrollW']).toBeLessThanOrEqual(m['docClientW'] as number);
      for (const s of m['scrollers'] as { scrollW: number; clientW: number }[]) {
        expect(s.scrollW, 'scroller horizontal overflow').toBeLessThanOrEqual(s.clientW);
      }
    });
  }
  async function homeStartWith(page: Page, scenario: string): Promise<void> {
    await logInToHome(page, scenario);
    await page
      .locator('.haru-activity-card-flip__face--front')
      .first()
      .getByRole('button', { name: 'Start Session' })
      .click();
    const sheet = page.getByRole('dialog', { name: 'When will you read?' });
    await sheet.getByText('Bedtime', { exact: true }).click();
    await sheet.getByRole('button', { name: 'Continue' }).click();
  }

  test('P7 AC-4-35 화면 — session-already-active: 진행 중 세션 복귀 경로 관찰', async ({ page }) => {
    await homeStartWith(page, 'sessions:session-already-active');
    await page.waitForTimeout(3000);
    const url = page.url();
    const alerts = await page.locator('[role="alert"], .haru-toast').allTextContents();
    const buttons = await page.getByRole('button').allTextContents();
    console.log('QA-P7', JSON.stringify({ url, alerts, buttons: buttons.filter(Boolean).slice(0, 30), ops: await requestOperations(page) }));
    await page.screenshot({ path: '/Users/soojin/dev/haru/docs/qa/evidence/stage-4b/qa-p7-already-active.png' });
    // 복귀 경로 = /session/<MOCK_ACTIVE_SESSION_ID> 로 가거나, 그곳으로 가는 버튼이 있어야 한다 (AC-4-35)
    const hasPath =
      /\/session\/[0-9a-f-]+/.test(url) || buttons.some((b) => /(continue|resume|open|go to).*(storytime|session)/i.test(b)); // 'Continue'(Reading Context 시트 버튼) 단독은 제외
    expect(hasPath, 'in-progress session return path').toBe(true);
  });

  test('P8 AC-4-36 화면 — onboarding-incomplete: Route Guard → /onboarding', async ({ page }) => {
    await homeStartWith(page, 'sessions:onboarding-incomplete');
    await page.waitForTimeout(3000);
    const url = page.url();
    const alerts = await page.locator('[role="alert"], .haru-toast').allTextContents();
    console.log('QA-P8', JSON.stringify({ url, alerts, ops: await requestOperations(page) }));
    await page.screenshot({ path: '/Users/soojin/dev/haru/docs/qa/evidence/stage-4b/qa-p8-onboarding-incomplete.png' });
    expect(url).toMatch(/\/onboarding/);
  });

  test('P9 AC-4-25 · 22 화면 — sessions:retry / loading 관찰', async ({ page }) => {
    await homeStartWith(page, 'sessions.create:retry');
    await page.waitForTimeout(2000);
    const sheet = page.getByRole('dialog', { name: 'When will you read?' });
    const sheetVisible = await sheet.isVisible();
    const checked = sheetVisible
      ? await sheet.getByRole('radio', { checked: true }).allTextContents()
      : [];
    const alerts = await page.locator('[role="alert"], .haru-toast').allTextContents();
    console.log('QA-P9a', JSON.stringify({ url: page.url(), sheetVisible, checked, alerts }));
    if (sheetVisible) {
      await sheet.getByRole('button', { name: 'Continue' }).click();
      await expect(page).toHaveURL(/\/session\/[0-9a-f-]+$/, { timeout: 10_000 });
    }
    const creates = await requestPayloads(page, 'POST /v1/sessions');
    console.log('QA-P9b', JSON.stringify({ url: page.url(), creates: creates.length }));
    expect(page.url()).toMatch(/\/session\/[0-9a-f-]+$/);
  });
  test('P10 AC-4-22 화면 — sessions:loading: 생성 지연 중 확인 버튼 loading · 세션 조회 지연 중 Spinner', async ({
    page,
  }) => {
    await logInToHome(page, 'sessions:loading');
    await page
      .locator('.haru-activity-card-flip__face--front')
      .first()
      .getByRole('button', { name: 'Start Session' })
      .click();
    const sheet = page.getByRole('dialog', { name: 'When will you read?' });
    await sheet.getByText('Bedtime', { exact: true }).click();
    await sheet.getByRole('button', { name: 'Continue' }).click();
    const busySeen = await page
      .waitForFunction(() => document.querySelector('[aria-busy="true"]') !== null, null, { timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    const spinnerSeen = await page
      .waitForFunction(() => document.querySelector('.haru-spinner') !== null, null, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    await expect(page.getByRole('button', { name: 'Start recording' })).toBeVisible({ timeout: 20_000 });
    console.log('QA-P10', JSON.stringify({ busySeen, spinnerSeen, url: page.url() }));
    expect(busySeen).toBe(true);
  });
  for (const waitOnLogin of [true, false]) {
    test(`P11 flake 재현 — 48h Toast 가 로그인 화면에서 먼저 뜬 경우(${waitOnLogin}) recording 중 지속 시간`, async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await page.addInitScript(() => {
        const store = globalThis as unknown as { __qaToast: { text: string; path: string; from: number; to: number | null }[] };
        store.__qaToast = [];
        let current: string | null = null;
        const sample = (): void => {
          const node = document.querySelector('.haru-toast');
          const text = node?.textContent ?? null;
          const id = node === null ? null : `${text}#${(node as HTMLElement).dataset['qaId'] ?? ''}`;
          if (node !== null && (node as HTMLElement).dataset['qaId'] === undefined) {
            (node as HTMLElement).dataset['qaId'] = String(performance.now() | 0);
          }
          const key = node === null ? null : `${text}@${(node as HTMLElement).dataset['qaId']}`;
          if (key === current) return;
          const now = performance.now();
          const open = store.__qaToast.at(-1);
          if (open !== undefined && open.to === null) open.to = now;
          if (key !== null) store.__qaToast.push({ text: key, path: location.pathname, from: now, to: null });
          current = key;
          void id;
        };
        new MutationObserver(sample).observe(document, { subtree: true, childList: true, characterData: true });
      });
      const query = `?scenario=${encodeURIComponent('recorder:crash-recovered,recordings:upload-stalled-48h')}`;
      await page.goto(`/auth/log-in${query}`);
      if (waitOnLogin) {
        await expect(page.locator('.haru-toast')).toBeVisible({ timeout: 10_000 });
      }
      await page.getByLabel('Email').fill('sam@example.com');
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
      await page.getByRole('button', { name: 'Log in', exact: true }).click();
      await expect(page.locator('.haru-activity-track:not(.haru-activity-track--skeleton)')).toBeVisible();
      await page.locator('.haru-activity-card-flip__face--front').first().getByRole('button', { name: 'Start Session' }).click();
      const sheet = page.getByRole('dialog', { name: 'When will you read?' });
      await sheet.getByText('Bedtime', { exact: true }).click();
      await sheet.getByRole('button', { name: 'Continue' }).click();
      await expect(page.getByRole('button', { name: 'Start recording' })).toBeVisible();
      const recStart = await page.evaluate(() => performance.now());
      await page.getByRole('button', { name: 'Start recording' }).click();
      await page.waitForTimeout(12_000);
      const log = await page.evaluate(() => (globalThis as unknown as { __qaToast: unknown[] }).__qaToast);
      console.log('QA-P11', JSON.stringify({ waitOnLogin, recStart, log }));
      const visibleAfter = await page.locator('.haru-toast').count();
      expect(visibleAfter, 'Toast still visible 12s after recording start').toBe(0);
    });
  }
  test('P12 Submit 후 완료 화면 Toast 수명 — 심장박동(setInterval 250ms)으로 타이머 기아 여부 구분', async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript(() => {
      const w = globalThis as unknown as { __qa: { beats: number[]; toast: { key: string; from: number; to: number | null }[]; vis: string[] } };
      w.__qa = { beats: [], toast: [], vis: [] };
      setInterval(() => w.__qa.beats.push(performance.now() | 0), 250);
      const raf = (): void => { (w.__qa as unknown as { rafs?: number[] }).rafs ??= []; (w.__qa as unknown as { rafs: number[] }).rafs.push(performance.now() | 0); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      const chain = (): void => { (w.__qa as unknown as { mc?: number[] }).mc ??= []; (w.__qa as unknown as { mc: number[] }).mc.push(performance.now() | 0); setTimeout(chain, 0); };
      void chain;
      document.addEventListener('visibilitychange', () => w.__qa.vis.push(`${performance.now() | 0}:${document.visibilityState}`));
      let current: string | null = null;
      let seq = 0;
      const sample = (): void => {
        const node = document.querySelector<HTMLElement>('.haru-toast');
        if (node !== null && node.dataset['qaId'] === undefined) node.dataset['qaId'] = String((seq += 1));
        const key = node === null ? null : `${node.textContent ?? ''}#${node.dataset['qaId'] ?? ''}#${node.className}`;
        if (key === current) return;
        const now = performance.now() | 0;
        const open = w.__qa.toast.at(-1);
        if (open !== undefined && open.to === null) open.to = now;
        if (key !== null) w.__qa.toast.push({ key, from: now, to: null });
        current = key;
      };
      new MutationObserver(sample).observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });
      const q2 = w.__qa as unknown as { muts: number; mutsAt: number[]; lt: string[] };
      q2.muts = 0; q2.mutsAt = []; q2.lt = [];
      new MutationObserver((recs) => { q2.muts += recs.length; if (q2.mutsAt.length < 2000) q2.mutsAt.push(performance.now() | 0); }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true });
      try { new PerformanceObserver((list) => { for (const e of list.getEntries()) q2.lt.push(`${e.startTime | 0}+${e.duration | 0}`); }).observe({ type: 'longtask', buffered: true }); } catch { /* */ }
    });
    await startSession(page);
    await page.getByRole('button', { name: 'Start recording' }).click();
    await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
    const submitAt = await page.evaluate(() => performance.now() | 0);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page).toHaveURL(/\/complete$/);
    await page.waitForTimeout(9_000);
    const qa = await page.evaluate(() => { const q = (globalThis as unknown as { __qa: { beats: number[]; toast: unknown[]; vis: string[]; rafs?: number[] } }).__qa; const q3 = q as unknown as { muts: number; mutsAt: number[]; lt: string[] }; return { ...q, rafs: undefined, muts: q3.muts, mutsTail: q3.mutsAt.slice(-15), lt: q3.lt, rafCount: q.rafs?.length ?? 0, lastRaf: q.rafs?.at(-1) ?? null, now: performance.now() | 0, hidden: document.hidden, anims: document.getAnimations().map((a) => `${(a as CSSAnimation).animationName ?? a.constructor.name}:${a.playState}:${(a.effect as KeyframeEffect | null)?.target instanceof Element ? ((a.effect as KeyframeEffect).target as Element).className.toString().slice(0, 40) : ''}`) }; });
    const gaps = qa.beats.slice(1).map((b, i) => b - (qa.beats[i] ?? b));
    const maxGap = Math.max(...gaps);
    const still = await page.locator('.haru-toast').count();
    console.log('QA-P12', JSON.stringify({ muts: (qa as unknown as { muts: number }).muts, mutsTail: (qa as unknown as { mutsTail: number[] }).mutsTail, lt: (qa as unknown as { lt: string[] }).lt, submitAt, maxGap, beats: qa.beats.length, lastBeat: qa.beats.at(-1), now: qa.now, rafCount: qa.rafCount, lastRaf: qa.lastRaf, hidden: qa.hidden, anims: qa.anims, vis: qa.vis, toast: qa.toast, still }));
    expect(still, 'Toast still present 9s after Submit').toBe(0);
  });
});
