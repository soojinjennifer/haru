/**
 * `HomeWeekSummary` — TopBar trailing 의 주간 집계 칩 (Design Spec §2.2 · §5.7).
 *
 * `/` 와 `/library` 가 **같은 값·같은 창**을 쓰므로 데이터 연결을 여기 한 곳에 둔다.
 * 집계가 아직 없으면 **아무것도 렌더하지 않는다** — 헤더에 자리만 차지하는 placeholder 를
 * 만들지 않는다 (빈 슬롯 규칙). 이 쿼리는 헤더 표시를 blocking 하지 않는다 (AC-3-14).
 */
import { useHomeSummary, WeekSummaryChip } from '../../../entities/home';
import { homeOverviewCopy } from '../copy';

export function HomeWeekSummary() {
  const { summary } = useHomeSummary();

  if (summary === undefined) return null;

  const count = summary.sessionsThisWeek;

  return (
    <WeekSummaryChip
      label={homeOverviewCopy.weekSummary.label(count)}
      accessibleLabel={homeOverviewCopy.weekSummary.accessibleLabel(count)}
    />
  );
}
