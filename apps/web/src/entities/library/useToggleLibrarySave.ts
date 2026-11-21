/**
 * `useToggleLibrarySave` — 서재 화면의 `★ Save` 토글 (`PUT`/`DELETE …/saved-books`).
 *
 * ```
 * (feature) → useToggleLibrarySave → libraryApi.saveBook | unsaveBook → Mock | Http
 * ```
 *
 * ── 왜 `useToggleSavedBook`(Home) 을 쓰지 않는가 ──
 * **캐시 정책이 다르다.** Home 은 오늘 카드(`activityCardKeys.today`)를 **낙관값으로 직접
 * 갱신**해 Figma 에 없는 로딩 표현을 피한다. 서재는 그럴 수 없다 — 응답이 `SavedBook` 이고
 * (`L-OPEN-20` **현행 유지**, approvals §18.4) 그 값으로는 `Favorites` 섹션의 구성·정렬을
 * 조립할 수 없다. 서버가 정하는 것이기 때문이다. 그래서 서재는 **목록 재조회**를 한다
 * (`P3-BIP-15` 의 "수용된 대가").
 *
 * 사용자 결정은 *"Home `useToggleSavedBook` 수정 금지, Library 는 목록 재조회"* 였다.
 * 그 hook 에 콜백을 더하면 Home 경로의 코드가 바뀌므로, **정책이 다른 두 번째 hook** 을 둔다.
 * 중복되는 것은 mutation 배선 뿐이고 Request/Response 타입은 `packages/contracts` 하나다.
 *
 * ── 낙관적 갱신 ──
 * `libraryKeys.all` 을 무효화하기 **전까지** 라벨이 바뀌지 않으면 `★ Save` 가 둔하게 느껴진다.
 * 서재 목록을 낙관적으로 재조립하지 않는 대신, **버튼 라벨은 호출 측이 로컬 상태로** 즉시
 * 바꾸고(시트가 소유) 실패 시 되돌린다 — 이 hook 은 `onError` 를 그대로 전달한다.
 *
 * `onError` 는 응답 error code 를 받는다 (Stage 8 `VG8-C-09` ① — 삭제 진행 중 쓰기 차단 `ACCOUNT_DELETION_PENDING` 이면
 * 호출부가 Toast 에 차단 문구를 쓴다). 네트워크 오류 등 code 가 없으면 `undefined`.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { useCurrentChildId } from '../me';

import { libraryKeys } from './libraryKeys';

export interface ToggleLibrarySaveVariables {
  bookId: string;
  /** 이 호출 후 기대하는 상태. `true` = 저장, `false` = 해제. */
  saved: boolean;
}

export interface ToggleLibrarySaveMutation {
  toggle: (variables: ToggleLibrarySaveVariables) => void;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
}

export function useToggleLibrarySave(
  onError?: (errorCode: ErrorCode | undefined) => void,
): ToggleLibrarySaveMutation {
  const { library } = useApiClients();
  const childId = useCurrentChildId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (variables: ToggleLibrarySaveVariables) =>
      variables.saved
        ? library.saveBook({
            childId: childId ?? '',
            body: { target: { bookId: variables.bookId } },
          })
        : library.unsaveBook({ childId: childId ?? '', bookId: variables.bookId }),

    onError: (error: unknown) => {
      onError?.(isHaruApiError(error) ? error.code : undefined);
    },

    /*
      `libraryKeys.all` = `['library']` 이므로 `overview` · `list(filter)` · `saved` 가
      **한 번에** 무효화된다 (`P3-BIP-15` 가 요구한 "최신 Favorites 재조회").
    */
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: libraryKeys.all });
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
