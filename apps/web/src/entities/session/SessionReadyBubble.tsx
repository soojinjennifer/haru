/**
 * `SessionReadyBubble` — 세션 ready 버블 (Figma `139:2803` = `88:838` `Type=Type3`, `D4-14`·`D4-20`~`D4-22`).
 *
 * ```
 * SpeechBubble tail="top-center" align="center"   329 × (내용) · white 90% · radius 22 · --shadow-bubble
 * ├ 제목 줄  = 서버 인사(`SessionSummary.bubble.text`) · Semibold 16/22 · **1줄 clamp** (`D4-21`)
 * └ PromptPill(density="session") × min(n, 5)    = `SessionSummary.prompts` 서버 순서 (`D4-14`)
 * ```
 *
 * - **표시만 한다.** 인사·Prompt 문구를 만들지도 바꾸지도 않는다 — fallback 문구 0건
 *   (`rules/architecture.md` §8, `D4-22`). 인사가 `null`/빈 값이면 **제목 줄 노드를 렌더하지 않는다**
 *   → 제목 22 + gap 6 = **28** 이 함께 빠진다 (AC-4-121 ⑤).
 * - pill 은 **5개에서 컷오프**한다 — contracts cap 이 아니다 (`D-21`, Spec §2.2.3-②). 나머지는
 *   Prompt Drawer(`S4-G2`)에 전부 있다.
 * - Prompt 가 0개면 버블을 렌더하지 않는다 — 제목만 남은 빈 버블을 만들지 않는다 (Spec §2.2.3-② n=0).
 * - pill 은 텍스트다 — 포커스·탭 대상이 아니다 (`PromptPill` 머리 주석).
 * - **5분 리마인드**(`D4-46`·`D4-59`): `reminderActive` 가 켜지면 **제목 줄 글자만** `reminderBubble.text`
 *   로 바꾼다 — 같은 노드 · 같은 1줄 clamp · pill 불변. 리마인드가 `null`/빈 값이면 **아무것도 바꾸지
 *   않는다**(인사 그대로, 인사도 없으면 제목 줄 없음 그대로). 대체 문구 0 (`API_CONTRACTS.md` §3.2.2).
 * - 짧은 세로(콘텐츠 < 796)에서 목록이 넘치면 그때만 Tab 정지점이 된다 (`D4-78`, 팝업과 같은 규칙 — Spec §9.3).
 * - 높이를 선언하지 않는다 — `h = 21 + 22 + 6 + 6n + Σpill` (제목 있음) / `21 + 6n + Σpill` (없음).
 */
import { SpeechBubble, Text } from '@haru/ui';
import type { Prompt, SessionBubbleCopy } from '@haru/contracts';
import { useId } from 'react';

import { PromptPill } from '../activity-card';

import { useListOverflows } from './useListOverflows';

/** 버블에 렌더하는 Prompt 수 상한 — **렌더 컷오프**이며 contracts cap 이 아니다 (`D-21`). */
export const SESSION_BUBBLE_PROMPT_CUTOFF = 5;

export interface SessionReadyBubbleProps {
  bubble: SessionBubbleCopy;
  /** ready 5분 리마인드 문구 (`SessionSummary.reminderBubble`, `D4-59`). */
  reminderBubble: SessionBubbleCopy;
  /** 컨트롤러가 리마인드 신호를 냈는가 (`readyReminderShown`, `D4-46` — 세션당 1회). */
  reminderActive: boolean;
  prompts: readonly Prompt[];
}

function copyText(copy: SessionBubbleCopy): string | null {
  const text = copy?.text ?? null;
  return text !== null && text.length > 0 ? text : null;
}

export function SessionReadyBubble({
  bubble,
  reminderBubble,
  reminderActive,
  prompts,
}: SessionReadyBubbleProps) {
  const reminder = reminderActive ? copyText(reminderBubble) : null;
  const greeting = reminder ?? copyText(bubble);
  const hasGreeting = greeting !== null;
  const visible = prompts.slice(0, SESSION_BUBBLE_PROMPT_CUTOFF);
  const titleId = useId();
  const { listRef, overflows } = useListOverflows(visible.length > 0);

  if (visible.length === 0) return null;

  return (
    <div className="haru-session-bubble">
      <SpeechBubble tail="top-center" align="center">
        {hasGreeting ? (
          <Text id={titleId} variant="callout" weight="semibold" tone="primary" truncate={1}>
            {greeting}
          </Text>
        ) : null}
        {visible.length === 0 ? null : (
          /* 넘칠 때만 키보드로 스크롤할 수 있어야 한다 — 비상호작용 요소의 tabIndex 는 그 때문이다. */
          <ul
            ref={listRef}
            className="haru-session-bubble__prompts"
            {...(overflows
              ? { tabIndex: 0, ...(hasGreeting ? { 'aria-labelledby': titleId } : {}) }
              : {})}
          >
            {visible.map((prompt) => (
              <li key={prompt.id}>
                <PromptPill prompt={prompt} density="session" />
              </li>
            ))}
          </ul>
        )}
      </SpeechBubble>
    </div>
  );
}
