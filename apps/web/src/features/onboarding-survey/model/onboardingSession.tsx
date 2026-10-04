/**
 * 온보딩 카드 **세션 상태** — 단계 전환(= route 이동)을 넘어 살아남아야 하는 두 가지.
 *
 * | 값 | 왜 필요한가 |
 * |---|---|
 * | `visited` (떠난 적 있는 카드) | 돌아온 카드에서 자동 전진을 끄는 근거 (§14.2-3 · `S2R-OPEN-3`) |
 * | 전환 후 포커스 요청 | 단계를 넘긴 뒤 새 카드의 첫 옵션으로 포커스를 옮기기 위해 (§14.3) |
 * | 복귀 지점 | 이전 단계로 **뒤로** 갈 때 그 단계의 마지막 카드에 놓기 위해 (§14.2-1) |
 *
 * ── 왜 덱이나 위저드가 들고 있을 수 없는가 ──
 * `app/error/RouteErrorBoundary` 가 `key={location.key}` 로 렌더한다 (다른 화면으로 이동하면
 * 에러 상태가 자동 복구되도록). 그래서 **navigate 할 때마다 그 아래 트리가 통째로 재마운트**
 * 된다 — `OnboardingStepPage` · `OnboardingWizard` · `SurveyCardDeck` 의 state 와 ref 가 모두
 * 초기화된다. 단계 전환은 navigate 이므로 덱 안에서는 두 값을 이어받을 수 없다 (실측 확인).
 *
 * 그래서 **에러 경계보다 위**(온보딩 route 그룹의 layout element)에 provider 를 둔다.
 * 온보딩 밖으로 나가면 provider 가 unmount 되어 값이 사라진다 — "세션 동안 유지" 의 범위가
 * 온보딩 흐름과 정확히 같아진다.
 *
 * 전역 상태를 **도입하지 않는다**: module scope 변수도, 상태 관리 라이브러리도 쓰지 않는다
 * (`.claude/rules/frontend.md` §4 — 전역 상태는 승인 사항). React context + ref 뿐이다.
 *
 * 값은 렌더에 쓰이지 않으므로 `useState` 가 아니라 **ref** 다. 카드를 하나 떠날 때마다
 * 온보딩 트리 전체를 다시 그릴 이유가 없고, context 값이 바뀌지 않으므로 추가 렌더가 0 이다.
 */
import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import type { OnboardingStep } from '@haru/contracts';

export interface OnboardingSession {
  /** 이 카드를 떠난 적이 있는가 — 있으면 자동 전진하지 않는다. */
  hasVisited: (cardKey: string) => boolean;
  markVisited: (cardKey: string) => void;
  /** 단계를 넘긴다 — 새 덱이 마운트되면 첫 옵션으로 포커스를 옮기라는 요청. */
  requestFocusOnMount: () => void;
  /** 요청이 있었는가. **읽으면 소비된다** (한 번만 옮긴다). */
  takeFocusRequest: () => boolean;
  /**
   * 이전 단계로 **뒤로** 갈 때, 그 단계를 어느 카드에서 시작할지 (§14.2-1 — 카드 흐름이 하나라
   * 이전 단계의 **마지막** 카드로 돌아간다).
   */
  requestReturnTo: (step: OnboardingStep, index: number) => void;
  /**
   * 요청이 이 단계의 것이면 그 index, 아니면 `null`.
   *
   * **읽으면 단계가 맞든 아니든 비운다.** 복귀 지점은 "바로 다음에 마운트되는 위저드"만을 위한
   * 1회성 값이다 — 남겨 두면 나중에 앞으로 가며 같은 단계에 들어올 때 엉뚱한 카드로 뛴다.
   */
  takeReturnIndex: (step: OnboardingStep) => number | null;
}

/**
 * provider 없이 쓰는 경우를 위한 **컴포넌트 지역** 세션. provider 가 없으면 단계 안에서만
 * 유지되는 예전 동작이 되며, 단위 테스트처럼 위저드만 떼어 렌더할 때 쓰인다.
 */
function useLocalOnboardingSession(): OnboardingSession {
  const visitedRef = useRef<Set<string>>(new Set<string>());
  const focusRequestRef = useRef(false);
  const returnRef = useRef<{ step: OnboardingStep; index: number } | null>(null);

  return useMemo<OnboardingSession>(
    () => ({
      hasVisited: (cardKey) => visitedRef.current.has(cardKey),
      markVisited: (cardKey) => {
        visitedRef.current.add(cardKey);
      },
      requestFocusOnMount: () => {
        focusRequestRef.current = true;
      },
      takeFocusRequest: () => {
        const requested = focusRequestRef.current;
        focusRequestRef.current = false;
        return requested;
      },
      requestReturnTo: (step, index) => {
        returnRef.current = { step, index };
      },
      takeReturnIndex: (step) => {
        const pending = returnRef.current;
        // 묵은 요청을 남기지 않는다 — 단계가 달라도 비운다.
        returnRef.current = null;

        return pending === null || pending.step !== step ? null : pending.index;
      },
    }),
    [],
  );
}

const OnboardingSessionContext = createContext<OnboardingSession | null>(null);

export interface OnboardingSessionProviderProps {
  children: ReactNode;
}

/**
 * 온보딩 route 그룹의 **layout element 안**에 둔다 (`app/router.tsx`). 에러 경계보다 위라
 * 단계 전환에도 살아남고, 온보딩을 벗어나면 함께 사라진다.
 */
export function OnboardingSessionProvider({ children }: OnboardingSessionProviderProps) {
  const session = useLocalOnboardingSession();

  return (
    <OnboardingSessionContext.Provider value={session}>
      {children}
    </OnboardingSessionContext.Provider>
  );
}

/** provider 가 있으면 그 세션을, 없으면 지역 세션을 쓴다. */
export function useOnboardingSession(): OnboardingSession {
  const provided = useContext(OnboardingSessionContext);
  const local = useLocalOnboardingSession();

  return provided ?? local;
}
