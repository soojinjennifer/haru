// @vitest-environment node
/**
 * 설문 재구성과 함께 고친 결함 3건(`S2-FIX-1`~`S2-FIX-3`)의 **CSS 소스 회귀 가드**.
 *
 * jsdom 은 외부 CSS 를 적용하지 않으므로 컴포넌트 테스트로는 "여백이 몇 px 인가" 를 고정할 수
 * 없다. 그래서 선언과 토큰 값을 **소스에서 직접** 확인하고 산술까지 검산한다
 * (`stage-2-design-spec.md` §16 · 재구성 Design Spec §9.4 회귀 가드 체크리스트).
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

const RADIO_CSS = codeOf(read('packages', 'ui', 'src', 'field', 'RadioGroup.css'));
const CHECKBOX_GROUP_CSS = codeOf(read('packages', 'ui', 'src', 'field', 'CheckboxGroup.css'));
const DECK_CSS = codeOf(read('packages', 'ui', 'src', 'deck', 'SwipeDeck.css'));
const APP_COLUMN_CSS = codeOf(read('packages', 'ui', 'src', 'layout', 'AppColumn.css'));
const LAYOUT_TOKENS = codeOf(read('packages', 'design-tokens', 'src', 'semantic', 'layout.css'));
const SPACE_TOKENS = codeOf(read('packages', 'design-tokens', 'src', 'semantic', 'space.css'));
const TYPO_PRIMITIVES = codeOf(
  read('packages', 'design-tokens', 'src', 'primitive', 'typography.css'),
);
const COMPONENT_TOKENS = codeOf(read('packages', 'design-tokens', 'src', 'component', 'index.css'));
const ONBOARDING_CSS = codeOf(
  read('apps', 'web', 'src', 'features', 'onboarding-survey', 'onboarding.css'),
);

/** `calc(var(--spacing) * n)` 형태의 토큰 값을 px 로 푼다. */
function spacingMultiple(css: string, token: string): number {
  const match = new RegExp(`${token}:\\s*calc\\(var\\(--spacing\\)\\s*\\*\\s*([\\d.]+)\\)`).exec(
    css,
  );
  if (match?.[1] === undefined) throw new Error(`missing token ${token}`);

  const base = /--spacing:\s*(\d+)px/.exec(SPACE_TOKENS)?.[1];
  if (base === undefined) throw new Error('missing --spacing');

  return Number(match[1]) * Number(base);
}

function pxValue(css: string, token: string): number {
  const match = new RegExp(`${token}:\\s*(\\d+)px`).exec(css);
  if (match?.[1] === undefined) throw new Error(`missing token ${token}`);
  return Number(match[1]);
}

describe('`S2-FIX-1` — 화면 하단 인셋 44', () => {
  it('`--layout-cta-bottom-gap` 이 44 다 (Figma 5프레임 실측)', () => {
    expect(spacingMultiple(LAYOUT_TOKENS, '--layout-cta-bottom-gap')).toBe(44);
  });

  it('safe-area 와 **더하지 않고** `max()` 로 고른다', () => {
    expect(APP_COLUMN_CSS).toMatch(
      /\.haru-app-column--bottom-gap\s*\{\s*padding-block-end:\s*max\(var\(--layout-safe-bottom\),\s*var\(--layout-cta-bottom-gap\)\);/,
    );
    // 덧셈이면 iOS 에서 34 + 44 = 78 이 되어 Figma 와 어긋난다.
    expect(APP_COLUMN_CSS).not.toMatch(/calc\(var\(--layout-safe-bottom\)\s*\+/);
  });

  it('`AppColumn` 기본 규칙은 그대로다 (dev gallery `FramePage` baseline 보호)', () => {
    expect(APP_COLUMN_CSS).toMatch(
      /\.haru-app-column\s*\{[^}]*padding-block-end:\s*var\(--layout-safe-bottom\);/,
    );
  });
});

describe('`S2-FIX-2` — 선택지 행 상하 여백 12', () => {
  it('`padding-block` 선언이 있고 `min-block-size` · 세로 중앙 정렬을 유지한다', () => {
    const rule = /\.haru-radio-group__option\s*\{([^}]*)\}/.exec(RADIO_CSS)?.[1] ?? '';

    expect(rule).toMatch(/padding-block:\s*var\(--space-3\);/);
    expect(rule).toMatch(/min-block-size:\s*var\(--radio-row-height\);/);
    // 2줄 이상에서 라디오 원이 **박스 세로 중앙**에 온다 (§16.2 ④ 승인).
    expect(rule).toMatch(/align-items:\s*center;/);
  });

  it('★ 1줄 행은 1px 도 바뀌지 않는다 — `max(44, 20 + 12 + 12)` = 44', () => {
    // `--radio-row-height` → `--size-touch-min` → 44 (component/index.css 가 참조만 한다).
    expect(COMPONENT_TOKENS).toMatch(/--radio-row-height:\s*var\(--size-touch-min\)/);
    const rowHeight = pxValue(SPACE_TOKENS, '--size-touch-min');
    const padding = spacingMultiple(SPACE_TOKENS, '--space-3');
    // `--text-subheadline--line-height` → `--haru-type-subheadline-line` → 20.
    const lineHeight = pxValue(TYPO_PRIMITIVES, '--haru-type-subheadline-line');

    expect(rowHeight).toBe(44);
    expect(lineHeight).toBe(20);
    expect(Math.max(rowHeight, lineHeight + padding * 2)).toBe(44);
    // 2줄 → 64 · 3줄 → 84 (여백은 항상 12 / 12).
    expect(Math.max(rowHeight, lineHeight * 2 + padding * 2)).toBe(64);
    expect(Math.max(rowHeight, lineHeight * 3 + padding * 2)).toBe(84);
  });

  it('비채점 행 구분선이 행 박스 **바깥**(`::before`)에 그려진다', () => {
    expect(ONBOARDING_CSS).toMatch(
      /\.haru-survey-options\s+\.haru-radio-group__option--muted::before\s*\{[^}]*position:\s*absolute;/,
    );
    // 행 안쪽 padding 으로 그리면 세로 중앙이 깨진다 (상 17 / 하 0).
    expect(
      /\.haru-survey-options\s+\.haru-radio-group__option--muted\s*\{([^}]*)\}/.exec(
        ONBOARDING_CSS,
      )?.[1] ?? '',
    ).not.toMatch(/padding-block-start/);
  });

  it('복수 선택 카드 행도 같은 기하를 쓴다 (§3.6)', () => {
    const rule =
      /\.haru-checkbox-group--card\s+\.haru-checkbox-group__option\s*\{([^}]*)\}/.exec(
        CHECKBOX_GROUP_CSS,
      )?.[1] ?? '';

    expect(rule).toMatch(/padding-block:\s*var\(--space-3\);/);
    expect(rule).toMatch(/padding-inline:\s*var\(--space-4\);/);
    expect(rule).toMatch(/min-block-size:\s*var\(--radio-row-height\);/);
    expect(rule).toMatch(/border-radius:\s*var\(--radius-field\);/);
  });
});

describe('`S2-FIX-3` — 앞 카드 표면은 `renderItem` 이 소유한다', () => {
  it('공통 카드 규칙에 표면 선언이 없다', () => {
    const rule = /\.haru-swipe-deck__card\s*\{([^}]*)\}/.exec(DECK_CSS)?.[1] ?? '';

    expect(rule).not.toMatch(/background-color/);
    expect(rule).not.toMatch(/box-shadow/);
    expect(rule).not.toMatch(/border-radius/);
    expect(rule).not.toMatch(/backdrop-filter/);
    expect(rule).not.toMatch(/padding/);
  });

  it('표면은 **뒤 카드**에만 있다', () => {
    const rule = /\.haru-swipe-deck__card--behind\s*\{([^}]*)\}/.exec(DECK_CSS)?.[1] ?? '';

    expect(rule).toMatch(/padding:\s*var\(--space-5\);/);
    expect(rule).toMatch(/background-color:\s*var\(--color-surface-strong\);/);
    expect(rule).toMatch(/box-shadow:\s*var\(--shadow-glass-rest\);/);
  });

  it('앞 카드 규칙은 위치·모션만 갖는다', () => {
    const rule = /\.haru-swipe-deck__card--front\s*\{([^}]*)\}/.exec(DECK_CSS)?.[1] ?? '';

    expect(rule).toMatch(/position:\s*relative;/);
    expect(rule).toMatch(/z-index:\s*1;/);
    expect(rule).toMatch(/touch-action:\s*pan-y;/);
    expect(rule).not.toMatch(/background-color/);
    expect(rule).not.toMatch(/padding/);
  });

  it('★ `SwipeDeck.css` 에 `overflow` 선언이 0건이다 (`QA-1-L1` 그림자 절단 방지)', () => {
    expect(DECK_CSS).not.toMatch(/overflow/);
  });

  it('덱 기하 토큰은 건드리지 않는다 (Figma 와 이미 일치)', () => {
    expect(DECK_CSS).toMatch(
      /padding-block-end:\s*calc\(var\(--deck-levels\)\s*\*\s*var\(--deck-peek-y\)\)/,
    );
    expect(DECK_CSS).toMatch(/inset-inline:\s*var\(--deck-inset-x\)/);
    expect(DECK_CSS).toMatch(/inset-inline:\s*calc\(2\s*\*\s*var\(--deck-inset-x\)\)/);
  });
});

describe('자동 전진 대기 — 기존 모션 토큰 재사용 (신규 토큰 0건, §12.2)', () => {
  const MOTION_TOKENS = codeOf(read('packages', 'design-tokens', 'src', 'semantic', 'motion.css'));
  /*
   * 이 파일은 node 환경이라 `.tsx` 를 포함하는 feature 진입점을 import 할 수 없다
   * (`tsconfig.node.json` 은 `--jsx` 를 켜지 않는다). 그래서 소스 문자열에서 값을 읽는다.
   */
  const DECK_SOURCE = read(
    'apps',
    'web',
    'src',
    'features',
    'onboarding-survey',
    'ui',
    'SurveyCardDeck.tsx',
  );

  it('`AUTO_ADVANCE_DELAY_MS` 가 `--motion-duration-slow` 와 같은 값이다', () => {
    const slow = /--motion-duration-slow:\s*(\d+)ms/.exec(MOTION_TOKENS)?.[1];
    const delay = /AUTO_ADVANCE_DELAY_MS\s*=\s*(\d+)/.exec(DECK_SOURCE)?.[1];

    expect(slow).toBe('400');
    expect(delay).toBe(slow);
  });
});

describe('해제 버튼은 흐름에서 빼낸다 (§3.5 — 카드 22px 회수)', () => {
  const CHARACTER_CSS = codeOf(
    read('apps', 'web', 'src', 'entities', 'character', 'character.css'),
  );

  it('카드가 위치 기준이 되고 해제 버튼이 absolute 다', () => {
    expect(CHARACTER_CSS).toMatch(/\.haru-survey-card\s*\{[^}]*position:\s*relative;/);
    expect(CHARACTER_CSS).toMatch(
      /\.haru-survey-card__clear\s*\{[^}]*position:\s*absolute;[^}]*inset-block-start:\s*var\(--space-3\);[^}]*inset-inline-end:\s*var\(--space-3\);/,
    );
  });
});
