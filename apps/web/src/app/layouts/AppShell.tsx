import { AppBackground, AppColumn, ScrollContainerProvider } from '@haru/ui';
import { useRef, type ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
  /**
   * 콘텐츠 스크롤 방식.
   *  - `auto` — 세로 스크롤 (`TabLayout` · `StackLayout`)
   *  - `none` — 스크롤 없이 고정 배치 (`FullscreenLayout`)
   */
  scroll?: 'auto' | 'none';
  /**
   * 화면 하단 인셋 (`S2-FIX-1`).
   *  - `safe` — `env(safe-area-inset-bottom)` 만 (기본)
   *  - `cta`  — `max(safe-bottom, --layout-cta-bottom-gap)` = 웹 44 / iOS 44
   *
   * Figma 44 는 홈 인디케이터를 **포함**하는 값이라 safe-area 와 더하지 않는다
   * (`stage-2-design-spec.md` §16.1 ②·⑤).
   */
  bottomGap?: 'safe' | 'cta';
}

/**
 * 모든 Layout 이 공유하는 화면 골격 (Design Spec §2.2).
 *
 * ```
 * <AppBackground>                  뷰포트 전체 gradient (fixed, aria-hidden)
 *   └ 스크롤/클리핑 뷰포트          뷰포트 **전 폭**, overflow-y: auto
 *       └ <AppColumn>              min 320 / max 480 가운데 정렬 + gutter + safe-area
 *           └ 세로 flex 컬럼       TopBar / 콘텐츠 / 하단 영역
 * ```
 *
 * **스크롤 컨테이너가 앱 컬럼 바깥에 있어야 한다.** `overflow-y: auto` 인 요소는 CSS 규격상
 * `overflow-x` 가 `visible` 로 남을 수 없어(=`auto`) 그 요소가 **가로 클리핑 박스**가 된다.
 * 스크롤 컨테이너를 앱 컬럼 안쪽(= 콘텐츠 폭)에 두면 카드·Sheet 의 그림자
 * (`0 12px 28px` · `0 28px 56px` — 가로로 약 28px 번진다) 가 카드 바로 옆에서 직사각형으로
 * 잘린다. 컬럼 바깥에 두면 클리핑 지점이 뷰포트 끝으로 밀려나 그림자가 gutter 와 컬럼 바깥
 * 배경으로 자연스럽게 이어진다. 회귀 방지: `__tests__/layouts.test.tsx` · `e2e/shadow.spec.ts`.
 *
 * 스크롤 컨테이너 ref 는 `ScrollContainerProvider` 로 아래에 전달한다 (결정 `D-13`).
 * `TopBar` 의 `useScrolledPast` 가 `window` 가 아니라 **이 요소**를 구독해야 스크롤에 따라
 * 배경이 바뀐다 — 스크롤 주체가 window 가 아니기 때문이다 (`stage-1-handoff.md` §18).
 *
 * **스크롤 뷰포트에 `relative` 가 필요하다.** `AppBackground` 는 `position: fixed` + `z-index: 0`
 * 이라 **위치 지정 요소 단계**에서 그려진다. 그 단계는 일반 흐름(non-positioned) 콘텐츠보다
 * 뒤이므로, 뷰포트가 위치 지정 요소가 아니면 그 안의 평범한 텍스트·이미지가 배경에 **덮인다**
 * (배경이 DOM 상 먼저 있어도 그렇다). `relative`(z-index auto) 를 주면 뷰포트도 같은 단계에서
 * DOM 순서상 배경 **뒤에** 그려져 콘텐츠가 보인다.
 * Stage 1 화면은 모든 콘텐츠가 `backdrop-filter` 를 쓰는 Surface 안에 있어(= 스스로 쌓임 맥락을
 * 만들어) 증상이 드러나지 않았다. 회귀 감시: `__tests__/layouts.test.tsx` · `e2e/visual.spec.ts`
 * `s2-welcome`.
 *
 * 높이는 `h-dvh`(100dvh) 다 — 모바일 주소창 때문에 `100vh` 를 쓰지 않는다 (§7.2).
 * 뷰포트와 앱 컬럼은 각각 grid 한 칸으로 세로로 늘어나므로 내부에서 `h-full` 로 flex 컬럼을 만든다.
 */
export function AppShell({ children, scroll = 'auto', bottomGap = 'safe' }: AppShellProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative grid h-dvh">
      <AppBackground />
      <div
        ref={viewportRef}
        data-app-shell-viewport=""
        className={
          scroll === 'auto'
            ? 'relative grid min-h-0 overflow-y-auto overscroll-contain'
            : 'relative grid min-h-0 overflow-hidden'
        }
      >
        <ScrollContainerProvider value={viewportRef}>
          <AppColumn as="div" bottomGap={bottomGap === 'cta'}>
            <div className="flex h-full flex-col">{children}</div>
          </AppColumn>
        </ScrollContainerProvider>
      </div>
    </div>
  );
}
