import { AppBackground, AppColumn } from '@haru/ui';
import type { ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
}

/**
 * 모든 Layout 이 공유하는 화면 골격 (Design Spec §2.2).
 *
 * ```
 * <AppBackground>                  뷰포트 전체 gradient (fixed, aria-hidden)
 *   └ <AppColumn>                  min 320 / max 480 가운데 정렬 + gutter + safe-area
 *       └ 세로 flex 컬럼           TopBar / 스크롤 콘텐츠 / 하단 영역
 * ```
 *
 * 높이는 `h-dvh`(100dvh) 다 — 모바일 주소창 때문에 `100vh` 를 쓰지 않는다 (§7.2).
 * grid 한 칸이 앱 컬럼을 세로로 늘려 주므로 내부에서 `h-full` 로 flex 컬럼을 만든다.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative grid h-dvh">
      <AppBackground />
      <AppColumn as="div">
        <div className="flex h-full flex-col">{children}</div>
      </AppColumn>
    </div>
  );
}
