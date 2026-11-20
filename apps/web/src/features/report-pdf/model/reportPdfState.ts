/**
 * 리포트 PDF 상태 머신 — 순수 reducer (Stage 7 Plan §5.3 · Spec §2.6 `C13-S7-4`, `S7-F`, FR-17).
 *
 * ```
 * idle ─start─▶ requesting (POST · IK) ─queued|generating─▶ generating (GET 폴링 2s · 상한 60s)
 *                                    ─ready + 파일 받음───▶ ready ─(Save | Share 는 사용자 탭만 — N7-40)
 * requesting | generating ─status failed─▶ failed(serverFailed)  ─start─▶ requesting (**새 시도 = 새 IK**)
 *                         ─그 밖 오류─────▶ failed               ─start─▶ requesting (같은 IK — 서버가 받았을 수 있다)
 *                         ─NetworkError──▶ offline              ─start─▶ requesting (같은 IK)
 *              generating ─60s 경과───────▶ timeout (폴링 중단)   ─start─▶ requesting (같은 IK)
 * ```
 *
 * - **`ready` 도달 시 자동 저장 0** — 저장 · 공유는 상태가 아니라 탭 핸들러의 행위다 (`N7-40` ⓐ · AC-7-56).
 * - 진행 중(`requesting` · `generating`) · `ready` 의 `start` 는 무시한다 → 같은 리포트 재탭 = 중복 POST 0 (AC-7-57).
 * - `Idempotency-Key` = **시도 단위 하나** (Plan §5.3 "reportId + attempt"). 서버가 `failed` 를 확정한 뒤에만 시도를
 *   올리고 새 키를 쓴다 — 네트워크 실패 · 응답 유실 뒤 재시도는 같은 키(서버가 최초 응답을 재생 — 중복 작업 0).
 * - 이 기록은 `reportKeys.pdf(reportId)` 에 담겨 **카드 · 상세가 공유**한다 (`N7-24`).
 * - 시간 · 난수 없음 — 시각(`now`)과 새 키(`freshKey`)는 이벤트로 들어온다.
 */
import type { ReportPdfStatusValue } from '@haru/contracts';

interface Attempt {
  /** 1부터. 서버 `failed` 확정 뒤 재시도에서만 오른다. */
  readonly attempt: number;
  /** 이 시도의 `Idempotency-Key`. 로그 금지. */
  readonly key: string;
}

export type ReportPdfJob =
  | { readonly phase: 'idle' }
  | (Attempt & { readonly phase: 'requesting'; readonly startedAt: number })
  | (Attempt & { readonly phase: 'generating'; readonly startedAt: number })
  | (Attempt & { readonly phase: 'ready'; readonly file: File })
  | (Attempt & { readonly phase: 'failed'; readonly serverFailed: boolean })
  | (Attempt & { readonly phase: 'timeout' })
  | (Attempt & { readonly phase: 'offline' });

export type ReportPdfPhase = ReportPdfJob['phase'];

export type ReportPdfEvent =
  /** 사용자 탭 (*Download PDF* · *Try again*). `freshKey` 는 새 시도가 필요할 때만 쓰인다. */
  | { readonly type: 'start'; readonly now: number; readonly freshKey: string }
  /** POST · GET 응답의 상태 값. `ready` 는 파일을 받기 전이라 `generating` 에 머문다. */
  | { readonly type: 'server-status'; readonly key: string; readonly status: ReportPdfStatusValue }
  /** `ready` 의 PDF 바이트를 메모리에 받았다. */
  | { readonly type: 'file-ready'; readonly key: string; readonly file: File }
  /** 요청 · 조회 · 파일 받기 실패. */
  | { readonly type: 'request-failed'; readonly key: string; readonly offline: boolean }
  /** 상한(60s) 동안 `ready` 가 아니다 — 폴링 중단. */
  | { readonly type: 'poll-timed-out'; readonly key: string };

export const IDLE_REPORT_PDF_JOB: ReportPdfJob = { phase: 'idle' };

/** 진행 중(버튼 loading · 폴링) 인가. */
export function isReportPdfBusy(
  job: ReportPdfJob,
): job is Extract<ReportPdfJob, { phase: 'requesting' | 'generating' }> {
  return job.phase === 'requesting' || job.phase === 'generating';
}

/** 늦게 도착한 응답(이전 시도 키 · 이미 끝난 단계)은 기록을 바꾸지 않는다. */
export function reportPdfReducer(job: ReportPdfJob, event: ReportPdfEvent): ReportPdfJob {
  switch (event.type) {
    case 'start': {
      if (job.phase === 'idle') {
        return { phase: 'requesting', attempt: 1, key: event.freshKey, startedAt: event.now };
      }
      if (job.phase === 'failed' && job.serverFailed) {
        return {
          phase: 'requesting',
          attempt: job.attempt + 1,
          key: event.freshKey,
          startedAt: event.now,
        };
      }
      if (job.phase === 'failed' || job.phase === 'timeout' || job.phase === 'offline') {
        return { phase: 'requesting', attempt: job.attempt, key: job.key, startedAt: event.now };
      }
      return job; // requesting · generating · ready — 재탭 무시 (AC-7-57)
    }

    case 'server-status': {
      if (!isReportPdfBusy(job) || job.key !== event.key) return job;
      const { attempt, key, startedAt } = job;
      if (event.status === 'failed') return { phase: 'failed', attempt, key, serverFailed: true };
      // queued · generating · ready(파일 받기 전) → 폴링 단계
      return { phase: 'generating', attempt, key, startedAt };
    }

    case 'file-ready':
      if (!isReportPdfBusy(job) || job.key !== event.key) return job;
      return { phase: 'ready', attempt: job.attempt, key: job.key, file: event.file };

    case 'request-failed':
      if (!isReportPdfBusy(job) || job.key !== event.key) return job;
      return event.offline
        ? { phase: 'offline', attempt: job.attempt, key: job.key }
        : { phase: 'failed', attempt: job.attempt, key: job.key, serverFailed: false };

    case 'poll-timed-out':
      if (job.phase !== 'generating' || job.key !== event.key) return job;
      return { phase: 'timeout', attempt: job.attempt, key: job.key };
  }
}
