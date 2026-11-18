import { Icon, IconButton, TopBar } from '@haru/ui';
import { useNavigate } from 'react-router';

import { growthCapabilityCopy } from '../../features/growth-capability';
import { ROUTES } from '../../shared/config/routes';

/**
 * `/onboarding/growth-capability` TopBar — Spec §2.3 (`variant=centered`, **제목 없음** — 본문 h1 이 제목,
 * leading = 뒤로 → `/onboarding/profile`, `N6-24` ⓐ).
 *
 * 목적지를 경로로 고정한다(`navigate(-1)` 아님) — 새로고침으로 들어와도 프로필로 간다. `replace` 라 프로필 ↔
 * 발전 역량을 오가도 history 가 쌓이지 않고, 제출된 설문(`saved` 이전)으로 돌아갈 길이 생기지 않는다.
 */
export function OnboardingGrowthTopBar() {
  const navigate = useNavigate();

  return (
    <TopBar
      variant="centered"
      leading={
        <IconButton
          icon={<Icon name="chevron-left" size="md" decorative />}
          label={growthCapabilityCopy.onboarding.backLabel}
          variant="plain"
          onPress={() => {
            void navigate(ROUTES.onboarding.profile, { replace: true });
          }}
        />
      }
    />
  );
}
