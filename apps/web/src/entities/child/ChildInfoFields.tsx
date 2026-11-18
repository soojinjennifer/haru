/**
 * 아이 기본 정보 **입력 묶음** — 제어형 표현 컴포넌트 (Stage 6 `R-11`, Spec §2.5 · §3.7 `N6-41`).
 *
 * 온보딩 Step 1 `About your child`(`features/onboarding-survey/ChildInfoStep`, Figma `248:1159`)의
 * 편집 필드를 그대로 옮겼다. 아이 정보 수정 화면(`features/child-profile-edit`, `/settings/child`)이
 * 같은 필드를 쓰기 때문이다 — feature 간 import 가 금지라 entities 로 내렸다 (`rules/architecture.md` §3).
 *
 * | 블록 | 필드 | 쓰는 곳 |
 * |---|---|---|
 * | `ChildIdentityFields` | firstName · lastName · 생년(년·월) + 나이 Tag · gender | 온보딩 `YOUR CHILD` 편집 모드 · 수정 화면 |
 * | `ChildLanguageFields` | 언어 Chip **카드**(`244:1314`) | 온보딩 · 수정 화면 `AT HOME` 섹션 |
 * | `ChildReadingRoutineField` | 독서 루틴 **Answer card 행**(`244:1394`) + 섹션 라벨형 legend(`244:1358`) | 온보딩 · 수정 화면 — `AT HOME` 다음 섹션 |
 *
 * ── `S6-G` G-1 (`D6-9` ① · `QA-6-002` · `VG6-B-06/07`) — Figma `248:1159` 실측 (2026-11-18, `get_design_context` 선언값) ──
 * - 언어 카드 `244:1314` 346×143: fill `glass-fill-strong`(white 90%) · radius **30** · drop `0 6 4 ink-600/8%` + inset
 *   `0 1.5 0 white/90%` · `0 -1 0 ink-600/5%` (= `--shadow-bubble`, 인스턴스 렌더 1겹 — `T6-9`) · padding 20/10/18/10 ·
 *   legend(13 Regular `text-primary`) ↔ 칩 gap **14** · 칩 = `Select 90:626` wrap gap 7 · **justify center**.
 *   → `.haru-language-card`(`child.css` — strong fill · `--shadow-bubble` · radius `--choice-card-radius` **30** · blur 없음,
 *   `D6-10` ② ③ — `Surface fill="strong"` 은 Figma 에 없는 blur 를 걸어 쓰지 않는다) + fieldset padding
 *   `space-5`/`space-2-5`/`space-4-5` · legend gap `space-3-5` · 칩 `variant="select"` · gap `space-2`(7 → 8, Stage 2 `AD` 흡수 유지).
 * - 독서 루틴 `244:1415`: 섹션 라벨 행 `244:1357`(Bold 12 · tracking .72 · `#7d9291` = SectionLabel recipe, `D6-10` ③) + Answer card
 *   `244:1394` 행 5개(fill `rgba(233,240,237,.8)` · radius 16 · pad 15/13 · gap 7) = `RadioGroup variant="card"`(설문 카드와 같은 recipe).
 *   `AT HOME` 섹션과 **형제 섹션**이다(섹션 간격 18 → `space-5`, `AD-S2R-04`).
 * - 언어 칩 hit 영역 겹침 = 줄 사이 중간선 분할(G-1a, `D5-6` 방식 — `shared/hooks/useChipRowSplit`).
 *
 * - 상태를 갖지 않는다. 값은 `form`, 변경은 `onChange(patch)` 로만 오간다. 섹션 라벨·편집 전환·보호자 관계
 *   (`D-16` — 보호자 데이터)는 호출한 feature 가 조립한다.
 * - 검증·나이 계산은 `shared/lib/child-info` 의 순수 함수다. 문구는 `shared/copy/child-copy`.
 */
import { Chip, FieldGroup, RadioGroup, SelectTrigger, Tag, Text, TextField } from '@haru/ui';
import {
  GenderSchema,
  LanguageEnvironmentSchema,
  ReadingRoutineSchema,
  type Gender,
  type LanguageEnvironment,
  type ReadingRoutine,
} from '@haru/contracts';

import { childCopy } from '../../shared/copy/child-copy';
import { useChipRowSplit } from '../../shared/hooks/useChipRowSplit';
import {
  ageAccessibleLabel,
  ageTagLabel,
  BIRTH_MONTH_VALUES,
  birthYearOptions,
  type ChildInfoFormState,
} from '../../shared/lib/child-info';

/** 필드별 오류 문구 — 값이 있는 필드만 오류 상태로 그린다. */
export type ChildInfoFieldsErrors = Partial<
  Record<'firstName' | 'lastName' | 'birthYearMonth' | 'gender' | 'readingRoutine', string>
>;

export interface ChildInfoFieldsProps {
  form: ChildInfoFormState;
  onChange: (patch: Partial<ChildInfoFormState>) => void;
  now: Date;
  errors?: ChildInfoFieldsErrors;
}

export function ChildIdentityFields({ form, onChange, now, errors = {} }: ChildInfoFieldsProps) {
  const copy = childCopy;
  const ageTag = ageTagLabel(form, now);
  const ageLabel = ageAccessibleLabel(form, now);

  return (
    <>
      <FieldGroup>
        <TextField
          label={copy.firstName}
          value={form.firstName}
          onChange={(value) => {
            onChange({ firstName: value });
          }}
          name="child-first-name"
          autoComplete="off"
          required
          {...(errors.firstName === undefined ? {} : { errorText: errors.firstName })}
        />
        <TextField
          label={copy.lastName}
          value={form.lastName}
          onChange={(value) => {
            onChange({ lastName: value });
          }}
          name="child-last-name"
          autoComplete="off"
          helperText={copy.lastNameOptional}
          {...(errors.lastName === undefined ? {} : { errorText: errors.lastName })}
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
              onChange({ birthYear: value });
            }}
            required
            {...(errors.birthYearMonth === undefined ? {} : { error: errors.birthYearMonth })}
          />
        </div>
        <div className="flex-1">
          <SelectTrigger
            label={copy.birthMonth}
            value={form.birthMonth === '' ? null : form.birthMonth}
            placeholder={copy.birthPlaceholder}
            options={BIRTH_MONTH_VALUES.map((month) => ({ value: month, label: month }))}
            onChange={(value) => {
              onChange({ birthMonth: value });
            }}
            required
          />
        </div>
      </div>

      {ageTag === null ? null : (
        /*
         * `VG6-B-09` — Tag(`76:440`)는 내용 폭 pill 이다. 부모(온보딩 `section` · 수정 화면 `section`)가
         * flex column(`align-items: stretch`)이라 Tag 를 그대로 두면 컬럼 폭 전체로 늘어났다. 행 방향 flex
         * 래퍼 안에서는 Tag 가 내용 폭이 된다 (inline 래퍼가 아니라 flex 라 line box 여분 높이 0).
         */
        <div className="flex">
          <Tag
            label={ageTag}
            tone="flexibility"
            size="sm"
            {...(ageLabel === null ? {} : { accessibleLabel: ageLabel })}
          />
        </div>
      )}

      <SelectTrigger
        label={copy.gender}
        value={form.gender}
        placeholder={copy.genderPlaceholder}
        options={GenderSchema.options.map((value) => ({
          value,
          label: copy.genderOptions[value],
        }))}
        onChange={(value) => {
          onChange({ gender: value as Gender });
        }}
        {...(errors.gender === undefined ? {} : { error: errors.gender })}
      />
    </>
  );
}

/** 언어 Chip 카드 — Figma `244:1314` (legend 포함, 카드 안). */
export function ChildLanguageFields({ form, onChange }: ChildInfoFieldsProps) {
  const copy = childCopy;
  // 칩 줄 사이 hit 영역을 중간선에서 나눈다 (G-1a, `D5-6` 방식).
  const chipGroupRef = useChipRowSplit();

  return (
    <div className="haru-language-card">
      {/*
        카드 안쪽 여백은 fieldset 이 아니라 이 래퍼가 갖는다 — `<legend>` 는 fieldset 의 **border 영역**에 그려져
        fieldset padding-top 이 legend **아래**로 밀린다(실측: legend 가 카드 위 끝 y+0 에 붙었다).
      */}
      <div className="haru-choice-card">
        <fieldset className="haru-choice-group haru-choice-group--card">
          <legend className="haru-choice-group__legend">
            <Text variant="footnote" tone="primary" as="span">
              {copy.languages}
            </Text>
          </legend>
          <div ref={chipGroupRef} className="haru-choice-group__chips">
            {LanguageEnvironmentSchema.options.map((code) => {
              const selected = form.languageEnvironment.includes(code);

              return (
                <Chip
                  key={code}
                  label={copy.languageOptions[code]}
                  variant="select"
                  selected={selected}
                  onToggle={() => {
                    const next: LanguageEnvironment[] = selected
                      ? form.languageEnvironment.filter((value) => value !== code)
                      : [...form.languageEnvironment, code];
                    onChange({ languageEnvironment: next });
                  }}
                />
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

/**
 * 독서 루틴 — Figma `244:1415` (섹션 라벨 `244:1358` + Answer card `244:1394`). legend 가 섹션 라벨 모양으로 보인다
 * (`child.css` `.haru-child-routine`) — 접근성 이름은 그대로 그룹 이름이다.
 */
export function ChildReadingRoutineField({ form, onChange, errors = {} }: ChildInfoFieldsProps) {
  const copy = childCopy;

  return (
    <div className="haru-child-routine">
      <RadioGroup
        legend={copy.readingRoutine}
        name="reading-routine"
        variant="card"
        value={form.readingRoutine}
        options={ReadingRoutineSchema.options.map((value) => ({
          value,
          label: copy.readingRoutineOptions[value],
        }))}
        onChange={(value) => {
          onChange({ readingRoutine: value as ReadingRoutine });
        }}
        {...(errors.readingRoutine === undefined ? {} : { error: errors.readingRoutine })}
      />
    </div>
  );
}
