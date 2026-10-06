/**
 * `useToggleSavedBook` — `★ Save` 저장/해제 (`docs/API_CONTRACTS.md` §3.7, `G-13`).
 *
 * ```
 * (feature) → useToggleSavedBook → libraryApi.saveBook | unsaveBook → Mock | Http
 * ```
 *
 * ── 낙관적 갱신을 쓰는 이유 (audit §16.5) ──
 * `PUT` 이 멱등이라 재시도·중복이 안전하고, **Figma 에 로딩 표현이 없다**. 지연을 숨기는 것이
 * Figma 를 지키는 유일한 방법이다. 그래서 스피너를 넣지 않고 버튼을 비활성화하지도 않는다.
 *
 * ── 캐시 처리 ──
 * - `activityCardKeys.today` 는 **낙관값으로 직접 갱신**하고 재조회하지 않는다
 *   (카드 전체 재요청은 과하다 — 2초 NFR `P3-BIP-10`).
 * - `libraryKeys` 는 성공 시 무효화한다 (서재 "My Saved" 목록 반영 — Library 라운드).
 * - 실패하면 이전 상태로 **롤백**한다. 알림은 소비자가 `onError` 로 띄운다 (Toast 소유는 feature).
 *
 * 전송 중 재입력은 마지막 요청만 유효하다 — `mutationKey` 가 같으므로 TanStack Query 가
 * 직전 mutation 을 취소하지 않지만, 낙관값이 항상 "마지막으로 누른 상태" 이고 `PUT`/`DELETE`
 * 가 둘 다 멱등이라 최종 상태가 어긋나지 않는다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ActivityCard, ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { activityCardKeys } from '../activity-card/activityCardKeys';
import { useCurrentChildId } from '../me';

import { libraryKeys } from './libraryKeys';

export interface ToggleSavedBookVariables {
  /** 저장 대상 책. 카드가 아니라 **책**이다 (`API_CONTRACTS.md` §3.7.2). */
  bookId: string;
  /** 이 호출 후 기대하는 상태. `true` = 저장, `false` = 해제. */
  saved: boolean;
}

export interface ToggleSavedBookMutation {
  toggle: (variables: ToggleSavedBookVariables) => void;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
}

/**
 * 캐시 안의 오늘 카드에서 해당 책의 옵션들만 `saved` 를 바꾼다.
 * `options` 는 **정확히 3장 튜플**이라(`ActivityCardSchema`) `map` 결과를 그대로 넣을 수 없다.
 */
function withSaved(card: ActivityCard, bookId: string, saved: boolean): ActivityCard {
  const next = (option: ActivityCard['options'][number]) =>
    option.book.id === bookId ? { ...option, saved } : option;

  return {
    ...card,
    options: [next(card.options[0]), next(card.options[1]), next(card.options[2])],
  };
}

export function useToggleSavedBook(onError?: () => void): ToggleSavedBookMutation {
  const { library } = useApiClients();
  const childId = useCurrentChildId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (variables: ToggleSavedBookVariables) =>
      variables.saved
        ? library.saveBook({
            childId: childId ?? '',
            body: { target: { bookId: variables.bookId } },
          })
        : library.unsaveBook({ childId: childId ?? '', bookId: variables.bookId }),

    onMutate: (variables) => {
      const key = activityCardKeys.today(childId ?? '');
      const previous = queryClient.getQueryData<ActivityCard>(key);

      if (previous !== undefined) {
        queryClient.setQueryData<ActivityCard>(
          key,
          withSaved(previous, variables.bookId, variables.saved),
        );
      }

      return { key, previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<ActivityCard>(context.key, context.previous);
      }
      onError?.();
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.saved(childId ?? '') });
    },
  });

  const error: unknown = mutation.error;

  return {
    toggle: (variables) => {
      mutation.mutate(variables);
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
  };
}
