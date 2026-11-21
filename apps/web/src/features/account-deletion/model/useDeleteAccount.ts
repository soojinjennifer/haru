/**
 * `useDeleteAccount` — 탈퇴 Mutation (Stage 8 `C8-4` · Plan §5.2 · AC-8-34 · 35 · 36).
 *
 * ```
 * AccountSettings → useDeleteAccount → accountApi.deleteAccount (IK) → Mock | Http
 *                                       (DELETE /v1/me { confirmation: true })
 * ```
 *
 * - **오프라인이면 보내지 않는다** — `NetworkError` 로 끝낸다 (요청 0). 탈퇴는 되돌릴 수 없는 행위라 지연 · 백그라운드
 *   재전송하지 않는다 (Plan §5.3 — 전체 삭제 요청과 같은 규칙). 그래서 `networkMode: 'always'` 로 두고 직접 판정한다.
 * - `Idempotency-Key`: 제출 의도마다 1개. 실패 후 다시 확인하면 **같은 키**(서버가 최초 응답을 재생) · 성공 응답을 받으면 비운다.
 * - payload = `confirmation` 만 (보호자 이메일 · 아이 이름 0 — Plan §5.5).
 * - 성공 후 로컬 정리 · 세션 종료 · 이동은 화면이 한다 (`useAccountDeletionCleanup`).
 */
import { useMutation } from '@tanstack/react-query';
import type { DeletionRequest, ErrorCode } from '@haru/contracts';
import { useRef } from 'react';

import { useApiClients } from '../../../shared/api/context';
import { isHaruApiError, isNetworkError, NetworkError } from '../../../shared/api/helpers';
import { createIdempotencyKey } from '../../../shared/lib/idempotency';

export interface UseDeleteAccountOptions {
  /** 테스트 주입 지점 — 연결 상태. 주지 않으면 `navigator.onLine`. */
  isOnline?: (() => boolean) | undefined;
}

export interface DeleteAccountFailure {
  offline: boolean;
  code: ErrorCode | undefined;
}

export interface DeleteAccountMutation {
  submit: (callbacks: {
    onSuccess: (request: DeletionRequest) => void;
    onError: (failure: DeleteAccountFailure) => void;
  }) => void;
  isPending: boolean;
}

function browserOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

export function useDeleteAccount(options: UseDeleteAccountOptions = {}): DeleteAccountMutation {
  const { account } = useApiClients();
  const key = useRef<string | null>(null);
  const isOnline = options.isOnline ?? browserOnline;

  const mutation = useMutation({
    networkMode: 'always',
    mutationFn: async (): Promise<DeletionRequest> => {
      if (!isOnline()) throw new NetworkError('Device is offline — account deletion was not sent.');
      key.current ??= createIdempotencyKey();
      const response = await account.deleteAccount(
        { body: { confirmation: true } },
        { idempotencyKey: key.current },
      );
      key.current = null;
      return response;
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
