/**
 * `LocalRecordingStore` — 청크 영속 규칙 (Stage 4 `S4-E`, spike `M-4` · `M-5` · `M-8`, `D4-30`).
 *
 * 증거는 **저장소에 실제로 남은 파일**(`MockRecordingStorage` 의 파일 맵)이다 — 색인이 아니다.
 */
import { describe, expect, it } from 'vitest';

import { isLocalStorageWriteError } from '../../../../shared/platform/recording-storage';
import { mockChunkBytes } from '../../../../mocks/fixtures/local-recordings';
import { MOCK_RECORDER_MIME_TYPE } from '../../../../mocks/platform/MockRecorderAdapter';

import { SESSION_A, SESSION_B, createStoreHarness } from './runtime-support';

const chunk = (seq: number, partNo = 1, sessionId = SESSION_A) => ({
  sessionId,
  partNo,
  seq,
  bytes: mockChunkBytes(seq),
  mimeType: MOCK_RECORDER_MIME_TYPE,
  container: 'webm' as const,
  final: false,
});

async function writePart(
  h: ReturnType<typeof createStoreHarness>,
  chunks: number,
  partNo = 1,
  sessionId = SESSION_A,
) {
  await h.store.beginPart({ sessionId, partNo, startedAtMs: h.scheduler.now() });
  for (let seq = 1; seq <= chunks; seq += 1)
    await h.store.appendChunk(chunk(seq, partNo, sessionId));
}

describe('청크마다 즉시 기록 (§10.5-2)', () => {
  it('청크 1개 = 파일 1개 + part 첫 청크만 헤더 복제본 1개 (M-4)', async () => {
    const h = createStoreHarness();
    await writePart(h, 4);

    expect(h.storage.controls.files(SESSION_A)).toStrictEqual([
      `${SESSION_A}/p01-000001.bin`,
      `${SESSION_A}/p01-000001.hdr`,
      `${SESSION_A}/p01-000002.bin`,
      `${SESSION_A}/p01-000003.bin`,
      `${SESSION_A}/p01-000004.bin`,
    ]);
    expect(await h.store.countChunkFiles(SESSION_A)).toBe(5);
    expect((await h.store.listChunks(SESSION_A)).map((entry) => entry.seq)).toStrictEqual([
      1, 2, 3, 4,
    ]);
  });

  it('새 part 의 첫 청크도 헤더 복제본을 갖는다 (part = MediaRecorder 세션 1개 — D4-24)', async () => {
    const h = createStoreHarness();
    await writePart(h, 2, 1);
    await writePart(h, 2, 2);

    expect(
      h.storage.controls.files(SESSION_A).filter((file) => file.endsWith('.hdr')),
    ).toStrictEqual([`${SESSION_A}/p01-000001.hdr`, `${SESSION_A}/p02-000001.hdr`]);
  });

  it('첫 청크를 되읽어 확인한 뒤 part 레코드에 headerVerified=true · 컨테이너를 남긴다', async () => {
    const h = createStoreHarness();
    await writePart(h, 1);

    const record = await h.store.get(SESSION_A);
    expect(record?.parts[0]).toMatchObject({
      partNo: 1,
      headerVerified: true,
      mimeType: MOCK_RECORDER_MIME_TYPE,
      container: 'webm',
    });
    expect(record?.state).toBe('recording');
  });

  it('endPart 가 청크 수·바이트를 기록한다 (자동 종료·완료도 지우지 않는다)', async () => {
    const h = createStoreHarness();
    await writePart(h, 3);
    await h.store.endPart({
      sessionId: SESSION_A,
      partNo: 1,
      endedAtMs: h.scheduler.now() + 3000,
      chunkCount: 3,
      byteLength: 768,
      mimeType: MOCK_RECORDER_MIME_TYPE,
      container: 'webm',
    });
    await h.store.markCompleted(SESSION_A, {
      completedReason: 'auto_timeout',
      recordedSeconds: 3,
      completedAtMs: h.scheduler.now(),
    });

    const record = await h.store.get(SESSION_A);
    expect(record?.parts[0]).toMatchObject({ chunkCount: 3, byteLength: 768 });
    expect(record).toMatchObject({ state: 'completed', completedReason: 'auto_timeout' });
    expect(await h.store.countChunkFiles(SESSION_A)).toBe(4);
  });
});

describe('복구 읽기 — readPart', () => {
  it('색인 순서대로 이어 붙인다', async () => {
    const h = createStoreHarness();
    await writePart(h, 3);

    const bytes = await h.store.readPart(SESSION_A, 1);
    expect(bytes.byteLength).toBe(768);
    expect([bytes[0], bytes[256], bytes[512]]).toStrictEqual([1, 2, 3]);
  });

  it('M-5 — 잘린 마지막 청크를 버리지 않는다 (잘린 채로 이어 붙인다)', async () => {
    const h = createStoreHarness();
    await writePart(h, 3);
    h.storage.controls.truncate({ sessionId: SESSION_A, partNo: 1, seq: 3, slot: 'primary' }, 100);

    const bytes = await h.store.readPart(SESSION_A, 1);
    expect(bytes.byteLength).toBe(256 + 256 + 100);
  });

  it('M-4 — 첫 청크 원본을 잃어도 헤더 복제본으로 이어 붙인다', async () => {
    const h = createStoreHarness();
    await writePart(h, 3);
    h.storage.controls.removeFile({ sessionId: SESSION_A, partNo: 1, seq: 1, slot: 'primary' });

    const bytes = await h.store.readPart(SESSION_A, 1);
    expect(bytes.byteLength).toBe(768);
    expect(bytes[0]).toBe(1);
  });

  it('M-4 — 원본이 잘렸으면 복제본(더 긴 쪽)을 쓴다', async () => {
    const h = createStoreHarness();
    await writePart(h, 2);
    h.storage.controls.truncate({ sessionId: SESSION_A, partNo: 1, seq: 1, slot: 'primary' }, 10);

    expect((await h.store.readPart(SESSION_A, 1)).byteLength).toBe(512);
  });

  it('M-5 — 색인은 있는데 바이트가 없는 청크(바이트 쓰기 전 크래시)는 건너뛴다', async () => {
    const h = createStoreHarness();
    await writePart(h, 3);
    h.storage.controls.removeFile({ sessionId: SESSION_A, partNo: 1, seq: 3, slot: 'primary' });

    expect((await h.store.readPart(SESSION_A, 1)).byteLength).toBe(512);
  });
});

describe('쓰기 실패 — 할당량 초과 주입 (spike §8-3)', () => {
  it('QuotaExceeded 는 LocalStorageWriteError(quota_exceeded) 로 던지고, 그때까지의 청크는 남는다', async () => {
    const h = createStoreHarness();
    await writePart(h, 2);
    h.storage.controls.failWrites('quota_exceeded', 1);

    const error: unknown = await h.store.appendChunk(chunk(3)).catch((caught: unknown) => caught);
    expect(isLocalStorageWriteError(error) && error.reason).toBe('quota_exceeded');
    // 실패한 청크 이전 3파일(헤더 복제 포함)은 그대로다
    expect(await h.store.countChunkFiles(SESSION_A)).toBe(3);
    // 이후 쓰기는 다시 된다
    await h.store.appendChunk(chunk(4));
    expect(await h.store.countChunkFiles(SESSION_A)).toBe(4);
  });

  it('첫 청크의 헤더 복제본 쓰기가 실패해도 던진다 (조용히 넘어가지 않는다)', async () => {
    const h = createStoreHarness();
    await h.store.beginPart({ sessionId: SESSION_A, partNo: 1, startedAtMs: 0 });
    h.storage.controls.failWrites('failed', 2);

    await expect(h.store.appendChunk(chunk(1))).rejects.toMatchObject({ reason: 'failed' });
  });
});

describe('삭제 — 스스로 지우지 않고, 부르면 바이트·색인·레코드를 모두 지운다', () => {
  it('delete 는 그 세션만 지운다', async () => {
    const h = createStoreHarness();
    await writePart(h, 3, 1, SESSION_A);
    await writePart(h, 2, 1, SESSION_B);

    await h.store.delete(SESSION_A);

    expect(await h.store.countChunkFiles(SESSION_A)).toBe(0);
    expect(await h.store.get(SESSION_A)).toBeNull();
    expect(await h.store.listChunks(SESSION_A)).toStrictEqual([]);
    expect(await h.store.countChunkFiles(SESSION_B)).toBe(3);
  });

  it('clear 는 이 기기의 로컬 녹음을 전부 지운다 (AC-4-72 저장소 부분)', async () => {
    const h = createStoreHarness();
    await writePart(h, 3, 1, SESSION_A);
    await writePart(h, 2, 1, SESSION_B);
    await h.storage.kv.put('outbox', 'keep', { unrelated: true });

    await h.store.clear();

    expect(await h.store.countChunkFiles()).toBe(0);
    expect(await h.store.list()).toStrictEqual([]);
    expect(h.storage.controls.keys('chunks')).toStrictEqual([]);
    // 다른 소유자의 이름 공간은 건드리지 않는다 (runtime.clearAll 이 각자 지운다)
    expect(h.storage.controls.keys('outbox')).toStrictEqual(['keep']);
  });
});

describe('D4-30 — persist() 요청 + 결과 기록 (M-8)', () => {
  it('영속이 아니면 1회 요청하고, 결과가 이후 레코드에 기록된다', async () => {
    const h = createStoreHarness({ persistence: 'best_effort', persistGrant: 'best_effort' });

    expect(await h.store.ensurePersistence()).toBe('best_effort');
    expect(await h.store.ensurePersistence()).toBe('best_effort');
    expect(h.storage.controls.persistRequests()).toBe(1);

    await writePart(h, 1);
    expect((await h.store.get(SESSION_A))?.storagePersistence).toBe('best_effort');
  });

  it('승인되면 persisted 가 기록된다', async () => {
    const h = createStoreHarness({ persistence: 'best_effort', persistGrant: 'persisted' });
    await h.store.ensurePersistence();
    await writePart(h, 1);
    expect((await h.store.get(SESSION_A))?.storagePersistence).toBe('persisted');
  });

  it('이미 영속이면 다시 요청하지 않는다', async () => {
    const h = createStoreHarness({ persistence: 'persisted' });
    expect(await h.store.ensurePersistence()).toBe('persisted');
    expect(h.storage.controls.persistRequests()).toBe(0);
  });

  it('요청 전 녹음은 상태 미상(null)으로 남는다 — 큐는 미상을 비영속으로 취급한다', async () => {
    const h = createStoreHarness();
    await writePart(h, 1);
    expect((await h.store.get(SESSION_A))?.storagePersistence).toBeNull();
  });
});

describe('기기에 남은 이전 모양 레코드', () => {
  it('모양이 다른 레코드는 지우지 않고 건너뛴다', async () => {
    const h = createStoreHarness();
    await h.storage.kv.put('recordings', SESSION_A, { version: 0, sessionId: SESSION_A });
    expect(await h.store.list()).toStrictEqual([]);
    expect(h.storage.controls.keys('recordings')).toStrictEqual([SESSION_A]);
  });
});
