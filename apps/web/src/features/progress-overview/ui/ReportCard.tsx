/**
 * `ReportCard` — 4주 리포트 카드 (Figma `110:835` 발행 상태 + `C13-S7-2` 그 외 상태, Spec §2.2 · §10.2).
 *
 * ```
 * section (aria-labelledby = h2)
 * └─ ReportGlassCard (Glass Rest — `110:835` 도 HTML import · 변수 0, Spec §0.3)
 *    ├─ header  gap 12(Figma 13)  [published 이면 이 행 = 상세 링크 — `N7-37` ⓐ]
 *    │   ├─ IconTile 44 · teal 20% · radius 12(Figma 14) · `file-down` 22 teal  (`T7-8`)
 *    │   └─ text  gap 4: h2 *4-week full report* · 설명(caption-1 secondary) · 보조(caption-2 tertiary)
 *    ├─ progress  ProgressBar **장식 모드** h7 (`T7-9`) — 숫자 span `110:853` 미렌더 (`N7-05` · `AD7-4`)
 *    ├─ action slot (published 만) — PDF 버튼 자리 (`S7-F` 가 page 에서 꽂는다. `S7-C` 에서는 비어 있다)
 *    └─ footer  *Next report on {Mon D}* (caption-2 tertiary · 가운데) — 이메일 문구 0 (`N7-06` · `AD7-3`)
 * ```
 *
 * - 분기는 `resolveReportCardView` (순수 함수, 10칸 단위 테스트 — AC-7-30).
 * - **헤더 링크** (`N7-37` ⓐ, AC-7-33): `latestReport` 를 보여 주는 카드에서만 헤더 행(아이콘 + 텍스트)이 링크다.
 *   카드 셸 전체는 링크가 아니고 링크 안에 버튼이 없다(중첩 인터랙티브 0). 시각 추가 0 — focus ring 만 (pressed 표시는
 *   Spec 이 가리킨 `--opacity-pressed` 토큰이 저장소에 없어 넣지 않았다 — H7-3).
 * - 막대 접근성 (`M7-11`, AC-7-31): `aria-hidden` — `progressbar` role · `aria-valuenow` 0. 정보는 footer · 상태 문장이 전달한다.
 * - 생성 중 = 막대 대신 `Spinner sm` + *This can take a little while.* (`role="status"`).
 */
import { Icon, ProgressBar, Spinner, Text } from '@haru/ui';
import { useId, type ReactNode } from 'react';
import { Link } from 'react-router';

import { ReportGlassCard } from '../../../entities/report';
import { progressReportPath } from '../../../shared/config/routes';
import {
  formatCalendarMonthDay,
  formatCalendarRange,
} from '../../../shared/lib/calendar-date-format';
import { progressOverviewCopy } from '../copy';
import type { ReportCardView } from '../model/resolveReportCardView';

const copy = progressOverviewCopy.reportCard;

export interface ReportCardProps {
  view: ReportCardView;
  /** PDF 액션 slot — 발행 카드에서만 그린다. Page 가 `features/report-pdf` 를 꽂는다 (`S7-F`). */
  pdfAction?: ((reportId: string) => ReactNode) | undefined;
}

interface CardText {
  description: string;
  note: ReactNode;
  progressRatio: number | null;
  nextReportDate: string | null;
}

function textFor(view: ReportCardView): CardText {
  switch (view.kind) {
    case 'published':
      return {
        description: copy.published.description(
          formatCalendarRange(view.report.periodStart, view.report.periodEnd),
        ),
        note: copy.published.note,
        progressRatio: view.progressRatio,
        nextReportDate: view.nextReportDate,
      };
    case 'first-cycle':
      return {
        description: copy.firstCycle.description,
        note: copy.firstCycle.note,
        progressRatio: view.progressRatio,
        nextReportDate: view.nextReportDate,
      };
    case 'generating':
      return {
        description: copy.generating.description(
          formatCalendarRange(view.periodStart, view.periodEnd),
        ),
        note: null,
        progressRatio: null,
        nextReportDate: null,
      };
    case 'deferred':
      return {
        description: copy.deferred.description,
        note: copy.deferred.note,
        progressRatio: view.progressRatio,
        nextReportDate: view.nextReportDate,
      };
    case 'delayed':
      return {
        description: copy.delayed.description,
        note: null,
        progressRatio: null,
        nextReportDate: null,
      };
  }
}

export function ReportCard({ view, pdfAction }: ReportCardProps) {
  const titleId = useId();
  const text = textFor(view);

  const headerContent = (
    <>
      <span className="haru-report-card__icon" aria-hidden="true">
        <Icon name="file-down" size="md" tone="inherit" decorative />
      </span>
      <span className="haru-report-card__text">
        <Text as="h2" id={titleId} variant="subheadline" weight="bold" tone="primary">
          {copy.title}
        </Text>
        <Text as="p" variant="caption-1" tone="secondary">
          {text.description}
        </Text>
        {text.note === null ? null : (
          <Text as="p" variant="caption-2" tone="tertiary">
            {text.note}
          </Text>
        )}
        {view.kind === 'generating' ? (
          <span className="haru-report-card__status" role="status">
            <Spinner size="sm" decorative />
            <Text as="span" variant="caption-2" tone="tertiary">
              {copy.generating.note}
            </Text>
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <section aria-labelledby={titleId} className="haru-report-card" data-state={view.kind}>
      <ReportGlassCard>
        <div className="haru-report-card__body">
          {view.kind === 'published' ? (
            <Link
              to={progressReportPath(view.report.id)}
              className="haru-report-card__header haru-report-card__header--link haru-focus-ring"
              /*
                `D8-3` (`H8-6-N1` · N7-37 개정) — `aria-label` 없음: 이름 = **보이는 내용**(제목 + 범위가 든 설명).
                보이는 제목이 이름 안에 있어야 음성 제어(*"click 4-week full report"*)가 동작한다 (WCAG 2.5.3).
              */
            >
              {headerContent}
            </Link>
          ) : (
            <div className="haru-report-card__header">{headerContent}</div>
          )}

          {text.progressRatio === null ? null : (
            <div className="haru-report-card__progress">
              <ProgressBar decorative value={text.progressRatio} max={1} size="sm" />
            </div>
          )}

          {view.kind === 'published' && pdfAction !== undefined ? pdfAction(view.report.id) : null}

          {text.nextReportDate === null ? null : (
            <Text as="p" variant="caption-2" tone="tertiary" align="center">
              {copy.nextReport(formatCalendarMonthDay(text.nextReportDate))}
            </Text>
          )}
        </div>
      </ReportGlassCard>
    </section>
  );
}
