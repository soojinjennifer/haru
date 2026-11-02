/**
 * `MockSessionApi` — Stage 4 `S4-C` (AC-4-21 · 23 · 24 · 25 · 34 · 35 · 36 · 37 + 상태 규칙).
 */
import {
  CreateSessionResponseSchema,
  HaruApiError,
  ListSessionsResponseSchema,
  SessionDetailSchema,
  SessionTransitionResultSchema,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { isNetworkError } from '../../shared/api/helpers';
import { MOCK_ACTIVE_SESSION_ID } from '../fixtures/home';
import { MOCK_CHILD_ID } from '../fixtures/me';
import {
  MOCK_COMPLETION_BUBBLE,
  MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
  MOCK_HISTORY_RECORDING_IDS,
  MOCK_READY_BUBBLE,
} from '../fixtures/sessions';
import { SESSION_SCENARIO_KEYS, sessionScenarioGroup } from '../sessions/MockSessionApi';

import { bundle, completedSession, ik, sessionBody, to } from './stage4-support';

async function codeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HaruApiError) return error.code;
    if (isNetworkError(error)) return 'NETWORK';
    throw error;
  }
  return 'OK';
}

async function errorOf(promise: Promise<unknown>): Promise<HaruApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HaruApiError) return error;
  }
  throw new Error('expected HaruApiError');
}

describe('MockSessionApi — Catalogue key (§5.4)', () => {
  it('group `sessions` 는 Catalogue 의 machine key 만 쓴다', () => {
    expect(sessionScenarioGroup.group).toBe('sessions');
    expect(SESSION_SCENARIO_KEYS).toStrictEqual([
      'success',
      'loading',
      'empty',
      'error',
      'retry',
      'offline',
      'invalid-transition',
      'session-already-active',
      'onboarding-incomplete',
      'consent-missing',
      'abandoned',
      'recording-discarded',
    ]);
  });
});

describe('MockSessionApi — success: 전 메서드 응답이 contracts parse 통과 (AC-4-21)', () => {
  it('create → getDetail → transition(recording · paused · recording · completed) → list', async () => {
    const b = bundle();
    const created = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    expect(CreateSessionResponseSchema.safeParse(created).success).toBe(true);
    expect(created.session.status).toBe('ready');
    expect(created.session.bubble).toStrictEqual(MOCK_READY_BUBBLE);
    expect(created.session.prompts.length).toBeGreaterThanOrEqual(1);

    const id = created.session.id;
    for (const [name, body] of [
      ['r1', to('recording')],
      ['p1', to('paused', { recordedSeconds: 120 })],
      ['r2', to('recording')],
    ] as const) {
      const result = await b.clients.sessions.transition({ sessionId: id, body }, ik(name));
      expect(SessionTransitionResultSchema.safeParse(result).success).toBe(true);
      expect(result.session.status).toBe(body.to);
      expect(result.stickerAward).toBeUndefined();
    }

    const done = await b.clients.sessions.transition(
      { sessionId: id, body: to('completed') },
      ik('d'),
    );
    expect(done.session.status).toBe('completed');
    expect(done.session.completedReason).toBe('user_done');
    expect(done.completionBubble).toStrictEqual(MOCK_COMPLETION_BUBBLE);
    expect(done.stickerAward?.sessionId).toBe(id);

    const detail = await b.clients.sessions.getDetail({ sessionId: id });
    expect(SessionDetailSchema.safeParse(detail).success).toBe(true);
    expect(detail.sticker).toStrictEqual(done.stickerAward);
    expect(detail.recording).toBeNull();

    const list = await b.clients.sessions.list({ childId: MOCK_CHILD_ID, query: {} });
    expect(ListSessionsResponseSchema.safeParse(list).success).toBe(true);
    expect(list.items.map((item) => item.id)).toContain(id);
    expect(list.items.length).toBe(3); // 지난 세션 fixture 2 + 방금 만든 1
  });

  it('list 는 `status` 필터를 따른다', async () => {
    const b = bundle();
    const analyzed = await b.clients.sessions.list({
      childId: MOCK_CHILD_ID,
      query: { status: 'analyzed' },
    });
    expect(analyzed.items.map((item) => item.status)).toStrictEqual(['analyzed']);
  });

  it('서재 경로 — Reading Context 없이 시작한다 (`D4-25`)', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create(
      { body: sessionBody({ readingContext: null }) },
      ik('lib'),
    );
    expect(session.readingContext).toBeNull();
  });

  it('모르는 책 → RESOURCE_NOT_FOUND', async () => {
    const b = bundle();
    const unknown = '22222222-2222-4222-8222-999999999999';
    expect(
      await codeOf(b.clients.sessions.create({ body: sessionBody({ bookId: unknown }) }, ik('x'))),
    ).toBe('RESOURCE_NOT_FOUND');
  });
});

describe('MockSessionApi — 완료 버블 (`session-completion`, §3.2.3 · AC-4-139)', () => {
  it('Figma 문자열을 쓴다 (`88:929`)', () => {
    expect(MOCK_COMPLETION_BUBBLE.subtext).toBe('14 min together · sticker earned');
  });

  it('비완료 세션 Detail 은 `null` — 레코드가 값을 들고 있어도 내보내지 않는다', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    const ready = await b.clients.sessions.getDetail({ sessionId: session.id });
    expect(ready.status).toBe('ready');
    expect(ready.completionBubble).toBeNull();

    await b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r'));
    const recording = await b.clients.sessions.getDetail({ sessionId: session.id });
    expect(recording.completionBubble).toBeNull();

    await b.clients.sessions.transition({ sessionId: session.id, body: to('abandoned') }, ik('a'));
    const abandoned = await b.clients.sessions.getDetail({ sessionId: session.id });
    expect(abandoned.completionBubble).toBeNull();
  });

  it.each([
    ['session-completion:success', MOCK_COMPLETION_BUBBLE],
    ['session-completion:subtext-missing', MOCK_COMPLETION_BUBBLE_NO_SUBTEXT],
    ['session-completion:bubble-missing', null],
  ])('`%s` → 전이 응답 = Detail · replay 도 같다', async (scenario, expected) => {
    const b = bundle(scenario);
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    await b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r'));
    const body = to('completed');
    const done = await b.clients.sessions.transition({ sessionId: session.id, body }, ik('d'));
    const replay = await b.clients.sessions.transition({ sessionId: session.id, body }, ik('d'));
    const detail = await b.clients.sessions.getDetail({ sessionId: session.id });

    expect(done.completionBubble).toStrictEqual(expected);
    expect(replay.completionBubble).toStrictEqual(expected);
    expect(detail.completionBubble).toStrictEqual(expected);
  });

  it('지난 세션 seed 는 `sticker: null` 이므로 `subtext` 도 `null` 이다 — 응답이 스스로 모순되지 않는다', async () => {
    const b = bundle();
    const { items } = await b.clients.sessions.list({ childId: MOCK_CHILD_ID, query: {} });
    expect(items.length).toBeGreaterThanOrEqual(MOCK_HISTORY_RECORDING_IDS.length);
    for (const item of items) {
      const detail = await b.clients.sessions.getDetail({ sessionId: item.id });
      expect(detail.sticker).toBeNull();
      expect(detail.completionBubble?.subtext ?? null).toBeNull();
    }
  });
});

describe('MockSessionApi — 상태 규칙: contracts `canTransition()` 판정', () => {
  it('허용되지 않은 전이 → SESSION_INVALID_TRANSITION + details {from,to}', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    const error = await errorOf(
      b.clients.sessions.transition({ sessionId: session.id, body: to('paused') }, ik('bad')),
    );
    expect(error.code).toBe('SESSION_INVALID_TRANSITION');
    expect(error.details).toStrictEqual({ from: 'ready', to: 'paused' });
  });

  it('대화 전용 세션은 ready → completed 가 되고, recording 은 거절된다', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create(
      { body: sessionBody({ mode: 'conversation_only', bookId: null }) },
      ik('c'),
    );
    expect(
      await codeOf(
        b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r')),
      ),
    ).toBe('SESSION_INVALID_TRANSITION');
    const done = await b.clients.sessions.transition(
      { sessionId: session.id, body: to('completed') },
      ik('d'),
    );
    expect(done.session.status).toBe('completed');
  });

  it('누적 30분에 닿은 세션의 재개 → SESSION_MAX_DURATION_EXCEEDED', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    await b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r'));
    await b.clients.sessions.transition(
      { sessionId: session.id, body: to('paused', { recordedSeconds: 1800 }) },
      ik('p'),
    );
    expect(
      await codeOf(
        b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r2')),
      ),
    ).toBe('SESSION_MAX_DURATION_EXCEEDED');
  });

  it('진행 중 세션이 있으면 새 create → SESSION_ALREADY_ACTIVE, 같은 clientSessionKey 는 같은 세션', async () => {
    const b = bundle();
    const first = await b.clients.sessions.create({ body: sessionBody() }, ik('c1'));
    const again = await b.clients.sessions.create({ body: sessionBody() }, ik('c2'));
    expect(again.session.id).toBe(first.session.id);

    const error = await errorOf(
      b.clients.sessions.create(
        { body: sessionBody({ clientSessionKey: 'client-session-key-0002' }) },
        ik('c3'),
      ),
    );
    expect(error.code).toBe('SESSION_ALREADY_ACTIVE');
    expect(error.details).toStrictEqual({ sessionId: first.session.id });
  });

  it('스티커는 세션당 1회 — 다른 키로 다시 완료를 보내도 같은 지급이다 (FR-19)', async () => {
    const { b, sessionId } = await completedSession();
    const detail = await b.clients.sessions.getDetail({ sessionId });
    expect(detail.sticker).not.toBeNull();
    // 재완료는 전이표상 불가 → 지급이 새로 생기지 않는다
    expect(
      await codeOf(
        b.clients.sessions.transition({ sessionId, body: to('completed') }, ik('done-again')),
      ),
    ).toBe('SESSION_INVALID_TRANSITION');
    expect((await b.clients.sessions.getDetail({ sessionId })).sticker).toStrictEqual(
      detail.sticker,
    );
  });
});

describe('MockSessionApi — 공통 5종 (AC-4-22~25)', () => {
  it('empty — list 가 items: [] (AC-4-23), 나머지 메서드는 성공', async () => {
    const b = bundle('sessions:empty');
    const list = await b.clients.sessions.list({ childId: MOCK_CHILD_ID, query: {} });
    expect(list).toStrictEqual({ items: [], nextCursor: null });
    const created = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    expect(created.session.status).toBe('ready');
  });

  it('error — 기본 INTERNAL_ERROR Error Envelope (AC-4-24)', async () => {
    const b = bundle('sessions:error');
    const error = await errorOf(b.clients.sessions.create({ body: sessionBody() }, ik('c')));
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.toEnvelope().error.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('error — 번들 옵션으로 code 를 지정한다 (메서드 지정 > 그룹 지정)', async () => {
    const b = bundle('sessions:error', {
      errorCodes: { sessions: 'RATE_LIMITED', 'sessions.create': 'PROVIDER_UNAVAILABLE' },
    });
    expect(await codeOf(b.clients.sessions.create({ body: sessionBody() }, ik('c')))).toBe(
      'PROVIDER_UNAVAILABLE',
    );
    expect(await codeOf(b.clients.sessions.list({ childId: MOCK_CHILD_ID, query: {} }))).toBe(
      'RATE_LIMITED',
    );
  });

  it('retry — 메서드별 1회차 실패 → 같은 입력 재시도 성공 (AC-4-25)', async () => {
    const b = bundle('sessions:retry');
    const body = sessionBody();
    expect(await codeOf(b.clients.sessions.create({ body }, ik('c')))).toBe('INTERNAL_ERROR');
    const created = await b.clients.sessions.create({ body }, ik('c'));
    expect(created.session.status).toBe('ready');
    // 다른 메서드의 1회차는 별도로 센다 — create 의 실패가 transition 의 시도를 소비하지 않았다
    expect(
      await codeOf(
        b.clients.sessions.transition(
          { sessionId: created.session.id, body: to('recording') },
          ik('r'),
        ),
      ),
    ).toBe('INTERNAL_ERROR');
    const started = await b.clients.sessions.transition(
      { sessionId: created.session.id, body: to('recording') },
      ik('r'),
    );
    expect(started.session.status).toBe('recording');
  });

  it('offline — NetworkError', async () => {
    const b = bundle('sessions:offline');
    expect(await codeOf(b.clients.sessions.create({ body: sessionBody() }, ik('c')))).toBe(
      'NETWORK',
    );
  });

  it('loading — 주입 timer 로 지연한다 (실제 timer 는 SESSION_LOADING_DELAY_MS)', async () => {
    const delays: number[] = [];
    const b = bundle('sessions:loading', {
      timer: {
        sleep: (ms) => {
          delays.push(ms);
          return Promise.resolve();
        },
      },
    });
    await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    expect(delays).toStrictEqual([1500]);
  });
});

describe('MockSessionApi — HARU 특화 (AC-4-34~36 · consent · abandoned)', () => {
  it('invalid-transition — 1회차 거절(details.from = 서버 상태), 상태 불변 → 재동기화 후 진행 (AC-4-34)', async () => {
    const b = bundle('sessions:invalid-transition');
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    const error = await errorOf(
      b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r')),
    );
    expect(error.code).toBe('SESSION_INVALID_TRANSITION');
    expect(error.details).toStrictEqual({ from: 'ready', to: 'recording' });

    const server = await b.clients.sessions.getDetail({ sessionId: session.id });
    expect(server.status).toBe('ready');
    const resumed = await b.clients.sessions.transition(
      { sessionId: server.id, body: to('recording') },
      ik('r'),
    );
    expect(resumed.session.status).toBe('recording');
  });

  it('session-already-active — details.sessionId 로 진행 중 세션을 조회할 수 있다 (AC-4-35)', async () => {
    const b = bundle('sessions:session-already-active');
    const error = await errorOf(b.clients.sessions.create({ body: sessionBody() }, ik('c')));
    expect(error.code).toBe('SESSION_ALREADY_ACTIVE');
    expect(error.details).toStrictEqual({ sessionId: MOCK_ACTIVE_SESSION_ID });

    const active = await b.clients.sessions.getDetail({ sessionId: MOCK_ACTIVE_SESSION_ID });
    expect(active.status).toBe('recording');
    expect(SessionDetailSchema.safeParse(active).success).toBe(true);
  });

  it('onboarding-incomplete — 세션 endpoint 전부 ONBOARDING_INCOMPLETE (AC-4-36)', async () => {
    const b = bundle('sessions:onboarding-incomplete');
    const codes = await Promise.all([
      codeOf(b.clients.sessions.create({ body: sessionBody() }, ik('c'))),
      codeOf(b.clients.sessions.getDetail({ sessionId: MOCK_ACTIVE_SESSION_ID })),
      codeOf(
        b.clients.sessions.transition(
          { sessionId: MOCK_ACTIVE_SESSION_ID, body: to('paused') },
          ik('p'),
        ),
      ),
      codeOf(b.clients.sessions.list({ childId: MOCK_CHILD_ID, query: {} })),
    ]);
    expect(codes).toStrictEqual(Array(4).fill('ONBOARDING_INCOMPLETE'));
  });

  it('consent-missing — to=recording 만 CONSENT_REQUIRED (CG)', async () => {
    const b = bundle('sessions:consent-missing');
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    expect(
      await codeOf(
        b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r')),
      ),
    ).toBe('CONSENT_REQUIRED');
    const left = await b.clients.sessions.transition(
      { sessionId: session.id, body: to('abandoned') },
      ik('a'),
    );
    expect(left.session.status).toBe('abandoned');
  });

  it('abandoned — 서버 sweeper 가 ready 세션을 abandoned 로 옮긴다', async () => {
    const b = bundle('sessions:abandoned');
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    expect((await b.clients.sessions.getDetail({ sessionId: session.id })).status).toBe(
      'abandoned',
    );
    const error = await errorOf(
      b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r')),
    );
    expect(error.details).toStrictEqual({ from: 'abandoned', to: 'recording' });
  });
});

describe('MockSessionApi — Idempotency-Key 보관·재생 (AC-4-37)', () => {
  it('같은 키 + 같은 body → 최초 응답 재생, 새 세션을 만들지 않는다', async () => {
    const b = bundle();
    const first = await b.clients.sessions.create({ body: sessionBody() }, ik('same'));
    const second = await b.clients.sessions.create({ body: sessionBody() }, ik('same'));
    expect(second).toStrictEqual(first);
    expect(b.sessionState.sessions.size).toBe(3); // 지난 2 + 새 1
  });

  it('같은 키 + 다른 body → IDEMPOTENCY_KEY_REUSED', async () => {
    const b = bundle();
    await b.clients.sessions.create({ body: sessionBody() }, ik('same'));
    expect(
      await codeOf(
        b.clients.sessions.create({ body: sessionBody({ readingContext: 'now' }) }, ik('same')),
      ),
    ).toBe('IDEMPOTENCY_KEY_REUSED');
  });

  it('전이 replay 는 상태가 이미 바뀌었어도 같은 응답이다 — 스티커 중복 표시 없음 (FR-19)', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    await b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r'));
    const done = await b.clients.sessions.transition(
      { sessionId: session.id, body: to('completed') },
      ik('d'),
    );
    const replay = await b.clients.sessions.transition(
      { sessionId: session.id, body: to('completed') },
      ik('d'),
    );
    expect(replay).toStrictEqual(done);
  });

  it('같은 키를 다른 세션의 전이에 쓰면 다른 요청이다 → IDEMPOTENCY_KEY_REUSED', async () => {
    const b = bundle();
    const a = await b.clients.sessions.create({ body: sessionBody() }, ik('ca'));
    await b.clients.sessions.transition(
      { sessionId: a.session.id, body: to('abandoned') },
      ik('t'),
    );
    const c = await b.clients.sessions.create(
      { body: sessionBody({ clientSessionKey: 'client-session-key-0002' }) },
      ik('cb'),
    );
    expect(
      await codeOf(
        b.clients.sessions.transition({ sessionId: c.session.id, body: to('abandoned') }, ik('t')),
      ),
    ).toBe('IDEMPOTENCY_KEY_REUSED');
  });

  it('실패한 시도는 보관하지 않는다 — 같은 키로 재시도해 성공한다', async () => {
    const b = bundle('sessions:retry');
    await codeOf(b.clients.sessions.create({ body: sessionBody() }, ik('k')));
    const ok = await b.clients.sessions.create({ body: sessionBody() }, ik('k'));
    expect(ok.session.status).toBe('ready');
  });
});

describe('MockSessionApi — 메서드 단위 override (AC-4-87 수단)', () => {
  it('sessions.transition:error — 생성·조회는 성공, 전이만 실패 (Discard 실패 분기 재현)', async () => {
    const b = bundle('sessions.transition:error');
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    expect(
      await codeOf(
        b.clients.sessions.transition({ sessionId: session.id, body: to('abandoned') }, ik('a')),
      ),
    ).toBe('INTERNAL_ERROR');
    expect((await b.clients.sessions.getDetail({ sessionId: session.id })).status).toBe('ready');
  });
});
