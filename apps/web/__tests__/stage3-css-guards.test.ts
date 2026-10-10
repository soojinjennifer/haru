// @vitest-environment node
/**
 * Stage 3 CSS **소스 회귀 가드** — jsdom 은 외부 CSS 를 적용하지 않으므로 선언을 소스에서
 * 직접 확인한다 (Stage 2 `rework-css-guards.test.ts` 와 같은 방식).
 *
 * 고정하는 결정
 *  - `§2.1 D-1` — 탭바 하단 확보량은 **overhang 뿐**이고 `--layout-tabbar-height` 를 더하지
 *    않는다. 확보 지점은 **한 곳**(`.haru-app-shell__bar-bottom`)이다.
 *  - `§2.1` — Toast 하단 offset 에 overhang 이 더해져 중앙 버튼과 겹치지 않는다 (`AD-S3-14`).
 *  - `§5.3 D-13 ③` — `BookCover` 는 **고정 aspect + `object-fit: cover`** 다 (`QA-2-004`).
 *  - **Home 재구현 (2026-10-05, approvals §12 · audit §16)** — 아래 세 규칙이 **바뀌었다**:
 *    ① 카드 높이는 **고정**이다 (앞면 409 / 뒷면 415 — Figma 실측). `AD-S3-3`("고정 높이 금지")은
 *       audit §18.1 로 무효가 되었다.
 *    ② `overflow-y: auto` 는 **면의 본문 블록 2곳에만** 허용된다 (Prompt 목록 · 뒷면 본문).
 *       개수 상한이 없으므로(`D-21`) 설계치 초과를 그 블록이 흡수해야 트랙 높이가 흔들리지 않는다.
 *       그 밖(카드 박스·`home-overview.css`·`book.css`)에는 여전히 `overflow` 가 **0건**이다 —
 *       카드 그림자가 좌우 28px 번지므로 클리핑 박스를 더 만들면 잘린다 (§0.4 · `QA-1-L1`).
 *    ③ `touch-action` 은 **0건**이다. `SwipeDeck` 을 쓰지 않으므로 세로 제스처를 가로채는
 *       코드가 사라졌고, 가로 스크롤은 `overflow-x: auto` 가 네이티브로 처리한다.
 *  - `§11.2` — 탭바 하단 간격 **16px** (Figma `26:21` 852 − (766 + 70)).
 *  - `§11.3` — 가로 트랙 공식 `pad 14 + 카드 + gap 6 + peek 8`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');

function read(...segments: readonly string[]): string {
  return readFileSync(join(REPO_ROOT, ...segments), 'utf8');
}

/** 주석에는 규칙 설명으로 금지 패턴이 등장하므로 검사 전에 지운다. */
function codeOf(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

const APP_SHELL_CSS = codeOf(read('apps', 'web', 'src', 'app', 'layouts', 'app-shell.css'));
const TAB_LAYOUT = codeOf(read('apps', 'web', 'src', 'app', 'layouts', 'TabLayout.tsx'));
const TOAST_CSS = codeOf(read('packages', 'ui', 'src', 'feedback', 'Toast.css'));
const BOOK_CSS = codeOf(read('apps', 'web', 'src', 'entities', 'book', 'book.css'));
const CARD_CSS = codeOf(
  read('apps', 'web', 'src', 'entities', 'activity-card', 'activity-card.css'),
);
const DECK_CSS = codeOf(
  read('apps', 'web', 'src', 'features', 'activity-card-deck', 'activity-card-deck.css'),
);
const HOME_CSS = codeOf(
  read('apps', 'web', 'src', 'features', 'home-overview', 'home-overview.css'),
);
const COMPONENT_TOKENS = codeOf(read('packages', 'design-tokens', 'src', 'component', 'index.css'));

describe('탭바 하단 여백 — D-1 (§2.1)', () => {
  it('overhang 을 `.haru-app-shell__bar-bottom` 한 곳에서만 확보한다', () => {
    expect(APP_SHELL_CSS).toMatch(
      /\.haru-app-shell__bar-bottom\s*\{[^}]*padding-block-start:\s*var\(--layout-tabbar-center-overhang\)/,
    );
  });

  it('`pt-3` 리터럴이 TabLayout 에서 사라졌다 (토큰 참조로 통일)', () => {
    expect(TAB_LAYOUT).not.toContain('pt-3');
  });

  it('콘텐츠 하단에 `--layout-tabbar-height` 를 더하지 않는다 (70px 빈 공간 방지)', () => {
    const barBottom = /\.haru-app-shell__bar-bottom\s*\{([^}]*)\}/.exec(APP_SHELL_CSS)?.[1] ?? '';
    expect(barBottom).not.toContain('--layout-tabbar-height');
  });

  /*
    `AD-S3-14`(Toast 하단 offset 에 탭바 높이 + overhang 을 더한다)는 **무효다** — Toast 가
    2026-10-10 사용자 결정으로 화면 **상단**으로 옮겨져 탭바와 겹칠 수 없다. 하단 보정 규칙을
    남겨 두면 아무도 켜지 않는 도달 불가 코드가 되므로(= `QA-3-004` 의 원인) 삭제를 고정한다.
    상단 보정은 `Toast 상단 배치` describe 가 본다.
  */
  it('하단 탭바 보정 규칙이 남아 있지 않다 (AD-S3-14 폐기)', () => {
    expect(TOAST_CSS).not.toContain('haru-toast-viewport--tabbar');
    expect(TOAST_CSS).not.toContain('--layout-tabbar-height');
  });

  /* Home 재구현 — Figma `26:21` 852 − (766 + 70) = 16 (`A-6` ⓐ). */
  it('탭바 아래 16px 간격이 래퍼 padding 으로 확보된다 (sticky offset 이 아니다)', () => {
    const barBottom = /\.haru-app-shell__bar-bottom\s*\{([^}]*)\}/.exec(APP_SHELL_CSS)?.[1] ?? '';
    expect(barBottom).toContain('padding-block-end: var(--layout-tabbar-bottom-gap)');
    // safe-area 와 이중 계상되지 않는다 — sticky offset 은 safe-area 만 본다.
    expect(barBottom).toContain('inset-block-end: var(--layout-safe-bottom)');
  });
});

/**
 * Toast 상단 배치 (사용자 결정 2026-10-10 — "화면 상단에서 하단으로 나왔다가 사라지도록").
 *
 * ⚠ 아래 단정들도 **선언이 존재한다** 만 증명한다. 그 클래스가 실제로 붙는지, 보정량이
 * 0 이 아닌지는 런타임에서 본다 (approvals §26.3):
 *   - `apps/web/src/app/layouts/__tests__/layouts.test.tsx` "Toast 상단 보정 배선"
 *   - `e2e/toast.spec.ts` (393px 좌표 + `elementFromPoint` hit-test, 탭·스택 양쪽)
 */
describe('Toast 상단 배치 (2026-10-10)', () => {
  it('기본 viewport 가 상단 기준이다 (하단 기준 선언이 없다)', () => {
    const viewport = /\.haru-toast-viewport\s*\{([^}]*)\}/.exec(TOAST_CSS)?.[1] ?? '';
    expect(viewport).toContain('inset-block-start: calc(var(--layout-safe-top) + var(--space-4))');
    expect(viewport).not.toContain('inset-block-end');
  });

  it('TopBar 가 있는 화면은 **실측 높이**만큼 내려간다 (토큰 fallback 포함)', () => {
    const viewport =
      /\.haru-toast-viewport--below-top-bar\s*\{([^}]*)\}/.exec(TOAST_CSS)?.[1] ?? '';
    expect(viewport).toContain('--layout-safe-top');
    expect(viewport).toContain('var(--toast-top-bar-block-size, var(--topbar-height))');
  });

  it('진입 모션이 위에서 내려오는 방향이다', () => {
    const keyframes = /@keyframes haru-toast-in\s*\{([\s\S]*?)\n\}/.exec(TOAST_CSS)?.[1] ?? '';
    expect(keyframes).toContain('translateY(calc(-1 * var(--space-3)))');
  });

  /* `prefers-reduced-motion` 에서는 translate 를 쓰지 않는다 (§9.2) — 방향이 바뀌어도 유지된다. */
  it('reduced motion 에서는 translate 가 없다', () => {
    const reduced =
      /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*)$/.exec(TOAST_CSS)?.[1] ?? '';
    expect(reduced).toContain('transform: none');
  });
});

describe('BookCover — 고정 aspect + object-fit: cover (D-13 ③ · QA-2-004)', () => {
  it('박스가 `--book-cover-aspect` 로 비율을 고정한다', () => {
    expect(BOOK_CSS).toMatch(/aspect-ratio:\s*var\(--book-cover-aspect\)/);
  });

  it('이미지가 `object-fit: cover` 로 원본 비율 편차를 흡수한다', () => {
    expect(BOOK_CSS).toMatch(/\.haru-book-cover img\s*\{[^}]*object-fit:\s*cover/);
  });

  it('토큰이 Tier-3 에 정의되어 있다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--book-cover-aspect:\s*7 \/ 10/);
    expect(COMPONENT_TOKENS).toMatch(/--book-cover-w-md:\s*58px/);
  });
});

describe('클리핑 박스 — 트랙과 면 본문에만 둔다 (§0.4 · audit §16.3)', () => {
  it.each([
    ['book.css', BOOK_CSS],
    ['home-overview.css', HOME_CSS],
  ])('%s 에 `overflow` 선언이 없다', (_name, css) => {
    expect(css).not.toMatch(/overflow(-x|-y)?\s*:/);
  });

  it('카드 CSS 의 `overflow` 는 **면 본문 2곳**뿐이다 (Prompt 목록 · 뒷면 본문)', () => {
    const owners = [...CARD_CSS.matchAll(/([^{}]+)\{([^}]*overflow-y:\s*auto[^}]*)\}/g)].map(
      (match) => (match[1] ?? '').trim(),
    );
    expect(owners).toStrictEqual(['.haru-prompt-preview', '.haru-activity-card__back-body']);
    // 가로 스크롤은 카드가 아니라 트랙이 소유한다.
    expect(CARD_CSS).not.toMatch(/overflow-x\s*:/);
  });

  it('가로 클리핑은 트랙 하나뿐이다 (카드 그림자 절단 방지)', () => {
    expect(DECK_CSS).toMatch(/\.haru-activity-track\s*\{[^}]*overflow-x:\s*auto/);
  });

  it('`touch-action` 이 **어디에도 없다** (SwipeDeck 미사용 — 제스처를 가로채지 않는다)', () => {
    expect(CARD_CSS).not.toMatch(/touch-action\s*:/);
    expect(DECK_CSS).not.toMatch(/touch-action\s*:/);
    expect(HOME_CSS).not.toMatch(/touch-action\s*:/);
  });

  it('Prompt pill 높이가 **최소값**이다 — 1줄 질문도 Figma 42 가 된다', () => {
    expect(CARD_CSS).toMatch(/min-block-size:\s*var\(--prompt-pill-height-min\)/);
    expect(CARD_CSS).not.toMatch(/(?<!min-)block-size:\s*var\(--prompt-pill-height-min\)/);
  });

  it('높이 보간 애니메이션(`max-height` transition)이 없다', () => {
    expect(CARD_CSS).not.toMatch(/max-height|max-block-size/);
  });
});

/*
 * Visual Gap 검토(audit §20) 교정분. design-agent 가 **독립 실측**으로 찾은 결함이라
 * 같은 실수가 되돌아오지 않게 소스 수준에서 고정한다.
 */
describe('Visual Gap 교정 (audit §20)', () => {
  it('★ `V-1`·`V-2` — pill 테두리가 **레이아웃에 기여하지 않는다** (`border` 금지)', () => {
    const outline = /\.haru-prompt-pill--outline\s*\{([^}]*)\}/.exec(CARD_CSS)?.[1] ?? '';
    expect(outline).toContain('box-shadow: inset 0 0 0 1px');
    // `border` 를 되살리면 2줄 pill 이 44 가 되어 4번째 pill 이 186 밖으로 밀린다.
    expect(outline).not.toMatch(/\bborder\s*:/);
  });

  it('`V-3` — pill padding-inline 이 Figma 13 이다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--prompt-pill-pad-inline:\s*13px/);
  });

  it('`V-4` — 카드 안 Tag 가 Figma 타이포(padding 13 · line-height 12 · semibold)를 쓴다', () => {
    expect(COMPONENT_TOKENS).toMatch(/--activity-card-tag-pad-inline:\s*13px/);
    const header =
      /\.haru-activity-card__header \.haru-tag\s*\{([^}]*)\}/.exec(CARD_CSS)?.[1] ?? '';
    expect(header).toContain('padding-inline: var(--activity-card-tag-pad-inline)');
    expect(header).toContain('line-height: var(--activity-card-tag-line)');
    expect(header).toContain('font-weight: var(--font-weight-semibold)');
    // 공유 `Tag` 를 전역으로 바꾸지 않았다 (다른 화면이 따라 움직이면 안 된다).
    expect(COMPONENT_TOKENS).toMatch(/--tag-padding-x:\s*var\(--space-3\)/);
  });

  it('`V-11` — `Save` 면이 `color/white/ 85%` 다 (surface-strong 0.90 재사용 금지)', () => {
    expect(CARD_CSS).toMatch(
      /\.haru-activity-card__save\s*\{[^}]*background-color:\s*var\(--activity-card-save-bg\)/,
    );
    expect(COMPONENT_TOKENS).toMatch(/--activity-card-save-bg:\s*var\(--color-action-white-bg\)/);
  });

  it('`V-12`·`V-13` — 뒷면 note padding 13 · 하단 여백 7', () => {
    expect(COMPONENT_TOKENS).toMatch(/--activity-card-note-pad-block:\s*13px/);
    expect(COMPONENT_TOKENS).toMatch(/--activity-card-back-pad-bottom:\s*7px/);
  });

  it('`V-14` — 책 제목 20.4 · 저자 15.6 line-height', () => {
    expect(COMPONENT_TOKENS).toMatch(/--activity-card-book-title-line:\s*20\.4px/);
    expect(COMPONENT_TOKENS).toMatch(/--activity-card-book-author-line:\s*15\.6px/);
  });

  it('`V-5`·`V-6` — 워드마크 offset 과 칩 기하가 **Home 에서만** 적용된다', () => {
    expect(HOME_CSS).toMatch(
      /\.haru-home-top-bar \.haru-top-bar__leading\s*\{[^}]*align-self: stretch/,
    );
    expect(HOME_CSS).toMatch(/margin-block-start:\s*var\(--home-wordmark-offset-block\)/);
    expect(HOME_CSS).toMatch(
      /\.haru-home-top-bar \.haru-tag\s*\{[^}]*block-size:\s*var\(--home-chip-block-size\)/,
    );
    expect(COMPONENT_TOKENS).toMatch(/--home-chip-block-size:\s*34px/);
    // 공유 `Tag` 높이(26)는 그대로다.
    expect(COMPONENT_TOKENS).toMatch(/--tag-height-sm:\s*26px/);
  });
});

describe('flip — 두 면이 하단 정렬이다 (audit §16.3)', () => {
  it('컨테이너가 트랙 높이(415)로 고정되고 두 면이 Figma 실측 높이를 갖는다', () => {
    expect(CARD_CSS).toMatch(
      /\.haru-activity-card-flip\s*\{[^}]*block-size:\s*var\(--activity-card-track-size\)/,
    );
    expect(CARD_CSS).toMatch(/__face--front\s*\{[^}]*block-size:\s*var\(--activity-card-size\)/);
    expect(CARD_CSS).toMatch(
      /__face--back\s*\{[^}]*block-size:\s*var\(--activity-card-back-size\)/,
    );
  });

  it('두 면 모두 `inset-block-end: 0` — 카드 하단 모서리가 두 상태에서 같다', () => {
    const face = /\.haru-activity-card-flip__face\s*\{([^}]*)\}/.exec(CARD_CSS)?.[1] ?? '';
    expect(face).toContain('inset-block-end: 0');
    expect(face).toContain('backface-visibility: hidden');
  });

  it('`prefers-reduced-motion: reduce` 에서 전환이 없다 (AC-3-19)', () => {
    expect(CARD_CSS).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.haru-activity-card-flip__inner\s*\{\s*transition:\s*none/,
    );
  });
});

describe('가로 트랙 — Figma `163:2648` 공식 (audit §11.3)', () => {
  it('앱 컬럼 밖으로 gutter 만큼 bleed 한다 (트랙 폭 = min(100vw, 480))', () => {
    const track = /\.haru-activity-track\s*\{([^}]*)\}/.exec(DECK_CSS)?.[1] ?? '';
    expect(track).toContain('margin-inline: calc(-1 * var(--layout-gutter))');
    expect(track).toContain('inline-size: calc(100% + 2 * var(--layout-gutter))');
  });

  it('pad 14 · gap 6 · 스냅이 토큰으로 선언되어 있다 (peek = pad − gap = 8)', () => {
    const track = /\.haru-activity-track\s*\{([^}]*)\}/.exec(DECK_CSS)?.[1] ?? '';
    expect(track).toContain('padding-inline: var(--activity-track-pad)');
    expect(track).toContain('gap: var(--activity-track-gap)');
    expect(track).toContain('scroll-snap-type: x mandatory');
    expect(track).toContain('align-items: flex-end');
  });

  it('카드는 트랙 content box 를 꽉 채운다 (`flex: 0 0 100%`)', () => {
    const item = /\.haru-activity-track__item\s*\{([^}]*)\}/.exec(DECK_CSS)?.[1] ?? '';
    expect(item).toContain('flex: 0 0 100%');
    expect(item).toContain('scroll-snap-align: start');
  });

  it('`empty`/`error`/`offline` 자리가 트랙 높이를 점유한다 (레이아웃이 튀지 않는다)', () => {
    const slot = /\.haru-activity-deck__slot\s*\{([^}]*)\}/.exec(DECK_CSS)?.[1] ?? '';
    expect(slot).toContain('block-size: var(--activity-card-track-size)');
  });
});

describe('Prompt 단계 배지 — 역량 색 토큰을 재사용하지 않는다 (§6.2 · §13.2 ⑪)', () => {
  it('배지 색이 `--prompt-phase-tag-*` 를 쓴다', () => {
    expect(CARD_CSS).toMatch(/background-color:\s*var\(--prompt-phase-tag-bg\)/);
    expect(CARD_CSS).toMatch(/color:\s*var\(--prompt-phase-tag-fg\)/);
  });

  it('`--color-capability-flexibility-*` 를 직접 쓰지 않는다', () => {
    expect(CARD_CSS).not.toContain('--color-capability-flexibility');
  });
});

describe('Home 배경 레이어 — Figma `26:22` 재실측 (audit §10.2 · §11.8)', () => {
  /*
   * 1차는 좌우로 gutter 만큼 bleed(441) 했으나, 사용자가 Figma 를 수정해 캐릭터가
   * **(24, 29) 357×442** 가 되었다 — 좌측 bleed 가 사라지고 우측으로만 12 넘어간다.
   */
  it('컬럼 leading edge 에서 시작해 trailing edge 를 12 넘어간다', () => {
    const character = /\.haru-home-stage__character\s*\{([^}]*)\}/.exec(HOME_CSS)?.[1] ?? '';
    expect(character).toContain('inset-inline-start: 0');
    expect(character).toContain('inline-size: calc(100% + var(--home-character-overhang))');
    expect(character).not.toContain('calc(-1 * var(--layout-gutter))');
  });

  it('비율이 Figma 재실측값(357/442)으로 고정된다 — 에셋도 그 비율로 재export 했다', () => {
    const character = /\.haru-home-stage__character\s*\{([^}]*)\}/.exec(HOME_CSS)?.[1] ?? '';
    expect(character).toContain('aspect-ratio: var(--home-character-aspect)');
  });

  it('버블 ↔ 트랙 spacer 는 남는 높이만 흡수한다 (최소값을 강제하지 않는다)', () => {
    const spacer = /\.haru-home-stage__spacer\s*\{([^}]*)\}/.exec(HOME_CSS)?.[1] ?? '';
    expect(spacer).toContain('flex: 1 1 auto');
    expect(spacer).toContain('min-block-size: 0');
  });

  it('헤더 밴드가 Home 에서만 10px 내려간다 (`TopBar` 공통 높이를 건드리지 않는다)', () => {
    expect(HOME_CSS).toMatch(
      /\.haru-home-top-bar\s*\{[^}]*padding-block-start:\s*var\(--home-header-pad-block-start\)/,
    );
  });
});
