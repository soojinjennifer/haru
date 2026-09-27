import { type CapabilityScore } from '../children/snapshot.js';
import { CapabilitySchema, type Capability } from '../enums/capability.js';
import { type CapabilityItemAnswer, type SurveyItem } from '../onboarding/survey.js';

/**
 * 온보딩 설문 → 4대 역량 점수 산식 — **CONFIRMED (사용자 결정 2026-09-14, C-8)**.
 * 근거: `docs/API_CONTRACTS.md` §3.4, `docs/plans/stage-2-plan.md` §7.1,
 * `docs/decisions/stage-2-approvals.md` §4 **D-2**.
 *
 * 이 파일의 함수는 전부 **부수효과 없는 순수 함수**다. Mock · 테스트 · 향후 Backend 가
 * 같은 규칙을 공유하기 위해 contracts 에 둔다. Frontend 화면은 계산 결과가 아니라
 * **API 응답 값을 표시**한다 (`.claude/rules/architecture.md` §8).
 *
 * D-2 요약 (contracts 반영분):
 * - ① `score: null` 유지 — 대체값 없음, `itemCount` · `missingCount` 동반
 * - ③ 강점 / growing edge 후보에서 `score: null` 역량 **제외**
 * - ④ 발전 역량 기본값 후보에서도 **제외**
 * - ⑤ 전 역량 결측이면 `null` 을 허용하고 사용자가 직접 고른다
 * - ② 다이아몬드 시각 표현은 **Stage 2-B** 다 (이 파일의 범위가 아니다)
 */

/** 산식 버전 — 산식이 바뀌면 이 값을 올리고 스냅샷과 함께 저장한다. */
export const CAPABILITY_SCORING_VERSION = 'v1';

/** 역량 선언 순서. 동점 처리의 결정적(deterministic) tie-breaker 로 쓴다. */
export const CAPABILITIES = CapabilitySchema.options;

/** 강점 · growing edge 로 제시하는 최대 역량 수 (PRD §7.3). */
const HIGHLIGHT_COUNT = 2;

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * 문항 정의와 응답으로 역량별 점수를 계산한다.
 *
 * - 응답 값이 숫자(1–5)인 문항만 평균에 넣는다. `'not_observed'` 와 미응답은 **결측**이다.
 * - 평균은 소수 1자리로 반올림한다 (RECOMMENDED — `docs/API_CONTRACTS.md` §3.4).
 * - 사용된 문항이 0개면 `score: null` 이다. 0 이나 1.0 으로 낮추지 않는다.
 * - 반환 순서는 항상 `CAPABILITIES` 순서이며 4개 전부를 포함한다.
 */
export function scoreCapabilities(
  items: readonly SurveyItem[],
  answers: readonly CapabilityItemAnswer[],
): CapabilityScore[] {
  const answerByItemCode = new Map(answers.map((answer) => [answer.itemCode, answer.value]));

  return CAPABILITIES.map((capability) => {
    const capabilityItems = items.filter((item) => item.capability === capability);
    const values = capabilityItems
      .map((item) => answerByItemCode.get(item.itemCode))
      .filter((value): value is 1 | 2 | 3 | 4 | 5 => typeof value === 'number');

    const sum = values.reduce((total, value) => total + value, 0);

    return {
      capability,
      score: values.length === 0 ? null : roundToOneDecimal(sum / values.length),
      itemCount: values.length,
      missingCount: capabilityItems.length - values.length,
    };
  });
}

/** `score` 가 있는 항목만 남긴다 (D-2 ③·④ — 결측 역량은 어떤 후보 목록에도 넣지 않는다). */
function scoredOnly(
  scores: readonly CapabilityScore[],
): { capability: Capability; score: number }[] {
  return scores
    .filter((entry): entry is CapabilityScore & { score: number } => entry.score !== null)
    .map((entry) => ({ capability: entry.capability, score: entry.score }));
}

function capabilityOrder(capability: Capability): number {
  return CAPABILITIES.indexOf(capability);
}

/**
 * 강점 / growing edge 각각에 제시할 개수.
 *
 * 한 역량이 **강점과 growing edge 에 동시에** 나타나면 안 되므로, 점수가 있는 역량 수의
 * 절반을 넘지 않게 한다. 관찰된 역량이 1개뿐이면 양쪽 모두 비운다
 * (같은 역량을 "잘하는 점"이자 "키울 점"으로 제시하지 않는다).
 */
export function capabilityHighlightCount(scoredCount: number): number {
  return Math.min(HIGHLIGHT_COUNT, Math.floor(scoredCount / 2));
}

/**
 * 강점 역량 — 점수가 높은 순. 동점은 `CAPABILITIES` 선언 순서로 깬다(결정적).
 * `score: null` 역량은 후보에서 제외한다 (D-2 ③).
 */
export function selectStrengths(scores: readonly CapabilityScore[]): Capability[] {
  const scored = scoredOnly(scores);
  const count = capabilityHighlightCount(scored.length);

  return scored
    .slice()
    .sort(
      (a, b) => b.score - a.score || capabilityOrder(a.capability) - capabilityOrder(b.capability),
    )
    .slice(0, count)
    .map((entry) => entry.capability);
}

/**
 * growing edge 역량 — 점수가 낮은 순. 동점은 `CAPABILITIES` 선언 순서로 깬다(결정적).
 * `score: null` 역량은 후보에서 제외하며 (D-2 ③), `selectStrengths` 결과와 겹치지 않는다.
 *
 * "growing edge" 는 부족·미달이 아니라 **함께 키워갈 영역**이다 (PRD §8.4 긍정 언어).
 */
export function selectGrowingEdges(scores: readonly CapabilityScore[]): Capability[] {
  const scored = scoredOnly(scores);
  const count = capabilityHighlightCount(scored.length);
  const strengths = new Set<Capability>(selectStrengths(scores));

  return scored
    .filter((entry) => !strengths.has(entry.capability))
    .sort(
      (a, b) => a.score - b.score || capabilityOrder(a.capability) - capabilityOrder(b.capability),
    )
    .slice(0, count)
    .map((entry) => entry.capability);
}

/**
 * 발전 역량 기본 제안 — 점수가 가장 낮은 **관찰된** 역량. 동점은 선언 순서로 깬다.
 *
 * 전 역량이 결측이면 `null` 을 돌려주고, 발전 역량 화면에서 사용자가 직접 고른다 (D-2 ④·⑤).
 * 관찰되지 않은 영역을 약점으로 지목하지 않기 위한 규칙이다.
 */
export function suggestGrowthCapability(scores: readonly CapabilityScore[]): Capability | null {
  const scored = scoredOnly(scores);
  if (scored.length === 0) return null;

  const lowest = scored
    .slice()
    .sort(
      (a, b) => a.score - b.score || capabilityOrder(a.capability) - capabilityOrder(b.capability),
    )[0];

  return lowest === undefined ? null : lowest.capability;
}
