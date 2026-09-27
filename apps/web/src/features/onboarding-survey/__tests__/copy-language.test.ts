/**
 * 온보딩 문구 규칙 — `.claude/rules/frontend.md` §8 + 결정 **D-B** 주의사항
 * (`docs/decisions/stage-2-approvals.md` §8.2).
 *
 * Step 4(함께 키우고 싶은 것)와 프로필 결과(지금 관찰된 신호)가 **같은 라벨**을 쓰게 되었으므로,
 * 두 화면이 서로를 평가하는 것처럼 읽히는 문구가 들어오지 않도록 **테스트로 고정**한다.
 *
 * 금지: "목표 대비 달성" · "기대 vs 실제" · 점수 비교 · 미달 표시 · 진단/판정 표현.
 */
import { describe, expect, it } from 'vitest';

import { onboardingCopy } from '../copy';

/** 문구 객체를 평평하게 펴서 문자열만 모은다 (함수형 문구는 대표 인자로 호출한다). */
function collectStrings(value: unknown, path = 'onboardingCopy'): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];

  if (typeof value === 'function') {
    // 문구 템플릿 — 숫자·문자 인자를 넣어 결과 문자열까지 검사한다.
    const fn = value as (...args: unknown[]) => unknown;
    const attempts: unknown[][] = [[2], [2, 5], ['Sample title'], []];

    for (const args of attempts) {
      try {
        const result = fn(...args);
        if (typeof result === 'string') return [{ path, text: result }];
      } catch {
        // 다른 인자 조합을 시도한다.
      }
    }

    return [];
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) =>
      collectStrings(item, `${path}.${key}`),
    );
  }

  return [];
}

const ENTRIES = collectStrings(onboardingCopy);

/** 비교·평가·진단으로 읽히는 표현. 하나라도 걸리면 어떤 문구인지 함께 보고한다. */
const FORBIDDEN: readonly { pattern: RegExp; reason: string }[] = [
  { pattern: /\bvs\.?\b|\bversus\b/i, reason: '대조 표현 (기대 vs 실제)' },
  { pattern: /\bcompared? (to|with)\b|\bcomparison\b/i, reason: '비교 표현' },
  { pattern: /\bgoal (progress|achieved|met|reached)\b/i, reason: '목표 달성 표현' },
  { pattern: /\b(achieved|achievement|accomplished)\b/i, reason: '달성 표현' },
  { pattern: /\b(falls?|fell) short\b|\bbelow (average|target|expectation)/i, reason: '미달 표현' },
  { pattern: /\b(percentile|ranking)\b/i, reason: '순위 표현' },
  {
    // "not a score" · "isn't scored" 같은 **부정** 표현은 허용한다 — 진단이 아님을 말하는 문구다.
    pattern: /\b(your|their|the child'?s) (score|level|rating)\b/i,
    reason: '점수 제시 표현',
  },
  { pattern: /\bscore[sd]? (higher|lower|better|worse)\b/i, reason: '점수 비교 표현' },
  { pattern: /\b(diagnos|assessment|evaluate|evaluation|test result)/i, reason: '진단·평가 표현' },
  { pattern: /\b(delay|behind|lagging|deficit|weakness|poor)\b/i, reason: '결함·지연 표현' },
  { pattern: /\b(normal|abnormal|average child|typical child)\b/i, reason: '정상/비정상 표현' },
  { pattern: /\b(better|worse) than\b/i, reason: '우열 비교' },
];

describe('D-B — Step 4 와 프로필 결과가 서로를 평가하지 않는다 (approvals §8.2)', () => {
  it('수집한 문구가 비어 있지 않다 (검사가 헛돌지 않도록)', () => {
    expect(ENTRIES.length).toBeGreaterThan(40);
  });

  for (const { pattern, reason } of FORBIDDEN) {
    it(`금칙 표현이 없다 — ${reason}`, () => {
      const offenders = ENTRIES.filter((entry) => pattern.test(entry.text));

      expect(offenders.map((entry) => `${entry.path}: ${entry.text}`)).toStrictEqual([]);
    });
  }

  it('Step 4 문구는 "무엇을 함께 키우고 싶은지" 를 묻는다 (관찰 결과를 묻지 않는다)', () => {
    const prompt = onboardingCopy.questions['goals.growth_goals'].prompt;

    expect(prompt).toContain('grow together');
    expect(prompt).not.toMatch(/how (good|well|strong)/i);
  });

  it('Step 4 선택지는 4대 역량 코드를 키로 쓰되 화면 문구는 보호자 언어다', () => {
    const labels = Object.values(onboardingCopy.choiceOptions['goals.growth_goals']);

    expect(labels).toHaveLength(4);
    for (const label of labels) {
      // 역량 코드·내부 용어가 그대로 노출되지 않는다 (질문지 "zero HARU vocabulary").
      expect(label).not.toMatch(/emotion_regulation|self_directed|cognitive_flexibility|axis/i);
    }
  });
});

describe('S2-COPY-1 — 문구 미확정 슬롯 (approvals §6 ②)', () => {
  it('소개 화면의 소요 시간 · 진행 방식 문구는 빈 슬롯이다 (플레이스홀더 금지)', () => {
    expect(onboardingCopy.intro.durationSlot).toBeNull();
    expect(onboardingCopy.intro.formatSlot).toBeNull();
  });
});
