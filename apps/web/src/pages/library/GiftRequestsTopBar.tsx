import { Icon, IconButton, TopBar } from '@haru/ui';

import { libraryCopy } from '../../shared/copy/library-copy';
import { useBackNavigation } from '../../shared/hooks/useBackNavigation';

/** `/library/gift-requests` TopBar — `AddOwnBookTopBar` 와 같은 규격 (§7.3). */
export function GiftRequestsTopBar() {
  // Back = 앱 안 기록 있으면 이전 화면, 없으면 논리적 부모로 replace (`VG6-D-12`, Spec §6.3)
  const goBack = useBackNavigation();

  return (
    <TopBar
      variant="centered"
      title={libraryCopy.giftRequests.title}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={libraryCopy.giftRequests.back}
          variant="plain"
          onPress={() => {
            goBack();
          }}
        />
      }
    />
  );
}
