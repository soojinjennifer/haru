import { describe, expect, it } from 'vitest';

import {
  CAPABILITIES,
  CAPABILITY_SCORING_VERSION,
  CapabilityScoreSchema,
  capabilityHighlightCount,
  scoreCapabilities,
  selectGrowingEdges,
  selectStrengths,
  suggestGrowthCapability,
  type CapabilityItemAnswer,
  type SurveyItem,
} from '../index.js';

/**
 * 역량 산식과 D-2 null 처리 — `docs/API_CONTRACTS.md` §3.4 (C-8),
 * `docs/decisions/stage-2-approvals.md` §4 D-2.
 */
const ITEMS: SurveyItem[] = [
  ['ER1', 'emotion_regulation'],
  ['ER2', 'emotion_regulation'],
  ['AG1', 'self_directed_agency'],
  ['AG2', 'self_directed_agency'],
  ['AG3', 'self_directed_agency'],
  ['CF1', 'cognitive_flexibility'],
  ['CF2', 'cognitive_flexibility'],
  ['IM1', 'intrinsic_motivation'],
  ['IM2', 'intrinsic_motivation'],
  ['IM3', 'intrinsic_motivation'],
].map(([itemCode, capability], index) => ({
  itemCode: itemCode as string,
  capability: capability as SurveyItem['capability'],
  order: index + 1,
  prompt: `prompt ${String(index + 1)}`,
}));

function answers(values: Record<string, CapabilityItemAnswer['value']>): CapabilityItemAnswer[] {
  return Object.entries(values).map(([itemCode, value]) => ({ itemCode, value }));
}

const MIXED = answers({
  ER1: 5,
  ER2: 4,
  AG1: 2,
  AG2: 3,
  AG3: 2,
  CF1: 4,
  CF2: 4,
  IM1: 1,
  IM2: 2,
  IM3: 3,
});

describe('scoreCapabilities', () => {
  it('항상 4대 역량을 선언 순서로 돌려준다', () => {
    expect(scoreCapabilities(ITEMS, MIXED).map((entry) => entry.capability)).toEqual([
      ...CAPABILITIES,
    ]);
  });

  it('응답 평균을 소수 1자리로 반올림한다', () => {
    const scores = scoreCapabilities(ITEMS, MIXED);
    expect(scores.map((entry) => entry.score)).toEqual([4.5, 2.3, 4, 2]);
    expect(scores.every((entry) => entry.missingCount === 0)).toBe(true);
  });

  it("'not_observed' 는 결측이며 평균에서 제외된다 (낮은 점수가 아니다 — C-8)", () => {
    const [emotionRegulation] = scoreCapabilities(
      ITEMS,
      answers({
        ...Object.fromEntries(MIXED.map((a) => [a.itemCode, a.value])),
        ER2: 'not_observed',
      }),
    );
    expect(emotionRegulation).toEqual({
      capability: 'emotion_regulation',
      score: 5,
      itemCount: 1,
      missingCount: 1,
    });
  });

  it('한 역량이 전부 결측이면 score 는 null 이고 대체값을 넣지 않는다 (D-2 ①)', () => {
    const [emotionRegulation] = scoreCapabilities(
      ITEMS,
      answers({ ER1: 'not_observed', ER2: 'not_observed', AG1: 3 }),
    );
    expect(emotionRegulation).toEqual({
      capability: 'emotion_regulation',
      score: null,
      itemCount: 0,
      missingCount: 2,
    });
  });

  it('미응답 문항도 결측으로 센다 — itemCount + missingCount = 역량별 문항 수', () => {
    for (const entry of scoreCapabilities(ITEMS, [])) {
      expect(entry.score).toBeNull();
      expect(entry.itemCount).toBe(0);
      expect(entry.itemCount + entry.missingCount).toBe(
        ITEMS.filter((item) => item.capability === entry.capability).length,
      );
    }
  });

  it('결과가 CapabilityScore schema 를 통과한다', () => {
    for (const entry of scoreCapabilities(ITEMS, MIXED)) {
      expect(CapabilityScoreSchema.parse(entry)).toEqual(entry);
    }
  });

  it('같은 입력에 대해 결정적이다', () => {
    expect(scoreCapabilities(ITEMS, MIXED)).toEqual(scoreCapabilities(ITEMS, MIXED));
    expect(CAPABILITY_SCORING_VERSION).toBe('v1');
  });
});

describe('강점 · growing edge 선정 — D-2 ③', () => {
  it('점수가 높은 순 / 낮은 순으로 각각 2개를 고른다', () => {
    const scores = scoreCapabilities(ITEMS, MIXED);
    expect(selectStrengths(scores)).toEqual(['emotion_regulation', 'cognitive_flexibility']);
    expect(selectGrowingEdges(scores)).toEqual(['intrinsic_motivation', 'self_directed_agency']);
  });

  it('score: null 역량은 양쪽 후보에서 제외된다', () => {
    const scores = scoreCapabilities(
      ITEMS,
      answers({ ER1: 'not_observed', ER2: 'not_observed', AG1: 2, CF1: 5, IM1: 3 }),
    );
    expect(selectStrengths(scores)).not.toContain('emotion_regulation');
    expect(selectGrowingEdges(scores)).not.toContain('emotion_regulation');
  });

  it('한 역량이 강점과 growing edge 에 동시에 들어가지 않는다 (동점 포함)', () => {
    const scores = scoreCapabilities(ITEMS, answers({ ER1: 3, AG1: 3, CF1: 3, IM1: 3 }));
    const strengths = selectStrengths(scores);
    const growingEdges = selectGrowingEdges(scores);
    expect(strengths).toEqual(['emotion_regulation', 'self_directed_agency']);
    expect(growingEdges).toEqual(['cognitive_flexibility', 'intrinsic_motivation']);
    expect(strengths.filter((capability) => growingEdges.includes(capability))).toEqual([]);
  });

  it('관찰된 역량 수에 따라 제시 개수가 줄어든다 (경계)', () => {
    expect(capabilityHighlightCount(0)).toBe(0);
    expect(capabilityHighlightCount(1)).toBe(0);
    expect(capabilityHighlightCount(2)).toBe(1);
    expect(capabilityHighlightCount(3)).toBe(1);
    expect(capabilityHighlightCount(4)).toBe(2);
  });

  it('관찰된 역량이 1개뿐이면 양쪽 모두 비운다', () => {
    const scores = scoreCapabilities(ITEMS, answers({ ER1: 4 }));
    expect(selectStrengths(scores)).toEqual([]);
    expect(selectGrowingEdges(scores)).toEqual([]);
  });

  it('전 역량 결측이면 양쪽 모두 비운다', () => {
    const scores = scoreCapabilities(ITEMS, []);
    expect(selectStrengths(scores)).toEqual([]);
    expect(selectGrowingEdges(scores)).toEqual([]);
  });
});

describe('suggestGrowthCapability — D-2 ④·⑤', () => {
  it('가장 낮은 **관찰된** 역량을 제안한다', () => {
    expect(suggestGrowthCapability(scoreCapabilities(ITEMS, MIXED))).toBe('intrinsic_motivation');
  });

  it('score: null 역량은 제안 후보가 아니다 (관찰되지 않은 영역을 약점으로 지목하지 않는다)', () => {
    const scores = scoreCapabilities(ITEMS, answers({ AG1: 4, CF1: 2 }));
    expect(suggestGrowthCapability(scores)).toBe('cognitive_flexibility');
  });

  it('전 역량이 결측이면 null 을 돌려준다 — 사용자가 직접 고른다', () => {
    expect(suggestGrowthCapability(scoreCapabilities(ITEMS, []))).toBeNull();
  });

  it('동점은 선언 순서로 결정적으로 깬다', () => {
    const scores = scoreCapabilities(ITEMS, answers({ ER1: 2, AG1: 2 }));
    expect(suggestGrowthCapability(scores)).toBe('emotion_regulation');
  });
});
