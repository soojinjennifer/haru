/**
 * gallery 보조 로직 — 토큰 필터 · 대비 계산.
 *
 * DOM 측정이 필요한 부분(`collectRootTokens` · `measureHitArea` · `resolveTokenColor`)은
 * jsdom 이 레이아웃과 `var()` 해석을 하지 않으므로 **Playwright e2e** 에서 검증한다.
 * 여기서는 브라우저에 의존하지 않는 계산만 고정한다.
 */
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../ui-gallery/contrast';
import { PROVISIONAL_ITEMS } from '../ui-gallery/provisionalItems';
import { tokensWithPrefix, withoutModifiers, type RootToken } from '../ui-gallery/tokenScan';

const token = (name: string): RootToken => ({ name, declared: '', computed: '' });

describe('tokenScan 필터', () => {
  const tokens = [
    token('--color-fg-primary'),
    token('--color-*'),
    token('--text-body'),
    token('--text-body--line-height'),
    token('--haru-ink-700'),
  ];

  it('접두어로 고르고 네임스페이스 초기화 지시자는 뺀다', () => {
    expect(tokensWithPrefix(tokens, '--color-').map((t) => t.name)).toStrictEqual([
      '--color-fg-primary',
    ]);
  });

  it('타이포 보조 축(`--…--`)을 걸러낸다', () => {
    expect(withoutModifiers(tokensWithPrefix(tokens, '--text-')).map((t) => t.name)).toStrictEqual([
      '--text-body',
    ]);
  });
});

describe('contrastRatio (WCAG 2.x 상대 휘도)', () => {
  const white = { r: 255, g: 255, b: 255, a: 1 };
  const black = { r: 0, g: 0, b: 0, a: 1 };

  it('흰색 ↔ 검정은 21:1', () => {
    expect(contrastRatio(white, black)).toBeCloseTo(21, 5);
  });

  it('같은 색은 1:1', () => {
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
  });

  it('순서를 바꿔도 같은 값이다', () => {
    const teal = { r: 133, g: 191, b: 182, a: 1 };
    expect(contrastRatio(teal, white)).toBeCloseTo(contrastRatio(white, teal), 10);
  });
});

describe('가값 승인 자료 목록 (Plan §17-3)', () => {
  /*
   * P-01 … P-17 은 Stage 1·2 항목이고, **P-23**(Home 라운드 `--color-prompt-tag-fg`) ·
   * **P-24**(Library 1라운드 `--color-fg-tertiary` = `#9aabaa`, `stage-3-approvals.md` §20.4)
   * 가 Stage 3 신규다.
   *
   * `P-18`~`P-22` 는 **토큰이 존재하지 않아 등재 대상이 아니다** — `P-20`(`--toggle-*`)은
   * 확정됐고 나머지는 토큰으로 만들어지지 않았다 (approvals §26.5 가 §21.5 기록을 정정).
   * 등재 기준은 **`packages/design-tokens` 의 `provisional` 주석** 이다.
   */
  it('P-01 … P-17 + P-23 + P-24 + P-25 를 제시한다', () => {
    expect(PROVISIONAL_ITEMS.map((item) => item.id)).toStrictEqual([
      ...Array.from({ length: 17 }, (_, index) => `P-${String(index + 1).padStart(2, '0')}`),
      'P-23',
      'P-24',
      // Stage 4 `D4-16` — 세션 Discard 흰 라벨 on #aeaeb2 (AC-4-119 ③).
      'P-25',
    ]);
  });

  it('확정 12건 / 디자이너 대기 8건으로 사용자 결정이 반영되어 있다', () => {
    const waiting = PROVISIONAL_ITEMS.filter((item) => item.status === 'waiting').map(
      (item) => item.id,
    );
    // `P-05` 는 Figma 실측값 채택으로 해제됐다 (`L-NEW-09`), `P-23`·`P-24` 가 새로 들어왔다.
    expect(waiting).toStrictEqual(['P-01', 'P-02', 'P-04', 'P-16', 'P-17', 'P-23', 'P-24', 'P-25']);
    expect(PROVISIONAL_ITEMS.filter((item) => item.status === 'confirmed')).toHaveLength(12);
  });

  it('각 항목이 결정 근거 문장을 갖는다', () => {
    for (const item of PROVISIONAL_ITEMS) {
      expect(item.decision.length).toBeGreaterThan(0);
    }
  });

  it('각 항목이 확인 화면을 가리킨다', () => {
    for (const item of PROVISIONAL_ITEMS) {
      expect(item.where.length).toBeGreaterThan(0);
    }
  });
});
