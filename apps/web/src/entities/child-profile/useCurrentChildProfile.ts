/**
 * `useCurrentChildProfile` — 로그인한 보호자의 아이 프로필 화면 상태 (Stage 6 Spec §2.1 · §2.2 · §2.3 · §2.7,
 * `D6-5` — 프로필·발전 역량 화면 모두 `GET /profile`).
 *
 * ```
 * 화면 → useCurrentChildProfile → useMe(아이 id) + useChildProfile → childrenApi.getProfile
 * ```
 *
 * - 아이 id 는 `me.child.id` 한 곳에서 읽는다 (`useCurrentChildId` 와 같은 규칙).
 * - `me` 가 해석됐는데 아이가 없으면(온보딩 전 · Trial) 조회할 수 없다 → 실패 상태로 보여 준다.
 * - `S6-E1` 의 `features/child-profile-view/model/useProfileResult` 를 `S6-E2` 에서 이 레이어로 내렸다 —
 *   프로필 화면과 발전 역량 화면(다른 feature)이 함께 쓰기 때문이다 (feature 간 import 금지). 동작 변경 0.
 */
import type { ChildProfile, ErrorCode } from '@haru/contracts';

import { useMe } from '../me';

import { useChildProfile } from './useChildProfile';

export type CurrentChildProfileState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'error'; readonly offline: boolean; readonly code: ErrorCode | undefined }
  | { readonly kind: 'ready'; readonly profile: ChildProfile };

export interface UseCurrentChildProfile {
  state: CurrentChildProfileState;
  retry: () => void;
}

export function useCurrentChildProfile(): UseCurrentChildProfile {
  const me = useMe();
  const childId = me.me?.child?.id;
  const query = useChildProfile(childId);

  const retry = () => {
    if (childId === undefined) {
      me.refetch();
      return;
    }
    query.refetch();
  };

  if (query.profile !== undefined) {
    return { state: { kind: 'ready', profile: query.profile }, retry };
  }
  if (query.isError) {
    return {
      state: { kind: 'error', offline: query.isOffline, code: query.errorCode },
      retry,
    };
  }
  if (me.me === undefined || query.isPending) {
    return { state: { kind: 'loading' }, retry };
  }
  // `me` 는 해석됐는데 아이가 없다 — 요청을 보낼 수 없다.
  return {
    state: { kind: 'error', offline: me.isOffline, code: me.errorCode },
    retry,
  };
}
