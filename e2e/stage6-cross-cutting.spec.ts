/**
 * Stage 6 `S6-F` 횡단 검증 — Stage 6 의 새 route 8개를 **가로질러** 본다 (Plan §12 `S6-F`, AC-6-42 · 43 · 46 · 47).
 *
 * 화면별 spec(`profile-result` · `growth-capability` · `settings-child` · `settings-survey` · `settings-growth`)이
 * 기하·상태·흐름·baseline 을 갖는다. 여기서는 모든 화면에 **같은 규칙**을 한 번에 건다:
 *  - copy: 렌더된 DOM(텍스트 + aria-label/description/placeholder)에 금칙어 0 (AC-6-42 · Spec §10.5)
 *  - privacy: 콘솔 · pageerror · URL 에 아이 이름 · 수정한 이름 · 페르소나 문구 0 (실패 · 오프라인 · 재시도 경로, AC-6-43)
 *  - 접근성: 역할 · 이름(Playwright aria snapshot) · Tab 순회 포커스 표시 · 44 hit-test · `prefers-reduced-motion` (AC-6-46)
 *  - 반응형: 320×568 / 393×852 / 600×852 / 1024×768 — 가로 넘침 0 · 컬럼 밖 요소 0 · 마지막 버튼 스크롤 도달 (AC-6-47)
 *
 * axe 는 저장소에 없다(도입 = 승인 사항) — 역할·이름 검사는 Playwright 의 접근성 트리(`ariaSnapshot`)로 한다.
 * `R-BASELINE-1`: 이 spec 은 baseline 을 만들지 않는다. dev 패널은 가린다.
 */
import { expect, test, type Page } from '@playwright/test';

import { hideDevPanel, settle } from './support/gallery';
import { cardCounterIndex, expectCardIndex } from './support/onboarding';
import { logInToHome } from './support/session';

test.beforeEach(async ({ page }) => {
  await hideDevPanel(page);
});

interface Screen {
  readonly id: string;
  readonly path: string;
  /** 화면이 다 그려졌다는 신호. */
  readonly ready: string;
}

/** Stage 6 의 새 route — `/__dev/screens` 목록과 같다 (`__tests__/stage6-boundaries.test.ts`). */
const SCREENS: readonly Screen[] = [
  {
    id: 'onboarding-profile',
    path: '/onboarding/profile',
    ready: '.haru-profile-view [data-state="ready"]',
  },
  {
    id: 'onboarding-growth',
    path: '/onboarding/growth-capability',
    ready: '.haru-growth-focus [data-state="ready"]',
  },
  { id: 'settings', path: '/settings', ready: 'main [aria-label="Your child"]' },
  {
    id: 'settings-profile',
    path: '/settings/profile',
    ready: '.haru-profile-view [data-state="ready"]',
  },
  {
    id: 'settings-child',
    path: '/settings/child',
    ready: '.haru-child-info-edit [data-state="ready"]',
  },
  {
    id: 'settings-survey',
    path: '/settings/child/survey',
    ready: '.haru-survey-update[data-state="ready"]',
  },
  {
    id: 'settings-survey-card',
    path: '/settings/child/survey/reading-together',
    ready: '.haru-survey-update [data-state="ready"]',
  },
  {
    id: 'settings-growth',
    path: '/settings/growth-capability',
    ready: '.haru-growth-focus [data-state="ready"]',
  },
];

const CHILD = 'Emma';

async function spaGoto(page: Page, path: string): Promise<void> {
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}

async function openScreen(page: Page, screen: Screen): Promise<void> {
  await spaGoto(page, screen.path);
  await expect(page.locator(screen.ready).first()).toBeVisible();
  await settle(page);
}

/** 콘솔 · 처리되지 않은 오류 · 이동한 URL 을 모은다. */
function collect(page: Page): { logs: string[]; urls: string[] } {
  const logs: string[] = [];
  const urls: string[] = [];
  page.on('console', (message) => logs.push(message.text()));
  page.on('pageerror', (error) =>
    logs.push(`${error.name}: ${error.message}\n${error.stack ?? ''}`),
  );
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) urls.push(frame.url());
  });
  return { logs, urls };
}

/** 렌더된 사용자 노출 문구 — 텍스트 + 접근성 속성. dev 패널 제외. */
async function visibleCopy(page: Page): Promise<string> {
  return page.evaluate(() => {
    const roots = [
      ...document.querySelectorAll('main, header, [role="dialog"], [role="alertdialog"]'),
    ];
    return roots
      .flatMap((root) => {
        const attributes = [
          ...root.querySelectorAll('[aria-label], [placeholder], [title], [alt]'),
        ].flatMap((element) =>
          ['aria-label', 'placeholder', 'title', 'alt'].map(
            (name) => element.getAttribute(name) ?? '',
          ),
        );
        return [(root as HTMLElement).innerText, ...attributes];
      })
      .join('\n');
  });
}

/* ===== copy (AC-6-42) ======================================================= */

/** Plan AC-6-42 = Stage 5 AC-5-44 + weak · lowest · below. */
const PLAN_FORBIDDEN =
  /diagnos|delay|behind|normal|score|worse|better than|peers|weak|lowest|below/i;

test.describe('copy — 렌더된 문구에 진단·판정·비교 표현 0 (AC-6-42)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  for (const scenario of [
    undefined,
    'children:persona-changed',
    'children:persona-fallback',
    'children:all-scores-missing',
    'children:scores-partially-missing',
    'children:profile-updated',
  ]) {
    test(`Stage 6 화면 8개 — ${scenario ?? '기본'}`, async ({ page }) => {
      await logInToHome(page, scenario);
      const hits: string[] = [];
      for (const screen of SCREENS) {
        await openScreen(page, screen);
        const text = await visibleCopy(page);
        expect(text.trim().length, screen.id).toBeGreaterThan(0);
        const found = text.match(PLAN_FORBIDDEN);
        if (found !== null) hits.push(`${screen.id}: ${found[0]}`);
      }
      expect(hits).toStrictEqual([]);
    });
  }

  test('실패 · 오프라인 상태 문구 (조회 · 저장)', async ({ page }) => {
    const texts: string[] = [];
    for (const scenario of ['children:error', 'children:offline']) {
      await logInToHome(page, scenario);
      for (const path of ['/settings/profile', '/settings/child', '/settings/growth-capability']) {
        await spaGoto(page, path);
        await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
        texts.push(await visibleCopy(page));
      }
    }
    for (const scenario of [
      'children.update:error',
      'children.setgrowthcapability:offline',
    ] as const) {
      await logInToHome(page, scenario);
      if (scenario.startsWith('children.update')) {
        await openScreen(page, SCREENS[4] as Screen);
        await page.getByRole('textbox', { name: /First name/ }).fill('Mia');
      } else {
        await openScreen(page, SCREENS[7] as Screen);
        await page.getByRole('radio', { name: /Emotion Regulation/ }).check();
      }
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page.getByRole('alert')).toBeVisible();
      texts.push(await visibleCopy(page));
    }
    expect(texts.join('\n')).not.toMatch(PLAN_FORBIDDEN);
  });
});

/* ===== privacy — 콘솔 · URL (AC-6-43) ======================================= */

const PROBE_NAME = 'Probelina';

test.describe('privacy — 콘솔 · pageerror · URL 에 아이 이름 · 페르소나 문구 0 (AC-6-43)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('아이 정보 수정 retry(1회 실패 → 성공) → 새 이름이 화면에 퍼진 뒤에도 콘솔 · URL 0', async ({
    page,
  }) => {
    const { logs, urls } = collect(page);
    await logInToHome(page, 'children.update:retry');
    // 설정 목록을 거쳐 들어간다 — 저장 성공 뒤 `navigate(-1)` 목적지가 설정 목록이다
    await openScreen(page, SCREENS[2] as Screen);
    await page.getByRole('button', { name: 'Child info' }).click();
    await expect(page.locator((SCREENS[4] as Screen).ready)).toBeVisible();
    await page.getByRole('textbox', { name: /First name/ }).fill(PROBE_NAME);
    const save = page.getByRole('button', { name: 'Save', exact: true });
    await save.click();
    await expect(page.getByRole('alert')).toBeVisible();
    await save.click();
    await expect(page).toHaveURL(/\/settings$/);
    // 새 이름이 실제로 화면에 쓰이는 곳까지 간다 (프로필 재방문 · 차트 summary · 페르소나 eyebrow)
    await openScreen(page, SCREENS[3] as Screen);
    await expect(page.getByText(`Where ${PROBE_NAME} is right now`)).toBeVisible();
    const joined = logs.join('\n');
    expect(joined).not.toContain(PROBE_NAME);
    expect(joined).not.toContain(CHILD);
    expect(urls.filter((url) => url.includes(PROBE_NAME) || url.includes(CHILD))).toStrictEqual([]);
    expect(page.url()).not.toContain(PROBE_NAME);
  });

  test('페르소나 변경 · 재응답 제출 실패 · 발전 역량 저장 오프라인 — 콘솔에 이름 · 페르소나 0', async ({
    page,
  }) => {
    const { logs, urls } = collect(page);
    await logInToHome(page, 'children:persona-changed');
    await openScreen(page, SCREENS[3] as Screen);
    const persona = (await page.locator('.haru-profile-view h2').last().textContent()) ?? '';
    expect(persona.length).toBeGreaterThan(0);

    await logInToHome(page, 'children.submitsurveyupdate:error');
    await openScreen(page, SCREENS[6] as Screen);
    const nextCard = page.getByRole('button', { name: 'Next question' });
    for (let guard = 0; guard < 40; guard += 1) {
      if (await nextCard.isDisabled()) break;
      const before = await cardCounterIndex(page);
      if (before === null) throw new Error('card counter not rendered');
      await nextCard.click();
      await expectCardIndex(page, before + 1);
    }
    await page.getByRole('button', { name: 'Save answers' }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    await logInToHome(page, 'children.setgrowthcapability:offline');
    await openScreen(page, SCREENS[7] as Screen);
    await page.getByRole('radio', { name: /Self-Direction/ }).check();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    const joined = logs.join('\n');
    expect(joined).not.toContain(CHILD);
    expect(joined).not.toContain(persona);
    expect(urls.filter((url) => url.includes(CHILD))).toStrictEqual([]);
  });
});

/* ===== 접근성 — 역할 · 이름 · 포커스 · 44 · reduced motion (AC-6-46) ========= */

/** aria snapshot 에서 이름 없는 인터랙티브 역할을 찾는다. */
function unnamed(snapshot: string): string[] {
  return snapshot
    .split('\n')
    .map((line) => line.trim())
    .filter((line) =>
      /^- (button|link|radio|checkbox|textbox|combobox|switch|tab|menuitem|slider)(\s*\[[^\]]*\])?:?$/.test(
        line,
      ),
    );
}

test.describe('접근성 — 역할 · 이름 · 포커스 표시 (AC-6-46)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('Stage 6 화면 8개 — 이름 없는 컨트롤 0 · 라디오 그룹 이름 · h1 1개', async ({ page }) => {
    await logInToHome(page);
    const problems: string[] = [];
    for (const screen of SCREENS) {
      await openScreen(page, screen);
      const snapshot = await page.locator('body').ariaSnapshot();
      for (const line of unnamed(snapshot)) problems.push(`${screen.id}: ${line}`);
      const h1 = await page.getByRole('heading', { level: 1 }).count();
      if (h1 !== 1) problems.push(`${screen.id}: h1 ${String(h1)}`);
      const radios = await page.locator('main [role="radiogroup"], main fieldset').all();
      for (const group of radios) {
        const name = await group.evaluate((element) => {
          const legend = element.querySelector('legend');
          return (
            element.getAttribute('aria-label') ??
            (element.getAttribute('aria-labelledby') !== null
              ? (document.getElementById(element.getAttribute('aria-labelledby') ?? '')
                  ?.textContent ?? '')
              : (legend?.textContent ?? ''))
          ).trim();
        });
        if (name.length === 0) problems.push(`${screen.id}: 이름 없는 라디오 그룹`);
      }
    }
    expect(problems).toStrictEqual([]);
  });

  test('Stage 6 화면 8개 — Tab 순회: 모든 정지점에 포커스 표시 · 이름 · aria-hidden 정지 0', async ({
    page,
  }) => {
    await logInToHome(page);
    const problems: string[] = [];
    for (const screen of SCREENS) {
      await openScreen(page, screen);
      await page.evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
      });
      const seen = new Set<string>();
      for (let step = 0; step < 40; step += 1) {
        await page.keyboard.press('Tab');
        const stop = await page.evaluate(() => {
          const element = document.activeElement as HTMLElement | null;
          if (element === null || element === document.body) return null;
          if (element.closest('.haru-dev-panel') !== null) return { dev: true } as const;
          const ring = (node: Element | null): boolean => {
            if (node === null) return false;
            const style = getComputedStyle(node);
            const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
            const after = getComputedStyle(node, '::after');
            const before = getComputedStyle(node, '::before');
            const pseudo = [after, before].some(
              (pseudoStyle) =>
                (pseudoStyle.outlineStyle !== 'none' && parseFloat(pseudoStyle.outlineWidth) > 0) ||
                pseudoStyle.boxShadow !== 'none',
            );
            return outline || style.boxShadow !== 'none' || pseudo;
          };
          // 라디오 · 체크박스는 행(label) 이, TextField 는 행(`.haru-text-field__row`, :focus-within) 이 링을 그린다
          const visible =
            ring(element) ||
            ring(element.parentElement) ||
            ring(element.parentElement?.parentElement ?? null) ||
            ring(element.closest('label'));
          const nameOf = (node: HTMLElement): string => {
            const aria = node.getAttribute('aria-label');
            if (aria !== null && aria.trim() !== '') return aria;
            const labelledBy = node.getAttribute('aria-labelledby');
            if (labelledBy !== null) {
              const text = labelledBy
                .split(/\s+/)
                .map((id) => document.getElementById(id)?.textContent ?? '')
                .join(' ');
              if (text.trim() !== '') return text;
            }
            if (node.id !== '') {
              const forLabel = document.querySelector(`label[for="${node.id}"]`);
              if (forLabel?.textContent) return forLabel.textContent;
            }
            const wrapping = node.closest('label');
            if (wrapping?.textContent) return wrapping.textContent;
            return node.textContent ?? '';
          };
          const labelled = nameOf(element);
          return {
            dev: false,
            key: `${element.tagName}#${element.id}.${element.className}:${labelled.trim()}`,
            name: labelled.trim(),
            visible,
            hidden: element.closest('[aria-hidden="true"]') !== null,
          } as const;
        });
        if (stop === null) break;
        if (stop.dev) break;
        if (seen.has(stop.key)) break;
        seen.add(stop.key);
        if (!stop.visible) problems.push(`${screen.id}: 포커스 표시 없음 ${stop.key}`);
        if (stop.name.length === 0) problems.push(`${screen.id}: 이름 없음 ${stop.key}`);
        if (stop.hidden) problems.push(`${screen.id}: aria-hidden 정지 ${stop.key}`);
      }
      if (seen.size === 0) problems.push(`${screen.id}: 정지점 0`);
    }
    expect(problems).toStrictEqual([]);
  });
});

test.describe('접근성 — 터치 타깃 44 (5점 hit-test, Spec §9.4)', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('Stage 6 화면 8개 — 버튼 · 링크 · 라디오 행 · 입력이 44×44 에 닿는다', async ({ page }) => {
    await logInToHome(page);
    const misses: string[] = [];
    const acceptedTextField: string[] = [];
    const chipOverlap: string[] = [];
    for (const screen of SCREENS) {
      await openScreen(page, screen);
      const targets = await page.evaluate(() => {
        const roots = [...document.querySelectorAll('main, header')];
        const elements = roots.flatMap((root) => [
          ...root.querySelectorAll<HTMLElement>(
            'button, a[href], input:not([type="radio"]):not([type="checkbox"]), select, textarea, label:has(> input[type="radio"]), label:has(input[type="radio"])',
          ),
        ]);
        return elements
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              style.visibility !== 'hidden' &&
              element.closest('[aria-hidden="true"]') === null &&
              element.closest('.haru-dev-panel') === null
            );
          })
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              name:
                element.getAttribute('aria-label') ??
                (element.textContent ?? '').trim().slice(0, 40),
              tag: element.tagName,
              cx: rect.x + rect.width / 2,
              cy: rect.y + rect.height / 2,
              width: rect.width,
              height: rect.height,
            };
          });
      });
      for (const target of targets) {
        // 첫 화면(뷰포트 안) 요소만 잰다 — 스크롤 아래 요소는 같은 컴포넌트가 위에서 이미 재진다
        if (target.cy <= 0 || target.cy >= 852) continue;
        const result = await page.evaluate(
          ({ cx, cy }) => {
            const half = 21.5;
            const points: [string, number, number][] = [
              ['c', cx, cy],
              ['n', cx, cy - half],
              ['s', cx, cy + half],
              ['w', cx - half, cy],
              ['e', cx + half, cy],
            ];
            const center = document.elementFromPoint(cx, cy);
            const owner =
              center?.closest('button, a, label, input, select, textarea') ?? center ?? null;
            const miss: string[] = [];
            const neighborChip: string[] = [];
            for (const [label, x, y] of points) {
              // 뷰포트 밖 점은 잴 수 없다 — TopBar IconButton(y=1)의 ::before 위쪽 3px 등
              if (y < 0 || x < 0 || y > window.innerHeight || x > window.innerWidth) continue;
              const element = document.elementFromPoint(x, y);
              const same =
                owner !== null &&
                element !== null &&
                (element === owner || owner.contains(element) || element.contains(owner));
              if (same) continue;
              // 칩 줄 사이: 아래 줄 칩의 히트(::before) 가 겹친다 — `D5-6` 와 같은 구조 (기록만)
              if (
                owner?.classList.contains('haru-chip') === true &&
                element?.closest('.haru-chip') !== null
              ) {
                neighborChip.push(label);
                continue;
              }
              miss.push(label);
            }
            const row = owner?.closest('.haru-text-field__row') ?? null;
            return {
              miss: miss.join(''),
              neighborChip: neighborChip.join(''),
              textFieldRow: row === null ? null : row.getBoundingClientRect().height,
            };
          },
          { cx: target.cx, cy: target.cy },
        );
        const label = `${screen.id}: ${target.tag} "${target.name}" ${String(Math.round(target.width))}×${String(Math.round(target.height))}`;
        if (result.neighborChip.length > 0) chipOverlap.push(`${label} ${result.neighborChip}`);
        if (result.miss.length === 0) continue;
        // TextField 행 = 수용 예외 `S1-G-2` (Stage 1, 행 높이 ≥ 42 를 함께 확인)
        if (result.textFieldRow !== null && result.textFieldRow >= 42) {
          acceptedTextField.push(`${label} row=${String(result.textFieldRow)}`);
          continue;
        }
        misses.push(`${label} miss=${result.miss}`);
      }
    }
    test
      .info()
      .annotations.push(
        { type: 'touch-misses', description: JSON.stringify(misses) },
        { type: 'accepted S1-G-2 (TextField)', description: JSON.stringify(acceptedTextField) },
        { type: 'chip row hit overlap', description: JSON.stringify(chipOverlap) },
      );
    expect(misses).toStrictEqual([]);
    // 칩 겹침은 아이 정보의 언어 칩 묶음(Stage 2 `ChildHomeFields` 그대로)에만 있다
    expect(chipOverlap.every((entry) => entry.startsWith('settings-child: BUTTON'))).toBe(true);
  });
});

test.describe('접근성 — prefers-reduced-motion: reduce (AC-6-46)', () => {
  test.use({ viewport: { width: 393, height: 852 }, reducedMotion: 'reduce' });

  test('Stage 6 화면 8개 — 진입 후 실행 중 애니메이션 0 · computed animation 0', async ({
    page,
  }) => {
    await logInToHome(page);
    const running: string[] = [];
    for (const screen of SCREENS) {
      await openScreen(page, screen);
      const found = await page.evaluate(() => {
        const animated = [...document.querySelectorAll('main, main *')]
          .filter((element) => element.closest('.haru-dev-panel') === null)
          .map((element) => {
            const style = getComputedStyle(element);
            return style.animationName !== 'none' &&
              style.animationDuration.split(',').some((part) => parseFloat(part) > 0)
              ? `${element.className.toString()}:${style.animationName}`
              : null;
          })
          .filter((value): value is string => value !== null);
        /*
         * transition 은 **움직임**(위치 · 크기 · 변형)만 본다. 색 · 그림자 · 테두리 전환(포커스 링 box-shadow ·
         * 라디오 행 배경)은 움직임이 아니라 reduced-motion 대상이 아니다 — 진입 직후 측정 시 180ms 색 전환이
         * 실행 중으로 잡힌다(실측: CTA `box-shadow` · RadioGroup 행 `background-color`).
         */
        const MOTION =
          /^(transform|translate|scale|rotate|top|left|right|bottom|inset.*|width|height|margin.*|block-size|inline-size)$/;
        const live = document
          .getAnimations()
          .filter((animation) => animation.playState === 'running')
          .flatMap((animation) => {
            if ('animationName' in animation)
              return [`animation:${String((animation as CSSAnimation).animationName)}`];
            const property = String((animation as CSSTransition).transitionProperty);
            return MOTION.test(property) ? [`transition:${property}`] : [];
          });
        return [...animated, ...live];
      });
      for (const name of found) running.push(`${screen.id}: ${name}`);
    }
    expect(running).toStrictEqual([]);
  });
});

/* ===== 반응형 (AC-6-47) ===================================================== */

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 393, height: 852 },
  { width: 600, height: 852 },
  { width: 1024, height: 768 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`반응형 ${String(viewport.width)}×${String(viewport.height)} (AC-6-47)`, () => {
    test.use({ viewport });

    test('Stage 6 화면 8개 — 컬럼 480 가운데 · 가로 넘침 0 · 컬럼 밖 요소 0 · 마지막 버튼 스크롤 도달', async ({
      page,
    }) => {
      await logInToHome(page);
      const problems: string[] = [];
      for (const screen of SCREENS) {
        await openScreen(page, screen);
        const probe = await page.evaluate(() => {
          const column = document.querySelector('.haru-app-column');
          const shell = document.querySelector('[data-app-shell-viewport]');
          if (column === null || shell === null) throw new Error('column / viewport 없음');
          const columnRect = column.getBoundingClientRect();
          const outside = [...document.querySelectorAll('main *')]
            .filter((element) => {
              if (element.closest('.haru-dev-panel') !== null) return false;
              const rect = element.getBoundingClientRect();
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                (rect.left < columnRect.left - 0.5 || rect.right > columnRect.right + 0.5)
              );
            })
            .map((element) => element.className.toString() || element.tagName);
          return {
            columnX: columnRect.x,
            columnWidth: columnRect.width,
            docOverflowX:
              document.documentElement.scrollWidth - document.documentElement.clientWidth,
            shellOverflowX: shell.scrollWidth - shell.clientWidth,
            outside: [...new Set(outside)],
          };
        });
        const column = Math.min(viewport.width, 480);
        if (probe.columnWidth !== column)
          problems.push(`${screen.id}: 컬럼 폭 ${String(probe.columnWidth)}`);
        const right = viewport.width - (probe.columnX + probe.columnWidth);
        if (Math.abs(probe.columnX - right) > 0.5) problems.push(`${screen.id}: 가운데 아님`);
        if (probe.docOverflowX > 0) problems.push(`${screen.id}: 문서 가로 넘침`);
        if (probe.shellOverflowX !== 0) problems.push(`${screen.id}: 뷰포트 가로 넘침`);
        for (const name of probe.outside) problems.push(`${screen.id}: 컬럼 밖 ${name}`);

        // 화면의 마지막 버튼(CTA · 마지막 행)이 스크롤로 뷰포트 안에 들어온다
        //  (재방문 프로필은 본문 버튼이 없다 — 그때는 건너뛴다)
        const reach = await page.evaluate(() => {
          const buttons = [...document.querySelectorAll<HTMLElement>('main button')].filter(
            (button) => {
              const rect = button.getBoundingClientRect();
              return (
                rect.width > 0 && rect.height > 0 && button.closest('[aria-hidden="true"]') === null
              );
            },
          );
          const last = buttons.at(-1);
          if (last === undefined) return null;
          last.scrollIntoView({ block: 'nearest' });
          const rect = last.getBoundingClientRect();
          return { name: (last.textContent ?? '').trim(), top: rect.top, bottom: rect.bottom };
        });
        if (reach !== null && (reach.top < 0 || reach.bottom > viewport.height + 0.5))
          problems.push(`${screen.id}: 마지막 버튼 도달 실패 ${JSON.stringify(reach)}`);
      }
      expect(problems).toStrictEqual([]);
    });
  });
}
