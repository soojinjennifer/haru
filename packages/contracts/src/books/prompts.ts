import { z } from 'zod';

import { IdSchema } from '../common/id.js';
import { PromptSetSchema } from '../prompts/prompt.js';

/**
 * 책별 Prompt 보기 — `GET /v1/books/:bookId/prompts?childId=`.
 * 근거: Library Plan §7.2 · §7.5 (FR-20 "책별 Prompt 보기"), Library Design Spec §3.8.
 *
 * ── `PromptSetSchema` 를 **그대로 재사용**한다 ──
 * 같은 모양을 다시 선언하지 않는다 (`rules/architecture.md` §5). Home 카드 뒷면과 서재
 * `BookDetailSheet` 가 **같은 Prompt 표현**을 그리므로 타입이 갈라지면 화면이 어긋난다.
 *
 * ⚠ Plan §7.2 는 응답 필드를 `{ bookId, prompts, coachingLine, followUps }` 로 적었다.
 * 그 목록은 **`stage-3-approvals.md` §12.14 결정 이전**의 모양이다 — 세트 단위 `coachingLine`
 * 은 삭제되고 코칭 노트가 **Prompt 1개당 1개**(`Prompt.coachingNote`)로 옮겨졌다. 지금
 * contracts 에 `coachingLine` 은 존재하지 않으므로 되살리지 않고 `promptSet` 로 감싼다.
 * `prompts`/`followUps` 는 `PromptSet.questions`/`followUps` 가 그대로 담는다.
 *
 * `childId` 는 query 로 보낸다 — 같은 책의 Prompt 가 아이의 연령대·역량에 따라 달라진다
 * (`PromptSet.ageBand` · `capability`).
 */
export const BookPromptsResponseSchema = z.object({
  bookId: IdSchema,
  promptSet: PromptSetSchema,
});

export type BookPromptsResponse = z.infer<typeof BookPromptsResponseSchema>;
