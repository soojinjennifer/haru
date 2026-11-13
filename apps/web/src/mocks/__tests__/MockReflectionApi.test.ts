/**
 * `MockReflectionApi` — Stage 5 `S5-A` (AC-5-10 · 11 · 12 · 05, Plan §8 그룹 `reflections`).
 */
import {
  HaruApiError,
  ReflectionSchema,
  SessionDetailSchema,
  type SubmitReflectionRequest,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { isNetworkError } from '../../shared/api/helpers';
import { MOCK_HISTORY_SESSION_IDS } from '../fixtures/sessions';
import { MOCK_SUBMITTED_REFLECTION_INPUT } from '../fixtures/reflections';
import {
  REFLECTION_SCENARIO_KEYS,
  reflectionScenarioGroup,
} from '../reflections/MockReflectionApi';

import { bundle, completedSession, ik, sessionBody, to } from './stage4-support';

const BODY: SubmitReflectionRequest = {
  rating: 4,
  checks: ['engaged', 'tricky_today'],
  note: 'The moon part',
};

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

describe('MockReflectionApi — Catalogue key (§5.4)', () => {
  it('group `reflections` 는 Plan §8 key 만 쓴다 — `empty`(skip) 없음 (`N5-06` ⓐ)', () => {
    expect(reflectionScenarioGroup.group).toBe('reflections');
    expect(REFLECTION_SCENARIO_KEYS).toStrictEqual([
      'success',
      'loading',
      'error',
      'retry',
      'offline',
      'reflection-already-submitted',
      'invalid-transition',
    ]);
  });
});

describe('MockReflectionApi — success (AC-5-10)', () => {
  it('완료 세션에 제출 → contracts parse 를 통과한 `Reflection`, 이후 상세의 `reflection` 에 보인다', async () => {
    const { b, sessionId } = await completedSession();
    const reflection = await b.clients.reflections.submit({ sessionId, body: BODY }, ik('r1'));

    expect(ReflectionSchema.parse(reflection)).toStrictEqual(reflection);
    expect(reflection).toMatchObject({ sessionId, ...BODY });

    const detail = await b.clients.sessions.getDetail({ sessionId });
    expect(SessionDetailSchema.parse(detail).reflection).toStrictEqual(reflection);
  });

  it('요청 로그에 body 가 그대로 남는다 (AC-5-24 증거 경로)', async () => {
    const { b, sessionId } = await completedSession();
    await b.clients.reflections.submit({ sessionId, body: BODY }, ik('r1'));
    const entry = b.requestLog
      .entries()
      .find((e) => e.operation === 'POST /v1/sessions/:sessionId/reflection');
    expect(entry?.payload).toStrictEqual({ sessionId, ...BODY });
  });

  it('대화 전용 완료 세션도 제출할 수 있다 (두 mode 모두 — AC-5-31)', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create(
      { body: sessionBody({ mode: 'conversation_only' }) },
      ik('create'),
    );
    await b.clients.sessions.transition(
      { sessionId: session.id, body: to('completed', { recordedSeconds: 0 }) },
      ik('done'),
    );
    expect(
      await codeOf(b.clients.reflections.submit({ sessionId: session.id, body: BODY }, ik('r'))),
    ).toBe('OK');
  });

  it('`auto_timeout` 완료 세션도 제출할 수 있다 (§13 30분 — AC-5-31)', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('create'));
    await b.clients.sessions.transition(
      { sessionId: session.id, body: to('recording') },
      ik('rec'),
    );
    await b.clients.sessions.transition(
      {
        sessionId: session.id,
        body: to('completed', { completedReason: 'auto_timeout', recordedSeconds: 1800 }),
      },
      ik('done'),
    );
    expect(
      await codeOf(b.clients.reflections.submit({ sessionId: session.id, body: BODY }, ik('r'))),
    ).toBe('OK');
  });

  it('지난 세션(`analyzed`)에도 제출할 수 있다 — 세션 seed 를 공유한다', async () => {
    const b = bundle();
    const sessionId = MOCK_HISTORY_SESSION_IDS[0];
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('r')))).toBe(
      'OK',
    );
  });

  it('모르는 세션 → RESOURCE_NOT_FOUND', async () => {
    const b = bundle();
    expect(
      await codeOf(
        b.clients.reflections.submit(
          { sessionId: '77777777-7777-4777-8777-0000000000ff', body: BODY },
          ik('r'),
        ),
      ),
    ).toBe('RESOURCE_NOT_FOUND');
  });
});

describe('MockReflectionApi — 멱등 · 세션당 1건 (AC-5-11)', () => {
  it('같은 key + 같은 body → 같은 응답 (새 회고 없음)', async () => {
    const { b, sessionId } = await completedSession();
    const first = await b.clients.reflections.submit({ sessionId, body: BODY }, ik('same'));
    const again = await b.clients.reflections.submit({ sessionId, body: BODY }, ik('same'));
    expect(again).toStrictEqual(first);
  });

  it('같은 key + 다른 body → IDEMPOTENCY_KEY_REUSED', async () => {
    const { b, sessionId } = await completedSession();
    await b.clients.reflections.submit({ sessionId, body: BODY }, ik('same'));
    expect(
      await codeOf(
        b.clients.reflections.submit({ sessionId, body: { ...BODY, rating: 5 } }, ik('same')),
      ),
    ).toBe('IDEMPOTENCY_KEY_REUSED');
  });

  it('제출 후 새 key 로 재제출 → REFLECTION_ALREADY_SUBMITTED', async () => {
    const { b, sessionId } = await completedSession();
    await b.clients.reflections.submit({ sessionId, body: BODY }, ik('first'));
    expect(
      await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('second'))),
    ).toBe('REFLECTION_ALREADY_SUBMITTED');
  });

  it('실패한 시도는 보관하지 않는다 — `retry` 1회차 실패 후 같은 key 로 성공', async () => {
    const { b, sessionId } = await completedSession('reflections:retry');
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'INTERNAL_ERROR',
    );
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'OK',
    );
  });
});

describe('MockReflectionApi — 허용 상태 (AC-5-12)', () => {
  it.each([
    ['ready', [] as const],
    ['recording', ['recording'] as const],
    ['paused', ['recording', 'paused'] as const],
  ])('서버 상태가 %s 면 SESSION_INVALID_TRANSITION(`details.from`)', async (status, steps) => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('create'));
    for (const step of steps) {
      await b.clients.sessions.transition({ sessionId: session.id, body: to(step) }, ik(step));
    }
    try {
      await b.clients.reflections.submit({ sessionId: session.id, body: BODY }, ik('r'));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(HaruApiError);
      expect((error as HaruApiError).code).toBe('SESSION_INVALID_TRANSITION');
      expect((error as HaruApiError).details?.['from']).toBe(status);
    }
  });

  it('`abandoned` 세션 → SESSION_INVALID_TRANSITION', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('create'));
    await b.clients.sessions.transition({ sessionId: session.id, body: to('abandoned') }, ik('x'));
    expect(
      await codeOf(b.clients.reflections.submit({ sessionId: session.id, body: BODY }, ik('r'))),
    ).toBe('SESSION_INVALID_TRANSITION');
  });

  it('`invalid-transition` — 1회차만 거부(오프라인 Submit 이 Outbox 에 남은 경우), 2회차 성공', async () => {
    const { b, sessionId } = await completedSession('reflections:invalid-transition');
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'SESSION_INVALID_TRANSITION',
    );
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'OK',
    );
  });
});

describe('MockReflectionApi — 시나리오 (AC-5-10)', () => {
  it('`error` → INTERNAL_ERROR · 상태 불변', async () => {
    const { b, sessionId } = await completedSession('reflections:error');
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'INTERNAL_ERROR',
    );
    expect((await b.clients.sessions.getDetail({ sessionId })).reflection).toBeNull();
  });

  it('`error` + code 지정 (번들 옵션)', async () => {
    const { b, sessionId } = await completedSession('reflections:error', {
      errorCodes: { reflections: 'RATE_LIMITED' },
    });
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'RATE_LIMITED',
    );
  });

  it('`offline` → NetworkError', async () => {
    const { b, sessionId } = await completedSession('reflections:offline');
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'NETWORK',
    );
  });

  it('`loading` → 지연 후 성공 (즉시 timer)', async () => {
    const { b, sessionId } = await completedSession('reflections:loading');
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'OK',
    );
  });

  it('`reflection-already-submitted` → REFLECTION_ALREADY_SUBMITTED', async () => {
    const { b, sessionId } = await completedSession('reflections:reflection-already-submitted');
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'REFLECTION_ALREADY_SUBMITTED',
    );
  });

  it('빈 회고 · 범위 밖 별점 · 중복 칩 → VALIDATION_FAILED (요청 parse)', async () => {
    const { b, sessionId } = await completedSession();
    for (const body of [
      { rating: null, checks: [], note: null },
      { ...BODY, rating: 6 },
      { ...BODY, checks: ['engaged', 'engaged'] },
      { ...BODY, note: '   ' },
    ]) {
      expect(
        await codeOf(
          b.clients.reflections.submit(
            { sessionId, body: body as SubmitReflectionRequest },
            ik(JSON.stringify(body)),
          ),
        ),
      ).toBe('VALIDATION_FAILED');
    }
  });
});

describe('session-completion:reflection-submitted (AC-5-30)', () => {
  it('완료 세션 상세에 제출된 회고가 있고, 다시 제출하면 REFLECTION_ALREADY_SUBMITTED', async () => {
    const { b, sessionId } = await completedSession('session-completion:reflection-submitted');
    const detail = await b.clients.sessions.getDetail({ sessionId });
    expect(detail.reflection).toMatchObject({ sessionId, ...MOCK_SUBMITTED_REFLECTION_INPUT });
    expect(await codeOf(b.clients.reflections.submit({ sessionId, body: BODY }, ik('k')))).toBe(
      'REFLECTION_ALREADY_SUBMITTED',
    );
    // 같은 값이 유지된다 (결정적)
    expect((await b.clients.sessions.getDetail({ sessionId })).reflection).toStrictEqual(
      detail.reflection,
    );
  });

  it('완료 전 세션에는 회고가 생기지 않는다', async () => {
    const b = bundle('session-completion:reflection-submitted');
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('create'));
    expect((await b.clients.sessions.getDetail({ sessionId: session.id })).reflection).toBeNull();
  });
});
