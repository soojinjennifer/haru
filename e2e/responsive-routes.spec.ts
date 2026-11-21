/**
 * Stage 8 `S8-H` — 전 route 반응형 (AC-8-56 · AC-8-57 · AC-8-95, Plan §11.12 · Spec §8.2).
 *
 * 대상 = Plan §12.4 route × 대표 상태 — 접근성 감사와 **같은 정류장 목록**(`support/a11y-stops.ts`, 49 개 ·
 * 시트 · 다이얼로그는 부모 route 에서 열린 상태)을 쓴다. 정류장을 393×852 에서 한 번 열고, 같은 화면에서
 * 뷰포트만 바꿔 가며 잰다(새로고침은 Mock 인증을 지운다 — `a11y-stops` 머리말).
 *
 * 폭마다 보는 것:
 *   ① 가로 넘침 0 — 문서(`documentElement`) · 앱 스크롤 박스(`[data-app-shell-viewport]`) 둘 다 `scrollWidth ≤ clientWidth`
 *   ② 앱 컬럼 폭 = min(스크롤 박스 clientWidth, 480) · 가운데(±0.5)
 *   ③ 다단 0 — 보이는 글자 · 컨트롤이 전부 앱 컬럼 가로 범위 안에 있다 (600 · 1024 · 852 에서 컬럼 밖 콘텐츠 0)
 * 가로 웹 852×393 (AC-8-95) 은 추가로:
 *   ④ 하단 고정 요소(TabBar · 버튼 바 · 시트 바닥 버튼)가 콘텐츠를 가려 기능을 막지 않는다 — 정류장의 인터랙티브
 *      요소마다 `scrollIntoView` 후 중심점을 그 요소가 받는다 (세로 스크롤로 도달 가능)
 *
 * 클래식 스크롤바(15px) 환경은 `scrollbar-classic.spec.ts` 가 같은 정류장으로 본다.
 */
import { expect, test, type Page } from '@playwright/test';

import { A11Y_STOPS } from './support/a11y-stops';
import { hideDevPanel, settle } from './support/gallery';

const WIDTHS = [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 800 },
  { width: 1024, height: 768 },
] as const;

const LANDSCAPE = { width: 852, height: 393 } as const;

const COLUMN_MAX = 480;

interface LayoutProbe {
  readonly docOverflowX: number;
  readonly boxOverflowX: number;
  readonly boxClientWidth: number;
  readonly columnWidth: number;
  readonly columnCenterOffset: number;
  /** 앱 컬럼 가로 범위 밖에 그려진 글자 · 컨트롤. */
  readonly outside: string[];
}

async function probeLayout(page: Page): Promise<LayoutProbe> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const box = document.querySelector<HTMLElement>('[data-app-shell-viewport]');
    const column =
      box?.querySelector<HTMLElement>('.haru-app-column') ??
      document.querySelector<HTMLElement>('.haru-app-column');
    if (column === null) throw new Error('app column not found');
    const columnRect = column.getBoundingClientRect();
    const boxRect = box?.getBoundingClientRect() ?? root.getBoundingClientRect();
    const boxClientWidth = box?.clientWidth ?? root.clientWidth;
    const boxLeft = boxRect.left + (box?.clientLeft ?? 0);

    const visible = (element: Element): boolean => {
      if (element.closest('.haru-dev-panel, [hidden], [aria-hidden="true"]') !== null) return false;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    // 글자를 직접 가진 요소 + 컨트롤 — 장식 배경(scrim · 앱 그래디언트)은 다단 판정 대상이 아니다
    const candidates = [...document.querySelectorAll('body *')].filter((element) => {
      if (!visible(element)) return false;
      if (element.matches('a, button, input, select, textarea, [role="button"], [role="radio"]')) {
        return true;
      }
      return [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
      );
    });
    const outside: string[] = [];
    for (const element of candidates) {
      // 시각 숨김(1px clip) 텍스트는 그려지지 않는다
      if (element.closest('.haru-visually-hidden') !== null) continue;
      const rect = element.getBoundingClientRect();
      // 그려지는 가로 범위 = 요소 상자 ∩ 가로를 자르는 조상(가로 트랙 · 스크롤 박스)들의 상자.
      // 가로 트랙(서재 선반 · Activity Card)의 화면 밖 아이템은 잘려 보이지 않는다 — 보이는 부분만 본다.
      let left = rect.left;
      let right = rect.right;
      for (let node = element.parentElement; node !== null; node = node.parentElement) {
        if (node === root || node === document.body) break;
        if (getComputedStyle(node).overflowX !== 'visible') {
          const clip = node.getBoundingClientRect();
          left = Math.max(left, clip.left);
          right = Math.min(right, clip.right);
        }
      }
      if (right - left <= 0.5) continue;
      // 세로 위치는 보지 않는다 — 세로 스크롤로 밀려난 것은 가로 판정과 무관
      if (left < columnRect.left - 0.5 || right > columnRect.right + 0.5) {
        const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
        outside.push(
          `${element.tagName.toLowerCase()}.${String(element.className).split(' ')[0] ?? ''} "${text}" ${left.toFixed(1)}–${right.toFixed(1)}`,
        );
      }
    }
    return {
      docOverflowX: root.scrollWidth - root.clientWidth,
      boxOverflowX: box === null ? 0 : box.scrollWidth - box.clientWidth,
      boxClientWidth,
      columnWidth: columnRect.width,
      columnCenterOffset: columnRect.left + columnRect.width / 2 - (boxLeft + boxClientWidth / 2),
      outside: outside.slice(0, 20),
    };
  });
}

function expectLayout(probe: LayoutProbe, label: string): void {
  expect.soft(probe.docOverflowX, `${label} — 문서 가로 넘침`).toBeLessThanOrEqual(0);
  expect.soft(probe.boxOverflowX, `${label} — 앱 스크롤 박스 가로 넘침`).toBeLessThanOrEqual(0);
  expect
    .soft(
      Math.abs(probe.columnWidth - Math.min(probe.boxClientWidth, COLUMN_MAX)),
      `${label} — 앱 컬럼 폭 = min(clientWidth, 480) (${probe.columnWidth.toFixed(1)})`,
    )
    .toBeLessThanOrEqual(0.5);
  expect
    .soft(Math.abs(probe.columnCenterOffset), `${label} — 앱 컬럼 가운데`)
    .toBeLessThanOrEqual(0.5);
  expect.soft(probe.outside, `${label} — 앱 컬럼 밖 콘텐츠 (다단 0)`).toStrictEqual([]);
}

/**
 * ④ 가로 웹에서 하단 고정 요소가 기능을 막지 않는다 — 인터랙티브마다 스크롤로 가져와 중심점이 그 요소에 닿는가.
 * 모달이 열려 있으면 모달 안만 본다(배경은 scrim 아래).
 */
async function unreachable(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const SELECTOR = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[role="radio"]',
      '[role="checkbox"]',
      '[role="switch"]',
      '[role="tab"]',
    ].join(',');
    const frame = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    const modal = document.querySelector('[aria-modal="true"]');
    const scope: ParentNode = modal ?? document;
    const column = document.querySelector('.haru-app-column')?.getBoundingClientRect();
    const elements = [...scope.querySelectorAll<HTMLElement>(SELECTOR)].filter((element) => {
      if (element.closest('.haru-dev-panel, [inert], [aria-hidden="true"], [hidden]') !== null) {
        return false;
      }
      if (element.closest('.haru-visually-hidden') !== null) return false;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
      if (element instanceof HTMLInputElement && element.type === 'hidden') return false;
      // 비활성 컨트롤은 누를 대상이 아니다 (예: 빈 양식의 *Add to library* — `pointer-events: none`)
      if ((element as HTMLButtonElement).disabled === true) return false;
      if (element.getAttribute('aria-disabled') === 'true') return false;
      if (style.pointerEvents === 'none') return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1;
    });
    // label 안 input 등 — 안쪽(실제로 눌리는 상자) 하나만
    const leaves = elements.filter(
      (element) => !elements.some((other) => other !== element && element.contains(other)),
    );
    const misses: string[] = [];
    for (const element of leaves) {
      // 시각 숨김 native input (Checkbox · Radio) 은 label 이 받는다
      const target =
        element instanceof HTMLInputElement &&
        (element.type === 'checkbox' || element.type === 'radio') &&
        element.closest('label') !== null
          ? (element.closest('label') as HTMLElement)
          : element;
      // 가로 트랙 안 아이템은 가로 스크롤로 가져온다 — 세로 축만 보는 이 판정의 대상이 아니다
      target.scrollIntoView({ block: 'center', inline: 'nearest' });
      await frame();
      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      // 가로 트랙의 다른 페이지(컬럼 밖)는 트랙 자체의 넘김으로 가져온다 — 세로 축 판정 대상이 아니다
      if (x < 0 || x >= innerWidth) continue;
      if (column !== undefined && (x < column.left || x > column.right)) continue;
      const hit = document.elementFromPoint(x, y);
      const owned =
        hit !== null &&
        (target === hit ||
          target.contains(hit) ||
          (hit.closest('label') !== null && hit.closest('label')?.contains(element) === true));
      if (!owned) {
        const name = (element.getAttribute('aria-label') ?? element.textContent ?? element.tagName)
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 40);
        misses.push(
          `${name} @y${y.toFixed(0)} → ${hit === null ? 'none' : `${hit.tagName.toLowerCase()}.${String(hit.className).split(' ')[0] ?? ''}`}`,
        );
      }
    }
    return misses;
  });
}

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

test.describe('S8-H 전 route 반응형 — 320 · 393 · 600 · 1024 + 가로 웹 852×393 (AC-8-56 · 57 · 95)', () => {
  for (const stop of A11Y_STOPS) {
    test(`${stop.id} — ${stop.route}`, async ({ page }) => {
      test.setTimeout(120_000);
      await stop.open(page);
      for (const size of [...WIDTHS, LANDSCAPE]) {
        await page.setViewportSize(size);
        await settle(page);
        const label = `${String(size.width)}×${String(size.height)}`;
        expectLayout(await probeLayout(page), label);
      }
      // AC-8-95 ④ — 가로 웹(뷰포트가 LANDSCAPE 로 남아 있다)
      expect
        .soft(await unreachable(page), '852×393 — 스크롤로 도달해도 가려져 누를 수 없는 요소')
        .toStrictEqual([]);
    });
  }
});
