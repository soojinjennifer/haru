import { EmptyState } from '@haru/ui';
import { useNavigate } from 'react-router';

import { ROUTES } from '../../shared/config/routes';
import { appCopy } from '../../shared/copy/app-copy';

/**
 * `*` route — Plan §5.4.
 *
 * Page 는 Composition 만 한다. 이동은 router hook 호출 한 줄이다.
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="py-8">
      <EmptyState
        title={appCopy.notFound.title}
        description={appCopy.notFound.description}
        titleAs="h1"
        action={{
          label: appCopy.notFound.actionLabel,
          onPress: () => {
            void navigate(ROUTES.home, { replace: true });
          },
        }}
      />
    </div>
  );
}
