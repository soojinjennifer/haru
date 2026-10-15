import { z } from 'zod';

import { IsoDateTimeSchema } from '../common/datetime.js';
import { IdSchema } from '../common/id.js';
import { PushPlatformSchema } from '../enums/push-platform.js';

/**
 * 푸시 기기 등록 — `POST /v1/push-devices`, `DELETE /v1/push-devices/:id` (PRD FR-08).
 * 근거: `docs/API_CONTRACTS.md` §4 Stage 3 (구현 Stage = 4, 이월 `QA-3-001`).
 *
 * Stage 4 Frontend 는 `platform: 'web'` 만 보낸다 (`D4-1`, `D-16`). `ios`·`android` 는 후속 단계.
 */
export const RegisterPushDeviceRequestSchema = z.object({
  platform: PushPlatformSchema,
  /** provider 기기 토큰. 서버는 암호화 저장한다 (Handoff). 로그에 남기지 않는다. */
  token: z.string().min(1),
});

export type RegisterPushDeviceRequest = z.infer<typeof RegisterPushDeviceRequestSchema>;

/**
 * 등록된 기기. ⛔ **토큰을 반환하지 않는다** (AC-4-18) — 응답에 섞여 와도 parse 가 버린다.
 */
export const PushDeviceSchema = z.object({
  id: IdSchema,
  platform: PushPlatformSchema,
  lastSeenAt: IsoDateTimeSchema,
});

export type PushDevice = z.infer<typeof PushDeviceSchema>;
