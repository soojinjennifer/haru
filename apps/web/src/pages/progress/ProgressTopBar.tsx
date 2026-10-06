import { TopBar } from '@haru/ui';

import { progressCopy } from '../../shared/copy/progress-copy';

/** `/progress` 헤더 — `TopBar variant="large"` 제목만 (Design Spec §2.13). */
export function ProgressTopBar() {
  return <TopBar variant="large" title={progressCopy.title} />;
}
