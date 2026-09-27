import { createContext, useContext, type ReactNode, type RefObject } from 'react';

/**
 * 앱의 세로 스크롤 컨테이너 ref — 결정 `D-13` (stage-2-approvals §4).
 *
 * 스크롤 주체는 `window` 가 아니라 `AppShell` 의 뷰포트 `div` 다 (앱 컬럼 **바깥**에 있는
 * `overflow-y: auto` 요소 — Stage 1 §2.2). `TopBar` 처럼 스크롤 위치를 봐야 하는
 * `packages/ui` 컴포넌트가 그 요소를 알 수 있도록 ref 를 context 로 전달한다.
 * Provider 가 없으면(갤러리·테스트·문서 페이지) `window` 로 폴백한다.
 */
const ScrollContainerContext = createContext<RefObject<HTMLElement | null> | null>(null);

export interface ScrollContainerProviderProps {
  /** 스크롤 컨테이너 요소의 ref. */
  value: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export function ScrollContainerProvider({ value, children }: ScrollContainerProviderProps) {
  return <ScrollContainerContext value={value}>{children}</ScrollContainerContext>;
}

/** 스크롤 컨테이너 ref. Provider 가 없으면 `null` (= `window` 폴백). */
export function useScrollContainerRef(): RefObject<HTMLElement | null> | null {
  return useContext(ScrollContainerContext);
}
