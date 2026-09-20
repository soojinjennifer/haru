import { z } from 'zod';

/**
 * 양육자와 아이의 관계 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD §3.1 · §7.2.
 */
export const CaregiverRelationshipSchema = z.enum([
  'mother',
  'father',
  'grandparent',
  'babysitter',
  'tutor',
  'therapist',
  'other',
]);

export type CaregiverRelationship = z.infer<typeof CaregiverRelationshipSchema>;
