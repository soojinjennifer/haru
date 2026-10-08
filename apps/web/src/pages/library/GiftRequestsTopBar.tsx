import { Icon, IconButton, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { libraryCopy } from '../../shared/copy/library-copy';

/** `/library/gift-requests` TopBar — `AddOwnBookTopBar` 와 같은 규격 (§7.3). */
export function GiftRequestsTopBar() {
  const navigate = useNavigate();

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
            void navigate(-1);
          }}
        />
      }
    />
  );
}
