/**
 * `entities/activity-card` 공개 진입점 — Stage 3 Activity Card 도메인 (FR-07).
 *
 * Reading Context 진입점(`AC-3-22`~`26`)은 **Stage 3 에서 이월**되었다 (approvals §12.3 ⑧ —
 * 별도 디자인을 다음에 요청한다). 그래서 시트·칩·시간 목록 UI 는 제거했고,
 * contract(`SelectActivityOptionRequest`)와 `useSelectActivityOption` 은 **남긴다** —
 * Mock 경로는 `mocks/__tests__/MockActivityApi.test.ts` 가 계속 검증한다.
 */
export { activityCardKeys } from './activityCardKeys';
export type { TodayActivityCardQueryKey } from './activityCardKeys';
export { useTodayActivityCard } from './useTodayActivityCard';
export type { UseTodayActivityCardResult } from './useTodayActivityCard';
export { useSelectActivityOption } from './useSelectActivityOption';
export type { SelectActivityOptionMutation } from './useSelectActivityOption';
export { ActivityOptionCard, optionHeadline } from './ActivityOptionCard';
export type { ActivityOptionCardCopy, ActivityOptionCardProps } from './ActivityOptionCard';
export { SaveButton } from './SaveButton';
export type { SaveButtonCopy, SaveButtonProps } from './SaveButton';
export { CAPABILITY_TONE, CapabilityBadge } from './CapabilityBadge';
export type { CapabilityBadgeProps } from './CapabilityBadge';
export { CoachingNote } from './CoachingNote';
export type { CoachingNoteProps, CoachingNoteTone } from './CoachingNote';
export { PromptPill } from './PromptPill';
export type { PromptPillDensity, PromptPillProps, PromptPillTone } from './PromptPill';
export { PromptPreview } from './PromptPreview';
export type { PromptPreviewProps } from './PromptPreview';
