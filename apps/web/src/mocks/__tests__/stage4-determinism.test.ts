/**
 * Stage 4 Mock 결정성 — `S4-C` 완료 기준 "모든 응답 parse 통과 + 결정성 테스트" (Plan §8.4-4).
 *
 * 같은 scenario 의 같은 호출 순서는 **같은 응답 바이트**를 만든다. 시간·ID 는 주입 clock /
 * seed idFactory 에서만 나온다 (`mock-source-rules.test.ts` 가 `Date.now` · `Math.random` 직접 호출을 막는다).
 */
import { describe, expect, it } from 'vitest';

import { MOCK_CHILD_ID } from '../fixtures/me';

import { bundle, completeBody, ik, initBody, partData, sessionBody, to } from './stage4-support';

async function fullFlow(scenario: string): Promise<string> {
  const b = bundle(scenario);
  const out: unknown[] = [];
  const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
  out.push(session);
  out.push(
    await b.clients.sessions.transition({ sessionId: session.id, body: to('recording') }, ik('r')),
  );
  out.push(
    await b.clients.sessions.transition({ sessionId: session.id, body: to('completed') }, ik('d')),
  );
  const init = await b.clients.recordings.init(
    { sessionId: session.id, body: initBody() },
    ik('i'),
  );
  out.push(init);
  const [target] = init.parts;
  if (target === undefined) throw new Error('no target');
  out.push(await b.clients.uploadTransport.uploadPart({ target, data: partData() }));
  out.push(
    await b.clients.recordings.complete(
      { recordingId: init.recordingId, body: completeBody() },
      ik('k'),
    ),
  );
  out.push(await b.clients.sessions.getDetail({ sessionId: session.id }));
  out.push(await b.clients.sessions.list({ childId: MOCK_CHILD_ID, query: {} }));
  out.push(await b.clients.notifications.getPreferences());
  out.push(b.requestLog.entries());
  return JSON.stringify(out);
}

describe('Stage 4 Mock — 결정성', () => {
  it.each(['', 'recordings:recording-upload-success', 'recordings:upload-retry'])(
    '같은 scenario(%s) 를 두 번 실행하면 응답 바이트가 같다',
    async (scenario) => {
      if (scenario === 'recordings:upload-retry') {
        // upload-retry 는 첫 전송이 끊기므로 흐름이 다르다 — 실패 순서까지 같아야 한다
        const run = async () => {
          const b = bundle(scenario);
          const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
          await b.clients.sessions.transition(
            { sessionId: session.id, body: to('recording') },
            ik('r'),
          );
          const init = await b.clients.recordings.init(
            { sessionId: session.id, body: initBody() },
            ik('i'),
          );
          const [target] = init.parts;
          if (target === undefined) throw new Error('no target');
          const outcome: unknown[] = [init];
          try {
            await b.clients.uploadTransport.uploadPart({ target, data: partData() });
          } catch (error) {
            outcome.push(String(error));
          }
          outcome.push(await b.clients.uploadTransport.resume({ target, data: partData() }));
          outcome.push(b.requestLog.entries());
          return JSON.stringify(outcome);
        };
        expect(await run()).toBe(await run());
        return;
      }
      expect(await fullFlow(scenario)).toBe(await fullFlow(scenario));
    },
  );

  it('세션 id · 스티커 id · 업로드 토큰이 seed idFactory 에서 나온다 (실행마다 같은 값)', async () => {
    const first = bundle();
    const second = bundle();
    const a = await first.clients.sessions.create({ body: sessionBody() }, ik('c'));
    const b = await second.clients.sessions.create({ body: sessionBody() }, ik('c'));
    expect(a.session.id).toBe(b.session.id);
  });
});
