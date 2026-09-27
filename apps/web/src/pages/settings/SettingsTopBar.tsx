import { Icon, IconButton, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { settingsCopy } from '../../features/settings';

/**
 * `/settings` TopBar — Design Spec §2.14 (`variant=centered`, leading = 뒤로, title = "Settings").
 *
 * Layout 은 `app/router.tsx` 가 씌우므로 TopBar 도 route element 로 주입된다
 * (`pages → app` import 금지 — rules/architecture §3).
 */
export function SettingsTopBar() {
  const navigate = useNavigate();

  return (
    <TopBar
      variant="centered"
      title={settingsCopy.title}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={settingsCopy.backLabel}
          variant="plain"
          onPress={() => {
            void navigate(-1);
          }}
        />
      }
    />
  );
}
