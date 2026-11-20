/**
 * `useMarkReportViewed` — 리포트 상세 **최초 표시 시 1회** `POST /v1/reports/:reportId/viewed` (C7-7 · PRD §2.3 열람률,
 * Stage 7 `S7-D` · AC-7-44).
 *
 * 1회 보장 (화면 동작 — 서버는 멱등이라 중복이 해롭지는 않다, `P7-BIP-11`):
 *
 * | 경우 | 처리 |
 * |---|---|
 * | 응답 `summary.viewed = true` (이미 열람 · 새로고침 후 재진입) | 보내지 않는다 — 서버가 이미 안다 |
 * | StrictMode 이중 effect · 응답 전 재진입 | 시도 표식 `reportKeys.viewed(id)` 가 있으면 보내지 않는다 |
 * | 성공 | 상세 캐시의 `summary.viewed` 를 `true` 로 · overview · 목록 무효화(같은 플래그를 담는다) |
 * | 실패 | **무시 · 재시도 0** — 열람 기록은 화면 흐름을 막지 않는다. 표식은 남겨 같은 세션에서 다시 보내지 않는다 |
 *
 * UI 변화 0 (Spec §2.3 "viewed — 최초 성공 렌더 시 1회 (UI 변화 0)"). 로그·콘솔 출력 0 (id 포함 금지).
 */
import { useQueryClient } from '@tanstack/react-query';
import type { ReportDetail } from '@haru/contracts';
import { useEffect } from 'react';

import { useApiClients } from '../../shared/api/context';

import { reportKeys } from './reportKeys';

export function useMarkReportViewed(report: ReportDetail | undefined): void {
  const { reports } = useApiClients();
  const queryClient = useQueryClient();
  const reportId = report?.summary.id;
  const alreadyViewed = report?.summary.viewed ?? true;

  useEffect(() => {
    if (reportId === undefined || alreadyViewed) return;
    const marker = reportKeys.viewed(reportId);
    if (queryClient.getQueryData(marker) === true) return;
    queryClient.setQueryData(marker, true);

    reports.markViewed({ reportId }).then(
      () => {
        queryClient.setQueryData<ReportDetail>(reportKeys.detail(reportId), (current) =>
          current === undefined
            ? current
            : { ...current, summary: { ...current.summary, viewed: true } },
        );
        void queryClient.invalidateQueries({ queryKey: [...reportKeys.all, 'overview'] });
        void queryClient.invalidateQueries({ queryKey: [...reportKeys.all, 'list'] });
      },
      () => {
        // 실패 무시 — 재시도 0 (AC-7-44). 오류 내용을 기록하지 않는다 (id · 응답 PII 0).
      },
    );
  }, [alreadyViewed, queryClient, reportId, reports]);
}
