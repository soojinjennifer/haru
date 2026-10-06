/**
 * HARU Design Tokens — `provisional` 주석 ↔ 남은 가값 목록 1:1 대조 (AC-1-12)
 * + D-01 수용 예외 주석 (AC-1-17).
 *
 * 기준 문서:
 *   - `docs/design/stage-1-design-spec.md` §3.6 (위치표 — 토큰 이름·파일)
 *   - `docs/decisions/stage-1-approvals.md` §9 (2026-09-22 가값 승인 결과)
 *
 * 2026-09-22 승인으로 **P-03 · P-06 · P-07 · P-08 · P-09 · P-11 · P-12 · P-13 · P-14 · P-15**
 * 10 항목이 현재 값 그대로 확정되어 `provisional` 주석을 제거했다(값 변경 없음).
 * 남은 가값은 **P-01 · P-02 · P-04 · P-05 · P-16** 5 항목이었고, Stage 3 에서
 * **P-23**(`--color-prompt-tag-fg` — Prompt 단계·페이지 배지 흰 라벨 1.72:1)이 신설되어
 * **6 항목**이다 (`stage-3-approvals.md` §9.2 ⑫ · Stage 3 Design Spec §6.4).
 * P-10 은 토큰이 아니라 화면 명세이므로 대상이 아니다.
 *
 * 아래 EXPECTED 는 §3.6 위치표에서 남은 5 항목만 옮긴 것이다.
 * 토큰을 추가·이동하거나 확정 항목에 주석을 되돌리면 이 테스트가 실패한다.
 */

import { describe, expect, it } from 'vitest';

import { collectDeclarations } from '../scripts/token-sources.mjs';

/** Design Spec §3.6 중 **가값으로 남은** P 항목의 토큰 이름과 선언 파일. */
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
  /*
   * Stage 3 신설 — `stage-3-approvals.md` §9.2 ⑫ · Design Spec §6.4.
   * `P-02`(역량 색 4종 위 흰 라벨)에 **흡수하지 않는다**: 대상이 Prompt 배지 전용이고
   * 역량 팔레트 변경으로 해소되지 않아 교체 조건이 다르다.
   */
  'P-23': [{ file: 'src/semantic/color.css', tokens: ['--color-prompt-tag-fg'] }],
  'P-16': [
    {
      file: 'src/semantic/space.css',
      tokens: ['--size-medallion-sm', '--size-medallion-md', '--size-medallion-lg'],
    },
  ],
};

/**
 * 2026-09-22 확정 항목 (stage-1-approvals §9.1) — **값은 그대로**, 주석만 제거했다.
 * 이 목록의 항목이 다시 `provisional` 로 표시되면 테스트가 실패한다.
 */
const CONFIRMED_2026_09_22 = [
  'P-03',
  'P-06',
  'P-07',
  'P-08',
  'P-09',
  'P-11',
  'P-12',
  'P-13',
  'P-14',
  'P-15',
];

/** 확정 항목이 달려 있던 토큰 — 주석 제거 후에도 토큰 자체는 그대로 있어야 한다. */
const CONFIRMED_TOKENS: Record<string, string[]> = {
  'P-03': ['--color-focus-ring', '--focus-ring-width', '--focus-ring-offset'],
  'P-06': ['--z-base', '--z-sticky', '--z-tabbar', '--z-sheet', '--z-dialog', '--z-toast'],
  'P-07': [
    '--motion-duration-instant',
    '--motion-duration-fast',
    '--motion-duration-base',
    '--motion-duration-slow',
    '--motion-duration-pulse',
    '--motion-ease-standard',
    '--motion-ease-spring',
    '--motion-ease-linear',
  ],
  'P-08': [
    '--layout-safe-top',
    '--layout-safe-bottom',
    '--layout-safe-left',
    '--layout-safe-right',
  ],
  'P-09': ['--size-icon-sm', '--size-icon-md', '--size-icon-lg'],
  'P-11': ['--color-action-secondary-bg', '--color-action-secondary-fg'],
  'P-12': ['--radius-surface'],
  'P-13': ['--layout-gutter'],
  'P-14': ['--gradient-app'],
  'P-15': ['--size-button-lg'],
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

describe('provisional 주석 ↔ 남은 가값 목록 (AC-1-12 · approvals §9)', () => {
  it('항목이 6건이다 (P-01 · P-02 · P-04 · P-05 · P-16 · P-23)', () => {
    const items = [...new Set(declarations.map((d) => d.provisional).filter(Boolean))].sort();
    expect(items).toEqual(['P-01', 'P-02', 'P-04', 'P-05', 'P-16', 'P-23']);
    expect(items).toHaveLength(6);
  });

  it('EXPECTED 표 자체가 남은 6 항목만 담는다 (표를 늘려 검사를 우회하지 못한다)', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual(['P-01', 'P-02', 'P-04', 'P-05', 'P-16', 'P-23']);
    for (const item of CONFIRMED_2026_09_22) {
      expect(EXPECTED[item]).toBeUndefined();
    }
  });

  it('2026-09-22 확정 10건에는 주석이 없다 (되돌아오면 실패)', () => {
    const regressed = declarations
      .filter((d) => d.provisional !== null && CONFIRMED_2026_09_22.includes(d.provisional))
      .map((d) => `${d.provisional} ${d.file} ${d.name}`)
      .sort();
    expect(regressed).toEqual([]);
  });

  it('확정 10건의 토큰은 주석만 사라지고 선언은 그대로 있다 (값 변경 없음 확인)', () => {
    const byName = new Map(declarations.map((d) => [d.name, d]));
    for (const [item, tokens] of Object.entries(CONFIRMED_TOKENS)) {
      for (const token of tokens) {
        const declaration = byName.get(token);
        expect(declaration, `${item} ${token} 선언이 사라졌다`).toBeDefined();
        expect(declaration?.provisional, `${item} ${token} 에 주석이 되돌아왔다`).toBeNull();
      }
    }
  });

  it('P-10 에는 주석을 달지 않는다 (토큰이 아니라 화면 명세)', () => {
    expect(declarations.filter((d) => d.provisional === 'P-10')).toEqual([]);
  });

  it('토큰 · 파일 조합이 남은 가값 표와 완전히 일치한다 (누락 0 · 초과 0)', () => {
    expect(actualPairs).toEqual(expectedPairs);
  });

  it('주석 형식이 지정된 문자열 그대로다', () => {
    const files = [...new Set(declarations.filter((d) => d.provisional).map((d) => d.file))];
    expect(files.length).toBeGreaterThan(0);
    for (const item of Object.keys(EXPECTED)) {
      expect(item).toMatch(/^P-\d{2}$/);
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
