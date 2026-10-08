/**
 * `useCreateGiftRequest` — `POST /v1/children/:childId/gift-requests` (FR-22, PRD §13).
 * `BookDetailSheet` 의 보조 CTA 가 쓴다 (`stage-3-design-spec.md` §2.9 ActionBar `favorite_only`).
 *
 * ```
 * (feature) → useCreateGiftRequest → libraryApi.createGiftRequest → Mock | Http
 * ```
 *
 * `/library/gift-requests` 는 **상태 확인 전용**이므로 신청 경로는 이 hook 하나다 (§2.11).
 *
 * ── `Idempotency-Key` ──
 * `useAddOwnBook` 과 같은 규칙이다 — 재시도에서 같은 키를 재사용하고 성공하면 비운다.
 * 중복 신청은 `GIFT_REQUEST_DUPLICATE`(409) 이고 **오류 문구는 화면이 소유**한다.
 *
 * 성공 시 `libraryKeys.all` 을 무효화한다 — 서재 아이템의 `giftRequestStatus` 와
 * `libraryKeys.giftRequests` 목록이 둘 다 prefix 로 덮인다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';
import { createIdempotencyKey } from '../../shared/lib/idempotency';
import { useCurrentChildId } from '../me';

import { libraryKeys } from './libraryKeys';

export interface CreateGiftRequestMutation {
  request: (bookId: string) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  reset: () => void;
}

export function useCreateGiftRequest(): CreateGiftRequestMutation {
  const { library } = useApiClients();
  const childId = useCurrentChildId();
  const queryClient = useQueryClient();
  const pendingKey = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: (bookId: string) => {
      pendingKey.current ??= createIdempotencyKey();

      return library.createGiftRequest(
        { childId: childId ?? '', body: { bookId } },
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
    request: (bookId) => {
      mutation.mutate(bookId);
    },
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    reset: () => {
      mutation.reset();
    },
  };
}
