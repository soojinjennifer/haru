/**
 * `PersonaCard` — 아이 페르소나 (Domain, 표시만). Stage 6 Spec §3.3 (`M6-2` — `packages/ui` 컴포넌트 아님).
 *
 * ProfileCard recipe 안: eyebrow SectionLabel → `h2` name → description.
 * - 문구(`name` · `description`)는 **API 응답 값 그대로** 표시한다 — 생성·가공·말줄임 0 (`rules/architecture.md` §8).
 * - `isFallback` 구분 UI 0 — 같은 렌더 (AC-6-37 · 60, PRD §8.4).
 * - 일러스트 없음 (`N6-31`).
 * - 긴 이름은 줄바꿈한다 (`overflow-wrap: break-word`, Stage 5 `D5-14` 교훈).
 */
import { Text } from '@haru/ui';
import type { Persona } from '@haru/contracts';

import { ProfileCard } from './ProfileCard';
import { childProfileCopy } from './copy';

export interface PersonaCardProps {
  firstName: string;
  persona: Pick<Persona, 'name' | 'description'>;
}

export function PersonaCard({ firstName, persona }: PersonaCardProps) {
  return (
    <ProfileCard>
      <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
        {childProfileCopy.persona.eyebrow(firstName)}
      </Text>
      <Text as="h2" variant="title-3" tone="primary" weight="bold">
        {persona.name}
      </Text>
      <Text variant="subheadline" tone="primary">
        {persona.description}
      </Text>
    </ProfileCard>
  );
}
