import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';

/**
 * 아이 페르소나 — PRD FR-05, `docs/API_CONTRACTS.md` §4 Stage 2 `ProfileResult.persona`.
 *
 * 문구(`name` · `description`)는 **서버(Mock 포함) 응답 값만** 표시한다.
 * Frontend 가 생성·가공하지 않는다 (`.claude/rules/architecture.md` §8).
 *
 * - `isFallback` — AI 생성 실패·안전 검증 대체로 준비된 문구가 쓰였는지.
 *   `generation_mode` · `safety_status` 원값은 화면에 노출하지 않으므로 boolean 하나로 줄인다
 *   (`docs/plans/stage-2-plan.md` §6 `personas` 행).
 */
export const PersonaSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  isFallback: z.boolean(),
  createdAt: IsoDateTimeSchema,
});

export type Persona = z.infer<typeof PersonaSchema>;
