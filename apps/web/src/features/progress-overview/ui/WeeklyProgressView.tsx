/**
 * `WeeklyProgressView` — `/progress` 주간 4블록 (Figma `31:102` `163:2638` 스택 ①~④, Spec §2.1 · §2.8 · §2.9).
 *
 * ```
 * ① StatTile 행   2열 · gap 10 · h84 (`163:2544`) — overflow 없음 (Figma 행 `overflow-clip` 미재현 · `M7-9` · `AD7-11`)
 * ② WeeklyReadingCard  (`163:2551`, Glass Rest)
 * ③ GrowthThemesCard   (`163:2607`, ProfileCard)
 * ④ NotableQuoteCard   (`163:2633`) — `momentOfWeek = null` 이면 미렌더 (Spec §2.8)
 * ```
 *
 * - 이번 주 0 (`empty`) = **레이아웃 유지** + 0 표기 (Spec §2.8 · `N7-48`) — 별도 EmptyState 화면을 만들지 않는다.
 * - Loading = 같은 자리 Skeleton (컨테이너 `aria-busy` + SR *Loading* 1개) · Error/Offline = `ErrorState` + *Try again*.
 *   리포트 카드와 독립이다 (AC-7-29).
 * - 수치는 서버 값 포맷만 (AC-7-21) — 계산 0.
 */
import { ErrorState, Skeleton, StatTile } from '@haru/ui';

import { ProfileCard } from '../../../entities/child-profile';
import { NotableQuoteCard, ReportGlassCard } from '../../../entities/report';
import {
  formatMinuteCount,
  formatMinutes,
  GrowthThemesCard,
  useWeeklyProgress,
  WeeklyReadingCard,
} from '../../../entities/weekly-progress';
import { errorCopyForCode, networkErrorCopy, retryLabel } from '../../../shared/copy/error-copy';
import { progressOverviewCopy as copy } from '../copy';
import { useSelectedWeek } from '../model/useSelectedWeek';
import { growthThemeRows, momentSource, readingSummaryLine, weeklyBars } from '../model/weeklyView';

export function WeeklyProgressView() {
  const { weekStart } = useSelectedWeek();
  const { weekly, isPending, isError, isOffline, errorCode, isRefetching, refetch } =
    useWeeklyProgress({ weekStart });

  if (isError) {
    const message = isOffline ? networkErrorCopy : errorCopyForCode(errorCode);
    return (
      <div className="haru-progress-weekly" data-state="error">
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

  if (isPending || weekly === undefined) return <WeeklySkeleton />;

  const moment = weekly.momentOfWeek;

  return (
    <div className="haru-progress-weekly" data-state="ready">
      <div className="haru-progress-weekly__stats">
        <StatTile
          value={String(weekly.sessionsCount)}
          label={copy.stats.sessions(weekly.sessionsCount)}
        />
        <StatTile value={formatMinuteCount(weekly.minutesTogether)} label={copy.stats.together} />
      </div>
      <WeeklyReadingCard
        title={copy.reading.title}
        total={formatMinutes(weekly.readingSummary.totalMinutes)}
        summary={readingSummaryLine(weekly.readingSummary)}
        bars={weeklyBars(weekly.days)}
        barsLabel={copy.reading.barsLabel}
      />
      <GrowthThemesCard title={copy.growth.title} rows={growthThemeRows(weekly.growthThemes)} />
      {moment === null ? null : (
        <NotableQuoteCard
          eyebrow={copy.moment.eyebrow}
          quote={moment.quote}
          speakerName={moment.speakerName}
          source={momentSource(moment)}
        />
      )}
    </div>
  );
}

/** Spec §2.9 — StatTile 자리 2 · 주간 카드 · Growth (Moment 자리 0). 셸은 실제와 같은 recipe 라 그림자·자리 이동이 없다. */
function WeeklySkeleton() {
  return (
    <div
      className="haru-progress-weekly"
      role="status"
      aria-busy="true"
      aria-label={copy.loading}
      data-state="loading"
    >
      <div className="haru-progress-weekly__stats" aria-hidden="true">
        <span className="haru-progress-weekly__stat-skeleton">
          <Skeleton shape="rect" />
        </span>
        <span className="haru-progress-weekly__stat-skeleton">
          <Skeleton shape="rect" />
        </span>
      </div>
      <ReportGlassCard>
        <Skeleton shape="text" lines={3} />
        <span className="haru-progress-weekly__bars-skeleton">
          <Skeleton shape="rect" />
        </span>
      </ReportGlassCard>
      <ProfileCard as="div">
        <Skeleton shape="text" lines={5} />
      </ProfileCard>
    </div>
  );
}
