/**
 * 업로드 · 보관 안내 **상태** — Stage 4b `S4-H3` (4b Spec §18.3 · §18.4 · §18.10 ④, `D4-119` CP-12~14 · `D4-120`
 * Q10~Q14). 이 파일은 React 를 쓰지 않는다 — 화면은 조립 지점(`app/providers`) → `entities/session` 구독 hook 을
 * 거쳐 이 상태를 본다.
 *
 * | 사건 | 신호 | 안내 | 어디에 남는가 |
 * |---|---|---|---|
 * | 업로드 진행 · 성공 · `RECORDING_INCOMPLETE` 자동 재시도 | 큐 `state` · `uploaded` | **없음** (CP-12 ⓐ · CP-14 ⓐ) | — |
 * | 48h 미확정 | 큐 `stalled_48h` (항목당 1회 — `stalledNoticeAtMs` 저장) | 앱 Toast `upload_stalled` | 메모리 (아래 ①) |
 * | 7일 보관 | 레코드 `retentionNoticeAtMs` | Home 배너 — **레코드에서 파생** | 레코드 (`retentionDismissedAtMs`) |
 * | 14일 삭제 | 보관 감시 `retention_expired` | 앱 Toast `retention_expired` | 메모리 (레코드는 이미 지워졌다) |
 * | 크래시 복구 | 런타임 시작 보고 `recovered` | 앱 Toast `recovered` (`D4-117`) | 메모리 |
 *
 * - **구독보다 먼저 일어난 사건도 잃지 않는다** (§18.10 ④): 센터는 런타임과 함께 만들어져 시작 전부터 듣는다.
 *   Toast 는 꺼낼 때까지 보관하고, 배너는 저장된 레코드에서 다시 계산한다.
 * - **앱 시작 Toast 는 시작 정리가 끝난 뒤에만 꺼낼 수 있다** — 그래야 14일 → 48h → 크래시 복구 순서(`D4-120` Q14)를
 *   한 번에 정한다. 그 뒤에 생긴 사건은 생기는 대로 꺼낼 수 있다.
 * - **같은 녹음에 여러 안내가 해당하면 가장 심한 것만** (§18.3 우선순위 표): 14일이 되면 그 녹음의 48h 는 버린다.
 *   7일 안내가 이미 난 녹음의 48h 는 내지 않는다(배너가 더 심하다).
 * - 여러 녹음의 같은 안내는 **한 문장 1개**로 묶는다 (`D4-117` 의 "건수와 무관한 한 문장" 과 같은 방식).
 *
 * ① 48h · 14일 · 복구 Toast 를 꺼내기 전에 앱이 닫히면 그 안내는 다시 나오지 않는다 — 신호가 녹음당 1회이기
 *   때문이다(재시작 후 재표시 0, AC-4-153 ①). 보류(`D4-120` Q13 — 녹음 중)는 같은 실행 안의 일이다.
 */
import type { Clock } from '../../../shared/lib/clock';

import type { LocalRecordingStore } from './local-recording-store';
import type { LocalRecordingRecord } from './local-records';
import {
  LOCAL_RECORDING_RETENTION_MS,
  type LocalRetentionEvent,
  type LocalRetentionMonitor,
} from './local-retention';
import type { UploadQueue, UploadQueueEvent } from './upload-queue';

/** 앱 수준 Toast 로 알릴 사건 — 꺼내는 순서 = 이 배열 순서 (`D4-120` Q14). */
export const APP_RECORDING_NOTICE_ORDER = [
  'retention_expired',
  'upload_stalled',
  'recovered',
] as const;

export type AppRecordingNotice = (typeof APP_RECORDING_NOTICE_ORDER)[number];

/** Home 7일 배너 — 표시할 녹음이 없으면 센터가 `null` 을 돌려준다. */
export interface RetentionNoticeState {
  /** 가장 이른 로컬 삭제 예정 시각 (`deleteAtMs` — 첫 part 시작 + 14일). */
  readonly deleteAtMs: number;
  /** 이 값을 계산한 시각 — 날짜 표기(연도 생략 여부)의 기준이다 (4b Spec §18.4). */
  readonly asOfMs: number;
}

export interface RecordingNoticeCenter {
  /** 지금 꺼낼 수 있는 Toast 안내 (꺼내지 않는다). 시작 정리 전이면 `null`. */
  peek(): AppRecordingNotice | null;
  /** 다음 Toast 안내를 꺼낸다 — 꺼낸 안내는 다시 나오지 않는다. */
  take(): AppRecordingNotice | null;
  /** Home 7일 배너 상태. 같은 값이면 같은 객체를 돌려준다 (구독 snapshot). */
  retention(): RetentionNoticeState | null;
  /** 배너 닫기 — **지금 7일 구간에 있는 녹음 전부**를 닫은 것으로 기록한다 (§18.3 닫기 범위). */
  dismissRetention(): Promise<void>;
  /** 위 세 값 중 하나라도 바뀌면 알린다. */
  subscribe(listener: () => void): () => void;
  /** 런타임 시작 정리가 끝났다 — 복구 수를 받고 앱 시작 Toast 를 꺼낼 수 있게 한다. */
  started(recoveredCount: number): Promise<void>;
  /** 배너를 저장소에서 다시 계산한다. */
  refresh(): Promise<void>;
  /** 로그아웃 — 보관한 안내를 전부 버린다 (AC-4-153 ④). 레코드는 런타임이 지운다. */
  reset(): Promise<void>;
  dispose(): void;
}

export interface RecordingNoticeCenterOptions {
  readonly store: LocalRecordingStore;
  readonly queue: Pick<UploadQueue, 'onEvent'>;
  readonly retention: Pick<LocalRetentionMonitor, 'onEvent'>;
  readonly clock: Clock;
}

/** 7일 배너 대상 = 안내가 났고 · 아직 로컬에 있고(= 업로드 미확정) · 닫지 않은 녹음. */
function isRetentionNoticePending(record: LocalRecordingRecord): boolean {
  return record.retentionNoticeAtMs !== null && (record.retentionDismissedAtMs ?? null) === null;
}

export function createRecordingNoticeCenter(
  options: RecordingNoticeCenterOptions,
): RecordingNoticeCenter {
  const { store, clock } = options;
  const listeners = new Set<() => void>();
  const expired = new Set<string>();
  const stalled = new Set<string>();
  let recovered = 0;
  let ready = false;
  let disposed = false;
  let banner: RetentionNoticeState | null = null;
  /** 사건 처리를 순서대로 잇는다 — 48h 판정이 저장소 조회를 기다리는 동안 다른 사건이 앞지르지 않게. */
  let chain: Promise<void> = Promise.resolve();

  const notify = (): void => {
    if (disposed) return;
    for (const listener of [...listeners]) listener();
  };

  const enqueueWork = (work: () => Promise<void>): Promise<void> => {
    chain = chain.then(work).catch(() => undefined);
    return chain;
  };

  const head = (): AppRecordingNotice | null => {
    if (!ready) return null;
    if (expired.size > 0) return 'retention_expired';
    if (stalled.size > 0) return 'upload_stalled';
    if (recovered > 0) return 'recovered';
    return null;
  };

  const computeBanner = async (): Promise<void> => {
    const pending = (await store.list()).filter(isRetentionNoticePending);
    const next =
      pending.length === 0
        ? null
        : Math.min(...pending.map((record) => record.createdAtMs + LOCAL_RECORDING_RETENTION_MS));
    if (next === null) {
      if (banner === null) return;
      banner = null;
    } else {
      if (banner?.deleteAtMs === next) return;
      banner = { deleteAtMs: next, asOfMs: clock.now() };
    }
    notify();
  };

  const onRetention = (event: LocalRetentionEvent): void => {
    if (event.type === 'retention_expired') {
      void enqueueWork(async () => {
        expired.add(event.sessionId);
        stalled.delete(event.sessionId);
        await computeBanner();
        notify();
      });
      return;
    }
    void enqueueWork(computeBanner);
  };

  const onQueue = (event: UploadQueueEvent): void => {
    if (event.type === 'stalled_48h') {
      void enqueueWork(async () => {
        const record = await store.get(event.sessionId);
        // 같은 녹음에 7일 안내가 이미 났으면 48h 는 내지 않는다 — 배너가 더 심하다 (§18.3).
        if (record === null || record.retentionNoticeAtMs !== null) return;
        stalled.add(event.sessionId);
        notify();
      });
      return;
    }
    if (
      event.type === 'uploaded' ||
      event.type === 'recording_deleted' ||
      event.type === 'nothing_to_upload'
    ) {
      void enqueueWork(async () => {
        // 이미 올라갔다(또는 올릴 것이 없다) — "아직 안 올라갔다" 는 Toast 를 늦게라도 내지 않는다.
        if (stalled.delete(event.sessionId)) notify();
        await computeBanner();
      });
    }
  };

  const offRetention = options.retention.onEvent(onRetention);
  const offQueue = options.queue.onEvent(onQueue);

  return {
    peek: head,

    take() {
      const notice = head();
      if (notice === 'retention_expired') expired.clear();
      else if (notice === 'upload_stalled') stalled.clear();
      else if (notice === 'recovered') recovered = 0;
      if (notice !== null) notify();
      return notice;
    },

    retention: () => banner,

    async dismissRetention() {
      await enqueueWork(async () => {
        const now = clock.now();
        for (const record of await store.list()) {
          if (!isRetentionNoticePending(record)) continue;
          await store.update(record.sessionId, (current) => ({
            ...current,
            retentionDismissedAtMs: now,
          }));
        }
        await computeBanner();
      });
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    async started(recoveredCount) {
      await enqueueWork(async () => {
        recovered += recoveredCount;
        ready = true;
        await computeBanner();
        notify();
      });
    },

    refresh: () => enqueueWork(computeBanner),

    async reset() {
      await enqueueWork(() => {
        expired.clear();
        stalled.clear();
        recovered = 0;
        if (banner !== null) banner = null;
        notify();
        return Promise.resolve();
      });
    },

    dispose() {
      disposed = true;
      offRetention();
      offQueue();
      listeners.clear();
    },
  };
}
