/**
 * `/onboarding/saved` — Design Spec §2.11 (Figma `179:1809`).
 *
 * **Stage 2 에서 "Get started" 의 목적지는 `/` (Home) 다** (§12.1 권장안 · 이 Step 의 지시).
 * PRD §5.1 ③④(프로필 결과 → 발전 역량)는 **Stage 2-B** 에서 이 사이에 삽입된다.
 * 임시 대기 화면·임시 안내 문구를 만들지 않는다 — 존재하지 않는 상태를 디자인하지 않는다.
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
            void navigate(ROUTES.home, { replace: true });
          }}
        >
          {copy.cta}
        </Button>
      </div>
    </div>
  );
}
