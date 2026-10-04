/**
 * `useGuardDecision` — `useMe()` + 로컬 draft + 순수 함수 `resolveGuardDecision` (결정 `D-5`).
 *
 * 이 hook 은 **판정하지 않는다.** 데이터를 모아 순수 함수에 넘기고 결과를 그대로 돌려준다.
 * 판정 규칙 전수 테스트는 `resolveGuardDecision` 단위 테스트가 담당한다 (AC-2-42).
 *
 * 한 가지 예외만 여기에서 처리한다: **`GET /v1/me` 가 인증과 무관한 이유로 실패**했을 때
 * (`INTERNAL_ERROR` · offline 등) Guard 는 화면을 막지 않고 `allow` 한다. 그래야 화면이
 * 자기 Error / Offline 상태를 보여 줄 수 있다 (Design Spec §8). Guard 가 `pending` 으로
 * 남으면 앱 전체가 Spinner 에 갇힌다.
 *
 * ── 로컬 draft 를 읽는 이유 (`§11.19` 7-2) ──
 * 동의 직후 착지 화면이 "처음이면 프로필 안내 / 중도 복귀면 그 지점" 으로 갈린다. 판정 함수는
 * 저장소를 모르므로(순수 유지) 여기에서 **기존 `OnboardingDraftStore`** 를 읽어 경로로 바꿔
 * 넘긴다. **새 저장소·새 플래그를 만들지 않는다.**
 */
import { useState } from 'react';
import { useLocation } from 'react-router';

import { useMe } from '../../entities/me';
import { hasAnyAnswers, pathForStep } from '../../features/onboarding-survey';
import { useAuth } from '../../shared/auth';
import { createSystemClock } from '../../shared/lib/clock';
import {
  createOnboardingDraftStore,
  type OnboardingDraftStore,
} from '../../shared/lib/onboarding-draft';

import { ALLOW_DECISION, resolveGuardDecision, type GuardDecision } from './resolveGuardDecision';

/**
 * 저장된 draft 가 가리키는 지점의 경로. draft 가 없거나 응답이 하나도 없으면 `null`.
 *
 * "응답이 하나도 없는 draft" 는 중도 복귀로 보지 않는다 — 단계만 기록된 빈 draft 를 근거로
 * 프로필 안내를 건너뛰면 사용자가 아무 맥락 없이 카드 단계에 떨어진다.
 */
export function onboardingResumePathFrom(store: OnboardingDraftStore): string | null {
  const { draft } = store.read();

  if (draft === null) return null;
  if (!hasAnyAnswers(draft.answers)) return null;

  return pathForStep(draft.currentStep);
}

export function useGuardDecision(): GuardDecision {
  const { pathname } = useLocation();
  const { sessionExpired } = useAuth();
  const { me, isError } = useMe();

  // 저장소는 마운트 동안 변하지 않는 싱글턴이다 (렌더 중 ref 를 읽지 않기 위해 lazy state).
  const [store] = useState<OnboardingDraftStore>(() =>
    createOnboardingDraftStore({ clock: createSystemClock() }),
  );

  if (me === undefined && isError) return ALLOW_DECISION;

  /*
   * 저장소 읽기를 **필요할 때만** 한다. 판정이 아니라 비용 가드다 — 규칙 5 밖에서는 이 값이
   * 쓰이지 않으므로 매 렌더마다 `localStorage` + parse 를 할 이유가 없다.
   */
  const needsOnboardingTarget =
    me !== null && me !== undefined && me.onboardingStatus !== 'completed';

  return resolveGuardDecision(me, pathname, {
    sessionExpired,
    onboardingResumePath: needsOnboardingTarget ? onboardingResumePathFrom(store) : null,
  });
}
