/**
 * `useSurveyUpdateState` — `GET /v1/children/:childId/survey-update` Query hook (Stage 6 Plan §5.3 · §7 C-6).
 *
 * - 진행 중 draft 가 없으면 서버가 **최근 제출 응답으로 프리필**한 상태를 준다 (Plan §5.3).
 * - `steps[].completed` 가 하나라도 `true` 면 진행 중 재응답이 있다 — 진입 CTA *"Continue where you left off"* ·
 *   `currentStep` 으로 복귀 (AC-6-26, Spec §2.6.1).
 * - 문항은 응답의 `instrument` 가 출처다 (`D-A` — 하드코딩 금지). draft 는 서버가 정본이다 (`N6-07`).
 */
import { useQuery } from '@tanstack/react-query';
import type { ErrorCode, SurveyUpdateState } from '@haru/contracts';

import { useApiClients } from '../../shared/api/context';
import { isHaruApiError, isNetworkError } from '../../shared/api/helpers';

import { surveyUpdateKeys } from './childProfileKeys';

export interface UseSurveyUpdateStateResult {
  state: SurveyUpdateState | undefined;
  /** 이번 draft 에서 저장된 단계가 있는가 (이탈 복귀 판정). */
  hasDraftInProgress: boolean;
  isPending: boolean;
  isError: boolean;
  errorCode: ErrorCode | undefined;
  isOffline: boolean;
  refetch: () => void;
}

export function useSurveyUpdateState(childId: string | undefined): UseSurveyUpdateStateResult {
  const { children } = useApiClients();
  const enabled = childId !== undefined;

  const query = useQuery({
    queryKey: surveyUpdateKeys.state(childId ?? ''),
    enabled,
    queryFn: ({ signal }) => children.getSurveyUpdate({ childId: childId ?? '' }, { signal }),
  });

  const error: unknown = query.error;

  return {
    state: query.data,
    hasDraftInProgress: query.data?.steps.some((step) => step.completed) ?? false,
    isPending: enabled && query.isPending,
    isError: query.isError,
    errorCode: isHaruApiError(error) ? error.code : undefined,
    isOffline: isNetworkError(error),
    refetch: () => {
      void query.refetch();
    },
  };
}
