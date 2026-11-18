/**
 * 이메일 가입 폼 — 재구성 Design Spec §7 (Figma `179:1724` **전체 프레임**).
 *
 * ── `R-01` (Privacy Critical) ──
 * Figma 의 `YOUR CHILD` 섹션을 **렌더한다**. 단 그 값은 **서버로 가지 않는다**:
 *  - `signUp` 요청 body 에 아이 필드가 **0건**이다 (`AC-2-05` · `AC-2R-05`).
 *    `SignUpWithEmailInput` 은 `.strict()` 라 섞이면 parse 단계에서 걸린다.
 *  - 값은 `OnboardingDraftStore` **로컬 저장소 한 경로만** 통과하고, 동의 기록 이후
 *    `POST /v1/onboarding/submit` 1회로 전송된다 (`AC-2R-13`).
 *
 * 아이 필드는 **진행 조건이 아니다** — 비어 있어도 계정을 만들 수 있고, `About your child` 가
 * `missing-prefill` 모드로 받는다 (§4.5). 다만 생년월이 3~9세 범위를 벗어나면 **여기에서**
 * 필드 에러로 막는다 (`AC-2R-07` · `C-10`).
 *
 * Figma `179:1745` 의 한 줄 동의 체크는 **렌더하지 않는다**: 그 문구는 법무·기획 보류
 * (`S2R-OPEN-7`)이며 미결 항목은 구현하지 않는다. 5항목 동의는 `/auth/consent` 가 담당한다.
 *
 * 제출 성공 후 이동은 **Route Guard 가 판정한다**: 동의 기록이 없으면 `/auth/consent` 다 (C-2).
 */
import { FieldGroup, InlineAlert, SelectTrigger, Tag, Text, TextField } from '@haru/ui';
import { useState, type FormEvent } from 'react';
import { GenderSchema, type Gender } from '@haru/contracts';

import { childCopy } from '../../../shared/copy/child-copy';
import { createSystemClock } from '../../../shared/lib/clock';
import {
  ageAccessibleLabel,
  ageTagLabel,
  BIRTH_MONTH_VALUES,
  birthYearOptions,
  EMPTY_CHILD_INFO_FORM,
  partialChildInfoAnswers,
  validateChildDraftFields,
  type ChildInfoFormState,
} from '../../../shared/lib/child-info';
import { createOnboardingDraftStore } from '../../../shared/lib/onboarding-draft';
import type { Clock } from '../../../shared/lib/clock';
import type { OnboardingDraftStore } from '../../../shared/lib/onboarding-draft';
import { authCopy } from '../copy';
import { errorProp } from '../model/fieldProps';
import { authErrorMessage } from '../model/authErrorMessage';
import { useSignUpWithEmail } from '../model/authMutations';
import { readChildDraft, saveChildDraft } from '../model/childDraft';
import { hasFieldErrors, validateSignUp, type SignUpFieldErrors } from '../model/validation';

import { PasswordField } from './PasswordField';
import { SubmitButton } from './SubmitButton';

export interface SignUpFormProps {
  /** 세션이 만들어진 뒤에 호출된다. 화면 이동은 호출자(page)가 한다. */
  onSignedUp: () => void;
  /** 테스트 주입 지점 (기본은 `localStorage` + 시스템 시계). */
  store?: OnboardingDraftStore | undefined;
  clock?: Clock | undefined;
}

export function SignUpForm({ onSignedUp, store, clock }: SignUpFormProps) {
  const [caregiverName, setCaregiverName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [childError, setChildError] = useState<string | undefined>(undefined);

  // 시계·저장소는 마운트 동안 변하지 않는다 — 렌더 중 ref 를 읽지 않기 위해 lazy state 다.
  const [resolvedClock] = useState<Clock>(() => clock ?? createSystemClock());
  const [draftStore] = useState<OnboardingDraftStore>(
    () => store ?? createOnboardingDraftStore({ clock: resolvedClock }),
  );
  const [now] = useState<Date>(() => new Date(resolvedClock.nowIso()));

  /** 가입 화면 재진입 시 이미 받아 둔 값을 되살린다 (로컬 draft). */
  const [child, setChild] = useState<ChildInfoFormState>(() => {
    const saved = readChildDraft(draftStore);
    const [year = '', month = ''] = (saved?.birthYearMonth ?? '').split('-');

    return {
      ...EMPTY_CHILD_INFO_FORM,
      firstName: saved?.firstName ?? '',
      lastName: saved?.lastName ?? '',
      birthYear: year,
      birthMonth: month,
      gender: saved?.gender ?? null,
    };
  });

  const mutation = useSignUpWithEmail();
  const failure = mutation.isError ? authErrorMessage(mutation.error, 'sign-up') : undefined;
  const ageTag = ageTagLabel(child, now);
  const ageLabel = ageAccessibleLabel(child, now);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const errors = validateSignUp({ caregiverName, email, password });
    setFieldErrors(errors);

    // 아이 생년월 범위만 본다 — 비어 있는 것은 오류가 아니다 (`AC-2R-07`).
    const childErrors = validateChildDraftFields(child, now);
    setChildError(childErrors.birthYearMonth);

    if (hasFieldErrors(errors) || childErrors.birthYearMonth !== undefined) return;

    /*
      아이 값은 **로컬 저장소로만** 간다 (`R-01`). 서버 요청 전에 기록해 입력을 잃지 않게 하고,
      가입 payload 와는 완전히 분리한다.
    */
    saveChildDraft({
      store: draftStore,
      clock: resolvedClock,
      childInfo: partialChildInfoAnswers(child),
    });

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
        <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
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

      {/* `YOUR CHILD` — Figma `179:1739`/`179:1740`. 값은 로컬에만 머문다 (`R-01`). */}
      <div className="flex flex-col gap-2">
        <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
          {childCopy.childSection}
        </Text>
        <FieldGroup>
          <TextField
            label={childCopy.firstName}
            value={child.firstName}
            onChange={(value) => {
              setChild((current) => ({ ...current, firstName: value }));
            }}
            name="child-first-name"
            autoComplete="off"
          />
          <TextField
            label={childCopy.lastName}
            value={child.lastName}
            onChange={(value) => {
              setChild((current) => ({ ...current, lastName: value }));
            }}
            name="child-last-name"
            autoComplete="off"
            helperText={childCopy.lastNameOptional}
          />
        </FieldGroup>

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <SelectTrigger
              label={childCopy.birthYear}
              value={child.birthYear === '' ? null : child.birthYear}
              placeholder={childCopy.birthPlaceholder}
              options={birthYearOptions(now).map((year) => ({ value: year, label: year }))}
              onChange={(value) => {
                setChild((current) => ({ ...current, birthYear: value }));
              }}
              {...(childError === undefined ? {} : { error: childError })}
            />
          </div>
          <div className="flex-1">
            <SelectTrigger
              label={childCopy.birthMonth}
              value={child.birthMonth === '' ? null : child.birthMonth}
              placeholder={childCopy.birthPlaceholder}
              options={BIRTH_MONTH_VALUES.map((month) => ({ value: month, label: month }))}
              onChange={(value) => {
                setChild((current) => ({ ...current, birthMonth: value }));
              }}
            />
          </div>
        </div>

        {/* 나이는 입력에서 **파생** 표시다 — 서버 값이 아니다 (`R-09`). */}
        {ageTag === null ? null : (
          <Tag
            label={ageTag}
            tone="flexibility"
            size="sm"
            {...(ageLabel === null ? {} : { accessibleLabel: ageLabel })}
          />
        )}

        <SelectTrigger
          label={childCopy.gender}
          value={child.gender}
          placeholder={childCopy.genderPlaceholder}
          options={GenderSchema.options.map((value) => ({
            value,
            label: childCopy.genderOptions[value],
          }))}
          onChange={(value) => {
            setChild((current) => ({ ...current, gender: value as Gender }));
          }}
        />
      </div>

      {failure === undefined ? null : (
        <InlineAlert tone="error" title={failure.title} description={failure.description} />
      )}

      <SubmitButton loading={mutation.isPending}>{authCopy.signUp.submit}</SubmitButton>
    </form>
  );
}
