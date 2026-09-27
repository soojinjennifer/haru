/**
 * 비밀번호 재설정 링크 요청 — Design Spec §2.4 (`C13-01`).
 *
 * 성공 시 **같은 route 안에서 뷰를 교체**한다. 문구는 계정 존재 여부를 알려주지 않는다
 * (AC-2-09). 재전송(resend) 버튼은 근거가 없어 넣지 않는다 (§13.1 ④).
 */
import { FieldGroup, Icon, InlineAlert, Surface, Text, TextField, TextLink } from '@haru/ui';
import { useState, type FormEvent } from 'react';

import { authCopy } from '../copy';
import { errorProp } from '../model/fieldProps';
import { authErrorMessage } from '../model/authErrorMessage';
import { useRequestPasswordReset } from '../model/authMutations';
import { validateEmailOnly } from '../model/validation';

import { SubmitButton } from './SubmitButton';

export interface ForgotPasswordFormProps {
  onBackToLogIn: () => void;
}

export function ForgotPasswordForm({ onBackToLogIn }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState(false);

  const mutation = useRequestPasswordReset();
  const failure = mutation.isError ? authErrorMessage(mutation.error, 'password-reset') : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const errors = validateEmailOnly(email);
    setEmailError(errors.email);
    if (errors.email !== undefined) return;

    mutation.mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          setSent(true);
        },
      },
    );
  }

  if (sent) {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <Surface fill="strong" radius="card" padding="6">
          <div className="flex flex-col gap-3">
            <Icon name="circle-check" size="lg" tone="primary" decorative />
            <Text as="h2" variant="headline" weight="semibold" tone="primary">
              {authCopy.forgotPassword.sentTitle}
            </Text>
            <Text variant="subheadline" tone="secondary">
              {authCopy.forgotPassword.sentDescription}
            </Text>
          </div>
        </Surface>
        <div className="flex justify-center">
          <TextLink tone="standalone" onPress={onBackToLogIn}>
            {authCopy.forgotPassword.backToLogIn}
          </TextLink>
        </div>
      </div>
    );
  }

  return (
    <form className="flex flex-1 flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <Text variant="body" tone="primary">
        {authCopy.forgotPassword.intro}
      </Text>

      <FieldGroup>
        <TextField
          label={authCopy.forgotPassword.emailLabel}
          value={email}
          onChange={setEmail}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          {...errorProp(emailError)}
        />
      </FieldGroup>

      {failure === undefined ? null : (
        <InlineAlert tone="error" title={failure.title} description={failure.description} />
      )}

      <SubmitButton loading={mutation.isPending}>{authCopy.forgotPassword.submit}</SubmitButton>

      <div className="flex justify-center">
        <TextLink tone="standalone" onPress={onBackToLogIn}>
          {authCopy.forgotPassword.backToLogIn}
        </TextLink>
      </div>
    </form>
  );
}
