/**
 * Stage 4a QA — 독립 시나리오 재현 (stage-qa-agent, 2026-10-18).
 *
 * 제품 코드·제품 테스트를 수정하지 않는다. 앱 모듈을 import 해 **QA 가 직접 쓴 단정**으로
 * Mock 시나리오를 다시 돌린다 (구현자 테스트와 독립된 증거).
 * 실행: pnpm exec vitest run --config docs/qa/evidence/stage-4a/qa-independent/vitest.qa.config.ts
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMockRecorderAdapter } from '../../../../../apps/web/src/mocks/platform/MockRecorderAdapter';
import { resolveRecorderScenario } from '../../../../../apps/web/src/mocks/recorder/recorderScenarios';
import { MOCK_CHILD_FIRST_NAME } from '../../../../../apps/web/src/mocks/fixtures/me';
import { bundle, sessionBody, to } from '../../../../../apps/web/src/mocks/__tests__/stage4-support';
import { createConsentGate } from '../../../../../apps/web/src/features/recording/model/consent-gate';
import { createPermissionService } from '../../../../../apps/web/src/features/recording/model/permission-service';
import { createRecordingController } from '../../../../../apps/web/src/features/recording/model/recording-controller';
import {
  CONSENTED,
  VOICE_MISSING,
  flush,
} from '../../../../../apps/web/src/features/recording/model/__tests__/controller-support';
import {
  createRuntimeHarness,
  type RuntimeHarnessOptions,
} from '../../../../../apps/web/src/features/recording/model/__tests__/runtime-support';

const consoleCalls: string[] = [];
for (const level of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
    consoleCalls.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
  });
}

afterEach(() => {
  // AC-4-90: 어떤 시나리오에서도 콘솔에 아이 이름·토큰·로컬 경로가 찍히지 않는다.
  for (const line of consoleCalls) {
    expect(line).not.toContain(MOCK_CHILD_FIRST_NAME);
    expect(line.toLowerCase()).not.toContain('uploadtoken');
    expect(line).not.toMatch(/opfs|indexeddb:\/\//i);
  }
});

async function rig(scenario: string, opts: Omit<RuntimeHarnessOptions, 'scenario'> = {}, consent = CONSENTED) {
  const h = createRuntimeHarness({ scenario, ...opts });
  const created = await h.mock.clients.sessions.create(
    { body: sessionBody() },
    { idempotencyKey: 'ik-qa-create' },
  );
  const sessionId = created.session.id;
  const recorder = createMockRecorderAdapter({
    plan: resolveRecorderScenario(h.mock.store),
    clock: h.scheduler,
    scheduler: h.scheduler,
  });
  const { sink, transitions } = h.runtime.portsFor(sessionId);
  const controller = createRecordingController({
    sessionId,
    mode: 'recorded',
    recorder,
    permissions: createPermissionService(recorder),
    consentGate: createConsentGate(() => consent),
    transitions,
    sink,
    clock: h.scheduler,
    scheduler: h.scheduler,
    readyReminderAfterSeconds: 300,
  });
  await h.runtime.start({ activeSessionIds: new Set([sessionId]) });
  const files = () => h.storage.bytes.countFiles(sessionId);
  const status = async () => (await h.mock.clients.sessions.getDetail({ sessionId })).status;
  const advance = async (ms: number) => {
    h.scheduler.advance(ms);
    await flush();
  };
  return { h, sessionId, controller, recorder, files, status, advance };
}

describe('QA 독립 재현 — Controller × Runtime × 실제 Mock 번들', () => {
  it('AC-4-26/71 success: Submit 직후 로컬 > 0 → 업로드 확정 후 0, 세션 analyzing, 순서 init→PATCH→complete', async () => {
    const t = await rig('');
    await t.controller.start();
    await t.advance(5000);
    await t.controller.submit();
    // 업로드 drain 전에도 Submit 은 끝난다 — 이 시점 로컬 보존
    const before = await t.files();
    expect(before).toBeGreaterThan(0);
    await t.h.runtime.queue.drain();
    await t.advance(1000);
    await t.h.runtime.queue.drain();
    const ops = t.h.operations();
    const iInit = ops.indexOf('POST /v1/sessions/:sessionId/recordings');
    const iPatch = ops.indexOf('TUS PATCH');
    const iComplete = ops.indexOf('POST /v1/recordings/:recordingId/complete');
    expect(iInit).toBeGreaterThan(-1);
    expect(iPatch).toBeGreaterThan(iInit);
    expect(iComplete).toBeGreaterThan(iPatch);
    expect(await t.files()).toBe(0);
    expect(await t.status()).toBe('analyzing');
    expect(t.h.transitionTargets()).toEqual(['recording', 'completed']);
  });

  it('AC-4-62/89 consent missing (client gate): 녹음기·전이·업로드 요청 0건', async () => {
    const t = await rig('', {}, VOICE_MISSING);
    const before = t.h.operations().length;
    const outcome = await t.controller.start();
    await t.advance(5000);
    expect(outcome.ok).toBe(false);
    expect(t.h.operations().slice(before)).toEqual([]);
    expect(await t.files()).toBe(0);
  });

  it('AC-4-62 server consent-missing: 서버 CONSENT_REQUIRED → 업로드 init 0건', async () => {
    const t = await rig('sessions:consent-missing');
    await t.controller.start();
    await t.advance(3000);
    expect(t.h.count('POST /v1/sessions/:sessionId/recordings')).toBe(0);
    expect(t.controller.getSnapshot().status).not.toBe('recording');
  });

  it('AC-4-27 recording-upload-failure: 2시간 재시도 후에도 로컬 파일 보존, complete 성공 0', async () => {
    const t = await rig('recordings:recording-upload-failure');
    await t.controller.start();
    await t.advance(4000);
    await t.controller.submit();
    const before = await t.files();
    for (let i = 0; i < 24; i += 1) {
      await t.advance(5 * 60 * 1000);
      await t.h.runtime.queue.drain();
    }
    expect(before).toBeGreaterThan(0);
    expect(await t.files()).toBe(before);
    expect(await t.status()).not.toBe('analyzing');
  });

  it('AC-4-33 recording-deleted: 큐 포기 + 로컬 0', async () => {
    const t = await rig('recordings:recording-deleted');
    await t.controller.start();
    await t.advance(3000);
    await t.controller.submit();
    for (let i = 0; i < 6; i += 1) {
      await t.advance(60 * 1000);
      await t.h.runtime.queue.drain();
    }
    expect(t.h.count('POST /v1/recordings/:recordingId/upload-tokens')).toBeGreaterThan(0);
    expect(await t.files()).toBe(0);
    expect(t.h.count('POST /v1/recordings/:recordingId/complete')).toBe(0);
  });

  it('AC-4-66 offline: 전이 요청 0 → online 복귀 시 같은 순서로 전송, 업로드 후 로컬 0', async () => {
    const t = await rig('', { connectivity: 'offline' });
    await t.controller.start();
    await t.advance(2000);
    await t.controller.pause();
    await t.controller.resume();
    await t.advance(2000);
    await t.controller.submit();
    expect(t.h.transitionTargets()).toEqual([]);
    expect(await t.files()).toBeGreaterThan(0);
    t.h.appState.setConnectivity('online');
    await flush();
    for (let i = 0; i < 5; i += 1) {
      await t.advance(1000);
      await t.h.runtime.outbox.flush();
      await t.h.runtime.queue.drain();
    }
    expect(t.h.transitionTargets()).toEqual(['recording', 'paused', 'recording', 'completed']);
    expect(await t.files()).toBe(0);
  });

  it('AC-4-113 (4a 부분) Discard online: abandoned 1건, completedReason 없음, 확정 후 로컬 0', async () => {
    const t = await rig('');
    await t.controller.start();
    await t.advance(3000);
    expect(await t.files()).toBeGreaterThan(0);
    await t.controller.discard();
    await flush();
    const abandoned = t.h.mock.requestLog
      .entries()
      .filter((e) => e.operation === 'POST /v1/sessions/:sessionId/transitions')
      .map((e) => e.payload as Record<string, unknown>)
      .filter((p) => p['to'] === 'abandoned');
    expect(abandoned).toHaveLength(1);
    expect(abandoned[0]).not.toHaveProperty('completedReason');
    expect(await t.files()).toBe(0);
    expect(await t.status()).toBe('abandoned');
  });

  it('AC-4-113 (4a 부분) Discard 실패 주입(sessions.transition:error 는 첫 전이부터 실패하므로 retry 사용): 로컬 보존', async () => {
    const t = await rig('');
    await t.controller.start();
    await t.advance(3000);
    const filesBefore = await t.files();
    // 서버가 폐기 전이를 거절하도록 상태를 어긋나게 만든다: 서버 세션을 먼저 completed 로 보낸다.
    await t.h.mock.clients.sessions.transition(
      { sessionId: t.sessionId, body: to('completed') },
      { idempotencyKey: 'ik-qa-force-complete' },
    );
    await t.controller.discard();
    await flush();
    // 폐기 시 캡처 종료 조각 1개가 더 기록될 수 있다 — 핵심은 "삭제되지 않았다"
    expect(await t.files()).toBeGreaterThanOrEqual(filesBefore);
    expect(filesBefore).toBeGreaterThan(0);
  });

  it('AC-4-113 (4a 부분) Discard offline: outbox 적재·로컬 보존 → online 확정 후 0', async () => {
    const t = await rig('', { connectivity: 'offline' });
    await t.controller.start();
    await t.advance(3000);
    await t.controller.discard();
    await flush();
    expect(await t.files()).toBeGreaterThan(0);
    expect(t.h.transitionTargets()).toEqual([]);
    t.h.appState.setConnectivity('online');
    for (let i = 0; i < 5; i += 1) {
      await t.advance(1000);
    }
    expect(t.h.transitionTargets()).toEqual(['recording', 'abandoned']);
    expect(await t.files()).toBe(0);
  });

  it('AC-4-44/45 auto-timeout: 1800s 에 completed(auto_timeout) 1건, 로컬 보존', async () => {
    const t = await rig('');
    await t.controller.start();
    await t.advance(1799 * 1000);
    expect(t.controller.getSnapshot().status).toBe('recording');
    await t.advance(1000);
    // 실제 LocalRecordingStore(비동기 sink)에 1800 청크가 쌓여 있으므로 마이크로태스크를 충분히 비운다
    for (let i = 0; i < 5000 && t.h.transitionTargets().length < 2; i += 1) await flush();
    const completed = t.h.mock.requestLog
      .entries()
      .filter((e) => e.operation === 'POST /v1/sessions/:sessionId/transitions')
      .map((e) => e.payload as Record<string, unknown>)
      .filter((p) => p['to'] === 'completed');
    expect(completed).toHaveLength(1);
    expect(completed[0]?.['completedReason']).toBe('auto_timeout');
    expect(completed[0]?.['recordedSeconds']).toBe(1800);
    // 업로드 전에는 로컬 보존
    expect(await t.files()).toBeGreaterThan(1700);
  });

  it('AC-4-43 pause 60s 동안 recordedSeconds 불변', async () => {
    const t = await rig('');
    await t.controller.start();
    await t.advance(10_000);
    await t.controller.pause();
    const a = t.controller.getSnapshot().recordedSeconds;
    await t.advance(60_000);
    expect(t.controller.getSnapshot().recordedSeconds).toBe(a);
    expect(a).toBe(10);
  });

  it('AC-4-37 Idempotency: 같은 키+다른 body → IDEMPOTENCY_KEY_REUSED, 같은 body → 같은 세션', async () => {
    const m = bundle('');
    const a = await m.clients.sessions.create({ body: sessionBody() }, { idempotencyKey: 'ik-x' });
    const b = await m.clients.sessions.create({ body: sessionBody() }, { idempotencyKey: 'ik-x' });
    expect(b.session.id).toBe(a.session.id);
    await expect(
      m.clients.sessions.create(
        { body: sessionBody({ readingContext: 'in_the_car' }) },
        { idempotencyKey: 'ik-x' },
      ),
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_REUSED' });
  });

  it('Mock 결정성: 같은 scenario 전체 흐름 2회 → 요청 로그 JSON 동일', async () => {
    const run = async () => {
      const t = await rig('recordings:upload-retry');
      await t.controller.start();
      await t.advance(4000);
      await t.controller.submit();
      for (let i = 0; i < 6; i += 1) {
        await t.advance(30_000);
        await t.h.runtime.queue.drain();
      }
      return JSON.stringify(t.h.mock.requestLog.entries());
    };
    expect(await run()).toBe(await run());
  });

  it('AC-4-72 clearAll: 로컬 녹음·outbox·큐 이름 공간 0', async () => {
    const t = await rig('', { connectivity: 'offline' });
    await t.controller.start();
    await t.advance(3000);
    await t.controller.submit();
    expect(await t.files()).toBeGreaterThan(0);
    await t.h.runtime.clearAll();
    expect(await t.files()).toBe(0);
    for (const ns of ['recordings', 'chunks', 'outbox', 'uploads'] as const) {
      expect(await t.h.storage.kv.list(ns as never)).toEqual([]);
    }
  });
});
