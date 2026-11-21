/**
 * `useBackNavigation` — TopBar Back 의 **앱 공통 목적지 규칙** (Stage 8 `VG6-D-12` — `N8-14` · `Q8-17`, Plan §5.4 · Spec §6.3 ·
 * AC-8-40). Stage 7 `D7-7`(리포트 상세 Back) 규칙의 일반화다.
 *
 * | 앱 안 기록 (`hasInAppHistory`) | 이동 |
 * |---|---|
 * | 있음 | `navigate(-steps)` — 앱 안 이전 화면 |
 * | 없음 (직접 URL · 새로고침 · 알림 · 로그인 복귀) | 현재 경로의 논리적 부모(`logicalParentPath`)로 **replace** |
 *
 * `steps` = 이 화면이 history 에 sentinel 항목을 하나 더 쌓아 둔 경우(아이 정보 이탈 확인 `useLeaveGuard`) 2.
 * 시각 변화 0 — Back 버튼은 그대로이고 목적지만 정한다.
 */
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { logicalParentPath } from '../config/routes';
import { hasInAppHistory } from '../lib/in-app-history';

export function useBackNavigation(): (steps?: number) => void {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (steps = 1) => {
      if (hasInAppHistory()) {
        void navigate(-steps);
        return;
      }
      void navigate(logicalParentPath(pathname), { replace: true });
    },
    [navigate, pathname],
  );
}
