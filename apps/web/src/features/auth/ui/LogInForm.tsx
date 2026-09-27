/**
 * 이메일 로그인 폼 — Design Spec §2.3 (Figma `179:1820`).
 *
 * 실패 문구는 **계정 존재 여부를 구분하지 않는다** (enumeration 방지).
 * 재시도 시 입력값을 보존한다 (`retry` scenario 검증 대상).
 */
import { FieldGroup, InlineAlert, TextField, TextLink } from '@haru/ui';
import { useState, type FormEvent } from 'react';

import { authCopy } from '../copy';
import { errorProp } from '../model/fieldProps';
import { authErrorMessage } from '../model/authErrorMessage';
import { useSignInWithEmail } from '../model/authMutations';
import { hasFieldErrors, validateSignIn, type SignInFieldErrors } from '../model/validation';

import { PasswordField } from './PasswordField';
import { SubmitButton } from './SubmitButton';

export interface LogInFormProps {
  onSignedIn: () => void;
  onForgotPassword: () => void;
}

export function LogInForm({ onSignedIn, onForgotPassword }: LogInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({});

  const mutation = useSignInWithEmail();
  const failure = mutation.isError ? authErrorMessage(mutation.error, 'sign-in') : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const errors = validateSignIn({ email, password });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    mutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          setPassword('');
          onSignedIn();
        },
      },
    );
  }

  return (
    <form className="flex flex-1 flex-col gap-3" onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <TextField
          label={authCopy.logIn.emailLabel}
          value={email}
          onChange={setEmail}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          {...errorProp(fieldErrors.email)}
        />
        <PasswordField
          label={authCopy.logIn.passwordLabel}
          value={password}
          onChange={setPassword}
          name="current-password"
          autoComplete="current-password"
          {...errorProp(fieldErrors.password)}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <TextLink tone="standalone" onPress={onForgotPassword}>
          {authCopy.logIn.forgotPassword}
        </TextLink>
      </div>

      {failure === undefined ? null : (
        <InlineAlert tone="error" title={failure.title} description={failure.description} />
      )}

      <SubmitButton loading={mutation.isPending}>{authCopy.logIn.submit}</SubmitButton>
    </form>
  );
}
