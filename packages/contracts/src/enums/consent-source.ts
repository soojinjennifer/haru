import { z } from 'zod';

/**
 * 동의 기록이 발생한 경로 — `consent_events.source` (`docs/DATA_MODEL.md` §5).
 * 근거: `docs/plans/stage-2-plan.md` §6 · §7.1, `docs/API_CONTRACTS.md` §2.2.
 *
 * `RECOMMENDED` — Stage 1 enum 표(§2.2)에 없던 값이며 Stage 2 Plan §18-④ 보고로 문서에 반영했다.
 *
 * - `signup_email` · `signup_oauth` — 가입 직후 동의 화면 (C-2)
 * - `settings` — 설정에서 선택 동의를 추가로 기록
 * - `reconsent` — `CONSENT_VERSION_OUTDATED` 후 재동의
 *
 * 철회(`revoked`)는 없다 — `ConsentAction` 참고 (C-4).
 */
export const ConsentSourceSchema = z.enum([
  'signup_email',
  'signup_oauth',
  'settings',
  'reconsent',
]);

export type ConsentSource = z.infer<typeof ConsentSourceSchema>;
