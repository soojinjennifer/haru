/**
 * 스크롤된 TopBar 배경 회귀 방지 — 픽셀 프로브 (사용자 결정 2026-10-10).
 *
 * TopBar 의 스크롤 배경은 **두 번** 고쳐졌다. 처음엔 반투명 glass 였고(제목 뒤로 콘텐츠가
 * 지나가 대비가 1.00 까지 떨어졌다), 지금은 **앱 바탕과 같은 gradient** 를 같은 좌표계로 깐다
 * (`packages/ui/src/top-bar/TopBar.css` `.haru-top-bar--scrolled`). 그런데 **스크롤된 TopBar 를
 * 찍거나 재는 e2e 가 하나도 없었다** — 두 번째 수정에도 감시가 없었다.
 *
 * 시각 baseline 으로 메우지 않는다. 기존 baseline 은 전부 scrollTop 0 이고, 스크롤 상태를
 * 추가하면 유지 비용만 늘면서 **"얼마나 어긋났는지"는 여전히 알려주지 않는다**. 요구가
 * 수치(경계 단차 · 대비비)로 적혀 있으므로 수치로 잰다.
 *
 * ① **경계가 없다** — 띠의 마지막 행과 바로 아래 바탕의 채널 색차가 작아야 한다.
 * ② **제목이 읽힌다** — 제목 글리프를 숨긴 컷에서 뒤 픽셀 **각각**과의 대비가 3:1 이상이어야
 *    한다. 평균이 아니라 최솟값을 본다 — 콘텐츠가 띠 뒤로 지나가면 일부 픽셀만 무너진다.
 * ③ **띠가 앱 컬럼 전 폭을 덮는다** — 띠 행 전체에서 콘텐츠를 숨겼을 때와 보일 때의 픽셀이
 *    같아야 한다. 좌우 gutter 24px 를 **포함**해서 본다 (2026-10-10 추가).
 *
 * 세 단정의 역할이 다르다. ①은 **띠를 잘못된 색으로 칠하는 회귀**(고정 단색 · glass fill ·
 * 하단 box-shadow 부활)를 잡고, ②는 **띠를 투명하게 되돌리는 회귀**를 잡는다. ①만으로는
 * 투명을 못 잡는다(투명하면 띠 픽셀 = 바탕 픽셀이라 단차가 0 이다) — 그래서 둘 다 필수다.
 *
 * ③이 따로 필요한 이유는 ①·②가 **둘 다 띠 안쪽만 봤기** 때문이다. ①은 clip 을 띠 rect 로
 * 잡고 ②는 제목 rect 로 잡는데, 당시 띠 rect 는 `AppColumn` content box(= gutter 안쪽)였다.
 * 그래서 **gutter 24px 로 콘텐츠가 그대로 비치는 결함을 둘 다 통과시켰다** (2026-10-10 QA
 * 실측: 393px `/library` scrollTop 260 에서 `x369` 가 콘텐츠 원색 `[253,207,0]` = 채널차 231,
 * 좌 gutter 최대 17 — 그런데 ①·② 모두 통과). 수정 후에는 띠 rect = 컬럼 rect 라 ① 의 clip
 * 도 gutter 를 포함하지만, 그건 띠 폭이 넓어진 **결과**일 뿐이라 폭이 좁아지는 회귀를 막지
 * 못한다 — clip 이 함께 좁아지기 때문이다. ③은 clip 을 **컬럼 rect** 로 잡아 그 되돌림을 본다.
 *
 * 대상 화면은 `/library` 다. 스크롤되는 탭 화면이면서 TopBar 에 **`h1` 제목**이 있는 유일한
 * 화면이다 (`LibraryTopBar` = `variant="large" title="Library"`). Home 헤더는 제목 없이
 * 워드마크 `span` 이라 ②를 잴 대상이 없다.
 *
 * ── 이 테스트가 실제로 무는지 확인하는 방법 (`R-BASELINE-1` ⑥ 과 같은 절차) ──
 * `openLibrary` 의 `hideDevPanel` 뒤에 `page.addInitScript` 로 아래 CSS 를 주입하면 제품 코드를
 * 건드리지 않고 수정을 런타임에서 되돌릴 수 있다. 2026-10-10 이 머신 실측 결과:
 *
 * | 되돌림 | ① 경계 | ② 제목 대비 |
 * |---|---|---|
 * | `background-image: none; background-color: transparent` (투명) | 통과 (단차 `[1,0,1]`) | **실패** — scrollTop 60 에서 3:1 미만 **605/3298 = 18.3%**, 최소 **1.00** |
 * | `background-image: none; background-color: var(--color-surface-glass)` (1차 구현) | **실패** — 단차 **27** (> 4) | 통과 (3.91 … 6.81, 0%) |
 * | `box-shadow: var(--shadow-rest)` (하단 경계선 부활) | **실패** — 단차 **25** (> 4) | 통과 |
 * | `background-attachment: scroll; background-size: auto` (CSS 주석이 경고한 gradient 압축) | **실패** — 단차 **36** | 통과 |
 * | `background-attachment: scroll` (크기는 유지) | **통과** — 단차 `[1,0,1]` | 통과 |
 *
 * 즉 두 단정이 **서로 다른 회귀**를 잡는다. 둘 중 하나를 지우면 그 열의 회귀가 조용히 통과한다.
 *
 * ⚠ **알려진 검출 공백** (마지막 행): `background-attachment: fixed` 만 떨어뜨리고
 * `background-size: 100% 100dvh` 를 남기면 이 테스트가 **잡지 못한다**. 띠가 `position: sticky`
 * 로 뷰포트 상단(실측 y 0…40)에 붙어 있어서, 좌표계가 뷰포트든 띠의 padding box 든 gradient
 * 시작점이 거의 같기 때문이다 — 852px 램프에서 40px 차이는 채널 2 단위 미만이다. 그 속성은
 * 웹 러너에서 재현되지 않는 **UA fallback(iOS Safari 계열) 방어용**이며, 실기기 검증 대상이다.
 */
import { expect, test, type Page } from '@playwright/test';

import { gotoApp, hideDevPanel, settle } from './support/gallery';
import { contrastRatio, decodePng, maxChannelDelta, parseCssRgb, pixelAt } from './support/pixels';

/**
 * 재는 스크롤 위치. `SCROLL_THRESHOLD_PX`(8) 바로 위부터, 콘텐츠가 띠 뒤를 한창 지나가는
 * 깊은 위치까지 네 지점을 본다. 420 은 `/library` 스크롤 가능 범위 안이어야 하며, 아니면
 * 테스트가 **조용히 통과하지 않고** 실패한다 (`scrollToTop` 의 실제 위치 단정).
 */
const SCROLL_TOPS = [60, 160, 260, 420] as const;

/**
 * 띠 아래 **경계로 보이는** 채널 색차의 상한.
 *
 * 실측 (2026-10-10, 이 머신 · 393×852 · `/library` 띠 = y 0…40):
 *   - 현재 구현 — 네 scrollTop 전부 바탕 3행이 `[1, 0, 1]`, 즉 **최대 1**. gradient 램프는
 *     852px 에서 채널 최대 37(`#dbeee7` → `#c7c9d7`)이라 1px 당 0.05 미만이다. 1 이 램프가
 *     아니라 **반올림/디더 바닥**인 증거가 가운데 행의 0 이다 — 램프였다면 아래로 갈수록
 *     단조 증가해야 한다.
 *   - 잡아야 하는 것 — 띠를 다른 색으로 칠하면(glass fill · 단색 surface) 채널 수십 단위로
 *     벌어지고, 하단 `box-shadow` 가 부활하면 아래 몇 행이 눈에 보이게 어두워진다.
 *
 * **4** 는 실측 바닥(1)의 4배 여유이고, 사람이 단차를 알아보는 수준(채널 ~2 이상이 넓은 면에
 * 걸쳐 나타남)의 바로 위다. 이 머신 실측에 딱 맞추지 않은 이유: 다른 러너의 gradient 디더링
 * 패턴이 다를 수 있다. 바닥이 4 를 넘는 러너를 만나면 **값을 올리기 전에 디더 바닥을 먼저
 * 실측한다** — 임계값만 올리면 검출력이 조용히 사라진다.
 */
const SEAM_MAX_CHANNEL_DELTA = 4;

/**
 * 띠 아래에서 함께 보는 바탕 행의 개수.
 *
 * 경계는 한 행만 보면 안티에일리어싱 한 줄에 가려질 수 있다. 바로 아래 3행을 전부 띠의
 * 마지막 행과 비교한다 (gradient 램프 기여는 3px 에서 0.15 단위 미만이라 무시할 수 있다).
 */
const SEAM_BACKGROUND_ROWS = 3;

/**
 * 제목 픽셀이 지켜야 하는 최소 대비비.
 *
 * **이 머신 실측값이 아니라 WCAG 2.x 기준값**이다. `variant="large"` 의 제목은
 * `title-1`(28px) `heavy` 이므로 WCAG 의 "large text" 에 해당해 AA 기준이 **3:1** 이다
 * (`rules/frontend.md` §9). 그래서 러너가 바뀌어도 옮겨 쓸 수 있다.
 *
 * 참고 실측 (2026-10-10, 이 머신): 현재 구현의 대비는 **5.55 … 5.64** 로 3:1 에서 1.8배
 * 여유가 있고, 3:1 미만 픽셀은 네 scrollTop 전부 **0%** 다. 투명 띠로 되돌리면 같은 지점의
 * 최소 대비가 **1.00**, 3:1 미만이 **82.3%** 였다 (scrollTop 260).
 */
const MIN_TITLE_CONTRAST = 3;

/**
 * ③ 띠 행에서 **콘텐츠 통과**로 볼 채널 색차의 상한.
 *
 * ①의 `SEAM_MAX_CHANNEL_DELTA`(4)와 달리 이 바닥은 **디더가 아니라 0 이어야 한다**. 비교하는
 * 두 컷은 *같은 좌표의 같은 띠*이고 **콘텐츠 가시성만** 다르다 — 띠가 그 자리를 불투명하게
 * 덮고 있으면 gradient 램프도 안티에일리어싱도 개입할 여지가 없어 픽셀이 바이트 단위로 같다.
 *
 * 실측 (2026-10-10, 이 머신 · 393×852 · `/library` · 컬럼 전 폭 0…393 · 띠 행 0…40):
 *   - 수정 후 — 네 scrollTop 전부 **0** (좌 gutter · 안쪽 · 우 gutter 모두)
 *   - 수정 전 — 안쪽 0 인데 gutter 가 새고 있었다: scrollTop 60 `2` · 160 `5` · 260 **231**
 *     (`x369` = 콘텐츠 원색 `[253,207,0]`) · 420 `9`
 *
 * **1** 은 바닥 0 에 반올림 한 단위만 허용한다. 2 로 올리면 위 실측의 scrollTop 60 (`2`) 이
 * 통과해 "띠가 조금만 좁아진" 회귀를 놓친다 — 값을 올리기 전에 바닥을 먼저 실측한다.
 */
const OCCLUSION_MAX_CHANNEL_DELTA = 1;

/**
 * ③ 를 ≥600px 에서도 보는 폭 (Stage 0 #12 — 600 이상은 최대 480 앱 컬럼 가운데 정렬).
 *
 * 컬럼 **밖**은 페이지 배경이고 띠가 거기까지 갈 필요가 없다 (사용자 결정 2026-10-10). 실제로
 * 컬럼 밖으로는 콘텐츠가 통과하지 않는다 — 2026-10-10 실측(768px, `/library` scrollTop 260 ·
 * Home scrollTop 120): 컬럼 밖 60px 의 채널차가 띠 행뿐 아니라 **y 0…500 전 구간에서 0** 이고,
 * 같은 프로브가 컬럼 안쪽에서는 231 을 읽었다(= 민감도 있음). 그래서 단정 범위도 **컬럼
 * rect 까지**다.
 */
const WIDE_VIEWPORT = { width: 768, height: 852 } as const;

/**
 * 경계를 재려면 띠 아래가 **순수 바탕**이어야 한다.
 *
 * `display: none` 이 아니라 `visibility: hidden` 인 이유는 `support/gallery.ts`
 * `hideDevPanel` 과 같다 — 레이아웃과 **스크롤 위치**를 보존해야 한다. `main` 을 트리에서
 * 빼면 스크롤 높이가 줄어 `scrollTop` 이 되감긴다.
 */
const HIDE_CONTENT_CSS = `
  main { visibility: hidden !important; }
  .haru-app-shell__bar-bottom { visibility: hidden !important; }
`;

/** 제목 글리프만 숨긴다 — **뒤에 무엇이 있는지** 재기 위해서다. 콘텐츠는 그대로 둔다. */
const HIDE_TITLE_CSS = '.haru-top-bar h1 { visibility: hidden !important; }';

/** 로그인해서 `/library` 로 **SPA 이동**한다 (`page.goto` 는 메모리 세션을 잃는다). */
async function openLibrary(page: Page): Promise<void> {
  await hideDevPanel(page);
  await gotoApp(page, '/auth/log-in');

  await page.getByLabel('Email').fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('sunny-evening-8');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.locator('.haru-activity-track')).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Library' })
    .click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.locator('.haru-library-shelves')).toBeVisible();
  await settle(page);
}

/**
 * AppShell 뷰포트를 지정 위치로 스크롤한다.
 *
 * **실제 도달 위치를 돌려준다.** 콘텐츠가 짧아 못 내려간 채로 재면 "스크롤된 TopBar" 를
 * 재는 것이 아닌데도 테스트가 통과한다 — 호출부가 그걸 단정한다.
 */
async function scrollToTop(page: Page, top: number): Promise<number> {
  const reached = await page.evaluate((target) => {
    const viewport = document.querySelector('[data-app-shell-viewport]');
    if (viewport === null) throw new Error('AppShell 스크롤 뷰포트를 찾지 못했다');
    viewport.scrollTop = target;
    return viewport.scrollTop;
  }, top);

  await settle(page);
  return reached;
}

/** 스타일을 주입한 상태에서 `body` 를 실행하고, 끝나면 **반드시** 걷어낸다. */
async function withInjectedCss<T>(page: Page, css: string, body: () => Promise<T>): Promise<T> {
  const handle = await page.addStyleTag({ content: css });
  try {
    await settle(page);
    return await body();
  } finally {
    /* `node.remove()` 는 `ChildNode` 쪽 API 라 `ElementHandle<Node>` 에서 타입이 닫힌다. */
    await handle.evaluate((node) => {
      node.parentNode?.removeChild(node);
    });
    await settle(page);
  }
}

/** 띠(`.haru-top-bar`)의 기하와 실제 적용된 배경 + 앱 컬럼 rect (③ 의 기준). */
async function measureBand(page: Page) {
  return page.evaluate(() => {
    const bar = document.querySelector('.haru-top-bar');
    if (bar === null) throw new Error('`.haru-top-bar` 를 찾지 못했다');
    const column = bar.closest('.haru-app-column');
    if (column === null) throw new Error('TopBar 를 감싼 `.haru-app-column` 을 찾지 못했다');

    const style = getComputedStyle(bar);
    const rect = bar.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();

    return {
      classes: bar.className,
      backgroundImage: style.backgroundImage,
      backgroundColor: style.backgroundColor,
      backgroundAttachment: style.backgroundAttachment,
      backgroundSize: style.backgroundSize,
      boxShadow: style.boxShadow,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      columnLeft: columnRect.left,
      columnRight: columnRect.right,
      /* 컬럼 좌우 인셋 = gutter + safe-area. ③ 의 영역 구분(gutter ↔ 안쪽) 기준이다. */
      columnInsetStart: Number.parseFloat(getComputedStyle(column).paddingLeft),
      columnInsetEnd: Number.parseFloat(getComputedStyle(column).paddingRight),
    };
  });
}

/**
 * 띠 행에서 **콘텐츠가 비치는 정도**를 앱 컬럼 **전 폭**으로 잰다 (③).
 *
 * 같은 clip 을 두 번 찍어 x 별 최대 채널차를 돌려준다 — 한 번은 콘텐츠가 보이는 상태,
 * 한 번은 `HIDE_CONTENT_CSS` 로 가린 상태다. 띠가 불투명하게 그 자리를 덮고 있으면 두 컷이
 * **완전히 같다**(채널차 0). 어디든 0 이 아니면 그 x 로 콘텐츠가 통과한 것이다.
 */
async function measureOcclusion(page: Page, band: Awaited<ReturnType<typeof measureBand>>) {
  const clip = {
    x: Math.ceil(band.columnLeft),
    y: Math.ceil(band.top),
    width: Math.floor(band.columnRight) - Math.ceil(band.columnLeft),
    height: Math.floor(band.bottom) - Math.ceil(band.top),
  };
  expect(clip.width, `앱 컬럼 폭을 재지 못했다 ${JSON.stringify(band)}`).toBeGreaterThan(100);
  expect(clip.height, `띠 높이를 재지 못했다 ${JSON.stringify(band)}`).toBeGreaterThan(10);

  const visible = decodePng(await page.screenshot({ clip }));
  const hidden = await withInjectedCss(page, HIDE_CONTENT_CSS, async () =>
    decodePng(await page.screenshot({ clip })),
  );

  let worst = 0;
  let worstX = -1;
  const perRegion = { leftGutter: 0, inside: 0, rightGutter: 0 };
  const insideFrom = Math.round(band.columnLeft + band.columnInsetStart - clip.x);
  const insideTo = Math.round(band.columnRight - band.columnInsetEnd - clip.x);

  for (let x = 0; x < visible.width; x += 1) {
    let column = 0;
    for (let y = 0; y < visible.height; y += 1) {
      column = Math.max(column, maxChannelDelta(pixelAt(visible, x, y), pixelAt(hidden, x, y)));
    }
    if (column > worst) {
      worst = column;
      worstX = x + clip.x;
    }
    const region = x < insideFrom ? 'leftGutter' : x < insideTo ? 'inside' : 'rightGutter';
    perRegion[region] = Math.max(perRegion[region], column);
  }

  return { clip, worst, worstX, perRegion };
}

/** 제목 `h1` 의 기하와 글자색. */
async function measureTitle(page: Page) {
  return page.evaluate(() => {
    const heading = document.querySelector('.haru-top-bar h1');
    if (heading === null) throw new Error('`.haru-top-bar h1` 을 찾지 못했다');

    const rect = heading.getBoundingClientRect();
    return {
      text: (heading.textContent ?? '').trim(),
      color: getComputedStyle(heading).color,
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
}

test.describe('스크롤된 TopBar 배경 (2026-10-10)', () => {
  test.beforeEach(async ({ page }) => {
    await openLibrary(page);
  });

  /*
    ① 띠 아래에 경계선이 없다.

    띠는 `position: sticky` 로 뷰포트 상단에 붙어 있고, 그 바로 아래는 `main` 을 가린
    상태에서 **AppBackground gradient** 뿐이다. 두 영역이 같은 좌표계의 같은 gradient 를
    쓰면 접합선의 채널 색차가 디더 수준에 머문다.
  */
  test('띠 마지막 행과 바로 아래 바탕의 색차가 디더 수준이다', async ({ page }) => {
    expect(page.viewportSize()).toEqual({ width: 393, height: 852 });

    for (const target of SCROLL_TOPS) {
      const reached = await scrollToTop(page, target);
      expect(reached, `scrollTop ${target} 에 도달하지 못했다 (실제 ${reached})`).toBe(target);

      const band = await measureBand(page);
      expect(
        band.classes,
        `scrollTop ${target}: 띠가 스크롤 상태가 아니다 — "${band.classes}"`,
      ).toContain('haru-top-bar--scrolled');

      const lastBandRow = Math.floor(band.bottom) - 1;
      const firstBackgroundRow = Math.ceil(band.bottom);
      const clipLeft = Math.ceil(band.left) + 1;
      const clipWidth = Math.floor(band.right) - 1 - clipLeft;
      expect(clipWidth, `띠 폭을 재지 못했다 ${JSON.stringify(band)}`).toBeGreaterThan(100);

      const strip = await withInjectedCss(page, HIDE_CONTENT_CSS, async () =>
        decodePng(
          await page.screenshot({
            clip: {
              x: clipLeft,
              y: lastBandRow,
              width: clipWidth,
              height: firstBackgroundRow - lastBandRow + SEAM_BACKGROUND_ROWS,
            },
          }),
        ),
      );

      /* 행 0 = 띠의 마지막 행. 그 아래 `SEAM_BACKGROUND_ROWS` 행이 순수 바탕이다. */
      const deltas: number[] = [];
      for (let row = firstBackgroundRow - lastBandRow; row < strip.height; row += 1) {
        let worst = 0;
        for (let x = 0; x < strip.width; x += 1) {
          worst = Math.max(worst, maxChannelDelta(pixelAt(strip, x, 0), pixelAt(strip, x, row)));
        }
        deltas.push(worst);
      }

      // eslint-disable-next-line no-console -- 실측값을 보고에 그대로 옮긴다 (추정 금지)
      console.log(
        `[topbar-seam] scrollTop=${target} band=${band.top.toFixed(1)}–${band.bottom.toFixed(1)} ` +
          `rows=${lastBandRow}|${firstBackgroundRow}+ delta=[${deltas.join(', ')}] ` +
          `bg="${band.backgroundImage.slice(0, 40)}…" attachment=${band.backgroundAttachment} ` +
          `shadow=${band.boxShadow}`,
      );

      deltas.forEach((delta, index) => {
        expect(
          delta,
          `scrollTop ${target}: 띠 마지막 행(${lastBandRow})과 바탕 ${firstBackgroundRow + index} 행 사이에 경계가 보인다`,
        ).toBeLessThanOrEqual(SEAM_MAX_CHANNEL_DELTA);
      });
    }
  });

  /*
    ② 제목이 계속 읽힌다.

    제목 글리프만 숨기고 **그 자리의 뒤 픽셀**을 전부 꺼내, 글자색과의 대비를 픽셀마다
    계산한다. 띠가 불투명하면 뒤는 gradient 뿐이라 대비가 고르게 높다. 띠가 투명/반투명하면
    스크롤로 지나가는 책 표지·카드가 그 자리에 들어와 일부 픽셀의 대비가 1 에 가까워진다.

    평균이나 중앙값을 보지 않는다 — 글자 일부만 콘텐츠에 겹쳐도 읽기가 무너지기 때문이다.
  */
  test('제목 뒤 픽셀이 전부 3:1 이상 대비를 준다', async ({ page }) => {
    for (const target of SCROLL_TOPS) {
      const reached = await scrollToTop(page, target);
      expect(reached, `scrollTop ${target} 에 도달하지 못했다 (실제 ${reached})`).toBe(target);

      const title = await measureTitle(page);
      expect(title.text, `scrollTop ${target}: 제목 텍스트가 없다`).not.toBe('');
      expect(title.width, `제목 박스를 재지 못했다 ${JSON.stringify(title)}`).toBeGreaterThan(10);
      expect(title.height, `제목 박스를 재지 못했다 ${JSON.stringify(title)}`).toBeGreaterThan(10);

      const ink = parseCssRgb(title.color);

      const behind = await withInjectedCss(page, HIDE_TITLE_CSS, async () =>
        decodePng(
          await page.screenshot({
            clip: { x: title.x, y: title.y, width: title.width, height: title.height },
          }),
        ),
      );

      let min = Number.POSITIVE_INFINITY;
      let max = 0;
      let below = 0;
      const total = behind.width * behind.height;

      for (let y = 0; y < behind.height; y += 1) {
        for (let x = 0; x < behind.width; x += 1) {
          const ratio = contrastRatio(ink, pixelAt(behind, x, y));
          min = Math.min(min, ratio);
          max = Math.max(max, ratio);
          if (ratio < MIN_TITLE_CONTRAST) below += 1;
        }
      }

      const belowPercent = (below / total) * 100;

      // eslint-disable-next-line no-console -- 실측값을 보고에 그대로 옮긴다 (추정 금지)
      console.log(
        `[topbar-title] scrollTop=${target} "${title.text}" ink=${title.color} ` +
          `box=${title.width}×${title.height}(${total}px) ` +
          `contrast=${min.toFixed(2)}…${max.toFixed(2)} ` +
          `below3:1=${below}px (${belowPercent.toFixed(1)}%)`,
      );

      expect(
        belowPercent,
        `scrollTop ${target}: 제목 뒤 ${below}/${total} 픽셀이 3:1 미만 (최소 ${min.toFixed(2)})`,
      ).toBe(0);
    }
  });

  /*
    ③ 띠가 앱 컬럼 **전 폭**을 덮는다 (사용자 결정 2026-10-10).

    clip 을 띠 rect 가 아니라 **컬럼 rect** 로 잡는다. 띠가 좁아지면 clip 이 함께 좁아지는
    ①의 약점을 피하기 위해서다. 좌우 gutter 는 "띠가 닿지 않는 곳" 이었고, 거기로 콘텐츠가
    원색 그대로 지나갔다.

    기하 단정과 픽셀 단정을 둘 다 둔다. 기하(띠 rect == 컬럼 rect)는 **왜** 실패했는지
    바로 알려주고, 픽셀(콘텐츠 통과 채널차)은 기하가 맞는데도 배경이 비는 경우를 잡는다.
  */
  test('띠가 앱 컬럼 전 폭을 덮어 gutter 로 콘텐츠가 비치지 않는다', async ({ page }) => {
    expect(page.viewportSize()).toEqual({ width: 393, height: 852 });

    for (const target of SCROLL_TOPS) {
      const reached = await scrollToTop(page, target);
      expect(reached, `scrollTop ${target} 에 도달하지 못했다 (실제 ${reached})`).toBe(target);

      const band = await measureBand(page);
      expect(
        band.classes,
        `scrollTop ${target}: 띠가 스크롤 상태가 아니다 — "${band.classes}"`,
      ).toContain('haru-top-bar--scrolled');
      expect(
        band.columnInsetStart,
        `gutter 가 0 이면 ③ 이 아무것도 재지 않는다 ${JSON.stringify(band)}`,
      ).toBeGreaterThan(0);

      const { clip, worst, worstX, perRegion } = await measureOcclusion(page, band);

      // eslint-disable-next-line no-console -- 실측값을 보고에 그대로 옮긴다 (추정 금지)
      console.log(
        `[topbar-occlusion] scrollTop=${target} col=${band.columnLeft.toFixed(1)}–${band.columnRight.toFixed(1)} ` +
          `band=${band.left.toFixed(1)}–${band.right.toFixed(1)} inset=${band.columnInsetStart}|${band.columnInsetEnd} ` +
          `clip=${clip.width}×${clip.height}@${clip.x},${clip.y} ` +
          `delta: 좌gutter=${perRegion.leftGutter} 안쪽=${perRegion.inside} 우gutter=${perRegion.rightGutter} ` +
          `(최대 ${worst} @x${worstX})`,
      );

      expect(
        band.left,
        `scrollTop ${target}: 띠 좌변이 컬럼 좌변과 다르다 ${JSON.stringify(band)}`,
      ).toBeCloseTo(band.columnLeft, 1);
      expect(
        band.right,
        `scrollTop ${target}: 띠 우변이 컬럼 우변과 다르다 ${JSON.stringify(band)}`,
      ).toBeCloseTo(band.columnRight, 1);
      expect(
        worst,
        `scrollTop ${target}: x${worstX} 로 콘텐츠가 비친다 — 좌gutter ${perRegion.leftGutter} · 안쪽 ${perRegion.inside} · 우gutter ${perRegion.rightGutter}`,
      ).toBeLessThanOrEqual(OCCLUSION_MAX_CHANNEL_DELTA);
    }
  });

  /*
    ③-b ≥600px 에서도 같다 — 띠는 **앱 컬럼**(480) 전 폭이며 그 밖까지 가지 않는다.

    컬럼 밖은 페이지 배경이고 콘텐츠가 통과하지 않는다 (`WIDE_VIEWPORT` 주석의 실측).
  */
  test('600px 이상에서도 띠가 앱 컬럼 전 폭을 덮는다', async ({ page }) => {
    await page.setViewportSize({ ...WIDE_VIEWPORT });
    await settle(page);

    const target = 260;
    const reached = await scrollToTop(page, target);
    expect(reached, `scrollTop ${target} 에 도달하지 못했다 (실제 ${reached})`).toBe(target);

    const band = await measureBand(page);
    expect(band.classes).toContain('haru-top-bar--scrolled');
    /* 컬럼이 실제로 가운데 정렬된 480 인지 — 아니면 이 테스트가 393 과 같은 것을 재게 된다. */
    expect(
      band.columnLeft,
      `컬럼이 가운데 정렬되지 않았다 ${JSON.stringify(band)}`,
    ).toBeGreaterThan(0);
    expect(band.columnRight - band.columnLeft).toBeLessThan(WIDE_VIEWPORT.width);

    const { clip, worst, worstX, perRegion } = await measureOcclusion(page, band);

    // eslint-disable-next-line no-console -- 실측값을 보고에 그대로 옮긴다 (추정 금지)
    console.log(
      `[topbar-occlusion-wide] viewport=${WIDE_VIEWPORT.width} scrollTop=${target} ` +
        `col=${band.columnLeft.toFixed(1)}–${band.columnRight.toFixed(1)} ` +
        `band=${band.left.toFixed(1)}–${band.right.toFixed(1)} clip=${clip.width}×${clip.height} ` +
        `delta: 좌gutter=${perRegion.leftGutter} 안쪽=${perRegion.inside} 우gutter=${perRegion.rightGutter} ` +
        `(최대 ${worst} @x${worstX})`,
    );

    expect(band.left).toBeCloseTo(band.columnLeft, 1);
    expect(band.right).toBeCloseTo(band.columnRight, 1);
    expect(
      worst,
      `${WIDE_VIEWPORT.width}px: x${worstX} 로 콘텐츠가 비친다 — 좌gutter ${perRegion.leftGutter} · 안쪽 ${perRegion.inside} · 우gutter ${perRegion.rightGutter}`,
    ).toBeLessThanOrEqual(OCCLUSION_MAX_CHANNEL_DELTA);
  });
});
