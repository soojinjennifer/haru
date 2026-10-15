/**
 * `RecordingController` 상태 머신 테스트 (Stage 4 `S4-D`, `rules/frontend.md` §10 필수).
 *
 * `RecorderAdapter` = `MockRecorderAdapter`, 시간 = 수동 시계. **React 를 쓰지 않는다** (AC-4-47).
 * AC: 43 · 44 · 45 · 46 · 48 · 49 · 62 (+ 34 클라이언트 재동기화, 68 의 컨트롤러 부분).
 */
import {
  RECORDING_PART_NO_MAX,
  SESSION_TRANSITIONS,
  canTransition,
  type SessionStatus,
  type SessionTransition,
} from '@haru/contracts';
import { describe, expect, it } from 'vitest';

import type { RecorderScenarioPlan } from '../../../../mocks/recorder/recorderScenarios';
import {
  CONSENTED,
  PLAN_SUCCESS,
  SESSION_ID,
  START_MS,
  TEST_REMINDER_SECONDS,
  VOICE_MISSING,
  apiError,
  createHarness,
  flush,
  networkError,
  statusOf,
  type Harness,
} from './controller-support';

const SECOND = 1000;

async function startRecording(harness: Harness): Promise<void> {
  const outcome = await harness.controller.start();
  expect(outcome.ok).toBe(true);
  expect(statusOf(harness)).toBe('recording');
}

/** 상태 머신을 `from` 상태로 데려간다 (각 단계는 허용 전이만 쓴다). */
async function reach(harness: Harness, from: SessionStatus): Promise<void> {
  if (from === 'ready') return;
  await startRecording(harness);
  if (from === 'paused') await harness.controller.pause();
}

/* ======================================================================== */

describe('AC-4-48 — 전이표 14행 전수 (허용 caregiver 9 + server/worker 5)', () => {
  const caregiverRows = SESSION_TRANSITIONS.filter((row) => row.actor === 'caregiver');
  const otherRows = SESSION_TRANSITIONS.filter((row) => row.actor !== 'caregiver');

  it('표가 14행이고, caregiver 9 · server/worker 5 로 나뉜다', () => {
    expect(SESSION_TRANSITIONS).toHaveLength(14);
    expect(caregiverRows).toHaveLength(9);
    expect(otherRows).toHaveLength(5);
  });

  /** caregiver 행 → 컨트롤러 명령 (mode 마다 한 번씩). */
  const commandFor = (row: SessionTransition): ((harness: Harness) => Promise<unknown>) => {
    if (row.to === 'recording') {
      return row.from === 'ready' ? (h) => h.controller.start() : (h) => h.controller.resume();
    }
    if (row.to === 'paused') return (h) => h.controller.pause();
    if (row.to === 'completed') return (h) => h.controller.submit();
    return (h) => h.controller.discard();
  };

  const cases = caregiverRows.flatMap((row) => row.modes.map((mode) => ({ row, mode })));

  it.each(cases)(
    'caregiver $row.from → $row.to ($mode) — 명령 1회 = 전이 요청 정확히 1건, 로컬 상태 = $row.to',
    async ({ row, mode }) => {
      const harness = createHarness({ mode });
      await reach(harness, row.from);
      const before = harness.port.requests.length;
      await commandFor(row)(harness);
      await flush();
      expect(statusOf(harness)).toBe(row.to);
      const sent = harness.port.requests.slice(before);
      expect(sent).toHaveLength(1);
      expect(sent[0]?.to).toBe(row.to);
      if (row.to === 'completed') expect(sent[0]?.completedReason).toBe('user_done');
    },
  );

  it.each(otherRows)(
    'server/worker $from → $to ($actor) — 클라이언트에는 그 명령이 없고 canTransition(caregiver) = false',
    (row) => {
      for (const mode of row.modes) {
        const allowedForCaregiver = SESSION_TRANSITIONS.some(
          (other) =>
            other !== row &&
            other.actor === 'caregiver' &&
            other.from === row.from &&
            other.to === row.to &&
            other.modes.includes(mode),
        );
        expect(canTransition(row.from, row.to, 'caregiver', mode)).toBe(allowedForCaregiver);
      }
    },
  );

  it('server sweeper 의 ready → abandoned 는 재동기화로 받아들인다 (요청 없이 closed)', async () => {
    const harness = createHarness();
    harness.port.server = { status: 'abandoned', recordedSeconds: 0 };
    harness.port.failNext(apiError('SESSION_INVALID_TRANSITION'));
    await harness.controller.start();
    await flush();
    expect(statusOf(harness)).toBe('abandoned');
    expect(harness.controller.getSnapshot().phase).toBe('closed');
    expect(harness.recorder.controls.isCapturing()).toBe(false);
    expect(harness.sink.discarded).toEqual([]);
  });
});

describe('AC-4-49 — 허용되지 않은 전이는 **요청 전에** 막힌다 (거부 샘플)', () => {
  const rejected: { name: string; from: SessionStatus; run: (h: Harness) => Promise<unknown> }[] = [
    { name: 'ready 에서 pause', from: 'ready', run: (h) => h.controller.pause() },
    { name: 'ready 에서 resume', from: 'ready', run: (h) => h.controller.resume() },
    { name: 'ready 에서 submit (recorded)', from: 'ready', run: (h) => h.controller.submit() },
    { name: 'recording 에서 start', from: 'recording', run: (h) => h.controller.start() },
    { name: 'recording 에서 resume', from: 'recording', run: (h) => h.controller.resume() },
    { name: 'paused 에서 pause', from: 'paused', run: (h) => h.controller.pause() },
    { name: 'paused 에서 start', from: 'paused', run: (h) => h.controller.start() },
  ];

  it.each(rejected)('$name → invalid_transition, 요청 0건, 상태 불변', async ({ from, run }) => {
    const harness = createHarness();
    await reach(harness, from);
    const before = harness.port.requests.length;
    const outcome = await run(harness);
    expect(outcome).toEqual({ ok: false, reason: 'invalid_transition' });
    expect(harness.port.requests.length).toBe(before);
    expect(statusOf(harness)).toBe(from);
  });

  it('종착(completed) 이후 모든 명령이 요청 없이 거절된다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.controller.submit();
    const before = harness.port.requests.length;
    for (const command of ['start', 'pause', 'resume', 'submit', 'discard'] as const) {
      expect(await harness.controller[command]()).toEqual({
        ok: false,
        reason: 'invalid_transition',
      });
    }
    expect(harness.port.requests.length).toBe(before);
  });

  it('대화 전용 세션은 녹음을 시작할 수 없다 (녹음기 호출 0)', async () => {
    const harness = createHarness({ mode: 'conversation_only' });
    expect(await harness.controller.start()).toEqual({ ok: false, reason: 'invalid_transition' });
    expect(harness.recorder.controls.calls).toEqual([]);
  });

  it('서버가 그래도 SESSION_INVALID_TRANSITION 이면 서버 상태로 맞춘다 (2차 방어 — AC-4-34)', async () => {
    const harness = createHarness();
    harness.port.failNext(apiError('SESSION_INVALID_TRANSITION'));
    const outcome = await harness.controller.start();
    await flush();
    expect(outcome).toEqual({ ok: true, result: null });
    expect(harness.port.fetchCount()).toBe(1);
    // 서버는 ready — 캡처를 멈추고 ready 로 돌아온다. 녹음한 조각은 지우지 않는다.
    expect(statusOf(harness)).toBe('ready');
    expect(harness.recorder.controls.isCapturing()).toBe(false);
    expect(harness.sink.discarded).toEqual([]);
    expect(harness.events.some((event) => event.type === 'resynced')).toBe(true);
    // 재시도하면 진행된다.
    await startRecording(harness);
  });
});

describe('AC-4-62 — 동의 없음 → 녹음 시작 차단 (녹음기 호출 0 · 전이 요청 0)', () => {
  it('child_voice_data 누락', async () => {
    const harness = createHarness({ consent: VOICE_MISSING });
    const outcome = await harness.controller.start();
    expect(outcome).toEqual({ ok: false, reason: 'consent_required' });
    expect(harness.recorder.controls.calls).toEqual([]);
    expect(harness.port.requests).toEqual([]);
    expect(harness.controller.getSnapshot()).toMatchObject({
      status: 'ready',
      phase: 'consent_blocked',
      missingConsents: ['child_voice_data'],
    });
  });

  it('동의 상태를 아직 모르면 막는다 (fail-closed)', async () => {
    const harness = createHarness({ consent: null });
    expect(await harness.controller.start()).toEqual({ ok: false, reason: 'consent_required' });
    expect(harness.recorder.controls.calls).toEqual([]);
    expect(harness.port.requests).toEqual([]);
  });

  it('동의가 기록되면 같은 컨트롤러로 시작된다', async () => {
    const harness = createHarness({ consent: VOICE_MISSING });
    await harness.controller.start();
    harness.setConsent(CONSENTED);
    await startRecording(harness);
    expect(harness.port.requests.map((request) => request.to)).toEqual(['recording']);
  });

  it('재개(paused → recording)도 동의를 다시 확인한다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.controller.pause();
    harness.setConsent(VOICE_MISSING);
    const calls = harness.recorder.controls.calls.length;
    expect(await harness.controller.resume()).toEqual({ ok: false, reason: 'consent_required' });
    expect(harness.recorder.controls.calls.length).toBe(calls);
    expect(harness.port.requests.map((request) => request.to)).toEqual(['recording', 'paused']);
  });

  it('서버가 CONSENT_REQUIRED 로 거절하면 캡처를 멈추고 consent_blocked 로 둔다 (로컬 보존)', async () => {
    const harness = createHarness();
    harness.port.failNext(apiError('CONSENT_REQUIRED'));
    await harness.controller.start();
    await flush();
    expect(harness.controller.getSnapshot()).toMatchObject({
      status: 'ready',
      phase: 'consent_blocked',
    });
    expect(harness.recorder.controls.isCapturing()).toBe(false);
    expect(harness.sink.discarded).toEqual([]);
  });
});

describe('마이크 권한 (PermissionService)', () => {
  const denied: RecorderScenarioPlan = {
    ...PLAN_SUCCESS,
    key: 'mic-permission-denied',
    permission: 'denied',
  };

  it('거부 → permission_denied, start·전이 요청 0건', async () => {
    const harness = createHarness({ plan: denied });
    expect(await harness.controller.start()).toEqual({ ok: false, reason: 'permission_denied' });
    expect(harness.recorder.controls.calls).toEqual(['checkPermission', 'requestPermission']);
    expect(harness.port.requests).toEqual([]);
    expect(harness.controller.getSnapshot()).toMatchObject({
      status: 'ready',
      phase: 'permission_denied',
      micPermission: 'denied',
    });
  });

  it('이미 허용이면 다시 묻지 않는다', async () => {
    const harness = createHarness();
    await harness.recorder.requestPermission();
    const before = harness.recorder.controls.calls.length;
    await startRecording(harness);
    expect(harness.recorder.controls.calls.slice(before)).toEqual(['checkPermission', 'start']);
  });

  it('녹음기가 unavailable 로 실패하면 mic_unavailable', async () => {
    const harness = createHarness();
    harness.recorder.controls.failNextStart('unavailable');
    expect(await harness.controller.start()).toEqual({ ok: false, reason: 'mic_unavailable' });
    expect(harness.controller.getSnapshot().phase).toBe('mic_unavailable');
    expect(harness.port.requests).toEqual([]);
  });
});

describe('AC-4-43 — paused 동안 recordedSeconds 가 늘지 않는다', () => {
  it('10초 녹음 → pause 60초 → 불변 → resume 5초 → 15', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.advance(10 * SECOND);
    expect(harness.controller.getSnapshot().recordedSeconds).toBe(10);
    await harness.controller.pause();
    await harness.advance(60 * SECOND);
    expect(harness.controller.getSnapshot().recordedSeconds).toBe(10);
    expect(harness.port.requests.at(-1)).toMatchObject({ to: 'paused', recordedSeconds: 10 });
    await harness.controller.resume();
    await harness.advance(5 * SECOND);
    expect(harness.controller.getSnapshot().recordedSeconds).toBe(15);
  });
});

describe('AC-4-44 · AC-4-45 — 1800초 자동 종료 + 로컬 녹음 보존', () => {
  it('누적 1800초에 completed(auto_timeout) 1건, 일시정지 시간은 세지 않는다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.advance(1000 * SECOND);
    await harness.controller.pause();
    await harness.advance(120 * SECOND);
    await harness.controller.resume();
    await harness.advance(799 * SECOND);
    expect(statusOf(harness)).toBe('recording');
    expect(harness.controller.getSnapshot().recordedSeconds).toBe(1799);
    await harness.advance(1 * SECOND);
    await flush();
    expect(statusOf(harness)).toBe('completed');
    expect(harness.controller.getSnapshot().completedReason).toBe('auto_timeout');
    const last = harness.port.requests.at(-1);
    expect(last).toMatchObject({
      to: 'completed',
      completedReason: 'auto_timeout',
      recordedSeconds: 1800,
    });
    expect(harness.port.requests.filter((request) => request.to === 'completed')).toHaveLength(1);
    expect(harness.events.filter((event) => event.type === 'auto_timeout')).toHaveLength(1);
  });

  it('자동 종료 시 그때까지의 청크 파일 수·총 바이트가 그대로 남는다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.advance(1800 * SECOND);
    await flush();
    expect(statusOf(harness)).toBe('completed');
    const snapshot = harness.controller.getSnapshot();
    // 1초 timeslice × 1800초 = 1800 청크 + 종료 조각 1
    expect(harness.sink.fileCount()).toBe(1801);
    expect(harness.sink.fileCount()).toBe(snapshot.chunkCount);
    expect(harness.sink.totalBytes()).toBe(snapshot.byteLength);
    expect(harness.sink.totalBytes()).toBe(1801 * 256);
    expect(harness.sink.discarded).toEqual([]);
    expect(harness.sink.parts.get(1)?.end).toMatchObject({ chunkCount: 1801, container: 'webm' });
    expect(harness.recorder.controls.isCapturing()).toBe(false);
  });

  it('상한에 이미 닿은 paused 세션은 재개를 거절한다 (요청 0)', async () => {
    const harness = createHarness({
      overrides: { initial: { status: 'paused', recordedSeconds: 1800 } },
    });
    expect(await harness.controller.resume()).toEqual({ ok: false, reason: 'max_duration' });
    expect(harness.port.requests).toEqual([]);
  });
});

describe('AC-4-46 — ready 10분 방치: 리마인드 정확히 1회 → 600초에 abandoned', () => {
  it('리마인드는 지정 시점에 1회, abandoned 는 600초 경계에서', async () => {
    const harness = createHarness();
    await harness.advance(TEST_REMINDER_SECONDS * SECOND - 1);
    expect(harness.controller.getSnapshot().readyReminderShown).toBe(false);
    await harness.advance(1);
    expect(harness.events.filter((event) => event.type === 'ready_reminder')).toHaveLength(1);
    expect(harness.controller.getSnapshot().readyReminderShown).toBe(true);

    await harness.advance((600 - TEST_REMINDER_SECONDS) * SECOND - 1);
    expect(statusOf(harness)).toBe('ready');
    expect(harness.port.requests).toEqual([]);
    await harness.advance(1);
    await flush();
    expect(statusOf(harness)).toBe('abandoned');
    expect(harness.port.requests).toEqual([
      { to: 'abandoned', occurredAt: new Date(START_MS + 600 * SECOND).toISOString() },
    ]);
    expect(harness.events.filter((event) => event.type === 'ready_reminder')).toHaveLength(1);
    // 이후 시간이 흘러도 추가 리마인드·요청이 없다.
    await harness.advance(3600 * SECOND);
    expect(harness.events.filter((event) => event.type === 'ready_reminder')).toHaveLength(1);
    expect(harness.port.requests).toHaveLength(1);
    expect(harness.scheduler.pendingCount()).toBe(0);
  });

  it('스냅샷 구독자가 readyReminderShown=true 를 정확히 1번 본다', async () => {
    const harness = createHarness();
    let transitions = 0;
    let previous = harness.controller.getSnapshot().readyReminderShown;
    harness.controller.subscribe(() => {
      const current = harness.controller.getSnapshot().readyReminderShown;
      if (current && !previous) transitions += 1;
      previous = current;
    });
    await harness.advance(900 * SECOND);
    expect(transitions).toBe(1);
  });

  it('타이머가 늦게 깨어도(백그라운드) 리마인드가 abandoned 보다 먼저 1회 나온다', async () => {
    const harness = createHarness();
    harness.scheduler.advance(2000 * SECOND); // 한 번에 몰아서 — microtask 없이
    await flush();
    const types = harness.events.map((event) => event.type);
    expect(types.indexOf('ready_reminder')).toBeLessThan(types.indexOf('ready_abandoned'));
    expect(types.filter((type) => type === 'ready_reminder')).toHaveLength(1);
  });

  it('녹음을 시작하면 방치 타이머가 멈춘다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.controller.pause();
    await harness.advance(1200 * SECOND);
    expect(statusOf(harness)).toBe('paused');
    expect(harness.events.some((event) => event.type === 'ready_abandoned')).toBe(false);
  });

  it('대화 전용 세션은 기본적으로 방치 타이머를 쓰지 않는다', async () => {
    const harness = createHarness({ mode: 'conversation_only' });
    await harness.advance(900 * SECOND);
    expect(statusOf(harness)).toBe('ready');
    expect(harness.port.requests).toEqual([]);
  });

  it('리마인드 시점이 방치 시점 이상이면 생성 시 거절한다', () => {
    expect(() => createHarness({ overrides: { readyReminderAfterSeconds: 600 } })).toThrow(
      RangeError,
    );
  });
});

describe('청크 · part · 컨테이너 (M-3 · D4-24)', () => {
  it('part 컨테이너는 첫 청크의 MIME 원문에서 정해진다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.advance(3 * SECOND);
    expect(harness.sink.chunks.map((chunk) => chunk.container)).toEqual(['webm', 'webm', 'webm']);
    expect(harness.sink.chunks[0]?.mimeType).toBe('audio/webm;codecs=opus');
    expect(harness.sink.parts.get(1)?.start).toEqual({
      sessionId: SESSION_ID,
      partNo: 1,
      startedAtMs: START_MS,
    });
  });

  it('사용자 pause/resume 은 같은 part 를 잇는다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.advance(2 * SECOND);
    await harness.controller.pause();
    await harness.controller.resume();
    await harness.advance(2 * SECOND);
    expect(harness.controller.getSnapshot().partNo).toBe(1);
    expect(new Set(harness.sink.chunks.map((chunk) => chunk.partNo))).toEqual(new Set([1]));
  });

  it(`part 상한(${String(RECORDING_PART_NO_MAX)})을 넘는 재개는 part_limit`, async () => {
    const harness = createHarness();
    await startRecording(harness);
    for (let part = 1; part < RECORDING_PART_NO_MAX; part += 1) {
      harness.recorder.controls.interrupt('capture_lost', true);
      await flush();
      expect(await harness.controller.resume()).toMatchObject({ ok: true });
    }
    harness.recorder.controls.interrupt('capture_lost', true);
    await flush();
    expect(await harness.controller.resume()).toEqual({ ok: false, reason: 'part_limit' });
    expect(harness.controller.getSnapshot()).toMatchObject({
      status: 'paused',
      phase: 'interrupted',
      partNo: RECORDING_PART_NO_MAX,
    });
  });
});

describe('인터럽션 (AC-4-68 의 컨트롤러 부분 · M-7)', () => {
  it('captureStopped → paused(interrupted) + 전이 1건, 청크 보존, 재개 = 새 part', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.advance(3 * SECOND);
    harness.recorder.controls.interrupt('capture_lost', true);
    await flush();
    const snapshot = harness.controller.getSnapshot();
    expect(snapshot).toMatchObject({
      status: 'paused',
      phase: 'interrupted',
      interruption: { cause: 'capture_lost', captureStopped: true },
      recordedSeconds: 3,
    });
    expect(harness.port.requests.at(-1)).toMatchObject({ to: 'paused', recordedSeconds: 3 });
    expect(harness.sink.fileCount()).toBe(4); // 3 + 종료 조각
    expect(harness.sink.parts.get(1)?.end?.chunkCount).toBe(4);

    await harness.controller.resume();
    await harness.advance(2 * SECOND);
    expect(harness.controller.getSnapshot()).toMatchObject({
      status: 'recording',
      partNo: 2,
      interruption: null,
    });
    expect(harness.sink.chunks.filter((chunk) => chunk.partNo === 2)).toHaveLength(2);
    expect(harness.sink.fileCount()).toBe(6);
  });

  it('captureStopped=false(탭 숨김 알림)는 상태를 바꾸지 않고 notice 만 낸다 (D4-26)', async () => {
    const harness = createHarness();
    await startRecording(harness);
    harness.recorder.controls.interrupt('background', false);
    await flush();
    expect(statusOf(harness)).toBe('recording');
    expect(harness.events.filter((event) => event.type === 'notice')).toHaveLength(1);
    expect(harness.port.requests).toHaveLength(1);
  });

  it('scenario 계획(recording-interrupted)대로 3원인이 part 마다 하나씩 온다', async () => {
    const plan: RecorderScenarioPlan = {
      ...PLAN_SUCCESS,
      key: 'recording-interrupted',
      interruptions: ['visibilitychange', 'devicechange', 'track-ended'],
    };
    const harness = createHarness({ plan });
    await startRecording(harness);
    const causes: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      await harness.advance(3 * SECOND);
      const snapshot = harness.controller.getSnapshot();
      expect(snapshot.phase).toBe('interrupted');
      causes.push(snapshot.interruption?.cause ?? '');
      await harness.controller.resume();
    }
    expect(causes).toEqual(['background', 'input_changed', 'capture_lost']);
    expect(harness.controller.getSnapshot().partNo).toBe(4);
    // 청크 유실 0: 각 part 3 + 종료 조각 1
    expect(harness.sink.fileCount()).toBe(12);
  });

  it('paused 중 캡처가 끊기면 전이 없이 interrupted 로 표시된다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.controller.pause();
    const before = harness.port.requests.length;
    harness.recorder.controls.interrupt('capture_lost', true);
    await flush();
    expect(harness.controller.getSnapshot()).toMatchObject({
      status: 'paused',
      phase: 'interrupted',
    });
    expect(harness.port.requests.length).toBe(before);
  });
});

describe('Submit · Discard (D4-12 · D4-13)', () => {
  it('Submit — 로컬 flush 후 completed(user_done) 1건, 로컬 보존', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.advance(5 * SECOND);
    const outcome = await harness.controller.submit();
    expect(outcome.ok).toBe(true);
    expect(harness.port.requests.at(-1)).toMatchObject({
      to: 'completed',
      completedReason: 'user_done',
      recordedSeconds: 5,
    });
    expect(harness.sink.fileCount()).toBe(6);
    expect(harness.sink.discarded).toEqual([]);
  });

  it('Discard — 서버 확정 후에만 로컬을 지운다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.advance(3 * SECOND);
    await harness.controller.discard();
    await flush();
    expect(statusOf(harness)).toBe('abandoned');
    expect(harness.port.requests.at(-1)).toEqual({
      to: 'abandoned',
      occurredAt: new Date(START_MS + 3 * SECOND).toISOString(),
    });
    expect(harness.sink.discarded).toEqual([SESSION_ID]);
    expect(harness.sink.fileCount()).toBe(0);
  });

  it('Discard 전이가 실패하면 로컬을 보존한다 (네트워크 · 서버 오류)', async () => {
    for (const error of [networkError(), apiError('INTERNAL_ERROR')]) {
      const harness = createHarness();
      await startRecording(harness);
      await harness.advance(3 * SECOND);
      harness.port.failNext(error);
      const outcome = await harness.controller.discard();
      expect(outcome).toEqual({ ok: true, result: null });
      expect(harness.sink.discarded).toEqual([]);
      expect(harness.sink.fileCount()).toBe(4);
      expect(harness.controller.getSnapshot().syncError).not.toBeNull();
    }
  });

  it('대화 전용 — ready → completed(user_done), 녹음기 호출 0', async () => {
    const harness = createHarness({ mode: 'conversation_only' });
    await harness.controller.submit();
    expect(statusOf(harness)).toBe('completed');
    expect(harness.port.requests).toEqual([
      {
        to: 'completed',
        occurredAt: new Date(START_MS).toISOString(),
        completedReason: 'user_done',
      },
    ]);
    expect(harness.recorder.controls.calls).toEqual([]);
  });
});

describe('동시성 · 정리', () => {
  it('전이 요청은 명령 순서대로 나간다', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.controller.pause();
    await harness.controller.resume();
    await harness.controller.submit();
    expect(harness.port.requests.map((request) => request.to)).toEqual([
      'recording',
      'paused',
      'recording',
      'completed',
    ]);
  });

  it('권한 확인 중 들어온 두 번째 명령은 busy', async () => {
    const harness = createHarness();
    const first = harness.controller.start();
    expect(await harness.controller.start()).toEqual({ ok: false, reason: 'busy' });
    expect((await first).ok).toBe(true);
    expect(harness.port.requests).toHaveLength(1);
  });

  it('dispose — 캡처를 멈추고 로컬에 남긴다, 전이 요청 없음, 이후 명령 disposed', async () => {
    const harness = createHarness();
    await startRecording(harness);
    await harness.advance(2 * SECOND);
    await harness.controller.dispose();
    expect(harness.recorder.controls.isCapturing()).toBe(false);
    expect(harness.sink.fileCount()).toBe(3);
    expect(harness.sink.discarded).toEqual([]);
    expect(harness.port.requests).toHaveLength(1);
    expect(await harness.controller.pause()).toEqual({ ok: false, reason: 'disposed' });
    expect(harness.scheduler.pendingCount()).toBe(0);
  });

  it('스냅샷은 바뀔 때만 새 객체다 (useSyncExternalStore 호환)', async () => {
    const harness = createHarness();
    const first = harness.controller.getSnapshot();
    expect(harness.controller.getSnapshot()).toBe(first);
    await startRecording(harness);
    expect(harness.controller.getSnapshot()).not.toBe(first);
  });
});
