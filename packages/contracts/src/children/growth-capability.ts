import { z } from 'zod';

import { CapabilitySchema } from '../enums/capability.js';

/**
 * `PUT /v1/children/:childId/growth-capability` 요청 — PRD FR-06 · §7.3.
 * 응답은 갱신된 `ChildProfile` 이다.
 *
 * 선택 주체(`system_suggested` · `caregiver_changed`)는 서버가 기록한다
 * (`docs/DATA_MODEL.md` §6 `growth_capability_selections`).
 */
export const SetGrowthCapabilityRequestSchema = z.object({
  capability: CapabilitySchema,
});

export type SetGrowthCapabilityRequest = z.infer<typeof SetGrowthCapabilityRequestSchema>;
