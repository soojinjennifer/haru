/**
 * `MockRecorderAdapter` 가 `recorder` scenario 계획(`S4-C`)을 결정적으로 실행하는지 (`S4-D`).
 */
import { describe, expect, it } from 'vitest';

import type { RecorderChunk, RecorderInterruption } from '../../shared/platform/recorder';
import { createManualScheduler } from '../../test/manual-scheduler';
import {
  MOCK_RECORDER_CHUNK_BYTES,
  MOCK_RECORDER_MIME_TYPE,
  createMockRecorderAdapter,
} from '../platform/MockRecorderAdapter';
import { resolveRecorderScenario } from '../recorder/recorderScenarios';
import { createScenarioStoreFrom } from '../scenarios';

function run(scenario: string) {
  const store = createScenarioStoreFrom({ search: scenario === '' ? '' : `?scenario=${scenario}` });
  const scheduler = createManualScheduler(0);
  const adapter = createMockRecorderAdapter({
    plan: resolveRecorderScenario(store),
    clock: scheduler,
    scheduler,
  });
  const chunks: RecorderChunk[] = [];
  const interruptions: RecorderInterruption[] = [];
  adapter.onChunk((chunk) => chunks.push(chunk));
  adapter.onInterruption((event) => interruptions.push(event));
  return { adapter, scheduler, chunks, interruptions };
}

describe('MockRecorderAdapter', () => {
  it('success — timeslice 마다 고정 크기 청크, MIME = Chromium 실측 원문', async () => {
    const t = run('');
    await t.adapter.start({ timesliceMs: 1000 });
    t.scheduler.advance(5000);
    expect(t.chunks.map((chunk) => chunk.seq)).toEqual([1, 2, 3, 4, 5]);
    expect(t.chunks.every((chunk) => chunk.mimeType === MOCK_RECORDER_MIME_TYPE)).toBe(true);
    expect(t.chunks.every((chunk) => chunk.bytes.byteLength === MOCK_RECORDER_CHUNK_BYTES)).toBe(
      true,
    );
    expect(t.interruptions).toEqual([]);
    expect(await t.adapter.stop()).toEqual({
      chunkCount: 6,
      byteLength: 6 * MOCK_RECORDER_CHUNK_BYTES,
      mimeType: MOCK_RECORDER_MIME_TYPE,
    });
  });

  it('pause 중에는 청크가 없다', async () => {
    const t = run('');
    await t.adapter.start({ timesliceMs: 1000 });
    t.scheduler.advance(2000);
    await t.adapter.pause();
    t.scheduler.advance(10_000);
    expect(t.chunks).toHaveLength(2);
    await t.adapter.resume();
    t.scheduler.advance(1000);
    expect(t.chunks).toHaveLength(3);
  });

  it('mic-permission-denied — 요청 결과 denied, start 거절', async () => {
    const t = run('recorder:mic-permission-denied');
    expect(await t.adapter.checkPermission()).toBe('prompt');
    expect(await t.adapter.requestPermission()).toBe('denied');
    await expect(t.adapter.start({ timesliceMs: 1000 })).rejects.toMatchObject({
      reason: 'permission_denied',
    });
  });

  it('recording-interrupted(그룹) — part 마다 3청크 뒤 원인 하나씩, 마지막 조각 먼저', async () => {
    const t = run('recorder:recording-interrupted');
    const causes: string[] = [];
    for (let part = 0; part < 3; part += 1) {
      await t.adapter.start({ timesliceMs: 1000 });
      t.scheduler.advance(3000);
      expect(t.chunks.at(-1)?.final).toBe(true);
      causes.push(t.interruptions.at(-1)?.cause ?? '');
    }
    expect(causes).toEqual(['background', 'input_changed', 'capture_lost']);
    expect(t.interruptions.every((event) => event.captureStopped)).toBe(true);
    // 4번째 part 에는 사건이 없다
    await t.adapter.start({ timesliceMs: 1000 });
    t.scheduler.advance(10_000);
    expect(t.interruptions).toHaveLength(3);
  });

  it('recorder.devicechange:recording-interrupted — 그 원인 하나만', async () => {
    const t = run('recorder.devicechange:recording-interrupted');
    await t.adapter.start({ timesliceMs: 1000 });
    t.scheduler.advance(3000);
    expect(t.interruptions).toEqual([{ cause: 'input_changed', captureStopped: true }]);
  });

  it('web-background-warning — 알림 1회(captureStopped=false), 청크 계속', async () => {
    const t = run('recorder:web-background-warning');
    await t.adapter.start({ timesliceMs: 1000 });
    t.scheduler.advance(10_000);
    expect(t.interruptions).toEqual([{ cause: 'background', captureStopped: false }]);
    expect(t.chunks).toHaveLength(10);
  });

  it('같은 scenario 는 같은 청크 바이트를 만든다 (결정성)', async () => {
    const a = run('recorder:recording-interrupted');
    const b = run('recorder:recording-interrupted');
    for (const t of [a, b]) {
      await t.adapter.start({ timesliceMs: 1000 });
      t.scheduler.advance(5000);
    }
    const dump = (t: typeof a) =>
      JSON.stringify(
        t.chunks.map((chunk) => [chunk.seq, chunk.offsetMs, chunk.final, [...chunk.bytes]]),
      );
    expect(dump(a)).toBe(dump(b));
  });
});
