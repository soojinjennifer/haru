#!/usr/bin/env node
/**
 * `S4-A` — Web 녹음 spike 자동 측정 드라이버 (**dev 전용 도구 · 제품 코드가 아니다**)
 *
 * Stage 4 Plan §16.1 `S4-A` 의 7개 항목 중 **자동화로 잴 수 있는 것**을 Playwright 로 재고
 * 결과를 JSON 으로 떨어뜨린다. 자동화로 만들 수 없는 상황(OS 수준 백그라운드 · iOS 화면
 * 잠금 · 장치 탈착)은 **측정하지 않고 그렇다고 적는다** — 그것이 `rules/frontend.md` §6-2 ⑤
 * 가 요구하는 "무엇을 어떻게 쟀는지" 다.
 *
 * ⚠️ **`pnpm test:e2e` 와 같이 돌리지 않는다.** 이 저장소에서 Playwright 실행이 겹치면
 * 소요가 4~5분 → 20분대로 늘고 허위 실패가 난다 (5회 관측).
 *
 * ⚠️ **왜 `apps/web/scripts/` 가 아니라 여기 있는가**: `apps/web/tsconfig.node.json` 이
 * `scripts/**\/*.mjs` 를 `checkJs` 로 검사한다. 이 드라이버의 값은 대부분 `page.evaluate` 가
 * 돌려주는 브라우저 쪽 객체라 JSDoc 로 전부 박으면 측정 코드보다 주석이 길어지고, 측정값의
 * 모양이 바뀔 때마다 타입을 쫓아가야 한다. 루트 `scripts/` 는 저장소 툴체인 자리이며
 * (`assert-no-mocks.mjs` · `lint-boundaries.mjs` 선례) 루트 tsconfig 가 `.ts` 만 본다.
 *
 * 쓰기
 *   1. dev 서버를 띄운다        `pnpm --filter @haru/web run dev`
 *   2. 이 스크립트를 돌린다      `node scripts/spike/recording-spike-measure.mjs`
 *      옵션: `--base-url=http://127.0.0.1:5173` · `--engines=chromium,webkit` · `--out=<파일>`
 *
 * 오디오는 페이지가 합성하는 440Hz 사인파다 (`spike-core.ts`). 사람·아동 음성을 쓰지 않는다.
 *
 * `page.evaluate` 콜백 안에서 `window` 대신 `globalThis` 를 쓴다 — 이 파일은 Node 파일이라
 * eslint 가 `window` 를 모른다. 브라우저에서 둘은 같은 객체다.
 */
import { chromium, webkit } from '@playwright/test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ENGINES = { chromium, webkit };
const SPIKE_PATH = '/__dev/ui/recording-spike';

const args = new Map(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith('--'))
    .map((arg) => {
      const eq = arg.indexOf('=');
      return eq === -1 ? [arg.slice(2), 'true'] : [arg.slice(2, eq), arg.slice(eq + 1)];
    }),
);

const BASE_URL = args.get('base-url') ?? 'http://127.0.0.1:5173';
const ENGINE_NAMES = (args.get('engines') ?? 'chromium,webkit').split(',');
/** 기본 출력은 **저장소 밖**이다 — 원시 JSON 은 보고서(`docs/qa/stage-4a-spike-report.md`)의 근거일 뿐 산출물이 아니다. */
const OUT = args.get('out') ?? join(tmpdir(), 'haru-recording-spike-result.json');
/**
 * `--headed` ⭐ **⑥ 탭 비활성 측정에는 반드시 필요하다.** headless Chromium 에는 창 관리자가
 * 없어서 두 번째 탭을 앞으로 보내도 첫 탭의 `document.visibilityState` 가 계속 `visible` 이다
 * (실측: hidden 이어야 할 15초 동안 `visibilitychange` 0건 · 청크 간격 1019ms 로 변화 없음 ·
 * 전 구간 `visibility: 'visible'`). 즉 headless 로 잰 ⑥ 은 **측정이 아니라 무측정**이다.
 */
const HEADED = args.get('headed') === 'true';
/** 단계 선택 — `--only=hidden` 처럼 쓴다. 비면 전부 돈다. */
const ONLY = (args.get('only') ?? '').split(',').filter((name) => name.length > 0);
const wants = (name) => ONLY.length === 0 || ONLY.includes(name);

/** @param {number} ms */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 단계별 상한. 어느 단계에서 멈췄는지 **이름으로** 드러나야 한다 — 전체가 통째로 걸리면
 * 원인을 짚을 수 없다.
 * @template T
 * @param {string} label
 * @param {Promise<T>} task
 * @param {number} ms
 * @returns {Promise<T>}
 */
async function withTimeout(label, task, ms) {
  let timer;
  const guard = new Promise((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`[timeout] ${label} 이 ${String(ms)}ms 안에 끝나지 않았다`));
    }, ms);
  });
  try {
    return await Promise.race([task, guard]);
  } finally {
    clearTimeout(timer);
  }
}

/* ===== 페이지 조작 보조 ==================================================== */

/**
 * spike 페이지를 열고 user activation 을 확보한다.
 * WebKit 은 user gesture 없이 `AudioContext` 를 돌리지 않으므로 이 클릭이 필요하다.
 * @param {import('@playwright/test').BrowserContext} context
 */
async function openSpikePage(context) {
  const page = await context.newPage();
  page.on('pageerror', (error) => {
    console.error('    [pageerror]', error.message);
  });
  await page.goto(`${BASE_URL}${SPIKE_PATH}`, { waitUntil: 'load' });
  await page.locator('#spike-activate').click();
  await page.waitForFunction(() => globalThis.__haruRecordingSpike !== undefined);
  return page;
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{timesliceMs:number, source:'synthetic'|'mic', mimeType?:string}} options
 */
async function start(page, options) {
  return page.evaluate((opts) => globalThis.__haruRecordingSpike.startRun(opts), options);
}

/** @param {import('@playwright/test').Page} page */
const snap = (page) => page.evaluate(() => globalThis.__haruRecordingSpike.snapshot());
/** @param {import('@playwright/test').Page} page */
const stop = (page) => page.evaluate(() => globalThis.__haruRecordingSpike.stopRun());
/** @param {import('@playwright/test').Page} page */
const env = (page) => page.evaluate(() => globalThis.__haruRecordingSpike.probeEnvironment());

/** 청크 로그를 요약한다 — 보고서에 그대로 옮길 수 있는 수치만 남긴다. */
function summarizeChunks(chunks) {
  const gaps = chunks.map((chunk) => chunk.gapMs).filter((gap) => gap !== null);
  const sizes = chunks.map((chunk) => chunk.size);
  const total = sizes.reduce((sum, size) => sum + size, 0);
  const spanMs = chunks.length === 0 ? 0 : chunks[chunks.length - 1].tOffsetMs;
  return {
    count: chunks.length,
    firstChunkMs: chunks.length === 0 ? null : Number(chunks[0].tOffsetMs.toFixed(1)),
    gapMs: gaps.length === 0 ? null : stats(gaps),
    sizeBytes: sizes.length === 0 ? null : stats(sizes),
    totalBytes: total,
    spanMs: Number(spanMs.toFixed(1)),
    bytesPerSecond: spanMs === 0 ? null : Number(((total / spanMs) * 1000).toFixed(1)),
    blobTypes: [...new Set(chunks.map((chunk) => chunk.blobType))],
    visibilityStates: [...new Set(chunks.map((chunk) => chunk.visibility))],
    zeroSizeChunks: sizes.filter((size) => size === 0).length,
  };
}

function stats(values) {
  const sorted = [...values].toSorted((a, b) => a - b);
  const sum = sorted.reduce((acc, value) => acc + value, 0);
  return {
    min: Number(sorted[0].toFixed(1)),
    max: Number(sorted[sorted.length - 1].toFixed(1)),
    mean: Number((sum / sorted.length).toFixed(1)),
    median: Number(sorted[Math.floor(sorted.length / 2)].toFixed(1)),
  };
}

function summarizeWrites(writes) {
  if (writes.length === 0) return null;
  const opfs = writes.map((write) => write.opfsMs).filter((value) => value !== null);
  const idb = writes.map((write) => write.idbMs);
  return {
    count: writes.length,
    opfsMs: opfs.length === 0 ? null : stats(opfs),
    idbMs: stats(idb),
  };
}

/* ===== 측정 ①~④ · timeslice 별 청크 ====================================== */

/**
 * @param {import('@playwright/test').Page} page
 * @param {number} timesliceMs
 * @param {number} holdMs
 */
async function measureTimeslice(page, timesliceMs, holdMs) {
  const begin = await start(page, { timesliceMs, source: 'synthetic' });
  await wait(holdMs);
  const final = await stop(page);
  return {
    timesliceMs,
    holdMs,
    requestedMimeType: begin.requestedMimeType,
    recorderMimeType: begin.recorderMimeType,
    audioContextState: final.audioContextState,
    startLatencyMs: final.startLatencyMs === null ? null : Number(final.startLatencyMs.toFixed(1)),
    chunks: summarizeChunks(final.chunks),
    writes: summarizeWrites(final.writes),
    events: final.events,
    chunkLog: final.chunks.map((chunk) => ({
      seq: chunk.seq,
      tOffsetMs: Number(chunk.tOffsetMs.toFixed(1)),
      size: chunk.size,
      fromStop: chunk.fromStop,
    })),
  };
}

/* ===== 측정 ⑥ · 탭 비활성 =============================================== */

/**
 * 같은 컨텍스트에 두 번째 페이지를 띄워 첫 페이지를 **실제로 hidden** 으로 만든다.
 * `page.evaluate` 로 `visibilityState` 를 흉내지 않는다 — 흉내면 브라우저의 throttle 이
 * 걸리지 않으므로 측정이 거짓이 된다.
 * @param {import('@playwright/test').BrowserContext} context
 * @param {import('@playwright/test').Page} page
 */
async function measureHidden(context, page, engineName) {
  const foregroundMs = 6000;
  const hiddenMs = 15000;
  const afterMs = 5000;

  // ⭐ **먼저 "숨길 수 있는가" 를 따로 확인한다.** 이 확인 없이 "숨어 있는 동안 청크가
  // 0개였다" 를 결과로 쓰면, 실제로는 **한 번도 숨지 않은 상태**를 측정으로 착각한다
  // (이 저장소에서 실제로 한 번 그렇게 적었다). 아래 4가지를 전부 시도하고 각각의 결과를 남긴다.
  const hideAttempts = await probeHideTechniques(context, page, engineName);

  await start(page, { timesliceMs: 1000, source: 'synthetic' });
  await wait(foregroundMs);
  const foreground = await snap(page);
  await page.evaluate(() => {
    globalThis.__haruRecordingSpike.resetTimers();
  });

  const front = await context.newPage();
  await front.goto('about:blank');
  await front.bringToFront();
  const atHide = await snap(page);
  await wait(hiddenMs);
  const hiddenSnapshot = await snap(page);
  const hiddenTimers = hiddenSnapshot.timers;
  /**
   * ⭐ **교란 요인 분리**. "숨어 있는 동안 청크가 안 왔다" 는 관찰은 두 원인을 섞는다 —
   * ① `MediaRecorder` 가 멈췄다 ② **소리 원천(AudioContext)이 멈췄다**.
   * 숨은 구간의 `AudioContext.currentTime` 증가량이 경과 시간에 못 미치면 ②가 섞인 것이다.
   */
  const audioClockDuringHidden = {
    atHide: atHide.audioContextCurrentTime,
    atEndOfHidden: hiddenSnapshot.audioContextCurrentTime,
    advanceSec:
      atHide.audioContextCurrentTime === null || hiddenSnapshot.audioContextCurrentTime === null
        ? null
        : Number(
            (hiddenSnapshot.audioContextCurrentTime - atHide.audioContextCurrentTime).toFixed(3),
          ),
    wallClockSec: hiddenMs / 1000,
  };

  await page.bringToFront();
  await front.close();
  await wait(afterMs);
  const final = await stop(page);

  const hiddenChunks = final.chunks.filter((chunk) => chunk.visibility === 'hidden');
  const visibleChunks = final.chunks.filter((chunk) => chunk.visibility === 'visible');

  const visibilityChangeEvents = final.events.filter(
    (event) => event.kind === 'visibilitychange',
  ).length;

  return {
    method:
      '같은 컨텍스트에 about:blank 두 번째 페이지를 bringToFront 하여 첫 페이지를 hidden 으로 만들었다. visibilityState 를 스크립트로 바꾸지 않았다. ⚠️ hideAttempts 가 전부 실패하면 이 구간은 **측정이 아니다** — 페이지가 한 번도 숨지 않았다는 뜻이다.',
    hideAttempts,
    hideAchieved: hideAttempts.some((attempt) => attempt.hiddenAchieved),
    visibilityChangeEvents,
    phases: { foregroundMs, hiddenMs, afterMs },
    foregroundChunks: summarizeChunks(foreground.chunks),
    chunksWhileHidden: summarizeChunks(hiddenChunks),
    chunksWhileVisible: summarizeChunks(visibleChunks),
    timersForeground: foreground.timers,
    timersHidden: hiddenTimers,
    audioClockDuringHidden,
    events: final.events,
    allChunks: final.chunks.map((chunk) => ({
      seq: chunk.seq,
      tOffsetMs: Number(chunk.tOffsetMs.toFixed(1)),
      gapMs: chunk.gapMs === null ? null : Number(chunk.gapMs.toFixed(1)),
      size: chunk.size,
      visibility: chunk.visibility,
    })),
  };
}

/**
 * 페이지를 **정말 `hidden` 으로 만들 수 있는지** 4가지 방법으로 시도하고 각각의 결과를 남긴다.
 * 이 저장소의 측정 환경에서는 (2026-10-14 실측) **네 방법 모두 실패**했다 — 그래서 ⑥은
 * `NOT MEASURED` 이고, 그 판정의 근거가 이 배열이다.
 *
 * @param {import('@playwright/test').BrowserContext} context
 * @param {import('@playwright/test').Page} page
 * @param {string} engineName
 */
async function probeHideTechniques(context, page, engineName) {
  const read = () => page.evaluate(() => globalThis.document.visibilityState);
  const attempts = [];

  /** @param {string} name @param {() => Promise<void>} apply @param {() => Promise<void>} undo */
  const attempt = async (name, apply, undo) => {
    let error = null;
    let state = 'n/a';
    try {
      await apply();
      await wait(1500);
      state = await read();
    } catch (cause) {
      error = cause instanceof Error ? cause.message.split('\n')[0] : String(cause);
    }
    try {
      await undo();
    } catch {
      // 되돌리기 실패는 시도 결과를 바꾸지 않는다.
    }
    attempts.push({
      technique: name,
      visibilityStateAfter: state,
      hiddenAchieved: state === 'hidden',
      error,
    });
  };

  /** @type {import('@playwright/test').Page | null} */
  let extra = null;
  await attempt(
    'context.newPage() + bringToFront()',
    async () => {
      extra = await context.newPage();
      await extra.goto('about:blank');
      await extra.bringToFront();
    },
    async () => {
      await page.bringToFront();
      await extra?.close();
      extra = null;
    },
  );

  await attempt(
    "window.open('_blank') — 같은 창의 새 탭",
    async () => {
      const [opened] = await Promise.all([
        context.waitForEvent('page'),
        page.evaluate(() => {
          globalThis.open('about:blank', '_blank');
        }),
      ]);
      extra = opened;
    },
    async () => {
      await extra?.close();
      extra = null;
      await page.bringToFront();
    },
  );

  if (engineName === 'chromium') {
    /** @type {import('@playwright/test').CDPSession | null} */
    let cdp = null;
    await attempt(
      'CDP Emulation.setFocusEmulationEnabled(false) + bringToFront()',
      async () => {
        cdp = await context.newCDPSession(page);
        await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: false });
        extra = await context.newPage();
        await extra.goto('about:blank');
        await extra.bringToFront();
      },
      async () => {
        await extra?.close();
        extra = null;
        await cdp?.send('Emulation.setFocusEmulationEnabled', { enabled: true });
        await page.bringToFront();
      },
    );
    await attempt(
      "CDP Page.setWebLifecycleState('frozen')",
      async () => {
        cdp ??= await context.newCDPSession(page);
        await cdp.send('Page.setWebLifecycleState', { state: 'frozen' });
      },
      async () => {
        await cdp?.send('Page.setWebLifecycleState', { state: 'active' });
      },
    );
    await cdp?.detach().catch(() => undefined);
  } else {
    attempts.push({
      technique: 'CDP 기법 2종',
      visibilityStateAfter: 'n/a',
      hiddenAchieved: false,
      error: 'WebKit 은 CDP 를 쓰지 않는다.',
    });
  }

  return attempts;
}

/* ===== 측정 ⑤ · 인터럽션 ================================================= */

/** @param {import('@playwright/test').Page} page */
async function measureTrackEnded(page) {
  await start(page, { timesliceMs: 1000, source: 'synthetic' });
  await wait(4000);
  const before = await snap(page);
  const stopped = await page.evaluate(() => globalThis.__haruRecordingSpike.stopTrack());
  await wait(6000);
  const final = await stop(page);
  const after = final.chunks.filter((chunk) => chunk.seq > before.chunks.length);
  return {
    method:
      'MediaStreamTrack.stop() 으로 트랙을 끊고 6초 더 두었다. 장치 물리 탈착은 자동화로 만들 수 없으므로 그 대리 측정이다.',
    chunksBeforeCut: before.chunks.length,
    trackAfterCut: stopped,
    chunksAfterCut: after.length,
    sizesAfterCut: after.map((chunk) => chunk.size),
    recorderStateAtEnd: final.state,
    endedEventFired: final.events.some((event) => event.kind === 'track-ended'),
    muteEventFired: final.events.some((event) => event.kind === 'track-mute'),
    events: final.events,
  };
}

/* ===== 측정 ② · 크래시 복구 ============================================== */

/**
 * 탭을 **정리 없이 닫아** 크래시에 준하는 상태를 만든 뒤, 새 탭에서 저장된 청크로
 * 재생 가능한 파일을 되만들 수 있는지 본다. 같은 persistent context 를 쓰므로 OPFS·IndexedDB
 * 는 origin 에 남는다.
 * @param {import('@playwright/test').BrowserContext} context
 */
async function measureCrashRecovery(context) {
  const victim = await openSpikePage(context);
  await victim.evaluate(() => globalThis.__haruRecordingSpike.clearStore());
  await start(victim, { timesliceMs: 1000, source: 'synthetic' });
  await wait(9000);
  const beforeKill = await snap(victim);
  await victim.close({ runBeforeUnload: false });

  const reopened = await openSpikePage(context);
  const runs = await reopened.evaluate(() => globalThis.__haruRecordingSpike.listRuns());
  const recovered = await reopened.evaluate(() => globalThis.__haruRecordingSpike.recover());
  const torn = await reopened.evaluate(() =>
    globalThis.__haruRecordingSpike.recoverWithTornTail(0.4),
  );
  await reopened.close();

  return {
    method:
      'page.close({runBeforeUnload:false}) 로 녹음 중인 탭을 정리 없이 닫고, 같은 persistent context 의 새 탭에서 저장된 청크를 되읽었다. MediaRecorder.stop() 을 부르지 않았다.',
    recordingSecondsBeforeKill: 9,
    chunksSeenBeforeKill: beforeKill.chunks.length,
    bytesSeenBeforeKill: beforeKill.chunks.reduce((sum, chunk) => sum + chunk.size, 0),
    storedRuns: runs.map((run) => ({
      runId: run.runId,
      mimeType: run.mimeType,
      closed: run.closed,
      chunkCount: run.chunkCount,
    })),
    recovered,
    tornTail: torn,
  };
}

/* ===== 측정 ⑦ · 할당량 =================================================== */

/** @param {import('@playwright/test').Page} page */
async function measureQuota(page, bytesPerSecond) {
  const estimate = await page.evaluate(() => globalThis.__haruRecordingSpike.storageEstimate());
  const thirtyMinBytes = bytesPerSecond === null ? null : Math.round(bytesPerSecond * 1800);
  return {
    method:
      'navigator.storage.estimate() 를 측정 직후 호출하고, 30분 크기는 실측 bytesPerSecond × 1800 으로 환산했다.',
    estimate,
    projectedThirtyMinuteBytes: thirtyMinBytes,
    quotaRatio:
      thirtyMinBytes === null || estimate.quota === null
        ? null
        : Number((thirtyMinBytes / estimate.quota).toFixed(6)),
    note: '할당량 초과 거동은 재지 않았다 — 할당량이 GB 단위라 실제로 채우려면 수십 분과 디스크가 필요하다. 초과 시 거동은 S4-E 에서 주입 테스트로 다룬다.',
  };
}

/* ===== 마이크 경로 ======================================================= */

/** @param {import('@playwright/test').Page} page */
async function measureMicPath(page) {
  // `getUserMedia` 가 **응답하지 않는** 환경이 있다 (이 환경의 Chromium 가짜 입력 장치).
  // 거부가 아니라 무응답이므로 페이지 안에서 상한을 두어야 한다.
  const reachable = await page.evaluate(async () => {
    try {
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ audio: true }),
        new Promise((_resolve, reject) => {
          setTimeout(() => reject(new Error('getUserMedia 8000ms 무응답')), 8000);
        }),
      ]);
      for (const track of stream.getAudioTracks()) track.stop();
      return { ok: true, error: null };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      };
    }
  });
  if (!reachable.ok) {
    return {
      ok: false,
      error: reachable.error,
      note: 'getUserMedia 가 응답하지 않거나 거부되었다. 측정의 소리 원천은 페이지가 합성한 사인파다.',
    };
  }
  try {
    const begin = await start(page, { timesliceMs: 1000, source: 'mic' });
    await wait(5000);
    const final = await stop(page);
    return {
      ok: true,
      recorderMimeType: begin.recorderMimeType,
      chunks: summarizeChunks(final.chunks),
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/* ===== 엔진 1종 실행 ===================================================== */

/** @param {'chromium'|'webkit'} engineName */
async function runEngine(engineName) {
  const browserType = ENGINES[engineName];
  const profileDir = await mkdtemp(join(tmpdir(), `haru-spike-${engineName}-`));
  /**
   * Chromium 인자 3종의 **근거** (실측으로 고른 것이다 — 이 조합이 아니면 측정이 안 된다).
   *   - `--disable-audio-output` ⭐ **필수**. 이것이 없으면 이 환경의 Chromium 은 오디오 출력
   *     장치를 못 열고 **AudioContext 렌더 루프가 한 quantum(5.33ms) 만 돌고 멈춘다**.
   *     그러면 인코더에 샘플이 들어가지 않아 `dataavailable` 이 **stop 때 size 0 으로 1번만**
   *     온다. 실측: 이 인자 없음 → `audioClockAdvance=0.0053s` · 청크 `[0]` /
   *     이 인자 있음 → `1.0080s` · 청크 1024ms 간격. 널 싱크(타이머 구동)를 강제하는 인자다.
   *   - `--use-fake-device-for-media-stream` · `--use-fake-ui-for-media-stream` — 실제 마이크를
   *     **쓰지 않기 위해서**다 (사람 음성 녹음 금지). ⚠️ 이 환경에서는 가짜 **입력** 장치가
   *     장치 목록에는 뜨지만 `getUserMedia` 가 응답하지 않는다(6s 상한 초과) — 그래서 측정의
   *     소리 원천은 마이크가 아니라 페이지가 합성한 사인파다.
   *   - `--autoplay-policy=no-user-gesture-required` — AudioContext 를 클릭 없이 돌리기 위한 것.
   *     클릭도 함께 한다(`openSpikePage`).
   * WebKit 은 Chromium 인자를 받지 않으므로 빈 배열이다.
   */
  const launchArgs =
    engineName === 'chromium'
      ? [
          '--disable-audio-output',
          '--use-fake-device-for-media-stream',
          '--use-fake-ui-for-media-stream',
          '--autoplay-policy=no-user-gesture-required',
        ]
      : [];

  console.log(`\n=== ${engineName} (${browserType.name()}) ===`);
  const context = await browserType.launchPersistentContext(profileDir, {
    headless: !HEADED,
    args: launchArgs,
    permissions: engineName === 'chromium' ? ['microphone'] : [],
  });

  const result = { engine: engineName, notMeasured: [] };
  try {
    const page = await openSpikePage(context);
    result.environment = await env(page);
    result.browserVersion = context.browser()?.version() ?? null;
    console.log(`  UA: ${result.environment.userAgent}`);
    console.log(
      `  store: bytesIn=${result.environment.store.bytesIn} opfsCreateWritable=${String(result.environment.store.opfsCreateWritable)}`,
    );

    await withTimeout(
      'clearStore(초기)',
      page.evaluate(() => globalThis.__haruRecordingSpike.clearStore()),
      30_000,
    );

    if (wants('timeslice')) {
      console.log('  ① timeslice 청크 (1000 / 3000 / 5000 ms)');
      result.timeslice = [];
      for (const timesliceMs of [1000, 3000, 5000]) {
        const measured = await withTimeout(
          `timeslice ${String(timesliceMs)}`,
          measureTimeslice(page, timesliceMs, 15000),
          60_000,
        );
        console.log(
          `     ${String(timesliceMs)}ms → 청크 ${String(measured.chunks.count)}개 · 첫 청크 ${String(measured.chunks.firstChunkMs)}ms · 간격 median ${String(measured.chunks.gapMs?.median ?? 'n/a')}ms · blobType ${measured.chunks.blobTypes.join('|')} · recorder.mimeType [${measured.recorderMimeType}] · bytes/s ${String(measured.chunks.bytesPerSecond)}`,
        );
        result.timeslice.push(measured);
        await page.evaluate(() => globalThis.__haruRecordingSpike.clearStore());
      }
    }

    const bytesPerSecond = result.timeslice?.[0]?.chunks.bytesPerSecond ?? null;

    if (wants('trackEnded')) {
      console.log('  ⑤ 인터럽션 — MediaStreamTrack 종료');
      result.trackEnded = await withTimeout('trackEnded', measureTrackEnded(page), 60_000);
      console.log(
        `     끊기 전 ${String(result.trackEnded.chunksBeforeCut)}개 → 끊은 뒤 ${String(result.trackEnded.chunksAfterCut)}개 · ended 이벤트 ${String(result.trackEnded.endedEventFired)} · recorder.state ${result.trackEnded.recorderStateAtEnd}`,
      );
      await page.evaluate(() => globalThis.__haruRecordingSpike.clearStore());
    }

    if (wants('hidden')) {
      console.log(`  ⑥ 탭 비활성 중 청크 수신 (headed=${String(HEADED)})`);
      result.hidden = await withTimeout(
        'hidden',
        measureHidden(context, page, engineName),
        150_000,
      );
      console.log(
        `     숨기기 성공 ${String(result.hidden.hideAchieved)} [${result.hidden.hideAttempts.map((a) => `${a.technique}→${a.visibilityStateAfter}`).join(' / ')}] · hidden 구간 청크 ${String(result.hidden.chunksWhileHidden.count)}개 · 간격 median ${String(result.hidden.chunksWhileHidden.gapMs?.median ?? 'n/a')}ms · visibilitychange ${String(result.hidden.visibilityChangeEvents)}건 · setInterval(250) ticks ${String(result.hidden.timersHidden.intervalTicks)} / ${String(Math.round(result.hidden.timersHidden.intervalWindowMs))}ms · rAF ${String(result.hidden.timersHidden.rafTicks)} · AudioContext 클럭 +${String(result.hidden.audioClockDuringHidden.advanceSec)}s / ${String(result.hidden.audioClockDuringHidden.wallClockSec)}s`,
      );
      await page.evaluate(() => globalThis.__haruRecordingSpike.clearStore());
    }

    if (wants('quota')) {
      console.log('  ⑦ 저장 할당량');
      result.quota = await withTimeout('quota', measureQuota(page, bytesPerSecond), 30_000);
      console.log(
        `     quota ${String(result.quota.estimate.quota)}B · 30분 예상 ${String(result.quota.projectedThirtyMinuteBytes)}B · 비율 ${String(result.quota.quotaRatio)}`,
      );
    }
    await page.close();

    if (wants('crashRecovery')) {
      console.log('  ② 크래시 복구');
      result.crashRecovery = await withTimeout(
        'crashRecovery',
        measureCrashRecovery(context),
        120_000,
      );
      const rec = result.crashRecovery.recovered;
      console.log(
        `     죽기 전 본 청크 ${String(result.crashRecovery.chunksSeenBeforeKill)}개 → 되읽은 청크 ${String(rec.recoveredChunks)}개 (${rec.blobTypeUsed}) · 전체 디코드 ${String(rec.whole.decodedDurationSec ?? rec.whole.decodeError)} · 첫 청크 제외 ${String(rec.withoutFirst?.decodedDurationSec ?? rec.withoutFirst?.decodeError)} · 마지막 청크만 ${String(rec.lastOnly?.decodedDurationSec ?? rec.lastOnly?.decodeError)} · 꼬리 자름(40%) ${String(result.crashRecovery.tornTail.probe.whole.decodedDurationSec ?? result.crashRecovery.tornTail.probe.whole.decodeError)}`,
      );
    }

    // ⚠️ **마이크 경로는 맨 마지막**이다. 이 환경에서 `getUserMedia` 는 거부가 아니라
    // **무응답**이고, 그 뒤에 만든 AudioContext 가 렌더를 멈춘다(실측: 이 단계를 크래시 복구
    // 앞에 두었을 때 복구 측정의 청크가 9초 동안 0개였다). 순서가 측정 결과를 바꾼다.
    if (wants('micPath')) {
      console.log('  ④ 마이크 경로 (getUserMedia) — 맨 마지막에 돈다');
      const micPage = await openSpikePage(context);
      result.micPath = await withTimeout('micPath', measureMicPath(micPage), 60_000);
      console.log(
        `     ${result.micPath.ok ? `blobType ${result.micPath.chunks.blobTypes.join('|')} · 청크 ${String(result.micPath.chunks.count)}개` : `실패 — ${result.micPath.error}`}`,
      );
      await micPage.close();
    }

    result.headed = HEADED;
    result.notMeasured = [
      'OS 수준 백그라운드(창 최소화 · 앱 전환) — Playwright 는 OS 창 상태를 바꿀 수 없다. 탭 비활성(hidden)까지만 쟀다.',
      'iOS Safari 화면 잠금 — 실기기 수동 절차. /__dev/ui/recording-spike 화면으로 사람이 재야 한다.',
      'devicechange — 장치 물리 탈착/추가를 자동화로 만들 수 없다. 리스너 등록과 MediaStreamTrack 종료(대리)까지만 쟀다.',
      '할당량 초과 거동 — 실제로 채우지 않았다.',
      'Firefox · 실제 Safari(WebKit 빌드가 아닌 Safari.app) — 전자는 Playwright 브라우저가 설치되어 있지 않고, 후자는 Playwright 로 구동할 수 없다.',
    ];
  } finally {
    await context.close();
    await rm(profileDir, { recursive: true, force: true });
  }
  return result;
}

/* ===== main ============================================================== */

async function main() {
  const probe = await fetch(`${BASE_URL}${SPIKE_PATH}`).catch(() => null);
  if (probe === null || !probe.ok) {
    console.error(
      `[spike] dev 서버에 닿지 않는다: ${BASE_URL}${SPIKE_PATH}\n       먼저 \`pnpm --filter @haru/web run dev\` 를 띄운다.`,
    );
    process.exit(1);
  }

  const started = Date.now();
  const results = [];
  for (const engineName of ENGINE_NAMES) {
    if (!(engineName in ENGINES)) {
      console.error(`[spike] 알 수 없는 엔진: ${engineName}`);
      process.exit(1);
    }
    results.push(await runEngine(/** @type {'chromium'|'webkit'} */ (engineName)));
  }

  const payload = {
    measuredAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    elapsedMs: Date.now() - started,
    results,
  };
  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`\n[spike] 결과 JSON: ${OUT} (${String(Math.round(payload.elapsedMs / 1000))}s)`);
}

await main();
