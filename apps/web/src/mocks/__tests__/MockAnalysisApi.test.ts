/**
 * `MockAnalysisApi` — Stage 5 `S5-A` (AC-5-10 · 13 · 14, Plan §8 그룹 `analysis` · ARCHITECTURE §10.2).
 */
import {
  canTransition,
  HaruApiError,
  SessionAnalysisStatusSchema,
  SessionDetailSchema,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { isNetworkError } from '../../shared/api/helpers';
import {
  ANALYSIS_SCENARIO_KEYS,
  analysisScenarioGroup,
  type AnalysisScenarioKey,
} from '../analysis/analysisScenarios';
import {
  MOCK_ANALYSIS_PENDING_READS,
  MOCK_DELETED_RECORDING_ID,
  MOCK_SHORT_FEEDBACK,
  MOCK_SHORT_FEEDBACK_LOW_QUALITY,
} from '../fixtures/analysis';
import { MOCK_HISTORY_SESSION_IDS } from '../fixtures/sessions';

import {
  bundle,
  completeBody,
  completedSession,
  ik,
  initBody,
  partData,
  sessionBody,
  to,
} from './stage4-support';

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

/** 녹음 세션을 완료하고 업로드를 확정해 서버 상태를 `analyzing` 으로 만든다 (Stage 4 경로 그대로). */
async function analyzingSession(scenario = '') {
  const { b, sessionId } = await completedSession(scenario);
  const init = await b.clients.recordings.init({ sessionId, body: initBody() }, ik('init'));
  const [target] = init.parts;
  if (target === undefined) throw new Error('no target');
  await b.clients.uploadTransport.uploadPart({ target, data: partData() });
  await b.clients.recordings.complete(
    { recordingId: init.recordingId, body: completeBody() },
    ik('complete'),
  );
  return { b, sessionId, recordingId: init.recordingId };
}

describe('MockAnalysisApi — Catalogue key (§5.4)', () => {
  it('group `analysis` 는 Plan §8 key 만 쓴다', () => {
    expect(analysisScenarioGroup.group).toBe('analysis');
    expect(ANALYSIS_SCENARIO_KEYS).toStrictEqual([
      'success',
      'loading',
      'error',
      'retry',
      'offline',
      'analysis-pending',
      'analysis-completed',
      'analysis-failed',
      'analysis-low-quality',
      'analysis-not-available',
      'recording-deleted',
      'analysis-pending-then-completed',
      'analysis-feedback-missing',
    ]);
  });
});

describe('success — 실제 Mock 상태 + 결정적 worker 전이 (AC-5-14)', () => {
  it('업로드 확정 세션은 `analyzing` 2회 → 3번째 조회에 `analyzed` + `full` + 피드백', async () => {
    const { b, sessionId } = await analyzingSession();
    const seen: string[] = [];
    for (let i = 0; i < MOCK_ANALYSIS_PENDING_READS + 2; i += 1) {
      const status = await b.clients.analysis.getStatus({ sessionId });
      expect(SessionAnalysisStatusSchema.parse(status)).toStrictEqual(status);
      seen.push(status.sessionStatus);
      if (status.sessionStatus === 'analyzing') {
        expect(status.outcome).toBeNull();
        expect(status.shortFeedback).toBeNull();
      } else {
        expect(status.outcome).toBe('full');
        expect(status.shortFeedback).toStrictEqual(MOCK_SHORT_FEEDBACK);
      }
    }
    expect(seen).toStrictEqual(['analyzing', 'analyzing', 'analyzed', 'analyzed']);
    expect(canTransition('analyzing', 'analyzed', 'worker', 'recorded')).toBe(true);

    // 서버 상태가 실제로 옮겨졌다 — 세션 상세도 같은 값이다
    const detail = SessionDetailSchema.parse(await b.clients.sessions.getDetail({ sessionId }));
    expect(detail.status).toBe('analyzed');
    expect(detail.analysisOutcome).toBe('full');
  });

  it('같은 순서의 호출은 같은 결과다 (결정성)', async () => {
    const run = async () => {
      const { b, sessionId } = await analyzingSession();
      const out: unknown[] = [];
      for (let i = 0; i < 4; i += 1) out.push(await b.clients.analysis.getStatus({ sessionId }));
      return out;
    };
    expect(await run()).toStrictEqual(await run());
  });

  it('업로드 전 `completed` 세션은 `completed` 그대로 (worker 전이 없음)', async () => {
    const { b, sessionId } = await completedSession();
    for (let i = 0; i < 4; i += 1) {
      const status = await b.clients.analysis.getStatus({ sessionId });
      expect(status).toMatchObject({
        sessionStatus: 'completed',
        outcome: null,
        shortFeedback: null,
      });
    }
  });

  it('지난 세션 seed — `analyzed` 는 피드백을, `analyzing` 은 worker 진행을 낸다', async () => {
    const b = bundle();
    expect(
      await b.clients.analysis.getStatus({ sessionId: MOCK_HISTORY_SESSION_IDS[0] }),
    ).toMatchObject({
      sessionStatus: 'analyzed',
      outcome: 'full',
      shortFeedback: MOCK_SHORT_FEEDBACK,
    });
    expect(
      (await b.clients.analysis.getStatus({ sessionId: MOCK_HISTORY_SESSION_IDS[1] }))
        .sessionStatus,
    ).toBe('analyzing');
  });
});

describe('ANALYSIS_NOT_AVAILABLE · RESOURCE_NOT_FOUND', () => {
  it.each(ANALYSIS_SCENARIO_KEYS.filter((k) => !['error', 'offline', 'retry'].includes(k)))(
    '`conversation_only` 는 시나리오(%s)와 무관하게 ANALYSIS_NOT_AVAILABLE',
    async (key) => {
      const b = bundle(`analysis:${key}`);
      const { session } = await b.clients.sessions.create(
        { body: sessionBody({ mode: 'conversation_only' }) },
        ik('create'),
      );
      await b.clients.sessions.transition(
        { sessionId: session.id, body: to('completed', { recordedSeconds: 0 }) },
        ik('done'),
      );
      expect(await codeOf(b.clients.analysis.getStatus({ sessionId: session.id }))).toBe(
        'ANALYSIS_NOT_AVAILABLE',
      );
    },
  );

  it('완료 전 세션 → ANALYSIS_NOT_AVAILABLE', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('create'));
    expect(await codeOf(b.clients.analysis.getStatus({ sessionId: session.id }))).toBe(
      'ANALYSIS_NOT_AVAILABLE',
    );
  });

  it('모르는 세션 → RESOURCE_NOT_FOUND', async () => {
    const b = bundle();
    expect(
      await codeOf(
        b.clients.analysis.getStatus({ sessionId: '77777777-7777-4777-8777-0000000000ff' }),
      ),
    ).toBe('RESOURCE_NOT_FOUND');
  });
});

describe('표시 시나리오 — §8 표 (AC-5-13)', () => {
  const TABLE: readonly [AnalysisScenarioKey, string, string | null, string | null | 'none'][] = [
    ['analysis-pending', 'analyzing', null, 'none'],
    ['analysis-completed', 'analyzed', 'full', MOCK_SHORT_FEEDBACK.text],
    ['analysis-failed', 'failed', null, 'none'],
    [
      'analysis-low-quality',
      'analyzed',
      'excluded_low_quality',
      MOCK_SHORT_FEEDBACK_LOW_QUALITY.text,
    ],
    ['recording-deleted', 'completed', null, 'none'],
    ['analysis-feedback-missing', 'analyzed', 'full', null],
  ];

  it.each(TABLE)('%s → %s / %s', async (key, sessionStatus, outcome, text) => {
    const { b, sessionId } = await completedSession(`analysis:${key}`);
    const status = SessionAnalysisStatusSchema.parse(
      await b.clients.analysis.getStatus({ sessionId }),
    );
    expect(status.sessionStatus).toBe(sessionStatus);
    expect(status.outcome).toBe(outcome);
    if (text === 'none') expect(status.shortFeedback).toBeNull();
    else expect(status.shortFeedback?.text).toBe(text);

    // 세션 상세가 같은 상태를 말한다 (두 endpoint 모순 0)
    const detail = SessionDetailSchema.parse(await b.clients.sessions.getDetail({ sessionId }));
    expect(detail.status).toBe(sessionStatus);
    expect(detail.analysisOutcome).toBe(outcome);
  });

  it('`recording-deleted` — 상세의 녹음이 `deleted` (`N5-12` ⓐ, enum 변경 0)', async () => {
    const { b, sessionId } = await completedSession('analysis:recording-deleted');
    const detail = await b.clients.sessions.getDetail({ sessionId });
    expect(detail.recording).toMatchObject({
      recordingId: MOCK_DELETED_RECORDING_ID,
      uploadStatus: 'deleted',
      expiresAt: null,
    });
  });

  it('`recording-deleted` — 이미 녹음이 있는 세션은 그 녹음 id 로 `deleted`', async () => {
    const { b, sessionId, recordingId } = await analyzingSession('analysis:recording-deleted');
    const detail = await b.clients.sessions.getDetail({ sessionId });
    expect(detail.recording).toMatchObject({ recordingId, uploadStatus: 'deleted' });
    expect((await b.clients.analysis.getStatus({ sessionId })).sessionStatus).toBe('completed');
  });

  it('`analysis-not-available` → ANALYSIS_NOT_AVAILABLE (녹음 세션도)', async () => {
    const { b, sessionId } = await analyzingSession('analysis:analysis-not-available');
    expect(await codeOf(b.clients.analysis.getStatus({ sessionId }))).toBe(
      'ANALYSIS_NOT_AVAILABLE',
    );
  });

  it('`analysis-pending-then-completed` — 업로드 전 세션이어도 2회 pending → 완료 (폴링 종료 검증)', async () => {
    const { b, sessionId } = await completedSession('analysis:analysis-pending-then-completed');
    const seen: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      seen.push((await b.clients.analysis.getStatus({ sessionId })).sessionStatus);
    }
    expect(seen).toStrictEqual(['analyzing', 'analyzing', 'analyzed', 'analyzed']);
  });

  it('표시 override 는 서버 상태를 바꾸지 않는다 — 기본으로 돌아오면 실제 상태', async () => {
    const { b, sessionId } = await completedSession('analysis:analysis-failed');
    expect((await b.clients.analysis.getStatus({ sessionId })).sessionStatus).toBe('failed');
    expect(b.sessionState.sessions.get(sessionId)?.summary.status).toBe('completed');
  });
});

describe('공통 시나리오', () => {
  it('`error` → INTERNAL_ERROR, `offline` → NetworkError', async () => {
    const e = await completedSession('analysis:error');
    expect(await codeOf(e.b.clients.analysis.getStatus({ sessionId: e.sessionId }))).toBe(
      'INTERNAL_ERROR',
    );
    const o = await completedSession('analysis:offline');
    expect(await codeOf(o.b.clients.analysis.getStatus({ sessionId: o.sessionId }))).toBe(
      'NETWORK',
    );
  });

  it('`retry` → 1회차 실패, 2회차 성공 · `loading` → 지연 후 성공', async () => {
    const r = await completedSession('analysis:retry');
    expect(await codeOf(r.b.clients.analysis.getStatus({ sessionId: r.sessionId }))).toBe(
      'INTERNAL_ERROR',
    );
    expect(await codeOf(r.b.clients.analysis.getStatus({ sessionId: r.sessionId }))).toBe('OK');
    const l = await completedSession('analysis:loading');
    expect(await codeOf(l.b.clients.analysis.getStatus({ sessionId: l.sessionId }))).toBe('OK');
  });

  it('요청 로그에는 세션 id 만 남는다', async () => {
    const { b, sessionId } = await completedSession();
    await b.clients.analysis.getStatus({ sessionId });
    expect(
      b.requestLog.entries().filter((e) => e.operation === 'GET /v1/sessions/:sessionId/analysis'),
    ).toStrictEqual([
      { operation: 'GET /v1/sessions/:sessionId/analysis', payload: { sessionId } },
    ]);
  });
});
