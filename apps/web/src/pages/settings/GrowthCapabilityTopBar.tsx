import { Icon, IconButton, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { growthCapabilityCopy } from '../../features/growth-capability';

/**
 * `/settings/growth-capability` TopBar — Spec §2.3 settings (`variant=centered`, title "Growth focus" = h1,
 * leading = 뒤로 `navigate(-1)`). 설정 모드는 이탈 확인이 없다 (`N6-46`). `ProfileTopBar` 와 같은 규격이다.
 */
export function GrowthCapabilityTopBar() {
  const navigate = useNavigate();

  return (
    <TopBar
      variant="centered"
      title={growthCapabilityCopy.settings.topBarTitle}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={growthCapabilityCopy.settings.backLabel}
          variant="plain"
          onPress={() => {
            void navigate(-1);
          }}
        />
      }
    />
  );
}
