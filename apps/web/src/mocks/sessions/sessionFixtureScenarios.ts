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
 * | `session-greeting` | `success` | 인사 `MOCK_READY_BUBBLE` (27자) |
 * | | `greeting-missing` · `greeting-empty` | `bubble: null` · `text: ''` (`D4-22`) |
 * | | `greeting-tight` · `greeting-long` | 320 에서만 / 두 폭 모두 1줄을 넘는 인사 (`D4-21` clamp 회귀용) |
 * | | `reminder-missing` | 인사는 정상 · `reminderBubble: null` — 5분 리마인드 시각 변화 0 (`D4-59`) |
 *
 * 리마인드(`reminderBubble`)는 `reminder-missing` 외 모든 key 에서 `MOCK_READY_REMINDER_BUBBLE` 이다.
 *
 * ⚠ 책 칩 변형(`session:book-*`)은 책 칩을 만드는 `S4-F2` 가 이 그룹에 더한다.
 * 결정적이다 — 시간·난수 없음.
 */
import type { SessionBubbleCopy } from '@haru/contracts';

import {
  MOCK_READY_BUBBLE,
  MOCK_READY_BUBBLE_EMPTY,
  MOCK_READY_BUBBLE_LONG,
  MOCK_READY_BUBBLE_TIGHT,
  MOCK_READY_REMINDER_BUBBLE,
  type SessionPromptCount,
} from '../fixtures/sessions';
import type { ScenarioGroupDefinition, ScenarioStore } from '../scenarios';

export const SESSION_FIXTURE_SCENARIO_KEYS = [
  'success',
  'prompts-1',
  'prompts-3',
  'prompts-7',
  'prompts-empty',
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

const PROMPT_COUNT: Record<SessionFixtureScenarioKey, SessionPromptCount> = {
  success: 5,
  'prompts-1': 1,
  'prompts-3': 3,
  'prompts-7': 7,
  'prompts-empty': 0,
};

const GREETING: Record<SessionGreetingScenarioKey, SessionBubbleCopy> = {
  success: MOCK_READY_BUBBLE,
  'greeting-missing': null,
  'greeting-empty': MOCK_READY_BUBBLE_EMPTY,
  'greeting-tight': MOCK_READY_BUBBLE_TIGHT,
  'greeting-long': MOCK_READY_BUBBLE_LONG,
  'reminder-missing': MOCK_READY_BUBBLE,
};

export interface ReadySessionShape {
  readonly promptCount: SessionPromptCount;
  readonly bubble: SessionBubbleCopy;
  readonly reminderBubble: SessionBubbleCopy;
}

/** scenario store 에서 새 ready 세션의 모양을 정한다. */
export function resolveReadySessionShape(store: ScenarioStore): ReadySessionShape {
  const greetingKey = store.resolve(sessionGreetingScenarioGroup);
  return {
    promptCount: PROMPT_COUNT[store.resolve(sessionFixtureScenarioGroup)],
    bubble: GREETING[greetingKey],
    reminderBubble: greetingKey === 'reminder-missing' ? null : MOCK_READY_REMINDER_BUBBLE,
  };
}
