/**
 * Storytime Session fixture — Stage 4 Plan §8 · `docs/API_CONTRACTS.md` §3.2.
 *
 * 규칙
 *  - **가상 데이터만** 담는다 (실제 아동 데이터 금지). 아이 이름을 문구에 넣지 않는다.
 *  - 버블·스티커 문구는 **서버가 만든 완성문**을 흉내낸 값이다. 화면은 이 값을 그대로 그린다
 *    (`D4-2` · `D4-20` — Frontend 는 문구를 생성·가공하지 않는다).
 *  - ready 인사(`bubble.text`)는 `D4-21` 길이 요구(≈28자 이내, 아이 이름을 끝에 두지 않음)를 지킨다.
 *  - 시각은 주입 clock 의 상대 오프셋으로만 만든다 (결정성).
 *  - 금지어(진단·판정·비교 · `streak` · `goal` · `%`)를 쓰지 않는다.
 */
import {
  SessionSummarySchema,
  StickerAwardSchema,
  type BookSummary,
  type Prompt,
  type SessionBubbleCopy,
  type SessionSummary,
  type StickerAward,
} from '@haru/contracts';

import { shiftedIso, type Clock } from '../../shared/lib/clock';

import { MOCK_BOOKS } from './books';
import { MOCK_ACTIVE_SESSION_ID } from './home';
import { createLibraryOverviewFixture, findLibraryBook } from './library';
import { createPromptPreviewFixture } from './prompt-sets';
import { DECK_BOOKS, findDeckBook } from './saved-books';

/** ready 버블 제목 줄 (`139:2803`, `D4-20`). 27자 — `D4-21` 상한 안이다. */
export const MOCK_READY_BUBBLE: SessionBubbleCopy = {
  text: 'Ready for a story together?',
  templateId: 'mock-ready-greeting',
};

/**
 * ready 5분 리마인드 버블 제목 줄 (`D4-46`·`D4-59`, `API_CONTRACTS.md` §3.2.2) — 예시 문구.
 * 제품 문구는 Backend 검수 템플릿이 만든다 (`P4-BIP-11`). 아이 이름 없음 (`D4-21`).
 */
export const MOCK_READY_REMINDER_BUBBLE: SessionBubbleCopy = {
  text: 'Ready when you are!',
  templateId: 'mock-ready-reminder',
};

/**
 * 완료 버블 (`88:929` override 문자열 그대로, FR-10 · `D4-87`). `subtext` 는 고정 Mock 값이다 — 세션의
 * `recordedSeconds` 를 반영하지 않는다 (`API_CONTRACTS.md` §3.2.3).
 * `completed` 전이 응답과 완료 계열 `SessionDetail` 이 같은 값을 낸다.
 */
export const MOCK_COMPLETION_BUBBLE = {
  text: 'Storytime success! Emma did wonderfully.',
  templateId: 'mock-completion',
  subtext: '14 min together · sticker earned',
} as const satisfies SessionBubbleCopy;

/**
 * 보조 줄 없는 완료 버블 — `session-completion:subtext-missing` · 스티커 없는 지난 세션 seed.
 * `subtext` 가 `sticker earned` 를 말하면서 `sticker: null` 이면 응답이 스스로 모순된다 (§3.2.3).
 */
export const MOCK_COMPLETION_BUBBLE_NO_SUBTEXT = {
  ...MOCK_COMPLETION_BUBBLE,
  subtext: null,
} as const satisfies SessionBubbleCopy;

/** 스티커 칩 문구 — 부제는 확정 문구다 (`D4-10`, `AD-S4-1`). 연속 일수는 담지 않는다 (`D4-2`). */
export const MOCK_STICKER_TITLE = 'Attendance sticker';
export const MOCK_STICKER_MESSAGE = 'You read together today';

/** 지난 세션(목록 `success`) — 고정 uuid. scenario 간에도 같아야 비교가 쉽다. */
export const MOCK_HISTORY_SESSION_IDS = [
  '77777777-7777-4777-8777-000000000001',
  '77777777-7777-4777-8777-000000000002',
] as const;

/** 지난 세션의 녹음 — 고정 uuid. */
export const MOCK_HISTORY_RECORDING_IDS = [
  '88888888-8888-4888-8888-000000000001',
  '88888888-8888-4888-8888-000000000002',
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** 원본 녹음 보관 기간 — PRD §7.8 (90일). 만료 시각 표시용. */
export const MOCK_RAW_AUDIO_RETENTION_MS = 90 * DAY_MS;

/**
 * ready 인사 변형 (Stage 4 `S4-F1`, AC-4-120 ⑥ · AC-4-121) — 전부 **아이 이름 없음**.
 *
 * - `long` 은 `D4-21` 상한(≤240px @ Semibold 16)을 **393 가용 폭 297 까지** 넘긴다 → 두 폭 모두 말줄임.
 * - `tight` 는 240 은 넘고 297 은 넘지 않는다 → 393 에서 1줄, **320 에서만** 말줄임.
 *   (Spec §2.2.3-⑥ 의 `Ready for today's story with Emma?` 271.32px 와 같은 구간 — 이름만 뺐다.)
 * 둘 다 **제약 위반 입력**이다 — clamp 가 조용히 빠지는 회귀를 잡는 용도다 (Spec §2.2.3-⑧).
 */
export const MOCK_READY_BUBBLE_LONG: SessionBubbleCopy = {
  text: 'Ready for a cozy bedtime story together tonight?',
  templateId: 'mock-ready-greeting-long',
};
export const MOCK_READY_BUBBLE_TIGHT: SessionBubbleCopy = {
  text: "Ready for today's story with us?",
  templateId: 'mock-ready-greeting-tight',
};
/** 인사 없음 2종 (`D4-22`) — `null` 과 빈 문자열. 제목 줄을 렌더하지 않는다. */
export const MOCK_READY_BUBBLE_EMPTY: SessionBubbleCopy = {
  text: '',
  templateId: 'mock-ready-greeting-empty',
};

/** 기본 5개 뒤에 붙는 2개 — n=7 (Prompt 개수 상한 없음 `D-21`, 버블은 5개 컷오프). */
const EXTRA_SESSION_PROMPTS: readonly Prompt[] = [
  {
    id: '55555555-5555-4555-8555-00005e5e0005',
    kind: 'question',
    text: 'What do you think happens after the last page?',
    order: 5,
    phase: 'post',
    pageRef: null,
    coachingNote:
      'Imagining past the ending shows what your child thinks the story was really about. Any answer works; ask what made them think so.',
  },
  {
    id: '55555555-5555-4555-8555-00005e5e0006',
    kind: 'question',
    text: 'Which picture would you want to step into?',
    order: 6,
    phase: null,
    pageRef: null,
    coachingNote:
      'Choosing a picture is an easy way in for a quiet reader. Let them point first and talk second.',
  },
];

/** 세션 Prompt 개수 변형 — `session:prompts-*` (Plan §12). */
/**
 * 책 칩 변형 fixture (`session:book-*`, 4b Plan §12 · AC-4-126). 가상의 책이다 — 실제 아동·서지 데이터 아님.
 * 긴 제목은 40자 이상 — 393 · 320 컬럼 모두에서 1줄 말줄임이 일어난다.
 */
export const MOCK_SESSION_BOOK_NO_COVER: BookSummary = {
  id: '0b0c5e55-0000-4000-8000-00000000c0e1',
  title: 'The Quiet Garden',
  author: 'Mina Park',
};

export const MOCK_SESSION_BOOK_LONG_TITLE: BookSummary = {
  id: '0b0c5e55-0000-4000-8000-00000000c0e2',
  title: 'The Very Long Adventure of the Little Cloud Who Wanted to See the Sea',
  author: 'Mina Park',
};

export type SessionPromptCount = 0 | 1 | 3 | 5 | 7;

/** 세션 Prompt — ready 버블 pill 과 Drawer 가 **같은 출처**를 쓴다 (`D4-14`). */
export function createSessionPromptsFixture(count: SessionPromptCount = 5): Prompt[] {
  // seed 는 uuid 마지막 그룹에 들어가므로 16진수 문자만 쓴다 (`prompt-sets.ts` fixtureId).
  const base = createPromptPreviewFixture('5e55');
  if (count === 7) return [...base, ...EXTRA_SESSION_PROMPTS];
  return base.slice(0, count);
}

/**
 * 세션의 책을 찾는다. `undefined` = 모르는 책 (서버라면 `RESOURCE_NOT_FOUND`).
 *
 * - `bookId` — Activity Card 덱 · 서재 선반 · 검색 카탈로그 순으로 찾는다
 * - `childBookId` — 서재 항목(`LibraryBook.id`)으로 찾는다. 사용자가 직접 입력한 책은 `book: null`
 */
export function resolveSessionBook(
  clock: Clock,
  bookId: string | null,
  childBookId: string | null,
): BookSummary | null | undefined {
  if (bookId !== null) {
    return (
      findDeckBook(bookId) ?? findLibraryBook(bookId) ?? MOCK_BOOKS.find((b) => b.id === bookId)
    );
  }

  if (childBookId !== null) {
    const overview = createLibraryOverviewFixture(clock, 'full');
    const items = [
      ...(overview.readingNow === null ? [] : [overview.readingNow]),
      ...overview.sections.flatMap((section) => section.items),
    ];
    const item = items.find((entry) => entry.id === childBookId);
    return item === undefined ? undefined : item.book;
  }

  return null;
}

export function createStickerAwardFixture(
  id: string,
  sessionId: string,
  awardedAt: string,
): StickerAward {
  return StickerAwardSchema.parse({
    id,
    sessionId,
    stickerType: 'attendance',
    awardedAt,
    title: MOCK_STICKER_TITLE,
    message: MOCK_STICKER_MESSAGE,
  });
}

export interface ReadySessionFixtureInput {
  id: string;
  mode: SessionSummary['mode'];
  book: BookSummary | null;
  readingContext: SessionSummary['readingContext'];
  readyAt: string;
  /** 기본 = `MOCK_READY_BUBBLE` (scenario `session-greeting:*` 가 바꾼다). */
  bubble?: SessionBubbleCopy;
  /** 기본 = `MOCK_READY_REMINDER_BUBBLE` (scenario `session-greeting:reminder-missing` = `null`). */
  reminderBubble?: SessionBubbleCopy;
  /** 기본 = 5 (scenario `session:prompts-*` 가 바꾼다). */
  promptCount?: SessionPromptCount;
}

/** 방금 만든 세션 (`POST /v1/sessions` 응답). */
export function createReadySessionFixture(input: ReadySessionFixtureInput): SessionSummary {
  return SessionSummarySchema.parse({
    id: input.id,
    status: 'ready',
    mode: input.mode,
    book: input.book,
    readingContext: input.readingContext,
    readyAt: input.readyAt,
    startedAt: null,
    completedAt: null,
    completedReason: null,
    recordedSeconds: 0,
    analysisOutcome: null,
    prompts: createSessionPromptsFixture(input.promptCount ?? 5),
    bubble: input.bubble === undefined ? MOCK_READY_BUBBLE : input.bubble,
    reminderBubble:
      input.reminderBubble === undefined ? MOCK_READY_REMINDER_BUBBLE : input.reminderBubble,
  });
}

/**
 * 진행 중 세션 (`session-already-active`) — Home 의 `activeSession`(`fixtures/home.ts`)과
 * **같은 id · 같은 상태**(`recording`)다. 복귀 경로가 이 세션을 조회한다 (AC-4-35).
 */
export function createActiveSessionFixture(clock: Clock): SessionSummary {
  const [book] = DECK_BOOKS;
  return SessionSummarySchema.parse({
    id: MOCK_ACTIVE_SESSION_ID,
    status: 'recording',
    mode: 'recorded',
    book: book ?? null,
    readingContext: 'bedtime',
    readyAt: shiftedIso(clock, -8 * MINUTE_MS),
    startedAt: shiftedIso(clock, -7 * MINUTE_MS),
    completedAt: null,
    completedReason: null,
    recordedSeconds: 312,
    analysisOutcome: null,
    prompts: createSessionPromptsFixture(),
    bubble: MOCK_READY_BUBBLE,
    reminderBubble: MOCK_READY_REMINDER_BUBBLE,
  });
}

/** 지난 세션 2개 — 목록 `success` 와 상세 조회가 같은 값을 본다. */
export function createSessionHistoryFixture(clock: Clock): SessionSummary[] {
  const [first, second] = DECK_BOOKS;

  return [
    SessionSummarySchema.parse({
      id: MOCK_HISTORY_SESSION_IDS[0],
      status: 'analyzed',
      mode: 'recorded',
      book: first ?? null,
      readingContext: 'after_pickup',
      readyAt: shiftedIso(clock, -3 * DAY_MS),
      startedAt: shiftedIso(clock, -3 * DAY_MS + MINUTE_MS),
      completedAt: shiftedIso(clock, -3 * DAY_MS + 16 * MINUTE_MS),
      completedReason: 'user_done',
      recordedSeconds: 14 * 60,
      analysisOutcome: 'full',
      prompts: createSessionPromptsFixture(),
      bubble: MOCK_READY_BUBBLE,
      reminderBubble: MOCK_READY_REMINDER_BUBBLE,
    }),
    SessionSummarySchema.parse({
      id: MOCK_HISTORY_SESSION_IDS[1],
      status: 'analyzing',
      mode: 'recorded',
      book: second ?? null,
      readingContext: 'bedtime',
      readyAt: shiftedIso(clock, -1 * DAY_MS),
      startedAt: shiftedIso(clock, -1 * DAY_MS + MINUTE_MS),
      completedAt: shiftedIso(clock, -1 * DAY_MS + 12 * MINUTE_MS),
      completedReason: 'user_done',
      recordedSeconds: 11 * 60,
      analysisOutcome: null,
      prompts: createSessionPromptsFixture(),
      bubble: MOCK_READY_BUBBLE,
      reminderBubble: MOCK_READY_REMINDER_BUBBLE,
    }),
  ];
}
