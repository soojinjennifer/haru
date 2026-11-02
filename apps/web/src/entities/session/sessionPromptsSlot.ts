import type { Prompt } from '@haru/contracts';

/**
 * 세션 화면 → Prompts 팝업 슬롯 연결 지점 (`S4-G1`, 4b Spec §3.1 · §3.3 · §9.1).
 *
 * 칩과 열림 상태는 `features/storytime-session` 이, 팝업 본체는 `features/session-prompts` 가 소유한다.
 * feature 끼리 import 하지 않으므로(`rules/architecture.md` §3) 두 feature 가 함께 쓰는 **UI 연결 모양**을
 * 여기 둔다 — API 타입이 아니다(데이터는 contracts `Prompt` 그대로). 조립은 Page 가 한다.
 */
export interface SessionPromptsPopoverContext {
  /** 팝업이 보이는가 — 칩 `aria-expanded` 와 같은 값. */
  open: boolean;
  /**
   * 팝업·Drawer 를 열 수 있는 세션 상태인가 (recording · paused, 종료 동작 전). `false` 가 되면 열린
   * Drawer 도 닫힌다 — 30분 자동 종료 · Submit · Discard (`S4-G2`, AC-4-133 과 같은 정리).
   */
  live: boolean;
  /** 팝업 요소 id — 칩의 `aria-controls` 대상. */
  popupId: string;
  /** `Escape` · `See all` 뒤 포커스를 칩으로 돌려준다. */
  focusChip: () => void;
  /** `SessionSummary.prompts` 서버 순서 그대로 (ready 버블과 같은 출처 — AC-4-53). */
  prompts: readonly Prompt[];
  close: () => void;
}
