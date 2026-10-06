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
 * 나머지 도메인 schema(sessions · recordings · analysis · reports · data-management ·
 * notifications)는 해당 Stage 에서 추가한다.
 */
export * from './activity/index.js';
export * from './auth/index.js';
export * from './books/index.js';
export * from './children/index.js';
export * from './common/index.js';
export * from './consent/index.js';
export * from './enums/index.js';
export * from './health/index.js';
export * from './home/index.js';
export * from './library/index.js';
export * from './me/index.js';
export * from './onboarding/index.js';
export * from './prompts/index.js';
export * from './rules/index.js';
