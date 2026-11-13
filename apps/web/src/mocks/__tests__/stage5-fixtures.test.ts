/**
 * Stage 5 `S5-A` fixture · `SessionDetail.reflection` 전수 (AC-5-05 · 07, Plan §5.4 R-7).
 *
 * `SessionDetail` 을 만드는 **모든** Mock 경로(새 세션 · 지난 세션 seed · 진행 중 세션 · 기기 seed)가
 * `reflection` key 를 가진 채 contracts parse 를 통과하는지 확인한다. Stage 4 동작은 그대로다.
 */
import {
  HighlightClipSummarySchema,
  SessionDetailSchema,
  SignedMediaUrlSchema,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import { createLocalRecordingStore } from '../../features/recording';
import { createFixedClock } from '../../shared/lib/clock';
import { MOCK_EPOCH_MS } from '../index';
import {
  createHighlightClipFixtures,
  createSignedMediaUrlFixture,
  MOCK_HIGHLIGHT_CLIP_IDS,
} from '../fixtures/highlight-clips';
import { MOCK_ACTIVE_SESSION_ID } from '../fixtures/home';
import { MOCK_DEVICE_SEED_SESSION_IDS, MOCK_HISTORY_SESSION_IDS } from '../fixtures/sessions';
import { applyRecordingDeviceSeed } from '../recorder/deviceSeed';
import { createMockRecordingStorage } from '../platform/MockRecordingStorage';

import { bundle, completedSession, ik, sessionBody } from './stage4-support';

describe('SessionDetail.reflection — 모든 Mock 상세 응답 (AC-5-05)', () => {
  it('새 세션(ready) · 완료 세션 → `reflection: null` key 존재', async () => {
    const b = bundle();
    const { session } = await b.clients.sessions.create({ body: sessionBody() }, ik('c'));
    const ready = await b.clients.sessions.getDetail({ sessionId: session.id });
    expect(SessionDetailSchema.parse(ready)).toHaveProperty('reflection', null);

    const done = await completedSession();
    const detail = await done.b.clients.sessions.getDetail({ sessionId: done.sessionId });
    expect(detail).toHaveProperty('reflection', null);
  });

  it.each(MOCK_HISTORY_SESSION_IDS)('지난 세션 %s', async (sessionId) => {
    const b = bundle();
    expect(
      SessionDetailSchema.parse(await b.clients.sessions.getDetail({ sessionId })),
    ).toHaveProperty('reflection', null);
  });

  it('진행 중 세션 (`session-already-active`)', async () => {
    const b = bundle('sessions:session-already-active');
    const detail = await b.clients.sessions.getDetail({ sessionId: MOCK_ACTIVE_SESSION_ID });
    expect(SessionDetailSchema.parse(detail)).toHaveProperty('reflection', null);
  });

  it('기기 seed 세션 (`recordings:upload-stalled-48h` — 서버 `completed`)', async () => {
    const b = bundle('recordings:upload-stalled-48h');
    const clock = createFixedClock(MOCK_EPOCH_MS);
    const storage = createMockRecordingStorage();
    const target = createLocalRecordingStore({
      bytes: storage.bytes,
      kv: storage.kv,
      persistence: storage.persistence,
      clock,
    });
    await applyRecordingDeviceSeed({
      scenarios: b.store,
      sessionState: b.sessionState,
      serverClock: b.clock,
      deviceClock: clock,
      target,
      kv: storage.kv,
    });
    const detail = await b.clients.sessions.getDetail({
      sessionId: MOCK_DEVICE_SEED_SESSION_IDS.stalled,
    });
    expect(SessionDetailSchema.parse(detail)).toHaveProperty('reflection', null);
  });

  it('`reflection` key 를 뺀 상세는 거부된다 (required)', async () => {
    const done = await completedSession();
    const { reflection: _omit, ...rest } = await done.b.clients.sessions.getDetail({
      sessionId: done.sessionId,
    });
    expect(SessionDetailSchema.safeParse(rest).success).toBe(false);
  });
});

describe('하이라이트 클립 fixture (C-9 · AC-5-07 — schema + fixture 만)', () => {
  const clock = createFixedClock(MOCK_EPOCH_MS);

  it('클립 요약 2개 · signed URL 이 contracts parse 를 통과한다', () => {
    const clips = createHighlightClipFixtures(clock);
    expect(clips.map((clip) => clip.id)).toStrictEqual([...MOCK_HIGHLIGHT_CLIP_IDS]);
    for (const clip of clips) expect(HighlightClipSummarySchema.parse(clip)).toStrictEqual(clip);
    expect(clips[1]?.expiresAt).toBeNull();

    const url = createSignedMediaUrlFixture(clock, MOCK_HIGHLIGHT_CLIP_IDS[0]);
    expect(SignedMediaUrlSchema.parse(url)).toStrictEqual(url);
  });

  it('Mock API Client 에 클립 메서드가 없다 (`N5-22`)', () => {
    const b = bundle();
    const domains = Object.keys(b.clients);
    expect(domains.filter((name) => /clip|highlight/i.test(name))).toStrictEqual([]);
    expect(Object.keys(b.clients.analysis)).toStrictEqual(['getStatus']);
    expect(Object.keys(b.clients.reflections)).toStrictEqual(['submit']);
  });
});
