/** QA probe — 카드 단계 세로 스택 실측 (Figma `179:1770` 대조용). */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

test('QA: vertical stack @capability-items', async ({ page }) => {
  await gotoApp(page, '/onboarding/capability-items');
  await page.getByRole('group', { name: 'Onboarding questions' }).waitFor();
  const info = await page.evaluate(() => {
    const pick = (sel: string) => {
      const el = document.querySelector(sel);
      if (el === null) return null;
      const r = el.getBoundingClientRect();
      return { y: Math.round(r.y * 10) / 10, h: Math.round(r.height * 10) / 10, x: Math.round(r.x * 10) / 10, w: Math.round(r.width * 10) / 10 };
    };
    const front = document.querySelector('.haru-swipe-deck__card--front');
    const surface = front?.querySelector('.haru-surface');
    const sr = surface?.getBoundingClientRect();
    const counter = [...(surface?.querySelectorAll('*') ?? [])].find((e) =>
      /^\d+ \/ \d+$/.test((e.textContent ?? '').trim()),
    );
    const cr = counter?.getBoundingClientRect();
    const h2 = front?.querySelector('h2');
    const h2r = h2?.getBoundingClientRect();
    const clear = front?.querySelector('[aria-label="Clear this answer"]');
    const clr = clear?.getBoundingClientRect();
    const firstOpt = front?.querySelector('.haru-radio-group__option');
    const fo = firstOpt?.getBoundingClientRect();
    const eyebrow = [...(surface?.querySelectorAll('*') ?? [])].find((e) =>
      /IN THE PAST TWO WEEKS/.test((e.textContent ?? '').trim()),
    );
    const er = eyebrow?.getBoundingClientRect();
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      topBar: pick('.haru-top-bar'),
      h1: pick('.haru-top-bar h1'),
      progress: pick('.haru-progress-bar') ?? pick('[role="progressbar"]'),
      cardSurface: sr ? { y: Math.round(sr.y), h: Math.round(sr.height), x: Math.round(sr.x), w: Math.round(sr.width) } : null,
      counterRel: cr && sr ? { dx: Math.round(cr.x - sr.x), dy: Math.round(cr.y - sr.y) } : null,
      eyebrowRel: er && sr ? { dx: Math.round(er.x - sr.x), dy: Math.round(er.y - sr.y) } : null,
      h2Rel: h2r && sr ? { dx: Math.round(h2r.x - sr.x), dy: Math.round(h2r.y - sr.y), h: Math.round(h2r.height) } : null,
      firstOptRel: fo && sr ? { dx: Math.round(fo.x - sr.x), dy: Math.round(fo.y - sr.y) } : null,
      clearBtn: clr && sr ? { dx: Math.round(clr.x - sr.x), dy: Math.round(clr.y - sr.y), w: Math.round(clr.width), h: Math.round(clr.height), pos: getComputedStyle(clear as Element).position } : null,
      docH: Math.round(document.documentElement.scrollHeight),
    };
  });
  // eslint-disable-next-line no-console
  console.log('QA-VSTACK ' + JSON.stringify(info, null, 1));
  expect(info.cardSurface).not.toBeNull();
});
