/**
 * `DataDeletionWatcher` — 화면 밖 전체 삭제 완료 감지 **감시자 1곳** (Stage 8 `N8-31` ⓐ — `D8-2` ①, Plan rev 2.2 §5.7).
 *
 * 앱 조립 지점(QueryProvider · ApiClient · Auth · Toast · 녹음 환경 **안쪽**, Router · RouteGuard **바깥**)에 한 번 마운트한다.
 * 감지 · 정리 · Toast 는 `features/data-management` `useDataDeletionWatch` 가 하고, 여기서는 Guard 대기 신호만 공급한다.
 */
import type { ReactNode } from 'react';

import {
  useDataDeletionWatch,
  type UseDataDeletionWatchOptions,
} from '../../features/data-management';

import { DataDeletionHoldContext } from './dataDeletionHold';

export interface DataDeletionWatcherProps extends UseDataDeletionWatchOptions {
  children: ReactNode;
}

export function DataDeletionWatcher({ children, ...options }: DataDeletionWatcherProps) {
  const { holdGuard } = useDataDeletionWatch(options);
  return <DataDeletionHoldContext value={holdGuard}>{children}</DataDeletionHoldContext>;
}
