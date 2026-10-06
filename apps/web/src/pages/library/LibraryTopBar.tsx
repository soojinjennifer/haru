import { TopBar } from '@haru/ui';

import { HomeWeekSummary } from '../../features/home-overview';
import { libraryCopy } from '../../shared/copy/library-copy';

/**
 * `/library` 헤더 — Design Spec §2.7 (Figma `30:74` 제목 행 + `30:91` chip).
 *
 * trailing 의 주간 집계 칩은 **Home 과 같은 값·같은 창**을 쓴다 (§5.7 사용처).
 */
export function LibraryTopBar() {
  return <TopBar variant="large" title={libraryCopy.title} trailing={<HomeWeekSummary />} />;
}
