/**
 * 전체 삭제 감시자 → Route Guard 대기 신호 (Stage 8 `N8-31` ⓐ, Plan §5.7 "RouteGuard 판정 앞").
 *
 * 감시자(`DataDeletionWatcher`)가 기기 표시된 요청의 첫 조회 · 완료 정리를 마치기 전에는 `true` — Guard 가 기존 pending 표현으로
 * 기다린다(새 UI 0). Provider 밖(단위 테스트의 단독 Guard)에서는 `false` = 기존 동작 그대로.
 */
import { createContext, use } from 'react';

export const DataDeletionHoldContext = createContext(false);

export function useDataDeletionGuardHold(): boolean {
  return use(DataDeletionHoldContext);
}
