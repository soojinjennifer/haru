// @vitest-environment node
/**
 * Library 1라운드 — **토큰·CSS 소스 회귀 가드**.
 *
 * jsdom 은 외부 CSS 를 적용하지 않으므로 컴포넌트 테스트로는 "면이 74% 인가" 를 고정할 수
 * 없다. 그래서 선언과 토큰 값을 **소스에서 직접** 확인하고 산술까지 검산한다
 * (`rework-css-guards.test.ts` · `stage3-css-guards.test.ts` 와 같은 방식).
 *
 * 고정하는 결정
 *   ① `LT-2` radius **7단계** — `--radius-media: 12px` 신설. 표지 10 은 흡수하지 않는다
 *   ② `LT-12` scrim = Figma 실측 `rgb(0 0 0 / 0.34)`
 *   ③ `LT-1` `--color-fg-tertiary` → `--haru-ink-400` + `provisional: P-24`
 *   ④ `L-NEW-06`·`L-NEW-07` `ListGroup`·`ListRow` **기본값 정규화** (변형을 만들지 않았다)
 *   ⑤ `LT-4` `--activity-card-cover-radius` 제거 — **값 10 은 그대로** (Home baseline 불변)
 *   ⑥ `R-SHADOW-1` 시트 본문 inset = 픽셀 프로브 실측값(아래 10 · 좌우 4) + 음수 margin 짝
 *   ⑦ **바꾸지 않은 것**: `--color-divider` · `--color-progress-track` (Settings·온보딩 전역)
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');

function read(...segments: readonly string[]): string {
  return readFileSync(join(REPO_ROOT, ...segments), 'utf8');
}

/** 주석에는 규칙 설명으로 수치·금지 패턴이 등장하므로 검사 전에 지운다. */
function codeOf(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

const RADIUS_TOKENS = codeOf(read('packages', 'design-tokens', 'src', 'semantic', 'radius.css'));
const COLOR_TOKENS = read('packages', 'design-tokens', 'src', 'semantic', 'color.css');
const COMPONENT_TOKENS = codeOf(read('packages', 'design-tokens', 'src', 'component', 'index.css'));
const LIST_CSS = codeOf(read('packages', 'ui', 'src', 'list', 'List.css'));
const SHEET_CSS = codeOf(read('packages', 'ui', 'src', 'sheet', 'Sheet.css'));
const SECTION_CSS = codeOf(read('packages', 'ui', 'src', 'section', 'SectionHeader.css'));
const BOOK_CSS = codeOf(read('apps', 'web', 'src', 'entities', 'book', 'book.css'));
const SHELF_CSS = codeOf(read('apps', 'web', 'src', 'entities', 'book', 'book-shelf.css'));
const SHELVES_CSS = codeOf(read('apps', 'web', 'src', 'features', 'library', 'library.css'));
const CARD_CSS = codeOf(
  read('apps', 'web', 'src', 'entities', 'activity-card', 'activity-card.css'),
);

/**
 * `box-shadow` 를 **겹 단위**로 쪼갠다.
 *
 * 쉼표 분리를 단순 정규식으로 하면 `color-mix(in srgb, var(--x) 8%, transparent)` 안쪽 쉼표에서
 * 잘려 겹 수를 잘못 센다 — Design Spec §8.1 이 기록한 측정 함정이다. 그래서 **괄호 깊이**를
 * 세면서 자른다.
 */
function splitShadowLayers(value: string): string[] {
  const layers: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of value) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;

    if (char === ',' && depth === 0) {
      layers.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim().length > 0) layers.push(current.trim());

  return layers;
}

/** 규칙 블록(`.selector { … }`)의 본문을 꺼낸다. */
function rule(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? '';
}

describe('`LT-2` radius 7단계 — Stage 0 #10-② 개정 (L-OPEN-09)', () => {
  it('`--radius-media: 12px` 가 control 과 field 사이에 들어 있다', () => {
    expect(RADIUS_TOKENS).toMatch(/--radius-media:\s*12px;/);

    const order = ['--radius-control', '--radius-media', '--radius-field'].map((name) =>
      RADIUS_TOKENS.indexOf(name),
    );
    expect(order.every((index) => index > -1)).toBe(true);
    expect(order).toStrictEqual([...order].sort((a, b) => a - b));
  });

  it('semantic radius 는 7개다 (8단계로 늘리지 않았다 — §17.3 승인 범위)', () => {
    const names = [...RADIUS_TOKENS.matchAll(/(--radius-[a-z-]+):/g)].map((match) => match[1]);
    expect(names).toStrictEqual([
      '--radius-indicator',
      '--radius-control',
      '--radius-media',
      '--radius-field',
      '--radius-surface',
      '--radius-card',
      '--radius-pill',
    ]);
  });

  /*
   * 표지 10 은 8(Δ−2)·12(Δ+2) **동점**이라 흡수 근거가 없고, 지금 정확히 10 으로 렌더되고
   * 있다. 12 로 흡수하면 **없던 Δ2 를 새로 만들고 Home 카드 baseline 이 변한다**.
   */
  it('표지 10 을 `--radius-media` 로 흡수하지 않았다 — Tier 3 가 10 을 그대로 갖는다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--book-cover-radius-xl:\s*10px;/);
    expect(COMPONENT_TOKENS).not.toMatch(/--book-cover-radius-xl:\s*var\(--radius-media\)/);
  });
});

describe('`LT-12` scrim · `LT-1` 3차 회색', () => {
  it('scrim 이 Figma 실측값이고 가값 주석이 없다 (P-05 해제)', () => {
    expect(codeOf(COLOR_TOKENS)).toMatch(/--color-scrim:\s*rgb\(0 0 0 \/ 0\.34\);/);
    // 남색 기운 HEX 가 돌아오면 실패한다 (값 자체는 token-tiers 테스트가 고정한다).
    expect(/--color-scrim:\s*#/.test(codeOf(COLOR_TOKENS))).toBe(false);
    expect(/provisional:\s*P-05/.test(COLOR_TOKENS)).toBe(false);
  });

  it('`--color-fg-tertiary` 가 ink-400 이고 `P-24` 로 표시되어 있다', () => {
    expect(codeOf(COLOR_TOKENS)).toMatch(/--color-fg-tertiary:\s*var\(--haru-ink-400\);/);

    const tertiaryIndex = COLOR_TOKENS.indexOf('--color-fg-tertiary');
    const marker = COLOR_TOKENS.lastIndexOf('provisional: P-24', tertiaryIndex);
    expect(marker).toBeGreaterThan(-1);
  });

  it('secondary 는 그대로 ink-500 이다 (두 단계가 다시 같아지면 실패)', () => {
    expect(codeOf(COLOR_TOKENS)).toMatch(/--color-fg-secondary:\s*var\(--haru-ink-500\);/);
  });

  /*
   * ⚠ Design Spec §5.3 "흡수" 목록 — **토큰 값을 바꾸지 않는 것**이다.
   * `--color-divider`(Settings `ListRow` 전역) · `--color-progress-track`(온보딩 ProgressBar)
   * 를 Figma 값(10% / 14%)으로 바꾸면 Stage 2 baseline 이 변한다.
   */
  it('`--color-divider` · `--color-progress-track` 은 바꾸지 않았다 (전역 흡수)', () => {
    expect(codeOf(COLOR_TOKENS)).toMatch(/--color-divider:\s*var\(--haru-ink-600-a12\)/);
    expect(codeOf(COLOR_TOKENS)).toMatch(/--color-progress-track:\s*var\(--haru-ink-600-a12\)/);
  });
});

describe('`L-NEW-06`·`L-NEW-07` ListGroup · ListRow 기본값 정규화', () => {
  it('ListGroup 면이 glass(74%) 이고 그림자가 1겹이다 (Figma `30:140`)', () => {
    const group = rule(LIST_CSS, '.haru-list-group');

    expect(group).toMatch(/background-color:\s*var\(--color-surface-glass\);/);
    expect(group).toMatch(/box-shadow:\s*var\(--shadow-bubble\);/);
    // 추정값(90% + 3겹)이 되돌아오면 실패한다.
    expect(group).not.toMatch(/--color-surface-strong/);
    expect(group).not.toMatch(/--shadow-glass-rest/);
  });

  it('ListRow 제목이 subheadline(15) 이다 (Figma 원문 14 → 흡수)', () => {
    const title = rule(LIST_CSS, '.haru-list-row__title');

    expect(title).toMatch(/font-size:\s*var\(--text-subheadline\);/);
    expect(title).toMatch(/line-height:\s*var\(--text-subheadline--line-height\);/);
    expect(title).not.toMatch(/--text-footnote/);
  });

  /* 기본값이 Figma 와 같아졌으므로 Library 전용 변형을 **만들지 않았다** (§20.3 ③). */
  it('Library 전용 변형(`tone` · `titleVariant`)을 만들지 않았다', () => {
    expect(LIST_CSS).not.toMatch(/\.haru-list-group--glass/);
    expect(LIST_CSS).not.toMatch(/\.haru-list-row--title-/);

    const groupSource = read('packages', 'ui', 'src', 'list', 'ListGroup.tsx');
    const rowSource = read('packages', 'ui', 'src', 'list', 'ListRow.tsx');
    expect(codeOf(groupSource)).not.toContain('tone');
    expect(codeOf(rowSource)).not.toContain('titleVariant');
  });

  it('media 행 최소 높이가 74 이고 기본 행은 56 그대로다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--book-list-row-height-min:\s*74px;/);
    expect(COMPONENT_TOKENS).toMatch(/--list-row-height-min:\s*56px;/);
    expect(rule(LIST_CSS, '.haru-list-row--media .haru-list-row__content')).toMatch(
      /min-block-size:\s*var\(--book-list-row-height-min\);/,
    );
    expect(rule(LIST_CSS, '.haru-list-row__content')).toMatch(
      /min-block-size:\s*var\(--list-row-height-min\);/,
    );
  });

  it('meta 행은 양끝 정렬 + baseline 이고 제목만 말줄임한다 (§20.2 — 평점은 줄이지 않는다)', () => {
    const metaRow = rule(LIST_CSS, '.haru-list-row__meta-row');
    expect(metaRow).toMatch(/justify-content:\s*space-between;/);
    expect(metaRow).toMatch(/align-items:\s*baseline;/);

    // 평점은 줄어들지 않는다 (`flex: 0 0 auto`).
    expect(rule(LIST_CSS, '.haru-list-row__meta')).toMatch(/flex:\s*0 0 auto;/);

    /*
      좌측 메타는 **말줄임하지 않는다** — 좁은 폭에서는 줄바꿈한다.
      잘라내면 `finished {date}` 가 사라진다 (§20.2 는 "제목만 말줄임" 이다).
    */
    const subtitleInMetaRow = rule(LIST_CSS, '.haru-list-row__meta-row .haru-list-row__subtitle');
    expect(subtitleInMetaRow).toMatch(/min-inline-size:\s*0;/);
    expect(subtitleInMetaRow).not.toMatch(/text-overflow/);

    // 제목 1줄 말줄임은 media 행에만 걸린다.
    expect(rule(LIST_CSS, '.haru-list-row--media .haru-list-row__title')).toMatch(
      /text-overflow:\s*ellipsis;/,
    );
  });
});

describe('`LT-4` 표지 radius 정규화 — 렌더 변화 0 (Home baseline 불변)', () => {
  it('간격 토큰 오용(`--activity-card-cover-radius`)이 사라졌다', () => {
    expect(COMPONENT_TOKENS).not.toContain('--activity-card-cover-radius');
    expect(CARD_CSS).not.toContain('--activity-card-cover-radius');
  });

  it('Home 카드 표지가 `--book-cover-radius-xl`(10) 을 쓴다 — 값이 바뀌지 않았다', () => {
    expect(CARD_CSS).toMatch(/border-radius:\s*var\(--book-cover-radius-xl\);/);
    expect(COMPONENT_TOKENS).toMatch(/--book-cover-radius-xl:\s*10px;/);

    /*
      구 정의는 `--activity-card-cover-radius: var(--space-2-5)` 였다.
      `--space-2-5` = `calc(var(--spacing) * 2.5)` = 4 × 2.5 = **10** 이므로 새 리터럴 10 과
      같다 → Home 카드 표지 radius 는 1px 도 움직이지 않는다. 그 산술을 여기에서 검산한다.
    */
    const spaceTokens = codeOf(read('packages', 'design-tokens', 'src', 'semantic', 'space.css'));
    const spacing = Number(/--spacing:\s*([\d.]+)px;/.exec(spaceTokens)?.[1] ?? '0');
    const multiple = Number(
      /--space-2-5:\s*calc\(var\(--spacing\) \* ([\d.]+)\);/.exec(spaceTokens)?.[1] ?? '0',
    );
    expect(spacing * multiple).toBe(10);
  });
});

describe('`LT-3`·`LT-5` BookCover size', () => {
  it('Tier 3 치수가 Figma 실측값이다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--book-cover-w-sm:\s*34px;/);
    expect(COMPONENT_TOKENS).toMatch(/--book-cover-w-xl:\s*64px;/);
    expect(COMPONENT_TOKENS).toMatch(/--book-cover-h-xl:\s*90px;/);
    expect(COMPONENT_TOKENS).toMatch(/--library-shelf-cover-aspect:\s*107 \/ 151;/);
  });

  it('size 별 radius 가 Figma 와 맞다 (sm 7→8 흡수 · lg 12 · xl 10)', () => {
    expect(rule(BOOK_CSS, '.haru-book-cover')).toMatch(/border-radius:\s*var\(--radius-control\);/);
    expect(rule(BOOK_CSS, '.haru-book-cover--lg')).toMatch(
      /border-radius:\s*var\(--radius-media\);/,
    );
    expect(rule(BOOK_CSS, '.haru-book-cover--xl')).toMatch(
      /border-radius:\s*var\(--book-cover-radius-xl\);/,
    );
  });

  it('lg 는 폭을 갖지 않고 호출 측 그리드가 정한다 (퍼센트 열)', () => {
    const lg = rule(BOOK_CSS, '.haru-book-cover--lg');
    expect(lg).toMatch(/inline-size:\s*100%;/);
    expect(lg).toMatch(/aspect-ratio:\s*var\(--library-shelf-cover-aspect\);/);
  });

  it('xl 은 64×90 두 변을 직접 갖고 aspect 를 끈다 (7/10 과 어긋난다)', () => {
    const xl = rule(BOOK_CSS, '.haru-book-cover--xl');
    expect(xl).toMatch(/inline-size:\s*var\(--book-cover-w-xl\);/);
    expect(xl).toMatch(/block-size:\s*var\(--book-cover-h-xl\);/);
    expect(xl).toMatch(/aspect-ratio:\s*auto;/);
  });

  /* `object-fit: cover` 가 잘라내므로 클리핑 박스를 만들 필요가 없다 (§0.4). */
  it('book.css 에 `overflow` 선언이 여전히 0건이다', () => {
    expect(BOOK_CSS).not.toMatch(/overflow(-x|-y)?\s*:/);
  });
});

describe('`LT-7`·`L-NEW-03` Sheet inset-card', () => {
  it('좌우·아래 inset 이 14 이고 아래는 safe-area 를 가산한다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--sheet-inset-inline:\s*var\(--space-3-5\);/);
    expect(COMPONENT_TOKENS).toMatch(
      /--sheet-inset-block-end:\s*calc\(var\(--space-3-5\) \+ var\(--layout-safe-bottom\)\);/,
    );
  });

  it('radius 는 네 모서리 28 이고 padding 은 18 이다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--sheet-inset-radius:\s*var\(--radius-card\);/);
    expect(COMPONENT_TOKENS).toMatch(/--sheet-inset-pad:\s*var\(--space-4-5\);/);

    const inset = rule(SHEET_CSS, '.haru-sheet--inset-card');
    expect(inset).toMatch(/border-radius:\s*var\(--sheet-inset-radius\);/);
    expect(inset).toMatch(/padding:\s*var\(--sheet-inset-pad\);/);
  });

  it('앱 컬럼 안에서도 좌우 14 를 유지한다 (480 − 2×14 = 452)', () => {
    expect(rule(SHEET_CSS, '.haru-sheet--inset-card')).toMatch(
      /max-inline-size:\s*calc\(var\(--layout-app-max-width\) - 2 \* var\(--sheet-inset-inline\)\);/,
    );
  });

  it('변형 규칙이 기본 규칙보다 **뒤**에 온다 (padding·radius override 성립)', () => {
    expect(SHEET_CSS.indexOf('.haru-sheet--inset-card')).toBeGreaterThan(
      SHEET_CSS.indexOf('.haru-sheet {'),
    );
  });

  it('기본 변형(`bottom`)의 외형 선언이 그대로다', () => {
    const base = rule(SHEET_CSS, '.haru-sheet');
    expect(base).toMatch(/padding:\s*var\(--space-6\);/);
    expect(base).toMatch(/border-start-start-radius:\s*var\(--sheet-radius-top\);/);
  });
});

describe('`R-SHADOW-1` 시트 본문 그림자 inset — 픽셀 프로브 실측값', () => {
  it('inset 값이 `--shadow-bubble` 실측(아래 10 · 좌우 4)과 같다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--sheet-content-shadow-inset-block-end:\s*10px;/);
    expect(COMPONENT_TOKENS).toMatch(/--sheet-content-shadow-inset-inline:\s*4px;/);
  });

  /*
   * 산술 검산: `--shadow-bubble` 의 drop 1겹은 `0 6px 4px` 다.
   *   아래 = offset 6 + blur 4 = 10 ✓ / 위 = −6 + 4 = −2 → 0 ✓ / 좌우 = ±4 ✓
   * 1겹이라 **누락할 겹이 없다** (`--shadow-glass-rest` 3겹 사고의 재발 방지).
   */
  it('`--shadow-bubble` 이 여전히 drop 1겹이다 (겹이 늘면 inset 을 다시 재야 한다)', () => {
    const shadows = codeOf(read('packages', 'design-tokens', 'src', 'semantic', 'shadow.css'));
    const bubble = /--shadow-bubble:([^;]*);/.exec(shadows)?.[1] ?? '';
    const layers = splitShadowLayers(bubble);

    expect(layers.filter((layer) => !layer.startsWith('inset'))).toHaveLength(1);
    expect(layers[0]).toMatch(/0 6px 4px/);
  });

  /* 비교: 3겹 토큰은 3겹으로 세어진다 — 분리 로직이 헛돌지 않음을 함께 고정한다. */
  it('분리 로직이 `--shadow-glass-rest` 를 3겹으로 센다 (검사 자체의 검정)', () => {
    const shadows = codeOf(read('packages', 'design-tokens', 'src', 'semantic', 'shadow.css'));
    const glass = /--shadow-glass-rest:([^;]*);/.exec(shadows)?.[1] ?? '';
    const layers = splitShadowLayers(glass);

    expect(layers.filter((layer) => !layer.startsWith('inset'))).toHaveLength(3);
  });

  it('padding 과 음수 margin 이 짝으로 들어 있다 (레이아웃 점유 되돌리기)', () => {
    const inset = rule(SHEET_CSS, '.haru-sheet__content--shadow-inset');

    expect(inset).toMatch(/padding-block-end:\s*var\(--sheet-content-shadow-inset-block-end\);/);
    expect(inset).toMatch(/padding-inline:\s*var\(--sheet-content-shadow-inset-inline\);/);
    expect(inset).toMatch(
      /margin-block-end:\s*calc\(-1 \* var\(--sheet-content-shadow-inset-block-end\)\);/,
    );
    expect(inset).toMatch(
      /margin-inline:\s*calc\(-1 \* var\(--sheet-content-shadow-inset-inline\)\);/,
    );
  });

  it('기본 `.haru-sheet__content` 에는 inset 이 없다 (opt-in)', () => {
    const base = rule(SHEET_CSS, '.haru-sheet__content');
    expect(base).toMatch(/overflow-y:\s*auto;/);
    expect(base).not.toMatch(/padding/);
    expect(base).not.toMatch(/margin/);
  });
});

describe('`LT-13` SectionHeader hit area 44 (§9.2)', () => {
  it('토큰이 터치 최소값을 가리킨다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--section-header-action-hit:\s*var\(--size-touch-min\);/);
  });

  /* 시각 크기(39×14)를 바꾸지 않고 `::after` 로만 넓힌다 — `IconButton::before` 선례. */
  it('`::after` 가 세로를 대칭 확장하고 가로 최소 44 를 보장한다', () => {
    const after = rule(SECTION_CSS, '.haru-section-header__action::after');

    expect(after).toMatch(/position:\s*absolute;/);
    expect(after).toMatch(
      /inset-block:\s*calc\(\s*\(var\(--text-caption-1--line-height\) - var\(--section-header-action-hit\)\) \/ 2\s*\);/,
    );
    expect(after).toMatch(/min-inline-size:\s*var\(--section-header-action-hit\);/);
  });

  it('액션 상자가 `position: relative` 다 (hit area 기준점)', () => {
    expect(rule(SECTION_CSS, '.haru-section-header__action')).toMatch(/position:\s*relative;/);
  });

  it('제목은 17/Bold 이고 우측 슬롯은 12/Medium tertiary 다', () => {
    const title = rule(SECTION_CSS, '.haru-section-header__title');
    expect(title).toMatch(/font-size:\s*var\(--text-headline\);/);
    expect(title).toMatch(/font-weight:\s*var\(--font-weight-bold\);/);

    for (const selector of ['.haru-section-header__action', '.haru-section-header__meta']) {
      const slot = rule(SECTION_CSS, selector);
      expect(slot).toMatch(/font-size:\s*var\(--text-caption-1\);/);
      expect(slot).toMatch(/font-weight:\s*var\(--font-weight-medium\);/);
      expect(slot).toMatch(/color:\s*var\(--color-fg-tertiary\);/);
    }
  });

  it('헤더는 baseline 정렬 + space-between 이고 높이를 고정하지 않는다', () => {
    const header = rule(SECTION_CSS, '.haru-section-header');
    expect(header).toMatch(/align-items:\s*baseline;/);
    expect(header).toMatch(/justify-content:\s*space-between;/);
    expect(header).not.toMatch(/block-size/);
  });
});

/*
 * ───────────────────────────────────────────────────────────────────────────
 * 2라운드 — 캐러셀 `overflow-x` 와 그림자 자리 (`R-SHADOW-1` · `L-NEW-01`)
 *
 * `--shadow-cover` 번짐은 **픽셀 프로브 실측**이다 (빌드 산출물 CSS, 흰 배경, dSF 1):
 *   위 **8** · 아래 **20** · 좌우 **14**  — 겹 2개(drop + inset)를 괄호 보존 분리로 전수 확인.
 * 좌우 14 는 gutter(24) bleed 가 흡수하므로 inset 이 필요 없다.
 */
describe('`L-NEW-01` 캐러셀 가로 트랙 — overflow 예외와 그림자 자리', () => {
  it('`book.css` 는 여전히 `overflow` **0건**이다 — 트랙은 별도 파일이 소유한다', () => {
    expect(BOOK_CSS).not.toMatch(/overflow(-x|-y)?\s*:/);
  });

  it('가로 클리핑 박스는 **트랙 하나뿐**이다', () => {
    const owners = [...SHELF_CSS.matchAll(/([^{}]+)\{([^}]*overflow-x:\s*auto[^}]*)\}/g)].map(
      (match) => (match[1] ?? '').trim(),
    );
    expect(owners).toStrictEqual(['.haru-shelf-track']);
    // feature CSS 와 `ReadingNowCard` 는 클리핑 박스를 만들지 않는다.
    expect(SHELVES_CSS).not.toMatch(/overflow(-x|-y)?\s*:/);
  });

  it('그림자 자리 = 실측 번짐(위 8 · 아래 20)이고 **음수 margin 과 짝**이다', () => {
    const track = rule(SHELF_CSS, '.haru-shelf-track');
    expect(track).toMatch(/padding-block-start:\s*var\(--space-2\);/);
    expect(track).toMatch(/padding-block-end:\s*var\(--space-5\);/);
    expect(track).toMatch(/margin-block-start:\s*calc\(-1 \* var\(--space-2\)\);/);
    expect(track).toMatch(/margin-block-end:\s*calc\(-1 \* var\(--space-5\)\);/);
  });

  it('`block-size` 를 선언하지 않는다 — 내용이 높이를 정하므로 가산 보정이 필요 없다', () => {
    const track = rule(SHELF_CSS, '.haru-shelf-track');
    expect(track).not.toMatch(/(^|[\s;])block-size:/);
    expect(track).toMatch(/box-sizing:\s*border-box;/);
  });

  it('가로는 gutter bleed 이며 `inline-size` 에 inset 이 **가산**되어 있다', () => {
    const track = rule(SHELF_CSS, '.haru-shelf-track');
    expect(track).toMatch(/margin-inline:\s*calc\(-1 \* var\(--layout-gutter\)\);/);
    expect(track).toMatch(/inline-size:\s*calc\(100% \+ 2 \* var\(--layout-gutter\)\);/);
    expect(track).toMatch(/padding-inline:\s*var\(--layout-gutter\);/);
  });

  it('페이지 사이 간격 = gutter — 다음 페이지가 gutter 에 비치지 않는다 (Figma 에 peek 없음)', () => {
    expect(rule(SHELF_CSS, '.haru-shelf-track')).toMatch(/column-gap:\s*var\(--layout-gutter\);/);
  });

  it('포커스 링은 트랙이 아니라 **스냅된 페이지**에 붙는다 (`R-SHADOW-1` ⑤)', () => {
    expect(rule(SHELF_CSS, '.haru-shelf-track:focus-visible')).toMatch(/outline:\s*none;/);
    expect(SHELF_CSS).toMatch(
      /\.haru-shelf-track:focus-visible \.haru-shelf-page\[data-active='true'\]/,
    );
  });

  it('퍼센트 그리드가 **실측 열 offset** 을 재현한다 (0 / 35.0574% / 69.2528%)', () => {
    const columns = /grid-template-columns:\s*([^;]+);/.exec(rule(SHELF_CSS, '.haru-shelf-page'));
    const parts = (columns?.[1] ?? '').split(/\s+/).map((part) => Number.parseFloat(part));
    expect(parts).toHaveLength(5);

    const [cover1, gap1, cover2, gap2, cover3] = parts as [number, number, number, number, number];

    // 표지 폭은 세 열 모두 같다 — Figma 자신의 규칙 `표지 = content × 31.0145%` (§10).
    expect(cover1).toBe(31.0145);
    expect(cover2).toBe(31.0145);
    expect(cover3).toBe(31.0145);

    /*
      ⚠️ 간격은 Design Spec §8.2 가 적은 4.0472 / 3.1862 가 **아니다** — 그 값은 §3.3 의
      실측 열 offset 과 어긋나고 §8.2 자신이 적은 합(100.267%)과도 맞지 않는다.
      **실측 offset 에서 역산한 값**을 고정한다.
    */
    expect(cover1 + gap1).toBeCloseTo(35.0574, 4);
    expect(cover1 + gap1 + cover2 + gap2).toBeCloseTo(69.2528, 4);
    expect(parts.reduce((total, part) => total + part, 0)).toBeCloseTo(100.2673, 4);

    // 검산(content 345): 3번째 표지가 0.92px 넘친다 — Figma 자신의 기하다.
    const end = (345 * (cover1 + gap1 + cover2 + gap2 + cover3)) / 100;
    expect(end - 345).toBeGreaterThan(0.9);
    expect(end - 345).toBeLessThan(0.95);
  });

  it('Skeleton 캐러셀도 **같은 퍼센트 그리드**를 쓴다 (도착 시 들썩이지 않는다)', () => {
    const live = /grid-template-columns:\s*([^;]+);/.exec(rule(SHELF_CSS, '.haru-shelf-page'));
    const skeleton = /grid-template-columns:\s*([^;]+);/.exec(
      rule(SHELVES_CSS, '.haru-library-shelves__skeleton-shelf'),
    );
    expect(skeleton?.[1]).toBe(live?.[1]);
  });

  it('`lg` 표지는 이미지가 상자 높이를 밀지 못한다 (실측 결함 151 → 152.97 방지)', () => {
    expect(rule(BOOK_CSS, '.haru-book-cover--lg')).toMatch(/position:\s*relative;/);
    const img = rule(BOOK_CSS, '.haru-book-cover--lg img');
    expect(img).toMatch(/position:\s*absolute;/);
    expect(img).toMatch(/inset:\s*0;/);
  });

  /*
   * `L-R2-01` (approvals §22.1) — 같은 결함이 `sm`(48.5625 → 48.59375) ·
   * `md`(82.84375 → 82.90625) 에도 있었다. 실제 높이 단언은 `e2e/book-cover.spec.ts` 가
   * 한다 (CSS 문자열로는 밀림을 볼 수 없다). 여기서는 **수단이 지워지지 않았는지**만 고정한다.
   */
  it.each(['sm', 'md'] as const)(
    '`%s` 표지도 이미지를 흐름에서 뺀다 (`L-R2-01` — 세 크기 전부 고쳤다)',
    (size) => {
      expect(rule(BOOK_CSS, `.haru-book-cover--${size}`)).toMatch(/position:\s*relative;/);
    },
  );

  it('`sm`·`md` 이미지가 `position: absolute; inset: 0` 을 **함께** 받는다', () => {
    // `rule()` 은 단일 선택자용이다 — 그룹 선택자는 공백에 견디는 정규식으로 직접 꺼낸다.
    const img =
      /\.haru-book-cover--sm img,\s*\.haru-book-cover--md img\s*\{([^}]*)\}/.exec(BOOK_CSS)?.[1] ??
      '';
    expect(img).toMatch(/position:\s*absolute;/);
    expect(img).toMatch(/inset:\s*0;/);
  });

  it('`xl` 은 적용 대상이 아니다 — 두 변을 직접 선언해 면역이다 (실측 90 유지)', () => {
    expect(rule(BOOK_CSS, '.haru-book-cover--xl')).toMatch(
      /block-size:\s*var\(--book-cover-h-xl\);/,
    );
    expect(BOOK_CSS).not.toMatch(/\.haru-book-cover--xl img\s*\{[^}]*position:\s*absolute/);
  });

  it('캐러셀 블록 높이는 **최소값**이다 — 캡션 2줄에서 늘어나야 한다 (§6.3 ④)', () => {
    const block = rule(SHELF_CSS, '.haru-shelf-carousel');
    expect(block).toMatch(/min-block-size:\s*var\(--library-shelf-block-size\);/);
    expect(block).not.toMatch(/(^|[\s;])block-size:/);
  });

  it('섹션 간격은 **전부 16** 이다 (헤더↔본문 · 섹션↔섹션 구분 없음)', () => {
    expect(rule(SHELVES_CSS, '.haru-library-shelves')).toMatch(/gap:\s*var\(--space-4\);/);
    // 하단에 탭바 padding 을 다시 더하지 않는다 (이중 계상 금지).
    expect(rule(SHELVES_CSS, '.haru-library-shelves')).not.toMatch(/padding-block-end:/);
  });
});

describe('신규 CSS 에 임의 값이 없다 (rules/frontend.md §6)', () => {
  it.each([
    ['SectionHeader.css', SECTION_CSS],
    ['List.css', LIST_CSS],
    ['Sheet.css', SHEET_CSS],
    ['book.css', BOOK_CSS],
    ['book-shelf.css', SHELF_CSS],
    [
      'library.css (entities)',
      codeOf(read('apps', 'web', 'src', 'entities', 'library', 'library.css')),
    ],
    ['library.css (features)', SHELVES_CSS],
  ])('%s 에 HEX · 색 함수 리터럴이 없다', (_name, css) => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(css).not.toMatch(/\brgba?\(/);
  });
});
