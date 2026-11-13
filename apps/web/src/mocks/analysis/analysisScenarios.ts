/**
 * `analysis` scenario 그룹 — Stage 5 Plan §8 · `docs/API_CONTRACTS.md` §5.4 · ARCHITECTURE §10.2 표시 상태 매핑.
 *
 * | key | `sessionStatus` | `outcome` | `shortFeedback` | 표시 상태 |
 * |---|---|---|---|---|
 * | `success` · `loading` · `retry` | **세션의 실제 Mock 상태** — `analyzing` 이면 조회 3번째에 worker 가 `analyzed`+`full` 로 옮긴다 | | | |
 * | `error` · `offline` | 공통 (`INTERNAL_ERROR` · `NetworkError`) | | | |
 * | `analysis-pending` | `analyzing` | null | null | pending |
 * | `analysis-completed` | `analyzed` | `full` | `{ text }` | analyzed |
 * | `analysis-failed` | `failed` | null | null | failed (worker 재시도 중) |
 * | `analysis-low-quality` | `analyzed` | `excluded_low_quality` | `{ text }` | low-quality |
 * | `analysis-not-available` | — | — | — | `ANALYSIS_NOT_AVAILABLE` |
 * | `recording-deleted` | `completed` + Detail `recording.uploadStatus='deleted'` | null | null | not-available (녹음 없음, `N5-12` ⓐ) |
 * | `analysis-pending-then-completed` | 1·2번째 조회 `analyzing` → 3번째부터 `analyzed`+`full` | | | 폴링 종료 검증 |
 * | `analysis-feedback-missing` | `analyzed` | `full` | `{ text: null }` | 텍스트 줄 미렌더 |
 *
 * ── 표시 override 와 세션 상세의 일관성 ──
 * `analysis-*` · `recording-deleted` key 는 서버 상태를 **바꾸지 않는 표시 override** 다 (전이표를 우회하는
 * 상태 변경을 만들지 않는다). 대신 같은 override 를 `GET /v1/sessions/:id` 응답에도 겹쳐 두 endpoint 가
 * 서로 모순되지 않게 한다 (`resolveAnalysisOverlay` — `MockSessionApi` 가 같은 함수를 쓴다).
 * override 는 **녹음 세션(`recorded`) + 완료 계열**에만 걸린다. `conversation_only` 는 시나리오와 무관하게
 * `ANALYSIS_NOT_AVAILABLE` 이다 (`P4-BIP-16` · `P5-BIP-13`).
 *
 * 결정적이다 — 시간·난수 없음. `analysis-pending-then-completed` 의 진행은 조회 횟수(`analysisReads`)로만 정한다.
 */
import type { AnalysisOutcome, SessionStatus, ShortFeedback } from '@haru/contracts';

import {
  MOCK_ANALYSIS_PENDING_READS,
  MOCK_SHORT_FEEDBACK,
  MOCK_SHORT_FEEDBACK_LOW_QUALITY,
  MOCK_SHORT_FEEDBACK_MISSING,
} from '../fixtures/analysis';
import type { ScenarioGroupDefinition } from '../scenarios';
import { COMPLETION_STATUSES, type MockSessionRecord } from '../sessions/sessionState';

export const ANALYSIS_SCENARIO_KEYS = [
  'success',
  'loading',
  'error',
  'retry',
  'offline',
  'analysis-pending',
  'analysis-completed',
  'analysis-failed',
  'analysis-low-quality',
  'analysis-not-available',
  'recording-deleted',
  'analysis-pending-then-completed',
  'analysis-feedback-missing',
] as const;

export type AnalysisScenarioKey = (typeof ANALYSIS_SCENARIO_KEYS)[number];

export const analysisScenarioGroup: ScenarioGroupDefinition<AnalysisScenarioKey> = {
  group: 'analysis',
  keys: ANALYSIS_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** 분석 상태 조회 지연 (Catalogue §5.4 `loading` "1.5–3s"). 실제 대기는 주입 timer 가 정한다. */
export const ANALYSIS_LOADING_DELAY_MS = 1_500;

/** 서버가 보고하는 분석 표시 값 — override 또는 실제 상태. */
export interface AnalysisView {
  readonly sessionStatus: Extract<SessionStatus, 'completed' | 'analyzing' | 'analyzed' | 'failed'>;
  readonly outcome: AnalysisOutcome | null;
  readonly shortFeedback: ShortFeedback | null;
  /** `recording-deleted` — 세션 상세의 녹음을 `deleted` 로 보여 준다. */
  readonly recordingDeleted: boolean;
}

const PENDING: AnalysisView = {
  sessionStatus: 'analyzing',
  outcome: null,
  shortFeedback: null,
  recordingDeleted: false,
};

const COMPLETED: AnalysisView = {
  sessionStatus: 'analyzed',
  outcome: 'full',
  shortFeedback: MOCK_SHORT_FEEDBACK,
  recordingDeleted: false,
};

const OVERLAYS: Partial<Record<AnalysisScenarioKey, AnalysisView>> = {
  'analysis-pending': PENDING,
  'analysis-completed': COMPLETED,
  'analysis-failed': { ...PENDING, sessionStatus: 'failed' },
  'analysis-low-quality': {
    sessionStatus: 'analyzed',
    outcome: 'excluded_low_quality',
    shortFeedback: MOCK_SHORT_FEEDBACK_LOW_QUALITY,
    recordingDeleted: false,
  },
  'recording-deleted': { ...PENDING, sessionStatus: 'completed', recordingDeleted: true },
  'analysis-feedback-missing': { ...COMPLETED, shortFeedback: MOCK_SHORT_FEEDBACK_MISSING },
};

/**
 * 이 세션에 걸리는 표시 override. `undefined` = 실제 Mock 상태를 그대로 쓴다.
 *
 * @param reads 이 세션의 분석 조회 횟수 (`analysis-pending-then-completed` 진행 판정).
 */
export function resolveAnalysisOverlay(
  scenario: AnalysisScenarioKey,
  record: MockSessionRecord,
  reads: number,
): AnalysisView | undefined {
  if (record.summary.mode !== 'recorded') return undefined;
  if (!COMPLETION_STATUSES.has(record.summary.status)) return undefined;

  if (scenario === 'analysis-pending-then-completed') {
    return reads > MOCK_ANALYSIS_PENDING_READS ? COMPLETED : PENDING;
  }
  return OVERLAYS[scenario];
}
