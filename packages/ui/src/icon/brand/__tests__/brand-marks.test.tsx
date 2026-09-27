/**
 * 브랜드 에셋 회귀 테스트 — 결정 `D-15`.
 *
 * 브랜드 마크는 "수정 금지" 에셋이다. 사람이 주석을 읽지 않고 색을 토큰으로 바꾸거나
 * 비율을 건드리는 일을 막기 위해 **공식 값 자체를 테스트로 고정**한다.
 */
import { render, screen } from '@testing-library/react';
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { Button } from '../../../button/Button';
import { BrandMark, BRAND_MARKS } from '../index';

/** jsdom 에서는 `import.meta.url` 이 http URL 이라 파일 경로로 쓸 수 없다 → cwd 기준으로 찾는다. */
function readSource(file: string): string {
  const candidates = [`src/icon/brand/${file}`, `packages/ui/src/icon/brand/${file}`];
  const found = candidates.find((candidate) => existsSync(candidate));

  if (found === undefined) throw new Error(`brand asset not found: ${file}`);

  return readFileSync(found, 'utf8');
}

describe('brand marks (D-15 — 수정 금지 에셋)', () => {
  it('레지스트리는 Google · Apple 2건이다', () => {
    expect(Object.keys(BRAND_MARKS)).toEqual(['brand:google', 'brand:apple']);
  });

  it('Google 마크는 공식 4색을 그대로 쓴다', () => {
    const { container } = render(<BrandMark name="brand:google" />);
    const fills = Array.from(container.querySelectorAll('path')).map((path) =>
      path.getAttribute('fill'),
    );

    expect(fills).toEqual(['#4285F4', '#34A853', '#FBBC05', '#EA4335']);
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 48 48');
  });

  it('Apple 마크는 검정 단색이고 공식 비율(814:1000)을 유지한다', () => {
    const { container } = render(<BrandMark name="brand:apple" />);

    expect(container.querySelector('path')?.getAttribute('fill')).toBe('#000000');
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 814 1000');
  });

  it('마크는 장식이다 — 접근성 이름은 버튼 라벨이 갖는다', () => {
    render(
      <Button variant="glass" leadingIcon={<BrandMark name="brand:apple" />}>
        Continue with Apple
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeDefined();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('에셋 파일에 수정 금지 주석이 남아 있다', () => {
    for (const file of ['GoogleMark.tsx', 'AppleMark.tsx']) {
      expect(readSource(file)).toContain('수정 금지 (DO NOT MODIFY)');
    }
  });

  it('브랜드 색을 토큰(var(--…))으로 치환하지 않는다', () => {
    for (const file of ['GoogleMark.tsx', 'AppleMark.tsx']) {
      expect(readSource(file)).not.toMatch(/fill="var\(/);
      expect(readSource(file)).not.toMatch(/fill="currentColor"/);
    }
  });
});
