/**
 * `/onboarding/saved` — Design Spec §2.11 (Figma `179:1809`).
 *
 * "Get started" 의 목적지 = **`/onboarding/profile`** (Stage 6 `D6-1` · Plan R-7 · Spec §2.1 진입).
 * PRD §5.1 ③④ 흐름 `saved → 프로필 결과 → 발전 역량 → Home` 이다. Stage 2 에서는 Home 이었다.
 * **replace** 를 유지한다 — 뒤로 가기로 제출된 설문에 돌아가지 않는다 (`N6-24`). 화면 픽셀 변화 0.
 */
import { Button, Icon, Text } from '@haru/ui';
import { useNavigate } from 'react-router';

import { CharacterIllustration } from '../../../entities/character';
import { ROUTES } from '../../../shared/config/routes';
import { onboardingCopy } from '../copy';

export function OnboardingSaved() {
  const copy = onboardingCopy.saved;
  const navigate = useNavigate();

  return (
    <div className="haru-saved">
      {/* 잔여 여백 A — 일러스트 **위**. 규칙은 `onboarding.css` 가 소유한다 (§2.11). */}
      <div className="haru-saved__spacer haru-saved__spacer--a" />

      <CharacterIllustration asset="hello-heart-full" />

      <div className="haru-saved__title">
        <Text variant="title-1" weight="heavy" tone="primary" align="center" as="h1">
          {copy.title}
        </Text>
      </div>

      {/* 잔여 여백 B — 제목 **아래**. A : B = 3 : 2. */}
      <div className="haru-saved__spacer haru-saved__spacer--b" />

      <div className="haru-saved__cta">
        <Button
          variant="accent"
          size="lg"
          fullWidth
          trailingIcon={<Icon name="chevron-right" decorative />}
          onPress={() => {
            void navigate(ROUTES.onboarding.profile, { replace: true });
          }}
        >
          {copy.cta}
        </Button>
      </div>
    </div>
  );
}
