/**
 * `/auth/log-in` — Design Spec §2.3 (Figma `179:1820`).
 *
 * Figma 에는 Apple 버튼이 없다 — 추가는 **의도된 차이**다 (`AD-S2-2`, C-13).
 * 로그인 성공 후 이동은 Guard 판정에 맡긴다. 목적지는 복귀 경로(미인증 때 가려던 앱 안 경로 — AC-7-46) 또는 Home 이다.
 *
 * 세로 간격 (2026-09-27 개정 2 · §2.3): 부제 → 소셜 버튼만 `--space-10`(40, Figma 38)이고
 * 소셜 ↔ divider ↔ 폼 ↔ 가입 유도는 `--space-6`(24) 다. 그래서 하단 4개를 한 칼럼으로 묶는다.
 */
import { DividerWithLabel, Text, TextLink } from '@haru/ui';
import { useNavigate } from 'react-router';

import { CharacterMedallion } from '../../entities/character';
import { authCopy, LogInForm, SocialAuthButtons, SocialAuthSection } from '../../features/auth';
import { ROUTES } from '../../shared/config/routes';
import { AUTH_RETURN_STATE } from '../../shared/lib/in-app-history';
import { returnPathStore } from '../../shared/lib/return-path';

export function LogInPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="flex flex-col items-center gap-6">
        <CharacterMedallion asset="headphones" size="md" />
        <div className="flex flex-col items-center gap-1.5">
          <Text as="h1" variant="title-1" weight="bold" tone="primary" align="center">
            {authCopy.logIn.title}
          </Text>
          <Text variant="subheadline" tone="secondary" align="center">
            {authCopy.logIn.subtitle}
          </Text>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <SocialAuthSection>
          {({ onSelect, pendingProvider }) => (
            <SocialAuthButtons
              googleLabel={authCopy.welcome.google}
              appleLabel={authCopy.welcome.apple}
              onSelect={onSelect}
              pendingProvider={pendingProvider}
            />
          )}
        </SocialAuthSection>

        <DividerWithLabel label={authCopy.logIn.divider} />

        <LogInForm
          onSignedIn={() => {
            // 복귀 경로로 갈 때만 표식을 싣는다 — 그 화면의 Back 이 인증 관문 대신 deep link 목적지로 간다 (`D7-7`).
            const returnPath = returnPathStore.peek();
            if (returnPath === null) {
              void navigate(ROUTES.home, { replace: true });
            } else {
              void navigate(returnPath, { replace: true, state: AUTH_RETURN_STATE });
            }
          }}
          onForgotPassword={() => {
            void navigate(ROUTES.auth.forgotPassword);
          }}
        />

        <div className="haru-auth-inline-prompt pb-2">
          <Text variant="subheadline" tone="secondary">
            {authCopy.logIn.noAccount}
          </Text>
          <TextLink
            onPress={() => {
              void navigate(ROUTES.auth.signUp);
            }}
          >
            {authCopy.logIn.createAccount}
          </TextLink>
        </div>
      </div>
    </div>
  );
}
