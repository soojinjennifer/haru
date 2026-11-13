// @vitest-environment node
/**
 * `D5-13` (QA-5-003, 허용 차이 `AD-S5-2`) — viewport meta 고정.
 *
 * 회고 카드 입력칸은 Figma 13px(`--text-footnote`)이라 iOS Safari 가 포커스 때 화면을 확대하고 되돌리지 않는다.
 * `maximum-scale=1` 로 막고 입력칸 크기는 바꾸지 않는다. 기존 세 값(`width=device-width` · `initial-scale=1` ·
 * `viewport-fit=cover`)도 유지해야 한다 — 하나라도 빠지면 이 테스트가 깨진다.
 * Vite 는 이 meta 를 그대로 옮긴다 — 빌드 산출물 확인은 handoff `H5-7` 의 명령 증거로 남긴다.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const WEB_ROOT = join(import.meta.dirname, '..');
const EXPECTED = 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover';

function viewportContents(html: string): string[] {
  const metas = html.match(/<meta\b[^>]*\bname="viewport"[^>]*>/g) ?? [];
  return metas.map((tag) => /\bcontent="([^"]*)"/.exec(tag)?.[1] ?? '');
}

describe('viewport meta (D5-13 · AD-S5-2)', () => {
  it('source index.html has exactly one viewport meta with maximum-scale=1', () => {
    const html = readFileSync(join(WEB_ROOT, 'index.html'), 'utf8');
    expect(viewportContents(html)).toEqual([EXPECTED]);
  });

  it('does not disable user scaling outright (iOS pinch zoom stays)', () => {
    const html = readFileSync(join(WEB_ROOT, 'index.html'), 'utf8');
    expect(html).not.toMatch(/user-scalable\s*=\s*(no|0)/);
  });
});
