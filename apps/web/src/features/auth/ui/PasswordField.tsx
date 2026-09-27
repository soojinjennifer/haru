/**
 * 비밀번호 입력 행 — `TextField.trailingAction` 으로 토글을 흡수한다 (결정 `D-8` · `D-14`).
 * 별도 `PasswordToggle` 컴포넌트를 만들지 않는다.
 *
 * 접근성 (Design Spec §4.8 보완 ①②③ + §10)
 *  - 보이는 글자는 "Show" ↔ "Hide" — **텍스트 자체가 상태를 전달**한다
 *  - `aria-pressed` 로 토글 상태를 알린다
 *  - 접근성 이름은 "Show password" / "Hide password"
 *
 * 값은 이 컴포넌트 밖 form state 에만 있다. draft · Query 캐시에 넣지 않는다 (AC-2-64).
 */
import { TextField } from '@haru/ui';
import { useState } from 'react';

import { authCopy } from '../copy';
import { errorProp, helperProp, nameProp } from '../model/fieldProps';

export interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'new-password' | 'current-password';
  helperText?: string | undefined;
  errorText?: string | undefined;
  name?: string | undefined;
}

/** 보이는 토글 글자 — Figma `76:428`. */
const TOGGLE_LABEL = { show: 'Show', hide: 'Hide' } as const;

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  helperText,
  errorText,
  name,
}: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={revealed ? 'text' : 'password'}
      {...nameProp(name)}
      autoComplete={autoComplete}
      {...helperProp(helperText)}
      {...errorProp(errorText)}
      trailingAction={{
        label: revealed ? TOGGLE_LABEL.hide : TOGGLE_LABEL.show,
        accessibleLabel: revealed ? authCopy.password.hide : authCopy.password.show,
        pressed: revealed,
        onPress: () => {
          setRevealed((current) => !current);
        },
      }}
    />
  );
}
