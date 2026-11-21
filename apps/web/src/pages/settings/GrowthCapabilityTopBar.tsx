import { Icon, IconButton, TopBar } from '@haru/ui';

import { growthCapabilityCopy } from '../../features/growth-capability';
import { useBackNavigation } from '../../shared/hooks/useBackNavigation';

/**
 * `/settings/growth-capability` TopBar — Spec §2.3 settings (`variant=centered`, title "Growth focus" = h1,
 * leading = 뒤로 `navigate(-1)`). 설정 모드는 이탈 확인이 없다 (`N6-46`). `ProfileTopBar` 와 같은 규격이다.
 */
export function GrowthCapabilityTopBar() {
  // Back = 앱 안 기록 있으면 이전 화면, 없으면 논리적 부모로 replace (`VG6-D-12`, Spec §6.3)
  const goBack = useBackNavigation();

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
            goBack();
          }}
        />
      }
    />
  );
}
