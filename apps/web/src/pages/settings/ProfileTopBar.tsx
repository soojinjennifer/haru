import { Icon, IconButton, TopBar } from '@haru/ui';

import { childProfileViewCopy } from '../../features/child-profile-view';
import { useBackNavigation } from '../../shared/hooks/useBackNavigation';

/**
 * `/settings/profile` TopBar — Spec §2.2 (`variant=centered`, title "Profile" = h1, leading = 뒤로 `navigate(-1)`).
 * 설정 TopBar(`SettingsTopBar`)와 같은 규격이다.
 */
export function ProfileTopBar() {
  // Back = 앱 안 기록 있으면 이전 화면, 없으면 논리적 부모로 replace (`VG6-D-12`, Spec §6.3)
  const goBack = useBackNavigation();

  return (
    <TopBar
      variant="centered"
      title={childProfileViewCopy.revisit.topBarTitle}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={childProfileViewCopy.revisit.backLabel}
          variant="plain"
          onPress={() => {
            goBack();
          }}
        />
      }
    />
  );
}
