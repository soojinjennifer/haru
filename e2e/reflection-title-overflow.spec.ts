/**
 * Stage 5 `D5-14` · `D5-15` — 회고 카드 제목 길이와 완료 화면 세로 넘침 (Spec §13 Addendum, 옵션 2).
 *
 * - 320 / 393 / 600 / 1024 × 852 에서 `child.firstName` ≤ 40자(`CHILD_NAME_MAX_LENGTH`)이면 세로 넘침 0 (AC-4-99 개정안).
 * - 제목은 최대 2줄(`AD-S5-4`) · 가로로 잘리지 않는다(Figma `91:692` `word-break: break-word` 복원).
 * - 접근성 이름은 전체 문자열 그대로다 (clamp 는 시각만 자른다).
 *
 * 이름 주입: 실제 완료 화면이 settle 된 뒤 `h2` 텍스트 노드만 교체하고 두 프레임 뒤에 잰다 (Spec §13.1 `[run]` 과
 * 같은 방법). Mock 기본 이름(`Emma`)은 fixture 그대로의 렌더로 먼저 잰다.
 */
import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel, settle } from './support/gallery';
import { settleImages, startSession } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

const VIEWPORT = '[data-app-shell-viewport]';
const CARD = '.haru-reflection-card';
const TITLE = '.haru-reflection-card__title';
/** `--reflection-card-title-line` (`91:692` Bold 17 / 20) */
const LINE = 20;
/** `packages/contracts` `CHILD_NAME_MAX_LENGTH` — e2e 는 workspace 패키지를 import 하지 않는다 (다른 spec 과 같다). */
const CHILD_NAME_MAX_LENGTH = 40;
const title = (name: string) => `How was storytime with ${name}?`;

const NAMES: readonly string[] = [
  'Nova',
  'Emma',
  'Sebastian',
  'Maximiliana',
  'Abcdefghijklmnopqrstuvwxyzabcde', // 공백 없는 31자 한 단어
  'W'.repeat(CHILD_NAME_MAX_LENGTH), // contract 최대 40자 · 측정한 최악 폭
];

interface TitleProbe {
  overflowY: number;
  overflowX: number;
  titleHeight: number;
  titleScrollX: number;
  titleLeft: number;
  titleRight: number;
  cardLeft: number;
  cardRight: number;
  text: string;
}

async function probe(page: Page, name: string | null): Promise<TitleProbe> {
  return page.evaluate(
    async ({ viewport, card, heading, next }) => {
      const shell = document.querySelector(viewport);
      const cardEl = document.querySelector(card);
      const titleEl = document.querySelector(heading);
      if (shell === null || cardEl === null || titleEl === null) throw new Error('요소 없음');
      if (next !== null) titleEl.textContent = next;
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
      const t = titleEl.getBoundingClientRect();
      const c = cardEl.getBoundingClientRect();
      return {
        overflowY: shell.scrollHeight - shell.clientHeight,
        overflowX: shell.scrollWidth - shell.clientWidth,
        titleHeight: t.height,
        titleScrollX: titleEl.scrollWidth - titleEl.clientWidth,
        titleLeft: t.left,
        titleRight: t.right,
        cardLeft: c.left,
        cardRight: c.right,
        text: titleEl.textContent ?? '',
      };
    },
    { viewport: VIEWPORT, card: CARD, heading: TITLE, next: name === null ? null : title(name) },
  );
}

function expectFits(result: TitleProbe, label: string): void {
  expect(result.overflowY, `${label} 세로 넘침`).toBe(0);
  expect(result.overflowX, `${label} 가로 넘침`).toBe(0);
  expect(result.titleHeight, `${label} 제목 ≤ 2줄`).toBeLessThanOrEqual(2 * LINE + 0.5);
  expect(result.titleHeight, `${label} 제목 ≥ 1줄`).toBeGreaterThanOrEqual(LINE - 0.5);
  expect(result.titleScrollX, `${label} 제목 가로 잘림`).toBe(0);
  expect(result.titleLeft, `${label} 제목 왼쪽 카드 안`).toBeGreaterThanOrEqual(result.cardLeft);
  expect(result.titleRight, `${label} 제목 오른쪽 카드 안`).toBeLessThanOrEqual(result.cardRight);
}

test.describe('회고 카드 제목 — 이름 길이 ≤ 40자에서 완료 화면 세로 넘침 0 · 제목 ≤ 2줄 (`D5-15`)', () => {
  for (const width of [320, 393, 600, 1024] as const) {
    test(`${String(width)}×852`, async ({ page }) => {
      await page.setViewportSize({ width, height: 852 });
      await startSession(page);
      await page.getByRole('button', { name: 'Start recording' }).click();
      await expect(page.getByRole('button', { name: 'Pause recording' })).toBeVisible();
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByRole('region', { name: title('Emma') })).toBeVisible();
      await settleImages(page);
      await settle(page);

      // Mock 기본 이름 = fixture 렌더 그대로 (`D5-14`)
      const fixture = await probe(page, null);
      expect(fixture.text).toBe(title('Emma'));
      expectFits(fixture, 'fixture Emma');

      for (const name of NAMES) {
        const result = await probe(page, name);
        expectFits(result, `${name.slice(0, 12)}…(${String(name.length)}자)`);
        // clamp 는 시각만 — DOM 텍스트 · 접근성 이름은 전체 문자열
        expect(result.text).toBe(title(name));
        await expect(page.getByRole('region', { name: title(name) })).toBeVisible();
      }
    });
  }
});
