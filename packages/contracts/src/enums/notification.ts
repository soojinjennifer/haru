import { z } from 'zod';

/**
 * 알림 종류 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD FR-08 · FR-13 · FR-16 · §13.
 */
export const NotificationKindSchema = z.enum([
  'session_invite',
  'short_feedback_ready',
  'report_published',
  'report_deferred_encourage',
  'upload_failed_48h',
  'report_delayed',
]);

export type NotificationKind = z.infer<typeof NotificationKindSchema>;
