// @vitest-environment node
import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  EXPECTED_BREAKPOINTS,
  EXPECTED_UTILITIES,
  FORBIDDEN_CANDIDATES,
  FORBIDDEN_THEME_VARS,
  compileProbeCss,
  findViolations,
} from '../scripts/verify-tailwind.mjs';

/**
 * 이월 `S1-B-1` — Tailwind `@theme` / `@utility` 가 **실제 빌드에서** 의도대로 동작하는지.
 * 실제 Tailwind 컴파일을 돌리므로 다른 테스트보다 느리다 (수 초).
 */
describe('Tailwind v4 컴파일 (S1-B-1)', () => {
  it(
    'HARU semantic 유틸리티는 생성되고 Tailwind 기본 팔레트 · sm/xl/2xl 은 생성되지 않는다',
    { timeout: 120_000 },
    async () => {
      const css = await compileProbeCss();

      for (const utility of EXPECTED_UTILITIES) {
        expect(css, `${utility} 가 생성되지 않았다`).toContain(utility);
      }

      for (const { candidate, media } of EXPECTED_BREAKPOINTS) {
        expect(css, `${candidate} 가 생성되지 않았다`).toContain(candidate);
        expect(css, `breakpoint ${media} media 조건이 없다`).toContain(media);
      }

      for (const candidate of FORBIDDEN_CANDIDATES) {
        expect(css, `${candidate} 가 생성되면 @theme 초기화가 깨진 것이다`).not.toContain(
          candidate,
        );
      }

      for (const variable of FORBIDDEN_THEME_VARS) {
        expect(css, `${variable} 가 남아 있으면 네임스페이스 초기화가 실패한 것이다`).not.toContain(
          `${variable}:`,
        );
      }

      expect(findViolations(css)).toStrictEqual([]);
    },
  );

  it('CLI(`pnpm verify:tailwind`)도 같은 검사를 통과한다', { timeout: 120_000 }, () => {
    const webRoot = path.resolve(import.meta.dirname, '..');
    const output = execFileSync(
      process.execPath,
      [path.join(webRoot, 'scripts', 'verify-tailwind.mjs')],
      { cwd: webRoot, encoding: 'utf8' },
    );

    expect(output).toContain('[verify-tailwind] OK');
  });
});
