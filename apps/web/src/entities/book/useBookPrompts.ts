/**
 * `useBookPrompts` — `GET /v1/books/:bookId/prompts?childId=` (FR-20 "책별 Prompt 보기").
 * `BookDetailSheet` 가 쓴다 (Library Design Spec §3.8).
 *
 * ```
 * (feature) → useBookPrompts → booksApi.getPrompts → MockBooksApi | HttpBooksApi
 * ```
 *
 * ── 응답은 `{ bookId, promptSet }` 다 ──
 * Plan §7.2 가 적은 `coachingLine` 은 **contracts 에 존재하지 않는다** — approvals §12.14 로
 * 삭제되고 코칭 노트가 **Prompt 1개당 1개**(`Prompt.coachingNote`)로 옮겨졌다
 * (`stage-3-approvals.md` §21.4 기록 정정). 되살리지 않는다.
 *
 * ── `reason` 도 이 응답이 싣는다 (사용자 결정 2026-10-09) ──
 * 추천 이유 줄은 `BookPromptsResponse.reason` 이다 (`packages/contracts` 주석이 선정 근거를
 * 갖는다). **nullable** 이므로 `null`·`undefined` 를 **하나로 모아** `null` 로 돌려준다 —
 * 화면은 `null` 이면 줄을 그리지 않는다.
 *
 * ── `bookId` 가 없으면 조회하지 않는다 ──
 * 보호자가 제목만 입력한 책(`LibraryBook.book === null`)에는 카탈로그 id 가 없다. 그 경우
 * Prompt 세트가 **존재할 수 없으므로** 요청을 만들지 않고, 시트가 그 블록을 생략한다.
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, PromptSet } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { useCurrentChildId } from '../me';

import { bookKeys } from './bookKeys';

export interface UseBookPromptsResult {
  promptSet: PromptSet | undefined;
  /** 추천 이유 — 서버 문장. 없으면 `null` 이고 화면은 줄을 생략한다. */
  reason: string | null;
  /** 조회 대상이 있고 아직 결과가 없는 상태. 대상이 없으면 `false` 다. */
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useBookPrompts(
  bookId: string | undefined,
  options: { enabled?: boolean } = {},
): UseBookPromptsResult {
  const { books } = useApiClients();
  const childId = useCurrentChildId();
  const enabled = (options.enabled ?? true) && bookId !== undefined && childId !== undefined;

  const result = useQuery({
    queryKey: bookKeys.prompts(bookId ?? '', childId ?? ''),
    enabled,
    queryFn: ({ signal }) =>
      books.getPrompts({ bookId: bookId ?? '', childId: childId ?? '' }, { signal }),
  });

  const error: unknown = result.error;

  return {
    promptSet: enabled ? result.data?.promptSet : undefined,
    reason: (enabled ? result.data?.reason : undefined) ?? null,
    isPending: enabled && result.isPending,
    isError: enabled && result.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void result.refetch();
    },
  };
}
