import { z } from 'zod';

/**
 * Cursor 기반 Pagination 규약.
 * 근거: `docs/API_CONTRACTS.md` §1 Conventions —
 * "Cursor: `?limit=20&cursor=<opaque>` → `{ items: T[], nextCursor: string | null }`. limit 최대 50".
 */
export const PAGE_LIMIT_MIN = 1;
export const PAGE_LIMIT_MAX = 50;
export const PAGE_LIMIT_DEFAULT = 20;

/**
 * 목록 조회 요청의 공통 query 규약.
 * `limit` 을 생략하면 `PAGE_LIMIT_DEFAULT` 가 적용된다 (parse 결과에는 항상 존재한다).
 */
export const CursorPageRequestSchema = z.object({
  limit: z.int().min(PAGE_LIMIT_MIN).max(PAGE_LIMIT_MAX).default(PAGE_LIMIT_DEFAULT),
  /** 서버가 발급한 불투명(opaque) 문자열. 클라이언트는 내용을 해석하지 않는다. */
  cursor: z.string().min(1).optional(),
});

/** parse **입력** 타입 — `limit`·`cursor` 모두 생략 가능하다. */
export type CursorPageRequestInput = z.input<typeof CursorPageRequestSchema>;
/** parse **출력** 타입 — `limit` 은 기본값이 채워져 항상 존재한다. */
export type CursorPageRequest = z.infer<typeof CursorPageRequestSchema>;

/**
 * 목록 응답 wrapper. 마지막 페이지에서는 `nextCursor` 가 `null` 이다.
 *
 * ```ts
 * const BookPageSchema = paginated(BookSchema);
 * ```
 */
export function paginated<TItem extends z.ZodType>(item: TItem) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().min(1).nullable(),
  });
}

/** `paginated(T)` 응답의 구조 타입. */
export interface Page<TItem> {
  items: TItem[];
  nextCursor: string | null;
}
