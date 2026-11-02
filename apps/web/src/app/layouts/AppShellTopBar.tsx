import { useToastTopBarInset } from '@haru/ui';
import { useRef, type ReactNode } from 'react';

export interface AppShellTopBarProps {
  children: ReactNode;
}

/**
 * 화면 상단 고정 슬롯 — `TabLayout` · `StackLayout` · `FullscreenLayout` 공용.
 *
 * `position: sticky` 와 z-index 는 `app-shell.css` 의 `.haru-app-shell__bar-top` 이 소유한다.
 * 이 컴포넌트가 따로 있는 이유는 **Toast 상단 보정의 등록 지점이 한 곳이어야** 하기 때문이다.
 *
 * ── Toast 상단 보정의 소유자가 여기다 (사용자 결정 2026-10-10) ──
 * `ToastProvider` 는 router 바깥(앱 조립 지점)에 한 번 마운트되므로 현재 화면에 TopBar 가
 * 있는지, 몇 px 인지 모른다. 하단 시절에는 그 자리가 `withTabBar` **prop** 이었고 아무도
 * 넘길 수 없어 보정 CSS 가 도달 불가 코드였다 — Toast 가 탭 3개를 50px 덮었다 (`QA-3-004`,
 * approvals §26.2). Toast 가 상단으로 옮겨진 뒤에도 그 메커니즘은 **대상만 바뀌어** 필요하다
 * (탭바 → TopBar). 그래서 TopBar 슬롯을 실제로 렌더하는 지점에서 등록한다.
 *
 * 등록 대상은 `TopBar` 자체가 아니라 **이 래퍼**다. Home 처럼 래퍼가 상단 여백을 더하는 화면
 * (`.haru-home-top-bar` + 10)이 있어서, 실제로 가릴 수 있는 띠는 래퍼 높이다
 * (2026-10-10 실측: `/auth/log-in` 40 · `/` 48).
 *
 * 예외: 완료 화면(`/session/:id/complete`)은 슬롯 없이 feature 가 닫기 줄을 직접 등록한다 (`D4-89`,
 * `SessionCompleteScreen` 의 `CompleteCloseBar` 주석).
 *
 * ⚠ `/onboarding/:step` 은 TopBar 를 feature 가 `main` 안에서 렌더하므로 이 슬롯을 쓰지 않는다
 * — 그 화면에 Toast 를 띄우는 코드가 생기면 보정이 걸리지 않는다 (`stage-3-handoff.md` 기록).
 */
export function AppShellTopBar({ children }: AppShellTopBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  useToastTopBarInset(ref);

  return (
    <div ref={ref} className="haru-app-shell__bar-top shrink-0">
      {children}
    </div>
  );
}
