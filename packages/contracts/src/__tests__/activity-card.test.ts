/**
 * Stage 3 contracts — Activity Card · Prompt · Home 집계.
 *
 * 이 파일이 지키는 **결정**:
 *  - `D-21` (§9.1) — Prompt 개수 **상한 없음**. 4개·10개가 parse 를 통과하고 0개는 거부된다.
 *  - `D-22` (§9)   — `ActivityCard` 에 `targetCapability` 가 **없다**.
 *  - `D-8`  (§8.1) — `Prompt.phase` · `pageRef` 는 **독립 optional** 이며 `null` 을 허용한다.
 *  - `D-6`  (§8.5 ④) — `HomeSummary` 에 `streakDays` 가 **없다**.
 *  - `AC-3-23` — `custom_time` 인데 `customTime` 이 없으면 거부한다.
 *  - **§12.14** — `Prompt` 마다 상세 코칭 노트가 **1:1** 로 붙는다. 카드 단위 `coachingLine` 은
 *    삭제되었고, 질문 Prompt 에 노트가 없으면 parse 가 거부한다.
 */
import { describe, expect, it } from 'vitest';

import {
  ActivityCardOptionSchema,
  ActivityCardSchema,
  ActivityCardSelectionSchema,
  HomeSummarySchema,
  PromptSchema,
  PromptSetSchema,
  SelectActivityOptionRequestSchema,
  TimeOfDaySchema,
} from '../index.js';

const ID = '33333333-3333-4333-8333-000000000001';

function prompt(order: number, extra: Record<string, unknown> = {}) {
  return {
    id: `33333333-3333-4333-8333-${String(order + 1).padStart(12, '0')}`,
    kind: 'question',
    text: `Question ${String(order + 1)}`,
    order,
    // §12.14 — 질문 Prompt 는 상세 코칭 노트를 **반드시** 동반한다 (1:1).
    coachingNote: `Coaching note ${String(order + 1)}`,
    ...extra,
  };
}

function prompts(count: number) {
  return Array.from({ length: count }, (_unused, index) => prompt(index));
}

function option(overrides: Record<string, unknown> = {}) {
  return {
    id: ID,
    position: 0,
    kind: 'book',
    capability: 'emotion_regulation',
    book: { id: ID, title: 'Goodnight Moon', author: 'Margaret Wise Brown' },
    reason: 'Because tonight is calm.',
    promptPreview: prompts(3),
    saved: false,
    ...overrides,
  };
}

describe('Prompt 개수 상한 — D-21 (§9.1)', () => {
  it.each([1, 2, 3, 4, 10, 20])('questions 가 %i 개여도 parse 를 통과한다', (count) => {
    const result = PromptSetSchema.safeParse({
      id: ID,
      capability: 'emotion_regulation',
      ageBand: '5_6',
      questions: prompts(count),
      followUps: [],
    });

    expect(result.success).toBe(true);
  });

  it('questions 가 0 개면 거부한다 (빈 세트는 화면이 성립하지 않는다 — .min(1))', () => {
    const result = PromptSetSchema.safeParse({
      id: ID,
      capability: 'emotion_regulation',
      ageBand: '5_6',
      questions: [],
      followUps: [],
    });

    expect(result.success).toBe(false);
  });

  it.each([1, 4, 10])('promptPreview 가 %i 개여도 parse 를 통과한다', (count) => {
    expect(
      ActivityCardOptionSchema.safeParse(option({ promptPreview: prompts(count) })).success,
    ).toBe(true);
  });

  it('promptPreview 가 0 개면 거부한다', () => {
    expect(ActivityCardOptionSchema.safeParse(option({ promptPreview: [] })).success).toBe(false);
  });
});

describe('Prompt 단계·페이지 — D-8 (§8.1 · §9.2 ⑪)', () => {
  it('phase · pageRef 는 생략할 수 있다', () => {
    expect(PromptSchema.safeParse(prompt(0)).success).toBe(true);
  });

  it('phase · pageRef 는 null 을 허용한다 (미렌더 경로)', () => {
    const parsed = PromptSchema.parse(prompt(0, { phase: null, pageRef: null }));
    expect(parsed.phase).toBeNull();
    expect(parsed.pageRef).toBeNull();
  });

  it('phase 와 pageRef 가 동시에 있어도 통과한다 — 서버에 하나만 보내라고 요구하지 않는다', () => {
    const parsed = PromptSchema.parse(prompt(0, { phase: 'post', pageRef: 'P.6' }));
    expect(parsed.phase).toBe('post');
    expect(parsed.pageRef).toBe('P.6');
  });

  it('phase 는 pre · post 외의 값을 거부한다', () => {
    expect(PromptSchema.safeParse(prompt(0, { phase: 'during' })).success).toBe(false);
  });
});

describe('ActivityCard — 덱 3장 · D-22', () => {
  const card = {
    id: ID,
    date: '2026-01-01',
    options: [option({ position: 0 }), option({ position: 1 }), option({ position: 2 })],
  };

  it('옵션이 정확히 3장이어야 한다', () => {
    expect(ActivityCardSchema.safeParse(card).success).toBe(true);
    expect(
      ActivityCardSchema.safeParse({ ...card, options: card.options.slice(0, 2) }).success,
    ).toBe(false);
    expect(
      ActivityCardSchema.safeParse({ ...card, options: [...card.options, option()] }).success,
    ).toBe(false);
  });

  it('targetCapability 를 보내도 결과에 남지 않는다 (D-22 — 필드 삭제)', () => {
    const parsed = ActivityCardSchema.parse({ ...card, targetCapability: 'emotion_regulation' });
    expect(parsed).not.toHaveProperty('targetCapability');
  });

  it('date 는 YYYY-MM-DD 다', () => {
    expect(ActivityCardSchema.safeParse({ ...card, date: '2026-01-01T00:00:00Z' }).success).toBe(
      false,
    );
  });

  it('capability 가 null 이어도 통과한다 (배지 미렌더 경로 — §5.2)', () => {
    expect(ActivityCardOptionSchema.safeParse(option({ capability: null })).success).toBe(true);
  });

  /* approvals §12.12 — 책 없는 카드는 **폐지**되었다. 서버는 항상 책이 있는 카드를 내려준다. */
  it('book 이 null 이면 거부한다 (conversation_only 폐지 — §12.12)', () => {
    expect(ActivityCardOptionSchema.safeParse(option({ book: null })).success).toBe(false);
  });

  it('kind 는 book · reread_book 둘뿐이다 (conversation_only 폐지)', () => {
    expect(ActivityCardOptionSchema.safeParse(option({ kind: 'reread_book' })).success).toBe(true);
    expect(ActivityCardOptionSchema.safeParse(option({ kind: 'conversation_only' })).success).toBe(
      false,
    );
  });

  /* `G-14` (approvals §12.10) — 초기 저장 상태를 서버가 알려준다. */
  it('saved 는 필수 boolean 이다 (G-14)', () => {
    const { saved: _omitted, ...withoutSaved } = option();
    expect(ActivityCardOptionSchema.safeParse(withoutSaved).success).toBe(false);
    expect(ActivityCardOptionSchema.parse(option({ saved: true })).saved).toBe(true);
  });

  /* §12.14 — 앞면 pill 개수 = 뒷면 노트 개수를 **타입으로** 보장한다. */
  it('질문 Prompt 에 coachingNote 가 없으면 거부한다 (1:1 보장)', () => {
    const missing = ActivityCardOptionSchema.safeParse(
      option({ promptPreview: [prompt(0, { coachingNote: null })] }),
    );

    expect(missing.success).toBe(false);
    expect(missing.error?.issues[0]?.path).toEqual(['promptPreview', 0, 'coachingNote']);
  });

  it('카드 단위 coachingLine 은 더 이상 결과에 남지 않는다 (§12.14)', () => {
    const parsed = ActivityCardOptionSchema.parse(option({ coachingLine: 'card level' }));
    expect(parsed).not.toHaveProperty('coachingLine');
  });

  it('title · userEnteredBook 은 더 이상 결과에 남지 않는다 (§12.12)', () => {
    const parsed = ActivityCardOptionSchema.parse(
      option({ title: 'Talk about today', userEnteredBook: { title: 'X' } }),
    );
    expect(parsed).not.toHaveProperty('title');
    expect(parsed).not.toHaveProperty('userEnteredBook');
  });
});

describe('선택 요청 — AC-3-23 · AC-3-24 (D-9)', () => {
  it('custom_time 인데 customTime 이 없으면 거부한다', () => {
    const result = SelectActivityOptionRequestSchema.safeParse({
      optionId: ID,
      readingContext: 'custom_time',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['customTime']);
  });

  it('custom_time + customTime 이면 통과한다', () => {
    expect(
      SelectActivityOptionRequestSchema.safeParse({
        optionId: ID,
        readingContext: 'custom_time',
        customTime: '19:30',
      }).success,
    ).toBe(true);
  });

  it('custom_time 이 아니면 customTime 없이 통과한다', () => {
    expect(
      SelectActivityOptionRequestSchema.safeParse({ optionId: ID, readingContext: 'bedtime' })
        .success,
    ).toBe(true);
  });

  it('readingContext 는 필수다 (카드 경로 — D-9)', () => {
    expect(SelectActivityOptionRequestSchema.safeParse({ optionId: ID }).success).toBe(false);
  });

  it.each(['24:00', '7:30', '19:5', '19:30:00', ''])('%s 는 HH:mm 이 아니다', (value) => {
    expect(TimeOfDaySchema.safeParse(value).success).toBe(false);
  });

  it.each(['00:00', '09:05', '23:30'])('%s 는 HH:mm 이다', (value) => {
    expect(TimeOfDaySchema.safeParse(value).success).toBe(true);
  });

  it('선택 응답은 option 과 promptSet 을 담는다', () => {
    expect(
      ActivityCardSelectionSchema.safeParse({
        option: option(),
        promptSet: {
          id: ID,
          capability: 'emotion_regulation',
          ageBand: '5_6',
          questions: prompts(4),
          followUps: [prompt(0, { kind: 'follow_up' })],
        },
      }).success,
    ).toBe(true);
  });
});

describe('HomeSummary — D-6 · §8.5 ①④', () => {
  const summary = { todayCard: null, sessionsThisWeek: 0, characterLine: null };

  it('streakDays 를 보내도 결과에 남지 않는다 (필드 삭제)', () => {
    const parsed = HomeSummarySchema.parse({ ...summary, streakDays: 12 });
    expect(parsed).not.toHaveProperty('streakDays');
  });

  it('characterLine 은 null 을 허용한다 (버블 미렌더 경로)', () => {
    expect(HomeSummarySchema.parse(summary).characterLine).toBeNull();
  });

  /*
   * `W-5` (approvals §13.3 · API_CONTRACTS §3.8 · `P3-BIP-16`).
   * "약 120자 이내" 는 **Backend 요구사항**이고 schema 제약이 아니다. 응답 필드에 `.max()` 를
   * 걸면 서버가 한 번만 넘겨도 parse 가 던져 **Home 전체가 빈 화면**이 된다 — 4줄 말줄임으로
   * degrade 하는 것보다 나쁘다. 이 테스트가 그 결정을 고정한다.
   */
  it('characterLine 에 길이 제약을 걸지 않는다 — 긴 문구도 parse 된다 (`W-5`)', () => {
    const long = 'tonight '.repeat(120).trim();
    expect(long.length).toBeGreaterThan(120);

    const parsed = HomeSummarySchema.parse({ ...summary, characterLine: long });
    expect(parsed.characterLine).toBe(long);
  });

  it('activeSession 은 선택이며 세션 상태 enum 을 쓴다', () => {
    expect(
      HomeSummarySchema.safeParse({
        ...summary,
        activeSession: { sessionId: ID, status: 'recording' },
      }).success,
    ).toBe(true);
    expect(
      HomeSummarySchema.safeParse({
        ...summary,
        activeSession: { sessionId: ID, status: 'retry' },
      }).success,
    ).toBe(false);
  });

  it('sessionsThisWeek 는 음수를 거부한다', () => {
    expect(HomeSummarySchema.safeParse({ ...summary, sessionsThisWeek: -1 }).success).toBe(false);
  });
});
