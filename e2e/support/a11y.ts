/**
 * Stage 8 `S8-G` — 접근성 측정 도구 (Spec §9.4 · §8.2).
 *
 * 측정 로직은 이 파일 한 곳에만 있다. 판정(예외 목록 · 장부 매핑)은 spec 이 한다.
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { contrastRatio, decodePng, parseCssRgb, pixelAt, type Rgb } from './pixels';

/** Spec §9.4 — 규칙 엔진 태그. */
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const;

export interface AxeFinding {
  readonly rule: string;
  readonly impact: string;
  readonly target: string;
  readonly summary: string;
}

export interface ContrastNode {
  readonly target: string;
  readonly fg: string;
  readonly bg: string;
  readonly ratio: number;
  readonly fontSize: string;
  readonly fontWeight: string;
  readonly expected: number;
  readonly html: string;
  /** 요소 · 조상 8단의 class — 장부 매핑(어느 컴포넌트의 글자인가)에 쓴다. */
  readonly ancestry: string;
}

export interface AxeResult {
  /** `color-contrast` 를 뺀 serious · critical 위반. */
  readonly blocking: AxeFinding[];
  /** moderate · minor (기록만). */
  readonly minor: AxeFinding[];
  /** `color-contrast` 위반 노드 — 장부 매핑 대상 (규칙을 끄지 않는다). */
  readonly contrast: ContrastNode[];
  /** 배경을 판정하지 못한 노드 (그래디언트 · 반투명 · 겹침) — 렌더 픽셀 측정 대상 (Spec §9.4). */
  readonly contrastIncomplete: string[];
}

interface ContrastData {
  fgColor?: string;
  bgColor?: string;
  contrastRatio?: number;
  fontSize?: string;
  fontWeight?: string;
  expectedContrastRatio?: string;
}

/**
 * 감사 대상에서 **dev 전용 UI** 를 뺀다 (`R-BASELINE-1` ② 와 같은 이유 — Production 에 없다).
 * `assert:no-mocks` 가 Production 산출물에 패널 0 을 보증한다.
 */
const DEV_ONLY = ['.haru-dev-panel'];

function targetOf(target: unknown): string {
  return Array.isArray(target) ? target.map(String).join(' ') : String(target);
}

export async function runAxe(page: Page): Promise<AxeResult> {
  let builder = new AxeBuilder({ page }).withTags([...AXE_TAGS]);
  for (const selector of DEV_ONLY) builder = builder.exclude(selector);
  const result = await builder.analyze();

  const blocking: AxeFinding[] = [];
  const minor: AxeFinding[] = [];
  const contrast: ContrastNode[] = [];

  for (const violation of result.violations) {
    for (const node of violation.nodes) {
      if (violation.id === 'color-contrast') {
        const data = (node.any[0]?.data ?? {}) as ContrastData;
        contrast.push({
          target: targetOf(node.target),
          fg: (data.fgColor ?? '').toLowerCase(),
          bg: (data.bgColor ?? '').toLowerCase(),
          ratio: data.contrastRatio ?? 0,
          fontSize: data.fontSize ?? '',
          fontWeight: data.fontWeight ?? '',
          expected: Number.parseFloat(data.expectedContrastRatio ?? '4.5'),
          html: node.html.slice(0, 160),
          ancestry: '',
        });
        continue;
      }
      const finding: AxeFinding = {
        rule: violation.id,
        impact: node.impact ?? violation.impact ?? 'unknown',
        target: targetOf(node.target),
        summary: (node.failureSummary ?? '').replace(/\s+/g, ' ').slice(0, 200),
      };
      if (finding.impact === 'serious' || finding.impact === 'critical') blocking.push(finding);
      else minor.push(finding);
    }
  }

  const contexts = await page.evaluate(
    (targets) =>
      targets.map((target) => {
        const element = document.querySelector(target);
        const modal = document.querySelector('[aria-modal="true"]');
        let node: Element | null = element;
        const parts: string[] = [];
        for (let depth = 0; depth < 9 && node !== null; depth += 1) {
          if (typeof node.className === 'string' && node.className !== '')
            parts.push(node.className);
          node = node.parentElement;
        }
        // 모달이 열려 있으면 배경 글자는 scrim 아래(inert)다 — 대비 요구 대상이 아니다
        const behindModal = modal !== null && element !== null && !modal.contains(element);
        return { ancestry: parts.join(' '), behindModal };
      }),
    contrast.map((node) => node.target),
  );
  const withAncestry = contrast
    .map((node, index) => ({ ...node, ancestry: contexts[index]?.ancestry ?? '' }))
    .filter((_, index) => contexts[index]?.behindModal !== true);

  const contrastIncomplete = result.incomplete
    .filter((entry) => entry.id === 'color-contrast')
    .flatMap((entry) => entry.nodes.map((node) => targetOf(node.target)));

  return { blocking, minor, contrast: withAncestry, contrastIncomplete };
}

/** 인터랙티브 요소 선택자 — 터치 타깃 · 클릭 가능 · 포커스 측정 공통. */
export const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[role="button"]',
  '[role="link"]',
  '[role="radio"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="tab"]',
  // `*` 접두 — 선택자 문자열이 Tailwind arbitrary variant lint(`[…]:`)에 걸리지 않게
  '*[tabindex]:not([tabindex="-1"])',
].join(',');

export interface TargetMeasure {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  /** hit 가 뷰포트 가장자리까지 이어져 끝을 잴 수 없었다 (TopBar 버튼 hit 의 위쪽 2px 등). */
  readonly edge: boolean;
  /** 요소 · 조상 4단 class — 승인 예외 매핑에 쓴다. */
  readonly ancestry: string;
}

/**
 * 실 hit 영역 (Spec §9.4 — `elementFromPoint` 격자). 요소 중심을 지나는 가로 · 세로 선을 1px 간격으로
 * 훑어, 요소(또는 그 자손 · `label[for]`)가 맞는 연속 구간 길이를 잰다. `::before` 확장 hit 도 잡힌다.
 *
 * 화면 밖 요소는 가운데로 스크롤한 뒤 잰다. 고정 바에 가려진 부분은 hit 가 아니므로 줄어든다(정상 — 가려진 것도 결함).
 */
export async function measureTargets(page: Page): Promise<TargetMeasure[]> {
  return page.evaluate(async (selector) => {
    const DEV = '.haru-dev-panel';
    const nameOf = (element: Element): string => {
      const forLabel =
        element.id === '' ? null : document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
      const label =
        element.getAttribute('aria-label') ??
        forLabel?.textContent ??
        element.closest('label')?.textContent ??
        element.textContent;
      const role = element.getAttribute('role') ?? element.tagName.toLowerCase();
      return `${role} · ${label.replace(/\s+/g, ' ').trim().slice(0, 60)}`;
    };
    const visible = (element: HTMLElement): boolean => {
      if (element.closest(DEV) !== null) return false;
      if (element.closest('[inert], [aria-hidden="true"], [hidden]') !== null) return false;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
      if (element instanceof HTMLButtonElement && element.disabled) return false;
      if (element instanceof HTMLInputElement && element.disabled) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const owns = (element: Element, hit: Element | null): boolean => {
      if (hit === null) return false;
      if (element === hit || element.contains(hit)) return true;
      const label = hit.closest('label');
      if (label !== null && label.contains(element)) return true;
      if (label !== null && element.id !== '' && label.htmlFor === element.id) return true;
      return false;
    };
    const frame = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

    const modal = document.querySelector('[aria-modal="true"]');
    const elements = [...document.querySelectorAll<HTMLElement>(selector)]
      .filter(visible)
      // 모달이 열려 있으면 배경은 scrim 아래다 — 모달 안만 잰다
      .filter((element) => modal === null || modal.contains(element));
    // 바깥 요소가 같은 컨트롤을 감싼 경우(label 안 input 등)는 안쪽 하나만 센다.
    const leaves = elements.filter(
      (element) => !elements.some((other) => other !== element && element.contains(other)),
    );
    const out: { name: string; width: number; height: number; edge: boolean; ancestry: string }[] =
      [];
    const ancestryOf = (element: Element): string => {
      const parts: string[] = [];
      let node: Element | null = element;
      for (let depth = 0; depth < 5 && node !== null; depth += 1) {
        if (typeof node.className === 'string' && node.className !== '') parts.push(node.className);
        node = node.parentElement;
      }
      return parts.join(' ');
    };

    for (const element of leaves) {
      // 감싼 label 이 실제 누르는 상자다 (RadioGroup · Checkbox 행) — 그 중심을 지나는 선으로 잰다.
      // 숨은 input 의 중심은 행의 둥근 모서리 안쪽이라 모서리 곡률만큼 짧게 잡힌다(실측 44 → 42).
      // TextField 는 행 전체(`.haru-text-field__row`)가 누르는 상자다 (S1-G-2 — 행 42).
      const box = element.closest('label, .haru-text-field__row') ?? element;
      box.scrollIntoView({ block: 'center', inline: 'center' });
      await frame();
      const rect = box.getBoundingClientRect();
      const cx = Math.round(rect.left + rect.width / 2);
      const cy = Math.round(rect.top + rect.height / 2);
      if (cx < 0 || cy < 0 || cx >= innerWidth || cy >= innerHeight) continue;

      /** 연속 hit 길이 · 뷰포트 가장자리에 닿아 잘렸는지 (잘린 쪽은 hit 로 판정할 수 없다). */
      const run = (axis: 'x' | 'y'): { length: number; edge: boolean } => {
        const limit = 120;
        const at = (delta: number): boolean | null => {
          const x = axis === 'x' ? cx + delta : cx;
          const y = axis === 'y' ? cy + delta : cy;
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return null;
          const hit = document.elementFromPoint(x, y);
          return owns(element, hit) || (hit !== null && box.contains(hit));
        };
        let length = at(0) === true ? 1 : 0;
        let edge = false;
        for (const sign of [-1, 1]) {
          for (let delta = 1; delta <= limit; delta += 1) {
            const hit = at(sign * delta);
            if (hit === null) {
              edge = true;
              break;
            }
            if (!hit) break;
            length += 1;
          }
        }
        return { length, edge };
      };
      const x = run('x');
      const y = run('y');
      out.push({
        name: nameOf(element),
        width: x.length,
        height: y.length,
        edge: x.edge || y.edge,
        ancestry: ancestryOf(element),
      });
    }
    return out;
  }, INTERACTIVE_SELECTOR);
}

export interface FocusStep {
  readonly name: string;
  readonly visibleRing: boolean;
  readonly obscured: boolean;
  readonly inModal: boolean;
}

/**
 * Tab 순회 (2.1.1 · 2.4.7 · 2.4.11). 문서 처음(역방향은 끝)부터 `max` 번 Tab 을 눌러 각 focus 의
 * 표시(outline — 자신 · 의사 요소 · 승인된 위임 요소) · 가려짐(5점 모두 다른 요소) · 모달 안 여부를 읽는다.
 * 같은 요소로 돌아오면(순환) 멈춘다.
 */
export async function focusTour(
  page: Page,
  max = 60,
  direction: 'forward' | 'backward' = 'forward',
): Promise<FocusStep[]> {
  // 순차 탐색 시작점을 문서 맨 앞으로 — blur() 는 시작점을 그 자리에 남긴다(실측).
  await page.evaluate(() => {
    window.getSelection()?.removeAllRanges();
    const start = document.createElement('div');
    start.tabIndex = -1;
    document.body.prepend(start);
    start.focus();
    start.remove();
  });
  const steps: FocusStep[] = [];
  const seen = new Set<string>();

  if (direction === 'backward') {
    // 역방향 시작점 = 문서 끝
    await page.evaluate(() => {
      const end = document.createElement('div');
      end.tabIndex = -1;
      document.body.append(end);
      end.focus();
      end.remove();
    });
  }

  for (let index = 0; index < max; index += 1) {
    await page.keyboard.press(direction === 'forward' ? 'Tab' : 'Shift+Tab');
    const step = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (element === null || element === document.body) return null;
      const key = (() => {
        const path: string[] = [];
        let node: Element | null = element;
        while (node !== null && node !== document.body) {
          const parent: Element | null = node.parentElement;
          path.unshift(String(parent === null ? 0 : [...parent.children].indexOf(node)));
          node = parent;
        }
        return path.join('.');
      })();
      const ringed = (node: Element, pseudo?: string): boolean => {
        const style = getComputedStyle(node, pseudo);
        return style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0;
      };
      const outline = ringed(element);
      // ::before/after 로 그린 링 (hit 확장 패턴)
      const pseudo = ringed(element, '::before') || ringed(element, '::after');
      // 링을 **다른 요소**가 그리는 승인된 패턴 — 행 전체(`:has(:focus-visible)` — TextField §4.13)
      // · 스냅된 카드/페이지(`R-SHADOW-1` ⑤ 트랙). 조상 3단 · 자손까지 본다.
      let ancestor: Element | null = element.parentElement;
      let delegated = false;
      for (let depth = 0; depth < 3 && ancestor !== null; depth += 1) {
        if (ringed(ancestor)) delegated = true;
        ancestor = ancestor.parentElement;
      }
      if (!delegated) delegated = [...element.querySelectorAll('*')].some((node) => ringed(node));
      const rect = element.getBoundingClientRect();
      const points: [number, number][] = [
        [rect.left + rect.width / 2, rect.top + rect.height / 2],
        [rect.left + 2, rect.top + 2],
        [rect.right - 2, rect.top + 2],
        [rect.left + 2, rect.bottom - 2],
        [rect.right - 2, rect.bottom - 2],
      ];
      const covered = points.every(([x, y]) => {
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return true;
        const hit = document.elementFromPoint(x, y);
        return hit !== null && hit !== element && !element.contains(hit);
      });
      const label =
        element.getAttribute('aria-label') ??
        element.textContent?.replace(/\s+/g, ' ').trim() ??
        '';
      return {
        key,
        name: `${element.getAttribute('role') ?? element.tagName.toLowerCase()} · ${label.slice(0, 50)}`,
        visibleRing: outline || pseudo || delegated,
        obscured: covered,
        inModal: element.closest('[aria-modal="true"]') !== null,
        dev: element.closest('.haru-dev-panel') !== null,
      };
    });
    if (step === null) break;
    if (seen.has(step.key)) break;
    seen.add(step.key);
    if (step.dev) continue;
    steps.push({
      name: step.name,
      visibleRing: step.visibleRing,
      obscured: step.obscured,
      inModal: step.inModal,
    });
  }
  return steps;
}

export interface LayoutIssues {
  /** clip/truncate 요소의 잘림 (`scrollHeight > clientHeight + 1` 또는 가로). */
  readonly clipped: string[];
  /** 형제 텍스트 bbox 교차. */
  readonly overlaps: string[];
  /** 인터랙티브 요소 중심이 다른 요소에 덮임 (가운데로 스크롤한 뒤). */
  readonly unclickable: string[];
  /** 문서 가로 넘침 px. */
  readonly horizontalOverflow: number;
}

/**
 * 텍스트 확대 · 간격 주입 뒤의 잘림 · 겹침 · 기능 손실 (Spec §8.2 — WCAG 1.4.4 · 1.4.12).
 */
export async function layoutIssues(page: Page): Promise<LayoutIssues> {
  return page.evaluate(async (selector) => {
    const DEV = '.haru-dev-panel';
    const frame = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    const describe = (element: Element): string => {
      const cls =
        typeof element.className === 'string'
          ? element.className.trim().split(/\s+/).join('.')
          : '';
      const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
      return `${element.tagName.toLowerCase()}${cls === '' ? '' : `.${cls}`} "${text}"`;
    };
    const shown = (element: Element): boolean => {
      if (element.closest(DEV) !== null) return false;
      if (element.closest('[aria-hidden="true"], [hidden]') !== null) return false;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const hasOwnText = (element: Element): boolean =>
      [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
      );

    // ① 잘림 — 텍스트를 직접 가진 요소 중 overflow 가 clip 인 것 (line-clamp · ellipsis 포함)
    const clipped: string[] = [];
    for (const element of document.querySelectorAll('body *')) {
      if (!(element instanceof HTMLElement) || !shown(element) || !hasOwnText(element)) continue;
      const style = getComputedStyle(element);
      const clipsY =
        style.overflowY !== 'visible' && style.overflowY !== 'auto' && style.overflowY !== 'scroll';
      const clipsX =
        style.overflowX !== 'visible' && style.overflowX !== 'auto' && style.overflowX !== 'scroll';
      // 시각 숨김(sr-only) 은 1px 상자다 — 감사 대상 아님
      if (element.clientWidth <= 1 || element.clientHeight <= 1) continue;
      // 설계된 말줄임(Figma 줄 수 제한) — `text-overflow: ellipsis` · `line-clamp`. 판정은 spec 이 기본 상태와 비교해 한다
      const designed =
        style.textOverflow === 'ellipsis' ||
        (style.webkitLineClamp !== '' && style.webkitLineClamp !== 'none');
      const tag = designed ? 'ellipsis' : 'clip';
      if (clipsY && element.scrollHeight > element.clientHeight + 1)
        clipped.push(`${tag} ${describe(element)}`);
      else if (clipsX && element.scrollWidth > element.clientWidth + 1)
        clipped.push(`${tag} ${describe(element)}`);
    }

    // ② 형제 텍스트 겹침 — 같은 부모의 텍스트 leaf 끼리
    const overlaps: string[] = [];
    const parents = new Set<Element>();
    for (const element of document.querySelectorAll('body *')) {
      if (element.parentElement !== null) parents.add(element.parentElement);
    }
    for (const parent of parents) {
      const kids = [...parent.children].filter(
        (child) => shown(child) && (child.textContent ?? '').trim() !== '',
      );
      if (kids.length < 2) continue;
      for (let i = 0; i < kids.length; i += 1) {
        for (let j = i + 1; j < kids.length; j += 1) {
          const a = kids[i];
          const b = kids[j];
          if (a === undefined || b === undefined) continue;
          const sa = getComputedStyle(a).position;
          const sb = getComputedStyle(b).position;
          // 의도된 겹침(absolute 배지 · 스택 카드)은 제외 — 흐름 안 형제끼리만 본다
          // sticky 바(TopBar · 탭바)는 스크롤된 내용 **위에 겹치는 것이 설계**다 — 흐름 안 형제끼리만 본다
          const layered = (value: string) =>
            value === 'absolute' || value === 'fixed' || value === 'sticky';
          if (layered(sa) || layered(sb)) continue;
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (w > 1 && h > 1)
            overlaps.push(`${describe(a)} × ${describe(b)} (${w.toFixed(0)}×${h.toFixed(0)})`);
        }
      }
    }

    // ③ 기능 손실 — 가운데로 스크롤한 뒤 중심이 자기 자신인가
    const unclickable: string[] = [];
    const controls = [...document.querySelectorAll<HTMLElement>(selector)].filter((element) => {
      if (!shown(element) || element.closest('[inert]') !== null) return false;
      if (element instanceof HTMLButtonElement && element.disabled) return false;
      return true;
    });
    // 모달이 열려 있으면 모달 안만 본다 (배경은 의도적으로 덮인다)
    const modal = document.querySelector('[aria-modal="true"]');
    for (const element of controls) {
      if (modal !== null && !modal.contains(element)) continue;
      if (controls.some((other) => other !== element && element.contains(other))) continue;
      element.scrollIntoView({ block: 'center', inline: 'center' });
      await frame();
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const hit = document.elementFromPoint(x, y);
      const ok =
        hit !== null &&
        (hit === element ||
          element.contains(hit) ||
          (hit.closest('label') !== null && hit.closest('label')?.contains(element) === true));
      if (!ok) unclickable.push(`${describe(element)} ← ${hit === null ? 'null' : describe(hit)}`);
    }

    const scroller = document.scrollingElement ?? document.documentElement;
    return {
      clipped,
      overlaps,
      unclickable,
      horizontalOverflow: scroller.scrollWidth - scroller.clientWidth,
    };
  }, INTERACTIVE_SELECTOR);
}

/** WCAG 1.4.12 주입 스타일 (Spec §8.2). */
export const TEXT_SPACING_CSS = `
*, *::before, *::after {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}
p { margin-block-end: 2em !important; }
`;

/** 루트 텍스트 200% (Spec §8.2 ①). */
export const ROOT_200_CSS = 'html { font-size: 200% !important; }';

/** 진행 중인 애니메이션 (Spec §9.4 — reduced-motion). `Spinner` 는 정지 arc 예외. */
export async function runningAnimations(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => animation.playState === 'running')
      .map((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target ?? null;
        const cls =
          target instanceof Element && typeof target.className === 'string' ? target.className : '';
        const name =
          animation instanceof CSSAnimation ? animation.animationName : animation.constructor.name;
        return `${name} @ ${cls.split(/\s+/).slice(0, 2).join('.')}`;
      }),
  );
}

export interface RenderedContrast {
  readonly target: string;
  readonly text: string;
  /** 알파 합성 후 글자색. */
  readonly fg: string;
  /** 글자를 지운 렌더 픽셀의 중앙값 (글리프 bbox). */
  readonly bg: string;
  readonly ratio: number;
  /** 큰 텍스트(≥24px · ≥18.66px bold) = 3.0, 그 밖 4.5. */
  readonly expected: number;
  readonly ancestry: string;
}

const hex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

const HIDE_TEXT_CSS = `*, *::before, *::after {
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: none !important;
  caret-color: transparent !important;
  text-decoration-color: transparent !important;
}`;

/**
 * 렌더 픽셀 대비 (Spec §9.4 1.4.3 · 1.4.11) — axe 가 배경을 판정하지 못한 노드(그래디언트 · glass ·
 * 반투명 표면 · scrim 위 다이얼로그)를 잰다. 글자를 투명으로 바꾼 화면에서 **글리프 bbox(Range)** 의
 * 배경 중앙값을 읽고, computed `color` 의 알파를 그 배경 위에 합성해 WCAG 대비비를 낸다.
 */
export async function measureRendered(
  page: Page,
  targets: readonly string[],
): Promise<RenderedContrast[]> {
  const out: RenderedContrast[] = [];
  const style = await page.addStyleTag({ content: HIDE_TEXT_CSS });
  await style.evaluate((node) => {
    (node as Element).setAttribute('data-e2e', 'hide-text');
  });
  try {
    for (const target of targets) {
      const info = await page.evaluate(async (selector) => {
        const element = document.querySelector(selector);
        if (!(element instanceof HTMLElement)) return null;
        // 모달이 열려 있으면 배경 글자는 scrim 아래(inert)다 — 대비 요구 대상이 아니다
        const modal = document.querySelector('[aria-modal="true"]');
        if (modal !== null && !modal.contains(element)) return null;
        element.scrollIntoView({ block: 'center', inline: 'nearest' });
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
        const range = document.createRange();
        range.selectNodeContents(element);
        const rect = range.getBoundingClientRect();
        // 글자색은 숨김 스타일 **이전** 값 — 숨김 스타일을 잠시 끄고 읽는다
        const sheet = document.querySelector<HTMLStyleElement>('style[data-e2e="hide-text"]');
        if (sheet !== null) sheet.disabled = true;
        const computed = getComputedStyle(element);
        const color = computed.color;
        const size = Number.parseFloat(computed.fontSize);
        const weight = Number.parseInt(computed.fontWeight, 10);
        if (sheet !== null) sheet.disabled = false;
        const parts: string[] = [];
        let node: Element | null = element;
        for (let depth = 0; depth < 9 && node !== null; depth += 1) {
          if (typeof node.className === 'string' && node.className !== '')
            parts.push(node.className);
          node = node.parentElement;
        }
        return {
          x: Math.max(0, Math.floor(rect.left)),
          y: Math.max(0, Math.floor(rect.top)),
          width: Math.min(innerWidth, Math.ceil(rect.right)) - Math.max(0, Math.floor(rect.left)),
          height: Math.min(innerHeight, Math.ceil(rect.bottom)) - Math.max(0, Math.floor(rect.top)),
          color,
          large: size >= 24 || (size >= 18.66 && weight >= 700),
          text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 40),
          ancestry: parts.join(' '),
        };
      }, target);
      if (info === null || info.width < 1 || info.height < 1 || info.text === '') continue;
      // 숨김 스타일이 다시 켜진 프레임
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(resolve);
            });
          }),
      );
      const png = await page.screenshot({
        clip: { x: info.x, y: info.y, width: info.width, height: info.height },
        animations: 'disabled',
        scale: 'css',
      });
      const bitmap = decodePng(png);
      const rs: number[] = [];
      const gs: number[] = [];
      const bs: number[] = [];
      for (let y = 0; y < bitmap.height; y += 1) {
        for (let x = 0; x < bitmap.width; x += 1) {
          const p = pixelAt(bitmap, x, y);
          rs.push(p.r);
          gs.push(p.g);
          bs.push(p.b);
        }
      }
      const median = (values: number[]): number => {
        const sorted = [...values].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length / 2)] ?? 0;
      };
      const bg: Rgb = { r: median(rs), g: median(gs), b: median(bs) };
      const alphaMatch = /rgba?\([^)]*,\s*([\d.]+)\)$/.exec(info.color);
      const alpha =
        info.color.startsWith('rgba') && alphaMatch !== null ? Number(alphaMatch[1]) : 1;
      const raw = parseCssRgb(info.color);
      const fg: Rgb = {
        r: raw.r * alpha + bg.r * (1 - alpha),
        g: raw.g * alpha + bg.g * (1 - alpha),
        b: raw.b * alpha + bg.b * (1 - alpha),
      };
      out.push({
        target,
        text: info.text,
        fg: hex(fg),
        bg: hex(bg),
        ratio: Math.round(contrastRatio(fg, bg) * 100) / 100,
        expected: info.large ? 3 : 4.5,
        ancestry: info.ancestry,
      });
    }
  } finally {
    await style.evaluate((node) => {
      (node as Element).remove();
    });
  }
  return out;
}
