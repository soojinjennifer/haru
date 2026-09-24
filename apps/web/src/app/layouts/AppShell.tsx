import { AppBackground, AppColumn } from '@haru/ui';
import type { ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
  /**
   * 콘텐츠 스크롤 방식.
   *  - `auto` — 세로 스크롤 (`TabLayout` · `StackLayout`)
   *  - `none` — 스크롤 없이 고정 배치 (`FullscreenLayout`)
   */
  scroll?: 'auto' | 'none';
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
 * 높이는 `h-dvh`(100dvh) 다 — 모바일 주소창 때문에 `100vh` 를 쓰지 않는다 (§7.2).
 * 뷰포트와 앱 컬럼은 각각 grid 한 칸으로 세로로 늘어나므로 내부에서 `h-full` 로 flex 컬럼을 만든다.
 */
export function AppShell({ children, scroll = 'auto' }: AppShellProps) {
  return (
    <div className="relative grid h-dvh">
      <AppBackground />
      <div
        data-app-shell-viewport=""
        className={
          scroll === 'auto'
            ? 'grid min-h-0 overflow-y-auto overscroll-contain'
            : 'grid min-h-0 overflow-hidden'
        }
      >
        <AppColumn as="div">
          <div className="flex h-full flex-col">{children}</div>
        </AppColumn>
      </div>
    </div>
  );
}
