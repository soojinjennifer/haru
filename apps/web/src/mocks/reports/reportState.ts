/**
 * 4주 리포트 **Mock 서버 상태** — Stage 7 Plan §8 "상태 저장형 · 결정적" · C7-2a (`S7-A`).
 *
 * `MockReportApi`(overview · list · detail · viewed) · `MockReportPdfApi` · `MockHighlightClipApi` 가 **한 벌**을 공유한다.
 * scenario key 는 응답을 덮어쓰는 표시 override 가 아니라 **상태 seed** 다 — 번들당 1회 넣은 뒤에는 상태 저장형이다
 * (Stage 6 `children` 선례): `viewed` 기록 · PDF 작업 · 발행 전이가 이후 응답에 그대로 남는다 (AC-7-16 · AC-7-82).
 *
 * ── 주기 상태 전이 (서버 규칙 — Mock 이 강제한다, contracts `ReportStatus`) ──
 * ```
 * in_progress → generating | deferred        (주기 마지막 날 자정 이후 평가 — N7-14)
 * deferred    → generating | deferred        (이월되어 합쳐진 주기의 다음 평가)
 * generating  → published  | delayed         (생성 성공 / 실패 재시도 소진 — P7-BIP-06)
 * delayed     → published                    (익일 재생성 성공)
 * published   → (다음 주기 in_progress 로 교체 — C7-2a ②)
 * ```
 * 허용되지 않은 전이는 `SESSION_INVALID_TRANSITION` 이 아니라 **Mock 내부 오류**다 — 리포트 전이는 클라이언트가
 * 요청하는 API 가 없고(서버 Job), 테스트 helper 만 부른다. 그래서 `Error` 를 던져 테스트를 실패시킨다.
 *
 * ── eligibility 계산 (AC-7-15 — fixture 하드코딩 금지) ──
 * `isReportEligible(progress)` 결과를 쓴다. 단 `in_progress` 주기에서 기준을 이미 채웠으면 **`cycle_in_progress`**
 * (주기 마지막 날 전에는 평가하지 않는다 — `N7-14`, `isReportEligible` 머리말 "호출부에서 결합").
 * `progressRatio` = `min(초/3600, 세션/3)` 상한 1 — **Plan `P7-BIP-08` 권고 산식의 Mock 구현**(실제 산식은 Backend).
 */
import {
  isReportEligible,
  MIN_REPORT_RECORDED_SECONDS,
  MIN_REPORT_RECORDED_SESSIONS,
  reportCyclePeriod,
  shiftCalendarDate,
  REPORT_CYCLE_DAYS,
  type ReportCycle,
  type ReportDetail,
  type ReportEligibility,
  type ReportStatus,
  type ReportSummary,
} from '@haru/contracts';

import {
  createEarlierReportDetail,
  createLatestReportDetail,
  MOCK_FIRST_CYCLE_START,
  MOCK_REPORT_IDS,
  mockReportSummary,
} from '../fixtures/reports';

import type { ReportScenarioKey } from './reportScenarios';

export interface MockReportCycleRecord {
  cycleNo: number;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  recordedSeconds: number;
  recordedSessions: number;
  /** 다음 리포트 예정일 — 생성 중·지연이면 `null`. */
  nextReportDate: string | null;
  /** 이 주기가 발행되면 쓸 리포트 id (deep link 대상). */
  pendingReportId: string;
}

export interface MockPdfJob {
  /** 몇 번째 요청 작업인가 (실패 후 재요청 = +1). */
  attempt: number;
  /** 이 작업에 대한 GET 횟수 — 진행 판정의 유일한 입력 (시간 없음). */
  reads: number;
  status: 'queued' | 'generating' | 'ready' | 'failed';
}

export interface MockReportState {
  /** 발행 리포트 — **최신 먼저**. 상세는 발행 시점 스냅샷(불변 — `P7-BIP-07`). `viewed` 만 바뀐다. */
  reports: { detail: ReportDetail }[];
  cycle: MockReportCycleRecord;
  pdfJobs: Map<string, MockPdfJob>;
  /** 적용한 seed key (번들당 1회). */
  seeded: ReportScenarioKey | null;
}

export function createMockReportState(): MockReportState {
  return {
    reports: [],
    cycle: {
      cycleNo: 1,
      periodStart: MOCK_FIRST_CYCLE_START,
      periodEnd: shiftCalendarDate(MOCK_FIRST_CYCLE_START, REPORT_CYCLE_DAYS - 1),
      status: 'in_progress',
      recordedSeconds: 0,
      recordedSessions: 0,
      nextReportDate: shiftCalendarDate(MOCK_FIRST_CYCLE_START, REPORT_CYCLE_DAYS - 1),
      pendingReportId: MOCK_REPORT_IDS.pending,
    },
    pdfJobs: new Map(),
    seeded: null,
  };
}

/** Plan `P7-BIP-08` 권고 산식 (Mock 구현) — 두 기준 중 덜 찬 쪽, 상한 1. */
export function mockProgressRatio(recordedSeconds: number, recordedSessions: number): number {
  return Math.min(
    1,
    recordedSeconds / MIN_REPORT_RECORDED_SECONDS,
    recordedSessions / MIN_REPORT_RECORDED_SESSIONS,
  );
}

export function mockCycleEligibility(cycle: MockReportCycleRecord): ReportEligibility {
  const result = isReportEligible({
    recordedSeconds: cycle.recordedSeconds,
    recordedSessions: cycle.recordedSessions,
  });
  if (cycle.status === 'in_progress' && result === 'eligible') return 'cycle_in_progress';
  return result;
}

export function toReportCycle(cycle: MockReportCycleRecord): ReportCycle {
  return {
    cycleNo: cycle.cycleNo,
    periodStart: cycle.periodStart,
    periodEnd: cycle.periodEnd,
    status: cycle.status,
    eligibility: mockCycleEligibility(cycle),
    progressRatio: mockProgressRatio(cycle.recordedSeconds, cycle.recordedSessions),
    nextReportDate: cycle.nextReportDate,
    progress: {
      recordedSeconds: cycle.recordedSeconds,
      requiredSeconds: MIN_REPORT_RECORDED_SECONDS,
      recordedSessions: cycle.recordedSessions,
      requiredSessions: MIN_REPORT_RECORDED_SESSIONS,
    },
  };
}

// ── seed ────────────────────────────────────────────────────────────────

function cycleRecord(
  cycleNo: number,
  status: ReportStatus,
  recordedSeconds: number,
  recordedSessions: number,
  options: { periodStart?: string; periodEnd?: string; nextReportDate?: string | null } = {},
): MockReportCycleRecord {
  const period = reportCyclePeriod(MOCK_FIRST_CYCLE_START, cycleNo);
  const periodStart = options.periodStart ?? period.periodStart;
  const periodEnd = options.periodEnd ?? period.periodEnd;
  const awaitingResult = status === 'generating' || status === 'delayed';
  return {
    cycleNo,
    periodStart,
    periodEnd,
    status,
    recordedSeconds,
    recordedSessions,
    nextReportDate:
      options.nextReportDate !== undefined
        ? options.nextReportDate
        : awaitingResult
          ? null
          : periodEnd,
    pendingReportId: MOCK_REPORT_IDS.pending,
  };
}

function latest(
  overrides: Partial<ReportSummary> = {},
  variant?: Parameters<typeof createLatestReportDetail>[1],
) {
  return { detail: createLatestReportDetail(mockReportSummary('latest', overrides), variant) };
}

function earlier() {
  return { detail: createEarlierReportDetail(mockReportSummary('earlier')) };
}

/**
 * scenario → 상태 seed. 표 (Plan §8 rev 2 · `API_CONTRACTS` §5.4):
 *
 * | key | 발행 리포트 | 현재 주기 |
 * |---|---|---|
 * | `success` 계열 | latest(Apr 13–May 10) + earlier | 3 `in_progress` · **3600초/3세션 → ratio 1**(`cycle_in_progress`) · next Jun 7 (Figma `110:835` 조합 — 막대 `110:852` 폭 100%, `VG7-A-05` ⓑ) |
 * | `empty` | 0 | 1 `in_progress` · 0/0 → `insufficient_both` |
 * | `report-eligible` | latest + earlier | 3 `generating` · 4200/4 → `eligible` |
 * | `report-not-eligible` | 0 | 1 `in_progress` · **3599초/3세션** → `insufficient_recorded_minutes` |
 * | `report-deferred` | earlier 1건 | 2 `deferred`(이월·합쳐짐: Apr 13 – Jun 7) · 1800/2 |
 * | `report-deferred-first` | 0 | 1 `deferred`(Mar 16 – May 10) · 900/1 |
 * | `report-delayed` | latest + earlier | 3 `delayed` · 4200/4 → `eligible` |
 * | `report-published-unviewed` | latest(`viewed=false`) + earlier | success 와 같다 |
 * | `report-persona-unchanged` | latest(페르소나 1) + earlier | success 와 같다 |
 * | `report-no-previous` | 첫 리포트 1건(`previous=null`, 주기 1) | 2 `in_progress` · 1440/2 → **ratio 0.4** — 카드 분기가 `success` 와 같은 행(발행 有 + 진행)이라 AC-7-76 "막대 = `progressRatio`, 100% 고정 아님" 판별을 여기서 한다 (`VG7-A-05` ⓑ) |
 */
export function seedReportState(state: MockReportState, scenario: ReportScenarioKey): void {
  if (state.seeded !== null) return;
  state.seeded = scenario;

  // VG7-A-05 ⓑ — Figma `110:852` fill 이 track 을 꽉 채운다(w-full). 0.4 ≠ 1 판별은 `report-no-previous` 가 맡는다.
  const nextCycleInProgress = cycleRecord(3, 'in_progress', 3600, 3);

  switch (scenario) {
    case 'empty':
      state.reports = [];
      state.cycle = cycleRecord(1, 'in_progress', 0, 0);
      return;
    case 'report-eligible':
      state.reports = [latest(), earlier()];
      state.cycle = cycleRecord(3, 'generating', 4200, 4);
      return;
    case 'report-not-eligible':
      state.reports = [];
      state.cycle = cycleRecord(1, 'in_progress', 3599, 3);
      return;
    case 'report-deferred': {
      const merged = reportCyclePeriod(MOCK_FIRST_CYCLE_START, 3);
      state.reports = [earlier()];
      state.cycle = cycleRecord(2, 'deferred', 1800, 2, { periodEnd: merged.periodEnd });
      return;
    }
    case 'report-deferred-first': {
      const merged = reportCyclePeriod(MOCK_FIRST_CYCLE_START, 2);
      state.reports = [];
      state.cycle = cycleRecord(1, 'deferred', 900, 1, { periodEnd: merged.periodEnd });
      return;
    }
    case 'report-delayed':
      state.reports = [latest(), earlier()];
      state.cycle = cycleRecord(3, 'delayed', 4200, 4);
      return;
    case 'report-published-unviewed':
      state.reports = [latest({ viewed: false }), earlier()];
      state.cycle = nextCycleInProgress;
      return;
    case 'report-persona-unchanged':
      state.reports = [latest({}, 'persona-unchanged'), earlier()];
      state.cycle = nextCycleInProgress;
      return;
    case 'report-no-previous':
      state.reports = [latest({ cycleNo: 1 }, 'first-report')];
      state.cycle = cycleRecord(2, 'in_progress', 1440, 2, {
        periodStart: shiftCalendarDate(mockReportSummary('latest').periodEnd, 1),
        periodEnd: shiftCalendarDate(mockReportSummary('latest').periodEnd, REPORT_CYCLE_DAYS),
      });
      return;
    default:
      // success · loading · error · retry · offline
      state.reports = [latest(), earlier()];
      state.cycle = nextCycleInProgress;
  }
}

/**
 * 서버의 리포트 · 주기 진행을 지운다 — 전체 데이터 삭제 · 탈퇴 **완료** 시 (Stage 8 `P8-BIP-02` · `P8-BIP-03` 의 Mock,
 * handoff `H8-1-N5`). 발행 리포트 0 · PDF 작업 0 · 주기 = 첫 주기 `in_progress` 0/0 (`empty` seed 와 같은 상태).
 * seed 플래그를 채워 둔다 — 지운 뒤 scenario seed 가 다시 들어오지 않는다 (`wipeSessionState` 와 같은 규칙).
 */
export function wipeReportState(state: MockReportState): void {
  const initial = createMockReportState();
  state.reports = initial.reports;
  state.cycle = initial.cycle;
  state.pdfJobs.clear();
  state.seeded = 'empty';
}

// ── 전이 (서버 Job 흉내 — 테스트 helper) ─────────────────────────────────

const CYCLE_TRANSITIONS: Readonly<Record<ReportStatus, readonly ReportStatus[]>> = {
  in_progress: ['generating', 'deferred'],
  deferred: ['generating', 'deferred'],
  generating: ['published', 'delayed'],
  delayed: ['published'],
  published: [],
};

export function canTransitionReportCycle(from: ReportStatus, to: ReportStatus): boolean {
  return CYCLE_TRANSITIONS[from].includes(to);
}

/** 주기 상태를 옮긴다 (`published` 제외 — `publishCurrentCycle` 을 쓴다). 허용되지 않으면 throw. */
export function transitionReportCycle(
  state: MockReportState,
  to: Exclude<ReportStatus, 'published'>,
): void {
  const from = state.cycle.status;
  if (!canTransitionReportCycle(from, to)) {
    throw new Error(`Mock report cycle cannot move from ${from} to ${to}.`);
  }
  const awaitingResult = to === 'generating' || to === 'delayed';
  state.cycle = {
    ...state.cycle,
    status: to,
    nextReportDate: awaitingResult ? null : state.cycle.periodEnd,
  };
}

/**
 * `generating | delayed → published` (C7-2a ②, AC-7-82): 새 리포트를 목록 **맨 앞**에 넣고
 * `currentCycle` 을 **다음 주기 `in_progress`**(진행 0)로 교체한다. `reportCount` 는 목록 길이라 +1 된다.
 *
 * 새 리포트 상세 = latest fixture 내용 + 이 주기의 요약 값. `nextPendingId` = 다음 주기의 (발행 전) 리포트 id.
 */
export function publishCurrentCycle(
  state: MockReportState,
  options: { publishedAt: string; nextPendingId: string; summaryLine?: string },
): ReportSummary {
  const { cycle } = state;
  if (!canTransitionReportCycle(cycle.status, 'published')) {
    throw new Error(`Mock report cycle cannot move from ${cycle.status} to published.`);
  }

  const summary: ReportSummary = {
    id: cycle.pendingReportId,
    cycleNo: cycle.cycleNo,
    periodStart: cycle.periodStart,
    periodEnd: cycle.periodEnd,
    publishedAt: options.publishedAt,
    summaryLine: options.summaryLine ?? mockReportSummary('latest').summaryLine,
    viewed: false,
  };
  state.reports = [{ detail: createLatestReportDetail(summary) }, ...state.reports];

  const nextStart = shiftCalendarDate(cycle.periodEnd, 1);
  const nextEnd = shiftCalendarDate(nextStart, REPORT_CYCLE_DAYS - 1);
  state.cycle = {
    cycleNo: cycle.cycleNo + 1,
    periodStart: nextStart,
    periodEnd: nextEnd,
    status: 'in_progress',
    recordedSeconds: 0,
    recordedSessions: 0,
    nextReportDate: nextEnd,
    pendingReportId: options.nextPendingId,
  };
  return summary;
}

export function findReport(
  state: MockReportState,
  reportId: string,
): { detail: ReportDetail } | undefined {
  return state.reports.find((record) => record.detail.summary.id === reportId);
}
