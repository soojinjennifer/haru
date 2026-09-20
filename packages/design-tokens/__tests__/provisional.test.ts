/**
 * HARU Design Tokens — `provisional` 주석 ↔ Design Spec §3.6 위치표 1:1 대조 (AC-1-12)
 * + D-01 수용 예외 주석 (AC-1-17).
 *
 * 아래 EXPECTED 표는 `docs/design/stage-1-design-spec.md` §3.6 을 **그대로 옮긴 것**이다.
 * 토큰을 추가·이동할 때 이 표를 함께 고치지 않으면 테스트가 실패한다.
 * P-10 은 토큰이 아니라 화면 명세이므로 대상이 아니다.
 */

import { describe, expect, it } from 'vitest';

import { collectDeclarations } from '../scripts/token-sources.mjs';

/** Design Spec §3.6 — P 항목별 토큰 이름과 선언 파일. */
const EXPECTED: Record<string, { file: string; tokens: string[] }[]> = {
  'P-01': [
    { file: 'src/semantic/color.css', tokens: ['--color-fg-secondary', '--color-fg-tertiary'] },
  ],
  'P-02': [
    {
      file: 'src/semantic/color.css',
      tokens: [
        '--color-border-subtle',
        '--color-progress-fill',
        '--color-progress-track',
        '--color-rating-filled',
        '--color-rating-empty',
        '--color-capability-agency-fg',
        '--color-capability-emotion-fg',
        '--color-capability-flexibility-fg',
        '--color-capability-motivation-fg',
      ],
    },
  ],
  'P-03': [
    { file: 'src/semantic/color.css', tokens: ['--color-focus-ring'] },
    { file: 'src/semantic/space.css', tokens: ['--focus-ring-width', '--focus-ring-offset'] },
  ],
  'P-04': [
    {
      file: 'src/primitive/color.css',
      tokens: [
        '--haru-status-error-fg',
        '--haru-status-error-bg',
        '--haru-status-warning-fg',
        '--haru-status-warning-bg',
        '--haru-status-success-fg',
        '--haru-status-success-bg',
        '--haru-status-info-fg',
        '--haru-status-info-bg',
      ],
    },
    {
      file: 'src/semantic/color.css',
      tokens: [
        '--color-status-info-bg',
        '--color-status-info-fg',
        '--color-status-info-border',
        '--color-status-info-icon',
        '--color-status-success-bg',
        '--color-status-success-fg',
        '--color-status-success-border',
        '--color-status-success-icon',
        '--color-status-warning-bg',
        '--color-status-warning-fg',
        '--color-status-warning-border',
        '--color-status-warning-icon',
        '--color-status-error-bg',
        '--color-status-error-fg',
        '--color-status-error-border',
        '--color-status-error-icon',
        '--color-field-border-error',
        '--color-field-fg-error',
      ],
    },
  ],
  'P-05': [{ file: 'src/semantic/color.css', tokens: ['--color-scrim'] }],
  'P-06': [
    {
      file: 'src/semantic/z-index.css',
      tokens: ['--z-base', '--z-sticky', '--z-tabbar', '--z-sheet', '--z-dialog', '--z-toast'],
    },
  ],
  'P-07': [
    {
      file: 'src/semantic/motion.css',
      tokens: [
        '--motion-duration-instant',
        '--motion-duration-fast',
        '--motion-duration-base',
        '--motion-duration-slow',
        '--motion-duration-pulse',
        '--motion-ease-standard',
        '--motion-ease-spring',
        '--motion-ease-linear',
      ],
    },
  ],
  'P-08': [
    {
      file: 'src/semantic/layout.css',
      tokens: [
        '--layout-safe-top',
        '--layout-safe-bottom',
        '--layout-safe-left',
        '--layout-safe-right',
      ],
    },
  ],
  'P-09': [
    {
      file: 'src/semantic/space.css',
      tokens: ['--size-icon-sm', '--size-icon-md', '--size-icon-lg'],
    },
  ],
  'P-11': [
    {
      file: 'src/semantic/color.css',
      tokens: ['--color-action-secondary-bg', '--color-action-secondary-fg'],
    },
  ],
  'P-12': [{ file: 'src/semantic/radius.css', tokens: ['--radius-surface'] }],
  'P-13': [{ file: 'src/semantic/space.css', tokens: ['--layout-gutter'] }],
  'P-14': [{ file: 'src/semantic/color.css', tokens: ['--gradient-app'] }],
  'P-15': [{ file: 'src/semantic/space.css', tokens: ['--size-button-lg'] }],
  'P-16': [
    {
      file: 'src/semantic/space.css',
      tokens: ['--size-medallion-sm', '--size-medallion-md', '--size-medallion-lg'],
    },
  ],
};

const declarations = collectDeclarations().filter((d) => !d.name.endsWith('-*'));

const expectedPairs = Object.entries(EXPECTED)
  .flatMap(([item, groups]) =>
    groups.flatMap((group) => group.tokens.map((token) => `${item} ${group.file} ${token}`)),
  )
  .sort();

const actualPairs = declarations
  .filter((d) => d.provisional !== null)
  .map((d) => `${d.provisional} ${d.file} ${d.name}`)
  .sort();

describe('provisional 주석 ↔ Design Spec §3.6 (AC-1-12)', () => {
  it('항목이 15건이다 (P-01~P-09, P-11~P-16 — P-10 제외)', () => {
    const items = [...new Set(declarations.map((d) => d.provisional).filter(Boolean))].sort();
    expect(items).toEqual([
      'P-01',
      'P-02',
      'P-03',
      'P-04',
      'P-05',
      'P-06',
      'P-07',
      'P-08',
      'P-09',
      'P-11',
      'P-12',
      'P-13',
      'P-14',
      'P-15',
      'P-16',
    ]);
    expect(items).toHaveLength(15);
  });

  it('P-10 에는 주석을 달지 않는다 (토큰이 아니라 화면 명세)', () => {
    expect(declarations.filter((d) => d.provisional === 'P-10')).toEqual([]);
  });

  it('토큰 · 파일 조합이 §3.6 표와 완전히 일치한다 (누락 0 · 초과 0)', () => {
    expect(actualPairs).toEqual(expectedPairs);
  });

  it('주석 형식이 지정된 문자열 그대로다', () => {
    const files = [...new Set(declarations.filter((d) => d.provisional).map((d) => d.file))];
    expect(files.length).toBeGreaterThan(0);
    for (const item of Object.keys(EXPECTED)) {
      expect(`/* provisional: ${item} (docs/decisions/stage-0-approvals.md §4) */`).toMatch(
        /^\/\* provisional: P-\d{2} \(docs\/decisions\/stage-0-approvals\.md §4\) \*\/$/,
      );
    }
  });
});

describe('D-01 수용 예외 주석 (AC-1-17)', () => {
  it('--color-action-primary-bg 와 --color-fg-on-accent 에만 붙는다', () => {
    const tagged = declarations
      .filter((d) => d.acceptedDeviation === 'D-01')
      .map((d) => d.name)
      .sort();
    expect(tagged).toEqual(['--color-action-primary-bg', '--color-fg-on-accent']);
  });

  it('D-01 대상 값이 teal 위 흰 라벨 구성 그대로다', () => {
    const byName = new Map(declarations.map((d) => [d.name, d]));
    expect(byName.get('--color-action-primary-bg')?.value).toBe('var(--haru-palette-teal)');
    expect(byName.get('--haru-palette-teal')?.value).toBe('#85bfb6');
    expect(byName.get('--color-fg-on-accent')?.value).toBe('var(--haru-white)');
  });
});
