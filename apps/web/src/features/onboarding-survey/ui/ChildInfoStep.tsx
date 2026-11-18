/**
 * `About your child` — 재구성 Design Spec §4 (Figma `248:1159`).
 *
 * | 항목 | 규칙 |
 * |---|---|
 * | 이름 · 생년월 · 성별 | **가입 화면에서 받아 둔 로컬 draft 값을 표시**한다 (`R-01` · `R-10`) |
 * | 편집 | 섹션 헤더 연필 또는 **행 탭**으로 인라인 편집 (`R-08`) — `readonly` input 을 쓰지 않는다 |
 * | 나이 Tag | 입력에서 **파생** 표시. 서버 값이 아니다 (`R-09`) |
 * | 관계 | **보호자 데이터** — `PATCH /v1/me` 로 따로 간다 (결정 **D-16**). 화면 1개 / 요청 2개 |
 *
 * ── 왜 "표시 전용"이 아니라 "표시 ↔ 편집" 인가 (`R-08`) ──
 * 완전 읽기 전용이면 생년월 오입력 시 3~9세 범위를 벗어나 **제출 데드락**이 생긴다.
 * HARU 의 `TextField` 는 테두리가 없는 label-above-value 행이라 편집 상태가 이미 "그냥 텍스트"
 * 처럼 보인다 → 구분은 **빼기가 아니라 더하기**로 만든다: 섹션 헤더 아이콘 1개(발견 가능성) +
 * 행 press 피드백(도달 경로).
 *
 * 값이 없으면 **처음부터 편집 모드로 진입**한다 (`missing-prefill` — §4.5). 진입 시 에러를
 * 표시하지 않는다: 아직 하지 않은 일은 오류가 아니다.
 *
 * 검증은 `shared/lib/child-info` 의 순수 함수가 한다. 이 컴포넌트는 표시만 담당한다.
 */
import { Icon, IconButton, SelectTrigger, Surface, Tag, Text, TextLink } from '@haru/ui';
import { useId, useState } from 'react';
import {
  CaregiverRelationshipSchema,
  type CaregiverRelationship,
  type OnboardingDraftAnswers,
} from '@haru/contracts';

import {
  ChildIdentityFields,
  ChildLanguageFields,
  ChildReadingRoutineField,
} from '../../../entities/child';
import { onboardingCopy } from '../copy';
import {
  ageAccessibleLabel,
  ageTagLabel,
  birthYearMonthOf,
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

/** 표시 전용 행 — 눌리면 편집으로 들어간다. "표시 전용 텍스트는 눌리지 않는다" (§4.3 신호 ③). */
function DisplayRow({
  label,
  value,
  trailing,
  onPress,
  hint,
}: {
  label: string;
  value: string;
  trailing?: React.ReactNode;
  onPress: () => void;
  hint: string;
}) {
  const hintId = useId();

  return (
    <button
      type="button"
      className="haru-child-row haru-focus-ring"
      onClick={onPress}
      aria-describedby={hintId}
    >
      <span className="haru-child-row__text">
        <Text variant="caption-1" tone="secondary" as="span">
          {label}
        </Text>
        <Text variant="footnote" tone="strong" as="span">
          {value}
        </Text>
      </span>
      {trailing === undefined ? null : <span className="haru-child-row__trailing">{trailing}</span>}
      <span className="haru-visually-hidden" id={hintId}>
        {hint}
      </span>
    </button>
  );
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
  const ageLabel = ageAccessibleLabel(form, now);
  const birthYearMonth = birthYearMonthOf(form);

  /** draft 에 값이 없으면 처음부터 편집 모드다 (`missing-prefill`). */
  const [editing, setEditing] = useState<boolean>(
    () => restored.firstName === '' || birthYearMonthOf(restored) === null,
  );

  const firstNameError = showErrors ? errors.firstName : undefined;
  const yearError = showErrors ? errors.birthYearMonth : undefined;

  function update(next: Partial<ChildInfoFormState>): void {
    const merged: ChildInfoFormState = { ...form, ...next };

    onChange({
      ...answers,
      child_info: {
        ...partialChildInfoAnswers(merged),
        /*
          언어의 **편집 주체는 이 화면뿐**이다. 그래서 여기서는 해제(빈 배열)도 그대로 기록한다
          — 키가 빠지면 `childInfoFormFrom` 이 기본값(영어)을 다시 선택해 해제가 불가능해진다.
          반대로 언어 입력이 없는 가입 화면은 `partialChildInfoAnswers` 가 키를 빼서 기존 값을
          지우지 않는다 (`QA-2R-009`). 두 화면의 요구가 반대라 여기에서만 덧쓴다.
        */
        languageEnvironment: [...merged.languageEnvironment],
      },
    });
  }

  /** 입력 묶음의 변경 — 생년 년·월은 중간 상태를 화면이 들고 있는다 (D-10). */
  function handleFieldChange(patch: Partial<ChildInfoFormState>): void {
    if (patch.birthYear !== undefined || patch.birthMonth !== undefined) {
      setBirth((current) => ({
        year: patch.birthYear ?? current.year,
        month: patch.birthMonth ?? current.month,
      }));
    }
    update(patch);
  }

  function startEditing(): void {
    setEditing(true);
  }

  const genderTag =
    form.gender === null ? copy.genderPlaceholder : onboardingCopy.genderOptions[form.gender];

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        {/* SectionLabel recipe + 편집 전환 (§4.3 신호 ②) — 컴포넌트를 만들지 않는다. */}
        <div className="haru-child-section-header">
          <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
            {copy.childSection}
          </Text>
          {editing ? (
            <TextLink
              onPress={() => {
                setEditing(false);
              }}
            >
              {copy.editDone}
            </TextLink>
          ) : (
            <IconButton
              icon={<Icon name="pencil" decorative />}
              label={copy.editChild}
              variant="plain"
              onPress={startEditing}
            />
          )}
        </div>

        {editing ? (
          /* 편집 필드는 `entities/child` 로 옮겼다 (Stage 6 `R-11`) — DOM·순서 변화 0. */
          <ChildIdentityFields
            form={form}
            onChange={handleFieldChange}
            now={now}
            errors={{
              ...(firstNameError === undefined ? {} : { firstName: firstNameError }),
              ...(yearError === undefined ? {} : { birthYearMonth: yearError }),
            }}
          />
        ) : (
          <Surface fill="strong" radius="surface" padding="none">
            <DisplayRow
              label={copy.firstName}
              value={form.firstName}
              onPress={startEditing}
              hint={copy.editRowHint}
              trailing={<Tag label={genderTag} tone="neutral" size="sm" />}
            />
            <div className="haru-child-row__divider" />
            <DisplayRow
              label={copy.birthMonth}
              value={birthYearMonth ?? ''}
              onPress={startEditing}
              hint={copy.editRowHint}
              {...(ageTag === null
                ? {}
                : {
                    trailing: (
                      <Tag
                        label={ageTag}
                        tone="flexibility"
                        size="sm"
                        {...(ageLabel === null ? {} : { accessibleLabel: ageLabel })}
                      />
                    ),
                  })}
            />
          </Surface>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
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
        <Text variant="caption-1" tone="secondary" weight="bold" tracking="section-label">
          {copy.homeSection}
        </Text>

        <ChildLanguageFields form={form} onChange={handleFieldChange} now={now} />
      </section>

      {/* Figma `248:1159` — 독서 루틴은 `AT HOME` 다음 형제 섹션(`244:1415`, `S6-G` G-1). */}
      <ChildReadingRoutineField form={form} onChange={handleFieldChange} now={now} />
    </div>
  );
}
