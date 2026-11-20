import { Icon, IconButton, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { reportDetailCopy } from '../../features/report-detail';
import { ROUTES } from '../../shared/config/routes';
import { hasInAppHistory } from '../../shared/lib/in-app-history';

/**
 * `/progress/reports/:reportId` TopBar — Spec §2.3 (`variant=centered`, title *"4-week report"* = h1, leading = Back).
 * `ProfileTopBar` 와 같은 규격이다.
 *
 * Back 목적지 (`N7-23` — `VG6-D-12` 앱 전체 결정 전 임시 규칙): 앱 안 이전 화면이 있으면 그곳(`navigate(-1)`),
 * deep link 로 바로 들어와 이전 기록이 없으면 `/progress` (replace — 뒤로 가기 루프 0).
 */
export function ReportDetailTopBar() {
  const navigate = useNavigate();

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
            if (hasInAppHistory()) {
              void navigate(-1);
            } else {
              void navigate(ROUTES.progress, { replace: true });
            }
          }}
        />
      }
    />
  );
}
