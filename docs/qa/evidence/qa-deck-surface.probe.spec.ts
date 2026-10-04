/** QA probe — `S2-FIX-3`: 앞 카드 흰 면이 1겹인지 · 그림자 절단(overflow) 0건인지. */
import { expect, test } from '@playwright/test';

import { gotoApp } from '../../../e2e/support/gallery';

test('QA: deck front card surface layers', async ({ page }) => {
  await gotoApp(page, '/onboarding/reading-together');
  await page.getByRole('group', { name: 'Onboarding questions' }).waitFor();

  const info = await page.evaluate(() => {
    const front = document.querySelector('.haru-swipe-deck__card--front');
    if (front === null) return null;
    // 앞 카드와 그 자손 중 '배경을 칠하는' 요소 전부
    const painted: string[] = [];
    const walk = (el: Element, depth: number) => {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const bf = cs.backdropFilter;
      if ((bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') || (bf !== 'none' && bf !== '')) {
        const r = el.getBoundingClientRect();
        painted.push(
          `d${String(depth)} ${el.tagName}.${el.className.toString().slice(0, 48)} bg=${bg} backdrop=${bf} radius=${cs.borderRadius} pad=${cs.padding} shadow=${cs.boxShadow.slice(0, 40)} box=${String(Math.round(r.width))}x${String(Math.round(r.height))}`,
        );
      }
      for (const child of el.children) walk(child, depth + 1);
    };
    walk(front, 0);

    const deck = document.querySelector('.haru-swipe-deck');
    const overflowChain: string[] = [];
    let node: Element | null = deck;
    while (node !== null && node !== document.documentElement) {
      const cs = getComputedStyle(node);
      if (cs.overflow !== 'visible') {
        overflowChain.push(`${node.tagName}.${node.className.toString().slice(0, 40)} overflow=${cs.overflow}`);
      }
      node = node.parentElement;
    }

    const behind = document.querySelectorAll('.haru-swipe-deck__card--behind').length;
    const frontCs = getComputedStyle(front);
    return {
      painted,
      overflowChain,
      behindCount: behind,
      frontOwnBg: frontCs.backgroundColor,
      frontOwnPadding: frontCs.padding,
      frontOwnBackdrop: frontCs.backdropFilter,
    };
  });

  // eslint-disable-next-line no-console
  console.log('QA-DECKSURFACE ' + JSON.stringify(info, null, 2));
  expect(info).not.toBeNull();
});
