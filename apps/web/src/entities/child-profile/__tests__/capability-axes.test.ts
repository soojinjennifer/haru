/**
 * 역량 → 축 매핑 · summary 문장 — Stage 6 Spec §3.1 · §9.2 · §10.5 (`N6-28` · `N6-29`, AC-6-57 · 59).
 */
import type { CapabilityScore } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { buildCapabilitySummary, CAPABILITY_AXIS_ORDER, toCapabilityAxes } from '../capabilityAxes';
import { childProfileCopy, joinCapabilityList } from '../copy';

function score(capability: CapabilityScore['capability'], value: number | null): CapabilityScore {
  return {
    capability,
    score: value,
    itemCount: value === null ? 0 : 3,
    missingCount: value === null ? 3 : 0,
  };
}

/** 응답 배열 순서가 축 순서와 달라도 축 순서는 고정이다. */
const SCORES: CapabilityScore[] = [
  score('emotion_regulation', 3.5),
  score('self_directed_agency', 4.3),
  score('cognitive_flexibility', 2.5),
  score('intrinsic_motivation', 3.7),
];

describe('축 순서 (`N6-28`)', () => {
  it('위 Self-Direction → 오른 Emotion Regulation → 아래 Cognitive Flexibility → 왼 Intrinsic Motivation', () => {
    expect(CAPABILITY_AXIS_ORDER).toEqual([
      'self_directed_agency',
      'emotion_regulation',
      'cognitive_flexibility',
      'intrinsic_motivation',
    ]);
    expect(toCapabilityAxes(SCORES)).toEqual([
      { id: 'self_directed_agency', label: 'Self-Direction', value: 4.3, tone: 'agency' },
      { id: 'emotion_regulation', label: 'Emotion Regulation', value: 3.5, tone: 'emotion' },
      {
        id: 'cognitive_flexibility',
        label: 'Cognitive Flexibility',
        value: 2.5,
        tone: 'flexibility',
      },
      { id: 'intrinsic_motivation', label: 'Intrinsic Motivation', value: 3.7, tone: 'motivation' },
    ]);
  });

  it('`score: null` 은 null 그대로 — 대체값 0 (C-8 · D-2 ①)', () => {
    const axes = toCapabilityAxes([
      ...SCORES.slice(0, 2),
      score('cognitive_flexibility', null),
      SCORES[3] as CapabilityScore,
    ]);
    expect(axes[2].value).toBeNull();
  });
});

describe('summary (Spec §9.2)', () => {
  it('온보딩 — 서버 strengths · growingEdges 순서 그대로', () => {
    expect(
      buildCapabilitySummary({
        firstName: 'Emma',
        context: 'starting',
        strengths: ['self_directed_agency', 'intrinsic_motivation'],
        growingEdges: ['cognitive_flexibility', 'emotion_regulation'],
        scores: SCORES,
      }),
    ).toBe(
      "Starting point for Emma. What we saw most: Self-Direction and Intrinsic Motivation. Where we'll look next: Cognitive Flexibility and Emotion Regulation.",
    );
  });

  it('변형 C — Spec 예문 그대로', () => {
    expect(
      buildCapabilitySummary({
        firstName: 'Emma',
        context: 'starting',
        strengths: [],
        growingEdges: [],
        scores: CAPABILITY_AXIS_ORDER.map((capability) => score(capability, null)),
      }),
    ).toBe(
      'Starting point for Emma. Not observed yet: Self-Direction, Emotion Regulation, Cognitive Flexibility, and Intrinsic Motivation.',
    );
  });

  it('재방문 첫 구 · 부분 결측', () => {
    expect(
      buildCapabilitySummary({
        firstName: 'Emma',
        context: 'current',
        strengths: ['self_directed_agency'],
        growingEdges: [],
        scores: [
          SCORES[0] as CapabilityScore,
          SCORES[1] as CapabilityScore,
          score('cognitive_flexibility', null),
          SCORES[3] as CapabilityScore,
        ],
      }),
    ).toBe(
      'Where Emma is right now. What we saw most: Self-Direction. Not observed yet: Cognitive Flexibility.',
    );
  });

  it('목록 결합 — 1 · 2 · 3+ (Oxford comma)', () => {
    expect(joinCapabilityList([])).toBe('');
    expect(joinCapabilityList(['A'])).toBe('A');
    expect(joinCapabilityList(['A', 'B'])).toBe('A and B');
    expect(joinCapabilityList(['A', 'B', 'C'])).toBe('A, B, and C');
  });
});

describe('금칙어 · 숫자 (Spec §10.5 · `N6-29`)', () => {
  const FORBIDDEN =
    /diagnos|score|rating|level|grade|assess|weak|strong|\blow\b|high|lowest|below|behind|average|normal|better|worse|peers|fail|invalid|error|!/i;

  function strings(value: unknown): string[] {
    // 템플릿 함수는 이름 하나를 넣어 펼친다
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [String((value as (name: string) => string)('Emma'))];
    if (typeof value === 'object' && value !== null) return Object.values(value).flatMap(strings);
    return [];
  }

  it('entities copy 전부 금칙어 0 · 숫자 0 (feature copy 는 `__tests__/profile-result.test.tsx`)', () => {
    const all = strings(childProfileCopy);
    expect(all.length).toBeGreaterThan(8);
    for (const text of all) {
      expect(text).not.toMatch(FORBIDDEN);
      expect(text).not.toMatch(/\d/);
    }
  });
});
