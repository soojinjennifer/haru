/**
 * 세션 **표시 데이터 모양** scenario — Stage 4 4b Plan §12 (`S4-F1` 이 먼저 쓰는 것만 정의한다).
 *
 * API 동작(`sessions` 그룹)과 **분리된 축**이다 — 인사 × Prompt 개수 조합(AC-4-122 의 2 × 5 = 10
 * 케이스)을 URL 하나로 만들 수 있어야 하므로 그룹을 둘로 둔다:
 *
 * | group | key | `POST /v1/sessions` 가 만드는 ready 세션 |
 * |---|---|---|
 * | `session` | `success` | Prompt 5개 (기본) |
 * | | `prompts-1` · `prompts-3` · `prompts-7` · `prompts-empty` | 1 · 3 · 7 · 0개 (Plan §12) |
 * | | `book-missing` · `book-no-cover` · `book-long-title` | 책 `null` · 표지 없음 · 40자 이상 제목 — 책 칩 (`S4-F2`, AC-4-126) |
 * | `session-greeting` | `success` | 인사 `MOCK_READY_BUBBLE` (27자) |
 * | | `greeting-missing` · `greeting-empty` | `bubble: null` · `text: ''` (`D4-22`) |
 * | | `greeting-tight` · `greeting-long` | 320 에서만 / 두 폭 모두 1줄을 넘는 인사 (`D4-21` clamp 회귀용) |
 * | | `reminder-missing` | 인사는 정상 · `reminderBubble: null` — 5분 리마인드 시각 변화 0 (`D4-59`) |
 *
 * | `session-completion` | `success` | 완료 버블 = 주 문구 + `subtext` (`MOCK_COMPLETION_BUBBLE`) |
 * | | `subtext-missing` · `bubble-missing` | `subtext: null` · `completionBubble: null` (`D4-87`, §5.4) |
 *
 * 완료 버블 값은 세션 레코드에 담겨 **전이 응답과 Detail 이 공유**한다 (`API_CONTRACTS.md` §3.2.3).
 *
 * 리마인드(`reminderBubble`)는 `reminder-missing` 외 모든 key 에서 `MOCK_READY_REMINDER_BUBBLE` 이다.
 *
 * 책 칩 변형(`session:book-*`)은 요청한 책 대신 고정 fixture 를 쓴다 (Prompt 는 기본 5개). 그 밖의 key 는
 * 요청의 `bookId`/`childBookId` 로 찾은 책 그대로다.
 * 결정적이다 — 시간·난수 없음.
 */
import type { BookSummary, SessionBubbleCopy } from '@haru/contracts';

import {
  MOCK_COMPLETION_BUBBLE,
  MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
  MOCK_READY_BUBBLE,
  MOCK_READY_BUBBLE_EMPTY,
  MOCK_READY_BUBBLE_LONG,
  MOCK_READY_BUBBLE_TIGHT,
  MOCK_READY_REMINDER_BUBBLE,
  MOCK_SESSION_BOOK_LONG_TITLE,
  MOCK_SESSION_BOOK_NO_COVER,
  type SessionPromptCount,
} from '../fixtures/sessions';
import type { ScenarioGroupDefinition, ScenarioStore } from '../scenarios';

export const SESSION_FIXTURE_SCENARIO_KEYS = [
  'success',
  'prompts-1',
  'prompts-3',
  'prompts-7',
  'prompts-empty',
  'book-missing',
  'book-no-cover',
  'book-long-title',
] as const;

export type SessionFixtureScenarioKey = (typeof SESSION_FIXTURE_SCENARIO_KEYS)[number];

export const sessionFixtureScenarioGroup: ScenarioGroupDefinition<SessionFixtureScenarioKey> = {
  group: 'session',
  keys: SESSION_FIXTURE_SCENARIO_KEYS,
  defaultKey: 'success',
};

export const SESSION_GREETING_SCENARIO_KEYS = [
  'success',
  'greeting-missing',
  'greeting-empty',
  'greeting-tight',
  'greeting-long',
  'reminder-missing',
] as const;

export type SessionGreetingScenarioKey = (typeof SESSION_GREETING_SCENARIO_KEYS)[number];

export const sessionGreetingScenarioGroup: ScenarioGroupDefinition<SessionGreetingScenarioKey> = {
  group: 'session-greeting',
  keys: SESSION_GREETING_SCENARIO_KEYS,
  defaultKey: 'success',
};

export const SESSION_COMPLETION_SCENARIO_KEYS = [
  'success',
  'subtext-missing',
  'bubble-missing',
] as const;

export type SessionCompletionScenarioKey = (typeof SESSION_COMPLETION_SCENARIO_KEYS)[number];

export const sessionCompletionScenarioGroup: ScenarioGroupDefinition<SessionCompletionScenarioKey> =
  {
    group: 'session-completion',
    keys: SESSION_COMPLETION_SCENARIO_KEYS,
    defaultKey: 'success',
  };

const PROMPT_COUNT: Record<SessionFixtureScenarioKey, SessionPromptCount> = {
  success: 5,
  'prompts-1': 1,
  'prompts-3': 3,
  'prompts-7': 7,
  'prompts-empty': 0,
  'book-missing': 5,
  'book-no-cover': 5,
  'book-long-title': 5,
};

/** 책 칩 변형 — `'requested'` 는 요청한 책 그대로. */
const BOOK: Record<SessionFixtureScenarioKey, BookSummary | null | 'requested'> = {
  success: 'requested',
  'prompts-1': 'requested',
  'prompts-3': 'requested',
  'prompts-7': 'requested',
  'prompts-empty': 'requested',
  'book-missing': null,
  'book-no-cover': MOCK_SESSION_BOOK_NO_COVER,
  'book-long-title': MOCK_SESSION_BOOK_LONG_TITLE,
};

const GREETING: Record<SessionGreetingScenarioKey, SessionBubbleCopy> = {
  success: MOCK_READY_BUBBLE,
  'greeting-missing': null,
  'greeting-empty': MOCK_READY_BUBBLE_EMPTY,
  'greeting-tight': MOCK_READY_BUBBLE_TIGHT,
  'greeting-long': MOCK_READY_BUBBLE_LONG,
  'reminder-missing': MOCK_READY_BUBBLE,
};

const COMPLETION: Record<SessionCompletionScenarioKey, SessionBubbleCopy> = {
  success: MOCK_COMPLETION_BUBBLE,
  'subtext-missing': MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
  'bubble-missing': null,
};

export interface ReadySessionShape {
  readonly promptCount: SessionPromptCount;
  readonly bubble: SessionBubbleCopy;
  readonly reminderBubble: SessionBubbleCopy;
  readonly completionBubble: SessionBubbleCopy;
  /** `'requested'` = 요청으로 찾은 책을 쓴다. 그 밖 = 이 값으로 바꾼다 (`session:book-*`). */
  readonly book: BookSummary | null | 'requested';
}

/** scenario store 에서 새 ready 세션의 모양을 정한다. */
export function resolveReadySessionShape(store: ScenarioStore): ReadySessionShape {
  const greetingKey = store.resolve(sessionGreetingScenarioGroup);
  const sessionKey = store.resolve(sessionFixtureScenarioGroup);
  return {
    promptCount: PROMPT_COUNT[sessionKey],
    book: BOOK[sessionKey],
    bubble: GREETING[greetingKey],
    reminderBubble: greetingKey === 'reminder-missing' ? null : MOCK_READY_REMINDER_BUBBLE,
    completionBubble: COMPLETION[store.resolve(sessionCompletionScenarioGroup)],
  };
}
