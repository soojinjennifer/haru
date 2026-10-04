/**
 * 아이 기본 정보 필드 문구 — `.claude/rules/frontend.md` §8.
 *
 * ── 왜 feature copy 가 아니라 `shared/copy` 인가 ──
 * 재구성 결정 `R-01`(`stage-3-approvals.md` §11.5)로 **같은 필드를 두 화면이 쓴다**:
 * `/auth/sign-up`(features/auth)에서 입력받고 `/onboarding/child-info`
 * (features/onboarding-survey)에서 표시·편집한다. feature 간 직접 import 는 금지이므로
 * (`rules/architecture.md` §3) 문구를 양쪽에 베껴 적는 대신 `shared` 에 한 번만 둔다.
 *
 * 문구는 진단·판정 표현을 쓰지 않는다. 오류 문구는 "무슨 일이 있었는지 + 다음에 할 수 있는 것" 이다.
 */
import type { CaregiverRelationship, Gender, LanguageEnvironment } from '@haru/contracts';

export const childCopy = {
  /** 섹션 라벨 — Figma `179:1739` · `244:1427`. */
  childSection: 'YOUR CHILD',
  caregiverSection: 'ABOUT YOU',
  homeSection: 'AT HOME',

  firstName: 'First name',
  lastName: 'Last name',
  lastNameOptional: 'Optional',
  birthYear: 'Birth year',
  birthMonth: 'Birth month',
  birthPlaceholder: 'Select',

  /** 파생 표시값 — 서버 값이 아니다 (`R-09` · `D-10`). */
  ageTagLabel: (years: number, months: number) => `${String(years)}yr ${String(months)}mo`,
  /** 같은 값의 접근성 이름. tag 를 `aria-hidden` 으로 숨기지 않는다 (§4.3). */
  ageAccessibleLabel: (years: number, months: number) =>
    `${String(years)} ${years === 1 ? 'year' : 'years'} ${String(months)} ${
      months === 1 ? 'month' : 'months'
    }`,

  ageOutOfRange: 'HARU is built for ages 3 to 9 right now.',
  firstNameRequired: 'Please add a first name so we know what to call them.',
  birthRequired: 'Please choose a birth year and month.',

  gender: 'Gender',
  genderPlaceholder: 'Not selected',

  relationship: 'Your relationship to this child',
  relationshipPlaceholder: 'Select',

  languages: 'Languages you use at home',
  readingRoutine: 'Reading routine',
  readingRoutineLegend: 'How often you read together',

  /**
   * `About your child` 표시 ↔ 편집 전환 (`R-08`, Design Spec §4.3).
   * 섹션 헤더 우측 아이콘 1개가 발견 가능성을, 행 탭이 도달 경로를 담당한다.
   */
  editChild: "Edit your child's name, birth month and gender",
  editDone: 'Done',
  /** display 행의 숨김 보조 설명 — 눌리면 편집이라는 사실을 전달한다. */
  editRowHint: 'Edit',

  genderOptions: {
    girl: 'Girl',
    boy: 'Boy',
    prefer_not_to_say: 'Prefer not to say',
  } as const satisfies Record<Gender, string>,

  relationshipOptions: {
    mother: 'Mother',
    father: 'Father',
    grandparent: 'Grandparent',
    babysitter: 'Babysitter',
    tutor: 'Tutor',
    therapist: 'Therapist',
    other: 'Other',
  } as const satisfies Record<CaregiverRelationship, string>,

  languageOptions: {
    english: 'English',
    spanish: 'Spanish',
    chinese: 'Chinese',
    korean: 'Korean',
    vietnamese: 'Vietnamese',
    tagalog: 'Tagalog',
    arabic: 'Arabic',
    french: 'French',
    other: 'Another language',
  } as const satisfies Record<LanguageEnvironment, string>,
} as const;
