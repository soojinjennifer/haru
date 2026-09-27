/**
 * 이메일 가입 폼 — Design Spec §2.2 (Figma `179:1724` **보호자 영역만**).
 *
 * Figma 의 "YOUR CHILD" FieldGroup 과 단일 동의 체크박스는 **렌더하지 않는다**
 * (`CONFIRMED C-5 · C-1`, 허용 차이 `AD-S2-1`). 아이 정보는 동의 기록 이후 온보딩에서만
 * 수집한다 — 요청 body 에 아이 필드가 0건이어야 한다 (AC-2-05 · AC-2-13).
 *
 * 제출 성공 후 이동은 **Route Guard 가 판정한다**: 동의 기록이 없으면 `/auth/consent` 다 (C-2).
 */
import { FieldGroup, InlineAlert, Text, TextField } from '@haru/ui';
import { useState, type FormEvent } from 'react';

import { authCopy } from '../copy';
import { errorProp } from '../model/fieldProps';
import { authErrorMessage } from '../model/authErrorMessage';
import { useSignUpWithEmail } from '../model/authMutations';
import { hasFieldErrors, validateSignUp, type SignUpFieldErrors } from '../model/validation';

import { PasswordField } from './PasswordField';
import { SubmitButton } from './SubmitButton';

export interface SignUpFormProps {
  /** 세션이 만들어진 뒤에 호출된다. 화면 이동은 호출자(page)가 한다. */
  onSignedUp: () => void;
}

export function SignUpForm({ onSignedUp }: SignUpFormProps) {
  const [caregiverName, setCaregiverName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});

  const mutation = useSignUpWithEmail();
  const failure = mutation.isError ? authErrorMessage(mutation.error, 'sign-up') : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const errors = validateSignUp({ caregiverName, email, password });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    mutation.mutate(
      // 아이 필드가 없다 — schema 가 `.strict()` 라 섞이면 parse 단계에서 걸린다 (AC-2-05).
      { caregiverName: caregiverName.trim(), email: email.trim(), password },
      {
        onSuccess: () => {
          // 비밀번호는 제출 직후 폐기한다 (AC-2-64).
          setPassword('');
          onSignedUp();
        },
      },
    );
  }

  return (
    <form className="flex flex-1 flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2">
        {/* SectionLabel recipe — Design Spec §4.7 (컴포넌트를 만들지 않는다). */}
        <Text variant="caption-1" tone="secondary" weight="semibold">
          {authCopy.signUp.sectionLabel}
        </Text>
        <FieldGroup>
          <TextField
            label={authCopy.signUp.nameLabel}
            value={caregiverName}
            onChange={setCaregiverName}
            name="name"
            autoComplete="name"
            {...errorProp(fieldErrors.caregiverName)}
          />
          <TextField
            label={authCopy.signUp.emailLabel}
            value={email}
            onChange={setEmail}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            {...errorProp(fieldErrors.email)}
          />
          <PasswordField
            label={authCopy.signUp.passwordLabel}
            value={password}
            onChange={setPassword}
            name="new-password"
            autoComplete="new-password"
            {...errorProp(fieldErrors.password)}
          />
        </FieldGroup>
        <Text variant="caption-1" tone="secondary">
          {authCopy.signUp.passwordHelper}
        </Text>
      </div>

      {failure === undefined ? null : (
        <InlineAlert tone="error" title={failure.title} description={failure.description} />
      )}

      <SubmitButton loading={mutation.isPending}>{authCopy.signUp.submit}</SubmitButton>
    </form>
  );
}
