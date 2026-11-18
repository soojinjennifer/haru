// @vitest-environment node
/**
 * Stage 6 `S6-H` — QA 2차 결정 `D6-10` (VG6-G-02 · 04 · 07 · 08 · 09) **CSS 소스 회귀 가드**.
 *
 * jsdom 은 외부 CSS 를 적용하지 않으므로 선언과 토큰 값을 소스에서 직접 확인하고 간격 산술을 검산한다.
 * Figma 선언값(`get_design_context` 2026-11-18): Answer card `179:1788` · `244:1394` · `320:1493` 행 라벨 Semibold(590) ·
 * 언어 카드 `244:1314` radius 30 · effect 에 BACKGROUND_BLUR 없음 · 섹션 라벨 Bold 12 tracking 0.72 · 카드 아래 → 첫 행 53.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');

function read(...segments: readonly string[]): string {
  return readFileSync(join(REPO_ROOT, ...segments), 'utf8');
}

function codeOf(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function rule(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `rule ${selector}`).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf('}', start));
}

function tokenValue(css: string, name: string): string {
  const match = new RegExp(`${name}:\\s*([^;]+);`).exec(css);
  expect(match, name).not.toBeNull();
  return (match?.[1] ?? '').trim();
}

const RADIO_CSS = codeOf(read('packages', 'ui', 'src', 'field', 'RadioGroup.css'));
const TEXT_CSS = codeOf(read('packages', 'ui', 'src', 'text', 'Text.css'));
const CHILD_CSS = codeOf(read('apps', 'web', 'src', 'entities', 'child', 'child.css'));
const COMPONENT_TOKENS = codeOf(read('packages', 'design-tokens', 'src', 'component', 'index.css'));
const SPACE_TOKENS = codeOf(read('packages', 'design-tokens', 'src', 'semantic', 'space.css'));
const TYPO_PRIMITIVES = codeOf(
  read('packages', 'design-tokens', 'src', 'primitive', 'typography.css'),
);

function px(value: string): number {
  return Number.parseFloat(value);
}

describe('VG6-G-07 — Answer card 행 라벨 Semibold (D6-10 ①)', () => {
  it('card 변형 라벨만 semibold, 기본(list 포함) 라벨 규칙에는 weight 가 없다', () => {
    expect(rule(RADIO_CSS, '.haru-radio-group--card .haru-radio-group__label')).toContain(
      'font-weight: var(--font-weight-semibold)',
    );
    expect(rule(RADIO_CSS, '.haru-radio-group__label')).not.toContain('font-weight');
    expect(tokenValue(TYPO_PRIMITIVES, '--haru-weight-semibold')).toBe('590');
  });
});

describe('VG6-G-02 · 04 — 언어 카드 radius 30 · blur 없음 (D6-10 ② ③)', () => {
  it('전용 30 토큰을 쓰고 reflection 토큰과 독립이다', () => {
    expect(tokenValue(COMPONENT_TOKENS, '--choice-card-radius')).toBe('30px');
    expect(tokenValue(COMPONENT_TOKENS, '--reflection-card-radius')).toBe('30px');
    const card = rule(CHILD_CSS, '.haru-language-card');
    expect(card).toContain('border-radius: var(--choice-card-radius)');
    expect(card).toContain('background-color: var(--color-surface-strong)');
    expect(card).toContain('box-shadow: var(--shadow-bubble)');
    expect(card).not.toContain('backdrop-filter');
    expect(card).not.toContain('overflow');
  });

  it('ChildLanguageFields 는 blur 를 거는 Surface fill="strong" 을 쓰지 않는다', () => {
    const tsx = read('apps', 'web', 'src', 'entities', 'child', 'ChildInfoFields.tsx');
    expect(tsx).toContain('className="haru-language-card"');
    expect(tsx).not.toMatch(/<Surface\b/);
  });
});

describe('VG6-G-08 — 섹션 라벨 Bold 12 · tracking 0.72 (D6-10 ③)', () => {
  it('토큰 = 0.72px, Text tracking modifier 가 그 토큰을 쓴다', () => {
    expect(tokenValue(COMPONENT_TOKENS, '--section-label-letter-spacing')).toBe('0.72px');
    expect(rule(TEXT_CSS, '.haru-text--tracking-section-label')).toContain(
      'letter-spacing: var(--section-label-letter-spacing)',
    );
    // variant 규칙보다 뒤에 있어야 variant 의 letter-spacing 을 덮는다.
    expect(TEXT_CSS.indexOf('.haru-text--tracking-section-label')).toBeGreaterThan(
      TEXT_CSS.indexOf('.haru-text--caption-1'),
    );
  });

  it('독서 루틴 legend 도 같은 recipe(bold · 같은 자간 토큰)다', () => {
    const legend = rule(CHILD_CSS, '.haru-child-routine .haru-radio-group__legend');
    expect(legend).toContain('font-weight: var(--font-weight-bold)');
    expect(legend).toContain('letter-spacing: var(--section-label-letter-spacing)');
    expect(legend).toContain('font-size: var(--text-caption-1)');
  });

  it('앱 안에 semibold 섹션 라벨 recipe 가 남아 있지 않다', () => {
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
          if (name !== '__tests__' && name !== 'dev') walk(path);
        } else if (name.endsWith('.tsx')) {
          const source = readFileSync(path, 'utf8');
          if (/variant="caption-1" tone="secondary" weight="(semibold|bold)">/.test(source)) {
            offenders.push(path);
          }
        }
      }
    };
    walk(join(REPO_ROOT, 'apps', 'web', 'src', 'features'));
    walk(join(REPO_ROOT, 'apps', 'web', 'src', 'entities', 'child-profile'));
    expect(offenders).toEqual([]);
  });
});

describe('VG6-G-09 — 언어 카드 아래 → 첫 독서 루틴 행 = Figma 53 (D6-10 ③)', () => {
  it('섹션 gap 20 + 라벨 위 7 + caption-1 줄 16 + 라벨 ↔ 행 10 = 53', () => {
    const spacing = px(
      /--spacing:\s*([^;]+);/.exec(
        read('packages', 'design-tokens', 'src', 'semantic', 'space.css'),
      )?.[1] ?? '',
    );
    expect(SPACE_TOKENS).toContain('--space-2-5: calc(var(--spacing) * 2.5)');
    const sectionGap = spacing * 5; // ChildInfoStep / ChildInfoEditForm 부모 gap-5
    const offset = px(tokenValue(COMPONENT_TOKENS, '--child-routine-label-offset'));
    const line = px(tokenValue(TYPO_PRIMITIVES, '--haru-type-caption-1-line'));
    const toRow = spacing * 2.5;

    expect(rule(CHILD_CSS, '.haru-child-routine .haru-radio-group__legend')).toContain(
      'padding-block-start: var(--child-routine-label-offset)',
    );
    expect(rule(CHILD_CSS, '.haru-child-routine .haru-radio-group__options')).toContain(
      'margin-block-start: var(--space-2-5)',
    );
    expect(sectionGap + offset + line + toRow).toBe(53);
    // 글자 중심 = 카드 아래 +35 (Figma 18 + 10 + 14/2)
    expect(sectionGap + offset + line / 2).toBe(35);
  });
});
