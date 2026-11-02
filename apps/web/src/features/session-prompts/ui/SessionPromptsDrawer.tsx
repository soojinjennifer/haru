/**
 * `SessionPromptsDrawer` — 세션 Prompt Drawer (Figma `88:960` `Prompt Card/Session`, Stage 4 Spec §3.2 ·
 * 4b Spec §3.2, `S4-G2`).
 *
 * ```
 * Sheet variant="floating" surface="drawer"   폭 = 컬럼 100% (`AD-S4-7`) · white 85% + blur 12 · 3겹 그림자
 * ├ 핸들 40×4 · 제목 `Prompts of this session` Bold 17/22
 * └ 본문 (세로 gap 10)
 *   ├ 부제 `Just read one aloud …` 13/18 secondary
 *   └ PromptCarousel — 1 페이지 = Prompt 1개(pill 안 ‹ 라벨 ›) + 그 코칭 노트 · dots = 개수
 * ```
 *
 * - **전부** 보여 준다 — 팝업의 5개 컷오프와 달리 n개 전부(n=7 → 7페이지), 서버 순서 그대로 (`D4-52`).
 *   Prompt 문구·코칭 노트는 `SessionSummary.prompts` 값만 표시한다 (ready 버블 · 팝업과 같은 출처, AC-4-53).
 * - 초기 페이지 = **1번째** (`D4-58` NB-1). 열 때마다 1번째로 돌아간다.
 * - **모달** — 기존 `Sheet` 의 scrim · focus trap · `Escape` (팝업의 비모달과 다르다, `D4-54` · AC-4-56).
 *   초기 포커스 = 캐러셀 그룹. 닫힘 뒤 포커스 복귀(Prompts 칩)는 부모가 한다.
 * - 열려 있어도 녹음 상태를 바꾸지 않는다 — 전이·녹음 API 를 모른다 (`D4-53`, AC-4-130). 무음·무진동.
 * - 코칭 노트가 없는 Prompt(`coachingNote: null` — follow-up)는 노트 상자를 그리지 않는다 (빈 자리 placeholder 0).
 */
import { PromptCarousel, Sheet, Text } from '@haru/ui';
import type { Prompt } from '@haru/contracts';
import { useRef, useState } from 'react';

import { PromptPill } from '../../../entities/activity-card';
import { sessionPromptsCopy } from '../copy';

export interface SessionPromptsDrawerProps {
  open: boolean;
  onClose: () => void;
  prompts: readonly Prompt[];
}

export function SessionPromptsDrawer({ open, onClose, prompts }: SessionPromptsDrawerProps) {
  const copy = sessionPromptsCopy.drawer;
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  // 열 때마다 1번째 Prompt 부터 (`D4-58` NB-1) — 닫힘 → 열림 전환을 렌더 중에 감지해 초기화한다.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setIndex(0);
  }

  const pages = prompts.map((prompt) => ({
    key: prompt.id,
    label: <PromptPill prompt={prompt} tone="bare" />,
    ...(prompt.coachingNote === null || prompt.coachingNote === undefined
      ? {}
      : {
          detail: (
            <div className="haru-prompt-drawer__note">
              <Text variant="caption-1">{prompt.coachingNote}</Text>
            </div>
          ),
        }),
  }));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={copy.title}
      variant="floating"
      surface="drawer"
      initialFocus={carouselRef}
    >
      <div className="haru-prompt-drawer">
        <Text variant="footnote" tone="secondary">
          {copy.subtitle}
        </Text>
        <PromptCarousel
          ref={carouselRef}
          pages={pages}
          index={index}
          onIndexChange={setIndex}
          label={copy.carousel}
          previousLabel={copy.previous}
          nextLabel={copy.next}
          positionLabel={copy.position}
        />
      </div>
    </Sheet>
  );
}
