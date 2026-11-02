/**
 * `features/session-prompts` 공개 진입점 — 세션 Prompt 재확인 (Stage 4b `S4-G1` 팝업 · `S4-G2` Drawer).
 * 세션 화면(`features/storytime-session`)의 `PromptsPopover` 슬롯에 Page 가 넣는다 — feature 간 import 0.
 */
export { SessionPromptsPopover } from './ui/SessionPromptsPopover';
export type { SessionPromptsPopoverProps } from './ui/SessionPromptsPopover';
export { sessionPromptsCopy } from './copy';
