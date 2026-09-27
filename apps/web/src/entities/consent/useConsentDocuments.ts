/**
 * `useConsentDocuments` — `GET /v1/consent-documents/current` Query hook.
 *
 * ```
 * GuardianConsentForm → useConsentDocuments → consentApi.getCurrentDocuments
 *                     → MockConsentApi | HttpConsentApi
 * ```
 *
 * **공개 endpoint** 라 세션이 없어도 호출할 수 있다 (API_CONTRACTS §1 Conventions).
 * 화면은 항목 수·순서·라벨·필수 여부를 이 응답에서만 얻는다 — 하드코딩 0건 (AC-2-10).
 */
import { useQuery } from '@tanstack/react-query';
import type { ConsentDocument, ErrorCode } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { consentKeys } from './consentKeys';

export interface UseConsentDocumentsResult {
  documents: readonly ConsentDocument[] | undefined;
  isPending: boolean;
  isError: boolean;
  /** Error Envelope 이 있는 실패의 코드. 전송 실패(offline)면 `undefined`. */
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useConsentDocuments(): UseConsentDocumentsResult {
  const { consents } = useApiClients();

  const query = useQuery({
    queryKey: consentKeys.documents(),
    queryFn: ({ signal }) => consents.getCurrentDocuments({ signal }),
  });

  const error: unknown = query.error;

  return {
    documents: query.data?.documents,
    isPending: query.isPending,
    isError: query.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void query.refetch();
    },
  };
}
