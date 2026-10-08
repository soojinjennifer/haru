/**
 * `useAddOwnBook` — `POST /v1/children/:childId/library/books` (FR-23, PRD §7.2).
 * `/library/add` 가 쓴다 (Library Design Spec §7.2).
 *
 * ```
 * (feature) → useAddOwnBook → libraryApi.addOwnBook → MockLibraryApi | HttpLibraryApi
 * ```
 *
 * ── `Idempotency-Key` 는 "등록 의도" 단위로 하나다 ──
 * 같은 책을 다시 올리는 재시도에서 키가 **그대로 재사용**되어야 서버가 최초 응답을 재생할 수
 * 있다 (`useSubmitOnboarding`·`useRecordConsents` 와 같은 규칙). 성공하면 비운다 — 다음 책은
 * 다른 의도다.
 *
 * ── 낙관적 갱신을 하지 않는다 ──
 * 등록 결과는 서재 섹션 구성(`Finished together` 소속 여부 · 정렬)을 서버가 정하므로
 * 응답으로 캐시를 조립할 수 없다. 성공 시 `libraryKeys.all` 을 무효화하고 **재조회**한다
 * (`overview` 와 `list` 둘 다 prefix 로 덮인다).
 *
 * 중복은 오류다 — `BOOK_ALREADY_OWNED`(409). 화면이 `InlineAlert tone=info` 로 알린다
 * (Design Spec §7.2). 이 hook 은 코드만 전달하고 문구를 만들지 않는다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { AddOwnBookRequest, ErrorCode, LibraryBook } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { createIdempotencyKey } from '../../shared/lib/idempotency';
import { useCurrentChildId } from '../me';

import { libraryKeys } from './libraryKeys';

export interface AddOwnBookMutation {
  add: (request: AddOwnBookRequest, onDone?: (book: LibraryBook) => void) => void;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  reset: () => void;
}

export function useAddOwnBook(): AddOwnBookMutation {
  const { library } = useApiClients();
  const childId = useCurrentChildId();
  const queryClient = useQueryClient();
  const pendingKey = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: (request: AddOwnBookRequest) => {
      pendingKey.current ??= createIdempotencyKey();

      return library.addOwnBook(
        { childId: childId ?? '', body: request },
        { idempotencyKey: pendingKey.current },
      );
    },
    onSuccess: () => {
      pendingKey.current = null;
      void queryClient.invalidateQueries({ queryKey: libraryKeys.all });
    },
  });

  const error: unknown = mutation.error;

  return {
    add: (request, onDone) => {
      mutation.mutate(request, {
        onSuccess: (book) => {
          onDone?.(book);
        },
      });
    },
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    reset: () => {
      mutation.reset();
    },
  };
}
