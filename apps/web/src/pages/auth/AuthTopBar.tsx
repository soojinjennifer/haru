/**
 * `/auth/*` 화면의 TopBar — Design Spec §2.2 · §2.3 · §2.4 · §2.5.
 *
 * Layout 은 `app/router.tsx` 가 씌우므로 TopBar 도 **route element 로 주입**된다
 * (`pages → app` import 금지 — rules/architecture §3). 그래서 TopBar 만 여기에서 만들고
 * router 가 `StackLayout topBar={…}` 로 넘긴다.
 */
import { Icon, IconButton, TopBar } from '@haru/ui';

import { authCopy } from '../../features/auth';
import { useBackNavigation } from '../../shared/hooks/useBackNavigation';

export interface AuthTopBarProps {
  /** 가운데 제목. 주지 않으면 투명 TopBar 다 (로그인 화면). */
  title?: string;
  /** 뒤로 가기 버튼 표시 여부. 메일 링크 진입 화면은 돌아갈 곳이 없어 `false` 다. */
  withBack?: boolean;
}

export function AuthTopBar({ title, withBack = true }: AuthTopBarProps) {
  // Back = 앱 안 기록 있으면 이전 화면, 없으면 논리적 부모로 replace (`VG6-D-12`, Spec §6.3)
  const goBack = useBackNavigation();

  const leading = withBack ? (
    <IconButton
      icon={<Icon name="chevron-left" size="md" decorative />}
      label={authCopy.backLabel}
      variant="plain"
      onPress={() => {
        goBack();
      }}
    />
  ) : undefined;

  return (
    <TopBar
      variant="centered"
      {...(title === undefined ? { transparent: true } : { title })}
      {...(leading === undefined ? {} : { leading })}
    />
  );
}
