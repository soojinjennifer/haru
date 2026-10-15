/**
 * 캡처 타임라인 — **AC-4-108 재현 경로**(Web 백그라운드·탭 비활성·화면 잠금 녹음 한계 측정)의 기록기.
 *
 * 무엇을 재는가: 청크가 저장소에 **도착한 시각**과 앱 신호(`visible`/`hidden` · 연결 · 오디오 장치)를
 * 한 줄로 쌓아 두고, `hidden` 구간마다 **그 사이 받은 청크 수**와 **최대 청크 간격**을 계산한다.
 * "보장 불가" 를 문서 인용으로 적지 않고 **무엇을 어떻게 쟀는지**를 남기기 위한 것이다 (`rules/frontend.md` §6-2 ⑤).
 *
 * ⚠️ e2e 로 이 값을 재지 않는다 (`M-11` — Playwright Chromium 은 백그라운드 throttle 을 끄고 돈다).
 * 사람이 실기기에서 dev 측정판(`/__dev/ui/recording-measure`)으로 잰다. 이 모듈은 측정값을 **만들지 않고
 * 기록·요약만** 한다.
 *
 * 🔒 기록하는 것: 시각 · part 번호 · 순번 · 크기 · 신호 종류. 오디오 내용·세션 외 식별자 없음.
 */
import type { Clock } from '../../../shared/lib/clock';
import type { AppStatePort } from '../../../shared/platform/app-state';

import type { RecordingSink } from './ports';

export type CaptureTimelineEntry =
  | {
      readonly kind: 'chunk';
      readonly atMs: number;
      readonly partNo: number;
      readonly seq: number;
      readonly size: number;
    }
  | { readonly kind: 'part_start' | 'part_end'; readonly atMs: number; readonly partNo: number }
  | {
      readonly kind: 'hidden' | 'visible' | 'online' | 'offline' | 'audio_devices_changed';
      readonly atMs: number;
    };

export interface HiddenInterval {
  readonly fromMs: number;
  /** 아직 숨겨져 있으면 `null`. */
  readonly toMs: number | null;
  readonly chunksDuring: number;
}

export interface CaptureTimelineSummary {
  readonly chunkCount: number;
  /** 연속 청크 사이 가장 긴 간격 (ms). 청크 1개 이하면 `null`. */
  readonly maxChunkGapMs: number | null;
  readonly hiddenIntervals: readonly HiddenInterval[];
}

export interface CaptureTimeline {
  /** sink 를 감싸 청크 도착을 기록한다 (동작은 그대로 위임). */
  wrapSink(sink: RecordingSink): RecordingSink;
  entries(): readonly CaptureTimelineEntry[];
  summary(): CaptureTimelineSummary;
  dispose(): void;
}

export function summarizeCaptureTimeline(
  entries: readonly CaptureTimelineEntry[],
): CaptureTimelineSummary {
  const chunks = entries.filter((entry) => entry.kind === 'chunk');
  let maxChunkGapMs: number | null = null;
  for (let index = 1; index < chunks.length; index += 1) {
    const gap = (chunks[index]?.atMs ?? 0) - (chunks[index - 1]?.atMs ?? 0);
    maxChunkGapMs = maxChunkGapMs === null ? gap : Math.max(maxChunkGapMs, gap);
  }
  const hiddenIntervals: HiddenInterval[] = [];
  let open: { fromMs: number; chunks: number } | null = null;
  for (const entry of entries) {
    if (entry.kind === 'hidden' && open === null) open = { fromMs: entry.atMs, chunks: 0 };
    else if (entry.kind === 'chunk' && open !== null) open.chunks += 1;
    else if (entry.kind === 'visible' && open !== null) {
      hiddenIntervals.push({ fromMs: open.fromMs, toMs: entry.atMs, chunksDuring: open.chunks });
      open = null;
    }
  }
  if (open !== null) {
    hiddenIntervals.push({ fromMs: open.fromMs, toMs: null, chunksDuring: open.chunks });
  }
  return { chunkCount: chunks.length, maxChunkGapMs, hiddenIntervals };
}

export function createCaptureTimeline(options: {
  clock: Clock;
  appState: AppStatePort;
}): CaptureTimeline {
  const { clock, appState } = options;
  const log: CaptureTimelineEntry[] = [];
  const unsubscribe = appState.subscribe((event) => {
    const atMs = clock.now();
    if (event.type === 'visibility') log.push({ kind: event.value, atMs });
    else if (event.type === 'connectivity') log.push({ kind: event.value, atMs });
    else log.push({ kind: 'audio_devices_changed', atMs });
  });
  if (appState.visibility() === 'hidden') log.push({ kind: 'hidden', atMs: clock.now() });

  return {
    wrapSink(sink) {
      return {
        beginPart(part) {
          log.push({ kind: 'part_start', atMs: clock.now(), partNo: part.partNo });
          return sink.beginPart(part);
        },
        appendChunk(chunk) {
          log.push({
            kind: 'chunk',
            atMs: clock.now(),
            partNo: chunk.partNo,
            seq: chunk.seq,
            size: chunk.bytes.byteLength,
          });
          return sink.appendChunk(chunk);
        },
        endPart(part) {
          log.push({ kind: 'part_end', atMs: clock.now(), partNo: part.partNo });
          return sink.endPart(part);
        },
        discardSession: (sessionId) => sink.discardSession(sessionId),
      };
    },
    entries: () => [...log],
    summary: () => summarizeCaptureTimeline(log),
    dispose: () => {
      unsubscribe();
    },
  };
}
