/**
 * `MockSessionApi` — Storytime Session Mock Adapter (Stage 4 Plan §8 · `API_CONTRACTS` §3.2 · §5.4).
 *
 * **상태를 가진다** (`sessionState.ts`). 전이 허용 여부는 contracts **`canTransition()` 을 직접 호출**해
 * 판정한다 — 전이표를 Mock 안에 베껴 쓰지 않는다 (Plan §8.4-1).
 *
 * ── scenario (group `sessions`) ──
 * | key | 동작 |
 * |---|---|
 * | `success` | 상태 기반 정상 동작 (아래 "서버 규칙") |
 * | `loading` | 주입 timer 로 지연 후 성공 |
 * | `empty` | `list` 가 `items: []` (AC-4-23). 나머지 메서드는 `success` |
 * | `error` | contracts Error Envelope — 기본 `INTERNAL_ERROR`, 번들 옵션 `errorCodes` 로 지정 (AC-4-24) |
 * | `retry` | **메서드별** 1회차 실패 → 2회차부터 성공 (AC-4-25) |
 * | `offline` | `NetworkError` |
 * | `invalid-transition` | `transition` 1회차가 `SESSION_INVALID_TRANSITION`(`details.from` = **서버 상태**, `to`) — 상태는 바꾸지 않는다. 클라이언트는 `getDetail` 로 서버 상태에 재동기화한다 (AC-4-34) |
 * | `session-already-active` | `create` → `SESSION_ALREADY_ACTIVE`(`details.sessionId`). 그 세션(`MOCK_ACTIVE_SESSION_ID`, `recording`)을 `getDetail` 로 조회할 수 있다 → 복귀 경로 (AC-4-35) |
 * | `onboarding-incomplete` | 모든 메서드 → `ONBOARDING_INCOMPLETE` (AC-4-36) |
 * | `consent-missing` | `transition(to='recording')` → `CONSENT_REQUIRED` (AC-4-37 Plan 표 · CG) |
 * | `abandoned` | 서버 sweeper — `ready` 세션을 조회·전이할 때 `abandoned` 로 옮긴다 (actor `server`) |
 * | `recording-discarded` | 사용자 `Discard` 경로 재현. API 동작은 `success` 와 같다 — 폐기는 **상태 규칙**이 처리한다: `to='abandoned'` 확정 → 녹음 `uploadStatus='deleted'`, 이후 토큰 재발급·확정·전송은 `RECORDING_DELETED` (`D4-13`, §3.9) |
 *
 * 메서드 단위 override: `?scenario=sessions.transition:error` 는 **전이만** 실패시킨다 — `Discard`
 * 전이 실패 시 로컬 녹음 보존(§7.3-A ④, AC-4-113 ②)을 이 표기로 재현한다 (별도 key 를 만들지 않는다).
 *
 * ── 서버 규칙 (BACKEND 요구사항과 같다) ──
 * - 진행 중(ready/recording/paused) 세션이 있으면 `create` → `SESSION_ALREADY_ACTIVE` (같은
 *   `clientSessionKey` 의 재생성은 같은 세션을 돌려준다 — 오프라인 생성 멱등)
 * - `to='recording'` 은 누적 녹음이 30분에 닿았으면 `SESSION_MAX_DURATION_EXCEEDED`
 * - `completed` 첫 전이에서 스티커를 **1회** 지급한다 (재요청은 같은 지급 — FR-19)
 * - 녹음 확정(`complete`)이 이미 있으면 `completed` 직후 `analyzing` 으로 옮긴다 (actor `server`)
 * - `SessionDetail.completionBubble` 은 **완료 계열에서만** 값을 낸다 (`API_CONTRACTS.md` §3.2.3). 레코드는
 *   생성 시점부터 값을 들고 있지만 — 전이 응답과 같은 값을 쓰기 위해서다 — 비완료 세션에는 `null` 이다
 *
 * **`Idempotency-Key`**: `create` · `transition` 은 키를 보관·재생한다. 판정이 scenario 분기보다
 * **앞**이다 — 한 번 성공한 요청은 그 뒤 scenario 가 무엇이든 같은 응답이다 (AC-4-37).
 */
import {
  canTransition,
  CreateSessionRequestSchema,
  CreateSessionResponseSchema,
  ListSessionsRequestSchema,
  ListSessionsResponseSchema,
  MAX_RECORDED_SECONDS,
  SessionDetailSchema,
  SessionTransitionRequestSchema,
  SessionTransitionResultSchema,
  type CreateSessionRequest,
  type CreateSessionResponse,
  type ListSessionsRequestInput,
  type ListSessionsResponse,
  type SessionDetail,
  type SessionStatus,
  type SessionSummary,
  type SessionTransitionRequest,
  type SessionTransitionResult,
} from '@haru/contracts';

import { parseRequest, parseResponse, type Timer } from '../../shared/api/helpers';
import type { ApiRequestOptions } from '../../shared/api/health-api';
import type { ApiMutationOptions } from '../../shared/api/options';
import type { SessionApi } from '../../shared/api/session-api';
import { shiftedIso, type Clock } from '../../shared/lib/clock';
import type { IdFactory } from '../../shared/lib/idFactory';
import {
  createMockFailure,
  deliver,
  resolveErrorCode,
  type MockErrorCodes,
} from '../common/delivery';
import { idempotencyFingerprint, type IdempotencyLedger } from '../common/idempotency';
import { MOCK_ACTIVE_SESSION_ID } from '../fixtures/home';
import { MOCK_CHILD_ID } from '../fixtures/me';
import {
  createActiveSessionFixture,
  createReadySessionFixture,
  createSessionHistoryFixture,
  createStickerAwardFixture,
  MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
  MOCK_HISTORY_RECORDING_IDS,
  MOCK_RAW_AUDIO_RETENTION_MS,
  resolveSessionBook,
} from '../fixtures/sessions';
import type { RequestLog } from '../request-log';
import { resolveReadySessionShape } from './sessionFixtureScenarios';
import { beginScenarioCall, type ScenarioGroupDefinition, type ScenarioStore } from '../scenarios';

import {
  findActiveSession,
  markRecordingDeleted,
  type MockSessionRecord,
  type MockSessionState,
} from './sessionState';

export const SESSION_SCENARIO_KEYS = [
  'success',
  'loading',
  'empty',
  'error',
  'retry',
  'offline',
  'invalid-transition',
  'session-already-active',
  'onboarding-incomplete',
  'consent-missing',
  'abandoned',
  'recording-discarded',
] as const;

export type SessionScenarioKey = (typeof SESSION_SCENARIO_KEYS)[number];

export const sessionScenarioGroup: ScenarioGroupDefinition<SessionScenarioKey> = {
  group: 'sessions',
  keys: SESSION_SCENARIO_KEYS,
  defaultKey: 'success',
};

/** 세션 화면 진입 지연 (Catalogue §5.4 "1.5–3s"). 실제 대기는 주입 timer 가 정한다. */
export const SESSION_LOADING_DELAY_MS = 1_500;

/** `SessionDetail.completionBubble` 이 값을 갖는 상태 (§3.2.3). */
const COMPLETION_STATUSES: ReadonlySet<SessionStatus> = new Set([
  'completed',
  'analyzing',
  'analyzed',
  'failed',
]);

const CREATE_OPERATION = 'POST /v1/sessions';
const DETAIL_OPERATION = 'GET /v1/sessions/:sessionId';
const TRANSITION_OPERATION = 'POST /v1/sessions/:sessionId/transitions';
const LIST_OPERATION = 'GET /v1/children/:childId/sessions';

export interface MockSessionApiDeps {
  store: ScenarioStore;
  clock: Clock;
  idFactory: IdFactory;
  timer: Timer;
  state: MockSessionState;
  idempotency: IdempotencyLedger;
  requestLog?: RequestLog | undefined;
  errorCodes?: MockErrorCodes | undefined;
}

export function createMockSessionApi(deps: MockSessionApiDeps): SessionApi {
  const { store, clock, idFactory, timer, state, idempotency, requestLog, errorCodes } = deps;
  const failure = createMockFailure(idFactory);
  const { fail } = failure;
  const group = sessionScenarioGroup.group;

  /** 지난 세션 fixture 를 최초 1회 넣는다 (목록 `success` · 상세 조회가 같은 값을 본다). */
  function seedHistory(): void {
    if (state.seeded) return;
    state.seeded = true;

    createSessionHistoryFixture(clock).forEach((summary, index) => {
      const recordingId = MOCK_HISTORY_RECORDING_IDS[index] ?? null;
      state.sessions.set(summary.id, {
        summary,
        childId: MOCK_CHILD_ID,
        clientSessionKey: null,
        sticker: null,
        // `sticker: null` — `subtext` 가 `sticker earned` 를 말하면 응답이 스스로 모순된다 (§3.2.3).
        completionBubble: MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
        recordingId,
      });
      if (recordingId !== null) {
        state.recordings.set(recordingId, {
          recordingId,
          sessionId: summary.id,
          parts: new Map(),
          uploadStatus: 'uploaded',
          expiresAt: shiftedIso(clock, MOCK_RAW_AUDIO_RETENTION_MS),
          deletedAt: null,
        });
      }
    });
  }

  /** `session-already-active` 의 진행 중 세션 — 복귀 경로가 조회할 수 있어야 한다. */
  function seedActiveSession(): MockSessionRecord {
    const existing = state.sessions.get(MOCK_ACTIVE_SESSION_ID);
    if (existing !== undefined) return existing;

    const record: MockSessionRecord = {
      summary: createActiveSessionFixture(clock),
      childId: MOCK_CHILD_ID,
      clientSessionKey: null,
      sticker: null,
      completionBubble: MOCK_COMPLETION_BUBBLE_NO_SUBTEXT,
      recordingId: null,
    };
    state.sessions.set(MOCK_ACTIVE_SESSION_ID, record);
    return record;
  }

  function findSession(sessionId: string): MockSessionRecord {
    seedHistory();
    const record = state.sessions.get(sessionId);
    if (record === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown session.');
    return record;
  }

  /** 서버 sweeper (`abandoned`) — ready 세션을 `abandoned` 로 옮긴다. 판정은 contracts 표. */
  function sweep(record: MockSessionRecord, scenario: SessionScenarioKey): void {
    const { status, mode } = record.summary;
    if (scenario !== 'abandoned' || status !== 'ready') return;
    if (!canTransition(status, 'abandoned', 'server', mode)) return;
    record.summary = { ...record.summary, status: 'abandoned' };
  }

  function toDetail(record: MockSessionRecord, operation: string): SessionDetail {
    const recording =
      record.recordingId === null ? undefined : state.recordings.get(record.recordingId);

    return parseResponse(
      SessionDetailSchema,
      {
        ...record.summary,
        recording:
          recording === undefined
            ? null
            : {
                recordingId: recording.recordingId,
                uploadStatus: recording.uploadStatus,
                partCount: recording.parts.size,
                expiresAt: recording.expiresAt,
                deletedAt: recording.deletedAt,
              },
        sticker: record.sticker,
        completionBubble: COMPLETION_STATUSES.has(record.summary.status)
          ? record.completionBubble
          : null,
      },
      { operation, direction: 'response' },
    );
  }

  /** 전 메서드 공통 — `onboarding-incomplete` 는 세션 endpoint 전부를 막는다 (Catalogue §5.4). */
  function guardOnboarding(scenario: SessionScenarioKey): void {
    if (scenario === 'onboarding-incomplete') {
      fail('ONBOARDING_INCOMPLETE', 'Finish onboarding before starting a session.');
    }
  }

  function applyTransition(
    record: MockSessionRecord,
    body: SessionTransitionRequest,
  ): SessionTransitionResult {
    const from: SessionStatus = record.summary.status;
    const { mode } = record.summary;

    if (!canTransition(from, body.to, 'caregiver', mode)) {
      return fail('SESSION_INVALID_TRANSITION', 'That change is not allowed right now.', {
        from,
        to: body.to,
      });
    }

    if (body.to === 'recording' && record.summary.recordedSeconds >= MAX_RECORDED_SECONDS) {
      return fail('SESSION_MAX_DURATION_EXCEEDED', 'This session reached its recording limit.');
    }

    const recordedSeconds = body.recordedSeconds ?? record.summary.recordedSeconds;
    let next: SessionSummary = { ...record.summary, status: body.to, recordedSeconds };

    if (body.to === 'recording' && next.startedAt === null) {
      next = { ...next, startedAt: body.occurredAt };
    }

    let completionBubble: SessionTransitionResult['completionBubble'];
    let stickerAward: SessionTransitionResult['stickerAward'];

    if (body.to === 'completed') {
      next = {
        ...next,
        completedAt: body.occurredAt,
        completedReason: body.completedReason ?? null,
      };
      // 스티커는 세션당 1회 — 같은 세션의 재요청은 같은 지급이다 (FR-19).
      record.sticker ??= createStickerAwardFixture(idFactory.next(), next.id, clock.nowIso());
      completionBubble = record.completionBubble;
      stickerAward = record.sticker;

      // 업로드 확정이 먼저 도착했으면 서버가 곧바로 분석으로 옮긴다 (actor `server`).
      const recording =
        record.recordingId === null ? undefined : state.recordings.get(record.recordingId);
      if (
        recording?.uploadStatus === 'uploaded' &&
        canTransition('completed', 'analyzing', 'server', mode)
      ) {
        next = { ...next, status: 'analyzing' };
      }
    }

    if (body.to === 'abandoned') {
      // 사용자 `Discard` 또는 ready 10분 — 서버는 업로드된 part 를 스스로 정리한다 (`P4-BIP-21`).
      markRecordingDeleted(state, record.recordingId, clock.nowIso());
    }

    record.summary = next;

    return parseResponse(
      SessionTransitionResultSchema,
      {
        session: next,
        ...(completionBubble === undefined ? {} : { completionBubble }),
        ...(stickerAward === undefined ? {} : { stickerAward }),
      },
      { operation: TRANSITION_OPERATION, direction: 'response' },
    );
  }

  return {
    async create(
      request: { body: CreateSessionRequest },
      options: ApiMutationOptions,
    ): Promise<CreateSessionResponse> {
      const body = parseRequest(CreateSessionRequestSchema, request.body, {
        operation: CREATE_OPERATION,
      });
      requestLog?.record(CREATE_OPERATION, body);

      const fingerprint = idempotencyFingerprint(CREATE_OPERATION, {}, body);
      const replayed = idempotency.replay<CreateSessionResponse>(
        options.idempotencyKey,
        fingerprint,
      );
      if (replayed !== undefined) return replayed;

      const { scenario, attempt } = beginScenarioCall(
        store,
        sessionScenarioGroup,
        'create',
        options.signal,
      );
      guardOnboarding(scenario);

      if (scenario === 'session-already-active') {
        const active = seedActiveSession();
        return fail('SESSION_ALREADY_ACTIVE', 'A storytime is already open.', {
          sessionId: active.summary.id,
        });
      }

      const run = (): CreateSessionResponse => {
        seedHistory();

        const active = findActiveSession(state);
        if (active !== undefined) {
          // 같은 클라이언트 키 = 같은 세션 (오프라인 생성 재전송).
          if (active.clientSessionKey === body.clientSessionKey) {
            return parseResponse(
              CreateSessionResponseSchema,
              { session: active.summary },
              { operation: CREATE_OPERATION, direction: 'response' },
            );
          }
          return fail('SESSION_ALREADY_ACTIVE', 'A storytime is already open.', {
            sessionId: active.summary.id,
          });
        }

        const book = resolveSessionBook(clock, body.bookId, body.childBookId);
        if (book === undefined) return fail('RESOURCE_NOT_FOUND', 'Unknown book.');

        // 표시 데이터 모양(인사 · Prompt 개수)은 API 동작과 별개의 scenario 축이다 (`session` · `session-greeting`).
        const shape = resolveReadySessionShape(store);
        const summary = createReadySessionFixture({
          id: idFactory.next(),
          mode: body.mode,
          book: shape.book === 'requested' ? book : shape.book,
          readingContext: body.readingContext,
          readyAt: body.readyAt,
          bubble: shape.bubble,
          reminderBubble: shape.reminderBubble,
          promptCount: shape.promptCount,
        });

        state.sessions.set(summary.id, {
          summary,
          childId: body.childId,
          clientSessionKey: body.clientSessionKey,
          sticker: null,
          completionBubble: shape.completionBubble,
          recordingId: null,
        });

        const response = parseResponse(
          CreateSessionResponseSchema,
          { session: summary },
          { operation: CREATE_OPERATION, direction: 'response' },
        );
        return idempotency.remember(options.idempotencyKey, fingerprint, response);
      };

      return deliver({
        scenario,
        attempt,
        delayMs: SESSION_LOADING_DELAY_MS,
        run,
        message: 'Mock session create failed.',
        errorCode: resolveErrorCode(errorCodes, group, 'create'),
        signal: options.signal,
        timer,
        failure,
      });
    },

    async getDetail(
      request: { sessionId: string },
      options: ApiRequestOptions = {},
    ): Promise<SessionDetail> {
      requestLog?.record(DETAIL_OPERATION, { sessionId: request.sessionId });

      const { scenario, attempt } = beginScenarioCall(
        store,
        sessionScenarioGroup,
        'getDetail',
        options.signal,
      );
      guardOnboarding(scenario);
      if (scenario === 'session-already-active') seedActiveSession();

      const run = (): SessionDetail => {
        const record = findSession(request.sessionId);
        sweep(record, scenario);
        return toDetail(record, DETAIL_OPERATION);
      };

      return deliver({
        scenario,
        attempt,
        delayMs: SESSION_LOADING_DELAY_MS,
        run,
        message: 'Mock session detail failed.',
        errorCode: resolveErrorCode(errorCodes, group, 'getDetail'),
        signal: options.signal,
        timer,
        failure,
      });
    },

    async transition(
      request: { sessionId: string; body: SessionTransitionRequest },
      options: ApiMutationOptions,
    ): Promise<SessionTransitionResult> {
      const body = parseRequest(SessionTransitionRequestSchema, request.body, {
        operation: TRANSITION_OPERATION,
      });
      requestLog?.record(TRANSITION_OPERATION, { sessionId: request.sessionId, ...body });

      const fingerprint = idempotencyFingerprint(
        TRANSITION_OPERATION,
        { sessionId: request.sessionId },
        body,
      );
      const replayed = idempotency.replay<SessionTransitionResult>(
        options.idempotencyKey,
        fingerprint,
      );
      if (replayed !== undefined) return replayed;

      const { scenario, attempt } = beginScenarioCall(
        store,
        sessionScenarioGroup,
        'transition',
        options.signal,
      );
      guardOnboarding(scenario);
      if (scenario === 'session-already-active') seedActiveSession();

      if (scenario === 'consent-missing' && body.to === 'recording') {
        return fail('CONSENT_REQUIRED', 'Consent is needed before recording.');
      }

      const run = (): SessionTransitionResult => {
        const record = findSession(request.sessionId);
        sweep(record, scenario);

        if (scenario === 'invalid-transition' && attempt === 1) {
          return fail('SESSION_INVALID_TRANSITION', 'That change is not allowed right now.', {
            from: record.summary.status,
            to: body.to,
          });
        }

        const response = applyTransition(record, body);
        return idempotency.remember(options.idempotencyKey, fingerprint, response);
      };

      return deliver({
        scenario,
        attempt,
        delayMs: SESSION_LOADING_DELAY_MS,
        run,
        message: 'Mock session transition failed.',
        errorCode: resolveErrorCode(errorCodes, group, 'transition'),
        signal: options.signal,
        timer,
        failure,
      });
    },

    async list(
      request: { childId: string; query: ListSessionsRequestInput },
      options: ApiRequestOptions = {},
    ): Promise<ListSessionsResponse> {
      const query = parseRequest(ListSessionsRequestSchema, request.query, {
        operation: LIST_OPERATION,
      });
      requestLog?.record(LIST_OPERATION, query);

      const { scenario, attempt } = beginScenarioCall(
        store,
        sessionScenarioGroup,
        'list',
        options.signal,
      );
      guardOnboarding(scenario);

      const run = (): ListSessionsResponse => {
        seedHistory();
        const items =
          scenario === 'empty'
            ? []
            : [...state.sessions.values()]
                .filter((record) => record.childId === request.childId)
                .map((record) => record.summary)
                .filter((summary) => query.status === undefined || summary.status === query.status)
                // 최신 준비 시각이 먼저 — ISO 문자열 비교는 같은 형식이면 시간 순서와 같다.
                .sort((a, b) => (a.readyAt < b.readyAt ? 1 : a.readyAt > b.readyAt ? -1 : 0))
                .slice(0, query.limit);

        return parseResponse(
          ListSessionsResponseSchema,
          { items, nextCursor: null },
          { operation: LIST_OPERATION, direction: 'response' },
        );
      };

      return deliver({
        scenario,
        attempt,
        delayMs: SESSION_LOADING_DELAY_MS,
        run,
        message: 'Mock session list failed.',
        errorCode: resolveErrorCode(errorCodes, group, 'list'),
        signal: options.signal,
        timer,
        failure,
      });
    },
  };
}
