/**
 * Step 1 — Design Spec §2.10 Step 1 (Figma `179:1740` + `C13-04`).
 *
 * | 항목 | 규칙 |
 * |---|---|
 * | 이름 | 성·이름 **두 칸**. `lastName` 은 선택 (결정 D-1 · C-6) |
 * | 생년월 | 년·월 2단 `SelectTrigger` (결정 D-10, 허용 차이 `AD-S2-5`) |
 * | 나이 Tag | 입력에서 **파생** 표시. 서버 값이 아니다 |
 * | 성별 | 기본 미선택, 미응답으로 진행 가능 → `gender: null` (C-7) |
 * | 관계 | **보호자 데이터** — `PATCH /v1/me` 로 따로 간다 (결정 D-16). 화면 1개 / 요청 2개 |
 *
 * 검증은 `model/childInfo.ts` 의 순수 함수가 한다. 이 컴포넌트는 표시만 담당한다.
 */
import { Chip, FieldGroup, RadioGroup, SelectTrigger, Tag, Text, TextField } from '@haru/ui';
import { useState } from 'react';
import {
  CaregiverRelationshipSchema,
  GenderSchema,
  LanguageEnvironmentSchema,
  ReadingRoutineSchema,
  type CaregiverRelationship,
  type Gender,
  type LanguageEnvironment,
  type OnboardingDraftAnswers,
  type ReadingRoutine,
} from '@haru/contracts';

import { onboardingCopy } from '../copy';
import {
  ageTagLabel,
  BIRTH_MONTH_VALUES,
  birthYearOptions,
  childInfoFormFrom,
  partialChildInfoAnswers,
  validateChildInfo,
  type ChildInfoFormState,
} from '../model/childInfo';

export interface ChildInfoStepProps {
  answers: OnboardingDraftAnswers;
  onChange: (next: OnboardingDraftAnswers) => void;
  /** 보호자 관계 — 현재 값과 변경 통지 (D-16: 전송은 위저드가 `PATCH /v1/me` 로 한다). */
  relationship: CaregiverRelationship | null;
  onRelationshipChange: (value: CaregiverRelationship) => void;
  now: Date;
  /** "Next" 를 눌렀는데 필수 항목이 비어 있을 때만 에러를 노출한다. */
  showErrors: boolean;
}

export function ChildInfoStep({
  answers,
  onChange,
  relationship,
  onRelationshipChange,
  now,
  showErrors,
}: ChildInfoStepProps) {
  const copy = onboardingCopy.childInfo;
  const restored = childInfoFormFrom(answers.child_info, undefined);

  /**
   * 생년월은 **년·월을 따로** 고른다 (결정 D-10). 저장 형태는 `YYYY-MM` 한 덩어리라
   * 한쪽만 고른 중간 상태를 응답에 담을 수 없다 — 그 상태만 화면이 들고 있는다.
   */
  const [birth, setBirth] = useState<{ year: string; month: string }>(() => ({
    year: restored.birthYear,
    month: restored.birthMonth,
  }));

  const form: ChildInfoFormState = {
    ...restored,
    birthYear: birth.year,
    birthMonth: birth.month,
    relationship,
  };
  const { errors } = validateChildInfo(form, now);
  const ageTag = ageTagLabel(form, now);
  const firstNameError = showErrors ? errors.firstName : undefined;
  const languageError = showErrors ? errors.languageEnvironment : undefined;
  const yearError = showErrors ? errors.birthYearMonth : undefined;

  function update(next: Partial<ChildInfoFormState>): void {
    const merged: ChildInfoFormState = { ...form, ...next };
    onChange({ ...answers, child_info: partialChildInfoAnswers(merged) });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        {/* SectionLabel recipe — Design Spec §4.7 (컴포넌트를 만들지 않는다). */}
        <Text variant="caption-1" tone="secondary" weight="semibold">
          {copy.childSection}
        </Text>
        <FieldGroup>
          <TextField
            label={copy.firstName}
            value={form.firstName}
            onChange={(value) => {
              update({ firstName: value });
            }}
            name="child-first-name"
            autoComplete="off"
            required
            {...(firstNameError === undefined ? {} : { errorText: firstNameError })}
          />
          <TextField
            label={copy.lastName}
            value={form.lastName}
            onChange={(value) => {
              update({ lastName: value });
            }}
            name="child-last-name"
            autoComplete="off"
            helperText={copy.lastNameOptional}
          />
        </FieldGroup>

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <SelectTrigger
              label={copy.birthYear}
              value={form.birthYear === '' ? null : form.birthYear}
              placeholder={copy.birthPlaceholder}
              options={birthYearOptions(now).map((year) => ({ value: year, label: year }))}
              onChange={(value) => {
                setBirth((current) => ({ ...current, year: value }));
                update({ birthYear: value });
              }}
              required
              {...(yearError === undefined ? {} : { error: yearError })}
            />
          </div>
          <div className="flex-1">
            <SelectTrigger
              label={copy.birthMonth}
              value={form.birthMonth === '' ? null : form.birthMonth}
              placeholder={copy.birthPlaceholder}
              options={BIRTH_MONTH_VALUES.map((month) => ({ value: month, label: month }))}
              onChange={(value) => {
                setBirth((current) => ({ ...current, month: value }));
                update({ birthMonth: value });
              }}
              required
            />
          </div>
        </div>

        {ageTag === null ? null : <Tag label={ageTag} tone="flexibility" size="sm" />}

        <SelectTrigger
          label={copy.gender}
          value={form.gender}
          placeholder={copy.genderPlaceholder}
          options={GenderSchema.options.map((value) => ({
            value,
            label: onboardingCopy.genderOptions[value],
          }))}
          onChange={(value) => {
            update({ gender: value as Gender });
          }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <Text variant="caption-1" tone="secondary" weight="semibold">
          {copy.caregiverSection}
        </Text>
        <SelectTrigger
          label={copy.relationship}
          value={relationship}
          placeholder={copy.relationshipPlaceholder}
          options={CaregiverRelationshipSchema.options.map((value) => ({
            value,
            label: onboardingCopy.relationshipOptions[value],
          }))}
          onChange={(value) => {
            onRelationshipChange(value as CaregiverRelationship);
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <Text variant="caption-1" tone="secondary" weight="semibold">
          {copy.homeSection}
        </Text>

        <fieldset className="haru-choice-group">
          <legend className="haru-choice-group__legend">
            <Text variant="footnote" tone="primary" as="span">
              {copy.languages}
            </Text>
          </legend>
          <div className="haru-choice-group__chips">
            {LanguageEnvironmentSchema.options.map((code) => {
              const selected = form.languageEnvironment.includes(code);

              return (
                <Chip
                  key={code}
                  label={onboardingCopy.languageOptions[code]}
                  selected={selected}
                  onToggle={() => {
                    const next: LanguageEnvironment[] = selected
                      ? form.languageEnvironment.filter((value) => value !== code)
                      : [...form.languageEnvironment, code];
                    update({ languageEnvironment: next });
                  }}
                />
              );
            })}
          </div>
        </fieldset>
        {languageError === undefined ? null : (
          <div role="alert">
            <Text variant="caption-1" tone="secondary">
              {languageError}
            </Text>
          </div>
        )}

        <RadioGroup
          legend={copy.readingRoutine}
          name="reading-routine"
          variant="list"
          value={form.readingRoutine}
          options={ReadingRoutineSchema.options.map((value) => ({
            value,
            label: onboardingCopy.readingRoutineOptions[value],
          }))}
          onChange={(value) => {
            update({ readingRoutine: value as ReadingRoutine });
          }}
        />
      </section>
    </div>
  );
}
