import { z } from 'zod';

import { PASSWORD_MIN_LENGTH } from './password.js';

/**
 * 이메일 가입 입력 — **CONFIRMED (사용자 결정 2026-09-14, C-5)**.
 * 근거: `docs/API_CONTRACTS.md` §3.4 코드블록 · §4 Stage 2.
 *
 * **아이 관련 필드가 없다.** 아이 정보는 동의 기록 이후 온보딩 Step 1 에서만 수집한다.
 * `.strict()` 는 의도적 예외다 (`docs/plans/stage-2-plan.md` §7.3, AC-2-05):
 * 아이 필드가 섞여 들어오면 parse 단계에서 차단해 Privacy 불변식(AC-2-13)을 코드로 강제한다.
 */
export const SignUpWithEmailInputSchema = z
  .object({
    caregiverName: z.string().trim().min(1).max(60),
    email: z.email(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .strict();

export type SignUpWithEmailInput = z.infer<typeof SignUpWithEmailInputSchema>;
