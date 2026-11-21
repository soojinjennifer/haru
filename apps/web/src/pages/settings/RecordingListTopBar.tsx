import { Icon, IconButton, TopBar } from '@haru/ui';

import { recordingDeletionCopy } from '../../features/recording-deletion';
import { useBackNavigation } from '../../shared/hooks/useBackNavigation';

/**
 * `/settings/data/recordings` TopBar — Stage 8 Spec §2.3 (title "Session recordings" = h1).
 *
 * Back = 앱 안 기록이 있으면 `navigate(-1)`, 없으면(직접 URL · 새로고침) 논리적 부모 `/settings/data` 로 replace
 * (Spec §6.3 부모 표 — `N8-14` · `Q8-17`, 시각 변화 0). 설정 TopBar 와 같은 규격(`centered` · h1 · glass Back).
 */
export function RecordingListTopBar() {
  // Back = 앱 안 기록 있으면 이전 화면, 없으면 논리적 부모로 replace (`VG6-D-12`, Spec §6.3)
  const goBack = useBackNavigation();

  return (
    <TopBar
      variant="centered"
      title={recordingDeletionCopy.title}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={recordingDeletionCopy.backLabel}
          variant="plain"
          onPress={() => {
            goBack();
          }}
        />
      }
    />
  );
}
