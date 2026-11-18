/**
 * `CapabilityBadge` — Design Spec §5.2 (Figma `163:2649–2651` · `85:592`).
 *
 * **데이터 원천은 `options[].capability` 하나뿐이다** (`CONFIRMED (D-22)`). 카드 단위 대표
 * 역량(`ActivityCard.targetCapability`)은 contract 에서 삭제되었으므로 **덱 상단·카드
 * 바깥·헤더에 "오늘의 역량" 배지를 두지 않는다**.
 *
 * `capability` 가 `null` 이면 **아무것도 렌더하지 않는다** — 기본 역량으로 대체하지 않는다.
 * 라벨은 `shared/copy/capability-copy.ts` 가 소유하며 `" Day"` suffix 를 붙이지 않는다 (`N-3`).
 */
import { Tag, type TagSize, type TagTone } from '@haru/ui';
import type { Capability } from '@haru/contracts';

import { capabilityCopy } from '../../shared/copy/capability-copy';

/**
 * 역량 → Tag tone. `packages/ui` 는 역량 enum 을 모르므로(AC-1-25) 이 매핑은 도메인
 * 레이어가 소유한다. 색 자체는 `--color-capability-*`(#19) 다.
 * Stage 6 다이아몬드 차트(`entities/child-profile`)도 같은 매핑을 쓴다 — 두 벌로 두지 않는다.
 */
export const CAPABILITY_TONE: Readonly<Record<Capability, Exclude<TagTone, 'neutral'>>> = {
  emotion_regulation: 'emotion',
  self_directed_agency: 'agency',
  cognitive_flexibility: 'flexibility',
  intrinsic_motivation: 'motivation',
};

export interface CapabilityBadgeProps {
  capability: Capability | null;
  size?: TagSize;
}

export function CapabilityBadge({ capability, size = 'sm' }: CapabilityBadgeProps) {
  if (capability === null) return null;

  return <Tag label={capabilityCopy[capability]} tone={CAPABILITY_TONE[capability]} size={size} />;
}
