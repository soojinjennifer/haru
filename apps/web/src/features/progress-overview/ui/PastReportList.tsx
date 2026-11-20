/**
 * `PastReportList` — 과거 리포트 목록 (`C13-S7-5`, Spec §2.4 · `N7-11` ⓐ · `N7-35` ⓐ · `N7-38`).
 *
 * ```
 * section (SR 전용 h2 *Past reports*)
 * ├─ SectionLabel *PAST REPORTS* (Stage 6 recipe — caption-1 · secondary · bold · tracking section-label, aria-hidden)
 * └─ ListGroup *Past reports*
 *     └─ ListRow ×N  title = 기간 · subtitle = summaryLine(2줄 clamp — 기존 `Text truncate=2`, 새 overflow 0) · chevron
 *    + (nextCursor) TextLink *Show earlier reports* → 다음 페이지 append
 * ```
 *
 * - 표시 여부 · 제외 대상은 부모가 `resolvePastReportListRule` 로 정한다 (route 없음 — 같은 화면).
 * - 미열람 배지 0 (Figma·PRD 근거 없음). `summaryLine` = 서버 문장 그대로.
 * - Loading = Skeleton 2행 · Error = `InlineAlert` + *Try again* (카드 영역 보존).
 * - `R-SHADOW-1`: `ListGroup` = `--shadow-bubble`(좌우 4 · 아래 10) — 새 overflow 0.
 */
import { Icon, InlineAlert, ListGroup, ListRow, Skeleton, Text, TextLink } from '@haru/ui';
import { useId } from 'react';
import { useNavigate } from 'react-router';

import { useReportList } from '../../../entities/report';
import { progressReportPath } from '../../../shared/config/routes';
import { retryLabel } from '../../../shared/copy/error-copy';
import { formatCalendarRange } from '../../../shared/lib/calendar-date-format';
import { progressOverviewCopy } from '../copy';

const copy = progressOverviewCopy.pastReports;

export interface PastReportListProps {
  /** 카드가 보여 주는 리포트 — 목록에서 뺀다 (카드와 중복 0). */
  excludeId: string | null;
  /** overview 의 `latestReport.id` — 목록 캐시 키. */
  latestId: string | null;
}

export function PastReportList({ excludeId, latestId }: PastReportListProps) {
  const headingId = useId();
  const navigate = useNavigate();
  const list = useReportList({ enabled: true, latestId });
  const items = list.reports.filter((report) => report.id !== excludeId);

  if (!list.isPending && !list.isError && items.length === 0) return null;

  return (
    <section className="haru-past-reports" aria-labelledby={headingId}>
      <h2 id={headingId} className="haru-visually-hidden">
        {copy.heading}
      </h2>
      <Text as="p" variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
        <span aria-hidden="true">{copy.sectionLabel}</span>
      </Text>

      {list.isError ? (
        <InlineAlert
          tone="error"
          title={copy.errorTitle}
          action={{ label: retryLabel, onPress: list.refetch }}
        />
      ) : list.isPending ? (
        <div
          className="haru-past-reports__loading"
          role="status"
          aria-busy="true"
          aria-label={progressOverviewCopy.loading}
        >
          <Skeleton shape="text" lines={2} />
          <Skeleton shape="text" lines={2} />
        </div>
      ) : (
        <ListGroup label={copy.listLabel}>
          {items.map((report) => (
            <ListRow
              key={report.id}
              title={formatCalendarRange(report.periodStart, report.periodEnd)}
              subtitle={
                <Text as="span" variant="caption-1" tone="secondary" truncate={2}>
                  {report.summaryLine}
                </Text>
              }
              trailing={
                <span className="haru-past-reports__chevron">
                  <Icon name="chevron-right" size="sm" tone="inherit" decorative />
                </span>
              }
              onPress={() => {
                void navigate(progressReportPath(report.id));
              }}
            />
          ))}
        </ListGroup>
      )}

      {list.hasNextPage && !list.isError ? (
        <div className="haru-past-reports__more">
          <TextLink onPress={list.fetchNextPage}>{copy.showEarlier}</TextLink>
        </div>
      ) : null}
    </section>
  );
}
