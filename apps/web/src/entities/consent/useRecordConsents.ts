/**
 * `useRecordConsents` — `POST /v1/consents` Mutation hook.
 *
 * ```
 * GuardianConsentForm → useRecordConsents → consentApi.record → MockConsentApi | HttpConsentApi
 * ```
 *
 * **Idempotency-Key 수명**이 이 hook 의 핵심 책임이다 (AC-2-16 · S2-R12).
 * 키는 "제출 의도" 단위로 하나다: 한 번 만들면 성공할 때까지 재시도에서 **그대로 재사용**하고,
 * 성공하면 버린다. 그래서 네트워크가 끊겼다 복구된 뒤 재시도해도 서버가 최초 응답을 재생할 뿐
 * 동의가 두 번 기록되지 않는다.
 *
 * 화면 이동은 하지 않는다. 성공하면 `me` 캐시를 무효화하고, 이후 경로는 **Route Guard 가
 * 판정한다** (동의가 끝나면 VPC 또는 온보딩으로 — `resolveGuardDecision`).
 */
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useRef } from 'react';
import type { ConsentStatus, RecordConsentsRequest } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { createIdempotencyKey } from '../../shared/lib/idempotency';
import { meKeys } from '../me';

export type RecordConsentsMutation = UseMutationResult<
  ConsentStatus,
  unknown,
  RecordConsentsRequest
>;

export function useRecordConsents(): RecordConsentsMutation {
  const { consents } = useApiClients();
  const queryClient = useQueryClient();
  /** 진행 중인 제출의 Idempotency-Key. 성공하면 비운다. */
  const pendingKey = useRef<string | null>(null);

  return useMutation({
    mutationFn: (request: RecordConsentsRequest) => {
      pendingKey.current ??= createIdempotencyKey();

      return consents.record(request, { idempotencyKey: pendingKey.current });
    },
    onSuccess: () => {
      pendingKey.current = null;
      // Guard 는 `GET /v1/me` 로 판정한다 — 동의 반영을 다시 읽어야 다음 단계로 넘어간다.
      void queryClient.invalidateQueries({ queryKey: meKeys.all });
    },
  });
}
