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

/** 종료 버블 (`88:929`, FR-10). `completed` 전이 응답에만 실린다. */
export const MOCK_COMPLETION_BUBBLE: SessionBubbleCopy = {
  text: 'What a cozy read that was.',
  templateId: 'mock-completion',
};

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

/** 세션 Prompt — ready 버블 pill 과 Drawer 가 **같은 출처**를 쓴다 (`D4-14`). */
export function createSessionPromptsFixture(): Prompt[] {
  // seed 는 uuid 마지막 그룹에 들어가므로 16진수 문자만 쓴다 (`prompt-sets.ts` fixtureId).
  return createPromptPreviewFixture('5e55');
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
    prompts: createSessionPromptsFixture(),
    bubble: MOCK_READY_BUBBLE,
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
    }),
  ];
}
