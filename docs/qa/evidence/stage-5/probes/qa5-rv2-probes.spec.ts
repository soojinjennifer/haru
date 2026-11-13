/**
 * Stage 5 QA 재검증 2회차 프로브 (stage-qa-agent, 2026-11-11). 제품·e2e 코드를 수정하지 않는다.
 *  P-T  D5-14 · D5-15 — 320/393/600/1024 ×852: fixture 이름 Emma · 제목 computed (break-word · 2줄 clamp) ·
 *       이름 ≤ 40자 9종 주입 → 세로/가로 넘침 · 줄 수 · clamp 여부 · 접근성 이름 + 40자 카드 스크린샷
 *  P-G  카드 아래 여백 12 — 320×568 · 393×667 스크롤 끝에서 뷰포트 bottom − 카드 bottom
 *  P-F  393/600/1024 ×852: (A) 현재 · (B) H5-8 이전 CSS(29 · clamp 없음 · break-word 없음) 주입 · (C) 제목만 Nova
 *       A↔B diff = H5-8 CSS 의 가시 영향 · A↔C diff 연결성분 = 이름 영향 · 393: 저장소 baseline ↔ A · ↔ C
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel } from '../../../../../e2e/support/gallery';
import { decodePng, type Bitmap } from '../../../../../e2e/support/pixels';
import { settleImages, startSession } from '../../../../../e2e/support/session';

const RESULTS = '/Users/soojin/dev/haru/docs/qa/evidence/stage-5/probes/results-rv2';
mkdirSync(RESULTS, { recursive: true });
const save = (name: string, data: unknown) =>
  writeFileSync(`${RESULTS}/${name}.json`, JSON.stringify(data, null, 2));
const BASELINE =
  '/Users/soojin/dev/haru/e2e/__screenshots__/darwin/session-complete.spec.ts/s4-session-complete.png';

const VIEWPORT = '[data-app-shell-viewport]';
const title = (name: string) => `How was storytime with ${name}?`;

const NAMES: Record<string, string> = {
  emma: 'Emma',
  sebastian: 'Sebastian',
  anastasiaRose: 'Anastasia-Rose',
  multi19: 'Mary Elizabeth Anne',
  multi40: 'Wwwwwwwww Wwwwwwwww Wwwwwwwww Wwwwwwwwww',
  mixed40: 'Maximiliana Josephine Catherine Beaumont',
  oneword31: 'Abcdefghijklmnopqrstuvwxyzabcde',
  w40: 'W'.repeat(40),
  m40: 'M'.repeat(40),
};

const OLD_CSS = `:root{--reflection-card-bottom-gap:29px !important}
.haru-reflection-card__title{display:block !important;overflow:visible !important;-webkit-line-clamp:unset !important;line-clamp:none !important;overflow-wrap:normal !important}`;

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

async function toComplete(page: Page, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  await startSession(page);
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('heading', { name: 'Session Complete' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Recording submitted' })).toHaveCount(0, {
    timeout: 8_000,
  });
  await settleImages(page);
}

async function measure(page: Page, next: string | null) {
  return page.evaluate(
    async ({ viewport, next }) => {
      const shell = document.querySelector(viewport)!;
      const card = document.querySelector('.haru-reflection-card')!;
      const t = document.querySelector<HTMLElement>('.haru-reflection-card__title')!;
      if (next !== null) t.textContent = next;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const cs = getComputedStyle(t);
      const tr = t.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      const bubble = document.querySelector('.haru-session-bubble--complete .haru-bubble');
      return {
        text: t.textContent,
        bubble: bubble?.textContent ?? null,
        overflowY: shell.scrollHeight - shell.clientHeight,
        overflowX: shell.scrollWidth - shell.clientWidth,
        docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        titleHeight: tr.height,
        lines: Math.round(tr.height / 20),
        clamped: t.scrollHeight > t.clientHeight + 1,
        titleScrollX: t.scrollWidth - t.clientWidth,
        titleInsideCard: tr.left >= cr.left && tr.right <= cr.right,
        cardTop: cr.top,
        cardBottom: cr.bottom,
        computed: {
          overflowWrap: cs.overflowWrap,
          display: cs.display,
          lineClamp: cs.getPropertyValue('-webkit-line-clamp'),
          overflow: `${cs.overflowX}/${cs.overflowY}`,
          textOverflow: cs.textOverflow,
          bottomGap: getComputedStyle(card).marginBottom,
        },
      };
    },
    { viewport: VIEWPORT, next },
  );
}

for (const width of [320, 393, 600, 1024] as const) {
  test(`P-T ${String(width)}×852`, async ({ page }) => {
    await toComplete(page, width, 852);
    const out: Record<string, unknown> = { fixture: await measure(page, null) };
    for (const [key, name] of Object.entries(NAMES)) {
      const m = await measure(page, title(name));
      const accessible = await page.getByRole('region', { name: title(name) }).count();
      out[key] = { ...m, chars: name.length, regionByFullName: accessible };
      if (key === 'w40' || key === 'multi40' || key === 'emma') {
        await page
          .locator('.haru-reflection-card')
          .screenshot({ path: `${RESULTS}/P-T-${String(width)}-${key}-card.png`, animations: 'disabled' });
      }
    }
    save(`P-T-${String(width)}`, out);
  });
}

for (const [width, height] of [
  [320, 568],
  [393, 667],
] as const) {
  test(`P-G ${String(width)}×${String(height)}`, async ({ page }) => {
    await toComplete(page, width, height);
    const r = await page.evaluate(async (viewport) => {
      const shell = document.querySelector(viewport)!;
      shell.scrollTop = shell.scrollHeight;
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      const card = document.querySelector('.haru-reflection-card')!.getBoundingClientRect();
      const sr = shell.getBoundingClientRect();
      return { gap: sr.bottom - card.bottom, scrollTop: shell.scrollTop };
    }, VIEWPORT);
    save(`P-G-${String(width)}x${String(height)}`, r);
  });
}

/* ---------- pixel diff + connected components ---------- */
function diff(a: Bitmap, b: Bitmap, min = 1) {
  if (a.width !== b.width || a.height !== b.height) return { sizeMismatch: true };
  const w = a.width;
  const h = a.height;
  const mask = new Uint8Array(w * h);
  let count = 0;
  let maxDelta = 0;
  for (let i = 0; i < w * h; i++) {
    const d = Math.max(
      Math.abs(a.data[i * 4] - b.data[i * 4]),
      Math.abs(a.data[i * 4 + 1] - b.data[i * 4 + 1]),
      Math.abs(a.data[i * 4 + 2] - b.data[i * 4 + 2]),
    );
    if (d >= min) {
      mask[i] = 1;
      count++;
      maxDelta = Math.max(maxDelta, d);
    }
  }
  const seen = new Uint8Array(w * h);
  const clusters: { px: number; x0: number; x1: number; y0: number; y1: number }[] = [];
  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || seen[i]) continue;
    const c = { px: 0, x0: w, x1: 0, y0: h, y1: 0 };
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const p = stack.pop()!;
      const x = p % w;
      const y = (p - x) / w;
      c.px++;
      c.x0 = Math.min(c.x0, x);
      c.x1 = Math.max(c.x1, x);
      c.y0 = Math.min(c.y0, y);
      c.y1 = Math.max(c.y1, y);
      // 3px 반경 연결 (글자 사이 간격을 한 덩어리로)
      for (let dy = -3; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = ny * w + nx;
          if (mask[q] && !seen[q]) {
            seen[q] = 1;
            stack.push(q);
          }
        }
    }
    clusters.push(c);
  }
  return { count, maxDelta, clusters };
}

for (const width of [393, 600, 1024] as const) {
  test(`P-F ${String(width)}×852`, async ({ page }) => {
    await toComplete(page, width, 852);
    const shot = async () => decodePng(await page.screenshot({ animations: 'disabled', caret: 'hide' }));
    const A = await shot();
    const A2 = await shot();
    const style = await page.addStyleTag({ content: OLD_CSS });
    const oldComputed = await measure(page, null);
    const B = await shot();
    await style.evaluate((el) => el.remove());
    await measure(page, title('Nova'));
    const C = await shot();
    await page.screenshot({ path: `${RESULTS}/P-F-${String(width)}-nova.png` });
    const out: Record<string, unknown> = {
      noise_A_A2: diff(A, A2),
      oldCssApplied: oldComputed.computed,
      A_vs_oldCss: diff(A, B),
      A_vs_nova: diff(A, C),
    };
    if (width === 393) {
      const base = decodePng(readFileSync(BASELINE));
      out.baseline_vs_A = diff(base, A);
      out.baseline_vs_A_ge6 = diff(base, A, 6);
      out.baseline_vs_nova = diff(base, C);
    }
    save(`P-F-${String(width)}`, out);
  });
}

/* 대조군: 아무 효과 없는 style 태그 삽입·제거, 제목 텍스트를 같은 값으로 재설정 — 재래스터화 노이즈 확인 */
test('P-N 393×852 no-op mutation control', async ({ page }) => {
  await toComplete(page, 393, 852);
  const shot = async () => decodePng(await page.screenshot({ animations: 'disabled', caret: 'hide' }));
  const A = await shot();
  const s = await page.addStyleTag({ content: '.qa-noop{color:red}' });
  const B = await shot();
  await s.evaluate((el) => el.remove());
  await measure(page, title('Emma'));
  const C = await shot();
  save('P-N-393', { A_vs_noopStyle: diff(A, B), A_vs_sameText: diff(A, C), A_vs_sameText_ge6: diff(A, C, 6) });
});

/* 대조군 2: H5-8 이전 CSS 를 넣었다가 빼고(최종 상태 = A 와 같은 CSS · 같은 이름) 다시 찍는다 — 레이아웃 무효화 재래스터 노이즈 */
test('P-N2 393×852 old-css round trip control', async ({ page }) => {
  await toComplete(page, 393, 852);
  const shot = async () => decodePng(await page.screenshot({ animations: 'disabled', caret: 'hide' }));
  const A = await shot();
  const s = await page.addStyleTag({ content: OLD_CSS });
  await measure(page, null);
  await s.evaluate((el) => el.remove());
  await measure(page, null);
  const R = await shot();
  const s2 = await page.addStyleTag({ content: OLD_CSS });
  const B2 = await measure(page, null);
  const B = await shot();
  await s2.evaluate((el) => el.remove());
  save('P-N2-393', { A_vs_roundTrip: diff(A, R), roundTrip_vs_oldCss: diff(R, B), oldCss: B2.computed });
});
