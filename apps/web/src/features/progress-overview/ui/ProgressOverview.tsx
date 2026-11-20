/**
 * `ProgressOverview` — `/progress` 본문 조립 (Figma `31:102` + `110:835`, Spec §2.1 · `D7-1`).
 *
 * ```
 * 393×852 (Web y = Figma y − 56)
 *   0– 40  TopBar large (`ProgressTopBar` — 기존 공유 TopBar, 제목 행 y0. Figma 는 y10 — Library 와 같은 기존 규칙)
 *  14      캐릭터 `163:2642` 347×422 (흐름 밖 장식 레이어 · aria-hidden)
 * 290      본문 스택 `163:2638` (캐릭터 top + 276 = 높이 × (1 − 0.346))   gap 14
 *            ① StatTile ×2 → ② This week's reading → ③ Growth themes → ④ Moment of the week
 *            → 4주 리포트 카드 (`110:835`, `D7-1`) → 과거 리포트 (`C13-S7-5`, 조건부)
 * ```
 *
 * - `110:522` 의 달력 · Minutes per week · 통계 3칸은 없다 (`D7-1`).
 * - 주간(weekly)과 리포트(overview)는 **독립 쿼리** — 한쪽 Loading/Error 가 다른 쪽을 가리지 않는다 (AC-7-29).
 * - **새 `overflow` 선언 0** — 스크롤은 `AppShell` 뷰포트(앱 컬럼 바깥, 뷰포트 전 폭). Glass Rest 카드 2장의 번짐(좌우
 *   28~32 · 위 22 · 아래 77)은 그 한 박스 안에서 겹쳐 그려질 뿐이다 (`R-SHADOW-1` — `e2e/progress.spec.ts` 프로브).
 * - 하단 여백 추가 0 — 탭바 래퍼가 overhang 여백을 소유한다 (Spec §2.1 "이중 계상 금지").
 *
 * PDF 버튼 자리는 slot 이다 — `features/A → features/B` import 금지라 Page 가 `features/report-pdf` 를 꽂는다 (`S7-F`).
 */
import { ErrorState, Skeleton } from '@haru/ui';
import type { ReactNode } from 'react';

import { ReportGlassCard, useReportOverview } from '../../../entities/report';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { progressOverviewCopy } from '../copy';
import { resolvePastReportListRule, resolveReportCardView } from '../model/resolveReportCardView';

import { PastReportList } from './PastReportList';
import { ProgressCharacter } from './ProgressCharacter';
import { ReportCard } from './ReportCard';
import { WeeklyProgressView } from './WeeklyProgressView';

export interface ProgressOverviewProps {
  /** 발행 리포트 카드의 PDF 액션 (`S7-F`). 없으면 그 자리가 비어 있다. */
  pdfAction?: ((reportId: string) => ReactNode) | undefined;
}

export function ProgressOverview({ pdfAction }: ProgressOverviewProps) {
  return (
    <div className="haru-progress-overview">
      <ProgressCharacter />
      <div className="haru-progress-overview__stack">
        <WeeklyProgressView />
        <ReportSection pdfAction={pdfAction} />
      </div>
    </div>
  );
}

function ReportSection({ pdfAction }: ProgressOverviewProps) {
  const { overview, isPending, isError, isOffline, errorCode, isRefetching, refetch } =
    useReportOverview();

  if (isError) {
    const message = isOffline ? networkErrorCopy : errorCopyForCode(errorCode);
    return (
      // `ErrorState` 가 이미 카드 면(Surface)을 그린다 — 카드 셸을 한 겹 더 두르면 카드 안 카드가 된다 (주간 오류와 같은 모양).
      <div className="haru-report-card" data-state="error">
        <ErrorState
          title={message.title}
          description={message.description}
          tone={isOffline ? 'offline' : 'error'}
          titleAs="h2"
          retryLabel={retryLabel}
          retrying={isRefetching}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (isPending || overview === undefined) {
    return (
      <div
        className="haru-report-card"
        role="status"
        aria-busy="true"
        aria-label={progressOverviewCopy.loading}
        data-state="loading"
      >
        <ReportGlassCard>
          <div className="haru-report-card__body" aria-hidden="true">
            <Skeleton shape="text" lines={4} />
          </div>
        </ReportGlassCard>
      </div>
    );
  }

  const view = resolveReportCardView(overview);
  const pastRule = resolvePastReportListRule(view, overview.reportCount);

  return (
    <>
      <ReportCard view={view} pdfAction={pdfAction} />
      {pastRule.visible ? (
        <PastReportList
          excludeId={pastRule.excludeId}
          latestId={overview.latestReport?.id ?? null}
        />
      ) : null}
    </>
  );
}
