import { EmptyState } from '@haru/ui';

import { progressCopy } from '../../shared/copy/progress-copy';

/**
 * `/progress` — 리포트 준비 안내 (`CONFIRMED (D-2)` · Design Spec §2.13).
 *
 * **진행도 수치·차트·`ReportOverview` 호출이 0건**이다. 진행률 표시는 "3회 중 1회" 같은
 * 달성률 언어로 미끄러지므로 Stage 3 에서는 수치를 아예 넣지 않는다.
 *
 * 하단에 탭바 관련 padding 을 넣지 않는다 (§2.1 이중 계상 금지).
 */
export function ProgressPage() {
  return (
    <div className="flex min-h-full flex-col justify-center py-8">
      <EmptyState
        icon="chart-no-axes-column-increasing"
        title={progressCopy.empty.title}
        description={progressCopy.empty.description}
        titleAs="h2"
      />
    </div>
  );
}
