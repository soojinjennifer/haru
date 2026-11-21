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
    expect(inTokens).toStrictEqual([
      'P-01',
      'P-02',
      'P-04',
      'P-16',
      'P-23',
      'P-24',
      'P-25',
      'P-30',
      'P-31',
      'P-32',
      'P-33',
      'P-35',
      'P-36',
      'P-37',
      'P-38',
      'P-39',
    ]);
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

    // 토큰이 아닌 곳이 가값을 갖는 항목 — 아래 테스트가 각 소스의 주석을 지킨다.
    // `P-17` 은 컴포넌트 규칙(밑줄 제거)이라 토큰 주석이 없다.
    // `P-40`(Stage 7 막대 강조 비율 0.75)도 **JS 규칙**이라 토큰이 없다 — 주석은
    // `packages/ui/src/chart/barChartLayout.ts` 의 `DEFAULT_EMPHASIS_RATIO` 가 갖는다 (아래 테스트가 지킨다).
    // Stage 8 `S8-G` 등재(Plan 부록 B.2-④): `P-19` · `P-21` = 후보(주석 없음 — 재제시 자료) ·
    // `P-26`~`P-29` · `P-41` = 컴포넌트 · 화면 CSS 주석 · `P-42` = JS 상수 주석.
    // `D8-3` `P-43` = 화면 CSS 주석 (토큰 값은 Figma 그대로 — 사용처가 가값).
    // `D8-4` `P-18` = 토큰은 있으나 `provisional` 주석 없음(`H8-6-N7`) · `P-22` = 에셋 가값(주석 대상 없음).
    expect(waitingWithoutToken).toStrictEqual([
      'P-17',
      'P-18',
      'P-19',
      'P-21',
      'P-22',
      'P-26',
      'P-27',
      'P-28',
      'P-29',
      'P-40',
      'P-41',
      'P-42',
      'P-43',
    ]);
  });

  it('토큰 밖 가값의 `provisional` 주석이 소스에 남아 있다 (Stage 8 `S8-G` 등재분)', () => {
    const read = (relative: string) =>
      readFileSync(resolve(TOKENS_SRC, '../../..', relative), 'utf8');
    const sources: readonly (readonly [id: string, file: string])[] = [
      ['P-26', 'apps/web/src/entities/session/session.css'],
      ['P-27', 'apps/web/src/entities/session/session.css'],
      ['P-28', 'packages/ui/src/field/TextInput.css'],
      ['P-29', 'packages/ui/src/rating/StarRating.css'],
      ['P-41', 'apps/web/src/features/data-management/data-management.css'],
      ['P-41', 'apps/web/src/features/account-deletion/account-deletion.css'],
      ['P-41', 'apps/web/src/features/onboarding-survey/onboarding.css'],
      ['P-43', 'apps/web/src/features/auth/auth.css'],
    ];
    for (const [id, file] of sources) {
      expect(read(file), `${id} @ ${file}`).toMatch(new RegExp(`provisional:\\s*${id}\\b`));
    }
    // `P-42` 는 JS 상수 두 개가 주석을 갖는다
    const polling = read('apps/web/src/entities/data-management/deletionPolling.ts');
    expect(polling).toMatch(
      /provisional `P-42`\s*\*\/\s*export const DELETION_POLL_INTERVAL_MS = 5_000;/,
    );
    expect(polling).toMatch(
      /provisional `P-42`[^*]*\*\/\s*export const DELETION_POLL_MAX_READS = 60;/,
    );
  });

  it('`P-40` 주석이 막대 강조 규칙 소스에 남아 있다 (토큰 대신 코드가 갖는 가값)', () => {
    const source = readFileSync(
      resolve(TOKENS_SRC, '../../ui/src/chart/barChartLayout.ts'),
      'utf8',
    );
    expect(source).toMatch(/provisional:\s*P-40/);
    expect(source).toMatch(/DEFAULT_EMPHASIS_RATIO = 0\.75;/);
  });

  it('`D8-4` 등재 `P-18` · `P-22` — 등재 근거가 된 사실이 그대로다 (`H8-6-N7`)', () => {
    const css = readTokenCss();
    // `P-18` = 토큰이 **있다**(56) · `provisional` 주석은 없다 — 등재는 재제시 자료일 뿐 토큰을 바꾸지 않는다.
    expect(css).toMatch(/--list-row-height-min:\s*56px;/);
    const line = css.split('\n').find((row) => row.includes('--list-row-height-min:'));
    expect(line).not.toMatch(/provisional/);
    expect(css).not.toMatch(/provisional:\s*P-18\b/);
    // `P-22` = 에셋 가값 — 토큰 소스에 없다.
    expect(css).not.toMatch(/\bP-22\b/);
    const ids = PROVISIONAL_ITEMS.map((item) => item.id);
    expect(ids).toContain('P-18');
    expect(ids).toContain('P-22');
  });
});
