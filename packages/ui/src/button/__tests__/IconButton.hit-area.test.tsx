// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/*
 * jsdom 은 레이아웃을 계산하지 않으므로 실제 픽셀 측정은 Playwright(AC-1-21) 몫이다.
 * 여기서는 "시각 크기(38)와 hit area(44)가 분리되어 있고 값이 토큰에서 계산된다"는
 * 구현 규칙 자체를 CSS 원문으로 검증한다 (Design Spec §4.5 · §9.3).
 * 파일을 읽어야 하므로 이 파일만 node 환경에서 실행한다.
 */
const iconButtonCss = readFileSync(
  fileURLToPath(new URL('../IconButton.css', import.meta.url)),
  'utf8',
);

describe('IconButton hit area', () => {
  it('keeps the visual size at --icon-button-size', () => {
    expect(iconButtonCss).toContain('inline-size: var(--icon-button-size)');
    expect(iconButtonCss).toContain('block-size: var(--icon-button-size)');
  });

  it('expands the pressable area to --icon-button-hit-size with a ::before overlay', () => {
    expect(iconButtonCss).toMatch(
      /\.haru-icon-button::before[\s\S]*?inset:\s*calc\(\(var\(--icon-button-size\) - var\(--icon-button-hit-size\)\) \/ 2\)/,
    );
  });
});
