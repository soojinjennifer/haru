import { z } from 'zod';

/**
 * 모든 리소스 식별자는 uuid 문자열이다.
 * 근거: `docs/API_CONTRACTS.md` §1 Conventions — "ID | uuid 문자열".
 */
export const IdSchema = z.uuid();

export type Id = z.infer<typeof IdSchema>;
