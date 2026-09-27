/**
 * `/auth/welcome` — Design Spec §2.1 (Figma `179:1701`).
 *
 * Page 는 Composition 만 한다 — API 호출 · 복잡한 로직 없음 (rules/frontend §3).
 * Layout(`StackLayout`)은 **router 가 씌운다** — `pages` 는 `app` 을 import 할 수 없다
 * (rules/architecture §3). 이 화면은 TopBar 가 없다.
 *
 * `179:1722` 의 문장은 **동의 기록이 아니다** (C-1 · C-2). 단순 고지이며 실제 동의는
 * `/auth/consent` 에서만 기록한다. 문장 안의 링크는 외부 문서로 연다 (결정 `D-4`).
 */
import { Button, Icon, Text, TextLink } from '@haru/ui';
import { useNavigate } from 'react-router';

import { CharacterMedallion } from '../../entities/character';
import { authCopy, SocialAuthButtons, SocialAuthSection } from '../../features/auth';
import { LEGAL_LINKS } from '../../shared/config/legal-links';
import { ROUTES } from '../../shared/config/routes';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center gap-8 pt-10">
      <CharacterMedallion asset="hello-heart" size="lg" />

      <div className="flex flex-col items-center gap-2">
        <Text as="h1" variant="large-title" weight="heavy" tone="primary" align="center">
          {authCopy.welcome.title}
        </Text>
        <Text variant="subheadline" tone="secondary" align="center">
          {authCopy.welcome.tagline}
        </Text>
      </div>

      <div className="flex w-full flex-col gap-3">
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

        <Button
          variant="accent"
          size="lg"
          fullWidth
          leadingIcon={<Icon name="mail" size="md" decorative />}
          onPress={() => {
            void navigate(ROUTES.auth.signUp);
          }}
        >
          {authCopy.welcome.email}
        </Button>

        <div className="haru-auth-inline-prompt">
          <Text variant="subheadline" tone="secondary">
            {authCopy.welcome.hasAccount}
          </Text>
          <TextLink
            onPress={() => {
              void navigate(ROUTES.auth.logIn);
            }}
          >
            {authCopy.welcome.logIn}
          </TextLink>
        </div>
      </div>

      <div className="haru-auth-legal mt-auto pt-6">
        <Text variant="caption-1" tone="secondary" align="center">
          {authCopy.welcome.legalPrefix}{' '}
          <TextLink href={LEGAL_LINKS.termsOfService} external externalHint={authCopy.externalHint}>
            {authCopy.welcome.legalTerms}
          </TextLink>{' '}
          {authCopy.welcome.legalConjunction}{' '}
          <TextLink href={LEGAL_LINKS.privacyPolicy} external externalHint={authCopy.externalHint}>
            {authCopy.welcome.legalPrivacy}
          </TextLink>
          {authCopy.welcome.legalSuffix}
        </Text>
      </div>
    </div>
  );
}
