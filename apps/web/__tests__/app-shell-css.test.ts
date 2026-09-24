// @vitest-environment node
/**
 * `app/layouts/app-shell.css` 의 정적 규칙 (Stage 1 QA 이후 수정 `QA-1-L1`).
 *
 * `layouts.test.tsx` 는 **클래스가 붙어 있는지**만 본다 — jsdom 은 외부 CSS 를 적용하지 않기
 * 때문이다. 클래스만 검사하면 CSS 규칙이 사라져도 통과하므로, 고정 동작(sticky)과 safe-area
 * 기준선 선언을 여기에서 소스로 확인한다. Node 환경에서 소스를 직접 읽는다.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const CSS = readFileSync(
  join(import.meta.dirname, '..', 'src', 'app', 'layouts', 'app-shell.css'),
  'utf8',
);

/** 주석에는 규칙 설명으로 수치가 등장하므로 검사 전에 지운다. */
const CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

describe('AppShell 고정 영역 CSS', () => {
  it('TopBar 영역은 safe-top 을 기준으로 sticky 고정된다', () => {
    expect(CODE).toMatch(
      /\.haru-app-shell__bar-top\s*\{[^}]*position:\s*sticky;[^}]*inset-block-start:\s*var\(--layout-safe-top\);[^}]*z-index:\s*var\(--z-sticky\);/,
    );
  });

  it('BottomTabBar 영역은 safe-bottom 을 기준으로 sticky 고정된다', () => {
    expect(CODE).toMatch(
      /\.haru-app-shell__bar-bottom\s*\{[^}]*position:\s*sticky;[^}]*inset-block-end:\s*var\(--layout-safe-bottom\);[^}]*z-index:\s*var\(--z-tabbar\);/,
    );
  });

  it('리터럴 수치 없이 semantic token 만 쓴다 (rules/frontend.md §6)', () => {
    expect(CODE).not.toMatch(/:\s*-?\d+(\.\d+)?(px|rem|em)\b/);
    expect(CODE).not.toMatch(/:\s*#[0-9a-f]{3,8}/i);
  });
});
