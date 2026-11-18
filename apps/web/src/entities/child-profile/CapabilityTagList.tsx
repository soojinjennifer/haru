/**
 * `CapabilityTagList` — 강점 · growing edge 한 묶음 (Domain). Stage 6 Spec §3.5 (`N6-35`).
 *
 * - 각 역량 = `Tag size="sm"` tone = 역량 (Figma `76:440`) — Activity Card 배지와 같은 어휘(`CapabilityBadge`).
 * - 순서 = **응답 배열 그대로** (Frontend 정렬·선정 0 — AC-6-59).
 * - 빈 배열이면 묶음을 숨기지 않고 안내 문장을 둔다 (변형 C · 부분 결측).
 * - 두 묶음은 같은 컴포넌트·같은 크기·같은 간격 — 차이는 SectionLabel 문구뿐이다.
 */
import { Text } from '@haru/ui';
import type { Capability } from '@haru/contracts';
import { useId } from 'react';

import { CapabilityBadge } from '../activity-card';

import { childProfileCopy } from './copy';

export interface CapabilityTagListProps {
  /** SectionLabel 문구 (대문자 — copy 가 쓴다). */
  label: string;
  capabilities: readonly Capability[];
}

export function CapabilityTagList({ label, capabilities }: CapabilityTagListProps) {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2">
      {/* SectionLabel recipe (Spec §2.0 — `ChildInfoStep` 과 같다, 컴포넌트를 만들지 않는다) */}
      <Text
        as="h3"
        id={labelId}
        variant="caption-1"
        tone="secondary"
        weight="bold"
        tracking="section-label"
      >
        {label}
      </Text>
      {capabilities.length === 0 ? (
        <Text variant="footnote" tone="primary">
          {childProfileCopy.highlights.empty}
        </Text>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-labelledby={labelId}>
          {capabilities.map((capability) => (
            <li key={capability}>
              <CapabilityBadge capability={capability} size="sm" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
