/**
 * 선택한 주 — Stage 7 Spec §2.7 (`C13-S7-6` · `N7-25` · `N7-47`).
 *
 * TopBar 의 chip(`ProgressTopBar` 슬롯)과 본문(`ProgressPage`)은 **형제 route element** 라 React state 를 공유하지 못한다
 * (`TabLayout` 이 둘을 따로 받는다). 그래서 URL query `?week=YYYY-MM-DD` 가 상태를 소유한다:
 * - 없음 = 이번 주 (서버가 계산 — `weekStart` 생략).
 * - 값 = 서버 `availableWeeks` 중 하나. 형식이 날짜가 아니면 무시한다(이번 주). 목록 밖 날짜는 서버가 `VALIDATION_FAILED` 로
 *   거부하고 본문은 오류 상태를 보인다.
 * - 바꿀 때 **history 를 쌓지 않는다** (`replace`) — 뒤로 가기가 주 선택을 되감지 않고 이전 화면으로 간다.
 * - 다른 query(예 dev `?scenario=`)는 보존한다.
 */
import { CalendarDateSchema } from '@haru/contracts';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

import { PROGRESS_WEEK_PARAM } from '../../../shared/config/routes';

export interface SelectedWeek {
  /** 선택한 주 시작일. `undefined` = 이번 주. */
  weekStart: string | undefined;
  /** `undefined` 를 넘기면 이번 주로 돌아간다. */
  selectWeek: (weekStart: string | undefined) => void;
}

export function useSelectedWeek(): SelectedWeek {
  const [params, setParams] = useSearchParams();
  const raw = params.get(PROGRESS_WEEK_PARAM);
  const weekStart = raw !== null && CalendarDateSchema.safeParse(raw).success ? raw : undefined;

  const selectWeek = useCallback(
    (next: string | undefined) => {
      setParams(
        (current) => {
          const updated = new URLSearchParams(current);
          if (next === undefined) updated.delete(PROGRESS_WEEK_PARAM);
          else updated.set(PROGRESS_WEEK_PARAM, next);
          return updated;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { weekStart, selectWeek };
}
