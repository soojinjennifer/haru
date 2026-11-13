import { describe, expect, it } from 'vitest';

import {
  ClientSessionTransitionTargetSchema,
  CreateSessionRequestSchema,
  CreateSessionResponseSchema,
  ListSessionsRequestSchema,
  ListSessionsResponseSchema,
  MAX_RECORDED_SECONDS,
  SessionBubbleCopySchema,
  SessionDetailSchema,
  SessionStatusSchema,
  SessionSummarySchema,
  SessionTransitionRequestSchema,
  SessionTransitionResultSchema,
  StickerAwardSchema,
  canTransition,
} from '../index.js';

/**
 * Stage 4 `S4-B` — sessions contracts (AC-4-09 ~ 14, `D4-2` · `D4-20`~`22` · `D4-25`).
 */

const CHILD_ID = '11111111-1111-4111-8111-000000000001';
const BOOK_ID = '22222222-2222-4222-8222-000000000001';
const CHILD_BOOK_ID = '33333333-3333-4333-8333-000000000001';
const OPTION_ID = '44444444-4444-4444-8444-000000000001';
const SESSION_ID = '55555555-5555-4555-8555-000000000001';
const RECORDING_ID = '66666666-6666-4666-8666-000000000001';
const STICKER_ID = '77777777-7777-4777-8777-000000000001';
const PROMPT_ID = '88888888-8888-4888-8888-000000000001';

/** 서재 경로 — Activity Card 없이, Reading Context 없이, 책만으로 시작한다 (`D4-25`). */
const LIBRARY_PATH_REQUEST = {
  childId: CHILD_ID,
  mode: 'recorded',
  activityCardOptionId: null,
  bookId: BOOK_ID,
  childBookId: null,
  readingContext: null,
  clientSessionKey: 'client-session-key-0001',
  readyAt: '2026-10-14T09:00:00Z',
} as const;

const CARD_PATH_REQUEST = {
  ...LIBRARY_PATH_REQUEST,
  activityCardOptionId: OPTION_ID,
  readingContext: 'bedtime',
} as const;

const STICKER = {
  id: STICKER_ID,
  sessionId: SESSION_ID,
  stickerType: 'attendance',
  awardedAt: '2026-10-14T09:20:00Z',
  title: 'Attendance sticker',
  message: 'You read together today',
} as const;

const SUMMARY = {
  id: SESSION_ID,
  status: 'ready',
  mode: 'recorded',
  book: { id: BOOK_ID, title: 'Where the Wild Things Are', author: 'Maurice Sendak' },
  readingContext: null,
  readyAt: '2026-10-14T09:00:00Z',
  startedAt: null,
  completedAt: null,
  completedReason: null,
  recordedSeconds: 0,
  analysisOutcome: null,
  prompts: [
    {
      id: PROMPT_ID,
      kind: 'question',
      text: 'What do you think Max feels here?',
      order: 0,
      coachingNote: 'Pause and let the answer come.',
    },
  ],
  bubble: { text: 'Ready when you are', templateId: 'ready-greeting-01' },
  reminderBubble: { text: 'Still here when you are ready', templateId: 'ready-reminder-01' },
} as const;

describe('CreateSessionRequest — 책 필수 (AC-4-09)', () => {
  it('recorded 세션에 bookId 가 있으면 통과한다', () => {
    expect(CreateSessionRequestSchema.safeParse(LIBRARY_PATH_REQUEST).success).toBe(true);
  });

  it('recorded 세션에 childBookId 만 있어도 통과한다', () => {
    const result = CreateSessionRequestSchema.safeParse({
      ...LIBRARY_PATH_REQUEST,
      bookId: null,
      childBookId: CHILD_BOOK_ID,
    });
    expect(result.success).toBe(true);
  });

  it('recorded 세션에서 bookId · childBookId 둘 다 null 이면 거부한다', () => {
    const result = CreateSessionRequestSchema.safeParse({
      ...LIBRARY_PATH_REQUEST,
      bookId: null,
      childBookId: null,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('bookId');
  });

  it('conversation_only 세션은 책 없이 통과한다', () => {
    const result = CreateSessionRequestSchema.safeParse({
      ...LIBRARY_PATH_REQUEST,
      mode: 'conversation_only',
      bookId: null,
      childBookId: null,
    });
    expect(result.success).toBe(true);
  });

  it('Activity Card 경로에서도 recorded 세션은 책이 필요하다 (D4-25 — 경로 무관)', () => {
    const result = CreateSessionRequestSchema.safeParse({
      ...CARD_PATH_REQUEST,
      bookId: null,
      childBookId: null,
    });
    expect(result.success).toBe(false);
  });
});

describe('CreateSessionRequest — readingContext nullable (D4-25, N4-04)', () => {
  it('서재 경로: readingContext = null 로 세션을 시작할 수 있다', () => {
    const parsed = CreateSessionRequestSchema.parse(LIBRARY_PATH_REQUEST);
    expect(parsed.readingContext).toBeNull();
  });

  it('Activity Card 경로: readingContext 값을 그대로 보낸다', () => {
    expect(CreateSessionRequestSchema.parse(CARD_PATH_REQUEST).readingContext).toBe('bedtime');
  });

  it('readingContext 필드 자체를 생략할 수는 없다 (null 로 명시한다)', () => {
    const { readingContext: _omitted, ...withoutContext } = LIBRARY_PATH_REQUEST;
    expect(CreateSessionRequestSchema.safeParse(withoutContext).success).toBe(false);
  });
});

describe('CreateSessionRequest — custom_time 규칙 재사용 (AC-4-10)', () => {
  it('custom_time 인데 customTime 이 없으면 거부한다', () => {
    const result = CreateSessionRequestSchema.safeParse({
      ...CARD_PATH_REQUEST,
      readingContext: 'custom_time',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('customTime');
    // createCustomTimeRefine() 의 메시지와 같다 — 조건문을 복제하지 않았다는 증거
    expect(result.error?.issues.map((issue) => issue.message)).toContain(
      'customTime is required when readingContext is custom_time.',
    );
  });

  it('custom_time + customTime 은 통과한다', () => {
    const result = CreateSessionRequestSchema.safeParse({
      ...CARD_PATH_REQUEST,
      readingContext: 'custom_time',
      customTime: '19:30',
    });
    expect(result.success).toBe(true);
  });

  it('readingContext = null 이면 customTime 이 필요 없다', () => {
    expect(CreateSessionRequestSchema.safeParse(LIBRARY_PATH_REQUEST).success).toBe(true);
  });

  it('customTime 형식이 HH:mm 이 아니면 거부한다', () => {
    const result = CreateSessionRequestSchema.safeParse({
      ...CARD_PATH_REQUEST,
      readingContext: 'custom_time',
      customTime: '7:30',
    });
    expect(result.success).toBe(false);
  });
});

describe('CreateSessionRequest — 멱등 키', () => {
  it('clientSessionKey 는 16 ~ 64 자다', () => {
    const at = (key: string) =>
      CreateSessionRequestSchema.safeParse({ ...LIBRARY_PATH_REQUEST, clientSessionKey: key })
        .success;
    expect(at('a'.repeat(15))).toBe(false);
    expect(at('a'.repeat(16))).toBe(true);
    expect(at('a'.repeat(64))).toBe(true);
    expect(at('a'.repeat(65))).toBe(false);
  });
});

describe('SessionTransitionRequest (AC-4-11 · 12 · 13)', () => {
  const base = { occurredAt: '2026-10-14T09:05:00Z' } as const;

  it('클라이언트 요청 가능한 목표는 recording · paused · completed · abandoned 4값뿐이다 (AC-4-11)', () => {
    expect(ClientSessionTransitionTargetSchema.options).toEqual([
      'recording',
      'paused',
      'completed',
      'abandoned',
    ]);
    for (const to of ['recording', 'paused', 'abandoned'] as const) {
      expect(SessionTransitionRequestSchema.safeParse({ ...base, to }).success).toBe(true);
    }
  });

  it('analyzing · analyzed · failed · ready 는 거부한다 (AC-4-11)', () => {
    for (const to of ['analyzing', 'analyzed', 'failed', 'ready']) {
      expect(SessionTransitionRequestSchema.safeParse({ ...base, to }).success).toBe(false);
    }
  });

  it('목표 집합은 SessionStatus 의 부분집합이다 (새 값 0)', () => {
    for (const to of ClientSessionTransitionTargetSchema.options) {
      expect(SessionStatusSchema.options).toContain(to);
    }
  });

  it("to='completed' 인데 completedReason 이 없으면 거부한다 (AC-4-12)", () => {
    const result = SessionTransitionRequestSchema.safeParse({ ...base, to: 'completed' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('completedReason');
  });

  it("to='completed' + completedReason 은 통과한다", () => {
    for (const completedReason of ['user_done', 'auto_timeout', 'recovered_after_crash']) {
      const result = SessionTransitionRequestSchema.safeParse({
        ...base,
        to: 'completed',
        completedReason,
        recordedSeconds: 900,
      });
      expect(result.success).toBe(true);
    }
  });

  it('recordedSeconds 1800 통과 / 1801 실패 (AC-4-13)', () => {
    expect(MAX_RECORDED_SECONDS).toBe(1800);
    const at = (recordedSeconds: number) =>
      SessionTransitionRequestSchema.safeParse({ ...base, to: 'paused', recordedSeconds }).success;
    expect(at(1800)).toBe(true);
    expect(at(1801)).toBe(false);
    expect(at(-1)).toBe(false);
    expect(at(1.5)).toBe(false);
  });

  it('occurredAt 은 필수다', () => {
    expect(SessionTransitionRequestSchema.safeParse({ to: 'paused' }).success).toBe(false);
  });

  it("폐기(Discard)는 to='abandoned' 로 보낸다 — 사유 필드는 없다 (D4-13, parse 가 버린다)", () => {
    const parsed = SessionTransitionRequestSchema.parse({
      ...base,
      to: 'abandoned',
      abandonedReason: 'user_discarded',
    });
    expect(parsed).not.toHaveProperty('abandonedReason');
    expect(Object.keys(SessionTransitionRequestSchema.shape).sort()).toEqual([
      'completedReason',
      'occurredAt',
      'recordedSeconds',
      'to',
    ]);
  });
});

describe('canTransition — conversation_only 의 분석 진입 거부 (AC-4-14)', () => {
  it('conversation_only 의 completed → analyzing 은 거부된다 (모든 actor)', () => {
    for (const actor of ['caregiver', 'server', 'worker'] as const) {
      expect(canTransition('completed', 'analyzing', actor, 'conversation_only')).toBe(false);
    }
  });

  it('recorded 의 completed → analyzing (server) 은 허용된다 (대조군)', () => {
    expect(canTransition('completed', 'analyzing', 'server', 'recorded')).toBe(true);
  });
});

describe('SessionSummary · SessionBubbleCopy (D4-20 · D4-21 · D4-22)', () => {
  it('대표 fixture 가 parse 된다', () => {
    expect(SessionSummarySchema.safeParse(SUMMARY).success).toBe(true);
    expect(CreateSessionResponseSchema.safeParse({ session: SUMMARY }).success).toBe(true);
  });

  it('bubble 은 null · text null · 빈 문자열을 모두 받는다 (제목 줄 미렌더는 화면의 일)', () => {
    for (const bubble of [null, { text: null }, { text: '' }]) {
      expect(SessionSummarySchema.safeParse({ ...SUMMARY, bubble }).success).toBe(true);
    }
  });

  it('bubble.text 에 길이 상한을 두지 않는다 — 넘치는 응답이 화면을 비우지 않는다 (D4-21)', () => {
    const long = 'A'.repeat(500);
    expect(SessionBubbleCopySchema.safeParse({ text: long }).success).toBe(true);
  });

  it('bubble 필드는 생략할 수 없다 (null 로 명시)', () => {
    const { bubble: _omitted, ...withoutBubble } = SUMMARY;
    expect(SessionSummarySchema.safeParse(withoutBubble).success).toBe(false);
  });

  it('reminderBubble 은 null · text null · 빈 문자열 · 문자열을 모두 받는다 (D4-59)', () => {
    for (const reminderBubble of [null, { text: null }, { text: '' }, { text: 'Hello' }]) {
      expect(SessionSummarySchema.safeParse({ ...SUMMARY, reminderBubble }).success).toBe(true);
    }
  });

  it('reminderBubble.text 에 길이 상한을 두지 않는다 (D4-21 적용)', () => {
    const reminderBubble = { text: 'A'.repeat(500) };
    expect(SessionSummarySchema.safeParse({ ...SUMMARY, reminderBubble }).success).toBe(true);
  });

  it('reminderBubble 필드는 생략할 수 없다 (null 로 명시, D4-59)', () => {
    const { reminderBubble: _omitted, ...withoutReminder } = SUMMARY;
    expect(SessionSummarySchema.safeParse(withoutReminder).success).toBe(false);
  });

  it('recordedSeconds 는 0 ~ 1800 이다', () => {
    expect(SessionSummarySchema.safeParse({ ...SUMMARY, recordedSeconds: 1800 }).success).toBe(
      true,
    );
    expect(SessionSummarySchema.safeParse({ ...SUMMARY, recordedSeconds: 1801 }).success).toBe(
      false,
    );
  });
});

describe('StickerAward (D4-2 · D4-10)', () => {
  it('문구 필드(title · message)를 응답 값으로 받는다', () => {
    const parsed = StickerAwardSchema.parse(STICKER);
    expect(parsed.title).toBe('Attendance sticker');
    expect(parsed.message).toBe('You read together today');
  });

  it('문구 필드는 비어 있을 수 없다', () => {
    expect(StickerAwardSchema.safeParse({ ...STICKER, message: '' }).success).toBe(false);
    expect(StickerAwardSchema.safeParse({ ...STICKER, title: '' }).success).toBe(false);
  });

  it('dayCount · streakDays 필드가 없다 — 섞여 와도 parse 가 버린다 (D4-2)', () => {
    const keys = Object.keys(StickerAwardSchema.shape);
    expect(keys).not.toContain('dayCount');
    expect(keys).not.toContain('streakDays');
    expect(keys.sort()).toEqual([
      'awardedAt',
      'id',
      'message',
      'sessionId',
      'stickerType',
      'title',
    ]);

    const parsed = StickerAwardSchema.parse({ ...STICKER, dayCount: 12, streakDays: 12 });
    expect(parsed).not.toHaveProperty('dayCount');
    expect(parsed).not.toHaveProperty('streakDays');
  });

  it('stickerType 은 attendance 만 받는다', () => {
    expect(StickerAwardSchema.safeParse({ ...STICKER, stickerType: 'streak' }).success).toBe(false);
  });
});

describe('SessionTransitionResult · SessionDetail', () => {
  it('completed 전이 결과는 종료 버블과 스티커를 담을 수 있다', () => {
    const result = SessionTransitionResultSchema.safeParse({
      session: { ...SUMMARY, status: 'completed', completedReason: 'user_done' },
      completionBubble: { text: 'What a lovely read.' },
      stickerAward: STICKER,
    });
    expect(result.success).toBe(true);
  });

  it('다른 전이 결과는 session 만으로 충분하다', () => {
    expect(
      SessionTransitionResultSchema.safeParse({ session: { ...SUMMARY, status: 'paused' } })
        .success,
    ).toBe(true);
    expect(
      SessionTransitionResultSchema.safeParse({ session: SUMMARY, stickerAward: null }).success,
    ).toBe(true);
  });

  it('SessionDetail = summary + recording(§3.9) + sticker + completionBubble + reflection (Stage 5 C-4)', () => {
    const detail = {
      ...SUMMARY,
      status: 'analyzing',
      recording: {
        recordingId: RECORDING_ID,
        uploadStatus: 'uploaded',
        partCount: 1,
        expiresAt: '2027-01-12T09:20:00Z',
      },
      sticker: STICKER,
      completionBubble: { text: 'What a lovely read.', subtext: '14 min together' },
      reflection: {
        id: RECORDING_ID,
        sessionId: SUMMARY.id,
        rating: 4,
        checks: ['engaged'],
        note: null,
        submittedAt: '2026-10-14T09:30:00Z',
      },
    };
    expect(SessionDetailSchema.safeParse(detail).success).toBe(true);
    expect(
      SessionDetailSchema.safeParse({
        ...SUMMARY,
        recording: null,
        sticker: null,
        completionBubble: null,
        reflection: null,
      }).success,
    ).toBe(true);
    expect(Object.keys(SessionDetailSchema.shape)).toContain('reflection');
  });

  it('`completionBubble` 은 필수 key 다 (`D4-88`) — 누락 거부 · `null` 통과', () => {
    const base = { ...SUMMARY, recording: null, sticker: null, reflection: null };
    expect(SessionDetailSchema.safeParse(base).success).toBe(false);
    expect(SessionDetailSchema.safeParse({ ...base, completionBubble: null }).success).toBe(true);
  });

  it('`reflection` 은 필수 key 다 (Stage 5 C-4, AC-5-05) — 누락 거부 · `null` 통과 · 빈 회고 거부', () => {
    const base = { ...SUMMARY, recording: null, sticker: null, completionBubble: null };
    expect(SessionDetailSchema.safeParse(base).success).toBe(false);
    expect(SessionDetailSchema.safeParse({ ...base, reflection: null }).success).toBe(true);
    expect(
      SessionDetailSchema.safeParse({
        ...base,
        reflection: {
          id: RECORDING_ID,
          sessionId: SUMMARY.id,
          rating: null,
          checks: [],
          note: null,
          submittedAt: '2026-10-14T09:30:00Z',
        },
      }).success,
    ).toBe(false);
  });
});

describe('SessionBubbleCopy.subtext (`D4-87` · `D4-94` · `D4-98`)', () => {
  it.each([
    ['문자열', { text: 'Done', subtext: '14 min together · sticker earned' }],
    ['null', { text: 'Done', subtext: null }],
    ['빈 문자열', { text: 'Done', subtext: '' }],
    ['key 없음', { text: 'Done' }],
    ['`.max` 없음', { text: 'Done', subtext: 'x'.repeat(500) }],
  ])('%s → parse 통과', (_name, copy) => {
    expect(SessionBubbleCopySchema.safeParse(copy).success).toBe(true);
  });

  it('문자열이 아니면 거부한다', () => {
    expect(SessionBubbleCopySchema.safeParse({ text: 'Done', subtext: 14 }).success).toBe(false);
  });

  it('ready · 리마인드 응답은 `subtext` key 없이 그대로 parse 된다 (회귀)', () => {
    expect(
      SessionSummarySchema.safeParse({
        ...SUMMARY,
        bubble: { text: 'Hi' },
        reminderBubble: { text: 'Ready when you are!' },
      }).success,
    ).toBe(true);
  });
});

describe('ListSessions (C4-OPEN-4)', () => {
  it('cursor 규약 + status 필터를 받는다', () => {
    const parsed = ListSessionsRequestSchema.parse({ status: 'completed' });
    expect(parsed.limit).toBe(20);
    expect(parsed.status).toBe('completed');
    expect(ListSessionsRequestSchema.safeParse({ status: 'discarded' }).success).toBe(false);
  });

  it('응답은 paginated(SessionSummary) 다', () => {
    expect(
      ListSessionsResponseSchema.safeParse({ items: [SUMMARY], nextCursor: null }).success,
    ).toBe(true);
  });
});
