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
 * `growing_together`(함께 키우고 싶은 것)와 프로필 결과(지금 관찰된 신호)는 같은 라벨을 쓰지만
 * **서로를 평가하지 않는다.** "목표 대비 달성" · "기대 vs 실제" · 점수 비교 · 미달 표현을
 * 쓰지 않는다. `__tests__/copy-language.test.ts` 가 금칙 표현을 고정한다.
 *
 * ── 숫자 리터럴 금지 (`AC-2R-09`) ──
 * 카드 수 · 소요 시간 · 단계 수 · 선택 상한은 **전부 함수 슬롯**이다. 값은 instrument ·
 * contracts 상수 · fixture 에서 온다. 이 파일에 숫자를 적지 않는다.
 */
import type {
  Capability,
  ChoiceQuestionId,
  ReadAloudBehavior,
  ReadingRoutine,
  StoryComfort,
  TopicTag,
} from '@haru/contracts';

import { childCopy } from '../../shared/copy/child-copy';

/** 질문 문구 1건. `description` 은 선택이다. */
export interface QuestionCopy {
  prompt: string;
  description?: string;
}

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

export const onboardingCopy = {
  /**
   * 소개 화면 2종 — Design Spec §2.2 (`§11.10` 으로 2벌 분리 확정).
   *
   * `profile` = `/onboarding/start` (Figma `243:1147`) · `survey` = `/onboarding` (`179:1748`).
   * 두 화면은 **레이아웃이 같고 copy 만 다르다**.
   */
  intro: {
    profile: {
      /** Figma `243:1156` */
      title: "Let's set up your child's profile",
      /** Figma `243:1157` */
      body: 'A few questions about what your read-aloud time looks like today. There are no right answers — what you notice is enough.',
      /**
       * Figma `243:1160` "About 1 minutes" — 숫자는 instrument `estimates` 에서 온다 (`R-03`).
       * Figma 의 복수형 오타는 옮기지 않는다 (허용 차이 `AD-S2R-02`).
       */
      duration: (minutes: number) =>
        `About ${String(minutes)} ${plural(minutes, 'minute', 'minutes')}`,
      /** Figma `243:1165` */
      format: 'Input your answers',
      /** Figma `243:1167` */
      cta: 'Start the questions',
    },
    survey: {
      /** Figma `179:1757` — `{name}` 은 보호자가 입력한 아이 이름이다. */
      title: (childFirstName: string) =>
        `Hi — before your first night with ${childFirstName}, a few quick questions`,
      /** 이름을 아직 모를 때 (`missing-prefill`). */
      titleWithoutName: 'Before your first night together, a few quick questions',
      /**
       * Figma `179:1758` 에서 숫자 절(`Ten short questions`)과 기간 절(`in the last two weeks`)을
       * 제거하고 남은 **Figma 원문**이다 (`S2R-OPEN-1` A — 허용 차이 `AD-S2R-11`).
       */
      body: 'No right answers — we just need a starting point.',
      /** Figma `179:1763` "About 3 minutes · about 10 cards" — 두 숫자 모두 파생값이다. */
      duration: (minutes: number, cards: number) =>
        `About ${String(minutes)} ${plural(minutes, 'minute', 'minutes')} · ${String(cards)} ${plural(
          cards,
          'card',
          'cards',
        )}`,
      /** Figma `179:1767` */
      format: 'Swipe each card away to move on',
      /** Figma `179:1768` */
      cta: 'Start',
      resume: 'Pick up where you left off',
    },
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

  /** 위저드 공통 chrome — Design Spec §3.1 · §3.2. */
  wizard: {
    back: 'Go back',
    next: 'Next',
    /** Trial 마지막 CTA — 가입으로 이어진다 (§2.12). */
    saveProfile: 'Save profile',
    /** 인증 상태의 마지막 CTA. */
    finish: 'Finish',
    progressLabel: 'Onboarding progress',
    saveFailedTitle: "We couldn't save that just yet.",
    saveFailedDescription: 'Your answers are still here. We will try again as you continue.',
    /**
     * 필수 문항이 남아 전진할 수 없는 이유 (`S2-ONB-1`). 카드 안쪽 옵션 아래 1행이며
     * 오류 문구가 아니다 — tone 은 secondary 다 (Design Spec §3.2).
     */
    requiredBlockedReason: 'Answer this one to move on.',
  },

  /**
   * 단계 제목 — TopBar. 순서·개수는 contracts `OnboardingStep` 이 정한다.
   * `capability_items` 는 `R-13` 으로 **`Capability`** 다 (허용 차이 `AD-S2R-09`).
   */
  steps: {
    child_info: 'About your child',
    reading_together: 'Reading together',
    books_and_interests: 'Books and interests',
    growing_together: 'Growing together',
    capability_items: 'Capability',
  } as const satisfies Record<string, string>,

  /** `About your child` — Design Spec §4 (Figma `248:1159`). 문구는 `shared/copy` 가 소유한다. */
  childInfo: childCopy,

  /** 좋아하는 책 카드 — Design Spec §6.3 (검색 없음 — `§11.13`). */
  books: {
    /** 카드 문항 (`§11.14` — 기존 섹션 라벨을 그대로 문장으로 쓴다, 문구 창작 0건). */
    favoritesSection: 'Books your child loves',
    /** 상한을 말한다. 숫자는 contracts `FAVORITE_BOOKS_MAX` 에서 온다. */
    favoritesHint: (max: number) => `Up to ${String(max)}.`,
    /** 상한 도달 시 — favorites 는 **거절**한다 (`§11.15` 의도된 차이). */
    limitReached: (max: number) => `You can pick up to ${String(max)}.`,
    /** 입력 행의 추가 액션. */
    addAction: 'Add',
    remove: (title: string) => `Remove ${title}`,
    selectedLabel: 'Books you picked',
  },

  /** 카드 덱 — Design Spec §3 (Figma `179:1770`). */
  survey: {
    deckLabel: 'Onboarding questions',
    prevQuestion: 'Previous question',
    nextQuestion: 'Next question',
    /** 카드 안쪽 좌상단 통산 카운터 `n / 16` (`R-02`). 숫자는 파생값이다. */
    counter: (index: number, total: number) => `${String(index)} / ${String(total)}`,
    /** 카드가 바뀔 때 `aria-live` 로 읽히는 문구 (Design Spec §14.3). */
    cardAnnouncement: (stepTitle: string, index: number, total: number) =>
      `${stepTitle} · ${String(index)} of ${String(total)}`,
    clearAnswer: 'Clear this answer',
    /** 비채점 6번째 옵션 그룹 하단 caption — 색·위치 외에 텍스트로도 성격을 전한다. */
    notScoredCaption: "This one isn't scored.",
    /** 아직 응답하지 않은 문항이 남았을 때 마지막 카드 CTA 위에 나오는 사유. */
    remaining: (count: number) =>
      `${String(count)} ${plural(count, 'question', 'questions')} left.`,
    submitFailedTitle: "We couldn't save the profile yet.",
    childLimit: 'This account already has a child profile.',
  },

  /**
   * 역량 문항 instrument **Trial 대체값** — 가입 전에는 서버 요청이 0건이라(AC-2-27) 문항을
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
   * 선택형 질문 문구 — **문항 목록·순서는 여기에 없다.** instrument 가 정한다 (구조 제약 ②).
   * 이 표는 id → 문구 매핑일 뿐이며, instrument 가 `prompt` 를 내려주면 그쪽이 우선한다.
   */
  questions: {
    'reading_together.story_comfort': {
      prompt: 'When you read to your child, which kinds of stories tend to go best?',
    },
    'reading_together.read_aloud_behavior': {
      prompt: 'During read-aloud, what does your child usually do?',
    },
    'books_and_interests.topic_tags': {
      prompt: 'What does your child tend to reach for in books?',
      description: 'Pick up to two.',
    },
    /** 질문지 v1.1 Q5 원문 (`§11.11`). 책 제목은 instrument 선택지가 소유한다. */
    'books_and_interests.owned_books': {
      prompt: 'Which of these does your child already know well?',
      description: "Tap any books you've read together more than a few times.",
    },
    'growing_together.growth_goals': {
      prompt: 'What would you like to grow together?',
      // 최소·최대를 함께 말한다 (`S2-ONB-1`). 복수 선택 그룹은 `role="group"` 이라
      // `aria-required` 를 쓸 수 없으므로 이 보조 문구가 필수성을 전달한다.
      description: 'Pick at least one, up to two.',
    },
  } as const satisfies Record<ChoiceQuestionId, QuestionCopy>,

  /**
   * 선택지 문구 — 코드별 라벨. 질문지 v1.1 의 보호자 노출 문구를 그대로 쓴다.
   * instrument 옵션에 `label` 이 있으면 그쪽이 우선한다 (서버 주도 교체 경로).
   */
  choiceOptions: {
    'reading_together.story_comfort': {
      quiet_gentle: 'Quiet, gentle stories — bedtime-style, slow pace',
      some_adventure: 'A bit of adventure, but nothing too intense',
      wild_ride: 'They love a wild ride — big feelings, big action',
      depends_on_the_day: 'It really depends on the day or their mood',
    } satisfies Record<StoryComfort, string>,
    'reading_together.read_aloud_behavior': {
      sits_and_listens: 'Sits close and listens',
      points_and_touches: 'Wants to point, touch, turn pages',
      acts_it_out: "Acts things out, can't sit still",
      asks_questions: 'Asks lots of questions',
      moves_but_listens: 'Moves around but is clearly listening',
    } satisfies Record<ReadAloudBehavior, string>,
    'books_and_interests.topic_tags': {
      narrative: "Characters and stories — what happens, who's in it",
      inquiry: 'How things work, animals, the world around them',
      artistic: 'Colors, art, things that look beautiful or interesting',
      social: 'Books with other kids, families, friendships',
      not_sure_yet: "Honestly not sure yet — they're still figuring it out",
    } satisfies Record<TopicTag, string>,
    /**
     * Q5 는 라벨 표가 **비어 있다** — 선택지가 책 id 이고 제목은 instrument 의 `label` 로
     * 내려온다 (`§11.11`: 8권 제목은 Mock fixture 소유, 화면·copy 하드코딩 금지).
     */
    'books_and_interests.owned_books': {},
    'growing_together.growth_goals': {
      emotion_regulation: 'Helping with big feelings — when emotions feel overwhelming',
      self_directed_agency: 'Building their confidence and sense of “I can do it”',
      cognitive_flexibility: "Helping them adjust when things change or don't go their way",
      intrinsic_motivation: 'Sparking their wonder about the world and connection with us',
    } satisfies Record<Capability, string>,
  } as const satisfies Record<ChoiceQuestionId, Record<string, string>>,

  /** enum 라벨 — 값은 contracts, 문구는 `shared/copy/child-copy`. */
  genderOptions: childCopy.genderOptions,
  relationshipOptions: childCopy.relationshipOptions,
  languageOptions: childCopy.languageOptions,
  readingRoutineOptions: {
    daily: 'Just about every day',
    few_times_a_week: 'A few times a week',
    weekends_only: 'Mostly on weekends',
    occasionally: 'Every now and then',
    just_starting: "We're just starting",
  } as const satisfies Record<ReadingRoutine, string>,
} as const;
