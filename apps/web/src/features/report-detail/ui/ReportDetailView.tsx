/**
 * `ReportDetailView` — 4주 리포트 상세 `/progress/reports/:reportId` (Stage 7 `S7-D`, `C13-S7-1` Spec §2.3 · §2.9).
 * Figma 없음 → design-agent 명세 (`D7-3`). 카드 recipe = Stage 6 `ProfileCard`(`163:2607` 근거).
 *
 * ```
 * header      기간 (title-3 bold) · summaryLine (서버)
 * ① ProfileCard  "Growth themes"            다이아몬드 current + previous(점선) · 범례 · 근거 dl
 * ② PersonaHistory                          타임라인 (C13-S7-7)
 * ③ ProfileCard  "How you talked together"  지표 dl 5행 · LATELY WE NOTICED
 * ④ NotableQuoteCard ×1~2                   IN {NAME}'S WORDS
 * ⑤ ProfileCard  "What you noticed"         summaryText · WHAT YOU CHECKED · TOPICS THAT CAME UP
 * ⑥ (slot) 하이라이트 클립 — `S7-E` 가 page 에서 꽂는다. 지금은 비어 있다
 * ⑦ (slot) PDF 액션 — `S7-F` 가 page 에서 꽂는다. 지금은 비어 있다
 * ```
 *
 * - feature 간 import 0 — 클립 플레이어 · PDF 는 **page 가 slot 으로** 조립한다 (Plan §5.1).
 * - 문구: 리포트 문장은 전부 서버 값 그대로 · 화면 문구는 `copy.ts` (AC-7-47).
 * - 숫자: 역량 점수는 차트 형상에만 — 차트·범례·summary·근거 어디에도 점수·증감 숫자 0 (`N7-15`).
 * - 최초 성공 렌더 시 `viewed` 1회 (`useMarkReportViewed` — UI 변화 0).
 * - `R-SHADOW-1`: 모든 카드 = `--shadow-bubble`(번짐 좌우 4 · 아래 10) — 거터 24 · 섹션 간격 20 안. 새 overflow 0.
 */
import { DiamondChart, EmptyState, ErrorState, Skeleton, Text } from '@haru/ui';
import type { ErrorCode, ReportDetail, ReportHighlightClip } from '@haru/contracts';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import {
  CAPABILITY_SCORE_MAX,
  childProfileCopy,
  ProfileCard,
  toCapabilityAxes,
} from '../../../entities/child-profile';
import { NotableQuoteCard, useMarkReportViewed, useReport } from '../../../entities/report';
import { ROUTES } from '../../../shared/config/routes';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { formatCalendarRange } from '../../../shared/lib/calendar-date-format';
import { reportDetailCopy as copy } from '../copy';
import {
  checkTrendRows,
  dialogueRows,
  evidenceRows,
  growthSummary,
  previousDiamondValues,
  quoteSource,
} from '../model/reportDetailView';

import { PersonaHistory } from './PersonaHistory';

export interface ReportDetailViewProps {
  reportId: string;
  /**
   * ⑥ 하이라이트 클립 slot — `S7-E`(`features/highlight-clip-player`)가 page 에서 꽂는다.
   * 미지정 또는 클립 0개 = 섹션 미렌더 (Spec §2.3 ⑥).
   */
  clipList?: ((clips: readonly ReportHighlightClip[]) => ReactNode) | undefined;
  /** ⑦ PDF 액션 slot — `S7-F`(`features/report-pdf`)가 page 에서 꽂는다. 미지정 = 렌더 0. */
  pdfAction?: ((reportId: string) => ReactNode) | undefined;
}

/** `REPORT_NOT_READY` · `REPORT_NOT_ELIGIBLE` = 같은 *Not ready* 화면 (Spec §2.9). */
const NOT_READY_CODES: ReadonlySet<ErrorCode> = new Set([
  'REPORT_NOT_READY',
  'REPORT_NOT_ELIGIBLE',
]);

function SectionLabel({ children }: { children: string }) {
  return (
    <Text as="p" variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
      {children}
    </Text>
  );
}

function DetailSkeleton() {
  return (
    <div
      className="haru-report-detail__body"
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-state="loading"
    >
      <Skeleton shape="text" lines={2} />
      <ProfileCard as="div">
        <span className="haru-report-detail__chart-skeleton">
          <Skeleton shape="rect" />
        </span>
      </ProfileCard>
      <ProfileCard as="div">
        <Skeleton shape="text" lines={5} />
      </ProfileCard>
      <ProfileCard as="div">
        <Skeleton shape="text" lines={5} />
      </ProfileCard>
    </div>
  );
}

function GrowthSection({ report }: { report: ReportDetail }) {
  const change = report.capabilityChange;
  const rows = evidenceRows(change);
  const previous = previousDiamondValues(change);

  return (
    <ProfileCard>
      <div className="contents" data-section="growth">
        <Text as="h2" variant="subheadline" weight="bold" tone="primary">
          {copy.growth.title}
        </Text>
        <DiamondChart
          axes={toCapabilityAxes(change.current)}
          max={CAPABILITY_SCORE_MAX}
          summary={growthSummary(report.childDisplayName, change)}
          missingLabel={childProfileCopy.chart.missingLabel}
          mode="display"
          previous={previous}
          legend={{ previous: copy.growth.legendPrevious, current: copy.growth.legendCurrent }}
        />
        {rows.length > 0 ? (
          <>
            <hr className="m-0 border-0 border-t border-divider" />
            <dl className="haru-report-detail__evidence">
              {rows.map((row) => (
                <div key={row.capability} className="haru-report-detail__evidence-row">
                  <dt>
                    <Text as="span" variant="caption-1" weight="semibold" tone="inherit">
                      <span className="haru-report-detail__row-label">{row.label}</span>
                    </Text>
                  </dt>
                  <dd>
                    <Text as="span" variant="subheadline" tone="primary">
                      {row.evidence}
                    </Text>
                  </dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}
      </div>
    </ProfileCard>
  );
}

function DialogueSection({ report }: { report: ReportDetail }) {
  const metrics = report.dialogueMetrics;

  return (
    <ProfileCard>
      <div className="contents" data-section="dialogue">
        <Text as="h2" variant="subheadline" weight="bold" tone="primary">
          {copy.dialogue.title}
        </Text>
        <dl className="haru-report-detail__metrics">
          {dialogueRows(metrics, report.childDisplayName).map((row) => (
            <div key={row.key} className="haru-report-detail__metric-row">
              <dt>
                <Text as="span" variant="caption-1" weight="semibold" tone="inherit">
                  <span className="haru-report-detail__row-label">{row.label}</span>
                </Text>
              </dt>
              <dd>
                <Text as="span" variant="subheadline" weight="bold" tone="primary" numeric>
                  {row.value}
                </Text>
              </dd>
            </div>
          ))}
        </dl>
        {metrics.recentSignals.length > 0 ? (
          <div className="haru-report-detail__group">
            <SectionLabel>{copy.dialogue.signalsLabel}</SectionLabel>
            <ul className="haru-report-detail__list">
              {metrics.recentSignals.map((signal, index) => (
                // 서버 문장 — 같은 문장이 두 번 올 수 있어 index 를 함께 쓴다
                <li key={`${String(index)}-${signal}`}>
                  <Text as="span" variant="subheadline" tone="primary">
                    {signal}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </ProfileCard>
  );
}

function QuotesSection({ report }: { report: ReportDetail }) {
  return (
    <div className="haru-report-detail__quotes" data-section="quotes">
      {report.notableQuotes.map((quote, index) => (
        <NotableQuoteCard
          key={`${String(index)}-${quote.sessionDate}`}
          eyebrow={copy.quotes.eyebrow(report.childDisplayName)}
          quote={quote.text}
          speakerName={report.childDisplayName}
          source={quoteSource(quote)}
        />
      ))}
    </div>
  );
}

function FeedbackSection({ report }: { report: ReportDetail }) {
  const summary = report.parentFeedbackSummary;
  const trends = checkTrendRows(summary.checkTrends);
  const empty =
    summary.summaryText === null && trends.length === 0 && summary.frequentTopics.length === 0;

  return (
    <ProfileCard>
      <div className="contents" data-section="feedback">
        <Text as="h2" variant="subheadline" weight="bold" tone="primary">
          {copy.feedback.title}
        </Text>
        {empty ? (
          <Text variant="footnote" tone="primary">
            {copy.feedback.empty}
          </Text>
        ) : null}
        {summary.summaryText === null ? null : (
          <Text variant="subheadline" tone="primary">
            {summary.summaryText}
          </Text>
        )}
        {trends.length > 0 ? (
          <div className="haru-report-detail__group">
            <SectionLabel>{copy.feedback.checkedLabel}</SectionLabel>
            <ul className="haru-report-detail__trends">
              {trends.map((row) => (
                <li key={row.key} className="haru-report-detail__trend-row">
                  <Text as="span" variant="caption-1" weight="semibold" tone="inherit">
                    <span className="haru-report-detail__row-label">{row.label}</span>
                    <span className="haru-visually-hidden">{row.spoken}</span>
                  </Text>
                  {/* 메타 = secondary — C-13 화면의 정보성 보조 텍스트 (`VG7-D-08` ⓑ · `D7-6` ④) */}
                  <span aria-hidden="true">
                    <Text as="span" variant="caption-1" weight="medium" tone="secondary" numeric>
                      {row.meta}
                    </Text>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {summary.frequentTopics.length > 0 ? (
          <div className="haru-report-detail__group">
            <SectionLabel>{copy.feedback.topicsLabel}</SectionLabel>
            <Text variant="subheadline" tone="primary">
              {summary.frequentTopics.join(copy.feedback.topicsJoin)}
            </Text>
          </div>
        ) : null}
      </div>
    </ProfileCard>
  );
}

function DetailContent({
  report,
  clipList,
  pdfAction,
}: { report: ReportDetail } & Omit<ReportDetailViewProps, 'reportId'>) {
  useMarkReportViewed(report);
  const clips = report.highlightClips;

  return (
    <div className="haru-report-detail__body" data-state="ready">
      <header className="haru-report-detail__header">
        <Text as="p" variant="title-3" weight="bold" tone="primary">
          {formatCalendarRange(report.summary.periodStart, report.summary.periodEnd)}
        </Text>
        <Text as="p" variant="subheadline" tone="primary">
          {report.summary.summaryLine}
        </Text>
      </header>
      <GrowthSection report={report} />
      <PersonaHistory firstName={report.childDisplayName} history={report.personaHistory} />
      <DialogueSection report={report} />
      <QuotesSection report={report} />
      <FeedbackSection report={report} />
      {clipList !== undefined && clips.length > 0 ? clipList(clips) : null}
      {pdfAction === undefined ? null : (
        <div className="haru-report-detail__pdf">{pdfAction(report.summary.id)}</div>
      )}
    </div>
  );
}

export function ReportDetailView({ reportId, clipList, pdfAction }: ReportDetailViewProps) {
  const navigate = useNavigate();
  const { report, isPending, isError, errorCode, isOffline, isRefetching, refetch } =
    useReport(reportId);
  const backToProgress = () => {
    void navigate(ROUTES.progress);
  };

  let body: ReactNode;
  if (isError && errorCode !== undefined && NOT_READY_CODES.has(errorCode)) {
    body = (
      <div data-state="not-ready">
        <EmptyState
          icon="clock"
          title={copy.notReady.title}
          description={copy.notReady.description}
          titleAs="h2"
          action={{ label: copy.backToProgress, onPress: backToProgress }}
        />
      </div>
    );
  } else if (isError && errorCode === 'RESOURCE_NOT_FOUND') {
    body = (
      <div data-state="not-found">
        <ErrorState
          title={copy.notFound.title}
          tone="error"
          titleAs="h2"
          retryLabel={copy.backToProgress}
          onRetry={backToProgress}
        />
      </div>
    );
  } else if (isError) {
    const message = isOffline ? networkErrorCopy : errorCopyForCode(errorCode);
    body = (
      <div data-state="error">
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
  } else if (isPending || report === undefined) {
    body = <DetailSkeleton />;
  } else {
    body = <DetailContent report={report} clipList={clipList} pdfAction={pdfAction} />;
  }

  return <div className="haru-report-detail">{body}</div>;
}
