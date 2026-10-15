/**
 * `SessionOutbox` — 전이 이벤트 영속·순서 보존 재전송 (Stage 4 `S4-E`, AC-4-66 · AC-4-113 ⑤ 의 로직 부분).
 *
 * 증거: Mock 요청 로그(순서·Idempotency-Key) + 기기에 적재된 항목.
 */
import { HaruApiError } from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { NetworkError, type SessionApi } from '../../../../shared/api';
import { bundle, ik, sessionBody, to } from '../../../../mocks/__tests__/stage4-support';
import { createMockAppStatePort } from '../../../../mocks/platform/MockAppStatePort';
import { createMockRecordingStorage } from '../../../../mocks/platform/MockRecordingStorage';
import { createManualScheduler } from '../../../../test/manual-scheduler';
import { createSessionOutbox, OUTBOX_BACKOFF_MS, type OutboxEvent } from '../session-outbox';

import { START_MS, TRANSITION_OP } from './runtime-support';

async function setup(
  options: {
    connectivity?: 'online' | 'offline';
    wrap?: (api: SessionApi) => Pick<SessionApi, 'transition' | 'getDetail'>;
  } = {},
) {
  const mock = bundle();
  const { session } = await mock.clients.sessions.create({ body: sessionBody() }, ik('create'));
  const scheduler = createManualScheduler(START_MS);
  const storage = createMockRecordingStorage();
  const appState = createMockAppStatePort({ connectivity: options.connectivity ?? 'online' });
  let key = 0;
  const outbox = createSessionOutbox({
    kv: storage.kv,
    sessionApi: options.wrap?.(mock.clients.sessions) ?? mock.clients.sessions,
    appState,
    clock: scheduler,
    scheduler,
    createKey: () => `ik-outbox-${String((key += 1))}`,
  });
  const events: OutboxEvent[] = [];
  outbox.onEvent((event) => events.push(event));
  const sent = () =>
    mock.requestLog
      .entries()
      .filter((entry) => entry.operation === TRANSITION_OP)
      .map((entry) => (entry.payload as { to: string }).to);
  return { mock, sessionId: session.id, scheduler, storage, appState, outbox, events, sent };
}

describe('온라인 — 바로 전달, 적재 항목 0', () => {
  it('전달되면 결과를 돌려주고 항목을 지운다', async () => {
    const t = await setup();
    const result = await t.outbox.send(t.sessionId, to('recording'));

    expect(result.session.status).toBe('recording');
    expect(await t.outbox.pending()).toStrictEqual([]);
    expect(t.events.map((event) => event.type)).toStrictEqual(['queued', 'confirmed']);
  });
});

describe('AC-4-66 — 오프라인에서 녹음 시작·완료 → outbox 적재 → online 복귀 시 **순서대로** 재전송', () => {
  it('끊긴 동안 요청 0건 · 3건 적재 · online 신호 하나로 recording → paused → completed 순서 전송', async () => {
    const t = await setup({ connectivity: 'offline' });
    t.outbox.start();

    for (const request of [
      to('recording'),
      to('paused', { recordedSeconds: 5 }),
      to('completed'),
    ]) {
      const error: unknown = await t.outbox
        .send(t.sessionId, request)
        .catch((caught: unknown) => caught);
      // Controller 는 이것을 network 로 보고 로컬 녹음을 보존한다
      expect(error).toBeInstanceOf(NetworkError);
    }
    expect(t.sent()).toStrictEqual([]);
    expect((await t.outbox.pending(t.sessionId)).map((entry) => entry.request.to)).toStrictEqual([
      'recording',
      'paused',
      'completed',
    ]);

    t.appState.setConnectivity('online');
    await t.outbox.flush();

    expect(t.sent()).toStrictEqual(['recording', 'paused', 'completed']);
    expect(await t.outbox.pending()).toStrictEqual([]);
    const detail = await t.mock.clients.sessions.getDetail({ sessionId: t.sessionId });
    expect(detail.status).toBe('completed');
  });

  it('연결 실패한 항목은 같은 Idempotency-Key 로 다시 보낸다 · 뒤 항목은 앞 항목을 추월하지 않는다', async () => {
    let failures = 2;
    const keys: string[] = [];
    const t = await setup({
      wrap: (api) => ({
        getDetail: (request) => api.getDetail(request),
        async transition(request, options) {
          keys.push(`${request.body.to}:${options.idempotencyKey}`);
          if (failures > 0) {
            failures -= 1;
            throw new NetworkError('dropped');
          }
          return api.transition(request, options);
        },
      }),
    });
    t.outbox.start();

    await expect(t.outbox.send(t.sessionId, to('recording'))).rejects.toBeInstanceOf(NetworkError);
    // 앞 항목(recording)이 아직 막혀 있다 → 뒤 항목(paused)은 보내지 않는다
    await expect(t.outbox.send(t.sessionId, to('paused'))).rejects.toBeInstanceOf(NetworkError);
    expect(keys).toStrictEqual(['recording:ik-outbox-1', 'recording:ik-outbox-1']);

    // 백오프 예약으로 다시 — 이번엔 연결된다
    t.scheduler.advance(OUTBOX_BACKOFF_MS[0] ?? 0);
    await t.outbox.flush();

    expect(keys).toStrictEqual([
      'recording:ik-outbox-1',
      'recording:ik-outbox-1',
      'recording:ik-outbox-1', // 재전송도 같은 키 — 서버(Mock)가 최초 응답을 재생할 수 있다
      'paused:ik-outbox-2',
    ]);
    expect(t.sent()).toStrictEqual(['recording', 'paused']);
    expect(await t.outbox.pending()).toStrictEqual([]);
  });

  it('5xx(INTERNAL_ERROR)도 보존 후 재시도한다', async () => {
    let failures = 1;
    const t = await setup({
      wrap: (api) => ({
        getDetail: (request) => api.getDetail(request),
        async transition(request, options) {
          if (failures > 0) {
            failures -= 1;
            throw new HaruApiError('INTERNAL_ERROR', 'boom');
          }
          return api.transition(request, options);
        },
      }),
    });
    await expect(t.outbox.send(t.sessionId, to('recording'))).rejects.toMatchObject({
      code: 'INTERNAL_ERROR',
    });
    expect(await t.outbox.pending()).toHaveLength(1);
    t.scheduler.advance(OUTBOX_BACKOFF_MS[0] ?? 0);
    await t.outbox.flush();
    expect(await t.outbox.pending()).toStrictEqual([]);
    expect(t.sent()).toStrictEqual(['recording']);
  });
});

describe('서버 거절(4xx) — 같은 요청을 다시 보내도 결과가 같으므로 버리고 알린다', () => {
  it('SESSION_INVALID_TRANSITION → 항목 제거 · rejected 이벤트 · 그 오류를 던진다 (Controller 가 재동기화)', async () => {
    const t = await setup();
    await expect(t.outbox.send(t.sessionId, to('paused'))).rejects.toMatchObject({
      code: 'SESSION_INVALID_TRANSITION',
    });
    expect(await t.outbox.pending()).toStrictEqual([]);
    expect(t.events.at(-1)).toMatchObject({ type: 'rejected', code: 'SESSION_INVALID_TRANSITION' });
  });
});

describe('오프라인 Discard (AC-4-113 ⑤ 로직) — 폐기 전이는 적재되고, 확정은 나중에 이벤트로 온다', () => {
  it('abandoned 가 적재 → online 후 confirmed(to=abandoned)', async () => {
    const t = await setup();
    await t.outbox.send(t.sessionId, to('recording'));
    t.appState.setConnectivity('offline');
    t.outbox.start();

    await expect(t.outbox.send(t.sessionId, to('abandoned'))).rejects.toBeInstanceOf(NetworkError);
    expect((await t.outbox.pending()).map((entry) => entry.request.to)).toStrictEqual([
      'abandoned',
    ]);

    t.appState.setConnectivity('online');
    await t.outbox.flush();
    const confirmed = t.events.filter((event) => event.type === 'confirmed');
    expect(confirmed.at(-1)?.entry.request.to).toBe('abandoned');
  });
});

describe('재시작 — 기기에 남은 항목은 새 인스턴스가 이어서 보낸다', () => {
  it('같은 저장소 위의 새 outbox 가 start() 에서 적재분을 전송한다', async () => {
    const t = await setup({ connectivity: 'offline' });
    await t.outbox.send(t.sessionId, to('recording')).catch(() => null);
    t.outbox.dispose();

    const appState = createMockAppStatePort({ connectivity: 'online' });
    const revived = createSessionOutbox({
      kv: t.storage.kv,
      sessionApi: t.mock.clients.sessions,
      appState,
      clock: t.scheduler,
      scheduler: t.scheduler,
      createKey: () => 'unused',
    });
    revived.start();
    await revived.flush();
    expect(t.sent()).toStrictEqual(['recording']);
    expect(await revived.pending()).toStrictEqual([]);
  });
});
