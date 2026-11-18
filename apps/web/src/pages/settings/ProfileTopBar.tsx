import { Icon, IconButton, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { childProfileViewCopy } from '../../features/child-profile-view';

/**
 * `/settings/profile` TopBar — Spec §2.2 (`variant=centered`, title "Profile" = h1, leading = 뒤로 `navigate(-1)`).
 * 설정 TopBar(`SettingsTopBar`)와 같은 규격이다.
 */
export function ProfileTopBar() {
  const navigate = useNavigate();

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
            void navigate(-1);
          }}
        />
      }
    />
  );
}
