/**
 * 새 비밀번호 설정 — Design Spec §2.5 (`C13-01`).
 *
 * 메일 링크로 진입하므로 재설정 토큰은 URL 에 있다. 토큰이 없거나 서버(Mock)가
 * `AUTH_TOKEN_EXPIRED` 를 돌려주면 **링크 만료 상태**로 교체한다.
 * 실제 링크 토큰 발급·검증은 `BACKEND_INTEGRATION_PENDING`(P2-BIP-02) 이다.
 *
 * 성공하면 입력값을 즉시 폐기하고 로그인 화면으로 보낸다 (AC-2-64).
 */
import { ErrorState, FieldGroup, InlineAlert, Text } from '@haru/ui';
import { useState, type FormEvent } from 'react';

import { authCopy } from '../copy';
import { errorProp } from '../model/fieldProps';
import { authErrorMessage, isExpiredResetLink } from '../model/authErrorMessage';
import { useUpdatePassword } from '../model/authMutations';
import {
  hasFieldErrors,
  validateNewPassword,
  type ResetPasswordFieldErrors,
} from '../model/validation';

import { PasswordField } from './PasswordField';
import { SubmitButton } from './SubmitButton';

export interface ResetPasswordFormProps {
  /** 메일 링크가 실어 온 토큰. 없으면 링크가 유효하지 않다. */
  token: string | null;
  onUpdated: () => void;
  onRequestNewLink: () => void;
}

export function ResetPasswordForm({ token, onUpdated, onRequestNewLink }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});
  const [expired, setExpired] = useState(false);

  const mutation = useUpdatePassword();
  const failure =
    mutation.isError && !expired ? authErrorMessage(mutation.error, 'password-reset') : undefined;

  const linkUnusable = token === null || token.length === 0 || expired;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const errors = validateNewPassword({ password, confirmPassword });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    mutation.mutate(
      { password },
      {
        onSuccess: () => {
          setPassword('');
          setConfirmPassword('');
          onUpdated();
        },
        onError: (error: unknown) => {
          if (isExpiredResetLink(error)) setExpired(true);
        },
      },
    );
  }

  if (linkUnusable) {
    return (
      <ErrorState
        title={authCopy.resetPassword.expiredTitle}
        description={authCopy.resetPassword.expiredDescription}
        retryLabel={authCopy.resetPassword.expiredAction}
        onRetry={onRequestNewLink}
      />
    );
  }

  return (
    <form className="flex flex-1 flex-col gap-2" onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <PasswordField
          label={authCopy.resetPassword.passwordLabel}
          value={password}
          onChange={setPassword}
          name="new-password"
          autoComplete="new-password"
          {...errorProp(fieldErrors.password)}
        />
        <PasswordField
          label={authCopy.resetPassword.confirmLabel}
          value={confirmPassword}
          onChange={setConfirmPassword}
          name="confirm-password"
          autoComplete="new-password"
          {...errorProp(fieldErrors.confirmPassword)}
        />
      </FieldGroup>
      <Text variant="caption-1" tone="secondary">
        {authCopy.resetPassword.helper}
      </Text>

      {failure === undefined ? null : (
        <InlineAlert tone="error" title={failure.title} description={failure.description} />
      )}

      <SubmitButton loading={mutation.isPending}>{authCopy.resetPassword.submit}</SubmitButton>
    </form>
  );
}
