/**
 * `features/notification-preferences` 공개 진입점 — push 권한 흐름 (Stage 4 `S4-J`, 이월 `QA-3-001`).
 *
 * 알림 설정 **폼**(카드 갱신 시간·리마인더)은 Out of Scope (`D-18`). 권한 사전 안내의 **표면**도 아직
 * 정해지지 않았다 — `docs/qa/stage-4a-handoff.md` `S4-J` NEEDS_DECISION.
 */
export { usePushPermission } from './model/usePushPermission';
export type { PushPermissionState } from './model/usePushPermission';
