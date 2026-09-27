import { z } from 'zod';

import { CaregiverRelationshipSchema } from '../enums/caregiver.js';

/**
 * `PATCH /v1/me` 요청 — 응답은 갱신된 `MeResponse` 다.
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 2, `docs/decisions/stage-2-approvals.md` §4 **D-16**.
 *
 * **보호자 소유 데이터 전용 경로다.** 온보딩 Step 1 화면은 한 화면이지만 요청은 둘로 나뉜다:
 * 관계·타임존은 여기로, 아이 정보는 `ChildInfoAnswers` 로 간다. 한 payload 에 섞으면
 * "동의 기록 전 아동 데이터 0건"(AC-2-13) 을 요청 단위로 검증할 수 없다.
 *
 * 모든 필드가 선택이며, 보낸 필드만 갱신한다.
 */
export const UpdateCaregiverRequestSchema = z.object({
  displayName: z.string().trim().min(1).max(60).optional(),
  relationship: CaregiverRelationshipSchema.optional(),
  /** `Intl.DateTimeFormat().resolvedOptions().timeZone` 감지값. 동의 직후 1회 전송한다. */
  timezone: z.string().min(1).optional(),
});

export type UpdateCaregiverRequest = z.infer<typeof UpdateCaregiverRequestSchema>;
