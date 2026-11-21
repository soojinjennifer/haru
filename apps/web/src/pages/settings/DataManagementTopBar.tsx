import { Icon, IconButton, TopBar } from '@haru/ui';

import { dataManagementCopy } from '../../features/data-management';
import { useBackNavigation } from '../../shared/hooks/useBackNavigation';

/**
 * `/settings/data` TopBar — Stage 8 Spec §2.2 (title "Data & privacy" = h1).
 *
 * Back = 앱 안 기록이 있으면 `navigate(-1)`, 없으면(직접 URL · 새로고침) 논리적 부모 `/settings` 로 replace
 * (Spec §6.3 부모 표 — `N8-14` · `Q8-17`, 시각 변화 0). 설정 TopBar 와 같은 규격(`centered` · h1 · glass Back).
 */
export function DataManagementTopBar() {
  // Back = 앱 안 기록 있으면 이전 화면, 없으면 논리적 부모로 replace (`VG6-D-12`, Spec §6.3)
  const goBack = useBackNavigation();

  return (
    <TopBar
      variant="centered"
      title={dataManagementCopy.title}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={dataManagementCopy.backLabel}
          variant="plain"
          onPress={() => {
            goBack();
          }}
        />
      }
    />
  );
}
