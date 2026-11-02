/**
 * `SessionPromptsPopover` — 세션 Prompts 팝업 (Figma `296:1257` in `296:1210`, 4b Spec §3.1 · §6 · §9.1).
 *
 * ```
 * section(= region, aria-labelledby) 329 × (73 + 44n) · ring bottom + 6 · 가운데 (`AD-S4-12`) · 비모달
 * └ SpeechBubble tail="none" align="center"   white 90% · radius 22 · --shadow-bubble · py 14 / px 16 · gap 6
 *   ├ 제목  `Try this prompt!` (copy 고정, `D4-55`) · Semibold 16/22
 *   ├ PromptPill(density="session") × min(n, 5) — **높이 38 고정** (`D4-58` CP-2)
 *   └ `See all prompts` (`300:1308`) · Semibold 14/17 · secondary · 밑줄 — **항상 표시** (`D4-58` NB-1)
 * ```
 *
 * - **표시만 한다.** Prompt 문구는 `SessionSummary.prompts` 서버 순서 그대로 — ready 버블과 같은 출처,
 *   같은 5개 컷오프(`SESSION_BUBBLE_PROMPT_CUTOFF`, contracts cap 아님 `D-21`).
 * - **비모달 disclosure** (`D4-54`, AC-4-135): dialog 가 아니다 — 포커스 트랩·`aria-modal`·scrim·닫기 버튼
 *   없음. 열 때 포커스는 칩에 머문다. 닫힘 = 칩 재탭(화면) · **바깥 탭**(`pointerdown` 캡처 단계에서 닫기만
 *   하고 `preventDefault` 하지 않는다 — 탭한 대상의 동작이 그대로 일어난다, Spec §15-4) · `Escape`(열린
 *   모달 Dialog/Sheet 가 있으면 그쪽이 우선 — 팝업은 그대로 둔다) → 포커스 칩.
 * - 열림·닫힘 낭독(`aria-live`)을 쓰지 않는다 — 칩 `aria-expanded` 변화가 전달한다 (Spec §9.1 · `D4-66`).
 * - 팝업 안 탭(제목·pill)은 아무 일도 하지 않는다 — pill 은 텍스트다 (`D4-58` NB-1).
 * - `See all prompts`(`aria-haspopup="dialog"`) → 팝업 닫힘 → **Drawer 열림**(같은 핸들러에서 순차, 4b Spec
 *   §15-5 · AC-4-137 ①). Drawer(`SessionPromptsDrawer`, 모달)를 이 컴포넌트가 함께 소유한다 — 팝업과 Drawer 를
 *   한 feature 가 소유한다(4b Plan §11). Drawer 가 닫히면 포커스는 **Prompts 칩**으로 돌아간다(③ — 팝업은 이미
 *   닫혀 있으므로 `See all` 이 아니다). 세션이 `live` 가 아니게 되면(30분 자동 종료 등) Drawer 도 닫힌다.
 * - 닫혀 있어도 노드는 남는다(`hidden`) — 칩 `aria-controls` 대상이 항상 존재하고, 닫기 전환(100ms)을 CSS 가
 *   그린다. 녹음 상태와 무관하다 (`D4-53`).
 * - 짧은 세로(< 796)에서 pill 목록이 넘치면 그때만 목록이 Tab 정지점이 된다(`scrollable-region-focusable`,
 *   `S4-K1` · Spec §9.3). 넘치지 않으면 Tab 순서는 Figma 기준 그대로 칩 → `See all` 이다.
 */
import { SpeechBubble, Text, TextLink } from '@haru/ui';
import { useEffect, useId, useRef, useState } from 'react';

import { PromptPill } from '../../../entities/activity-card';
import {
  SESSION_BUBBLE_PROMPT_CUTOFF,
  useListOverflows,
  type SessionPromptsPopoverContext,
} from '../../../entities/session';
import { sessionPromptsCopy } from '../copy';
import { SessionPromptsDrawer } from './SessionPromptsDrawer';

export type SessionPromptsPopoverProps = SessionPromptsPopoverContext;

/** 칩(= 이 팝업을 `aria-controls` 로 가리키는 트리거) 안의 탭인가 — 칩의 토글이 따로 처리한다. */
function isTriggerOf(target: Element | null, popupId: string): boolean {
  for (let node = target; node !== null; node = node.parentElement) {
    if (node.getAttribute('aria-controls') === popupId) return true;
  }
  return false;
}

/** 열린 모달(Dialog · Sheet)이 있는가 — `Escape` 는 그쪽이 먼저 받는다 (Spec §9.1). */
function modalOpen(): boolean {
  return document.querySelector('[aria-modal="true"]') !== null;
}

export function SessionPromptsPopover({
  open,
  live,
  popupId,
  focusChip,
  prompts,
  close,
}: SessionPromptsPopoverProps) {
  const copy = sessionPromptsCopy;
  const titleId = useId();
  const popupRef = useRef<HTMLElement | null>(null);
  const { listRef, overflows } = useListOverflows(open);
  const [drawerRequested, setDrawerRequested] = useState(false);
  const drawerOpen = drawerRequested && live;
  /** Drawer 가 열렸다 닫혔는가 — 닫힘 커밋 뒤(시트 focus trap 의 복귀 뒤) 포커스를 칩으로 옮긴다. */
  const returnFocus = useRef(false);

  // 세션이 끝나 강제로 닫혔으면 요청도 지운다 — 다시 live 가 되어도 저절로 열리지 않게.
  if (drawerRequested && !live) setDrawerRequested(false);

  useEffect(() => {
    if (drawerOpen) {
      returnFocus.current = true;
      return;
    }
    if (!returnFocus.current) return;
    returnFocus.current = false;
    // 시트의 focus trap 은 닫힐 때 "열기 직전 포커스"(= 이미 숨은 `See all`)로 돌리려 한다. 그 cleanup 이
    // 먼저 실행되고(자식 cleanup → 부모 effect) 이 effect 가 칩으로 덮어쓴다 (AC-4-137 ③).
    focusChip();
  }, [drawerOpen, focusChip]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target !== null && popupRef.current?.contains(target) === true) return;
      if (isTriggerOf(target, popupId)) return;
      // 닫기만 한다 — `preventDefault`·`stopPropagation` 하지 않는다 (비모달, 대상 동작 보존).
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || modalOpen()) return;
      close();
      focusChip();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, popupId, close, focusChip]);

  const visible = prompts.slice(0, SESSION_BUBBLE_PROMPT_CUTOFF);

  const seeAll = () => {
    close();
    setDrawerRequested(true);
  };

  return (
    <section
      ref={popupRef}
      id={popupId}
      className="haru-session-prompts"
      aria-labelledby={titleId}
      hidden={!open}
    >
      <SpeechBubble tail="none" align="center">
        <Text id={titleId} variant="callout" weight="semibold" tone="primary">
          {copy.title}
        </Text>
        {/* 넘칠 때만 키보드로 스크롤할 수 있어야 한다 (Spec §9.3) — 비상호작용 요소의 tabIndex 는 그 때문이다. */}
        <ul
          ref={listRef}
          className="haru-session-prompts__list"
          {...(overflows ? { tabIndex: 0, 'aria-labelledby': titleId } : {})}
        >
          {visible.map((prompt) => (
            <li key={prompt.id}>
              <PromptPill prompt={prompt} density="session" />
            </li>
          ))}
        </ul>
        <span className="haru-session-prompts__see-all">
          <TextLink tone="subtle" onPress={seeAll} hasPopup="dialog">
            {copy.seeAll}
          </TextLink>
        </span>
      </SpeechBubble>
      <SessionPromptsDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerRequested(false);
        }}
        prompts={prompts}
      />
    </section>
  );
}
