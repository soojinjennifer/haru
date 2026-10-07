/**
 * `BookCover` 상자 기하 계약 — **표지 원본비가 상자 높이를 바꾸지 못한다**.
 *
 * 왜 e2e 인가: jsdom 은 레이아웃을 계산하지 않고, 이 결함은 **CSS 문자열로는 보이지 않는다**.
 * `aspect-ratio` 는 선호 크기일 뿐이라 블록축을 내용으로 재는 부모(column flex) 안에서는
 * 흐름 안의 `<img>` 가 상자를 밀어 올린다. 실측으로만 잡힌다 (`L-R2-01`, approvals §22.1).
 *
 * 실측 이력: `lg` 가 `.haru-shelf-item`(column flex) 안에서 151 → **152.96875** 로 밀렸고
 * (`QA-2-004` 와 같은 부류), `sm`(+0.031)·`md`(+0.063) 도 같은 조건에서 밀린다.
 *
 * 하네스를 합성하는 이유: `sm`·`md` 의 **현재 호출 자리는 이 조건이 아니다**
 * (`.haru-list-row__media` = row flex · Home 은 `block-size: 82px` 직접 선언). 즉 화면을 그대로
 * 재면 결함이 가려진다. 그래서 **lg 가 깨졌던 것과 같은 부모**를 만들어 세 크기를 같은
 * 조건에 세운다. 실제 화면의 기하는 `library.spec.ts`(캐러셀 107×151)가 덮는다.
 */
import { expect, test, type Page } from '@playwright/test';

import { GALLERY, gotoStable, hideDevPanel } from './support/gallery';

/** 상자 비와 어긋나는 원본비를 섞는다. `135×193`(0.6995) 은 실제 Mock 표지의 비다. */
const RATIOS = ['135x193', '100x400', '400x100'] as const;

/**
 * 선언 높이 (Chromium LayoutUnit = 1/64px 로 내림된 값).
 *   `sm` 34 ÷ 0.7 = 48.5714 → 48.56250
 *   `md` 58 ÷ 0.7 = 82.8571 → 82.84375
 *   `lg` 107 × 151/107     → 151
 *   `xl` 높이를 직접 선언   → 90
 */
const DECLARED = { sm: 48.5625, md: 82.84375, lg: 151, xl: 90 } as const;

/** `lg` 는 폭을 갖지 않는다 — 퍼센트 그리드가 정한다. 하네스가 캐러셀 열 폭(107)을 준다. */
const WRAPPER_INLINE_SIZE = { sm: 300, md: 300, lg: 107, xl: 300 } as const;

type Measured = Record<string, { h: number; w: number }>;

/**
 * `lg` 가 깨졌던 조건을 그대로 만든다 — `.haru-shelf-item` 과 같은 **column flex** 부모.
 * 각 크기 × 각 원본비 + 이미지 없음(`none`) 조합을 한 번에 잰다.
 */
async function measure(page: Page): Promise<Measured> {
  return page.evaluate(
    ({ ratios, wrapperInlineSize }) => {
      const svg = (w: number, h: number): string =>
        `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="gray"/></svg>`,
        )}`;

      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;top:0;left:0;visibility:hidden';
      host.setAttribute('data-cover-probe', '');

      const cells: string[] = [];
      for (const size of ['sm', 'md', 'lg', 'xl'] as const) {
        for (const ratio of [...ratios, 'none']) {
          const img =
            ratio === 'none'
              ? ''
              : (() => {
                  const [w, h] = ratio.split('x').map(Number);
                  return `<img src="${svg(w ?? 1, h ?? 1)}">`;
                })();
          cells.push(
            // column flex + 뒤따르는 형제 → 블록축이 내용으로 결정된다 (캐러셀 항목과 동일)
            `<div style="display:flex;flex-direction:column;inline-size:${wrapperInlineSize[size]}px">` +
              `<div class="haru-book-cover haru-book-cover--${size}" data-key="${size}/${ratio}">${img}</div>` +
              `<span>caption</span>` +
              `</div>`,
          );
        }
      }
      host.innerHTML = cells.join('');
      document.body.append(host);

      return (async () => {
        await Promise.all(
          [...host.querySelectorAll('img')].map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.addEventListener('load', () => resolve(), { once: true });
                  img.addEventListener('error', () => resolve(), { once: true });
                }),
          ),
        );
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });

        const out: Record<string, { h: number; w: number }> = {};
        for (const box of host.querySelectorAll<HTMLElement>('[data-key]')) {
          const rect = box.getBoundingClientRect();
          out[box.dataset['key'] ?? ''] = { h: rect.height, w: rect.width };
        }
        host.remove();
        return out;
      })();
    },
    { ratios: RATIOS, wrapperInlineSize: WRAPPER_INLINE_SIZE },
  );
}

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
  await gotoStable(page, GALLERY.components);
  // 실제 `book.css` 가 적용된 페이지여야 합성 하네스가 의미를 갖는다.
  await expect(page.locator('.haru-book-cover--lg').first()).toBeVisible();
});

test('표지 원본비가 세로로 길어도 상자 높이가 선언값을 유지한다 (sm · md · lg · xl)', async ({
  page,
}) => {
  const measured = await measure(page);

  for (const size of ['sm', 'md', 'lg', 'xl'] as const) {
    const declared = DECLARED[size];

    // ① 이미지가 없을 때의 높이 = 선언 높이
    expect.soft(measured[`${size}/none`]?.h, `${size}/none`).toBeCloseTo(declared, 3);

    // ② 어떤 원본비를 넣어도 그 높이가 **그대로**다 (세로로 긴 비 포함)
    for (const ratio of RATIOS) {
      expect
        .soft(measured[`${size}/${ratio}`]?.h, `${size}/${ratio} 높이`)
        .toBeCloseTo(declared, 3);
      expect
        .soft(measured[`${size}/${ratio}`]?.w, `${size}/${ratio} 폭`)
        .toBeCloseTo(measured[`${size}/none`]?.w ?? 0, 3);
    }
  }
});

test('프로브가 실제로 문다 — `position: absolute` 를 끄면 세 크기 전부 밀린다', async ({
  page,
}) => {
  // `R-BASELINE-1` ⑥ · `R-SHADOW-1` ⑥ 의 취지: 원인을 런타임에서 토글해 Δ 를 되살린다.
  await page.addStyleTag({
    content: '.haru-book-cover img { position: static !important; }',
  });
  const measured = await measure(page);

  // 135×193 에서의 밀린 높이 (실측 LayoutUnit). 수정이 사라지면 이 값이 돌아온다.
  const PUSHED = { sm: 48.59375, md: 82.90625, lg: 152.96875 } as const;

  for (const size of ['sm', 'md', 'lg'] as const) {
    expect.soft(measured[`${size}/135x193`]?.h, `${size} 밀린 높이`).toBeCloseTo(PUSHED[size], 3);
    expect
      .soft(measured[`${size}/135x193`]?.h ?? 0, `${size} 가 선언값보다 크다`)
      .toBeGreaterThan(DECLARED[size]);
  }

  // `xl` 은 두 변을 직접 선언해 **면역**이다 — 수정을 끈 상태에서도 90 을 유지한다.
  expect.soft(measured['xl/135x193']?.h, 'xl 면역').toBeCloseTo(DECLARED.xl, 3);
});
