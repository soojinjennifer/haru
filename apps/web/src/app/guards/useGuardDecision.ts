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
 *
 * ── 로그인 후 복귀 (AC-7-46, `D7-6` ⑨) ──
 * 미인증으로 보호된 경로에서 튕겨 나갈 때 그 경로(`pathname + search + hash`)를 `returnPathStore` 에 기억하고,
 * 로그인 뒤 규칙 6(`/auth/*` → 목적지)과 `LogInPage` 가 Home 대신 그 경로로 보낸다. 인증 사용자가 `/auth/*` 밖의
 * 화면에 **도달(allow)** 하면 지운다 — 동의 · VPC · 온보딩 게이트가 먼저 걸리면 그 흐름이 이기고, 끝나면 Home 기본값이다.
 * 경로는 로그에 남기지 않는다.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { useMe } from '../../entities/me';
import { hasAnyAnswers, pathForStep } from '../../features/onboarding-survey';
import { useAuth } from '../../shared/auth';
import { createSystemClock } from '../../shared/lib/clock';
import {
  createOnboardingDraftStore,
  type OnboardingDraftStore,
} from '../../shared/lib/onboarding-draft';
import { returnPathStore } from '../../shared/lib/return-path';

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
  const { pathname, search, hash } = useLocation();
  const { sessionExpired } = useAuth();
  const { me, isError } = useMe();

  // 저장소는 마운트 동안 변하지 않는 싱글턴이다 (렌더 중 ref 를 읽지 않기 위해 lazy state).
  const [store] = useState<OnboardingDraftStore>(() =>
    createOnboardingDraftStore({ clock: createSystemClock() }),
  );

  /*
   * 저장소 읽기를 **필요할 때만** 한다. 판정이 아니라 비용 가드다 — 규칙 5 밖에서는 이 값이
   * 쓰이지 않으므로 매 렌더마다 `localStorage` + parse 를 할 이유가 없다.
   */
  const needsOnboardingTarget =
    me !== null && me !== undefined && me.onboardingStatus !== 'completed';

  const decision: GuardDecision =
    me === undefined && isError
      ? ALLOW_DECISION
      : resolveGuardDecision(me, pathname, {
          sessionExpired,
          onboardingResumePath: needsOnboardingTarget ? onboardingResumePathFrom(store) : null,
          returnPath: me === null || me === undefined ? null : returnPathStore.peek(),
        });

  // 복귀 경로 기억 · 정리 (AC-7-46). 미인증 리다이렉트 = 기억 · 인증 사용자가 앱 화면에 도달 = 정리.
  // **로그아웃 · 세션 만료는 기억하지 않는다** — 이 Guard 가 인증 상태를 본 적이 있으면 "deep link 진입"이 아니라
  // 화면 안에서 세션을 잃은 것이고, 다음 로그인은 Stage 2 기본값(Home)이어야 한다.
  const authenticated = me !== null && me !== undefined;
  const unauthenticatedRedirect = me === null && decision.status === 'redirect';
  const arrived = authenticated && decision.status === 'allow' && !pathname.startsWith('/auth/');
  const intendedPath = `${pathname}${search}${hash}`;
  const seenAuthenticated = useRef(false);
  useEffect(() => {
    if (authenticated) {
      seenAuthenticated.current = true;
      if (arrived) returnPathStore.clear();
      return;
    }
    if (unauthenticatedRedirect && !seenAuthenticated.current) {
      returnPathStore.remember(intendedPath);
    }
  }, [authenticated, unauthenticatedRedirect, arrived, intendedPath]);

  return decision;
}
