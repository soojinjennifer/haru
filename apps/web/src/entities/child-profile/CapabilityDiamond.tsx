/**
 * `CapabilityDiamond` — 역량 다이아몬드 (Domain). Stage 6 Spec §3.1 · §3.7 · §9.2.
 *
 * 스냅샷 점수 → 고정 순서 축 4개 + summary 문장을 만들어 `packages/ui` `DiamondChart` 에 넘긴다.
 * 숫자를 화면·SR 어디에도 내지 않는다 (`N6-29`). `selectable` 은 발전 역량 화면(`S6-E2`)이 쓴다.
 */
import { DiamondChart, type DiamondChartMode } from '@haru/ui';
import type { Capability, CapabilityScore } from '@haru/contracts';

import {
  buildCapabilitySummary,
  CAPABILITY_SCORE_MAX,
  toCapabilityAxes,
  type CapabilitySummaryContext,
} from './capabilityAxes';
import { childProfileCopy } from './copy';

export interface CapabilityDiamondProps {
  firstName: string;
  context: CapabilitySummaryContext;
  scores: readonly CapabilityScore[];
  strengths: readonly Capability[];
  growingEdges: readonly Capability[];
  mode?: DiamondChartMode;
  selected?: Capability | null;
  onSelect?: (capability: Capability) => void;
  disabled?: boolean;
}

function isCapability(id: string, axes: ReturnType<typeof toCapabilityAxes>): id is Capability {
  return axes.some((axis) => axis.id === id);
}

export function CapabilityDiamond({
  firstName,
  context,
  scores,
  strengths,
  growingEdges,
  mode = 'display',
  selected = null,
  onSelect,
  disabled = false,
}: CapabilityDiamondProps) {
  const axes = toCapabilityAxes(scores);

  return (
    <DiamondChart
      axes={axes}
      max={CAPABILITY_SCORE_MAX}
      summary={buildCapabilitySummary({ firstName, context, strengths, growingEdges, scores })}
      missingLabel={childProfileCopy.chart.missingLabel}
      mode={mode}
      selectedId={selected}
      disabled={disabled}
      {...(onSelect === undefined
        ? {}
        : {
            onSelect: (id: string) => {
              if (isCapability(id, axes)) onSelect(id);
            },
          })}
    />
  );
}
