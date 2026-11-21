/**
 * `useReportPdf` — 리포트 PDF 상태 머신의 부수 효과 (Stage 7 Plan §5.3 · Spec §2.6, `S7-F`, FR-17 · `N7-19` · `N7-40`).
 *
 * | 일 | 어디서 |
 * |---|---|
 * | POST (`Idempotency-Key`) | **탭 핸들러** `start()` — effect 가 아니다 (StrictMode 이중 effect 로 POST 가 두 번 나가지 않게, AC-7-57) |
 * | GET 폴링 2s · 상한 60s | effect — `generating` 이고 화면이 떠 있을 때만. 이탈하면 멈추고, 다른 진입점이 뜨면 이어서 돈다 |
 * | `ready` → PDF 바이트 받기 | 상태 머신 안 (`loadReportPdfFile`) — 탭 전에 `File` 을 준비해 둔다 (`R7-04`) |
 * | 저장 · 공유 | **탭 핸들러 안에서 `await` 선행 없이** 포트를 부른다 (`N7-40` · AC-7-59). ready 도달 시 자동 저장 0 |
 *
 * 기록은 `reportKeys.pdf(reportId)` (메모리 query cache) — 카드 · 상세가 같은 기록을 본다 (`N7-24` · AC-7-61).
 * 로그 · 콘솔 출력 0 (파일명 · URL · 키 · reportId — Plan §5.6).
 */
import { REPORT_PDF_POLL_INTERVAL_MS, REPORT_PDF_POLL_TIMEOUT_MS } from '@haru/contracts';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  isReadyReportPdfStatus,
  loadReportPdfFile,
  reportKeys,
  useReportPdfRequests,
  type FetchLike,
} from '../../../entities/report';
import { isHaruApiError, isNetworkError } from '../../../shared/api/helpers';
import { createIdempotencyKey } from '../../../shared/lib/idempotency';
import { useFileSharePort } from '../../../shared/platform/file-share';
import { reportPdfCopy } from '../copy';

import {
  IDLE_REPORT_PDF_JOB,
  reportPdfReducer,
  type ReportPdfEvent,
  type ReportPdfJob,
} from './reportPdfState';

export interface UseReportPdfOptions {
  /** 기준 시각 (epoch ms) — 폴링 상한 계산. 테스트가 주입한다. */
  now: () => number;
  /** signed URL 읽기 — 기본 `fetch`. 테스트가 주입한다. */
  fetcher?: FetchLike | undefined;
}

export interface UseReportPdfResult {
  job: ReportPdfJob;
  /** 이 기기가 준비된 PDF 를 공유할 수 있는가 (`canShareFile`). `ready` 가 아니면 `false`. */
  canShare: boolean;
  /** 공유가 거절됐다 (`NotAllowedError` 등) → 저장 안내 문구. 공유 취소(`AbortError`)는 `false` 그대로. */
  shareRejected: boolean;
  /** *Download PDF* · *Try again* 탭. */
  start: () => void;
  /** *Save PDF* 탭 — 동기. */
  save: () => void;
  /** *Share* 탭 — 포트 호출은 동기(같은 tick), 결과만 비동기로 받는다. */
  share: () => void;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const id = globalThis.setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        globalThis.clearTimeout(id);
        resolve();
      },
      { once: true },
    );
  });
}

export function useReportPdf(reportId: string, options: UseReportPdfOptions): UseReportPdfResult {
  const { now, fetcher } = options;
  const queryClient = useQueryClient();
  const requests = useReportPdfRequests();
  const port = useFileSharePort();
  const queryKey = useMemo(() => reportKeys.pdf(reportId), [reportId]);

  const job =
    useQuery<ReportPdfJob>({ queryKey, queryFn: skipToken, staleTime: Infinity }).data ??
    IDLE_REPORT_PDF_JOB;

  const dispatch = useCallback(
    (event: ReportPdfEvent) => {
      queryClient.setQueryData<ReportPdfJob>(queryKey, (current) =>
        reportPdfReducer(current ?? IDLE_REPORT_PDF_JOB, event),
      );
    },
    [queryClient, queryKey],
  );

  /** `ready` 응답 → 바이트를 받아 `File` 로. 실패는 일반 실패(네트워크면 offline). */
  const prepareFile = useCallback(
    async (
      key: string,
      status: Parameters<typeof isReadyReportPdfStatus>[0],
      signal?: AbortSignal,
    ) => {
      if (!isReadyReportPdfStatus(status)) {
        dispatch({ type: 'request-failed', key, offline: false });
        return;
      }
      try {
        const file = await loadReportPdfFile(status, { signal, fetcher });
        dispatch({ type: 'file-ready', key, file });
      } catch (error) {
        if (signal?.aborted === true) return;
        dispatch({ type: 'request-failed', key, offline: isNetworkError(error) });
      }
    },
    [dispatch, fetcher],
  );

  const start = useCallback(() => {
    const current = queryClient.getQueryData<ReportPdfJob>(queryKey) ?? IDLE_REPORT_PDF_JOB;
    const next = reportPdfReducer(current, {
      type: 'start',
      now: now(),
      freshKey: createIdempotencyKey(),
    });
    if (next === current || next.phase !== 'requesting') return;
    queryClient.setQueryData<ReportPdfJob>(queryKey, next);

    const { key } = next;
    // 화면 이탈과 무관하게 끝까지 받는다 — 결과는 공유 기록에 남아 다른 진입점이 이어받는다.
    requests.request(reportId, key).then(
      (status) => {
        // 이미 준비된 작업(서버 멱등 — 같은 리포트 재요청) = 폴링 없이 바로 파일
        if (status.status === 'ready') {
          void prepareFile(key, status);
          return;
        }
        dispatch({ type: 'server-status', key, status: status.status });
      },
      (error: unknown) => {
        dispatch({
          type: 'request-failed',
          key,
          offline: isNetworkError(error),
          // 요청 자체가 삭제 진행 중 쓰기 차단으로 거절됐는가 — 조회 · 파일 받기 실패는 해당 없음 (`VG8-C-09` ②)
          blocked: isHaruApiError(error) && error.code === 'ACCOUNT_DELETION_PENDING',
        });
      },
    );
  }, [dispatch, now, prepareFile, queryClient, queryKey, reportId, requests]);

  // ── 폴링 (generating 이고 화면이 떠 있을 때만) ────────────────────────────
  const pollKey = job.phase === 'generating' ? job.key : null;
  const pollStartedAt = job.phase === 'generating' ? job.startedAt : 0;

  useEffect(() => {
    if (pollKey === null) return undefined;
    /** 대기(sleep)를 끊는 신호 — 요청에는 넘기지 않는다. */
    const lifetime = new AbortController();
    /**
     * 진행 중인 요청 1개의 신호. **끝난 요청은 abort 하지 않는다** — 응답이 이미 온 요청을 뒤늦게 취소하면 Mock 의
     * `retry` 시도 카운터가 되돌아가고(`consumeAttempt`), 실제 Http 에서도 의미 없는 취소다.
     */
    let inFlight: AbortController | null = null;
    const track = async <T>(run: (signal: AbortSignal) => Promise<T>): Promise<T> => {
      const controller = new AbortController();
      inFlight = controller;
      try {
        return await run(controller.signal);
      } finally {
        if (inFlight === controller) inFlight = null;
      }
    };

    const run = async () => {
      for (;;) {
        const remaining = pollStartedAt + REPORT_PDF_POLL_TIMEOUT_MS - now();
        if (remaining <= 0) {
          dispatch({ type: 'poll-timed-out', key: pollKey });
          return;
        }
        await sleep(Math.min(REPORT_PDF_POLL_INTERVAL_MS, remaining), lifetime.signal);
        if (lifetime.signal.aborted) return;
        if (now() - pollStartedAt >= REPORT_PDF_POLL_TIMEOUT_MS) {
          dispatch({ type: 'poll-timed-out', key: pollKey });
          return;
        }
        let status;
        try {
          status = await track((signal) => requests.getStatus(reportId, signal));
        } catch (error) {
          if (lifetime.signal.aborted) return;
          dispatch({ type: 'request-failed', key: pollKey, offline: isNetworkError(error) });
          return;
        }
        if (lifetime.signal.aborted) return;
        if (status.status === 'ready') {
          const ready = status;
          await track((signal) => prepareFile(pollKey, ready, signal));
          return;
        }
        if (status.status === 'failed') {
          dispatch({ type: 'server-status', key: pollKey, status: 'failed' });
          return;
        }
      }
    };
    void run();

    return () => {
      lifetime.abort();
      inFlight?.abort();
    };
  }, [dispatch, now, pollKey, pollStartedAt, prepareFile, reportId, requests]);

  // ── 저장 · 공유 (탭 핸들러 — await 선행 0) ───────────────────────────────
  const [rejectedFile, setRejectedFile] = useState<File | null>(null);
  const readyFile = job.phase === 'ready' ? job.file : null;
  const canShare = useMemo(
    () => (readyFile === null ? false : port.canShareFile(readyFile)),
    [port, readyFile],
  );

  const save = useCallback(() => {
    if (readyFile === null) return;
    port.saveFile(readyFile, readyFile.name);
  }, [port, readyFile]);

  const share = useCallback(() => {
    if (readyFile === null) return;
    setRejectedFile(null);
    port.shareFile(readyFile, reportPdfCopy.shareTitle).then(
      () => {
        // 'shared' · 'cancelled' — 표시 변화 0 (취소는 오류가 아니다, AC-7-59)
      },
      () => {
        // NotAllowedError 등 — 저장 안내. 오류 내용은 기록하지 않는다 (파일명 0)
        setRejectedFile(readyFile);
      },
    );
  }, [port, readyFile]);

  return {
    job,
    canShare,
    shareRejected: readyFile !== null && rejectedFile === readyFile,
    start,
    save,
    share,
  };
}
