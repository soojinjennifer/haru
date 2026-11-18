/**
 * 역량 → 다이아몬드 축 매핑 — Stage 6 Spec §3.1 · §3.7 (`N6-28` · `D6-8`).
 *
 * `packages/ui` `DiamondChart` 는 역량을 모른다. 축 순서 · 라벨(#14) · tone(#19) · summary 문장은 이 도메인
 * 레이어가 정한다.
 *
 * **축 순서 고정** (시계 방향): 위 Self-Direction → 오른쪽 Emotion Regulation → 아래 Cognitive Flexibility →
 * 왼쪽 Intrinsic Motivation — Figma `163:2607` "Growth themes" 의 역량 행 순서 (`N6-28`). Stage 7 오버레이도
 * 이 순서를 쓴다.
 */
import type { DiamondAxis } from '@haru/ui';
import type { Capability, CapabilityScore } from '@haru/contracts';

import { capabilityCopy } from '../../shared/copy/capability-copy';
import { CAPABILITY_TONE } from '../activity-card';

import { childProfileCopy, joinCapabilityList } from './copy';

export const CAPABILITY_AXIS_ORDER = [
  'self_directed_agency',
  'emotion_regulation',
  'cognitive_flexibility',
  'intrinsic_motivation',
] as const satisfies readonly Capability[];

/** 점수 척도 상한 — contracts `CapabilityScoreSchema` (1.0–5.0). */
export const CAPABILITY_SCORE_MAX = 5;

export type CapabilityDiamondAxes = readonly [DiamondAxis, DiamondAxis, DiamondAxis, DiamondAxis];

function axisFor(capability: Capability, scores: readonly CapabilityScore[]): DiamondAxis {
  const score = scores.find((entry) => entry.capability === capability);
  return {
    id: capability,
    label: capabilityCopy[capability],
    // 행이 없거나 `score: null` 이면 미관찰 — 대체값을 넣지 않는다 (C-8 · D-2 ①).
    value: score?.score ?? null,
    tone: CAPABILITY_TONE[capability],
  };
}

/** 스냅샷 점수 4행 → 고정 순서 축 4개. */
export function toCapabilityAxes(scores: readonly CapabilityScore[]): CapabilityDiamondAxes {
  const [top, right, bottom, left] = CAPABILITY_AXIS_ORDER;
  return [
    axisFor(top, scores),
    axisFor(right, scores),
    axisFor(bottom, scores),
    axisFor(left, scores),
  ];
}

export type CapabilitySummaryContext = 'starting' | 'current';

export interface CapabilitySummaryInput {
  firstName: string;
  context: CapabilitySummaryContext;
  /** 서버 응답 순서 그대로 (Frontend 선정·정렬 0 — AC-6-59). */
  strengths: readonly Capability[];
  growingEdges: readonly Capability[];
  scores: readonly CapabilityScore[];
}

/**
 * 차트 대체 텍스트 (Spec §9.2).
 * ```
 * "Starting point for {firstName}. "
 * + (strengths ? "What we saw most: {A} and {B}. " : "")
 * + (growingEdges ? "Where we'll look next: {C} and {D}. " : "")
 * + (nullAxes ? "Not observed yet: {E}. " : "")
 * ```
 * 미관찰 축은 축 순서대로 나열한다 (화면 순서와 같다).
 */
export function buildCapabilitySummary(input: CapabilitySummaryInput): string {
  const copy = childProfileCopy.chart;
  const labels = (list: readonly Capability[]) =>
    joinCapabilityList(list.map((c) => capabilityCopy[c]));
  const notObserved = toCapabilityAxes(input.scores)
    .filter((axis) => axis.value === null)
    .map((axis) => axis.label);

  return [
    input.context === 'starting'
      ? copy.startingLead(input.firstName)
      : copy.currentLead(input.firstName),
    input.strengths.length > 0 ? copy.strengths(labels(input.strengths)) : null,
    input.growingEdges.length > 0 ? copy.growingEdges(labels(input.growingEdges)) : null,
    notObserved.length > 0 ? copy.notObserved(joinCapabilityList(notObserved)) : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' ');
}
