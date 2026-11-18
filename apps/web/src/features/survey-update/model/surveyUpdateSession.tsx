/**
 * 설문 재응답 **흐름 세션** — 진입 화면 ↔ 카드 단계(= route 이동)를 넘어 살아남아야 하는 값.
 *
 * | 값 | 왜 필요한가 |
 * |---|---|
 * | 고친 답 (메모리) | 단계 전환은 navigate 라 화면이 재마운트된다(`RouteErrorBoundary key={location.key}`). 단계 저장이 실패해도 (오프라인) 답이 남아야 한다 — Spec §2.6.3 "이동은 막지 않는다 · 다음 이동 때 재시도" |
 * | 카드 덱 세션 | 떠난 카드 · 전환 후 포커스 · 복귀 지점 — 온보딩과 같은 `SurveyDeckSessionProvider` (`R-5`) |
 *
 * ── Privacy (`N6-07` ⓐ → `D6-3`) ──
 * 답은 **메모리에만** 있다. `localStorage` · `sessionStorage` · `history.state` 에 쓰지 않는다 — 서버 draft 가 정본이다.
 * 흐름(`/settings/child/survey*`)을 벗어나면 provider 가 unmount 되어 메모리 값도 사라진다. 다시 들어오면 서버 draft 로 시작한다.
 *
 * 전역 상태를 도입하지 않는다 (`.claude/rules/frontend.md` §4) — React context 뿐이다.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { SurveyUpdateDraftAnswers } from '@haru/contracts';

import { SurveyDeckSessionProvider } from '../../../entities/survey';

export interface SurveyUpdateSession {
  /** 이 흐름에서 고친 답. 아직 아무것도 고치지 않았으면 `null` — 서버 draft 를 그대로 쓴다. */
  answers: SurveyUpdateDraftAnswers | null;
  setAnswers: (next: SurveyUpdateDraftAnswers) => void;
}

const SurveyUpdateSessionContext = createContext<SurveyUpdateSession | null>(null);

export interface SurveyUpdateSessionProviderProps {
  children: ReactNode;
}

/** 재응답 route 그룹의 layout element 에 둔다 (`app/router.tsx`) — 에러 경계보다 위. */
export function SurveyUpdateSessionProvider({ children }: SurveyUpdateSessionProviderProps) {
  const [answers, setAnswers] = useState<SurveyUpdateDraftAnswers | null>(null);
  const value = useMemo<SurveyUpdateSession>(() => ({ answers, setAnswers }), [answers]);

  return (
    <SurveyUpdateSessionContext.Provider value={value}>
      <SurveyDeckSessionProvider>{children}</SurveyDeckSessionProvider>
    </SurveyUpdateSessionContext.Provider>
  );
}

/**
 * provider 가 있으면 그 세션을, 없으면 **컴포넌트 지역** 세션을 쓴다 (단위 테스트처럼 화면만 떼어 렌더할 때 —
 * 온보딩 `useSurveyDeckSession` 과 같은 규칙).
 */
export function useSurveyUpdateSession(): SurveyUpdateSession {
  const provided = useContext(SurveyUpdateSessionContext);
  const [answers, setAnswers] = useState<SurveyUpdateDraftAnswers | null>(null);
  const local = useMemo<SurveyUpdateSession>(() => ({ answers, setAnswers }), [answers]);

  return provided ?? local;
}
