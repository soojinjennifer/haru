import { Icon, IconButton, TopBar } from '@haru/ui';

import { reportDetailCopy } from '../../features/report-detail';
import { useBackNavigation } from '../../shared/hooks/useBackNavigation';

/**
 * `/progress/reports/:reportId` TopBar — Spec §2.3 (`variant=centered`, title *"4-week report"* = h1, leading = Back).
 * `ProfileTopBar` 와 같은 규격이다.
 *
 * Back 목적지 (`N7-23` → Stage 8 `VG6-D-12` 앱 공통 규칙 `useBackNavigation`): 앱 안 이전 화면이 있으면 그곳(`navigate(-1)`),
 * deep link 로 바로 들어와 이전 기록이 없으면 논리적 부모 `/progress` (replace — 뒤로 가기 루프 0, Spec §6.3).
 */
export function ReportDetailTopBar() {
  // Back = 앱 안 기록 있으면 이전 화면, 없으면 논리적 부모로 replace (`VG6-D-12`, Spec §6.3)
  const goBack = useBackNavigation();

  return (
    <TopBar
      variant="centered"
      title={reportDetailCopy.topBarTitle}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={reportDetailCopy.backLabel}
          variant="plain"
          onPress={() => {
            goBack();
          }}
        />
      }
    />
  );
}
