/**
 * `PersonaCard` — 아이 페르소나 (Domain, 표시만). Stage 6 Spec §3.3 (`M6-2` — `packages/ui` 컴포넌트 아님).
 *
 * ProfileCard recipe 안: eyebrow SectionLabel → `h2` name → description.
 * - 문구(`name` · `description`)는 **API 응답 값 그대로** 표시한다 — 생성·가공·말줄임 0 (`rules/architecture.md` §8).
 * - `isFallback` 구분 UI 0 — 같은 렌더 (AC-6-37 · 60, PRD §8.4).
 * - 일러스트 없음 (`N6-31`).
 * - 긴 이름은 줄바꿈한다 (`overflow-wrap: break-word`, Stage 5 `D5-14` 교훈).
 *
 * Stage 7 확장 (Spec §2.3.2 · §3.8 — 리포트 상세 페르소나 히스토리 `C13-S7-7`). **전부 선택 prop · 미지정 시 DOM 불변**
 * (Stage 6 화면 회귀 0 — AC-7-81):
 * - `eyebrow?` — 기본 eyebrow(*"{NAME}'S STORYTIME PERSONA"*) 대신 날짜 행(*"SINCE APR 20"* · *"NOW"*)
 * - `footnote?` — description 아래 출처 한 줄 (caption-1 secondary — *"From your storytimes"* 등, `N7-42`)
 * - `nameAs?` — 이름 heading 레벨. 기본 `h2`. 히스토리는 섹션 제목(h2) 아래라 `h3` 를 준다 (문서 구조)
 */
import { Text } from '@haru/ui';
import type { Persona } from '@haru/contracts';

import { ProfileCard } from './ProfileCard';
import { childProfileCopy } from './copy';

export interface PersonaCardProps {
  firstName: string;
  persona: Pick<Persona, 'name' | 'description'>;
  /** 대문자 eyebrow override (copy 가 대문자로 준다). 미지정 = Stage 6 기본 eyebrow. */
  eyebrow?: string | undefined;
  /** description 아래 출처 한 줄. 미지정 = 렌더 0. */
  footnote?: string | undefined;
  /** 이름 heading 레벨. 기본 `h2` (Stage 6). */
  nameAs?: 'h2' | 'h3' | undefined;
}

export function PersonaCard({
  firstName,
  persona,
  eyebrow,
  footnote,
  nameAs = 'h2',
}: PersonaCardProps) {
  return (
    <ProfileCard>
      <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
        {eyebrow ?? childProfileCopy.persona.eyebrow(firstName)}
      </Text>
      <Text as={nameAs} variant="title-3" tone="primary" weight="bold">
        {persona.name}
      </Text>
      <Text variant="subheadline" tone="primary">
        {persona.description}
      </Text>
      {footnote === undefined ? null : (
        <Text variant="caption-1" tone="secondary">
          {footnote}
        </Text>
      )}
    </ProfileCard>
  );
}
