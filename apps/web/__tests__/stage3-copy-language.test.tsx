/**
 * Stage 3 문구 규칙 — Design Spec §10 · `rules/frontend.md` §8.
 *
 * Home 집계 · 덱 · 읽기 상황 · 진행 안내는 **달성률 언어로 미끄러지기 쉬운 지점**이다
 * (`D-2` 승인 조건 · `D-6`). 금지어를 테스트로 고정한다.
 *
 * 서버가 만든 문장(추천 이유 · 코칭 문장 · Prompt · 캐릭터 버블)은 copy 모듈에 없으므로
 * 이 검사 대상이 아니다 — 그쪽은 `AC-3-13`(응답 값만 표시)이 지킨다.
 *
 * ⚠ 이 파일이 `features/**` 가 아니라 `apps/web/__tests__` 에 있는 이유: 여러 feature 의 copy 를
 * 한 번에 훑기 때문이다. feature 안에 두면 `features/A → features/B` 금지(`AC-3-03`)에 걸린다.
 *
 * 확장자가 `.tsx` 인 이유: `apps/web/tsconfig.node.json` 은 `__tests__` 아래 **`.ts` 파일만**
 * jsx 없이 검사하는데, feature barrel 이 `.tsx` 컴포넌트를 재export 하므로 `.ts` 로 두면
 * 해석되지 않는다.
 */
import { describe, expect, it } from 'vitest';

import { activityDeckCopy } from '../src/features/activity-card-deck';
import { homeOverviewCopy } from '../src/features/home-overview';
import { libraryCopy } from '../src/shared/copy/library-copy';
import { progressCopy } from '../src/shared/copy/progress-copy';

function collect(value: unknown, path: string): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];

  if (typeof value === 'function') {
    const fn = value as (...args: unknown[]) => unknown;
    const attempts: unknown[][] = [[0], [1], [3], [1, 3, 'Goodnight Moon'], ['Bedtime', '19:30']];

    return attempts.flatMap((args, index) => {
      try {
        const result = fn(...args);
        return typeof result === 'string'
          ? [{ path: `${path}#${String(index)}`, text: result }]
          : [];
      } catch {
        return [];
      }
    });
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
      collect(item, `${path}.${key}`),
    );
  }

  return [];
}

const ENTRIES = [
  ...collect(activityDeckCopy, 'activityDeckCopy'),
  ...collect(homeOverviewCopy, 'homeOverviewCopy'),
  ...collect(progressCopy, 'progressCopy'),
  ...collect(libraryCopy, 'libraryCopy'),
];

/** Design Spec §10 "Stage 3 고위험 지점" 의 금지어 목록 그대로. */
const FORBIDDEN: readonly { pattern: RegExp; reason: string }[] = [
  { pattern: /\bstreak\b/i, reason: '연속 기록 표현 (D-6 미채택)' },
  { pattern: /\bgoal\b/i, reason: '목표 표현' },
  { pattern: /\bon track\b/i, reason: '진도 판정' },
  { pattern: /\bbehind\b/i, reason: '뒤처짐 표현' },
  { pattern: /\bmissed\b/i, reason: '누락 표현' },
  { pattern: /\b\d+\s*\/\s*7\b/, reason: '달성률 표기' },
  { pattern: /\d\s*%/, reason: '퍼센트 표기' },
  { pattern: /\brejected\b/i, reason: '판정 어감 (→ "Not available")' },
  { pattern: /\bdiagnos|assessment|evaluate|evaluation|percentile\b/i, reason: '진단·평가 표현' },
  { pattern: /\bcompared? (to|with)\b/i, reason: '비교 표현' },
  { pattern: /\bstage \d|coming soon|next release|not implemented\b/i, reason: '개발 단계 노출' },
];

describe('Stage 3 copy — 금지어 (Design Spec §10)', () => {
  it('검사 대상 문구가 비어 있지 않다 (검사가 헛돌지 않도록)', () => {
    expect(ENTRIES.length).toBeGreaterThan(20);
  });

  it.each(FORBIDDEN)('$reason 이 없다', ({ pattern }) => {
    const offenders = ENTRIES.filter((entry) => pattern.test(entry.text));
    expect(offenders.map((entry) => `${entry.path}: ${entry.text}`)).toStrictEqual([]);
  });

  it('`/progress` 안내에 수치가 없다 (D-2 승인 조건)', () => {
    const texts = [progressCopy.empty.title, progressCopy.empty.description];
    for (const text of texts) expect(text).not.toMatch(/\d/);
  });
});
