/**
 * `features/onboarding-survey` 문구 — `.claude/rules/frontend.md` §8.
 *
 * ── 결정 **D-A** 구조 제약 ① (approvals §8.1) ──
 * **코드(machine key)는 `packages/contracts` 가, 표시 문구는 이 모듈이 소유한다.**
 * 저장되는 값은 코드이므로 여기 문구를 바꿔도 이미 저장된 응답이 무효가 되지 않는다.
 * `choiceOptions` · `questions` 는 contracts 의 코드 목록을 `satisfies Record<…>` 로 받기
 * 때문에, 코드가 추가·삭제되면 **컴파일이 깨져** 문구 누락을 배포 전에 잡는다.
 *
 * ── 결정 **D-B** 주의 (approvals §8.2) ──
 * Step 4(함께 키우고 싶은 것)와 프로필 결과(지금 관찰된 신호)는 같은 라벨을 쓰지만
 * **서로를 평가하지 않는다.** "목표 대비 달성" · "기대 vs 실제" · 점수 비교 · 미달 표현을
 * 쓰지 않는다. `__tests__/copy-language.test.ts` 가 금칙 표현을 고정한다.
 *
 * ── `S2-COPY-1` (approvals §6 ②) ──
 * Figma `179:1763` "About 3 minutes · 10 cards" / `179:1767` "Swipe each card away" 는
 * 5단계 소개 화면인데 Step 5 만 설명한다. 대체 문구는 **기획 결정 대기**이므로
 * `intro.durationSlot` · `intro.formatSlot` 을 **빈 슬롯(`null`)** 으로 둔다.
 * 그럴듯한 플레이스홀더를 넣지 않는다 — 넣으면 아무도 미결 사실을 눈치채지 못한다.
 */
import type {
  Capability,
  CaregiverRelationship,
  ChoiceQuestionId,
  Gender,
  LanguageEnvironment,
  ReadAloudBehavior,
  ReadingRoutine,
  StoryComfort,
  TopicTag,
} from '@haru/contracts';

/** 질문 문구 1건. `description` 은 선택이다. */
export interface QuestionCopy {
  prompt: string;
  description?: string;
}

export const onboardingCopy = {
  /** `/onboarding` 소개 — Design Spec §2.8 (Figma `179:1748`). */
  intro: {
    title: "Let's set up your child's profile",
    body: 'A few questions about what your read-aloud time looks like today. There are no right answers — what you notice is enough.',
    /**
     * `S2-COPY-1` — Figma `179:1763` 대체 문구 **미확정**. 소요 시간·단계 수를 여기에서
     * 정하지 않는다 (실측 근거 없음). 값이 `null` 이면 해당 InfoRow 를 그리지 않는다.
     */
    durationSlot: null as string | null,
    /** `S2-COPY-1` — Figma `179:1767` 대체 문구 **미확정**. */
    formatSlot: null as string | null,
    start: 'Start',
    resume: 'Pick up where you left off',
  },

  /** Trial · draft 안내 — Design Spec §2.12 (`C13-11`). */
  notices: {
    trialTitle: 'Your answers stay on this device',
    trialDescription: 'Create an account when you are ready, and we will bring them with you.',
    trialAction: 'Create account',
    expired: 'Your saved answers expired, so we are starting fresh.',
    unreadable: "We couldn't read the saved answers, so we are starting fresh.",
    dismiss: 'Dismiss',
  },

  /** 위저드 공통 chrome — Design Spec §2.9. */
  wizard: {
    back: 'Go back',
    next: 'Next',
    /** Trial 마지막 CTA — 가입으로 이어진다 (§2.12). */
    saveProfile: 'Save profile',
    /** 인증 상태의 마지막 CTA. */
    finish: 'Finish',
    progressLabel: 'Onboarding progress',
    stepOf: (step: number, total: number) => `Step ${String(step)} of ${String(total)}`,
    saveFailedTitle: "We couldn't save that just yet.",
    saveFailedDescription: 'Your answers are still here. We will try again as you continue.',
    /**
     * 필수 문항이 남아 CTA 를 아직 누를 수 없는 이유 (`S2-ONB-1`, Design Spec §2.9 정식 문구).
     * `aria-describedby` 로 버튼에 연결한다 — 동의 화면 `blockedReason` 과 같은 패턴이다.
     *
     * **계수형이다.** Step 2 는 필수 문항이 2건이라 단수형 "an answer" 가 어느 문항인지
     * 알려주지 못한다. 개수는 화면이 세지 않고 contracts 의 미응답 판정 결과
     * (`unansweredRequiredQuestions`) 길이에서 온다. 오류 문구가 아니다 — tone 은 secondary 다.
     */
    requiredBlockedReason: (count: number) =>
      count === 1
        ? 'Answer the question above to continue.'
        : `Answer the ${String(count)} questions above to continue.`,
  },

  /** 단계 제목 — TopBar. 순서·개수는 contracts `OnboardingStep` 이 정한다. */
  steps: {
    child_info: 'About your child',
    temperament: 'Reading together',
    books: 'Books and interests',
    goals: 'Growing together',
    capability_items: 'What you have noticed',
  } as const satisfies Record<string, string>,

  /** Step 1 — Design Spec §2.10 Step 1 (`179:1740` + `C13-04`). */
  childInfo: {
    childSection: 'ABOUT YOUR CHILD',
    caregiverSection: 'ABOUT YOU',
    homeSection: 'AT HOME',
    firstName: 'First name',
    lastName: 'Last name',
    lastNameOptional: 'Optional',
    birthYear: 'Birth year',
    birthMonth: 'Birth month',
    birthPlaceholder: 'Select',
    ageTagLabel: (years: number, months: number) => `${String(years)}yr ${String(months)}mo`,
    ageOutOfRange: 'HARU is built for ages 3 to 9 right now.',
    firstNameRequired: 'Please add a first name so we know what to call them.',
    birthRequired: 'Please choose a birth year and month.',
    gender: 'Gender',
    genderPlaceholder: 'Not selected',
    relationship: 'Your relationship to this child',
    relationshipPlaceholder: 'Select',
    languages: 'Languages you use at home',
    languagesRequired: 'Please pick at least one language you use at home.',
    readingRoutine: 'Reading routine',
    readingRoutineLegend: 'How often you read together',
  },

  /** Step 3 책 블록 — Design Spec §2.10 Step 3 (`C13-06`, 결정 D-17). */
  books: {
    favoritesSection: 'BOOKS YOUR CHILD LOVES',
    favoritesHint: 'Up to 5.',
    searchLabel: 'Search a book',
    searchClear: 'Clear',
    searchLoading: 'Searching books',
    emptyTitle: 'No match yet.',
    emptyDescription: 'You can add the title yourself.',
    addTyped: (query: string) => `Add “${query}” as a title`,
    limitReached: 'You can pick up to 5.',
    remove: (title: string) => `Remove ${title}`,
    selectedLabel: 'Books you picked',
    homeSection: 'BOOKS AT HOME',
    homeLabel: 'Add a book at home',
    homeAdd: 'Add',
    homeListLabel: 'Books at home',
    searchFailed: "We couldn't search right now.",
    tryAgain: 'Try again',
  },

  /** Step 5 — Design Spec §2.10 Step 5 (`179:1770` + `C13-08`). */
  survey: {
    deckLabel: 'Baseline questions',
    prevQuestion: 'Previous question',
    nextQuestion: 'Next question',
    questionOf: (index: number, total: number) => `Question ${String(index)} of ${String(total)}`,
    counter: (index: number, total: number) => `${String(index)} / ${String(total)}`,
    clearAnswer: 'Clear this answer',
    /** 비채점 6번째 옵션 그룹 하단 caption — 색·위치 외에 텍스트로도 성격을 전한다. */
    notScoredCaption: "This one isn't scored.",
    /** 아직 응답하지 않은 문항이 남았을 때 CTA 아래에 나오는 사유. */
    remaining: (count: number) =>
      count === 1 ? '1 question left.' : `${String(count)} questions left.`,
    submitFailedTitle: "We couldn't save the profile yet.",
    childLimit: 'This account already has a child profile.',
  },

  /**
   * Step 5 instrument **Trial 대체값** — 가입 전에는 서버 요청이 0건이라(AC-2-27) 문항을
   * 받아올 수 없다. 그래서 같은 문구를 기기에 두고 기본 instrument 를 조립한다
   * (`model/defaultInstrument.ts`).
   *
   * **문구의 실제 소유자는 서버다.** 인증·동의 이후에는 `GET /v1/onboarding` 의
   * `instrument.survey` 값이 이 표를 덮어쓴다 (AC-2-24 — 화면은 응답 값만 표시한다).
   * 원문: `docs/source/HARU_Developmental_Baseline_Survey_v1.docx.md`.
   */
  baselineFallback: {
    stem: 'IN THE PAST TWO WEEKS',
    scaleLabels: {
      1: 'Never',
      2: 'Rarely',
      3: 'Sometimes',
      4: 'Often',
      5: 'Almost always',
      not_observed: "Haven't had the chance to see this yet",
    },
    items: {
      ER1: 'When your child got upset, how often were they able to calm down within a few minutes, with your help or comfort?',
      ER2: 'After getting upset, how often was your child able to name or show you what they were feeling — through words, pointing, or gestures?',
      AG1: 'When there was something your child could do themselves, how often did they take it on and do it, rather than needing you to do it for them?',
      AG2: 'When your child hit a small difficulty, how often did they keep trying for a bit before giving up or asking for help?',
      AG3: 'How often did your child start and keep going their own pretend play, without you setting it up for them?',
      CF1: 'When plans changed unexpectedly, how often did your child adjust without getting badly stuck on it?',
      CF2: "When your child couldn't have or do the exact thing they wanted, how often could they accept a substitute or a “later”?",
      IM1: 'How often did your child bring something from a book back up later — a character, an idea, a question — outside of reading time?',
      IM2: 'How often did your child ask “why” or “what if” questions about the world around them?',
      IM3: 'During reading together, how often did your child seem genuinely absorbed or delighted?',
    },
  },

  /** `/onboarding/saved` — Design Spec §2.11 (Figma `179:1809`). */
  saved: {
    title: "Thank you — that's the starting point",
    cta: 'Get started',
  },

  /**
   * Step 2~4 질문 문구 — **문항 목록·순서는 여기에 없다.** instrument 가 정한다 (구조 제약 ②).
   * 이 표는 id → 문구 매핑일 뿐이며, instrument 가 `prompt` 를 내려주면 그쪽이 우선한다.
   */
  questions: {
    'temperament.story_comfort': {
      prompt: 'When you read to your child, which kinds of stories tend to go best?',
    },
    'temperament.read_aloud_behavior': {
      prompt: 'During read-aloud, what does your child usually do?',
    },
    'books.topic_tags': {
      prompt: 'What does your child tend to reach for in books?',
      description: 'Pick up to two.',
    },
    'goals.growth_goals': {
      prompt: 'What would you like to grow together?',
      // 최소·최대를 함께 말한다 (`S2-ONB-1`, §2.10 Step 4). Chip 그룹은 `role="group"` 이라
      // `aria-required` 를 쓸 수 없으므로 이 보조 문구가 필수성을 전달한다.
      description: 'Pick at least one, up to two.',
    },
  } as const satisfies Record<ChoiceQuestionId, QuestionCopy>,

  /**
   * 선택지 문구 — 코드별 라벨. 질문지 v1.1 의 보호자 노출 문구를 그대로 쓴다.
   * instrument 옵션에 `label` 이 있으면 그쪽이 우선한다 (서버 주도 교체 경로).
   */
  choiceOptions: {
    'temperament.story_comfort': {
      quiet_gentle: 'Quiet, gentle stories — bedtime-style, slow pace',
      some_adventure: 'A bit of adventure, but nothing too intense',
      wild_ride: 'They love a wild ride — big feelings, big action',
      depends_on_the_day: 'It really depends on the day or their mood',
    } satisfies Record<StoryComfort, string>,
    'temperament.read_aloud_behavior': {
      sits_and_listens: 'Sits close and listens',
      points_and_touches: 'Wants to point, touch, turn pages',
      acts_it_out: "Acts things out, can't sit still",
      asks_questions: 'Asks lots of questions',
      moves_but_listens: 'Moves around but is clearly listening',
    } satisfies Record<ReadAloudBehavior, string>,
    'books.topic_tags': {
      narrative: "Characters and stories — what happens, who's in it",
      inquiry: 'How things work, animals, the world around them',
      artistic: 'Colors, art, things that look beautiful or interesting',
      social: 'Books with other kids, families, friendships',
      not_sure_yet: "Honestly not sure yet — they're still figuring it out",
    } satisfies Record<TopicTag, string>,
    'goals.growth_goals': {
      emotion_regulation: 'Helping with big feelings — when emotions feel overwhelming',
      self_directed_agency: 'Building their confidence and sense of “I can do it”',
      cognitive_flexibility: "Helping them adjust when things change or don't go their way",
      intrinsic_motivation: 'Sparking their wonder about the world and connection with us',
    } satisfies Record<Capability, string>,
  } as const satisfies Record<ChoiceQuestionId, Record<string, string>>,

  /** Step 1 enum 라벨 — 값은 contracts, 문구는 여기. */
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

  readingRoutineOptions: {
    daily: 'Just about every day',
    few_times_a_week: 'A few times a week',
    weekends_only: 'Mostly on weekends',
    occasionally: 'Every now and then',
    just_starting: "We're just starting",
  } as const satisfies Record<ReadingRoutine, string>,
} as const;
