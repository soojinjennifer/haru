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
 *
 * ── `reason` — **추천 이유 줄** (사용자 결정 2026-10-09) ──
 * Figma `145:1085`(= Home 카드 `163:2649`)의 책 블록에는 제목·저자 아래 **이유 문장**이 있다.
 * `ActivityCardOption.reason` 과 **같은 성격의 값**이며 **서버가 만든 문장**이다 — Frontend 는
 * 생성·가공·접두어 추가를 하지 않는다 (`rules/frontend.md` §8).
 *
 * **왜 `LibraryBook` 이 아니라 여기인가** (판단 근거 — 보고 대상)
 *  1. 이 값을 그리는 화면은 `BookDetailSheet` **한 곳**이다. `LibraryBook` 은 overview ·
 *     "See all" 목록 · 캐러셀 · `Reading now` 가 공유하는 행 표현이고 그 어느 자리에도 이유
 *     줄이 없다 (Design Spec §3.3 · §3.5). 거기에 두면 **보여 주지 않는 생성 문장**이 목록
 *     페이지마다 실려 나간다 (생성 비용 · 2초 NFR `P3-BIP-10` 와 같은 지연 위험).
 *  2. 이유는 **아이 + 책 + 큐레이션** 범위의 값이다. 그 범위를 이미 가진 요청이 이것이다
 *     (`?childId=`, 응답 `PromptSet.ageBand`·`capability`). 서재 행(`child_books`)에는 큐레이션
 *     맥락이 없다.
 *  3. 시트에는 **책 상세 endpoint 가 따로 없다** (`API_CONTRACTS.md` §Stage 3). 시트가 쓰는
 *     detail 조회는 이 호출 하나이므로, 여기 담으면 **표시하는 시점에 정확히 한 번** 받는다.
 *  4. 시트 높이는 Prompt 도착 시점에 **이미 한 번 바뀐다**(Skeleton → pill 목록). 이유 줄이
 *     같은 응답으로 함께 도착하므로 **새로운 종류의 레이아웃 이동을 만들지 않는다**.
 *
 * `nullable` 인 이유: 서버가 아직 문장을 갖고 있지 않을 수 있다. 그 경우 화면은 **줄을
 * 생략**한다 — 빈 문자열·대체 문구를 만들지 않는다. 카탈로그에 없는 책(`LibraryBook.book ===
 * null`)은 이 호출 자체를 하지 않으므로 이유 줄도 없다.
 *
 * ⚠ 길이 제약(`.max()`)을 걸지 않는다 — 서버가 한 번만 넘겨도 parse 가 던져 시트가 통째로
 * 비어 버린다 (`characterLine` 선례, `stage-3-approvals.md` §13.3). 길이 요구는 Handoff
 * 문서에 남긴다 (`P3-BIP-26`).
 */
export const BookPromptsResponseSchema = z.object({
  bookId: IdSchema,
  promptSet: PromptSetSchema,
  /** 추천 이유 1~2문장. **서버 생성 문장**이며 없으면 화면이 줄을 생략한다. */
  reason: z.string().min(1).nullable().optional(),
});

export type BookPromptsResponse = z.infer<typeof BookPromptsResponseSchema>;
