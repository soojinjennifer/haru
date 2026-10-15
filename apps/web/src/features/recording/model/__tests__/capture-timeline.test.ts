/**
 * AC-4-108 재현 경로 — 캡처 타임라인 기록·요약 (Stage 4 `S4-E`).
 *
 * ⚠️ 이 테스트는 **기록기의 산술**을 검증한다. 백그라운드에서 브라우저가 실제로 청크를 멈추는지는
 * e2e 로 재지 않는다 (`M-11`) — 사람이 실기기에서 dev 측정판으로 잰다.
 */
import { describe, expect, it } from 'vitest';

import { createMockAppStatePort } from '../../../../mocks/platform/MockAppStatePort';
import { mockChunkBytes } from '../../../../mocks/fixtures/local-recordings';
import { createManualScheduler } from '../../../../test/manual-scheduler';
import { createCaptureTimeline, summarizeCaptureTimeline } from '../capture-timeline';

import { createMemorySink } from './controller-support';

const SESSION = '00000000-0000-4000-8000-0000000000c1';

describe('createCaptureTimeline', () => {
  it('청크 도착과 화면 신호를 한 줄로 쌓고 hidden 구간의 청크 수·최대 간격을 낸다', async () => {
    const scheduler = createManualScheduler(0);
    const appState = createMockAppStatePort();
    const timeline = createCaptureTimeline({ clock: scheduler, appState });
    const inner = createMemorySink();
    const sink = timeline.wrapSink(inner);
    const chunk = (seq: number) =>
      sink.appendChunk({
        sessionId: SESSION,
        partNo: 1,
        seq,
        bytes: mockChunkBytes(seq, 4),
        mimeType: 'audio/webm',
        container: 'webm',
        final: false,
      });

    await sink.beginPart({ sessionId: SESSION, partNo: 1, startedAtMs: 0 });
    scheduler.advance(1000);
    await chunk(1);
    scheduler.advance(500);
    appState.setVisibility('hidden');
    scheduler.advance(500);
    await chunk(2); // hidden 중 1개
    scheduler.advance(9000); // ← 여기서 끊겼다
    appState.setVisibility('visible');
    scheduler.advance(1000);
    await chunk(3);
    appState.emitAudioDevicesChanged();

    expect(timeline.summary()).toStrictEqual({
      chunkCount: 3,
      maxChunkGapMs: 10_000,
      hiddenIntervals: [{ fromMs: 1500, toMs: 11_000, chunksDuring: 1 }],
    });
    expect(timeline.entries().map((entry) => entry.kind)).toStrictEqual([
      'part_start',
      'chunk',
      'hidden',
      'chunk',
      'visible',
      'chunk',
      'audio_devices_changed',
    ]);
    // 동작은 그대로 위임된다
    expect(inner.fileCount()).toBe(3);
    timeline.dispose();
    expect(appState.listenerCount()).toBe(0);
  });

  it('아직 숨겨진 구간은 toMs=null · 청크 1개 이하면 간격 null', () => {
    expect(
      summarizeCaptureTimeline([
        { kind: 'chunk', atMs: 0, partNo: 1, seq: 1, size: 1 },
        { kind: 'hidden', atMs: 10 },
      ]),
    ).toStrictEqual({
      chunkCount: 1,
      maxChunkGapMs: null,
      hiddenIntervals: [{ fromMs: 10, toMs: null, chunksDuring: 0 }],
    });
  });

  it('시작 시 이미 hidden 이면 그 시점부터 구간을 연다', () => {
    const scheduler = createManualScheduler(5);
    const appState = createMockAppStatePort({ visibility: 'hidden' });
    const timeline = createCaptureTimeline({ clock: scheduler, appState });
    expect(timeline.entries()).toStrictEqual([{ kind: 'hidden', atMs: 5 }]);
  });
});
