// @vitest-environment node
/**
 * Stage 4b `S4-K2` — 모션 · overflow **소스 회귀 가드** (jsdom 은 외부 CSS 를 적용하지 않으므로 선언을 소스에서 본다).
 *
 * 고정하는 AC
 *  - **AC-4-98** (`D4-3`) — `@keyframes`/`animation` 선언 ↔ `prefers-reduced-motion` 대체 **1:1 대조**. 애니메이션을
 *    쓰는 선언마다 대체 방식을 계산해 아래 표와 **정확히** 맞춘다 → 대체 정의가 없는 새 애니메이션이 생기면 깨진다.
 *    런타임 증거(reduce 에서 무한 모션 0)는 `e2e/session-regression.spec.ts` · `session-recording.spec.ts` 가 갖는다.
 *  - **AC-4-109** (`D4-3`) — 애니메이션 라이브러리 의존성 0 · `.lottie`/`.riv`/Lottie JSON 에셋 0 · 모션 = CSS 뿐
 *    (WAAPI `element.animate(` 0).
 *  - **AC-4-100** (`R-SHADOW-1`) — 세션 화면 CSS 의 `overflow` 선언 목록을 고정하고, 선언마다 근거 주석이 있다.
 *    computed 쪽(Tailwind 유틸리티 포함 — `R-FIGMA-1` ④)은 e2e 가 본다.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');

function read(path: string): string {
  return readFileSync(join(REPO_ROOT, path), 'utf8');
}

function walk(dir: string, accept: (path: string) => boolean): string[] {
  const absolute = join(REPO_ROOT, dir);
  const found: string[] = [];
  for (const entry of readdirSync(absolute)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const full = join(absolute, entry);
    if (statSync(full).isDirectory()) {
      found.push(...walk(relative(REPO_ROOT, full), accept));
    } else if (accept(full)) {
      found.push(relative(REPO_ROOT, full));
    }
  }
  return found;
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/* ===== 최소 CSS 블록 파서 ===================================================================== */

interface CssBlock {
  prelude: string;
  /** 자식 블록을 뺀 이 블록의 선언 텍스트 */
  declarations: string;
  children: CssBlock[];
}

function parseBlocks(css: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  let depth = 0;
  let preludeStart = 0;
  let bodyStart = 0;
  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      if (depth === 0) bodyStart = index + 1;
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        const head = css.slice(preludeStart, bodyStart - 1);
        const prelude = (head.split(';').pop() ?? '').trim();
        const body = css.slice(bodyStart, index);
        const children = parseBlocks(body);
        blocks.push({ prelude, declarations: removeBlocks(body), children });
        preludeStart = index + 1;
      }
    } else if (char === ';' && depth === 0) {
      preludeStart = index + 1;
    }
  }
  return blocks;
}

function removeBlocks(body: string): string {
  let depth = 0;
  let out = '';
  let pending = '';
  for (const char of body) {
    if (char === '{') {
      depth += 1;
      pending = '';
    } else if (char === '}') {
      depth -= 1;
    } else if (depth === 0) {
      pending += char;
      if (char === ';') {
        out += pending;
        pending = '';
      }
    }
  }
  return out + pending;
}

type MotionMedia = 'any' | 'reduce' | 'no-preference';

interface KeyframesRecord {
  file: string;
  name: string;
  media: MotionMedia;
  body: string;
}

interface AnimationUse {
  file: string;
  selector: string;
  value: string;
  media: MotionMedia;
}

function mediaOf(prelude: string, current: MotionMedia): MotionMedia {
  if (!prelude.startsWith('@media')) return current;
  if (/prefers-reduced-motion:\s*reduce/.test(prelude)) return 'reduce';
  if (/prefers-reduced-motion:\s*no-preference/.test(prelude)) return 'no-preference';
  return current;
}

function collect(
  file: string,
  blocks: readonly CssBlock[],
  media: MotionMedia,
  keyframes: KeyframesRecord[],
  uses: AnimationUse[],
): void {
  for (const block of blocks) {
    const keyframesMatch = /^@keyframes\s+([\w-]+)/.exec(block.prelude);
    if (keyframesMatch !== null) {
      keyframes.push({
        file,
        name: keyframesMatch[1] ?? '',
        media,
        body: block.children.map((child) => child.declarations).join('\n'),
      });
      continue;
    }
    const nextMedia = mediaOf(block.prelude, media);
    if (!block.prelude.startsWith('@')) {
      for (const match of block.declarations.matchAll(
        /(?:^|[;\s])animation(?:-name)?\s*:\s*([^;]+)/g,
      )) {
        uses.push({
          file,
          selector: block.prelude.replace(/\s+/g, ' '),
          value: (match[1] ?? '').trim(),
          media: nextMedia,
        });
      }
    }
    collect(file, block.children, nextMedia, keyframes, uses);
  }
}

/* ===== AC-4-98 — keyframes ↔ reduce 1:1 ====================================================== */

const CSS_ROOTS = ['apps/web/src', 'packages/ui/src', 'packages/design-tokens/src'] as const;
const CSS_FILES = CSS_ROOTS.flatMap((root) => walk(root, (path) => extname(path) === '.css'));

const KEYFRAMES: KeyframesRecord[] = [];
const USES: AnimationUse[] = [];
for (const file of CSS_FILES) {
  collect(file, parseBlocks(stripComments(read(file))), 'any', KEYFRAMES, USES);
}

/** `--animate-*` theme key → keyframes 이름 (`theme.css`). */
const THEME = stripComments(read('packages/design-tokens/src/theme.css'));
const ANIMATE_VARS = new Map(
  [...THEME.matchAll(/(--animate-[\w-]+):\s*([\w-]+)/g)].map((match) => [
    match[1] ?? '',
    match[2] ?? '',
  ]),
);

const KEYFRAME_NAMES = new Set(KEYFRAMES.map((record) => record.name));

function keyframeNameOf(value: string): string | null {
  const viaVar = /var\((--animate-[\w-]+)\)/.exec(value);
  if (viaVar !== null) return ANIMATE_VARS.get(viaVar[1] ?? '') ?? null;
  return value.split(/[\s,]+/).find((token) => KEYFRAME_NAMES.has(token)) ?? null;
}

const MOVES = /(?:^|[;\s{])(transform|translate|scale|rotate)\s*:/;

/**
 * 같은 요소에 붙는 **다른 selector** 의 `animation: none` 으로 정지하는 경우 (cascade 순서로 이긴다).
 * 근거를 함께 적고, 그 selector 가 reduce 블록에 `animation: none` 으로 실제 있는지 아래에서 확인한다.
 */
const STOPPED_VIA = {
  // `SwipeDeck.tsx` — exit 카드는 `--front` 와 `--exit-*` 를 함께 갖는다. reduce 블록이 뒤에 오므로 none 이 이긴다.
  'haru-deck-exit-next': '.haru-swipe-deck__card--front',
  'haru-deck-exit-prev': '.haru-swipe-deck__card--front',
} as const;

type Coverage =
  | 'no-preference-only'
  | 'reduce-keyframes'
  | 'reduce-animation-none'
  | 'reduce-animation-none-via'
  | 'opacity-only'
  | 'UNCOVERED';

function reduceStops(file: string, selectors: readonly string[]): boolean {
  return USES.some(
    (use) =>
      use.file === file &&
      use.media === 'reduce' &&
      use.value === 'none' &&
      use.selector
        .split(',')
        .map((part) => part.trim())
        .some((part) => selectors.includes(part)),
  );
}

function coverageOf(use: AnimationUse, name: string): Coverage {
  if (use.media === 'no-preference') return 'no-preference-only';
  if (KEYFRAMES.some((record) => record.name === name && record.media === 'reduce')) {
    return 'reduce-keyframes';
  }
  const selectors = use.selector.split(',').map((part) => part.trim());
  if (reduceStops(use.file, selectors)) return 'reduce-animation-none';
  const via = (STOPPED_VIA as Record<string, string>)[name];
  if (via !== undefined && reduceStops(use.file, [via])) return 'reduce-animation-none-via';
  const body = KEYFRAMES.filter((record) => record.name === name && record.media !== 'reduce')
    .map((record) => record.body)
    .join('\n');
  if (body !== '' && !MOVES.test(body)) return 'opacity-only';
  return 'UNCOVERED';
}

/**
 * 1:1 대조표 — 애니메이션 이름 → 대체 방식. **새 애니메이션은 여기에 들어오기 전까지 이 테스트를 깬다.**
 *  - `no-preference-only` — 모션 자체가 `no-preference` 안에만 있다 (reduce = 최종 상태 즉시)
 *  - `reduce-keyframes` — reduce 블록이 같은 이름의 keyframes 를 **이동 없는 표현**으로 재정의한다
 *  - `reduce-animation-none` / `-via` — reduce 블록이 정지시킨다 (정지값 = 기본 선언값)
 *  - `opacity-only` — 원래 이동이 없는 opacity 전환이다 (reduce 대체와 같은 표현이라 따로 두지 않는다)
 */
const EXPECTED: Record<string, Coverage> = {
  // Stage 4 세션 — 경청 · 맥동 · 완료 (AC-4-98 본 대상)
  'haru-session-breathing': 'reduce-animation-none',
  'haru-record-pulse': 'reduce-animation-none',
  'haru-session-complete-ring': 'no-preference-only',
  'haru-session-complete-enter': 'no-preference-only',
  // Stage 5 `S5-C` 피드백 화면 — 완료 화면 C-2 enter 재사용 (Spec §6)
  'haru-session-feedback-enter': 'no-preference-only',
  // 세션 화면에 함께 뜨는 공용 UI (Toast · 시트 · 다이얼로그 · 배너/공지 슬롯 · scrim)
  'haru-toast-in': 'reduce-keyframes',
  'haru-toast-out': 'opacity-only',
  'haru-sheet-in': 'reduce-keyframes',
  'haru-sheet-out': 'reduce-keyframes',
  'haru-dialog-in': 'reduce-keyframes',
  'haru-dialog-out': 'opacity-only',
  'haru-scrim-in': 'opacity-only',
  'haru-scrim-out': 'opacity-only',
  'haru-alert-in': 'reduce-animation-none',
  // Stage 1~3 공용
  'haru-skeleton-pulse': 'reduce-keyframes',
  'haru-spinner-rotate': 'reduce-keyframes',
  'haru-progress-indeterminate': 'reduce-animation-none',
  'haru-deck-enter': 'reduce-animation-none',
  'haru-deck-exit-next': 'reduce-animation-none-via',
  'haru-deck-exit-prev': 'reduce-animation-none-via',
  // Stage 6 `S6-E1` DiamondChart — 첫 표시 scale+opacity · 선택 링 fade (Stage 6 Spec §3.1 · §6)
  'haru-diamond-enter': 'reduce-animation-none',
  'haru-diamond-ring-in': 'reduce-animation-none',
};

describe('AC-4-98 — `@keyframes`/`animation` ↔ `prefers-reduced-motion` 1:1 (`D4-3`)', () => {
  const live = USES.filter((use) => use.value !== 'none');

  it('파서가 실제 선언을 읽는다 (빈 목록으로 통과하지 않는다)', () => {
    expect(CSS_FILES.length).toBeGreaterThan(20);
    expect(live.length).toBeGreaterThanOrEqual(Object.keys(EXPECTED).length);
    expect(KEYFRAME_NAMES.has('haru-session-breathing')).toBe(true);
  });

  it('모든 animation 선언이 정의된 keyframes 를 가리킨다', () => {
    const unresolved = live
      .filter((use) => keyframeNameOf(use.value) === null)
      .map((use) => `${use.file} ${use.selector}: ${use.value}`);
    expect(unresolved).toStrictEqual([]);
  });

  it('애니메이션마다 대체 방식이 대조표와 정확히 같다 — 대체 정의가 없는 애니메이션 0건', () => {
    const table = new Map<string, Set<Coverage>>();
    for (const use of live) {
      const name = keyframeNameOf(use.value);
      if (name === null) continue;
      const kinds = table.get(name) ?? new Set<Coverage>();
      kinds.add(coverageOf(use, name));
      table.set(name, kinds);
    }
    const computed = Object.fromEntries(
      [...table.entries()].map(([name, kinds]) => [name, [...kinds].sort().join(' + ')]),
    );
    expect(computed).toStrictEqual(EXPECTED);
    expect(Object.values(computed).join(' ')).not.toContain('UNCOVERED');
  });

  it('세션 무한 모션 2종은 reduce 에서 **정지**한다 (대체가 아니라 정지 — Spec §6.6)', () => {
    for (const name of ['haru-session-breathing', 'haru-record-pulse']) {
      const uses = live.filter((use) => keyframeNameOf(use.value) === name);
      expect(uses.length).toBeGreaterThan(0);
      for (const use of uses) {
        expect(use.value).toContain('infinite');
        expect(coverageOf(use, name)).toBe('reduce-animation-none');
      }
    }
  });

  it('reduce 재정의 keyframes 는 이동(transform · translate · scale · rotate)이 없다', () => {
    const moving = KEYFRAMES.filter((record) => record.media === 'reduce')
      .filter((record) => /(transform|translate|scale|rotate)\s*:(?!\s*none\b)/.test(record.body))
      .map((record) => `${record.file} @keyframes ${record.name}`);
    expect(moving).toStrictEqual([]);
  });
});

/* ===== AC-4-109 — 애니메이션 라이브러리 0 · 에셋 0 · CSS 만 ===================================== */

const FORBIDDEN_PACKAGE =
  /(^|\/)(lottie[\w-]*|@lottiefiles\/.*|@rive-app\/.*|rive-[\w-]+|gsap|framer-motion|motion|popmotion|animejs|velocity-animate|react-spring|@react-spring\/.*|react-transition-group|@formkit\/auto-animate|@dotlottie\/.*)$/;

const PACKAGE_JSONS = [
  'package.json',
  ...['apps', 'packages'].flatMap((root) =>
    readdirSync(join(REPO_ROOT, root))
      .map((name) => `${root}/${name}/package.json`)
      .filter((path) => {
        try {
          return statSync(join(REPO_ROOT, path)).isFile();
        } catch {
          return false;
        }
      }),
  ),
];

interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

describe('AC-4-109 — 애니메이션은 CSS 만 (`D4-3`)', () => {
  it('① 워크스페이스 package.json 에 애니메이션 라이브러리 의존성 0건', () => {
    expect(PACKAGE_JSONS).toContain('apps/web/package.json');
    expect(PACKAGE_JSONS).toContain('packages/ui/package.json');
    const hits = PACKAGE_JSONS.flatMap((path) => {
      const manifest = JSON.parse(read(path)) as PackageManifest;
      const names = [
        ...Object.keys(manifest.dependencies ?? {}),
        ...Object.keys(manifest.devDependencies ?? {}),
        ...Object.keys(manifest.peerDependencies ?? {}),
        ...Object.keys(manifest.optionalDependencies ?? {}),
      ];
      return names.filter((name) => FORBIDDEN_PACKAGE.test(name)).map((name) => `${path}: ${name}`);
    });
    expect(hits).toStrictEqual([]);
  });

  it('① lockfile 에도 (전이 의존 포함) 애니메이션 라이브러리 0건', () => {
    const lock = read('pnpm-lock.yaml');
    const packages = [
      ...lock.matchAll(/^ {2}'?(@?[^@\s'][^@\s']*|@[^/\s]+\/[^@\s']+)@[^:\s]+'?:\s*$/gm),
    ].map((match) => match[1] ?? '');
    expect(packages.length).toBeGreaterThan(100);
    expect(packages.filter((name) => FORBIDDEN_PACKAGE.test(name))).toStrictEqual([]);
  });

  it('② `.lottie` · `.riv` 에셋 0건 · 애니메이션 JSON(Lottie 시그니처) 0건', () => {
    const roots = [
      'apps/web/src',
      'apps/web/public',
      'packages/ui/src',
      'packages/design-tokens/src',
    ];
    const files = roots.flatMap((root) => {
      try {
        return walk(root, () => true);
      } catch {
        return [];
      }
    });
    expect(files.length).toBeGreaterThan(100);
    expect(files.filter((path) => ['.lottie', '.riv'].includes(extname(path)))).toStrictEqual([]);
    const lottieJson = files
      .filter((path) => extname(path) === '.json')
      .filter((path) => {
        const text = read(path);
        return /"layers"\s*:/.test(text) && /"fr"\s*:/.test(text) && /"ip"\s*:/.test(text);
      });
    expect(lottieJson).toStrictEqual([]);
  });

  it('③ 모션 = CSS — 소스에 WAAPI(`.animate(`) · 라이브러리 import 0건', () => {
    const sources = ['apps/web/src', 'packages/ui/src'].flatMap((root) =>
      walk(root, (path) => /\.(ts|tsx)$/.test(path) && !/__tests__|\.test\./.test(path)),
    );
    expect(sources.length).toBeGreaterThan(100);
    const hits = sources.filter((path) => {
      const code = read(path);
      return (
        /\.animate\(\s*[[{]/.test(code) ||
        /from\s+['"](lottie|@lottiefiles|@rive-app|gsap|framer-motion|motion\/|react-spring)/.test(
          code,
        )
      );
    });
    expect(hits).toStrictEqual([]);
  });
});

/* ===== AC-4-100 — 세션 화면 overflow 선언 목록 + 근거 주석 ===================================== */

const SESSION_CSS = [
  'apps/web/src/features/storytime-session/storytime-session.css',
  'apps/web/src/features/session-prompts/session-prompts.css',
  'apps/web/src/entities/session/session.css',
] as const;

/** `overflow` 를 선언하는 selector → 근거 주석에 있어야 하는 단서. */
const EXPECTED_OVERFLOW: Record<string, string> = {
  '.haru-session-prompts__list': 'R-SHADOW-1',
  '.haru-session-bubble__prompts': 'R-SHADOW-1',
  '.haru-session-book-chip__title': 'R-SHADOW-1',
  '.haru-attendance-sticker__title, .haru-attendance-sticker__message': 'R-SHADOW-1',
};

describe('AC-4-100 — 세션 화면 `overflow` 선언 (`R-SHADOW-1`)', () => {
  it('선언 목록이 고정돼 있고, 선언마다 바로 앞 주석에 근거가 있다', () => {
    const owners: Record<string, string> = {};
    for (const file of SESSION_CSS) {
      const source = read(file);
      for (const match of source.matchAll(/([^{}]+)\{([^{}]*\boverflow(?:-x|-y)?\s*:[^{}]*)\}/g)) {
        const raw = match[1] ?? '';
        const selector = stripComments(raw).trim().replace(/\s+/g, ' ');
        // 근거 = 이 선언 앞쪽 2000자 안의 주석 (블록 머리 주석 · @container 머리 주석)
        const before = source.slice(Math.max(0, (match.index ?? 0) - 2000), match.index ?? 0) + raw;
        const comments = [...before.matchAll(/\/\*[\s\S]*?\*\//g)].map((comment) => comment[0]);
        owners[selector] = comments.join('\n');
      }
    }
    expect(Object.keys(owners).sort()).toStrictEqual(Object.keys(EXPECTED_OVERFLOW).sort());
    for (const [selector, clue] of Object.entries(EXPECTED_OVERFLOW)) {
      expect(owners[selector], selector).toContain(clue);
    }
  });
});
