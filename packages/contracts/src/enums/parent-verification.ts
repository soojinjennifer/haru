import { z } from 'zod';

/**
 * 보호자 검증(VPC) 단계 슬롯 — **RECOMMENDED** (C-3).
 * 근거: `docs/API_CONTRACTS.md` §2.2.
 *
 * 값은 검증 방식이 법무 결정(L-01)으로 확정된 뒤 조정될 수 있다.
 */
export const ParentVerificationStatusSchema = z.enum([
  'not_required',
  'pending',
  'verified',
  'failed',
]);

export type ParentVerificationStatus = z.infer<typeof ParentVerificationStatusSchema>;
