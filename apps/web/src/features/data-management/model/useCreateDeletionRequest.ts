/**
 * `useCreateDeletionRequest` — 전체 데이터 삭제 요청 Mutation (Stage 8 `C8-3` · FR-21 · Plan §5.2 · §5.3, AC-8-26 · 29 · 30).
 *
 * ```
 * DataManagement → useCreateDeletionRequest → dataManagementApi.createDeletionRequest (IK) → Mock | Http
 *                                              (POST /v1/data-deletion-requests { scope: 'all_data', confirmation: true })
 * ```
 *
 * - **오프라인이면 보내지 않는다** — `NetworkError` 로 끝낸다 (요청 0). 삭제 요청은 SessionOutbox 대상이 아니며 백그라운드
 *   재전송하지 않는다 (Plan §5.3 — 되돌릴 수 없는 행위를 지연 실행하지 않는다). TanStack 기본 `networkMode: 'online'` 은
 *   오프라인 mutation 을 보류했다가 연결 시 보내므로 `always` 로 두고 직접 판정한다 (`S8-B` 와 같다).
 * - `Idempotency-Key`: 제출 의도마다 1개. 실패 후 다시 확인하면 **같은 키**(서버가 최초 응답을 재생) · 성공 응답을 받으면 비운다
 *   — 그 요청이 `failed` 로 끝나 *Try again* 하면 새 요청 = 새 키.
 * - payload = `scope` · `confirmation` 만 (PII 0 — Plan §5.5).
 * - 성공 · `DELETION_ALREADY_REQUESTED` → 요약 무효화 (진행 중 요청이 요약에 나타난다).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DeletionRequest, ErrorCode } from '@haru/contracts';
import { useRef } from 'react';

import { dataManagementKeys } from '../../../entities/data-management';
import { useApiClients } from '../../../shared/api/context';
import { isHaruApiError, isNetworkError, NetworkError } from '../../../shared/api/helpers';
import { createIdempotencyKey } from '../../../shared/lib/idempotency';

export interface UseCreateDeletionRequestOptions {
  /** 테스트 주입 지점 — 연결 상태. 주지 않으면 `navigator.onLine`. */
  isOnline?: (() => boolean) | undefined;
}

export interface CreateDeletionRequestFailure {
  offline: boolean;
  code: ErrorCode | undefined;
}

export interface CreateDeletionRequestMutation {
  submit: (callbacks: {
    onSuccess: (request: DeletionRequest) => void;
    onError: (failure: CreateDeletionRequestFailure) => void;
  }) => void;
  isPending: boolean;
}

function browserOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

export function useCreateDeletionRequest(
  options: UseCreateDeletionRequestOptions = {},
): CreateDeletionRequestMutation {
  const { dataManagement } = useApiClients();
  const queryClient = useQueryClient();
  const key = useRef<string | null>(null);
  const isOnline = options.isOnline ?? browserOnline;

  const mutation = useMutation({
    networkMode: 'always',
    mutationFn: async (): Promise<DeletionRequest> => {
      if (!isOnline()) throw new NetworkError('Device is offline — deletion request was not sent.');
      key.current ??= createIdempotencyKey();
      const response = await dataManagement.createDeletionRequest(
        { body: { scope: 'all_data', confirmation: true } },
        { idempotencyKey: key.current },
      );
      key.current = null;
      return response;
    },
    onSettled: (_data, error: unknown) => {
      if (
        error === null ||
        (isHaruApiError(error) && error.code === 'DELETION_ALREADY_REQUESTED')
      ) {
        void queryClient.invalidateQueries({ queryKey: dataManagementKeys.summary() });
      }
    },
  });

  return {
    submit: (callbacks) => {
      if (mutation.isPending) return; // 연타 · 이중 요청 0
      mutation.mutate(undefined, {
        onSuccess: callbacks.onSuccess,
        onError: (error: unknown) => {
          callbacks.onError({
            offline: isNetworkError(error),
            code: isHaruApiError(error) ? error.code : undefined,
          });
        },
      });
    },
    isPending: mutation.isPending,
  };
}
