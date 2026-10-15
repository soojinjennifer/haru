/**
 * `RecordingController` × 실제 Mock 번들 (`MockSessionApi` · `recorder` scenario) 통합 테스트 (`S4-D`).
 *
 * 경로: `RecordingController → SessionTransitionPort → sessionApi(interface) → MockSessionApi`.
 * 증거는 Mock **요청 로그**다 (AC-4-62 "요청 0건", AC-4-41/42 "전이 1건", AC-4-34 재동기화).
 */
import { describe, expect, it } from 'vitest';

import { createMockRecorderAdapter } from '../../../../mocks/platform/MockRecorderAdapter';
import { resolveRecorderScenario } from '../../../../mocks/recorder/recorderScenarios';
import { bundle, sessionBody } from '../../../../mocks/__tests__/stage4-support';
import { createManualScheduler } from '../../../../test/manual-scheduler';
import { createConsentGate } from '../consent-gate';
import { createPermissionService } from '../permission-service';
import { createRecordingController } from '../recording-controller';
import { createSessionApiTransitionPort } from '../session-transition-port';

import {
  CONSENTED,
  START_MS,
  TEST_REMINDER_SECONDS,
  VOICE_MISSING,
  createMemorySink,
  flush,
} from './controller-support';

const TRANSITION = 'POST /v1/sessions/:sessionId/transitions';
const DETAIL = 'GET /v1/sessions/:sessionId';

async function setup(scenario: string, consent = CONSENTED) {
  const mock = bundle(scenario);
  const created = await mock.clients.sessions.create(
    { body: sessionBody() },
    { idempotencyKey: 'ik-create' },
  );
  const sessionId = created.session.id;
  const scheduler = createManualScheduler(START_MS);
  const recorder = createMockRecorderAdapter({
    plan: resolveRecorderScenario(mock.store),
    clock: scheduler,
    scheduler,
  });
  let key = 0;
  const sink = createMemorySink();
  const controller = createRecordingController({
    sessionId,
    mode: 'recorded',
    recorder,
    permissions: createPermissionService(recorder),
    consentGate: createConsentGate(() => consent),
    transitions: createSessionApiTransitionPort({
      sessionApi: mock.clients.sessions,
      sessionId,
      createKey: () => `ik-transition-${String((key += 1))}`,
    }),
    sink,
    clock: scheduler,
    scheduler,
    readyReminderAfterSeconds: TEST_REMINDER_SECONDS,
  });
  const operations = () => mock.requestLog.entries().map((entry) => entry.operation);
  const transitions = () =>
    mock.requestLog
      .entries()
      .filter((entry) => entry.operation === TRANSITION)
      .map((entry) => (entry.payload as { to: string }).to);
  const serverStatus = async () => (await mock.clients.sessions.getDetail({ sessionId })).status;
  return { mock, controller, recorder, scheduler, sink, operations, transitions, serverStatus };
}

describe('MockSessionApi 연동 — 전이 1건씩 (AC-4-41 · AC-4-42 의 요청 부분)', () => {
  it('start → pause → resume → submit = 전이 요청 4건, 서버 상태 completed', async () => {
    const t = await setup('');
    await t.controller.start();
    t.scheduler.advance(3000);
    await flush();
    await t.controller.pause();
    await t.controller.resume();
    t.scheduler.advance(2000);
    await flush();
    const outcome = await t.controller.submit();
    expect(t.transitions()).toEqual(['recording', 'paused', 'recording', 'completed']);
    expect(await t.serverStatus()).toBe('completed');
    expect(outcome.ok && outcome.result?.session.recordedSeconds).toBe(5);
    expect(t.controller.getSnapshot().syncError).toBeNull();
  });

  it('Discard → 서버 abandoned 확정 → 로컬 삭제 (D4-13)', async () => {
    const t = await setup('');
    await t.controller.start();
    t.scheduler.advance(2000);
    await flush();
    await t.controller.discard();
    expect(t.transitions()).toEqual(['recording', 'abandoned']);
    expect(await t.serverStatus()).toBe('abandoned');
    expect(t.sink.fileCount()).toBe(0);
  });

  it('sessions.transition:error 로 Discard 가 실패하면 로컬을 보존한다', async () => {
    const t = await setup('sessions.transition:error');
    await t.controller.start();
    t.scheduler.advance(2000);
    await flush();
    await t.controller.discard();
    expect(t.sink.fileCount()).toBe(3);
    expect(t.controller.getSnapshot().syncError).toEqual({ kind: 'api', code: 'INTERNAL_ERROR' });
  });
});

describe('AC-4-62 — consent-missing: 녹음 시작 UI 차단 = 전이 요청 0건', () => {
  it('클라이언트 게이트가 막으면 Mock 에 recording 전이가 한 건도 가지 않는다', async () => {
    const t = await setup('sessions:consent-missing', VOICE_MISSING);
    const outcome = await t.controller.start();
    expect(outcome).toEqual({ ok: false, reason: 'consent_required' });
    expect(t.transitions()).toEqual([]);
    expect(t.recorder.controls.calls).toEqual([]);
  });

  it('게이트가 낡아 통과해도 서버 CONSENT_REQUIRED → 재동기화 + consent_blocked (2차 방어)', async () => {
    const t = await setup('sessions:consent-missing', CONSENTED);
    await t.controller.start();
    await flush();
    expect(t.operations().filter((operation) => operation === DETAIL)).toHaveLength(1);
    expect(t.controller.getSnapshot()).toMatchObject({ status: 'ready', phase: 'consent_blocked' });
    expect(t.recorder.controls.isCapturing()).toBe(false);
  });
});

describe('AC-4-34 — invalid-transition: 서버 상태 조회 후 재시도로 진행', () => {
  it('1회차 SESSION_INVALID_TRANSITION → getDetail 1회 → ready 로 맞춤 → 재시작 성공', async () => {
    const t = await setup('sessions:invalid-transition');
    await t.controller.start();
    await flush();
    expect(t.controller.getSnapshot().syncError).toEqual({
      kind: 'api',
      code: 'SESSION_INVALID_TRANSITION',
    });
    expect(t.operations().filter((operation) => operation === DETAIL)).toHaveLength(1);
    expect(t.controller.getSnapshot().status).toBe('ready');
    const retry = await t.controller.start();
    expect(retry.ok && retry.result?.session.status).toBe('recording');
    expect(await t.serverStatus()).toBe('recording');
  });
});

describe('recorder scenario 계획 실행', () => {
  it('recorder:web-background-warning — 알림 1회, 녹음 계속 (D4-26)', async () => {
    const t = await setup('recorder:web-background-warning');
    const notices: string[] = [];
    t.controller.onEvent((event) => {
      if (event.type === 'notice') notices.push(event.interruption.cause);
    });
    await t.controller.start();
    for (let second = 0; second < 10; second += 1) {
      t.scheduler.advance(1000);
      await flush();
    }
    expect(notices).toEqual(['background']);
    expect(t.controller.getSnapshot()).toMatchObject({ status: 'recording', chunkCount: 10 });
  });

  it('recorder.track-ended:recording-interrupted — capture_lost 로 paused + 전이 1건', async () => {
    const t = await setup('recorder.track-ended:recording-interrupted');
    await t.controller.start();
    for (let second = 0; second < 3; second += 1) {
      t.scheduler.advance(1000);
      await flush();
    }
    expect(t.controller.getSnapshot()).toMatchObject({
      status: 'paused',
      phase: 'interrupted',
      interruption: { cause: 'capture_lost' },
    });
    expect(t.transitions()).toEqual(['recording', 'paused']);
    expect(t.sink.fileCount()).toBe(4);
  });

  it('recorder:mic-permission-denied — 녹음기 start 0회, 전이 0건', async () => {
    const t = await setup('recorder:mic-permission-denied');
    expect(await t.controller.start()).toEqual({ ok: false, reason: 'permission_denied' });
    expect(t.recorder.controls.calls).not.toContain('start');
    expect(t.transitions()).toEqual([]);
  });
});
