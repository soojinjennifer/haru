/**
 * 설문 카드 문구 — 온보딩 설문(`features/onboarding-survey`)과 설문 재응답(`features/survey-update`)이 **함께** 쓴다
 * (Stage 6 `R-5` · `N6-06` ⓐ — 카드 렌더러·instrument 해석을 하위 레이어로 이동).
 *
 * **이동만 했다** — 값은 Stage 2 `onboardingCopy` 의 해당 키와 한 글자도 다르지 않다. `onboardingCopy` 는 이 객체를
 * **참조**한다 (두 벌 0). 그래서 Stage 2 의 copy 테스트(`copy-language.test.ts`)는 그대로 이 값들을 본다.
 *
 * ── 결정 **D-A** 구조 제약 ① (Stage 2 approvals §8.1) ──
 * **코드(machine key)는 `packages/contracts` 가, 표시 문구는 copy 모듈이 소유한다.** `choiceOptions` · `questions` 는
 * contracts 의 코드 목록을 `satisfies Record<…>` 로 받기 때문에 코드가 추가·삭제되면 **컴파일이 깨진다**.
 *
 * ── 숫자 리터럴 금지 (`AC-2R-09`) ── 카드 수 · 소요 시간 · 선택 상한은 전부 함수 슬롯이다.
 */
import type {
  Capability,
  ChoiceQuestionId,
  ReadAloudBehavior,
  StoryComfort,
  TopicTag,
} from '@haru/contracts';

/** 질문 문구 1건. `description` 은 선택이다. */
export interface QuestionCopy {
  prompt: string;
  description?: string;
}

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

export const surveyCardCopy = {
  /** 소요 시간 안내 *"About N minutes"* — 숫자는 instrument `estimates` 에서 온다 (`R-03`). */
  minutes: (minutes: number) => `About ${String(minutes)} ${plural(minutes, 'minute', 'minutes')}`,

  /**
   * 단계 제목 — 카드 화면 TopBar. 순서·개수는 contracts `OnboardingStep` 이 정한다.
   * `capability_items` 는 `R-13` 으로 **`Capability`** 다 (허용 차이 `AD-S2R-09`).
   */
  steps: {
    child_info: 'About your child',
    reading_together: 'Reading together',
    books_and_interests: 'Books and interests',
    growing_together: 'Growing together',
    capability_items: 'Capability',
  } as const satisfies Record<string, string>,

  /** 좋아하는 책 카드 — Stage 2 Design Spec §6.3 (검색 없음 — `§11.13`). */
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

  /** 카드 덱 — Stage 2 Design Spec §3 (Figma `179:1770`). */
  deck: {
    deckLabel: 'Onboarding questions',
    progressLabel: 'Onboarding progress',
    back: 'Go back',
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
    /**
     * 필수 문항이 남아 전진할 수 없는 이유 (`S2-ONB-1`). 카드 안쪽 옵션 아래 1행이며
     * 오류 문구가 아니다 — tone 은 secondary 다 (Design Spec §3.2).
     */
    requiredBlockedReason: 'Answer this one to move on.',
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
} as const;
