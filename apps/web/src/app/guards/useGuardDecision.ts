/**
 * `useGuardDecision` — `useMe()` + 순수 함수 `resolveGuardDecision` (결정 `D-5`).
 *
 * 이 hook 은 **판정하지 않는다.** 데이터를 모아 순수 함수에 넘기고 결과를 그대로 돌려준다.
 * 판정 규칙 전수 테스트는 `resolveGuardDecision` 단위 테스트가 담당한다 (AC-2-42).
 *
 * 한 가지 예외만 여기에서 처리한다: **`GET /v1/me` 가 인증과 무관한 이유로 실패**했을 때
 * (`INTERNAL_ERROR` · offline 등) Guard 는 화면을 막지 않고 `allow` 한다. 그래야 화면이
 * 자기 Error / Offline 상태를 보여 줄 수 있다 (Design Spec §8). Guard 가 `pending` 으로
 * 남으면 앱 전체가 Spinner 에 갇힌다.
 */
import { useLocation } from 'react-router';

import { useMe } from '../../entities/me';
import { useAuth } from '../../shared/auth';

import { ALLOW_DECISION, resolveGuardDecision, type GuardDecision } from './resolveGuardDecision';

export function useGuardDecision(): GuardDecision {
  const { pathname } = useLocation();
  const { sessionExpired } = useAuth();
  const { me, isError } = useMe();

  if (me === undefined && isError) return ALLOW_DECISION;

  return resolveGuardDecision(me, pathname, { sessionExpired });
}
