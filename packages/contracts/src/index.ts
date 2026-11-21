/**
 * `@haru/contracts` — HARU Frontend ↔ 향후 Backend 의 공식 Interface Contract.
 *
 * - Request / Response / Enum / Error Code / Session State / Validation Rule 은
 *   **이 패키지에서만** 정의한다 (`.claude/rules/architecture.md` §5).
 * - 타입은 `z.infer` 로만 파생한다. 같은 모양의 타입을 `apps/web` 등에서 다시 선언하지 않는다.
 * - 런타임 의존은 `zod` 하나뿐이며 브라우저·Node 양쪽에서 동작해야 한다 (Stage 1 Plan §7.3).
 * - 소비자는 이 진입점만 import 한다. deep import(`@haru/contracts/src/...`)는 금지다
 *   (`docs/ARCHITECTURE.md` §1.2).
 *
 * Stage 1 범위: `common` · `enums`(23종) · `rules`(3종) · `health`.
 * Stage 2 범위: `enums` 26종(+`ConsentSource`·`OnboardingStatus`·`Plan`) ·
 * `auth` · `me` · `consent` · `onboarding` · `children` · `books` · `rules/capability-score`.
 * Stage 4 범위: `sessions` · `recordings` · `notifications`(이월 `QA-3-001`) ·
 * `enums` +3(`PushPlatform` · `StickerType` · `RecordingContainer`(`D4-23`)) ·
 * `SESSION_TRANSITIONS` 12 → 14 행(`D4-13`).
 * Stage 5 범위: `reflections` · `analysis` · `highlight-clips`(schema 만, `N5-22`) ·
 * `enums` +1(`ReflectionCheckKey`, `N5-01`) · `SessionDetail.reflection`.
 * Stage 6 범위: `survey-update`(설문 재응답 3 endpoint) · `children/update-child`(`UpdateChildRequest`) ·
 * `children/history`(목록 schema 만, `N6-12`) · `CapabilitySnapshotSource` 3값 · `ChildProfile.profileUpdatedAt`.
 * Stage 7 범위(`S7-A`): `progress`(`WeeklyProgress` · `GrowthThemeStage`) · `reports`(overview · summary · detail · pdf) ·
 * `highlight-clips` 확장(`ReportHighlightClip` · `RecordingDeletedDetails`) · `rules/report-cycle`(C7-11).
 * Stage 8 범위(`S8-A`): `data-management`(`DataManagementSummary` · `DeletionRequest` · `CreateDeletionRequest` ·
 * `DeleteAccountRequest`) · `SessionListItem` + `hasRecording`(C8-2) · `Caregiver.email`(C8-10) ·
 * `DeletionScope += account`(C8-4) · error code `ACCOUNT_DELETION_PENDING`(C8-5, 30종).
 * 동의 이력(`ConsentHistory`, C8-6)은 Backend 요구로만 문서화한다 — 여기에 만들지 않는다 (`N8-06` ⓑ).
 */
export * from './activity/index.js';
export * from './analysis/index.js';
export * from './auth/index.js';
export * from './books/index.js';
export * from './children/index.js';
export * from './common/index.js';
export * from './consent/index.js';
export * from './data-management/index.js';
export * from './enums/index.js';
export * from './health/index.js';
export * from './highlight-clips/index.js';
export * from './home/index.js';
export * from './library/index.js';
export * from './me/index.js';
export * from './notifications/index.js';
export * from './onboarding/index.js';
export * from './progress/index.js';
export * from './prompts/index.js';
export * from './recordings/index.js';
export * from './reflections/index.js';
export * from './reports/index.js';
export * from './rules/index.js';
export * from './sessions/index.js';
export * from './survey-update/index.js';
