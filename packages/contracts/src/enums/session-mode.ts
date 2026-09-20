import { z } from 'zod';

/**
 * 세션 진행 방식 — **CONFIRMED (#16)**. 근거: `docs/API_CONTRACTS.md` §2.2, PRD §7.4 · §13.
 *
 * `conversation_only` 는 마이크 권한 거부·녹음 미동의 시의 "대화만 하기" 경로이며,
 * 이 모드 세션에는 녹음 업로드가 허용되지 않는다 (`RECORDING_NOT_ALLOWED_FOR_MODE`).
 */
export const SessionModeSchema = z.enum(['recorded', 'conversation_only']);

export type SessionMode = z.infer<typeof SessionModeSchema>;
