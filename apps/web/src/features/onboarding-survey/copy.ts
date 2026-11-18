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
import { surveyCardCopy } from '../../entities/survey';
import { childCopy } from '../../shared/copy/child-copy';

/** 질문 문구 1건 — Stage 6 `R-5` 로 `entities/survey` 가 소유한다 (이름 유지용 재노출). */
export type { QuestionCopy } from '../../entities/survey';

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
      duration: surveyCardCopy.minutes,
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
    back: surveyCardCopy.deck.back,
    next: 'Next',
    /** Trial 마지막 CTA — 가입으로 이어진다 (§2.12). */
    saveProfile: 'Save profile',
    /** 인증 상태의 마지막 CTA. */
    finish: 'Finish',
    progressLabel: surveyCardCopy.deck.progressLabel,
    saveFailedTitle: "We couldn't save that just yet.",
    saveFailedDescription: 'Your answers are still here. We will try again as you continue.',
    /** 필수 문항 전진 차단 사유 (`S2-ONB-1`) — `entities/survey` 소유 (`R-5`). */
    requiredBlockedReason: surveyCardCopy.deck.requiredBlockedReason,
  },

  /**
   * 단계 제목 — TopBar. 순서·개수는 contracts `OnboardingStep` 이 정한다.
   * `capability_items` 는 `R-13` 으로 **`Capability`** 다 (허용 차이 `AD-S2R-09`).
   */
  steps: surveyCardCopy.steps,

  /** `About your child` — Design Spec §4 (Figma `248:1159`). 문구는 `shared/copy` 가 소유한다. */
  childInfo: childCopy,

  /** 좋아하는 책 카드 — Design Spec §6.3 (검색 없음 — `§11.13`). */
  books: surveyCardCopy.books,

  /** 카드 덱 — Design Spec §3 (Figma `179:1770`). */
  survey: {
    deckLabel: surveyCardCopy.deck.deckLabel,
    prevQuestion: surveyCardCopy.deck.prevQuestion,
    nextQuestion: surveyCardCopy.deck.nextQuestion,
    counter: surveyCardCopy.deck.counter,
    cardAnnouncement: surveyCardCopy.deck.cardAnnouncement,
    clearAnswer: surveyCardCopy.deck.clearAnswer,
    notScoredCaption: surveyCardCopy.deck.notScoredCaption,
    remaining: surveyCardCopy.deck.remaining,
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
  questions: surveyCardCopy.questions,

  /**
   * 선택지 문구 — 코드별 라벨. 질문지 v1.1 의 보호자 노출 문구를 그대로 쓴다.
   * instrument 옵션에 `label` 이 있으면 그쪽이 우선한다 (서버 주도 교체 경로).
   */
  choiceOptions: surveyCardCopy.choiceOptions,

  /** enum 라벨 — 값은 contracts, 문구는 `shared/copy/child-copy`. */
  genderOptions: childCopy.genderOptions,
  relationshipOptions: childCopy.relationshipOptions,
  languageOptions: childCopy.languageOptions,
  readingRoutineOptions: childCopy.readingRoutineOptions,
} as const;
