import { TopBar } from '@haru/ui';

import { progressOverviewCopy, WeekPickerChip } from '../../features/progress-overview';

/**
 * `/progress` 헤더 — Figma `31:115` (제목 *Progress* Heavy 28 + 주 선택 chip `31:118`, Spec §2.1 · §3.2).
 *
 * 기존 `TopBar variant="large"` 그대로 — 제목 행은 y0(Figma y10)이며 `/library` 와 같은 기존 규칙이다.
 * chip 은 본문과 같은 주를 URL(`?week=`)로 공유한다 (`useSelectedWeek`).
 */
export function ProgressTopBar() {
  return (
    <TopBar variant="large" title={progressOverviewCopy.title} trailing={<WeekPickerChip />} />
  );
}
