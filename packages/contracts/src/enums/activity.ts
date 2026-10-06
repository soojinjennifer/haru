import { z } from 'zod';

/**
 * Activity Card 가 제시하는 선택지 종류 — 근거: `docs/API_CONTRACTS.md` §2.2, PRD §7.4 · §13.
 *
 * ⚠ **`conversation_only` 는 폐지되었다** (`docs/decisions/stage-3-approvals.md` §12.12,
 * 사용자 지시 2026-10-05): *"책없이 대화만 하는 카드가 있을 수 없음. 프론트에서는 책이 있다고
 * 생각하고 목업으로 만들어 주어야 함."* 서버는 **항상 책이 있는 카드**를 내려주며, 추천할 책이
 * 없는 상황은 **재독 카드**(`reread_book`)로 해결한다.
 *
 * ⚠ 이름이 같은 **`SessionMode.conversation_only`**(`enums/session-mode.ts`)와 혼동하지 말 것 —
 * 그쪽은 마이크 권한 거부 시의 **녹음 없는 세션**이며 Stage 4 소관이고 **유지**된다.
 */
export const ActivityOptionKindSchema = z.enum(['book', 'reread_book']);

export type ActivityOptionKind = z.infer<typeof ActivityOptionKindSchema>;
