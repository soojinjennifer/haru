import { Icon, IconButton, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { libraryCopy } from '../../shared/copy/library-copy';

/**
 * `/library/add` TopBar — `variant=centered` + 뒤로 (Library Design Spec §7.2).
 *
 * Design Spec 은 `variant=default` 로 적지만 `TopBarVariant` 에 그 값이 **없다**
 * (`inline` · `centered` · `large` · `pill`). `/settings` 와 같은 **하위 스택 화면**이므로
 * 같은 `centered` 를 쓴다 — Library 전용 헤더 모양을 새로 만들지 않는다.
 *
 * Layout 은 `app/router.tsx` 가 씌운다 (`pages → app` import 금지 — rules/architecture §3).
 */
export function AddOwnBookTopBar() {
  const navigate = useNavigate();

  return (
    <TopBar
      variant="centered"
      title={libraryCopy.add.title}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={libraryCopy.add.back}
          variant="plain"
          onPress={() => {
            void navigate(-1);
          }}
        />
      }
    />
  );
}
