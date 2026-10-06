import { z } from 'zod';

import { SaveBookTargetSchema } from './saved-book.js';

/**
 * 보유 책 직접 등록 — `POST /v1/children/:childId/library/books` (FR-23 · PRD §7.2).
 * 근거: Library Plan §7.2 · §7.5.
 *
 * 대상 판별 구조는 **`SaveBookTargetSchema` 를 그대로 재사용**한다 (`saved-book.ts` 주석이
 * 예고한 공용화): 카탈로그 책은 `bookId`, 카탈로그에 없는 책은 `title`(+`author?`).
 * 같은 모양을 다시 선언하지 않는다 (`rules/architecture.md` §5).
 *
 * 응답은 `LibraryBook` 이다 (`library/overview.ts` 와 같은 표현).
 * `Idempotency-Key` **필수** — 생성 요청이다.
 */
export const AddOwnBookRequestSchema = z.object({ target: SaveBookTargetSchema });

export type AddOwnBookRequest = z.infer<typeof AddOwnBookRequestSchema>;
