/**
 * `PromptPill` — Design Spec §5.4 · §5.4.1 (Figma `86:438` 내 pill · `86:482`).
 *
 * **pill 은 텍스트다 — 버튼이 아니다.** 탭 대상이 아니며 포커스를 받지 않는다 (§5.4). 나머지
 * Prompt 로의 도달은 `PromptPreview` 의 확장 트리거가, 코칭 문장 포함 전체 보기는 카드 헤더의
 * `IconButton` 이 담당한다.
 *
 * ── 단계·페이지 배지 (`CONFIRMED (D-8)`) ──
 * `phase` 가 있으면 `PRE`/`POST`, `pageRef` 가 있으면 그 **서버 문자열 그대로** 를 배지로
 * 렌더한다. **값이 없으면 배지를 렌더하지 않는다** — 빈 배지·`—`·placeholder 를 만들지 않는다.
 * 둘 다 있으면 `phase → pageRef` 순서로 2개를 렌더한다 (`AD-S3-24`).
 *
 * 배지는 기존 **`Tag(size="xs")` 재사용**이며 신규 Shared UI 를 만들지 않는다. 도메인 값
 * (`phase`)을 라벨로 바꾸는 매핑은 이 도메인 컴포넌트가 소유한다 — `packages/ui` 는 도메인을
 * 모른다. 배지 색도 같은 이유로 Tier-3 토큰(`--prompt-phase-tag-*`)을 **여기 CSS 에서** 입힌다.
 *
 * `tone`: `outline` = 카드 미리보기(2줄 말줄임) · `tinted` = 시트(말줄임 없음).
 *
 * `density` (Stage 4 Design Spec §4 1-d · `T-14`): `card`(기본 — 42/9/13/gap 10) · `session` =
 * 세션 ready 버블 `139:2803` 의 pill(38/8/12/gap 8, 면 `#dbeee7` + 1px 테두리). **`tone` 과 직교한다** —
 * `tone` 은 말줄임·면, `density` 는 치수다. 카드 밀도로 흡수하면 5개 누적으로 Record Control 을 침범한다.
 */
import { Tag, Text } from '@haru/ui';
import type { Prompt } from '@haru/contracts';

import { promptPhaseCopy } from '../../shared/copy/prompt-copy';

export type PromptPillTone = 'outline' | 'tinted';

export type PromptPillDensity = 'card' | 'session';

export interface PromptPillProps {
  prompt: Prompt;
  tone?: PromptPillTone;
  density?: PromptPillDensity;
}

export function PromptPill({ prompt, tone = 'outline', density = 'card' }: PromptPillProps) {
  const phase = prompt.phase ?? null;
  const pageRef = prompt.pageRef ?? null;
  const hasBadge = phase !== null || (pageRef !== null && pageRef.length > 0);

  return (
    <div
      className={
        density === 'card'
          ? `haru-prompt-pill haru-prompt-pill--${tone}`
          : `haru-prompt-pill haru-prompt-pill--${tone} haru-prompt-pill--${density}`
      }
    >
      {hasBadge ? (
        <span className="haru-prompt-pill__badges">
          {phase === null ? null : <Tag label={promptPhaseCopy[phase]} size="xs" />}
          {pageRef === null || pageRef.length === 0 ? null : <Tag label={pageRef} size="xs" />}
        </span>
      ) : null}
      <Text variant="footnote" truncate={tone === 'outline' ? 2 : 'none'}>
        {prompt.text}
      </Text>
    </div>
  );
}
