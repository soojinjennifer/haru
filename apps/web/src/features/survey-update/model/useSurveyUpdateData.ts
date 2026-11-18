/**
 * 재응답 화면 데이터 상태 — `GET /v1/children/:childId/survey-update` (Stage 6 Plan §7 C-6 · Spec §2.6.3).
 *
 * ```
 * 화면 → useSurveyUpdateData → useMe(아이 id) + useSurveyUpdateState → childrenApi.getSurveyUpdate
 * ```
 * 아이 id 는 `me.child.id` 한 곳에서 읽는다 (`useCurrentChildProfile` 과 같은 규칙).
 */
import type { ErrorCode, SurveyUpdateState } from '@haru/contracts';

import { useSurveyUpdateState } from '../../../entities/child-profile';
import { useMe } from '../../../entities/me';

export type SurveyUpdateLoad =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error'; readonly offline: boolean; readonly code: ErrorCode | undefined }
  | {
      readonly kind: 'ready';
      readonly childId: string;
      readonly state: SurveyUpdateState;
      /** 이번 draft 에서 저장된 단계가 있다 — 진입 CTA *"Continue where you left off"* (AC-6-26). */
      readonly resuming: boolean;
    };

export interface UseSurveyUpdateData {
  load: SurveyUpdateLoad;
  retry: () => void;
}

export function useSurveyUpdateData(): UseSurveyUpdateData {
  const me = useMe();
  const childId = me.me?.child?.id;
  const query = useSurveyUpdateState(childId);

  const retry = () => {
    if (childId === undefined) {
      me.refetch();
      return;
    }
    query.refetch();
  };

  if (childId !== undefined && query.state !== undefined) {
    return {
      load: { kind: 'ready', childId, state: query.state, resuming: query.hasDraftInProgress },
      retry,
    };
  }
  if (query.isError) {
    return { load: { kind: 'error', offline: query.isOffline, code: query.errorCode }, retry };
  }
  if (me.me === undefined || query.isPending) return { load: { kind: 'loading' }, retry };

  // `me` 는 해석됐는데 아이가 없다 — 요청을 보낼 수 없다.
  return { load: { kind: 'error', offline: me.isOffline, code: me.errorCode }, retry };
}
