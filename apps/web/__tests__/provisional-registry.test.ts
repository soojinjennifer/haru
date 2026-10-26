// @vitest-environment node
/**
 * 가값(provisional) **등재 누락 가드** — `QA-3-006` 재발 방지.
 *
 * ── 왜 필요한가 ──
 * dev gallery 의 가값 목록(`provisionalItems.ts`)은 Stage 0 `#10-4`(가값 항목별 재제시)의
 * 유일한 제시 수단이다. 그런데 기존 단정은 `gallery-helpers.test.ts` 의
 * "지금 목록이 이것이다"(id 배열 고정)뿐이었다 — **새 가값 토큰이 생겼을 때 아무도 알려주지
 * 않는다**. 그래서 Stage 3 Home 라운드에서 신설된 `P-23`(`--color-prompt-tag-fg`)이 한 라운드
 * 내내 미등재로 남았다 (approvals §21.5 → §26.5).
 *
 * 여기서는 **토큰 소스를 기준**으로 비교한다. 등재를 빠뜨리면 이 파일이 깨진다.
 *
 * `node` 환경인 이유: `packages/design-tokens/src` 의 CSS 를 파일로 읽는다. `apps/web/src`
 * 밑의 테스트는 node 타입을 쓸 수 없다(`tsconfig.json` 은 `src/**` 만 react 설정으로 본다).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { PROVISIONAL_ITEMS } from '../src/dev/ui-gallery/provisionalItems';

const TOKENS_SRC = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../packages/design-tokens/src',
);

/** `packages/design-tokens/src` 의 모든 CSS 를 이어 붙인다 (가값 주석의 단일 기준). */
function readTokenCss(): string {
  function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.name.endsWith('.css') ? [readFileSync(full, 'utf8')] : [];
    });
  }

  return walk(TOKENS_SRC).join('\n');
}

describe('가값 등재 누락 가드 (Stage 0 #10-4 · QA-3-006)', () => {
  const inTokens = [
    ...new Set(
      [...readTokenCss().matchAll(/provisional:\s*(P-\d+)/g)].map((match) => match[1] ?? ''),
    ),
  ].sort();

  it('토큰 소스에서 활성 가값을 실제로 읽어냈다 (검사가 헛돌지 않는다)', () => {
    // `fonts.test.ts` 가 빌드 manifest 로 고정하는 목록과 같아야 한다.
    expect(inTokens).toStrictEqual(['P-01', 'P-02', 'P-04', 'P-16', 'P-23', 'P-24', 'P-25']);
  });

  it('`provisional` 주석이 남아 있는 토큰이 전부 dev gallery 목록에 등재되어 있다', () => {
    const listed = new Set(PROVISIONAL_ITEMS.map((item) => item.id));

    expect(inTokens.filter((id) => !listed.has(id))).toStrictEqual([]);
  });

  it('등재된 항목은 `waiting` 이면 토큰에도 주석이 남아 있다 (해제 누락 방지)', () => {
    const tokenIds = new Set(inTokens);
    const waitingWithoutToken = PROVISIONAL_ITEMS.filter(
      (item) => item.status === 'waiting' && !tokenIds.has(item.id),
    ).map((item) => item.id);

    // `P-17` 은 컴포넌트 규칙(밑줄 제거)이라 토큰 주석이 없다 — 유일한 예외다.
    expect(waitingWithoutToken).toStrictEqual(['P-17']);
  });
});
