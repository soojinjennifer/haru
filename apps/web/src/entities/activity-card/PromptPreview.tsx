/**
 * `PromptPreview` — 카드 앞면의 Prompt 목록 (Figma `I163:2649;85:550`, 329×186).
 *
 * ── 확장 트리거가 **없다** (`N-2` 폐기 — approvals §12.10) ──
 * Figma 앞면은 pill 4개를 **전부** 노출하며 `Show all N prompts` 같은 트리거가 없다.
 * 1차 구현이 만든 접힘(3개) + disclosure 는 Figma 에 없는 UI 였으므로 제거했다.
 *
 * ── 자르지 않는다 (`D-21`) ──
 * `slice`·`take`·`filter` 를 쓰지 않는다. 개수 상한이 없으므로 `n` 이 설계치(4)를 넘으면
 * **목록 블록만 세로 스크롤**한다 — 카드·트랙 높이는 데이터에 따라 달라지지 않는다
 * (audit §16.3 `A-5`/`A-11`). Figma 설계치에서는 스크롤이 전혀 발생하지 않는다.
 *
 * pill 은 텍스트이며 포커스를 받지 않는다 (§5.4) — tab stop 수가 `n` 에 무관하다.
 * 블록 자체는 스크롤 영역이므로 키보드 사용자가 도달할 수 있어야 한다 → `tabindex=0` +
 * 접근성 이름을 가진다.
 */
import type { Prompt } from '@haru/contracts';

import { PromptPill } from './PromptPill';

export interface PromptPreviewProps {
  prompts: readonly Prompt[];
  /** 목록 블록의 접근성 이름 (예: `Tonight's prompts`). */
  label: string;
}

export function PromptPreview({ prompts, label }: PromptPreviewProps) {
  return (
    /*
      스크롤 영역은 **키보드로 도달 가능해야 한다** (WCAG 2.1.1 — axe
      `scrollable-region-focusable`). `jsx-a11y/no-noninteractive-tabindex` 가 그 요구와
      충돌하는 알려진 지점이라 이 자리에서만 끈다. 포커스를 받아도 누름 동작이 없다.
    */
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div className="haru-prompt-preview" tabIndex={0} role="group" aria-label={label}>
      {prompts.map((prompt) => (
        <PromptPill key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
