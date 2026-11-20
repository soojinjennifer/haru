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
import { progressOverviewCopy } from '../src/features/progress-overview';
import { libraryCopy } from '../src/shared/copy/library-copy';

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
  // Stage 7 `S7-C` — Stage 3 준비 안내(`progressCopy`, `D-2`)가 `/progress` 화면 copy 로 대체됐다 (AC-7-03).
  ...collect(progressOverviewCopy, 'progressOverviewCopy'),
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

/**
 * Figma 원문을 그대로 쓴 구절 — 금지어 검사에서 **이 구절만** 뺀다 (나머지 문장은 그대로 검사한다).
 *
 * - `the moments behind them` — Figma `110:847` *"Apr 13 – May 10 · a deeper read on the four themes, with the moments
 *   behind them."* (Stage 7 Spec §10.2 승인 문구, `D7-5`). "behind" 가 **뒤처짐**이 아니라 "그 뒤에 있는(근거가 된)
 *   순간들" 이라는 뜻이다. 정규식을 느슨하게 하지 않고 구절 단위로만 예외를 둔다.
 */
const FIGMA_VERBATIM = ['the moments behind them'] as const;

function withoutFigmaVerbatim(text: string): string {
  return FIGMA_VERBATIM.reduce((rest, phrase) => rest.split(phrase).join(''), text);
}

describe('Stage 3 copy — 금지어 (Design Spec §10)', () => {
  it('검사 대상 문구가 비어 있지 않다 (검사가 헛돌지 않도록)', () => {
    expect(ENTRIES.length).toBeGreaterThan(20);
  });

  it.each(FORBIDDEN)('$reason 이 없다', ({ pattern }) => {
    const offenders = ENTRIES.filter((entry) => pattern.test(withoutFigmaVerbatim(entry.text)));
    expect(offenders.map((entry) => `${entry.path}: ${entry.text}`)).toStrictEqual([]);
  });

  /*
    Stage 3 의 "`/progress` 안내에 수치가 없다 (D-2)" 단정은 대상(준비 안내 화면)이 Stage 7 `S7-C` 로 **대체**되어 옮겼다:
    `/progress` 는 이제 서버 관찰 수치(세션 수 · 분)를 보여 준다(`D7-1`). 대신 `D7-2` · `N7-05` 의 비교·분모·퍼센트 금지를
    `apps/web/__tests__/stage7-progress-copy.test.ts` 가 지킨다 (AC-7-66).
  */
  it('`/progress` 문구에 비교 · 분모 · 퍼센트 표현이 없다 (D7-2 · N7-05 — D-2 의 후속)', () => {
    const progress = collect(progressOverviewCopy, 'progressOverviewCopy');
    const offenders = progress.filter((entry) => /\bvs\b|\bof 7\b|%|\bstreak\b/i.test(entry.text));
    expect(offenders).toStrictEqual([]);
  });
});
