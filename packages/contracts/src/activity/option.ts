import { z } from 'zod';

import { BookSummarySchema } from '../books/search.js';
import { IdSchema } from '../common/id.js';
import { ActivityOptionKindSchema } from '../enums/activity.js';
import { CapabilitySchema } from '../enums/capability.js';
import { createPromptCoachingRefine, PromptSchema } from '../prompts/prompt.js';

/**
 * Activity Card 의 선택지 1장 — 근거: `docs/API_CONTRACTS.md` §4 Stage 3 · PRD §7.4,
 * Stage 3 Plan §7.1.
 *
 * - `capability` = **카드마다 다른 역량** (`D-5`). 카드 단위 대표 역량
 *   (`ActivityCard.targetCapability`)은 **D-22** 로 삭제되었다.
 * - `promptPreview` = 선택 **전**에도 카드 안에서 보이는 Prompt 목록 (`D-4`).
 *   **길이 상한을 두지 않는다** (`D-21`) — `.min(1)` 만 둔다. Frontend 는 배열을
 *   자르지 않는다 (`slice` 금지).
 * - `reason` 과 각 Prompt 의 `coachingNote` 는 **서버가 만든 문장**이다. Frontend 는 접두어를
 *   붙이거나 가공하지 않는다 (`rules/frontend.md` §8).
 *
 * ── 2026-10-05 변경 (`docs/decisions/stage-3-approvals.md` §12.12 · §12.10) ──
 * - **`book` 이 non-null 이다.** `conversation_only` 옵션(책 없는 카드)이 폐지되어 Frontend 는
 *   **항상 책이 있다고 가정**한다. 그에 따라 `title`(책 없는 활동 제목)과
 *   `userEnteredBook`(= `book` 이 `null` 일 때만 의미가 있던 필드)이 사라졌다.
 *   보호자 직접 입력 책도 서버가 `BookSummary` 로 내려준다.
 * - **`saved` 추가** (`G-14`) — 어제 저장한 책이 오늘 카드에 나오면 처음부터 `Saved` 로 보인다.
 *   카드 응답에 서재 조인이 생기므로 2초 NFR(`P3-BIP-10`)에 영향이 있다.
 */
export const ActivityCardOptionSchema = z.object({
  id: IdSchema,
  /** 덱 안의 자리 (0 · 1 · 2). */
  position: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  kind: ActivityOptionKindSchema,
  capability: CapabilitySchema.nullable(),
  /** **항상 있다** — 서버는 책 없는 카드를 만들지 않는다 (approvals §12.12). */
  book: BookSummarySchema,
  /** 추천 이유 1~2문장. */
  reason: z.string().min(1),
  /**
   * **상한 없음** (D-21). 최소 1개.
   *
   * 카드 **뒷면**(`86:482`)이 이 배열을 `[pill, 코칭 노트]` 쌍으로 1:1 렌더한다 (`A-17` ·
   * §12.14). 그래서 카드 단위 `coachingLine` 은 **삭제**되었고 노트는
   * `Prompt.coachingNote` 에 있다 — 앞면 pill 개수 = 뒷면 노트 개수가 타입으로 보장된다.
   */
  promptPreview: z.array(PromptSchema).min(1).superRefine(createPromptCoachingRefine()),
  /** 이 옵션의 책이 보호자의 서재에 저장되어 있는가 (`G-14`, `API_CONTRACTS.md` §3.7.4 ⓑ). */
  saved: z.boolean(),
});

export type ActivityCardOption = z.infer<typeof ActivityCardOptionSchema>;
