import { Icon, IconButton, TopBar } from '@haru/ui';

import { childInfoEditCopy, useChildInfoEditBack } from '../../features/child-profile-edit';

/**
 * `/settings/child` TopBar — Spec §2.5 (`variant=centered`, title "Child info" = h1).
 * 뒤로는 폼에 묻는다 — 변경이 있으면 확인 Dialog (`N6-14` ⓐ). 설정 TopBar 와 같은 규격이다.
 */
export function ChildInfoEditTopBar() {
  const back = useChildInfoEditBack();

  return (
    <TopBar
      variant="centered"
      title={childInfoEditCopy.title}
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={childInfoEditCopy.backLabel}
          variant="plain"
          onPress={back}
        />
      }
    />
  );
}
